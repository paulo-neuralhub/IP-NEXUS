// ============================================
// src/components/features/crm/shared/PipelineProgressBar.tsx
// Visual pipeline progress bar (Metro Map style)
// ============================================

import { cn } from '@/lib/utils';
import { Check, Circle, Trophy, XCircle } from 'lucide-react';
import { hexToHSL } from '@/hooks/use-branding';
import type { CRMPipelineStage } from '@/hooks/crm/v2/pipelines';

interface PipelineProgressBarProps {
  stages: CRMPipelineStage[];
  currentStageId: string;
  onStageClick?: (stageId: string) => void;
  className?: string;
}

export function PipelineProgressBar({ 
  stages, 
  currentStageId, 
  onStageClick,
  className 
}: PipelineProgressBarProps) {
  const sortedStages = [...stages].sort((a, b) => a.position - b.position);
  const currentIndex = sortedStages.findIndex(s => s.id === currentStageId);
  
  if (sortedStages.length === 0) return null;

  return (
    <div className={cn("w-full overflow-x-auto py-2", className)}>
      <div className="flex items-center gap-0 min-w-max px-1">
        {sortedStages.map((stage, index) => {
          const isActive = stage.id === currentStageId;
          const isPast = index < currentIndex;
          const isFuture = index > currentIndex;
          const isWon = stage.is_won_stage;
          const isLost = stage.is_lost_stage;
          const hsl = stage.color ? hexToHSL(stage.color) : null;
          
          return (
            <div key={stage.id} className="flex items-center">
              {/* Connector line */}
              {index > 0 && (
                <div 
                  className={cn(
                    "h-0.5 w-6 transition-colors",
                    isPast || isActive ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              
              {/* Stage pill */}
              <button
                type="button"
                onClick={() => onStageClick?.(stage.id)}
                disabled={!onStageClick}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
                  onStageClick && "cursor-pointer hover:scale-105",
                  !onStageClick && "cursor-default",
                  isActive && "shadow-md scale-105 text-white border-transparent",
                  isPast && "bg-primary/10 text-primary border-primary/30",
                  isFuture && "bg-muted text-muted-foreground border-border hover:bg-muted/80",
                  isWon && isActive && "bg-emerald-500 border-emerald-600",
                  isLost && isActive && "bg-red-500 border-red-600"
                )}
                style={isActive && !isWon && !isLost && hsl ? { 
                  backgroundColor: `hsl(${hsl})`,
                } : undefined}
              >
                {/* Icon */}
                {isPast && <Check className="w-3 h-3" />}
                {isActive && isWon && <Trophy className="w-3 h-3" />}
                {isActive && isLost && <XCircle className="w-3 h-3" />}
                {isActive && !isWon && !isLost && <Circle className="w-3 h-3 fill-current" />}
                
                {/* Stage name */}
                <span>{stage.name}</span>
                
                {/* Probability badge for active stage */}
                {isActive && stage.probability !== undefined && !isWon && !isLost && (
                  <span className="ml-1 text-[10px] opacity-80">
                    {stage.probability}%
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
