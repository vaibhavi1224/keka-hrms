
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { analyzePerformanceTrends } from './utils/trendAnalyzer.ts';
import { analyzeFeedbackSentiment } from './utils/feedbackAnalyzer.ts';
import { generateInsights } from './utils/insightGenerator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { employeeId, periodMonths = 6 } = await req.json();

    console.log(`Generating performance insights for employee: ${employeeId}`);

    // Get date range for analysis
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - periodMonths);

    // Fetch performance metrics and feedback data
    const [metricsResult, feedbackResult, attendanceResult] = await Promise.all([
      supabase
        .from('performance_metrics')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('measurement_date', startDate.toISOString().split('T')[0])
        .lte('measurement_date', endDate.toISOString().split('T')[0])
        .order('measurement_date'),
      
      supabase
        .from('performance_feedback')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('review_period_start', startDate.toISOString().split('T')[0])
        .lte('review_period_end', endDate.toISOString().split('T')[0]),
      
      supabase
        .from('attendance')
        .select('*')
        .eq('user_id', employeeId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
    ]);

    if (metricsResult.error) throw metricsResult.error;
    if (feedbackResult.error) throw feedbackResult.error;
    if (attendanceResult.error) throw attendanceResult.error;

    const metrics = metricsResult.data || [];
    const feedback = feedbackResult.data || [];
    const attendance = attendanceResult.data || [];

    // Analyze trends and generate insights
    const trendAnalysis = analyzePerformanceTrends(metrics, attendance);
    const sentimentAnalysis = analyzeFeedbackSentiment(feedback);
    const insights = generateInsights(trendAnalysis, sentimentAnalysis, {
      startDate,
      endDate,
      employeeId
    });

    // Store insights in database
    const insertPromises = insights.map(insight => 
      supabase
        .from('performance_insights')
        .insert({
          employee_id: employeeId,
          insight_type: insight.type,
          insight_title: insight.title,
          insight_summary: insight.summary,
          supporting_data: insight.supportingData,
          confidence_score: insight.confidence,
          period_start: startDate.toISOString().split('T')[0],
          period_end: endDate.toISOString().split('T')[0]
        })
    );

    await Promise.all(insertPromises);

    console.log(`Generated ${insights.length} insights for employee ${employeeId}`);

    return new Response(JSON.stringify({ 
      success: true,
      insights: insights.length,
      message: 'Performance insights generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating performance insights:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate performance insights',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
