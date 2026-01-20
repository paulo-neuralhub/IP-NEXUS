import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from 'sonner';
import type { 
  SmartTask, 
  SmartTaskFilters, 
  CreateSmartTaskDTO, 
  UpdateSmartTaskDTO 
} from '@/types/docket-god-mode';
import type { Json } from '@/integrations/supabase/types';

export function useSmartTasks(filters?: SmartTaskFilters) {
  const { currentOrganization, user } = useOrganization();

  return useQuery({
    queryKey: ['smart-tasks', currentOrganization?.id, filters],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('smart_tasks')
        .select(`
          *,
          matter:matters(id, title, reference_number, ip_type, jurisdiction),
          assigned_user:users!smart_tasks_assigned_to_fkey(id, full_name, avatar_url)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('due_date', { ascending: true });

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters?.statuses?.length) {
        query = query.in('status', filters.statuses);
      }

      if (filters?.priorities?.length) {
        query = query.in('priority', filters.priorities);
      }

      if (filters?.types?.length) {
        query = query.in('task_type', filters.types);
      }

      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      if (filters?.matterId) {
        query = query.eq('matter_id', filters.matterId);
      }

      if (filters?.portfolioId) {
        query = query.eq('portfolio_id', filters.portfolioId);
      }

      if (filters?.dueDateFrom) {
        query = query.gte('due_date', filters.dueDateFrom);
      }

      if (filters?.dueDateTo) {
        query = query.lte('due_date', filters.dueDateTo);
      }

      if (filters?.isOverdue) {
        query = query
          .lt('due_date', new Date().toISOString().split('T')[0])
          .in('status', ['pending', 'in_progress']);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as SmartTask[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useSmartTask(id: string) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['smart-task', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('smart_tasks')
        .select(`
          *,
          matter:matters(id, title, reference_number, ip_type, jurisdiction, status),
          assigned_user:users!smart_tasks_assigned_to_fkey(id, full_name, avatar_url, email),
          rule:jurisdiction_rules(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as SmartTask;
    },
    enabled: !!id && !!currentOrganization?.id,
  });
}

export function useCreateSmartTask() {
  const queryClient = useQueryClient();
  const { currentOrganization, user } = useOrganization();

  return useMutation({
    mutationFn: async (dto: CreateSmartTaskDTO) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data, error } = await supabase
        .from('smart_tasks')
        .insert({
          matter_id: dto.matter_id,
          portfolio_id: dto.portfolio_id,
          title: dto.title,
          description: dto.description,
          task_type: dto.task_type,
          priority: dto.priority || 'medium',
          trigger_date: dto.trigger_date,
          reminder_date: dto.reminder_date,
          due_date: dto.due_date,
          grace_period_days: dto.grace_period_days || 0,
          assigned_to: dto.assigned_to,
          parent_task_id: dto.parent_task_id,
          metadata: dto.metadata as Json,
          organization_id: currentOrganization.id,
          assigned_by: user?.id,
          status: 'pending',
          is_auto_generated: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-tasks'] });
      toast.success('Tarea creada correctamente');
    },
    onError: (error) => {
      toast.error('Error al crear tarea: ' + error.message);
    },
  });
}

export function useUpdateSmartTask() {
  const queryClient = useQueryClient();
  const { user } = useOrganization();

  return useMutation({
    mutationFn: async ({ id, ...dto }: UpdateSmartTaskDTO & { id: string }) => {
      const updateData: Record<string, unknown> = { ...dto };

      // Handle status changes
      if (dto.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user?.id;
      } else if (dto.status === 'in_progress' && !dto.status) {
        updateData.started_at = new Date().toISOString();
      } else if (dto.status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('smart_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['smart-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['smart-task', variables.id] });
      toast.success('Tarea actualizada');
    },
    onError: (error) => {
      toast.error('Error al actualizar: ' + error.message);
    },
  });
}

export function useDeleteSmartTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('smart_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-tasks'] });
      toast.success('Tarea eliminada');
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + error.message);
    },
  });
}

export function useCompleteTask() {
  const updateTask = useUpdateSmartTask();

  return useMutation({
    mutationFn: async (id: string) => {
      return updateTask.mutateAsync({ id, status: 'completed' });
    },
  });
}

export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!taskId,
  });
}

export function useAddTaskComment() {
  const queryClient = useQueryClient();
  const { user } = useOrganization();

  return useMutation({
    mutationFn: async ({ taskId, content, isInternal = true }: {
      taskId: string;
      content: string;
      isInternal?: boolean;
    }) => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          content,
          is_internal: isInternal,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      toast.success('Comentario añadido');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}
