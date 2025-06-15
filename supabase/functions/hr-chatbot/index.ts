
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Get comprehensive user profile and related data
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        *,
        employees (*)
      `)
      .eq('id', userId)
      .single();

    // Get user's leave requests for context
    const { data: leaveRequests } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get user's recent attendance records
    const { data: attendanceRecords } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);

    // Get user's salary structure if exists
    const { data: salaryStructure } = await supabase
      .from('salary_structures')
      .select('*')
      .eq('employee_id', userId)
      .eq('is_active', true)
      .order('effective_from', { ascending: false })
      .limit(1);

    // Get user's bank details if exists
    const { data: bankDetails } = await supabase
      .from('employee_bank_details')
      .select('*')
      .eq('employee_id', userId)
      .single();

    // Get manager information if user has a manager
    let managerInfo = null;
    if (profile?.manager_id) {
      const { data: manager } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, designation')
        .eq('id', profile.manager_id)
        .single();
      managerInfo = manager;
    }

    // Calculate leave balance (simplified calculation)
    const currentYear = new Date().getFullYear();
    const approvedLeaves = leaveRequests?.filter(req => 
      req.status === 'approved' && 
      new Date(req.start_date).getFullYear() === currentYear
    ) || [];
    
    const usedLeaves = approvedLeaves.reduce((total, req) => total + req.days_requested, 0);
    const totalAnnualLeaves = 24; // Standard annual leave
    const leaveBalance = totalAnnualLeaves - usedLeaves;

    // Calculate attendance statistics
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthAttendance = attendanceRecords?.filter(record => 
      new Date(record.date).getMonth() + 1 === currentMonth
    ) || [];
    
    const presentDays = currentMonthAttendance.filter(record => 
      record.status === 'present'
    ).length;
    
    const attendanceRate = currentMonthAttendance.length > 0 
      ? Math.round((presentDays / currentMonthAttendance.length) * 100) 
      : 0;

    // Prepare comprehensive context for Gemini
    const context = `
You are an AI HR assistant for the company. You have access to this employee's complete profile and data:

EMPLOYEE PROFILE:
- Name: ${profile?.first_name} ${profile?.last_name}
- Email: ${profile?.email}
- Employee ID: ${profile?.employee_id || 'Not assigned'}
- Department: ${profile?.department || 'Not specified'}
- Designation: ${profile?.designation || 'Not specified'}
- Role: ${profile?.role}
- Date of Joining: ${profile?.date_of_joining ? new Date(profile.date_of_joining).toLocaleDateString() : 'Not specified'}
- Phone: ${profile?.phone || 'Not provided'}
- Status: ${profile?.is_active ? 'Active' : 'Inactive'}
- Working Hours: ${profile?.working_hours_start || '09:00'} - ${profile?.working_hours_end || '18:00'}

MANAGER INFORMATION:
${managerInfo ? `
- Manager: ${managerInfo.first_name} ${managerInfo.last_name}
- Manager Email: ${managerInfo.email}
- Manager Designation: ${managerInfo.designation}
` : '- No manager assigned'}

LEAVE INFORMATION:
- Current Leave Balance: ${leaveBalance} days remaining (out of ${totalAnnualLeaves} annual days)
- Pending Leave Requests: ${leaveRequests?.filter(req => req.status === 'pending').length || 0}
- Approved Leaves This Year: ${approvedLeaves.length} requests (${usedLeaves} days total)
- Recent Leave Requests: ${leaveRequests?.slice(0, 3).map(req => 
  `${req.leave_type} from ${req.start_date} to ${req.end_date} (${req.status})`
).join(', ') || 'None'}

ATTENDANCE INFORMATION:
- This Month's Attendance Rate: ${attendanceRate}%
- Days Present This Month: ${presentDays}
- Total Records This Month: ${currentMonthAttendance.length}
- Recent Attendance: ${attendanceRecords?.slice(0, 5).map(record => 
  `${record.date}: ${record.status}${record.working_hours ? ` (${record.working_hours}h)` : ''}`
).join(', ') || 'No recent records'}

SALARY INFORMATION:
${salaryStructure?.[0] ? `
- Current CTC: ₹${salaryStructure[0].ctc?.toLocaleString() || 'Not specified'}
- Basic Salary: ₹${salaryStructure[0].basic_salary?.toLocaleString() || 'Not specified'}
- HRA: ₹${salaryStructure[0].hra?.toLocaleString() || 'Not specified'}
- Effective From: ${salaryStructure[0].effective_from}
` : '- Salary structure not configured'}

BANK DETAILS:
${bankDetails ? `
- Bank: ${bankDetails.bank_name || 'Not provided'}
- Account Number: ${bankDetails.account_number ? '****' + bankDetails.account_number.slice(-4) : 'Not provided'}
- IFSC: ${bankDetails.ifsc_code || 'Not provided'}
- PAN: ${bankDetails.pan_number ? bankDetails.pan_number.slice(0, 3) + '****' + bankDetails.pan_number.slice(-1) : 'Not provided'}
` : '- Bank details not provided'}

COMPANY POLICIES (General):
- Annual Leave: 24 days per year
- Sick Leave: 12 days per year  
- Maternity Leave: 180 days
- Paternity Leave: 15 days
- Working Hours: 9:00 AM to 6:00 PM (flexible based on individual schedule)
- Lunch Break: 1 hour
- Probation Period: 6 months for new employees
- Notice Period: 30 days for employees, 60 days for managers

LEAVE POLICY:
- Leaves should be applied at least 2 days in advance (except emergencies)
- Maximum 5 consecutive days without manager approval for longer periods
- Leave encashment allowed at year end for unused leaves
- Medical certificate required for sick leaves exceeding 3 days
- All leave requests require manager approval

REIMBURSEMENT POLICY:
- Travel: Actual expenses with valid bills and receipts
- Medical: Up to ₹25,000 per year with proper medical bills
- Internet/Phone: ₹1,500 per month for remote workers
- All reimbursements require proper documentation and approval

INSTRUCTIONS:
- Provide personalized responses based on the employee's actual data
- Be helpful, accurate, and professional
- If asked about specific dates, balances, or records, refer to the actual data provided
- For policies not covered or complex issues, direct them to contact HR at hr@company.com
- Always be encouraging and supportive
- If data is missing or incomplete, acknowledge it and suggest how they can update it
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: context },
              { text: `Employee question: ${message}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} - ${errorText}`);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text || 'I apologize, but I could not generate a response. Please contact HR directly.';

    console.log('HR Chatbot response generated for user:', userId);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in hr-chatbot function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get HR assistance',
      response: 'I apologize, but I am currently unable to assist you. Please contact HR directly at hr@company.com for immediate assistance.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
