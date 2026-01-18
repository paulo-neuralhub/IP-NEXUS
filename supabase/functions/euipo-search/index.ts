import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// EUIPO eSearch Plus API
// Documentación: https://euipo.europa.eu/tunnel-web/secure/webdav/guest/document_library/contentPdfs/about_euipo/euipo_development_services/eSearch_Plus_API_Guide_en.pdf

const EUIPO_BASE_URL = 'https://euipo.europa.eu/eSearch';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { 
      query,
      trademark_name,
      applicant_name,
      nice_classes,
      status,
      filing_date_from,
      filing_date_to,
      page = 1,
      page_size = 20
    } = await req.json();
    
    console.log('EUIPO Search params:', { query, trademark_name, applicant_name, nice_classes });
    
    // Construir query para EUIPO
    const searchParams = new URLSearchParams();
    
    if (trademark_name) {
      searchParams.append('basicSearch', trademark_name);
    } else if (query) {
      searchParams.append('basicSearch', query);
    }
    
    if (applicant_name) {
      searchParams.append('applicantName', applicant_name);
    }
    
    if (nice_classes && nice_classes.length > 0) {
      searchParams.append('niceClass', nice_classes.join(','));
    }
    
    if (status) {
      searchParams.append('trademarkStatus', status);
    }
    
    if (filing_date_from) {
      searchParams.append('applicationDateFrom', filing_date_from);
    }
    
    if (filing_date_to) {
      searchParams.append('applicationDateTo', filing_date_to);
    }
    
    searchParams.append('pageNumber', String(page));
    searchParams.append('pageSize', String(page_size));
    searchParams.append('territories', 'EM'); // Solo EUIPO
    
    // Nota: En producción real, usar la API oficial de EUIPO
    // La API pública eSearch no requiere autenticación para búsquedas básicas
    // Para acceso completo se necesita registro en EUIPO Developer Portal
    
    // Por ahora retornamos datos de ejemplo (mock)
    // En producción: const response = await fetch(`${EUIPO_BASE_URL}?${searchParams.toString()}`);
    const mockResponse = {
      trademarks: [
        {
          application_number: '018' + Math.random().toString().slice(2, 8),
          registration_number: '018' + Math.random().toString().slice(2, 8),
          mark_name: trademark_name || query || 'EXAMPLE MARK',
          mark_type: 'Word',
          nice_classes: nice_classes || [9, 42],
          applicant_name: 'Example Company S.L.',
          applicant_country: 'ES',
          representative_name: 'IP Law Firm',
          filing_date: '2024-01-15',
          registration_date: '2024-06-15',
          expiry_date: '2034-01-15',
          status: 'Registered',
          image_url: null,
        },
        {
          application_number: '018' + Math.random().toString().slice(2, 8),
          mark_name: (trademark_name || query || 'SIMILAR') + ' PLUS',
          mark_type: 'Word',
          nice_classes: nice_classes || [9],
          applicant_name: 'Tech Solutions GmbH',
          applicant_country: 'DE',
          filing_date: '2023-09-20',
          status: 'Pending',
          image_url: null,
        }
      ],
      total_count: 2,
      page,
      page_size,
    };
    
    console.log('EUIPO Search results:', mockResponse.total_count);
    
    return new Response(
      JSON.stringify(mockResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('EUIPO search error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
