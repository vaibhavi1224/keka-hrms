
import { supabase } from '@/integrations/supabase/client';

export async function getActiveEmployees() {
  const { data: employees, error: employeesError } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_active', true)
    .neq('role', 'hr');

  if (employeesError) {
    console.error('Error fetching employees:', employeesError);
    throw employeesError;
  }

  return employees || [];
}

export function validateEmployeeCount(employees: any[]): number {
  const totalEmployees = employees.length;
  console.log(`Found ${totalEmployees} employees to seed data for`);
  
  if (totalEmployees === 0) {
    console.log('No employees found to seed data for');
  }
  
  return totalEmployees;
}
