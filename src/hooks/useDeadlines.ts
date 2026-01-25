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

export interface MatterDeadline extends Omit<MatterDeadlineRow, 'deadline_type'> {
  matter?: {
    id: string;
    reference: string;
    title: string;
    type?: string;
    jurisdiction?: string;
    client?: { id: string; name: string } | null;
  } | null;
  deadline_type_info?: {
    id: string;
    code: string;
    name_es: string;
    name_en?: string;
    category: string;
  } | null;
  deadline_type: string;
}

// Alias for backward compatibility
export type Deadline = MatterDeadline;

export interface DeadlineStats {
  overdue: number;
  today: number;
  urgent: number;      // 1-7 days
  upcoming: number;    // 8-30 days
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
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  const { data: deadlines, isLoading, error } = useQuery({
    queryKey: ['deadlines', currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('matter_deadlines')
        .select(`
          *,
          matter:matters(id, reference, title, type, jurisdiction)
        `)
        .eq('organization_id', currentOrganization.id)
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
      return data as unknown as MatterDeadline[];
    },
    enabled: !!session && !!currentOrganization?.id
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
      // First get current deadline to preserve original
      const { data: current } = await supabase
        .from('matter_deadlines')
        .select('deadline_date, original_deadline, extension_count')
        .eq('id', deadlineId)
        .single();

      const originalDeadline = current?.original_deadline || current?.deadline_date;
      const extensionCount = (current?.extension_count || 0) + 1;

      const { error } = await supabase
        .from('matter_deadlines')
        .update({
          deadline_date: newDate,
          original_deadline: originalDeadline,
          extension_reason: reason,
          extension_count: extensionCount,
          extended_by: session?.user?.id,
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
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['deadline-stats', currentOrganization?.id],
    queryFn: async (): Promise<DeadlineStats> => {
      if (!currentOrganization?.id) {
        return { overdue: 0, today: 0, urgent: 0, upcoming: 0, thisWeek: 0, thisMonth: 0, total: 0 };
      }

      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const activeStatuses = ['pending', 'upcoming', 'urgent', 'overdue'];

      const [overdue, todayRes, urgent, upcoming, total] = await Promise.all([
        supabase.from('matter_deadlines')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id)
          .lt('deadline_date', today)
          .in('status', activeStatuses),
        supabase.from('matter_deadlines')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id)
          .eq('deadline_date', today)
          .in('status', activeStatuses),
        supabase.from('matter_deadlines')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id)
          .gt('deadline_date', today)
          .lte('deadline_date', nextWeek)
          .in('status', activeStatuses),
        supabase.from('matter_deadlines')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id)
          .gt('deadline_date', nextWeek)
          .lte('deadline_date', nextMonth)
          .in('status', activeStatuses),
        supabase.from('matter_deadlines')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id)
          .in('status', activeStatuses)
      ]);

      const overdueCount = overdue.count || 0;
      const todayCount = todayRes.count || 0;
      const urgentCount = urgent.count || 0;
      const upcomingCount = upcoming.count || 0;

      return {
        overdue: overdueCount,
        today: todayCount,
        urgent: urgentCount,
        upcoming: upcomingCount,
        thisWeek: urgentCount,
        thisMonth: upcomingCount,
        total: total.count || 0
      };
    },
    enabled: !!session && !!currentOrganization?.id
  });
}

export function useDeadlinesCalendar(year: number, month: number) {
  const { currentOrganization } = useOrganization();
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  return useQuery({
    queryKey: ['deadlines-calendar', currentOrganization?.id, year, month],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('matter_deadlines')
        .select(`
          id, 
          title, 
          deadline_date, 
          priority, 
          status,
          deadline_type,
          matter:matters(id, reference, title)
        `)
        .eq('organization_id', currentOrganization.id)
        .gte('deadline_date', startDate)
        .lte('deadline_date', endDate)
        .order('deadline_date', { ascending: true });

      if (error) throw error;
      return data as unknown as MatterDeadline[];
    },
    enabled: !!currentOrganization?.id,
  });
}
