
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportType, employeeId, departmentId, startDate, endDate } = await req.json();
    
    console.log('📊 Generating smart report:', reportType);

    let reportData;
    
    if (reportType === 'employee_performance') {
      reportData = await generateEmployeePerformanceReport(employeeId, startDate, endDate);
    } else if (reportType === 'team_trends') {
      reportData = await generateTeamTrendsReport(departmentId, startDate, endDate);
    } else if (reportType === 'department_overview') {
      reportData = await generateDepartmentOverviewReport(departmentId, startDate, endDate);
    }

    const aiSummary = await generateAISummary(reportData, reportType);

    return new Response(JSON.stringify({
      success: true,
      report: {
        ...reportData,
        aiSummary,
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error generating smart report:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate smart report', 
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateEmployeePerformanceReport(employeeId: string, startDate: string, endDate: string) {
  // Get employee details
  const { data: employee } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', employeeId)
    .single();

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
    .lte('date', endDate);

  // Get feedback
  const { data: feedback } = await supabase
    .from('performance_feedback')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('review_period_start', startDate)
    .lte('review_period_end', endDate);

  // Calculate key metrics
  const avgPerformance = metrics?.reduce((sum, m) => sum + (m.metric_value / 20), 0) / (metrics?.length || 1);
  const attendanceRate = attendance?.filter(a => a.status === 'present').length / (attendance?.length || 1) * 100;

  return {
    type: 'employee_performance',
    employee,
    metrics: {
      totalMetrics: metrics?.length || 0,
      avgPerformance: avgPerformance || 0,
      attendanceRate: attendanceRate || 0,
      totalFeedback: feedback?.length || 0
    },
    details: {
      performanceMetrics: metrics?.slice(0, 5) || [],
      recentFeedback: feedback?.slice(0, 3) || [],
      attendanceTrend: attendance?.slice(-30) || []
    }
  };
}

async function generateTeamTrendsReport(departmentId: string, startDate: string, endDate: string) {
  // Get team members
  const { data: teamMembers } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, designation')
    .eq('department', departmentId)
    .eq('is_active', true);

  if (!teamMembers?.length) {
    throw new Error('No team members found');
  }

  const memberIds = teamMembers.map(m => m.id);

  // Get team performance metrics
  const { data: teamMetrics } = await supabase
    .from('performance_metrics')
    .select('*')
    .in('employee_id', memberIds)
    .gte('measurement_date', startDate)
    .lte('measurement_date', endDate);

  // Get team attendance
  const { data: teamAttendance } = await supabase
    .from('attendance')
    .select('*')
    .in('user_id', memberIds)
    .gte('date', startDate)
    .lte('date', endDate);

  // Calculate team trends
  const avgTeamPerformance = teamMetrics?.reduce((sum, m) => sum + (m.metric_value / 20), 0) / (teamMetrics?.length || 1);
  const teamAttendanceRate = teamAttendance?.filter(a => a.status === 'present').length / (teamAttendance?.length || 1) * 100;

  return {
    type: 'team_trends',
    department: departmentId,
    teamSize: teamMembers.length,
    metrics: {
      avgTeamPerformance: avgTeamPerformance || 0,
      teamAttendanceRate: teamAttendanceRate || 0,
      totalMetricsRecorded: teamMetrics?.length || 0
    },
    trends: {
      topPerformers: teamMembers.slice(0, 3),
      performanceTrend: 'stable',
      attendanceTrend: teamAttendanceRate > 90 ? 'excellent' : teamAttendanceRate > 75 ? 'good' : 'needs_improvement'
    }
  };
}

async function generateDepartmentOverviewReport(departmentId: string, startDate: string, endDate: string) {
  // Get department summary data
  const { data: deptEmployees } = await supabase
    .from('profiles')
    .select('*')
    .eq('department', departmentId)
    .eq('is_active', true);

  return {
    type: 'department_overview',
    department: departmentId,
    totalEmployees: deptEmployees?.length || 0,
    summary: 'Department overview generated'
  };
}

async function generateAISummary(reportData: any, reportType: string) {
  if (!geminiApiKey) {
    return generateRuleBasedSummary(reportData, reportType);
  }

  const prompt = createReportPrompt(reportData, reportType);
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
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
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('AI summary generation failed, using rule-based:', error);
    return generateRuleBasedSummary(reportData, reportType);
  }
}

function createReportPrompt(reportData: any, reportType: string) {
  if (reportType === 'employee_performance') {
    return `Generate a concise, professional natural language summary of this employee's performance report:

Employee: ${reportData.employee?.first_name} ${reportData.employee?.last_name}
Department: ${reportData.employee?.department}
Position: ${reportData.employee?.designation}

Performance Metrics:
- Average Performance Score: ${reportData.metrics.avgPerformance.toFixed(1)}/5.0
- Attendance Rate: ${reportData.metrics.attendanceRate.toFixed(1)}%
- Total Performance Records: ${reportData.metrics.totalMetrics}
- Feedback Entries: ${reportData.metrics.totalFeedback}

Provide a summary that highlights key strengths, areas for improvement, and overall assessment. Keep it professional and objective, suitable for HR review.`;
  }

  if (reportType === 'team_trends') {
    return `Generate a natural language summary of this team performance analysis:

Department: ${reportData.department}
Team Size: ${reportData.teamSize} employees

Team Metrics:
- Average Team Performance: ${reportData.metrics.avgTeamPerformance.toFixed(1)}/5.0
- Team Attendance Rate: ${reportData.metrics.teamAttendanceRate.toFixed(1)}%
- Performance Trend: ${reportData.trends.performanceTrend}
- Attendance Trend: ${reportData.trends.attendanceTrend}

Provide insights on team dynamics, overall performance trends, and recommendations for team development.`;
  }

  return `Generate a professional summary for this ${reportType} report with the provided data.`;
}

function generateRuleBasedSummary(reportData: any, reportType: string) {
  if (reportType === 'employee_performance') {
    const performance = reportData.metrics.avgPerformance;
    const attendance = reportData.metrics.attendanceRate;
    
    let summary = `Performance Summary for ${reportData.employee?.first_name} ${reportData.employee?.last_name}: `;
    
    if (performance >= 4.0 && attendance >= 90) {
      summary += "Excellent overall performance with strong attendance. This employee demonstrates consistent high-quality work and reliability.";
    } else if (performance >= 3.5 && attendance >= 80) {
      summary += "Good performance with satisfactory attendance. Shows steady contribution to team objectives.";
    } else {
      summary += "Performance indicates areas for improvement. Consider additional support and development opportunities.";
    }
    
    return summary;
  }

  if (reportType === 'team_trends') {
    const teamPerf = reportData.metrics.avgTeamPerformance;
    const teamAtt = reportData.metrics.teamAttendanceRate;
    
    return `Team Analysis for ${reportData.department}: The team of ${reportData.teamSize} members shows ${teamPerf >= 3.5 ? 'strong' : 'developing'} performance levels with ${teamAtt >= 85 ? 'excellent' : 'moderate'} attendance rates. ${teamPerf >= 3.5 ? 'Continue current momentum with recognition programs.' : 'Focus on performance improvement initiatives.'}`;
  }

  return "Report summary generated successfully.";
}
