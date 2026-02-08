/**
 * useMarketNotifications — Hook for IP Market notification system
 * Reads from the `market_notifications` table.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import {
  MARKET_NOTIFICATION_CONFIG,
  type MarketNotificationType,
  type MarketTab,
  getTabFromType,
} from '@/types/market-notifications';

// ── Types ──
export interface MarketNotification {
  id: string;
  user_id: string;
  organization_id?: string;
  title: string;
  message: string;
  type: MarketNotificationType;
  request_id?: string;
  offer_id?: string;
  transaction_id?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface MarketTabCounts {
  rfq: number;
  offers: number;
  transactions: number;
  total: number;
}

// ── Fetch market notifications ──
export function useMarketNotifications(limit = 30) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['market-notifications', user?.id, limit],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('market_notifications' as any)
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(limit) as any);
      if (error) throw error;
      return (data || []) as unknown as MarketNotification[];
    },
    enabled: !!user?.id,
  });
}

// ── Unread count (total) ──
export function useMarketUnreadCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['market-notifications-unread', user?.id],
    queryFn: async () => {
      const { count, error } = await (supabase
        .from('market_notifications' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('is_read', false) as any);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });
}

// ── Unread counts per tab ──
export function useMarketTabCounts(): MarketTabCounts {
  const { data: notifications } = useMarketNotifications(100);
  const counts: MarketTabCounts = { rfq: 0, offers: 0, transactions: 0, total: 0 };
  if (!notifications) return counts;
  notifications
    .filter(n => !n.is_read)
    .forEach(n => {
      counts.total++;
      const tab = getTabFromType(n.type as MarketNotificationType);
      if (tab && tab in counts) {
        counts[tab]++;
      }
    });
  return counts;
}

// ── Mark single as read ──
export function useMarkMarketNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('market_notifications' as any)
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['market-notifications'] });
      qc.invalidateQueries({ queryKey: ['market-notifications-unread'] });
    },
  });
}

// ── Mark all market notifications read ──
export function useMarkAllMarketRead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      const { error } = await (supabase
        .from('market_notifications' as any)
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user!.id)
        .eq('is_read', false) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['market-notifications'] });
      qc.invalidateQueries({ queryKey: ['market-notifications-unread'] });
    },
  });
}

// ── Real-time subscription + toast ──
export function useMarketNotificationRealtime() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('market-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'market_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as any;
          qc.invalidateQueries({ queryKey: ['market-notifications'] });
          qc.invalidateQueries({ queryKey: ['market-notifications-unread'] });

          const config = MARKET_NOTIFICATION_CONFIG[newNotif.type as MarketNotificationType];
          if (config) {
            toast(newNotif.title, { description: newNotif.message });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, qc]);
}
