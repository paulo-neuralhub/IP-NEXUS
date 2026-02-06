// ============================================================
// IP-NEXUS - WORKFLOW PHASES HOOK
// L88: Sistema de fases de expedientes (F0-F9)
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

export interface WorkflowPhase {
  id: string;
  organization_id: string | null;
  code: string;
  name: string;
  name_en?: string;
  name_es?: string;
  description: string | null;
  description_en?: string | null;
  description_es?: string | null;
  position: number;
  sequence?: number;
  color: string | null;
  icon: string | null;
  default_tasks: unknown[];
  is_active: boolean;
  is_initial?: boolean;
  is_terminal?: boolean;
  allows_editing?: boolean;
  allowed_next_phases?: string[];
  allowed_prev_phases?: string[];
  on_enter_actions?: Record<string, unknown>;
  on_exit_actions?: Record<string, unknown>;
  entry_validations?: Record<string, unknown>;
  created_at: string;
}

export interface PhaseHistoryEntry {
  from: string;
  to: string;
  changed_at: string;
  changed_by?: string;
  notes?: string;
}

// Obtener todas las fases de workflow
export function useWorkflowPhases() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['workflow-phases', currentOrganization?.id],
    queryFn: async () => {
      // Obtener fases globales (organization_id IS NULL) y de la organización
      const { data, error } = await supabase
        .from('workflow_phases')
        .select('*')
        .or(`organization_id.is.null,organization_id.eq.${currentOrganization?.id}`)
        .eq('is_active', true)
        .order('position');

      if (error) throw error;
      return data as WorkflowPhase[];
    },
    enabled: !!currentOrganization?.id,
    staleTime: 1000 * 60 * 60, // 1 hora - las fases no cambian frecuentemente
  });
}

// Obtener fase actual de un expediente
export function useMatterPhase(matterId: string) {
  const queryClient = useQueryClient();

  const advancePhase = useMutation({
    mutationFn: async ({ newPhase, reason, notes }: { newPhase: string; reason?: string; notes?: string }) => {
      // Use the new change_matter_phase function
      const { data, error } = await supabase
        .rpc('change_matter_phase', {
          p_matter_id: matterId,
          p_new_phase: newPhase,
          p_reason: reason,
          p_notes: notes,
          p_user_id: null, // Will use auth.uid() in function
        });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; from_phase?: string; to_phase?: string; allowed_next?: string[]; allowed_prev?: string[] };
      if (!result.success) {
        throw new Error(result.error || 'Error al cambiar fase');
      }
      
      return result;
    },
    onSuccess: (data) => {
      // Update cache optimistically BEFORE invalidating to prevent flash
      // Set the new phase data directly in cache
      queryClient.setQueryData(['matter-v2', matterId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          current_phase: data.to_phase,
          phase_entered_at: new Date().toISOString(),
        };
      });
      
      // Invalidate in background (won't cause flash since cache is already updated)
      queryClient.invalidateQueries({ queryKey: ['matter', matterId] });
      queryClient.invalidateQueries({ queryKey: ['matter-v2', matterId] });
      queryClient.invalidateQueries({ queryKey: ['matter-timeline', matterId] });
      queryClient.invalidateQueries({ queryKey: ['matters'] });
      queryClient.invalidateQueries({ queryKey: ['matters-v2'] });
      
      toast.success(`Fase actualizada: ${data.from_phase} → ${data.to_phase}`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  return { advancePhase };
}

// Obtener estadísticas de fases por organización
export function usePhaseStats() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['phase-stats', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matters')
        .select('current_phase')
        .eq('organization_id', currentOrganization?.id);

      if (error) throw error;

      // Contar expedientes por fase
      const stats: Record<string, number> = {};
      data?.forEach((m) => {
        const phase = m.current_phase || 'F0';
        stats[phase] = (stats[phase] || 0) + 1;
      });

      return stats;
    },
    enabled: !!currentOrganization?.id,
  });
}
