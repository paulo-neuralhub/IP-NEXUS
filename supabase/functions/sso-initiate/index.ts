/**
 * SSO Initiate Edge Function
 * Inicia el flujo de autenticación SSO redirigiendo al IdP
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = 'https://dcdbpmbzizzzzdfkvohl.supabase.co';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const orgId = url.searchParams.get('org');
    const returnTo = url.searchParams.get('return_to') || '/app/dashboard';
    
    if (!orgId) {
      return new Response(JSON.stringify({ error: 'Organization ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Obtener configuración SSO
    const { data: ssoConfig, error: configError } = await supabase
      .from('sso_configurations')
      .select('*')
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .single();

    if (configError || !ssoConfig) {
      return new Response(JSON.stringify({ error: 'SSO not configured or inactive' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const callbackUrl = `${SUPABASE_URL}/functions/v1/sso-callback?org=${orgId}`;

    if (ssoConfig.provider_type === 'saml_generic') {
      // SAML redirect
      if (!ssoConfig.saml_sso_url) {
        return new Response(JSON.stringify({ error: 'SAML SSO URL not configured' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generar SAML AuthnRequest
      const samlRequestId = `_${crypto.randomUUID()}`;
      const issueInstant = new Date().toISOString();
      const entityId = `https://app.ip-nexus.com/sso/${orgId}`;
      
      const samlRequest = `
        <samlp:AuthnRequest
          xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
          xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
          ID="${samlRequestId}"
          Version="2.0"
          IssueInstant="${issueInstant}"
          AssertionConsumerServiceURL="${callbackUrl}"
          ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
          <saml:Issuer>${entityId}</saml:Issuer>
          <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"/>
        </samlp:AuthnRequest>
      `.trim();

      // Codificar en base64 y deflate (simplificado, solo base64 para redirect binding)
      const encodedRequest = btoa(samlRequest);
      const urlEncodedRequest = encodeURIComponent(encodedRequest);
      
      const redirectUrl = `${ssoConfig.saml_sso_url}?SAMLRequest=${urlEncodedRequest}&RelayState=${encodeURIComponent(returnTo)}`;
      
      return Response.redirect(redirectUrl, 302);
      
    } else {
      // OIDC redirect
      if (!ssoConfig.oidc_client_id || !ssoConfig.oidc_issuer_url) {
        return new Response(JSON.stringify({ error: 'OIDC configuration incomplete' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Determinar authorization URL
      let authorizationUrl = ssoConfig.oidc_authorization_url;
      
      if (!authorizationUrl) {
        // Intentar descubrir desde .well-known
        try {
          const wellKnownUrl = `${ssoConfig.oidc_issuer_url}/.well-known/openid-configuration`;
          const wellKnownResponse = await fetch(wellKnownUrl);
          const wellKnown = await wellKnownResponse.json();
          authorizationUrl = wellKnown.authorization_endpoint;
        } catch (e) {
          // Fallback a URL común
          authorizationUrl = `${ssoConfig.oidc_issuer_url}/authorize`;
        }
      }

      // Generar state para CSRF
      const state = btoa(JSON.stringify({
        orgId,
        returnTo,
        nonce: crypto.randomUUID(),
      }));

      const scopes = ssoConfig.oidc_scopes || 'openid email profile';
      
      const params = new URLSearchParams({
        client_id: ssoConfig.oidc_client_id,
        redirect_uri: callbackUrl,
        response_type: 'code',
        scope: scopes,
        state,
      });

      const redirectUrl = `${authorizationUrl}?${params.toString()}`;
      
      return Response.redirect(redirectUrl, 302);
    }

  } catch (error) {
    console.error('SSO Initiate error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
