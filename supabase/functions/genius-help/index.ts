import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HELP_SYSTEM_PROMPT = `Eres IP-Genius (NEXUS GUIDE), el asistente de ayuda de IP-NEXUS.

Tu rol es ayudar al usuario a entender cómo usar la plataforma IP-NEXUS (no dar asesoramiento legal).

CONTEXTO DE IP-NEXUS (alto nivel):
- Dashboard: vista global y accesos rápidos
- Expedientes (Docket/Matters): gestión de marcas, patentes, diseños, copyright
- Spider: vigilancia/alertas
- Data Hub: conectores y búsquedas
- Market: contratar agentes externos (RFQ, presupuestos)
- Help Center: artículos, guías, vídeos, tickets

REGLAS:
1) Responde en español salvo que el usuario escriba en otro idioma.
2) Sé conciso, pero con pasos accionables.
3) Si no sabes algo específico de la plataforma, admítelo.
4) Recomienda artículos del Help Center si hay coincidencias.
5) Si el usuario está perdido, ofrece una guía paso a paso.
6) NO inventes rutas/pantallas; cuando sugieras navegar, usa rutas conocidas (/app/...).
`;

function detectActions(answer: string): Array<{ type: string; title?: string; data?: Record<string, unknown> }> {
  const a = answer.toLowerCase();
  const actions: Array<{ type: string; title?: string; data?: Record<string, unknown> }> = [];

  if (a.includes("crear") && (a.includes("expediente") || a.includes("materia") || a.includes("matter"))) {
    actions.push({ type: "navigate", title: "Crear expediente", data: { path: "/app/docket" } });
  }

  if (a.includes("búsqueda") || a.includes("buscar marcas") || a.includes("buscar")) {
    actions.push({ type: "navigate", title: "Ir a búsquedas", data: { path: "/app/search" } });
  }

  if (a.includes("market") || a.includes("presupuesto") || a.includes("rfq") || a.includes("agente")) {
    actions.push({ type: "navigate", title: "Ir a IP-MARKET", data: { path: "/app/market" } });
  }

  if (a.includes("alerta") || a.includes("vigilancia") || a.includes("spider")) {
    actions.push({ type: "navigate", title: "Ir a Spider", data: { path: "/app/spider" } });
  }

  return actions;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabaseUser.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authData.user.id;
    const { data: membership } = await supabaseUser
      .from("memberships")
      .select("organization_id")
      .eq("user_id", userId)
      .single();

    const organizationId = membership?.organization_id;
    if (!organizationId) {
      return new Response(JSON.stringify({ error: "No organization found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      conversationId,
      message,
      history = [],
      context,
    }: {
      conversationId?: string;
      message: string;
      history?: Array<{ role: string; content: string }>;
      context?: { currentPage?: string; userLevel?: string; recentActions?: string[] };
    } = await req.json();

    const queryText = String(message || "").trim();

    let relevantArticles: Array<{
      id: string;
      title_es: string | null;
      slug: string;
      excerpt_es: string | null;
      video_url: string | null;
    }> = [];

    if (queryText.length >= 3) {
      const { data } = await supabaseAdmin
        .from("help_articles")
        .select("id, title_es, slug, excerpt_es, video_url")
        .eq("is_published", true)
        .eq("status", "published")
        .textSearch("search_vector", queryText, { type: "websearch" })
        .limit(3);

      relevantArticles = (data || []) as any;
    }

    const articlesContext = relevantArticles.length
      ? `\n\nARTÍCULOS RELACIONADOS (Help Center):\n${relevantArticles
          .map((a) => `- "${a.title_es || a.slug}" (/app/help/articles/${a.slug})`)
          .join("\n")}`
      : "";

    const contextInfo = `\n\nCONTEXTO ACTUAL:\n- Página: ${context?.currentPage || "desconocida"}\n- Nivel: ${context?.userLevel || "desconocido"}`;

    const system = HELP_SYSTEM_PROMPT + contextInfo + articlesContext;

    const messages = [...history.slice(-8), { role: "user", content: queryText }];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Lovable AI Gateway allowed models (default recommendation: gemini-3-flash-preview)
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: system }, ...messages],
        max_tokens: 1024,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      // Surface common gateway errors to the client (credits/rate limits)
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Inténtalo de nuevo en unos segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Lovable AI: créditos insuficientes. Añade saldo en Workspace > Usage." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices?.[0]?.message;
    const content = assistantMessage?.content || "";

    const sources = relevantArticles.map((a) => ({
      type: "help_article",
      id: a.id,
      title: a.title_es || a.slug,
      excerpt: a.excerpt_es || undefined,
      url: `/app/help/articles/${a.slug}`,
    }));

    const actions = detectActions(content);

    const responseTimeMs = Date.now() - startTime;

    // Persist to DB if conversationId provided (keeps it consistent with Genius UX)
    if (conversationId) {
      await supabaseAdmin.from("ai_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: queryText,
      });

        await supabaseAdmin.from("ai_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content,
          model_used: "google/gemini-3-flash-preview",
        tokens_input: aiResponse.usage?.prompt_tokens,
        tokens_output: aiResponse.usage?.completion_tokens,
        response_time_ms: responseTimeMs,
        actions_taken: actions.length ? actions : null,
        sources: sources.length ? sources : null,
      });

      const { data: currentConv } = await supabaseAdmin
        .from("ai_conversations")
        .select("message_count")
        .eq("id", conversationId)
        .single();

      await supabaseAdmin
        .from("ai_conversations")
        .update({
          message_count: (currentConv?.message_count || 0) + 2,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);
    }

    return new Response(
      JSON.stringify({
        content,
        actions,
        sources,
        usage: aiResponse.usage,
        responseTimeMs,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("genius-help error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
