
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: ContactEmailRequest = await req.json();

    // Save message to database first
    const { error: dbError } = await supabaseClient.from('contact_messages').insert({
      name,
      email,
      message
    });

    if (dbError) throw dbError;

    // Send email to administrator
    const adminEmailResponse = await resend.emails.send({
      from: "FixHub <onboarding@resend.dev>",
      to: ["contact@fixhub.com"], // Replace with your email
      reply_to: email,
      subject: `Nouveau message de ${name}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Message :</strong></p>
        <p>${message}</p>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: "FixHub <onboarding@resend.dev>",
      to: [email],
      subject: "Nous avons bien reçu votre message",
      html: `
        <h2>Merci de nous avoir contacté !</h2>
        <p>Cher(e) ${name},</p>
        <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
        <p>Cordialement,<br>L'équipe FixHub</p>
      `,
    });

    console.log("Emails sent successfully:", adminEmailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-contact-email function:", error);
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
