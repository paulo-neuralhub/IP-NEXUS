/**
 * use-matter-deadlines - Hook para plazos del expediente
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

export interface MatterDeadline {
  id: string;
  matter_id: string;
  organization_id: string;
  title: string;
  description?: string | null;
  deadline_type?: string;
  due_date: string;
  is_completed: boolean;
  completed_at?: string | null;
  completed_by?: string | null;
  assigned_to?: string | null;
  created_at: string;
}

export function useMatterDeadlines(matterId: string) {
  return useQuery({
    queryKey: ['matter-deadlines', matterId],
    queryFn: async () => {
      // Query from matter_deadlines table
      const client: any = supabase;
      const { data, error } = await client
        .from('matter_deadlines')
        .select('*')
        .eq('matter_id', matterId)
        .order('deadline_date', { ascending: true });
      
      if (error) throw error;
      
      // Map fields to interface
      return (data || []).map((d: any) => ({
        id: d.id,
        matter_id: d.matter_id,
        organization_id: d.organization_id,
        title: d.title,
        description: d.description,
        deadline_type: d.deadline_type,
        due_date: d.deadline_date,
        is_completed: d.status === 'completed',
        completed_at: d.completed_at,
        completed_by: d.completed_by,
        assigned_to: d.assigned_to,
        created_at: d.created_at,
      })) as MatterDeadline[];
    },
    enabled: !!matterId,
  });
}

export function useCreateMatterDeadline() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: {
      matter_id: string;
      title: string;
      description?: string | null;
      deadline_type?: string;
      due_date: string;
    }) => {
      const client: any = supabase;
      const { data: deadline, error } = await client
        .from('matter_deadlines')
        .insert({ 
          matter_id: data.matter_id,
          organization_id: currentOrganization!.id,
          title: data.title,
          description: data.description,
          deadline_type: data.deadline_type || 'internal',
          deadline_date: data.due_date,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return deadline;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-deadlines', variables.matter_id] });
    },
  });
}

export function useCompleteMatterDeadline() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const client: any = supabase;
      const { error } = await client
        .from('matter_deadlines')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-deadlines'] });
    },
  });
}
