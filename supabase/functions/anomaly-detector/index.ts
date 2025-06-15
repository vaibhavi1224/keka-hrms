
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { detectionType, employeeId, timeRange } = await req.json();
    
    console.log('🔍 Starting anomaly detection:', { detectionType, employeeId, timeRange });

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    let anomalies = [];
    
    if (detectionType === 'payroll' || detectionType === 'all') {
      const payrollAnomalies = await detectPayrollAnomalies(supabase, employeeId, timeRange);
      anomalies.push(...payrollAnomalies);
    }
    
    if (detectionType === 'attendance' || detectionType === 'all') {
      const attendanceAnomalies = await detectAttendanceAnomalies(supabase, employeeId, timeRange);
      anomalies.push(...attendanceAnomalies);
    }

    // Use AI to analyze and provide insights
    const aiInsights = await generateAIInsights(anomalies);

    return new Response(JSON.stringify({
      success: true,
      anomalies,
      insights: aiInsights,
      detectedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in anomaly detection:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function detectPayrollAnomalies(supabase: any, employeeId?: string, timeRange = 12) {
  console.log('💰 Detecting payroll anomalies...');
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - timeRange);
  
  let query = supabase
    .from('payrolls')
    .select(`
      *,
      profiles!payrolls_employee_id_fkey (
        first_name,
        last_name,
        employee_id
      )
    `)
    .gte('created_at', startDate.toISOString());
  
  if (employeeId) {
    query = query.eq('employee_id', employeeId);
  }
  
  const { data: payrollData, error } = await query.order('created_at', { ascending: true });
  
  if (error) throw error;
  
  const anomalies = [];
  
  // Group by employee
  const employeePayrolls = groupBy(payrollData || [], 'employee_id');
  
  for (const [empId, payrolls] of Object.entries(employeePayrolls)) {
    const sortedPayrolls = (payrolls as any[]).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Calculate statistical anomalies
    const netPayValues = sortedPayrolls.map(p => p.net_pay);
    const overtimeValues = sortedPayrolls.map(p => p.working_days > 22 ? p.working_days - 22 : 0);
    const deductionValues = sortedPayrolls.map(p => p.total_deductions);
    
    // Detect anomalies using Z-score method
    const netPayAnomalies = detectZScoreAnomalies(netPayValues, sortedPayrolls, 'net_pay');
    const overtimeAnomalies = detectZScoreAnomalies(overtimeValues, sortedPayrolls, 'overtime_days');
    const deductionAnomalies = detectZScoreAnomalies(deductionValues, sortedPayrolls, 'total_deductions');
    
    anomalies.push(...netPayAnomalies, ...overtimeAnomalies, ...deductionAnomalies);
  }
  
  return anomalies;
}

async function detectAttendanceAnomalies(supabase: any, employeeId?: string, timeRange = 90) {
  console.log('⏰ Detecting attendance anomalies...');
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRange);
  
  let query = supabase
    .from('attendance')
    .select(`
      *,
      profiles!attendance_user_id_fkey (
        first_name,
        last_name,
        employee_id
      )
    `)
    .gte('date', startDate.toISOString().split('T')[0]);
  
  if (employeeId) {
    query = query.eq('user_id', employeeId);
  }
  
  const { data: attendanceData, error } = await query.order('date', { ascending: true });
  
  if (error) throw error;
  
  const anomalies = [];
  
  // Group by employee
  const employeeAttendance = groupBy(attendanceData || [], 'user_id');
  
  for (const [empId, attendance] of Object.entries(employeeAttendance)) {
    const sortedAttendance = (attendance as any[]).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Calculate working hours anomalies
    const workingHours = sortedAttendance
      .filter(a => a.working_hours > 0)
      .map(a => a.working_hours);
    
    // Late arrivals pattern
    const lateArrivals = sortedAttendance.filter(a => a.status === 'late').length;
    const totalDays = sortedAttendance.length;
    const latePercentage = (lateArrivals / totalDays) * 100;
    
    // Detect working hours anomalies
    const hoursAnomalies = detectZScoreAnomalies(workingHours, sortedAttendance, 'working_hours');
    anomalies.push(...hoursAnomalies);
    
    // Detect excessive late arrivals
    if (latePercentage > 20) { // More than 20% late arrivals
      anomalies.push({
        type: 'attendance',
        subtype: 'excessive_late_arrivals',
        employee_id: empId,
        employee_name: sortedAttendance[0]?.profiles?.first_name + ' ' + sortedAttendance[0]?.profiles?.last_name,
        value: latePercentage,
        severity: latePercentage > 40 ? 'high' : 'medium',
        description: `${latePercentage.toFixed(1)}% late arrivals in the last ${timeRange} days`,
        detected_at: new Date().toISOString()
      });
    }
  }
  
  return anomalies;
}

function detectZScoreAnomalies(values: number[], records: any[], fieldName: string, threshold = 2.5) {
  if (values.length < 3) return [];
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  const anomalies = [];
  
  values.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);
    
    if (zScore > threshold) {
      const record = records[index];
      anomalies.push({
        type: fieldName.includes('pay') || fieldName.includes('deduction') ? 'payroll' : 'attendance',
        subtype: fieldName,
        employee_id: record.employee_id || record.user_id,
        employee_name: record.profiles?.first_name + ' ' + record.profiles?.last_name,
        value: value,
        z_score: zScore,
        mean: mean,
        std_dev: stdDev,
        severity: zScore > 3 ? 'high' : zScore > 2.5 ? 'medium' : 'low',
        description: `${fieldName.replace('_', ' ')} of ${value} is ${zScore.toFixed(2)} standard deviations from the mean (${mean.toFixed(2)})`,
        record_date: record.created_at || record.date,
        detected_at: new Date().toISOString()
      });
    }
  });
  
  return anomalies;
}

async function generateAIInsights(anomalies: any[]) {
  if (!openAIApiKey || anomalies.length === 0) {
    return {
      summary: 'No anomalies detected or AI insights unavailable.',
      recommendations: []
    };
  }
  
  const prompt = `Analyze the following anomalies detected in HR data and provide insights:

${JSON.stringify(anomalies, null, 2)}

Please provide:
1. A brief summary of the key patterns
2. Potential causes for these anomalies
3. Recommended actions for HR team
4. Risk assessment

Keep the response concise and actionable.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an HR analytics expert specializing in anomaly detection and workforce insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      }),
    });

    const aiData = await response.json();
    return {
      summary: aiData.choices[0].message.content,
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return {
      summary: 'AI insights generation failed. Please review anomalies manually.',
      error: error.message
    };
  }
}

function groupBy(array: any[], key: string) {
  return array.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
}
