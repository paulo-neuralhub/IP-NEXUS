import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * TMview search — queries the EUIPO Trademark Search API (which powers TMview)
 * TMview itself doesn't have a separate REST API; it uses EUIPO's infrastructure.
 * When no credentials are available, returns safe-mode empty response.
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
  if (!res.ok) throw new Error(`TMview/EUIPO auth failed (${res.status})`);
  return (await res.json()).access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      query, trademark_name, phonetic_search = false,
      applicant_name, nice_classes, offices = ['EM'],
      status = 'all', page = 1, page_size = 20,
    } = await req.json();

    console.log('TMView Search params:', { query, trademark_name, offices, phonetic_search });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Reuse EUIPO credentials (TMview uses same backend)
    const { data: connection } = await supabase
      .from('external_api_connections')
      .select('*')
      .eq('provider', 'euipo')
      .eq('status', 'active')
      .single();

    const clientId = connection?.api_key_encrypted || Deno.env.get('EUIPO_CLIENT_ID');
    const clientSecret = connection?.access_token_encrypted || Deno.env.get('EUIPO_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.log('TMView: No credentials – safe mode');
      return json({ trademarks: [], total_count: 0, page, is_safe_mode: true,
        message: 'Configure credenciales EUIPO para búsquedas TMview' });
    }

    try {
      const token = await getAccessToken(clientId, clientSecret);
      const term = trademark_name || query;
      const params = new URLSearchParams();
      if (term) params.append('tradeMarkName', term);
      if (applicant_name) params.append('applicantName', applicant_name);
      if (nice_classes?.length) params.append('niceClass', nice_classes.join(','));
      if (status !== 'all') params.append('tradeMarkStatus', status);
      params.append('pageNumber', String(page));
      params.append('pageSize', String(page_size));

      const apiRes = await fetch(`${API_BASE}/trademarks?${params}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(30000),
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        const items = data.items || data.results || [];
        return json({
          trademarks: items.map((item: any) => ({
            tm_number: item.applicationNumber,
            office: item.officeCode || 'EM',
            mark_name: item.wordElement || item.tradeMarkName || item.name,
            mark_type: item.markType,
            nice_classes: item.niceClasses || [],
            applicant: item.applicantName,
            status: item.status || item.tradeMarkStatus,
            filing_date: item.filingDate || item.applicationDate,
            registration_date: item.registrationDate,
            expiry_date: item.expiryDate,
            image_url: item.imageUrl,
            similarity_score: phonetic_search ? undefined : undefined,
          })),
          total_count: data.totalCount ?? items.length,
          page,
          source: 'tmview',
        });
      }

      console.warn('TMView API error:', apiRes.status);
      return json({ trademarks: [], total_count: 0, page, is_safe_mode: true,
        message: `TMview API respondió ${apiRes.status}` });
    } catch (apiErr) {
      console.error('TMView API call failed:', apiErr);
      return json({ trademarks: [], total_count: 0, page, is_safe_mode: true,
        message: (apiErr as Error).message });
    }
  } catch (error) {
    console.error('TMView search error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
