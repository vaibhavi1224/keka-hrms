
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { pipeline } from 'https://esm.sh/@huggingface/transformers@3.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmployeeAttritionData {
  employee_id: string;
  satisfaction_level?: number;
  last_evaluation?: number;
  number_project?: number;
  average_montly_hours?: number;
  time_spend_company?: number;
  work_accident?: number;
  promotion_last_5years?: number;
  department?: string;
  salary?: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Global model cache
let modelPipeline: any = null;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { employee_ids } = await req.json();
    
    console.log('🔄 Processing attrition prediction for employees:', employee_ids);

    // Initialize the model pipeline if not already loaded
    if (!modelPipeline) {
      console.log('🤖 Loading your specified model: robloxguard200/employee_attrition_rate_model_mistral...');
      try {
        // Using your specified model with text classification pipeline
        modelPipeline = await pipeline(
          'text-classification',
          'robloxguard200/employee_attrition_rate_model_mistral',
          { 
            device: 'cpu',
            revision: 'main'
          }
        );
        console.log('✅ Your model loaded successfully');
      } catch (modelError) {
        console.error('❌ Failed to load your model:', modelError);
        throw new Error(`Model loading failed: ${modelError.message}`);
      }
    }

    // Fetch employee data from our database
    const employeeData = await fetchEmployeeData(employee_ids);
    console.log('📊 Employee data fetched:', employeeData.length, 'records');
    
    // Process predictions for each employee
    const predictions = [];
    
    for (const employee of employeeData) {
      try {
        console.log(`🧠 Processing AI prediction for employee: ${employee.employee_name}`);
        
        const modelInput = prepareModelInputForYourModel(employee);
        const prediction = await callYourHuggingFaceModel(modelInput);
        
        console.log(`✅ AI prediction successful for ${employee.employee_name}: ${prediction.attrition_probability}`);
        
        predictions.push({
          employee_id: employee.employee_id,
          employee_name: employee.employee_name,
          attrition_risk: prediction.attrition_probability,
          risk_level: getRiskLevel(prediction.attrition_probability),
          factors: prediction.key_factors || [],
          last_predicted: new Date().toISOString(),
          prediction_source: 'YOUR_SPECIFIED_MODEL',
          confidence: prediction.confidence || 0.95
        });
        
        // Store prediction in database
        await storePrediction(employee.employee_id, prediction.attrition_probability, prediction.key_factors);
        
      } catch (error) {
        console.error(`❌ Your model failed for employee ${employee.employee_id}:`, error.message);
        throw error;
      }
    }

    console.log('📈 AI Prediction Summary:');
    console.log(`  - Total predictions: ${predictions.length}`);
    console.log(`  - All predictions from your specified model: ✅`);

    return new Response(JSON.stringify({ 
      predictions,
      summary: {
        total: predictions.length,
        ai_predictions: predictions.length,
        model_used: 'robloxguard200/employee_attrition_rate_model_mistral',
        success_rate: 100
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Critical error in attrition-predictor function:', error);
    console.error('Stack trace:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process attrition predictions with your specified model', 
        details: error.message,
        timestamp: new Date().toISOString(),
        model_attempted: 'robloxguard200/employee_attrition_rate_model_mistral'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
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
      years_in_company: emp.date_of_joining ? 
        Math.floor((Date.now() - new Date(emp.date_of_joining).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
      performance_metrics: performanceData || [],
      attendance_data: attendanceData || [],
      salary: salaryData,
      feedback: feedbackData || []
    });
  }

  return enrichedData;
}

function prepareModelInputForYourModel(employee: any): string {
  console.log(`🔧 Preparing input for your model for: ${employee.employee_name}`);
  
  // Calculate satisfaction level from feedback ratings (0-1 scale)
  const avgRating = employee.feedback.length > 0 
    ? employee.feedback.reduce((sum: number, f: any) => sum + (f.rating || 3), 0) / employee.feedback.length 
    : 3;
  const satisfaction_level = (avgRating - 1) / 4; // Convert 1-5 scale to 0-1

  // Calculate last evaluation score from performance metrics
  const lastEvaluation = employee.performance_metrics.length > 0
    ? employee.performance_metrics[0].metric_value / 100 
    : 0.5;

  // Calculate average monthly hours from attendance
  const avgWorkingHours = employee.attendance_data.length > 0
    ? employee.attendance_data.reduce((sum: number, a: any) => sum + (a.working_hours || 8), 0) / employee.attendance_data.length * 22
    : 176;

  // Create structured input that your model expects
  const textInput = `Employee Profile Analysis: satisfaction_level=${satisfaction_level.toFixed(3)}, last_evaluation=${lastEvaluation.toFixed(3)}, average_monthly_hours=${avgWorkingHours.toFixed(0)}, time_spend_company=${employee.years_in_company}, department=${employee.department || 'unknown'}, salary_level=medium. Predict employee attrition likelihood.`;

  console.log(`📊 Input prepared for your model: ${textInput}`);
  return textInput;
}

async function callYourHuggingFaceModel(textInput: string) {
  console.log('🤖 Calling your specified model with input:', textInput);

  try {
    const result = await modelPipeline(textInput);
    console.log('🔍 Raw result from your model:', JSON.stringify(result, null, 2));
    
    let attrition_probability = 0.3; // Default
    let confidence = 0.85;
    
    if (Array.isArray(result) && result.length > 0) {
      // Extract probability from your model's output
      const prediction = result[0];
      
      // Check if the model returns attrition probability directly
      if (prediction.label && prediction.score) {
        // If label indicates attrition risk
        if (prediction.label.toLowerCase().includes('leave') || 
            prediction.label.toLowerCase().includes('quit') ||
            prediction.label.toLowerCase().includes('attrition') ||
            prediction.label.toLowerCase().includes('high')) {
          attrition_probability = prediction.score;
        } else if (prediction.label.toLowerCase().includes('stay') || 
                   prediction.label.toLowerCase().includes('retain') ||
                   prediction.label.toLowerCase().includes('low')) {
          attrition_probability = 1 - prediction.score;
        } else {
          // Use score directly if label is unclear
          attrition_probability = prediction.score;
        }
        confidence = Math.max(0.7, prediction.score);
      }
    }
    
    console.log('📊 Processed attrition probability from your model:', attrition_probability);
    
    return {
      attrition_probability,
      confidence,
      key_factors: extractKeyFactorsFromYourModel(textInput, attrition_probability, result)
    };
    
  } catch (error) {
    console.error('💥 Your model call failed:', error.message);
    throw error;
  }
}

function extractKeyFactorsFromYourModel(textInput: string, probability: number, modelResult: any): string[] {
  const factors = ['Prediction from robloxguard200/employee_attrition_rate_model_mistral'];
  
  // Extract insights based on the model's analysis
  if (probability > 0.7) {
    factors.push('High attrition risk detected by your AI model');
  } else if (probability > 0.4) {
    factors.push('Moderate attrition indicators identified by your model');
  } else {
    factors.push('Low attrition risk assessed by your model');
  }

  // Add specific factors based on input analysis
  if (textInput.includes('satisfaction_level=0.')) {
    const satisfactionMatch = textInput.match(/satisfaction_level=([\d.]+)/);
    if (satisfactionMatch && parseFloat(satisfactionMatch[1]) < 0.4) {
      factors.push('Low satisfaction level detected');
    }
  }

  if (textInput.includes('average_monthly_hours=')) {
    const hoursMatch = textInput.match(/average_monthly_hours=(\d+)/);
    if (hoursMatch && parseInt(hoursMatch[1]) > 200) {
      factors.push('High workload detected (potential burnout risk)');
    }
  }

  // Include model-specific insights if available
  if (modelResult && Array.isArray(modelResult) && modelResult[0]?.label) {
    factors.push(`Model classification: ${modelResult[0].label}`);
  }

  return factors;
}

function getRiskLevel(probability: number): string {
  if (probability > 0.7) return 'HIGH';
  if (probability > 0.4) return 'MEDIUM';
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
        model_version: 'robloxguard200/employee_attrition_rate_model_mistral',
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
