
import { supabase } from '@/integrations/supabase/client';
import { EmployeeData } from '@/types/employee';
import { createEmployeeRecord } from './employeeRecordManager';
import { createBankDetails } from './bankDetailsManager';

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
      
      // Update the employees table and create bank details if they don't exist
      if (data.user_id) {
        await createEmployeeRecord(data.user_id, employee);
        
        // If banking details are provided, add them to employee_bank_details table
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
