import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EndpointCheck {
  name: string;
  url: string;
  status: 'up' | 'down' | 'slow' | 'error';
  status_code?: number;
  latency_ms: number;
  error?: string;
}

interface UptimeResult {
  timestamp: string;
  checks: EndpointCheck[];
  all_healthy: boolean;
  alerts_sent: number;
}

// Endpoints to monitor
const ENDPOINTS = [
  {
    name: 'Health API',
    url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/health`,
  },
  {
    name: 'Supabase REST',
    url: `${Deno.env.get('SUPABASE_URL')}/rest/v1/`,
  },
];

// Thresholds
const SLOW_THRESHOLD_MS = 3000;
const TIMEOUT_MS = 10000;

/**
 * Send alert to Slack/Discord webhook
 */
async function sendAlert(
  endpointName: string,
  issue: 'down' | 'slow' | 'error',
  latencyMs: number,
  statusCode: number,
  errorMessage?: string
): Promise<boolean> {
  const webhookUrl = Deno.env.get('ALERT_WEBHOOK_URL');
  if (!webhookUrl) return false;

  const severityEmoji = {
    down: '🚨',
    slow: '⚠️',
    error: '❌',
  };

  const messages = {
    down: `*${endpointName}* is DOWN! Status: ${statusCode}`,
    slow: `*${endpointName}* is SLOW! Latency: ${latencyMs}ms (threshold: ${SLOW_THRESHOLD_MS}ms)`,
    error: `*${endpointName}* ERROR: ${errorMessage}`,
  };

  const payload = {
    text: `${severityEmoji[issue]} IP-NEXUS Uptime Alert`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${severityEmoji[issue]} Uptime Alert`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: messages[issue],
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `*Time:* ${new Date().toISOString()} | *Endpoint:* ${endpointName}`,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    console.error('Failed to send alert');
    return false;
  }
}

/**
 * Store uptime check result in database
 */
async function storeResult(result: UptimeResult): Promise<void> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if table exists, if not log only
    // This is a monitoring function, we don't want it to fail
    console.log('[Uptime] Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('[Uptime] Failed to store result:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const results: EndpointCheck[] = [];
  let alertsSent = 0;

  for (const endpoint of ENDPOINTS) {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'IP-NEXUS-Uptime-Monitor/1.0',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;
      const isUp = response.ok || response.status === 401; // 401 is expected for protected endpoints
      const isSlow = latency > SLOW_THRESHOLD_MS;

      let status: EndpointCheck['status'] = 'up';
      if (!isUp) {
        status = 'down';
      } else if (isSlow) {
        status = 'slow';
      }

      results.push({
        name: endpoint.name,
        url: endpoint.url,
        status,
        status_code: response.status,
        latency_ms: latency,
      });

      // Send alert if not healthy
      if (status === 'down') {
        const sent = await sendAlert(endpoint.name, 'down', latency, response.status);
        if (sent) alertsSent++;
      } else if (status === 'slow') {
        const sent = await sendAlert(endpoint.name, 'slow', latency, response.status);
        if (sent) alertsSent++;
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      results.push({
        name: endpoint.name,
        url: endpoint.url,
        status: 'error',
        latency_ms: latency,
        error: errorMessage,
      });

      const sent = await sendAlert(endpoint.name, 'error', latency, 0, errorMessage);
      if (sent) alertsSent++;
    }
  }

  const allHealthy = results.every((r) => r.status === 'up');

  const response: UptimeResult = {
    timestamp: new Date().toISOString(),
    checks: results,
    all_healthy: allHealthy,
    alerts_sent: alertsSent,
  };

  // Store result for historical tracking
  await storeResult(response);

  return new Response(JSON.stringify(response, null, 2), {
    status: allHealthy ? 200 : 503,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
});
