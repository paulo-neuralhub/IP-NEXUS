import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { 
  Watchlist, 
  WatchResult, 
  WatchResultFilters,
  SpiderAlert,
  AlertFilters,
  MonitoredDeadline,
  SimilarityAnalysis,
  WatchResultStatus
} from '@/types/spider';

// ===== WATCHLISTS =====
export function useWatchlists(activeOnly = true) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['watchlists', currentOrganization?.id, activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('watchlists')
        .select(`
          *,
          matter:matters(id, reference, title)
        `)
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data as unknown as Watchlist[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useWatchlist(id: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['watchlist', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watchlists')
        .select(`
          *,
          matter:matters(id, reference, title, type, status)
        `)
        .eq('id', id)
        .eq('organization_id', currentOrganization!.id)
        .single();
      if (error) throw error;
      return data as unknown as Watchlist;
    },
    enabled: !!id && !!currentOrganization?.id,
  });
}

export function useCreateWatchlist() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<Watchlist>) => {
      const { data: watchlist, error } = await supabase
        .from('watchlists')
        .insert({ ...data, organization_id: currentOrganization!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return watchlist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });
}

export function useUpdateWatchlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Watchlist> }) => {
      const { data: watchlist, error } = await supabase
        .from('watchlists')
        .update({ ...data, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return watchlist;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist', variables.id] });
    },
  });
}

export function useDeleteWatchlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('watchlists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });
}

