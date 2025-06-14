
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { name, email, password, role, department, designation, salary, date_of_joining } = await req.json()

    // Create user account via Supabase Auth Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || ''
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the profile with employee details
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || '',
        role: role as 'hr' | 'manager' | 'employee',
        department: department || null,
        designation: designation || null,
        date_of_joining: date_of_joining || null,
        status: 'ACTIVE',
        is_active: true
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create employee record if salary is provided
    if (salary) {
      const { error: employeeError } = await supabaseAdmin
        .from('employees')
        .insert({
          profile_id: authData.user.id,
          salary: parseFloat(salary)
        })

      if (employeeError) {
        console.error('Employee error:', employeeError)
        return new Response(
          JSON.stringify({ error: employeeError.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        credentials: { email, password }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
