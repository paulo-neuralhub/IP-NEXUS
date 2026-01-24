import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

type DemoOrgSlug = "demo-starter" | "demo-professional" | "demo-business" | "demo-enterprise";

type SeedTenantConfigsRequest = {
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

function invoiceTemplateHtml(variant: string) {
  return `<!doctype html><html><head><meta charset="utf-8"/>
  <style>
    body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto; color:#0f172a;}
    .wrap{max-width:860px;margin:0 auto;padding:32px;}
    .head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;}
    .badge{display:inline-block;padding:6px 10px;border-radius:999px;background:#e2e8f0;font-size:12px;}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
    table{width:100%;border-collapse:collapse;margin-top:16px;}
    th,td{border-bottom:1px solid #e2e8f0;padding:10px 8px;text-align:left;font-size:13px;}
    th{background:#f8fafc;}
    .total{margin-top:16px;display:flex;justify-content:flex-end;font-weight:700;}
    .footer{margin-top:28px;font-size:12px;color:#64748b;}
  </style></head>
  <body><div class="wrap">
    <div class="head">
      <div>
        <div class="badge">(DEMO) Plantilla de factura — ${variant}</div>
        <h1>Factura</h1>
        <div>Nº {{invoice.number}} · Fecha {{invoice.date}}</div>
      </div>
      <div style="text-align:right">
        <strong>{{org.name}}</strong><br/>
        {{org.address}}<br/>
        {{org.tax_id}}
      </div>
    </div>
    <div class="grid">
      <div><strong>Cliente</strong><br/>{{client.name}}<br/>{{client.address}}<br/>{{client.tax_id}}</div>
      <div><strong>Vencimiento</strong><br/>{{invoice.due_date}}<br/><br/><strong>Moneda</strong><br/>{{invoice.currency}}</div>
    </div>
    <table>
      <thead><tr><th>Concepto</th><th>Expediente</th><th>Importe</th></tr></thead>
      <tbody>
        <tr><td>{{item.description}}</td><td>{{item.matter_ref}}</td><td>{{item.amount}}</td></tr>
      </tbody>
    </table>
    <div class="total">Total: {{invoice.total}}</div>
    <div class="footer">(DEMO) Esta factura es de ejemplo. Condiciones: {{invoice.terms}}</div>
  </div></body></html>`;
}

function emailHtml(kind: string) {
  return `<!doctype html><html><body style="font-family:ui-sans-serif,system-ui; background:#f8fafc; padding:24px">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
      <div style="padding:18px 22px;background:#0f172a;color:#fff">
        <strong>(DEMO) ${kind}</strong>
      </div>
      <div style="padding:22px;color:#0f172a">
        <p>Hola {{client.name}},</p>
        <p>Este es un email de ejemplo para <strong>${kind}</strong>.</p>
        <p>Expediente: <strong>{{matter.reference}}</strong> · Jurisdicción: {{matter.jurisdiction}}</p>
        <p style="margin-top:16px">Saludos,<br/>{{org.name}}</p>
      </div>
    </div>
  </body></html>`;
}

function reportConfig(type: string) {
  return {
    demo: true,
    type,
    filters: {
      date_range: "last_30_days",
      include_archived: false,
    },
    sections: ["summary", "highlights", "tables"],
  };
}

function reportStyle(variant: string) {
  return {
    demo: true,
    variant,
    cover: {
      title: "Informe",
      subtitle: "(DEMO) Template",
    },
    typography: {
      heading: "ui-sans-serif",
      body: "ui-sans-serif",
    },
  };
}

async function upsertOrganizationSettings(params: {
  svc: any;
  organizationId: string;
  patch: Record<string, unknown>;
}) {
  const { svc, organizationId, patch } = params;
  const { data: existing, error: exErr } = await svc
    .from("organization_settings")
    .select("id, general, branding, regional, security, email, modules, defaults, integrations")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (exErr) throw exErr;

  if (!existing) {
    const { error } = await svc.from("organization_settings").insert({
      organization_id: organizationId,
      general: patch.general ?? {},
      branding: patch.branding ?? {},
      regional: patch.regional ?? {},
      security: patch.security ?? {},
      email: patch.email ?? {},
      modules: patch.modules ?? {},
      defaults: patch.defaults ?? {},
      integrations: patch.integrations ?? {},
    });
    if (error) throw error;
    return;
  }

  // Shallow merge per column
  function mergeJson(prev: unknown, next: unknown) {
    if (!next) return prev ?? {};
    const p = (prev && typeof prev === "object") ? (prev as Record<string, unknown>) : {};
    const n = (next && typeof next === "object") ? (next as Record<string, unknown>) : {};
    return { ...p, ...n };
  }

  const update = {
    general: mergeJson(existing.general, patch.general),
    branding: mergeJson(existing.branding, patch.branding),
    regional: mergeJson(existing.regional, patch.regional),
    security: mergeJson(existing.security, patch.security),
    email: mergeJson(existing.email, patch.email),
    modules: mergeJson(existing.modules, patch.modules),
    defaults: mergeJson(existing.defaults, patch.defaults),
    integrations: mergeJson(existing.integrations, patch.integrations),
  };

  const { error: upErr } = await svc.from("organization_settings").update(update).eq("organization_id", organizationId);
  if (upErr) throw upErr;
}

async function seedForOrg(params: {
  svc: any;
  organizationId: string;
  runId: string;
  createdBy: string;
  slug: DemoOrgSlug;
}) {
  const { svc, organizationId, runId, createdBy, slug } = params;

  // ------------------------
  // Preferences (regional)
  // ------------------------
  const preferenceBySlug: Record<DemoOrgSlug, { language: string; date_format: string; currency: string; timezone: string }> = {
    "demo-starter": { language: "es-ES", date_format: "dd/MM/yyyy", currency: "EUR", timezone: "Europe/Madrid" },
    "demo-professional": { language: "en-GB", date_format: "dd/MM/yyyy", currency: "EUR", timezone: "Europe/Madrid" },
    "demo-business": { language: "es-ES", date_format: "dd/MM/yyyy", currency: "EUR", timezone: "Europe/Madrid" },
    "demo-enterprise": { language: "en-GB", date_format: "yyyy-MM-dd", currency: "EUR", timezone: "UTC" },
  };
  const prefs = preferenceBySlug[slug];

  // ------------------------
  // Integrations flags
  // ------------------------
  const integrations =
    slug === "demo-business"
      ? {
          euipo: { enabled: true, configured: true, mode: "demo" },
          oepm: { enabled: true, configured: true, mode: "demo" },
          uspto: { enabled: false },
          epo: { enabled: false },
        }
      : slug === "demo-enterprise"
        ? {
            euipo: { enabled: true, configured: true, mode: "demo" },
            oepm: { enabled: true, configured: true, mode: "demo" },
            uspto: { enabled: true, configured: true, mode: "demo" },
            epo: { enabled: true, configured: true, mode: "demo" },
            wipo: { enabled: true, configured: true, mode: "demo" },
          }
        : {};

  // ------------------------
  // Custom fields config
  // ------------------------
  const customFieldsConfig =
    slug === "demo-business"
      ? {
          contacts: {
            fields: [{ key: "sector", label: "Sector", type: "select", options: ["Retail", "Food", "Health", "Tech"], required: false }],
          },
        }
      : slug === "demo-enterprise"
        ? {
            contacts: {
              fields: [
                { key: "region", label: "Región", type: "select", options: ["EMEA", "NA", "LATAM", "APAC"], required: false },
                { key: "corporate_priority", label: "Prioridad corporativa", type: "select", options: ["Alta", "Media", "Baja"], required: false },
              ],
            },
          }
        : {};

  await upsertOrganizationSettings({
    svc,
    organizationId,
    patch: {
      regional: {
        default_language: prefs.language,
        date_format: prefs.date_format,
        currency: prefs.currency,
        timezone: prefs.timezone,
      },
      integrations,
      defaults: {
        custom_fields: customFieldsConfig,
      },
    },
  });

  // Also set some sample values on company contacts for those tenants
  if (slug === "demo-business" || slug === "demo-enterprise") {
    const { data: companies, error } = await svc
      .from("contacts")
      .select("id, custom_fields")
      .eq("organization_id", organizationId)
      .eq("type", "company")
      .limit(25);
    if (error) throw error;

    for (const c of companies ?? []) {
      const prev = (c.custom_fields && typeof c.custom_fields === "object") ? (c.custom_fields as Record<string, unknown>) : {};
      const patch: Record<string, unknown> = { ...prev };

      if (slug === "demo-business") {
        patch.sector = patch.sector ?? pick(["Retail", "Food", "Health", "Tech"] as const);
      }
      if (slug === "demo-enterprise") {
        patch.region = patch.region ?? pick(["EMEA", "NA", "LATAM", "APAC"] as const);
        patch.corporate_priority = patch.corporate_priority ?? pick(["Alta", "Media", "Baja"] as const);
      }

      const { error: upErr } = await svc.from("contacts").update({ custom_fields: patch }).eq("id", c.id);
      if (upErr) throw upErr;
    }
  }

  // ------------------------
  // Templates
  // ------------------------
  // 5 invoice templates per tenant -> report_templates (report_type = invoice_summary)
  const invoiceVariants = ["Minimal", "Classic", "Modern", "Legal", "Compact"] as const;
  for (const variant of invoiceVariants) {
    const code = `invoice_${slug}_${variant.toLowerCase()}`;
    const { data, error } = await svc
      .from("report_templates")
      .insert({
        organization_id: organizationId,
        code,
        name: `Factura — ${variant} (${slug})`,
        description: "(DEMO) Template de factura por tenant.",
        report_type: "invoice_summary",
        config: {
          demo: true,
          template_kind: "invoice",
          html: invoiceTemplateHtml(variant),
        },
        style: { demo: true, variant },
        is_active: true,
        is_system: false,
        created_by: createdBy,
      })
      .select("id")
      .single();
    if (error) throw error;
    await registerEntity(svc, runId, "report_templates", data.id);
  }

  // 3 email templates per tenant
  const emailKinds = ["Actualización de expediente", "Recordatorio de plazo", "Factura disponible"] as const;
  for (const kind of emailKinds) {
    const { data, error } = await svc
      .from("email_templates")
      .insert({
        organization_id: organizationId,
        owner_type: "tenant",
        name: `${kind} (${slug})`,
        description: "(DEMO) Template de email por tenant.",
        category: "docket",
        subject: `(DEMO) ${kind} · {{matter.reference}}`,
        preview_text: "(DEMO) Mensaje de ejemplo.",
        html_content: emailHtml(kind),
        json_content: { demo: true },
        plain_text: `(DEMO) ${kind} para {{matter.reference}}`,
        is_system: false,
        is_active: true,
        thumbnail_url: null,
        available_variables: ["org.name", "client.name", "matter.reference", "matter.jurisdiction"],
        created_by: createdBy,
        slug: `demo-${slug}-${kind.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      })
      .select("id")
      .single();
    if (error) throw error;
    await registerEntity(svc, runId, "email_templates", data.id);
  }

  // 2 report templates per tenant
  const reportTypes = ["conflict_analysis", "valuation_report"] as const;
  for (const rt of reportTypes) {
    const { data, error } = await svc
      .from("report_templates")
      .insert({
        organization_id: organizationId,
        code: `report_${slug}_${rt}`,
        name: `Informe — ${rt.replace(/_/g, " ")} (${slug})`,
        description: "(DEMO) Template de informe por tenant.",
        report_type: rt,
        config: reportConfig(rt),
        style: reportStyle(slug),
        is_active: true,
        is_system: false,
        created_by: createdBy,
      })
      .select("id")
      .single();
    if (error) throw error;
    await registerEntity(svc, runId, "report_templates", data.id);
  }

  // ------------------------
  // Roles (demo-enterprise)
  // ------------------------
  if (slug === "demo-enterprise") {
    const roles = [
      { name: "Socio Senior", code: "partner_senior", lvl: 90 },
      { name: "Socio Junior", code: "partner_junior", lvl: 80 },
      { name: "Asociado", code: "associate", lvl: 70 },
    ] as const;

    for (const r of roles) {
      const { data, error } = await svc
        .from("roles")
        .insert({
          organization_id: organizationId,
          name: r.name,
          code: r.code,
          description: "(DEMO) Rol personalizado enterprise.",
          color: "#64748b",
          is_system: false,
          is_editable: true,
          hierarchy_level: r.lvl,
        })
        .select("id")
        .single();
      if (error) throw error;
      await registerEntity(svc, runId, "roles", data.id);
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

    const body = (await req.json().catch(() => ({}))) as Partial<SeedTenantConfigsRequest>;
    const tenantSlug = body.tenant_slug ?? "all";

    const allTargets: DemoOrgSlug[] = ["demo-starter", "demo-professional", "demo-business", "demo-enterprise"];
    const targets: DemoOrgSlug[] =
      tenantSlug === "all" ? allTargets : ([tenantSlug] as DemoOrgSlug[]);
    const results: Array<{ slug: DemoOrgSlug; run_id: string }> = [];

    for (const slug of targets) {
      const orgId = await getOrgIdBySlug(svc, slug);
      const runId = await createRun(svc, orgId, callerId, "tenant-configs-v1");
      await seedForOrg({ svc, organizationId: orgId, runId, createdBy: callerId, slug });
      await completeRun(svc, runId);
      results.push({ slug, run_id: runId });
    }

    return json({ ok: true, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
});
