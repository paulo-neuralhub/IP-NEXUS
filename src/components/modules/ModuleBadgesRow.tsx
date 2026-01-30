// =============================================
// COMPONENTE: ModuleBadgesRow (v2 - Blasón Style)
// Fila de badges de módulos activos en el header
// =============================================

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useModules } from '@/hooks/useModules';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import type { ModuleWithStatus } from '@/types/modules';

// Module color mapping by code
const MODULE_COLORS: Record<string, { gradient: string; bg: string }> = {
  docket: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
  crm: { gradient: 'from-green-500 to-green-600', bg: 'bg-green-50' },
  spider: { gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50' },
  genius: { gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
  market: { gradient: 'from-teal-500 to-teal-600', bg: 'bg-teal-50' },
  finance: { gradient: 'from-pink-500 to-pink-600', bg: 'bg-pink-50' },
  analytics: { gradient: 'from-violet-500 to-violet-600', bg: 'bg-violet-50' },
  marketing: { gradient: 'from-rose-500 to-rose-600', bg: 'bg-rose-50' },
  datahub: { gradient: 'from-slate-500 to-slate-600', bg: 'bg-slate-50' },
  legalops: { gradient: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50' },
  api: { gradient: 'from-gray-500 to-gray-600', bg: 'bg-gray-50' },
  core: { gradient: 'from-primary to-primary', bg: 'bg-primary/10' },
};

// Helper to get Lucide icon by name
function getLucideIcon(iconName: string | null): LucideIcons.LucideIcon {
  if (!iconName) return LucideIcons.Box;
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  if (typeof icon === 'function') {
    return icon as LucideIcons.LucideIcon;
  }
  return LucideIcons.Box;
}

// Module routes mapping
const MODULE_ROUTES: Record<string, string> = {
  core: '/app',
  docket: '/app/docket',
  crm: '/app/crm',
  spider: '/app/spider',
  genius: '/app/genius',
  market: '/app/market',
  finance: '/app/finance',
  analytics: '/app/analytics',
  marketing: '/app/marketing',
  datahub: '/app/datahub',
  legalops: '/app/legalops',
  api: '/app/settings/api',
  migrator: '/app/migrator',
};

interface ModuleBlazonProps {
  module: ModuleWithStatus;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

function ModuleBlazon({ module, size = 'md', onClick }: ModuleBlazonProps) {
  const Icon = getLucideIcon(module.icon_lucide);
  const isActive = module.visual_status === 'active' || module.visual_status === 'trial';
  const colors = MODULE_COLORS[module.code] || { gradient: 'from-primary to-primary', bg: 'bg-primary/10' };

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9'
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4'
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "relative flex items-center justify-center rounded-lg transition-all duration-200",
            "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50",
            sizeClasses[size],
            isActive 
              ? `bg-gradient-to-br ${colors.gradient} shadow-sm`
              : "bg-muted/60 border border-border/50"
          )}
        >
          {/* Shine effect for active */}
          {isActive && (
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent" />
          )}
          
          <Icon className={cn(
            iconSizes[size],
            isActive ? "text-white" : "text-muted-foreground/50"
          )} />
          
          {/* Active indicator dot */}
          {isActive && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white shadow-sm" />
          )}
          
          {/* Trial badge */}
          {module.visual_status === 'trial' && module.trial_days_remaining && (
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[8px] font-bold rounded px-1 shadow">
              {module.trial_days_remaining}d
            </div>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <p className="font-semibold">{module.name}</p>
        <p className="text-muted-foreground">
          {isActive ? (module.visual_status === 'trial' ? 'Período de prueba' : 'Activo') : 'No incluido'}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export function ModuleBadgesRow() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { 
    modulesWithStatus, 
    isLoading,
  } = useModules();

  // Get all modules to display (active first, then inactive in gray)
  const { activeModules, inactiveModules } = useMemo(() => {
    const active = modulesWithStatus.filter(
      m => m.visual_status === 'active' || m.visual_status === 'trial'
    );
    const inactive = modulesWithStatus.filter(
      m => m.visual_status === 'locked' || m.visual_status === 'unavailable'
    );
    return {
      activeModules: active,
      inactiveModules: inactive.slice(0, isMobile ? 2 : 4),
    };
  }, [modulesWithStatus, isMobile]);

  const handleModuleClick = (moduleCode: string) => {
    const route = MODULE_ROUTES[moduleCode];
    if (route) {
      navigate(route);
    }
  };

  const handleExploreClick = () => {
    navigate('/app/modules');
  };

  if (isLoading) {
    return (
      <div className="flex h-11 items-center gap-2 border-t border-border/50 px-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (activeModules.length === 0 && inactiveModules.length === 0) {
    return (
      <div className="flex h-11 items-center justify-between border-t border-border/50 px-4">
        <p className="text-xs text-muted-foreground">
          No tienes módulos configurados
        </p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleExploreClick}
          className="h-7 gap-1 text-xs text-primary"
        >
          <Sparkles className="h-3 w-3" />
          Explorar
        </Button>
      </div>
    );
  }

  // Mobile compact view
  if (isMobile) {
    return (
      <div className="flex h-11 items-center justify-between border-t border-border/50 px-4">
        <div className="flex items-center gap-1">
          {activeModules.slice(0, 5).map((module) => (
            <ModuleBlazon
              key={module.code}
              module={module}
              size="sm"
              onClick={() => handleModuleClick(module.code)}
            />
          ))}
          {activeModules.length > 5 && (
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
              +{activeModules.length - 5}
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {activeModules.length}/{activeModules.length + inactiveModules.length}
        </div>
      </div>
    );
  }

  // Desktop view with scroll
  return (
    <div className="flex h-11 items-center gap-2 border-t border-border/50">
      <ScrollArea className="flex-1">
        <div className="flex items-center gap-1.5 px-4 py-1.5">
          {/* Active modules */}
          {activeModules.map((module) => (
            <ModuleBlazon
              key={module.code}
              module={module}
              size="md"
              onClick={() => handleModuleClick(module.code)}
            />
          ))}
          
          {/* Separator */}
          {activeModules.length > 0 && inactiveModules.length > 0 && (
            <div className="mx-2 h-6 w-px bg-border" />
          )}
          
          {/* Inactive modules */}
          {inactiveModules.map((module) => (
            <ModuleBlazon
              key={module.code}
              module={module}
              size="md"
              onClick={handleExploreClick}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-1" />
      </ScrollArea>

      {/* Explore button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExploreClick}
            className="mr-3 h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Más</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Ver todos los módulos
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
