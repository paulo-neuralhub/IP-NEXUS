// ============================================
// supabase/functions/assistant-portal/index.ts
// Portal AI Assistant for Clients (RESTRICTED)
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// HIGHLY RESTRICTIVE system prompt for client portal
const PORTAL_SYSTEM_PROMPT = `Eres un asistente informativo para clientes de un despacho de abogados de Propiedad Intelectual.

RESTRICCIONES ABSOLUTAS - NUNCA VIOLAR:
1. NUNCA proporciones asesoramiento legal de ningún tipo
2. NUNCA interpretes documentos legales
3. NUNCA hagas recomendaciones sobre acciones legales
4. NUNCA opines sobre probabilidades de éxito
5. NUNCA discutas estrategias legales

LO QUE SÍ PUEDES HACER:
- Informar sobre el ESTADO ACTUAL de los asuntos (en trámite, concedido, etc.)
- Listar documentos pendientes de entregar
- Informar sobre próximas fechas y vencimientos
- Explicar los PASOS GENERALES de un proceso (sin dar consejo)
- Ofrecer contactar con el abogado responsable

RESPUESTAS TIPO ANTE PREGUNTAS PROHIBIDAS:
- "Para asesoramiento legal específico, le recomiendo contactar directamente con su abogado responsable."
- "No puedo proporcionar interpretaciones legales. Su abogado puede ayudarle con eso."
- "Esa pregunta requiere asesoramiento profesional. ¿Desea que programe una consulta?"

TONO:
- Profesional y cortés
- Informativo pero no interpretativo
- Siempre ofrecer contacto con humano

Si detectas que el usuario busca asesoramiento legal, DETENTE y ofrece contactar con el despacho.`;

// Intent classification prompt
const INTENT_CHECK_PROMPT = `Clasifica si el siguiente mensaje del usuario busca asesoramiento legal.
Responde SOLO con JSON: {"seeks_legal_advice": true/false, "reason": "breve explicación"}

Considera como BUSCA ASESORAMIENTO LEGAL si:
- Pregunta qué debería hacer
- Pide opinión sobre probabilidades
- Solicita interpretación de documentos
- Pregunta sobre estrategias
- Usa frases como "¿me conviene?", "¿qué me recomienda?", "¿crees que...?"

Considera como NO BUSCA si:
- Solo pregunta por estado de asuntos
- Consulta fechas o vencimientos
- Lista de documentos pendientes
- Información de contacto`;

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
      portal_user_id 
    } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if portal assistant is enabled
    const { data: config } = await supabase
      .from('tenant_ai_config')
      .select('client_portal_enabled, client_assistant_enabled')
      .eq('organization_id', organization_id)
      .maybeSingle();

    const portalEnabled = config?.client_portal_enabled !== false && 
                          config?.client_assistant_enabled !== false;

    if (!portalEnabled) {
      return new Response(
        JSON.stringify({ error: 'Portal assistant not enabled' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Intent classification (check for legal advice requests)
    const intentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: INTENT_CHECK_PROMPT },
          { role: 'user', content: message }
        ],
        temperature: 0,
        max_tokens: 100
      })
    });

    if (!intentResponse.ok) {
      console.error('Intent check failed, proceeding with caution');
    }

    let seeksLegalAdvice = false;
    try {
      const intentResult = await intentResponse.json();
      const intentContent = intentResult.choices?.[0]?.message?.content || '{}';
      // Try to extract JSON from the response
      const jsonMatch = intentContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const intentCheck = JSON.parse(jsonMatch[0]);
        seeksLegalAdvice = intentCheck.seeks_legal_advice === true;
      }
    } catch (e) {
      console.error('Failed to parse intent check:', e);
    }

    // If seeking legal advice, return safe response
    if (seeksLegalAdvice) {
      const safeResponse = `Entiendo su consulta, pero no puedo proporcionar asesoramiento legal.

Para obtener orientación profesional sobre su caso, le recomiendo:

1. **Contactar con su abogado responsable** - Puede enviar un mensaje directo desde el portal
2. **Solicitar una cita** - Programe una consulta para discutir su situación
3. **Revisar la documentación** - En la sección "Mis Documentos" puede acceder a los informes de su expediente

¿Desea que le ayude a contactar con el despacho o programar una cita?

---
ℹ️ *Soy un asistente informativo. Para asesoramiento legal, por favor contacte directamente con su abogado.*`;

      // Log blocked interaction
      await supabase.from('legalops_ai_interactions').insert({
        organization_id,
        interaction_type: 'assistant_query',
        input_text: message,
        output_text: safeResponse,
        output_metadata: { 
          blocked: true, 
          reason: 'legal_advice_requested',
          portal: true
        },
        model_provider: 'lovable',
        model_name: 'google/gemini-2.5-flash-lite',
        status: 'blocked'
      });

      return new Response(JSON.stringify({
        response: safeResponse,
        sources: [],
        confidence: 1.0,
        blocked: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Step 2: For permitted queries, get factual information
    // Get client's matters and documents (limited data)
    const { data: clientData } = await supabase
      .from('contacts')
      .select(`
        id, 
        display_name
      `)
      .eq('organization_id', organization_id)
      .eq('portal_user_id', portal_user_id)
      .maybeSingle();

    let factualContext = `
INFORMACIÓN DEL CLIENTE:
Nombre: ${clientData?.display_name || 'Cliente'}
`;

    // Get client's matters if we have client ID
    if (clientData?.id) {
      const { data: matters } = await supabase
        .from('matters')
        .select('id, title, reference_number, status')
        .eq('organization_id', organization_id)
        .eq('client_id', clientData.id)
        .limit(10);

      if (matters && matters.length > 0) {
        factualContext += `
ASUNTOS ACTIVOS:
${matters.map((m: any) => 
  `- ${m.reference_number}: ${m.title} (Estado: ${m.status})`
).join('\n')}
`;
      } else {
        factualContext += '\nASUNTOS ACTIVOS:\nNo hay asuntos activos registrados.';
      }

      // Get pending documents
      const { data: docs } = await supabase
        .from('client_documents')
        .select('id, title, doc_type, validity_status')
        .eq('organization_id', organization_id)
        .eq('client_id', clientData.id)
        .limit(10);

      if (docs && docs.length > 0) {
        factualContext += `
DOCUMENTOS:
${docs.map((d: any) => 
  `- ${d.title} (${d.doc_type || 'documento'}) - ${d.validity_status || 'activo'}`
).join('\n')}
`;
      }
    }

    // Step 3: Generate limited response
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: PORTAL_SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: `CONTEXTO FACTUAL:\n${factualContext}\n\nPREGUNTA DEL CLIENTE:\n${message}` 
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI Gateway error');
    }

    const result = await response.json();
    let assistantResponse = result.choices?.[0]?.message?.content || 'No puedo procesar su consulta en este momento.';

    // Add mandatory disclaimer
    assistantResponse += `

---
ℹ️ *Soy un asistente informativo. No proporciono asesoramiento legal. Para consultas legales, contacte con su abogado.*`;

    // Log interaction
    await supabase.from('legalops_ai_interactions').insert({
      organization_id,
      interaction_type: 'assistant_query',
      input_text: message,
      output_text: assistantResponse,
      output_metadata: { portal: true, client_id: clientData?.id },
      model_provider: 'lovable',
      model_name: 'google/gemini-2.5-flash-lite',
      status: 'completed'
    });

    return new Response(JSON.stringify({
      response: assistantResponse,
      sources: [],
      confidence: 0.9,
      blocked: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Portal assistant error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
