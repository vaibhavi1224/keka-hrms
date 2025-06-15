
import { supabase } from '@/integrations/supabase/client';
import { EmployeeData } from '@/types/employee';

export async function createEmployeeRecord(userId: string, employee: EmployeeData): Promise<void> {
  try {
    // Check if employee record exists in employees table
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('*')
      .eq('profile_id', userId)
      .single();

    if (!existingEmployee) {
      // Create new employee record if it doesn't exist
      const newEmployeeData = {
        profile_id: userId,
        salary: employee.salary,
        address: `${Math.floor(Math.random() * 999) + 1}, ${['MG Road', 'Brigade Road', 'Commercial Street', 'Koramangala', 'Indiranagar'][Math.floor(Math.random() * 5)]}, Bangalore, Karnataka, ${560000 + Math.floor(Math.random() * 100)}`,
        emergency_contact_name: `Emergency Contact ${Math.floor(Math.random() * 1000)}`,
        emergency_contact_phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        bank_account_number: null, // We'll use employee_bank_details table instead
        bank_name: null // We'll use employee_bank_details table instead
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
    console.error(`Error processing employee record for ${userId}:`, error);
  }
}
