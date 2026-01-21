import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AgentRanking, AgentBadge, RankingCategory } from '@/types/rankings';

// =====================================================
// RANKINGS PRINCIPAL
// =====================================================

export function useRankings(category: RankingCategory = 'global', limit: number = 50) {
  return useQuery({
    queryKey: ['rankings', category, limit],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('agent_rankings')
        .select(`
          *,
          agent:market_users!agent_rankings_agent_id_fkey(
            id, display_name, avatar_url, company_name, country, 
            is_verified_agent, badges, jurisdictions
          )
        `)
        .eq('ranking_category', category)
        .eq('ranking_date', today)
        .order('rank_position', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      
      return (data || []).map(r => ({
        ...r,
        agent: r.agent || undefined,
      })) as AgentRanking[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// =====================================================
// HISTORIAL DE RANKING DE UN AGENTE
// =====================================================

export function useAgentRankingHistory(agentId: string | undefined, days: number = 30) {
  return useQuery({
    queryKey: ['agent-ranking-history', agentId, days],
    queryFn: async () => {
      if (!agentId) throw new Error('Agent ID required');
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('agent_rankings')
        .select('*')
        .eq('agent_id', agentId)
        .eq('ranking_category', 'global')
        .gte('ranking_date', startDate.toISOString().split('T')[0])
        .order('ranking_date', { ascending: true });
      
      if (error) throw error;
      return data as AgentRanking[];
    },
    enabled: !!agentId,
  });
}

// =====================================================
// BADGES DE UN AGENTE
// =====================================================

export function useAgentBadges(agentId: string | undefined) {
  return useQuery({
    queryKey: ['agent-badges', agentId],
    queryFn: async () => {
      if (!agentId) throw new Error('Agent ID required');
      
      const { data, error } = await supabase
        .from('agent_badges')
        .select('*')
        .eq('agent_id', agentId)
        .eq('is_active', true)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data as AgentBadge[];
    },
    enabled: !!agentId,
  });
}

// =====================================================
// ESTADÍSTICAS DE RANKING
// =====================================================

export function useRankingStats() {
  return useQuery({
    queryKey: ['ranking-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Total agentes rankeados
      const { count: totalAgents } = await supabase
        .from('agent_rankings')
        .select('*', { count: 'exact', head: true })
        .eq('ranking_date', today)
        .eq('ranking_category', 'global');
      
      // Mayores subidas del día
      const { data: topRisers } = await supabase
        .from('agent_rankings')
        .select(`
          *,
          agent:market_users!agent_rankings_agent_id_fkey(id, display_name, avatar_url, company_name)
        `)
        .eq('ranking_date', today)
        .eq('ranking_category', 'global')
        .gt('rank_change', 0)
        .order('rank_change', { ascending: false })
        .limit(5);
      
      // Mayores bajadas
      const { data: topFallers } = await supabase
        .from('agent_rankings')
        .select(`
          *,
          agent:market_users!agent_rankings_agent_id_fkey(id, display_name, avatar_url, company_name)
        `)
        .eq('ranking_date', today)
        .eq('ranking_category', 'global')
        .lt('rank_change', 0)
        .order('rank_change', { ascending: true })
        .limit(5);
      
      return {
        totalAgents: totalAgents || 0,
        topRisers: (topRisers || []) as AgentRanking[],
        topFallers: (topFallers || []) as AgentRanking[],
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

// =====================================================
// RANKING ACTUAL DE UN AGENTE
// =====================================================

export function useAgentCurrentRanking(agentId: string | undefined) {
  return useQuery({
    queryKey: ['agent-current-ranking', agentId],
    queryFn: async () => {
      if (!agentId) throw new Error('Agent ID required');
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('agent_rankings')
        .select('*')
        .eq('agent_id', agentId)
        .eq('ranking_date', today)
        .eq('ranking_category', 'global')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as AgentRanking | null;
    },
    enabled: !!agentId,
  });
}
