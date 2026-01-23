import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import twilio from 'https://esm.sh/twilio@4.23.0';

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

function getEncryptionKeyBytes(): Uint8Array | null {
  const raw = Deno.env.get('ENCRYPTION_KEY');
  if (!raw) return null;

  const isHex = /^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0;
  if (isHex) {
    const bytes = new Uint8Array(raw.length / 2);
    for (let i = 0; i < raw.length; i += 2) bytes[i / 2] = parseInt(raw.slice(i, i + 2), 16);
    return bytes;
  }

  try {
    const bin = atob(raw);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

function b64ToBytes(input: string): Uint8Array {
  const bin = atob(input);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(view.byteLength);
  new Uint8Array(ab).set(view);
  return ab;
}

async function aesGcmDecrypt(payload: string, keyBytes: Uint8Array): Promise<string> {
  const [v, ivB64, ctB64] = payload.split(':');
  if (v !== 'v1' || !ivB64 || !ctB64) throw new Error('Invalid payload');
  const iv = b64ToBytes(ivB64);
  const ct = b64ToBytes(ctB64);
  const key = await crypto.subtle.importKey('raw', toArrayBuffer(keyBytes), { name: 'AES-GCM' }, false, ['decrypt']);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, key, toArrayBuffer(ct));
  return new TextDecoder().decode(pt);
}

function isE164Like(num?: string | null) {
  if (!num) return false;
  return /^\+?[0-9]{6,15}$/.test(num.replace(/[\s().-]/g, ''));
}

async function assertTenantAccess(supabase: any, userId: string, organizationId: string) {
  const { data, error } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('not authorized');
}

async function readTwilioCredential(supabase: any, organizationId: string, key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('secure_credentials')
    .select('encrypted_value')
    .eq('owner_type', 'tenant')
    .eq('organization_id', organizationId)
    .eq('provider', 'twilio')
    .eq('credential_key', key)
    .maybeSingle();
  if (error) throw error;
  if (!data?.encrypted_value) return null;

  const keyBytes = getEncryptionKeyBytes();
  if (!keyBytes || keyBytes.length !== 32) return null;
  return await aesGcmDecrypt(data.encrypted_value, keyBytes);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json(401, { error: 'No authorization header' });

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) return json(401, { error: 'Unauthorized' });

    const body = await req.json().catch(() => ({}));
    const organizationId = (body.organization_id as string | undefined) ?? (body.organizationId as string | undefined);
    const callSid = (body.callSid as string | undefined) ?? (body.call_sid as string | undefined);
    const targetNumber = (body.targetNumber as string | undefined) ?? (body.target_number as string | undefined);

    if (!organizationId) return json(400, { error: 'organization_id required' });
    if (!callSid) return json(400, { error: 'callSid required' });
    if (!targetNumber || !isE164Like(targetNumber)) return json(400, { error: 'targetNumber invalid (E.164)' });

    await assertTenantAccess(supabase, user.id, organizationId);

    const accountSid = await readTwilioCredential(supabase, organizationId, 'account_sid');
    const apiKeySid = await readTwilioCredential(supabase, organizationId, 'api_key_sid');
    const apiKeySecret = await readTwilioCredential(supabase, organizationId, 'api_key_secret');

    if (!accountSid || !apiKeySid || !apiKeySecret) {
      return json(503, {
        error: 'TWILIO_NOT_CONFIGURED',
        message: 'Twilio no está configurado para esta organización.',
      });
    }

    const client = (twilio as any)(apiKeySid, apiKeySecret, { accountSid });

    // MVP: redirect the call to a new <Dial>.
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Dial><Number>${targetNumber}</Number></Dial></Response>`;

    await client.calls(callSid).update({ twiml });

    return json(200, { ok: true });
  } catch (error) {
    console.error('twilio-transfer-call error:', error);
    return json(500, { error: error instanceof Error ? error.message : 'Internal error' });
  }
});
