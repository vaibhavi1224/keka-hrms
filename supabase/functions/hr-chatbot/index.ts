
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

    // Get user profile and related data for context
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
      .limit(5);

    // Calculate leave balance (simplified calculation)
    const currentYear = new Date().getFullYear();
    const usedLeaves = leaveRequests?.filter(req => 
      req.status === 'approved' && 
      new Date(req.start_date).getFullYear() === currentYear
    ).reduce((total, req) => total + req.days_requested, 0) || 0;
    const totalLeaves = 24; // Assuming 24 days annual leave
    const leaveBalance = totalLeaves - usedLeaves;

    // Prepare context for Gemini
    const context = `
You are an HR chatbot assistant for the company. Here's the employee's information:
- Name: ${profile?.first_name} ${profile?.last_name}
- Email: ${profile?.email}
- Department: ${profile?.department || 'Not specified'}
- Designation: ${profile?.designation || 'Not specified'}
- Employee ID: ${profile?.employee_id || 'Not assigned'}
- Date of Joining: ${profile?.date_of_joining || 'Not specified'}
- Current Leave Balance: ${leaveBalance} days
- Manager: ${profile?.manager_id ? 'Assigned' : 'Not assigned'}

Company Policies:
- Annual leave: 24 days per year
- Sick leave: 12 days per year
- Maternity leave: 180 days
- Paternity leave: 15 days
- Working hours: 9:00 AM to 6:00 PM
- Lunch break: 1 hour
- Probation period: 6 months
- Notice period: 30 days for employees, 60 days for managers

Leave Policy:
- Leaves must be applied at least 2 days in advance (except emergency)
- Maximum 5 consecutive days without manager approval
- Leave encashment allowed at year end
- Medical certificate required for sick leaves > 3 days

Reimbursement Policy:
- Travel: Actual expenses with bills
- Medical: Up to ₹25,000 per year with bills
- Internet: ₹1,500 per month for remote workers
- All reimbursements require proper documentation

Please provide helpful, accurate responses about HR policies, leave management, and company procedures. If you don't have specific information, direct them to contact HR at hr@company.com.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
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
