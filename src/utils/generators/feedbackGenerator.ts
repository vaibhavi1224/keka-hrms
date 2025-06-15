
import { PerformanceFeedback } from '@/types/performanceData';

export function generatePerformanceFeedback(employeeId: string, startDate: Date, endDate: Date): PerformanceFeedback[] {
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
