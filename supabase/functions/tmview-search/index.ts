import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TMView API - Base de datos mundial de marcas
// Documentación: https://www.tmdn.org/tmview

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { 
      query,
      trademark_name,
      phonetic_search = false,
      applicant_name,
      nice_classes,
      offices = ['EM'],
      status = 'all',
      page = 1,
      page_size = 20
    } = await req.json();
    
    console.log('TMView Search params:', { query, trademark_name, offices, phonetic_search });
    
    const searchTerm = trademark_name || query || '';
    
    // TMView API es pública pero tiene límites de rate
    // Para producción: registrar en TMDN y usar API key
    
    // Mock response con formato TMView
    const mockTrademarks = offices.flatMap((office: string) => [
      {
        tm_number: office + Math.random().toString().slice(2, 10),
        office,
        mark_name: searchTerm || 'EXAMPLE TRADEMARK',
        mark_type: 'Word',
        nice_classes: nice_classes || [9, 35, 42],
        applicant: 'International Corp Ltd.',
        status: 'Registered',
        filing_date: '2023-06-15',
        registration_date: '2024-01-10',
        expiry_date: '2033-06-15',
        image_url: null,
        similarity_score: phonetic_search ? 0.85 : undefined,
      },
      {
        tm_number: office + Math.random().toString().slice(2, 10),
        office,
        mark_name: searchTerm ? searchTerm + 'X' : 'SIMILAR MARK',
        mark_type: 'Figurative',
        nice_classes: nice_classes || [9],
        applicant: 'Local Business S.A.',
        status: 'Pending',
        filing_date: '2024-02-20',
        image_url: null,
        similarity_score: phonetic_search ? 0.72 : undefined,
      }
    ]);
    
    // Filtrar por estado si se especifica
    const filteredTrademarks = status === 'all' 
      ? mockTrademarks 
      : mockTrademarks.filter((t: typeof mockTrademarks[0]) => t.status.toLowerCase() === status);
    
    const mockResponse = {
      trademarks: filteredTrademarks.slice((page - 1) * page_size, page * page_size),
      total_count: filteredTrademarks.length,
      page,
    };
    
    console.log('TMView Search results:', mockResponse.total_count);
    
    return new Response(
      JSON.stringify(mockResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('TMView search error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
