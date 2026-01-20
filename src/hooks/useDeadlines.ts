// ============================================================
// IP-NEXUS - DEADLINES HOOK
// PROMPT 52: Docket Deadline Engine
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type MatterDeadline = Database['public']['Tables']['matter_deadlines']['Row'];
type MatterDeadlineInsert = Database['public']['Tables']['matter_deadlines']['Insert'];

interface UseDeadlinesOptions {
  matterId?: string;
  status?: string[];
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface Deadline extends MatterDeadline {
  matter?: {
    id: string;
    reference: string;
    title: string;
  } | null;
}

export function useDeadlines(options: UseDeadlinesOptions = {}) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: deadlines, isLoading, error } = useQuery({
    queryKey: ['deadlines', options],
    queryFn: async () => {
      let query = supabase
        .from('matter_deadlines')
        .select(`
          *,
          matter:matters(
            id,
            reference,
            title
          )
        `)
        .order('deadline_date', { ascending: true });

      if (options.matterId) {
        query = query.eq('matter_id', options.matterId);
      }

      if (options.status?.length) {
        query = query.in('status', options.status);
      }

      if (options.priority) {
        query = query.eq('priority', options.priority);
      }

      if (options.dateFrom) {
        query = query.gte('deadline_date', options.dateFrom);
      }

      if (options.dateTo) {
        query = query.lte('deadline_date', options.dateTo);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Deadline[];
    },
    enabled: !!session
  });

  const markAsCompletedMutation = useMutation({
    mutationFn: async (deadlineId: string) => {
      const { error } = await supabase
        .from('matter_deadlines')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: session?.user?.id
        })
        .eq('id', deadlineId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast.success('Deadline marcado como completado');
    },
    onError: () => {
      toast.error('Error al actualizar deadline');
    }
  });

  const extendDeadlineMutation = useMutation({
    mutationFn: async ({ deadlineId, newDate, reason }: {
      deadlineId: string;
      newDate: string;
      reason?: string;
    }) => {
      // First get current extension count
      const { data: current } = await supabase
        .from('matter_deadlines')
        .select('extension_count')
        .eq('id', deadlineId)
        .single();

      const { error } = await supabase
        .from('matter_deadlines')
        .update({
          status: 'extended',
          deadline_date: newDate,
          extension_reason: reason,
          extension_count: (current?.extension_count || 0) + 1,
          extended_by: session?.user?.id
        })
        .eq('id', deadlineId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast.success('Deadline extendido');
    },
    onError: () => {
      toast.error('Error al extender deadline');
    }
  });

  const createDeadlineMutation = useMutation({
    mutationFn: async (deadline: MatterDeadlineInsert) => {
      const { data, error } = await supabase
        .from('matter_deadlines')
        .insert(deadline)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast.success('Deadline creado');
    },
    onError: () => {
      toast.error('Error al crear deadline');
    }
  });

  return {
    deadlines,
    isLoading,
    error,
    markAsCompleted: markAsCompletedMutation.mutate,
    extendDeadline: (deadlineId: string, newDate: string, reason?: string) => {
      extendDeadlineMutation.mutate({ deadlineId, newDate, reason });
    },
    createDeadline: createDeadlineMutation.mutate
  };
}

export function useDeadlineRules(jurisdiction?: string) {
  return useQuery({
    queryKey: ['deadline-rules', jurisdiction],
    queryFn: async () => {
      let query = supabase
        .from('deadline_rules')
        .select('*')
        .eq('is_active', true)
        .order('jurisdiction', { ascending: true });

      if (jurisdiction) {
        query = query.eq('jurisdiction', jurisdiction);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useDeadlineStats() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['deadline-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [overdue, urgent, upcoming, thisMonth] = await Promise.all([
        supabase.from('matter_deadlines').select('id', { count: 'exact', head: true })
          .eq('status', 'overdue'),
        supabase.from('matter_deadlines').select('id', { count: 'exact', head: true })
          .in('status', ['pending', 'upcoming', 'urgent'])
          .lte('deadline_date', nextWeek)
          .gte('deadline_date', today),
        supabase.from('matter_deadlines').select('id', { count: 'exact', head: true })
          .in('status', ['pending', 'upcoming'])
          .gt('deadline_date', nextWeek)
          .lte('deadline_date', nextMonth),
        supabase.from('matter_deadlines').select('id', { count: 'exact', head: true })
          .in('status', ['pending', 'upcoming', 'urgent'])
          .lte('deadline_date', nextMonth)
      ]);

      return {
        overdue: overdue.count || 0,
        urgent: urgent.count || 0,
        upcoming: upcoming.count || 0,
        thisMonth: thisMonth.count || 0
      };
    },
    enabled: !!session
  });
}
