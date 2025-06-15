
import { supabase } from '@/integrations/supabase/client';
import { addDummyBankDetailsForAllEmployees } from './employee/dummyBankDetailsGenerator';
import { createSalaryStructure } from './generators/salaryStructureGenerator';
import { generatePayrollRecords } from './generators/payrollRecordsGenerator';

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
