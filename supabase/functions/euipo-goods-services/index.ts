import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// EUIPO Goods & Services API (TMclass)
// Documentation: https://dev.euipo.europa.eu

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const { action, terms, text, language = 'es', niceClass, targetLanguage } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get EUIPO connection config
    const { data: connection, error: connError } = await supabase
      .from('external_api_connections')
      .select('*')
      .eq('provider', 'euipo')
      .single();

    if (connError) {
      console.error('Error fetching EUIPO connection:', connError);
    }

    let result: any;
    switch (action) {
      case 'search':
        result = await searchTerms(text, language, niceClass, connection);
        break;
      case 'validate':
        result = await validateTerms(terms, language, connection);
        break;
      case 'translate':
        result = await translateTerms(terms, language, targetLanguage, connection);
        break;
      case 'suggest':
        result = await suggestTerms(text, language, niceClass, connection);
        break;
      default:
        result = { error: 'Unknown action. Use: search, validate, translate, or suggest' };
    }

    // Log the request
    if (connection) {
      await supabase.from('external_api_logs').insert({
        connection_id: connection.id,
        provider: 'euipo',
        endpoint: `/gs/${action}`,
        method: 'POST',
        request_params: { action, text, language, niceClass },
        response_status: result.error ? 400 : 200,
        response_time_ms: Date.now() - startTime,
        success: !result.error,
        error_message: result.error || null,
        triggered_by: 'api',
      });

      // Update request counters
      await supabase
        .from('external_api_connections')
        .update({
          requests_today: (connection.requests_today || 0) + 1,
          total_requests: (connection.total_requests || 0) + 1,
        })
        .eq('id', connection.id);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('EUIPO G&S error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function searchTerms(text: string, language: string, niceClass?: number, connection?: any) {
  // In production, this would call the actual EUIPO TMclass API
  // For now, return structured mock data based on input
  
  console.log('Searching EUIPO G&S:', { text, language, niceClass });
  
  // Simulated TMclass response
  const mockResults = generateMockGSResults(text, niceClass);
  
  return {
    query: text,
    language,
    results: mockResults,
    total: mockResults.length,
    source: 'TMclass (EUIPO)',
    cached: false,
  };
}

async function validateTerms(terms: string[], language: string, connection?: any) {
  console.log('Validating terms:', { terms, language });
  
  // Validate each term
  const validationResults = terms.map(term => ({
    term,
    valid: true, // In production: check against TMclass
    suggestions: [],
    niceClass: guessNiceClass(term),
    confidence: 0.85,
  }));

  return {
    language,
    results: validationResults,
    allValid: validationResults.every(r => r.valid),
    source: 'TMclass (EUIPO)',
  };
}

async function translateTerms(terms: string[], sourceLanguage: string, targetLanguage: string, connection?: any) {
  console.log('Translating terms:', { terms, sourceLanguage, targetLanguage });
  
  // In production: use TMclass translation API
  const translations = terms.map(term => ({
    original: term,
    translated: `[${targetLanguage.toUpperCase()}] ${term}`, // Placeholder
    confidence: 0.95,
  }));

  return {
    sourceLanguage,
    targetLanguage,
    translations,
    source: 'TMclass (EUIPO)',
  };
}

async function suggestTerms(text: string, language: string, niceClass?: number, connection?: any) {
  console.log('Suggesting terms:', { text, language, niceClass });
  
  // Generate suggestions based on input
  const suggestions = generateMockSuggestions(text, niceClass);
  
  return {
    query: text,
    language,
    suggestions,
    source: 'TMclass (EUIPO)',
  };
}

function generateMockGSResults(text: string, niceClass?: number) {
  const termLower = text.toLowerCase();
  
  // Common terms by keyword
  const termDatabase: Record<string, Array<{ term: string; class: number; description: string }>> = {
    'software': [
      { term: 'Computer software', class: 9, description: 'Recorded or downloadable computer software' },
      { term: 'Software as a service [SaaS]', class: 42, description: 'Providing online non-downloadable software' },
      { term: 'Application software', class: 9, description: 'Application software for mobile devices' },
      { term: 'Software development', class: 42, description: 'Software development services' },
    ],
    'marca': [
      { term: 'Trademark registration services', class: 45, description: 'Legal services relating to trademarks' },
      { term: 'Brand evaluation services', class: 35, description: 'Business consultancy relating to brands' },
    ],
    'consultor': [
      { term: 'Business consultancy', class: 35, description: 'Professional business consultancy' },
      { term: 'Legal consultancy', class: 45, description: 'Legal advisory services' },
      { term: 'Management consultancy', class: 35, description: 'Business management consultancy' },
    ],
    'ropa': [
      { term: 'Clothing', class: 25, description: 'Articles of clothing' },
      { term: 'Footwear', class: 25, description: 'Shoes and footwear' },
      { term: 'Headgear', class: 25, description: 'Hats, caps, and headwear' },
    ],
    'restaurante': [
      { term: 'Restaurant services', class: 43, description: 'Providing food and drink' },
      { term: 'Catering services', class: 43, description: 'Catering for events' },
      { term: 'Bar services', class: 43, description: 'Providing beverages' },
    ],
  };

  // Find matching terms
  let results: Array<{ term: string; class: number; description: string; score: number }> = [];
  
  for (const [keyword, terms] of Object.entries(termDatabase)) {
    if (termLower.includes(keyword) || keyword.includes(termLower)) {
      results.push(...terms.map(t => ({ ...t, score: 0.9 })));
    }
  }

  // Filter by class if specified
  if (niceClass) {
    results = results.filter(r => r.class === niceClass);
  }

  // If no results, return generic ones
  if (results.length === 0) {
    results = [
      { term: text, class: niceClass || 35, description: 'Custom term (requires validation)', score: 0.5 },
    ];
  }

  return results.slice(0, 10);
}

function generateMockSuggestions(text: string, niceClass?: number) {
  const suggestions = [
    { term: `${text} services`, class: 35, confidence: 0.9 },
    { term: `${text} software`, class: 9, confidence: 0.85 },
    { term: `${text} consulting`, class: 35, confidence: 0.8 },
    { term: `Online ${text}`, class: 42, confidence: 0.75 },
  ];

  if (niceClass) {
    return suggestions.filter(s => s.class === niceClass);
  }

  return suggestions;
}

function guessNiceClass(term: string): number {
  const termLower = term.toLowerCase();
  
  if (termLower.includes('software') || termLower.includes('app') || termLower.includes('electronic')) return 9;
  if (termLower.includes('clothing') || termLower.includes('ropa') || termLower.includes('shoes')) return 25;
  if (termLower.includes('restaurant') || termLower.includes('hotel') || termLower.includes('catering')) return 43;
  if (termLower.includes('legal') || termLower.includes('lawyer') || termLower.includes('trademark')) return 45;
  if (termLower.includes('consulting') || termLower.includes('business') || termLower.includes('marketing')) return 35;
  if (termLower.includes('design') || termLower.includes('hosting') || termLower.includes('saas')) return 42;
  
  return 35; // Default to business services
}