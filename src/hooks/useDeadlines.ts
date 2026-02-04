// ============================================================
// IP-NEXUS - DEADLINES HOOK
// PROMPT 52: Docket Deadline Engine + PROMPT 3 Enhancements
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import type { DeadlineCriticality, DeadlineStatus } from '@/types/deadlines-extended';

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
  assigned_user?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
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
  critical: number;
  byCriticality?: Record<DeadlineCriticality, number>;
}

interface UseDeadlinesOptions {
  matterId?: string;
  status?: string[];
  priority?: string;
  criticality?: DeadlineCriticality[];
  assignedTo?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  includeCompleted?: boolean;
}

export function useDeadlines(options: UseDeadlinesOptions = {}) {
  const { session } = useAuth();
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  const { data: deadlines, isLoading, error, refetch } = useQuery({
    queryKey: ['deadlines', currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('matter_deadlines')
        .select(`
          *,
          matter:matters(
            id, 
            reference, 
            title, 
            type, 
            jurisdiction,
            client:contacts!matters_client_id_fkey(id, name)
          )
        `)
        .eq('organization_id', currentOrganization.id)
        .order('deadline_date', { ascending: true });

      if (options.matterId) {
        query = query.eq('matter_id', options.matterId);
      }
      if (options.status?.length) {
        query = query.in('status', options.status);
      } else if (!options.includeCompleted) {
        query = query.in('status', ['pending', 'in_progress', 'extended']);
      }
      if (options.priority) {
        query = query.eq('priority', options.priority);
      }
      if (options.criticality?.length) {
        query = query.in('criticality', options.criticality);
      }
      if (options.assignedTo) {
        query = query.eq('assigned_to', options.assignedTo);
      }
      if (options.category) {
        query = query.eq('category', options.category);
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
      queryClient.invalidateQueries({ queryKey: ['matter-deadlines'] });
      toast.success('Plazo marcado como completado');
    },
    onError: () => {
      toast.error('Error al actualizar plazo');
    }
  });

  const extendDeadlineMutation = useMutation({
    mutationFn: async ({ deadlineId, newDate, reason }: { deadlineId: string; newDate: string; reason?: string }) => {
      // First get current deadline to preserve original and check max extensions
      const { data: current } = await supabase
        .from('matter_deadlines')
        .select('deadline_date, original_deadline, extension_count, max_extensions')
        .eq('id', deadlineId)
        .single();

      if (current?.max_extensions && (current.extension_count || 0) >= current.max_extensions) {
        throw new Error('Número máximo de extensiones alcanzado');
      }

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
          last_extended_date: new Date().toISOString().split('T')[0],
          status: 'pending'
        })
        .eq('id', deadlineId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['deadline-stats'] });
      queryClient.invalidateQueries({ queryKey: ['matter-deadlines'] });
      toast.success('Plazo extendido');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al extender plazo');
    }
  });

  const createDeadlineMutation = useMutation({
    mutationFn: async (deadline: MatterDeadlineInsert) => {
      const { data, error } = await supabase
        .from('matter_deadlines')
        .insert({
          ...deadline,
          auto_generated: false,
          source: 'manual'
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['deadline-stats'] });
      queryClient.invalidateQueries({ queryKey: ['matter-deadlines'] });
      toast.success('Plazo creado');
    },
    onError: () => {
      toast.error('Error al crear plazo');
    }
  });

  const updateDeadlineMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<MatterDeadlineRow>) => {
      const { data, error } = await supabase
        .from('matter_deadlines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['deadline-stats'] });
      queryClient.invalidateQueries({ queryKey: ['matter-deadlines'] });
      toast.success('Plazo actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar plazo');
    }
  });

  const deleteDeadlineMutation = useMutation({
    mutationFn: async (deadlineId: string) => {
      const { error } = await supabase
        .from('matter_deadlines')
        .delete()
        .eq('id', deadlineId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['deadline-stats'] });
      queryClient.invalidateQueries({ queryKey: ['matter-deadlines'] });
      toast.success('Plazo eliminado');
    },
    onError: () => {
      toast.error('Error al eliminar plazo');
    }
  });

  // Quick postpone helpers
  const postpone = (deadlineId: string, days: number) => {
    const deadline = deadlines?.find(d => d.id === deadlineId);
    if (deadline) {
      const currentDate = new Date(deadline.deadline_date);
      currentDate.setDate(currentDate.getDate() + days);
      extendDeadlineMutation.mutate({
        deadlineId,
        newDate: currentDate.toISOString().split('T')[0],
        reason: `Pospuesto ${days} día(s)`
      });
    }
  };

  return {
    deadlines,
    isLoading,
    error,
    refetch,
    // Mutations
    markAsCompleted: markAsCompletedMutation.mutate,
    markAsCompletedAsync: markAsCompletedMutation.mutateAsync,
    extendDeadline: (deadlineId: string, newDate: string, reason?: string) => {
      extendDeadlineMutation.mutate({ deadlineId, newDate, reason });
    },
    extendDeadlineAsync: extendDeadlineMutation.mutateAsync,
    createDeadline: createDeadlineMutation.mutate,
    createDeadlineAsync: createDeadlineMutation.mutateAsync,
    updateDeadline: updateDeadlineMutation.mutate,
    updateDeadlineAsync: updateDeadlineMutation.mutateAsync,
    deleteDeadline: deleteDeadlineMutation.mutate,
    deleteDeadlineAsync: deleteDeadlineMutation.mutateAsync,
    // Quick actions
    postpone1Day: (id: string) => postpone(id, 1),
    postpone3Days: (id: string) => postpone(id, 3),
    postpone1Week: (id: string) => postpone(id, 7),
    // Loading states
    isUpdating: extendDeadlineMutation.isPending || markAsCompletedMutation.isPending || updateDeadlineMutation.isPending,
    isCreating: createDeadlineMutation.isPending,
    isDeleting: deleteDeadlineMutation.isPending,
  };
}

