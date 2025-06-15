
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
    const { resumeText, employeeId, fileUrl } = await req.json();

    if (!resumeText || !employeeId) {
      throw new Error('Resume text and employee ID are required');
    }

    console.log('Parsing resume for employee:', employeeId);

    // Use OpenAI to extract structured data from resume
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
            content: `Extract structured information from the resume text and return a JSON object with the following structure:
            {
              "personal_info": {
                "first_name": "",
                "last_name": "",
                "phone": "",
                "address": "",
                "email": ""
              },
              "education": [
                {
                  "degree": "",
                  "institution": "",
                  "year": "",
                  "field_of_study": ""
                }
              ],
              "work_experience": [
                {
                  "company": "",
                  "position": "",
                  "duration": "",
                  "description": ""
                }
              ],
              "skills": [],
              "projects": [
                {
                  "name": "",
                  "description": "",
                  "technologies": []
                }
              ]
            }
            
            Only return the JSON object, no additional text. If information is not available, use empty strings or empty arrays.`
          },
          {
            role: 'user',
            content: resumeText
          }
        ],
        temperature: 0.1,
      }),
    });

    const aiData = await response.json();
    const extractedData = JSON.parse(aiData.choices[0].message.content);

    console.log('Extracted data:', extractedData);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Update employee profile with extracted personal information
    if (extractedData.personal_info) {
      const personalInfo = extractedData.personal_info;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: personalInfo.first_name || undefined,
          last_name: personalInfo.last_name || undefined,
          phone: personalInfo.phone || undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      // Update employee table with additional details
      const { error: employeeError } = await supabase
        .from('employees')
        .upsert({
          profile_id: employeeId,
          address: personalInfo.address || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id' });

      if (employeeError) {
        console.error('Error updating employee:', employeeError);
      }
    }

    // Store the document record if fileUrl is provided
    if (fileUrl) {
      const { error: docError } = await supabase
        .from('documents')
        .upsert({
          employee_id: employeeId,
          document_type: 'resume',
          document_name: 'Resume',
          file_path: fileUrl,
          uploaded_by: employeeId
        }, { onConflict: 'employee_id,document_type' });

      if (docError) {
        console.error('Error storing document:', docError);
      }
    }

    // Store extracted resume data in the resume_data table
    const { error: resumeError } = await supabase
      .from('resume_data')
      .upsert({
        employee_id: employeeId,
        extracted_data: extractedData,
        processed_at: new Date().toISOString(),
        status: 'processed'
      }, { onConflict: 'employee_id' });

    if (resumeError) {
      console.error('Error storing resume data:', resumeError);
      throw resumeError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        extractedData: extractedData,
        message: 'Resume parsed and data updated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in resume parser:', error);
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
