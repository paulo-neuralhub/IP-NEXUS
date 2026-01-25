import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

type DemoOrgSlug = "demo-starter" | "demo-professional" | "demo-business" | "demo-enterprise";

type SeedTasksWorkflowsRequest = {
  tenant_slug?: DemoOrgSlug | "all";
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

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function isoTs(d: Date) {
  return d.toISOString();
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

type SmartTaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
type SmartTaskPriority = "low" | "medium" | "high" | "critical";
type SmartTaskType = "filing" | "review" | "response" | "payment" | "renewal" | "opposition" | "custom";

const taskTypeLabels = [
  "Preparar solicitud",
  "Revisar documentación",
  "Responder requerimiento",
  "Llamar a cliente",
  "Facturar expediente",
  "Renovar marca",
  "Seguimiento oposición",
] as const;

function labelToTaskType(label: (typeof taskTypeLabels)[number]): SmartTaskType {
  switch (label) {
    case "Preparar solicitud":
      return "filing";
    case "Revisar documentación":
      return "review";
    case "Responder requerimiento":
      return "response";
    case "Facturar expediente":
      return "payment";
    case "Renovar marca":
      return "renewal";
    case "Seguimiento oposición":
      return "opposition";
    case "Llamar a cliente":
    default:
      return "custom";
  }
}

function taskStatusList150(): SmartTaskStatus[] {
  return [
    ...Array.from({ length: 50 }).map(() => "pending" as const),
    ...Array.from({ length: 30 }).map(() => "in_progress" as const),
    ...Array.from({ length: 60 }).map(() => "completed" as const),
    ...Array.from({ length: 10 }).map(() => "cancelled" as const),
  ];
}

function randomPriority(): SmartTaskPriority {
  const roll = Math.random();
  if (roll < 0.12) return "critical";
  if (roll < 0.35) return "high";
  if (roll < 0.8) return "medium";
  return "low";
}

function demoDocUrl(slug: string, matterId: string, fileName: string) {
  return `https://docs.demo.ipnexus.com/${slug}/${matterId}/${encodeURIComponent(fileName)}`;
}

async function ensureWorkflowTemplates(params: {
  svc: any;
  organizationId: string;
  runId: string;
  createdBy: string;
}) {
  const { svc, organizationId, runId, createdBy } = params;

  const templates = [
    {
      code: "new_trademark_es",
      name: "Nueva marca ES",
      category: "docket",
      description: "(DEMO) Workflow para alta y tramitación inicial de marca en España.",
      trigger_type: "manual",
      trigger_config: { demo: true, jurisdiction: "ES" },
      actions: [
        {
          id: "a1",
          type: "create_task",
          name: "Crear tarea: Preparar solicitud",
          config: { title: "Preparar solicitud (ES)", description: "(DEMO) Reunir datos, poderes y clases.", due_date: "{{variables.due_date}}" },
        },
        {
          id: "a2",
          type: "send_notification",
          name: "Notificar al responsable",
          config: { title: "Nueva marca ES", message: "(DEMO) Se inició un workflow de marca ES.", type: "info" },
        },
        { id: "a3", type: "create_activity", name: "Añadir nota", config: { type: "note", subject: "Checklist inicial", content: "(DEMO) Checklist: clases, logo, prioridad." } },
        { id: "a4", type: "delay", name: "Esperar validación", config: { duration: 12, unit: "hours" } },
        { id: "a5", type: "create_task", name: "Crear tarea: Revisar documentación", config: { title: "Revisar documentación", description: "(DEMO) Validar anexos antes de presentar.", due_date: "{{variables.due_date}}" } },
      ],
    },
    {
      code: "new_trademark_euipo",
      name: "Nueva marca EUIPO",
      category: "docket",
      description: "(DEMO) Workflow para presentación UE (EUIPO) con validaciones.",
      trigger_type: "manual",
      trigger_config: { demo: true, jurisdiction: "EUIPO" },
      actions: [
        { id: "b1", type: "create_task", name: "Preparar solicitud", config: { title: "Preparar solicitud (EUIPO)", description: "(DEMO) Preparar formulario + listas de productos/servicios.", due_date: "{{variables.due_date}}" } },
        { id: "b2", type: "create_task", name: "Revisar documentación", config: { title: "Revisar documentación (EUIPO)", description: "(DEMO) Comprobar clases y representación.", due_date: "{{variables.due_date}}" } },
        { id: "b3", type: "send_notification", name: "Notificar", config: { title: "Nueva marca EUIPO", message: "(DEMO) Workflow EUIPO en curso.", type: "info" } },
        { id: "b4", type: "delay", name: "Esperar confirmación", config: { duration: 24, unit: "hours" } },
        { id: "b5", type: "create_activity", name: "Registrar hito", config: { type: "note", subject: "Hito", content: "(DEMO) Documentación revisada y lista para presentar." } },
      ],
    },
    {
      code: "renewal",
      name: "Renovación",
      category: "docket",
      description: "(DEMO) Workflow de renovación (marca/patente) con facturación y recordatorios.",
      trigger_type: "manual",
      trigger_config: { demo: true },
      actions: [
        { id: "c1", type: "create_task", name: "Analizar vencimiento", config: { title: "Renovar marca", description: "(DEMO) Validar fecha y tasas.", due_date: "{{variables.due_date}}" } },
        { id: "c2", type: "create_task", name: "Facturación", config: { title: "Facturar expediente", description: "(DEMO) Preparar factura y enviar al cliente.", due_date: "{{variables.due_date}}" } },
        { id: "c3", type: "delay", name: "Esperar pago", config: { duration: 48, unit: "hours" } },
        { id: "c4", type: "create_activity", name: "Registrar pago", config: { type: "note", subject: "Pago", content: "(DEMO) Pago registrado / pendiente (simulado)." } },
        { id: "c5", type: "send_notification", name: "Confirmación", config: { title: "Renovación", message: "(DEMO) Renovación en curso (pasos completados/pendientes).", type: "success" } },
      ],
    },
    {
      code: "office_action_response",
      name: "Respuesta Office Action",
      category: "docket",
      description: "(DEMO) Workflow para preparar y presentar respuesta a requerimiento.",
      trigger_type: "manual",
      trigger_config: { demo: true },
      actions: [
        { id: "d1", type: "create_task", name: "Analizar requerimiento", config: { title: "Responder requerimiento", description: "(DEMO) Analizar OA y preparar estrategia.", due_date: "{{variables.due_date}}" } },
        { id: "d2", type: "create_activity", name: "Nota legal", config: { type: "note", subject: "Argumentario", content: "(DEMO) Borrador de argumentario y referencias." } },
        { id: "d3", type: "delay", name: "Revisión interna", config: { duration: 24, unit: "hours" } },
        { id: "d4", type: "create_task", name: "Revisar documentación", config: { title: "Revisar documentación", description: "(DEMO) Adjuntar anexos y evidencias.", due_date: "{{variables.due_date}}" } },
        { id: "d5", type: "send_notification", name: "Recordatorio", config: { title: "Office Action", message: "(DEMO) Plazo en curso: revisar deadlines.", type: "warning" } },
      ],
    },
  ] as const;

  const { data: existing, error: exErr } = await svc
    .from("workflow_templates")
    .select("id, code")
    .eq("organization_id", organizationId)
    .in(
      "code",
      templates.map((t) => t.code) as unknown as string[],
    );
  if (exErr) throw exErr;
  const existingByCode = new Map<string, string>((existing ?? []).map((r: any) => [String(r.code), String(r.id)]));

  const ids: Record<string, string> = {};

  for (const t of templates) {
    const already = existingByCode.get(t.code);
    if (already) {
      ids[t.code] = already;
      continue;
    }

    const { data, error } = await svc
      .from("workflow_templates")
      .insert({
        organization_id: organizationId,
        code: t.code,
        name: t.name,
        description: t.description,
        category: t.category,
        trigger_type: t.trigger_type,
        trigger_config: t.trigger_config,
        conditions: [],
        actions: t.actions,
        is_active: true,
        is_system: false,
        execution_count: 0,
        created_by: createdBy,
      })
      .select("id")
      .single();
    if (error) throw error;
    ids[t.code] = data.id;
    await registerEntity(svc, runId, "workflow_templates", data.id);
  }

  return ids;
}

async function seedTasksAndWorkflowsForOrg(params: {
  svc: any;
  organizationId: string;
  runId: string;
  createdBy: string;
  orgSlug: DemoOrgSlug;
}) {
  const { svc, organizationId, runId, createdBy, orgSlug } = params;

  const { data: matters, error: matErr } = await svc
    .from("matters")
    .select("id, title, reference, ip_type, jurisdiction")
    .eq("organization_id", organizationId)
    .limit(1000);
  if (matErr) throw matErr;
  const matterRows = (matters ?? []) as Array<{
    id: string;
    title: string | null;
    reference: string | null;
    ip_type: string | null;
    jurisdiction: string | null;
  }>;
  if (!matterRows.length) throw new Error("No matters found (seed matters first)");

  const { data: members, error: memErr } = await svc
    .from("memberships")
    .select("user_id")
    .eq("organization_id", organizationId)
    .limit(50);
  if (memErr) throw memErr;
  const userIds = (members ?? []).map((r: any) => String(r.user_id)).filter(Boolean);
  const assignees = userIds.length ? userIds : [createdBy];

  // -------------------------------------------
  // SMART TASKS (150)
  // -------------------------------------------
  const statuses = shuffle(taskStatusList150());
  const createdTaskIds: string[] = [];

  for (let i = 0; i < statuses.length; i++) {
    const status = statuses[i];
    const label = pick(taskTypeLabels);
    const task_type = labelToTaskType(label);
    const priority = randomPriority();
    const matter = pick(matterRows);
    const assignedTo = pick(assignees);

    const dueBase =
      status === "completed" || status === "cancelled"
        ? daysAgo(1 + Math.floor(Math.random() * 120))
        : daysFromNow(Math.floor(Math.random() * 45));
    const dueDate = isoDate(dueBase);
    const triggerDate = isoDate(daysAgo(status === "pending" ? 0 : 2 + Math.floor(Math.random() * 20)));
    const reminderDate = isoDate(new Date(new Date(dueDate).getTime() - 86400000));

    const startedAt = status === "in_progress" || status === "completed" ? isoTs(daysAgo(1 + Math.floor(Math.random() * 20))) : null;
    const completedAt = status === "completed" ? isoTs(daysAgo(Math.floor(Math.random() * 10))) : null;
    const cancelledAt = status === "cancelled" ? isoTs(daysAgo(Math.floor(Math.random() * 20))) : null;

    const attachmentName = `${label.replace(/\s+/g, "_").toLowerCase()}_${String(i + 1).padStart(3, "0")}.pdf`;
    const attachmentUrl = demoDocUrl(orgSlug, matter.id, attachmentName);

    // Create a corresponding matter_document for some tasks
    let docId: string | null = null;
    if (Math.random() < 0.55) {
      const { data: doc, error: docErr } = await svc
        .from("matter_documents")
        .insert({
          organization_id: organizationId,
          matter_id: matter.id,
          name: attachmentName,
          file_path: `demo/${orgSlug}/${matter.id}/${attachmentName}`,
          file_size: 120_000 + Math.floor(Math.random() * 2_400_000),
          mime_type: "application/pdf",
          category: pick(["application", "office_action", "evidence", "invoice", "correspondence"] as const),
          uploaded_by: createdBy,
          description: `(DEMO) Documento adjunto a tarea: ${label}.`,
          is_official: Math.random() < 0.3,
          document_date: isoDate(daysAgo(10 + Math.floor(Math.random() * 250))),
          expiry_date: null,
        })
        .select("id")
        .single();
      if (docErr) throw docErr;
      docId = doc.id;
      await registerEntity(svc, runId, "matter_documents", doc.id);
    }

    const { data: st, error: stErr } = await svc
      .from("smart_tasks")
      .insert({
        organization_id: organizationId,
        matter_id: matter.id,
        portfolio_id: null,
        title: `${label} — ${matter.reference ?? matter.id.slice(0, 8)}`,
        description: `(DEMO) ${label} para expediente “${matter.title ?? "Sin título"}” (${matter.jurisdiction ?? "—"}).`,
        task_type,
        priority,
        status,
        trigger_date: triggerDate,
        reminder_date: reminderDate,
        due_date: dueDate,
        grace_period_days: Math.random() < 0.2 ? 5 : 0,
        assigned_to: assignedTo,
        assigned_by: createdBy,
        is_auto_generated: false,
        started_at: startedAt,
        completed_at: completedAt,
        completed_by: status === "completed" ? assignedTo : null,
        cancelled_at: cancelledAt,
        cancelled_reason: status === "cancelled" ? pick(["Duplicada", "No procede", "Cliente canceló", "Replanificado"] as const) : null,
        metadata: {
          demo: true,
          matter: {
            id: matter.id,
            jurisdiction: matter.jurisdiction,
            ip_type: matter.ip_type,
          },
          attachments: [
            {
              name: attachmentName,
              url: attachmentUrl,
              document_id: docId,
            },
          ],
        },
      })
      .select("id")
      .single();
    if (stErr) throw stErr;
    createdTaskIds.push(st.id);
    await registerEntity(svc, runId, "smart_tasks", st.id);
  }

  // -------------------------------------------
  // WORKFLOWS (templates + running executions)
  // -------------------------------------------
  const templateIds = await ensureWorkflowTemplates({ svc, organizationId, runId, createdBy });

  const instances: Array<{ code: keyof typeof templateIds; count: number }> = [
    { code: "new_trademark_es", count: 5 },
    { code: "new_trademark_euipo", count: 3 },
    { code: "renewal", count: 8 },
    { code: "office_action_response", count: 2 },
  ];

  for (const inst of instances) {
    const workflowId = templateIds[inst.code];
    if (!workflowId) continue;

    const { data: wf, error: wfErr } = await svc
      .from("workflow_templates")
      .select("id, code, name, actions")
      .eq("id", workflowId)
      .single();
    if (wfErr) throw wfErr;

    const actions = (wf.actions ?? []) as Array<{ id: string; type: string; name: string; config: Record<string, unknown> }>;
    const actionCount = actions.length || 5;

    for (let i = 0; i < inst.count; i++) {
      const matter = pick(matterRows);
      const assignedTo = pick(assignees);
      const dueDate = isoDate(daysFromNow(5 + Math.floor(Math.random() * 35)));

      // Create 1-2 matter documents attached to the instance
      const docIds: string[] = [];
      const docsToCreate = 1 + Math.floor(Math.random() * 2);
      for (let d = 0; d < docsToCreate; d++) {
        const fileName = `${inst.code}_${String(i + 1).padStart(2, "0")}_doc_${d + 1}.pdf`;
        const { data: doc, error: docErr } = await svc
          .from("matter_documents")
          .insert({
            organization_id: organizationId,
            matter_id: matter.id,
            name: fileName,
            file_path: `demo/${orgSlug}/${matter.id}/${fileName}`,
            file_size: 90_000 + Math.floor(Math.random() * 4_200_000),
            mime_type: "application/pdf",
            category: pick(["application", "evidence", "office_action", "correspondence"] as const),
            uploaded_by: createdBy,
            description: `(DEMO) Documento adjunto a instancia de workflow ${wf.name}.`,
            is_official: Math.random() < 0.4,
            document_date: isoDate(daysAgo(5 + Math.floor(Math.random() * 120))),
            expiry_date: null,
          })
          .select("id")
          .single();
        if (docErr) throw docErr;
        docIds.push(doc.id);
        await registerEntity(svc, runId, "matter_documents", doc.id);
      }

      // Completed steps: 1..(actionCount-1), ensure at least 1 pending
      const completedSteps = Math.max(1, Math.min(actionCount - 1, 1 + Math.floor(Math.random() * (actionCount - 1))));
      const currentActionIndex = completedSteps + 1;

      const context = {
        demo: true,
        assigned_to: assignedTo,
        due_date: dueDate,
        documents: docIds.map((id) => ({ id })),
      };

      const triggerData = {
        demo: true,
        matter_id: matter.id,
        assigned_to: assignedTo,
        jurisdiction: inst.code === "new_trademark_es" ? "ES" : inst.code === "new_trademark_euipo" ? "EUIPO" : matter.jurisdiction,
        documents: docIds.map((id) => ({
          id,
          url: demoDocUrl(orgSlug, matter.id, `${id}.pdf`),
        })),
      };

      const startedAt = isoTs(daysAgo(1 + Math.floor(Math.random() * 20)));

      const { data: ex, error: exErr } = await svc
        .from("workflow_executions")
        .insert({
          organization_id: organizationId,
          workflow_id: workflowId,
          trigger_type: "manual",
          trigger_data: triggerData,
          status: "running",
          started_at: startedAt,
          current_action_index: currentActionIndex,
          actions_completed: completedSteps,
          actions_failed: 0,
          context,
          result: null,
          error_message: null,
        })
        .select("id")
        .single();
      if (exErr) throw exErr;
      await registerEntity(svc, runId, "workflow_executions", ex.id);

      // Insert logs for completed actions + one running action (pending)
      for (let a = 0; a < Math.min(completedSteps, actionCount); a++) {
        const action = actions[a] ?? { id: `x${a + 1}`, type: "create_task", name: `Paso ${a + 1}`, config: {} };
        const started = isoTs(daysAgo(1 + Math.floor(Math.random() * 14)));
        const completed = isoTs(daysAgo(Math.floor(Math.random() * 7)));
        const duration = 400 + Math.floor(Math.random() * 9000);

        const { data: al, error: alErr } = await svc
          .from("workflow_action_logs")
          .insert({
            execution_id: ex.id,
            action_index: a + 1,
            action_type: action.type,
            action_config: action.config,
            status: "completed",
            started_at: started,
            completed_at: completed,
            duration_ms: duration,
            input_data: { ...context, trigger_data: triggerData },
            output_data: {
              demo: true,
              ok: true,
              created_task_id: Math.random() < 0.6 ? pick(createdTaskIds) : null,
              attached_document_ids: docIds,
            },
            error_message: null,
            retry_count: 0,
          })
          .select("id")
          .single();
        if (alErr) throw alErr;
        await registerEntity(svc, runId, "workflow_action_logs", al.id);
      }

      // current running step
      const runningAction = actions[currentActionIndex - 1] ?? {
        id: `x${currentActionIndex}`,
        type: "create_task",
        name: `Paso ${currentActionIndex}`,
        config: {},
      };
      const { data: ral, error: ralErr } = await svc
        .from("workflow_action_logs")
        .insert({
          execution_id: ex.id,
          action_index: currentActionIndex,
          action_type: runningAction.type,
          action_config: runningAction.config,
          status: "running",
          started_at: isoTs(daysAgo(Math.floor(Math.random() * 2))),
          completed_at: null,
          duration_ms: null,
          input_data: { ...context, trigger_data: triggerData },
          output_data: null,
          error_message: null,
          retry_count: 0,
        })
        .select("id")
        .single();
      if (ralErr) throw ralErr;
      await registerEntity(svc, runId, "workflow_action_logs", ral.id);
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

    const body = (await req.json().catch(() => ({}))) as Partial<SeedTasksWorkflowsRequest>;
    const tenantSlug = body.tenant_slug ?? "all";

    const allTargets: DemoOrgSlug[] = ["demo-starter", "demo-professional", "demo-business", "demo-enterprise"];
    const targets: DemoOrgSlug[] =
      tenantSlug === "all" ? allTargets : ([tenantSlug] as DemoOrgSlug[]);
    const results: Array<{ slug: DemoOrgSlug; run_id: string }> = [];

    for (const slug of targets) {
      const orgId = await getOrgIdBySlug(svc, slug);
      const runId = await createRun(svc, orgId, callerId, "tasks-workflows-v1");
      await seedTasksAndWorkflowsForOrg({
        svc,
        organizationId: orgId,
        runId,
        createdBy: callerId,
        orgSlug: slug,
      });
      await completeRun(svc, runId);
      results.push({ slug, run_id: runId });
    }

    return json({ ok: true, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
});
