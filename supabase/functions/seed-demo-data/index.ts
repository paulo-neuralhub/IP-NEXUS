import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SeedRequest = {
  organization_id: string;
};

type IdRow = { id: string };

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

function pickMany<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (copy.length && out.length < count) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
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

    // 4) Seed realistic-ish data (coherent cross-module dataset)
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
          created_by: userData.user.id,
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
    const jurisdictions = ["ES", "EU", "WIPO"];
    const matterIds: string[] = [];
    let matterCounter = 1;
    for (let cIdx = 0; cIdx < contactIds.length; cIdx++) {
      for (let m = 0; m < 3; m++) {
        const type = pick(matterTypes);
        const reference = `DEMO-${String(matterCounter).padStart(4, "0")}`;
        matterCounter += 1;

        const markName = type === "trademark" ? pick(["NEXAL", "SOLARIA", "BLUEPEAK", "VELA", "COBALT"]) : null;

        const jurisdictionCode = pick(jurisdictions);
        const filingDate = daysAgo(90 + Math.floor(Math.random() * 720));
        const expiryDate = new Date(filingDate.getTime() + 10 * 365 * 24 * 60 * 60 * 1000);
        const nextRenewalDate = new Date(expiryDate.getTime() - 180 * 24 * 60 * 60 * 1000);

        const { data, error } = await adminClient
          .from("matters")
          .insert({
            organization_id: organizationId,
            reference,
            title: `${type.toUpperCase()} — ${markName ?? reference}`,
            type,
            status: "active",
            jurisdiction: jurisdictionCode,
            jurisdiction_code: jurisdictionCode,
            filing_date: filingDate.toISOString().slice(0, 10),
            expiry_date: expiryDate.toISOString().slice(0, 10),
            next_renewal_date: nextRenewalDate.toISOString().slice(0, 10),
            mark_name: markName,
            owner_name: firmContacts[cIdx].name,
            tags: ["demo"],
            notes: "Expediente de demostración generado automáticamente.",
            created_by: userData.user.id,
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

    // CRM: ensure at least 1 pipeline+stages exist (some orgs might be new)
    let pipelineId: string | null = null;
    {
      const { data: pipelineRow, error: pipeErr } = await adminClient
        .from("pipelines")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("owner_type", "tenant")
        .eq("is_active", true)
        .order("is_default", { ascending: false })
        .order("position", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (pipeErr) throw pipeErr;
      pipelineId = (pipelineRow?.id as string) ?? null;
    }

    if (!pipelineId) {
      const { data: pipeline, error: createPipeErr } = await adminClient
        .from("pipelines")
        .insert({
          organization_id: organizationId,
          owner_type: "tenant",
          name: "Captación de Clientes",
          pipeline_type: "sales",
          is_default: true,
          is_active: true,
          position: 0,
        })
        .select("id")
        .single();
      if (createPipeErr) throw createPipeErr;
      pipelineId = pipeline.id;
      await register("pipelines", pipeline.id);

      const stages = [
        { name: "Lead Entrante", color: "#3B82F6", probability: 10 },
        { name: "Contacto Inicial", color: "#0EA5E9", probability: 20 },
        { name: "Propuesta Enviada", color: "#F59E0B", probability: 50 },
        { name: "Negociación", color: "#8B5CF6", probability: 70 },
        { name: "Cliente Ganado", color: "#22C55E", probability: 100, is_won_stage: true },
        { name: "Perdido", color: "#EF4444", probability: 0, is_lost_stage: true },
      ];

      const { data: stageRows, error: stageInsErr } = await adminClient
        .from("pipeline_stages")
        .insert(
          stages.map((s, idx) => ({
            pipeline_id: pipelineId,
            name: s.name,
            color: s.color,
            probability: s.probability,
            position: idx,
            is_won_stage: (s as any).is_won_stage ?? false,
            is_lost_stage: (s as any).is_lost_stage ?? false,
          })),
        )
        .select("id");
      if (stageInsErr) throw stageInsErr;
      for (const r of (stageRows ?? []) as IdRow[]) await register("pipeline_stages", r.id);
    }

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
          created_by: userData.user.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      dealIds.push(data.id);
      await register("deals", data.id);
    }

    // Spider: watchlists linked to matters
    for (let i = 0; i < 3; i++) {
      const matterId = pick(matterIds);
      const { data, error } = await adminClient
        .from("watchlists")
        .insert({
          organization_id: organizationId,
          owner_type: "tenant",
          name: `Vigilancia demo #${i + 1}`,
          description: "Watchlist demo para simular alertas de vigilancia.",
          type: "trademark",
          watch_terms: [pick(["NEXAL", "SOLARIA", "BLUEPEAK", "VELA"]), pick(["NEX", "SOL", "PEAK", "LAB"])],
          watch_classes: [3, 5, 9, 25],
          watch_jurisdictions: ["ES", "EU"],
          matter_id: matterId,
          similarity_threshold: 75,
          notify_email: true,
          notify_in_app: true,
          notify_frequency: "weekly",
          notify_users: [userData.user.id],
          is_active: true,
          created_by: userData.user.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      await register("watchlists", data.id);
    }

    // Filing: create a couple of filing_applications linked to matters
    {
      const filingMatterId = pick(matterIds);
      const applicantContactId = pick(contactIds);
      const officeCode = pick(["OEPM", "EUIPO", "WIPO"]);

      // Office id is required but depends on your offices table; we store a dummy UUID if the FK is optional.
      // If it is enforced, you should seed offices separately; for now we try to fetch one.
      let officeId: string | null = null;
      try {
        const officeRes = await adminClient.from("filing_offices").select("id").limit(1).maybeSingle();
        officeId = (officeRes.data?.id as string) ?? null;
      } catch {
        // Table might not exist in some environments; skip filing demo.
        officeId = null;
      }

      if (officeId) {
        const { data, error } = await adminClient
          .from("filing_applications")
          .insert({
            organization_id: organizationId,
            filing_type: "new_application",
            ip_type: "trademark",
            office_id: officeId,
            office_code: officeCode,
            matter_id: filingMatterId,
            applicant_id: applicantContactId,
            applicant_data: {
              name: firmContacts[0].name,
              country: "ES",
              address: "C/ Demo 123, Madrid",
            },
            application_data: {
              mark_name: "NEXAL",
              mark_type: "word",
              nice_classes: [9, 35],
              goods_services: "Software; servicios legales; consultoría empresarial.",
            },
            status: "draft",
            validation_status: "pending",
            created_by: userData.user.id,
          })
          .select("id")
          .single();
        if (error) throw error;
        await register("filing_applications", data.id);
      }
    }

    // Marketing: templates + list + campaign + some sends
    const templateIds: string[] = [];
    for (const tpl of [
      {
        name: "Bienvenida nuevo cliente",
        category: "welcome",
        subject: "Bienvenido a IP-NEXUS — primeros pasos",
        preview: "Te enseñamos cómo empezar en 5 minutos.",
      },
      {
        name: "Alerta de vencimiento",
        category: "reminder",
        subject: "Vencimiento próximo: acción requerida",
        preview: "Revisa el expediente y confirma instrucciones.",
      },
      {
        name: "Propuesta comercial",
        category: "notification",
        subject: "Propuesta para gestión integral de PI",
        preview: "Adjuntamos propuesta y próximos pasos.",
      },
    ]) {
      const { data, error } = await adminClient
        .from("email_templates")
        .insert({
          organization_id: organizationId,
          owner_type: "tenant",
          name: tpl.name,
          category: tpl.category,
          subject: tpl.subject,
          preview_text: tpl.preview,
          html_content: `<!doctype html><html><body style="font-family:Arial,sans-serif"><h2>${tpl.subject}</h2><p>${tpl.preview}</p><p style="color:#64748B">(DEMO) Plantilla generada automáticamente.</p></body></html>`,
          is_active: true,
          is_system: false,
          created_by: userData.user.id,
          available_variables: ["{{contact.name}}", "{{organization.name}}"],
        })
        .select("id")
        .single();
      if (error) throw error;
      templateIds.push(data.id);
      await register("email_templates", data.id);
    }

    const { data: listRow, error: listErr } = await adminClient
      .from("contact_lists")
      .insert({
        organization_id: organizationId,
        owner_type: "tenant",
        name: "Clientes DEMO",
        description: "Lista demo vinculada a contactos seed.",
        type: "static",
        is_active: true,
      })
      .select("id")
      .single();
    if (listErr) throw listErr;
    const listId = listRow.id as string;
    await register("contact_lists", listId);

    for (const cid of pickMany(contactIds, Math.min(6, contactIds.length))) {
      const { data, error } = await adminClient
        .from("contact_list_members")
        .insert({
          list_id: listId,
          contact_id: cid,
          added_by: userData.user.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      await register("contact_list_members", data.id);
    }

    const { data: campaign, error: campErr } = await adminClient
      .from("email_campaigns")
      .insert({
        organization_id: organizationId,
        owner_type: "tenant",
        name: "Campaña DEMO — Bienvenida",
        description: "Campaña demo (borrador) para visualizar Marketing.",
        campaign_type: "regular",
        template_id: templateIds[0] ?? null,
        subject: "Bienvenido a IP-NEXUS",
        preview_text: "Primeros pasos para tu equipo.",
        from_name: "IP-NEXUS",
        from_email: "no-reply@demo.ip-nexus.local",
        html_content: "<p>(DEMO) Bienvenido…</p>",
        list_ids: [listId],
        status: "draft",
        created_by: userData.user.id,
      })
      .select("id")
      .single();
    if (campErr) throw campErr;
    const campaignId = campaign.id as string;
    await register("email_campaigns", campaignId);

    for (const cid of pickMany(contactIds, 5)) {
      const { data, error } = await adminClient
        .from("email_sends")
        .insert({
          campaign_id: campaignId,
          contact_id: cid,
          status: pick(["queued", "sent", "delivered"]),
          sent_at: daysAgo(Math.floor(Math.random() * 30)).toISOString(),
          delivered_at: daysAgo(Math.floor(Math.random() * 25)).toISOString(),
          open_count: Math.random() < 0.6 ? 1 + Math.floor(Math.random() * 3) : 0,
          click_count: Math.random() < 0.3 ? 1 : 0,
        })
        .select("id")
        .single();
      if (error) throw error;
      await register("email_sends", data.id);
    }

    // Market: create demo market users + assets + listings + rfq flow tied to current org
    const marketUserIds: string[] = [];
    // Ensure current user has a market_user profile (so RFQ pages work)
    {
      const { data: existing, error } = await adminClient
        .from("market_users")
        .select("id")
        .eq("auth_user_id", userData.user.id)
        .maybeSingle();
      if (error) throw error;
      if (!existing) {
        const { data: mu, error: muErr } = await adminClient
          .from("market_users")
          .insert({
            auth_user_id: userData.user.id,
            organization_id: organizationId,
            user_type: "buyer",
            email: userData.user.email ?? `buyer-${userData.user.id}@demo.ip-nexus.local`,
            display_name: "Buyer DEMO",
            country: "ES",
            is_active: true,
            is_public_profile: false,
            accepts_new_clients: true,
          })
          .select("id")
          .single();
        if (muErr) throw muErr;
        await register("market_users", mu.id);
        marketUserIds.push(mu.id);
      }
    }

    // Demo agents
    const agentSeeds = [
      { name: "María López", country: "ES", jurisdictions: ["ES", "EU"] },
      { name: "Jean Martin", country: "FR", jurisdictions: ["EU", "WO"] },
      { name: "Anna Schmidt", country: "DE", jurisdictions: ["DE", "EU"] },
      { name: "James Taylor", country: "GB", jurisdictions: ["GB", "EU"] },
    ];

    for (let i = 0; i < agentSeeds.length; i++) {
      const a = agentSeeds[i];
      const { data, error } = await adminClient
        .from("market_users")
        .insert({
          organization_id: null,
          user_type: "agent",
          email: `agent-${i + 1}@demo.ip-nexus.local`,
          display_name: a.name,
          country: a.country,
          is_agent: true,
          is_verified_agent: true,
          is_active: true,
          is_public_profile: true,
          accepts_new_clients: true,
          jurisdictions: a.jurisdictions,
          specializations: ["trademarks", "patents"],
          years_experience: 8 + i,
          hourly_rate: 120 + i * 20,
          rate_currency: "EUR",
          reputation_score: 75 + i * 5,
          rating_avg: 4.5,
          ratings_count: 12 + i,
        })
        .select("id")
        .single();
      if (error) throw error;
      marketUserIds.push(data.id);
      await register("market_users", data.id);
    }

    // Assets + listings
    const listingIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const sellerId = pick(marketUserIds);
      const { data: asset, error: assetErr } = await adminClient
        .from("market_assets")
        .insert({
          owner_id: sellerId,
          asset_type: "trademark",
          asset_category: "brand",
          title: `Marca DEMO ${i + 1}`,
          description: "Activo DEMO para mercado (marca).",
          jurisdiction: pick(["ES", "EU"]),
          word_mark: pick(["NEXAL", "SOLARIA", "VELA"]),
          nice_classes: [9, 35],
          verification_status: "verified",
          verified_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (assetErr) throw assetErr;
      await register("market_assets", asset.id);

      const { data: listing, error: listingErr } = await adminClient
        .from("market_listings")
        .insert({
          listing_number: `LIST-DEMO-${String(i + 1).padStart(4, "0")}`,
          asset_id: asset.id,
          seller_id: sellerId,
          status: "active",
          transaction_types: ["sale"],
          asking_price: 15000 + i * 5000,
          currency: "EUR",
          title: `Venta: ${pick(["NEXAL", "SOLARIA", "VELA"])} (${pick(["ES", "EU"])})`,
          description: "Listing DEMO para probar filtros y ofertas.",
          is_featured: i === 0,
          published_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (listingErr) throw listingErr;
      listingIds.push(listing.id);
      await register("market_listings", listing.id);
    }

    // Offers
    for (let i = 0; i < 5; i++) {
      const listingId = pick(listingIds);
      const buyerId = pick(marketUserIds);
      const { data, error } = await adminClient
        .from("market_offers")
        .insert({
          listing_id: listingId,
          buyer_id: buyerId,
          offer_type: "offer",
          amount: 10000 + i * 1000,
          currency: "EUR",
          status: pick(["pending", "accepted", "rejected"]),
          message: "Oferta DEMO.",
        })
        .select("id")
        .single();
      if (error) throw error;
      await register("market_offers", data.id);
    }

    // RFQ request + quotes
    {
      const { data: requester, error: requesterErr } = await adminClient
        .from("market_users")
        .select("id")
        .eq("auth_user_id", userData.user.id)
        .maybeSingle();
      if (requesterErr) throw requesterErr;

      if (requester?.id) {
        const { data: rfq, error: rfqErr } = await adminClient
          .from("rfq_requests")
          .insert({
            reference_number: `RFQ-DEMO-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            requester_id: requester.id,
            organization_id: organizationId,
            service_category: "trademark",
            service_type: "trademark_filing",
            title: "Registro de marca en España (DEMO)",
            description: "Necesito registrar una marca denominativa con 2 clases.",
            jurisdictions: ["ES"],
            nice_classes: [9, 35],
            budget_min: 400,
            budget_max: 900,
            budget_currency: "EUR",
            budget_type: "fixed",
            urgency: "normal",
            status: "open",
            published_at: new Date().toISOString(),
            closes_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select("id")
          .single();
        if (rfqErr) throw rfqErr;
        await register("rfq_requests", rfq.id);

        // Quotes from 2 agents
        const agents = marketUserIds.slice(-agentSeeds.length);
        for (const agentId of pickMany(agents, 2)) {
          const { data: quote, error: qErr } = await adminClient
            .from("rfq_quotes")
            .insert({
              request_id: rfq.id,
              agent_id: agentId,
              status: "submitted",
              amount: 650,
              currency: "EUR",
              message: "Propuesta DEMO para presentación en OEPM.",
              estimated_days: 7,
            })
            .select("id")
            .single();
          if (qErr) throw qErr;
          await register("rfq_quotes", quote.id);
        }
      }
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
