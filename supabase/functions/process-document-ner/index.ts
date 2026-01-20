// ============================================
// supabase/functions/process-document-ner/index.ts
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NER_SYSTEM_PROMPT = `Eres un extractor de entidades especializadas en documentos legales españoles.

Analiza el texto del documento y extrae las siguientes entidades:

ENTIDADES A EXTRAER:
1. FECHAS:
   - date_grant: Fecha de otorgamiento/escritura
   - date_expiry: Fecha de caducidad/vencimiento
   - date_signature: Fecha de firma

2. PARTES:
   - party_grantor: Poderdante/Otorgante (quien da el poder)
   - party_grantee: Apoderado (quien recibe el poder)
   - party_notary: Notario que autoriza

3. IDENTIFICADORES:
   - id_document: DNI/NIF/NIE/Pasaporte
   - reference_protocol: Número de protocolo notarial
   - reference_registry: Referencia registral (mercantil, propiedad)
   - reference_case: Número de expediente

4. OTROS:
   - power_type: Tipo de poder (general, especial, para pleitos, bancario)
   - amount: Importes mencionados

REGLAS:
- Extrae SOLO información que aparece EXPLÍCITAMENTE en el texto
- Normaliza fechas al formato ISO (YYYY-MM-DD)
- Incluye el contexto donde encontraste cada entidad
- Asigna confianza 0.0-1.0 según claridad de la información
- Si hay ambigüedad, indica confianza baja (<0.7)

TIPO DE DOCUMENTO:
Clasifica el documento en una de estas categorías:
- poder_general
- poder_especial
- escritura_constitucion
- certificado_registro
- contrato
- notificacion_oficial
- otro

Responde SOLO con JSON válido:
{
  "document_type": "tipo",
  "document_type_confidence": 0.0-1.0,
  "entities": [
    {
      "type": "entity_type",
      "value": "valor extraído",
      "normalized": "valor normalizado si aplica",
      "confidence": 0.0-1.0,
      "context": "texto circundante"
    }
  ],
  "validity": {
    "valid_from": "YYYY-MM-DD o null",
    "valid_until": "YYYY-MM-DD o null",
    "confidence": 0.0-1.0
  }
}`;

function calculateValidityStatus(validUntil: string): string {
  const daysRemaining = Math.ceil(
    (new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 90) return 'expiring_soon';
  return 'valid';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { document_id, organization_id } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verificar que el tenant tiene NER habilitado
    const { data: config } = await supabase
      .from('tenant_ai_config')
      .select('ai_extraction_enabled')
      .eq('organization_id', organization_id)
      .single();

    if (!config?.ai_extraction_enabled) {
      return new Response(
        JSON.stringify({ error: 'NER extraction not enabled for this organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener documento
    const { data: doc, error: docError } = await supabase
      .from('client_documents')
      .select('id, file_name, ocr_text, doc_type')
      .eq('id', document_id)
      .eq('organization_id', organization_id)
      .single();

    if (docError || !doc) {
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!doc.ocr_text) {
      return new Response(
        JSON.stringify({ error: 'Document has no OCR text. Process OCR first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if OpenAI API key is available
    if (!OPENAI_API_KEY) {
      // Return mock data if no API key
      const mockExtraction = {
        document_type: doc.doc_type || 'otro',
        document_type_confidence: 0.5,
        entities: [],
        validity: null
      };

      await supabase
        .from('client_documents')
        .update({
          ner_status: 'completed',
          ner_completed_at: new Date().toISOString(),
          ner_model: 'mock'
        })
        .eq('id', document_id);

      return new Response(JSON.stringify(mockExtraction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Truncar texto si es muy largo (máximo ~6000 tokens)
    const textToProcess = doc.ocr_text.substring(0, 20000);

    // Llamar a OpenAI
    const startTime = Date.now();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: NER_SYSTEM_PROMPT },
          { role: 'user', content: `Analiza este documento:\n\n${textToProcess}` }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    const latencyMs = Date.now() - startTime;
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'OpenAI API error');
    }

    // Parsear resultado
    const extraction = JSON.parse(result.choices[0].message.content);

    // Actualizar documento
    await supabase
      .from('client_documents')
      .update({
        doc_type: extraction.document_type,
        doc_type_confidence: extraction.document_type_confidence,
        ner_status: 'completed',
        ner_completed_at: new Date().toISOString(),
        ner_model: 'gpt-4o',
        valid_from: extraction.validity?.valid_from,
        valid_until: extraction.validity?.valid_until,
        validity_status: extraction.validity?.valid_until 
          ? calculateValidityStatus(extraction.validity.valid_until)
          : 'pending_verification'
      })
      .eq('id', document_id);

    // Eliminar entidades anteriores
    await supabase
      .from('document_entities')
      .delete()
      .eq('document_id', document_id);

    // Insertar nuevas entidades
    if (extraction.entities?.length > 0) {
      const entities = extraction.entities.map((e: any) => ({
        organization_id,
        document_id,
        entity_type: e.type,
        entity_value: e.value,
        entity_normalized: e.normalized,
        confidence: e.confidence,
        confidence_level: e.confidence >= 0.85 ? 'high' : e.confidence >= 0.70 ? 'medium' : 'low',
        surrounding_text: e.context,
        is_verified: false
      }));

      await supabase.from('document_entities').insert(entities);
    }

    // Registrar interacción
    await supabase.from('legalops_ai_interactions').insert({
      organization_id,
      interaction_type: 'ner_extraction',
      input_text: textToProcess.substring(0, 500) + '...',
      input_tokens: result.usage?.prompt_tokens,
      output_text: JSON.stringify(extraction),
      output_tokens: result.usage?.completion_tokens,
      confidence: extraction.document_type_confidence,
      model_provider: 'openai',
      model_name: 'gpt-4o',
      latency_ms: latencyMs
    });

    return new Response(JSON.stringify(extraction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('NER processing error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
