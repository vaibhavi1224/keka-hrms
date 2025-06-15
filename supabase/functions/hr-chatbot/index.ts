
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchUserData } from './utils/dataFetcher.ts';
import { buildAIContext } from './utils/contextBuilder.ts';
import { callGeminiAPI } from './utils/geminiService.ts';

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

    // Fetch all user data
    const userData = await fetchUserData(supabase, userId);

    // Build AI context with user data
    const context = buildAIContext(userData);

    // Call Gemini API
    const aiResponse = await callGeminiAPI(context, message, geminiApiKey);

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
