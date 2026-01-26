/**
 * Portal Authentication Edge Function
 * Sistema de autenticación independiente para clientes del portal
 * 
 * Acciones:
 * - login: Email/password login
 * - magic_link: Enviar magic link
 * - verify_magic_link: Verificar token
 * - logout: Cerrar sesión
 * - validate: Validar token de sesión
 * - reset_password: Solicitar reset
 * - set_password: Establecer nueva contraseña
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Rate limiting simple (en producción usar Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action, ...params } = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    switch (action) {
      // =============================================
      // LOGIN CON EMAIL/PASSWORD
      // =============================================
      case 'login': {
        const { email, password, portal_slug } = params;
        
        if (!email || !password || !portal_slug) {
          return jsonResponse({ error: 'Faltan campos requeridos' }, 400);
        }

        // Rate limiting
        const rateLimitKey = `login:${email}:${clientIP}`;
        if (!checkRateLimit(rateLimitKey)) {
          return jsonResponse({ error: 'Demasiados intentos. Intenta en 15 minutos.' }, 429);
        }

        // Buscar usuario
        const { data: portalUser, error: userError } = await supabase
          .from('portal_users')
          .select(`
            id, email, name, role, permissions, password_hash, status,
            portal:client_portals!portal_id(
              id, portal_slug, portal_name, branding_config, 
              organization_id, is_active, client_id
            )
          `)
          .eq('email', email.toLowerCase())
          .single();

        if (userError || !portalUser) {
          return jsonResponse({ error: 'Email o contraseña incorrectos' }, 401);
        }

        const portal = portalUser.portal as any;
        
        if (!portal || portal.portal_slug !== portal_slug) {
          return jsonResponse({ error: 'Usuario no tiene acceso a este portal' }, 401);
        }

        if (!portal.is_active) {
          return jsonResponse({ error: 'Este portal está desactivado' }, 403);
        }

        if (portalUser.status === 'suspended') {
          return jsonResponse({ error: 'Tu cuenta está suspendida' }, 403);
        }

        if (portalUser.status === 'pending') {
          return jsonResponse({ error: 'Verifica tu email primero' }, 403);
        }

        // Verificar password
        if (!portalUser.password_hash) {
          return jsonResponse({ error: 'Usa el enlace mágico para acceder' }, 400);
        }

        const passwordValid = await bcrypt.compare(password, portalUser.password_hash);
        if (!passwordValid) {
          return jsonResponse({ error: 'Email o contraseña incorrectos' }, 401);
        }

        // Crear sesión
        const sessionToken = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        await supabase.from('portal_sessions').insert({
          portal_user_id: portalUser.id,
          token: sessionToken,
          ip_address: clientIP,
          user_agent: req.headers.get('user-agent'),
          expires_at: expiresAt.toISOString(),
        });

        // Actualizar último login
        await supabase
          .from('portal_users')
          .update({
            last_login_at: new Date().toISOString(),
            login_count: (portalUser as any).login_count ? (portalUser as any).login_count + 1 : 1,
          })
          .eq('id', portalUser.id);

        // Log de actividad
        await supabase.from('portal_activity_log').insert({
          portal_id: portal.id,
          actor_type: 'portal_user',
          actor_external_id: portalUser.id,
          actor_name: portalUser.name || portalUser.email,
          action: 'login',
          details: { method: 'password', ip: clientIP }
        });

        const branding = portal.branding_config as Record<string, unknown> || {};

        return jsonResponse({
          token: sessionToken,
          expires_at: expiresAt.toISOString(),
          user: {
            id: portalUser.id,
            email: portalUser.email,
            name: portalUser.name,
            role: portalUser.role,
            permissions: portalUser.permissions,
            portal: {
              id: portal.id,
              slug: portal.portal_slug,
              name: portal.portal_name,
              logo_url: branding.logo_url,
              primary_color: branding.primary_color,
              organization_id: portal.organization_id,
            },
            contactId: portal.client_id,
          }
        });
      }

      // =============================================
      // ENVIAR MAGIC LINK
      // =============================================
      case 'magic_link': {
        const { email, portal_slug } = params;
        
        if (!email || !portal_slug) {
          return jsonResponse({ error: 'Faltan campos requeridos' }, 400);
        }

        // Rate limiting
        const rateLimitKey = `magic:${email}`;
        if (!checkRateLimit(rateLimitKey, 3, 5 * 60 * 1000)) { // 3 intentos en 5 min
          return jsonResponse({ error: 'Demasiados intentos. Intenta en 5 minutos.' }, 429);
        }

        // Buscar usuario
        const { data: portalUser, error } = await supabase
          .from('portal_users')
          .select(`
            id, email, name, status,
            portal:client_portals!portal_id(
              id, portal_slug, portal_name, is_active
            )
          `)
          .eq('email', email.toLowerCase())
          .eq('status', 'active')
          .single();

        if (error || !portalUser) {
          // Por seguridad, no revelar si el email existe
          return jsonResponse({ success: true, message: 'Si el email está registrado, recibirás un enlace' });
        }

        const portal = portalUser.portal as any;

        if (!portal || portal.portal_slug !== portal_slug || !portal.is_active) {
          return jsonResponse({ success: true, message: 'Si el email está registrado, recibirás un enlace' });
        }

        // Generar token
        const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        await supabase
          .from('portal_users')
          .update({
            magic_link_token: token,
            magic_link_expires_at: expiresAt.toISOString()
          })
          .eq('id', portalUser.id);

        // Enviar email
        const baseUrl = Deno.env.get('SITE_URL') || req.headers.get('origin') || 'https://ip-nexus.com';
        const magicLink = `${baseUrl}/portal/${portal_slug}?token=${token}`;

        try {
          await supabase.functions.invoke('send-email', {
            body: {
              to: email,
              template: 'portal-magic-link',
              data: {
                name: portalUser.name || email,
                portalName: portal.portal_name,
                magicLink,
                expiresIn: '15 minutos'
              }
            }
          });
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          // Continuar aunque falle el email (para desarrollo)
        }

        return jsonResponse({ 
          success: true, 
          message: 'Si el email está registrado, recibirás un enlace',
          // Solo en desarrollo:
          _dev_token: Deno.env.get('ENVIRONMENT') === 'development' ? token : undefined
        });
      }

      // =============================================
      // VERIFICAR MAGIC LINK
      // =============================================
      case 'verify_magic_link': {
        const { token } = params;
        
        if (!token) {
          return jsonResponse({ error: 'Token requerido' }, 400);
        }

        const { data: portalUser, error } = await supabase
          .from('portal_users')
          .select(`
            id, email, name, role, permissions,
            portal:client_portals!portal_id(
              id, portal_slug, portal_name, branding_config, 
              organization_id, is_active, client_id
            )
          `)
          .eq('magic_link_token', token)
          .gt('magic_link_expires_at', new Date().toISOString())
          .single();

        if (error || !portalUser) {
          return jsonResponse({ error: 'Enlace inválido o expirado' }, 401);
        }

        const portal = portalUser.portal as any;

        if (!portal || !portal.is_active) {
          return jsonResponse({ error: 'Este portal está desactivado' }, 403);
        }

        // Limpiar token y marcar email verificado
        await supabase
          .from('portal_users')
          .update({
            magic_link_token: null,
            magic_link_expires_at: null,
            email_verified: true,
            status: 'active',
            last_login_at: new Date().toISOString(),
          })
          .eq('id', portalUser.id);

        // Crear sesión
        const sessionToken = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

        await supabase.from('portal_sessions').insert({
          portal_user_id: portalUser.id,
          token: sessionToken,
          ip_address: clientIP,
          user_agent: req.headers.get('user-agent'),
          expires_at: expiresAt.toISOString(),
        });

        // Actualizar último acceso del portal
        await supabase
          .from('client_portals')
          .update({ last_accessed_at: new Date().toISOString() })
          .eq('id', portal.id);

        // Log de actividad
        await supabase.from('portal_activity_log').insert({
          portal_id: portal.id,
          actor_type: 'portal_user',
          actor_external_id: portalUser.id,
          actor_name: portalUser.name || portalUser.email,
          action: 'login',
          details: { method: 'magic_link', ip: clientIP }
        });

        const branding = portal.branding_config as Record<string, unknown> || {};

        return jsonResponse({
          token: sessionToken,
          expires_at: expiresAt.toISOString(),
          user: {
            id: portalUser.id,
            email: portalUser.email,
            name: portalUser.name,
            role: portalUser.role,
            permissions: portalUser.permissions,
            portal: {
              id: portal.id,
              slug: portal.portal_slug,
              name: portal.portal_name,
              logo_url: branding.logo_url,
              primary_color: branding.primary_color,
              organization_id: portal.organization_id,
            },
            contactId: portal.client_id,
          }
        });
      }

      // =============================================
      // LOGOUT
      // =============================================
      case 'logout': {
        const { token } = params;
        
        if (!token) {
          return jsonResponse({ success: true });
        }

        // Revocar sesión
        await supabase
          .from('portal_sessions')
          .update({ revoked_at: new Date().toISOString() })
          .eq('token', token);

        return jsonResponse({ success: true });
      }

      // =============================================
      // VALIDAR TOKEN
      // =============================================
      case 'validate': {
        const { token } = params;
        
        if (!token) {
          return jsonResponse({ valid: false }, 401);
        }

        // Buscar sesión activa
        const { data: session, error } = await supabase
          .from('portal_sessions')
          .select(`
            id, expires_at,
            portal_user:portal_users!portal_user_id(
              id, email, name, role, permissions, status,
              portal:client_portals!portal_id(
                id, portal_slug, portal_name, branding_config, 
                organization_id, is_active, client_id
              )
            )
          `)
          .eq('token', token)
          .is('revoked_at', null)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error || !session) {
          return jsonResponse({ valid: false }, 401);
        }

        const portalUser = session.portal_user as any;
        const portal = portalUser?.portal;

        if (!portalUser || portalUser.status !== 'active' || !portal?.is_active) {
          return jsonResponse({ valid: false }, 401);
        }

        const branding = portal.branding_config as Record<string, unknown> || {};

        return jsonResponse({
          valid: true,
          user: {
            id: portalUser.id,
            email: portalUser.email,
            name: portalUser.name,
            role: portalUser.role,
            permissions: portalUser.permissions,
            portal: {
              id: portal.id,
              slug: portal.portal_slug,
              name: portal.portal_name,
              logo_url: branding.logo_url,
              primary_color: branding.primary_color,
              organization_id: portal.organization_id,
            },
            contactId: portal.client_id,
          }
        });
      }

      // =============================================
      // SOLICITAR RESET DE PASSWORD
      // =============================================
      case 'reset_password': {
        const { email, portal_slug } = params;
        
        if (!email || !portal_slug) {
          return jsonResponse({ error: 'Faltan campos requeridos' }, 400);
        }

        // Rate limiting
        const rateLimitKey = `reset:${email}`;
        if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) { // 3 intentos en 1 hora
          return jsonResponse({ error: 'Demasiados intentos. Intenta más tarde.' }, 429);
        }

        const { data: portalUser } = await supabase
          .from('portal_users')
          .select(`
            id, email, name,
            portal:client_portals!portal_id(portal_slug, portal_name, is_active)
          `)
          .eq('email', email.toLowerCase())
          .single();

        if (!portalUser) {
          return jsonResponse({ success: true, message: 'Si el email está registrado, recibirás instrucciones' });
        }

        const portal = portalUser.portal as any;
        if (!portal || portal.portal_slug !== portal_slug || !portal.is_active) {
          return jsonResponse({ success: true, message: 'Si el email está registrado, recibirás instrucciones' });
        }

        // Generar token de reset
        const resetToken = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await supabase
          .from('portal_users')
          .update({
            reset_token: resetToken,
            reset_token_expires_at: expiresAt.toISOString()
          })
          .eq('id', portalUser.id);

        // Enviar email
        const baseUrl = Deno.env.get('SITE_URL') || req.headers.get('origin') || 'https://ip-nexus.com';
        const resetLink = `${baseUrl}/portal/${portal_slug}/reset-password?token=${resetToken}`;

        try {
          await supabase.functions.invoke('send-email', {
            body: {
              to: email,
              template: 'portal-password-reset',
              data: {
                name: portalUser.name || email,
                portalName: portal.portal_name,
                resetLink,
                expiresIn: '1 hora'
              }
            }
          });
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }

        return jsonResponse({ 
          success: true, 
          message: 'Si el email está registrado, recibirás instrucciones' 
        });
      }

      // =============================================
      // ESTABLECER NUEVA PASSWORD
      // =============================================
      case 'set_password': {
        const { token, new_password } = params;
        
        if (!token || !new_password) {
          return jsonResponse({ error: 'Faltan campos requeridos' }, 400);
        }

        if (new_password.length < 8) {
          return jsonResponse({ error: 'La contraseña debe tener al menos 8 caracteres' }, 400);
        }

        const { data: portalUser, error } = await supabase
          .from('portal_users')
          .select('id, email')
          .eq('reset_token', token)
          .gt('reset_token_expires_at', new Date().toISOString())
          .single();

        if (error || !portalUser) {
          return jsonResponse({ error: 'Token inválido o expirado' }, 401);
        }

        // Hash del password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(new_password, salt);

        await supabase
          .from('portal_users')
          .update({
            password_hash: passwordHash,
            reset_token: null,
            reset_token_expires_at: null,
            status: 'active'
          })
          .eq('id', portalUser.id);

        return jsonResponse({ success: true, message: 'Contraseña actualizada correctamente' });
      }

      // =============================================
      // INVITAR USUARIO AL PORTAL
      // =============================================
      case 'invite': {
        const { email, portal_id, name, role, permissions, send_email } = params;
        
        // Verificar autorización (debe ser admin del tenant)
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
          return jsonResponse({ error: 'No autorizado' }, 401);
        }

        // Verificar que el portal existe
        const { data: portal } = await supabase
          .from('client_portals')
          .select('id, portal_slug, portal_name, organization_id, is_active')
          .eq('id', portal_id)
          .single();

        if (!portal) {
          return jsonResponse({ error: 'Portal no encontrado' }, 404);
        }

        // Verificar si ya existe
        const { data: existing } = await supabase
          .from('portal_users')
          .select('id')
          .eq('portal_id', portal_id)
          .eq('email', email.toLowerCase())
          .single();

        if (existing) {
          return jsonResponse({ error: 'Este email ya tiene acceso al portal' }, 400);
        }

        // Crear usuario
        const inviteToken = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

        const { data: newUser, error: createError } = await supabase
          .from('portal_users')
          .insert({
            portal_id,
            email: email.toLowerCase(),
            name: name || '',
            role: role || 'viewer',
            permissions: permissions || {
              view_matters: true,
              view_documents: true,
              download_documents: true,
              view_deadlines: true,
              view_invoices: true,
              pay_invoices: false,
              send_messages: true
            },
            status: 'pending',
            magic_link_token: inviteToken,
            magic_link_expires_at: expiresAt.toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          return jsonResponse({ error: 'Error al crear usuario' }, 500);
        }

        // Enviar email de invitación
        if (send_email !== false) {
          const baseUrl = Deno.env.get('SITE_URL') || req.headers.get('origin') || 'https://ip-nexus.com';
          const inviteLink = `${baseUrl}/portal/${portal.portal_slug}?token=${inviteToken}`;

          try {
            await supabase.functions.invoke('send-email', {
              body: {
                to: email,
                template: 'portal-invitation',
                data: {
                  name: name || email,
                  portalName: portal.portal_name,
                  inviteLink,
                  expiresIn: '7 días'
                }
              }
            });
          } catch (emailError) {
            console.error('Error sending invitation:', emailError);
          }
        }

        return jsonResponse({ 
          success: true, 
          user: newUser,
          message: send_email !== false 
            ? 'Invitación enviada' 
            : 'Usuario creado (sin email)'
        });
      }

      default:
        return jsonResponse({ error: 'Acción no válida' }, 400);
    }
  } catch (error) {
    console.error('Portal auth error:', error);
    return jsonResponse({ error: 'Error interno del servidor' }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
