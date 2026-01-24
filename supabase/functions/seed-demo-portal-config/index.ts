import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

type DemoOrgSlug = "demo-professional" | "demo-business" | "demo-enterprise";

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

type PortalClientSeed = {
  name: string;
  portalSlug: string;
  portalName: string;
  status: "active" | "invited";
  users: number;
  primaryColor: string;
  logoSeed: string;
  customDomain?: string;
};

const portalClients: readonly PortalClientSeed[] = [
  {
    name: "TechStart",
    portalSlug: "techstart",
    portalName: "TechStart Portal",
    status: "active",
    users: 2,
    primaryColor: "#2563EB",
    logoSeed: "techstart",
    customDomain: "portal.techstart.demo",
  },
  {
    name: "FarmaCorp",
    portalSlug: "farmacorp",
    portalName: "FarmaCorp Portal",
    status: "active",
    users: 5,
    primaryColor: "#16A34A",
    logoSeed: "farmacorp",
    customDomain: "portal.farmacorp.demo",
  },
  {
    name: "DistriFresh",
    portalSlug: "distrifresh",
    portalName: "DistriFresh Portal",
    status: "invited",
    users: 1,
    primaryColor: "#EA580C",
    logoSeed: "distrifresh",
    customDomain: "portal.distrifresh.demo",
  },
] as const;

function logoUrl(seed: string) {
  // Simulated logo asset
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/256/256`;
}

function randomPermissions(role: "admin" | "billing" | "member" | "viewer") {
  const base = {
    view_dashboard: true,
    view_matters: true,
    view_documents: true,
    view_invoices: true,
    send_messages: true,
    download_documents: true,
  } as Record<string, boolean>;

  if (role === "viewer") {
    return { ...base, send_messages: false };
  }
  if (role === "billing") {
    return { ...base, view_invoices: true, view_documents: true, view_matters: true };
  }
  if (role === "member") {
    return { ...base };
  }
  // admin
  return { ...base, manage_users: true, manage_settings: true };
}

async function upsertContactCompany(svc: any, organizationId: string, createdBy: string, name: string) {
  const { data: existing, error: findErr } = await svc
    .from("contacts")
    .select("id,name")
    .eq("organization_id", organizationId)
    .eq("type", "company")
    .ilike("name", name)
    .maybeSingle();
  if (findErr) throw findErr;

  if (existing?.id) return existing.id as string;

  const slug = normalizeSlug(name);
  const { data: created, error: insErr } = await svc
    .from("contacts")
    .insert({
      organization_id: organizationId,
      owner_type: "tenant",
      type: "company",
      name,
      email: `contact@${slug}.demo`,
      website: `https://${slug}.demo`,
      source: "demo_seed",
      created_by: createdBy,
      tags: ["demo", "portal"],
      portal_access_enabled: true,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (insErr) throw insErr;
  return created.id as string;
}

async function upsertBillingClientForContact(svc: any, organizationId: string, contactId: string, legalName: string) {
  const { data: existing, error: eErr } = await svc
    .from("billing_clients")
    .select("id")
    .eq("organization_id", organizationId)
    .ilike("legal_name", legalName)
    .maybeSingle();
  if (eErr) throw eErr;
  if (existing?.id) return existing.id as string;

  const { data: bc, error: bcErr } = await svc
    .from("billing_clients")
    .insert({
      organization_id: organizationId,
      legal_name: legalName,
      contact_id: contactId,
      billing_email: `billing@${normalizeSlug(legalName)}.demo`,
      billing_address: "(DEMO) Calle Principal 123",
      billing_city: "Madrid",
      billing_country: "ES",
      is_active: true,
    })
    .select("id")
    .single();
  if (bcErr) throw bcErr;
  return bc.id as string;
}

