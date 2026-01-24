import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

type DemoOrgSlug = "demo-starter" | "demo-professional" | "demo-business" | "demo-enterprise";
const BUCKET = "demo-documents";

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

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
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

function tinyPngBytes(): Uint8Array {
  // 1x1 transparent PNG
  const b64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/VIqvlsAAAAASUVORK5CYII=";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function simplePdfBytes(title: string): Uint8Array {
  // Minimal PDF with one text line. Good enough for placeholders.
  const safe = title.replace(/[()\\]/g, " ").slice(0, 80);
  const content = `%PDF-1.4\n` +
    `1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n` +
    `2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n` +
    `3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n` +
    `4 0 obj<< /Length 68 >>stream\n` +
    `BT /F1 18 Tf 72 720 Td (${safe}) Tj ET\n` +
    `endstream endobj\n` +
    `5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n` +
    `xref\n0 6\n0000000000 65535 f \n` +
    `0000000010 00000 n \n` +
    `0000000062 00000 n \n` +
    `0000000117 00000 n \n` +
    `0000000246 00000 n \n` +
    `0000000362 00000 n \n` +
    `trailer<< /Size 6 /Root 1 0 R >>\nstartxref\n450\n%%EOF\n`;
  return new TextEncoder().encode(content);
}

function makePath(orgSlug: string, matterId: string, folder: string, fileName: string) {
  // Required folder structure:
  // /expediente/{matterId}/{solicitud|oficina|cliente|interno}/...
  return `${orgSlug}/expediente/${matterId}/${folder}/${fileName}`;
}

type MatterRow = { id: string; status: string | null; reference: string | null; title: string | null };

function isRegisteredStatus(status: string | null) {
  return ["registered", "renewed", "granted"].includes(String(status));
}

function isInProgressStatus(status: string | null) {
  return [
    "filed",
    "pending_examination",
    "published",
    "opposition_period",
    "under_opposition",
  ].includes(String(status));
}

async function uploadObject(params: {
  svc: any;
  path: string;
  bytes: Uint8Array;
  contentType: string;
}) {
  const { svc, path, bytes, contentType } = params;
  const { error } = await svc.storage.from(BUCKET).upload(path, bytes, {
    upsert: true,
    contentType,
  });
  if (error) throw error;
}

async function insertMatterDocument(params: {
  svc: any;
  runId: string;
  organizationId: string;
  matterId: string;
  createdBy: string;
  name: string;
  filePath: string;
  mime: string;
  bytesLen: number;
  category: string;
  description: string;
  isOfficial?: boolean;
}) {
  const { svc, runId, organizationId, matterId, createdBy, name, filePath, mime, bytesLen, category, description, isOfficial } =
    params;

  const { data, error } = await svc
    .from("matter_documents")
    .insert({
      organization_id: organizationId,
      matter_id: matterId,
      name,
      file_path: filePath,
      file_size: bytesLen,
      mime_type: mime,
      category,
      uploaded_by: createdBy,
      description,
      is_official: isOfficial ?? false,
      document_date: isoDate(daysAgo(5 + Math.floor(Math.random() * 365))),
      expiry_date: null,
    })
    .select("id")
    .single();
  if (error) throw error;
  await registerEntity(svc, runId, "matter_documents", data.id);
}

