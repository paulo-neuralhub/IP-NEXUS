import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthCheck {
  status: 'ok' | 'error' | 'degraded';
  latency_ms?: number;
  error?: string;
  details?: Record<string, unknown>;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime_seconds: number;
  latency_ms: number;
  checks: Record<string, HealthCheck>;
}

const startTime = Date.now();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const checkStartTime = Date.now();
  const checks: Record<string, HealthCheck> = {};

  // =====================================================
  // Check 1: Database Connection
  // =====================================================
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const dbStart = Date.now();
    const { error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);

    checks.database = {
      status: error ? 'error' : 'ok',
      latency_ms: Date.now() - dbStart,
      error: error?.message,
    };
  } catch (error) {
    checks.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // =====================================================
  // Check 2: AI Provider (Anthropic)
  // =====================================================
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (anthropicKey) {
    try {
      const aiStart = Date.now();
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });

      // We expect either success or a 400 (bad request is fine, means API is reachable)
      const isReachable = response.status < 500;
      checks.ai_anthropic = {
        status: isReachable ? 'ok' : 'error',
        latency_ms: Date.now() - aiStart,
        details: { status_code: response.status },
      };
    } catch (error) {
      checks.ai_anthropic = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  } else {
    checks.ai_anthropic = {
      status: 'degraded',
      error: 'API key not configured',
    };
  }

  // =====================================================
  // Check 3: Storage (Supabase Storage)
  // =====================================================
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const storageStart = Date.now();
    const { data, error } = await supabase.storage.listBuckets();

    checks.storage = {
      status: error ? 'error' : 'ok',
      latency_ms: Date.now() - storageStart,
      error: error?.message,
      details: { bucket_count: data?.length || 0 },
    };
  } catch (error) {
    checks.storage = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // =====================================================
  // Check 4: Auth Service
  // =====================================================
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authStart = Date.now();
    // Just check if we can access auth admin API
    const { error } = await supabase.auth.admin.listUsers({ perPage: 1 });

    checks.auth = {
      status: error ? 'error' : 'ok',
      latency_ms: Date.now() - authStart,
      error: error?.message,
    };
  } catch (error) {
    checks.auth = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // =====================================================
  // Calculate Overall Status
  // =====================================================
  const checkResults = Object.values(checks);
  const hasErrors = checkResults.some((c) => c.status === 'error');
  const hasDegraded = checkResults.some((c) => c.status === 'degraded');

  let overallStatus: HealthResponse['status'] = 'healthy';
  if (hasErrors) {
    overallStatus = 'unhealthy';
  } else if (hasDegraded) {
    overallStatus = 'degraded';
  }

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: Deno.env.get('APP_VERSION') || '1.0.0',
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    latency_ms: Date.now() - checkStartTime,
    checks,
  };

  // Return 503 for unhealthy, 200 for healthy/degraded
  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;

  return new Response(JSON.stringify(response, null, 2), {
    status: httpStatus,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
});
