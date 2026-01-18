import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const GOOGLE_VISION_API_KEY = Deno.env.get('GOOGLE_VISION_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let analysisId: string | undefined;

  try {
    const body = await req.json();
    analysisId = body.analysis_id;
    
    if (!analysisId) {
      throw new Error('analysis_id is required');
    }
    
    console.log('Processing vision analysis:', analysisId);
    
    // Obtener análisis
    const { data: analysis, error: fetchError } = await supabase
      .from('vision_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();
    
    if (fetchError || !analysis) {
      throw new Error('Analysis not found');
    }
    
    // Actualizar estado
    await supabase
      .from('vision_analyses')
      .update({ status: 'processing' })
      .eq('id', analysisId);
    
    let results: Record<string, unknown> = {};
    let modelVersion = 'demo';
    
    // Usar Claude Vision para análisis
    if (ANTHROPIC_API_KEY) {
      try {
        // Descargar imagen
        const imageResponse = await fetch(analysis.image_url);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
        const mediaType = analysis.image_url.includes('.png') ? 'image/png' : 'image/jpeg';
        
        let prompt = '';
        switch (analysis.analysis_type) {
          case 'logo_detection':
            prompt = `Analyze this image for logo detection. Identify any logos present and provide:
1. A list of detected logos with descriptions
2. Dominant colors (hex codes)
3. Whether the logo is text-based, device-based, or combination
4. Complexity score (0-1)

Respond in JSON format:
{
  "logos": [{"description": "...", "confidence": 0.95}],
  "dominant_colors": ["#XXXXXX"],
  "is_text_based": boolean,
  "complexity_score": 0.5
}`;
            break;
            
          case 'trademark_similarity':
            prompt = `Analyze this trademark/logo image and describe its visual characteristics:
1. Main visual elements
2. Color scheme
3. Typography (if any)
4. Overall style and design approach
5. Key distinguishing features

This will be used for trademark similarity comparisons.

Respond in JSON format:
{
  "visual_elements": ["..."],
  "color_scheme": ["#XXXXXX"],
  "typography": "...",
  "style": "...",
  "distinguishing_features": ["..."]
}`;
            break;
            
          case 'text_extraction':
            prompt = 'Extract all text visible in this image. Return as JSON: {"extracted_text": "..."}';
            break;
            
          case 'color_analysis':
            prompt = `Analyze the colors in this image. Provide:
1. Dominant colors (hex codes)
2. Color palette
3. Color harmony type

Respond in JSON format:
{
  "dominant_colors": ["#XXXXXX"],
  "palette": ["#XXXXXX"],
  "harmony_type": "complementary|analogous|triadic|etc"
}`;
            break;
            
          case 'object_detection':
            prompt = `Identify all objects in this image. For each object provide:
1. Name
2. Confidence score (0-1)

Respond in JSON format:
{
  "objects": [{"name": "...", "confidence": 0.95}]
}`;
            break;
            
          case 'brand_recognition':
            prompt = `Identify any recognizable brands, logos, or trademarks in this image. Provide:
1. Brand name
2. Confidence score
3. Type (logo, product, packaging, etc.)

Respond in JSON format:
{
  "brands": [{"name": "...", "confidence": 0.95, "type": "..."}]
}`;
            break;
            
          default:
            prompt = 'Describe this image in detail.';
        }
        
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2048,
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
                  text: prompt,
                },
              ],
            }],
          }),
        });
        
        const claudeResult = await claudeResponse.json();
        if (claudeResult.content?.[0]?.text) {
          try {
            // Intentar parsear como JSON
            const jsonMatch = claudeResult.content[0].text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              results = JSON.parse(jsonMatch[0]);
            } else {
              results = { raw_response: claudeResult.content[0].text };
            }
          } catch {
            results = { raw_response: claudeResult.content[0].text };
          }
          modelVersion = 'claude-3-haiku-20240307';
        }
      } catch (claudeError) {
        console.error('Claude Vision error:', claudeError);
      }
    }
    
    // Fallback: usar Google Vision API para logos
    if (Object.keys(results).length === 0 && GOOGLE_VISION_API_KEY && 
        (analysis.analysis_type === 'logo_detection' || analysis.analysis_type === 'brand_recognition')) {
      try {
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requests: [{
                image: { source: { imageUri: analysis.image_url } },
                features: [
                  { type: 'LOGO_DETECTION', maxResults: 10 },
                  { type: 'IMAGE_PROPERTIES' },
                ],
              }],
            }),
          }
        );
        
        const visionResult = await response.json();
        const logos = visionResult.responses?.[0]?.logoAnnotations || [];
        const imageProps = visionResult.responses?.[0]?.imagePropertiesAnnotation;
        
        results = {
          logos: logos.map((l: { description: string; score: number }) => ({
            description: l.description,
            confidence: l.score,
          })),
          dominant_colors: imageProps?.dominantColors?.colors
            ?.slice(0, 5)
            .map((c: { color: { red: number; green: number; blue: number } }) => {
              const { red, green, blue } = c.color;
              return `#${[red, green, blue].map(v => Math.round(v || 0).toString(16).padStart(2, '0')).join('')}`;
            }) || [],
        };
        modelVersion = 'google-vision-api';
      } catch (visionError) {
        console.error('Google Vision error:', visionError);
      }
    }
    
    // Si no hay APIs configuradas, generar resultado de ejemplo
    if (Object.keys(results).length === 0) {
      results = {
        message: 'No API configured for image analysis',
        analysis_type: analysis.analysis_type,
        demo: true,
        logos: analysis.analysis_type === 'logo_detection' ? [
          { description: 'Demo Logo', confidence: 0.5 }
        ] : undefined,
        dominant_colors: ['#3B82F6', '#1E293B', '#FFFFFF'],
      };
    }
    
    const processingTime = Date.now() - startTime;
    
    // Actualizar resultado
    await supabase
      .from('vision_analyses')
      .update({
        status: 'completed',
        results,
        processing_time_ms: processingTime,
        model_version: modelVersion,
        completed_at: new Date().toISOString(),
      })
      .eq('id', analysisId);
    
    console.log('Vision analysis completed:', analysisId);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        processing_time_ms: processingTime,
        model_version: modelVersion,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Vision analysis error:', errorMessage);
    
    if (analysisId) {
      await supabase
        .from('vision_analyses')
        .update({ 
          status: 'failed', 
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', analysisId);
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
