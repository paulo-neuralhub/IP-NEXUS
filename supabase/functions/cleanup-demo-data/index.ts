import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CleanupRequest = {
  organization_id: string;
  run_id?: string;
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

const DELETE_ORDER = [
  "invoice_items",
  "invoices",
  "deadline_alerts",
  "matter_deadlines",
  "activities",
  "communications",
  "deals",
  "billing_clients",
  "matters",
  "contacts",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const SUPABASE_URL = getEnv("SUPABASE_URL");
    const SUPABASE_ANON_KEY = getEnv("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

    const authHeader = req.headers.get("authorization") || "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const body = (await req.json().catch(() => ({}))) as Partial<CleanupRequest>;
    const organizationId = body.organization_id;
    if (!organizationId) return json({ error: "organization_id is required" }, 400);

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: sa, error: saErr } = await adminClient
      .from("superadmins")
      .select("id")
      .eq("user_id", userData.user.id)
      .eq("is_active", true)
      .maybeSingle();
    if (saErr) throw saErr;
    if (!sa) return json({ error: "Forbidden" }, 403);

    // Determine run_id
    let runId = body.run_id;
    if (!runId) {
      const { data: lastRun, error: lastErr } = await adminClient
        .from("demo_seed_runs")
        .select("id")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastErr) throw lastErr;
      if (!lastRun) return json({ error: "No demo seed runs found for this organization" }, 404);
      runId = lastRun.id;
    }

    const { data: entities, error: entErr } = await adminClient
      .from("demo_seed_entities")
      .select("table_name,row_id")
      .eq("run_id", runId);
    if (entErr) throw entErr;

    const byTable = new Map<string, string[]>();
    for (const e of entities ?? []) {
      const t = e.table_name as string;
      const id = e.row_id as string;
      if (!byTable.has(t)) byTable.set(t, []);
      byTable.get(t)!.push(id);
    }

    const deleted: Record<string, number> = {};

    // Delete in safe order
    for (const table of DELETE_ORDER) {
      const ids = byTable.get(table);
      if (!ids?.length) continue;
      const { error } = await adminClient.from(table).delete().in("id", ids);
      if (error) throw error;
      deleted[table] = ids.length;
    }

    // Cleanup registry tables
    await adminClient.from("demo_seed_entities").delete().eq("run_id", runId);
    await adminClient
      .from("demo_seed_runs")
      .update({ status: "completed", finished_at: new Date().toISOString() })
      .eq("id", runId);

    return json({ ok: true, run_id: runId, deleted });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, 500);
  }
});
