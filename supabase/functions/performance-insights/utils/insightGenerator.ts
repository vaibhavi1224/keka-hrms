
interface InsightContext {
  startDate: Date;
  endDate: Date;
  employeeId: string;
}

interface GeneratedInsight {
  type: string;
  title: string;
  summary: string;
  supportingData: any;
  confidence: number;
}

export function generateInsights(
  trendAnalysis: any,
  sentimentAnalysis: any,
  context: InsightContext
): GeneratedInsight[] {
  const insights: GeneratedInsight[] = [];

  // Attendance trend insights
  if (trendAnalysis.attendanceRate) {
    insights.push(...generateAttendanceInsights(trendAnalysis.attendanceRate));
  }

  // Performance metric insights
  Object.entries(trendAnalysis.performanceMetrics).forEach(([metric, data]: [string, any]) => {
    insights.push(...generateMetricInsights(metric, data));
  });

  // Consistency insights
  if (trendAnalysis.consistency) {
    insights.push(...generateConsistencyInsights(trendAnalysis.consistency));
  }

  // Feedback sentiment insights
  if (sentimentAnalysis.overallSentiment !== 'neutral') {
    insights.push(...generateSentimentInsights(sentimentAnalysis));
  }

  // Add context to all insights
  return insights.map(insight => ({
    ...insight,
    supportingData: {
      ...insight.supportingData,
      analysisContext: {
        periodStart: context.startDate.toISOString(),
        periodEnd: context.endDate.toISOString(),
        employeeId: context.employeeId
      }
    }
  }));
}

function generateAttendanceInsights(attendanceData: any): GeneratedInsight[] {
  const insights: GeneratedInsight[] = [];

  if (attendanceData.trend === 'improving' && attendanceData.change > 5) {
    insights.push({
      type: 'trend_analysis',
      title: 'Improving Attendance Trend',
      summary: `Attendance has improved by ${attendanceData.change}% over the past period, showing excellent commitment and reliability.`,
      supportingData: { attendanceData, improvementType: 'attendance' },
      confidence: 0.85
    });
  } else if (attendanceData.trend === 'declining' && attendanceData.change < -5) {
    insights.push({
      type: 'improvement_suggestion',
      title: 'Attendance Requires Attention',
      summary: `Attendance has declined by ${Math.abs(attendanceData.change)}% recently. Consider discussing any challenges and establishing support mechanisms.`,
      supportingData: { attendanceData, concernType: 'attendance' },
      confidence: 0.80
    });
  } else if (attendanceData.current >= 95) {
    insights.push({
      type: 'strength_highlight',
      title: 'Excellent Attendance Record',
      summary: `Maintains exceptional attendance rate of ${attendanceData.current}%, demonstrating strong commitment and reliability.`,
      supportingData: { attendanceData, strengthType: 'consistency' },
      confidence: 0.90
    });
  }

  return insights;
}

function generateMetricInsights(metricType: string, data: any): GeneratedInsight[] {
  const insights: GeneratedInsight[] = [];
  const metricName = formatMetricName(metricType);

  if (data.trend === 'improving' && data.change > 10) {
    insights.push({
      type: 'trend_analysis',
      title: `Strong Improvement in ${metricName}`,
      summary: `${metricName} has improved by ${data.change}% from ${data.previous} to ${data.current}, indicating positive development and growth.`,
      supportingData: { metricType, data, improvementType: 'performance' },
      confidence: 0.80
    });
  } else if (data.trend === 'declining' && data.change < -10) {
    insights.push({
      type: 'improvement_suggestion',
      title: `${metricName} Needs Focus`,
      summary: `${metricName} has decreased by ${Math.abs(data.change)}% from ${data.previous} to ${data.current}. Consider targeted development or support.`,
      supportingData: { metricType, data, concernType: 'performance' },
      confidence: 0.75
    });
  }

  return insights;
}

function generateConsistencyInsights(consistencyData: any): GeneratedInsight[] {
  const insights: GeneratedInsight[] = [];

  if (consistencyData.score >= 80) {
    insights.push({
      type: 'strength_highlight',
      title: 'Highly Consistent Performance',
      summary: `Demonstrates excellent consistency with a score of ${consistencyData.score}%. ${consistencyData.description}`,
      supportingData: { consistencyData, strengthType: 'consistency' },
      confidence: 0.85
    });
  } else if (consistencyData.score < 50) {
    insights.push({
      type: 'improvement_suggestion',
      title: 'Consistency Development Opportunity',
      summary: `Consistency score of ${consistencyData.score}% suggests room for improvement. ${consistencyData.description}`,
      supportingData: { consistencyData, concernType: 'consistency' },
      confidence: 0.70
    });
  }

  return insights;
}

function generateSentimentInsights(sentimentData: any): GeneratedInsight[] {
  const insights: GeneratedInsight[] = [];

  if (sentimentData.overallSentiment === 'positive' && sentimentData.averageRating > 4) {
    insights.push({
      type: 'strength_highlight',
      title: 'Positive Feedback and High Ratings',
      summary: `Receives consistently positive feedback with an average rating of ${sentimentData.averageRating}/5. Strengths include: ${sentimentData.strengths.slice(0, 3).join(', ')}.`,
      supportingData: { sentimentData, strengthType: 'feedback' },
      confidence: 0.85
    });
  } else if (sentimentData.overallSentiment === 'negative') {
    insights.push({
      type: 'improvement_suggestion',
      title: 'Feedback Indicates Development Areas',
      summary: `Recent feedback suggests areas for growth. Focus areas: ${sentimentData.improvements.slice(0, 3).join(', ')}.`,
      supportingData: { sentimentData, concernType: 'feedback' },
      confidence: 0.75
    });
  }

  if (sentimentData.keyThemes.length > 0) {
    insights.push({
      type: 'trend_analysis',
      title: 'Key Performance Themes',
      summary: `Feedback analysis reveals focus on: ${sentimentData.keyThemes.join(', ')}. These themes provide insight into current role focus and development areas.`,
      supportingData: { themes: sentimentData.keyThemes, analysisType: 'themes' },
      confidence: 0.70
    });
  }

  return insights;
}

function formatMetricName(metricType: string): string {
  return metricType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
