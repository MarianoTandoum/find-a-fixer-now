
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  type: 'message' | 'call' | 'missed_call';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { to, subject, message, type }: EmailRequest = await req.json();

    console.log('Sending notification email:', { to, subject, type });

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }

    // Template d'email basé sur le type
    let emailTemplate = '';
    
    switch (type) {
      case 'message':
        emailTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Nouveau message sur MonTechnicienDuCoin</h2>
            <p>Bonjour,</p>
            <p>Vous avez reçu un nouveau message :</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;">${message}</p>
            </div>
            <p>Connectez-vous à votre espace pour répondre :</p>
            <a href="https://dvjwjrbqmzlwuycrdzou.supabase.co/conversations" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Voir mes messages
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              MonTechnicienDuCoin - Votre plateforme de mise en relation avec des techniciens qualifiés
            </p>
          </div>
        `;
        break;
      
      case 'call':
        emailTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Appel entrant sur MonTechnicienDuCoin</h2>
            <p>Bonjour,</p>
            <p>${message}</p>
            <p>Connectez-vous rapidement pour répondre à l'appel :</p>
            <a href="https://dvjwjrbqmzlwuycrdzou.supabase.co/conversations" 
               style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Rejoindre l'appel
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              MonTechnicienDuCoin - Votre plateforme de mise en relation avec des techniciens qualifiés
            </p>
          </div>
        `;
        break;
      
      case 'missed_call':
        emailTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Appel manqué sur MonTechnicienDuCoin</h2>
            <p>Bonjour,</p>
            <p>${message}</p>
            <p>Vous pouvez rappeler ou envoyer un message :</p>
            <a href="https://dvjwjrbqmzlwuycrdzou.supabase.co/conversations" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Voir mes conversations
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              MonTechnicienDuCoin - Votre plateforme de mise en relation avec des techniciens qualifiés
            </p>
          </div>
        `;
        break;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'MonTechnicienDuCoin <noreply@montechnicienduco.com>',
        to: [to],
        subject: subject,
        html: emailTemplate,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Email sent successfully:', data);
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      const error = await res.text();
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error}`);
    }

  } catch (error) {
    console.error('Error in send-notification-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
