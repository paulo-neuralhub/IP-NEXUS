// ============================================
// supabase/functions/assistant-internal/index.ts
// Internal AI Assistant for Lawyers (RAG-enabled)
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const INTERNAL_SYSTEM_PROMPT = `Eres un asistente de IA para abogados especializados en Propiedad Intelectual.

REGLAS CRÍTICAS:
1. SIEMPRE cita las fuentes de tu información entre [corchetes]
2. NUNCA inventes información - si no está en el contexto, di "No tengo información sobre esto en los documentos disponibles"
3. Indica tu nivel de confianza cuando sea relevante
4. NO proporciones asesoramiento legal definitivo - presenta opciones y consideraciones
5. Recuerda que el abogado toma la decisión final

FORMATO DE RESPUESTA:
- Sé conciso pero completo
- Usa viñetas para listas
- Cita fuentes como [Doc: nombre] o [Comm: fecha]
- Si la confianza es baja (<70%), indícalo explícitamente

RESTRICCIONES:
- No generes documentos legales completos sin supervisión
- No hagas predicciones sobre resultados de casos
- No des opiniones sobre estrategia legal sin fuentes que lo respalden`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      conversation_history, 
      context, 
      organization_id,
      user_id 
    } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if tenant has AI assistant enabled
    const { data: config } = await supabase
      .from('tenant_ai_config')
      .select('ai_assistant_enabled')
      .eq('organization_id', organization_id)
      .maybeSingle();

    // Default to enabled if no config exists
    const aiEnabled = config?.ai_assistant_enabled !== false;

    if (!aiEnabled) {
      return new Response(
        JSON.stringify({ error: 'AI Assistant not enabled for this organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context from available documents (simplified RAG)
    let contextText = '';
    const sources: any[] = [];

    // Get relevant documents if context is provided
    if (context?.client_id || context?.matter_id) {
      let docsQuery = supabase
        .from('client_documents')
        .select('id, title, doc_type, ocr_text')
        .eq('organization_id', organization_id)
        .not('ocr_text', 'is', null)
        .limit(5);

      if (context?.client_id) {
        docsQuery = docsQuery.eq('client_id', context.client_id);
      }
      if (context?.matter_id) {
        docsQuery = docsQuery.eq('matter_id', context.matter_id);
      }

      const { data: docs } = await docsQuery;

      if (docs && docs.length > 0) {
        contextText = docs
          .map((doc, idx) => {
            sources.push({
              type: 'document',
              id: doc.id,
              title: doc.title || 'Sin título',
              excerpt: (doc.ocr_text || '').substring(0, 200) + '...',
              relevance: 0.85 - (idx * 0.05)
            });
            return `[Fuente ${idx + 1}: Documento - ${doc.title || 'Sin título'}]\n${(doc.ocr_text || '').substring(0, 1000)}`;
          })
          .join('\n\n---\n\n');
      }

      // Get recent communications
      let commsQuery = supabase
        .from('communications')
        .select('id, subject, body_text, channel, created_at')
        .eq('organization_id', organization_id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (context?.client_id) {
        commsQuery = commsQuery.eq('client_id', context.client_id);
      }

      const { data: comms } = await commsQuery;

      if (comms && comms.length > 0) {
        const commsContext = comms
          .map((comm, idx) => {
            sources.push({
              type: 'communication',
              id: comm.id,
              title: comm.subject || `${comm.channel} message`,
              excerpt: (comm.body_text || '').substring(0, 150) + '...',
              relevance: 0.75 - (idx * 0.05)
            });
            return `[Fuente: Comunicación ${comm.channel} - ${comm.subject || 'Sin asunto'}]\n${(comm.body_text || '').substring(0, 500)}`;
          })
          .join('\n\n');
        
        contextText += '\n\n---\n\nCOMUNICACIONES RECIENTES:\n' + commsContext;
      }
    }

    // Build conversation messages
    const conversationMessages = [
      { role: 'system', content: INTERNAL_SYSTEM_PROMPT },
      ...(conversation_history || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Add RAG context and current message
    const userMessageWithContext = `
CONTEXTO DISPONIBLE:
${contextText || 'No se encontraron documentos relevantes en el expediente.'}

---

CONSULTA DEL USUARIO:
${message}

Recuerda: cita las fuentes, indica tu confianza, y nunca inventes información.`;

    conversationMessages.push({
      role: 'user',
      content: userMessageWithContext
    });

    // Call Lovable AI Gateway
    const startTime = Date.now();
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: conversationMessages,
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      throw new Error(`AI Gateway error: ${errorText}`);
    }

    const result = await response.json();
    const assistantResponse = result.choices?.[0]?.message?.content || 'No response generated';

    // Calculate confidence based on sources found
    const confidence = sources.length > 0 
      ? Math.min(0.9, 0.5 + (sources.length * 0.08))
      : 0.3;

    // Log interaction
    await supabase.from('legalops_ai_interactions').insert({
      organization_id,
      user_id,
      client_id: context?.client_id || null,
      matter_id: context?.matter_id || null,
      interaction_type: 'assistant_query',
      input_text: message,
      input_tokens: result.usage?.prompt_tokens || 0,
      output_text: assistantResponse,
      output_tokens: result.usage?.completion_tokens || 0,
      output_metadata: { sources, confidence },
      model_provider: 'lovable',
      model_name: 'google/gemini-3-flash-preview',
      latency_ms: latencyMs,
      status: 'completed'
    });

    // Add disclaimer to response
    const responseWithDisclaimer = `${assistantResponse}

---
⚠️ *Esta respuesta ha sido generada por IA y debe ser verificada por un profesional antes de actuar. Las fuentes citadas deben consultarse directamente.*`;

    return new Response(JSON.stringify({
      response: responseWithDisclaimer,
      sources: sources.slice(0, 5),
      confidence,
      model: 'google/gemini-3-flash-preview'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Internal assistant error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
