
import { supabase } from '@/integrations/supabase/client';
import { SeedResult } from '@/types/seedingResults';
import { generatePerformanceMetrics } from './generators/performanceMetricsGenerator';
import { generatePerformanceFeedback } from './generators/feedbackGenerator';
import { generateAttendanceRecords } from './generators/attendanceGenerator';

export async function seedPerformanceData(): Promise<SeedResult> {
  console.log('Starting to seed performance data...');
  
  // Get all active employees
  const { data: employees, error: employeesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, role, department')
    .eq('is_active', true)
    .neq('role', 'hr');

  if (employeesError) {
    console.error('Error fetching employees:', employeesError);
    throw employeesError;
  }

  if (!employees || employees.length === 0) {
    console.log('No employees found to seed data for');
    return { success: 0, errors: 0 };
  }

  let successCount = 0;
  let errorCount = 0;

  // Generate data for the last 6 months
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  for (const employee of employees) {
    try {
      console.log(`Generating data for ${employee.first_name} ${employee.last_name}...`);
      
      // Generate performance metrics
      const metrics = generatePerformanceMetrics(employee.id, startDate, endDate);
      const feedback = generatePerformanceFeedback(employee.id, startDate, endDate);
      const attendance = generateAttendanceRecords(employee.id, startDate, endDate);

      // Check for existing data to avoid duplicates
      const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('date')
        .eq('user_id', employee.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      const { data: existingMetrics } = await supabase
        .from('performance_metrics')
        .select('measurement_date')
        .eq('employee_id', employee.id)
        .gte('measurement_date', startDate.toISOString().split('T')[0])
        .lte('measurement_date', endDate.toISOString().split('T')[0]);

      const { data: existingFeedback } = await supabase
        .from('performance_feedback')
        .select('review_period_start')
        .eq('employee_id', employee.id)
        .gte('review_period_start', startDate.toISOString().split('T')[0])
        .lte('review_period_end', endDate.toISOString().split('T')[0]);

      // Filter out dates that already exist
      const existingDates = new Set(existingAttendance?.map(a => a.date) || []);
      const existingMetricDates = new Set(existingMetrics?.map(m => m.measurement_date) || []);
      const existingFeedbackDates = new Set(existingFeedback?.map(f => f.review_period_start) || []);
      
      const newAttendance = attendance.filter(a => !existingDates.has(a.date));
      const newMetrics = metrics.filter(m => !existingMetricDates.has(m.measurement_date));
      const newFeedback = feedback.filter(f => !existingFeedbackDates.has(f.review_period_start));

      // Insert metrics
      if (newMetrics.length > 0) {
        const { error: metricsError } = await supabase
          .from('performance_metrics')
          .insert(newMetrics);
        
        if (metricsError) {
          console.error(`Error inserting metrics for ${employee.email}:`, metricsError);
        }
      }

      // Insert feedback (only self-reviews to satisfy RLS)
      if (newFeedback.length > 0) {
        const { error: feedbackError } = await supabase
          .from('performance_feedback')
          .insert(newFeedback);
        
        if (feedbackError) {
          console.error(`Error inserting feedback for ${employee.email}:`, feedbackError);
        }
      }

      // Insert attendance records (only new ones)
      if (newAttendance.length > 0) {
        const { error: attendanceError } = await supabase
          .from('attendance')
          .insert(newAttendance);
        
        if (attendanceError) {
          console.error(`Error inserting attendance for ${employee.email}:`, attendanceError);
        }
      }

      successCount++;
      console.log(`✅ Successfully generated data for ${employee.first_name} ${employee.last_name}`);
      
    } catch (error) {
      console.error(`Error generating data for ${employee.email}:`, error);
      errorCount++;
    }
  }

  console.log(`Performance data seeding completed: ${successCount} successful, ${errorCount} errors`);
  return { success: successCount, errors: errorCount };
}
