import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

type DemoOrgSlug = "demo-starter" | "demo-professional" | "demo-business" | "demo-enterprise";

type DeadlinePlanItem = {
  title: string;
  deadline_type: string;
  days_from_now: number;
  status: "pending" | "upcoming" | "urgent" | "overdue" | "completed";
  priority: "low" | "normal" | "high" | "critical";
  completed: boolean;
};

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...(init.headers ?? {}),
    },
  });
}

function getBearerToken(req: Request) {
  const h = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function assertIsSuperadmin(svc: any, userId: string) {
  const { data, error } = await svc
    .from("superadmins")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("forbidden: superadmin required");
}

async function getOrgIdBySlug(svc: any, slug: DemoOrgSlug) {
  const { data, error } = await svc.from("organizations").select("id").eq("slug", slug).single();
  if (error) throw error;
  return data.id as string;
}

async function createRun(svc: any, organizationId: string, createdBy: string, seedVersion: string) {
  const { data, error } = await svc
    .from("demo_seed_runs")
    .insert({
      organization_id: organizationId,
      created_by: createdBy,
      status: "running",
      seed_version: seedVersion,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

async function registerEntity(svc: any, runId: string, tableName: string, rowId: string) {
  const { error } = await svc.from("demo_seed_entities").insert({
    run_id: runId,
    table_name: tableName,
    row_id: rowId,
  });
  if (error) throw error;
}

async function completeRun(svc: any, runId: string) {
  const { error } = await svc
    .from("demo_seed_runs")
    .update({ status: "completed", finished_at: new Date().toISOString() })
    .eq("id", runId);
  if (error) throw error;
}

function buildDeadlinePlan(): DeadlinePlanItem[] {
  const plan: DeadlinePlanItem[] = [];

  // Critical (7 days)
  plan.push(
    ...Array.from({ length: 3 }).map((_, i) => ({
      title: `Renovación próxima (DEMO) #${i + 1}`,
      deadline_type: "renewal",
      days_from_now: 7,
      status: "urgent" as const,
      priority: "critical" as const,
      completed: false,
    })),
  );
  plan.push(
    ...Array.from({ length: 2 }).map((_, i) => ({
      title: `Respuesta Office Action (DEMO) #${i + 1}`,
      deadline_type: "office_action_response",
      days_from_now: 7,
      status: "urgent" as const,
      priority: "critical" as const,
      completed: false,
    })),
  );
  plan.push({
    title: "Fin período de oposición (DEMO)",
    deadline_type: "opposition_end",
    days_from_now: 7,
    status: "urgent",
    priority: "critical",
    completed: false,
  });

  // Urgent (30 days)
  plan.push(
    ...Array.from({ length: 5 }).map((_, i) => ({
      title: `Anualidad patente (DEMO) #${i + 1}`,
      deadline_type: "patent_annuity",
      days_from_now: 30,
      status: "upcoming" as const,
      priority: "high" as const,
      completed: false,
    })),
  );
  plan.push(
    ...Array.from({ length: 3 }).map((_, i) => ({
      title: `Plazo prioridad PCT (DEMO) #${i + 1}`,
      deadline_type: "pct_priority",
      days_from_now: 30,
      status: "upcoming" as const,
      priority: "high" as const,
      completed: false,
    })),
  );
  plan.push(
    ...Array.from({ length: 2 }).map((_, i) => ({
      title: `Respuesta a requerimiento (DEMO) #${i + 1}`,
      deadline_type: "requirement_response",
      days_from_now: 30,
      status: "upcoming" as const,
      priority: "high" as const,
      completed: false,
    })),
  );

  // Normal (90 days)
  plan.push(
    ...Array.from({ length: 10 }).map((_, i) => ({
      title: `Renovación programada (DEMO) #${i + 1}`,
      deadline_type: "renewal",
      days_from_now: 90,
      status: "pending" as const,
      priority: "normal" as const,
      completed: false,
    })),
  );
  plan.push(
    ...Array.from({ length: 5 }).map((_, i) => ({
      title: `Solicitud de examen (DEMO) #${i + 1}`,
      deadline_type: "exam_request",
      days_from_now: 90,
      status: "pending" as const,
      priority: "normal" as const,
      completed: false,
    })),
  );
  plan.push(
    ...Array.from({ length: 3 }).map((_, i) => ({
      title: `Entrada fase nacional (DEMO) #${i + 1}`,
      deadline_type: "national_phase_entry",
      days_from_now: 90,
      status: "pending" as const,
      priority: "normal" as const,
      completed: false,
    })),
  );

  // Overdue
  plan.push(
    ...Array.from({ length: 2 }).map((_, i) => ({
      title: `Plazo vencido sin completar (DEMO) #${i + 1}`,
      deadline_type: "overdue_demo",
      days_from_now: -5 - i,
      status: "overdue" as const,
      priority: "critical" as const,
      completed: false,
    })),
  );

  // Completed history
  plan.push(
    ...Array.from({ length: 20 }).map((_, i) => ({
      title: `Plazo completado (DEMO) #${i + 1}`,
      deadline_type: pick(["renewal", "office_action_response", "payment", "filing"]),
      days_from_now: -randomInt(10, 250),
      status: "completed" as const,
      priority: pick(["low", "normal", "high"] as const),
      completed: true,
    })),
  );

  return plan;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedDeadlinesForOrg(params: {
  svc: any;
  organizationId: string;
  runId: string;
  createdBy: string;
}) {
  const { svc, organizationId, runId, createdBy } = params;

  // Get a pool of matters for this org
  const { data: matters, error: mErr } = await svc
    .from("matters")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(500);
  if (mErr) throw mErr;
  const matterIds: string[] = (matters ?? []).map((r: any) => String(r.id)).filter(Boolean);
  if (!matterIds.length) throw new Error("No matters found for organization (seed matters first)");

  const plan = buildDeadlinePlan();
  const alertOffsets = [30, 15, 7, 1] as const;
  const alertTypes = {
    30: "days_30",
    15: "days_15",
    7: "days_7",
    1: "days_1",
  } as const;

  for (const item of plan) {
    const matterId = pick(matterIds);
    const deadlineDate = daysFromNow(item.days_from_now);
    const triggerDate = daysFromNow(item.days_from_now - 30);

    const completedAt = item.completed ? new Date(deadlineDate.getTime() - randomInt(1, 30) * 86400000) : null;

    const { data: d, error: dErr } = await svc
      .from("matter_deadlines")
      .insert({
        organization_id: organizationId,
        matter_id: matterId,
        deadline_type: item.deadline_type,
        title: item.title,
        description: "(DEMO) Plazo realista generado automáticamente.",
        trigger_date: isoDate(triggerDate),
        deadline_date: isoDate(deadlineDate),
        status: item.status,
        priority: item.priority,
        completed_at: completedAt ? completedAt.toISOString() : null,
        completed_by: item.completed ? createdBy : null,
        completion_notes: item.completed ? "(DEMO) Marcado como completado." : null,
        alerts_sent: {},
        next_alert_date: isoDate(daysFromNow(item.days_from_now - 30)),
        metadata: {
          demo: true,
          requested_alerts: ["reminder_30d", "warning_14d", "urgent_7d", "critical_1d"],
        },
      })
      .select("id")
      .single();
    if (dErr) throw dErr;
    await registerEntity(svc, runId, "matter_deadlines", d.id);

    // Create scheduled alerts rows (in-app). Map 14d -> days_15 (closest available).
    for (const off of alertOffsets) {
      const { data: a, error: aErr } = await svc
        .from("deadline_alerts")
        .insert({
          organization_id: organizationId,
          deadline_id: d.id,
          alert_type: alertTypes[off],
          channel: "in_app",
          recipient_id: null,
          recipient_email: null,
          status: "pending",
          subject: item.title,
          body: `(DEMO) Alerta programada ${off} días antes.`,
        })
        .select("id")
        .single();
      if (aErr) throw aErr;
      await registerEntity(svc, runId, "deadline_alerts", a.id);
    }

    // Add an explicit overdue alert row for overdue items
    if (item.status === "overdue") {
      const { data: a2, error: a2Err } = await svc
        .from("deadline_alerts")
        .insert({
          organization_id: organizationId,
          deadline_id: d.id,
          alert_type: "overdue",
          channel: "in_app",
          status: "pending",
          subject: item.title,
          body: "(DEMO) Plazo vencido.",
        })
        .select("id")
        .single();
      if (a2Err) throw a2Err;
      await registerEntity(svc, runId, "deadline_alerts", a2.id);
    }
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) {
      return json(
        { error: "Missing SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 },
      );
    }

    const token = getBearerToken(req);
    if (!token) return json({ error: "Unauthorized" }, { status: 401 });

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: authData, error: authErr } = await userClient.auth.getUser();
    if (authErr) return json({ error: authErr.message }, { status: 401 });
    const callerId = authData.user?.id;
    if (!callerId) return json({ error: "Unauthorized" }, { status: 401 });

    const svc = createClient(url, serviceKey);
    await assertIsSuperadmin(svc, callerId);

    const targets: DemoOrgSlug[] = ["demo-starter", "demo-professional", "demo-business", "demo-enterprise"];
    const results: Array<{ slug: DemoOrgSlug; run_id: string; deadlines: number; alerts: number }> = [];

    for (const slug of targets) {
      const orgId = await getOrgIdBySlug(svc, slug);
      const runId = await createRun(svc, orgId, callerId, "deadlines-coverage-v1");
      await seedDeadlinesForOrg({ svc, organizationId: orgId, runId, createdBy: callerId });
      await completeRun(svc, runId);

      // 56 deadlines. Alerts: 4 per deadline + 2 overdue extra.
      results.push({ slug, run_id: runId, deadlines: 56, alerts: 56 * 4 + 2 });
    }

    return json({ ok: true, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
});