export function useDeadlineStats() {
  const { session } = useAuth();
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['deadline-stats', currentOrganization?.id],
    queryFn: async (): Promise<DeadlineStats> => {
      if (!currentOrganization?.id) {
        return { overdue: 0, today: 0, urgent: 0, upcoming: 0, thisWeek: 0, thisMonth: 0, total: 0, critical: 0 };
      }

      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const activeStatuses = ['pending', 'in_progress', 'extended'];

      const [overdue, todayRes, urgent, upcoming, total, critical] = await Promise.all([
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
          .in('status', activeStatuses),
        supabase.from('matter_deadlines')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id)
          .in('status', activeStatuses)
          .in('criticality', ['critical', 'absolute'])
      ]);

      const overdueCount = overdue.count || 0;
      const todayCount = todayRes.count || 0;
      const urgentCount = urgent.count || 0;
      const upcomingCount = upcoming.count || 0;
      const criticalCount = critical.count || 0;

      return {
        overdue: overdueCount,
        today: todayCount,
        urgent: urgentCount,
        upcoming: upcomingCount,
        thisWeek: urgentCount,
        thisMonth: upcomingCount,
        total: total.count || 0,
        critical: criticalCount
      };
    },
    enabled: !!session && !!currentOrganization?.id,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
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
          criticality,
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

// ============================================================
// GROUPED DEADLINES HOOK (for dashboard view)
// ============================================================

export interface GroupedDeadlines {
  overdue: MatterDeadline[];
  today: MatterDeadline[];
  tomorrow: MatterDeadline[];
  thisWeek: MatterDeadline[];
  nextWeek: MatterDeadline[];
  later: MatterDeadline[];
  completed: MatterDeadline[];
}

export function useGroupedDeadlines(options: UseDeadlinesOptions = {}) {
  const { session } = useAuth();
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['deadlines-grouped', currentOrganization?.id, options],
    queryFn: async (): Promise<GroupedDeadlines> => {
      if (!currentOrganization?.id) {
        return { overdue: [], today: [], tomorrow: [], thisWeek: [], nextWeek: [], later: [], completed: [] };
      }

      const { data, error } = await supabase
        .from('matter_deadlines')
        .select(`
          *,
          matter:matters(id, reference, title, type, jurisdiction)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('deadline_date', { ascending: true })
        .limit(200);

      if (error) throw error;

      const deadlines = (data || []) as unknown as MatterDeadline[];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
      
      const endOfNextWeek = new Date(endOfWeek);
      endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

      const grouped: GroupedDeadlines = {
        overdue: [],
        today: [],
        tomorrow: [],
        thisWeek: [],
        nextWeek: [],
        later: [],
        completed: [],
      };

      for (const deadline of deadlines) {
        const dueDate = new Date(deadline.deadline_date);
        dueDate.setHours(0, 0, 0, 0);

        if (deadline.status === 'completed') {
          grouped.completed.push(deadline);
        } else if (dueDate < today) {
          grouped.overdue.push(deadline);
        } else if (dueDate.getTime() === today.getTime()) {
          grouped.today.push(deadline);
        } else if (dueDate.getTime() === tomorrow.getTime()) {
          grouped.tomorrow.push(deadline);
        } else if (dueDate <= endOfWeek) {
          grouped.thisWeek.push(deadline);
        } else if (dueDate <= endOfNextWeek) {
          grouped.nextWeek.push(deadline);
        } else {
          grouped.later.push(deadline);
        }
      }

      return grouped;
    },
    enabled: !!session && !!currentOrganization?.id,
  });
}
