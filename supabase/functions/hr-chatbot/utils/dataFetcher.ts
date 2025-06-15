
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface UserData {
  profile: any;
  leaveRequests: any[];
  attendanceRecords: any[];
  salaryStructure: any[];
  bankDetails: any;
  managerInfo: any;
}

export async function fetchUserData(supabase: any, userId: string): Promise<UserData> {
  // Get comprehensive user profile and related data
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      employees (*)
    `)
    .eq('id', userId)
    .single();

  // Get user's leave requests for context
  const { data: leaveRequests } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get user's recent attendance records
  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(10);

  // Get user's salary structure if exists
  const { data: salaryStructure } = await supabase
    .from('salary_structures')
    .select('*')
    .eq('employee_id', userId)
    .eq('is_active', true)
    .order('effective_from', { ascending: false })
    .limit(1);

  // Get user's bank details if exists
  const { data: bankDetails } = await supabase
    .from('employee_bank_details')
    .select('*')
    .eq('employee_id', userId)
    .single();

  // Get manager information if user has a manager
  let managerInfo = null;
  if (profile?.manager_id) {
    const { data: manager } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, designation')
      .eq('id', profile.manager_id)
      .single();
    managerInfo = manager;
  }

  return {
    profile,
    leaveRequests: leaveRequests || [],
    attendanceRecords: attendanceRecords || [],
    salaryStructure: salaryStructure || [],
    bankDetails,
    managerInfo
  };
}
