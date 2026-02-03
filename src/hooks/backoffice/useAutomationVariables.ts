// =====================================================================
// Hook para gestionar Automation Variables (Backoffice)
// =====================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AutomationVariable } from '@/types/automations';

const QUERY_KEY = ['automation-variables'];

// ─── Fetch global variables ─────────────────────────────────

export function useAutomationVariables(organizationId?: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, organizationId],
    queryFn: async () => {
      let query = supabase
        .from('automation_variables')
        .select('*')
        .order('key', { ascending: true });

      if (organizationId === null) {
        // Only global variables
        query = query.is('organization_id', null);
      } else if (organizationId) {
        // Specific tenant variables
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AutomationVariable[];
    },
  });
}

// ─── Create variable ────────────────────────────────────────

export function useCreateVariable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variable: Omit<AutomationVariable, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('automation_variables')
        .insert(variable)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Variable creada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear variable: ${error.message}`);
    },
  });
}

// ─── Update variable ────────────────────────────────────────

export function useUpdateVariable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AutomationVariable> & { id: string }) => {
      const { data, error } = await supabase
        .from('automation_variables')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Variable actualizada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar variable: ${error.message}`);
    },
  });
}

// ─── Delete variable ────────────────────────────────────────

export function useDeleteVariable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('automation_variables')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Variable eliminada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar variable: ${error.message}`);
    },
  });
}
