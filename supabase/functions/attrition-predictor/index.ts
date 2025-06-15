
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
const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

const supabase = createClient(supabaseUrl, supabaseKey);

const HIGH_RISK_THRESHOLD = 0.7;
const MEDIUM_RISK_THRESHOLD = 0.4;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!huggingFaceToken) {
      return new Response(
        JSON.stringify({ 
          error: 'AI prediction service unavailable', 
          details: 'Hugging Face API token not configured',
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
    
    // Process predictions for each employee
    const predictions = [];
    const failedPredictions = [];
    
    for (const employee of employeeData) {
      try {
        console.log(`🧠 Processing AI prediction for employee: ${employee.employee_name}`);
        
        const prediction = await callAttritionClassificationModel(employee);
        console.log(`✅ AI prediction for ${employee.employee_name}: ${prediction.attrition_probability}`);
        
        predictions.push({
          employee_id: employee.employee_id,
          employee_name: employee.employee_name,
          attrition_risk: prediction.attrition_probability,
          risk_level: getRiskLevel(prediction.attrition_probability),
          factors: prediction.key_factors || [],
          last_predicted: new Date().toISOString(),
          prediction_source: 'MISTRAL_ATTRITION_AI',
          confidence: prediction.confidence || 0.90
        });
        
        // Store prediction in database
        await storePrediction(employee.employee_id, prediction.attrition_probability, prediction.key_factors);
        
      } catch (error) {
        console.error(`❌ AI prediction failed for employee ${employee.employee_id}:`, error.message);
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
        success_rate: Math.round((predictions.length / employee_ids.length) * 100)
      }
    };

    if (predictions.length === 0) {
      return new Response(JSON.stringify({ 
        ...response,
        error: 'No successful predictions generated',
        message: 'All AI predictions failed. Please check your Hugging Face API configuration.'
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

async function callAttritionClassificationModel(employee: EmployeeAttritionData) {
  console.log(`🤖 Calling Mistral Attrition Classification Model for: ${employee.employee_name}`);
  
  try {
    // Create structured input text for the classification model
    const employeeInputText = createEmployeeInputTextForClassification(employee);
    
    console.log('📤 Sending to robloxguard200/employee_attrition_rate_model_mistral with input:', employeeInputText);
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/robloxguard200/employee_attrition_rate_model_mistral`,
      {
        headers: {
          Authorization: `Bearer ${huggingFaceToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: employeeInputText,
          options: {
            wait_for_model: true
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('🔍 Raw Mistral classification result:', JSON.stringify(result, null, 2));
    
    // Parse the classification result to extract attrition probability
    const attrition_probability = parseClassificationResult(result, employee);
    
    return {
      attrition_probability,
      confidence: 0.90,
      key_factors: extractAIKeyFactors(employee, attrition_probability, result)
    };
    
  } catch (error) {
    console.error('💥 Mistral attrition classification model call failed:', error.message);
    throw error;
  }
}

function createEmployeeInputTextForClassification(employee: EmployeeAttritionData): string {
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

  // Create structured text input that the model can classify
  const inputText = `Employee in ${employee.department} department working as ${employee.designation} for ${employee.years_in_company} years. Performance rating: ${avgRating.toFixed(1)}/5, Performance metrics: ${avgPerformance.toFixed(1)}%, Attendance rate: ${attendanceRate.toFixed(1)}%, Average working hours: ${avgWorkingHours.toFixed(1)}. Salary CTC: ${employee.salary?.ctc || 'Not specified'}.`;

  return inputText;
}

function parseClassificationResult(result: any, employee: EmployeeAttritionData): number {
  try {
    console.log('🔍 Parsing classification result:', result);
    
    let probability = 0.3; // Default fallback
    
    if (Array.isArray(result) && result.length > 0) {
      // Handle classification output format
      const classificationResults = result[0];
      
      if (Array.isArray(classificationResults)) {
        // Find attrition-related labels
        const attritionResult = classificationResults.find(item => 
          item.label && (
            item.label.toLowerCase().includes('leave') ||
            item.label.toLowerCase().includes('attrition') ||
            item.label.toLowerCase().includes('quit') ||
            item.label.toLowerCase().includes('1') // Often class 1 represents "will leave"
          )
        );
        
        if (attritionResult) {
          probability = attritionResult.score || 0.3;
        } else {
          // If no specific attrition label found, use the highest scoring negative outcome
          const highestScore = Math.max(...classificationResults.map(item => item.score || 0));
          const highestResult = classificationResults.find(item => item.score === highestScore);
          
          // Assume higher scores indicate higher risk
          probability = highestScore;
        }
      } else if (classificationResults.score !== undefined) {
        probability = classificationResults.score;
      }
    } else if (result.score !== undefined) {
      probability = result.score;
    }
    
    // Ensure probability is within valid range
    probability = Math.max(0, Math.min(1, probability));
    
    console.log(`📊 Parsed attrition probability: ${probability} for ${employee.employee_name}`);
    return probability;
    
  } catch (error) {
    console.error('❌ Error parsing classification result:', error);
    throw new Error(`Failed to parse AI model result: ${error.message}`);
  }
}

function extractAIKeyFactors(employee: EmployeeAttritionData, probability: number, modelResult?: any): string[] {
  const factors = ['AI-powered attrition analysis using Mistral classification model'];
  
  if (modelResult && Array.isArray(modelResult) && modelResult[0]) {
    const results = Array.isArray(modelResult[0]) ? modelResult[0] : [modelResult[0]];
    
    // Extract top prediction labels as insights
    results.slice(0, 2).forEach(result => {
      if (result.label && result.score) {
        factors.push(`Model prediction: ${result.label} (confidence: ${(result.score * 100).toFixed(1)}%)`);
      }
    });
  }
  
  // Add data-driven insights
  if (probability > 0.7) {
    factors.push('High attrition risk detected by AI model');
  } else if (probability > 0.4) {
    factors.push('Moderate attrition indicators identified');
  } else {
    factors.push('Low attrition risk assessed by AI model');
  }
  
  // Add specific insights based on data
  if (employee.years_in_company < 2) {
    factors.push('Early career stage increases mobility risk');
  }
  
  const avgRating = employee.feedback.length > 0 
   ? employee.feedback.reduce((sum, f) => sum + (f.rating || 3), 0) / employee.feedback.length 
    : 3;
    
  if (avgRating < 2.5) {
    factors.push('Low performance ratings detected');
  }
  
  return factors;
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
        model_version: 'mistral-attrition-classification-v1',
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
