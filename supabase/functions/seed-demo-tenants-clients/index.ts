import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

type DemoOrgSlug = "demo-starter" | "demo-professional" | "demo-business" | "demo-enterprise";

type CompanySeed = {
  legal_name: string;
  industry: string;
  size: "startup" | "smb" | "mid" | "enterprise";
  trademarks: number;
  patents: number;
  tags: string[];
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

function pad(n: number, size = 5) {
  return String(n).padStart(size, "0");
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomCif(seed: number) {
  // Not a strict CIF validator; good enough for demo realism.
  return `B${String(10000000 + seed)}`;
}

function normalizeSlug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildBusinessCompanies(): CompanySeed[] {
  return [
    // TECH
    {
      legal_name: "TechStart Innovations S.L.",
      industry: "tech",
      size: "startup",
      trademarks: 12,
      patents: 0,
      tags: ["tech", "startup"],
    },
    {
      legal_name: "CloudSoft Systems S.A.",
      industry: "tech",
      size: "mid",
      trademarks: 0,
      patents: 8,
      tags: ["software", "saas"],
    },
    {
      legal_name: "DataMind Analytics",
      industry: "tech",
      size: "smb",
      trademarks: 5,
      patents: 3,
      tags: ["ai", "analytics"],
    },
    // PHARMA
    {
      legal_name: "FarmaCorp España S.A.",
      industry: "pharma",
      size: "enterprise",
      trademarks: 15,
      patents: 25,
      tags: ["pharma"],
    },
    {
      legal_name: "BioGenesis Labs",
      industry: "pharma",
      size: "mid",
      trademarks: 0,
      patents: 10,
      tags: ["biotech"],
    },
    {
      legal_name: "PharmaSalud S.L.",
      industry: "pharma",
      size: "mid",
      trademarks: 20,
      patents: 0,
      tags: ["generics"],
    },
    // FOOD
    {
      legal_name: "DistriFresh S.L.",
      industry: "food",
      size: "mid",
      trademarks: 8,
      patents: 0,
      tags: ["distribution"],
    },
    {
      legal_name: "Gourmet Foods S.A.",
      industry: "food",
      size: "mid",
      trademarks: 15,
      patents: 0,
      tags: ["premium"],
    },
    {
      legal_name: "Bebidas Naturales S.L.",
      industry: "food",
      size: "smb",
      trademarks: 6,
      patents: 0,
      tags: ["beverages"],
    },
    // RETAIL/FASHION
    {
      legal_name: "ModaStyle S.L.",
      industry: "retail",
      size: "mid",
      trademarks: 25,
      patents: 0,
      tags: ["fashion"],
    },
    {
      legal_name: "Calzados Premium S.A.",
      industry: "retail",
      size: "mid",
      trademarks: 12,
      patents: 0,
      tags: ["footwear"],
    },
    // INDUSTRIAL
    {
      legal_name: "MaquiPro Industria S.A.",
      industry: "industrial",
      size: "mid",
      trademarks: 0,
      patents: 8,
      tags: ["machinery"],
    },
    {
      legal_name: "Construcciones Iberia S.L.",
      industry: "industrial",
      size: "mid",
      trademarks: 4,
      patents: 0,
      tags: ["construction"],
    },
  ];
}

function buildFillerCompanies(total: number, seedPrefix: string): CompanySeed[] {
  const industries = [
    { code: "tech", tags: ["tech"] },
    { code: "pharma", tags: ["pharma"] },
    { code: "food", tags: ["food"] },
    { code: "retail", tags: ["retail"] },
    { code: "industrial", tags: ["industrial"] },
  ];

  const suffixes = ["S.L.", "S.A.", "Group", "Holdings", "Labs", "Industries"];
  const stems = [
    "Iber",
    "Nova",
    "Blue",
    "Cobalt",
    "Sol",
    "Atlas",
    "Vela",
    "Orion",
    "Zen",
    "Aurum",
  ];
  const nouns = [
    "Systems",
    "Foods",
    "Pharma",
    "Retail",
    "Machines",
    "Analytics",
    "Biotech",
    "Logistics",
    "Energy",
    "Textiles",
  ];

  return Array.from({ length: total }).map((_, i) => {
    const ind = pick(industries);
    const size = pick(["startup", "smb", "mid"] as const);
    const tm = randomInt(0, size === "startup" ? 6 : 15);
    const pt = tm === 0 ? randomInt(0, 10) : randomInt(0, 5);

    return {
      legal_name: `${pick(stems)}${pick(nouns)} ${seedPrefix} ${i + 1} ${pick(suffixes)}`,
      industry: ind.code,
      size,
      trademarks: tm,
      patents: pt,
      tags: [...ind.tags, size],
    };
  });
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

function buildInvoiceNumber(series: string, n: number) {
  return `${series}-${pad(n)}`;
}

function estimateInvoiceAmountEUR(company: CompanySeed) {
  // Roughly scale fees based on portfolio size.
  const base = 250;
  const perTm = 75;
  const perPt = 220;
  const sizeMult = company.size === "enterprise" ? 2.2 : company.size === "mid" ? 1.4 : company.size === "smb" ? 1.1 : 0.9;
  const raw = (base + company.trademarks * perTm + company.patents * perPt) * sizeMult;
  return Math.max(350, Math.round(raw));
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
    .select("*")
    .single();
  if (error) throw error;
  return data as { id: string };
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

async function seedCompaniesForOrg(params: {
  svc: any;
  organizationId: string;
  runId: string;
  createdBy: string;
  ownerType: "tenant";
  companies: CompanySeed[];
  invoiceSeries: string;
}) {
  const { svc, organizationId, runId, createdBy, companies, invoiceSeries } = params;

  let invoiceCounter = 1;
  const now = new Date();

  for (let i = 0; i < companies.length; i++) {
    const c = companies[i];
    const companySlug = normalizeSlug(c.legal_name);

    // Company contact
    const { data: companyContact, error: cErr } = await svc
      .from("contacts")
      .insert({
        organization_id: organizationId,
        owner_type: "tenant",
        type: "company",
        name: c.legal_name,
        company_name: c.legal_name,
        email: `info@${companySlug}.demo.ipnexus.com`,
        phone: "+34 910 123 000",
        source: "demo-seed",
        tags: ["demo", ...c.tags],
        lifecycle_stage: "customer",
        created_by: createdBy,
      })
      .select("id")
      .single();
    if (cErr) throw cErr;
    await registerEntity(svc, runId, "contacts", companyContact.id);

    // Primary + secondary person contacts (linked via company_name)
    const primaryName = pick([
      "Laura",
      "Javier",
      "Sofía",
      "Miguel",
      "Lucía",
      "Andrés",
      "Paula",
      "Diego",
    ]);
    const secondaryName = pick(["Marina", "Carlos", "Elena", "Hugo", "Nuria", "Álvaro", "Celia", "Iván"]);

    const primaryEmail = `${normalizeSlug(primaryName)}.${companySlug}@demo.ipnexus.com`;
    const secondaryEmail = `${normalizeSlug(secondaryName)}.${companySlug}@demo.ipnexus.com`;

    const { data: p1, error: p1Err } = await svc
      .from("contacts")
      .insert({
        organization_id: organizationId,
        owner_type: "tenant",
        type: "person",
        name: `${primaryName} ${pick(["Gómez", "Sánchez", "Martínez", "López", "Ruiz"])}`,
        email: primaryEmail,
        phone: "+34 910 123 111",
        company_name: c.legal_name,
        job_title: pick(["Legal Counsel", "IP Manager", "CFO", "Founder", "Operations"]),
        source: "demo-seed",
        tags: ["demo", ...c.tags, "primary"],
        lifecycle_stage: "customer",
        created_by: createdBy,
      })
      .select("id")
      .single();
    if (p1Err) throw p1Err;
    await registerEntity(svc, runId, "contacts", p1.id);

    const { data: p2, error: p2Err } = await svc
      .from("contacts")
      .insert({
        organization_id: organizationId,
        owner_type: "tenant",
        type: "person",
        name: `${secondaryName} ${pick(["Pérez", "Fernández", "Díaz", "Moreno", "Navarro"])}`,
        email: secondaryEmail,
        phone: "+34 910 123 222",
        company_name: c.legal_name,
        job_title: pick(["Assistant", "Finance", "Office Manager", "Paralegal"]),
        source: "demo-seed",
        tags: ["demo", ...c.tags, "secondary"],
        lifecycle_stage: "customer",
        created_by: createdBy,
      })
      .select("id")
      .single();
    if (p2Err) throw p2Err;
    await registerEntity(svc, runId, "contacts", p2.id);

    // Billing client
    const { data: bc, error: bcErr } = await svc
      .from("billing_clients")
      .insert({
        organization_id: organizationId,
        contact_id: companyContact.id,
        legal_name: c.legal_name,
        tax_id: randomCif(2000 + i),
        tax_id_type: "CIF",
        billing_address: pick(["C/ Gran Vía 1", "Av. Diagonal 100", "C/ Serrano 45", "C/ Colón 12"]),
        billing_city: pick(["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao"]),
        billing_state: pick(["Madrid", "Cataluña", "Comunidad Valenciana", "Andalucía", "País Vasco"]),
        billing_postal_code: pick(["28001", "08001", "46001", "41001", "48001"]),
        billing_country: "ES",
        billing_email: `billing@${companySlug}.demo.ipnexus.com`,
        billing_phone: "+34 910 123 333",
        default_currency: "EUR",
        payment_terms: 30,
        tax_exempt: false,
        notes: `Cliente DEMO (${c.industry}) — cartera aproximada: ${c.trademarks} marcas, ${c.patents} patentes.`,
        is_active: true,
      })
      .select("id")
      .single();
    if (bcErr) throw bcErr;
    await registerEntity(svc, runId, "billing_clients", bc.id);

    // Notes (activities)
    const { data: noteAct, error: noteErr } = await svc
      .from("activities")
      .insert({
        organization_id: organizationId,
        owner_type: "tenant",
        type: "note",
        contact_id: companyContact.id,
        subject: "Nota interna (DEMO)",
        content: `Cliente DEMO realista. Tags: ${c.tags.join(", ")}.`,
        created_by: createdBy,
        created_at: new Date(now.getTime() - randomInt(10, 400) * 86400000).toISOString(),
      })
      .select("id")
      .single();
    if (noteErr) throw noteErr;
    await registerEntity(svc, runId, "activities", noteAct.id);

    // Matters (PI)
    const trademarkNames = [
      c.legal_name.split(" ")[0].toUpperCase(),
      `${c.legal_name.split(" ")[0].toUpperCase()} PRO`,
      `${c.legal_name.split(" ")[0].toUpperCase()} LABS`,
    ];
    const jurisdictions = ["ES", "EU", "WO"];
    let localMatterCounter = 1;

    for (let t = 0; t < c.trademarks; t++) {
      const ref = `${invoiceSeries}-TM-${pad(i + 1, 3)}-${pad(t + 1, 3)}`;
      const filingYear = 2016 + (t % 9);
      const filingDate = `${filingYear}-0${((t % 9) + 1).toString().slice(-1)}-15`;
      const expiryDate = `${filingYear + 10}-0${((t % 9) + 1).toString().slice(-1)}-15`;
      const nextRenewalDate = `${filingYear + 9}-10-15`;

      const { data: m, error: mErr } = await svc
        .from("matters")
        .insert({
          organization_id: organizationId,
          reference: ref,
          title: `Trademark — ${pick(trademarkNames)}`,
          type: "trademark",
          status: "active",
          jurisdiction: pick(jurisdictions),
          jurisdiction_code: pick(jurisdictions),
          filing_date: filingDate,
          expiry_date: expiryDate,
          next_renewal_date: nextRenewalDate,
          mark_name: pick(trademarkNames),
          mark_type: pick(["word", "figurative", "mixed"]),
          nice_classes: pick([
            [9, 35],
            [5, 10],
            [25],
            [29, 30],
            [3],
          ]),
          goods_services: "(DEMO) Bienes y servicios generados automáticamente.",
          owner_name: c.legal_name,
          tags: ["demo", "trademark", c.industry],
          notes: "Expediente DEMO realista.",
          created_by: createdBy,
        })
        .select("id")
        .single();
      if (mErr) throw mErr;
      await registerEntity(svc, runId, "matters", m.id);
      localMatterCounter++;
    }

    for (let p = 0; p < c.patents; p++) {
      const ref = `${invoiceSeries}-PT-${pad(i + 1, 3)}-${pad(p + 1, 3)}`;
      const filingYear = 2014 + (p % 10);
      const filingDate = `${filingYear}-0${((p % 9) + 1).toString().slice(-1)}-10`;
      const { data: m, error: mErr } = await svc
        .from("matters")
        .insert({
          organization_id: organizationId,
          reference: ref,
          title: `Patent — ${c.legal_name} (${p + 1})`,
          type: "patent",
          status: "active",
          jurisdiction: pick(jurisdictions),
          jurisdiction_code: pick(jurisdictions),
          filing_date: filingDate,
          application_number: `EP${randomInt(1000000, 9999999)}`,
          owner_name: c.legal_name,
          tags: ["demo", "patent", c.industry],
          notes: "Expediente DEMO realista.",
          created_by: createdBy,
        })
        .select("id")
        .single();
      if (mErr) throw mErr;
      await registerEntity(svc, runId, "matters", m.id);
      localMatterCounter++;
    }

    // Invoices + payments (6–12 months)
    const months = randomInt(6, 12);
    for (let m = 0; m < months; m++) {
      const invDate = new Date(now.getFullYear(), now.getMonth() - m, randomInt(1, 25));
      const dueDate = new Date(invDate.getTime() + 30 * 86400000);
      const subtotal = estimateInvoiceAmountEUR(c) + randomInt(-200, 400);
      const taxRate = 21;
      const taxAmount = Math.round((subtotal * taxRate) / 100);
      const total = subtotal + taxAmount;

      const status = pick(["paid", "paid", "sent", "overdue"] as const);
      const paidAmount = status === "paid" ? total : status === "sent" ? 0 : status === "overdue" ? 0 : 0;
      const paidDate = status === "paid" ? new Date(invDate.getTime() + randomInt(3, 20) * 86400000) : null;

      const { data: inv, error: invErr } = await svc
        .from("invoices")
        .insert({
          organization_id: organizationId,
          invoice_series: invoiceSeries,
          invoice_number: buildInvoiceNumber(invoiceSeries, invoiceCounter),
          billing_client_id: bc.id,
          client_name: c.legal_name,
          client_tax_id: randomCif(2000 + i),
          client_address: "(DEMO) Dirección fiscal", // snapshot
          invoice_date: invDate.toISOString().slice(0, 10),
          due_date: dueDate.toISOString().slice(0, 10),
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total,
          currency: "EUR",
          status,
          paid_amount: status === "paid" ? total : null,
          paid_date: paidDate ? paidDate.toISOString().slice(0, 10) : null,
          payment_method: status === "paid" ? pick(["bank_transfer", "card"]) : null,
          payment_reference: status === "paid" ? `DEMO-${invoiceSeries}-${invoiceCounter}` : null,
          notes: "(DEMO) Factura generada automáticamente.",
          internal_notes: `Portfolio: ${c.trademarks} TM / ${c.patents} PT`,
          created_by: createdBy,
          sent_at: status === "sent" || status === "paid" ? invDate.toISOString() : null,
        })
        .select("id")
        .single();
      if (invErr) throw invErr;
      await registerEntity(svc, runId, "invoices", inv.id);

      // Create a matching payment row when paid
      if (status === "paid") {
        const { data: pay, error: payErr } = await svc
          .from("payments")
          .insert({
            organization_id: organizationId,
            amount: total,
            currency: "EUR",
            status: "succeeded",
            description: `Pago DEMO factura ${invoiceSeries}-${pad(invoiceCounter)}`,
            internal_invoice_id: inv.id,
            paid_at: paidDate?.toISOString() ?? new Date().toISOString(),
            metadata: { demo: true, method: "manual" },
          })
          .select("id")
          .single();
        if (payErr) throw payErr;
        await registerEntity(svc, runId, "payments", pay.id);
      }

      invoiceCounter++;
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

    const targets: Array<{ slug: DemoOrgSlug; companyCount: number; invoiceSeries: string }> = [
      { slug: "demo-starter", companyCount: 12, invoiceSeries: "DST" },
      { slug: "demo-professional", companyCount: 25, invoiceSeries: "DPR" },
      { slug: "demo-business", companyCount: 50, invoiceSeries: "DBZ" },
      { slug: "demo-enterprise", companyCount: 80, invoiceSeries: "DEN" },
    ];

    const results: Array<{ slug: DemoOrgSlug; run_id: string; companies: number }> = [];

    for (const t of targets) {
      const orgId = await getOrgIdBySlug(svc, t.slug);
      const run = await createRun(svc, orgId, callerId, "clients-v1");
      const runId = run.id;

      const baseCompanies = t.slug === "demo-business" ? buildBusinessCompanies() : [];
      const fillerNeeded = Math.max(0, t.companyCount - baseCompanies.length);
      const filler = buildFillerCompanies(fillerNeeded, t.invoiceSeries);
      const companies = [...baseCompanies, ...filler].slice(0, t.companyCount);

      await seedCompaniesForOrg({
        svc,
        organizationId: orgId,
        runId,
        createdBy: callerId,
        ownerType: "tenant",
        companies,
        invoiceSeries: t.invoiceSeries,
      });

      await completeRun(svc, runId);
      results.push({ slug: t.slug, run_id: runId, companies: companies.length });
    }

    return json({ ok: true, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
});
