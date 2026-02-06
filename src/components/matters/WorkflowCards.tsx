// ============================================================
// IP-NEXUS - Workflow Cards (High Contrast Redesign L130)
// Clean, professional phase visualization with strong contrast
// ============================================================

import { useState, useRef } from 'react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Check,
  Circle,
  Clock,
  History,
  ListTodo,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NeoBadge } from '@/components/ui/neo-badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AdvancePhaseModal } from './AdvancePhaseModal';

// High-contrast phase configuration with distinct colors
const PHASES_CONFIG = [
  { 
    key: 'F0', 
    label: 'Apertura', 
    description: 'Recepción y registro del expediente',
    colors: {
      active: '#0d9488',      // teal-600
      activeBg: 'bg-teal-600',
      completedBg: 'bg-teal-100',
      completedText: 'text-teal-700',
      completedIcon: 'text-teal-600',
      shadow: 'rgba(13, 148, 136, 0.4)',
      ring: 'ring-teal-100',
      connector: 'bg-teal-400',
    }
  },
  { 
    key: 'F1', 
    label: 'Análisis', 
    description: 'Estudio de viabilidad y búsqueda de anterioridades',
    colors: {
      active: '#2563eb',      // blue-600
      activeBg: 'bg-blue-600',
      completedBg: 'bg-blue-100',
      completedText: 'text-blue-700',
      completedIcon: 'text-blue-600',
      shadow: 'rgba(37, 99, 235, 0.4)',
      ring: 'ring-blue-100',
      connector: 'bg-blue-400',
    }
  },
  { 
    key: 'F2', 
    label: 'Presupuesto', 
    description: 'Elaboración y envío de presupuesto al cliente',
    colors: {
      active: '#4f46e5',      // indigo-600
      activeBg: 'bg-indigo-600',
      completedBg: 'bg-indigo-100',
      completedText: 'text-indigo-700',
      completedIcon: 'text-indigo-600',
      shadow: 'rgba(79, 70, 229, 0.4)',
      ring: 'ring-indigo-100',
      connector: 'bg-indigo-400',
    }
  },
  { 
    key: 'F3', 
    label: 'Contratación', 
    description: 'Aceptación y formalización del encargo',
    colors: {
      active: '#9333ea',      // purple-600
      activeBg: 'bg-purple-600',
      completedBg: 'bg-purple-100',
      completedText: 'text-purple-700',
      completedIcon: 'text-purple-600',
      shadow: 'rgba(147, 51, 234, 0.4)',
      ring: 'ring-purple-100',
      connector: 'bg-purple-400',
    }
  },
  { 
    key: 'F4', 
    label: 'Preparación', 
    description: 'Preparación de documentación para presentación',
    colors: {
      active: '#7c3aed',      // violet-600
      activeBg: 'bg-violet-600',
      completedBg: 'bg-violet-100',
      completedText: 'text-violet-700',
      completedIcon: 'text-violet-600',
      shadow: 'rgba(124, 58, 237, 0.4)',
      ring: 'ring-violet-100',
      connector: 'bg-violet-400',
    }
  },
  { 
    key: 'F5', 
    label: 'Presentación', 
    description: 'Presentación ante la oficina correspondiente',
    colors: {
      active: '#c026d3',      // fuchsia-600
      activeBg: 'bg-fuchsia-600',
      completedBg: 'bg-fuchsia-100',
      completedText: 'text-fuchsia-700',
      completedIcon: 'text-fuchsia-600',
      shadow: 'rgba(192, 38, 211, 0.4)',
      ring: 'ring-fuchsia-100',
      connector: 'bg-fuchsia-400',
    }
  },
  { 
    key: 'F6', 
    label: 'Examen', 
    description: 'Examen de forma y fondo por la oficina',
    colors: {
      active: '#e11d48',      // rose-600
      activeBg: 'bg-rose-600',
      completedBg: 'bg-rose-100',
      completedText: 'text-rose-700',
      completedIcon: 'text-rose-600',
      shadow: 'rgba(225, 29, 72, 0.4)',
      ring: 'ring-rose-100',
      connector: 'bg-rose-400',
    }
  },
  { 
    key: 'F7', 
    label: 'Publicación', 
    description: 'Publicación en boletín oficial',
    colors: {
      active: '#d97706',      // amber-600
      activeBg: 'bg-amber-600',
      completedBg: 'bg-amber-100',
      completedText: 'text-amber-700',
      completedIcon: 'text-amber-700',
      shadow: 'rgba(217, 119, 6, 0.4)',
      ring: 'ring-amber-100',
      connector: 'bg-amber-400',
    }
  },
  { 
    key: 'F8', 
    label: 'Resolución', 
    description: 'Resolución final de concesión o denegación',
    colors: {
      active: '#059669',      // emerald-600
      activeBg: 'bg-emerald-600',
      completedBg: 'bg-emerald-100',
      completedText: 'text-emerald-700',
      completedIcon: 'text-emerald-600',
      shadow: 'rgba(5, 150, 105, 0.4)',
      ring: 'ring-emerald-100',
      connector: 'bg-emerald-400',
    }
  },
  { 
    key: 'F9', 
    label: 'Seguimiento', 
    description: 'Mantenimiento y renovaciones',
    colors: {
      active: '#0891b2',      // cyan-600
      activeBg: 'bg-cyan-600',
      completedBg: 'bg-cyan-100',
      completedText: 'text-cyan-700',
      completedIcon: 'text-cyan-600',
      shadow: 'rgba(8, 145, 178, 0.4)',
      ring: 'ring-cyan-100',
      connector: 'bg-cyan-400',
    }
  },
];

