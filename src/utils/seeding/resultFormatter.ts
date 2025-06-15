
import { ComprehensiveSeedResult, SeedResult } from '@/types/seedingResults';

export function createEmptyResult(): ComprehensiveSeedResult {
  return {
    payroll: { success: 0, errors: 0 },
    performance: { success: 0, errors: 0 },
    bankDetails: { success: 0, errors: 0 },
    totalEmployees: 0
  };
}

export function formatFinalResult(
  bankDetailsResult: SeedResult,
  performanceResult: SeedResult,
  payrollResult: SeedResult,
  totalEmployees: number
): ComprehensiveSeedResult {
  const result = {
    payroll: payrollResult,
    performance: performanceResult,
    bankDetails: bankDetailsResult,
    totalEmployees
  };

  console.log('Comprehensive data seeding completed!');
  console.log(`Bank Details: ${bankDetailsResult.success} success, ${bankDetailsResult.errors} errors`);
  console.log(`Performance: ${performanceResult.success} success, ${performanceResult.errors} errors`);
  console.log(`Payroll: ${payrollResult.success} success, ${payrollResult.errors} errors`);

  return result;
}
