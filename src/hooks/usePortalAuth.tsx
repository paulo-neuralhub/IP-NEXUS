/**
 * Portal Authentication Hook
 * Sistema de autenticación para clientes externos (portal público)
 */

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

// =============================================
// TYPES
// =============================================

interface PortalBranding {
  id: string;
  slug: string;
  name: string;
  logo_url?: string;
  primary_color?: string;
  organization_id: string;
}

export interface PortalUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Record<string, boolean>;
  portal: PortalBranding;
}

interface PortalSession {
  token: string;
  odisplayP: string;
  expiresAt: number;
}

interface PortalAuthContextType {
  user: PortalUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, portalSlug: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// =============================================
// CONTEXT
// =============================================

const PortalAuthContext = createContext<PortalAuthContextType | null>(null);

// =============================================
// PROVIDER
// =============================================

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validar sesión existente
  const validateSession = useCallback(async (sessionData: PortalSession): Promise<PortalUser | null> => {
    // Verificar expiración
    if (Date.now() > sessionData.expiresAt) {
      localStorage.removeItem('portal_session');
      return null;
    }

    try {
      // Verificar que el usuario existe y está activo
      const { data: portalUser, error } = await supabase
        .from('portal_users')
        .select(`
          id, email, name, role, permissions, status,
          portal:client_portals!portal_id(
            id, portal_slug, portal_name, branding_config, 
            organization_id, is_active
          )
        `)
        .eq('id', sessionData.odisplayP)
        .eq('status', 'active')
        .single();

      if (error || !portalUser || !portalUser.portal) {
        localStorage.removeItem('portal_session');
        return null;
      }

      const portal = portalUser.portal as {
        id: string;
        portal_slug: string;
        portal_name: string;
        branding_config: Json;
        organization_id: string;
        is_active: boolean;
      };

      if (!portal.is_active) {
        localStorage.removeItem('portal_session');
        return null;
      }

      const branding = portal.branding_config as Record<string, unknown> || {};

      return {
        id: portalUser.id,
        email: portalUser.email || '',
        name: portalUser.name || '',
        role: portalUser.role || 'viewer',
        permissions: (portalUser.permissions as Record<string, boolean>) || {},
        portal: {
          id: portal.id,
          slug: portal.portal_slug,
          name: portal.portal_name || '',
          logo_url: branding.logo_url as string | undefined,
          primary_color: branding.primary_color as string | undefined,
          organization_id: portal.organization_id
        }
      };
    } catch {
      localStorage.removeItem('portal_session');
      return null;
    }
  }, []);

