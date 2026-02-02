// ============================================================
// IP-NEXUS - SIGNATURE WEBHOOK HANDLER
// Receives webhooks from BoldSign and Yousign providers
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-boldsign-signature, x-yousign-signature',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const rawBody = await req.text();
    
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      console.error('Failed to parse webhook body:', rawBody);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
    }

    // Determine provider
    let provider = 'unknown';
    let envelopeId = '';
    let eventType = '';
    let eventData: any = {};

    // =====================================================
    // BOLDSIGN WEBHOOK
    // =====================================================
    if (body.event?.eventType || body.documentId || body.eventType) {
      provider = 'boldsign';
      envelopeId = body.documentId || body.event?.data?.documentId;
      eventType = body.event?.eventType || body.eventType;
      eventData = body.event?.data || body;

      // Map BoldSign events
      const eventMap: Record<string, string> = {
        'DocumentSent': 'envelope.sent',
        'DocumentViewed': 'envelope.viewed',
        'DocumentSigned': 'signer.signed',
        'DocumentCompleted': 'envelope.completed',
        'DocumentDeclined': 'envelope.declined',
        'DocumentExpired': 'envelope.expired',
        'DocumentRevoked': 'envelope.voided',
        'ReminderSent': 'reminder.sent',
      };

      eventType = eventMap[eventType] || eventType;
    }

    // =====================================================
    // YOUSIGN WEBHOOK
    // =====================================================
    if (body.event_name || body.signature_request_id) {
      provider = 'yousign';
      envelopeId = body.signature_request_id || body.data?.signature_request?.id;
      eventType = body.event_name;
      eventData = body.data || body;

      // Map Yousign events
      const eventMap: Record<string, string> = {
        'signature_request.activated': 'envelope.sent',
        'signer.done': 'signer.signed',
        'signature_request.done': 'envelope.completed',
        'signature_request.expired': 'envelope.expired',
        'signature_request.declined': 'envelope.declined',
        'signer.notified': 'signer.notified',
      };

      eventType = eventMap[eventType] || eventType;
    }

    console.log(`Webhook received: provider=${provider}, envelope=${envelopeId}, event=${eventType}`);

    if (!envelopeId) {
      console.log('No envelope ID found in webhook payload');
      return new Response(JSON.stringify({ received: true, processed: false }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Find the envelope in our database
    const { data: envelope, error: findError } = await supabase
      .from('signature_requests')
      .select('*')
      .eq('provider_envelope_id', envelopeId)
      .single();

    if (findError || !envelope) {
      console.log('Envelope not found in database, might be from another system:', envelopeId);
      return new Response(JSON.stringify({ received: true, processed: false }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare updates
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    // Add event to history
    const webhookEvents = envelope.webhook_events || [];
    webhookEvents.push({
      timestamp: new Date().toISOString(),
      event: eventType,
      data: eventData,
    });
    updates.webhook_events = webhookEvents;

    // Update envelope status based on event
    switch (eventType) {
      case 'envelope.sent':
        updates.status = 'sent';
        break;
        
      case 'envelope.viewed':
        // Don't change status, just record
        break;
        
      case 'signer.signed':
        // Update specific signer
        const signerEmail = eventData.signerEmail || eventData.signer?.info?.email;
        if (signerEmail && envelope.signers) {
          const signers = (envelope.signers as any[]).map((s: any) => {
            if (s.email === signerEmail) {
              return { ...s, status: 'signed', signed_at: new Date().toISOString() };
            }
            return s;
          });
          updates.signers = signers;
        }
        break;
        
      case 'envelope.completed':
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
        
        // Download signed document automatically
        try {
          const functionName = provider === 'boldsign' ? 'signature-boldsign' : 'signature-yousign';
          const downloadResponse = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'download',
              envelopeId: provider === 'boldsign' ? envelopeId : undefined,
              signatureRequestId: provider === 'yousign' ? envelopeId : undefined,
            }),
          });

          const downloadData = await downloadResponse.json();

          if (downloadData?.documentBase64) {
            // Save to storage
            const fileName = `signed_${envelope.id}_${Date.now()}.pdf`;
            const filePath = `signatures/${envelope.organization_id}/${fileName}`;
            
            // Decode base64
            const binaryString = atob(downloadData.documentBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            const { error: uploadError } = await supabase.storage
              .from('documents')
              .upload(filePath, bytes, {
                contentType: 'application/pdf',
              });

            if (!uploadError) {
              updates.signed_document_path = filePath;
              const { data: urlData } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath);
              updates.signed_document_url = urlData.publicUrl;
            } else {
              console.error('Error uploading signed document:', uploadError);
            }
          }
        } catch (downloadError) {
          console.error('Error downloading signed document:', downloadError);
        }
        break;
        
      case 'envelope.declined':
        updates.status = 'declined';
        break;
        
      case 'envelope.expired':
        updates.status = 'expired';
        break;
        
      case 'envelope.voided':
        updates.status = 'voided';
        break;
    }

    // Save updates
    const { error: updateError } = await supabase
      .from('signature_requests')
      .update(updates)
      .eq('id', envelope.id);

    if (updateError) {
      console.error('Error updating envelope:', updateError);
    }

    // If completed, also update the original document
    if (eventType === 'envelope.completed' && envelope.document_id) {
      await supabase
        .from('matter_documents')
        .update({
          signature_status: 'signed',
          signed_at: new Date().toISOString(),
          signed_document_path: updates.signed_document_path,
        })
        .eq('id', envelope.document_id);
    }

    // Create activity log entry
    if (envelope.matter_id) {
      await supabase.from('activity_log').insert({
        organization_id: envelope.organization_id,
        entity_type: 'signature_request',
        entity_id: envelope.id,
        action: eventType,
        title: `Firma: ${eventType.replace('envelope.', '').replace('signer.', '')}`,
        description: `Evento de firma recibido: ${eventType}`,
        matter_id: envelope.matter_id,
        is_system: true,
      });
    }

    return new Response(
      JSON.stringify({ received: true, processed: true, event: eventType }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
