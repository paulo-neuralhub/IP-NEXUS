// =============================================
// COMPONENTE: ModuleBadgesRow
// Fila de badges de módulos activos en el header
// =============================================

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ModuleBadge } from './ModuleBadge';
import { useModulesContext } from '@/contexts/ModulesContext';
import type { ModuleWithStatus } from '@/types/modules';

// Helper to get Lucide icon by name
function getLucideIcon(iconName: string | null): LucideIcons.LucideIcon {
  if (!iconName) return LucideIcons.Box;
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  if (typeof icon === 'function') {
    return icon as LucideIcons.LucideIcon;
  }
  return LucideIcons.Box;
}

export function ModuleBadgesRow() {
  const navigate = useNavigate();
  const { 
    modulesWithStatus, 
    modulesSummary, 
    isLoading,
    showActivationPopup,
  } = useModulesContext();

  // Separate active/trial modules from available ones
  const { activeModules, availableCount } = useMemo(() => {
    const active = modulesWithStatus.filter(
      m => m.visual_status === 'active' || m.visual_status === 'trial'
    );
    const available = modulesWithStatus.filter(
      m => m.visual_status === 'locked' && m.can_activate
    );
    return {
      activeModules: active.slice(0, 8), // Limit to 8 visible badges
      availableCount: available.length,
    };
  }, [modulesWithStatus]);

  const handleModuleClick = (module: ModuleWithStatus) => {
    // Navigate to module's first menu item if accessible
    if (module.is_accessible && module.menu_items?.length > 0) {
      navigate(module.menu_items[0].path);
    } else {
      showActivationPopup(module.code);
    }
  };

  const handleExploreClick = () => {
    navigate('/app/modules');
  };

  if (isLoading) {
    return (
      <div className="flex h-10 items-center gap-2 border-t border-border/50 px-4">
        <div className="h-6 w-20 animate-pulse rounded bg-muted" />
        <div className="h-6 w-16 animate-pulse rounded bg-muted" />
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (activeModules.length === 0) {
    return (
      <div className="flex h-10 items-center justify-between border-t border-border/50 px-4">
        <p className="text-xs text-muted-foreground">
          No tienes módulos activos
        </p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleExploreClick}
          className="h-7 gap-1 text-xs text-primary"
        >
          <Sparkles className="h-3 w-3" />
          Explorar módulos
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-10 items-center gap-2 border-t border-border/50">
      <ScrollArea className="flex-1">
        <div className="flex items-center gap-1.5 px-4 py-1">
          {activeModules.map((module) => (
            <ModuleBadge
              key={module.code}
              code={module.code}
              name={module.name}
              shortName={module.short_name}
              icon={getLucideIcon(module.icon_lucide)}
              color={module.color}
              status={module.visual_status}
              trialDaysRemaining={module.trial_days_remaining}
              onClick={() => handleModuleClick(module)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>

      {/* Add more modules button */}
      {availableCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExploreClick}
              className={cn(
                'mr-3 h-7 gap-1 rounded-md border border-dashed border-primary/40 px-2 text-xs',
                'text-primary hover:border-primary hover:bg-primary/5'
              )}
            >
              <Plus className="h-3 w-3" />
              <span className="hidden sm:inline">+{availableCount}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {availableCount} módulos disponibles
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
