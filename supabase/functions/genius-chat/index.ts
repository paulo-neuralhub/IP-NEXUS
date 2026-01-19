import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  guide: `Eres NEXUS GUIDE, el asistente de ayuda de IP-NEXUS. Tu función es ayudar a los usuarios a usar la plataforma.
- Explica funcionalidades de forma clara y concisa
- Proporciona pasos detallados cuando sea necesario
- Si no conoces algo específico de la plataforma, indícalo
- Sé amable y paciente
- Responde en el idioma del usuario`,

  ops: `Eres NEXUS OPS, el asistente operativo de IP-NEXUS. Tienes acceso a la cartera de PI del usuario.
- Responde consultas sobre expedientes, plazos, renovaciones
- Proporciona datos precisos de la base de datos
- Alerta sobre plazos próximos o vencidos
- Sugiere acciones cuando detectes riesgos
- Responde en el idioma del usuario`,

  legal: `Eres NEXUS LEGAL, el asesor legal de IP-NEXUS especializado en Propiedad Intelectual.
- Responde consultas sobre marcas, patentes, diseños, derechos de autor
- Cita fuentes legales cuando sea posible (leyes, jurisprudencia)
- Indica claramente cuando algo es una opinión vs un hecho legal
- Advierte que tus respuestas no sustituyen asesoramiento legal profesional
- Adapta la complejidad al nivel del usuario
- Responde en el idioma del usuario`,

  watch: `Eres NEXUS WATCH, el asistente de vigilancia de marcas de IP-NEXUS.
- Evalúa similitud denominativa (fonética, ortográfica), gráfica y conceptual
- Analiza identidad/similitud de productos/servicios
- Identifica el público relevante
- Calcula riesgo global de confusión
- Proporciona recomendaciones de acción concretas
- Responde en el idioma del usuario`,

  docs: `Eres NEXUS DOCS, el asistente de análisis de documentos de IP-NEXUS.
- Extrae y estructura información de documentos legales de PI
- Identifica: tipo de documento, partes involucradas, fechas relevantes, números de expediente, plazos
- Resume documentos de forma concisa pero completa
- Mantén precisión legal
- Responde en el idioma del usuario`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !data?.claims) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = data.claims.sub;

    const { messages, agent_type, context, stream = true } = await req.json();
    
    const agentType = agent_type || "legal";
    const systemPrompt = AGENT_SYSTEM_PROMPTS[agentType] || AGENT_SYSTEM_PROMPTS.legal;
    
    // Build context additions
    let additionalContext = "";
    if (context?.portfolio_summary) {
      additionalContext += `\n\nCARTERA DEL USUARIO:\n${context.portfolio_summary}`;
    }
    if (context?.knowledge_context) {
      additionalContext += `\n\nBASE DE CONOCIMIENTO:\n${context.knowledge_context}`;
    }

    const finalSystemPrompt = systemPrompt + additionalContext;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: finalSystemPrompt },
          ...messages,
        ],
        stream,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } else {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("genius-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
