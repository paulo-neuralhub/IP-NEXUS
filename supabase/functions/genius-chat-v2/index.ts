import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres IP-Genius, el asistente IA especializado en Propiedad Intelectual para IP-NEXUS.

CAPACIDADES:
- Responder consultas sobre marcas, patentes, diseños industriales
- Buscar expedientes en la cartera del usuario
- Crear tareas y recordatorios
- Consultar plazos próximos
- Generar borradores de documentos

HERRAMIENTAS DISPONIBLES:
- search_matters: Buscar expedientes por referencia, título o nombre de marca
- create_task: Crear una tarea para un expediente
- get_deadlines: Obtener plazos próximos

REGLAS:
1. Sé conciso y profesional
2. Cita fuentes cuando uses datos del sistema
3. Responde siempre en español
4. Si no tienes información suficiente, pide clarificación
5. Al crear tareas o buscar expedientes, confirma la acción realizada`;

// Tool definitions for the AI
const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_matters",
      description: "Buscar expedientes de PI (marcas, patentes, diseños) en la cartera del usuario",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Término de búsqueda (referencia, título, nombre de marca)"
          },
          limit: {
            type: "number",
            description: "Número máximo de resultados (default 5)"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Crear una tarea asociada a un expediente",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Título de la tarea"
          },
          matter_id: {
            type: "string",
            description: "ID del expediente asociado (UUID)"
          },
          due_date: {
            type: "string",
            description: "Fecha de vencimiento (ISO 8601)"
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
            description: "Prioridad de la tarea"
          }
        },
        required: ["title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_deadlines",
      description: "Obtener los próximos plazos de la cartera",
      parameters: {
        type: "object",
        properties: {
          days: {
            type: "number",
            description: "Número de días a consultar (default 30)"
          },
          matter_id: {
            type: "string",
            description: "Filtrar por expediente específico (UUID)"
          }
        }
      }
    }
  }
];

// Execute tool calls
async function executeToolCall(
  supabase: any,
  organizationId: string,
  userId: string,
  toolName: string,
  toolInput: any
): Promise<{ result: any; source?: any }> {
  console.log(`Executing tool: ${toolName}`, toolInput);

  switch (toolName) {
    case "search_matters": {
      const { query, limit = 5 } = toolInput;
      const { data, error } = await supabase
        .from("matters")
        .select("id, reference, title, mark_name, ip_type, status, jurisdiction")
        .eq("organization_id", organizationId)
        .or(`reference.ilike.%${query}%,title.ilike.%${query}%,mark_name.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return {
        result: data || [],
        source: data?.map((m: any) => ({
          type: "matter",
          id: m.id,
          title: m.title || m.mark_name,
          reference: m.reference
        }))
      };
    }

    case "create_task": {
      const { title, matter_id, due_date, priority = "medium" } = toolInput;
      const { data, error } = await supabase
        .from("smart_tasks")
        .insert({
          organization_id: organizationId,
          matter_id: matter_id || null,
          title,
          due_date: due_date || null,
          priority,
          task_type: "manual",
          created_by: userId,
          status: "pending"
        })
        .select("id, title")
        .single();

      if (error) throw error;
      return {
        result: { success: true, task: data },
        source: null
      };
    }

    case "get_deadlines": {
      const { days = 30, matter_id } = toolInput;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      let query = supabase
        .from("smart_tasks")
        .select(`
          id, title, due_date, priority, status,
          matter:matters(id, reference, title)
        `)
        .eq("organization_id", organizationId)
        .eq("status", "pending")
        .lte("due_date", futureDate.toISOString())
        .order("due_date", { ascending: true })
        .limit(10);

      if (matter_id) {
        query = query.eq("matter_id", matter_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return {
        result: data || [],
        source: null
      };
    }

    default:
      return { result: { error: "Tool not found" }, source: null };
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
      contextMatterId,
      contextType,
      history = []
    } = await req.json();

    // Build context from linked matter
    let matterContext = "";
    if (contextMatterId) {
      const { data: matter } = await supabaseUser
        .from("matters")
        .select(`
          reference, title, mark_name, ip_type, status, jurisdiction, filing_date,
          contact:contacts(name),
          tasks:smart_tasks(title, status, due_date)
        `)
        .eq("id", contextMatterId)
        .single();

      if (matter) {
        const pendingTasks = matter.tasks?.filter((t: any) => t.status !== "completed") || [];
        const contactName = Array.isArray(matter.contact) 
          ? matter.contact[0]?.name 
          : (matter.contact as any)?.name;
        matterContext = `\n\nEXPEDIENTE ACTIVO:
- Referencia: ${matter.reference}
- Título: ${matter.title || matter.mark_name}
- Tipo: ${matter.ip_type}
- Estado: ${matter.status}
- Jurisdicción: ${matter.jurisdiction}
- Cliente: ${contactName || "No asignado"}
- Tareas pendientes: ${pendingTasks.length}`;
      }
    }

    const fullSystemPrompt = SYSTEM_PROMPT + matterContext;

    // Build messages array
    const messages = [
      ...history.slice(-8),
      { role: "user", content: message }
    ];

    // First API call - may include tool calls
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages
        ],
        tools: TOOLS,
        tool_choice: "auto",
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices?.[0]?.message;

    const actions: any[] = [];
    const sources: any[] = [];
    let finalContent = assistantMessage?.content || "";

    // Handle tool calls if present
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults = [];

      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolInput = JSON.parse(toolCall.function.arguments || "{}");

        try {
          const { result, source } = await executeToolCall(
            supabaseUser,
            organizationId,
            userId,
            toolName,
            toolInput
          );

          actions.push({
            type: toolName,
            results: Array.isArray(result) ? result.length : 1,
            ...toolInput
          });

          if (source) {
            sources.push(...source);
          }

          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: JSON.stringify(result)
          });
        } catch (err) {
          console.error(`Tool ${toolName} failed:`, err);
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: JSON.stringify({ error: "Tool execution failed" })
          });
        }
      }

      // Second API call with tool results
      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4",
          messages: [
            { role: "system", content: fullSystemPrompt },
            ...messages,
            assistantMessage,
            ...toolResults
          ],
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        finalContent = followUpData.choices?.[0]?.message?.content || finalContent;
      }
    }

    const responseTimeMs = Date.now() - startTime;

    // Save messages to database
    if (conversationId) {
      // Save user message
      await supabaseAdmin.from("ai_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: message
      });

      // Save assistant message
      await supabaseAdmin.from("ai_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: finalContent,
        model_used: "anthropic/claude-sonnet-4",
        tokens_input: aiResponse.usage?.prompt_tokens,
        tokens_output: aiResponse.usage?.completion_tokens,
        response_time_ms: responseTimeMs,
        actions_taken: actions.length > 0 ? actions : null,
        sources: sources.length > 0 ? sources : null
      });

      // Update conversation stats - use raw SQL via RPC or simple increment
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
          updated_at: new Date().toISOString()
        })
        .eq("id", conversationId);
    }

    // Log request
    await supabaseAdmin.from("ai_request_logs").insert({
      organization_id: organizationId,
      user_id: userId,
      task_code: "genius_chat_v2",
      input_tokens: aiResponse.usage?.prompt_tokens,
      output_tokens: aiResponse.usage?.completion_tokens,
      total_tokens: aiResponse.usage?.total_tokens,
      latency_ms: responseTimeMs,
      status: "success"
    });

    return new Response(
      JSON.stringify({
        content: finalContent,
        actions,
        sources,
        usage: aiResponse.usage,
        responseTimeMs
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("genius-chat-v2 error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
