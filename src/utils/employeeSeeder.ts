import { EmployeeData } from '@/types/employee';
import { validateHRUser } from './validation/hrValidation';
import { createEmployee } from './employee/employeeCreator';
import { SeedResult } from '@/types/seedingResults';

export { validateHRUser, createEmployee };

export async function seedEmployees(employees: EmployeeData[]): Promise<SeedResult> {
  console.log('Starting to seed company data...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const employee of employees) {
    const success = await createEmployee(employee);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log(`Seeding completed: ${successCount} successful, ${errorCount} errors`);
  return { success: successCount, errors: errorCount };
}
