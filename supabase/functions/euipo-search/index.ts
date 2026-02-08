import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * EUIPO Trademark Search via official dev.euipo.europa.eu REST API
 * Auth: OAuth2 client_credentials → Bearer token
 * Docs: https://dev.euipo.europa.eu/product/trademark-search_100
 */

const AUTH_URL = 'https://auth.euipo.europa.eu/oidc/accessToken';
const API_BASE = 'https://api.euipo.europa.eu/trademark-search/1.0.0';

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'openid',
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`EUIPO auth failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const {
      query, trademark_name, applicant_name, representative_name,
      nice_classes, status, filing_date_from, filing_date_to,
      page = 1, page_size = 20,
    } = await req.json();

    console.log('EUIPO Search params:', { query, trademark_name, applicant_name, nice_classes });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Look for credentials in external_api_connections
    const { data: connection } = await supabase
      .from('external_api_connections')
      .select('*')
      .eq('provider', 'euipo')
      .eq('status', 'active')
      .single();

    const clientId = connection?.api_key_encrypted || Deno.env.get('EUIPO_CLIENT_ID');
    const clientSecret = connection?.access_token_encrypted || Deno.env.get('EUIPO_CLIENT_SECRET');

    let responseData: any;

    if (clientId && clientSecret) {
      try {
        const token = await getAccessToken(clientId, clientSecret);

        // Build query params
        const params = new URLSearchParams();
        const term = trademark_name || query;
        if (term) params.append('tradeMarkName', term);
        if (applicant_name) params.append('applicantName', applicant_name);
        if (representative_name) params.append('representativeName', representative_name);
        if (nice_classes?.length) params.append('niceClass', nice_classes.join(','));
        if (status) params.append('tradeMarkStatus', status);
        if (filing_date_from) params.append('applicationDateFrom', filing_date_from);
        if (filing_date_to) params.append('applicationDateTo', filing_date_to);
        params.append('pageNumber', String(page));
        params.append('pageSize', String(page_size));

        const apiRes = await fetch(`${API_BASE}/trademarks?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(30000),
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          responseData = transformEUIPOResponse(data, page, page_size);
          console.log('EUIPO real API returned', responseData.total_count, 'results');
        } else {
          const errText = await apiRes.text();
          console.warn('EUIPO API error, status', apiRes.status, errText);
          responseData = safeResponse(trademark_name || query, nice_classes, page, page_size,
            `EUIPO API respondió ${apiRes.status}`);
        }
      } catch (apiErr) {
        console.error('EUIPO API call failed:', apiErr);
        responseData = safeResponse(trademark_name || query, nice_classes, page, page_size,
          (apiErr as Error).message);
      }
    } else {
      // SAFE MODE
      console.log('No EUIPO credentials configured – safe mode');
      responseData = safeResponse(trademark_name || query, nice_classes, page, page_size,
        'Configure EUIPO_CLIENT_ID y EUIPO_CLIENT_SECRET para datos reales');
    }

    // Log request
    if (connection) {
      await supabase.from('external_api_logs').insert({
        connection_id: connection.id,
        provider: 'euipo',
        endpoint: '/trademarks',
        method: 'GET',
        request_params: { query, trademark_name, applicant_name, nice_classes, status },
        response_status: 200,
        response_time_ms: Date.now() - startTime,
        success: !responseData.is_safe_mode,
        triggered_by: 'api',
      }).catch(() => {});

      await supabase.from('external_api_connections').update({
        requests_today: (connection.requests_today || 0) + 1,
        total_requests: (connection.total_requests || 0) + 1,
        avg_response_ms: Math.round(((connection.avg_response_ms || 0) + (Date.now() - startTime)) / 2),
      }).eq('id', connection.id).catch(() => {});
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('EUIPO search error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function transformEUIPOResponse(data: any, page: number, pageSize: number) {
  const items = data.items || data.trademarks || data.results || [];
  return {
    trademarks: items.map((item: any) => ({
      application_number: item.applicationNumber || item.applicationNo,
      registration_number: item.registrationNumber,
      mark_name: item.wordElement || item.markVerbalElement || item.tradeMarkName || item.name,
      mark_type: item.markType || item.tradeMarkType,
      nice_classes: item.niceClasses || item.niceClassNumbers || [],
      applicant_name: item.applicantName || item.applicant?.name,
      applicant_country: item.applicantCountryCode || item.applicant?.countryCode,
      representative_name: item.representativeName || item.representative?.name,
      filing_date: item.filingDate || item.applicationDate,
      registration_date: item.registrationDate,
      expiry_date: item.expiryDate,
      status: item.status || item.tradeMarkStatus,
      image_url: item.imageUrl || item.markImageURI,
    })),
    total_count: data.totalCount ?? data.totalResults ?? items.length,
    page,
    page_size: pageSize,
    source: 'euipo',
  };
}

function safeResponse(searchTerm: string, niceClasses: number[] | null, page: number, pageSize: number, message: string) {
  return {
    trademarks: [],
    total_count: 0,
    page,
    page_size: pageSize,
    is_safe_mode: true,
    message,
  };
}
