// ============================================================
// IP-NEXUS - Super Admin Hook
// Provides access control for super admin features
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/integrations/supabase/client';

export type SuperAdminModeType = 'super_admin' | 'backoffice' | 'demo' | 'simulate';

export interface SuperAdminMode {
  mode: SuperAdminModeType;
  tenantId?: string;
  tenantName?: string;
  subscription?: 'starter' | 'professional' | 'business' | 'enterprise';
  isSuperAdmin: boolean;
}

export interface SuperAdminPermissions {
  backoffice: boolean;
  demo: boolean;
  impersonate_tenant: boolean;
  simulate_subscription: boolean;
  view_all_data: boolean;
  manage_super_admins: boolean;
}

interface SuperAdminModeResponse {
  mode: string;
  tenant_id?: string;
  tenant_name?: string;
  subscription?: string;
  is_super_admin: boolean;
}

interface SetModeResponse {
  success: boolean;
  mode?: string;
  tenant_id?: string;
  subscription?: string;
  error?: string;
}

export function useSuperAdmin() {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [permissions, setPermissions] = useState<SuperAdminPermissions | null>(null);
  const [currentMode, setCurrentMode] = useState<SuperAdminMode | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if current user is Super Admin
  useEffect(() => {
    async function checkSuperAdmin() {
      if (!user) {
        setIsSuperAdmin(false);
        setPermissions(null);
        setCurrentMode(null);
        setLoading(false);
        return;
      }

      try {
        // Check super admin status
        const { data: isAdmin, error: adminError } = await supabase.rpc('is_super_admin');
        
        if (adminError) {
          console.error('Error checking super admin:', adminError);
          setIsSuperAdmin(false);
          setLoading(false);
          return;
        }

        setIsSuperAdmin(isAdmin || false);

        if (isAdmin) {
          // Get permissions
          const { data: perms } = await supabase.rpc('get_super_admin_permissions');
          if (perms && typeof perms === 'object' && !Array.isArray(perms)) {
            setPermissions(perms as unknown as SuperAdminPermissions);
          }

          // Get current mode
          const { data: modeData } = await supabase.rpc('get_super_admin_mode');
          if (modeData && typeof modeData === 'object' && !Array.isArray(modeData)) {
            const mode = modeData as unknown as SuperAdminModeResponse;
            setCurrentMode({
              mode: mode.mode as SuperAdminModeType,
              tenantId: mode.tenant_id,
              tenantName: mode.tenant_name,
              subscription: mode.subscription as SuperAdminMode['subscription'],
              isSuperAdmin: true,
            });
          }
        }
      } catch (err) {
        console.error('Super admin check failed:', err);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkSuperAdmin();
  }, [user]);

  // Change mode
  const setMode = useCallback(async (
    mode: SuperAdminModeType,
    tenantId?: string,
    subscription?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('set_super_admin_mode', {
        p_mode: mode,
        p_tenant_id: tenantId || null,
        p_subscription: subscription || null,
      });

      const response = data as unknown as SetModeResponse | null;

      if (error) {
        console.error('Error setting super admin mode:', error);
        return { data: null, error };
      }

      if (response?.success) {
        setCurrentMode({
          mode,
          tenantId,
          tenantName: undefined,
          subscription: subscription as SuperAdminMode['subscription'],
          isSuperAdmin: true,
        });
        
        // Force page reload to refresh all context
        window.location.reload();
      }

      return { data: response, error };
    } catch (err) {
      console.error('Exception in setMode:', err);
      return { data: null, error: err };
    }
  }, []);

  // Shortcuts for common modes
  const enterBackoffice = useCallback(() => setMode('backoffice'), [setMode]);
  const enterDemo = useCallback(() => setMode('demo'), [setMode]);
  const exitToSuperAdmin = useCallback(() => setMode('super_admin'), [setMode]);
  
  const simulateSubscription = useCallback((
    subscription: string, 
    tenantId?: string
  ) => setMode('simulate', tenantId, subscription), [setMode]);

  // Check if has specific permission
  const hasPermission = useCallback((
    permission: keyof SuperAdminPermissions
  ): boolean => {
    if (!isSuperAdmin || !permissions) return false;
    return permissions[permission] === true;
  }, [isSuperAdmin, permissions]);

  return {
    isSuperAdmin,
    permissions,
    currentMode,
    loading,
    setMode,
    enterBackoffice,
    enterDemo,
    exitToSuperAdmin,
    simulateSubscription,
    hasPermission,
  };
}
