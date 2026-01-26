// ============================================================
// IP-NEXUS Edge Function - Send SMS
// Uses Twilio or multi-provider telephony system
// ============================================================

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

// ============= Credential Helpers =============
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

// ============= Main Types =============
interface SendSMSRequest {
  organization_id: string;
  to: string;
  message: string;
  contact_id?: string;
  client_id?: string;
  matter_id?: string;
  metadata?: Record<string, unknown>;
}

// ============= Main Handler =============
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const payload: SendSMSRequest = await req.json();

    // Validate required fields
    if (!payload.organization_id || !payload.to || !payload.message) {
      return json(400, { error: 'organization_id, to, and message are required' });
    }

    // Check SMS balance
    const { data: balance } = await supabase
      .from('tenant_telephony_balance')
      .select('sms_balance, is_enabled')
      .eq('tenant_id', payload.organization_id)
      .maybeSingle();

    if (balance && !balance.is_enabled) {
      return json(400, { error: 'SMS service is disabled for this organization' });
    }

    if (balance && balance.sms_balance <= 0) {
      return json(400, { error: 'Insufficient SMS balance', balance: 0 });
    }

    // Get Twilio credentials
    const accountSid = await readTwilioCredential(supabase, payload.organization_id, 'account_sid') || Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = await readTwilioCredential(supabase, payload.organization_id, 'auth_token') || Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = await readTwilioCredential(supabase, payload.organization_id, 'phone_number') || Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      return json(503, {
        error: 'TWILIO_NOT_CONFIGURED',
        message: 'SMS no está configurado para esta organización.',
      });
    }

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    // Clean and format phone number
    const cleanedTo = payload.to.replace(/[\s()-]/g, '');
    const formattedTo = cleanedTo.startsWith('+') ? cleanedTo : `+${cleanedTo}`;

    const formData = new URLSearchParams();
    formData.append('To', formattedTo);
    formData.append('From', fromNumber);
    formData.append('Body', payload.message);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const twilioData = await response.json();

    if (!response.ok) {
      console.error('Twilio SMS error:', twilioData);
      
      // Log failed message
      await supabase.from('communications').insert({
        organization_id: payload.organization_id,
        channel: 'sms',
        direction: 'outbound',
        whatsapp_from: fromNumber,
        whatsapp_to: formattedTo,
        body: payload.message,
        body_preview: payload.message.substring(0, 150),
        status: 'failed',
        error_message: twilioData.message || 'SMS send failed',
        contact_id: payload.contact_id,
        client_id: payload.client_id,
        matter_id: payload.matter_id,
        metadata: { ...payload.metadata, twilio_error: twilioData },
      });

      return json(400, {
        success: false,
        error: twilioData.message || 'Failed to send SMS',
      });
    }

    // Log successful message
    const { data: dbMessage, error: dbError } = await supabase
      .from('communications')
      .insert({
        organization_id: payload.organization_id,
        channel: 'sms',
        direction: 'outbound',
        whatsapp_from: fromNumber,
        whatsapp_to: formattedTo,
        body: payload.message,
        body_preview: payload.message.substring(0, 150),
        status: twilioData.status === 'queued' || twilioData.status === 'sent' ? 'sent' : 'pending',
        sent_at: new Date().toISOString(),
        whatsapp_message_id: twilioData.sid,
        contact_id: payload.contact_id,
        client_id: payload.client_id,
        matter_id: payload.matter_id,
        metadata: {
          ...payload.metadata,
          twilio_sid: twilioData.sid,
          segments: twilioData.num_segments,
          price: twilioData.price,
        },
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Error logging SMS:', dbError);
    }

    // Deduct from SMS balance
    if (balance) {
      await supabase
        .from('tenant_telephony_balance')
        .update({ 
          sms_balance: balance.sms_balance - 1,
          updated_at: new Date().toISOString(),
        })
        .eq('tenant_id', payload.organization_id);
    }

    // Log usage
    await supabase.from('telephony_usage_logs').insert({
      tenant_id: payload.organization_id,
      call_type: 'sms',
      direction: 'outbound',
      from_number: fromNumber,
      to_number: formattedTo,
      status: 'sent',
      call_sid: twilioData.sid,
      matter_id: payload.matter_id,
      client_id: payload.client_id,
      contact_id: payload.contact_id,
    });

    return json(200, {
      success: true,
      message_id: dbMessage?.id,
      twilio_sid: twilioData.sid,
      status: twilioData.status,
      segments: twilioData.num_segments,
    });

  } catch (error) {
    console.error('send-sms error:', error);
    return json(500, { error: error instanceof Error ? error.message : 'Internal error' });
  }
});
