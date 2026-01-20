// ============================================
// supabase/functions/rag-search/index.ts
// RAG Search Function for Document Retrieval
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      query, 
      client_id, 
      matter_id, 
      doc_types, 
      limit = 10, 
      organization_id 
    } = await req.json();

    if (!organization_id) {
      throw new Error('organization_id is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // For now, do a simple text search
    // In production, this would use pgvector embeddings
    const results: any[] = [];

    // Search in documents
    let docsQuery = supabase
      .from('client_documents')
      .select(`
        id, 
        title, 
        doc_type, 
        ocr_text,
        client:contacts(display_name),
        matter:matters(reference_number)
      `)
      .eq('organization_id', organization_id)
      .not('ocr_text', 'is', null);

    if (client_id) {
      docsQuery = docsQuery.eq('client_id', client_id);
    }
    if (matter_id) {
      docsQuery = docsQuery.eq('matter_id', matter_id);
    }
    if (doc_types && doc_types.length > 0) {
      docsQuery = docsQuery.in('doc_type', doc_types);
    }

    // Simple text search using ilike
    docsQuery = docsQuery.or(`title.ilike.%${query}%,ocr_text.ilike.%${query}%`);
    docsQuery = docsQuery.limit(limit);

    const { data: docs, error: docsError } = await docsQuery;

    if (docsError) {
      console.error('Docs search error:', docsError);
    }

    if (docs) {
      docs.forEach((doc: any, idx: number) => {
        // Calculate simple relevance based on position
        const relevance = 0.9 - (idx * 0.05);
        
        // Extract relevant snippet
        const ocrText = doc.ocr_text || '';
        const queryLower = query.toLowerCase();
        const startIdx = ocrText.toLowerCase().indexOf(queryLower);
        
        let excerpt = '';
        if (startIdx !== -1) {
          const start = Math.max(0, startIdx - 50);
          const end = Math.min(ocrText.length, startIdx + query.length + 150);
          excerpt = (start > 0 ? '...' : '') + ocrText.substring(start, end) + (end < ocrText.length ? '...' : '');
        } else {
          excerpt = ocrText.substring(0, 200) + '...';
        }

        results.push({
          id: `doc-${doc.id}`,
          source_type: 'document',
          source_id: doc.id,
          chunk_text: excerpt,
          relevance,
          metadata: {
            title: doc.title || 'Sin título',
            doc_type: doc.doc_type,
            client_name: doc.client?.display_name,
            matter_ref: doc.matter?.reference_number
          }
        });
      });
    }

    // Search in communications
    let commsQuery = supabase
      .from('communications')
      .select(`
        id, 
        subject, 
        body_text, 
        channel,
        client:contacts(display_name)
      `)
      .eq('organization_id', organization_id)
      .not('body_text', 'is', null);

    if (client_id) {
      commsQuery = commsQuery.eq('client_id', client_id);
    }

    commsQuery = commsQuery.or(`subject.ilike.%${query}%,body_text.ilike.%${query}%`);
    commsQuery = commsQuery.limit(5);

    const { data: comms, error: commsError } = await commsQuery;

    if (commsError) {
      console.error('Comms search error:', commsError);
    }

    if (comms) {
      comms.forEach((comm: any, idx: number) => {
        const relevance = 0.8 - (idx * 0.05);
        const bodyText = comm.body_text || '';
        const excerpt = bodyText.substring(0, 200) + (bodyText.length > 200 ? '...' : '');

        results.push({
          id: `comm-${comm.id}`,
          source_type: 'communication',
          source_id: comm.id,
          chunk_text: excerpt,
          relevance,
          metadata: {
            title: comm.subject || `${comm.channel} message`,
            client_name: comm.client?.display_name
          }
        });
      });
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    return new Response(JSON.stringify({ 
      results: results.slice(0, limit),
      total: results.length,
      query
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('RAG search error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
