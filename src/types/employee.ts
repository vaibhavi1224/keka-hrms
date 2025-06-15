
export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Designation {
  id: string;
  name: string;
  description?: string;
  department_id?: string;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  employee_id: string;
  workflow_type: 'onboarding' | 'offboarding';
  current_step: number;
  total_steps: number;
  step_data: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  initiated_by: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  workflow_type: 'onboarding' | 'offboarding';
  step_number: number;
  step_name: string;
  step_description?: string;
  required_role?: string;
  is_required: boolean;
  created_at: string;
}

export interface OrgStructure {
  id: string;
  employee_id: string;
  manager_id?: string;
  effective_from: string;
  effective_to?: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  role: string;
  resource: string;
  action: string;
  conditions: Record<string, any>;
  created_at: string;
}

export interface Employee {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  department?: string;
  designation?: string;
  designation_id?: string;
  employee_code?: string;
  date_of_joining?: string;
  role: 'hr' | 'manager' | 'employee';
  is_active: boolean;
  status?: string;
  onboarding_status?: 'pending' | 'in_progress' | 'completed';
  reporting_manager_id?: string;
  manager_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  address?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeData {
  name: string;
  email: string;
  role: 'hr' | 'manager' | 'employee';
  department: string;
  designation: string;
  manager?: string | null;
  salary: number;
  date_of_joining: string;
  bankDetails?: {
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    pan_number: string;
    uan_number: string;
    aadhaar_number: string;
  };
}

export interface OrgChartNode {
  id: string;
  name: string;
  designation: string;
  department?: string;
  manager_id?: string;
  children?: OrgChartNode[];
  profile_picture?: string;
}
