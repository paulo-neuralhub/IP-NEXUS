// Admin-only demo seeding: creates Auth users + public.users + memberships for demo orgs.
// Requires SUPABASE_SERVICE_ROLE_KEY secret.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type DemoOrgSlug =
  | "demo-starter"
  | "demo-professional"
  | "demo-business"
  | "demo-enterprise"
  | "demo-standalone";

type CreateUserSpec = {
  email: string;
  full_name: string;
  preferred_language: string;
};

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
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

// Use loose typing in Edge Functions to avoid schema generic mismatches
// (the runtime client works fine without strict TS schema typing here).
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
  const { data, error } = await svc
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data.id as string;
}

async function upsertPublicUserProfile(
  svc: any,
  p: { id: string; email: string; full_name: string; preferred_language: string },
) {
  const { error } = await svc.from("users").upsert(
    {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      preferred_language: p.preferred_language,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

async function ensureMembership(
  svc: any,
  params: { user_id: string; organization_id: string; role: string },
) {
  const { error } = await svc.from("memberships").upsert(
    {
      user_id: params.user_id,
      organization_id: params.organization_id,
      role: params.role,
      permissions: {},
    },
    { onConflict: "user_id,organization_id" },
  );
  if (error) throw error;
}

function buildUserList(prefix: string, count: number, language: string): CreateUserSpec[] {
  return Array.from({ length: count }).map((_, i) => {
    const n = i + 1;
    return {
      email: `demo+${prefix}${n}@ipnexus.dev`,
      full_name: `Demo ${prefix.toUpperCase()} ${n}`,
      preferred_language: language,
    };
  });
}

Deno.serve(async (req) => {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!url || !anonKey || !serviceKey) {
      return json(
        { error: "Missing SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 },
      );
    }

    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    const token = getBearerToken(req);
    if (!token) return json({ error: "Unauthorized" }, { status: 401 });

    // Validate caller
    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: authData, error: authErr } = await userClient.auth.getUser();
    if (authErr) return json({ error: authErr.message }, { status: 401 });
    const callerId = authData.user?.id;
    if (!callerId) return json({ error: "Unauthorized" }, { status: 401 });

    const svc = createClient(url, serviceKey);
    await assertIsSuperadmin(svc, callerId);

    // Resolve org IDs
    const orgIds = {
      starter: await getOrgIdBySlug(svc, "demo-starter"),
      professional: await getOrgIdBySlug(svc, "demo-professional"),
      business: await getOrgIdBySlug(svc, "demo-business"),
      enterprise: await getOrgIdBySlug(svc, "demo-enterprise"),
      standalone: await getOrgIdBySlug(svc, "demo-standalone"),
    };

    // Desired totals (including the existing owner already attached)
    // starter: 1 (already)
    // professional: 3 -> create 2
    // business: 8 -> create 7
    // enterprise: 25 -> create 24
    const toCreate: Array<{ orgKey: keyof typeof orgIds; role: string; users: CreateUserSpec[] }> = [
      {
        orgKey: "professional",
        role: "member",
        users: buildUserList("pro", 2, "es"),
      },
      {
        orgKey: "business",
        role: "member",
        users: buildUserList("biz", 7, "es"),
      },
      {
        orgKey: "enterprise",
        role: "member",
        users: buildUserList("ent", 24, "en"),
      },
    ];

    // Create users in Auth + attach membership
    const created: Array<{ email: string; user_id: string; org: string }> = [];
    const skipped: Array<{ email: string; reason: string }> = [];

    // NOTE: deterministic password for demos; change anytime.
    const password = "Demo12345!";

    for (const batch of toCreate) {
      const orgId = orgIds[batch.orgKey];
      for (const u of batch.users) {
        // Create or fetch existing auth user by email
        const { data: existing, error: findErr } = await svc.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        if (findErr) throw findErr;

        const already = existing.users.find((x) => x.email?.toLowerCase() === u.email.toLowerCase());
        let userId: string;

        if (already?.id) {
          userId = already.id;
          skipped.push({ email: u.email, reason: "already exists" });
        } else {
          const { data: createdUser, error: createErr } = await svc.auth.admin.createUser({
            email: u.email,
            password,
            email_confirm: true,
            user_metadata: { full_name: u.full_name },
          });
          if (createErr) throw createErr;
          userId = createdUser.user!.id;
          created.push({ email: u.email, user_id: userId, org: batch.orgKey });
        }

        await upsertPublicUserProfile(svc, {
          id: userId,
          email: u.email,
          full_name: u.full_name,
          preferred_language: u.preferred_language,
        });
        await ensureMembership(svc, { user_id: userId, organization_id: orgId, role: batch.role });
      }
    }

    return json({ ok: true, created_count: created.length, created, skipped_count: skipped.length, skipped });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
});
