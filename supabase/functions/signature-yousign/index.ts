// ============================================================
// IP-NEXUS - YOUSIGN SIGNATURE INTEGRATION
// Edge Function for Yousign e-signature provider (v3 API)
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YousignRequest {
  action: 'create' | 'status' | 'download' | 'remind' | 'cancel';
  signatureRequestId?: string;
  documentBase64?: string;
  documentName?: string;
  signers?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    locale?: string;
    signatureLevel?: 'electronic_signature' | 'advanced_electronic_signature' | 'qualified_electronic_signature_mode_1';
    fields?: Array<{
      type: 'signature' | 'initials' | 'text' | 'checkbox';
      page: number;
      x: number;
      y: number;
      width?: number;
      height?: number;
    }>;
  }>;
  name?: string;
  deliveryMode?: 'email' | 'none';
  expirationDate?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const YOUSIGN_API_KEY = Deno.env.get('YOUSIGN_API_KEY');
    const YOUSIGN_API_URL = Deno.env.get('YOUSIGN_API_URL') || 'https://api.yousign.app/v3';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Safe mode: return mock response if API key not configured
    if (!YOUSIGN_API_KEY) {
      console.log('YOUSIGN_API_KEY not configured - returning safe mode response');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Yousign API key not configured. Please add YOUSIGN_API_KEY secret.',
          safeMode: true,
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body: YousignRequest = await req.json();

    const headers = {
      'Authorization': `Bearer ${YOUSIGN_API_KEY}`,
      'Content-Type': 'application/json',
    };

    // =====================================================
    // ACTION: CREATE - Create signature request
    // =====================================================
    if (body.action === 'create') {
      const { documentBase64, documentName, signers, name, deliveryMode, expirationDate } = body;

      if (!documentBase64 || !signers || signers.length === 0) {
        throw new Error('Missing required fields: documentBase64, signers');
      }

      // STEP 1: Create Signature Request
      const signatureRequestResponse = await fetch(`${YOUSIGN_API_URL}/signature_requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: name || 'Documento para firma',
          delivery_mode: deliveryMode || 'email',
          timezone: 'Europe/Madrid',
          expiration_date: expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          external_id: `ip-nexus-${Date.now()}`,
        }),
      });

      if (!signatureRequestResponse.ok) {
        const error = await signatureRequestResponse.text();
        throw new Error(`Yousign create request error: ${error}`);
      }

      const signatureRequest = await signatureRequestResponse.json();

      // STEP 2: Upload document
      const documentResponse = await fetch(
        `${YOUSIGN_API_URL}/signature_requests/${signatureRequest.id}/documents`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            file_name: documentName || 'document.pdf',
            file_content: documentBase64,
            nature: 'signable_document',
          }),
        }
      );

      if (!documentResponse.ok) {
        const error = await documentResponse.text();
        throw new Error(`Yousign upload document error: ${error}`);
      }

      const document = await documentResponse.json();

      // STEP 3: Add signers
      const signerResults = [];
      for (const signer of signers) {
        const signerResponse = await fetch(
          `${YOUSIGN_API_URL}/signature_requests/${signatureRequest.id}/signers`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              info: {
                first_name: signer.firstName,
                last_name: signer.lastName,
                email: signer.email,
                phone_number: signer.phone,
                locale: signer.locale || 'es',
              },
              signature_level: signer.signatureLevel || 'electronic_signature',
              signature_authentication_mode: 'no_otp',
              fields: signer.fields?.map((field) => ({
                type: field.type,
                document_id: document.id,
                page: field.page,
                x: field.x,
                y: field.y,
                width: field.width || 200,
                height: field.height || 50,
              })) || [{
                type: 'signature',
                document_id: document.id,
                page: 1,
                x: 100,
                y: 700,
                width: 200,
                height: 50,
              }],
            }),
          }
        );

        if (!signerResponse.ok) {
          const error = await signerResponse.text();
          throw new Error(`Yousign add signer error: ${error}`);
        }

        signerResults.push(await signerResponse.json());
      }

      // STEP 4: Activate the signature request
      const activateResponse = await fetch(
        `${YOUSIGN_API_URL}/signature_requests/${signatureRequest.id}/activate`,
        {
          method: 'POST',
          headers,
        }
      );

      if (!activateResponse.ok) {
        const error = await activateResponse.text();
        throw new Error(`Yousign activate error: ${error}`);
      }

      const activatedRequest = await activateResponse.json();

      return new Response(
        JSON.stringify({
          success: true,
          provider: 'yousign',
          envelopeId: signatureRequest.id,
          status: 'sent',
          documentId: document.id,
          signers: signerResults.map((s) => ({
            id: s.id,
            email: s.info?.email,
            status: s.status,
            signLink: s.signature_link,
          })),
          expiresAt: activatedRequest.expiration_date,
          raw: activatedRequest,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // ACTION: STATUS - Get status
    // =====================================================
    if (body.action === 'status') {
      const { signatureRequestId } = body;

      if (!signatureRequestId) {
        throw new Error('signatureRequestId is required');
      }

      const response = await fetch(
        `${YOUSIGN_API_URL}/signature_requests/${signatureRequestId}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Yousign API error: ${response.status}`);
      }

      const result = await response.json();

      // Map status
      const statusMap: Record<string, string> = {
        'draft': 'draft',
        'ongoing': 'pending',
        'done': 'completed',
        'deleted': 'voided',
        'expired': 'expired',
        'declined': 'declined',
      };

      return new Response(
        JSON.stringify({
          success: true,
          provider: 'yousign',
          envelopeId: signatureRequestId,
          status: statusMap[result.status] || result.status,
          signers: result.signers?.map((s: any) => ({
            id: s.id,
            email: s.info?.email,
            name: `${s.info?.first_name} ${s.info?.last_name}`,
            status: s.status,
            signedAt: s.signature_date,
          })),
          completedAt: result.status === 'done' ? result.last_updated_at : null,
          raw: result,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // ACTION: DOWNLOAD - Download signed document
    // =====================================================
    if (body.action === 'download') {
      const { signatureRequestId } = body;

      if (!signatureRequestId) {
        throw new Error('signatureRequestId is required');
      }

      // First get the document ID
      const requestResponse = await fetch(
        `${YOUSIGN_API_URL}/signature_requests/${signatureRequestId}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!requestResponse.ok) {
        throw new Error(`Yousign API error: ${requestResponse.status}`);
      }

      const request = await requestResponse.json();
      const documentId = request.documents?.[0]?.id;

      if (!documentId) {
        throw new Error('No document found in signature request');
      }

      // Download document
      const downloadResponse = await fetch(
        `${YOUSIGN_API_URL}/signature_requests/${signatureRequestId}/documents/${documentId}/download`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!downloadResponse.ok) {
        throw new Error(`Yousign download error: ${downloadResponse.status}`);
      }

      const pdfBuffer = await downloadResponse.arrayBuffer();
      const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

      return new Response(
        JSON.stringify({
          success: true,
          provider: 'yousign',
          envelopeId: signatureRequestId,
          documentBase64: pdfBase64,
          contentType: 'application/pdf',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // ACTION: CANCEL - Cancel request
    // =====================================================
    if (body.action === 'cancel') {
      const { signatureRequestId } = body;

      if (!signatureRequestId) {
        throw new Error('signatureRequestId is required');
      }

      const response = await fetch(
        `${YOUSIGN_API_URL}/signature_requests/${signatureRequestId}/cancel`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            reason: 'Cancelado por el remitente',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Yousign cancel error: ${response.status}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          provider: 'yousign',
          envelopeId: signatureRequestId,
          status: 'voided',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Unknown action: ${body.action}`);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Yousign Edge Function error:', error);
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
