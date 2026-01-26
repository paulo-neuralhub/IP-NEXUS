/**
 * Portal Authentication Library
 * Funciones para autenticación del portal cliente
 */

import { supabase } from '@/integrations/supabase/client';

const PORTAL_SESSION_KEY = 'portal_session';
const PORTAL_AUTH_FUNCTION = 'portal-auth';

interface PortalUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Record<string, boolean>;
  portal: {
    id: string;
    slug: string;
    name: string;
    logo_url?: string;
    primary_color?: string;
    organization_id: string;
  };
  contactId?: string;
}

interface PortalSession {
  token: string;
  userId: string;
  expiresAt: number;
}

interface LoginResponse {
  token: string;
  expires_at: string;
  user: PortalUser;
}

interface ValidateResponse {
  valid: boolean;
  user?: PortalUser;
}

// =============================================
// AUTHENTICATION FUNCTIONS
// =============================================

/**
 * Login con email y contraseña
 */
export async function portalLogin(email: string, password: string, portalSlug: string): Promise<PortalUser> {
  const { data, error } = await supabase.functions.invoke<LoginResponse>(PORTAL_AUTH_FUNCTION, {
    body: {
      action: 'login',
      email,
      password,
      portal_slug: portalSlug,
    }
  });

  if (error || !data?.token) {
    throw new Error((data as any)?.error || error?.message || 'Error al iniciar sesión');
  }

  // Guardar sesión
  saveSession({
    token: data.token,
    userId: data.user.id,
    expiresAt: new Date(data.expires_at).getTime(),
  });

  return data.user;
}

/**
 * Solicitar magic link
 */
export async function portalRequestMagicLink(email: string, portalSlug: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke(PORTAL_AUTH_FUNCTION, {
    body: {
      action: 'magic_link',
      email,
      portal_slug: portalSlug,
    }
  });

  if (error) {
    throw new Error(error.message || 'Error al enviar enlace');
  }

  // En desarrollo, mostrar el token en consola
  if ((data as any)?._dev_token) {
    console.log('🔓 Dev Magic Link Token:', (data as any)._dev_token);
  }
}

/**
 * Verificar magic link
 */
export async function portalVerifyMagicLink(token: string): Promise<PortalUser> {
  const { data, error } = await supabase.functions.invoke<LoginResponse>(PORTAL_AUTH_FUNCTION, {
    body: {
      action: 'verify_magic_link',
      token,
    }
  });

  if (error || !data?.token) {
    throw new Error((data as any)?.error || error?.message || 'Enlace inválido o expirado');
  }

  // Guardar sesión
  saveSession({
    token: data.token,
    userId: data.user.id,
    expiresAt: new Date(data.expires_at).getTime(),
  });

  return data.user;
}

/**
 * Cerrar sesión
 */
export async function portalLogout(): Promise<void> {
  const session = getSession();
  
  if (session?.token) {
    try {
      await supabase.functions.invoke(PORTAL_AUTH_FUNCTION, {
        body: {
          action: 'logout',
          token: session.token,
        }
      });
    } catch (e) {
      // Ignorar errores al cerrar sesión
      console.warn('Error logging out:', e);
    }
  }

  clearSession();
}

/**
 * Validar sesión actual
 */
export async function portalValidateSession(): Promise<PortalUser | null> {
  const session = getSession();
  
  if (!session) return null;

  // Verificar expiración local
  if (Date.now() > session.expiresAt) {
    clearSession();
    return null;
  }

  // Validar con el servidor
  const { data, error } = await supabase.functions.invoke<ValidateResponse>(PORTAL_AUTH_FUNCTION, {
    body: {
      action: 'validate',
      token: session.token,
    }
  });

  if (error || !data?.valid || !data?.user) {
    clearSession();
    return null;
  }

  return data.user;
}

/**
 * Verificar si está autenticado (solo local)
 */
export function portalIsAuthenticated(): boolean {
  const session = getSession();
  return session !== null && Date.now() < session.expiresAt;
}

/**
 * Solicitar reset de contraseña
 */
export async function portalRequestPasswordReset(email: string, portalSlug: string): Promise<void> {
  const { error } = await supabase.functions.invoke(PORTAL_AUTH_FUNCTION, {
    body: {
      action: 'reset_password',
      email,
      portal_slug: portalSlug,
    }
  });

  if (error) {
    throw new Error(error.message || 'Error al solicitar reset');
  }
}

/**
 * Establecer nueva contraseña
 */
export async function portalSetPassword(token: string, newPassword: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke(PORTAL_AUTH_FUNCTION, {
    body: {
      action: 'set_password',
      token,
      new_password: newPassword,
    }
  });

  if (error || !(data as any)?.success) {
    throw new Error((data as any)?.error || error?.message || 'Error al cambiar contraseña');
  }
}

// =============================================
// SESSION MANAGEMENT
// =============================================

function saveSession(session: PortalSession): void {
  localStorage.setItem(PORTAL_SESSION_KEY, JSON.stringify(session));
}

function getSession(): PortalSession | null {
  try {
    const stored = localStorage.getItem(PORTAL_SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as PortalSession;
  } catch {
    return null;
  }
}

function clearSession(): void {
  localStorage.removeItem(PORTAL_SESSION_KEY);
}

/**
 * Obtener token actual
 */
export function getPortalToken(): string | null {
  return getSession()?.token || null;
}
