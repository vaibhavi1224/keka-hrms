
export interface EmployeeData {
  name: string;
  email: string;
  role: 'hr' | 'manager' | 'employee';
  department: string;
  designation: string;
  manager: string | null;
  salary?: number;
  date_of_joining: string;
  bankDetails?: {
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    pan_number: string;
    uan_number?: string;
    aadhaar_number: string;
  };
}
