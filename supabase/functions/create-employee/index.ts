
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
}

// Password validation utility
function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Input sanitization utility
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      role = 'employee',
      department,
      designation,
      date_of_joining,
      manager_id,
      phone,
      address
    } = await req.json()

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, first_name, last_name' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return new Response(
        JSON.stringify({ 
          error: 'Password does not meet security requirements',
          details: passwordValidation.errors 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Sanitize input
    const sanitizedData = {
      email: sanitizeInput(email.toLowerCase()),
      first_name: sanitizeInput(first_name),
      last_name: sanitizeInput(last_name),
      phone: phone ? sanitizeInput(phone) : null,
      address: address ? sanitizeInput(address) : null,
      department: department ? sanitizeInput(department) : null,
      designation: designation ? sanitizeInput(designation) : null
    };

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedData.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Creating new employee account');

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: sanitizedData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: sanitizedData.first_name,
        last_name: sanitizedData.last_name,
        role: role
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError.message);
      return new Response(
        JSON.stringify({ error: `Failed to create user account: ${authError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the profile with additional information
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: role,
        phone: sanitizedData.phone,
        address: sanitizedData.address,
        department: sanitizedData.department,
        designation: sanitizedData.designation,
        date_of_joining: date_of_joining,
        manager_id: manager_id,
        onboarding_status: 'pending',
        invited_by: req.headers.get('user-id'),
        invited_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('Profile update error:', profileError.message);
      
      // Clean up the created user if profile update fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return new Response(
        JSON.stringify({ error: `Failed to update user profile: ${profileError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create notification for the new employee
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: authData.user.id,
        title: 'Welcome to the company!',
        message: 'Your account has been created. Please complete your onboarding process.',
        type: 'info'
      });

    if (notificationError) {
      console.error('Notification creation error:', notificationError.message);
    }

    console.log('Employee account created successfully');

    // Return success without exposing sensitive data
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Employee account created successfully',
        employee_id: authData.user.id,
        onboarding_status: 'pending'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
