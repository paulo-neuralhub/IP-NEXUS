import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
} as const;

type DemoOrgSlug = "demo-starter" | "demo-professional" | "demo-business" | "demo-enterprise";
const DEFAULT_DEMO_SLUGS: DemoOrgSlug[] = [
  "demo-starter",
  "demo-professional",
  "demo-business",
  "demo-enterprise",
];

const DEMO_DOCS_BUCKET = "demo-documents";

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

function getEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function getBearerToken(req: Request) {
  const h = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
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

async function getOrgIdBySlug(svc: any, slug: string): Promise<string> {
  const { data, error } = await svc.from("organizations").select("id").eq("slug", slug).single();
  if (error) throw error;
  return data.id as string;
}

async function callFunction(params: {
  baseUrl: string;
  anonKey: string;
  token: string;
  fn: string;
  body: unknown;
}) {
  const { baseUrl, anonKey, token, fn, body } = params;
  const res = await fetch(`${baseUrl}/functions/v1/${fn}`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (data && typeof data === "object" && "error" in data)
      ? String((data as any).error)
      : `Function ${fn} failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

async function cleanupAllRuns(params: { svc: any; baseUrl: string; anonKey: string; token: string; organizationId: string }) {
  const { svc, baseUrl, anonKey, token, organizationId } = params;
  const { data: runs, error } = await svc
    .from("demo_seed_runs")
    .select("id")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw error;

  const runIds = (runs ?? []).map((r: any) => String(r.id)).filter(Boolean);
  const cleaned: Array<{ run_id: string; deleted?: Record<string, number> }> = [];

  for (const runId of runIds) {
    const data = await callFunction({
      baseUrl,
      anonKey,
      token,
      fn: "cleanup-demo-data",
      body: { organization_id: organizationId, run_id: runId },
    });
    cleaned.push({ run_id: runId, deleted: (data?.deleted ?? undefined) as any });
  }

  return { cleaned_runs: cleaned.length };
}

async function deleteStoragePrefix(params: { svc: any; prefix: string }) {
  const { svc, prefix } = params;
  let offset = 0;
  const limit = 100;
  let deleted = 0;

  while (true) {
    const { data, error } = await svc.storage.from(DEMO_DOCS_BUCKET).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    const rows = (data ?? []) as Array<{ name: string }>
    if (!rows.length) break;

    const paths = rows.map((r) => `${prefix}/${r.name}`);
    const { error: delErr } = await svc.storage.from(DEMO_DOCS_BUCKET).remove(paths);
    if (delErr) throw delErr;
    deleted += paths.length;

    // If we got less than limit, there is no more.
    if (rows.length < limit) break;
    // Keep listing with same offset (since we delete, the list shrinks); safest is restart.
    offset = 0;
  }

  return deleted;
}

async function countTable(params: { svc: any; table: string; organizationId: string; extraEq?: Record<string, unknown> }) {
  const { svc, table, organizationId, extraEq } = params;
  let q = svc.from(table).select("id", { count: "exact", head: true }).eq("organization_id", organizationId);
  if (extraEq) {
    for (const [k, v] of Object.entries(extraEq)) q = q.eq(k, v);
  }
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = getEnv("SUPABASE_URL");
    const SUPABASE_ANON_KEY = getEnv("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

    const token = getBearerToken(req);
    if (!token) return json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await assertIsSuperadmin(svc, userData.user.id);

    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api-demo\/?/, "").replace(/^\/+|\/+$/g, "");

    // ----------------------
    // POST /api/demo/reset
    // ----------------------
    if (req.method === "POST" && path === "reset") {
      const body = (await req.json().catch(() => ({}))) as Partial<{
        tenant_slug: string;
        include_communications: boolean;
        include_finances: boolean;
      }>;

      const tenantSlug = body.tenant_slug;
      if (!tenantSlug) return json({ ok: false, error: "tenant_slug is required" }, { status: 400 });

      const includeCommunications = Boolean(body.include_communications);
      const includeFinances = Boolean(body.include_finances);

      const targets = tenantSlug === "all" ? DEFAULT_DEMO_SLUGS : [tenantSlug];

      const results: Array<{ slug: string; organization_id: string; steps: Record<string, unknown> }> = [];

      for (const slug of targets) {
        const steps: Record<string, unknown> = {};
        const orgId = await getOrgIdBySlug(svc, slug);

        // 1) Cleanup (by runs) + storage objects
        steps.cleanup = await cleanupAllRuns({
          svc,
          baseUrl: SUPABASE_URL,
          anonKey: SUPABASE_ANON_KEY,
          token,
          organizationId: orgId,
        });
        steps.storage_deleted = await deleteStoragePrefix({ svc, prefix: `${slug}/expediente` });

        // 2) Re-seed core dataset
        steps.seed_core = await callFunction({
          baseUrl: SUPABASE_URL,
          anonKey: SUPABASE_ANON_KEY,
          token,
          fn: "seed-demo-data",
          body: { organization_id: orgId },
        });

        // 3) Dynamic / tenant configs
        steps.seed_tenant_configs = await callFunction({
          baseUrl: SUPABASE_URL,
          anonKey: SUPABASE_ANON_KEY,
          token,
          fn: "seed-demo-tenant-configs",
          body: { tenant_slug: slug },
        });

        // 4) Tasks + workflows
        steps.seed_tasks_workflows = await callFunction({
          baseUrl: SUPABASE_URL,
          anonKey: SUPABASE_ANON_KEY,
          token,
          fn: "seed-demo-tasks-workflows",
          body: { tenant_slug: slug },
        });

        // 5) Documents
        steps.seed_documents = await callFunction({
          baseUrl: SUPABASE_URL,
          anonKey: SUPABASE_ANON_KEY,
          token,
          fn: "seed-demo-documents-structure",
          body: { tenant_slug: slug, target_total: 500 },
        });

        // Optional
        if (includeCommunications) {
          steps.seed_communications = await callFunction({
            baseUrl: SUPABASE_URL,
            anonKey: SUPABASE_ANON_KEY,
            token,
            fn: "seed-demo-client-communications",
            body: { tenant_slug: slug },
          });
        }
        if (includeFinances) {
          steps.seed_finances = await callFunction({
            baseUrl: SUPABASE_URL,
            anonKey: SUPABASE_ANON_KEY,
            token,
            fn: "seed-demo-finance-full",
            body: { tenant_slug: slug },
          });
        }

        // 6) Time entries + signature requests (L108)
        steps.seed_time_signatures = await callFunction({
          baseUrl: SUPABASE_URL,
          anonKey: SUPABASE_ANON_KEY,
          token,
          fn: "seed-demo-time-signatures",
          body: { organization_id: orgId },
        });

        results.push({ slug, organization_id: orgId, steps });
      }

      return json({ ok: true, results });
    }

    // ----------------------
    // GET /api/demo/status
    // ----------------------
    if (req.method === "GET" && path === "status") {
      const tenantSlug = url.searchParams.get("tenant_slug") ?? "all";
      const targets = tenantSlug === "all" ? DEFAULT_DEMO_SLUGS : [tenantSlug];

      const out: Array<{ slug: string; organization_id: string; last_reset_at: string | null; counts: Record<string, number> }> = [];

      for (const slug of targets) {
        const orgId = await getOrgIdBySlug(svc, slug);

        const { data: lastRun, error: lrErr } = await svc
          .from("demo_seed_runs")
          .select("finished_at, created_at")
          .eq("organization_id", orgId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lrErr) throw lrErr;

        const counts: Record<string, number> = {};
        counts.contacts = await countTable({ svc, table: "contacts", organizationId: orgId });
        counts.matters = await countTable({ svc, table: "matters", organizationId: orgId });
        counts.matter_documents = await countTable({ svc, table: "matter_documents", organizationId: orgId });
        counts.activities = await countTable({ svc, table: "activities", organizationId: orgId });
        counts.communications = await countTable({ svc, table: "communications", organizationId: orgId });
        counts.invoices = await countTable({ svc, table: "invoices", organizationId: orgId });
        counts.smart_tasks = await countTable({ svc, table: "smart_tasks", organizationId: orgId });
        counts.workflow_executions = await countTable({ svc, table: "workflow_executions", organizationId: orgId });
        // L108: Time tracking & signatures
        counts.time_entries = await countTable({ svc, table: "time_entries", organizationId: orgId });
        counts.signature_requests = await countTable({ svc, table: "signature_requests", organizationId: orgId });
        counts.billing_rates = await countTable({ svc, table: "billing_rates", organizationId: orgId });

        out.push({
          slug,
          organization_id: orgId,
          last_reset_at: (lastRun?.finished_at ?? lastRun?.created_at ?? null) as string | null,
          counts,
        });
      }

      return json({ ok: true, tenants: out });
    }

    return json({ ok: false, error: "Not found" }, { status: 404 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
});
