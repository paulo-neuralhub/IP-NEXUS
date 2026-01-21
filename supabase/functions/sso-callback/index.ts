/**
 * SSO Callback Edge Function
 * Procesa respuestas SAML y OIDC y crea sesiones de usuario
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = 'https://dcdbpmbzizzzzdfkvohl.supabase.co';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const orgId = url.searchParams.get('org');
    const state = url.searchParams.get('state'); // Para OIDC
    
    if (!orgId) {
      return new Response(JSON.stringify({ error: 'Organization ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Obtener configuración SSO
    const { data: ssoConfig, error: configError } = await supabaseAdmin
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

    let userEmail: string;
    let userFirstName: string = '';
    let userLastName: string = '';
    let userGroups: string[] = [];
    let sessionIndex: string | null = null;
    let nameId: string | null = null;
    let attributesReceived: Record<string, unknown> = {};

    // Procesar según tipo de proveedor
    if (ssoConfig.provider_type === 'saml_generic') {
      // SAML Response
      const formData = await req.formData();
      const samlResponse = formData.get('SAMLResponse') as string;
      
      if (!samlResponse) {
        return new Response(JSON.stringify({ error: 'SAMLResponse not found' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Decodificar SAML (base64)
      const decodedSaml = atob(samlResponse);
      
      // Parsear XML básico para extraer atributos
      // NOTA: En producción, usar una librería SAML completa con validación de firma
      const emailMatch = decodedSaml.match(/<saml:NameID[^>]*>([^<]+)<\/saml:NameID>/);
      userEmail = emailMatch ? emailMatch[1] : '';
      
      // Extraer atributos básicos del SAML
      const mapping = ssoConfig.attribute_mapping as Record<string, string>;
      const firstNameMatch = decodedSaml.match(new RegExp(`${mapping.first_name || 'given_name'}"[^>]*>([^<]+)<`));
      const lastNameMatch = decodedSaml.match(new RegExp(`${mapping.last_name || 'family_name'}"[^>]*>([^<]+)<`));
      
      userFirstName = firstNameMatch ? firstNameMatch[1] : '';
      userLastName = lastNameMatch ? lastNameMatch[1] : '';
      
      // Session index para SLO
      const sessionIndexMatch = decodedSaml.match(/SessionIndex="([^"]+)"/);
      sessionIndex = sessionIndexMatch ? sessionIndexMatch[1] : null;
      nameId = userEmail;
      
      attributesReceived = { saml_raw: true, email: userEmail };
      
    } else {
      // OIDC/OAuth flow
      const code = url.searchParams.get('code');
      
      if (!code) {
        return new Response(JSON.stringify({ error: 'Authorization code not found' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Intercambiar code por tokens
      const tokenUrl = ssoConfig.oidc_token_url || `${ssoConfig.oidc_issuer_url}/oauth/token`;
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: ssoConfig.oidc_client_id || '',
          client_secret: ssoConfig.oidc_client_secret_encrypted || '',
          redirect_uri: `${SUPABASE_URL}/functions/v1/sso-callback?org=${orgId}`,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        return new Response(JSON.stringify({ error: 'Token exchange failed' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const tokens = await tokenResponse.json();
      
      // Obtener userinfo
      const userinfoUrl = ssoConfig.oidc_userinfo_url || `${ssoConfig.oidc_issuer_url}/userinfo`;
      const userinfoResponse = await fetch(userinfoUrl, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      if (!userinfoResponse.ok) {
        return new Response(JSON.stringify({ error: 'Failed to get user info' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const userinfo = await userinfoResponse.json();
      
      const mapping = ssoConfig.attribute_mapping as Record<string, string>;
      userEmail = userinfo[mapping.email || 'email'];
      userFirstName = userinfo[mapping.first_name || 'given_name'] || '';
      userLastName = userinfo[mapping.last_name || 'family_name'] || '';
      userGroups = userinfo[mapping.groups || 'groups'] || [];
      
      attributesReceived = userinfo;
    }

    if (!userEmail) {
      return new Response(JSON.stringify({ error: 'Email not found in response' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar dominio permitido
    const allowedDomains = ssoConfig.allowed_domains as string[] || [];
    if (allowedDomains.length > 0) {
      const emailDomain = userEmail.split('@')[1];
      if (!allowedDomains.includes(emailDomain)) {
        return new Response(JSON.stringify({ error: 'Email domain not allowed' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Buscar usuario existente
    let { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single();

    // Determinar rol basado en grupos
    const roleMapping = ssoConfig.role_mapping as Record<string, string> || {};
    let assignedRole = ssoConfig.default_role || 'member';
    
    for (const group of userGroups) {
      if (roleMapping[group]) {
        assignedRole = roleMapping[group];
        break;
      }
    }

    if (!existingUser) {
      if (!ssoConfig.auto_provision_users) {
        return new Response(JSON.stringify({ 
          error: 'User not found and auto-provisioning is disabled' 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Crear usuario en auth.users
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        email_confirm: true,
        user_metadata: {
          full_name: `${userFirstName} ${userLastName}`.trim(),
          sso_provider: ssoConfig.provider_type,
        },
      });

      if (authError) {
        console.error('Failed to create auth user:', authError);
        return new Response(JSON.stringify({ error: 'Failed to create user' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Crear perfil
      await supabaseAdmin.from('users').insert({
        id: authUser.user?.id,
        email: userEmail,
        full_name: `${userFirstName} ${userLastName}`.trim(),
      });

      // Crear membership
      await supabaseAdmin.from('memberships').insert({
        user_id: authUser.user?.id,
        organization_id: orgId,
        role: assignedRole,
      });

      existingUser = { id: authUser.user?.id };
    } else if (ssoConfig.auto_update_users) {
      // Actualizar datos del usuario
      await supabaseAdmin
        .from('users')
        .update({
          full_name: `${userFirstName} ${userLastName}`.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id);
    }

    // Generar magic link para login
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
    });

    if (linkError) {
      console.error('Failed to generate magic link:', linkError);
      return new Response(JSON.stringify({ error: 'Failed to create session' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Registrar sesión SSO
    await supabaseAdmin.from('sso_sessions').insert({
      sso_configuration_id: ssoConfig.id,
      user_id: existingUser.id,
      session_index: sessionIndex,
      name_id: nameId || userEmail,
      attributes_received: attributesReceived,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
      user_agent: req.headers.get('user-agent'),
    });

    // Extraer token del magic link
    const magicLinkUrl = new URL(linkData.properties?.action_link || '');
    const token = magicLinkUrl.hash.split('access_token=')[1]?.split('&')[0];
    
    // Redireccionar al frontend con el token
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://app.ip-nexus.com';
    const redirectUrl = `${frontendUrl}/auth/callback?access_token=${token}&type=sso`;

    return Response.redirect(redirectUrl, 302);

  } catch (error) {
    console.error('SSO Callback error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
