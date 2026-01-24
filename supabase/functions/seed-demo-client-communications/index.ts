import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

type DemoOrgSlug = "demo-starter" | "demo-professional" | "demo-business" | "demo-enterprise";

type SeedClientCommsRequest = {
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

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function isoTs(d: Date) {
  return d.toISOString();
}

function normalizeSlug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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

function fakePdfAttachment(companyName: string, kind: "invoice" | "report") {
  const slug = normalizeSlug(companyName);
  const fileName = kind === "invoice" ? `Factura_${slug}.pdf` : `Informe_${slug}.pdf`;
  return {
    file_name: fileName,
    mime_type: "application/pdf",
    size_bytes: 120000 + Math.floor(Math.random() * 900000),
    url: `https://files.demo.ipnexus.com/${slug}/${encodeURIComponent(fileName)}`,
    kind,
    demo: true,
  };
}

function sampleEmailSubjects(kind: "invoice" | "report" | "update" | "question" | "approval") {
  const map: Record<string, string[]> = {
    invoice: [
      "Factura disponible",
      "Envío de factura",
      "Factura y detalle de servicios",
      "Factura — confirmación",
    ],
    report: [
      "Informe de anterioridades",
      "Informe de vigilancia",
      "Informe de estado de cartera",
      "Informe mensual de PI",
    ],
    update: [
      "Actualización de expediente",
      "Estado del trámite",
      "Próximos pasos",
      "Resumen semanal",
    ],
    question: [
      "Consulta sobre clases",
      "Duda sobre plazos",
      "Solicitud de presupuesto",
      "Pregunta sobre estrategia",
    ],
    approval: [
      "Aprobación de borrador",
      "Confirmación de instrucciones",
      "OK para presentar",
      "Aprobado — proceder",
    ],
  };
  return pick(map[kind]);
}

function sampleWhatsappText(kind: "followup" | "confirm" | "deadline") {
  const map: Record<string, string[]> = {
    followup: [
      "Te dejo esto por aquí; cuando puedas lo revisas.",
      "¿Te va bien que lo enviemos hoy?",
      "¿Tienes un minuto para un update rápido?",
    ],
    confirm: [
      "Recibido, gracias.",
      "Perfecto, lo confirmo y seguimos.",
      "Ok, anotado.",
    ],
    deadline: [
      "Recordatorio: vence un plazo importante esta semana.",
      "Aviso: tenemos un deadline en 7 días. ¿Confirmas instrucciones?",
      "Te aviso de un vencimiento próximo; te mando el detalle por email.",
    ],
  };
  return pick(map[kind]);
}

function sampleCallTranscript() {
  const lines = [
    "(DEMO) Cliente: Queríamos confirmar si podemos extender el plazo.",
    "(DEMO) Abogado: Revisamos opciones y os enviamos recomendación hoy.",
    "(DEMO) Cliente: Perfecto, quedamos a la espera.",
  ];
  return lines.join("\n");
}

async function seedForOrg(params: { svc: any; organizationId: string; runId: string; createdBy: string }) {
  const { svc, organizationId, runId, createdBy } = params;

  // Top 10 company contacts (most recently updated/created)
  const { data: clients, error: cErr } = await svc
    .from("contacts")
    .select("id,name,email,phone")
    .eq("organization_id", organizationId)
    .eq("type", "company")
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);
  if (cErr) throw cErr;
  const topClients = (clients ?? []) as Array<{ id: string; name: string; email: string | null; phone: string | null }>;
  if (!topClients.length) throw new Error("No company clients found (seed clients first)");

  // Assignees from memberships (different users)
  const { data: members, error: mErr } = await svc
    .from("memberships")
    .select("user_id")
    .eq("organization_id", organizationId)
    .limit(50);
  if (mErr) throw mErr;
  const userIds = (members ?? []).map((r: any) => String(r.user_id)).filter(Boolean);
  const assignees = userIds.length ? userIds : [createdBy];

  // Some matters to link
  const { data: matters, error: matErr } = await svc
    .from("matters")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(200);
  if (matErr) throw matErr;
  const matterIds = (matters ?? []).map((r: any) => String(r.id)).filter(Boolean);

  for (const client of topClients) {
    const domain = `${normalizeSlug(client.name)}.demo.ipnexus.com`;
    const clientEmail = client.email ?? `legal@${domain}`;
    const internalFrom = `equipo@ipnexus.demo`;

    // EMAILS (20): mix sent/received, with simulated PDF attachments
    for (let i = 0; i < 20; i++) {
      const outbound = i % 2 === 0;
      const kind = pick(["invoice", "report", "update", "question", "approval"] as const);
      const subject = `${sampleEmailSubjects(kind)} — ${client.name}`;
      const receivedAt = daysAgo(3 + Math.floor(Math.random() * 240));
      const hasPdf = kind === "invoice" || kind === "report";

      const attachments = hasPdf
        ? [fakePdfAttachment(client.name, kind === "invoice" ? "invoice" : "report")]
        : [];

      const { data: comm, error: commErr } = await svc
        .from("communications")
        .insert({
          organization_id: organizationId,
          client_id: client.id,
          contact_id: client.id,
          matter_id: matterIds.length ? pick(matterIds) : null,
          channel: "email",
          direction: outbound ? "outbound" : "inbound",
          subject,
          body: `(DEMO) ${outbound ? "Enviado" : "Recibido"}: ${subject}.\n\nAdjuntos: ${hasPdf ? "PDF" : "—"}.`,
          body_preview: `(DEMO) ${subject}`,
          attachments,
          email_from: outbound ? internalFrom : clientEmail,
          email_to: outbound ? [clientEmail] : [internalFrom],
          email_cc: [],
          email_bcc: [],
          email_message_id: `demo-${organizationId}-${client.id}-${i}@mail.demo`,
          email_thread_id: `thread-${client.id}`,
          is_read: Math.random() < 0.7,
          received_at: isoTs(receivedAt),
        })
        .select("id")
        .single();
      if (commErr) throw commErr;
      await registerEntity(svc, runId, "communications", comm.id);
    }

    // CALLS (10)
    for (let i = 0; i < 10; i++) {
      const inbound = i % 2 === 0;
      const durMin = 2 + Math.floor(Math.random() * 44);
      const when = daysAgo(5 + Math.floor(Math.random() * 210));
      const createdBy = pick(assignees);

      const { data: act, error: aErr } = await svc
        .from("activities")
        .insert({
          organization_id: organizationId,
          owner_type: "tenant",
          type: "call",
          contact_id: client.id,
          matter_id: matterIds.length ? pick(matterIds) : null,
          direction: inbound ? "inbound" : "outbound",
          subject: `Llamada ${inbound ? "entrante" : "saliente"} — ${client.name}`,
          content: `(DEMO) Notas de llamada.\n\nTranscripción:\n${sampleCallTranscript()}`,
          call_duration: durMin * 60,
          call_outcome: pick(["completed", "follow_up", "voicemail"]),
          created_by: createdBy,
          created_at: isoTs(when),
        })
        .select("id")
        .single();
      if (aErr) throw aErr;
      await registerEntity(svc, runId, "activities", act.id);
    }

    // WHATSAPP (15)
    for (let i = 0; i < 15; i++) {
      const inbound = Math.random() < 0.45;
      const when = daysAgo(2 + Math.floor(Math.random() * 120));
      const txt = sampleWhatsappText(pick(["followup", "confirm", "deadline"] as const));
      const createdBy = pick(assignees);

      // unified inbox record
      const { data: comm, error: commErr } = await svc
        .from("communications")
        .insert({
          organization_id: organizationId,
          client_id: client.id,
          contact_id: client.id,
          matter_id: matterIds.length ? pick(matterIds) : null,
          channel: "whatsapp",
          direction: inbound ? "inbound" : "outbound",
          subject: null,
          body: `(DEMO) ${txt}`,
          body_preview: txt.slice(0, 80),
          whatsapp_from: inbound ? (client.phone ?? "+34 600 000 000") : "+34 699 111 222",
          whatsapp_to: inbound ? "+34 699 111 222" : (client.phone ?? "+34 600 000 000"),
          whatsapp_type: "text",
          received_at: isoTs(when),
          is_read: true,
          read_at: isoTs(new Date(when.getTime() + 5 * 60000)),
          read_by: null,
        })
        .select("id")
        .single();
      if (commErr) throw commErr;
      await registerEntity(svc, runId, "communications", comm.id);

      // timeline record
      const { data: act, error: aErr } = await svc
        .from("activities")
        .insert({
          organization_id: organizationId,
          owner_type: "tenant",
          type: "whatsapp",
          contact_id: client.id,
          matter_id: matterIds.length ? pick(matterIds) : null,
          direction: inbound ? "inbound" : "outbound",
          subject: `WhatsApp — ${client.name}`,
          content: `(DEMO) ${txt}`,
          created_by: createdBy,
          created_at: isoTs(when),
        })
        .select("id")
        .single();
      if (aErr) throw aErr;
      await registerEntity(svc, runId, "activities", act.id);
    }

    // MEETINGS (5)
    for (let i = 0; i < 5; i++) {
      const isVideo = Math.random() < 0.6;
      const start = daysAgo(7 + Math.floor(Math.random() * 180));
      start.setHours(9 + Math.floor(Math.random() * 7), [0, 30][Math.floor(Math.random() * 2)], 0, 0);
      const end = new Date(start.getTime() + (30 + Math.floor(Math.random() * 60)) * 60000);
      const createdBy = pick(assignees);
      const attendees = shuffle([clientEmail, `finanzas@${domain}`, `ip@${domain}`, internalFrom]).slice(0, 3);

      const { data: act, error: aErr } = await svc
        .from("activities")
        .insert({
          organization_id: organizationId,
          owner_type: "tenant",
          type: "meeting",
          contact_id: client.id,
          matter_id: matterIds.length ? pick(matterIds) : null,
          subject: `${isVideo ? "Reunión (videollamada)" : "Reunión presencial"} — ${client.name}`,
          content: "(DEMO) Minuta guardada: acuerdos, próximos pasos, responsables.",
          meeting_start: isoTs(start),
          meeting_end: isoTs(end),
          meeting_location: isVideo ? "Google Meet" : "Oficinas cliente",
          meeting_attendees: attendees,
          created_by: createdBy,
          created_at: isoTs(start),
        })
        .select("id")
        .single();
      if (aErr) throw aErr;
      await registerEntity(svc, runId, "activities", act.id);
    }

    // TASKS (mix pending/completed)
    const taskTemplates = [
      "Preparar borrador de respuesta",
      "Revisar clases Nice con cliente",
      "Enviar factura y confirmar pago",
      "Solicitar aprobación de logo",
      "Actualizar calendario de plazos",
      "Programar llamada de seguimiento",
    ];
    const taskCount = 10;
    for (let i = 0; i < taskCount; i++) {
      const isDone = i < 4; // some completed
      const due = daysAgo(-randomInt(-5, 60)); // mostly future
      const createdAt = daysAgo(10 + Math.floor(Math.random() * 120));
      const createdBy = pick(assignees);

      const { data: act, error: aErr } = await svc
        .from("activities")
        .insert({
          organization_id: organizationId,
          owner_type: "tenant",
          type: "task",
          contact_id: client.id,
          matter_id: matterIds.length ? pick(matterIds) : null,
          subject: `${pick(taskTemplates)} — ${client.name}`,
          content: "(DEMO) Tarea generada automáticamente.",
          due_date: isoTs(due),
          is_completed: isDone,
          completed_at: isDone ? isoTs(daysAgo(1 + Math.floor(Math.random() * 40))) : null,
          created_by: createdBy,
          created_at: isoTs(createdAt),
          metadata: {
            demo: true,
            assigned_to: pick(assignees),
          },
        })
        .select("id")
        .single();
      if (aErr) throw aErr;
      await registerEntity(svc, runId, "activities", act.id);
    }
  }
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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
        { error: "Missing SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY" },
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

    const body = (await req.json().catch(() => ({}))) as Partial<SeedClientCommsRequest>;
    const tenantSlug = body.tenant_slug ?? "all";

    const allTargets: DemoOrgSlug[] = ["demo-starter", "demo-professional", "demo-business", "demo-enterprise"];
    const targets: DemoOrgSlug[] =
      tenantSlug === "all" ? allTargets : ([tenantSlug] as DemoOrgSlug[]);
    const results: Array<{ slug: DemoOrgSlug; run_id: string }> = [];

    for (const slug of targets) {
      const orgId = await getOrgIdBySlug(svc, slug);
      const runId = await createRun(svc, orgId, callerId, "client-comms-v1");
      await seedForOrg({ svc, organizationId: orgId, runId, createdBy: callerId });
      await completeRun(svc, runId);
      results.push({ slug, run_id: runId });
    }

    return json({ ok: true, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
});
