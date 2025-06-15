
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchEmployeePerformanceData(employeeId: string, startDate: string, endDate: string) {
  console.log('📥 Fetching comprehensive employee data...');
  
  // Get employee basic info
  const { data: employee, error: empError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', employeeId)
    .single();

  if (empError || !employee) {
    throw new Error('Employee not found');
  }

  // Get performance metrics
  const { data: metrics } = await supabase
    .from('performance_metrics')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('measurement_date', startDate)
    .lte('measurement_date', endDate)
    .order('measurement_date', { ascending: false });

  // Get attendance data
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', employeeId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  // Get existing feedback
  const { data: feedback } = await supabase
    .from('performance_feedback')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('review_period_start', startDate)
    .lte('review_period_end', endDate)
    .order('created_at', { ascending: false });

  // Calculate key metrics
  const attendanceRate = calculateAttendanceRate(attendance || []);
  const avgPerformanceScore = calculateAveragePerformance(metrics || []);
  const workConsistency = calculateWorkConsistency(attendance || []);

  return {
    ...employee,
    metrics: metrics || [],
    attendance: attendance || [],
    feedback: feedback || [],
    calculatedMetrics: {
      attendanceRate,
      avgPerformanceScore,
      workConsistency,
      totalWorkingDays: attendance?.length || 0,
      metricsCount: metrics?.length || 0
    }
  };
}

function calculateAttendanceRate(attendance: any[]): number {
  if (attendance.length === 0) return 0;
  const presentDays = attendance.filter(a => a.status === 'present').length;
  return (presentDays / attendance.length) * 100;
}

function calculateAveragePerformance(metrics: any[]): number {
  if (metrics.length === 0) return 0;
  const total = metrics.reduce((sum, m) => sum + (m.metric_value / 20), 0); // Normalize to 5-point scale
  return total / metrics.length;
}

function calculateWorkConsistency(attendance: any[]): number {
  if (attendance.length === 0) return 0;
  const consistentDays = attendance.filter(a => 
    a.status === 'present' && a.working_hours >= 7
  ).length;
  return (consistentDays / attendance.length) * 100;
}
