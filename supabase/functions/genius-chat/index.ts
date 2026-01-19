import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fallback system prompts if DB lookup fails
const FALLBACK_SYSTEM_PROMPTS: Record<string, string> = {
  guide: `Eres NEXUS GUIDE, el asistente de ayuda de IP-NEXUS. Tu función es ayudar a los usuarios a usar la plataforma.`,
  ops: `Eres NEXUS OPS, el asistente operativo de IP-NEXUS. Tienes acceso a la cartera de PI del usuario.`,
  legal: `Eres NEXUS LEGAL, el asesor legal de IP-NEXUS especializado en Propiedad Intelectual.`,
  watch: `Eres NEXUS WATCH, el asistente de vigilancia de marcas de IP-NEXUS.`,
  docs: `Eres NEXUS DOCS, el asistente de análisis de documentos de IP-NEXUS.`,
};

// Map agent types to task codes
const AGENT_TO_TASK: Record<string, string> = {
  guide: 'nexus_guide',
  ops: 'nexus_ops',
  legal: 'nexus_legal',
  watch: 'nexus_watch',
  docs: 'document_analysis',
};

interface TaskConfig {
  model_id: string;
  temperature: number;
  max_tokens: number;
  system_prompt?: string;
  fallbacks: string[];
}

async function getTaskConfig(supabase: any, taskCode: string): Promise<TaskConfig | null> {
  try {
    const { data, error } = await supabase
      .from('ai_task_assignments')
      .select(`
        temperature,
        max_tokens,
        system_prompt_override,
        primary_model:ai_models!ai_task_assignments_primary_model_id_fkey(model_id),
        fallback_1_model:ai_models!ai_task_assignments_fallback_1_model_id_fkey(model_id),
        fallback_2_model:ai_models!ai_task_assignments_fallback_2_model_id_fkey(model_id)
      `)
      .eq('task_code', taskCode)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.log(`No task config found for ${taskCode}, using defaults`);
      return null;
    }

    return {
      model_id: data.primary_model?.model_id || 'google/gemini-3-flash-preview',
      temperature: data.temperature || 0.7,
      max_tokens: data.max_tokens || 4096,
      system_prompt: data.system_prompt_override,
      fallbacks: [
        data.fallback_1_model?.model_id,
        data.fallback_2_model?.model_id,
      ].filter(Boolean),
    };
  } catch (e) {
    console.error('Error fetching task config:', e);
    return null;
  }
}

async function logAIRequest(
  supabase: any,
  params: {
    organizationId?: string;
    userId?: string;
    taskCode: string;
    modelId?: string;
    inputTokens?: number;
    outputTokens?: number;
    costUsd?: number;
    latencyMs?: number;
    status: string;
    errorMessage?: string;
    fallbackUsed?: boolean;
  }
) {
  try {
    await supabase.from('ai_request_logs').insert({
      organization_id: params.organizationId,
      user_id: params.userId,
      task_code: params.taskCode,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      total_tokens: (params.inputTokens || 0) + (params.outputTokens || 0),
      cost_usd: params.costUsd,
      latency_ms: params.latencyMs,
      status: params.status,
      error_message: params.errorMessage,
      fallback_used: params.fallbackUsed || false,
    });
  } catch (e) {
    console.error('Error logging AI request:', e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Use service role for DB reads, user auth for data access
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabaseUser.auth.getUser(token);
    if (authError || !authData?.user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authData.user.id;

    // Get user's organization
    const { data: membership } = await supabaseUser
      .from('memberships')
      .select('organization_id')
      .eq('user_id', userId)
      .single();

    const organizationId = membership?.organization_id;

    const { messages, agent_type, context, stream = true } = await req.json();
    
    const agentType = agent_type || "legal";
    const taskCode = AGENT_TO_TASK[agentType] || 'nexus_legal';
    
    // Get task configuration from DB
    const taskConfig = await getTaskConfig(supabaseAdmin, taskCode);
    
    const modelToUse = taskConfig?.model_id || 'google/gemini-3-flash-preview';
    const temperature = taskConfig?.temperature || 0.7;
    const maxTokens = taskConfig?.max_tokens || 4096;
    
    // Get system prompt - prefer DB override, then prompt template, then fallback
    let systemPrompt = taskConfig?.system_prompt || FALLBACK_SYSTEM_PROMPTS[agentType] || FALLBACK_SYSTEM_PROMPTS.legal;
    
    // Build context additions
    let additionalContext = "";
    if (context?.portfolio_summary) {
      additionalContext += `\n\nCARTERA DEL USUARIO:\n${context.portfolio_summary}`;
    }
    if (context?.knowledge_context) {
      additionalContext += `\n\nBASE DE CONOCIMIENTO:\n${context.knowledge_context}`;
    }

    const finalSystemPrompt = systemPrompt + additionalContext;

    console.log(`Task: ${taskCode}, Model: ${modelToUse}, Temp: ${temperature}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: "system", content: finalSystemPrompt },
          ...messages,
        ],
        stream,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorStatus = response.status === 429 ? 'rate_limited' : 'error';
      await logAIRequest(supabaseAdmin, {
        organizationId,
        userId,
        taskCode,
        latencyMs,
        status: errorStatus,
        errorMessage: `HTTP ${response.status}`,
      });

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

    // Log successful request (token counts will be estimated)
    await logAIRequest(supabaseAdmin, {
      organizationId,
      userId,
      taskCode,
      latencyMs,
      status: 'success',
    });

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