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
  description: string | null;
  position: number;
  color: string | null;
  icon: string | null;
  default_tasks: unknown[];
  is_active: boolean;
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
    mutationFn: async ({ newPhase, notes }: { newPhase: string; notes?: string }) => {
      const { data, error } = await supabase
        .rpc('advance_matter_phase', {
          p_matter_id: matterId,
          p_new_phase: newPhase,
          p_notes: notes,
        });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; from?: string; to?: string };
      if (!result.success) {
        throw new Error(result.error || 'Error al avanzar fase');
      }
      
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matter', matterId] });
      queryClient.invalidateQueries({ queryKey: ['matter-timeline', matterId] });
      queryClient.invalidateQueries({ queryKey: ['matters'] });
      toast.success(`Fase actualizada: ${data.from} → ${data.to}`);
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
