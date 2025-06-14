
-- Create salary structure table
CREATE TABLE public.salary_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.profiles(id) NOT NULL,
  basic_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  hra DECIMAL(12,2) NOT NULL DEFAULT 0,
  special_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  transport_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  medical_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  other_allowances DECIMAL(12,2) NOT NULL DEFAULT 0,
  ctc DECIMAL(12,2) NOT NULL DEFAULT 0,
  effective_from DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) NOT NULL
);

-- Create payroll table for monthly payslips
CREATE TABLE public.payrolls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.profiles(id) NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  
  -- Earnings
  basic_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  hra DECIMAL(12,2) NOT NULL DEFAULT 0,
  special_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  transport_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  medical_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  other_allowances DECIMAL(12,2) NOT NULL DEFAULT 0,
  bonus DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_earnings DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Deductions
  tds DECIMAL(12,2) NOT NULL DEFAULT 0,
  pf DECIMAL(12,2) NOT NULL DEFAULT 0,
  esi DECIMAL(12,2) NOT NULL DEFAULT 0,
  lop_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
  other_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Net calculation
  net_pay DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- LOP tracking
  lop_days INTEGER NOT NULL DEFAULT 0,
  working_days INTEGER NOT NULL DEFAULT 30,
  present_days INTEGER NOT NULL DEFAULT 30,
  
  -- Status and metadata
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, finalized, paid
  finalized_at TIMESTAMP WITH TIME ZONE,
  finalized_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  
  UNIQUE(employee_id, month, year)
);

-- Create employee bank details table
CREATE TABLE public.employee_bank_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.profiles(id) NOT NULL UNIQUE,
  bank_name VARCHAR(100),
  account_number VARCHAR(20),
  ifsc_code VARCHAR(15),
  pan_number VARCHAR(10),
  uan_number VARCHAR(12),
  aadhaar_number VARCHAR(12),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create salary templates table for reusable structures
CREATE TABLE public.salary_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name VARCHAR(100) NOT NULL,
  basic_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  hra DECIMAL(12,2) NOT NULL DEFAULT 0,
  special_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  transport_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  medical_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  other_allowances DECIMAL(12,2) NOT NULL DEFAULT 0,
  ctc DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for salary_structures
CREATE POLICY "HR can manage all salary structures" ON public.salary_structures
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr')
  );

CREATE POLICY "Employees can view own salary structure" ON public.salary_structures
  FOR SELECT USING (employee_id = auth.uid());

-- RLS Policies for payrolls
CREATE POLICY "HR can manage all payrolls" ON public.payrolls
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr')
  );

CREATE POLICY "Employees can view own payslips" ON public.payrolls
  FOR SELECT USING (employee_id = auth.uid() AND status = 'finalized');

-- RLS Policies for employee_bank_details
CREATE POLICY "HR can manage all bank details" ON public.employee_bank_details
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr')
  );

CREATE POLICY "Employees can view own bank details" ON public.employee_bank_details
  FOR SELECT USING (employee_id = auth.uid());

-- RLS Policies for salary_templates
CREATE POLICY "HR can manage salary templates" ON public.salary_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr')
  );

-- Add triggers for updated_at
CREATE TRIGGER handle_updated_at_salary_structures
  BEFORE UPDATE ON public.salary_structures
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_payrolls
  BEFORE UPDATE ON public.payrolls
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_employee_bank_details
  BEFORE UPDATE ON public.employee_bank_details
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
