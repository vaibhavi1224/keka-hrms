
import { ComprehensiveSeedResult } from '@/types/seedingResults';
import { seedPerformanceData } from '../performanceDataSeeder';
import { seedPayrollData } from '../payrollDataSeeder';
import { addDummyBankDetailsForAllEmployees } from '../employee/dummyBankDetailsGenerator';
import { getActiveEmployees, validateEmployeeCount } from './employeeValidator';
import { createEmptyResult, formatFinalResult } from './resultFormatter';

export async function executeSeedingProcess(): Promise<ComprehensiveSeedResult> {
  console.log('Starting comprehensive data seeding...');
  
  // Get and validate employees
  const employees = await getActiveEmployees();
  const totalEmployees = validateEmployeeCount(employees);

  if (totalEmployees === 0) {
    return createEmptyResult();
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

  return formatFinalResult(bankDetailsResult, performanceResult, payrollResult, totalEmployees);
}
