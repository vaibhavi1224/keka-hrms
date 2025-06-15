
import { supabase } from '@/integrations/supabase/client';
import { EmployeeData } from '@/types/employee';

export async function createBankDetails(userId: string, bankDetails: EmployeeData['bankDetails']): Promise<void> {
  if (!bankDetails) return;

  try {
    // Check if bank details already exist
    const { data: existingBankDetails } = await supabase
      .from('employee_bank_details')
      .select('id')
      .eq('employee_id', userId)
      .single();

    if (existingBankDetails) {
      console.log(`Bank details already exist for ${userId}, skipping...`);
      return;
    }

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
