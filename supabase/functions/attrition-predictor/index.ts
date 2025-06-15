
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmployeeAttritionData {
  employee_id: string;
  employee_name: string;
  department: string;
  designation: string;
  years_in_company: number;
  performance_metrics: any[];
  attendance_data: any[];
  salary: any;
  feedback: any[];
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

const HIGH_RISK_THRESHOLD = 0.7;
const MEDIUM_RISK_THRESHOLD = 0.4;

// Add delay between requests to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'AI prediction service unavailable', 
          details: 'Gemini API key not configured',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 503, 
          headers: {...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { employee_ids } = await req.json();
    
    console.log('🔄 Processing AI attrition prediction for employees:', employee_ids);

    // Fetch employee data from our database
    const employeeData = await fetchEmployeeData(employee_ids);
    console.log('📊 Employee data fetched:', employeeData.length, 'records');
    
    // Process predictions for each employee with rate limiting
    const predictions = [];
    const failedPredictions = [];
    
    for (let i = 0; i < employeeData.length; i++) {
      const employee = employeeData[i];
      
      try {
        console.log(`🧠 Processing AI prediction for employee: ${employee.employee_name} (${i + 1}/${employeeData.length})`);
        
        // Add delay between requests to avoid rate limiting
        if (i > 0) {
          await delay(1000); // 1 second delay between requests
        }
        
        const prediction = await callGeminiAttritionPredictor(employee);
        console.log(`✅ AI prediction for ${employee.employee_name}: ${prediction.attrition_probability}`);
        
        predictions.push({
          employee_id: employee.employee_id,
          employee_name: employee.employee_name,
          attrition_risk: prediction.attrition_probability,
          risk_level: getRiskLevel(prediction.attrition_probability),
          factors: prediction.key_factors || [],
          last_predicted: new Date().toISOString(),
          prediction_source: 'GEMINI_AI_ATTRITION',
          confidence: prediction.confidence || 0.85
        });
        
        // Store prediction in database
        await storePrediction(employee.employee_id, prediction.attrition_probability, prediction.key_factors);
        
      } catch (error) {
        console.error(`❌ AI prediction failed for employee ${employee.employee_id}:`, error.message);
        
        // If it's a rate limit error, add a longer delay and retry once
        if (error.message.includes('Too Many Requests') && i < employeeData.length - 1) {
          console.log('⏳ Rate limit detected, adding longer delay...');
          await delay(5000); // 5 second delay for rate limit recovery
        }
        
        failedPredictions.push({
          employee_id: employee.employee_id,
          employee_name: employee.employee_name,
          error: error.message
        });
      }
    }

    console.log('📈 Prediction Summary:');
    console.log(`  - Total successful AI predictions: ${predictions.length}`);
    console.log(`  - Failed predictions: ${failedPredictions.length}`);

    const response = {
      predictions,
      failed_predictions: failedPredictions,
      summary: {
        total_requested: employee_ids.length,
        successful: predictions.length,
        failed: failedPredictions.length,
        ai_predictions: predictions.length,
        success_rate: Math.round((predictions.length / employee_ids.length) * 100),
        risk_distribution: {
          high: predictions.filter(p => p.risk_level === 'HIGH').length,
          medium: predictions.filter(p => p.risk_level === 'MEDIUM').length,
          low: predictions.filter(p => p.risk_level === 'LOW').length
        }
      }
    };

    if (predictions.length === 0) {
      return new Response(JSON.stringify({ 
        ...response,
        error: 'No successful predictions generated',
        message: 'All AI predictions failed. Please check your Gemini API configuration or try again later due to rate limits.'
      }), {
        headers: {...corsHeaders, 'Content-Type': 'application/json' },
        status: 422
      });
    }

    return new Response(JSON.stringify(response), {
      headers: {...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Critical error in attrition-predictor function:', error);
    console.error('Stack trace:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process attrition predictions', 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: {...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function fetchEmployeeData(employee_ids: string[]) {
  console.log('📥 Fetching employee data for IDs:', employee_ids);
  
  const { data: employees, error } = await supabase
   .from('profiles')
   .select(`
      id,
      first_name,
      last_name,
      department,
      designation,
      date_of_joining,
      role,
      manager_id
    `)
   .in('id', employee_ids)
   .eq('is_active', true);

  if (error) {
    console.error('❌ Error fetching employees:', error);
    throw error;
  }

  console.log(`📋 Found ${employees?.length || 0} active employees`);

  // Fetch additional data for each employee
  const enrichedData = [];
  
  for (const emp of employees || []) {
    console.log(`🔍 Enriching data for: ${emp.first_name} ${emp.last_name}`);
    
    // Get performance metrics
    const { data: performanceData } = await supabase
     .from('performance_metrics')
     .select('metric_type, metric_value, measurement_date')
     .eq('employee_id', emp.id)
     .order('measurement_date', { ascending: false })
     .limit(10);

    // Get attendance data
    const { data: attendanceData } = await supabase
     .from('attendance')
     .select('status, working_hours, date')
     .eq('user_id', emp.id)
     .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
     .order('date', { ascending: false });

    // Get salary structure
    const { data: salaryData } = await supabase
     .from('salary_structures')
     .select('ctc, basic_salary')
     .eq('employee_id', emp.id)
     .eq('is_active', true)
     .single();

    // Get feedback/ratings
    const { data: feedbackData } = await supabase
     .from('performance_feedback')
     .select('rating, feedback_type, created_at')
     .eq('employee_id', emp.id)
     .order('created_at', { ascending: false })
     .limit(5);

    enrichedData.push({
      employee_id: emp.id,
      employee_name: `${emp.first_name} ${emp.last_name}`,
      department: emp.department,
      designation: emp.designation,
      years_in_company: emp.date_of_joining? 
        Math.floor((Date.now() - new Date(emp.date_of_joining).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
      performance_metrics: performanceData || [],
      attendance_data: attendanceData || [],
      salary: salaryData,
      feedback: feedbackData || []
    });
  }

  return enrichedData;
}

async function callGeminiAttritionPredictor(employee: EmployeeAttritionData) {
  console.log(`🤖 Calling Gemini AI for attrition prediction: ${employee.employee_name}`);
  
  try {
    // Create structured prompt for Gemini AI with balanced risk assessment
    const employeeAnalysisPrompt = createEmployeeAnalysisPrompt(employee);
    
    console.log('📤 Sending analysis request to Gemini AI');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: employeeAnalysisPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.4, // Slightly higher for more variation
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('🔍 Raw Gemini AI result received');
    
    // Parse the AI response to extract attrition probability and insights
    const analysis = parseGeminiResponse(result, employee);
    
    return {
      attrition_probability: analysis.probability,
      confidence: 0.85,
      key_factors: analysis.factors
    };
    
  } catch (error) {
    console.error('💥 Gemini AI attrition prediction failed:', error.message);
    throw error;
  }
}

function createEmployeeAnalysisPrompt(employee: EmployeeAttritionData): string {
  const avgRating = employee.feedback.length > 0 
   ? employee.feedback.reduce((sum, f) => sum + (f.rating || 3), 0) / employee.feedback.length 
    : 3;
  
  const avgWorkingHours = employee.attendance_data.length > 0
   ? employee.attendance_data.reduce((sum, a) => sum + (a.working_hours || 8), 0) / employee.attendance_data.length
    : 8;
  
  const attendanceRate = employee.attendance_data.length > 0
   ? (employee.attendance_data.filter(a => a.status === 'present').length / employee.attendance_data.length) * 100
    : 95;

  const avgPerformance = employee.performance_metrics.length > 0
   ? employee.performance_metrics.reduce((sum, m) => sum + m.metric_value, 0) / employee.performance_metrics.length
    : 75;

  return `You are an expert HR analytics AI specializing in employee attrition prediction. Analyze the following employee data and predict their likelihood of leaving the company. Be realistic and consider that many employees with good metrics should have LOW risk.

EMPLOYEE PROFILE:
- Name: ${employee.employee_name}
- Department: ${employee.department}
- Position: ${employee.designation}
- Years with company: ${employee.years_in_company}
- Current salary: ${employee.salary?.ctc || 'Not specified'}

PERFORMANCE DATA:
- Average performance rating: ${avgRating.toFixed(1)}/5
- Average performance metrics: ${avgPerformance.toFixed(1)}%
- Number of performance reviews: ${employee.feedback.length}

ATTENDANCE & ENGAGEMENT:
- Attendance rate: ${attendanceRate.toFixed(1)}%
- Average working hours: ${avgWorkingHours.toFixed(1)} hours/day
- Recent attendance records: ${employee.attendance_data.length}

ANALYSIS GUIDELINES:
- LOW RISK (0.0-0.4): Good performers with stable metrics, long tenure, good attendance
- MEDIUM RISK (0.4-0.7): Mixed indicators, some concerns but not critical
- HIGH RISK (0.7-1.0): Poor performance, low engagement, concerning patterns

Based on this data, provide your analysis in the following EXACT format:

ATTRITION_PROBABILITY: [number between 0.0 and 1.0]
RISK_FACTORS: [list of 3-5 specific factors that influence the prediction]
CONFIDENCE: [your confidence in this prediction as a percentage]

Example for a good performer:
ATTRITION_PROBABILITY: 0.25
RISK_FACTORS: Stable performance metrics, Good attendance record, Long tenure indicates loyalty, Above average engagement
CONFIDENCE: 88%

Example for a concerning case:
ATTRITION_PROBABILITY: 0.75
RISK_FACTORS: Below average performance ratings, Poor attendance pattern, Limited career progression, Work-life balance concerns
CONFIDENCE: 85%

Analyze the employee data and provide your prediction:`;
}

function parseGeminiResponse(result: any, employee: EmployeeAttritionData): { probability: number; factors: string[] } {
  try {
    console.log('🔍 Parsing Gemini AI response');
    
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract attrition probability
    const probabilityMatch = text.match(/ATTRITION_PROBABILITY:\s*([\d.]+)/i);
    let probability = probabilityMatch ? parseFloat(probabilityMatch[1]) : 0.3;
    
    // Ensure probability is within valid range
    probability = Math.max(0, Math.min(1, probability));
    
    // Extract risk factors
    const factorsMatch = text.match(/RISK_FACTORS:\s*([^\n]+)/i);
    let factors = ['AI-powered attrition analysis using Gemini AI'];
    
    if (factorsMatch) {
      const factorsText = factorsMatch[1];
      factors = factorsText.split(',').map(f => f.trim()).filter(f => f.length > 0);
    }
    
    // Add contextual insights based on employee data
    const additionalFactors = generateContextualFactors(employee, probability);
    factors = [...factors, ...additionalFactors];
    
    console.log(`📊 Parsed attrition probability: ${probability} for ${employee.employee_name}`);
    
    return { probability, factors };
    
  } catch (error) {
    console.error('❌ Error parsing Gemini response:', error);
    // Fallback analysis based on available data
    return generateFallbackAnalysis(employee);
  }
}

function generateContextualFactors(employee: EmployeeAttritionData, probability: number): string[] {
  const factors = [];
  
  if (probability > 0.7) {
    factors.push('High attrition risk identified by AI analysis');
  } else if (probability > 0.4) {
    factors.push('Moderate attrition indicators detected');
  } else {
    factors.push('Low attrition risk assessed by AI model');
  }
  
  // Add specific insights based on data
  if (employee.years_in_company < 2) {
    factors.push('Early tenure increases mobility risk');
  }
  
  const avgRating = employee.feedback.length > 0 
   ? employee.feedback.reduce((sum, f) => sum + (f.rating || 3), 0) / employee.feedback.length 
    : 3;
    
  if (avgRating < 2.5) {
    factors.push('Below-average performance ratings detected');
  }
  
  const attendanceRate = employee.attendance_data.length > 0
   ? (employee.attendance_data.filter(a => a.status === 'present').length / employee.attendance_data.length) * 100
    : 95;
    
  if (attendanceRate < 85) {
    factors.push('Low attendance rate indicates disengagement');
  }
  
  return factors;
}

function generateFallbackAnalysis(employee: EmployeeAttritionData): { probability: number; factors: string[] } {
  let probability = 0.3; // Base probability
  const factors = ['Fallback analysis - AI parsing failed'];
  
  // Simple heuristic-based calculation as fallback
  const avgRating = employee.feedback.length > 0 
   ? employee.feedback.reduce((sum, f) => sum + (f.rating || 3), 0) / employee.feedback.length 
    : 3;
  
  if (avgRating < 2.5) probability += 0.3;
  if (employee.years_in_company < 1) probability += 0.2;
  if (employee.years_in_company > 5) probability -= 0.1;
  
  probability = Math.max(0, Math.min(1, probability));
  
  return { probability, factors };
}

function getRiskLevel(probability: number): string {
  if (probability > HIGH_RISK_THRESHOLD) return 'HIGH';
  if (probability > MEDIUM_RISK_THRESHOLD) return 'MEDIUM';
  return 'LOW';
}

async function storePrediction(employeeId: string, attritionRisk: number, keyFactors?: string[]) {
  try {
    console.log(`💾 Storing prediction for employee: ${employeeId}`);
    
    const { error } = await supabase
     .from('attrition_predictions')
     .upsert({
        employee_id: employeeId,
        attrition_risk: attritionRisk,
        predicted_at: new Date().toISOString(),
        risk_level: getRiskLevel(attritionRisk),
        model_version: 'gemini-ai-attrition-v1',
        risk_factors: keyFactors || []
      });

    if (error) {
      console.error('❌ Error storing prediction:', error);
    } else {
      console.log(`✅ Prediction stored successfully for: ${employeeId}`);
    }
  } catch (error) {
    console.error('💥 Error in storePrediction:', error);
  }
}
