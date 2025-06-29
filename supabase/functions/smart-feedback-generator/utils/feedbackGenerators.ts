
import { cleanMarkdownFormatting } from './textFormatter.ts';
import { calculateSuggestedRating } from './metricsCalculator.ts';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

export async function generateGeminiFeedback(employeeData: any, feedbackType: string) {
  const prompt = createHRDecisionPrompt(employeeData, feedbackType);
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an expert HR analytics consultant providing insights to HR professionals for strategic decision-making about employees. Your role is to analyze employee data and provide actionable recommendations for HR decisions including promotions, salary adjustments, training needs, retention strategies, and performance interventions.

IMPORTANT: 
- Provide ONLY plain text insights without any markdown formatting. Do not use asterisks (*), hashtags (#), or any other markdown symbols. Write in clear, professional prose.
- Always refer to the employee in third person (e.g., "This employee demonstrates...", "Their performance indicates...", "The employee's record shows...")
- You are speaking to HR about this employee, not to the employee directly

${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
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
  
  let feedback = `HR Decision Analysis for ${employee.first_name} ${employee.last_name}\n\n`;
  
  // Performance Assessment
  feedback += `PERFORMANCE OVERVIEW:\n`;
  if (metrics.avgPerformanceScore >= 4.5) {
    feedback += `• This employee is an exceptional performer (${metrics.avgPerformanceScore.toFixed(1)}/5) - Strong candidate for promotion and leadership roles.\n`;
  } else if (metrics.avgPerformanceScore >= 4.0) {
    feedback += `• This employee is a high performer (${metrics.avgPerformanceScore.toFixed(1)}/5) - Consider for advancement opportunities and increased responsibilities.\n`;
  } else if (metrics.avgPerformanceScore >= 3.5) {
    feedback += `• This employee is a solid performer (${metrics.avgPerformanceScore.toFixed(1)}/5) - Reliable contributor, consider skill development programs.\n`;
  } else if (metrics.avgPerformanceScore >= 3.0) {
    feedback += `• This employee is an average performer (${metrics.avgPerformanceScore.toFixed(1)}/5) - Requires performance improvement plan and closer monitoring.\n`;
  } else {
    feedback += `• This employee is underperforming (${metrics.avgPerformanceScore.toFixed(1)}/5) - Immediate intervention required, consider PIP or role reassignment.\n`;
  }

  // Attendance Analysis for HR
  feedback += `\nATTENDANCE & RELIABILITY:\n`;
  if (metrics.attendanceRate >= 95) {
    feedback += `• Excellent attendance record (${metrics.attendanceRate.toFixed(1)}%) - Highly reliable employee, low retention risk.\n`;
  } else if (metrics.attendanceRate >= 85) {
    feedback += `• Good attendance record (${metrics.attendanceRate.toFixed(1)}%) - Generally reliable, monitor for patterns.\n`;
  } else {
    feedback += `• Poor attendance record (${metrics.attendanceRate.toFixed(1)}%) - High retention risk, investigate underlying issues.\n`;
  }

  // HR Decision Recommendations
  feedback += `\nHR RECOMMENDATIONS:\n`;
  
  // Promotion Eligibility
  if (metrics.avgPerformanceScore >= 4.0 && metrics.attendanceRate >= 90) {
    feedback += `• PROMOTION: This employee is a strong candidate for next level position\n`;
  } else if (metrics.avgPerformanceScore >= 3.5) {
    feedback += `• DEVELOPMENT: Focus on skill enhancement before promotion consideration\n`;
  }

  // Salary Review
  if (metrics.avgPerformanceScore >= 4.0) {
    feedback += `• SALARY INCREASE: Recommend merit-based increment (8-15%) for this employee\n`;
  } else if (metrics.avgPerformanceScore >= 3.5) {
    feedback += `• SALARY REVIEW: Consider standard increment (3-8%) for this employee\n`;
  }

  // Retention Strategy
  if (metrics.avgPerformanceScore >= 4.0 && metrics.attendanceRate >= 95) {
    feedback += `• RETENTION: High-value employee, implement retention strategies\n`;
  } else if (metrics.avgPerformanceScore < 3.0 || metrics.attendanceRate < 80) {
    feedback += `• PERFORMANCE PLAN: Implement improvement plan with clear milestones\n`;
  }

  // Training Needs
  if (metrics.avgPerformanceScore < 3.5) {
    feedback += `• TRAINING: Identify specific skill gaps and provide targeted training for this employee\n`;
  }

  feedback += `\nRISK ASSESSMENT:\n`;
  const riskLevel = calculateRiskLevel(metrics);
  feedback += `• Employee Retention Risk: ${riskLevel}\n`;
  
  if (riskLevel === 'High') {
    feedback += `• Immediate action required to prevent this employee's attrition\n`;
  } else if (riskLevel === 'Medium') {
    feedback += `• Monitor this employee closely and address concerns proactively\n`;
  } else {
    feedback += `• Low risk employee, continue regular engagement practices\n`;
  }

  const suggestedRating = calculateSuggestedRating(employeeData);

  return {
    content: feedback,
    suggestedRating,
    source: 'rule_based',
    confidence: 0.8
  };
}

function calculateRiskLevel(metrics: any): string {
  if (metrics.avgPerformanceScore < 3.0 || metrics.attendanceRate < 80) {
    return 'High';
  } else if (metrics.avgPerformanceScore < 3.5 || metrics.attendanceRate < 90) {
    return 'Medium';
  } else {
    return 'Low';
  }
}

function createHRDecisionPrompt(employeeData: any, feedbackType: string): string {
  const employee = employeeData;
  const metrics = employeeData.calculatedMetrics;
  
  return `
EMPLOYEE PROFILE FOR HR DECISION-MAKING:
Name: ${employee.first_name} ${employee.last_name}
Position: ${employee.designation || 'N/A'}
Department: ${employee.department || 'N/A'}
Review Period: ${metrics.totalWorkingDays} working days analyzed

PERFORMANCE METRICS:
- Overall Performance Score: ${metrics.avgPerformanceScore.toFixed(1)}/5.0
- Attendance Rate: ${metrics.attendanceRate.toFixed(1)}%
- Work Consistency: ${metrics.workConsistency.toFixed(1)}%
- Total Performance Reviews: ${metrics.metricsCount}

RECENT PERFORMANCE TRENDS:
${employeeData.metrics.slice(0, 5).map((m: any) => `- ${m.metric_type}: ${m.metric_value}/100 (${m.measurement_date})`).join('\n')}

HISTORICAL FEEDBACK PATTERNS:
${employeeData.feedback.slice(0, 3).map((f: any) => `- ${f.feedback_type}: ${f.feedback_text.substring(0, 100)}...`).join('\n')}

Please provide comprehensive HR insights about this employee, covering:
1. PERFORMANCE ASSESSMENT: This employee's current standing and trajectory
2. PROMOTION READINESS: Evaluation of this employee for advancement opportunities
3. SALARY REVIEW RECOMMENDATION: Merit-based adjustment suggestions for this employee
4. RETENTION STRATEGY: Risk assessment and engagement recommendations for this employee
5. DEVELOPMENT NEEDS: This employee's skill gaps and training requirements
6. STRATEGIC DECISIONS: Long-term career path and organizational fit for this employee

Focus on actionable insights that help HR make informed decisions about this employee regarding:
- Career progression and role assignments
- Compensation adjustments and bonuses
- Training and development investments
- Retention and engagement strategies
- Performance improvement interventions
- Team restructuring considerations

Always refer to this person as "this employee" or "the employee" when providing recommendations. Provide specific, data-driven recommendations with rationale about this employee. Consider organizational impact and resource allocation in your suggestions about this employee.
  `;
}
