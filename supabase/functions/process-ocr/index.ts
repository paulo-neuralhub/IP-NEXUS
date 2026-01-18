import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GOOGLE_VISION_API_KEY = Deno.env.get('GOOGLE_VISION_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let ocrId: string | undefined;

  try {
    const body = await req.json();
    ocrId = body.ocr_id;
    
    if (!ocrId) {
      throw new Error('ocr_id is required');
    }
    
    console.log('Processing OCR:', ocrId);
    
    // Obtener OCR result
    const { data: ocrResult, error: fetchError } = await supabase
      .from('ocr_results')
      .select('*')
      .eq('id', ocrId)
      .single();
    
    if (fetchError || !ocrResult) {
      throw new Error('OCR result not found');
    }
    
    // Actualizar estado
    await supabase
      .from('ocr_results')
      .update({ status: 'processing' })
      .eq('id', ocrId);
    
    let extractedText = '';
    let pages: Array<{ page: number; text: string; blocks: Array<{ type: string; text: string; bbox: number[]; confidence: number }> }> = [];
    let language = 'unknown';
    let avgConfidence = 0;
    
    // Intentar con Google Vision API primero
    if (GOOGLE_VISION_API_KEY && ocrResult.file_url) {
      try {
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requests: [{
                image: { source: { imageUri: ocrResult.file_url } },
                features: [
                  { type: 'DOCUMENT_TEXT_DETECTION' },
                  { type: 'TEXT_DETECTION' },
                ],
              }],
            }),
          }
        );
        
        const visionResult = await response.json();
        const textAnnotation = visionResult.responses?.[0]?.fullTextAnnotation;
        
        if (textAnnotation) {
          extractedText = textAnnotation.text || '';
          language = visionResult.responses?.[0]?.textAnnotations?.[0]?.locale || 'unknown';
          
          // Procesar páginas
          pages = textAnnotation.pages?.map((page: any, index: number) => ({
            page: index + 1,
            text: page.blocks?.map((b: any) => 
              b.paragraphs?.map((p: any) =>
                p.words?.map((w: any) =>
                  w.symbols?.map((s: any) => s.text).join('')
                ).join(' ')
              ).join('\n')
            ).join('\n\n'),
            blocks: page.blocks?.map((block: any) => ({
              type: 'paragraph',
              text: block.paragraphs?.map((p: any) =>
                p.words?.map((w: any) =>
                  w.symbols?.map((s: any) => s.text).join('')
                ).join(' ')
              ).join(' '),
              bbox: block.boundingBox?.vertices ? [
                block.boundingBox.vertices[0]?.x || 0,
                block.boundingBox.vertices[0]?.y || 0,
                (block.boundingBox.vertices[2]?.x || 0) - (block.boundingBox.vertices[0]?.x || 0),
                (block.boundingBox.vertices[2]?.y || 0) - (block.boundingBox.vertices[0]?.y || 0),
              ] : [0, 0, 0, 0],
              confidence: block.confidence || 0.9,
            })) || [],
          })) || [];
          
          // Calcular confianza promedio
          const confidences = pages.flatMap((p) => p.blocks?.map((b) => b.confidence) || []);
          avgConfidence = confidences.length > 0 
            ? (confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100 
            : 90;
        }
      } catch (visionError) {
        console.error('Google Vision error:', visionError);
      }
    }
    
    // Fallback: usar Claude para OCR si está disponible
    if (!extractedText && ANTHROPIC_API_KEY && ocrResult.file_url) {
      try {
        // Descargar imagen
        const imageResponse = await fetch(ocrResult.file_url);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
        const mediaType = ocrResult.file_url.includes('.png') ? 'image/png' : 'image/jpeg';
        
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 4096,
            messages: [{
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64Image,
                  },
                },
                {
                  type: 'text',
                  text: 'Please extract all text from this image. Preserve the original formatting and structure as much as possible. Output only the extracted text, nothing else.',
                },
              ],
            }],
          }),
        });
        
        const claudeResult = await claudeResponse.json();
        if (claudeResult.content?.[0]?.text) {
          extractedText = claudeResult.content[0].text;
          pages = [{
            page: 1,
            text: extractedText,
            blocks: [{
              type: 'paragraph',
              text: extractedText,
              bbox: [0, 0, 0, 0],
              confidence: 0.85,
            }],
          }];
          avgConfidence = 85;
          language = 'detected';
        }
      } catch (claudeError) {
        console.error('Claude OCR error:', claudeError);
      }
    }
    
    // Si no hay APIs configuradas, generar resultado de ejemplo
    if (!extractedText) {
      extractedText = `[OCR Demo] No se pudo procesar el documento.
      
Configure GOOGLE_VISION_API_KEY o ANTHROPIC_API_KEY para habilitar OCR real.

Archivo: ${ocrResult.file_name || 'Unknown'}
URL: ${ocrResult.file_url || 'No URL'}`;
      pages = [{
        page: 1,
        text: extractedText,
        blocks: [{
          type: 'paragraph',
          text: extractedText,
          bbox: [0, 0, 100, 100],
          confidence: 0,
        }],
      }];
      avgConfidence = 0;
    }
    
    // Extraer entidades
    const entities = extractEntities(extractedText);
    
    const processingTime = Date.now() - startTime;
    
    // Actualizar resultado
    await supabase
      .from('ocr_results')
      .update({
        status: 'completed',
        extracted_text: extractedText,
        confidence: avgConfidence,
        pages,
        entities,
        language,
        processing_time_ms: processingTime,
        completed_at: new Date().toISOString(),
      })
      .eq('id', ocrId);
    
    console.log('OCR completed:', ocrId, 'Text length:', extractedText.length);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        text_length: extractedText.length,
        entities_count: entities.length,
        processing_time_ms: processingTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('OCR error:', errorMessage);
    
    if (ocrId) {
      await supabase
        .from('ocr_results')
        .update({ 
          status: 'failed', 
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', ocrId);
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

interface OCREntity {
  type: string;
  value: string | number;
  text: string;
}

function extractEntities(text: string): OCREntity[] {
  const entities: OCREntity[] = [];
  
  // Fechas en varios formatos
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
    /(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/gi,
    /(\d{4}-\d{2}-\d{2})/g,
  ];
  
  datePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      entities.push({ type: 'date', value: match[1], text: match[1] });
    }
  });
  
  // Referencias (TM-, PAT-, etc.)
  const refPattern = /((?:TM|PAT|DES|COP|REF|EXP|REG|APP)[- ]?\d{4}[- ]?\d+)/gi;
  let refMatch;
  while ((refMatch = refPattern.exec(text)) !== null) {
    entities.push({ type: 'reference', value: refMatch[1], text: refMatch[1] });
  }
  
  // Cantidades monetarias
  const amountPattern = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*([€$£])/g;
  let amountMatch;
  while ((amountMatch = amountPattern.exec(text)) !== null) {
    const value = parseFloat(amountMatch[1].replace(/\./g, '').replace(',', '.'));
    entities.push({ type: 'amount', value, text: amountMatch[0] });
  }
  
  // Emails
  const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
  let emailMatch;
  while ((emailMatch = emailPattern.exec(text)) !== null) {
    entities.push({ type: 'email', value: emailMatch[0], text: emailMatch[0] });
  }
  
  // Teléfonos
  const phonePattern = /(?:\+\d{1,3})?[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;
  let phoneMatch;
  while ((phoneMatch = phonePattern.exec(text)) !== null) {
    if (phoneMatch[0].replace(/\D/g, '').length >= 9) {
      entities.push({ type: 'phone', value: phoneMatch[0], text: phoneMatch[0] });
    }
  }
  
  return entities;
}
