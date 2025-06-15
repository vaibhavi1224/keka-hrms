
export interface EmployeeData {
  name: string;
  email: string;
  role: 'hr' | 'manager' | 'employee';
  department: string;
  designation: string;
  manager: string | null;
  salary?: number;
  date_of_joining: string;
}
