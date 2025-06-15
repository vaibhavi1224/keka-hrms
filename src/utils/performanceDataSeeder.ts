
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  employee_id: string;
  metric_type: string;
  metric_value: number;
  target_value?: number;
  measurement_date: string;
  quarter: number;
  year: number;
  notes?: string;
}

interface PerformanceFeedback {
  employee_id: string;
  feedback_type: string;
  feedback_text: string;
  rating: number;
  review_period_start: string;
  review_period_end: string;
}

interface AttendanceRecord {
  user_id: string;
  date: string;
  check_in_time: string;
  check_out_time: string;
  status: string;
  working_hours: number;
  biometric_verified: boolean;
  biometric_verified_out: boolean;
}

export async function seedPerformanceData() {
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

      // Insert metrics
      if (metrics.length > 0) {
        const { error: metricsError } = await supabase
          .from('performance_metrics')
          .insert(metrics);
        
        if (metricsError) {
          console.error(`Error inserting metrics for ${employee.email}:`, metricsError);
          errorCount++;
        }
      }

      // Insert feedback
      if (feedback.length > 0) {
        const { error: feedbackError } = await supabase
          .from('performance_feedback')
          .insert(feedback);
        
        if (feedbackError) {
          console.error(`Error inserting feedback for ${employee.email}:`, feedbackError);
          errorCount++;
        }
      }

      // Insert attendance records
      if (attendance.length > 0) {
        const { error: attendanceError } = await supabase
          .from('attendance')
          .insert(attendance);
        
        if (attendanceError) {
          console.error(`Error inserting attendance for ${employee.email}:`, attendanceError);
          errorCount++;
        }
      }

      successCount++;
      console.log(`✅ Successfully generated data for ${employee.first_name} ${employee.last_name}`);
      
    } catch (error) {
      console.error(`Error generating data for ${employee.email}:`, error);
      errorCount++;
    }
  }

  console.log(`Data seeding completed: ${successCount} successful, ${errorCount} errors`);
  return { success: successCount, errors: errorCount };
}

function generatePerformanceMetrics(employeeId: string, startDate: Date, endDate: Date): PerformanceMetric[] {
  const metrics: PerformanceMetric[] = [];
  const metricTypes = [
    { type: 'tasks_completed', min: 15, max: 45, target: 30 },
    { type: 'attendance_rate', min: 85, max: 100, target: 95 },
    { type: 'training_progress', min: 60, max: 100, target: 80 },
    { type: 'goal_achievement', min: 70, max: 100, target: 90 },
    { type: 'client_satisfaction', min: 3.5, max: 5.0, target: 4.5 },
    { type: 'code_quality', min: 70, max: 95, target: 85 },
    { type: 'project_delivery', min: 80, max: 100, target: 95 }
  ];

  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Generate 2-3 metrics per month
    for (let i = 0; i < Math.floor(Math.random() * 2) + 2; i++) {
      const metricType = metricTypes[Math.floor(Math.random() * metricTypes.length)];
      const variance = (Math.random() - 0.5) * 0.3; // ±15% variance
      const baseValue = metricType.min + (metricType.max - metricType.min) * (0.6 + Math.random() * 0.4);
      const metricValue = Math.max(metricType.min, Math.min(metricType.max, baseValue + baseValue * variance));

      metrics.push({
        employee_id: employeeId,
        metric_type: metricType.type,
        metric_value: Math.round(metricValue * 100) / 100,
        target_value: metricType.target,
        measurement_date: currentDate.toISOString().split('T')[0],
        quarter: Math.ceil((currentDate.getMonth() + 1) / 3),
        year: currentDate.getFullYear(),
        notes: Math.random() > 0.7 ? generateMetricNote(metricType.type) : undefined
      });
    }
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return metrics;
}

function generatePerformanceFeedback(employeeId: string, startDate: Date, endDate: Date): PerformanceFeedback[] {
  const feedback: PerformanceFeedback[] = [];
  const feedbackTypes = ['self_review', 'manager_review', 'peer_review'];
  
  // Generate quarterly feedback
  const quarters = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 90));
  
  for (let q = 0; q < quarters; q++) {
    const quarterStart = new Date(startDate);
    quarterStart.setMonth(quarterStart.getMonth() + (q * 3));
    const quarterEnd = new Date(quarterStart);
    quarterEnd.setMonth(quarterEnd.getMonth() + 3);
    quarterEnd.setDate(quarterEnd.getDate() - 1);

    feedbackTypes.forEach(type => {
      const rating = 3 + Math.random() * 2; // 3-5 rating
      const feedbackText = generateFeedbackText(type, rating);
      
      feedback.push({
        employee_id: employeeId,
        feedback_type: type,
        feedback_text: feedbackText,
        rating: Math.round(rating * 10) / 10,
        review_period_start: quarterStart.toISOString().split('T')[0],
        review_period_end: quarterEnd.toISOString().split('T')[0]
      });
    });
  }

  return feedback;
}

