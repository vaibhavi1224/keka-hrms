
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  name: string;
  role: string;
  department?: string;
  designation?: string;
  invitationToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, role, department, designation, invitationToken }: InvitationRequest = await req.json();

    const invitationUrl = `${req.headers.get('origin')}/auth?token=${invitationToken}&type=invitation`;

    const emailResponse = await resend.emails.send({
      from: "HR Team <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to the team! Complete your registration",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Welcome to Our Team!</h1>
          
          <p>Hi ${name},</p>
          
          <p>You've been invited to join our company as a <strong>${designation || role}</strong> in the <strong>${department || 'your assigned'}</strong> department.</p>
          
          <p>To complete your registration and set up your account, please click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Complete Registration
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
            ${invitationUrl}
          </p>
          
          <p><strong>Role:</strong> ${role}</p>
          ${department ? `<p><strong>Department:</strong> ${department}</p>` : ''}
          ${designation ? `<p><strong>Designation:</strong> ${designation}</p>` : ''}
          
          <p>This invitation will expire in 7 days. If you have any questions, please contact our HR team.</p>
          
          <p>We're excited to have you on board!</p>
          
          <p>Best regards,<br>HR Team</p>
        </div>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
