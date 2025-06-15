
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { fetchEmployeePerformanceData } from './utils/employeeDataFetcher.ts';
import { generateGeminiFeedback, generateRuleBasedFeedback } from './utils/feedbackGenerators.ts';

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
    
    if (geminiApiKey) {
      console.log('🚀 Using Gemini AI for advanced feedback generation');
      generatedFeedback = await generateGeminiFeedback(employeeData, feedbackType);
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
