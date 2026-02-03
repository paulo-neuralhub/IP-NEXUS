/**
 * useMarketAgents - Hook for fetching top agents from market_users (real data)
 * Replaces MOCK_AGENTS in TopAgents.tsx
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketAgent {
  id: string;
  display_name: string;
  avatar_url?: string;
  jurisdictions: string[];
  specializations: string[];
  rating_avg: number;
  ratings_count: number;
  total_transactions: number;
  success_rate: number;
  response_time_avg: number;
  is_verified_agent: boolean;
  rank_position?: number;
  rank_change?: number;
}

export function useTopMarketAgents(limit = 10) {
  return useQuery({
    queryKey: ['market-top-agents', limit],
    queryFn: async (): Promise<MarketAgent[]> => {
      try {
        const { data, error } = await supabase
          .from('market_users')
          .select(`
            id,
            display_name,
            avatar_url,
            jurisdictions,
            specializations,
            rating_avg,
            ratings_count,
            is_verified_agent,
            reputation_score
          `)
          .eq('is_verified_agent', true)
          .order('reputation_score', { ascending: false, nullsFirst: false })
          .limit(limit);

        if (error) {
          console.warn('[useTopMarketAgents] Error:', error.message);
          return [];
        }

        return (data || []).map((agent, index) => ({
          id: agent.id,
          display_name: agent.display_name || 'Agente',
          avatar_url: agent.avatar_url || undefined,
          jurisdictions: agent.jurisdictions || [],
          specializations: agent.specializations || [],
          rating_avg: agent.rating_avg || 0,
          ratings_count: agent.ratings_count || 0,
          total_transactions: 0, // Would need to count from transactions table
          success_rate: 0, // Would need calculation
          response_time_avg: 0, // Would need calculation
          is_verified_agent: agent.is_verified_agent || false,
          rank_position: index + 1,
          rank_change: 0,
        }));
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
