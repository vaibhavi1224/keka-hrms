
import { supabase } from '@/integrations/supabase/client';
import { calculatePayroll, generateAttendanceData } from './payrollCalculator';

export async function generatePayrollRecords(employeeId: string, startDate: Date, endDate: Date) {
  // Get salary structure
  const { data: salaryStructure, error: structureError } = await supabase
    .from('salary_structures')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('is_active', true)
    .single();

  if (structureError || !salaryStructure) {
    throw new Error(`No salary structure found for employee ${employeeId}`);
  }

  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Check if payroll already exists for this month/year
    const { data: existingPayroll } = await supabase
      .from('payrolls')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (!existingPayroll) {
      // Generate realistic payroll data
      const { workingDays, presentDays, lopDays } = generateAttendanceData();
      
      const payrollCalculation = calculatePayroll(salaryStructure, workingDays, presentDays, lopDays);

      const payrollData = {
        employee_id: employeeId,
        month: month,
        year: year,
        basic_salary: payrollCalculation.basicSalary,
        hra: payrollCalculation.hra,
        special_allowance: payrollCalculation.specialAllowance,
        transport_allowance: payrollCalculation.transportAllowance,
        medical_allowance: payrollCalculation.medicalAllowance,
        other_allowances: payrollCalculation.otherAllowances,
        bonus: payrollCalculation.bonus,
        total_earnings: payrollCalculation.totalEarnings,
        tds: payrollCalculation.tds,
        pf: payrollCalculation.pf,
        esi: payrollCalculation.esi,
        lop_deduction: payrollCalculation.lopDeduction,
        other_deductions: payrollCalculation.otherDeductions,
        total_deductions: payrollCalculation.totalDeductions,
        net_pay: payrollCalculation.netPay,
        lop_days: lopDays,
        working_days: workingDays,
        present_days: presentDays,
        status: 'finalized',
        finalized_at: new Date().toISOString(),
        finalized_by: employeeId, // Using employee id as finalizer for seeding
        created_by: employeeId
      };

      const { error } = await supabase
        .from('payrolls')
        .insert(payrollData);

      if (error) {
        console.error(`Error creating payroll for ${employeeId}, ${month}/${year}:`, error);
        throw error;
      }
    }

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
}
