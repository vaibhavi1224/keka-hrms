
import { cleanMarkdownFormatting } from './textFormatter.ts';
import { calculateSuggestedRating } from './metricsCalculator.ts';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

export async function generateGeminiFeedback(employeeData: any, feedbackType: string) {
  const prompt = createFeedbackPrompt(employeeData, feedbackType);
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an expert HR professional specializing in performance reviews. Generate constructive, specific, and actionable feedback based on employee performance data. Be professional, balanced, and focus on both strengths and areas for improvement.

IMPORTANT: Provide ONLY plain text feedback without any markdown formatting. Do not use asterisks (*), hashtags (#), or any other markdown symbols. Write in clear, professional prose.

${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Gemini API error:', errorData);
    throw new Error(`Gemini API error: ${response.status} ${errorData}`);
  }

  const data = await response.json();
  let content = data.candidates[0].content.parts[0].text;
  
  // Clean up any markdown formatting that might still appear
  content = cleanMarkdownFormatting(content);
  
  // Extract suggested rating from content or calculate based on data
  const suggestedRating = calculateSuggestedRating(employeeData);

  return {
    content: content.trim(),
    suggestedRating,
    source: 'gemini',
    confidence: 0.9
  };
}

export async function generateRuleBasedFeedback(employeeData: any, feedbackType: string) {
  const metrics = employeeData.calculatedMetrics;
  const employee = employeeData;
  
  let feedback = `Performance Review for ${employee.first_name} ${employee.last_name}\n\n`;
  
  // Attendance Analysis
  if (metrics.attendanceRate >= 95) {
    feedback += `• Excellent attendance record (${metrics.attendanceRate.toFixed(1)}%) demonstrates strong commitment and reliability.\n`;
  } else if (metrics.attendanceRate >= 85) {
    feedback += `• Good attendance record (${metrics.attendanceRate.toFixed(1)}%) with room for slight improvement.\n`;
  } else {
    feedback += `• Attendance needs attention (${metrics.attendanceRate.toFixed(1)}%). Consider discussing any challenges.\n`;
  }

  // Performance Metrics Analysis
  if (metrics.avgPerformanceScore >= 4.0) {
    feedback += `• Outstanding performance with an average score of ${metrics.avgPerformanceScore.toFixed(1)}/5. Consistently exceeds expectations.\n`;
  } else if (metrics.avgPerformanceScore >= 3.5) {
    feedback += `• Strong performance with an average score of ${metrics.avgPerformanceScore.toFixed(1)}/5. Meets expectations effectively.\n`;
  } else if (metrics.avgPerformanceScore >= 3.0) {
    feedback += `• Satisfactory performance (${metrics.avgPerformanceScore.toFixed(1)}/5) with opportunities for growth.\n`;
  } else {
    feedback += `• Performance requires improvement (${metrics.avgPerformanceScore.toFixed(1)}/5). Suggest focused development plan.\n`;
  }

  // Work Consistency
  if (metrics.workConsistency >= 80) {
    feedback += `• Demonstrates excellent work consistency and reliability in daily performance.\n`;
  } else if (metrics.workConsistency >= 60) {
    feedback += `• Shows good work consistency with occasional variations.\n`;
  } else {
    feedback += `• Work consistency could be improved. Consider establishing better routines.\n`;
  }

  // Department and Role Context
  feedback += `\nRole-Specific Observations:\n`;
  feedback += `• As a ${employee.designation || 'team member'} in ${employee.department || 'the department'}, `;
  
  if (metrics.avgPerformanceScore >= 4.0) {
    feedback += `demonstrates exceptional contribution to team goals and objectives.\n`;
  } else {
    feedback += `shows potential for increased contribution to team success.\n`;
  }

  // Recommendations
  feedback += `\nRecommendations for Next Period:\n`;
  if (metrics.attendanceRate < 90) {
    feedback += `• Focus on improving attendance consistency\n`;
  }
  if (metrics.avgPerformanceScore < 4.0) {
    feedback += `• Identify specific skill development opportunities\n`;
  }
  feedback += `• Continue building on existing strengths\n`;
  feedback += `• Set clear, measurable goals for the upcoming review period\n`;

  const suggestedRating = calculateSuggestedRating(employeeData);

  return {
    content: feedback,
    suggestedRating,
    source: 'rule_based',
    confidence: 0.8
  };
}

function createFeedbackPrompt(employeeData: any, feedbackType: string): string {
  const employee = employeeData;
  const metrics = employeeData.calculatedMetrics;
  
  return `
Generate a professional performance review feedback for:
Employee: ${employee.first_name} ${employee.last_name}
Position: ${employee.designation || 'N/A'} in ${employee.department || 'N/A'}
Department: ${employee.department || 'N/A'}

Performance Data:
- Attendance Rate: ${metrics.attendanceRate.toFixed(1)}%
- Average Performance Score: ${metrics.avgPerformanceScore.toFixed(1)}/5.0
- Work Consistency: ${metrics.workConsistency.toFixed(1)}%
- Total Working Days in Period: ${metrics.totalWorkingDays}
- Performance Metrics Recorded: ${metrics.metricsCount}

Recent Performance Metrics:
${employeeData.metrics.slice(0, 5).map((m: any) => `- ${m.metric_type}: ${m.metric_value} (${m.measurement_date})`).join('\n')}

Previous Feedback Themes:
${employeeData.feedback.slice(0, 3).map((f: any) => `- ${f.feedback_type}: ${f.feedback_text.substring(0, 100)}...`).join('\n')}

Please provide:
1. A balanced assessment of strengths and achievements
2. Specific areas for improvement with actionable suggestions
3. Recognition of consistent behaviors and contributions
4. Future development recommendations
5. Keep the tone professional, constructive, and motivating

Focus on ${feedbackType} feedback style. Limit to 400-500 words.
  `;
}
