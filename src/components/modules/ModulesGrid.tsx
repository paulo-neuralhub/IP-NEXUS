// =============================================
// COMPONENTE: ModulesGrid
// Grid de módulos organizados por sidebar_section
// =============================================

import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Clock, 
  Lock, 
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideDynamicIcon } from '@/components/ui/lucide-dynamic-icon';
import { useModulesContext } from '@/contexts/ModulesContext';
import { cn } from '@/lib/utils';
import type { ModuleWithStatus } from '@/types/modules';

// Configuración de secciones basada en sidebar_section de la BD
const SECTION_CONFIG: Record<string, { title: string; description: string; order: number }> = {
  'gestion': {
    title: 'Gestión',
    description: 'Herramientas principales para gestionar expedientes y clientes',
    order: 1,
  },
  'operaciones': {
    title: 'Operaciones',
    description: 'Automatización y gestión del día a día',
    order: 2,
  },
  'inteligencia': {
    title: 'Inteligencia',
    description: 'IA, análisis y alertas avanzadas',
    order: 3,
  },
  'extensiones': {
    title: 'Extensiones',
    description: 'Funcionalidades adicionales y marketplace',
    order: 4,
  },
};

interface ModulesGridProps {
  searchQuery?: string;
}

export function ModulesGrid({ searchQuery = '' }: ModulesGridProps) {
  const { modulesWithStatus, showActivationPopup } = useModulesContext();

  // Filtrar módulos por búsqueda (excluyendo 'core' que es interno)
  const filteredModules = modulesWithStatus.filter(m => {
    if (m.code === 'core') return false; // No mostrar el módulo core interno
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.code.toLowerCase().includes(query) ||
      m.description?.toLowerCase().includes(query) ||
      m.tagline?.toLowerCase().includes(query)
    );
  });

  // Agrupar módulos por sidebar_section
  const groupedModules = filteredModules.reduce((acc, module) => {
    const section = module.sidebar_section || 'otros';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(module);
    return acc;
  }, {} as Record<string, ModuleWithStatus[]>);

  // Ordenar secciones
  const sortedSections = Object.keys(groupedModules).sort((a, b) => {
    const orderA = SECTION_CONFIG[a]?.order ?? 99;
    const orderB = SECTION_CONFIG[b]?.order ?? 99;
    return orderA - orderB;
  });

  if (filteredModules.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No se encontraron módulos que coincidan con tu búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedSections.map(sectionKey => {
        const sectionModules = groupedModules[sectionKey];
        const config = SECTION_CONFIG[sectionKey] || {
          title: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
          description: 'Otros módulos disponibles',
          order: 99,
        };

        return (
          <div key={sectionKey}>
            {/* Header de sección - más compacto */}
            <div className="flex items-baseline gap-2 mb-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                {config.title}
              </h3>
              <span className="text-xs text-muted-foreground">
                ({sectionModules.length})
              </span>
            </div>

            {/* Grid de módulos - más compacto */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sectionModules
                .sort((a, b) => a.sidebar_order - b.sidebar_order)
                .map(module => (
                  <ModuleCard
                    key={module.code}
                    module={module}
                    onActivate={() => showActivationPopup(module.code)}
                  />
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =============================================
// Subcomponente: ModuleCard - Diseño compacto profesional
// =============================================

interface ModuleCardProps {
  module: ModuleWithStatus;
  onActivate: () => void;
}

function ModuleCard({ module, onActivate }: ModuleCardProps) {
  const navigate = useNavigate();
  
  const isActive = module.visual_status === 'active';
  const isTrial = module.visual_status === 'trial';
  const isLocked = module.visual_status === 'locked';
  const isComingSoon = module.visual_status === 'coming_soon';

  // Determinar ruta de navegación
  const getModulePath = () => {
    const routeMap: Record<string, string> = {
      'docket': '/app/docket',
      'crm': '/app/crm',
      'spider': '/app/spider',
      'genius': '/app/genius',
      'finance': '/app/finance',
      'analytics': '/app/analytics',
      'market': '/app/market',
      'marketing': '/app/marketing',
      'communications': '/app/communications',
      'portal-cliente': '/app/portal-cliente',
      'datahub': '/app/data-hub',
      'data-hub': '/app/data-hub',
      'legalops': '/app/legal-ops',
      'workflow': '/app/workflow',
      'filing': '/app/filing',
      'timetracking': '/app/timetracking',
      'equipos': '/app/equipos',
      'alertas-ia': '/app/alertas-ia',
      'informes': '/app/informes',
      'herramientas': '/app/herramientas',
      'ip-chain': '/app/ip-chain',
    };
    return routeMap[module.code] || `/app/${module.code}`;
  };

  // Obtener nombre corto para display
  const displayName = module.short_name || module.name;

  const getAccentVar = (code: string) => {
    const map: Record<string, string> = {
      dashboard: '--module-dashboard',
      docket: '--module-docket',
      'data-hub': '--module-datahub',
      datahub: '--module-datahub',
      spider: '--module-spider',
      market: '--module-market',
      genius: '--module-genius',
      finance: '--module-finance',
      crm: '--module-crm',
      marketing: '--module-marketing',
      help: '--module-help',
    };
    return map[code] ?? '--primary';
  };

  const accentVar = getAccentVar(module.code);

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card overflow-hidden transition-all duration-200',
        'hover:shadow-md',
        isActive && 'ring-1 ring-primary/20 bg-primary/[0.02]',
        isTrial && 'ring-1 ring-[hsl(var(--warning)/0.22)] bg-[hsl(var(--warning)/0.03)]',
        isLocked && 'hover:bg-muted/20',
        isComingSoon && 'border-dashed opacity-60 pointer-events-none'
      )}
      style={{ ['--module-accent' as never]: `var(${accentVar})` } as CSSProperties}
    >
      {/* Header con icono y status */}
      <div className="flex items-start gap-3 p-4 pb-3">
        {/* Icono compacto */}
        <div 
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            'bg-[hsl(var(--module-accent)/0.12)] text-[hsl(var(--module-accent))]'
          )}
        >
          <LucideDynamicIcon
            name={module.icon_lucide || module.icon}
            className="h-5 w-5"
            aria-hidden="true"
            fallback={<span className="text-sm font-semibold">{displayName.slice(0, 1)}</span>}
          />
        </div>

        {/* Título y tagline */}
        <div className="flex-1 min-w-0 pr-1">
          <h4
            className="text-sm font-semibold text-foreground leading-snug line-clamp-2"
            title={module.name}
          >
            {displayName}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
            {module.tagline || module.description}
          </p>
        </div>

        {/* Status badge - compacto */}
        <div className="shrink-0">
          {isActive && (
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[hsl(var(--success)/0.12)]">
              <Check className="h-3 w-3 text-[hsl(var(--success))]" />
            </span>
          )}
          {isTrial && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-5 border-[hsl(var(--warning)/0.35)] text-[hsl(var(--warning))]"
            >
              {module.trial_days_remaining}d
            </Badge>
          )}
          {isComingSoon && (
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          )}
          {isLocked && !isComingSoon && module.is_popular && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
              Popular
            </Badge>
          )}
        </div>
      </div>

      {/* Footer con precio/acción */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-t border-border/50">
        {/* Precio */}
        <div className="text-xs text-muted-foreground">
          {!isActive && !isTrial && module.effective_price ? (
            <>
              <span className="font-medium text-foreground">€{module.effective_price}</span>
              <span>/mes</span>
            </>
          ) : isActive ? (
            <span className="text-[hsl(var(--success))] font-medium">Activo</span>
          ) : isTrial ? (
            <span className="text-[hsl(var(--warning))] font-medium">En prueba</span>
          ) : (
            <span>Disponible</span>
          )}
        </div>

        {/* Acción */}
        {isActive && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(getModulePath())}
            className="h-7 px-2.5 text-xs text-primary hover:text-primary"
          >
            Abrir
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
        {isTrial && (
          <Button size="sm" onClick={onActivate} className="h-7 px-3 text-xs">
            Suscribir
          </Button>
        )}
        {isLocked && module.can_activate && (
          <Button size="sm" variant="outline" onClick={onActivate} className="h-7 px-3 text-xs">
            Activar
          </Button>
        )}
        {isLocked && !module.can_activate && !isComingSoon && (
          <Button size="sm" variant="ghost" disabled className="h-7 px-2.5 text-xs">
            <Lock className="h-3 w-3 mr-1" />
            Bloqueado
          </Button>
        )}
      </div>
    </div>
  );
}
