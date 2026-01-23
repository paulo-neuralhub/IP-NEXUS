import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function toCallStatus(status?: string | null) {
  const s = (status ?? '').toLowerCase();
  // Twilio: queued, ringing, in-progress, completed, busy, failed, no-answer, canceled
  if (s === 'in-progress') return 'in_progress';
  if (s === 'no-answer') return 'no_answer';
  if (s === 'canceled') return 'canceled';
  if (s === 'ringing') return 'ringing';
  if (s === 'completed') return 'completed';
  if (s === 'busy') return 'busy';
  if (s === 'failed') return 'failed';
  return 'initiated';
}

function isE164Like(num?: string | null) {
  if (!num) return false;
  return /^\+?[0-9]{6,15}$/.test(num.replace(/[\s().-]/g, ''));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Este webhook se llamará desde Twilio. Para MVP usamos un secret de query param.
    // Recomendación futura: validar X-Twilio-Signature.
    const url = new URL(req.url);
    const organizationId = url.searchParams.get('organization_id');
    if (!organizationId) return json(400, { error: 'organization_id required' });

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const contentType = req.headers.get('content-type') || '';
    let payload: Record<string, string> = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData();
      for (const [k, v] of form.entries()) payload[k] = String(v);
    } else {
      payload = (await req.json().catch(() => ({}))) as Record<string, string>;
    }

    const callSid = payload.CallSid ?? payload.call_sid;
    if (!callSid) return json(400, { error: 'CallSid required' });

    const fromNumber = payload.From ?? payload.from;
    const toNumber = payload.To ?? payload.to;
    const direction = (payload.Direction ?? payload.direction ?? '').toLowerCase() === 'inbound' ? 'inbound' : 'outbound';
    const status = toCallStatus(payload.CallStatus ?? payload.call_status ?? payload.Status);

    // Upsert mínimo: si no existe, lo creamos; si existe, actualizamos status/timestamps.
    const nowIso = new Date().toISOString();
    const update: Record<string, unknown> = {
      status,
      updated_at: nowIso,
      call_sid: callSid,
      provider: 'twilio',
    };
    if (isE164Like(fromNumber)) update.from_number = fromNumber;
    if (isE164Like(toNumber)) update.to_number = toNumber;
    update.direction = direction;

    // timestamps (best effort)
    if (status === 'ringing') update.ringing_at = nowIso;
    if (status === 'in_progress') update.answered_at = nowIso;
    if (status === 'completed' || status === 'failed' || status === 'busy' || status === 'no_answer' || status === 'canceled') {
      update.ended_at = nowIso;
    }

    // recording callback (si llega)
    if (payload.RecordingSid) update.recording_sid = payload.RecordingSid;
    if (payload.RecordingUrl) update.recording_url = payload.RecordingUrl;

    // Insert/update
    const { data: existing, error: findErr } = await supabase
      .from('crm_voip_calls')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('call_sid', callSid)
      .maybeSingle();
    if (findErr) throw findErr;

    if (existing?.id) {
      const { error } = await supabase
        .from('crm_voip_calls')
        .update(update)
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      // Para cumplir NOT NULL de números, exigimos que al menos venga From/To.
      const fromSafe = fromNumber || 'unknown';
      const toSafe = toNumber || 'unknown';
      const { error } = await supabase.from('crm_voip_calls').insert({
        organization_id: organizationId,
        call_sid: callSid,
        from_number: fromSafe,
        to_number: toSafe,
        direction,
        status,
        metadata: payload,
        initiated_at: nowIso,
      });
      if (error) throw error;
    }

    // Respuesta compatible
    return json(200, { ok: true });
  } catch (error) {
    console.error('twilio-voice-webhook error:', error);
    return json(500, { error: error instanceof Error ? error.message : 'Internal error' });
  }
});