  // Inicialización
  useEffect(() => {
    const initAuth = async () => {
      const savedSession = localStorage.getItem('portal_session');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession) as PortalSession;
          const validUser = await validateSession(session);
          if (validUser) {
            setUser(validUser);
          }
        } catch {
          localStorage.removeItem('portal_session');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [validateSession]);

  // Login - Enviar magic link
  const login = useCallback(async (email: string, portalSlug: string) => {
    // Buscar usuario en portal_users
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
      throw new Error('Usuario no encontrado o sin acceso');
    }

    const portal = portalUser.portal as { 
      id: string; 
      portal_slug: string; 
      portal_name: string;
      is_active: boolean;
    };

    if (!portal || portal.portal_slug !== portalSlug) {
      throw new Error('Usuario no tiene acceso a este portal');
    }

    if (!portal.is_active) {
      throw new Error('Este portal está desactivado');
    }

    // Generar magic link token
    const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    const { error: updateError } = await supabase
      .from('portal_users')
      .update({
        magic_link_token: token,
        magic_link_expires_at: expiresAt.toISOString()
      })
      .eq('id', portalUser.id);

    if (updateError) {
      throw new Error('Error al generar enlace de acceso');
    }

    // Enviar email con magic link
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          template: 'portal-magic-link',
          data: {
            name: portalUser.name,
            portalName: portal.portal_name,
            magicLink: `${window.location.origin}/portal/${portalSlug}?token=${token}`,
            expiresIn: '15 minutos'
          }
        }
      });
    } catch {
      // Si falla el email, igual continuar (para desarrollo)
      console.warn('No se pudo enviar email, usar token directamente:', token);
    }
  }, []);

  // Verificar magic link
  const verifyMagicLink = useCallback(async (token: string): Promise<boolean> => {
    const { data: portalUser, error } = await supabase
      .from('portal_users')
      .select(`
        id, email, name, role, permissions,
        portal:client_portals!portal_id(
          id, portal_slug, portal_name, branding_config, 
          organization_id, is_active
        )
      `)
      .eq('magic_link_token', token)
      .gt('magic_link_expires_at', new Date().toISOString())
      .single();

    if (error || !portalUser) {
      throw new Error('Enlace inválido o expirado');
    }

    const portal = portalUser.portal as {
      id: string;
      portal_slug: string;
      portal_name: string;
      branding_config: Json;
      organization_id: string;
      is_active: boolean;
    };

    if (!portal || !portal.is_active) {
      throw new Error('Este portal está desactivado');
    }

    // Limpiar token y actualizar último login
    await supabase
      .from('portal_users')
      .update({
        magic_link_token: null,
        magic_link_expires_at: null,
        last_login_at: new Date().toISOString(),
        status: 'active'
      })
      .eq('id', portalUser.id);

    // Actualizar último acceso del portal
    await supabase
      .from('client_portals')
      .update({
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', portal.id);

    // Crear sesión local
    const sessionToken = crypto.randomUUID();
    const sessionData: PortalSession = {
      token: sessionToken,
      odisplayP: portalUser.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 días
    };

    localStorage.setItem('portal_session', JSON.stringify(sessionData));

    const branding = portal.branding_config as Record<string, unknown> || {};

    setUser({
      id: portalUser.id,
      email: portalUser.email || '',
      name: portalUser.name || '',
      role: portalUser.role || 'viewer',
      permissions: (portalUser.permissions as Record<string, boolean>) || {},
      portal: {
        id: portal.id,
        slug: portal.portal_slug,
        name: portal.portal_name || '',
        logo_url: branding.logo_url as string | undefined,
        primary_color: branding.primary_color as string | undefined,
        organization_id: portal.organization_id
      }
    });

    // Log de actividad (skip type check for portal_activity_log)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('portal_activity_log').insert({
      portal_id: portal.id,
      actor_type: 'portal_user',
      actor_external_id: portalUser.id,
      actor_name: portalUser.name || portalUser.email,
      action: 'login',
      details: { method: 'magic_link' }
    });

    return true;
  }, []);

  // Logout
  const logout = useCallback(async () => {
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('portal_activity_log').insert({
        portal_id: user.portal.id,
        actor_type: 'portal_user',
        actor_external_id: user.id,
        actor_name: user.name || user.email,
        action: 'logout',
        details: {}
      });
    }
    localStorage.removeItem('portal_session');
    setUser(null);
    toast.success('Sesión cerrada');
  }, [user]);

  // Refrescar sesión
  const refreshSession = useCallback(async () => {
    const savedSession = localStorage.getItem('portal_session');
    if (savedSession) {
      const session = JSON.parse(savedSession) as PortalSession;
      const validUser = await validateSession(session);
      if (validUser) {
        setUser(validUser);
      } else {
        setUser(null);
      }
    }
  }, [validateSession]);

  return (
    <PortalAuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      verifyMagicLink,
      logout,
      refreshSession
    }}>
      {children}
    </PortalAuthContext.Provider>
  );
}

// =============================================
// HOOK
// =============================================

export function usePortalAuth() {
  const context = useContext(PortalAuthContext);
  if (!context) {
    throw new Error('usePortalAuth must be used within PortalAuthProvider');
  }
  return context;
}
