
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { employeeId, reviewPeriodStart, reviewPeriodEnd, feedbackType = 'comprehensive' } = await req.json();
    
    console.log('🤖 Generating smart feedback for employee:', employeeId);

    // Fetch comprehensive employee data
    const employeeData = await fetchEmployeePerformanceData(employeeId, reviewPeriodStart, reviewPeriodEnd);
    
    if (!employeeData) {
      throw new Error('Employee data not found');
    }

    console.log('📊 Employee data fetched successfully');

    // Generate AI-powered feedback
    let generatedFeedback;
    
    if (openaiApiKey) {
      console.log('🚀 Using OpenAI for advanced feedback generation');
      generatedFeedback = await generateAIFeedback(employeeData, feedbackType);
    } else {
      console.log('📝 Using rule-based feedback generation');
      generatedFeedback = await generateRuleBasedFeedback(employeeData, feedbackType);
    }

    // Store the generated feedback
    const { error: insertError } = await supabase
      .from('performance_feedback')
      .insert({
        employee_id: employeeId,
        feedback_type: 'ai_generated',
        feedback_text: generatedFeedback.content,
        rating: generatedFeedback.suggestedRating,
        review_period_start: reviewPeriodStart,
        review_period_end: reviewPeriodEnd,
        created_by: employeeData.manager_id || employeeId
      });

    if (insertError) {
      console.error('Error storing feedback:', insertError);
    }

    console.log('✅ Smart feedback generated successfully');

    return new Response(JSON.stringify({
      success: true,
      feedback: generatedFeedback,
      employeeName: `${employeeData.first_name} ${employeeData.last_name}`,
      reviewPeriod: `${reviewPeriodStart} to ${reviewPeriodEnd}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in smart-feedback-generator:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate smart feedback', 
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function fetchEmployeePerformanceData(employeeId: string, startDate: string, endDate: string) {
  console.log('📥 Fetching comprehensive employee data...');
  
  // Get employee basic info
  const { data: employee, error: empError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', employeeId)
    .single();

  if (empError || !employee) {
    throw new Error('Employee not found');
  }

  // Get performance metrics
  const { data: metrics } = await supabase
    .from('performance_metrics')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('measurement_date', startDate)
    .lte('measurement_date', endDate)
    .order('measurement_date', { ascending: false });

  // Get attendance data
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', employeeId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  // Get existing feedback
  const { data: feedback } = await supabase
    .from('performance_feedback')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('review_period_start', startDate)
    .lte('review_period_end', endDate)
    .order('created_at', { ascending: false });

  // Calculate key metrics
  const attendanceRate = calculateAttendanceRate(attendance || []);
  const avgPerformanceScore = calculateAveragePerformance(metrics || []);
  const workConsistency = calculateWorkConsistency(attendance || []);

  return {
    ...employee,
    metrics: metrics || [],
    attendance: attendance || [],
    feedback: feedback || [],
    calculatedMetrics: {
      attendanceRate,
      avgPerformanceScore,
      workConsistency,
      totalWorkingDays: attendance?.length || 0,
      metricsCount: metrics?.length || 0
    }
  };
}

async function generateAIFeedback(employeeData: any, feedbackType: string) {
  const prompt = createFeedbackPrompt(employeeData, feedbackType);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR professional specializing in performance reviews. Generate constructive, specific, and actionable feedback based on employee performance data. Be professional, balanced, and focus on both strengths and areas for improvement.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Extract suggested rating from content or calculate based on data
  const suggestedRating = calculateSuggestedRating(employeeData);

  return {
    content: content.trim(),
    suggestedRating,
    source: 'openai',
    confidence: 0.9
  };
}

async function generateRuleBasedFeedback(employeeData: any, feedbackType: string) {
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

function calculateAttendanceRate(attendance: any[]): number {
  if (attendance.length === 0) return 0;
  const presentDays = attendance.filter(a => a.status === 'present').length;
  return (presentDays / attendance.length) * 100;
}

function calculateAveragePerformance(metrics: any[]): number {
  if (metrics.length === 0) return 0;
  const total = metrics.reduce((sum, m) => sum + (m.metric_value / 20), 0); // Normalize to 5-point scale
  return total / metrics.length;
}

function calculateWorkConsistency(attendance: any[]): number {
  if (attendance.length === 0) return 0;
  const consistentDays = attendance.filter(a => 
    a.status === 'present' && a.working_hours >= 7
  ).length;
  return (consistentDays / attendance.length) * 100;
}

function calculateSuggestedRating(employeeData: any): number {
  const metrics = employeeData.calculatedMetrics;
  
  // Weighted calculation
  const attendanceWeight = 0.3;
  const performanceWeight = 0.5;
  const consistencyWeight = 0.2;
  
  const attendanceScore = (metrics.attendanceRate / 100) * 5;
  const performanceScore = metrics.avgPerformanceScore;
  const consistencyScore = (metrics.workConsistency / 100) * 5;
  
  const overallRating = (
    attendanceScore * attendanceWeight +
    performanceScore * performanceWeight +
    consistencyScore * consistencyWeight
  );
  
  return Math.min(5, Math.max(1, Math.round(overallRating * 10) / 10));
}
