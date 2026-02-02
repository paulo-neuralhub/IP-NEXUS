// ============================================================
// IP-NEXUS - BOLDSIGN SIGNATURE INTEGRATION
// Edge Function for BoldSign e-signature provider
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BoldSignRequest {
  action: 'create' | 'status' | 'download' | 'remind' | 'void';
  envelopeId?: string;
  documentBase64?: string;
  documentName?: string;
  signers?: Array<{
    name: string;
    email: string;
    signerType?: string;
    formFields?: Array<{
      fieldType: string;
      pageNumber: number;
      bounds: { x: number; y: number; width: number; height: number };
    }>;
  }>;
  title?: string;
  message?: string;
  expiryDays?: number;
  reminderSettings?: {
    enableAutoReminder: boolean;
    reminderDays: number;
    reminderCount: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BOLDSIGN_API_KEY = Deno.env.get('BOLDSIGN_API_KEY');
    const BOLDSIGN_API_URL = Deno.env.get('BOLDSIGN_API_URL') || 'https://api.boldsign.com/v1';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const APP_BASE_URL = Deno.env.get('APP_BASE_URL') || 'https://localhost:3000';

    // Safe mode: return mock response if API key not configured
    if (!BOLDSIGN_API_KEY) {
      console.log('BOLDSIGN_API_KEY not configured - returning safe mode response');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'BoldSign API key not configured. Please add BOLDSIGN_API_KEY secret.',
          safeMode: true,
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body: BoldSignRequest = await req.json();

    // =====================================================
    // ACTION: CREATE - Create new signature envelope
    // =====================================================
    if (body.action === 'create') {
      const { documentBase64, documentName, signers, title, message, expiryDays } = body;

      if (!documentBase64 || !signers || signers.length === 0) {
        throw new Error('Missing required fields: documentBase64, signers');
      }

      // Prepare FormData for BoldSign
      const formData = new FormData();
      
      // Convert base64 to blob
      const binaryString = atob(documentBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      formData.append('Files', blob, documentName || 'document.pdf');

      // Document configuration
      formData.append('Title', title || 'Documento para firma');
      formData.append('Message', message || 'Por favor, firme este documento.');
      formData.append('ExpiryDays', String(expiryDays || 30));
      formData.append('EnableSigningOrder', 'false');
      formData.append('DisableEmails', 'false');
      formData.append('DisableSMS', 'true');

      // Webhook callback
      formData.append('WebhookUrl', `${SUPABASE_URL}/functions/v1/signature-webhook`);

      // Add signers
      signers.forEach((signer, index) => {
        formData.append(`Signers[${index}][Name]`, signer.name);
        formData.append(`Signers[${index}][EmailAddress]`, signer.email);
        formData.append(`Signers[${index}][SignerType]`, signer.signerType || 'Signer');
        formData.append(`Signers[${index}][SignerOrder]`, String(index + 1));

        // Signature fields
        if (signer.formFields) {
          signer.formFields.forEach((field, fieldIndex) => {
            formData.append(`Signers[${index}][FormFields][${fieldIndex}][FieldType]`, field.fieldType);
            formData.append(`Signers[${index}][FormFields][${fieldIndex}][PageNumber]`, String(field.pageNumber));
            formData.append(`Signers[${index}][FormFields][${fieldIndex}][Bounds][X]`, String(field.bounds.x));
            formData.append(`Signers[${index}][FormFields][${fieldIndex}][Bounds][Y]`, String(field.bounds.y));
            formData.append(`Signers[${index}][FormFields][${fieldIndex}][Bounds][Width]`, String(field.bounds.width));
            formData.append(`Signers[${index}][FormFields][${fieldIndex}][Bounds][Height]`, String(field.bounds.height));
          });
        }
      });

      // Send to BoldSign
      const response = await fetch(`${BOLDSIGN_API_URL}/document/send`, {
        method: 'POST',
        headers: {
          'X-API-KEY': BOLDSIGN_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BoldSign API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      return new Response(
        JSON.stringify({
          success: true,
          provider: 'boldsign',
          envelopeId: result.documentId,
          status: 'sent',
          signers: result.signerDetails?.map((s: any) => ({
            email: s.emailAddress,
            status: s.status,
            signLink: s.signLink,
          })),
          expiresAt: result.expiryDate,
          raw: result,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // ACTION: STATUS - Get envelope status
    // =====================================================
    if (body.action === 'status') {
      const { envelopeId } = body;

      if (!envelopeId) {
        throw new Error('envelopeId is required');
      }

      const response = await fetch(`${BOLDSIGN_API_URL}/document/properties?documentId=${envelopeId}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': BOLDSIGN_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`BoldSign API error: ${response.status}`);
      }

      const result = await response.json();

      // Map BoldSign status to our system
      const statusMap: Record<string, string> = {
        'InProgress': 'pending',
        'Completed': 'completed',
        'Declined': 'declined',
        'Expired': 'expired',
        'Revoked': 'voided',
      };

      return new Response(
        JSON.stringify({
          success: true,
          provider: 'boldsign',
          envelopeId,
          status: statusMap[result.status] || result.status,
          signers: result.signerDetails?.map((s: any) => ({
            email: s.emailAddress,
            name: s.name,
            status: s.status.toLowerCase(),
            signedAt: s.signedDate,
          })),
          completedAt: result.completedDate,
          raw: result,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // ACTION: DOWNLOAD - Download signed document
    // =====================================================
    if (body.action === 'download') {
      const { envelopeId } = body;

      if (!envelopeId) {
        throw new Error('envelopeId is required');
      }

      const response = await fetch(
        `${BOLDSIGN_API_URL}/document/download?documentId=${envelopeId}`,
        {
          method: 'GET',
          headers: {
            'X-API-KEY': BOLDSIGN_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`BoldSign API error: ${response.status}`);
      }

      // Get PDF as ArrayBuffer
      const pdfBuffer = await response.arrayBuffer();
      const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

      return new Response(
        JSON.stringify({
          success: true,
          provider: 'boldsign',
          envelopeId,
          documentBase64: pdfBase64,
          contentType: 'application/pdf',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // ACTION: REMIND - Send reminder
    // =====================================================
    if (body.action === 'remind') {
      const { envelopeId } = body;

      if (!envelopeId) {
        throw new Error('envelopeId is required');
      }

      const response = await fetch(
        `${BOLDSIGN_API_URL}/document/remind?documentId=${envelopeId}`,
        {
          method: 'POST',
          headers: {
            'X-API-KEY': BOLDSIGN_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`BoldSign API error: ${response.status}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          provider: 'boldsign',
          envelopeId,
          action: 'reminder_sent',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // ACTION: VOID - Void envelope
    // =====================================================
    if (body.action === 'void') {
      const { envelopeId } = body;

      if (!envelopeId) {
        throw new Error('envelopeId is required');
      }

      const response = await fetch(
        `${BOLDSIGN_API_URL}/document/revoke?documentId=${envelopeId}`,
        {
          method: 'POST',
          headers: {
            'X-API-KEY': BOLDSIGN_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Documento anulado por el remitente',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`BoldSign API error: ${response.status}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          provider: 'boldsign',
          envelopeId,
          status: 'voided',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Unknown action: ${body.action}`);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('BoldSign Edge Function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
