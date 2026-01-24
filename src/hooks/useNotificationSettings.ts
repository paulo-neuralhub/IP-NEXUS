// ============================================================
// IP-NEXUS - NOTIFICATION SETTINGS HOOK
// User notification preferences management
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export interface NotificationSettings {
  id: string;
  user_id: string;
  organization_id: string;
  
  // Channels
  email_enabled: boolean;
  email_address?: string;
  in_app_enabled: boolean;
  push_enabled: boolean;
  push_token?: string;
  
  // Digest
  digest_frequency: 'instant' | 'daily' | 'weekly' | 'none';
  digest_time: string;
  digest_day: number;
  
  // Filters
  min_priority: 'low' | 'medium' | 'high' | 'critical';
  muted_matter_ids: string[];
  
  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  
  created_at: string;
  updated_at: string;
}

export type NotificationSettingsUpdate = Partial<Omit<NotificationSettings, 'id' | 'user_id' | 'organization_id' | 'created_at' | 'updated_at'>>;

// Default settings for new users
const DEFAULT_SETTINGS: NotificationSettingsUpdate = {
  email_enabled: true,
  in_app_enabled: true,
  push_enabled: false,
  digest_frequency: 'daily',
  digest_time: '08:00:00',
  digest_day: 1,
  min_priority: 'low',
  muted_matter_ids: [],
  quiet_hours_enabled: false,
};

// Get current user's notification settings
export function useNotificationSettings() {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notification-settings', user?.id, currentOrganization?.id],
    queryFn: async () => {
      if (!user?.id || !currentOrganization?.id) return null;

      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', currentOrganization.id)
        .maybeSingle();

      if (error) throw error;

      // Return existing settings or create defaults
      if (data) {
        return data as NotificationSettings;
      }

      // Create default settings for user
      const { data: newSettings, error: insertError } = await supabase
        .from('user_notification_settings')
        .insert({
          user_id: user.id,
          organization_id: currentOrganization.id,
          ...DEFAULT_SETTINGS,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating default settings:', insertError);
        return null;
      }

      return newSettings as NotificationSettings;
    },
    enabled: !!user?.id && !!currentOrganization?.id,
  });
}

// Update notification settings
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: NotificationSettingsUpdate) => {
      if (!user?.id || !currentOrganization?.id) {
        throw new Error('No user or organization');
      }

      const { data, error } = await supabase
        .from('user_notification_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('organization_id', currentOrganization.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast.success('Preferencias actualizadas');
    },
    onError: (error) => {
      console.error('Error updating notification settings:', error);
      toast.error('Error al actualizar preferencias');
    },
  });
}

// Toggle email notifications
export function useToggleEmailNotifications() {
  const { mutate: update } = useUpdateNotificationSettings();

  return (enabled: boolean) => {
    update({ email_enabled: enabled });
  };
}

// Toggle in-app notifications
export function useToggleInAppNotifications() {
  const { mutate: update } = useUpdateNotificationSettings();

  return (enabled: boolean) => {
    update({ in_app_enabled: enabled });
  };
}

// Toggle push notifications
export function useTogglePushNotifications() {
  const { mutate: update } = useUpdateNotificationSettings();

  return (enabled: boolean) => {
    update({ push_enabled: enabled });
  };
}

// Mute matter
export function useMuteMatter() {
  const queryClient = useQueryClient();
  const { data: settings } = useNotificationSettings();
  const { mutate: update } = useUpdateNotificationSettings();

  return (matterId: string) => {
    if (!settings) return;
    
    const mutedIds = settings.muted_matter_ids || [];
    if (!mutedIds.includes(matterId)) {
      update({ muted_matter_ids: [...mutedIds, matterId] });
    }
  };
}

// Unmute matter
export function useUnmuteMatter() {
  const { data: settings } = useNotificationSettings();
  const { mutate: update } = useUpdateNotificationSettings();

  return (matterId: string) => {
    if (!settings) return;
    
    const mutedIds = settings.muted_matter_ids || [];
    update({ muted_matter_ids: mutedIds.filter((id) => id !== matterId) });
  };
}

// Check if matter is muted
export function useIsMatterMuted(matterId: string) {
  const { data: settings } = useNotificationSettings();
  return settings?.muted_matter_ids?.includes(matterId) || false;
}
