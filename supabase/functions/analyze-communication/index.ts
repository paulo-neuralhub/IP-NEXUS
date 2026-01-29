/**
 * analyze-communication - AI-powered communication analysis
 * Uses Lovable AI Gateway for summarization, sentiment, action items extraction
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

interface AnalysisResult {
  summary: string;
  sentiment: number;
  sentiment_label: 'negative' | 'neutral' | 'positive';
  topics: string[];
  action_items: Array<{
    text: string;
    assignee_hint: 'self' | 'client' | 'other';
    due_hint: string | null;
  }>;
  urgency_score: number;
  entities: {
    people: string[];
    companies: string[];
    amounts: string[];
  };
  commitments: Array<{
    who: string;
    what: string;
    when: string | null;
  }>;
  key_dates: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { communication_id, organization_id, force = false } = await req.json();

    if (!communication_id || !organization_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if tenant has AI enabled
    const { data: config } = await supabase
      .from('tenant_ai_config')
      .select('ai_classification_enabled')
      .eq('organization_id', organization_id)
      .single();

    if (!config?.ai_classification_enabled) {
      return new Response(
        JSON.stringify({ error: 'AI analysis not enabled for this organization', code: 'AI_DISABLED' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get communication
    const { data: comm, error: commError } = await supabase
      .from('communications')
      .select(`
        id, subject, body, channel, direction,
        ai_summary, ai_classified_at,
        matters(id, reference, title)
      `)
      .eq('id', communication_id)
      .eq('organization_id', organization_id)
      .single();
    
    // Extract matter info (Supabase returns array for joins)
    const matter = Array.isArray(comm?.matters) ? comm.matters[0] : comm?.matters;

    if (commError || !comm) {
      return new Response(
        JSON.stringify({ error: 'Communication not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip if already analyzed (unless forced)
    if (comm.ai_summary && !force) {
      return new Response(
        JSON.stringify({ 
          message: 'Already analyzed',
          summary: comm.ai_summary 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no API key, return placeholder for development
    if (!LOVABLE_API_KEY) {
      const placeholder: AnalysisResult = {
        summary: 'Análisis no disponible - API key no configurada',
        sentiment: 0.5,
        sentiment_label: 'neutral',
        topics: [],
        action_items: [],
        urgency_score: 0.5,
        entities: { people: [], companies: [], amounts: [] },
        commitments: [],
        key_dates: []
      };

      await supabase
        .from('communications')
        .update({
          ai_summary: placeholder.summary,
          ai_sentiment: placeholder.sentiment,
          ai_sentiment_label: placeholder.sentiment_label,
          ai_topics: placeholder.topics,
          ai_action_items: placeholder.action_items,
          ai_urgency_score: placeholder.urgency_score,
          ai_entities: placeholder.entities,
          ai_commitments: placeholder.commitments,
          ai_key_dates: placeholder.key_dates,
          ai_classified_at: new Date().toISOString(),
          ai_model: 'placeholder'
        })
        .eq('id', communication_id);

      return new Response(
        JSON.stringify({ analysis: placeholder, mode: 'placeholder' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build content for analysis
    const content = [
      comm.subject ? `Asunto: ${comm.subject}` : '',
      comm.body || ''
    ].filter(Boolean).join('\n\n');

    if (!content.trim() || content.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Communication has no content to analyze' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Lovable AI Gateway
    const aiResponse = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente de análisis para un despacho de propiedad intelectual.
Analiza comunicaciones y extrae información estructurada.
Contexto del expediente: ${matter?.title || 'No disponible'} (${matter?.reference || 'N/A'})
Tipo: ${comm.channel} | Dirección: ${comm.direction}

IMPORTANTE: Responde SOLO con JSON válido, sin markdown, sin explicaciones.`
          },
          {
            role: 'user',
            content: `Analiza esta comunicación:

---
${content.substring(0, 4000)}
---

Extrae (en español):
{
  "summary": "Resumen en 2-3 oraciones",
  "sentiment": 0.0-1.0 (0=negativo, 1=positivo),
  "sentiment_label": "negative" | "neutral" | "positive",
  "topics": ["tema1", "tema2"] (máx 5),
  "action_items": [{"text": "tarea", "assignee_hint": "self"|"client"|"other", "due_hint": "today"|"tomorrow"|"this_week"|"next_week"|null}],
  "urgency_score": 0.0-1.0,
  "entities": {"people": [], "companies": [], "amounts": []},
  "commitments": [{"who": "nosotros"|"cliente", "what": "acción", "when": "fecha o null"}],
  "key_dates": ["YYYY-MM-DD"]
}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices?.[0]?.message?.content || '';

    // Parse JSON response
    let analysis: AnalysisResult;
    try {
      // Try direct parse first
      analysis = JSON.parse(responseText);
    } catch {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    // Validate and normalize
    analysis = {
      summary: analysis.summary || 'Sin resumen disponible',
      sentiment: Math.max(0, Math.min(1, Number(analysis.sentiment) || 0.5)),
      sentiment_label: ['negative', 'neutral', 'positive'].includes(analysis.sentiment_label) 
        ? analysis.sentiment_label 
        : 'neutral',
      topics: Array.isArray(analysis.topics) ? analysis.topics.slice(0, 5) : [],
      action_items: Array.isArray(analysis.action_items) ? analysis.action_items : [],
      urgency_score: Math.max(0, Math.min(1, Number(analysis.urgency_score) || 0.5)),
      entities: {
        people: analysis.entities?.people || [],
        companies: analysis.entities?.companies || [],
        amounts: analysis.entities?.amounts || []
      },
      commitments: Array.isArray(analysis.commitments) ? analysis.commitments : [],
      key_dates: Array.isArray(analysis.key_dates) ? analysis.key_dates : []
    };

    // Update communication with analysis
    const { error: updateError } = await supabase
      .from('communications')
      .update({
        ai_summary: analysis.summary,
        ai_sentiment: analysis.sentiment,
        ai_sentiment_label: analysis.sentiment_label,
        ai_topics: analysis.topics,
        ai_action_items: analysis.action_items,
        ai_urgency_score: analysis.urgency_score,
        ai_entities: analysis.entities,
        ai_commitments: analysis.commitments,
        ai_key_dates: analysis.key_dates,
        ai_classified_at: new Date().toISOString(),
        ai_model: 'gemini-3-flash-preview'
      })
      .eq('id', communication_id);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    // Log AI usage (non-critical, ignore errors)
    try {
      await supabase.from('ai_usage_logs').insert({
        organization_id,
        task_name: 'analyze_communication',
        input_tokens: aiData.usage?.prompt_tokens || 0,
        output_tokens: aiData.usage?.completion_tokens || 0,
        success: true
      });
    } catch {
      // Ignore logging errors
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('analyze-communication error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
