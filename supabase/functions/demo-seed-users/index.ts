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
  role: "owner" | "admin" | "manager" | "member" | "viewer" | "external";
  title?: string;
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
  p: {
    id: string;
    email: string;
    full_name: string;
    preferred_language: string;
    avatar_url?: string;
    phone?: string;
    settings?: Record<string, unknown>;
  },
) {
  const { error } = await svc.from("users").upsert(
    {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      preferred_language: p.preferred_language,
      avatar_url: p.avatar_url,
      phone: p.phone,
      settings: p.settings ?? {},
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
      role: "member",
    };
  });
}

function avatarUrlFor(name: string) {
  // No secrets required; deterministic per name.
  const seed = encodeURIComponent(name.trim());
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundType=gradientLinear`;
}

function buildIpnexusDemoUsers(): Array<{
  orgSlug: DemoOrgSlug;
  users: CreateUserSpec[];
}> {
  return [
    {
      orgSlug: "demo-starter",
      users: [
        {
          email: "carlos.garcia@demo.ipnexus.com",
          full_name: "Carlos García",
          preferred_language: "es",
          role: "admin",
          title: "Admin",
        },
      ],
    },
    {
      orgSlug: "demo-professional",
      users: [
        {
          email: "ana.martinez@demo.ipnexus.com",
          full_name: "Ana Martínez",
          preferred_language: "es",
          role: "admin",
          title: "Admin",
        },
        {
          email: "pedro.sanchez@demo.ipnexus.com",
          full_name: "Pedro Sánchez",
          preferred_language: "es",
          role: "manager",
          title: "Abogado",
        },
        {
          email: "maria.lopez@demo.ipnexus.com",
          full_name: "María López",
          preferred_language: "es",
          role: "member",
          title: "Asistente",
        },
      ],
    },
    {
      orgSlug: "demo-business",
      users: [
        {
          email: "director@demo.ipnexus.com",
          full_name: "Director General",
          preferred_language: "es",
          role: "admin",
          title: "Admin",
        },
        {
          email: "socio1@demo.ipnexus.com",
          full_name: "Socio 1",
          preferred_language: "es",
          role: "manager",
          title: "Socio",
        },
        {
          email: "socio2@demo.ipnexus.com",
          full_name: "Socio 2",
          preferred_language: "es",
          role: "manager",
          title: "Socio",
        },
        ...Array.from({ length: 5 }).map((_, i) => {
          const n = i + 1;
          return {
            email: `abogado${n}@demo.ipnexus.com`,
            full_name: `Abogado ${n}`,
            preferred_language: "es",
            role: "manager" as const,
            title: "Abogado",
          };
        }),
        {
          email: "paralegal1@demo.ipnexus.com",
          full_name: "Paralegal 1",
          preferred_language: "es",
          role: "member",
          title: "Paralegal",
        },
      ],
    },
    {
      orgSlug: "demo-enterprise",
      users: [
        {
          email: "ceo@demo.ipnexus.com",
          full_name: "CEO",
          preferred_language: "en",
          role: "admin",
          title: "Admin",
        },
        {
          email: "cfo@demo.ipnexus.com",
          full_name: "CFO",
          preferred_language: "en",
          role: "viewer",
          title: "CFO",
        },
        ...Array.from({ length: 5 }).map((_, i) => {
          const n = i + 1;
          return {
            email: `socio${n}@demo.ipnexus.com`,
            full_name: `Socio ${n}`,
            preferred_language: "en",
            role: "manager" as const,
            title: "Partner",
          };
        }),
        ...Array.from({ length: 10 }).map((_, i) => {
          const n = i + 1;
          return {
            email: `abogado${n}@demo.ipnexus.com`,
            full_name: `Lawyer ${n}`,
            preferred_language: "en",
            role: "manager" as const,
            title: "Lawyer",
          };
        }),
        ...Array.from({ length: 5 }).map((_, i) => {
          const n = i + 1;
          return {
            email: `paralegal${n}@demo.ipnexus.com`,
            full_name: `Paralegal ${n}`,
            preferred_language: "en",
            role: "member" as const,
            title: "Paralegal",
          };
        }),
        ...Array.from({ length: 3 }).map((_, i) => {
          const n = i + 1;
          return {
            email: `asistente${n}@demo.ipnexus.com`,
            full_name: `Admin Assistant ${n}`,
            preferred_language: "en",
            role: "member" as const,
            title: "Assistant",
          };
        }),
      ],
    },
  ];
}

async function listAllAuthUsersByEmail(svc: any) {
  // Collect users once (the Admin API listUsers is paginated).
  const emailToUserId = new Map<string, string>();
  let page = 1;
  const perPage = 1000;
  // Safety cap.
  for (let i = 0; i < 20; i++) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users ?? [];
    for (const u of users) {
      if (u.email && u.id) emailToUserId.set(u.email.toLowerCase(), u.id);
    }
    if (users.length < perPage) break;
    page += 1;
  }
  return emailToUserId;
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

    const toCreate = buildIpnexusDemoUsers();

    // Create users in Auth + attach membership
    const created: Array<{ email: string; user_id: string; org: string }> = [];
    const skipped: Array<{ email: string; reason: string }> = [];

    // Deterministic password for demos
    const password = "Demo2026!";

    const existingEmailMap = await listAllAuthUsersByEmail(svc);

    for (const batch of toCreate) {
      const orgId = await getOrgIdBySlug(svc, batch.orgSlug);

      for (const u of batch.users) {
        const emailKey = u.email.toLowerCase();
        const avatar_url = avatarUrlFor(u.full_name);
        let userId = existingEmailMap.get(emailKey);

        if (userId) {
          skipped.push({ email: u.email, reason: "already exists" });
        } else {
          const { data: createdUser, error: createErr } = await svc.auth.admin.createUser({
            email: u.email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: u.full_name,
              avatar_url,
              title: u.title,
            },
          });
          if (createErr) throw createErr;
          userId = createdUser.user!.id;
          existingEmailMap.set(emailKey, userId);
          created.push({ email: u.email, user_id: userId, org: batch.orgSlug });
        }

        await upsertPublicUserProfile(svc, {
          id: userId!,
          email: u.email,
          full_name: u.full_name,
          preferred_language: u.preferred_language,
          avatar_url,
          settings: {
            demo: true,
            title: u.title,
          },
        });

        await ensureMembership(svc, {
          user_id: userId!,
          organization_id: orgId,
          role: u.role,
        });
      }
    }

    return json({ ok: true, created_count: created.length, created, skipped_count: skipped.length, skipped });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
});
