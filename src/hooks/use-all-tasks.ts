// ============================================================
// IP-NEXUS - ALL TASKS UNIFIED HOOK
// L90: Hook para obtener todas las tareas (CRM + Expedientes)
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export interface TaskFilters {
  status?: 'pending' | 'completed' | 'all';
  assignedTo?: string | 'me' | 'all';
  source?: 'matter' | 'crm' | 'all';
  priority?: string;
  dueDateRange?: { from: Date; to: Date };
}

export interface UnifiedTask {
  id: string;
  subject: string | null;
  content: string | null;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  priority?: string;
  type: string;
  created_at: string;
  // Source info
  source: 'matter' | 'crm' | 'other';
  sourceLabel: string;
  sourceName: string;
  sourceUrl: string;
  // Relations
  matter_id: string | null;
  deal_id: string | null;
  contact_id: string | null;
  assigned_to: string | null;
  // Joined data
  matter?: { id: string; reference: string; title: string } | null;
  deal?: { id: string; title: string } | null;
  assigned_user?: { id: string; full_name: string; avatar_url: string | null } | null;
  created_by?: string | null;
}

export function useAllTasks(filters: TaskFilters = {}) {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-tasks', currentOrganization?.id, filters],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('activities')
        .select(`
          id, subject, content, due_date, is_completed, completed_at, type, created_at,
          matter_id, deal_id, contact_id,
          metadata,
          matter:matters(id, reference, title),
          deal:deals(id, title),
          created_by
        `)
        .eq('organization_id', currentOrganization.id)
        .eq('type', 'task')
        .order('due_date', { ascending: true, nullsFirst: false });

      // Filtro de estado
      if (filters.status === 'pending') {
        query = query.eq('is_completed', false);
      } else if (filters.status === 'completed') {
        query = query.eq('is_completed', true);
      }

      // Filtro de fuente
      if (filters.source === 'matter') {
        query = query.not('matter_id', 'is', null);
      } else if (filters.source === 'crm') {
        query = query.is('matter_id', null);
      }

      // Filtro de rango de fecha
      if (filters.dueDateRange) {
        query = query
          .gte('due_date', filters.dueDateRange.from.toISOString())
          .lte('due_date', filters.dueDateRange.to.toISOString());
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      // Enriquecer con información de fuente
      const tasks: UnifiedTask[] = (data || []).map((task: any) => {
        const hasMatter = !!task.matter_id && task.matter;
        const hasDeal = !!task.deal_id && task.deal;

        let source: 'matter' | 'crm' | 'other' = 'other';
        let sourceLabel = 'Sin vincular';
        let sourceName = '';
        let sourceUrl = '/app/tareas';

        if (hasMatter) {
          source = 'matter';
          sourceLabel = task.matter?.reference || 'Expediente';
          sourceName = task.matter?.title || '';
          sourceUrl = `/app/expedientes/${task.matter_id}`;
        } else if (hasDeal) {
          source = 'crm';
          sourceLabel = 'CRM';
          sourceName = task.deal?.title || '';
          sourceUrl = `/app/crm/deals/${task.deal_id}`;
        }

        // Extraer prioridad del metadata si existe
        const priority = task.metadata?.priority || 'medium';

        return {
          ...task,
          priority,
          source,
          sourceLabel,
          sourceName,
          sourceUrl,
        };
      });

      // Filtro de asignación (post-query porque created_by no es assigned_to)
      if (filters.assignedTo === 'me' && user?.id) {
        return tasks.filter((t) => t.created_by === user.id);
      }

      return tasks;
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const { error } = await supabase
        .from('activities')
        .update({
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['matter-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      toast.success('Tarea actualizada');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Agrupar tareas por fecha
export function groupTasksByDate(tasks: UnifiedTask[]): Record<string, UnifiedTask[]> {
  const groups: Record<string, UnifiedTask[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  tasks.forEach((task) => {
    if (!task.due_date) {
      const label = 'Sin fecha';
      if (!groups[label]) groups[label] = [];
      groups[label].push(task);
      return;
    }

    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let label: string;
    if (diffDays < 0) label = 'Vencidas';
    else if (diffDays === 0) label = 'Hoy';
    else if (diffDays === 1) label = 'Mañana';
    else if (diffDays <= 7) label = 'Esta semana';
    else if (diffDays <= 14) label = 'Próxima semana';
    else label = 'Más adelante';

    if (!groups[label]) groups[label] = [];
    groups[label].push(task);
  });

  return groups;
}
