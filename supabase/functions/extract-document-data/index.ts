// ============================================================
// supabase/functions/extract-document-data/index.ts
// Extracción inteligente de datos de documentos con Lovable AI
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      document_id, 
      storage_path, 
      matter_id, 
      client_id, 
      organization_id,
      document_source = 'matter_documents',
      file_name,
      ocr_text  // Si ya se hizo OCR previamente
    } = await req.json();

    if (!organization_id) {
      return new Response(
        JSON.stringify({ error: 'organization_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Obtener texto del documento
    let textToProcess = ocr_text;
    let fileData: Blob | null = null;
    let detectedFileType = '';

    if (!textToProcess && storage_path) {
      // Descargar documento para obtener texto o imagen
      const bucket = document_source === 'matter_documents' ? 'matter-documents' : 'client-documents';
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(storage_path);
      
      if (error) {
        console.error('Error downloading file:', error);
        return new Response(
          JSON.stringify({ error: 'Document not found in storage' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      fileData = data;
      detectedFileType = data.type;
    }

    // 2. Obtener datos actuales del expediente (si existe)
    let currentMatterData: any = null;
    if (matter_id) {
      const { data: matter } = await supabase
        .from('matters_v2')
        .select(`
          id, matter_number, internal_reference, title, status,
          matter_type, matter_subtype, jurisdiction_primary,
          application_number, registration_number, publication_number,
          filing_date, registration_date, grant_date, expiry_date, priority_date,
          nice_classes, goods_services_description,
          client_id
        `)
        .eq('id', matter_id)
        .single();
      
      currentMatterData = matter;

      // También obtener filings si existen
      const { data: filings } = await supabase
        .from('matter_filings')
        .select('*')
        .eq('matter_id', matter_id);
      
      if (filings?.length) {
        currentMatterData.filings = filings;
      }
    }

    // 3. Obtener datos del cliente si existe
    let currentClientData: any = null;
    const effectiveClientId = client_id || currentMatterData?.client_id;
    if (effectiveClientId) {
      const { data: client } = await supabase
        .from('contacts')
        .select('id, name, email, phone, company_name, vat_number, address')
        .eq('id', effectiveClientId)
        .single();
      
      currentClientData = client;
    }

    // 4. Construir prompt de extracción
    const extractionPrompt = buildExtractionPrompt(currentMatterData, currentClientData);

    // 5. Llamar a Lovable AI
    const startTime = Date.now();
    
    let aiRequestBody: any = {
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: extractionPrompt }
      ],
      temperature: 0.1,
      max_tokens: 4096,
    };

    // Si tenemos archivo de imagen o PDF, usar vision
    if (fileData && (detectedFileType.startsWith('image/') || detectedFileType === 'application/pdf')) {
      const base64 = await blobToBase64(fileData);
      aiRequestBody.messages.push({
        role: 'user',
        content: [
          { type: 'text', text: 'Analiza este documento y extrae toda la información relevante según las instrucciones.' },
          { 
            type: 'image_url', 
            image_url: { 
              url: `data:${detectedFileType};base64,${base64}` 
            } 
          }
        ]
      });
    } else if (textToProcess) {
      // Solo texto
      aiRequestBody.messages.push({
        role: 'user',
        content: `Analiza este documento y extrae toda la información relevante:\n\n${textToProcess.substring(0, 30000)}`
      });
    } else {
      return new Response(
        JSON.stringify({ error: 'No text or file provided for extraction' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar API key
    if (!LOVABLE_API_KEY) {
      console.log('LOVABLE_API_KEY not configured, returning demo response');
      return new Response(
        JSON.stringify({
          success: true,
          extraction_id: null,
          document_type: 'demo',
          suggestions: [],
          message: 'Demo mode: Configure LOVABLE_API_KEY for real extraction'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiRequestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    const processingTime = Date.now() - startTime;

    // 6. Parsear respuesta
    const aiContent = result.choices?.[0]?.message?.content || '';
    const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || aiContent.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('Could not parse AI response:', aiContent);
      throw new Error('Could not parse extraction response');
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const extractedData = JSON.parse(jsonStr);

    // 7. Guardar extracción en BD
    const { data: extraction, error: insertError } = await supabase
      .from('document_extractions')
      .insert({
        organization_id,
        document_id,
        document_source,
        storage_path,
        file_name: file_name || storage_path?.split('/').pop(),
        file_type: detectedFileType,
        matter_id,
        client_id: effectiveClientId,
        document_type: extractedData.document_type,
        detected_jurisdiction: extractedData.jurisdiction,
        detected_language: extractedData.language,
        confidence_score: extractedData.confidence,
        raw_text: textToProcess?.substring(0, 10000),
        extracted_entities: extractedData.extracted_entities,
        suggestions: extractedData.suggestions || [],
        client_data: extractedData.client_data_if_new,
        status: 'pending',
        processing_time_ms: processingTime,
        ai_model_used: 'gemini-3-flash-preview',
        ai_tokens_input: result.usage?.prompt_tokens,
        ai_tokens_output: result.usage?.completion_tokens,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving extraction:', insertError);
      throw insertError;
    }

    // 8. Actualizar documento original con referencia
    if (document_id && document_source === 'matter_documents') {
      await supabase
        .from('matter_documents')
        .update({ 
          extraction_id: extraction.id,
          extraction_status: 'pending'
        })
        .eq('id', document_id);
    }

    return new Response(JSON.stringify({
      success: true,
      extraction_id: extraction.id,
      document_type: extractedData.document_type,
      jurisdiction: extractedData.jurisdiction,
      confidence: extractedData.confidence,
      suggestions_count: extractedData.suggestions?.length || 0,
      entities_count: Object.keys(extractedData.extracted_entities || {}).length,
      client_data: extractedData.client_data_if_new,
      processing_time_ms: processingTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Document extraction error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================
// Helper Functions
// ============================================================

function buildExtractionPrompt(matterData: any, clientData: any): string {
  return `Eres un experto en extracción de datos de documentos legales de Propiedad Intelectual.

CONTEXTO DEL EXPEDIENTE ACTUAL:
${matterData ? JSON.stringify(matterData, null, 2) : 'No hay expediente asociado aún'}

DATOS DEL CLIENTE ACTUAL:
${clientData ? JSON.stringify(clientData, null, 2) : 'No hay cliente asociado aún'}

INSTRUCCIONES:

1. CLASIFICACIÓN DEL DOCUMENTO:
   Identifica el tipo de documento entre:
   - grant_certificate: Certificado de concesión/registro
   - filing_receipt: Acuse de recibo de solicitud
   - publication_notice: Notificación de publicación
   - renewal_certificate: Certificado de renovación
   - power_of_attorney: Poder notarial
   - assignment: Documento de cesión/transferencia
   - opposition_notice: Notificación de oposición
   - office_action: Comunicación de oficina
   - invoice: Factura
   - order: Pedido/solicitud de servicio
   - correspondence: Correspondencia general
   - other: Otro tipo

2. EXTRACCIÓN DE ENTIDADES:
   Extrae TODAS las entidades relevantes que aparezcan:
   
   - Nombres de empresas/personas (titular, solicitante, representante)
   - Números oficiales:
     * application_number: Número de solicitud
     * registration_number: Número de registro
     * publication_number: Número de publicación
   - Fechas:
     * filing_date: Fecha de presentación
     * registration_date: Fecha de registro
     * grant_date: Fecha de concesión
     * publication_date: Fecha de publicación
     * expiry_date: Fecha de vencimiento/caducidad
     * priority_date: Fecha de prioridad
   - Clasificación:
     * nice_classes: Clases Nice (array de números)
     * goods_services: Descripción de productos/servicios
   - Marca/Título:
     * mark_name: Nombre de la marca
     * title: Título de patente/diseño
   - Contacto:
     * address: Direcciones
     * email: Emails
     * phone: Teléfonos
     * vat_number: NIF/CIF/VAT
   - Importes:
     * amounts: [{value, currency, concept}]

3. GENERACIÓN DE SUGERENCIAS:
   Compara cada dato extraído con los datos actuales del expediente:
   
   - "add": Dato nuevo que no existe en el expediente
   - "update": Dato que podría actualizar uno existente (con valor diferente)
   - "conflict": Dato que CONTRADICE claramente uno existente
   - "confirm": Dato que COINCIDE con uno existente

4. DETECCIÓN DE NUEVO CLIENTE:
   Si el documento parece ser de un cliente nuevo (pedido, solicitud inicial), 
   extrae sus datos en client_data_if_new.

RESPONDE ÚNICAMENTE CON JSON VÁLIDO (sin markdown):
{
  "document_type": "tipo",
  "jurisdiction": "ES|EU|US|CN|WIPO|...",
  "language": "es|en|...",
  "confidence": 0.95,
  "extracted_entities": {
    "company_names": ["..."],
    "person_names": ["..."],
    "official_numbers": {
      "application": "...",
      "registration": "...",
      "publication": "..."
    },
    "dates": {
      "filing": "YYYY-MM-DD",
      "registration": "YYYY-MM-DD",
      "grant": "YYYY-MM-DD",
      "publication": "YYYY-MM-DD",
      "expiry": "YYYY-MM-DD",
      "priority": "YYYY-MM-DD"
    },
    "nice_classes": [9, 35, 42],
    "goods_services": "...",
    "mark_name": "...",
    "title": "...",
    "addresses": ["..."],
    "emails": ["..."],
    "phones": ["..."],
    "vat_numbers": ["..."],
    "amounts": [{"value": 100.00, "currency": "EUR", "concept": "..."}]
  },
  "suggestions": [
    {
      "field": "registration_number",
      "target": "matter",
      "current_value": null,
      "suggested_value": "M-4123456",
      "action": "add",
      "confidence": 0.95,
      "reason": "Número detectado en certificado de concesión"
    }
  ],
  "client_data_if_new": null
}`;
}

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
