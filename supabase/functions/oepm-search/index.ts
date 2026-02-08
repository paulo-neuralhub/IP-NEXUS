import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * OEPM Localizador Web — Spanish Patent & Trademark Office
 * Uses the public web search at consultas2.oepm.es
 * For full API access: requires FNMT digital certificate
 * This implementation scrapes the public Localizador results page
 */

const OEPM_BASE = 'https://consultas2.oepm.es/LocalizadorWeb';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      query, trademark_name, applicant_name,
      nice_classes, status, search_type = 'trademark',
      mark_type, filing_date_from, filing_date_to,
      page = 1, page_size = 20,
    } = await req.json();

    console.log('OEPM Search params:', { query, trademark_name, search_type, nice_classes });

    const searchTerm = trademark_name || query || '';
    if (!searchTerm && !applicant_name) {
      return json({ trademarks: [], total_count: 0, page, page_size,
        message: 'Proporcione un término de búsqueda' });
    }

    // Build OEPM search URL
    const params = new URLSearchParams();
    if (searchTerm) params.append('denominacion', searchTerm);
    if (applicant_name) params.append('titular', applicant_name);
    if (nice_classes?.length) params.append('claseNiza', nice_classes.join(','));
    if (mark_type) {
      const typeMap: Record<string, string> = {
        word: 'DENOMINATIVA', figurative: 'GRAFICA',
        combined: 'MIXTA', sound: 'SONORA', '3d': 'TRIDIMENSIONAL',
      };
      if (typeMap[mark_type]) params.append('tipoMarca', typeMap[mark_type]);
    }

    const searchUrl = `${OEPM_BASE}/BusquedaMarcas?${params}`;
    console.log('OEPM Search URL:', searchUrl);

    try {
      // Fetch the OEPM search page
      const res = await fetch(searchUrl, {
        headers: {
          Accept: 'text/html',
          'User-Agent': 'IP-NEXUS/1.0',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        console.warn('OEPM returned', res.status);
        return json({
          trademarks: [], total_count: 0, page, page_size,
          is_safe_mode: true,
          message: `OEPM respondió ${res.status}`,
          search_url: searchUrl,
        });
      }

      const html = await res.text();
      
      // Parse HTML results — extract trademark data from table rows
      const trademarks = parseOEPMResults(html, page_size);
      const totalMatch = html.match(/(\d+)\s+resultado/i);
      const totalCount = totalMatch ? parseInt(totalMatch[1]) : trademarks.length;

      if (trademarks.length === 0 && !html.includes('resultado')) {
        // OEPM might have changed their page structure
        return json({
          trademarks: [], total_count: 0, page, page_size,
          is_safe_mode: true,
          message: 'No se pudieron extraer resultados de OEPM. Consulte directamente.',
          search_url: searchUrl,
        });
      }

      return json({
        trademarks,
        total_count: totalCount,
        page,
        page_size,
        source: 'oepm',
        search_url: searchUrl,
      });
    } catch (fetchErr) {
      console.error('OEPM fetch failed:', fetchErr);
      return json({
        trademarks: [], total_count: 0, page, page_size,
        is_safe_mode: true,
        message: 'No se pudo conectar con OEPM. Consulte directamente.',
        search_url: searchUrl,
      });
    }
  } catch (err) {
    console.error('OEPM search error:', err);
    return new Response(JSON.stringify({
      error: (err as Error).message,
      trademarks: [], total_count: 0,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Parse OEPM Localizador HTML results page.
 * The page uses a <table> with rows containing trademark info.
 */
function parseOEPMResults(html: string, maxResults: number): any[] {
  const trademarks: any[] = [];
  
  // OEPM uses a results table — extract rows between <tr> tags
  // Pattern: each result has number, denomination, type, class, applicant, date, status
  const rowPattern = /<tr[^>]*class="[^"]*resultado[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  
  let rowMatch;
  while ((rowMatch = rowPattern.exec(html)) !== null && trademarks.length < maxResults) {
    const rowHtml = rowMatch[1];
    const cells: string[] = [];
    let cellMatch;
    
    while ((cellMatch = cellPattern.exec(rowHtml)) !== null) {
      // Strip HTML tags from cell content
      cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
    }
    
    if (cells.length >= 4) {
      trademarks.push({
        application_number: cells[0] || undefined,
        mark_name: cells[1] || undefined,
        mark_type: cells[2] || undefined,
        nice_classes: cells[3] ? cells[3].split(',').map((c: string) => parseInt(c.trim())).filter((n: number) => !isNaN(n)) : [],
        applicant_name: cells[4] || undefined,
        filing_date: cells[5] || undefined,
        status: cells[6] || undefined,
        status_es: cells[6] || undefined,
        applicant_country: 'ES',
        source_url: `https://consultas2.oepm.es/LocalizadorWeb/BusquedaMarcas?numExp=${cells[0]}`,
      });
    }
  }

  // Fallback: try to find links to individual trademarks
  if (trademarks.length === 0) {
    const linkPattern = /href="[^"]*numExp=([^"&]+)"[^>]*>([^<]+)</gi;
    let linkMatch;
    while ((linkMatch = linkPattern.exec(html)) !== null && trademarks.length < maxResults) {
      trademarks.push({
        application_number: linkMatch[1],
        mark_name: linkMatch[2].trim(),
        applicant_country: 'ES',
        source_url: `https://consultas2.oepm.es/LocalizadorWeb/BusquedaMarcas?numExp=${linkMatch[1]}`,
      });
    }
  }

  return trademarks;
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
