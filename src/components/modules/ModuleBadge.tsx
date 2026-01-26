// =============================================
// COMPONENTE: ModuleBadge
// Badge individual de módulo con estado visual
// =============================================

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ModuleVisualStatus } from '@/types/modules';

interface ModuleBadgeProps {
  code: string;
  name: string;
  shortName?: string | null;
  icon: LucideIcon;
  color: string;
  status: ModuleVisualStatus;
  trialDaysRemaining?: number;
  onClick?: () => void;
}

export function ModuleBadge({
  code,
  name,
  shortName,
  icon: Icon,
  color,
  status,
  trialDaysRemaining,
  onClick,
}: ModuleBadgeProps) {
  const isAccessible = status === 'active' || status === 'trial';
  const isLocked = status === 'locked' || status === 'unavailable';
  const isComingSoon = status === 'coming_soon';

  // Tooltip content based on status
  const getTooltipContent = () => {
    if (status === 'active') return `${name} - Activo`;
    if (status === 'trial') return `${name} - Trial (${trialDaysRemaining} días)`;
    if (status === 'coming_soon') return `${name} - Próximamente`;
    if (status === 'unavailable') return `${name} - Requiere dependencias`;
    return `${name} - Click para activar`;
  };

  // Generate soft background color from module color
  const getSoftBgStyle = () => {
    if (!isAccessible) return undefined;
    // Create a soft pastel version using opacity
    return { 
      backgroundColor: `${color}15`, // 15 = ~8% opacity in hex
      borderColor: `${color}40`,     // 40 = ~25% opacity
      color: color,
    };
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={isComingSoon}
          className={cn(
            'group relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
            'border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            // Active state - now with soft colors
            isAccessible && 'shadow-sm hover:shadow-md',
            // Locked state
            isLocked && 'border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:border-border/80',
            // Coming soon
            isComingSoon && 'cursor-not-allowed border-dashed border-border bg-muted/30 text-muted-foreground/60',
          )}
          style={getSoftBgStyle()}
        >
          <Icon className={cn(
            'h-3.5 w-3.5 shrink-0',
            isLocked && 'text-muted-foreground',
          )} />
          
          {/* Show only short name like "Docket", "CRM", "Marketing" */}
          <span className="hidden sm:inline truncate max-w-[80px]">
            {shortName || name}
          </span>

          {/* Trial indicator */}
          {status === 'trial' && trialDaysRemaining !== undefined && (
            <span 
              className="ml-0.5 rounded px-1 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: `${color}30` }}
            >
              {trialDaysRemaining}d
            </span>
          )}

          {/* Lock indicator for locked modules */}
          {isLocked && (
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-muted-foreground/20 text-[8px]">
              🔒
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {getTooltipContent()}
      </TooltipContent>
    </Tooltip>
  );
}