// ===== WATCH RESULTS =====
export function useWatchResults(filters?: WatchResultFilters) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['watch-results', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('watch_results')
        .select(`
          *,
          watchlist:watchlists(id, name, type)
        `)
        .eq('organization_id', currentOrganization!.id)
        .order('detected_at', { ascending: false });
      
      if (filters?.watchlist_id) {
        query = query.eq('watchlist_id', filters.watchlist_id);
      }
      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }
      if (filters?.priority) {
        const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
        query = query.in('priority', priorities);
      }
      if (filters?.result_type) {
        const types = Array.isArray(filters.result_type) ? filters.result_type : [filters.result_type];
        query = query.in('result_type', types);
      }
      if (filters?.min_similarity) {
        query = query.gte('similarity_score', filters.min_similarity);
      }
      if (filters?.date_from) {
        query = query.gte('detected_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('detected_at', filters.date_to);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,applicant_name.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as unknown as WatchResult[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useWatchResult(id: string) {
  return useQuery({
    queryKey: ['watch-result', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watch_results')
        .select(`
          *,
          watchlist:watchlists(*)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as WatchResult;
    },
    enabled: !!id,
  });
}

export function useUpdateWatchResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WatchResult> }) => {
      const { data: result, error } = await supabase
        .from('watch_results')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watch-results'] });
      queryClient.invalidateQueries({ queryKey: ['watch-result', variables.id] });
    },
  });
}

// Acción rápida: Marcar como revisado
export function useMarkResultReviewed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: WatchResultStatus }) => {
      const { error } = await supabase
        .from('watch_results')
        .update({ 
          status, 
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-results'] });
      queryClient.invalidateQueries({ queryKey: ['spider-stats'] });
    },
  });
}

// ===== ALERTS =====
export function useSpiderAlerts(filters?: AlertFilters) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['spider-alerts', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('spider_alerts')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }
      if (filters?.severity) {
        const severities = Array.isArray(filters.severity) ? filters.severity : [filters.severity];
        query = query.in('severity', severities);
      }
      if (filters?.alert_type) {
        const types = Array.isArray(filters.alert_type) ? filters.alert_type : [filters.alert_type];
        query = query.in('alert_type', types);
      }
      
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as unknown as SpiderAlert[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useUnreadAlertsCount() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['spider-alerts-count', currentOrganization?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('spider_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization!.id)
        .eq('status', 'unread');
      if (error) throw error;
      return count || 0;
    },
    enabled: !!currentOrganization?.id,
    refetchInterval: 60000,
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('spider_alerts')
        .update({ 
          status: 'read', 
          read_at: new Date().toISOString() 
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spider-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['spider-alerts-count'] });
    },
  });
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('spider_alerts')
        .update({ 
          status: 'read', 
          read_at: new Date().toISOString() 
        })
        .eq('organization_id', currentOrganization!.id)
        .eq('status', 'unread');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spider-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['spider-alerts-count'] });
    },
  });
}

// ===== DEADLINES =====
export function useMonitoredDeadlines(status?: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['monitored-deadlines', currentOrganization?.id, status],
    queryFn: async () => {
      let query = supabase
        .from('monitored_deadlines')
        .select(`
          *,
          matter:matters(id, reference, title)
        `)
        .eq('organization_id', currentOrganization!.id)
        .order('deadline_date', { ascending: true });
      
      if (status) {
        query = query.eq('status', status);
      } else {
        query = query.eq('status', 'pending');
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as MonitoredDeadline[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useUpcomingDeadlines(days = 30) {
  const { currentOrganization } = useOrganization();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return useQuery({
    queryKey: ['upcoming-deadlines', currentOrganization?.id, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monitored_deadlines')
        .select(`
          *,
          matter:matters(id, reference, title)
        `)
        .eq('organization_id', currentOrganization!.id)
        .eq('status', 'pending')
        .lte('deadline_date', futureDate.toISOString().split('T')[0])
        .order('deadline_date', { ascending: true });
      if (error) throw error;
      return data as unknown as MonitoredDeadline[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// ===== SIMILARITY ANALYSIS =====
export function useAnalyzeSimilarity() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ termA, termB, imageAUrl, imageBUrl }: {
      termA: string;
      termB: string;
      imageAUrl?: string;
      imageBUrl?: string;
    }) => {
      const phoneticScore = calculatePhoneticSimilarity(termA, termB);
      const overallScore = phoneticScore;
      
      const { data, error } = await supabase
        .from('similarity_analyses')
        .insert({
          organization_id: currentOrganization!.id,
          term_a: termA,
          term_b: termB,
          image_a_url: imageAUrl,
          image_b_url: imageBUrl,
          overall_score: overallScore,
          phonetic_score: phoneticScore,
          analysis_method: 'algorithmic',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as SimilarityAnalysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['similarity-analyses'] });
    },
  });
}

// Función auxiliar para similitud fonética básica (Levenshtein normalizado)
function calculatePhoneticSimilarity(a: string, b: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s1 = normalize(a);
  const s2 = normalize(b);
  
  if (s1 === s2) return 100;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const matrix: number[][] = [];
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
    for (let j = 1; j <= s2.length; j++) {
      matrix[i][j] = i === 0 ? j : Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (s1[i - 1] === s2[j - 1] ? 0 : 1)
      );
    }
  }
  
  const distance = matrix[s1.length][s2.length];
  const maxLength = Math.max(s1.length, s2.length);
  return Math.round((1 - distance / maxLength) * 100);
}

// ===== STATS =====
export function useSpiderStats() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['spider-stats', currentOrganization?.id],
    queryFn: async () => {
      const orgId = currentOrganization!.id;
      
      // Watchlists activas
      const { count: watchlistsCount } = await supabase
        .from('watchlists')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('is_active', true);
      
      // Resultados sin revisar
      const { count: unreviewedCount } = await supabase
        .from('watch_results')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'new');
      
      // Amenazas activas
      const { count: threatsCount } = await supabase
        .from('watch_results')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'threat');
      
      // Alertas sin leer
      const { count: alertsCount } = await supabase
        .from('spider_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'unread');
      
      // Plazos próximos (30 días)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const { count: deadlinesCount } = await supabase
        .from('monitored_deadlines')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'pending')
        .lte('deadline_date', futureDate.toISOString().split('T')[0]);
      
      return {
        activeWatchlists: watchlistsCount || 0,
        unreviewedResults: unreviewedCount || 0,
        activeThreats: threatsCount || 0,
        unreadAlerts: alertsCount || 0,
        upcomingDeadlines: deadlinesCount || 0,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}
