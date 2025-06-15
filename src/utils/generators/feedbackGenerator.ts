
import { PerformanceFeedback } from '@/types/performanceData';

export function generatePerformanceFeedback(employeeId: string, startDate: Date, endDate: Date): PerformanceFeedback[] {
  const feedback: PerformanceFeedback[] = [];
  
  // Generate quarterly feedback (every 3 months)
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const quarterStart = new Date(currentDate);
    quarterStart.setDate(1); // Start of the month
    
    const quarterEnd = new Date(quarterStart);
    quarterEnd.setMonth(quarterEnd.getMonth() + 3);
    quarterEnd.setDate(0); // Last day of the quarter
    
    // Don't create feedback for future quarters
    if (quarterStart > endDate) break;
    
    // Ensure quarter end doesn't exceed the endDate
    if (quarterEnd > endDate) {
      quarterEnd.setTime(endDate.getTime());
    }

    // Generate self-review feedback with realistic progression
    const quarterNumber = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 90));
    const baseRating = 3.2 + Math.random() * 1.5; // 3.2-4.7 base rating
    const progressionBonus = quarterNumber * 0.1; // Slight improvement over time
    const rating = Math.min(5.0, baseRating + progressionBonus);
    
    const feedbackText = generateFeedbackText('self_review', rating, quarterStart);
    
    feedback.push({
      employee_id: employeeId,
      feedback_type: 'self_review',
      feedback_text: feedbackText,
      rating: Math.round(rating * 10) / 10,
      review_period_start: quarterStart.toISOString().split('T')[0],
      review_period_end: quarterEnd.toISOString().split('T')[0],
      created_by: employeeId // This satisfies the RLS policy: created_by = auth.uid()
    });
    
    // Move to next quarter
    currentDate.setMonth(currentDate.getMonth() + 3);
  }

  return feedback;
}

function generateFeedbackText(type: string, rating: number, reviewDate: Date): string {
  const month = reviewDate.toLocaleString('default', { month: 'long' });
  const year = reviewDate.getFullYear();
  
  const performanceLevel = rating >= 4.5 ? 'excellent' :
                          rating >= 4.0 ? 'strong' :
                          rating >= 3.5 ? 'good' :
                          rating >= 3.0 ? 'satisfactory' : 'needs improvement';

  const achievements = [
    'completed all assigned projects',
    'exceeded performance targets',
    'demonstrated strong collaboration',
    'showed continuous learning',
    'improved technical skills',
    'contributed to team success',
    'maintained quality standards',
    'delivered on time consistently'
  ];

  const areas = [
    'project management',
    'client communication',
    'technical implementation',
    'team collaboration',
    'process improvement',
    'quality assurance',
    'deadline management',
    'stakeholder engagement'
  ];

  const goals = [
    'enhance technical expertise',
    'improve communication skills',
    'take on leadership roles',
    'optimize work processes',
    'increase productivity',
    'build stronger relationships',
    'expand knowledge base',
    'contribute to innovation'
  ];

  const achievement = achievements[Math.floor(Math.random() * achievements.length)];
  const area = areas[Math.floor(Math.random() * areas.length)];
  const goal = goals[Math.floor(Math.random() * goals.length)];

  const feedbackTemplates = {
    self_review: [
      `During the review period ending ${month} ${year}, I believe my performance has been ${performanceLevel}. I have ${achievement} and focused particularly on ${area}. Moving forward, I plan to ${goal} to further enhance my contributions to the team.`,
      
      `This quarter, I maintained ${performanceLevel} standards in my work. I successfully ${achievement} while demonstrating growth in ${area}. My goals for the next period include efforts to ${goal} and continue delivering quality results.`,
      
      `My self-assessment for ${month} ${year} shows ${performanceLevel} progress across key performance areas. I have consistently ${achievement} and made significant improvements in ${area}. Looking ahead, I am committed to ${goal} and maintaining high performance standards.`,
      
      `Reflecting on my performance this quarter, I believe I have achieved ${performanceLevel} results. I particularly excelled in ${area} and ${achievement}. For continued growth, I will focus on efforts to ${goal} and build upon my current strengths.`
    ]
  };

  const templates = feedbackTemplates[type as keyof typeof feedbackTemplates] || feedbackTemplates.self_review;
  return templates[Math.floor(Math.random() * templates.length)];
}