interface PhaseHistoryEntry {
  phase: string;
  enteredAt: string;
  completedAt?: string;
}

interface WorkflowCardsProps {
  currentPhase: string;
  phaseHistory?: PhaseHistoryEntry[];
  expedienteId: string;
  matterReference?: string;
  tasksPerPhase?: Record<string, number>;
  phaseEnteredAt?: string;
  typeColor?: string;
  onAdvancePhase?: () => void;
  onPhaseClick?: (phase: string) => void;
}

export function WorkflowCards({
  currentPhase,
  phaseHistory = [],
  expedienteId,
  matterReference = '',
  tasksPerPhase = {},
  phaseEnteredAt,
  typeColor = 'text-blue-600',
  onAdvancePhase,
  onPhaseClick
}: WorkflowCardsProps) {
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const currentIndex = PHASES_CONFIG.findIndex(f => f.key === currentPhase);
  const progressPercent = Math.round(((currentIndex + 1) / PHASES_CONFIG.length) * 100);
  
  // Calcular tiempo en fase actual
  const daysInCurrentPhase = phaseEnteredAt 
    ? differenceInDays(new Date(), new Date(phaseEnteredAt))
    : 0;

  // Obtener estado de cada fase
  const getPhaseStatus = (index: number): 'completed' | 'current' | 'pending' => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  const currentPhaseConfig = PHASES_CONFIG[currentIndex];
  const nextPhaseConfig = currentIndex < PHASES_CONFIG.length - 1 ? PHASES_CONFIG[currentIndex + 1] : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 transition-all duration-300 ease-out">
      {/* Phase Circles with Connectors */}
      <div className="flex items-center justify-between mb-6">
        {PHASES_CONFIG.map((phase, index) => {
          const status = getPhaseStatus(index);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          const isPending = status === 'pending';
          const pendingTasks = tasksPerPhase[phase.key] || 0;
          const colors = phase.colors;

          // Get previous phase for connector color
          const prevPhase = index > 0 ? PHASES_CONFIG[index - 1] : null;
          const prevStatus = index > 0 ? getPhaseStatus(index - 1) : null;

          return (
            <div key={phase.key} className="flex items-center flex-1 last:flex-none">
              {/* Connector BEFORE this phase (not for first phase) */}
              {index > 0 && (
                <div 
                  className={cn(
                    "flex-1 mx-1",
                    // Completed → Completed: solid color
                    prevStatus === 'completed' && isCompleted && cn("h-1 rounded-full", prevPhase?.colors.connector),
                    // Completed → Current: gradient
                    prevStatus === 'completed' && isCurrent && "h-1 rounded-full",
                    // Current → Pending or Pending → Pending: dashed
                    (isCurrent && isPending) || (prevStatus === 'pending' && isPending) && "h-0.5 border-t-2 border-dashed border-slate-200",
                    // Pending connectors
                    isPending && "h-0.5 bg-slate-200"
                  )}
                  style={
                    prevStatus === 'completed' && isCurrent
                      ? { background: `linear-gradient(90deg, ${prevPhase?.colors.active}, ${colors.active})` }
                      : undefined
                  }
                />
              )}

              {/* Phase Circle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onPhaseClick?.(phase.key)}
                    className={cn(
                      "relative flex flex-col items-center justify-center shrink-0",
                      "transition-all duration-300 ease-out",
                      // ACTIVE: Large, solid color, prominent
                      isCurrent && cn(
                        "w-16 h-16 rounded-2xl text-white font-bold shadow-xl",
                        "ring-4 ring-white ring-offset-2",
                        colors.activeBg
                      ),
                      // COMPLETED: Medium, light background
                      isCompleted && cn(
                        "w-12 h-12 rounded-xl",
                        colors.completedBg
                      ),
                      // PENDING: Medium, dashed border
                      isPending && "w-12 h-12 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200"
                    )}
                    style={isCurrent ? {
                      boxShadow: `0 10px 25px -5px ${colors.shadow}`,
                    } : undefined}
                  >
                    {/* Content based on status */}
                    {isCurrent && (
                      <>
                        <span className="text-base font-bold">{phase.key}</span>
                        {/* Pulsing indicator */}
                        <span 
                          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white animate-pulse"
                          style={{ boxShadow: `0 0 0 3px ${colors.active}` }}
                        />
                      </>
                    )}
                    
                    {isCompleted && (
                      <Check 
                        className={cn("h-6 w-6", colors.completedIcon)} 
                        strokeWidth={3}
                      />
                    )}
                    
                    {isPending && (
                      <span className="text-sm font-medium text-slate-300">
                        {phase.key}
                      </span>
                    )}
                    
                    {/* Task count badge for current phase */}
                    {pendingTasks > 0 && isCurrent && (
                      <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {pendingTasks}
                      </div>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-semibold">{phase.key}: {phase.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>

      {/* Phase Labels Row */}
      <div className="flex items-start justify-between mb-5">
        {PHASES_CONFIG.map((phase, index) => {
          const status = getPhaseStatus(index);
          const isCurrent = status === 'current';
          const isCompleted = status === 'completed';
          const colors = phase.colors;

          return (
            <div 
              key={phase.key} 
              className={cn(
                "flex-1 last:flex-none text-center px-1",
                isCurrent && "flex-none"
              )}
              style={isCurrent ? { width: '64px' } : { width: '48px' }}
            >
              <span className={cn(
                "text-xs block truncate",
                isCurrent && cn("font-bold", colors.completedText),
                isCompleted && "font-medium text-slate-600",
                !isCurrent && !isCompleted && "text-slate-300"
              )}>
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current Phase Info Card */}
      <div className="border border-slate-200 rounded-xl p-5 bg-white">
        <div className="flex items-center justify-between">
          {/* Left Side: Phase Info */}
          <div className="flex items-center gap-4">
            {/* Large colored dot */}
            <div 
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: currentPhaseConfig?.colors.active }}
            />
            
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                {currentPhaseConfig?.label} ({currentPhase})
              </h3>
              <p className="text-sm text-slate-500 flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {daysInCurrentPhase} días en fase
                </span>
                <span className="flex items-center gap-1.5">
                  <ListTodo className="h-3.5 w-3.5" />
                  {tasksPerPhase[currentPhase] || 0} tareas
                </span>
              </p>
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-3">
            {/* NeoBadge with progress */}
            <NeoBadge 
              value={`${progressPercent}%`}
              label="completado"
              color={currentPhaseConfig?.colors.active || '#00b4d8'}
              size="md"
            />

            {/* History Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowHistoryModal(true)}
              className="text-slate-500 hover:text-slate-700"
            >
              <History className="h-4 w-4 mr-1.5" />
              Historial
            </Button>

            {/* Advance Button */}
            {nextPhaseConfig && (
              <Button 
                size="sm" 
                onClick={() => setShowAdvanceModal(true)}
                className="font-medium shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${nextPhaseConfig.colors.active}, ${nextPhaseConfig.colors.active}cc)`,
                  color: 'white',
                  border: 'none',
                }}
              >
                Avanzar a {nextPhaseConfig.key}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Historial de Fases</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {phaseHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Sin historial de cambios de fase
              </p>
            ) : (
              phaseHistory.map((entry, index) => {
                const phaseConfig = PHASES_CONFIG.find(p => p.key === entry.phase);
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className="font-mono"
                        style={{ 
                          backgroundColor: phaseConfig?.colors.completedBg?.replace('bg-', ''),
                          borderColor: phaseConfig?.colors.active 
                        }}
                      >
                        {entry.phase}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">
                          {phaseConfig?.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.enteredAt), "d MMM yyyy", { locale: es })}
                          {entry.completedAt && (
                            <> → {format(new Date(entry.completedAt), "d MMM yyyy", { locale: es })}</>
                          )}
                        </p>
                      </div>
                    </div>
                    {entry.completedAt ? (
                      <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                    ) : (
                      <Circle 
                        className="h-4 w-4 fill-current animate-pulse" 
                        style={{ color: phaseConfig?.colors.active }} 
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de avance de fase */}
      <AdvancePhaseModal
        isOpen={showAdvanceModal}
        onClose={() => setShowAdvanceModal(false)}
        matterId={expedienteId}
        matterReference={matterReference}
        currentPhase={currentPhase}
        onSuccess={(newPhase) => {
          // Trigger the phase panel for the new phase
          onPhaseClick?.(newPhase);
        }}
      />
    </div>
  );
}
