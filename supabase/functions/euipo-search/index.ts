import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// EUIPO eSearch Plus API - Enhanced with connection management
// Documentation: https://euipo.europa.eu/tunnel-web/secure/webdav/guest/document_library/contentPdfs/about_euipo/euipo_development_services/eSearch_Plus_API_Guide_en.pdf

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const startTime = Date.now();
  
  try {
    const { 
      query,
      trademark_name,
      applicant_name,
      representative_name,
      nice_classes,
      status,
      filing_date_from,
      filing_date_to,
      page = 1,
      page_size = 20
    } = await req.json();
    
    console.log('EUIPO Search params:', { query, trademark_name, applicant_name, nice_classes });
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get EUIPO connection config
    const { data: connection, error: connError } = await supabase
      .from('external_api_connections')
      .select('*')
      .eq('provider', 'euipo')
      .single();

    // Build search params
    const searchParams = new URLSearchParams();
    
    if (trademark_name) {
      searchParams.append('basicSearch', trademark_name);
    } else if (query) {
      searchParams.append('basicSearch', query);
    }
    
    if (applicant_name) {
      searchParams.append('applicantName', applicant_name);
    }
    
    if (representative_name) {
      searchParams.append('representativeName', representative_name);
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
    searchParams.append('territories', 'EM');
    
    // Check if we have active connection with credentials
    const hasActiveConnection = connection && 
      connection.status === 'active' && 
      (connection.access_token_encrypted || connection.api_key_encrypted);
    
    let responseData;
    
    if (hasActiveConnection) {
      // Try to call actual EUIPO API
      try {
        const apiResponse = await fetch(
          `${connection.api_base_url || 'https://api.euipo.europa.eu/v1'}/trademark/search?${searchParams.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${connection.access_token_encrypted}`,
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(connection.timeout_seconds * 1000 || 30000),
          }
        );
        
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          responseData = transformEUIPOResponse(data, page, page_size);
        } else {
          console.log('EUIPO API returned error, falling back to mock data');
          responseData = generateMockResponse(trademark_name || query, nice_classes, page, page_size);
        }
      } catch (apiError) {
        console.error('EUIPO API call failed:', apiError);
        responseData = generateMockResponse(trademark_name || query, nice_classes, page, page_size);
      }
    } else {
      // No active connection, return mock data
      console.log('No active EUIPO connection, returning mock data');
      responseData = generateMockResponse(trademark_name || query, nice_classes, page, page_size);
    }
    
    // Log the request
    if (connection) {
      await supabase.from('external_api_logs').insert({
        connection_id: connection.id,
        provider: 'euipo',
        endpoint: '/trademark/search',
        method: 'GET',
        request_params: { query, trademark_name, applicant_name, nice_classes, status },
        response_status: 200,
        response_time_ms: Date.now() - startTime,
        success: true,
        triggered_by: 'api',
      });

      // Update request counters
      await supabase
        .from('external_api_connections')
        .update({
          requests_today: (connection.requests_today || 0) + 1,
          total_requests: (connection.total_requests || 0) + 1,
          avg_response_ms: Math.round(((connection.avg_response_ms || 0) + (Date.now() - startTime)) / 2),
        })
        .eq('id', connection.id);
    }
    
    console.log('EUIPO Search results:', responseData.total_count);
    
    return new Response(
      JSON.stringify(responseData),
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

function transformEUIPOResponse(data: any, page: number, pageSize: number) {
  // Transform actual EUIPO API response to our format
  return {
    trademarks: (data.items || []).map((item: any) => ({
      application_number: item.applicationNumber,
      registration_number: item.registrationNumber,
      mark_name: item.wordElement || item.markVerbalElement,
      mark_type: item.markType,
      nice_classes: item.niceClasses || [],
      applicant_name: item.applicantName,
      applicant_country: item.applicantCountryCode,
      representative_name: item.representativeName,
      filing_date: item.filingDate,
      registration_date: item.registrationDate,
      expiry_date: item.expiryDate,
      status: item.status,
      image_url: item.imageUrl,
    })),
    total_count: data.totalCount || data.items?.length || 0,
    page,
    page_size: pageSize,
  };
}

function generateMockResponse(searchTerm: string, niceClasses: number[] | null, page: number, pageSize: number) {
  // Generate realistic mock data based on search term
  const baseName = searchTerm?.toUpperCase() || 'EXAMPLE';
  
  return {
    trademarks: [
      {
        application_number: '018' + Math.random().toString().slice(2, 8),
        registration_number: '018' + Math.random().toString().slice(2, 8),
        mark_name: baseName,
        mark_type: 'Word',
        nice_classes: niceClasses || [9, 42],
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
        mark_name: baseName + ' PLUS',
        mark_type: 'Word',
        nice_classes: niceClasses || [9],
        applicant_name: 'Tech Solutions GmbH',
        applicant_country: 'DE',
        representative_name: 'German IP Attorneys',
        filing_date: '2023-09-20',
        status: 'Pending',
        image_url: null,
      },
      {
        application_number: '018' + Math.random().toString().slice(2, 8),
        mark_name: baseName + ' PRO',
        mark_type: 'Figurative',
        nice_classes: niceClasses || [35, 42],
        applicant_name: 'Innovation Corp',
        applicant_country: 'FR',
        filing_date: '2023-11-10',
        status: 'Registered',
        image_url: null,
      },
    ],
    total_count: 3,
    page,
    page_size: pageSize,
    is_mock: true,
    message: 'EUIPO API no configurada - datos de ejemplo',
  };
}