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

type RemoteModel = {
  model_id: string;
  name: string;
  context_window?: number | null;
  max_output_tokens?: number | null;
  capabilities: Record<string, boolean>;
  // USD per 1M tokens (best-effort; null if unknown)
  input_cost_per_1m?: number | null;
  output_cost_per_1m?: number | null;
};

function inferCapabilities(modelId: string): Record<string, boolean> {
  const id = modelId.toLowerCase();
  const caps: Record<string, boolean> = { text: true };
  if (id.includes("vision") || id.includes("image") || id.includes("multimodal")) caps.vision = true;
  if (id.includes("audio") || id.includes("voice") || id.includes("tts") || id.includes("stt")) caps.voice = true;
  if (id.includes("video")) caps.video = true;
  if (id.includes("tool") || id.includes("function") || id.includes("tools")) caps.tools = true;
  if (id.includes("code") || id.includes("coder")) caps.code = true;
  if (id.includes("reason") || id.includes("thinking") || id.includes("o1") || id.includes("r1")) caps.reasoning = true;
  return caps;
}

// Best-effort static pricing hints for popular families.
// Many providers do not expose prices via API; keep null when unknown.
function inferPricing(providerCode: string, modelId: string): { in1m: number | null; out1m: number | null } {
  const p = normalizeCode(providerCode);
  const id = modelId.toLowerCase();

  // OpenAI public prices change; keep conservative null unless we are confident.
  if (p === "openai") {
    if (id.includes("gpt-4o-mini")) return { in1m: 0.15, out1m: 0.60 };
    if (id.includes("gpt-4o")) return { in1m: 5.0, out1m: 15.0 };
    return { in1m: null, out1m: null };
  }

  if (p === "anthropic" || p === "claude") {
    if (id.includes("haiku")) return { in1m: 0.25, out1m: 1.25 };
    if (id.includes("sonnet")) return { in1m: 3.0, out1m: 15.0 };
    if (id.includes("opus")) return { in1m: 15.0, out1m: 75.0 };
    return { in1m: null, out1m: null };
  }

  if (p === "mistral") {
    // Not reliable across tiers.
    return { in1m: null, out1m: null };
  }

  if (p === "gemini" || p === "google") {
    return { in1m: null, out1m: null };
  }

  return { in1m: null, out1m: null };
}

async function listModelsOpenAI(apiKey: string): Promise<RemoteModel[]> {
  const r = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!r.ok) throw new Error(`OpenAI /models failed (${r.status})`);
  const j = await r.json();
  const data = Array.isArray(j?.data) ? j.data : [];

  return data
    .map((m: any) => {
      const modelId = String(m?.id || "");
      const { in1m, out1m } = inferPricing("openai", modelId);
      return {
        model_id: modelId,
        name: modelId,
        capabilities: inferCapabilities(modelId),
        context_window: null,
        max_output_tokens: null,
        input_cost_per_1m: in1m,
        output_cost_per_1m: out1m,
      } satisfies RemoteModel;
    })
    .filter((m: RemoteModel) => !!m.model_id);
}

async function listModelsAnthropic(apiKey: string): Promise<RemoteModel[]> {
  const r = await fetch("https://api.anthropic.com/v1/models", {
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
  });
  if (!r.ok) throw new Error(`Anthropic /models failed (${r.status})`);
  const j = await r.json();
  const data = Array.isArray(j?.data) ? j.data : [];

  return data
    .map((m: any) => {
      const modelId = String(m?.id || "");
      const displayName = String(m?.display_name || modelId);
      const { in1m, out1m } = inferPricing("anthropic", modelId);
      return {
        model_id: modelId,
        name: displayName,
        capabilities: inferCapabilities(modelId),
        context_window: null,
        max_output_tokens: null,
        input_cost_per_1m: in1m,
        output_cost_per_1m: out1m,
      } satisfies RemoteModel;
    })
    .filter((m: RemoteModel) => !!m.model_id);
}

async function listModelsGemini(apiKey: string): Promise<RemoteModel[]> {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
  );
  if (!r.ok) throw new Error(`Gemini list models failed (${r.status})`);
  const j = await r.json();
  const models = Array.isArray(j?.models) ? j.models : [];

  return models
    .map((m: any) => {
      const name = String(m?.displayName || m?.name || "");
      const modelId = String(m?.name || "");
      // Gemini returns name like "models/gemini-1.5-pro".
      const normalizedId = modelId.startsWith("models/") ? modelId.slice(7) : modelId;
      const caps = inferCapabilities(normalizedId);
      // Heuristic: most Gemini models support tools; keep true if function calling is supported.
      // The API exposes supportedGenerationMethods but not always function calling clearly.
      if (Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent")) {
        caps.text = true;
      }
      return {
        model_id: normalizedId,
        name: name || normalizedId,
        capabilities: caps,
        context_window: null,
        max_output_tokens: null,
        input_cost_per_1m: null,
        output_cost_per_1m: null,
      } satisfies RemoteModel;
    })
    .filter((m: RemoteModel) => !!m.model_id);
}

