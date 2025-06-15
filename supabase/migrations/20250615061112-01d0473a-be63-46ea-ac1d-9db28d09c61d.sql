
-- Create leave_types table for dynamic leave type management
CREATE TABLE public.leave_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  max_leaves_per_year INTEGER NOT NULL DEFAULT 0,
  accrual_rate NUMERIC NOT NULL DEFAULT 0, -- leaves accrued per month
  carry_forward BOOLEAN NOT NULL DEFAULT false,
  encashable BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create leave_balances table for tracking employee leave balances
CREATE TABLE public.leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id),
  total_allocated NUMERIC NOT NULL DEFAULT 0,
  used_leaves NUMERIC NOT NULL DEFAULT 0,
  available_balance NUMERIC GENERATED ALWAYS AS (total_allocated - used_leaves) STORED,
  last_accrued_date DATE,
  accrual_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, accrual_year)
);

-- Create leave_accrual_logs table for tracking accrual history
CREATE TABLE public.leave_accrual_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id),
  accrued_amount NUMERIC NOT NULL,
  accrual_date DATE NOT NULL DEFAULT CURRENT_DATE,
  accrual_reason TEXT DEFAULT 'monthly_accrual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for leave_types
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can manage leave types" ON public.leave_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "Everyone can view active leave types" ON public.leave_types
  FOR SELECT USING (is_active = true);

-- Add RLS policies for leave_balances
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own leave balances" ON public.leave_balances
  FOR SELECT USING (
    employee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('hr', 'manager')
    )
  );

CREATE POLICY "HR can manage all leave balances" ON public.leave_balances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Add RLS policies for leave_accrual_logs
ALTER TABLE public.leave_accrual_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can view all accrual logs" ON public.leave_accrual_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER leave_types_updated_at BEFORE UPDATE ON public.leave_types FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER leave_balances_updated_at BEFORE UPDATE ON public.leave_balances FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert default leave types
INSERT INTO public.leave_types (name, description, max_leaves_per_year, accrual_rate, carry_forward, encashable) VALUES
('Annual Leave', 'Annual vacation leave', 21, 1.75, true, true),
('Sick Leave', 'Medical leave for illness', 10, 0.83, false, false),
('Emergency Leave', 'Emergency situations requiring immediate absence', 5, 0.42, false, false),
('Maternity Leave', 'Maternity leave for new mothers', 84, 0, false, false),
('Paternity Leave', 'Paternity leave for new fathers', 14, 0, false, false);

-- Create function for monthly leave accrual
CREATE OR REPLACE FUNCTION public.process_monthly_leave_accrual()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  emp_record RECORD;
  leave_type_record RECORD;
  current_balance RECORD;
  accrual_amount NUMERIC;
BEGIN
  -- Loop through all active employees
  FOR emp_record IN 
    SELECT id FROM public.profiles 
    WHERE is_active = true AND role = 'employee'
  LOOP
    -- Loop through all active leave types
    FOR leave_type_record IN 
      SELECT * FROM public.leave_types 
      WHERE is_active = true AND accrual_rate > 0
    LOOP
      -- Check if employee has a balance record for this leave type and year
      SELECT * INTO current_balance 
      FROM public.leave_balances 
      WHERE employee_id = emp_record.id 
        AND leave_type_id = leave_type_record.id 
        AND accrual_year = EXTRACT(YEAR FROM CURRENT_DATE);
      
      accrual_amount := leave_type_record.accrual_rate;
      
      IF current_balance IS NULL THEN
        -- Create new balance record
        INSERT INTO public.leave_balances (
          employee_id, 
          leave_type_id, 
          total_allocated, 
          last_accrued_date,
          accrual_year
        ) VALUES (
          emp_record.id, 
          leave_type_record.id, 
          accrual_amount, 
          CURRENT_DATE,
          EXTRACT(YEAR FROM CURRENT_DATE)
        );
      ELSE
        -- Update existing balance
        UPDATE public.leave_balances 
        SET 
          total_allocated = total_allocated + accrual_amount,
          last_accrued_date = CURRENT_DATE
        WHERE employee_id = emp_record.id 
          AND leave_type_id = leave_type_record.id 
          AND accrual_year = EXTRACT(YEAR FROM CURRENT_DATE);
      END IF;
      
      -- Log the accrual
      INSERT INTO public.leave_accrual_logs (
        employee_id, 
        leave_type_id, 
        accrued_amount, 
        accrual_date
      ) VALUES (
        emp_record.id, 
        leave_type_record.id, 
        accrual_amount, 
        CURRENT_DATE
      );
    END LOOP;
  END LOOP;
END;
$$;

-- Update leave_requests table to reference leave_types
ALTER TABLE public.leave_requests ADD COLUMN leave_type_id UUID REFERENCES public.leave_types(id);

-- Create function to update leave balances when leave is approved
CREATE OR REPLACE FUNCTION public.update_leave_balance_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If status changed to approved, deduct from balance
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.leave_balances 
    SET used_leaves = used_leaves + NEW.days_requested
    WHERE employee_id = NEW.user_id 
      AND leave_type_id = NEW.leave_type_id 
      AND accrual_year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;
  
  -- If status changed from approved to rejected/pending, add back to balance
  IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE public.leave_balances 
    SET used_leaves = used_leaves - NEW.days_requested
    WHERE employee_id = NEW.user_id 
      AND leave_type_id = NEW.leave_type_id 
      AND accrual_year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for leave balance updates
CREATE TRIGGER update_leave_balance_trigger
  AFTER UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_leave_balance_on_approval();
