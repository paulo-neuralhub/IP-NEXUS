import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WIPO Madrid System API
// Documentación: https://www.wipo.int/madrid/en/

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { 
      query,
      mark_name,
      holder_name,
      designated_countries,
      nice_classes,
      page = 1,
    } = await req.json();
    
    console.log('WIPO Madrid Search params:', { query, mark_name, designated_countries });
    
    const searchTerm = mark_name || query || '';
    
    // WIPO Global Brand Database es pública
    // Para Madrid Monitor API se requiere registro
    
    // Mock response con formato WIPO Madrid
    const mockMarks = [
      {
        int_reg_number: 'WO' + Math.random().toString().slice(2, 10),
        mark_name: searchTerm || 'INTERNATIONAL BRAND',
        holder_name: 'Global Holdings Inc.',
        holder_country: 'US',
        origin_office: 'US',
        int_reg_date: '2022-03-15',
        expiry_date: '2032-03-15',
        designated_countries: designated_countries || ['ES', 'DE', 'FR', 'IT', 'GB'],
        nice_classes: nice_classes || [9, 35, 42],
        status: 'Protected',
        image_url: null,
      },
      {
        int_reg_number: 'WO' + Math.random().toString().slice(2, 10),
        mark_name: searchTerm ? searchTerm + ' GLOBAL' : 'WORLD MARK',
        holder_name: 'European Ventures SA',
        holder_country: 'CH',
        origin_office: 'CH',
        int_reg_date: '2023-07-20',
        expiry_date: '2033-07-20',
        designated_countries: ['US', 'CN', 'JP', 'KR', 'AU'],
        nice_classes: nice_classes || [25, 35],
        status: 'Pending Designation',
        image_url: null,
      }
    ];
    
    const mockResponse = {
      marks: mockMarks,
      total: mockMarks.length,
      page,
    };
    
    console.log('WIPO Madrid Search results:', mockResponse.total);
    
    return new Response(
      JSON.stringify(mockResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('WIPO Madrid search error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
