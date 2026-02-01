// ════════════════════════════════════════════════════════════════════════════
// IP-NEXUS - Workflow Types
// PROMPT 4D: Tipos para fases de workflow y historial
// ════════════════════════════════════════════════════════════════════════════

export type PhaseCode = 'F0' | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9';

export interface WorkflowPhase {
  id: string;
  code: PhaseCode;
  name: string;
  name_en: string;
  name_es: string;
  description: string | null;
  description_en: string | null;
  description_es: string | null;
  sequence: number;
  position?: number;
  icon: string | null;
  color: string | null;
  is_initial: boolean;
  is_terminal: boolean;
  allows_editing: boolean;
  allowed_next_phases: string[];
  allowed_prev_phases: string[];
  on_enter_actions: Record<string, unknown>;
  on_exit_actions: Record<string, unknown>;
  entry_validations: Record<string, unknown>;
  
  // Extended fields
  organization_id?: string | null;
  is_active?: boolean;
  estimated_days?: number | null;
  required_documents?: string[] | null;
  can_skip?: boolean;
  requires_approval?: boolean;
  sla_hours?: number | null;
  default_tasks?: unknown[];
  created_at?: string;
}

export interface MatterPhaseHistory {
  id: string;
  matter_id: string;
  from_phase: string | null;
  to_phase: string;
  changed_by: string | null;
  changed_at: string;
  reason: string | null;
  notes: string | null;
  time_in_previous_phase: string | null;
  metadata: Record<string, unknown>;
  
  // Joined relations
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface PhaseTransitionResult {
  success: boolean;
  error?: string;
  from_phase?: string;
  to_phase?: string;
  time_in_previous_phase?: number;
  allowed_next?: string[];
  allowed_prev?: string[];
  message?: string;
}

export interface ChangePhaseParams {
  matterId: string;
  newPhase: PhaseCode;
  reason?: string;
  notes?: string;
}

// Phase styling constants
export const PHASE_COLORS: Record<PhaseCode, { bg: string; text: string; border: string }> = {
  F0: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  F1: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  F2: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  F3: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300' },
  F4: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  F5: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  F6: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  F7: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300' },
  F8: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  F9: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' },
};

export const PHASE_ICONS: Record<PhaseCode, string> = {
  F0: '📝',
  F1: '📋',
  F2: '📤',
  F3: '🔍',
  F4: '📰',
  F5: '⚔️',
  F6: '✅',
  F7: '🔐',
  F8: '🏆',
  F9: '📁',
};

// Helper functions
export function getPhaseColor(code: string): { bg: string; text: string; border: string } {
  return PHASE_COLORS[code as PhaseCode] || PHASE_COLORS.F0;
}

export function getPhaseIcon(code: string): string {
  return PHASE_ICONS[code as PhaseCode] || '📝';
}

export function isValidPhaseCode(code: string): code is PhaseCode {
  return ['F0', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'].includes(code);
}
