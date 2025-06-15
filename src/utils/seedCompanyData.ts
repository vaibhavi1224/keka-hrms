
import { validateHRUser, seedEmployees } from './employeeSeeder';
import { companyEmployeesData } from '@/data/companyEmployees';

export async function seedCompanyData() {
  try {
    await validateHRUser();
    return await seedEmployees(companyEmployeesData);
  } catch (error) {
    console.error('Error seeding company data:', error);
    throw error;
  }
}
