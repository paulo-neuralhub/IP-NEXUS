/**
 * SSO Test Connection Edge Function
 * Prueba la conectividad con el IdP configurado
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
    const { organizationId } = await req.json();
    
    if (!organizationId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Organization ID required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Autenticar usuario
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Obtener configuración SSO
    const { data: ssoConfig, error: configError } = await supabase
      .from('sso_configurations')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (configError || !ssoConfig) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'SSO configuration not found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const checks: { name: string; status: 'ok' | 'warning' | 'error'; message: string }[] = [];

    // Verificar según tipo de proveedor
    if (ssoConfig.provider_type === 'saml_generic') {
      // Verificar configuración SAML
      if (!ssoConfig.saml_sso_url) {
        checks.push({ 
          name: 'SSO URL', 
          status: 'error', 
          message: 'SSO URL no configurada' 
        });
      } else {
        try {
          const response = await fetch(ssoConfig.saml_sso_url, { method: 'HEAD' });
          checks.push({ 
            name: 'SSO URL', 
            status: response.ok || response.status === 405 ? 'ok' : 'warning', 
            message: response.ok ? 'URL accesible' : `Status: ${response.status}` 
          });
        } catch (e) {
          checks.push({ 
            name: 'SSO URL', 
            status: 'error', 
            message: 'No se pudo conectar a la URL' 
          });
        }
      }

      if (!ssoConfig.saml_certificate) {
        checks.push({ 
          name: 'Certificado', 
          status: 'error', 
          message: 'Certificado X.509 no configurado' 
        });
      } else {
        // Verificar formato básico del certificado
        const certContent = ssoConfig.saml_certificate;
        if (certContent.includes('BEGIN CERTIFICATE')) {
          checks.push({ 
            name: 'Certificado', 
            status: 'ok', 
            message: 'Certificado en formato correcto' 
          });
        } else {
          checks.push({ 
            name: 'Certificado', 
            status: 'warning', 
            message: 'El certificado puede no estar en formato PEM correcto' 
          });
        }
      }

      // Verificar metadata URL si está configurada
      if (ssoConfig.saml_metadata_url) {
        try {
          const response = await fetch(ssoConfig.saml_metadata_url);
          if (response.ok) {
            const text = await response.text();
            if (text.includes('EntityDescriptor')) {
              checks.push({ 
                name: 'Metadata', 
                status: 'ok', 
                message: 'Metadata XML válido' 
              });
            } else {
              checks.push({ 
                name: 'Metadata', 
                status: 'warning', 
                message: 'La respuesta no parece ser un XML de metadata SAML' 
              });
            }
          } else {
            checks.push({ 
              name: 'Metadata', 
              status: 'error', 
              message: `Error al obtener metadata: ${response.status}` 
            });
          }
        } catch (e) {
          checks.push({ 
            name: 'Metadata', 
            status: 'error', 
            message: 'No se pudo conectar al URL de metadata' 
          });
        }
      }

    } else {
      // Verificar configuración OIDC
      if (!ssoConfig.oidc_client_id) {
        checks.push({ 
          name: 'Client ID', 
          status: 'error', 
          message: 'Client ID no configurado' 
        });
      } else {
        checks.push({ 
          name: 'Client ID', 
          status: 'ok', 
          message: 'Client ID configurado' 
        });
      }

      if (!ssoConfig.oidc_issuer_url) {
        checks.push({ 
          name: 'Issuer URL', 
          status: 'error', 
          message: 'Issuer URL no configurada' 
        });
      } else {
        // Intentar obtener .well-known
        try {
          const wellKnownUrl = `${ssoConfig.oidc_issuer_url}/.well-known/openid-configuration`;
          const response = await fetch(wellKnownUrl);
          
          if (response.ok) {
            const config = await response.json();
            
            if (config.authorization_endpoint && config.token_endpoint) {
              checks.push({ 
                name: 'OpenID Discovery', 
                status: 'ok', 
                message: 'Configuración OIDC descubierta correctamente' 
              });
              
              // Guardar endpoints descubiertos
              await supabase
                .from('sso_configurations')
                .update({
                  oidc_authorization_url: config.authorization_endpoint,
                  oidc_token_url: config.token_endpoint,
                  oidc_userinfo_url: config.userinfo_endpoint,
                })
                .eq('id', ssoConfig.id);
                
            } else {
              checks.push({ 
                name: 'OpenID Discovery', 
                status: 'warning', 
                message: 'Configuración incompleta en .well-known' 
              });
            }
          } else {
            checks.push({ 
              name: 'OpenID Discovery', 
              status: 'warning', 
              message: 'No se encontró .well-known/openid-configuration' 
            });
          }
        } catch (e) {
          checks.push({ 
            name: 'OpenID Discovery', 
            status: 'error', 
            message: 'Error al conectar con el issuer' 
          });
        }
      }
    }

    // Verificar dominios permitidos
    const allowedDomains = ssoConfig.allowed_domains as string[] || [];
    if (allowedDomains.length === 0) {
      checks.push({ 
        name: 'Dominios', 
        status: 'warning', 
        message: 'No hay dominios restringidos - cualquier email puede acceder' 
      });
    } else {
      checks.push({ 
        name: 'Dominios', 
        status: 'ok', 
        message: `Restringido a: ${allowedDomains.join(', ')}` 
      });
    }

    // Determinar resultado general
    const hasErrors = checks.some(c => c.status === 'error');
    const hasWarnings = checks.some(c => c.status === 'warning');

    return new Response(JSON.stringify({ 
      success: !hasErrors,
      status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok',
      checks,
      message: hasErrors 
        ? 'Hay errores de configuración que deben corregirse'
        : hasWarnings
        ? 'La configuración tiene advertencias pero puede funcionar'
        : 'Configuración SSO correcta',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('SSO Test Connection error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false, 
      error: message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
