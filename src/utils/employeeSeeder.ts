
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
      
      // Update the employees table with additional details if they don't exist
      if (data.user_id) {
        await updateEmployeeDetails(data.user_id, employee);
        
        // If banking details are provided, add them
        if (employee.bankDetails) {
          await createBankDetails(data.user_id, employee.bankDetails);
        }
      }
      
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${employee.email}:`, error);
    return false;
  }
}

async function updateEmployeeDetails(userId: string, employee: EmployeeData): Promise<void> {
  try {
    // Check if employee record exists in employees table
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('*')
      .eq('profile_id', userId)
      .single();

    if (existingEmployee) {
      // Update existing employee record with additional details if they are null
      const updateData: any = {};
      
      if (!existingEmployee.address) {
        updateData.address = `${Math.floor(Math.random() * 999) + 1}, ${['MG Road', 'Brigade Road', 'Commercial Street', 'Koramangala', 'Indiranagar'][Math.floor(Math.random() * 5)]}, Bangalore, Karnataka, ${560000 + Math.floor(Math.random() * 100)}`;
      }
      
      if (!existingEmployee.emergency_contact_name) {
        updateData.emergency_contact_name = `Emergency Contact ${Math.floor(Math.random() * 1000)}`;
      }
      
      if (!existingEmployee.emergency_contact_phone) {
        updateData.emergency_contact_phone = `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`;
      }
      
      if (!existingEmployee.bank_account_number && employee.bankDetails) {
        updateData.bank_account_number = employee.bankDetails.account_number;
      }
      
      if (!existingEmployee.bank_name && employee.bankDetails) {
        updateData.bank_name = employee.bankDetails.bank_name;
      }

      // Only update if there are fields to update
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('employees')
          .update(updateData)
          .eq('profile_id', userId);

        if (error) {
          console.error(`Error updating employee details for ${userId}:`, error);
        } else {
          console.log(`Successfully updated employee details for ${userId}`);
        }
      }
    } else {
      // Create new employee record if it doesn't exist
      const newEmployeeData = {
        profile_id: userId,
        salary: employee.salary,
        address: `${Math.floor(Math.random() * 999) + 1}, ${['MG Road', 'Brigade Road', 'Commercial Street', 'Koramangala', 'Indiranagar'][Math.floor(Math.random() * 5)]}, Bangalore, Karnataka, ${560000 + Math.floor(Math.random() * 100)}`,
        emergency_contact_name: `Emergency Contact ${Math.floor(Math.random() * 1000)}`,
        emergency_contact_phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        bank_account_number: employee.bankDetails?.account_number || null,
        bank_name: employee.bankDetails?.bank_name || null
      };

      const { error } = await supabase
        .from('employees')
        .insert(newEmployeeData);

      if (error) {
        console.error(`Error creating employee record for ${userId}:`, error);
      } else {
        console.log(`Successfully created employee record for ${userId}`);
      }
    }
  } catch (error) {
    console.error(`Error processing employee details for ${userId}:`, error);
  }
}

async function createBankDetails(userId: string, bankDetails: EmployeeData['bankDetails']): Promise<void> {
  if (!bankDetails) return;

  try {
    const { error } = await supabase
      .from('employee_bank_details')
      .insert({
        employee_id: userId,
        bank_name: bankDetails.bank_name,
        account_number: bankDetails.account_number,
        ifsc_code: bankDetails.ifsc_code,
        pan_number: bankDetails.pan_number,
        uan_number: bankDetails.uan_number,
        aadhaar_number: bankDetails.aadhaar_number
      });

    if (error) {
      console.error(`Error creating bank details for ${userId}:`, error);
    } else {
      console.log(`Successfully created bank details for ${userId}`);
    }
  } catch (error) {
    console.error(`Error processing bank details for ${userId}:`, error);
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
