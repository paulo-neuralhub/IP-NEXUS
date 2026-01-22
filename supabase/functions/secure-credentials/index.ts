// ============================================
// SECURE CREDENTIALS
// Stores encrypted credentials per tenant (org)
// Encryption happens here using ENCRYPTION_KEY.
// DB table public.secure_credentials is NOT readable by clients.
// ============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

type Provider = 'smtp' | 'whatsapp' | 'calendar' | string;
type Action = 'status' | 'upsert' | 'delete';

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getEncryptionKeyBytes(): Uint8Array | null {
  const raw = Deno.env.get('ENCRYPTION_KEY');
  if (!raw) return null;

  // Accept: 64-hex chars (32 bytes) OR base64-encoded 32 bytes.
  const isHex = /^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0;
  if (isHex) {
    const bytes = new Uint8Array(raw.length / 2);
    for (let i = 0; i < raw.length; i += 2) {
      bytes[i / 2] = parseInt(raw.slice(i, i + 2), 16);
    }
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

function b64(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function b64ToBytes(input: string): Uint8Array {
  const bin = atob(input);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  // Copy into a fresh ArrayBuffer to avoid TS issues with ArrayBufferLike/SharedArrayBuffer.
  const ab = new ArrayBuffer(view.byteLength);
  new Uint8Array(ab).set(view);
  return ab;
}

async function aesGcmEncrypt(plaintext: string, keyBytes: Uint8Array): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey('raw', toArrayBuffer(keyBytes), { name: 'AES-GCM' }, false, ['encrypt']);
  const encoded = new TextEncoder().encode(plaintext);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, key, toArrayBuffer(encoded)));
  // Format: v1:<iv_b64>:<ct_b64>
  return `v1:${b64(iv)}:${b64(ct)}`;
}

// (Optional future use)
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json(401, { error: 'No authorization header' });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json(401, { error: 'Unauthorized' });

    const body = await req.json().catch(() => ({}));
    const action = (body.action as Action | undefined) ?? 'status';
    const organizationId = body.organization_id as string | undefined;
    const provider = body.provider as Provider | undefined;
    const credentialKey = body.credential_key as string | undefined;

    if (!organizationId) return json(400, { error: 'organization_id required' });
    await assertTenantAccess(supabase, user.id, organizationId);

    if (action === 'status') {
      const { data, error } = await supabase
        .from('secure_credentials')
        .select('provider, credential_key, updated_at')
        .eq('owner_type', 'tenant')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return json(200, {
        encryption_ready: !!getEncryptionKeyBytes(),
        credentials: (data ?? []).map((r) => ({
          provider: r.provider,
          credential_key: r.credential_key,
          is_configured: true,
          updated_at: r.updated_at,
        })),
      });
    }

    if (!provider || !credentialKey) {
      return json(400, { error: 'provider and credential_key required' });
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('secure_credentials')
        .delete()
        .eq('owner_type', 'tenant')
        .eq('organization_id', organizationId)
        .eq('provider', provider)
        .eq('credential_key', credentialKey);
      if (error) throw error;
      return json(200, { success: true });
    }

    if (action === 'upsert') {
      const value = body.value as string | undefined;
      if (!value) return json(400, { error: 'value required' });

      const keyBytes = getEncryptionKeyBytes();
      if (!keyBytes) {
        return json(400, {
          error: 'ENCRYPTION_KEY_NOT_CONFIGURED',
          message: 'ENCRYPTION_KEY no está configurada. No se puede guardar el secreto todavía.',
        });
      }
      if (keyBytes.length !== 32) {
        return json(400, {
          error: 'ENCRYPTION_KEY_INVALID_LENGTH',
          message: 'ENCRYPTION_KEY debe ser de 32 bytes (64 hex chars o base64 de 32 bytes).',
        });
      }

      const encrypted = await aesGcmEncrypt(value, keyBytes);

      const { error } = await supabase
        .from('secure_credentials')
        .upsert(
          {
            owner_type: 'tenant',
            organization_id: organizationId,
            provider,
            credential_key: credentialKey,
            encrypted_value: encrypted,
          },
          { onConflict: 'owner_type,organization_id,provider,credential_key' },
        );
      if (error) throw error;

      return json(200, { success: true });
    }

    return json(400, { error: 'Invalid action' });
  } catch (error) {
    console.error('secure-credentials error:', error);
    return json(500, { error: error instanceof Error ? error.message : 'Internal error' });
  }
});
