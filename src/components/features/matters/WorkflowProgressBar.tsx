// ============================================================
// IP-NEXUS - WORKFLOW PROGRESS BAR (Metro Map Style)
// L88: Visualización de fases de expedientes
// ============================================================

import { useWorkflowPhases } from '@/hooks/use-workflow-phases';
import { cn } from '@/lib/utils';
import { Check, ChevronRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { PhaseHistoryEntry } from '@/hooks/use-workflow-phases';

interface WorkflowProgressBarProps {
  currentPhase: string;
  phaseHistory?: PhaseHistoryEntry[];
  onPhaseClick?: (phaseCode: string) => void;
  compact?: boolean;
  className?: string;
}

export function WorkflowProgressBar({
  currentPhase,
  phaseHistory = [],
  onPhaseClick,
  compact = false,
  className,
}: WorkflowProgressBarProps) {
  const { data: phases, isLoading } = useWorkflowPhases();

  if (isLoading || !phases?.length) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-3 w-3 rounded-full bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const currentIndex = phases.findIndex((p) => p.code === currentPhase);
  const completedPhaseCodes = new Set(phaseHistory.map((h) => h.from));

  // Vista compacta: solo dots con tooltip
  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {phases.map((phase, index) => {
          const isCompleted = index < currentIndex || completedPhaseCodes.has(phase.code);
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex && !completedPhaseCodes.has(phase.code);

          return (
            <Tooltip key={phase.code}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onPhaseClick?.(phase.code)}
                  disabled={!onPhaseClick}
                  className={cn(
                    'h-3 w-3 rounded-full transition-all shrink-0',
                    isCompleted && 'bg-primary',
                    isCurrent && 'bg-primary ring-2 ring-primary/30 scale-125',
                    isFuture && 'bg-muted-foreground/30'
                  )}
                  style={{
                    backgroundColor: (isCompleted || isCurrent) ? phase.color || undefined : undefined,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="font-medium">{phase.code}: {phase.name}</p>
                {phase.description && (
                  <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
        <span className="ml-2 text-xs font-medium text-muted-foreground">
          {currentPhase}: {phases[currentIndex]?.name}
        </span>
      </div>
    );
  }

  // Vista completa: metro map style
  return (
    <div className={cn('relative py-4', className)}>
      {/* Línea de fondo */}
      <div className="absolute left-5 right-5 top-1/2 h-1 -translate-y-1/2 bg-muted rounded-full" />

      {/* Línea de progreso */}
      <div
        className="absolute left-5 top-1/2 h-1 -translate-y-1/2 bg-primary rounded-full transition-all duration-500"
        style={{
          width: `${(currentIndex / (phases.length - 1)) * 100}%`,
          maxWidth: 'calc(100% - 40px)',
        }}
      />

      {/* Nodos de fases */}
      <div className="relative flex justify-between px-2">
        {phases.map((phase, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <Tooltip key={phase.code}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => !isFuture && onPhaseClick?.(phase.code)}
                    disabled={isFuture || !onPhaseClick}
                    className={cn(
                      'relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all',
                      'text-xs font-semibold',
                      isCompleted && 'text-primary-foreground hover:opacity-90',
                      isCurrent && 'text-primary-foreground ring-4 ring-primary/30 scale-110',
                      isFuture && 'bg-muted text-muted-foreground cursor-not-allowed'
                    )}
                    style={{
                      backgroundColor: (isCompleted || isCurrent) ? phase.color || 'hsl(var(--primary))' : undefined,
                    }}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      phase.code.replace('F', '')
                    )}
                  </button>
                  {/* Label debajo */}
                  <span
                    className={cn(
                      'mt-2 text-[10px] font-medium text-center max-w-[60px] leading-tight hidden sm:block',
                      isCurrent && 'text-foreground font-semibold',
                      isFuture && 'text-muted-foreground'
                    )}
                  >
                    {phase.name}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="font-medium">{phase.code}: {phase.name}</p>
                {phase.description && (
                  <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
                )}
                {isCurrent && (
                  <p className="text-xs text-primary mt-1 font-medium">← Fase actual</p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
