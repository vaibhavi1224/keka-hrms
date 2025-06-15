
-- Add compliance tracking table
CREATE TABLE public.compliance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.profiles(id) NOT NULL,
  month DATE NOT NULL,
  pf_contribution NUMERIC NOT NULL DEFAULT 0,
  esi_contribution NUMERIC NOT NULL DEFAULT 0,
  tds_deducted NUMERIC NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  UNIQUE(employee_id, month)
);

-- Add salary revision tracking to salary_structures
ALTER TABLE public.salary_structures ADD COLUMN IF NOT EXISTS revision_notes TEXT;
ALTER TABLE public.salary_structures ADD COLUMN IF NOT EXISTS previous_ctc NUMERIC;
ALTER TABLE public.salary_structures ADD COLUMN IF NOT EXISTS revision_reason TEXT;

-- Create salary revision logs table for detailed audit trail
CREATE TABLE public.salary_revision_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.profiles(id) NOT NULL,
  old_ctc NUMERIC NOT NULL,
  new_ctc NUMERIC NOT NULL,
  old_basic_salary NUMERIC NOT NULL,
  new_basic_salary NUMERIC NOT NULL,
  revision_date DATE NOT NULL DEFAULT CURRENT_DATE,
  revision_reason TEXT,
  revision_notes TEXT,
  approved_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhance payrolls table with more detailed tracking
ALTER TABLE public.payrolls ADD COLUMN IF NOT EXISTS pf_employee NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.payrolls ADD COLUMN IF NOT EXISTS pf_employer NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.payrolls ADD COLUMN IF NOT EXISTS manual_bonus NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.payrolls ADD COLUMN IF NOT EXISTS manual_deductions NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.payrolls ADD COLUMN IF NOT EXISTS manual_adjustment_notes TEXT;
ALTER TABLE public.payrolls ADD COLUMN IF NOT EXISTS payslip_generated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.payrolls ADD COLUMN IF NOT EXISTS payslip_url TEXT;

-- Enable RLS on new tables
ALTER TABLE public.compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_revision_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compliance_logs
CREATE POLICY "HR can manage all compliance logs" ON public.compliance_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr')
  );

CREATE POLICY "Employees can view own compliance logs" ON public.compliance_logs
  FOR SELECT USING (employee_id = auth.uid());

-- RLS Policies for salary_revision_logs
CREATE POLICY "HR can manage all salary revision logs" ON public.salary_revision_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr')
  );

CREATE POLICY "Employees can view own salary revision logs" ON public.salary_revision_logs
  FOR SELECT USING (employee_id = auth.uid());

-- Create function to automatically log salary revisions
CREATE OR REPLACE FUNCTION public.log_salary_revision()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only log if there's an actual change in CTC or basic salary
  IF OLD.ctc != NEW.ctc OR OLD.basic_salary != NEW.basic_salary THEN
    INSERT INTO public.salary_revision_logs (
      employee_id,
      old_ctc,
      new_ctc,
      old_basic_salary,
      new_basic_salary,
      revision_reason,
      revision_notes,
      approved_by
    ) VALUES (
      NEW.employee_id,
      OLD.ctc,
      NEW.ctc,
      OLD.basic_salary,
      NEW.basic_salary,
      NEW.revision_reason,
      NEW.revision_notes,
      NEW.created_by
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for salary revision logging
CREATE TRIGGER salary_revision_trigger
  AFTER UPDATE ON public.salary_structures
  FOR EACH ROW
  EXECUTE FUNCTION public.log_salary_revision();

-- Add triggers for updated_at
CREATE TRIGGER handle_updated_at_compliance_logs
  BEFORE UPDATE ON public.compliance_logs
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create function for automated payroll calculation
CREATE OR REPLACE FUNCTION public.calculate_payroll(
  p_employee_id UUID,
  p_month INTEGER,
  p_year INTEGER,
  p_manual_bonus NUMERIC DEFAULT 0,
  p_manual_deductions NUMERIC DEFAULT 0,
  p_manual_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_salary_structure public.salary_structures%ROWTYPE;
  v_payroll_id UUID;
  v_pf_employee NUMERIC;
  v_pf_employer NUMERIC;
  v_total_earnings NUMERIC;
  v_total_deductions NUMERIC;
  v_net_pay NUMERIC;
BEGIN
  -- Get current salary structure
  SELECT * INTO v_salary_structure
  FROM public.salary_structures
  WHERE employee_id = p_employee_id 
    AND is_active = true
  ORDER BY effective_from DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active salary structure found for employee %', p_employee_id;
  END IF;
  
  -- Calculate PF (12% of basic salary)
  v_pf_employee := v_salary_structure.basic_salary * 0.12;
  v_pf_employer := v_salary_structure.basic_salary * 0.12;
  
  -- Calculate totals
  v_total_earnings := v_salary_structure.basic_salary + v_salary_structure.hra + 
                     v_salary_structure.special_allowance + v_salary_structure.transport_allowance +
                     v_salary_structure.medical_allowance + v_salary_structure.other_allowances +
                     p_manual_bonus;
                     
  v_total_deductions := v_pf_employee + p_manual_deductions;
  v_net_pay := v_total_earnings - v_total_deductions;
  
  -- Insert or update payroll record
  INSERT INTO public.payrolls (
    employee_id, month, year,
    basic_salary, hra, special_allowance, transport_allowance, medical_allowance, other_allowances,
    manual_bonus, total_earnings,
    pf, pf_employee, pf_employer, manual_deductions, total_deductions,
    net_pay, manual_adjustment_notes,
    created_by
  ) VALUES (
    p_employee_id, p_month, p_year,
    v_salary_structure.basic_salary, v_salary_structure.hra, v_salary_structure.special_allowance,
    v_salary_structure.transport_allowance, v_salary_structure.medical_allowance, v_salary_structure.other_allowances,
    p_manual_bonus, v_total_earnings,
    v_pf_employee, v_pf_employee, v_pf_employer, p_manual_deductions, v_total_deductions,
    v_net_pay, p_manual_notes,
    auth.uid()
  )
  ON CONFLICT (employee_id, month, year)
  DO UPDATE SET
    basic_salary = EXCLUDED.basic_salary,
    hra = EXCLUDED.hra,
    special_allowance = EXCLUDED.special_allowance,
    transport_allowance = EXCLUDED.transport_allowance,
    medical_allowance = EXCLUDED.medical_allowance,
    other_allowances = EXCLUDED.other_allowances,
    manual_bonus = EXCLUDED.manual_bonus,
    total_earnings = EXCLUDED.total_earnings,
    pf = EXCLUDED.pf,
    pf_employee = EXCLUDED.pf_employee,
    pf_employer = EXCLUDED.pf_employer,
    manual_deductions = EXCLUDED.manual_deductions,
    total_deductions = EXCLUDED.total_deductions,
    net_pay = EXCLUDED.net_pay,
    manual_adjustment_notes = EXCLUDED.manual_adjustment_notes,
    updated_at = now()
  RETURNING id INTO v_payroll_id;
  
  RETURN v_payroll_id;
END;
$$;
