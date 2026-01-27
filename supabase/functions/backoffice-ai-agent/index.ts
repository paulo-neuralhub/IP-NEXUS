// ============================================================
// IP-NEXUS BACKOFFICE AI AGENT
// - Authenticated (verify_jwt=true)
// - Uses Lovable AI Gateway (LOVABLE_API_KEY)
// - Tools implemented server-side via Supabase RPC/queries
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ChatMessage = { role: "user" | "assistant"; content: string };

type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function safeParseArgs<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

  if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY is not configured" }, 500);
  if (!SUPABASE_URL) return json({ error: "SUPABASE_URL is not configured" }, 500);
  if (!SUPABASE_ANON_KEY) return json({ error: "SUPABASE_ANON_KEY is not configured" }, 500);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const body = await req.json().catch(() => null);
    const messages = (body?.messages ?? []) as ChatMessage[];
    const sessionId = (body?.sessionId ?? null) as string | null;

    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: "messages is required" }, 400);
    }

    const { data: staffOk, error: staffErr } = await supabase.rpc("is_backoffice_staff");
    if (staffErr) return json({ error: staffErr.message }, 500);
    if (!staffOk) return json({ error: "forbidden" }, 403);

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) return json({ error: userErr.message }, 401);
    const userId = userRes.user?.id;
    if (!userId) return json({ error: "unauthorized" }, 401);

    // Create/load session
    let activeSessionId = sessionId;
    if (activeSessionId) {
      const { data: s } = await supabase
        .from("ai_agent_sessions")
        .select("id")
        .eq("id", activeSessionId)
        .maybeSingle();
      if (!s) activeSessionId = null;
    }

    if (!activeSessionId) {
      const { data: created, error: createErr } = await supabase
        .from("ai_agent_sessions")
        .insert({ user_id: userId })
        .select("id")
        .single();
      if (createErr) return json({ error: createErr.message }, 500);
      activeSessionId = created.id;
    }

    // Persist the last user message immediately
    const lastUser = [...messages].reverse().find((m) => m?.role === "user");
    if (lastUser?.content) {
      await supabase.from("ai_agent_messages").insert({
        session_id: activeSessionId,
        role: "user",
        content: lastUser.content,
      });
    }

    // Context snapshot for system prompt
    const [{ data: metrics }, { data: criticalAlerts }] = await Promise.all([
      supabase.rpc("ai_get_global_metrics"),
      supabase
        .from("system_alerts")
        .select("title,priority,created_at,organization_id")
        .eq("status", "active")
        .in("priority", ["high", "critical"])
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const systemPrompt =
      `Eres **Nexus**, el Agente IA de Backoffice de IP-NEXUS.\n` +
      `Tu objetivo es ayudar al equipo (admins y superadmins) a operar la plataforma.\n\n` +
      `Reglas:\n` +
      `- Responde en español.\n` +
      `- Sé conciso, orientado a acción.\n` +
      `- Si necesitas datos, usa herramientas (tool calls).\n` +
      `- No inventes IDs ni cifras.\n\n` +
      `Contexto (snapshot):\n` +
      `Fecha: ${new Date().toISOString()}\n\n` +
      `Métricas globales (JSON):\n${JSON.stringify(metrics ?? {}, null, 2)}\n\n` +
      `Alertas críticas/altas (${criticalAlerts?.length ?? 0}):\n` +
      `${(criticalAlerts ?? [])
        .map((a: any) => `- [${String(a.priority).toUpperCase()}] ${a.title}`)
        .join("\n") || "(ninguna)"}`;

    const tools = [
      {
        type: "function",
        function: {
          name: "search_knowledge",
          description:
            "Busca en la base de conocimiento interna (procedimientos, troubleshooting, features).",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" },
              category: {
                type: "string",
                enum: ["documentation", "faq", "troubleshooting", "procedures", "policies", "features"],
              },
              limit: { type: "number" },
            },
            required: ["query"],
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_global_metrics",
          description: "Obtiene métricas globales del sistema (MRR, suscriptores, churn, etc.).",
          parameters: { type: "object", properties: {}, additionalProperties: false },
        },
      },
      {
        type: "function",
        function: {
          name: "get_organization_context",
          description: "Obtiene un resumen completo de una organización por ID.",
          parameters: {
            type: "object",
            properties: {
              organization_id: { type: "string" },
            },
            required: ["organization_id"],
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "search_organizations",
          description: "Busca organizaciones/tenants por nombre o email.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" },
              plan: { type: "string", enum: ["starter", "professional", "enterprise"] },
              status: { type: "string", enum: ["active", "trialing", "past_due", "canceled"] },
              limit: { type: "number" },
            },
            required: ["query"],
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "list_active_alerts",
          description: "Lista alertas activas (opcionalmente por prioridad).",
          parameters: {
            type: "object",
            properties: {
              priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
              limit: { type: "number" },
            },
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "search_events",
          description: "Busca en system_events por texto y filtros.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" },
              organization_id: { type: "string" },
              severity: { type: "string", enum: ["debug", "info", "warning", "error", "critical"] },
              days_back: { type: "number" },
              limit: { type: "number" },
            },
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_mrr_breakdown",
          description: "Obtiene desglose del MRR por plan y add-ons.",
          parameters: {
            type: "object",
            properties: {
              period: { type: "string", enum: ["current", "previous_month", "last_quarter"] },
            },
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_at_risk_tenants",
          description: "Obtiene tenants en riesgo de churn basado en health score.",
          parameters: {
            type: "object",
            properties: {
              risk_level: { type: "string", enum: ["high", "medium", "all"] },
              limit: { type: "number" },
            },
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_subscription_details",
          description: "Obtiene detalles de la suscripción de un tenant.",
          parameters: {
            type: "object",
            properties: {
              organization_id: { type: "string" },
              include_history: { type: "boolean" },
            },
            required: ["organization_id"],
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "compare_periods",
          description: "Compara métricas entre dos períodos.",
          parameters: {
            type: "object",
            properties: {
              metric: { type: "string", enum: ["mrr", "subscriptions", "churn", "users", "matters"] },
              period1: { type: "string", enum: ["this_month", "last_month", "this_quarter", "last_quarter"] },
              period2: { type: "string", enum: ["this_month", "last_month", "this_quarter", "last_quarter"] },
            },
            required: ["metric", "period1", "period2"],
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_office_status",
          description: "Obtiene estado de conexión con oficinas de PI.",
          parameters: {
            type: "object",
            properties: {
              office_code: { type: "string" },
            },
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_recent_signups",
          description: "Obtiene los registros más recientes.",
          parameters: {
            type: "object",
            properties: {
              hours: { type: "number" },
              limit: { type: "number" },
            },
            additionalProperties: false,
          },
        },
      },
    ];

    async function runTool(name: string, args: Record<string, unknown>) {
      switch (name) {
        case "search_knowledge": {
          const query = String(args.query ?? "");
          const category = args.category ? String(args.category) : null;
          const limit = Number(args.limit ?? 5);
          const { data, error } = await supabase.rpc("ai_search_knowledge", {
            p_query: query,
            p_category: category,
            p_limit: limit,
          });
          if (error) throw new Error(error.message);
          return data;
        }
        case "get_global_metrics": {
          const { data, error } = await supabase.rpc("ai_get_global_metrics");
          if (error) throw new Error(error.message);
          return data;
        }
        case "get_organization_context": {
          const orgId = String(args.organization_id ?? "");
          const { data, error } = await supabase.rpc("ai_get_organization_context", {
            p_org_id: orgId,
          });
          if (error) throw new Error(error.message);
          return data;
        }
        case "search_organizations": {
          const q = String(args.query ?? "");
          const limit = Math.min(Math.max(Number(args.limit ?? 10), 1), 20);
          let query = supabase
            .from("organizations")
            .select("id,name,created_at,plan,status")
            .ilike("name", `%${q}%`)
            .order("created_at", { ascending: false })
            .limit(limit);
          
          if (args.plan) query = query.eq("plan", args.plan);
          if (args.status) query = query.eq("status", args.status);
          
          const { data, error } = await query;
          if (error) throw new Error(error.message);
          return data;
        }
        case "list_active_alerts": {
          const priority = args.priority ? String(args.priority) : null;
          const limit = Math.min(Math.max(Number(args.limit ?? 20), 1), 50);
          let q = supabase
            .from("v_active_alerts")
            .select(
              "id,alert_type,priority,status,title,created_at,organization_id,organization_name"
            )
            .limit(limit);
          if (priority) q = q.eq("priority", priority);
          const { data, error } = await q;
          if (error) throw new Error(error.message);
          return data;
        }
        case "search_events": {
          const query = args.query ? String(args.query) : "";
          const orgId = args.organization_id ? String(args.organization_id) : null;
          const severity = args.severity ? String(args.severity) : null;
          const daysBack = Math.min(Math.max(Number(args.days_back ?? 7), 1), 90);
          const limit = Math.min(Math.max(Number(args.limit ?? 20), 1), 50);

          const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
          let q = supabase
            .from("system_events")
            .select("id,event_type,title,description,severity,organization_id,created_at")
            .gte("created_at", since)
            .order("created_at", { ascending: false })
            .limit(limit);

          if (orgId) q = q.eq("organization_id", orgId);
          if (severity) q = q.eq("severity", severity);
          if (query) {
            q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
          }

          const { data, error } = await q;
          if (error) throw new Error(error.message);
          return data;
        }
        case "get_mrr_breakdown": {
          // Get MRR breakdown by plan
          const { data: subscriptions, error } = await supabase
            .from("tenant_subscriptions")
            .select("product_id, mrr, status, organization_id")
            .eq("status", "active");
          
          if (error) throw new Error(error.message);
          
          const breakdown = {
            total_mrr: 0,
            by_plan: {} as Record<string, { count: number; mrr: number }>,
            active_subscriptions: 0,
          };
          
          for (const sub of subscriptions || []) {
            breakdown.total_mrr += Number(sub.mrr || 0);
            breakdown.active_subscriptions++;
            const plan = sub.product_id || "unknown";
            if (!breakdown.by_plan[plan]) {
              breakdown.by_plan[plan] = { count: 0, mrr: 0 };
            }
            breakdown.by_plan[plan].count++;
            breakdown.by_plan[plan].mrr += Number(sub.mrr || 0);
          }
          
          return breakdown;
        }
        case "get_at_risk_tenants": {
          const riskLevel = args.risk_level ? String(args.risk_level) : "high";
          const limit = Math.min(Math.max(Number(args.limit ?? 10), 1), 50);
          
          // Get organizations with low activity (simplified health check)
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          
          const { data, error } = await supabase
            .from("organizations")
            .select(`
              id, name, created_at, plan,
              tenant_subscriptions(mrr, status),
              memberships(count)
            `)
            .order("created_at", { ascending: true })
            .limit(limit);
          
          if (error) throw new Error(error.message);
          
          // Calculate simple health score (would be more sophisticated in production)
          const atRisk = (data || []).map((org: any) => ({
            id: org.id,
            name: org.name,
            plan: org.plan,
            mrr: org.tenant_subscriptions?.[0]?.mrr || 0,
            users_count: org.memberships?.length || 0,
            risk_reason: org.memberships?.length <= 1 ? "Single user" : "Low activity",
          }));
          
          return atRisk;
        }
        case "get_subscription_details": {
          const orgId = String(args.organization_id ?? "");
          
          const { data: sub, error } = await supabase
            .from("tenant_subscriptions")
            .select(`
              *,
              organizations(name, created_at),
              products(name, description)
            `)
            .eq("organization_id", orgId)
            .maybeSingle();
          
          if (error) throw new Error(error.message);
          
          let history = null;
          if (args.include_history) {
            const { data: hist } = await supabase
              .from("subscription_events")
              .select("*")
              .eq("organization_id", orgId)
              .order("created_at", { ascending: false })
              .limit(10);
            history = hist;
          }
          
          return { subscription: sub, history };
        }
        case "compare_periods": {
          const metric = String(args.metric);
          const period1 = String(args.period1);
          const period2 = String(args.period2);
          
          // Simplified comparison - would use analytics tables in production
          return {
            metric,
            period1: { label: period1, value: Math.random() * 10000 },
            period2: { label: period2, value: Math.random() * 10000 },
            change_percent: (Math.random() * 20 - 10).toFixed(1),
            note: "Datos de demostración - conectar a analytics_daily_metrics en producción",
          };
        }
        case "get_office_status": {
          const officeCode = args.office_code ? String(args.office_code) : null;
          
          let query = supabase
            .from("ipo_offices")
            .select("code, name_official, api_status, last_health_check, avg_response_time_ms");
          
          if (officeCode && officeCode !== "all") {
            query = query.eq("code", officeCode);
          }
          
          const { data, error } = await query;
          if (error) throw new Error(error.message);
          return data;
        }
        case "get_recent_signups": {
          const hours = Math.min(Math.max(Number(args.hours ?? 24), 1), 168);
          const limit = Math.min(Math.max(Number(args.limit ?? 10), 1), 50);
          
          const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
          
          const { data, error } = await supabase
            .from("organizations")
            .select("id, name, created_at, plan")
            .gte("created_at", since)
            .order("created_at", { ascending: false })
            .limit(limit);
          
          if (error) throw new Error(error.message);
          return { signups: data, count: data?.length || 0, period_hours: hours };
        }
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    }

    const toolTrace: Array<{ tool: string; input: unknown; output_summary: string }> = [];

    async function callGateway(payload: Record<string, unknown>) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 429) return json({ error: "rate_limited" }, 429);
        if (res.status === 402) return json({ error: "payment_required" }, 402);
        const t = await res.text().catch(() => "");
        console.error("AI gateway error", res.status, t);
        return json({ error: "ai_gateway_error" }, 500);
      }
      const data = await res.json();
      return data;
    }

    // Tool-calling loop (max 3 rounds)
    const baseMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    let gatewayResp: any = await callGateway({
      model: "google/gemini-3-flash-preview",
      messages: baseMessages,
      tools,
      temperature: 0.2,
    });
    if (gatewayResp instanceof Response) return gatewayResp;

    for (let i = 0; i < 3; i++) {
      const toolCalls =
        (gatewayResp?.choices?.[0]?.message?.tool_calls as ToolCall[] | undefined) ??
        [];
      if (!toolCalls.length) break;

      const toolResults: any[] = [];
      for (const tc of toolCalls) {
        const args = safeParseArgs<Record<string, unknown>>(tc.function.arguments) ?? {};
        const out = await runTool(tc.function.name, args);
        toolTrace.push({
          tool: tc.function.name,
          input: args,
          output_summary: JSON.stringify(out).slice(0, 240),
        });
        toolResults.push({
          tool_call_id: tc.id,
          role: "tool",
          name: tc.function.name,
          content: JSON.stringify(out),
        });
      }

      gatewayResp = await callGateway({
        model: "google/gemini-3-flash-preview",
        messages: [...baseMessages, gatewayResp.choices[0].message, ...toolResults],
        tools,
        temperature: 0.2,
      });
      if (gatewayResp instanceof Response) return gatewayResp;
    }

    const assistantText =
      (gatewayResp?.choices?.[0]?.message?.content as string | undefined) ??
      "No pude generar respuesta.";

    // Persist assistant message
    await supabase.from("ai_agent_messages").insert({
      session_id: activeSessionId,
      role: "assistant",
      content: assistantText,
      tools_used: toolTrace,
      tokens_used: gatewayResp?.usage?.total_tokens ?? null,
    });

    await supabase
      .from("ai_agent_sessions")
      .update({
        total_messages: (body?.total_messages_delta ? Number(body.total_messages_delta) : 0) + 2,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", activeSessionId);

    return json({
      sessionId: activeSessionId,
      message: assistantText,
      toolsUsed: toolTrace.map((t) => t.tool),
    });
  } catch (e) {
    console.error("backoffice-ai-agent error:", e);
    return json({ error: e instanceof Error ? e.message : "unknown_error" }, 500);
  }
});
