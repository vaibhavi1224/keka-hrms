
import { PerformanceMetric } from '@/types/performanceData';

export function generatePerformanceMetrics(employeeId: string, startDate: Date, endDate: Date): PerformanceMetric[] {
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
