
import { supabase } from '@/integrations/supabase/client';

const DUMMY_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Punjab National Bank',
  'Canara Bank',
  'Bank of Baroda',
  'Union Bank of India',
  'Indian Bank',
  'Central Bank of India',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Federal Bank',
  'Yes Bank',
  'IDFC First Bank',
  'Bandhan Bank',
  'Standard Chartered Bank',
  'RBL Bank'
];

const DUMMY_IFSC_CODES = [
  'SBIN0001234',
  'HDFC0002345',
  'ICIC0003456',
  'UTIB0004567',
  'PUNB0005678',
  'CNRB0006789',
  'BARB0007890',
  'UBIN0008901',
  'IDIB0009012',
  'CBIN0000123',
  'KKBK0001234',
  'INDB0002345',
  'FDRL0003456',
  'YESB0004567',
  'IDFB0005678',
  'BDBL0006789',
  'SCBL0007890',
  'RATN0008901'
];

function generateRandomAccountNumber(): string {
  return Math.floor(Math.random() * 900000000000) + 100000000000 + '';
}

function generateRandomPAN(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let pan = '';
  // First 5 characters are letters
  for (let i = 0; i < 5; i++) {
    pan += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  // Next 4 characters are numbers
  for (let i = 0; i < 4; i++) {
    pan += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  // Last character is a letter
  pan += letters.charAt(Math.floor(Math.random() * letters.length));
  
  return pan;
}

function generateRandomAadhaar(): string {
  return Math.floor(Math.random() * 900000000000) + 100000000000 + '';
}

function generateRandomUAN(): string {
  return Math.floor(Math.random() * 900000000000) + 100000000000 + '';
}

export async function addDummyBankDetailsForAllEmployees(): Promise<{ success: number; errors: number }> {
  console.log('Starting to add dummy bank details for all employees...');
  
  let successCount = 0;
  let errorCount = 0;

  try {
    // Get all active profiles (employees)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_active', true);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return { success: 0, errors: 1 };
    }

    if (!profiles || profiles.length === 0) {
      console.log('No active employees found');
      return { success: 0, errors: 0 };
    }

    // Get employees who already have bank details
    const { data: existingBankDetails, error: bankDetailsError } = await supabase
      .from('employee_bank_details')
      .select('employee_id');

    if (bankDetailsError) {
      console.error('Error fetching existing bank details:', bankDetailsError);
      return { success: 0, errors: 1 };
    }

    const existingEmployeeIds = new Set(existingBankDetails?.map(detail => detail.employee_id) || []);

    // Filter employees who don't have bank details
    const employeesWithoutBankDetails = profiles.filter(profile => !existingEmployeeIds.has(profile.id));

    console.log(`Found ${employeesWithoutBankDetails.length} employees without bank details`);

    // Add dummy bank details for each employee
    for (const employee of employeesWithoutBankDetails) {
      try {
        const bankIndex = Math.floor(Math.random() * DUMMY_BANKS.length);
        
        const dummyBankDetails = {
          employee_id: employee.id,
          bank_name: DUMMY_BANKS[bankIndex],
          account_number: generateRandomAccountNumber(),
          ifsc_code: DUMMY_IFSC_CODES[bankIndex],
          pan_number: generateRandomPAN(),
          uan_number: generateRandomUAN(),
          aadhaar_number: generateRandomAadhaar()
        };

        const { error } = await supabase
          .from('employee_bank_details')
          .insert(dummyBankDetails);

        if (error) {
          console.error(`Error adding bank details for employee ${employee.id}:`, error);
          errorCount++;
        } else {
          console.log(`Successfully added bank details for employee ${employee.id}`);
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing employee ${employee.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Dummy bank details generation completed: ${successCount} successful, ${errorCount} errors`);
    return { success: successCount, errors: errorCount };

  } catch (error) {
    console.error('Error in addDummyBankDetailsForAllEmployees:', error);
    return { success: 0, errors: 1 };
  }
}
