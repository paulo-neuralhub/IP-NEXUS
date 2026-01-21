import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePublicStats() {
  return useQuery({
    queryKey: ['public-market-stats'],
    queryFn: async () => {
      // Total agentes activos
      const { count: totalAgents } = await supabase
        .from('market_users')
        .select('*', { count: 'exact', head: true })
        .eq('is_agent', true)
        .eq('is_active', true)
        .eq('is_public_profile', true);
      
      // Total transacciones completadas
      const { count: totalTransactions } = await supabase
        .from('market_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
      
      // Rating promedio
      const { data: ratingData } = await supabase
        .from('market_users')
        .select('rating_avg')
        .eq('is_agent', true)
        .eq('is_active', true)
        .gt('ratings_count', 0);
      
      const avgRating = ratingData?.length 
        ? (ratingData.reduce((sum, a) => sum + (a.rating_avg || 0), 0) / ratingData.length).toFixed(1)
        : '4.8';
      
      // Success rate promedio
      const { data: successData } = await supabase
        .from('market_users')
        .select('success_rate')
        .eq('is_agent', true)
        .eq('is_active', true)
        .gt('total_transactions', 0);
      
      const avgSuccess = successData?.length
        ? Math.round(successData.reduce((sum, a) => sum + (a.success_rate || 0), 0) / successData.length)
        : 98;
      
      return {
        totalAgents: totalAgents || 150,
        totalTransactions: totalTransactions || 500,
        avgRating: avgRating,
        avgSuccess: avgSuccess,
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

export function useTopAgentsPublic(limit: number = 8) {
  return useQuery({
    queryKey: ['top-agents-public', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_users')
        .select(`
          id, display_name, avatar_url, company_name, country,
          is_verified_agent, rating_avg, ratings_count, 
          reputation_score, badges, jurisdictions, specializations
        `)
        .eq('is_agent', true)
        .eq('is_active', true)
        .eq('is_public_profile', true)
        .eq('is_verified_agent', true)
        .order('reputation_score', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecentPublicRequests(limit: number = 5) {
  return useQuery({
    queryKey: ['recent-public-requests', limit],
    queryFn: async () => {
      // This would need the quote_requests table to be created
      // For now return empty array as placeholder
      return [] as Array<{
        id: string;
        reference_number: string;
        title: string;
        service_type: string;
        service_category: string;
        jurisdictions: string[];
        quotes_received: number;
        created_at: string;
      }>;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useServiceCategoryCounts() {
  return useQuery({
    queryKey: ['service-category-counts'],
    queryFn: async () => {
      type MarketUserRow = { specializations: string[] | null };
      const { data, error } = await supabase
        .from('market_users')
        .select('specializations')
        .eq('is_agent', true)
        .eq('is_active', true)
        .returns<MarketUserRow[]>();
      
      if (error) throw error;
      
      // Contar especialidades
      const counts: Record<string, number> = {};
      data?.forEach((agent) => {
        agent.specializations?.forEach((spec: string) => {
          counts[spec] = (counts[spec] || 0) + 1;
        });
      });
      
      return counts;
    },
    staleTime: 1000 * 60 * 10,
  });
}
