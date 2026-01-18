import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { webhook_id } = await req.json();

    if (!webhook_id) {
      return new Response(
        JSON.stringify({ error: 'webhook_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get webhook
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhook_id)
      .single();

    if (webhookError || !webhook) {
      return new Response(
        JSON.stringify({ error: 'Webhook not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create test payload
    const testPayload = {
      id: crypto.randomUUID(),
      event: 'test.webhook',
      created_at: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from IP-NEXUS',
        webhook_id: webhook.id,
        webhook_name: webhook.name,
      },
      organization_id: webhook.organization_id,
    };

    // Calculate signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhook.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(JSON.stringify(testPayload))
    );
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Send webhook
    const startTime = Date.now();
    let responseStatus = 0;
    let responseBody = '';
    let errorMessage = '';

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': `sha256=${signatureHex}`,
          'X-Webhook-Id': webhook.id,
          'X-Webhook-Event': 'test.webhook',
          ...webhook.headers,
        },
        body: JSON.stringify(testPayload),
      });

      responseStatus = response.status;
      responseBody = await response.text();
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : String(err);
    }

    const responseTime = Date.now() - startTime;
    const deliveryStatus = responseStatus >= 200 && responseStatus < 300 ? 'delivered' : 'failed';

    // Log the delivery
    await supabase.from('webhook_deliveries').insert({
      webhook_id: webhook.id,
      event_type: 'test.webhook',
      payload: testPayload,
      status: deliveryStatus,
      response_status: responseStatus || null,
      response_body: responseBody.substring(0, 10000),
      response_time_ms: responseTime,
      attempt_count: 1,
      error_message: errorMessage || null,
      delivered_at: deliveryStatus === 'delivered' ? new Date().toISOString() : null,
    });

    // Update webhook stats
    const updateData: Record<string, any> = {
      total_deliveries: webhook.total_deliveries + 1,
      last_delivery_at: new Date().toISOString(),
    };

    if (deliveryStatus === 'delivered') {
      updateData.successful_deliveries = webhook.successful_deliveries + 1;
    } else {
      updateData.failed_deliveries = webhook.failed_deliveries + 1;
      updateData.last_error = errorMessage || `HTTP ${responseStatus}`;
    }

    await supabase
      .from('webhooks')
      .update(updateData)
      .eq('id', webhook.id);

    return new Response(
      JSON.stringify({
        success: deliveryStatus === 'delivered',
        status: responseStatus,
        response_time_ms: responseTime,
        error: errorMessage || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error testing webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
