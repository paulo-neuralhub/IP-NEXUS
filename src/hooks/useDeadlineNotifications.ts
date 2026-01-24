// ============================================================
// IP-NEXUS - DEADLINE NOTIFICATIONS HOOK
// In-app notifications for deadlines
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export interface DeadlineNotification {
  id: string;
  organization_id: string;
  user_id: string;
  entity_type: 'deadline' | 'matter' | 'invoice' | 'task' | 'system';
  entity_id?: string;
  deadline_id?: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action_url?: string;
  status: 'pending' | 'sent' | 'read' | 'dismissed';
  channel: 'email' | 'in_app' | 'push';
  scheduled_at?: string;
  sent_at?: string;
  read_at?: string;
  dismissed_at?: string;
  created_at: string;
}

// Get all notifications for current user
export function useDeadlineNotifications(limit: number = 50) {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['deadline-notifications', user?.id, currentOrganization?.id, limit],
    queryFn: async () => {
      if (!user?.id || !currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('deadline_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', currentOrganization.id)
        .eq('channel', 'in_app')
        .in('status', ['pending', 'sent', 'read'])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as DeadlineNotification[];
    },
    enabled: !!user?.id && !!currentOrganization?.id,
  });
}

// Get unread notification count
export function useUnreadNotificationCount() {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unread-notification-count', user?.id, currentOrganization?.id],
    queryFn: async () => {
      if (!user?.id || !currentOrganization?.id) return 0;

      const { count, error } = await supabase
        .from('deadline_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('organization_id', currentOrganization.id)
        .eq('channel', 'in_app')
        .in('status', ['pending', 'sent']);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id && !!currentOrganization?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Mark notification as read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('deadline_notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

// Mark all notifications as read
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id || !currentOrganization?.id) return;

      const { error } = await supabase
        .from('deadline_notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('organization_id', currentOrganization.id)
        .eq('channel', 'in_app')
        .in('status', ['pending', 'sent']);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
      toast.success('Notificaciones marcadas como leídas');
    },
  });
}

// Dismiss notification
export function useDismissNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('deadline_notifications')
        .update({
          status: 'dismissed',
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

// Priority icon and color helpers
export const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'critical':
      return { icon: '🔴', color: 'text-destructive', bgColor: 'bg-destructive/10' };
    case 'high':
      return { icon: '🟠', color: 'text-orange-500', bgColor: 'bg-orange-500/10' };
    case 'medium':
      return { icon: '🟡', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' };
    default:
      return { icon: '🟢', color: 'text-green-500', bgColor: 'bg-green-500/10' };
  }
};

// Entity type icon
export const getEntityIcon = (entityType: string) => {
  switch (entityType) {
    case 'deadline':
      return '⏰';
    case 'matter':
      return '📋';
    case 'invoice':
      return '💰';
    case 'task':
      return '✅';
    default:
      return '🔔';
  }
};
