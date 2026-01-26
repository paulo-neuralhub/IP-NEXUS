// ============================================================
// IP-NEXUS Edge Function - WhatsApp Webhook
// Receives incoming messages and status updates from Meta
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

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contacts' | 'interactive' | 'button' | 'reaction';
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string; caption?: string };
  document?: { id: string; mime_type: string; sha256: string; filename: string; caption?: string };
  audio?: { id: string; mime_type: string; sha256: string };
  video?: { id: string; mime_type: string; sha256: string; caption?: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  contacts?: Array<{ name: { formatted_name: string }; phones?: Array<{ phone: string }> }>;
  interactive?: { type: string; button_reply?: { id: string; title: string }; list_reply?: { id: string; title: string; description?: string } };
  button?: { text: string; payload: string };
  reaction?: { message_id: string; emoji: string };
  context?: { from: string; id: string };
}

interface WhatsAppStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string; message?: string }>;
}

interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: WhatsAppMessage[];
        statuses?: WhatsAppStatus[];
      };
      field: string;
    }>;
  }>;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // ============= Webhook Verification (GET) =============
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    // Get organization_id from query params to look up verify token
    const organizationId = url.searchParams.get('organization_id');
    
    if (mode === 'subscribe') {
      // Check verify token - either from env or from org-specific config
      const expectedToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'ip-nexus-whatsapp-verify';
      
      if (organizationId) {
        // Could also check org-specific token from DB here
        console.log(`WhatsApp verification for org: ${organizationId}`);
      }
      
      if (token === expectedToken) {
        console.log('WhatsApp webhook verified');
        return new Response(challenge, { status: 200 });
      } else {
        console.error('WhatsApp verification failed - token mismatch');
        return new Response('Forbidden', { status: 403 });
      }
    }
    
    return new Response('OK', { status: 200 });
  }

  // ============= Handle POST (Incoming Messages/Status) =============
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const payload: WebhookPayload = await req.json();

    // Process each entry
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        const phoneNumberId = value.metadata?.phone_number_id;

        // Find organization by phone_number_id
        const { data: channel } = await supabase
          .from('communication_channels')
          .select('tenant_id, id')
          .eq('channel_type', 'whatsapp')
          .eq('identifier', phoneNumberId)
          .maybeSingle();

        // Also try secure_credentials for org lookup
        let organizationId = channel?.tenant_id;
        if (!organizationId) {
          const { data: cred } = await supabase
            .from('secure_credentials')
            .select('organization_id')
            .eq('provider', 'whatsapp')
            .eq('credential_key', 'phone_number_id')
            .maybeSingle();
          
          // Note: This is a simplified lookup. In production, you'd decrypt and compare.
          organizationId = cred?.organization_id;
        }

        if (!organizationId) {
          console.warn('WhatsApp webhook received but no matching organization found for phone_number_id:', phoneNumberId);
          continue;
        }

        // Process incoming messages
        if (value.messages) {
          for (const message of value.messages) {
            await handleIncomingMessage(supabase, organizationId, message, value.contacts?.[0], phoneNumberId);
          }
        }

        // Process status updates
        if (value.statuses) {
          for (const status of value.statuses) {
            await handleStatusUpdate(supabase, organizationId, status);
          }
        }
      }
    }

    return json(200, { success: true });

  } catch (error) {
    console.error('whatsapp-webhook error:', error);
    // Always return 200 to Meta to prevent retries
    return json(200, { success: false, error: error instanceof Error ? error.message : 'Internal error' });
  }
});

