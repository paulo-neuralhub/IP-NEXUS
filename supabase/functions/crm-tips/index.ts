import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Eres el motor de tips de IP-NEXUS.

Genera UN SOLO tip corto (1-2 frases) en español para ayudar al usuario en la sección CRM Kanban.

Reglas:
- Máximo 90 caracteres.
- Sin listas, sin Markdown.
- Menciona (si encaja) que las etapas y los pipelines se configuran en /app/settings (sección CRM).
- No inventes funcionalidades.`;

// Simple in-memory cache (best-effort). Edge runtimes often reuse isolates,
// so this can significantly reduce provider calls during bursts.
type TipCacheEntry = { tip: string; expiresAt: number };
const TIP_CACHE = new Map<string, TipCacheEntry>();

function getFallbackTip(module?: string, section?: string) {
  // Keep it under ~90 chars and aligned with the product.
  if (module === 'crm') {
    return 'Configura etapas y pipelines en /app/settings (CRM) para ordenar tu Kanban.';
  }
  if (section) {
    return `Revisa Configuración para ajustar ${section} según tu flujo de trabajo.`;
  }
  return 'Revisa Configuración para ajustar tu flujo de trabajo.';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { currentPath, module, section } = await req.json();

    // Cache key should be stable, low cardinality.
    const cacheKey = `${String(module || '')}:${String(section || '')}:${String(currentPath || '')}`;
    const cached = TIP_CACHE.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return new Response(JSON.stringify({ tip: cached.tip, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contextLine = `Ruta: ${String(currentPath || '')} | Módulo: ${String(module || '')} | Sección: ${String(section || '')}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Contexto: ${contextLine}. Genera el tip.` },
        ],
        max_tokens: 120,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);

      if (response.status === 429) {
        // IMPORTANT: Return 200 with a safe fallback tip to avoid client hard-fail / blank screens.
        // Also cache the fallback briefly to prevent thundering-herd retries.
        const fallbackTip = getFallbackTip(module, section);
        TIP_CACHE.set(cacheKey, { tip: fallbackTip, expiresAt: Date.now() + 5 * 60 * 1000 });
        return new Response(JSON.stringify({ tip: fallbackTip, rate_limited: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '10' },
        });
      }

      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Lovable AI: créditos insuficientes. Añade saldo en Workspace > Usage.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ai = await response.json();
    const tip = String(ai?.choices?.[0]?.message?.content || '').trim();

    // Cache successful tip for 10 minutes to reduce provider calls.
    if (tip) {
      TIP_CACHE.set(cacheKey, { tip, expiresAt: Date.now() + 10 * 60 * 1000 });
    }

    return new Response(JSON.stringify({ tip }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('crm-tips error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
