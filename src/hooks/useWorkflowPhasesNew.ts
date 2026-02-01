// ════════════════════════════════════════════════════════════════════════════
// IP-NEXUS - Workflow Phases Hook (New Version)
// PROMPT 4D: Hook completo para gestión de fases de workflow
// ════════════════════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  WorkflowPhase, 
  MatterPhaseHistory, 
  PhaseTransitionResult, 
  PhaseCode,
  ChangePhaseParams 
} from '@/types/workflow';
import { toast } from 'sonner';

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Obtener todas las fases
// ══════════════════════════════════════════════════════════════════════════

export function useAllWorkflowPhases() {
  return useQuery({
    queryKey: ['workflow-phases-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_phases')
        .select('*')
        .order('sequence');

      if (error) throw error;
      
      // Map database fields to interface
      return (data || []).map(phase => ({
        ...phase,
        name_en: phase.name,
        name_es: phase.name,
        description_en: phase.description,
        description_es: phase.description,
      })) as WorkflowPhase[];
    },
    staleTime: 1000 * 60 * 60, // 1 hora - datos maestros
  });
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Obtener fase por código
// ══════════════════════════════════════════════════════════════════════════

export function useWorkflowPhaseByCode(code?: PhaseCode) {
  const { data: phases } = useAllWorkflowPhases();
  return phases?.find(p => p.code === code);
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Historial de fases de un expediente
// ══════════════════════════════════════════════════════════════════════════

export function useMatterPhaseHistory(matterId?: string) {
  return useQuery({
    queryKey: ['matter-phase-history', matterId],
    queryFn: async () => {
      if (!matterId) return [];

      const { data, error } = await supabase
        .from('matter_phase_history')
        .select(`
          *,
          user:users!matter_phase_history_changed_by_fkey(id, full_name, avatar_url)
        `)
        .eq('matter_id', matterId)
        .order('changed_at', { ascending: false });

      if (error) {
        // Fallback without user join if FK fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('matter_phase_history')
          .select('*')
          .eq('matter_id', matterId)
          .order('changed_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        return fallbackData as MatterPhaseHistory[];
      }
      
      return data as MatterPhaseHistory[];
    },
    enabled: !!matterId,
  });
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Cambiar fase de expediente
// ══════════════════════════════════════════════════════════════════════════

export function useChangePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matterId, newPhase, reason, notes }: ChangePhaseParams) => {
      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .rpc('change_matter_phase', {
          p_matter_id: matterId,
          p_new_phase: newPhase,
          p_reason: reason || null,
          p_notes: notes || null,
          p_user_id: user.user?.id || null,
        });

      if (error) throw error;
      
      const result = data as unknown as PhaseTransitionResult;
      if (!result.success) {
        throw new Error(result.error || 'Phase transition failed');
      }
      
      return result;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter', variables.matterId] });
      queryClient.invalidateQueries({ queryKey: ['matter-phase-history', variables.matterId] });
      queryClient.invalidateQueries({ queryKey: ['matters'] });
      queryClient.invalidateQueries({ queryKey: ['phase-stats'] });
      
      toast.success(`Fase actualizada: ${result.from_phase} → ${result.to_phase}`);
    },
    onError: (error) => {
      toast.error('Error al cambiar fase: ' + error.message);
    },
  });
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Verificar si transición es válida
// ══════════════════════════════════════════════════════════════════════════

export function useCanTransitionTo(currentPhase?: PhaseCode) {
  const { data: phases } = useAllWorkflowPhases();
  
  if (!phases || !currentPhase) return { forward: [], backward: [], all: [] };
  
  const current = phases.find(p => p.code === currentPhase);
  if (!current) return { forward: [], backward: [], all: [] };
  
  const forward = (current.allowed_next_phases || []) as PhaseCode[];
  const backward = (current.allowed_prev_phases || []) as PhaseCode[];
  
  return {
    forward,
    backward,
    all: [...forward, ...backward],
  };
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Estadísticas de tiempo en fases
// ══════════════════════════════════════════════════════════════════════════

export function usePhaseTimeStats(matterId?: string) {
  const { data: history } = useMatterPhaseHistory(matterId);
  
  if (!history?.length) return {};
  
  const stats: Record<string, { totalTime: number; visits: number }> = {};
  
  history.forEach(entry => {
    if (entry.from_phase && entry.time_in_previous_phase) {
      // Parse interval string to seconds
      const timeStr = entry.time_in_previous_phase;
      let seconds = 0;
      
      // Handle PostgreSQL interval format
      const match = timeStr.match(/(\d+):(\d+):(\d+)/);
      if (match) {
        seconds = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
      }
      
      if (!stats[entry.from_phase]) {
        stats[entry.from_phase] = { totalTime: 0, visits: 0 };
      }
      stats[entry.from_phase].totalTime += seconds;
      stats[entry.from_phase].visits += 1;
    }
  });
  
  return stats;
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Progreso de workflow
// ══════════════════════════════════════════════════════════════════════════

export function useWorkflowProgress(currentPhase?: string, targetPhase: string = 'F8') {
  const { data: phases } = useAllWorkflowPhases();
  
  if (!phases || !currentPhase) return { progress: 0, stepsCompleted: 0, totalSteps: 10 };
  
  const currentIndex = phases.findIndex(p => p.code === currentPhase);
  const targetIndex = phases.findIndex(p => p.code === targetPhase);
  
  if (currentIndex === -1 || targetIndex === -1) {
    return { progress: 0, stepsCompleted: 0, totalSteps: 10 };
  }
  
  const progress = Math.round((currentIndex / targetIndex) * 100);
  
  return {
    progress: Math.min(progress, 100),
    stepsCompleted: currentIndex,
    totalSteps: targetIndex,
    currentPhase: phases[currentIndex],
    targetPhase: phases[targetIndex],
  };
}

// ══════════════════════════════════════════════════════════════════════════
// Export utility functions from types
// ══════════════════════════════════════════════════════════════════════════

export { PHASE_COLORS, PHASE_ICONS, getPhaseColor, getPhaseIcon, isValidPhaseCode } from '@/types/workflow';
