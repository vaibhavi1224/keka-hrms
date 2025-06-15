
-- 1. View: view_attendance_summary
CREATE OR REPLACE VIEW public.view_attendance_summary AS
SELECT 
  a.user_id AS employee_id,
  CONCAT_WS(' ', p.first_name, p.last_name) AS full_name,
  a.date AS day,
  a.status,  -- present / absent / late / on leave
  a.check_in_time,
  a.check_out_time
FROM public.attendance a
JOIN public.profiles p ON a.user_id = p.id;

-- 2. View: view_payroll_summary
CREATE OR REPLACE VIEW public.view_payroll_summary AS
SELECT 
  CONCAT_WS(' ', p.first_name, p.last_name) AS full_name,
  pr.employee_id,
  pr.month AS salary_month,
  pr.total_earnings AS gross_salary,
  pr.total_deductions AS deductions,
  pr.net_pay AS net_salary
FROM public.payrolls pr
JOIN public.profiles p ON pr.employee_id = p.id;

-- 3. View: view_leave_report
CREATE OR REPLACE VIEW public.view_leave_report AS
SELECT 
  lr.user_id AS employee_id,
  CONCAT_WS(' ', p.first_name, p.last_name) AS full_name,
  lr.leave_type,
  lr.status,
  lr.start_date AS from_date,
  lr.end_date AS to_date,
  lr.reason
FROM public.leave_requests lr
JOIN public.profiles p ON lr.user_id = p.id;
