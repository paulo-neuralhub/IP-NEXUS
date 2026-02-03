/**
 * useMarketRequests - Hook for fetching recent market requests (real data)
 * Replaces MOCK_REQUESTS in RecentRequests.tsx
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketRequest {
  id: string;
  request_number: string;
  service_type: 'trademark' | 'patent' | 'design' | 'search' | 'opposition' | 'renewal';
  title: string;
  jurisdiction: string;
  budget_min?: number;
  budget_max?: number;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  bids_count: number;
  created_at: string;
  city?: string;
}

// Map DB status to UI status
function mapStatus(dbStatus: string | null): MarketRequest['status'] {
  switch (dbStatus) {
    case 'active': return 'open';
    case 'reserved':
    case 'under_offer': return 'assigned';
    case 'sold':
    case 'licensed': return 'completed';
    case 'suspended':
    case 'withdrawn':
    case 'expired': return 'cancelled';
    default: return 'open';
  }
}

export function useRecentMarketRequests(limit = 8) {
  return useQuery({
    queryKey: ['market-recent-requests', limit],
    queryFn: async (): Promise<MarketRequest[]> => {
      try {
        const { data, error } = await supabase
          .from('market_listings')
          .select(`
            id,
            listing_number,
            title,
            available_territories,
            asking_price,
            minimum_offer,
            status,
            offer_count,
            created_at
          `)
          .in('status', ['active', 'reserved', 'under_offer'])
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.warn('[useRecentMarketRequests] Error:', error.message);
          return [];
        }

        return (data || []).map((req) => ({
          id: req.id,
          request_number: req.listing_number || `MKT-${new Date(req.created_at || '').getFullYear()}-0001`,
          service_type: 'trademark' as const, // Default since table doesn't have service_type
          title: req.title || 'Sin título',
          jurisdiction: (req.available_territories as string[])?.[0] || 'ES',
          budget_min: req.minimum_offer ? Number(req.minimum_offer) : undefined,
          budget_max: req.asking_price ? Number(req.asking_price) : undefined,
          status: mapStatus(req.status),
          bids_count: req.offer_count || 0,
          created_at: req.created_at || new Date().toISOString(),
          city: undefined,
        }));
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 2,
  });
}

export interface TickerItem {
  id: string;
  type: 'trademark' | 'patent' | 'design' | 'domain' | 'other';
  title: string;
  jurisdiction: string;
  timestamp: string;
  action: 'new' | 'bid' | 'completed' | 'update';
}

export function useMarketTicker(limit = 15) {
  return useQuery({
    queryKey: ['market-ticker', limit],
    queryFn: async (): Promise<TickerItem[]> => {
      try {
        const { data, error } = await supabase
          .from('market_listings')
          .select('id, title, available_territories, status, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.warn('[useMarketTicker] Error:', error.message);
          return [];
        }

        return (data || []).map((item) => {
          // Default to trademark since table doesn't have service_type
          const type: TickerItem['type'] = 'trademark';

          // Determine action based on status and timestamps
          let action: TickerItem['action'] = 'new';
          if (item.status === 'sold' || item.status === 'licensed') action = 'completed';
          else if (item.updated_at !== item.created_at) action = 'update';

          const territories = item.available_territories as string[] | null;

          return {
            id: item.id,
            type,
            title: item.title || 'Sin título',
            jurisdiction: territories?.[0] || 'ES',
            timestamp: item.updated_at || item.created_at || new Date().toISOString(),
            action,
          };
        });
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 1,
  });
}
