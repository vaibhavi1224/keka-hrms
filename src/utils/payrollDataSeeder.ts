
import { supabase } from '@/integrations/supabase/client';
import { addDummyBankDetailsForAllEmployees } from './employee/dummyBankDetailsGenerator';

interface SeedResult {
  success: number;
  errors: number;
}

export async function seedPayrollData(): Promise<SeedResult> {
  console.log('Starting to seed payroll data...');
  
  // First, ensure all employees have bank details
  await addDummyBankDetailsForAllEmployees();
  
  // Get all active employees
  const { data: employees, error: employeesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, role, department')
    .eq('is_active', true)
    .neq('role', 'hr');

  if (employeesError) {
    console.error('Error fetching employees:', employeesError);
    throw employeesError;
  }

  if (!employees || employees.length === 0) {
    console.log('No employees found to seed data for');
    return { success: 0, errors: 0 };
  }

  let successCount = 0;
  let errorCount = 0;

  // Generate data for the last 6 months
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  for (const employee of employees) {
    try {
      console.log(`Generating payroll data for ${employee.first_name} ${employee.last_name}...`);
      
      // Create salary structure if it doesn't exist
      await createSalaryStructure(employee.id);
      
      // Generate 6 months of payroll records
      await generatePayrollRecords(employee.id, startDate, endDate);
      
      successCount++;
      console.log(`✅ Successfully generated payroll data for ${employee.first_name} ${employee.last_name}`);
      
    } catch (error) {
      console.error(`Error generating payroll data for ${employee.email}:`, error);
      errorCount++;
    }
  }

  console.log(`Payroll data seeding completed: ${successCount} successful, ${errorCount} errors`);
  return { success: successCount, errors: errorCount };
}

async function createSalaryStructure(employeeId: string) {
  // Check if salary structure already exists
  const { data: existingStructure } = await supabase
    .from('salary_structures')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('is_active', true)
    .single();

  if (existingStructure) {
    return; // Already has a salary structure
  }

  // Generate realistic salary structure based on role/department
  const baseSalary = generateBaseSalary();
  const hra = Math.round(baseSalary * 0.4); // 40% of basic
  const specialAllowance = Math.round(baseSalary * 0.3); // 30% of basic
  const transportAllowance = 3000;
  const medicalAllowance = 2000;
  const otherAllowances = 1000;
  const ctc = baseSalary + hra + specialAllowance + transportAllowance + medicalAllowance + otherAllowances;

  const { error } = await supabase
    .from('salary_structures')
    .insert({
      employee_id: employeeId,
      basic_salary: baseSalary,
      hra: hra,
      special_allowance: specialAllowance,
      transport_allowance: transportAllowance,
      medical_allowance: medicalAllowance,
      other_allowances: otherAllowances,
      ctc: ctc,
      effective_from: new Date().toISOString().split('T')[0],
      created_by: employeeId // Using employee id as creator for seeding
    });

  if (error) {
    throw error;
  }
}

async function generatePayrollRecords(employeeId: string, startDate: Date, endDate: Date) {
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
      const workingDays = 22 + Math.floor(Math.random() * 6); // 22-27 working days
      const presentDays = workingDays - Math.floor(Math.random() * 3); // 0-2 absent days
      const lopDays = workingDays - presentDays;
      
      // Calculate prorated salary based on attendance
      const attendanceRatio = presentDays / workingDays;
      const basicSalary = Math.round(salaryStructure.basic_salary * attendanceRatio);
      const hra = Math.round(salaryStructure.hra * attendanceRatio);
      const specialAllowance = Math.round(salaryStructure.special_allowance * attendanceRatio);
      const transportAllowance = presentDays > 15 ? salaryStructure.transport_allowance : Math.round(salaryStructure.transport_allowance * attendanceRatio);
      const medicalAllowance = salaryStructure.medical_allowance;
      const otherAllowances = salaryStructure.other_allowances;
      
      // Random bonus (0-5000)
      const bonus = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0;
      
      const totalEarnings = basicSalary + hra + specialAllowance + transportAllowance + medicalAllowance + otherAllowances + bonus;
      
      // Calculate deductions
      const pf = Math.round(basicSalary * 0.12); // 12% of basic salary
      const tds = totalEarnings > 50000 ? Math.round(totalEarnings * 0.1) : 0; // 10% TDS if earnings > 50k
      const esi = totalEarnings < 25000 ? Math.round(totalEarnings * 0.0075) : 0; // 0.75% ESI if earnings < 25k
      const lopDeduction = Math.round((salaryStructure.basic_salary / workingDays) * lopDays);
      const otherDeductions = Math.random() > 0.8 ? Math.floor(Math.random() * 1000) : 0; // Random other deductions
      
      const totalDeductions = pf + tds + esi + lopDeduction + otherDeductions;
      const netPay = totalEarnings - totalDeductions;

      const payrollData = {
        employee_id: employeeId,
        month: month,
        year: year,
        basic_salary: basicSalary,
        hra: hra,
        special_allowance: specialAllowance,
        transport_allowance: transportAllowance,
        medical_allowance: medicalAllowance,
        other_allowances: otherAllowances,
        bonus: bonus,
        total_earnings: totalEarnings,
        tds: tds,
        pf: pf,
        esi: esi,
        lop_deduction: lopDeduction,
        other_deductions: otherDeductions,
        total_deductions: totalDeductions,
        net_pay: netPay,
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

function generateBaseSalary(): number {
  // Generate realistic base salaries between 25k to 80k
  const salaryRanges = [
    { min: 25000, max: 35000, weight: 0.3 }, // Junior roles
    { min: 35000, max: 50000, weight: 0.4 }, // Mid-level roles
    { min: 50000, max: 65000, weight: 0.2 }, // Senior roles
    { min: 65000, max: 80000, weight: 0.1 }  // Lead roles
  ];

  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (const range of salaryRanges) {
    cumulativeWeight += range.weight;
    if (random <= cumulativeWeight) {
      return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }
  }
  
  return 40000; // Fallback
}
