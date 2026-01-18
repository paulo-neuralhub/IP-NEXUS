import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string | string[];
  subject?: string;
  template_code?: string;
  template_data?: Record<string, any>;
  html?: string;
  text?: string;
  from_name?: string;
  reply_to?: string;
  organization_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: 'Resend not configured. Add RESEND_API_KEY to continue.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendKey);
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const request: EmailRequest = await req.json();
    
    let subject = request.subject || '';
    let html = request.html || '';
    let text = request.text || '';
    
    // Si se usa plantilla, obtenerla y renderizar
    if (request.template_code) {
      let query = supabase
        .from('email_templates')
        .select('*')
        .eq('code', request.template_code)
        .eq('is_active', true);
      
      if (request.organization_id) {
        query = query.or(`organization_id.is.null,organization_id.eq.${request.organization_id}`);
      } else {
        query = query.is('organization_id', null);
      }
      
      const { data: templates } = await query
        .order('organization_id', { ascending: false, nullsFirst: false })
        .limit(1);
      
      const template = templates?.[0];
      
      if (!template) {
        console.log(`Template '${request.template_code}' not found`);
        // Si no hay plantilla, usar valores directos si existen
        if (!request.subject || !request.html) {
          return new Response(
            JSON.stringify({ error: `Template '${request.template_code}' not found and no direct content provided` }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Renderizar plantilla con variables
        const data = {
          ...getDefaultVariables(),
          ...request.template_data,
        };
        
        subject = renderTemplate(template.subject, data);
        html = renderTemplate(template.html_content, data);
        text = template.plain_text ? renderTemplate(template.plain_text, data) : '';
      }
    }
    
    if (!subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Subject and HTML content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const toAddresses = Array.isArray(request.to) ? request.to : [request.to];
    const fromEmail = Deno.env.get('EMAIL_FROM') || 'IP-NEXUS <onboarding@resend.dev>';
    
    // Enviar email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: request.from_name ? `${request.from_name} <onboarding@resend.dev>` : fromEmail,
      to: toAddresses,
      subject,
      html,
      text: text || undefined,
      reply_to: request.reply_to,
    });
    
    if (emailError) {
      console.error('Resend error:', emailError);
      
      // Registrar error
      if (request.organization_id) {
        await supabase.from('sent_emails').insert({
          organization_id: request.organization_id,
          to_email: toAddresses.join(', '),
          subject,
          template_id: request.template_code,
          template_data: request.template_data || {},
          provider: 'resend',
          status: 'failed',
          error_message: emailError.message,
        });
      }
      
      throw new Error(emailError.message);
    }
    
    // Registrar envío exitoso
    if (request.organization_id) {
      await supabase.from('sent_emails').insert({
        organization_id: request.organization_id,
        to_email: toAddresses.join(', '),
        subject,
        template_id: request.template_code,
        template_data: request.template_data || {},
        provider: 'resend',
        provider_id: emailData?.id,
        status: 'sent',
      });
    }
    
    console.log('Email sent successfully:', emailData?.id);
    
    return new Response(
      JSON.stringify({ success: true, message_id: emailData?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Email send error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function renderTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });
}

function getDefaultVariables(): Record<string, string> {
  return {
    app_url: Deno.env.get('APP_URL') || 'https://id-preview--ec943dde-ae1e-40db-be06-10d553dd2119.lovable.app',
    logo_url: Deno.env.get('LOGO_URL') || 'https://id-preview--ec943dde-ae1e-40db-be06-10d553dd2119.lovable.app/logo.png',
    support_email: Deno.env.get('SUPPORT_EMAIL') || 'support@ip-nexus.com',
    current_year: new Date().getFullYear().toString(),
  };
}
