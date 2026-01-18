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

    const { delivery_id } = await req.json();

    if (!delivery_id) {
      return new Response(
        JSON.stringify({ error: 'delivery_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get delivery with webhook
    const { data: delivery, error: deliveryError } = await supabase
      .from('webhook_deliveries')
      .select('*, webhooks(*)')
      .eq('id', delivery_id)
      .single();

    if (deliveryError || !delivery) {
      return new Response(
        JSON.stringify({ error: 'Delivery not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const webhook = delivery.webhooks;

    if (!webhook) {
      return new Response(
        JSON.stringify({ error: 'Webhook not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      encoder.encode(JSON.stringify(delivery.payload))
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
          'X-Webhook-Event': delivery.event_type,
          'X-Webhook-Retry': String(delivery.attempt_count + 1),
          ...webhook.headers,
        },
        body: JSON.stringify(delivery.payload),
      });

      responseStatus = response.status;
      responseBody = await response.text();
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : String(err);
    }

    const responseTime = Date.now() - startTime;
    const isSuccess = responseStatus >= 200 && responseStatus < 300;
    const newAttemptCount = delivery.attempt_count + 1;
    const maxRetriesReached = newAttemptCount >= webhook.max_retries;

    let newStatus: string;
    let nextRetryAt: string | null = null;

    if (isSuccess) {
      newStatus = 'delivered';
    } else if (maxRetriesReached) {
      newStatus = 'failed';
    } else {
      newStatus = 'retrying';
      nextRetryAt = new Date(Date.now() + webhook.retry_delay_seconds * 1000).toISOString();
    }

    // Update delivery
    await supabase
      .from('webhook_deliveries')
      .update({
        status: newStatus,
        response_status: responseStatus || null,
        response_body: responseBody.substring(0, 10000),
        response_time_ms: responseTime,
        attempt_count: newAttemptCount,
        next_retry_at: nextRetryAt,
        error_message: errorMessage || null,
        delivered_at: isSuccess ? new Date().toISOString() : null,
      })
      .eq('id', delivery_id);

    // Update webhook stats
    const updateData: Record<string, any> = {
      total_deliveries: webhook.total_deliveries + 1,
      last_delivery_at: new Date().toISOString(),
    };

    if (isSuccess) {
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
        success: isSuccess,
        status: responseStatus,
        response_time_ms: responseTime,
        attempt_count: newAttemptCount,
        next_retry_at: nextRetryAt,
        error: errorMessage || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error retrying webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
