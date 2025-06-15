
import { supabase } from '@/integrations/supabase/client';
import { EmployeeData } from '@/types/employee';

export interface SeedResult {
  success: number;
  errors: number;
}

export async function validateHRUser(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('No authenticated user found');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'hr') {
    throw new Error('Only HR users can seed company data');
  }
}

export async function createEmployee(employee: EmployeeData): Promise<boolean> {
  try {
    // Check if employee profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', employee.email)
      .single();

    if (existingProfile) {
      console.log(`Employee already exists for ${employee.email}, skipping...`);
      return true; // Consider as success since employee exists
    }

    // Generate a temporary password for the employee
    const tempPassword = Math.random().toString(36).slice(-8) + 'Temp123!';

    // Create employee using the edge function
    const { data, error } = await supabase.functions.invoke('create-employee', {
      body: {
        name: employee.name,
        email: employee.email,
        password: tempPassword,
        role: employee.role,
        department: employee.department,
        designation: employee.designation,
        salary: employee.salary,
        date_of_joining: employee.date_of_joining
      }
    });

    if (error) {
      console.error(`Error creating employee ${employee.email}:`, error);
      return false;
    } else if (data.error) {
      console.error(`Error creating employee ${employee.email}:`, data.error);
      return false;
    } else {
      console.log(`Successfully created employee ${employee.email}`);
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${employee.email}:`, error);
    return false;
  }
}

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
