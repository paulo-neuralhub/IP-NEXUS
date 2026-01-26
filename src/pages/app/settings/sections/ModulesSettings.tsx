// =============================================
// SECCIÓN: ModulesSettings
// Panel de módulos embebido en Configuración
// src/pages/app/settings/sections/ModulesSettings.tsx
// =============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Clock,
  Lock,
  Sparkles,
  Grid3X3,
  List,
  Search,
  Zap,
  ArrowUpRight,
  Star,
  Gift,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useModulesContext } from '@/contexts/ModulesContext';
import { cn } from '@/lib/utils';
import type { ModuleWithStatus } from '@/types/modules';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'active' | 'trial' | 'available' | 'locked';

export default function ModulesSettings() {
  const navigate = useNavigate();
  const {
    modulesWithStatus,
    modulesSummary,
    currentPlan,
    showActivationPopup,
    startModuleTrial,
    isStartingTrial,
    isLoading,
  } = useModulesContext();

  // Estados de filtro y vista
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Filtrar módulos
  const filteredModules = modulesWithStatus.filter(m => {
    // Búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        m.name.toLowerCase().includes(query) ||
        m.short_name?.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.tagline?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Filtro por estado
    if (filterStatus !== 'all') {
      if (filterStatus === 'active' && m.visual_status !== 'active') return false;
      if (filterStatus === 'trial' && m.visual_status !== 'trial') return false;
      if (filterStatus === 'available' && (m.visual_status !== 'locked' || !m.can_activate)) return false;
      if (filterStatus === 'locked' && m.visual_status !== 'locked') return false;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Módulos</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona los módulos activos de tu organización
          </p>
        </div>
        
        <Button onClick={() => navigate('/pricing')} size="sm">
          <Zap className="h-4 w-4 mr-2" />
          Mejorar plan
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard 
          label="Activos" 
          value={modulesSummary.active_modules.length} 
          color="green" 
        />
        <SummaryCard 
          label="En prueba" 
          value={modulesSummary.trial_modules.length} 
          color="blue" 
        />
        <SummaryCard 
          label="Add-ons" 
          value={`${modulesSummary.total_addons}/${modulesSummary.max_addons_allowed || '∞'}`} 
          color="purple" 
        />
        <SummaryCard 
          label="Coste mensual" 
          value={`€${modulesSummary.monthly_addon_cost}`} 
          color="amber" 
        />
      </div>

      {/* Barra de límite de addons */}
      {modulesSummary.max_addons_allowed > 0 && (
        <div className="p-3 bg-muted/50 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Límite de add-ons ({currentPlan?.name})
            </span>
            <span className="font-medium text-foreground">
              {modulesSummary.total_addons} / {modulesSummary.max_addons_allowed}
            </span>
          </div>
          <Progress 
            value={(modulesSummary.total_addons / modulesSummary.max_addons_allowed) * 100} 
          />
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar módulos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filtro por estado */}
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="trial">En prueba</SelectItem>
            <SelectItem value="available">Disponibles</SelectItem>
            <SelectItem value="locked">Bloqueados</SelectItem>
          </SelectContent>
        </Select>

        {/* Cambio de vista */}
        <div className="flex border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="rounded-none h-9 w-9"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="rounded-none h-9 w-9"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid/Lista de módulos */}
      <div>
        {filteredModules.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No se encontraron módulos</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery('')}
                className="mt-2"
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredModules.map(module => (
              <ModuleCard
                key={module.code}
                module={module}
                onActivate={() => showActivationPopup(module.code)}
                onStartTrial={() => startModuleTrial(module.code)}
                isStartingTrial={isStartingTrial}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredModules.map(module => (
              <ModuleListItem
                key={module.code}
                module={module}
                onActivate={() => showActivationPopup(module.code)}
                onStartTrial={() => startModuleTrial(module.code)}
                isStartingTrial={isStartingTrial}
              />
            ))}
          </div>
        )}
      </div>

      {/* Link a página completa */}
      <div className="pt-4 border-t">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/app/settings/modules')}
          className="w-full sm:w-auto"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver página completa de módulos
        </Button>
      </div>
    </div>
  );
}

// =============================================
// Subcomponente: SummaryCard
// =============================================

interface SummaryCardProps {
  label: string;
  value: string | number;
  color: 'green' | 'blue' | 'purple' | 'amber';
}

function SummaryCard({ label, value, color }: SummaryCardProps) {
  const colorClasses = {
    green: 'bg-success/10 border-success/30 text-success',
    blue: 'bg-primary/10 border-primary/30 text-primary',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-600',
    amber: 'bg-warning/10 border-warning/30 text-warning',
  };

  return (
    <div className={cn('p-3 rounded-lg border', colorClasses[color])}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

// =============================================
// Subcomponente: ModuleCard (vista grid)
// =============================================

interface ModuleCardProps {
  module: ModuleWithStatus;
  onActivate: () => void;
  onStartTrial: () => void;
  isStartingTrial: boolean;
}

function ModuleCard({ module, onActivate, onStartTrial, isStartingTrial }: ModuleCardProps) {
  const navigate = useNavigate();
  const isActive = module.visual_status === 'active';
  const isTrial = module.visual_status === 'trial';
  const isLocked = module.visual_status === 'locked';
  const isComingSoon = module.visual_status === 'coming_soon';

  return (
    <Card className="relative overflow-hidden">
      {/* Badge de estado */}
      <div className="absolute top-2 right-2 z-10">
        {isActive && (
          <Badge className="bg-success/20 text-success border-success/30 text-xs">
            <Check className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        )}
        {isTrial && (
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {module.trial_days_remaining}d trial
          </Badge>
        )}
        {isLocked && !module.can_activate && (
          <Badge variant="secondary" className="text-xs">
            <Lock className="h-3 w-3 mr-1" />
            Requiere
          </Badge>
        )}
        {isComingSoon && (
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Próximo
          </Badge>
        )}
      </div>

      <CardContent className="pt-4 pb-3">
        {/* Icono y nombre */}
        <div className="flex items-start gap-3 mb-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: `${module.color}20` }}
          >
            {module.icon}
          </div>
          <div className="flex-1 min-w-0 pr-14">
            <h3 className="font-semibold text-foreground text-sm truncate">
              {module.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {module.tagline}
            </p>
          </div>
        </div>

        {/* Precio */}
        {!isActive && !isTrial && module.effective_price && (
          <div className="flex items-baseline gap-1 text-sm">
            <span className="font-bold text-foreground">
              €{module.effective_price}
            </span>
            <span className="text-muted-foreground">/mes</span>
            {module.has_discount && (
              <Badge variant="secondary" className="ml-1 text-xs">
                -{module.discount_percent}%
              </Badge>
            )}
          </div>
        )}

        {module.is_popular && (
          <Badge className="mt-2 bg-warning/20 text-warning border-warning/30 text-xs">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Popular
          </Badge>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-3 gap-2">
        {/* Acciones según estado */}
        {isActive && (
          <Button 
            size="sm"
            className="w-full"
            onClick={() => navigate(`/app/${module.code}`)}
          >
            Abrir
            <ArrowUpRight className="h-3 w-3 ml-1" />
          </Button>
        )}

        {isTrial && (
          <>
            <Button 
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/app/${module.code}`)}
            >
              Abrir
            </Button>
            <Button size="sm" className="flex-1" onClick={onActivate}>
              Suscribir
            </Button>
          </>
        )}

        {isLocked && module.can_activate && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={onStartTrial}
              disabled={isStartingTrial}
            >
              <Gift className="h-3 w-3 mr-1" />
              Probar
            </Button>
            <Button size="sm" className="flex-1" onClick={onActivate}>
              Activar
            </Button>
          </>
        )}

        {isLocked && !module.can_activate && (
          <Button variant="outline" size="sm" className="w-full" onClick={onActivate}>
            Ver requisitos
          </Button>
        )}

        {isComingSoon && (
          <Button variant="outline" size="sm" className="w-full" disabled>
            Próximamente
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// =============================================
// Subcomponente: ModuleListItem (vista lista)
// =============================================

function ModuleListItem({ module, onActivate, onStartTrial, isStartingTrial }: ModuleCardProps) {
  const navigate = useNavigate();
  const isActive = module.visual_status === 'active';
  const isTrial = module.visual_status === 'trial';
  const isLocked = module.visual_status === 'locked';

  return (
    <div className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:bg-muted/30 transition-colors">
      {/* Icono */}
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: `${module.color}20` }}
      >
        {module.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground text-sm truncate">{module.name}</h4>
          
          {isActive && (
            <Badge className="bg-success/20 text-success border-success/30 text-xs">
              Activo
            </Badge>
          )}
          {isTrial && (
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
              {module.trial_days_remaining}d
            </Badge>
          )}
        </div>
      </div>

      {/* Precio */}
      <div className="text-right flex-shrink-0 text-sm">
        {module.effective_price ? (
          <span className="font-medium">€{module.effective_price}</span>
        ) : (
          <span className="text-muted-foreground">Incluido</span>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-1 flex-shrink-0">
        {isActive && (
          <Button size="sm" variant="ghost" onClick={() => navigate(`/app/${module.code}`)}>
            Abrir
          </Button>
        )}
        {isTrial && (
          <Button size="sm" onClick={onActivate}>
            Suscribir
          </Button>
        )}
        {isLocked && module.can_activate && (
          <Button size="sm" onClick={onStartTrial} disabled={isStartingTrial}>
            Probar
          </Button>
        )}
        {isLocked && !module.can_activate && (
          <Button size="sm" variant="ghost" onClick={onActivate}>
            Ver
          </Button>
        )}
      </div>
    </div>
  );
}