function generateAttendanceRecords(employeeId: string, startDate: Date, endDate: Date): AttendanceRecord[] {
  const attendance: AttendanceRecord[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      const attendanceRate = 0.85 + Math.random() * 0.15; // 85-100% attendance
      
      if (Math.random() < attendanceRate) {
        const checkInHour = 8 + Math.random() * 2; // 8-10 AM
        const checkInMinute = Math.floor(Math.random() * 60);
        const workingHours = 7.5 + Math.random() * 2; // 7.5-9.5 hours
        
        const checkInTime = new Date(currentDate);
        checkInTime.setHours(checkInHour, checkInMinute, 0, 0);
        
        const checkOutTime = new Date(checkInTime);
        checkOutTime.setHours(checkOutTime.getHours() + Math.floor(workingHours));
        checkOutTime.setMinutes(checkOutTime.getMinutes() + Math.floor((workingHours % 1) * 60));
        
        attendance.push({
          user_id: employeeId,
          date: currentDate.toISOString().split('T')[0],
          check_in_time: checkInTime.toISOString(),
          check_out_time: checkOutTime.toISOString(),
          status: 'present',
          working_hours: Math.round(workingHours * 100) / 100,
          biometric_verified: Math.random() > 0.1,
          biometric_verified_out: Math.random() > 0.1
        });
      } else {
        // Absent or leave
        const status = Math.random() > 0.5 ? 'absent' : 'leave';
        attendance.push({
          user_id: employeeId,
          date: currentDate.toISOString().split('T')[0],
          check_in_time: '',
          check_out_time: '',
          status: status,
          working_hours: 0,
          biometric_verified: false,
          biometric_verified_out: false
        });
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return attendance;
}

function generateMetricNote(metricType: string): string {
  const notes = {
    tasks_completed: [
      'Exceeded monthly targets',
      'Completed critical project deliverables',
      'Focused on high-priority tasks',
      'Improved task completion efficiency'
    ],
    attendance_rate: [
      'Perfect attendance this period',
      'Minor sick leave taken',
      'Consistent presence in office',
      'Work from home days included'
    ],
    training_progress: [
      'Completed certification course',
      'Attended workshop sessions',
      'Self-paced learning modules',
      'Skill development program'
    ],
    goal_achievement: [
      'Met all quarterly objectives',
      'Exceeded sales targets',
      'Delivered project on time',
      'Achieved quality milestones'
    ],
    client_satisfaction: [
      'Positive client feedback received',
      'Resolved client issues effectively',
      'Maintained strong relationships',
      'Improved service delivery'
    ],
    code_quality: [
      'Clean code practices followed',
      'Peer review scores improved',
      'Reduced bug count significantly',
      'Implemented best practices'
    ],
    project_delivery: [
      'On-time project completion',
      'Within budget delivery',
      'Quality deliverables achieved',
      'Stakeholder expectations met'
    ]
  };

  const typeNotes = notes[metricType as keyof typeof notes] || ['Standard performance noted'];
  return typeNotes[Math.floor(Math.random() * typeNotes.length)];
}

function generateFeedbackText(type: string, rating: number): string {
  const positiveWords = ['excellent', 'outstanding', 'impressive', 'strong', 'good', 'solid'];
  const neutralWords = ['adequate', 'satisfactory', 'reasonable', 'acceptable'];
  const improvementWords = ['needs improvement', 'could be better', 'requires attention'];

  const word = rating >= 4.5 ? positiveWords[Math.floor(Math.random() * positiveWords.length)] :
                rating >= 3.5 ? neutralWords[Math.floor(Math.random() * neutralWords.length)] :
                improvementWords[Math.floor(Math.random() * improvementWords.length)];

  const feedbackTemplates = {
    self_review: [
      `I believe my performance has been ${word} this quarter. I have focused on continuous improvement and meeting all assigned goals.`,
      `This period, I have maintained ${word} standards in my work and contributed effectively to team objectives.`,
      `My self-assessment shows ${word} progress in key areas with consistent effort towards professional development.`
    ],
    manager_review: [
      `Employee has demonstrated ${word} performance throughout this review period. Shows commitment to quality and deadlines.`,
      `The team member has shown ${word} results in their assigned responsibilities and collaboration with colleagues.`,
      `Performance evaluation indicates ${word} contribution to department goals with reliable work quality.`
    ],
    peer_review: [
      `Colleague has been ${word} to work with this quarter. Shows strong teamwork and communication skills.`,
      `Working relationship has been ${word} with effective collaboration on shared projects and initiatives.`,
      `Peer demonstrates ${word} professional conduct and supportive attitude towards team success.`
    ]
  };

  const templates = feedbackTemplates[type as keyof typeof feedbackTemplates];
  return templates[Math.floor(Math.random() * templates.length)];
}
