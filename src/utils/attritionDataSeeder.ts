import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  department: string;
  designation: string;
  date_of_joining: string;
}

export async function seedAttritionPredictionData() {
  const results = {
    employees: 0,
    salaryStructures: 0,
    performanceMetrics: 0,
    attendanceRecords: 0,
    feedbackRecords: 0,
    errors: 0
  };

  try {
    // Fetch all active employees
    const { data: employees, error: employeeError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, department, designation, date_of_joining')
      .eq('is_active', true)
      .eq('role', 'employee');

    if (employeeError) throw employeeError;
    if (!employees || employees.length === 0) {
      throw new Error('No employees found to generate data for');
    }

    results.employees = employees.length;

    // Generate data for each employee
    for (const employee of employees) {
      try {
        await generateEmployeeAttritionData(employee);
        console.log(`Generated attrition data for ${employee.first_name} ${employee.last_name}`);
      } catch (error) {
        console.error(`Error generating data for employee ${employee.id}:`, error);
        results.errors++;
      }
    }

    // Count generated records
    const counts = await getGeneratedDataCounts();
    results.salaryStructures = counts.salaryStructures;
    results.performanceMetrics = counts.performanceMetrics;
    results.attendanceRecords = counts.attendanceRecords;
    results.feedbackRecords = counts.feedbackRecords;

    return results;
  } catch (error) {
    console.error('Error in seedAttritionPredictionData:', error);
    throw error;
  }
}

async function generateEmployeeAttritionData(employee: Employee) {
  const employeeId = employee.id;
  const joiningDate = new Date(employee.date_of_joining || '2024-01-01');
  const today = new Date();
  
  // Calculate years in company
  const yearsInCompany = Math.floor((today.getTime() - joiningDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  
  // Generate base satisfaction and performance levels (influences all other factors)
  const baseSatisfactionLevel = Math.random(); // 0-1
  const basePerformanceLevel = 0.3 + Math.random() * 0.7; // 0.3-1.0
  
  // 1. Generate Salary Structure (if not exists)
  await generateSalaryStructure(employeeId, employee.department, employee.designation);
  
  // 2. Generate Performance Metrics (last 6 months)
  await generatePerformanceMetrics(employeeId, basePerformanceLevel, baseSatisfactionLevel);
  
  // 3. Generate Attendance Data (last 6 months)
  await generateAttendanceData(employeeId, baseSatisfactionLevel, yearsInCompany);
  
  // 4. Generate Performance Feedback
  await generatePerformanceFeedback(employeeId, basePerformanceLevel, baseSatisfactionLevel);
}

async function generateSalaryStructure(employeeId: string, department: string, designation: string) {
  // Check if salary structure already exists
  const { data: existing } = await supabase
    .from('salary_structures')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('is_active', true)
    .single();

  if (existing) return; // Already has salary structure

  // Generate salary based on department and designation
  const baseSalary = getSalaryByRole(department, designation);
  const basicSalary = Math.round(baseSalary * 0.4);
  const hra = Math.round(baseSalary * 0.3);
  const specialAllowance = Math.round(baseSalary * 0.2);
  const transportAllowance = 3000;
  const medicalAllowance = 2000;
  const otherAllowances = Math.round(baseSalary * 0.05);

  const { error } = await supabase
    .from('salary_structures')
    .insert({
      employee_id: employeeId,
      ctc: baseSalary,
      basic_salary: basicSalary,
      hra: hra,
      special_allowance: specialAllowance,
      transport_allowance: transportAllowance,
      medical_allowance: medicalAllowance,
      other_allowances: otherAllowances,
      effective_from: new Date().toISOString().split('T')[0],
      is_active: true,
      created_by: employeeId
    });

  if (error) throw error;
}

function getSalaryByRole(department: string, designation: string): number {
  const baseSalaries: { [key: string]: { [key: string]: number } } = {
    'Engineering': { 'Junior': 600000, 'Senior': 1200000, 'Lead': 1800000, 'Manager': 2500000 },
    'Sales': { 'Executive': 400000, 'Senior': 800000, 'Manager': 1500000 },
    'Marketing': { 'Executive': 450000, 'Senior': 900000, 'Manager': 1600000 },
    'HR': { 'Executive': 500000, 'Senior': 1000000, 'Manager': 1700000 },
    'Finance': { 'Analyst': 550000, 'Senior': 1100000, 'Manager': 1800000 }
  };

  const deptSalaries = baseSalaries[department] || baseSalaries['Engineering'];
  const designationKey = Object.keys(deptSalaries).find(key => 
    designation.toLowerCase().includes(key.toLowerCase())
  ) || 'Junior';
  
  return deptSalaries[designationKey] || 600000;
}

async function generatePerformanceMetrics(employeeId: string, basePerformance: number, satisfaction: number) {
  const metrics = [];
  const metricTypes = [
    'tasks_completed',
    'attendance_rate', 
    'training_progress',
    'goal_achievement',
    'client_satisfaction',
    'code_quality',
    'project_delivery'
  ];

  // Generate metrics for last 6 months
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    date.setDate(15); // Mid-month measurement

    // Generate 3-4 different metrics per month
    const monthlyMetrics = metricTypes.slice(0, 3 + Math.floor(Math.random() * 2));
    
    for (const metricType of monthlyMetrics) {
      // Performance influenced by base levels with some variance
      const variance = (Math.random() - 0.5) * 0.3; // ±15%
      const trend = i * 0.02; // Slight improvement over time
      
      let metricValue;
      if (metricType === 'attendance_rate') {
        metricValue = Math.max(75, Math.min(100, (satisfaction * 100) + variance * 20));
      } else if (metricType === 'client_satisfaction') {
        metricValue = Math.max(2.0, Math.min(5.0, (satisfaction * 3 + 2) + variance));
      } else {
        metricValue = Math.max(0, Math.min(100, (basePerformance * 100) + variance * 30 + trend * 10));
      }

      metrics.push({
        employee_id: employeeId,
        metric_type: metricType,
        metric_value: Math.round(metricValue * 100) / 100,
        target_value: getTargetValue(metricType),
        measurement_date: date.toISOString().split('T')[0],
        quarter: Math.ceil((date.getMonth() + 1) / 3),
        year: date.getFullYear(),
        created_by: employeeId
      });
    }
  }

  const { error } = await supabase
    .from('performance_metrics')
    .upsert(metrics, { onConflict: 'employee_id,metric_type,measurement_date' });

  if (error) throw error;
}

function getTargetValue(metricType: string): number {
  const targets: { [key: string]: number } = {
    'tasks_completed': 30,
    'attendance_rate': 95,
    'training_progress': 80,
    'goal_achievement': 90,
    'client_satisfaction': 4.5,
    'code_quality': 85,
    'project_delivery': 95
  };
  return targets[metricType] || 80;
}

async function generateAttendanceData(employeeId: string, satisfaction: number, yearsInCompany: number) {
  const attendanceRecords = [];
  const today = new Date();
  
  // Generate attendance for last 90 days (excluding weekends)
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Attendance rate influenced by satisfaction and tenure
    let attendanceRate = satisfaction * 0.85 + 0.15; // Base 15-100%
    
    // New employees might have more absences
    if (yearsInCompany < 1) attendanceRate -= 0.1;
    
    // Very senior employees might have more flexibility
    if (yearsInCompany > 5) attendanceRate -= 0.05;

    const isPresent = Math.random() < attendanceRate;
    
    if (isPresent) {
      // Generate realistic work hours based on satisfaction
      const baseHours = 8;
      const variance = (Math.random() - 0.5) * 2; // ±1 hour
      const satisfactionBonus = satisfaction > 0.7 ? Math.random() * 1.5 : 0; // Happy employees work a bit more
      const workingHours = Math.max(6, Math.min(12, baseHours + variance + satisfactionBonus));
      
      const checkIn = new Date(date);
      checkIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
      
      const checkOut = new Date(checkIn);
      checkOut.setHours(checkOut.getHours() + Math.floor(workingHours));
      checkOut.setMinutes(checkOut.getMinutes() + Math.floor((workingHours % 1) * 60));

      attendanceRecords.push({
        user_id: employeeId,
        date: date.toISOString().split('T')[0],
        check_in_time: checkIn.toISOString(),
        check_out_time: checkOut.toISOString(),
        status: 'present',
        working_hours: Math.round(workingHours * 100) / 100,
        biometric_verified: Math.random() > 0.1,
        biometric_verified_out: Math.random() > 0.1
      });
    } else {
      // Absent or late
      const isLate = Math.random() > 0.7; // 30% chance of being late instead of absent
      
      if (isLate) {
        const checkIn = new Date(date);
        checkIn.setHours(10 + Math.floor(Math.random() * 2), 30 + Math.floor(Math.random() * 30));
        
        const workingHours = Math.max(4, 8 - Math.random() * 2); // Reduced hours due to lateness
        const checkOut = new Date(checkIn);
        checkOut.setHours(checkOut.getHours() + Math.floor(workingHours));
        
        attendanceRecords.push({
          user_id: employeeId,
          date: date.toISOString().split('T')[0],
          check_in_time: checkIn.toISOString(),
          check_out_time: checkOut.toISOString(),
          status: 'late',
          working_hours: Math.round(workingHours * 100) / 100,
          biometric_verified: Math.random() > 0.2,
          biometric_verified_out: Math.random() > 0.2
        });
      } else {
        attendanceRecords.push({
          user_id: employeeId,
          date: date.toISOString().split('T')[0],
          check_in_time: null,
          check_out_time: null,
          status: 'absent',
          working_hours: 0,
          biometric_verified: false,
          biometric_verified_out: false
        });
      }
    }
  }

  // Insert in chunks to avoid overwhelming the database
  const chunkSize = 50;
  for (let i = 0; i < attendanceRecords.length; i += chunkSize) {
    const chunk = attendanceRecords.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('attendance')
      .upsert(chunk, { onConflict: 'user_id,date' });
    
    if (error) throw error;
  }
}

async function generatePerformanceFeedback(employeeId: string, basePerformance: number, satisfaction: number) {
  const feedbackRecords = [];
  
  // Generate quarterly feedback for last 6 months (2 quarters)
  for (let quarter = 0; quarter < 2; quarter++) {
    const reviewDate = new Date();
    reviewDate.setMonth(reviewDate.getMonth() - (quarter * 3));
    
    const quarterStart = new Date(reviewDate);
    quarterStart.setMonth(quarterStart.getMonth() - 3);
    quarterStart.setDate(1);
    
    const quarterEnd = new Date(reviewDate);
    quarterEnd.setDate(0); // Last day of previous month
    
    // Rating influenced by performance and satisfaction
    const rating = Math.max(1, Math.min(5, 
      (basePerformance * 2.5 + satisfaction * 2.5) + (Math.random() - 0.5) * 0.5
    ));
    
    const feedbackText = generateFeedbackText(rating, basePerformance, satisfaction, quarter);
    
    feedbackRecords.push({
      employee_id: employeeId,
      feedback_type: 'self_review',
      feedback_text: feedbackText,
      rating: Math.round(rating * 10) / 10,
      review_period_start: quarterStart.toISOString().split('T')[0],
      review_period_end: quarterEnd.toISOString().split('T')[0],
      created_by: employeeId
    });
  }

  const { error } = await supabase
    .from('performance_feedback')
    .upsert(feedbackRecords, { 
      onConflict: 'employee_id,feedback_type,review_period_start,review_period_end' 
    });

  if (error) throw error;
}

function generateFeedbackText(rating: number, performance: number, satisfaction: number, quarter: number): string {
  const performanceLevel = performance > 0.8 ? 'excellent' :
                          performance > 0.6 ? 'strong' :
                          performance > 0.4 ? 'satisfactory' : 'needs improvement';
  
  const satisfactionLevel = satisfaction > 0.7 ? 'highly engaged' :
                           satisfaction > 0.5 ? 'engaged' : 'seeking improvement';

  const achievements = [
    'completed all assigned projects on time',
    'exceeded quarterly targets',
    'demonstrated strong collaboration skills',
    'showed continuous learning mindset',
    'improved technical capabilities',
    'contributed to team success',
    'maintained quality standards',
    'delivered consistent results'
  ];

  const challenges = [
    'work-life balance',
    'career growth opportunities',
    'technical skill development',
    'team communication',
    'project management',
    'time management',
    'stakeholder engagement',
    'process optimization'
  ];

  const achievement = achievements[Math.floor(Math.random() * achievements.length)];
  const challenge = challenges[Math.floor(Math.random() * challenges.length)];
  
  const templates = [
    `This quarter, I maintained ${performanceLevel} performance standards. I successfully ${achievement} while feeling ${satisfactionLevel} in my role. Moving forward, I plan to focus on ${challenge} to enhance my contributions.`,
    
    `My self-assessment shows ${performanceLevel} progress across key areas. I have ${achievement} and remained ${satisfactionLevel} throughout the review period. My development goals include improving ${challenge}.`,
    
    `During this review period, I achieved ${performanceLevel} results while being ${satisfactionLevel}. I particularly excelled in ${achievement}. For continued growth, I will concentrate on ${challenge}.`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

async function getGeneratedDataCounts() {
  const [salaryCount, metricsCount, attendanceCount, feedbackCount] = await Promise.all([
    supabase.from('salary_structures').select('id', { count: 'exact', head: true }),
    supabase.from('performance_metrics').select('id', { count: 'exact', head: true }),
    supabase.from('attendance').select('id', { count: 'exact', head: true }),
    supabase.from('performance_feedback').select('id', { count: 'exact', head: true })
  ]);

  return {
    salaryStructures: salaryCount.count || 0,
    performanceMetrics: metricsCount.count || 0,
    attendanceRecords: attendanceCount.count || 0,
    feedbackRecords: feedbackCount.count || 0
  };
}
