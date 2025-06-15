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
      console.log('🤖 Loading Hugging Face transformers model...');
      try {
        modelPipeline = await pipeline(
          'text-classification',
          'robloxguard200/employee_attrition_rate_model_mistral'
        );
        console.log('✅ Model loaded successfully');
      } catch (modelError) {
        console.error('❌ Failed to load transformers model:', modelError);
        console.log('🔄 Falling back to business logic for all predictions');
        modelPipeline = null;
      }
    }

    // Fetch employee data from our database
    const employeeData = await fetchEmployeeData(employee_ids);
    console.log('📊 Employee data fetched:', employeeData.length, 'records');
    
    // Process predictions for each employee
    const predictions = [];
    let transformersSuccessCount = 0;
    let fallbackCount = 0;
    
    for (const employee of employeeData) {
      try {
        console.log(`🧠 Attempting transformers prediction for employee: ${employee.employee_name}`);
        
        if (modelPipeline) {
          const modelInput = prepareModelInputForTransformers(employee);
          const prediction = await callTransformersModel(modelInput);
          
          console.log(`✅ Transformers prediction successful for ${employee.employee_name}: ${prediction.attrition_probability}`);
          transformersSuccessCount++;
          
          predictions.push({
            employee_id: employee.employee_id,
            employee_name: employee.employee_name,
            attrition_risk: prediction.attrition_probability,
            risk_level: getRiskLevel(prediction.attrition_probability),
            factors: prediction.key_factors || [],
            last_predicted: new Date().toISOString(),
            prediction_source: 'TRANSFORMERS_JS'
          });
          
          // Store prediction in database
          await storePrediction(employee.employee_id, prediction.attrition_probability, prediction.key_factors);
        } else {
          throw new Error('Model not available');
        }
        
      } catch (error) {
        console.error(`❌ Transformers model failed for employee ${employee.employee_id}:`, error.message);
        console.log(`🔄 Using fallback prediction for ${employee.employee_name}`);
        
        // Fallback: generate prediction based on available data
        const fallbackPrediction = generateFallbackPrediction(employee);
        fallbackCount++;
        
        predictions.push({
          employee_id: employee.employee_id,
          employee_name: employee.employee_name,
          attrition_risk: fallbackPrediction.attrition_probability,
          risk_level: getRiskLevel(fallbackPrediction.attrition_probability),
          factors: fallbackPrediction.key_factors || [],
          last_predicted: new Date().toISOString(),
          prediction_source: 'FALLBACK_ALGORITHM',
          note: 'Generated using business logic (Transformers model unavailable)'
        });
        
        // Store fallback prediction
        await storePrediction(employee.employee_id, fallbackPrediction.attrition_probability, fallbackPrediction.key_factors);
      }
    }

    console.log('📈 Prediction Summary:');
    console.log(`  - Total predictions: ${predictions.length}`);
    console.log(`  - Transformers successes: ${transformersSuccessCount}`);
    console.log(`  - Fallback predictions: ${fallbackCount}`);
    console.log(`  - Transformers success rate: ${transformersSuccessCount > 0 ? Math.round((transformersSuccessCount / predictions.length) * 100) : 0}%`);

    return new Response(JSON.stringify({ 
      predictions,
      summary: {
        total: predictions.length,
        transformers_successes: transformersSuccessCount,
        fallback_used: fallbackCount,
        transformers_success_rate: transformersSuccessCount > 0 ? Math.round((transformersSuccessCount / predictions.length) * 100) : 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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

    console.log(`📊 Data summary for ${emp.first_name}:`, {
      performance: performanceData?.length || 0,
      attendance: attendanceData?.length || 0,
      salary: salaryData ? 'available' : 'missing',
      feedback: feedbackData?.length || 0
    });

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

function prepareModelInputForTransformers(employee: any): string {
  console.log(`🔧 Preparing transformers input for: ${employee.employee_name}`);
  
  // Calculate satisfaction level from feedback ratings (0-1 scale)
  const avgRating = employee.feedback.length > 0 
    ? employee.feedback.reduce((sum: number, f: any) => sum + (f.rating || 3), 0) / employee.feedback.length 
    : 3;
  const satisfaction_level = (avgRating - 1) / 4; // Convert 1-5 scale to 0-1

  // Calculate last evaluation score from performance metrics
  const lastEvaluation = employee.performance_metrics.length > 0
    ? employee.performance_metrics[0].metric_value / 100 // Assume metrics are 0-100, convert to 0-1
    : 0.5;

  // Calculate average monthly hours from attendance
  const avgWorkingHours = employee.attendance_data.length > 0
    ? employee.attendance_data.reduce((sum: number, a: any) => sum + (a.working_hours || 8), 0) / employee.attendance_data.length * 22 // Convert daily to monthly
    : 176; // Default 8 hours * 22 working days

  // Create a structured text input for the model
  const textInput = `Employee profile: satisfaction_level=${satisfaction_level.toFixed(3)}, last_evaluation=${lastEvaluation.toFixed(3)}, number_project=${Math.min(7, Math.max(1, employee.performance_metrics.length || 2))}, average_monthly_hours=${Math.max(80, Math.min(310, avgWorkingHours))}, time_spend_company=${Math.max(1, Math.min(10, employee.years_in_company))}, department=${employee.department?.toLowerCase() || 'other'}, salary=${getSalaryLevel(employee.salary?.ctc || 600000)}`;

  console.log(`📊 Transformers input prepared: ${textInput}`);
  return textInput;
}

async function callTransformersModel(textInput: string) {
  console.log('🤖 Calling transformers model with input:', textInput);

  try {
    const result = await modelPipeline(textInput);
    console.log('🔍 Raw transformers result:', JSON.stringify(result, null, 2));
    
    // Process the result based on model output format
    let attrition_probability = 0.3; // Default fallback
    
    if (Array.isArray(result) && result.length > 0) {
      // Check for attrition-related labels
      const attritionResult = result.find(r => 
        r.label && (
          r.label.toLowerCase().includes('leave') || 
          r.label.toLowerCase().includes('quit') ||
          r.label.toLowerCase().includes('attrition') ||
          r.label.toLowerCase().includes('1') // Often models use 1 for positive class
        )
      );
      
      if (attritionResult) {
        attrition_probability = attritionResult.score;
      } else if (result[0] && typeof result[0].score === 'number') {
        // Use the first result if no specific attrition label found
        attrition_probability = result[0].score;
      }
    }
    
    // Ensure probability is in valid range
    attrition_probability = Math.max(0.1, Math.min(0.9, attrition_probability));
    
    console.log('📊 Processed attrition probability:', attrition_probability);
    
    return {
      attrition_probability,
      key_factors: extractKeyFactorsFromInput(textInput, attrition_probability)
    };
    
  } catch (error) {
    console.error('💥 Transformers model call failed:', error.message);
    throw error;
  }
}

function extractKeyFactorsFromInput(textInput: string, probability: number): string[] {
  const factors = [];
  
  // Extract values from the text input
  const satisfactionMatch = textInput.match(/satisfaction_level=([\d.]+)/);
  const evaluationMatch = textInput.match(/last_evaluation=([\d.]+)/);
  const hoursMatch = textInput.match(/average_monthly_hours=([\d.]+)/);
  const tenureMatch = textInput.match(/time_spend_company=([\d.]+)/);
  const salaryMatch = textInput.match(/salary=(\w+)/);
  
  if (satisfactionMatch && parseFloat(satisfactionMatch[1]) < 0.4) {
    factors.push('Low satisfaction level detected');
  }
  if (evaluationMatch && parseFloat(evaluationMatch[1]) < 0.5) {
    factors.push('Below average performance evaluation');
  }
  if (hoursMatch && parseFloat(hoursMatch[1]) > 250) {
    factors.push('Excessive working hours (potential burnout)');
  }
  if (tenureMatch) {
    const tenure = parseFloat(tenureMatch[1]);
    if (tenure < 2) {
      factors.push('Short tenure with company');
    } else if (tenure > 8) {
      factors.push('Long tenure (may seek new challenges)');
    }
  }
  if (salaryMatch && salaryMatch[1] === 'low') {
    factors.push('Below market salary range');
  }
  
  // Add prediction confidence factors
  if (probability > 0.7) {
    factors.push('High attrition probability detected by AI model');
  } else if (probability > 0.4) {
    factors.push('Moderate attrition risk identified');
  } else {
    factors.push('Low attrition risk with stable indicators');
  }
  
  return factors.length > 0 ? factors : ['AI model analysis completed'];
}

function generateFallbackPrediction(employee: any) {
  console.log(`🔄 Generating fallback prediction for: ${employee.employee_name}`);
  
  const inputData = prepareModelInput(employee);
  const probability = generateBusinessLogicPrediction(inputData);
  
  console.log(`📊 Fallback prediction: ${probability} for ${employee.employee_name}`);
  
  return {
    attrition_probability: probability,
    key_factors: extractKeyFactors(inputData, probability)
  };
}

function prepareModelInput(employee: any): EmployeeAttritionData {
  console.log(`🔧 Preparing model input for: ${employee.employee_name}`);
  
  // Calculate satisfaction level from feedback ratings (0-1 scale)
  const avgRating = employee.feedback.length > 0 
    ? employee.feedback.reduce((sum: number, f: any) => sum + (f.rating || 3), 0) / employee.feedback.length 
    : 3;
  const satisfaction_level = (avgRating - 1) / 4; // Convert 1-5 scale to 0-1

  // Calculate last evaluation score from performance metrics
  const lastEvaluation = employee.performance_metrics.length > 0
    ? employee.performance_metrics[0].metric_value / 100 // Assume metrics are 0-100, convert to 0-1
    : 0.5;

  // Calculate average monthly hours from attendance
  const avgWorkingHours = employee.attendance_data.length > 0
    ? employee.attendance_data.reduce((sum: number, a: any) => sum + (a.working_hours || 8), 0) / employee.attendance_data.length * 22 // Convert daily to monthly
    : 176; // Default 8 hours * 22 working days

  const modelInput = {
    employee_id: employee.employee_id,
    satisfaction_level: Math.max(0, Math.min(1, satisfaction_level)),
    last_evaluation: Math.max(0, Math.min(1, lastEvaluation)),
    number_project: Math.min(7, Math.max(1, employee.performance_metrics.length || 2)),
    average_montly_hours: Math.max(80, Math.min(310, avgWorkingHours)),
    time_spend_company: Math.max(1, Math.min(10, employee.years_in_company)),
    work_accident: 0,
    promotion_last_5years: 0,
    department: employee.department?.toLowerCase() || 'other',
    salary: getSalaryLevel(employee.salary?.ctc || 600000)
  };

  console.log(`📊 Model input prepared:`, {
    satisfaction: modelInput.satisfaction_level,
    evaluation: modelInput.last_evaluation,
    projects: modelInput.number_project,
    hours: modelInput.average_montly_hours,
    tenure: modelInput.time_spend_company
  });

  return modelInput;
}

function generateBusinessLogicPrediction(input: EmployeeAttritionData): number {
  let risk_score = 0.3; // Base risk

  // Satisfaction impact (most important factor)
  if (input.satisfaction_level < 0.3) risk_score += 0.25;
  else if (input.satisfaction_level < 0.5) risk_score += 0.15;
  else if (input.satisfaction_level > 0.8) risk_score -= 0.1;

  // Performance impact
  if (input.last_evaluation < 0.4) risk_score += 0.15;
  else if (input.last_evaluation > 0.8) risk_score -= 0.05;

  // Workload impact
  if (input.average_montly_hours > 250) risk_score += 0.15;
  else if (input.average_montly_hours < 120) risk_score += 0.1;

  // Tenure impact (U-shaped curve)
  if (input.time_spend_company < 1) risk_score += 0.2;
  else if (input.time_spend_company > 8) risk_score += 0.1;
  else if (input.time_spend_company >= 2 && input.time_spend_company <= 5) risk_score -= 0.05;

  // Project load impact
  if (input.number_project > 5) risk_score += 0.1;
  else if (input.number_project < 2) risk_score += 0.05;

  return Math.max(0.1, Math.min(0.9, risk_score));
}

function extractKeyFactors(input: EmployeeAttritionData, probability: number): string[] {
  const factors = [];
  
  if (input.satisfaction_level && input.satisfaction_level < 0.4) {
    factors.push('Low satisfaction level detected');
  }
  if (input.last_evaluation && input.last_evaluation < 0.5) {
    factors.push('Below average performance evaluation');
  }
  if (input.average_montly_hours && input.average_montly_hours > 250) {
    factors.push('Excessive working hours (potential burnout)');
  }
  if (input.time_spend_company && input.time_spend_company < 2) {
    factors.push('Short tenure with company');
  }
  if (input.time_spend_company && input.time_spend_company > 8) {
    factors.push('Long tenure (may seek new challenges)');
  }
  if (input.salary === 'low') {
    factors.push('Below market salary range');
  }
  if (input.number_project && input.number_project > 5) {
    factors.push('High project workload');
  }
  
  // Add prediction confidence factors
  if (probability > 0.7) {
    factors.push('Multiple high-risk indicators present');
  } else if (probability > 0.4) {
    factors.push('Moderate risk factors detected');
  } else {
    factors.push('Low risk profile with stable indicators');
  }
  
  return factors.length > 0 ? factors : ['Standard risk assessment completed'];
}

function getSalaryLevel(ctc: number): string {
  if (ctc < 500000) return 'low';
  if (ctc < 1500000) return 'medium';
  return 'high';
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
        model_version: 'transformers_js_v1.0',
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