async function seedDocsForOrg(params: {
  svc: any;
  organizationId: string;
  runId: string;
  createdBy: string;
  orgSlug: DemoOrgSlug;
  targetCount: number;
}) {
  const { svc, organizationId, runId, createdBy, orgSlug, targetCount } = params;

  const { data: matters, error: matErr } = await svc
    .from("matters")
    .select("id, status, reference, title")
    .eq("organization_id", organizationId)
    .limit(2000);
  if (matErr) throw matErr;
  const matterRows = shuffle((matters ?? []) as MatterRow[]);
  if (!matterRows.length) throw new Error("No matters found (seed matters first)");

  const docSpecsRegistered = [
    { folder: "solicitud", name: "solicitud_original.pdf", mime: "application/pdf", kind: "pdf", category: "solicitud", isOfficial: false },
    { folder: "oficina", name: "certificado_registro.pdf", mime: "application/pdf", kind: "pdf", category: "oficina", isOfficial: true },
    { folder: "interno", name: "logo_marca.png", mime: "image/png", kind: "png", category: "interno", isOfficial: false },
  ] as const;

  const docSpecsInProgress = [
    { folder: "oficina", name: "acuse_recibo.pdf", mime: "application/pdf", kind: "pdf", category: "oficina", isOfficial: true },
    { folder: "oficina", name: "requerimiento_oficial.pdf", mime: "application/pdf", kind: "pdf", category: "oficina", isOfficial: true },
    { folder: "solicitud", name: "respuesta_presentada.pdf", mime: "application/pdf", kind: "pdf", category: "solicitud", isOfficial: false },
    { folder: "oficina", name: "publicacion_boe_bopi.pdf", mime: "application/pdf", kind: "pdf", category: "oficina", isOfficial: true },
  ] as const;

  const clientDocs = [
    { folder: "cliente", name: "poder_representacion.pdf", mime: "application/pdf", kind: "pdf", category: "cliente" },
    { folder: "cliente", name: "contrato_servicios.pdf", mime: "application/pdf", kind: "pdf", category: "cliente" },
    { folder: "cliente", name: "dni_cif_placeholder.pdf", mime: "application/pdf", kind: "pdf", category: "cliente" },
  ] as const;

  let created = 0;

  for (const m of matterRows) {
    if (created >= targetCount) break;

    const baseTitle = `${m.reference ?? m.id.slice(0, 8)} — ${m.title ?? "Expediente"}`;
    const specs = isRegisteredStatus(m.status)
      ? docSpecsRegistered
      : isInProgressStatus(m.status)
        ? docSpecsInProgress
        : // other statuses: keep only a light set
          ([docSpecsRegistered[0]] as const);

    for (const spec of specs) {
      if (created >= targetCount) break;

      const path = makePath(orgSlug, m.id, spec.folder, spec.name);
      const bytes =
        spec.kind === "png" ? tinyPngBytes() : simplePdfBytes(`(DEMO) ${spec.name} | ${baseTitle}`);

      await uploadObject({ svc, path, bytes, contentType: spec.mime });

      await insertMatterDocument({
        svc,
        runId,
        organizationId,
        matterId: m.id,
        createdBy,
        name: spec.name,
        filePath: path,
        mime: spec.mime,
        bytesLen: bytes.byteLength,
        category: spec.category,
        description: `(DEMO) ${spec.name} para expediente ${baseTitle}.`,
        isOfficial: "isOfficial" in spec ? spec.isOfficial : false,
      });
      created++;
    }

    // Add client docs for a subset of matters
    if (created < targetCount && Math.random() < 0.25) {
      for (const c of clientDocs) {
        if (created >= targetCount) break;
        const path = makePath(orgSlug, m.id, c.folder, c.name);
        const bytes = simplePdfBytes(`(DEMO) ${c.name} | ${baseTitle}`);
        await uploadObject({ svc, path, bytes, contentType: c.mime });
        await insertMatterDocument({
          svc,
          runId,
          organizationId,
          matterId: m.id,
          createdBy,
          name: c.name,
          filePath: path,
          mime: c.mime,
          bytesLen: bytes.byteLength,
          category: c.category,
          description: `(DEMO) Documento de cliente (${c.name}) para expediente ${baseTitle}.`,
          isOfficial: false,
        });
        created++;
      }
    }
  }

  return created;
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

    const targets: DemoOrgSlug[] = ["demo-starter", "demo-professional", "demo-business", "demo-enterprise"];
    const targetTotal = 500;
    const perOrg = Math.ceil(targetTotal / targets.length);
    const results: Array<{ slug: DemoOrgSlug; run_id: string; documents: number }> = [];

    for (const slug of targets) {
      const orgId = await getOrgIdBySlug(svc, slug);
      const runId = await createRun(svc, orgId, callerId, "documents-structure-v1");
      const docs = await seedDocsForOrg({
        svc,
        organizationId: orgId,
        runId,
        createdBy: callerId,
        orgSlug: slug,
        targetCount: perOrg,
      });
      await completeRun(svc, runId);
      results.push({ slug, run_id: runId, documents: docs });
    }

    return json({ ok: true, bucket: BUCKET, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
});
