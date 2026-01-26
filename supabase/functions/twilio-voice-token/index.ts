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

// Base64URL encode/decode helpers
function base64UrlEncode(data: Uint8Array): string {
  const b64 = btoa(String.fromCharCode(...data));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function textToBase64Url(text: string): string {
  return base64UrlEncode(new TextEncoder().encode(text));
}

// Generate Twilio Access Token using Web Crypto API (no external JWT libs)
async function generateTwilioAccessToken(
  accountSid: string,
  apiKeySid: string,
  apiKeySecret: string,
  twimlAppSid: string,
  identity: string,
  ttl: number = 3600
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    typ: 'JWT',
    alg: 'HS256',
    cty: 'twilio-fpa;v=1',
  };

  const grants: Record<string, unknown> = {
    identity,
    voice: {
      incoming: { allow: true },
      outgoing: { application_sid: twimlAppSid },
    },
  };

  const payload = {
    jti: `${apiKeySid}-${now}`,
    iss: apiKeySid,
    sub: accountSid,
    exp: now + ttl,
    grants,
  };

  const encodedHeader = textToBase64Url(JSON.stringify(header));
  const encodedPayload = textToBase64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // Sign with HMAC-SHA256
  const keyData = new TextEncoder().encode(apiKeySecret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureArrayBuffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );
  
  const signature = base64UrlEncode(new Uint8Array(signatureArrayBuffer));

  return `${signingInput}.${signature}`;
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
    if (!organizationId) return json(400, { error: 'organization_id required' });
    await assertTenantAccess(supabase, user.id, organizationId);

    // Credenciales (guardadas por tenant en secure_credentials desde Integraciones)
    const accountSid = await readTwilioCredential(supabase, organizationId, 'account_sid');
    const apiKeySid = await readTwilioCredential(supabase, organizationId, 'api_key_sid');
    const apiKeySecret = await readTwilioCredential(supabase, organizationId, 'api_key_secret');
    const twimlAppSid = await readTwilioCredential(supabase, organizationId, 'twiml_app_sid');

    if (!accountSid || !apiKeySid || !apiKeySecret || !twimlAppSid) {
      return json(503, {
        error: 'TWILIO_NOT_CONFIGURED',
        message: 'Twilio no está configurado para esta organización (Backoffice > Integraciones).',
      });
    }

    const identity = `user:${user.id}`;
    const accessToken = await generateTwilioAccessToken(
      accountSid,
      apiKeySid,
      apiKeySecret,
      twimlAppSid,
      identity,
      3600 // 1 hour TTL
    );

    return json(200, { token: accessToken, identity });
  } catch (error) {
    console.error('twilio-voice-token error:', error);
    return json(500, { error: error instanceof Error ? error.message : 'Internal error' });
  }
});
