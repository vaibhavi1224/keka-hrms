
-- Check and enable RLS on tables that might not have it enabled yet
DO $$
BEGIN
    -- Enable RLS on salary_templates if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'salary_templates' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.salary_templates ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policies only if they don't exist
DO $$
BEGIN
    -- Salary templates policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'salary_templates' 
        AND policyname = 'HR can manage salary templates'
    ) THEN
        CREATE POLICY "HR can manage salary templates" ON public.salary_templates
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE id = auth.uid() AND role = 'hr'
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'salary_templates' 
        AND policyname = 'Employees can view salary templates'
    ) THEN
        CREATE POLICY "Employees can view salary templates" ON public.salary_templates
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE id = auth.uid() AND role = 'employee'
            )
          );
    END IF;

    -- Attendance policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'attendance' 
        AND policyname = 'Users can manage own attendance'
    ) THEN
        CREATE POLICY "Users can manage own attendance" ON public.attendance
          FOR ALL USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'attendance' 
        AND policyname = 'HR can view all attendance'
    ) THEN
        CREATE POLICY "HR can view all attendance" ON public.attendance
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE id = auth.uid() AND role = 'hr'
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'attendance' 
        AND policyname = 'Managers can view team attendance'
    ) THEN
        CREATE POLICY "Managers can view team attendance" ON public.attendance
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.profiles p1
              JOIN public.profiles p2 ON p2.manager_id = p1.id
              WHERE p1.id = auth.uid() AND p1.role = 'manager' AND p2.id = attendance.user_id
            )
          );
    END IF;

    -- Leave requests policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'leave_requests' 
        AND policyname = 'Users can manage own leave requests'
    ) THEN
        CREATE POLICY "Users can manage own leave requests" ON public.leave_requests
          FOR ALL USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'leave_requests' 
        AND policyname = 'HR can manage all leave requests'
    ) THEN
        CREATE POLICY "HR can manage all leave requests" ON public.leave_requests
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE id = auth.uid() AND role = 'hr'
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'leave_requests' 
        AND policyname = 'Managers can manage team leave requests'
    ) THEN
        CREATE POLICY "Managers can manage team leave requests" ON public.leave_requests
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.profiles p1
              JOIN public.profiles p2 ON p2.manager_id = p1.id
              WHERE p1.id = auth.uid() AND p1.role = 'manager' AND p2.id = leave_requests.user_id
            )
          );
    END IF;

    -- Payroll policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payrolls' 
        AND policyname = 'Users can view own payroll'
    ) THEN
        CREATE POLICY "Users can view own payroll" ON public.payrolls
          FOR SELECT USING (employee_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payrolls' 
        AND policyname = 'HR can manage all payroll'
    ) THEN
        CREATE POLICY "HR can manage all payroll" ON public.payrolls
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE id = auth.uid() AND role = 'hr'
            )
          );
    END IF;
END $$;

-- Enable RLS on remaining tables
ALTER TABLE public.biometric_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals_okrs ENABLE ROW LEVEL SECURITY;

-- Create remaining policies that are likely missing
CREATE POLICY "Users can manage own biometric credentials" ON public.biometric_credentials
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own performance metrics" ON public.performance_metrics
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "HR can manage all performance metrics" ON public.performance_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "Managers can manage team performance metrics" ON public.performance_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.profiles p2 ON p2.manager_id = p1.id
      WHERE p1.id = auth.uid() AND p1.role = 'manager' AND p2.id = performance_metrics.employee_id
    )
  );

CREATE POLICY "Users can view own performance feedback" ON public.performance_feedback
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "HR can manage all performance feedback" ON public.performance_feedback
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "Users can manage own created feedback" ON public.performance_feedback
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can view own goals" ON public.goals_okrs
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "HR can manage all goals" ON public.goals_okrs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "Users can manage own created goals" ON public.goals_okrs
  FOR ALL USING (created_by = auth.uid());
