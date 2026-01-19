// src/hooks/use-settings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import {
  getOrganizationSettings,
  updateOrganizationSettings,
  getUserSettings,
  updateUserSettings,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
  type OrganizationSettings,
  type UserSettings,
} from '@/services/settings-service';
import { toast } from 'sonner';

// ============================================
// ORGANIZATION SETTINGS
// ============================================

export function useOrganizationSettings() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['organization-settings', currentOrganization?.id],
    queryFn: () => getOrganizationSettings(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateOrganizationSettings() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async ({
      category,
      updates,
    }: {
      category: keyof Omit<OrganizationSettings, 'id' | 'organization_id'>;
      updates: Record<string, any>;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      const success = await updateOrganizationSettings(
        currentOrganization.id,
        category,
        updates
      );
      if (!success) throw new Error('Failed to update settings');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-settings'] });
      toast.success('Configuración guardada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al guardar configuración');
    },
  });
}

// ============================================
// USER SETTINGS
// ============================================

export function useUserSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: () => getUserSettings(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      category,
      updates,
    }: {
      category: keyof Omit<UserSettings, 'id' | 'user_id'>;
      updates: Record<string, any>;
    }) => {
      if (!user?.id) throw new Error('No user');
      const success = await updateUserSettings(user.id, category, updates);
      if (!success) throw new Error('Failed to update settings');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast.success('Preferencias guardadas');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al guardar preferencias');
    },
  });
}

// ============================================
// ACTIVE SESSIONS
// ============================================

export function useActiveSessions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['active-sessions', user?.id],
    queryFn: () => getUserSessions(user!.id),
    enabled: !!user?.id,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user?.id) throw new Error('No user');
      const success = await revokeSession(sessionId, user.id);
      if (!success) throw new Error('Failed to revoke session');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
      toast.success('Sesión cerrada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al cerrar sesión');
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (exceptCurrentId?: string) => {
      if (!user?.id) throw new Error('No user');
      const success = await revokeAllSessions(user.id, exceptCurrentId);
      if (!success) throw new Error('Failed to revoke sessions');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
      toast.success('Todas las sesiones cerradas');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al cerrar sesiones');
    },
  });
}
