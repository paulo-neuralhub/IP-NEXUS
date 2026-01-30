// ============================================================
// IP-NEXUS - SEED DEMO TIME ENTRIES & SIGNATURE REQUESTS
// L108 - Datos demo completos para Time Tracking y Firma Digital
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SEED_VERSION = "2026-01-30-time-signatures-v1";

interface SeedRequest {
  organization_id?: string;
  tenant_slug?: string;
}

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

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

// Activity types for time entries
const ACTIVITY_TYPES = [
  "research",
  "drafting",
  "review",
  "meeting",
  "call",
  "correspondence",
  "filing",
  "court_work",
  "travel",
  "admin",
];

// Descriptions for time entries based on activity type
const ACTIVITY_DESCRIPTIONS: Record<string, string[]> = {
  research: [
    "Búsqueda de anterioridades en bases de datos OEPM",
    "Investigación de jurisprudencia TJUE sobre marcas",
    "Análisis de estado de la técnica para patente",
    "Búsqueda en TMView y DesignView",
    "Investigación de oposiciones similares",
    "Análisis de diseños registrados en competencia",
  ],
  drafting: [
    "Redacción de solicitud de marca",
    "Preparación de memoria descriptiva patente",
    "Elaboración de escrito de oposición",
    "Redacción de respuesta a suspenso OEPM",
    "Preparación de recurso ante EUIPO",
    "Elaboración de informe de libertad de operación",
  ],
  review: [
    "Revisión de documentación técnica del cliente",
    "Análisis de certificado de registro",
    "Revisión de contrato de licencia",
    "Estudio de informe de examen EPO",
    "Revisión de reivindicaciones patente",
    "Análisis de propuesta de transacción",
  ],
  meeting: [
    "Reunión inicial con cliente - briefing proyecto",
    "Reunión estratégica cartera PI",
    "Conferencia con inventor para patente",
    "Reunión de seguimiento trimestral",
    "Presentación resultados vigilancia",
    "Reunión de cierre de expediente",
  ],
  call: [
    "Llamada con cliente - actualización estado",
    "Conferencia telefónica con oponente",
    "Llamada a OEPM - consulta expediente",
    "Llamada con corresponsal extranjero",
    "Seguimiento telefónico decisión cliente",
    "Coordinación con abogado litigante",
  ],
  correspondence: [
    "Preparación y envío de informe al cliente",
    "Contestación a requerimiento oficina",
    "Email de seguimiento renovación",
    "Notificación de publicación marca",
    "Envío de certificado de registro",
    "Comunicación de plazo próximo",
  ],
  filing: [
    "Presentación telemática solicitud OEPM",
    "Filing solicitud marca EUIPO",
    "Presentación respuesta a oposición",
    "Envío recurso Board of Appeal",
    "Solicitud de renovación marca",
    "Presentación anualidad patente",
  ],
  court_work: [
    "Preparación audiencia previa",
    "Redacción demanda infracción marca",
    "Análisis sentencia tribunal",
    "Preparación pericial técnica",
    "Asistencia a juicio oral",
    "Revisión documentos procedimiento",
  ],
  travel: [
    "Desplazamiento a reunión cliente Madrid",
    "Viaje a vista EUIPO Alicante",
    "Desplazamiento juzgado Barcelona",
    "Visita instalaciones cliente",
    "Asistencia feria INTA",
    "Viaje formación CEIPI Estrasburgo",
  ],
  admin: [
    "Gestión administrativa expediente",
    "Actualización base de datos interna",
    "Preparación facturación mensual",
    "Organización archivo físico",
    "Coordinación interna equipo",
    "Gestión agenda y plazos",
  ],
};

