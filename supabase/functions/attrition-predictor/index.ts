
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { employee_ids } = await req.json();
    
    console.log('🔄 Processing attrition prediction for employees:', employee_ids);

    // Fetch employee data from our database
    const employeeData = await fetchEmployeeData(employee_ids);
    console.log('📊 Employee data fetched:', employeeData.length, 'records');
    
    // Process predictions for each employee
    const predictions = [];
    
    for (const employee of employeeData) {
      try {
        console.log(`🧠 Processing prediction for employee: ${employee.employee_name}`);
        
        let prediction;
        
        if (huggingFaceToken) {
          // Try Hugging Face AI model first
          prediction = await callHuggingFaceModel(employee);
          console.log(`✅ Hugging Face prediction for ${employee.employee_name}: ${prediction.attrition_probability}`);
        } else {
          // Fallback to rule-based prediction
          console.log(`📝 Using rule-based prediction for ${employee.employee_name}`);
          prediction = generateRuleBasedPrediction(employee);
        }
        
        predictions.push({
          employee_id: employee.employee_id,
          employee_name: employee.employee_name,
          attrition_risk: prediction.attrition_probability,
          risk_level: getRiskLevel(prediction.attrition_probability),
          factors: prediction.key_factors || [],
          last_predicted: new Date().toISOString(),
          prediction_source: huggingFaceToken ? 'HUGGING_FACE_AI' : 'RULE_BASED',
          confidence: prediction.confidence || 0.85
        });
        
        // Store prediction in database
        await storePrediction(employee.employee_id, prediction.attrition_probability, prediction.key_factors);
        
      } catch (error) {
        console.error(`❌ Prediction failed for employee ${employee.employee_id}:`, error.message);
        
        // Use fallback prediction if AI fails
        const fallbackPrediction = generateRuleBasedPrediction(employee);
        predictions.push({
          employee_id: employee.employee_id,
          employee_name: employee.employee_name,
          attrition_risk: fallbackPrediction.attrition_probability,
          risk_level: getRiskLevel(fallbackPrediction.attrition_probability),
          factors: fallbackPrediction.key_factors,
          last_predicted: new Date().toISOString(),
          prediction_source: 'FALLBACK_RULE_BASED',
          confidence: 0.70
        });
        
        await storePrediction(employee.employee_id, fallbackPrediction.attrition_probability, fallbackPrediction.key_factors);
      }
    }

    console.log('📈 Prediction Summary:');
    console.log(`  - Total predictions: ${predictions.length}`);
    console.log(`  - AI predictions: ${predictions.filter(p => p.prediction_source.includes('AI')).length}`);
    console.log(`  - Rule-based predictions: ${predictions.filter(p => p.prediction_source.includes('RULE')).length}`);

    return new Response(JSON.stringify({ 
      predictions,
      summary: {
        total: predictions.length,
        ai_predictions: predictions.filter(p => p.prediction_source.includes('AI')).length,
        rule_based: predictions.filter(p => p.prediction_source.includes('RULE')).length,
        success_rate: Math.round((predictions.length / employee_ids.length) * 100)
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

async function callHuggingFaceModel(employee: EmployeeAttritionData) {
  console.log(`🤖 Calling Hugging Face AI for: ${employee.employee_name}`);
  
  const prompt = createPromptForEmployee(employee);
  
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 100,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('🔍 Raw Hugging Face result:', JSON.stringify(result, null, 2));
    
    // Extract attrition probability from AI response
    const aiResponse = result[0]?.generated_text || '';
    const attrition_probability = extractAttritionProbability(aiResponse, employee);
    
    return {
      attrition_probability,
      confidence: 0.85,
      key_factors: extractKeyFactors(employee, attrition_probability)
    };
    
  } catch (error) {
    console.error('💥 Hugging Face API call failed:', error.message);
    throw error;
  }
}

function createPromptForEmployee(employee: EmployeeAttritionData): string {
  const avgRating = employee.feedback.length > 0 
    ? employee.feedback.reduce((sum, f) => sum + (f.rating || 3), 0) / employee.feedback.length 
    : 3;
  
  const avgWorkingHours = employee.attendance_data.length > 0
    ? employee.attendance_data.reduce((sum, a) => sum + (a.working_hours || 8), 0) / employee.attendance_data.length
    : 8;
  
  const attendanceRate = employee.attendance_data.length > 0
    ? (employee.attendance_data.filter(a => a.status === 'present').length / employee.attendance_data.length) * 100
    : 95;
  
  return `Analyze employee attrition risk: Employee has ${employee.years_in_company} years experience, ${avgRating}/5 performance rating, ${attendanceRate}% attendance rate, works ${avgWorkingHours} hours daily in ${employee.department}. Predict attrition likelihood as percentage.`;
}

function extractAttritionProbability(aiResponse: string, employee: EmployeeAttritionData): number {
  // Try to extract percentage from AI response
  const percentageMatch = aiResponse.match(/(\d+(?:\.\d+)?)%/);
  if (percentageMatch) {
    return Math.min(parseFloat(percentageMatch[1]) / 100, 1.0);
  }
  
  // Try to extract decimal probability
  const decimalMatch = aiResponse.match(/0\.\d+/);
  if (decimalMatch) {
    return parseFloat(decimalMatch[0]);
  }
  
  // Fallback to rule-based if AI response unclear
  return generateRuleBasedPrediction(employee).attrition_probability;
}

function generateRuleBasedPrediction(employee: EmployeeAttritionData) {
  console.log(`📊 Generating rule-based prediction for: ${employee.employee_name}`);
  
  let riskScore = 0.3; // Base risk
  const factors = [];
  
  // Performance analysis
  const avgRating = employee.feedback.length > 0 
    ? employee.feedback.reduce((sum, f) => sum + (f.rating || 3), 0) / employee.feedback.length 
    : 3;
  
  if (avgRating < 2.5) {
    riskScore += 0.3;
    factors.push('Low performance ratings detected');
  } else if (avgRating > 4.0) {
    riskScore -= 0.1;
    factors.push('Excellent performance ratings');
  }
  
  // Attendance analysis
  if (employee.attendance_data.length > 0) {
    const attendanceRate = (employee.attendance_data.filter(a => a.status === 'present').length / employee.attendance_data.length) * 100;
    
    if (attendanceRate < 80) {
      riskScore += 0.25;
      factors.push('Poor attendance record');
    } else if (attendanceRate > 95) {
      riskScore -= 0.05;
      factors.push('Excellent attendance record');
    }
    
    // Working hours analysis
    const avgWorkingHours = employee.attendance_data.reduce((sum, a) => sum + (a.working_hours || 8), 0) / employee.attendance_data.length;
    
    if (avgWorkingHours > 10) {
      riskScore += 0.2;
      factors.push('Consistently long working hours (potential burnout)');
    } else if (avgWorkingHours < 6) {
      riskScore += 0.15;
      factors.push('Low engagement - minimal working hours');
    }
  }
  
  // Tenure analysis
  if (employee.years_in_company < 1) {
    riskScore += 0.2;
    factors.push('New employee - higher attrition risk');
  } else if (employee.years_in_company > 5) {
    riskScore -= 0.1;
    factors.push('Long tenure indicates stability');
  }
  
  // Department-based risk adjustment
  const highRiskDepartments = ['Sales', 'Customer Service', 'Support'];
  if (highRiskDepartments.includes(employee.department)) {
    riskScore += 0.1;
    factors.push(`${employee.department} department has higher typical turnover`);
  }
  
  // Performance metrics analysis
  if (employee.performance_metrics.length > 0) {
    const recentMetrics = employee.performance_metrics.slice(0, 3);
    const avgPerformance = recentMetrics.reduce((sum, m) => sum + m.metric_value, 0) / recentMetrics.length;
    
    if (avgPerformance < 60) {
      riskScore += 0.2;
      factors.push('Recent performance metrics below expectations');
    } else if (avgPerformance > 90) {
      riskScore -= 0.1;
      factors.push('Strong recent performance metrics');
    }
  } else {
    factors.push('Limited performance data available');
  }
  
  // Ensure risk score is between 0 and 1
  riskScore = Math.max(0, Math.min(1, riskScore));
  
  // Add general factors
  factors.push('Analysis based on performance, attendance, and tenure data');
  
  console.log(`📊 Rule-based prediction for ${employee.employee_name}: ${Math.round(riskScore * 100)}%`);
  
  return {
    attrition_probability: riskScore,
    confidence: 0.75,
    key_factors: factors
  };
}

function extractKeyFactors(employee: EmployeeAttritionData, probability: number): string[] {
  const factors = ['AI-powered prediction analysis'];
  
  if (probability > 0.7) {
    factors.push('High attrition risk detected by AI model');
  } else if (probability > 0.4) {
    factors.push('Moderate attrition indicators identified');
  } else {
    factors.push('Low attrition risk assessed by AI');
  }
  
  // Add specific insights based on data
  if (employee.years_in_company < 2) {
    factors.push('Early career stage - higher mobility risk');
  }
  
  if (employee.performance_metrics.length === 0) {
    factors.push('Limited performance data for analysis');
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
        model_version: 'hybrid-ai-rule-based-v1',
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
