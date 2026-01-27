/**
 * use-matter-tasks - Hook para tareas del expediente
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

export interface MatterTask {
  id: string;
  matter_id: string;
  organization_id: string;
  title: string;
  description?: string | null;
  priority?: string;
  due_date?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  created_at: string;
}

export function useMatterTasks(matterId: string) {
  return useQuery({
    queryKey: ['matter-tasks', matterId],
    queryFn: async () => {
      // Query from activities table with type = 'task' for matter
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('matter_id', matterId)
        .eq('type', 'task')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map to MatterTask interface
      return (data || []).map(a => ({
        id: a.id,
        matter_id: a.matter_id || '',
        organization_id: a.organization_id,
        title: a.subject || 'Sin título',
        description: a.content,
        priority: (a.metadata as any)?.priority || 'medium',
        due_date: a.due_date,
        is_completed: a.is_completed || false,
        completed_at: a.completed_at,
        assigned_to: (a.metadata as any)?.assigned_to,
        assigned_to_name: (a.metadata as any)?.assigned_to_name,
        created_at: a.created_at || '',
      })) as MatterTask[];
    },
    enabled: !!matterId,
  });
}

export function useCreateMatterTask() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: {
      matter_id: string;
      title: string;
      description?: string | null;
      priority?: string;
      due_date?: string | null;
    }) => {
      const { data: task, error } = await supabase
        .from('activities')
        .insert({ 
          organization_id: currentOrganization!.id,
          owner_type: 'tenant',
          matter_id: data.matter_id,
          type: 'task',
          subject: data.title,
          content: data.description,
          due_date: data.due_date,
          is_completed: false,
          metadata: { priority: data.priority || 'medium' },
        })
        .select()
        .single();
      
      if (error) throw error;
      return task;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-tasks', variables.matter_id] });
    },
  });
}

export function useCompleteMatterTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('activities')
        .update({ 
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-tasks'] });
    },
  });
}