// Signature document types
const SIGNATURE_DOCUMENTS = [
  { type: "power_of_attorney", name: "Poder de representación ante OEPM" },
  { type: "power_of_attorney", name: "Poder general de representación PI" },
  { type: "engagement_letter", name: "Encargo profesional servicios PI" },
  { type: "engagement_letter", name: "Hoja de encargo registro marca" },
  { type: "contract", name: "Contrato de licencia de marca" },
  { type: "contract", name: "Contrato de cesión de patente" },
  { type: "nda", name: "Acuerdo de confidencialidad" },
  { type: "declaration", name: "Declaración de uso de marca" },
  { type: "declaration", name: "Declaración de invención" },
  { type: "assignment", name: "Documento de cesión de derechos" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    console.info("seed-demo-time-signatures version", SEED_VERSION);
    
    const SUPABASE_URL = getEnv("SUPABASE_URL");
    const SUPABASE_ANON_KEY = getEnv("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

    const authHeader = req.headers.get("authorization") || "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const body = (await req.json().catch(() => ({}))) as Partial<SeedRequest>;
    let organizationId = body.organization_id;

    // Resolve by slug if provided
    if (!organizationId && body.tenant_slug) {
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: org } = await adminClient
        .from("organizations")
        .select("id")
        .eq("slug", body.tenant_slug)
        .maybeSingle();
      if (org) organizationId = org.id;
    }

    if (!organizationId) return json({ error: "organization_id or tenant_slug required" }, 400);

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check superadmin
    const { data: sa, error: saErr } = await adminClient
      .from("superadmins")
      .select("id")
      .eq("user_id", userData.user.id)
      .eq("is_active", true)
      .maybeSingle();
    if (saErr) throw saErr;
    if (!sa) return json({ error: "Forbidden - superadmin required" }, 403);

    // Verify demo organization
    const { data: org, error: orgErr } = await adminClient
      .from("organizations")
      .select("id, slug, is_demo")
      .eq("id", organizationId)
      .single();
    if (orgErr) throw orgErr;
    if (!org?.is_demo && !org?.slug?.startsWith("demo-")) {
      return json({ error: "Forbidden - demo organizations only" }, 403);
    }

    // Create run record
    const { data: run, error: runErr } = await adminClient
      .from("demo_seed_runs")
      .insert({
        organization_id: organizationId,
        created_by: userData.user.id,
        status: "running",
        seed_version: SEED_VERSION,
      })
      .select("id")
      .single();
    if (runErr) throw runErr;
    const runId = run.id as string;

    const register = async (tableName: string, rowId: string) => {
      await adminClient.from("demo_seed_entities").insert({
        run_id: runId,
        table_name: tableName,
        row_id: rowId,
      });
    };

    // Get existing matters for this org
    const { data: matters, error: mattersErr } = await adminClient
      .from("matters")
      .select("id, title, reference")
      .eq("organization_id", organizationId)
      .limit(50);
    if (mattersErr) throw mattersErr;
    
    const matterIds = matters?.map(m => m.id) || [];
    if (matterIds.length === 0) {
      return json({ error: "No matters found - run seed-demo-data first" }, 400);
    }

    // Get existing contacts for this org
    const { data: contacts, error: contactsErr } = await adminClient
      .from("contacts")
      .select("id, name, email")
      .eq("organization_id", organizationId)
      .limit(20);
    if (contactsErr) throw contactsErr;
    const contactIds = contacts?.map(c => c.id) || [];

    // Get or create billing rates
    let billingRateIds: string[] = [];
    const { data: existingRates } = await adminClient
      .from("billing_rates")
      .select("id")
      .eq("organization_id", organizationId)
      .limit(5);

    if (existingRates && existingRates.length > 0) {
      billingRateIds = existingRates.map(r => r.id);
    } else {
      // Create demo billing rates
      const rates = [
        { name: "Socio", role_name: "partner", hourly_rate: 200 },
        { name: "Asociado Senior", role_name: "senior_associate", hourly_rate: 150 },
        { name: "Asociado Junior", role_name: "associate", hourly_rate: 100 },
        { name: "Paralegal", role_name: "paralegal", hourly_rate: 60 },
        { name: "Administrativo", role_name: "admin", hourly_rate: 45 },
      ];
      
      for (const rate of rates) {
        const { data: rateData, error: rateErr } = await adminClient
          .from("billing_rates")
          .insert({
            organization_id: organizationId,
            rate_type: "standard",
            name: rate.name,
            role_name: rate.role_name,
            hourly_rate: rate.hourly_rate,
            currency: "EUR",
            is_active: true,
          })
          .select("id")
          .single();
        if (!rateErr && rateData) {
          billingRateIds.push(rateData.id);
          await register("billing_rates", rateData.id);
        }
      }
    }

    // ============================================================
    // SEED TIME ENTRIES (400+)
    // Últimos 6 meses de actividad
    // ============================================================
    console.info("Seeding time entries...");
    let timeEntriesCreated = 0;
    const billingStatuses = ["unbilled", "billed", "paid", "write_off"];

    // Generate entries for last 180 days (6 months)
    for (let dayOffset = 0; dayOffset < 180; dayOffset++) {
      // Skip some weekends (but not all, to show weekend work occasionally)
      const date = daysAgo(dayOffset);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || (dayOfWeek === 6 && Math.random() > 0.3)) continue;

      // 2-5 entries per working day
      const entriesPerDay = 2 + Math.floor(Math.random() * 4);
      
      for (let e = 0; e < entriesPerDay; e++) {
        const activityType = pick(ACTIVITY_TYPES);
        const descriptions = ACTIVITY_DESCRIPTIONS[activityType] || ["Trabajo demo"];
        const description = pick(descriptions);
        
        // Duration: 15 min to 4 hours, in 15-min increments
        const duration = (1 + Math.floor(Math.random() * 16)) * 15;
        
        // Start time between 8:00 and 17:00
        const startHour = 8 + Math.floor(Math.random() * 9);
        const startMinute = Math.floor(Math.random() * 4) * 15;
        
        const endMinutes = startHour * 60 + startMinute + duration;
        const endHour = Math.floor(endMinutes / 60);
        const endMinute = endMinutes % 60;
        
        const matterId = pick(matterIds);
        const billingRateId = billingRateIds.length > 0 ? pick(billingRateIds) : null;
        
        // Older entries more likely to be billed/paid
        const isBillable = Math.random() > 0.15;
        let billingStatus = "unbilled";
        if (dayOffset > 60) billingStatus = pick(["unbilled", "billed", "billed", "paid"]);
        if (dayOffset > 120) billingStatus = pick(["billed", "paid", "paid"]);
        
        // Calculate billing amount
        const hourlyRate = [200, 150, 100, 60, 45][Math.floor(Math.random() * 5)];
        const billingAmount = isBillable ? (duration / 60) * hourlyRate : 0;

        try {
          const { data: entry, error: entryErr } = await adminClient
            .from("time_entries")
            .insert({
              organization_id: organizationId,
              matter_id: matterId,
              user_id: userData.user.id,
              date: formatDate(date),
              duration_minutes: duration,
              start_time: formatTime(startHour, startMinute),
              end_time: formatTime(Math.min(endHour, 23), endMinute),
              description,
              activity_type: activityType,
              is_billable: isBillable,
              billing_rate_id: billingRateId,
              billing_rate: hourlyRate,
              billing_amount: billingAmount,
              currency: "EUR",
              billing_status: isBillable ? billingStatus : "not_applicable",
              timer_running: false,
            })
            .select("id")
            .single();
          
          if (!entryErr && entry) {
            await register("time_entries", entry.id);
            timeEntriesCreated++;
          }
        } catch (err) {
          console.warn("time_entry insert error:", err);
        }
      }
    }
    console.info(`Created ${timeEntriesCreated} time entries`);

    // ============================================================
    // SEED SIGNATURE REQUESTS (10+)
    // ============================================================
    console.info("Seeding signature requests...");
    let signaturesCreated = 0;

    const signatureStatuses = ["draft", "sent", "in_progress", "completed", "declined", "expired"];

    for (let i = 0; i < 12; i++) {
      const docType = pick(SIGNATURE_DOCUMENTS);
      const matterId = pick(matterIds);
      const contactId = contactIds.length > 0 ? pick(contactIds) : null;
      const contact = contacts?.find(c => c.id === contactId);
      
      const status = pick(signatureStatuses);
      const createdDate = daysAgo(Math.floor(Math.random() * 180));
      const sentDate = status !== "draft" ? new Date(createdDate.getTime() + 24 * 60 * 60 * 1000) : null;
      const completedDate = status === "completed" ? new Date(createdDate.getTime() + 3 * 24 * 60 * 60 * 1000) : null;
      const expiresDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Signers array
      const signers = [
        {
          name: contact?.name || `Firmante ${i + 1}`,
          email: contact?.email || `signer-${i + 1}@demo.ip-nexus.local`,
          role: "signer",
          order: 1,
          status: status === "completed" ? "signed" : status === "declined" ? "declined" : "pending",
          signed_at: status === "completed" ? completedDate?.toISOString() : null,
        }
      ];

      // Add second signer for some documents
      if (Math.random() > 0.5) {
        signers.push({
          name: "Responsable Despacho",
          email: "firma@garcia-ip.demo",
          role: "signer",
          order: 2,
          status: status === "completed" ? "signed" : "pending",
          signed_at: status === "completed" ? completedDate?.toISOString() : null,
        });
      }

      try {
        const { data: sig, error: sigErr } = await adminClient
          .from("signature_requests")
          .insert({
            organization_id: organizationId,
            matter_id: matterId,
            provider: "manual",
            document_name: docType.name,
            document_url: `/demo/documents/${docType.type}_${i + 1}.pdf`,
            signers,
            status,
            sent_at: sentDate?.toISOString(),
            completed_at: completedDate?.toISOString(),
            expires_at: expiresDate.toISOString(),
            signed_document_url: status === "completed" ? `/demo/documents/${docType.type}_${i + 1}_signed.pdf` : null,
            created_by: userData.user.id,
          })
          .select("id")
          .single();

        if (!sigErr && sig) {
          await register("signature_requests", sig.id);
          signaturesCreated++;
        }
      } catch (err) {
        console.warn("signature_request insert error:", err);
      }
    }
    console.info(`Created ${signaturesCreated} signature requests`);

    // Mark run complete
    await adminClient
      .from("demo_seed_runs")
      .update({ status: "completed", finished_at: new Date().toISOString() })
      .eq("id", runId);

    return json({
      ok: true,
      run_id: runId,
      seeded: {
        time_entries: timeEntriesCreated,
        signature_requests: signaturesCreated,
        billing_rates: billingRateIds.length,
      },
    });

  } catch (e) {
    console.error("seed-demo-time-signatures error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, 500);
  }
});
