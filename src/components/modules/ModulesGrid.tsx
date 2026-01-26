// =============================================
// COMPONENTE: ModulesGrid
// Grid de módulos principales organizados por sección
// =============================================

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
import { useModulesContext } from '@/contexts/ModulesContext';
import { cn } from '@/lib/utils';
import type { ModuleWithStatus } from '@/types/modules';

// Configuración de secciones - ampliada
const MODULE_SECTIONS = [
  {
    id: 'core',
    title: 'Módulos Core',
    description: 'Funcionalidades principales del sistema',
    codes: ['docket', 'crm'],
  },
  {
    id: 'intelligence',
    title: 'Inteligencia',
    description: 'IA y análisis avanzado',
    codes: ['spider', 'genius', 'analytics', 'alertas-ia'],
  },
  {
    id: 'operations',
    title: 'Operaciones',
    description: 'Gestión del día a día',
    codes: ['legal-ops', 'workflow', 'filing', 'finance', 'timetracking'],
  },
  {
    id: 'extensions',
    title: 'Extensiones',
    description: 'Funcionalidades adicionales',
    codes: ['communications', 'portal-cliente', 'data-hub', 'equipos'],
  },
];

interface ModulesGridProps {
  searchQuery?: string;
}

export function ModulesGrid({ searchQuery = '' }: ModulesGridProps) {
  const { modulesWithStatus, showActivationPopup } = useModulesContext();

  // Filtrar módulos por búsqueda
  const filteredModules = modulesWithStatus.filter(m => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.code.toLowerCase().includes(query) ||
      m.description?.toLowerCase().includes(query) ||
      m.tagline?.toLowerCase().includes(query)
    );
  });

  // Agrupar por sección
  const getModulesForSection = (sectionCodes: string[]) => {
    return filteredModules.filter(m => 
      sectionCodes.includes(m.code) && m.category !== 'addon'
    );
  };

  return (
    <div className="space-y-8">
      {MODULE_SECTIONS.map(section => {
        const sectionModules = getModulesForSection(section.codes);
        if (sectionModules.length === 0) return null;

        return (
          <div key={section.id} className="space-y-4">
            {/* Header de sección */}
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {section.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            </div>

            {/* Grid de módulos */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sectionModules.map(module => (
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

      {/* Módulos no categorizados */}
      {filteredModules.filter(m => 
        !MODULE_SECTIONS.some(s => s.codes.includes(m.code)) && 
        m.category !== 'addon'
      ).length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Otros módulos</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredModules
              .filter(m => !MODULE_SECTIONS.some(s => s.codes.includes(m.code)) && m.category !== 'addon')
              .map(module => (
                <ModuleCard
                  key={module.code}
                  module={module}
                  onActivate={() => showActivationPopup(module.code)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// Subcomponente: ModuleCard
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

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/20',
        isActive && 'border-primary/30 bg-primary/5 shadow-sm',
        isTrial && 'border-amber-500/30 bg-amber-500/5 shadow-sm',
        isLocked && 'border-border hover:bg-muted/30',
        isComingSoon && 'border-dashed opacity-70 pointer-events-none'
      )}
    >
      {/* Status badge */}
      <div className="absolute top-3 right-3 z-10">
        {isActive && (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs font-medium">
            <Check className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        )}
        {isTrial && (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-xs font-medium">
            <Clock className="h-3 w-3 mr-1" />
            {module.trial_days_remaining}d restantes
          </Badge>
        )}
        {isComingSoon && (
          <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0 text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Próximamente
          </Badge>
        )}
        {isLocked && !isComingSoon && module.is_popular && (
          <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-0 text-xs">
            Popular
          </Badge>
        )}
      </div>

      {/* Contenido */}
      <div className="flex gap-4">
        {/* Icono con color del módulo */}
        <div 
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-105"
          style={{ 
            backgroundColor: `${module.color}15`,
            boxShadow: isActive ? `0 4px 12px ${module.color}20` : undefined
          }}
        >
          {module.icon}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <h4 className="font-semibold text-foreground truncate pr-16">
            {module.name}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {module.tagline || module.description}
          </p>

          {/* Features preview */}
          {module.features && module.features.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {module.features.slice(0, 2).map((f, i) => (
                <span 
                  key={i}
                  className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded"
                >
                  {f.title}
                </span>
              ))}
            </div>
          )}

          {/* Precio y acción */}
          <div className="flex items-center justify-between pt-2">
            {!isActive && !isTrial && module.effective_price ? (
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  €{module.effective_price}
                </span>
                /mes
              </span>
            ) : (
              <span />
            )}

            {isActive && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/app/${module.code}`)}
                className="text-primary"
              >
                Abrir
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
            {isTrial && (
              <Button size="sm" onClick={onActivate}>
                Suscribirse
              </Button>
            )}
            {isLocked && module.can_activate && (
              <Button size="sm" variant="outline" onClick={onActivate}>
                Activar
              </Button>
            )}
            {isLocked && !module.can_activate && (
              <Button size="sm" variant="ghost" disabled>
                <Lock className="h-3.5 w-3.5 mr-1" />
                Ver más
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
