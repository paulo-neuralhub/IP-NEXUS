import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * WIPO Global Brand Database search
 * Uses the public GBD internal API at branddb.wipo.int
 * No API key required — public access with rate limits
 */

const GBD_API = 'https://branddb.wipo.int/branddb/en/api/search';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      query, mark_name, holder_name,
      designated_countries, nice_classes,
      page = 1, page_size = 20,
    } = await req.json();

    const searchTerm = mark_name || query || '';
    console.log('WIPO GBD Search:', { searchTerm, holder_name, designated_countries });

    if (!searchTerm && !holder_name) {
      return json({ marks: [], total: 0, page, message: 'Proporcione un término de búsqueda' });
    }

    // Build GBD query using their internal search syntax
    // GBD uses a Solr-like query syntax
    const queryParts: string[] = [];
    if (searchTerm) queryParts.push(`brandName:${searchTerm}`);
    if (holder_name) queryParts.push(`holderName:${holder_name}`);
    if (nice_classes?.length) queryParts.push(`niceClass:(${nice_classes.join(' OR ')})`);
    if (designated_countries?.length) queryParts.push(`designationCountryCode:(${designated_countries.join(' OR ')})`);

    const start = (page - 1) * page_size;

    try {
      // The GBD has an internal JSON API used by the web frontend
      const apiRes = await fetch(`${GBD_API}?${new URLSearchParams({
        q: queryParts.join(' AND ') || searchTerm,
        rows: String(page_size),
        start: String(start),
        sort: 'score desc',
        fcontent: 'brandName',
      })}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'IP-NEXUS/1.0',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        const docs = data.response?.docs || data.docs || [];
        const total = data.response?.numFound || data.numFound || 0;

        return json({
          marks: docs.map((doc: any) => ({
            int_reg_number: doc.registrationNumber || doc.applicationNumber,
            mark_name: doc.brandName || doc.markVerbalElementText,
            holder_name: doc.holderName || doc.applicantName,
            holder_country: doc.holderCountryCode || doc.applicantCountryCode,
            origin_office: doc.officeCode || doc.originCountryCode,
            int_reg_date: doc.registrationDate || doc.applicationDate,
            expiry_date: doc.expiryDate,
            designated_countries: doc.designationCountryCode || [],
            nice_classes: doc.niceClassNumber || [],
            status: doc.status || doc.markCurrentStatusCode,
            image_url: doc.markImageURL || null,
          })),
          total,
          page,
          source: 'wipo_gbd',
        });
      }

      // GBD might block or return HTML — fall back gracefully
      console.warn('WIPO GBD returned', apiRes.status);
      return json({
        marks: [], total: 0, page,
        is_safe_mode: true,
        message: `WIPO GBD respondió ${apiRes.status}. Pruebe directamente en branddb.wipo.int`,
        search_url: `https://branddb.wipo.int/branddb/en/?q=${encodeURIComponent(searchTerm)}`,
      });
    } catch (apiErr) {
      console.error('WIPO GBD API error:', apiErr);
      return json({
        marks: [], total: 0, page,
        is_safe_mode: true,
        message: 'No se pudo conectar con WIPO GBD. Pruebe directamente.',
        search_url: `https://branddb.wipo.int/branddb/en/?q=${encodeURIComponent(searchTerm)}`,
      });
    }
  } catch (error) {
    console.error('WIPO Madrid search error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
