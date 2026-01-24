import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

type DemoOrgSlug = "demo-starter" | "demo-professional" | "demo-business" | "demo-enterprise";

type SeedFinanceRequest = {
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

function pad(n: number, size = 3) {
  return String(n).padStart(size, "0");
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
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

function invoicePdfUrl(slug: string, invoiceNumber: string) {
  return `https://pdf.demo.ipnexus.com/${slug}/${encodeURIComponent(invoiceNumber)}.pdf`;
}

function quotePdfUrl(slug: string, quoteNumber: string) {
  return `https://pdf.demo.ipnexus.com/${slug}/${encodeURIComponent(quoteNumber)}.pdf`;
}

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

function buildInvoiceStatusList(): InvoiceStatus[] {
  // Map user “pending” -> DB status “sent” (pending is not allowed by invoices_status_check)
  return [
    ...Array.from({ length: 70 }).map(() => "paid" as const),
    ...Array.from({ length: 15 }).map(() => "sent" as const),
    ...Array.from({ length: 10 }).map(() => "overdue" as const),
    ...Array.from({ length: 5 }).map(() => "draft" as const),
  ];
}

type QuoteStatus = "accepted" | "sent" | "rejected";

function buildQuoteStatusList(): QuoteStatus[] {
  // Map quote “pending” -> DB status “sent”
  return [
    ...Array.from({ length: 20 }).map(() => "accepted" as const),
    ...Array.from({ length: 5 }).map(() => "sent" as const),
    ...Array.from({ length: 5 }).map(() => "rejected" as const),
  ];
}

const conceptPool = [
  "Honorarios profesionales",
  "Tasas oficiales",
  "Renovaciones",
  "Vigilancias",
  "Búsquedas",
  "Traducciones",
] as const;

function conceptToCostType(concept: (typeof conceptPool)[number]) {
  if (concept === "Tasas oficiales") return "official_fee";
  if (concept === "Traducciones") return "translation";
  if (concept === "Honorarios profesionales") return "service_fee";
  if (concept === "Renovaciones" || concept === "Vigilancias" || concept === "Búsquedas") return "third_party";
  return "other";
}

function randomMoney(min: number, max: number) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

async function seedFinanceForOrg(params: {
  svc: any;
  organizationId: string;
  runId: string;
  createdBy: string;
  orgSlug: DemoOrgSlug;
}) {
  const { svc, organizationId, runId, createdBy, orgSlug } = params;

  const { data: billingClients, error: bcErr } = await svc
    .from("billing_clients")
    .select("id, legal_name, tax_id, billing_address")
    .eq("organization_id", organizationId)
    .limit(500);
  if (bcErr) throw bcErr;
  const bcs = (billingClients ?? []) as Array<{ id: string; legal_name: string; tax_id: string | null; billing_address: string | null }>;
  if (!bcs.length) throw new Error("No billing_clients found (seed clients first)");

  const { data: matters, error: mErr } = await svc
    .from("matters")
    .select("id, reference")
    .eq("organization_id", organizationId)
    .limit(1000);
  if (mErr) throw mErr;
  const matterIds = (matters ?? []).map((r: any) => String(r.id)).filter(Boolean);
  if (!matterIds.length) throw new Error("No matters found (seed matters first)");

  // Invoices (100)
  const statuses = buildInvoiceStatusList();
  const invoiceIds: string[] = [];

  for (let i = 0; i < statuses.length; i++) {
    const s = statuses[i];
    const n = i + 1;
    const invoiceNumber = `F-2025-${pad(n, 3)}`;
    const bc = pick(bcs);

    const invDate = daysAgo(15 + Math.floor(Math.random() * 360));
    const dueDate = s === "overdue" ? daysAgo(1 + Math.floor(Math.random() * 60)) : daysFromNow(10 + Math.floor(Math.random() * 45));
    const taxRate = 21;

    // Lines (1-4)
    const lineCount = 1 + Math.floor(Math.random() * 4);
    let subtotal = 0;
    const lines: Array<{ desc: string; qty: number; unit: number; matterId: string; concept: (typeof conceptPool)[number] }> = [];
    for (let l = 0; l < lineCount; l++) {
      const concept = pick<(typeof conceptPool)[number]>(conceptPool);
      const qty = 1;
      const unit = randomMoney(120, concept === "Tasas oficiales" ? 900 : 1800);
      subtotal += qty * unit;
      lines.push({ desc: concept, qty, unit, matterId: pick(matterIds), concept });
    }
    subtotal = Math.round(subtotal * 100) / 100;
    const taxAmount = Math.round(((subtotal * taxRate) / 100) * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    const paidDate = s === "paid" ? daysAgo(1 + Math.floor(Math.random() * 120)) : null;

    const { data: inv, error: invErr } = await svc
      .from("invoices")
      .insert({
        organization_id: organizationId,
        invoice_series: "F-2025",
        invoice_number: invoiceNumber,
        billing_client_id: bc.id,
        client_name: bc.legal_name,
        client_tax_id: bc.tax_id,
        client_address: bc.billing_address,
        invoice_date: isoDate(invDate),
        due_date: isoDate(dueDate),
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        currency: "EUR",
        status: s,
        paid_amount: s === "paid" ? total : null,
        paid_date: paidDate ? isoDate(paidDate) : null,
        payment_method: s === "paid" ? pick(["bank_transfer", "card"]) : null,
        payment_reference: s === "paid" ? `PAY-${invoiceNumber}` : null,
        notes: "(DEMO) Factura generada automáticamente.",
        footer_text: "(DEMO) Gracias por confiar en IP‑NEXUS.",
        pdf_url: invoicePdfUrl(orgSlug, invoiceNumber),
        created_by: createdBy,
        sent_at: s === "sent" || s === "paid" ? invDate.toISOString() : null,
      })
      .select("id")
      .single();
    if (invErr) throw invErr;
    invoiceIds.push(inv.id);
    await registerEntity(svc, runId, "invoices", inv.id);

    // Items
    for (let l = 0; l < lines.length; l++) {
      const line = lines[l];
      const lineSubtotal = Math.round(line.qty * line.unit * 100) / 100;
      const lineTax = Math.round(((lineSubtotal * taxRate) / 100) * 100) / 100;
      const { data: item, error: itemErr } = await svc
        .from("invoice_items")
        .insert({
          invoice_id: inv.id,
          line_number: l + 1,
          matter_id: line.matterId,
          description: `${line.desc} — ${line.matterId.slice(0, 8)}`,
          quantity: line.qty,
          unit_price: line.unit,
          subtotal: lineSubtotal,
          tax_rate: taxRate,
          tax_amount: lineTax,
          notes: "(DEMO)",
        })
        .select("id")
        .single();
      if (itemErr) throw itemErr;
      await registerEntity(svc, runId, "invoice_items", item.id);
    }

    // Payment row when paid
    if (s === "paid") {
      const { data: pay, error: payErr } = await svc
        .from("payments")
        .insert({
          organization_id: organizationId,
          amount: total,
          currency: "EUR",
          status: "succeeded",
          description: `Pago DEMO ${invoiceNumber}`,
          internal_invoice_id: inv.id,
          paid_at: paidDate?.toISOString() ?? new Date().toISOString(),
          metadata: { demo: true, method: "manual" },
        })
        .select("id")
        .single();
      if (payErr) throw payErr;
      await registerEntity(svc, runId, "payments", pay.id);
    }
  }

  // Quotes (30)
  const qStatuses = buildQuoteStatusList();
  for (let i = 0; i < qStatuses.length; i++) {
    const s = qStatuses[i];
    const n = i + 1;
    const quoteNumber = `P-2025-${pad(n, 3)}`;
    const bc = pick(bcs);

    const quoteDate = daysAgo(5 + Math.floor(Math.random() * 180));
    const validUntil = daysFromNow(10 + Math.floor(Math.random() * 60));
    const taxRate = 21;

    const lineCount = 1 + Math.floor(Math.random() * 4);
    let subtotal = 0;
    const qLines: Array<{ desc: string; qty: number; unit: number }> = [];
    for (let l = 0; l < lineCount; l++) {
      const concept = pick<(typeof conceptPool)[number]>(conceptPool);
      const qty = 1;
      const unit = randomMoney(150, 2500);
      subtotal += qty * unit;
      qLines.push({ desc: concept, qty, unit });
    }
    subtotal = Math.round(subtotal * 100) / 100;
    const taxAmount = Math.round(((subtotal * taxRate) / 100) * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    const { data: q, error: qErr } = await svc
      .from("quotes")
      .insert({
        organization_id: organizationId,
        quote_number: quoteNumber,
        billing_client_id: bc.id,
        contact_id: null,
        deal_id: null,
        client_name: bc.legal_name,
        client_email: bc.legal_name ? `billing@${bc.legal_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.demo` : null,
        quote_date: isoDate(quoteDate),
        valid_until: isoDate(validUntil),
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        currency: "EUR",
        status: s,
        introduction: "(DEMO) Presupuesto para servicios de PI.",
        terms: "(DEMO) Condiciones: 50% a la aceptación, 50% a la presentación.",
        notes: "(DEMO)",
        pdf_url: quotePdfUrl(orgSlug, quoteNumber),
        created_by: createdBy,
        sent_at: s === "sent" || s === "accepted" ? quoteDate.toISOString() : null,
        accepted_at: s === "accepted" ? new Date(quoteDate.getTime() + 3 * 86400000).toISOString() : null,
      })
      .select("id")
      .single();
    if (qErr) throw qErr;
    await registerEntity(svc, runId, "quotes", q.id);

    for (let l = 0; l < qLines.length; l++) {
      const line = qLines[l];
      const lineSubtotal = Math.round(line.qty * line.unit * 100) / 100;
      const { data: qi, error: qiErr } = await svc
        .from("quote_items")
        .insert({
          quote_id: q.id,
          line_number: l + 1,
          description: line.desc,
          quantity: line.qty,
          unit_price: line.unit,
          subtotal: lineSubtotal,
          notes: "(DEMO)",
        })
        .select("id")
        .single();
      if (qiErr) throw qiErr;
      await registerEntity(svc, runId, "quote_items", qi.id);
    }
  }

  // “Gastos” (50) → matter_costs
  const costConcepts = [
    { label: "Tasa oficial pagada", cost_type: "official_fee" },
    { label: "Proveedor externo", cost_type: "third_party" },
    { label: "Traducción", cost_type: "translation" },
  ] as const;

  for (let i = 0; i < 50; i++) {
    const mId = pick(matterIds);
    const c = pick<(typeof costConcepts)[number]>(costConcepts);
    const amount = randomMoney(60, c.cost_type === "official_fee" ? 1200 : 900);
    const costDate = daysAgo(10 + Math.floor(Math.random() * 360));
    const status = Math.random() < 0.8 ? "paid" : "pending";

    const linkInvoice = status === "paid" && Math.random() < 0.5;
    const invoiceId = linkInvoice ? pick(invoiceIds) : null;

    const { data: mc, error: mcErr } = await svc
      .from("matter_costs")
      .insert({
        organization_id: organizationId,
        matter_id: mId,
        cost_type: c.cost_type,
        description: `${c.label} (DEMO)`,
        notes: "(DEMO) Registro de gasto/coste.",
        amount,
        currency: "EUR",
        quantity: 1,
        total_amount: amount,
        status: linkInvoice ? "invoiced" : status,
        cost_date: isoDate(costDate),
        due_date: isoDate(daysFromNow(15 + Math.floor(Math.random() * 45))),
        paid_date: status === "paid" ? isoDate(daysAgo(Math.floor(Math.random() * 60))) : null,
        is_billable: true,
        invoice_id: invoiceId,
        created_by: createdBy,
      })
      .select("id")
      .single();
    if (mcErr) throw mcErr;
    await registerEntity(svc, runId, "matter_costs", mc.id);
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

    const body = (await req.json().catch(() => ({}))) as Partial<SeedFinanceRequest>;
    const tenantSlug = body.tenant_slug ?? "all";

    const allTargets: DemoOrgSlug[] = ["demo-starter", "demo-professional", "demo-business", "demo-enterprise"];
    const targets: DemoOrgSlug[] =
      tenantSlug === "all" ? allTargets : ([tenantSlug] as DemoOrgSlug[]);
    const results: Array<{ slug: DemoOrgSlug; run_id: string }> = [];

    for (const slug of targets) {
      const orgId = await getOrgIdBySlug(svc, slug);
      const runId = await createRun(svc, orgId, callerId, "finance-full-v1");
      await seedFinanceForOrg({ svc, organizationId: orgId, runId, createdBy: callerId, orgSlug: slug });
      await completeRun(svc, runId);
      results.push({ slug, run_id: runId });
    }

    return json({ ok: true, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
});
