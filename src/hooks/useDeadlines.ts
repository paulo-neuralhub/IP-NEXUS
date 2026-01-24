// ============================================================
// IP-NEXUS - DEADLINES HOOK
// PROMPT 52: Docket Deadline Engine
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type MatterDeadlineRow = Database['public']['Tables']['matter_deadlines']['Row'];
type MatterDeadlineInsert = Database['public']['Tables']['matter_deadlines']['Insert'];

export interface MatterDeadline extends MatterDeadlineRow {
  matter?: {
    id: string;
    reference_number?: string;
    reference?: string;
    title: string;
    type?: string;
    jurisdiction?: string;
    client?: { id: string; name: string } | null;
  } | null;
  deadline_type?: {
    id: string;
    code: string;
    name_es: string;
    name_en?: string;
    category: string;
  } | null;
}

export interface DeadlineStats {
  overdue: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

interface UseDeadlinesOptions {
  matterId?: string;
  status?: string[];
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
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
          matter:matters(id, reference_number, title, type, jurisdiction)
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
      return data as MatterDeadline[];
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
      queryClient.invalidateQueries({ queryKey: ['deadline-stats'] });
      toast.success('Plazo marcado como completado');
    },
    onError: () => {
      toast.error('Error al actualizar plazo');
    }
  });

  const extendDeadlineMutation = useMutation({
    mutationFn: async ({ deadlineId, newDate, reason }: { deadlineId: string; newDate: string; reason?: string }) => {
      const { error } = await supabase
        .from('matter_deadlines')
        .update({
          deadline_date: newDate,
          extension_reason: reason,
          extended: true,
          status: 'pending'
        })
        .eq('id', deadlineId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['deadline-stats'] });
      toast.success('Plazo extendido');
    },
    onError: () => {
      toast.error('Error al extender plazo');
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
      queryClient.invalidateQueries({ queryKey: ['deadline-stats'] });
      toast.success('Plazo creado');
    },
    onError: () => {
      toast.error('Error al crear plazo');
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

export function useDeadlineStats() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['deadline-stats'],
    queryFn: async (): Promise<DeadlineStats> => {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [overdue, todayRes, upcoming, thisMonth, total] = await Promise.all([
        supabase.from('matter_deadlines').select('id', { count: 'exact', head: true }).lt('deadline_date', today).in('status', ['pending', 'upcoming', 'urgent', 'overdue']),
        supabase.from('matter_deadlines').select('id', { count: 'exact', head: true }).eq('deadline_date', today).in('status', ['pending', 'upcoming', 'urgent']),
        supabase.from('matter_deadlines').select('id', { count: 'exact', head: true }).gt('deadline_date', today).lte('deadline_date', nextWeek).in('status', ['pending', 'upcoming', 'urgent']),
        supabase.from('matter_deadlines').select('id', { count: 'exact', head: true }).gt('deadline_date', nextWeek).lte('deadline_date', nextMonth).in('status', ['pending', 'upcoming', 'urgent']),
        supabase.from('matter_deadlines').select('id', { count: 'exact', head: true }).in('status', ['pending', 'upcoming', 'urgent', 'overdue'])
      ]);

      return {
        overdue: overdue.count || 0,
        today: todayRes.count || 0,
        thisWeek: upcoming.count || 0,
        thisMonth: thisMonth.count || 0,
        total: total.count || 0
      };
    },
    enabled: !!session
  });
}

export function useDeadlinesCalendar(year: number, month: number) {
  const { currentOrganization } = useOrganization();
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  return useQuery({
    queryKey: ['deadlines-calendar', currentOrganization?.id, year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matter_deadlines')
        .select('id, title, deadline_date, priority, status, matter:matters(id, reference_number, title)')
        .gte('deadline_date', startDate)
        .lte('deadline_date', endDate)
        .order('deadline_date', { ascending: true });

      if (error) throw error;
      return data as MatterDeadline[];
    },
    enabled: !!currentOrganization?.id,
  });
}