async function seedPortalForOrg(params: {
  svc: any;
  organizationId: string;
  runId: string;
  createdBy: string;
  orgSlug: DemoOrgSlug;
}) {
  const { svc, organizationId, runId, createdBy, orgSlug } = params;

  // Some matters to reference in portal settings
  const { data: matters, error: matErr } = await svc
    .from("matters")
    .select("id, reference, title")
    .eq("organization_id", organizationId)
    .limit(200);
  if (matErr) throw matErr;
  const matterPool = (matters ?? []) as Array<{ id: string; reference: string; title: string }>;

  // Staff users to simulate internal participants
  const { data: members, error: memErr } = await svc
    .from("memberships")
    .select("user_id")
    .eq("organization_id", organizationId)
    .limit(10);
  if (memErr) throw memErr;
  const internalUserIds = (members ?? []).map((m: any) => String(m.user_id)).filter(Boolean);
  const internalActor = internalUserIds.length ? pick(internalUserIds) : createdBy;

  for (const seed of portalClients) {
    const contactId = await upsertContactCompany(svc, organizationId, createdBy, seed.name);
    await upsertBillingClientForContact(svc, organizationId, contactId, seed.name);

    // Update contact portal flags
    await svc
      .from("contacts")
      .update({
        portal_access_enabled: true,
        portal_last_login: seed.status === "active" ? isoTs(daysAgo(Math.floor(Math.random() * 10))) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contactId)
      .eq("organization_id", organizationId);

    // Create / update portal
    const { data: existingPortal, error: pFindErr } = await svc
      .from("client_portals")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("client_id", contactId)
      .maybeSingle();
    if (pFindErr) throw pFindErr;

    const selectedMatters = shuffle(matterPool).slice(0, 6);
    const visibleMatters = selectedMatters.map((m) => ({ id: m.id, reference: m.reference, title: m.title }));

    const portalPayload = {
      organization_id: organizationId,
      client_id: contactId,
      portal_slug: seed.portalSlug,
      portal_name: seed.portalName,
      is_active: true,
      activated_at: seed.status === "active" ? isoTs(daysAgo(30 + Math.floor(Math.random() * 60))) : null,
      created_by: createdBy,
      branding_config: {
        logo_url: logoUrl(`${orgSlug}-${seed.logoSeed}`),
        primary_color: seed.primaryColor,
      },
      settings: {
        demo: true,
        url_mode: "custom_domain",
        custom_domain: seed.customDomain,
        subdomain: `${seed.portalSlug}.${orgSlug}.portal.demo.ipnexus.com`,
        visible_matters: visibleMatters,
        feature_flags: {
          documents: true,
          invoices: true,
          messaging: true,
        },
      },
      last_accessed_at: seed.status === "active" ? isoTs(daysAgo(Math.floor(Math.random() * 5))) : null,
      total_logins: seed.status === "active" ? 10 + Math.floor(Math.random() * 40) : 0,
      updated_at: new Date().toISOString(),
    };

    let portalId: string;
    if (existingPortal?.id) {
      const { data: upd, error: updErr } = await svc
        .from("client_portals")
        .update(portalPayload)
        .eq("id", existingPortal.id)
        .select("id")
        .single();
      if (updErr) throw updErr;
      portalId = upd.id as string;
    } else {
      const { data: ins, error: insErr } = await svc.from("client_portals").insert(portalPayload).select("id").single();
      if (insErr) throw insErr;
      portalId = ins.id as string;
      await registerEntity(svc, runId, "client_portals", portalId);
    }

    // Portal users
    const roles: Array<"admin" | "billing" | "member" | "viewer"> = ["admin", "billing", "member", "viewer"];
    const createdPortalUsers: Array<{ id: string; status: string } > = [];

    for (let i = 0; i < seed.users; i++) {
      const email = `${seed.portalSlug}.${i + 1}@${seed.portalSlug}.demo`;
      const name = `${seed.name} User ${i + 1}`;
      const role = roles[i % roles.length];
      const userStatus = seed.status === "active" ? "active" : "invited";

      const { data: existingUser, error: uFindErr } = await svc
        .from("portal_users")
        .select("id")
        .eq("portal_id", portalId)
        .eq("email", email)
        .maybeSingle();
      if (uFindErr) throw uFindErr;

      const basePayload = {
        portal_id: portalId,
        email,
        name,
        role,
        permissions: randomPermissions(role),
        status: userStatus,
        invited_at: userStatus === "invited" ? isoTs(daysAgo(7)) : null,
        invited_by: userStatus === "invited" ? createdBy : null,
        activated_at: userStatus === "active" ? isoTs(daysAgo(40)) : null,
        last_login_at: userStatus === "active" ? isoTs(daysAgo(Math.floor(Math.random() * 30))) : null,
        login_count: userStatus === "active" ? 3 + Math.floor(Math.random() * 25) : 0,
        notification_preferences: {
          email_updates: true,
          deadline_alerts: true,
        },
        updated_at: new Date().toISOString(),
      };

      let portalUserId: string;
      if (existingUser?.id) {
        const { data: upd, error: updErr } = await svc
          .from("portal_users")
          .update(basePayload)
          .eq("id", existingUser.id)
          .select("id")
          .single();
        if (updErr) throw updErr;
        portalUserId = upd.id as string;
      } else {
        const { data: ins, error: insErr } = await svc.from("portal_users").insert(basePayload).select("id").single();
        if (insErr) throw insErr;
        portalUserId = ins.id as string;
        await registerEntity(svc, runId, "portal_users", portalUserId);
      }

      createdPortalUsers.push({ id: portalUserId, status: userStatus });
    }

    // Client documents (visible in portal)
    const { data: existingDocs, error: dErr } = await svc
      .from("client_documents")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("client_id", contactId)
      .limit(10);
    if (dErr) throw dErr;

    const docIds: string[] = (existingDocs ?? []).map((d: any) => String(d.id)).filter(Boolean);
    if (docIds.length < 3) {
      const missing = 3 - docIds.length;
      for (let i = 0; i < missing; i++) {
        const fileName = `Documento_${seed.portalSlug}_${i + 1}.pdf`;
        const filePath = `${orgSlug}/${seed.portalSlug}/${fileName}`;
        const { data: cd, error: cdErr } = await svc
          .from("client_documents")
          .insert({
            organization_id: organizationId,
            client_id: contactId,
            file_name: fileName,
            file_path: filePath,
            mime_type: "application/pdf",
            file_size: 120000 + Math.floor(Math.random() * 900000),
            description: "(DEMO) Documento compartido en portal.",
            visible_in_portal: true,
            matter_id: selectedMatters.length ? pick(selectedMatters).id : null,
            created_at: isoTs(daysAgo(30 + Math.floor(Math.random() * 120))),
          })
          .select("id")
          .single();
        if (cdErr) throw cdErr;
        docIds.push(cd.id as string);
        await registerEntity(svc, runId, "client_documents", cd.id);
      }
    }

    // Invoices viewed (use org invoices; if finance seed ran, there will be plenty)
    const { data: invoices, error: invErr } = await svc
      .from("invoices")
      .select("id, invoice_number")
      .eq("organization_id", organizationId)
      .order("invoice_date", { ascending: false })
      .limit(30);
    if (invErr) throw invErr;
    const invoicePool = (invoices ?? []) as Array<{ id: string; invoice_number: string }>;

    // Messages (portal_comments)
    const commentIds: string[] = [];
    const activeUsers = createdPortalUsers.filter((u) => u.status === "active");
    if (activeUsers.length) {
      const threadId = crypto.randomUUID();
      const msgCount = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < msgCount; i++) {
        const fromClient = i % 2 === 0;
        const author = fromClient ? pick(activeUsers).id : null;
        const authorType = fromClient ? "portal_user" : "staff";
        const authorName = fromClient ? `${seed.name} (Portal)` : "Equipo IP‑NEXUS";
        const content =
          i === 0
            ? "(DEMO) Hola, ¿podéis confirmar el estado del expediente?"
            : fromClient
              ? "(DEMO) Perfecto, gracias."
              : "(DEMO) Recibido. Os enviamos actualización en breve.";

        const { data: pc, error: pcErr } = await svc
          .from("portal_comments")
          .insert({
            portal_id: portalId,
            author_external_id: author,
            author_internal_id: fromClient ? null : internalActor,
            author_name: authorName,
            author_type: authorType,
            content,
            context_type: "general",
            context_id: null,
            thread_id: threadId,
            created_at: isoTs(daysAgo(1 + Math.floor(Math.random() * 25))),
            is_internal: false,
          })
          .select("id")
          .single();
        if (pcErr) throw pcErr;
        commentIds.push(pc.id as string);
        await registerEntity(svc, runId, "portal_comments", pc.id);
      }
    }

    // Activity log (last 30 days)
    // - logins
    // - document downloads
    // - message sent
    // - invoice viewed
    for (const u of createdPortalUsers.filter((x) => x.status === "active")) {
      const loginEvents = 2 + Math.floor(Math.random() * 6);
      for (let i = 0; i < loginEvents; i++) {
        const at = daysAgo(Math.floor(Math.random() * 30));
        const { data: al, error: alErr } = await svc
          .from("portal_activity_log")
          .insert({
            portal_id: portalId,
            actor_type: "portal_user",
            actor_external_id: u.id,
            actor_name: seed.name,
            action: "login",
            details: { demo: true, method: "magic_link" },
            ip_address: pick(["83.45.12.9", "91.126.5.44", "2.139.77.21"]),
            user_agent: "Mozilla/5.0 (DEMO)",
            created_at: isoTs(at),
          })
          .select("id")
          .single();
        if (alErr) throw alErr;
        await registerEntity(svc, runId, "portal_activity_log", al.id);
      }

      // document downloads
      const dlCount = 1 + Math.floor(Math.random() * 4);
      for (let i = 0; i < dlCount; i++) {
        const docId = pick(docIds);
        const at = daysAgo(Math.floor(Math.random() * 30));
        const { data: al, error: alErr } = await svc
          .from("portal_activity_log")
          .insert({
            portal_id: portalId,
            actor_type: "portal_user",
            actor_external_id: u.id,
            actor_name: seed.name,
            action: "download_document",
            resource_type: "client_document",
            resource_id: docId,
            resource_name: "Documento PDF",
            details: { demo: true },
            created_at: isoTs(at),
          })
          .select("id")
          .single();
        if (alErr) throw alErr;
        await registerEntity(svc, runId, "portal_activity_log", al.id);
      }

      // invoices viewed
      if (invoicePool.length) {
        const viewCount = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < viewCount; i++) {
          const inv = pick(invoicePool);
          const at = daysAgo(Math.floor(Math.random() * 30));
          const { data: al, error: alErr } = await svc
            .from("portal_activity_log")
            .insert({
              portal_id: portalId,
              actor_type: "portal_user",
              actor_external_id: u.id,
              actor_name: seed.name,
              action: "view_invoice",
              resource_type: "invoice",
              resource_id: inv.id,
              resource_name: inv.invoice_number,
              details: { demo: true },
              created_at: isoTs(at),
            })
            .select("id")
            .single();
          if (alErr) throw alErr;
          await registerEntity(svc, runId, "portal_activity_log", al.id);
        }
      }

      // messages sent
      if (commentIds.length) {
        const msgEvents = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < msgEvents; i++) {
          const cId = pick(commentIds);
          const at = daysAgo(Math.floor(Math.random() * 30));
          const { data: al, error: alErr } = await svc
            .from("portal_activity_log")
            .insert({
              portal_id: portalId,
              actor_type: "portal_user",
              actor_external_id: u.id,
              actor_name: seed.name,
              action: "send_message",
              resource_type: "portal_comment",
              resource_id: cId,
              resource_name: "Mensaje",
              details: { demo: true },
              created_at: isoTs(at),
            })
            .select("id")
            .single();
          if (alErr) throw alErr;
          await registerEntity(svc, runId, "portal_activity_log", al.id);
        }
      }
    }

    // Notifications (emails sent + deadline alerts shared)
    const notificationTypes = ["update", "deadline", "invoice"] as const;
    const recipients = createdPortalUsers.map((u) => u.id);
    const notifCount = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < notifCount; i++) {
      const nt = pick(notificationTypes);
      const uId = pick(recipients);
      const at = daysAgo(Math.floor(Math.random() * 30));
      const title =
        nt === "deadline"
          ? "(DEMO) Alerta de plazo compartida"
          : nt === "invoice"
            ? "(DEMO) Factura disponible"
            : "(DEMO) Actualización de expediente";

      const { data: pn, error: pnErr } = await svc
        .from("portal_notifications")
        .insert({
          portal_id: portalId,
          user_id: uId,
          notification_type: nt,
          title,
          message:
            nt === "deadline"
              ? "(DEMO) Se ha compartido un plazo próximo en el portal."
              : nt === "invoice"
                ? "(DEMO) Hay una factura para revisar en el portal."
                : "(DEMO) Nueva actualización disponible en el portal.",
          link: `/portal/${seed.portalSlug}/dashboard`,
          email_sent: true,
          email_sent_at: isoTs(at),
          is_read: Math.random() < 0.5,
          read_at: Math.random() < 0.5 ? isoTs(daysAgo(Math.floor(Math.random() * 10))) : null,
          reference_type: nt === "invoice" ? "invoice" : nt === "deadline" ? "deadline" : "matter",
          reference_id: null,
          created_at: isoTs(at),
        })
        .select("id")
        .single();
      if (pnErr) throw pnErr;
      await registerEntity(svc, runId, "portal_notifications", pn.id);
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

    const targets: DemoOrgSlug[] = ["demo-professional", "demo-business", "demo-enterprise"];
    const results: Array<{ slug: DemoOrgSlug; run_id: string }> = [];

    for (const slug of targets) {
      const orgId = await getOrgIdBySlug(svc, slug);
      const runId = await createRun(svc, orgId, callerId, "portal-config-v1");
      await seedPortalForOrg({ svc, organizationId: orgId, runId, createdBy: callerId, orgSlug: slug });
      await completeRun(svc, runId);
      results.push({ slug, run_id: runId });
    }

    return json({ ok: true, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
});
