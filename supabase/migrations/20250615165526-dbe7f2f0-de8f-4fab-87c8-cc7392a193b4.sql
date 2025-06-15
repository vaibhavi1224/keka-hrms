
-- Drop and recreate view_leave_report without SECURITY DEFINER
DROP VIEW IF EXISTS public.view_leave_report;
CREATE VIEW public.view_leave_report AS
SELECT 
  lr.user_id as employee_id,
  p.first_name || ' ' || p.last_name as full_name,
  lr.leave_type,
  lr.status,
  lr.start_date as from_date,
  lr.end_date as to_date,
  lr.reason
FROM public.leave_requests lr
JOIN public.profiles p ON lr.user_id = p.id;

-- Drop and recreate view_payroll_summary without SECURITY DEFINER
DROP VIEW IF EXISTS public.view_payroll_summary;
CREATE VIEW public.view_payroll_summary AS
SELECT 
  pr.employee_id,
  p.first_name || ' ' || p.last_name as full_name,
  pr.month as salary_month,
  pr.total_earnings as gross_salary,
  pr.total_deductions as deductions,
  pr.net_pay as net_salary
FROM public.payrolls pr
JOIN public.profiles p ON pr.employee_id = p.id
WHERE pr.status = 'finalized';

-- Drop and recreate view_attendance_summary without SECURITY DEFINER
DROP VIEW IF EXISTS public.view_attendance_summary;
CREATE VIEW public.view_attendance_summary AS
SELECT 
  a.user_id as employee_id,
  p.first_name || ' ' || p.last_name as full_name,
  a.date as day,
  a.status,
  a.check_in_time,
  a.check_out_time
FROM public.attendance a
JOIN public.profiles p ON a.user_id = p.id;
