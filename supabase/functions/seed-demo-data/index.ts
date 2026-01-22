import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SeedRequest = {
  organization_id: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function formatError(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;

  // Supabase/PostgREST errors are often plain objects
  try {
    const anyErr = e as Record<string, unknown>;
    const msg = typeof anyErr.message === "string" ? anyErr.message : null;
    const details = typeof anyErr.details === "string" ? anyErr.details : null;
    const hint = typeof anyErr.hint === "string" ? anyErr.hint : null;
    const code = typeof anyErr.code === "string" ? anyErr.code : null;

    const parts = [msg, details, hint, code ? `code=${code}` : null].filter(
      (p): p is string => !!p && p.trim().length > 0,
    );
    if (parts.length) return parts.join(" | ");

    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const SUPABASE_URL = getEnv("SUPABASE_URL");
    const SUPABASE_ANON_KEY = getEnv("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

    const authHeader = req.headers.get("authorization") || "";

    // 1) Validate caller session
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const body = (await req.json().catch(() => ({}))) as Partial<SeedRequest>;
    const organizationId = body.organization_id;
    if (!organizationId) return json({ error: "organization_id is required" }, 400);

    // 2) Use service role for seeding and for checking superadmin
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: sa, error: saErr } = await adminClient
      .from("superadmins")
      .select("id")
      .eq("user_id", userData.user.id)
      .eq("is_active", true)
      .maybeSingle();
    if (saErr) throw saErr;
    if (!sa) return json({ error: "Forbidden" }, 403);

    // 3) Create run
    const { data: run, error: runErr } = await adminClient
      .from("demo_seed_runs")
      .insert({
        organization_id: organizationId,
        created_by: userData.user.id,
        status: "running",
        seed_version: "v1",
      })
      .select("*")
      .single();
    if (runErr) throw runErr;

    const runId = run.id as string;

    const register = async (tableName: string, rowId: string) => {
      const { error } = await adminClient.from("demo_seed_entities").insert({
        run_id: runId,
        table_name: tableName,
        row_id: rowId,
      });
      if (error) throw error;
    };

    // 4) Seed realistic-ish data (minimal required columns)
    const firmContacts = [
      { name: "Nexus Demo Law Firm", company: true },
      { name: "Acme Foods S.L.", company: true },
      { name: "BluePeak Robotics", company: true },
      { name: "Iberia HealthTech", company: true },
      { name: "Solaria Renewables", company: true },
      { name: "Vela Cosmetics", company: true },
      { name: "Atlas Logistics", company: true },
      { name: "Cobalt Games Studio", company: true },
    ];

    // Contacts (8)
    const contactIds: string[] = [];
    for (let i = 0; i < 8; i++) {
      const c = firmContacts[i];
      const emailSlug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const { data, error } = await adminClient
        .from("contacts")
        .insert({
          organization_id: organizationId,
          owner_type: "tenant",
          type: c.company ? "company" : "person",
          name: c.name,
          email: `${emailSlug}@demo.ip-nexus.local`,
          phone: "+34 910 000 000",
          company_name: c.company ? c.name : null,
          source: "demo-seed",
          tags: ["demo"],
          lifecycle_stage: "customer",
        })
        .select("id")
        .single();
      if (error) throw error;
      contactIds.push(data.id);
      await register("contacts", data.id);
    }

    // Billing clients (match invoices.billing_client_id NOT NULL)
    const billingClientIds: string[] = [];
    for (let i = 0; i < contactIds.length; i++) {
      const legalName = firmContacts[i].name;
      const { data, error } = await adminClient
        .from("billing_clients")
        .insert({
          organization_id: organizationId,
          contact_id: contactIds[i],
          legal_name: legalName,
          tax_id: `B${String(10000000 + i)}`,
          billing_address: "C/ Demo 123",
          billing_city: "Madrid",
          billing_postal_code: "28001",
          billing_country: "ES",
          billing_email: `${legalName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}@billing.demo`,
          payment_terms: 30,
        })
        .select("id")
        .single();
      if (error) throw error;
      billingClientIds.push(data.id);
      await register("billing_clients", data.id);
    }

    // Matters (3 per contact = 24)
    const matterTypes = ["trademark", "patent", "design"];
    const jurisdictions = ["ES", "EU", "WO"];
    const matterIds: string[] = [];
    let matterCounter = 1;
    for (let cIdx = 0; cIdx < contactIds.length; cIdx++) {
      for (let m = 0; m < 3; m++) {
        const type = pick(matterTypes);
        const reference = `DEMO-${String(matterCounter).padStart(4, "0")}`;
        matterCounter += 1;

        const markName = type === "trademark" ? pick(["NEXAL", "SOLARIA", "BLUEPEAK", "VELA", "COBALT"]) : null;

        const { data, error } = await adminClient
          .from("matters")
          .insert({
            organization_id: organizationId,
            reference,
            title: `${type.toUpperCase()} — ${markName ?? reference}`,
            type,
            status: "active",
            jurisdiction: pick(jurisdictions),
            mark_name: markName,
            owner_name: firmContacts[cIdx].name,
            tags: ["demo"],
            notes: "Expediente de demostración generado automáticamente.",
          })
          .select("id")
          .single();
        if (error) throw error;
        matterIds.push(data.id);
        await register("matters", data.id);
      }
    }

    // Matter deadlines (40)
    const deadlineTypes = ["renewal", "office_action", "opposition", "payment", "filing"];
    for (let i = 0; i < 40; i++) {
      const matterId = pick(matterIds);
      const daysForward = 7 + Math.floor(Math.random() * 365);
      const deadlineDate = new Date(Date.now() + daysForward * 24 * 60 * 60 * 1000);
      const triggerDate = new Date(deadlineDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { data, error } = await adminClient
        .from("matter_deadlines")
        .insert({
          organization_id: organizationId,
          matter_id: matterId,
          deadline_type: pick(deadlineTypes),
          title: `Plazo demo #${i + 1}`,
          description: "Plazo de demostración para simular gestión de vencimientos.",
          trigger_date: triggerDate.toISOString().slice(0, 10),
          deadline_date: deadlineDate.toISOString().slice(0, 10),
          status: "pending",
          priority: pick(["normal", "high"]),
        })
        .select("id")
        .single();
      if (error) throw error;
      await register("matter_deadlines", data.id);
    }

    // Deals (15) using existing pipeline+stage
    const { data: pipelineRow, error: pipeErr } = await adminClient
      .from("pipelines")
      .select("id")
      .eq("owner_type", "tenant")
      .order("is_default", { ascending: false })
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (pipeErr) throw pipeErr;
    if (!pipelineRow) throw new Error("No tenant pipelines found");
    const pipelineId = pipelineRow.id as string;

    const { data: stageRow, error: stageErr } = await adminClient
      .from("pipeline_stages")
      .select("id")
      .eq("pipeline_id", pipelineId)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (stageErr) throw stageErr;
    if (!stageRow) throw new Error("No pipeline stages found");
    const stageId = stageRow.id as string;

    const dealIds: string[] = [];
    for (let i = 0; i < 15; i++) {
      const contactId = pick(contactIds);
      const { data, error } = await adminClient
        .from("deals")
        .insert({
          organization_id: organizationId,
          owner_type: "tenant",
          pipeline_id: pipelineId,
          stage_id: stageId,
          title: `Oportunidad demo #${i + 1}`,
          value: 500 + Math.floor(Math.random() * 5000),
          currency: "EUR",
          contact_id: contactId,
          status: "open",
          tags: ["demo"],
        })
        .select("id")
        .single();
      if (error) throw error;
      dealIds.push(data.id);
      await register("deals", data.id);
    }

    // Invoices (50) + items
    for (let i = 0; i < 50; i++) {
      const billingClientId = pick(billingClientIds);
      const clientIdx = billingClientIds.indexOf(billingClientId);
      const clientName = firmContacts[Math.max(0, clientIdx)].name;

      const invoiceNumber = `DEMO-${String(i + 1).padStart(5, "0")}`;
      const invoiceDate = daysAgo(30 + Math.floor(Math.random() * 540));
      const due = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Create invoice (totals updated after items)
      const { data: inv, error: invErr } = await adminClient
        .from("invoices")
        .insert({
          organization_id: organizationId,
          invoice_number: invoiceNumber,
          billing_client_id: billingClientId,
          client_name: clientName,
          invoice_date: invoiceDate.toISOString().slice(0, 10),
          due_date: due.toISOString().slice(0, 10),
          subtotal: 0,
          tax_amount: 0,
          total: 0,
          currency: "EUR",
          status: pick(["draft", "sent", "paid"]),
        })
        .select("id")
        .single();
      if (invErr) throw invErr;
      await register("invoices", inv.id);

      const lineCount = 1 + Math.floor(Math.random() * 3);
      let subtotal = 0;
      const taxRate = 21;

      for (let l = 0; l < lineCount; l++) {
        const qty = 1;
        const unit = 120 + Math.floor(Math.random() * 1200);
        const lineSubtotal = qty * unit;
        subtotal += lineSubtotal;

        const { data: item, error: itemErr } = await adminClient
          .from("invoice_items")
          .insert({
            invoice_id: inv.id,
            line_number: l + 1,
            description: pick([
              "Búsqueda de anterioridades",
              "Redacción de solicitud",
              "Respuesta a suspenso",
              "Gestión de renovación",
              "Informe de vigilancia",
            ]),
            quantity: qty,
            unit_price: unit,
            subtotal: lineSubtotal,
            tax_rate: taxRate,
            tax_amount: (lineSubtotal * taxRate) / 100,
          })
          .select("id")
          .single();
        if (itemErr) throw itemErr;
        await register("invoice_items", item.id);
      }

      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      const { error: updErr } = await adminClient
        .from("invoices")
        .update({ subtotal, tax_rate: taxRate, tax_amount: taxAmount, total })
        .eq("id", inv.id);
      if (updErr) throw updErr;
    }

    // Communications (100)
    for (let i = 0; i < 100; i++) {
      const contactId = pick(contactIds);
      const matterId = pick(matterIds);

      const direction = pick(["inbound", "outbound"] as const);
      const channel = pick(["email", "whatsapp"] as const);
      const subject = `Comunicación demo #${i + 1}`;

      const { data, error } = await adminClient
        .from("communications")
        .insert({
          organization_id: organizationId,
          contact_id: contactId,
          matter_id: matterId,
          channel,
          direction,
          subject,
          body: "Mensaje de demostración para simular el timeline de comunicaciones.",
          body_preview: "Mensaje de demostración…",
          received_at: daysAgo(Math.floor(Math.random() * 540)).toISOString(),
        })
        .select("id")
        .single();
      if (error) throw error;
      await register("communications", data.id);
    }

    // Activities (timeline) (60)
    const activityTypes = ["note", "call", "email", "meeting"];
    for (let i = 0; i < 60; i++) {
      const type = pick(activityTypes);
      const contactId = pick(contactIds);
      const dealId = Math.random() < 0.6 ? pick(dealIds) : null;
      const matterId = Math.random() < 0.6 ? pick(matterIds) : null;
      const createdAt = daysAgo(Math.floor(Math.random() * 540)).toISOString();
      const { data, error } = await adminClient
        .from("activities")
        .insert({
          organization_id: organizationId,
          owner_type: "tenant",
          type,
          contact_id: contactId,
          deal_id: dealId,
          matter_id: matterId,
          subject: `Actividad demo #${i + 1}`,
          content: "Nota/registro de demostración.",
          created_by: userData.user.id,
          created_at: createdAt,
        })
        .select("id")
        .single();
      if (error) throw error;
      await register("activities", data.id);
    }

    // 5) Mark run completed
    const { error: doneErr } = await adminClient
      .from("demo_seed_runs")
      .update({ status: "completed", finished_at: new Date().toISOString() })
      .eq("id", runId);
    if (doneErr) throw doneErr;

    return json({ ok: true, run_id: runId });
  } catch (e) {
    // NOTE: Most Supabase SDK errors are not instances of Error.
    // Serialize them so the client can see the real message.
    const msg = formatError(e);
    console.error("seed-demo-data error", e);
    // Best-effort response; run may still exist.
    return json({ ok: false, error: msg }, 500);
  }
});
