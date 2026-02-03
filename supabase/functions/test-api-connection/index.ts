import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
    const { provider } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get connection config
    const { data: connection, error: connError } = await supabase
      .from('external_api_connections')
      .select('*')
      .eq('provider', provider)
      .single();

    if (connError || !connection) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Connection not found' 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const startTime = Date.now();
    let testResult = { success: false, error: '', statusCode: 0, responseTime: 0 };

    // Test based on provider type
    switch (provider) {
      case 'euipo':
        testResult = await testEUIPO(connection);
        break;
      case 'wipo_madrid':
        testResult = await testWIPOMadrid(connection);
        break;
      case 'wipo_statistics':
        testResult = await testWIPOStatistics();
        break;
      case 'wipo_branddb':
        // WIPO Brand DB doesn't have an API, just check website is accessible
        testResult = await testWebsiteAccessible('https://branddb.wipo.int');
        break;
      case 'oepm':
        testResult = await testOEPM();
        break;
      case 'uspto':
        testResult = await testUSPTO(connection);
        break;
      case 'ukipo':
        testResult = await testUKIPO(connection);
        break;
      default:
        testResult = { success: false, error: 'Unknown provider', statusCode: 0, responseTime: 0 };
    }

    testResult.responseTime = Date.now() - startTime;

    // Log the test
    await supabase.from('external_api_logs').insert({
      connection_id: connection.id,
      provider,
      endpoint: '/test',
      method: 'GET',
      response_status: testResult.statusCode,
      response_time_ms: testResult.responseTime,
      success: testResult.success,
      error_message: testResult.error || null,
      triggered_by: 'manual',
    });

    // Update connection stats
    await supabase
      .from('external_api_connections')
      .update({
        last_test_at: new Date().toISOString(),
        last_test_result: testResult.success ? 'success' : 'failed',
        last_error: testResult.error || null,
        avg_response_ms: testResult.responseTime,
        requests_today: connection.requests_today + 1,
        total_requests: connection.total_requests + 1,
      })
      .eq('id', connection.id);

    return new Response(JSON.stringify(testResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Test connection error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: (error as Error).message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function testEUIPO(connection: any) {
  try {
    // EUIPO requires OAuth2 authentication
    if (!connection.client_id || !connection.client_secret_encrypted) {
      return { success: false, error: 'EUIPO requires OAuth2 credentials', statusCode: 0, responseTime: 0 };
    }

    // Test with a simple health check or token endpoint
    const tokenUrl = 'https://api.euipo.europa.eu/oauth/token';
    
    // In production, attempt to get a token
    // For now, we'll check if the API is reachable
    const response = await fetch('https://euipo.europa.eu', { 
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    });

    return { 
      success: response.ok, 
      error: response.ok ? '' : `Status ${response.status}`,
      statusCode: response.status,
      responseTime: 0
    };
  } catch (error) {
    return { success: false, error: (error as Error).message, statusCode: 0, responseTime: 0 };
  }
}

async function testWIPOMadrid(connection: any) {
  try {
    // Test Madrid Monitor accessibility
    const response = await fetch('https://www3.wipo.int/madrid/monitor/en/', {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    });

    return { 
      success: response.ok, 
      error: response.ok ? '' : `Status ${response.status}`,
      statusCode: response.status,
      responseTime: 0
    };
  } catch (error) {
    return { success: false, error: (error as Error).message, statusCode: 0, responseTime: 0 };
  }
}

async function testWIPOStatistics() {
  try {
    // Test WIPO IP Statistics Data Center
    const response = await fetch('https://www3.wipo.int/ipstats/', {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    });

    return { 
      success: response.ok, 
      error: response.ok ? '' : `Status ${response.status}`,
      statusCode: response.status,
      responseTime: 0
    };
  } catch (error) {
    return { success: false, error: (error as Error).message, statusCode: 0, responseTime: 0 };
  }
}

async function testWebsiteAccessible(url: string) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    });

    return { 
      success: response.ok, 
      error: response.ok ? '' : `Status ${response.status}`,
      statusCode: response.status,
      responseTime: 0
    };
  } catch (error) {
    return { success: false, error: (error as Error).message, statusCode: 0, responseTime: 0 };
  }
}

async function testOEPM() {
  try {
    const response = await fetch('https://consultas2.oepm.es/LocalizadorWeb/', {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    });

    return { 
      success: response.ok, 
      error: response.ok ? '' : `Status ${response.status}`,
      statusCode: response.status,
      responseTime: 0
    };
  } catch (error) {
    return { success: false, error: (error as Error).message, statusCode: 0, responseTime: 0 };
  }
}

async function testUSPTO(connection: any) {
  try {
    // USPTO has a public API
    const response = await fetch('https://api.uspto.gov/v1/patent/applications', {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000),
      headers: connection.api_key_encrypted ? {
        'X-Api-Key': connection.api_key_encrypted
      } : {}
    });

    return { 
      success: response.ok, 
      error: response.ok ? '' : `Status ${response.status}`,
      statusCode: response.status,
      responseTime: 0
    };
  } catch (error) {
    return { success: false, error: (error as Error).message, statusCode: 0, responseTime: 0 };
  }
}

async function testUKIPO(connection: any) {
  try {
    const response = await fetch('https://www.gov.uk/government/organisations/intellectual-property-office', {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    });

    return { 
      success: response.ok, 
      error: response.ok ? '' : `Status ${response.status}`,
      statusCode: response.status,
      responseTime: 0
    };
  } catch (error) {
    return { success: false, error: (error as Error).message, statusCode: 0, responseTime: 0 };
  }
}