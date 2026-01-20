import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model routing by tier
const MODEL_BY_TIER: Record<string, string> = {
  starter: 'google/gemini-3-flash-preview',
  professional: 'google/gemini-2.5-pro', 
  enterprise: 'openai/gpt-5'
};

// System prompts by agent type
const SYSTEM_PROMPTS: Record<string, string> = {
  legal: `Eres NEXUS LEGAL, un experto en propiedad intelectual.
Proporciona asesoramiento legal preciso sobre marcas, patentes y derechos de autor.
Cita legislación aplicable cuando sea relevante.
Advierte siempre que tus respuestas son orientativas y no sustituyen asesoramiento legal profesional.`,
  
  strategist: `Eres NEXUS STRATEGIST, experto en estrategia de PI.
Ayudas a planificar portfolios de marcas y patentes.
Analizas riesgos y oportunidades en la gestión de activos intangibles.`,
  
  analyst: `Eres NEXUS ANALYST, especialista en análisis de PI.
Evalúas similitud entre marcas, analizas anterioridades y valoras riesgos de conflicto.`,
  
  translator: `Eres NEXUS TRANSLATOR, traductor legal especializado.
Traduces documentos legales manteniendo precisión terminológica.
Usas glosarios especializados en propiedad intelectual.`,
  
  guide: `Eres NEXUS GUIDE, asistente de ayuda de IP-NEXUS.
Guías a usuarios por la plataforma y respondes dudas sobre funcionalidades.`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'AI not configured. Enable Lovable AI in Cloud settings.' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { messages, agentType = 'legal', organizationId, tier = 'starter', stream = true } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array required' }), { status: 400, headers: corsHeaders });
    }

    // Check quota
    if (organizationId) {
      const { data: canMakeRequest } = await supabase.rpc('check_org_ai_quota', { 
        p_org_id: organizationId, 
        p_tier: tier 
      });
      
      if (canMakeRequest === false) {
        return new Response(
          JSON.stringify({ error: 'Monthly AI quota exceeded. Upgrade your plan for more queries.' }),
          { status: 402, headers: corsHeaders }
        );
      }
    }

    const model = MODEL_BY_TIER[tier] || MODEL_BY_TIER.starter;
    const systemPrompt = SYSTEM_PROMPTS[agentType] || SYSTEM_PROMPTS.legal;

    const startTime = Date.now();

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream,
        max_tokens: tier === 'enterprise' ? 8000 : (tier === 'professional' ? 4000 : 2000)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: corsHeaders }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Add credits in Lovable workspace.' }),
          { status: 402, headers: corsHeaders }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Log usage (async, don't wait)
    if (organizationId) {
      supabase.from('ai_request_logs').insert({
        organization_id: organizationId,
        task_type: agentType,
        model_used: model,
        latency_ms: Date.now() - startTime,
        success: true
      }).then(() => {});
    }

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' }
      });
    } else {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Genius Pro error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