// ============= Handle Incoming Message =============
async function handleIncomingMessage(
  supabase: any,
  organizationId: string,
  message: WhatsAppMessage,
  contact: { profile: { name: string }; wa_id: string } | undefined,
  phoneNumberId: string
) {
  // Extract message content based on type
  let body = '';
  let mediaUrl: string | undefined;
  let mediaType: string | undefined;
  const metadata: Record<string, unknown> = {};

  switch (message.type) {
    case 'text':
      body = message.text?.body || '';
      break;
    case 'image':
      body = message.image?.caption || '[Imagen recibida]';
      metadata.media_id = message.image?.id;
      metadata.mime_type = message.image?.mime_type;
      mediaType = 'image';
      break;
    case 'document':
      body = message.document?.caption || `[Documento: ${message.document?.filename}]`;
      metadata.media_id = message.document?.id;
      metadata.filename = message.document?.filename;
      metadata.mime_type = message.document?.mime_type;
      mediaType = 'document';
      break;
    case 'audio':
      body = '[Audio recibido]';
      metadata.media_id = message.audio?.id;
      metadata.mime_type = message.audio?.mime_type;
      mediaType = 'audio';
      break;
    case 'video':
      body = message.video?.caption || '[Video recibido]';
      metadata.media_id = message.video?.id;
      metadata.mime_type = message.video?.mime_type;
      mediaType = 'video';
      break;
    case 'location':
      body = message.location?.name || message.location?.address || '[Ubicación compartida]';
      metadata.location = message.location;
      break;
    case 'contacts':
      body = `[Contacto: ${message.contacts?.[0]?.name?.formatted_name || 'Sin nombre'}]`;
      metadata.contacts = message.contacts;
      break;
    case 'interactive':
      body = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '[Respuesta interactiva]';
      metadata.interactive = message.interactive;
      break;
    case 'button':
      body = message.button?.text || '[Botón presionado]';
      metadata.button_payload = message.button?.payload;
      break;
    case 'reaction':
      body = `[Reacción: ${message.reaction?.emoji}]`;
      metadata.reaction_to = message.reaction?.message_id;
      break;
    default:
      body = `[Mensaje tipo: ${message.type}]`;
  }

  // Try to find existing contact by phone number
  const formattedPhone = `+${message.from}`;
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('organization_id', organizationId)
    .or(`phone.eq.${formattedPhone},mobile.eq.${formattedPhone}`)
    .limit(1)
    .maybeSingle();

  // Insert communication record
  const { error: insertError } = await supabase
    .from('communications')
    .insert({
      organization_id: organizationId,
      channel: 'whatsapp',
      direction: 'inbound',
      whatsapp_from: formattedPhone,
      whatsapp_to: phoneNumberId,
      whatsapp_message_id: message.id,
      whatsapp_type: message.type,
      body: body,
      body_preview: body.substring(0, 150),
      status: 'received',
      received_at: new Date(parseInt(message.timestamp) * 1000).toISOString(),
      is_read: false,
      contact_id: existingContact?.id,
      metadata: {
        ...metadata,
        contact_name: contact?.profile?.name,
        context: message.context,
      },
    });

  if (insertError) {
    console.error('Error inserting WhatsApp message:', insertError);
  } else {
    console.log(`WhatsApp message received from ${formattedPhone} to org ${organizationId}`);
  }
}

// ============= Handle Status Update =============
async function handleStatusUpdate(
  supabase: any,
  organizationId: string,
  status: WhatsAppStatus
) {
  const statusMap: Record<string, string> = {
    sent: 'sent',
    delivered: 'delivered',
    read: 'read',
    failed: 'failed',
  };

  const updates: Record<string, unknown> = {
    status: statusMap[status.status] || status.status,
    updated_at: new Date().toISOString(),
  };

  if (status.status === 'delivered') {
    updates.delivered_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
  } else if (status.status === 'read') {
    updates.read_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
  } else if (status.status === 'failed' && status.errors?.length) {
    updates.error_message = status.errors[0].message || status.errors[0].title;
    updates.metadata = { errors: status.errors };
  }

  const { error } = await supabase
    .from('communications')
    .update(updates)
    .eq('organization_id', organizationId)
    .eq('whatsapp_message_id', status.id);

  if (error) {
    console.error('Error updating WhatsApp status:', error);
  } else {
    console.log(`WhatsApp status updated: ${status.id} -> ${status.status}`);
  }
}
