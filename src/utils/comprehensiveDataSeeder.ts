
import { supabase } from '@/integrations/supabase/client';
import { seedPerformanceData } from './performanceDataSeeder';
import { seedPayrollData } from './payrollDataSeeder';
import { addDummyBankDetailsForAllEmployees } from './employee/dummyBankDetailsGenerator';

interface ComprehensiveSeedResult {
  payroll: { success: number; errors: number };
  performance: { success: number; errors: number };
  bankDetails: { success: number; errors: number };
  totalEmployees: number;
}

export async function seedAllDummyData(): Promise<ComprehensiveSeedResult> {
  console.log('Starting comprehensive data seeding...');
  
  // Get count of active employees
  const { data: employees, error: employeesError } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_active', true)
    .neq('role', 'hr');

  if (employeesError) {
    console.error('Error fetching employees:', employeesError);
    throw employeesError;
  }

  const totalEmployees = employees?.length || 0;
  console.log(`Found ${totalEmployees} employees to seed data for`);

  if (totalEmployees === 0) {
    console.log('No employees found to seed data for');
    return {
      payroll: { success: 0, errors: 0 },
      performance: { success: 0, errors: 0 },
      bankDetails: { success: 0, errors: 0 },
      totalEmployees: 0
    };
  }

  // Seed bank details first (required for payroll)
  console.log('Seeding bank details...');
  const bankDetailsResult = await addDummyBankDetailsForAllEmployees();

  // Seed performance data
  console.log('Seeding performance data...');
  const performanceResult = await seedPerformanceData();

  // Seed payroll data
  console.log('Seeding payroll data...');
  const payrollResult = await seedPayrollData();

  console.log('Comprehensive data seeding completed!');
  console.log(`Bank Details: ${bankDetailsResult.success} success, ${bankDetailsResult.errors} errors`);
  console.log(`Performance: ${performanceResult.success} success, ${performanceResult.errors} errors`);
  console.log(`Payroll: ${payrollResult.success} success, ${payrollResult.errors} errors`);

  return {
    payroll: payrollResult,
    performance: performanceResult,
    bankDetails: bankDetailsResult,
    totalEmployees
  };
}
