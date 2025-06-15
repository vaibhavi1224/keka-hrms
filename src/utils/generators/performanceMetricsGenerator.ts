
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
  
  // Generate monthly metrics for the last 6 months
  while (currentDate <= endDate) {
    // Generate 3-5 different metrics per month
    const metricsThisMonth = Math.floor(Math.random() * 3) + 3;
    const usedTypes = new Set();
    
    for (let i = 0; i < metricsThisMonth; i++) {
      let metricType;
      do {
        metricType = metricTypes[Math.floor(Math.random() * metricTypes.length)];
      } while (usedTypes.has(metricType.type) && usedTypes.size < metricTypes.length);
      
      usedTypes.add(metricType.type);
      
      // Generate realistic performance with some improvement trend over time
      const monthsFromStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const improvementFactor = 1 + (monthsFromStart * 0.02); // 2% improvement per month
      
      const variance = (Math.random() - 0.5) * 0.3; // ±15% variance
      const baseValue = metricType.min + (metricType.max - metricType.min) * (0.6 + Math.random() * 0.4);
      const metricValue = Math.max(metricType.min, Math.min(metricType.max, baseValue * improvementFactor + baseValue * variance));

      // Use mid-month date for measurement
      const measurementDate = new Date(currentDate);
      measurementDate.setDate(15);

      metrics.push({
        employee_id: employeeId,
        metric_type: metricType.type,
        metric_value: Math.round(metricValue * 100) / 100,
        target_value: metricType.target,
        measurement_date: measurementDate.toISOString().split('T')[0],
        quarter: Math.ceil((measurementDate.getMonth() + 1) / 3),
        year: measurementDate.getFullYear(),
        notes: Math.random() > 0.6 ? generateMetricNote(metricType.type) : undefined
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
      'Improved task completion efficiency',
      'Handled urgent client requests',
      'Delivered quality work on time'
    ],
    attendance_rate: [
      'Perfect attendance this period',
      'Minor sick leave taken',
      'Consistent presence in office',
      'Work from home days included',
      'Public holidays considered',
      'Medical leave approved'
    ],
    training_progress: [
      'Completed certification course',
      'Attended workshop sessions',
      'Self-paced learning modules',
      'Skill development program',
      'Technical training completed',
      'Leadership course attended'
    ],
    goal_achievement: [
      'Met all quarterly objectives',
      'Exceeded sales targets',
      'Delivered project on time',
      'Achieved quality milestones',
      'Customer satisfaction improved',
      'Process optimization completed'
    ],
    client_satisfaction: [
      'Positive client feedback received',
      'Resolved client issues effectively',
      'Maintained strong relationships',
      'Improved service delivery',
      'Quick response time',
      'Proactive communication'
    ],
    code_quality: [
      'Clean code practices followed',
      'Peer review scores improved',
      'Reduced bug count significantly',
      'Implemented best practices',
      'Documentation updated',
      'Code refactoring completed'
    ],
    project_delivery: [
      'On-time project completion',
      'Within budget delivery',
      'Quality deliverables achieved',
      'Stakeholder expectations met',
      'Risk mitigation successful',
      'Scope creep managed well'
    ]
  };

  const typeNotes = notes[metricType as keyof typeof notes] || ['Standard performance noted'];
  return typeNotes[Math.floor(Math.random() * typeNotes.length)];
}
