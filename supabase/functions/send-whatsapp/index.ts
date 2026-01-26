// ============================================================
// IP-NEXUS Edge Function - Send WhatsApp Message
// Uses Meta WhatsApp Business Cloud API
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

async function readWhatsAppCredential(supabase: any, organizationId: string, key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('secure_credentials')
    .select('encrypted_value')
    .eq('owner_type', 'tenant')
    .eq('organization_id', organizationId)
    .eq('provider', 'whatsapp')
    .eq('credential_key', key)
    .maybeSingle();
  if (error) throw error;
  if (!data?.encrypted_value) return null;

  const keyBytes = getEncryptionKeyBytes();
  if (!keyBytes || keyBytes.length !== 32) return null;
  return await aesGcmDecrypt(data.encrypted_value, keyBytes);
}

// ============= WhatsApp API Helpers =============
interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
}

interface SendMessageRequest {
  organization_id: string;
  to: string;
  message?: string;
  template_name?: string;
  template_language?: string;
  template_params?: Record<string, string[]>;
  media_url?: string;
  media_type?: 'image' | 'document' | 'audio' | 'video';
  contact_id?: string;
  client_id?: string;
  matter_id?: string;
  metadata?: Record<string, unknown>;
}

async function sendTextMessage(config: WhatsAppConfig, to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;
  
  // Clean phone number (remove spaces, dashes, etc. but keep +)
  const cleanedTo = to.replace(/[\s()-]/g, '').replace(/^00/, '+');
  
  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanedTo.replace(/^\+/, ''), // Meta API expects number without +
    type: 'text',
    text: {
      preview_url: true,
      body: message,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('WhatsApp API error:', data);
    return { success: false, error: data.error?.message || 'Failed to send message' };
  }

  return { success: true, messageId: data.messages?.[0]?.id };
}

async function sendTemplateMessage(
  config: WhatsAppConfig, 
  to: string, 
  templateName: string, 
  language: string = 'es',
  params?: Record<string, string[]>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;
  
  const cleanedTo = to.replace(/[\s()-]/g, '').replace(/^00/, '+').replace(/^\+/, '');
  
  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    to: cleanedTo,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: language,
      },
    },
  };

  // Add template components if params provided
  if (params) {
    const components: unknown[] = [];
    
    if (params.header?.length) {
      components.push({
        type: 'header',
        parameters: params.header.map(text => ({ type: 'text', text })),
      });
    }
    
    if (params.body?.length) {
      components.push({
        type: 'body',
        parameters: params.body.map(text => ({ type: 'text', text })),
      });
    }
    
    if (components.length > 0) {
      (body.template as Record<string, unknown>).components = components;
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('WhatsApp template error:', data);
    return { success: false, error: data.error?.message || 'Failed to send template' };
  }

  return { success: true, messageId: data.messages?.[0]?.id };
}

async function sendMediaMessage(
  config: WhatsAppConfig,
  to: string,
  mediaUrl: string,
  mediaType: 'image' | 'document' | 'audio' | 'video',
  caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;
  
  const cleanedTo = to.replace(/[\s()-]/g, '').replace(/^00/, '+').replace(/^\+/, '');
  
  const mediaPayload: Record<string, unknown> = { link: mediaUrl };
  if (caption && (mediaType === 'image' || mediaType === 'video' || mediaType === 'document')) {
    mediaPayload.caption = caption;
  }
  
  const body = {
    messaging_product: 'whatsapp',
    to: cleanedTo,
    type: mediaType,
    [mediaType]: mediaPayload,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('WhatsApp media error:', data);
    return { success: false, error: data.error?.message || 'Failed to send media' };
  }

  return { success: true, messageId: data.messages?.[0]?.id };
}

// ============= Main Handler =============
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const payload: SendMessageRequest = await req.json();

    // Validate required fields
    if (!payload.organization_id || !payload.to) {
      return json(400, { error: 'organization_id and to are required' });
    }

    if (!payload.message && !payload.template_name && !payload.media_url) {
      return json(400, { error: 'Either message, template_name, or media_url is required' });
    }

    // Get WhatsApp credentials for this organization
    const phoneNumberId = await readWhatsAppCredential(supabase, payload.organization_id, 'phone_number_id');
    const accessToken = await readWhatsAppCredential(supabase, payload.organization_id, 'access_token');

    // Fallback to environment variables if not configured per-tenant
    const config: WhatsAppConfig = {
      phoneNumberId: phoneNumberId || Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '',
      accessToken: accessToken || Deno.env.get('WHATSAPP_ACCESS_TOKEN') || '',
    };

    if (!config.phoneNumberId || !config.accessToken) {
      return json(503, {
        error: 'WHATSAPP_NOT_CONFIGURED',
        message: 'WhatsApp no está configurado para esta organización.',
      });
    }

    let result: { success: boolean; messageId?: string; error?: string };

    // Send based on message type
    if (payload.template_name) {
      result = await sendTemplateMessage(
        config,
        payload.to,
        payload.template_name,
        payload.template_language || 'es',
        payload.template_params
      );
    } else if (payload.media_url && payload.media_type) {
      result = await sendMediaMessage(
        config,
        payload.to,
        payload.media_url,
        payload.media_type,
        payload.message
      );
    } else {
      result = await sendTextMessage(config, payload.to, payload.message!);
    }

    // Log message to communications table
    const messageContent = payload.message || `[Template: ${payload.template_name}]`;
    const { data: dbMessage, error: dbError } = await supabase
      .from('communications')
      .insert({
        organization_id: payload.organization_id,
        channel: 'whatsapp',
        direction: 'outbound',
        whatsapp_from: config.phoneNumberId,
        whatsapp_to: payload.to,
        whatsapp_type: payload.template_name ? 'template' : (payload.media_type || 'text'),
        body: messageContent,
        body_preview: messageContent.substring(0, 150),
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? new Date().toISOString() : null,
        whatsapp_message_id: result.messageId,
        contact_id: payload.contact_id,
        client_id: payload.client_id,
        matter_id: payload.matter_id,
        metadata: {
          ...payload.metadata,
          template_name: payload.template_name,
          template_params: payload.template_params,
          media_url: payload.media_url,
          media_type: payload.media_type,
        },
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Error logging WhatsApp message:', dbError);
    }

    return json(result.success ? 200 : 400, {
      success: result.success,
      message_id: dbMessage?.id,
      whatsapp_message_id: result.messageId,
      error: result.error,
    });

  } catch (error) {
    console.error('send-whatsapp error:', error);
    return json(500, { error: error instanceof Error ? error.message : 'Internal error' });
  }
});