async function listModelsMistral(apiKey: string): Promise<RemoteModel[]> {
  const r = await fetch("https://api.mistral.ai/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!r.ok) throw new Error(`Mistral /models failed (${r.status})`);
  const j = await r.json();
  const data = Array.isArray(j?.data) ? j.data : [];
  return data
    .map((m: any) => {
      const modelId = String(m?.id || "");
      return {
        model_id: modelId,
        name: String(m?.name || modelId),
        capabilities: inferCapabilities(modelId),
        context_window: null,
        max_output_tokens: null,
        input_cost_per_1m: null,
        output_cost_per_1m: null,
      } satisfies RemoteModel;
    })
    .filter((m: RemoteModel) => !!m.model_id);
}

async function listModelsGeneric(p: Provider): Promise<RemoteModel[]> {
  const base = (p.base_url || "").trim().replace(/\/+$/, "");
  const apiKey = p.api_key_encrypted || "";
  if (!base) throw new Error("Provider sin base_url (y sin handler específico)");
  if (!apiKey) throw new Error("Provider sin API key");

  const r = await fetch(`${base}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!r.ok) throw new Error(`Generic /models failed (${r.status})`);
  const j = await r.json();
  const data = Array.isArray(j?.data) ? j.data : [];

  return data
    .map((m: any) => {
      const modelId = String(m?.id || m?.model || "");
      const { in1m, out1m } = inferPricing(p.code, modelId);
      return {
        model_id: modelId,
        name: String(m?.name || modelId),
        capabilities: inferCapabilities(modelId),
        context_window: null,
        max_output_tokens: null,
        input_cost_per_1m: in1m,
        output_cost_per_1m: out1m,
      } satisfies RemoteModel;
    })
    .filter((m: RemoteModel) => !!m.model_id);
}

async function listModelsForProvider(p: Provider): Promise<RemoteModel[]> {
  const code = normalizeCode(p.code);
  const apiKey = p.api_key_encrypted || "";
  if (!apiKey) throw new Error("Provider sin API key");

  if (code === "openai") return await listModelsOpenAI(apiKey);
  if (code === "anthropic" || code === "claude") return await listModelsAnthropic(apiKey);
  if (code === "gemini" || code === "google") return await listModelsGemini(apiKey);
  if (code === "mistral") return await listModelsMistral(apiKey);

  return await listModelsGeneric(p);
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

    const p = provider as Provider;
    const remoteModels = await listModelsForProvider(p);

    // Load existing models for provider
    const { data: existing, error: exErr } = await adminClient
      .from("ai_models")
      .select("id, model_id")
      .eq("provider_id", provider_id);
    if (exErr) throw exErr;
    const existingByModelId = new Map<string, { id: string }>();
    for (const row of (existing || []) as any[]) {
      if (row?.model_id) existingByModelId.set(String(row.model_id), { id: String(row.id) });
    }

    const nowIso = new Date().toISOString();

    const inserts: any[] = [];
    const updates: any[] = [];

    for (const m of remoteModels) {
      const payload = {
        provider_id,
        model_id: m.model_id,
        name: m.name,
        capabilities: m.capabilities,
        context_window: m.context_window ?? null,
        max_output_tokens: m.max_output_tokens ?? null,
        input_cost_per_1m: m.input_cost_per_1m ?? null,
        output_cost_per_1m: m.output_cost_per_1m ?? null,
        // keep existing activation if present; default true for new
        is_active: true,
        tier: "standard",
        speed_rating: 3,
        quality_rating: 3,
        discovered_at: nowIso,
        updated_at: nowIso,
      };

      const ex = existingByModelId.get(m.model_id);
      if (!ex) {
        inserts.push(payload);
      } else {
        // do not force is_active to true on updates; preserve DB value.
        delete (payload as any).is_active;
        updates.push({ ...payload, id: ex.id });
      }
    }

    // Batch insert
    let inserted = 0;
    let updated = 0;

    if (inserts.length) {
      const { error: insErr } = await adminClient.from("ai_models").insert(inserts);
      if (insErr) throw insErr;
      inserted = inserts.length;
    }

    // Batch update (best-effort; if API complains, fall back to per-row updates)
    if (updates.length) {
      // Supabase doesn't support bulk update with different values in a single request.
      // Do small sequential updates to keep correctness.
      for (const u of updates) {
        const { id, ...rest } = u;
        const { error: upErr } = await adminClient.from("ai_models").update(rest).eq("id", id);
        if (upErr) throw upErr;
        updated += 1;
      }
    }

    return json({
      provider_id,
      provider_code: p.code,
      inserted,
      updated,
      total_remote: remoteModels.length,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
