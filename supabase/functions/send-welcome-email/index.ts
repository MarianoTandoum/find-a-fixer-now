
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, confirmationUrl }: WelcomeEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "FixHub <onboarding@resend.dev>",
      to: [email],
      subject: "Bienvenue sur FixHub - Confirmez votre inscription",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue sur FixHub</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Bienvenue sur FixHub !</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">La plateforme sécurisée pour trouver des techniciens de confiance</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Bonjour ${firstName} ${lastName},</h2>
            
            <p>Nous sommes ravis de vous accueillir sur <strong>FixHub</strong>, votre nouvelle plateforme de mise en relation avec des techniciens qualifiés.</p>
            
            <p>Pour finaliser votre inscription et commencer à utiliser tous nos services, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                Confirmer mon inscription
              </a>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #667eea;">Ce que vous pouvez faire sur FixHub :</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>🔍 Rechercher des techniciens par métier et localisation</li>
                <li>💬 Communiquer de manière sécurisée via notre messagerie interne</li>
                <li>📅 Planifier des rendez-vous directement sur la plateforme</li>
                <li>🔒 Profiter d'une confidentialité totale (aucune information personnelle partagée)</li>
                <li>⭐ Consulter les profils vérifiés de nos techniciens partenaires</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              <strong>Note importante :</strong> Ce lien de confirmation est valable pendant 24 heures. 
              Si vous n'avez pas créé de compte sur FixHub, vous pouvez ignorer cet email en toute sécurité.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Besoin d'aide ? Contactez notre équipe support :<br>
              <a href="mailto:support@fixhub.com" style="color: #667eea;">support@fixhub.com</a>
            </p>
            
            <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
              © 2024 FixHub. Tous droits réservés.<br>
              <a href="#" style="color: #667eea;">Conditions d'utilisation</a> | 
              <a href="#" style="color: #667eea;">Politique de confidentialité</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
