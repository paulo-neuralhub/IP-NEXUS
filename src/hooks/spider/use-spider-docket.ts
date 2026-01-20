import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useModuleAccess } from '@/hooks/use-module-access';

// Crear tarea de oposición desde resultado de Spider
export function useCreateOppositionTask() {
  const queryClient = useQueryClient();
  const { hasAccess: hasDocket } = useModuleAccess('docket');

  return useMutation({
    mutationFn: async ({
      watchResultId,
      matterId,
      assignTo,
      notes,
    }: {
      watchResultId: string;
      matterId?: string;
      assignTo?: string;
      notes?: string;
    }) => {
      if (!hasDocket) {
        throw new Error('El módulo Docket es necesario para crear tareas');
      }

      // Obtener resultado
      const { data: result, error: resultError } = await supabase
        .from('watch_results')
        .select('*, watchlist:watchlists(*)')
        .eq('id', watchResultId)
        .single();

      if (resultError) throw resultError;

      // Calcular fechas
      const dueDate = result.opposition_deadline || 
        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Actualizar resultado como "actioned"
      const { error: updateError } = await supabase
        .from('watch_results')
        .update({
          status: 'actioned',
          action_taken: 'opposition_task_created',
          action_date: new Date().toISOString(),
          related_matter_id: matterId,
        } as any)
        .eq('id', watchResultId);

      if (updateError) throw updateError;

      // Cerrar alerta si existe
      await supabase
        .from('spider_alerts')
        .update({ status: 'actioned', actioned_at: new Date().toISOString() } as any)
        .eq('watch_result_id', watchResultId)
        .eq('status', 'unread');

      return {
        id: watchResultId,
        title: result.title,
        dueDate,
        matterId,
        notes,
        created: true,
      };

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-results'] });
      queryClient.invalidateQueries({ queryKey: ['spider-alerts'] });
      toast.success('Resultado marcado para acción');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al procesar');
    },
  });
}

// Vincular resultado a matter existente
export function useLinkResultToMatter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      watchResultId,
      matterId,
    }: {
      watchResultId: string;
      matterId: string;
    }) => {
      const { error } = await supabase
        .from('watch_results')
        .update({
          related_matter_id: matterId,
          status: 'reviewing',
        } as any)
        .eq('id', watchResultId);
      const { error } = await supabase
        .from('watch_results')
        .update({
          related_matter_id: matterId,
          status: 'reviewing',
        })
        .eq('id', watchResultId);

      if (error) throw error;

      return { watchResultId, matterId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-results'] });
      toast.success('Resultado vinculado al expediente');
    },
  });
}

// Marcar resultado como amenaza
export function useMarkAsThreat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      watchResultId,
      notes,
    }: {
      watchResultId: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('watch_results')
        .update({
          status: 'threat',
          action_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', watchResultId);

      if (error) throw error;

      return { watchResultId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-results'] });
      queryClient.invalidateQueries({ queryKey: ['spider-stats'] });
      toast.success('Marcado como amenaza');
    },
  });
}

// Descartar resultado
export function useDismissResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      watchResultId,
      reason,
    }: {
      watchResultId: string;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from('watch_results')
        .update({
          status: 'dismissed',
          action_notes: reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', watchResultId);

      if (error) throw error;

      // Cerrar alertas relacionadas
      await supabase
        .from('spider_alerts')
        .update({ status: 'dismissed' })
        .eq('watch_result_id', watchResultId)
        .eq('status', 'unread');

      return { watchResultId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-results'] });
      queryClient.invalidateQueries({ queryKey: ['spider-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['spider-stats'] });
      toast.success('Resultado descartado');
    },
  });
}
