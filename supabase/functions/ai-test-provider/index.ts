import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

function normalizeCode(code: string) {
  return (code || "").trim().toLowerCase();
}

type Provider = {
  id: string;
  name: string;
  code: string;
  api_key_encrypted: string | null;
  base_url: string | null;
};

async function testProviderConnectivity(p: Provider): Promise<{ ok: boolean; detail: string }>{
  const code = normalizeCode(p.code);
  const apiKey = p.api_key_encrypted || "";
  if (!apiKey) return { ok: false, detail: "Provider sin API key" };

  // Best-effort: hit a cheap, read-only endpoint per provider.
  try {
    if (code === "openai") {
      const r = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!r.ok) return { ok: false, detail: `OpenAI /models: ${r.status}` };
      return { ok: true, detail: "OpenAI OK" };
    }

    if (code === "anthropic" || code === "claude") {
      const r = await fetch("https://api.anthropic.com/v1/models", {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
      });
      if (!r.ok) return { ok: false, detail: `Anthropic /models: ${r.status}` };
      return { ok: true, detail: "Anthropic OK" };
    }

    if (code === "gemini" || code === "google") {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      );
      if (!r.ok) return { ok: false, detail: `Gemini list models: ${r.status}` };
      return { ok: true, detail: "Gemini OK" };
    }

    if (code === "mistral") {
      const r = await fetch("https://api.mistral.ai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!r.ok) return { ok: false, detail: `Mistral /models: ${r.status}` };
      return { ok: true, detail: "Mistral OK" };
    }

    // Generic: try base_url + /models with Bearer.
    const base = (p.base_url || "").trim().replace(/\/+$/, "");
    if (!base) return { ok: false, detail: "Provider sin base_url y sin tester específico" };

    const r = await fetch(`${base}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!r.ok) return { ok: false, detail: `Generic /models: ${r.status}` };
    return { ok: true, detail: "Conexión OK (genérica)" };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "Error desconocido" };
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

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const { provider_id } = (await req.json().catch(() => ({}))) as {
      provider_id?: string;
    };
    if (!provider_id) return json({ error: "provider_id is required" }, 400);

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: sa, error: saErr } = await adminClient
      .from("superadmins")
      .select("id")
      .eq("user_id", userData.user.id)
      .eq("is_active", true)
      .maybeSingle();
    if (saErr) throw saErr;
    if (!sa) return json({ error: "Forbidden" }, 403);

    const { data: provider, error: pErr } = await adminClient
      .from("ai_providers")
      .select("id,name,code,api_key_encrypted,base_url")
      .eq("id", provider_id)
      .single();
    if (pErr) throw pErr;

    const result = await testProviderConnectivity(provider as Provider);
    return json({ provider_id, provider_code: (provider as Provider).code, ...result });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
