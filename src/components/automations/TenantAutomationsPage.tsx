// ============================================================
// IP-NEXUS - TENANT AUTOMATIONS PAGE
// Vista completa para gestión de automatizaciones del tenant
// 3 secciones: Activas, Desactivadas, Disponibles
// ============================================================

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Search, Plus, Settings, Lock, Eye, History, 
  Play, Pause, Trash2, Edit, MoreVertical, Clock,
  CheckCircle, XCircle, AlertTriangle, ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  useTenantAutomations,
  useAutomationCatalog,
  useActivateAutomation,
  useDeactivateAutomation,
  useTenantAutomationStats,
  type TenantAutomation,
  type TenantAutomationCatalogItem,
} from '@/hooks/useTenantAutomationConfigs';

import { CATEGORY_CONFIG, VISIBILITY_CONFIG, TRIGGER_TYPE_CONFIG } from '@/types/automations';
import { AutomationConfigDialog } from './AutomationConfigDialog';

export function TenantAutomationsPage() {
  const [search, setSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    active: true,
    inactive: true,
    available: true,
  });
  
  const [configItem, setConfigItem] = useState<TenantAutomationCatalogItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TenantAutomation | null>(null);

  // Queries
  const { data: automations = [], isLoading: automationsLoading } = useTenantAutomations();
  const { data: catalog = [], isLoading: catalogLoading } = useAutomationCatalog();
  const { data: stats } = useTenantAutomationStats();

  // Mutations
  const activateAutomation = useActivateAutomation();
  const deactivateAutomation = useDeactivateAutomation();

  // Categorize automations
  const categorized = useMemo(() => {
    const activeList: TenantAutomation[] = [];
    const inactiveList: TenantAutomation[] = [];
    const availableList: TenantAutomationCatalogItem[] = [];

    // Get IDs of instantiated automations
    const instantiatedTemplateIds = new Set(
      automations.filter(a => a.master_template_id).map(a => a.master_template_id)
    );

    // Split automations by active status
    automations.forEach(a => {
      const matchesSearch = !search || 
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        (a.description?.toLowerCase().includes(search.toLowerCase()));
      
      if (!matchesSearch) return;

      if (a.is_active) {
        activeList.push(a);
      } else {
        inactiveList.push(a);
      }
    });

    // Get available templates not yet instantiated
    catalog.forEach(item => {
      if (instantiatedTemplateIds.has(item.template.id)) return;
      
      const matchesSearch = !search ||
        item.template.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.template.description?.toLowerCase().includes(search.toLowerCase()));
      
      if (matchesSearch) {
        availableList.push(item);
      }
    });

    return { active: activeList, inactive: inactiveList, available: availableList };
  }, [automations, catalog, search]);

  const isLoading = automationsLoading || catalogLoading;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleToggleActive = async (automation: TenantAutomation) => {
    if (automation.is_locked) return;
    
    if (automation.is_active) {
      deactivateAutomation.mutate(automation.id);
    } else {
      // Re-activate by updating
      activateAutomation.mutate({ 
        templateId: automation.master_template_id!, 
        customParams: automation.custom_params 
      });
    }
  };

  const handleActivateTemplate = (item: TenantAutomationCatalogItem) => {
    activateAutomation.mutate({ templateId: item.template.id });
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Automatizaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Configura las automatizaciones de tu despacho
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/app/settings/automations/history">
            <History className="h-4 w-4 mr-2" />
            Ver historial
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Activas</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Ejecuciones (30d)</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.executions30d}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-muted-foreground">Exitosas</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.success}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-muted-foreground">Tasa de éxito</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.successRate}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar automatizaciones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Active Automations */}
      <AutomationSection
        title="Activas"
        count={categorized.active.length}
        icon={<Zap className="h-5 w-5 text-green-500" />}
        expanded={expandedSections.active}
        onToggle={() => toggleSection('active')}
        emptyMessage="No tienes automatizaciones activas"
      >
        <div className="divide-y">
          {categorized.active.map(automation => (
            <AutomationRow
              key={automation.id}
              automation={automation}
              onToggle={() => handleToggleActive(automation)}
              onConfigure={() => {
                const catalogItem = catalog.find(c => c.template.id === automation.master_template_id);
                if (catalogItem) setConfigItem(catalogItem);
              }}
              isPending={activateAutomation.isPending || deactivateAutomation.isPending}
            />
          ))}
        </div>
      </AutomationSection>

      {/* Inactive Automations */}
      {categorized.inactive.length > 0 && (
        <AutomationSection
          title="Desactivadas"
          count={categorized.inactive.length}
          icon={<Pause className="h-5 w-5 text-slate-400" />}
          expanded={expandedSections.inactive}
          onToggle={() => toggleSection('inactive')}
        >
          <div className="divide-y">
            {categorized.inactive.map(automation => (
              <AutomationRow
                key={automation.id}
                automation={automation}
                onToggle={() => handleToggleActive(automation)}
                onConfigure={() => {
                  const catalogItem = catalog.find(c => c.template.id === automation.master_template_id);
                  if (catalogItem) setConfigItem(catalogItem);
                }}
                isPending={activateAutomation.isPending || deactivateAutomation.isPending}
              />
            ))}
          </div>
        </AutomationSection>
      )}

      {/* Available Automations */}
      {categorized.available.length > 0 && (
        <AutomationSection
          title="Disponibles para activar"
          count={categorized.available.length}
          icon={<Plus className="h-5 w-5 text-blue-500" />}
          expanded={expandedSections.available}
          onToggle={() => toggleSection('available')}
        >
          <div className="divide-y">
            {categorized.available.map(item => (
              <AvailableAutomationRow
                key={item.template.id}
                item={item}
                onActivate={() => handleActivateTemplate(item)}
                isPending={activateAutomation.isPending}
              />
            ))}
          </div>
        </AutomationSection>
      )}

      {/* Custom automation button */}
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Plus className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-medium">Crear automatización personalizada</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Crea reglas personalizadas para tu despacho
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/app/settings/automations/create">
              <Plus className="h-4 w-4 mr-2" />
              Crear custom
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Config Dialog */}
      <AutomationConfigDialog
        open={!!configItem}
        onOpenChange={(open) => !open && setConfigItem(null)}
        item={configItem}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar automatización?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la automatización "{deleteConfirm?.name}".
              El historial de ejecuciones se conservará.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Section Component ────────────────────────────────────────

function AutomationSection({
  title,
  count,
  icon,
  expanded,
  onToggle,
  emptyMessage = "Sin automatizaciones",
  children,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  emptyMessage?: string;
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={expanded}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={onToggle}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon}
                <CardTitle className="text-lg">{title}</CardTitle>
                <Badge variant="secondary">{count}</Badge>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  expanded && "rotate-180"
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {count === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {emptyMessage}
              </p>
            ) : (
              children
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── Automation Row Component ─────────────────────────────────

function AutomationRow({
  automation,
  onToggle,
  onConfigure,
  isPending,
}: {
  automation: TenantAutomation;
  onToggle: () => void;
  onConfigure: () => void;
  isPending: boolean;
}) {
  const categoryConfig = CATEGORY_CONFIG[automation.category as keyof typeof CATEGORY_CONFIG];
  const visibilityLabel = automation.is_locked ? 'Obligatoria' : automation.is_custom ? 'Custom' : 'Opcional';

  return (
    <div className="py-4 flex items-start gap-4">
      <span className="text-2xl flex-shrink-0">{automation.icon || '⚡'}</span>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium">{automation.name}</h4>
          {automation.is_locked && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Lock className="h-3 w-3" />
              Obligatoria
            </Badge>
          )}
          {automation.is_custom && (
            <Badge variant="outline" className="text-xs">
              <Edit className="h-3 w-3 mr-1" />
              Custom
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mt-0.5">
          {automation.description || 'Sin descripción'}
        </p>
        
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          {automation.is_active && (
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Activa
            </span>
          )}
          {automation.last_run_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Última: {formatDistanceToNow(new Date(automation.last_run_at), { addSuffix: true, locale: es })}
            </span>
          )}
          {automation.run_count > 0 && (
            <span className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              {automation.run_count} ejecuciones
            </span>
          )}
          {automation.error_count > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <XCircle className="h-3 w-3" />
              {automation.error_count} errores
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onConfigure}>
          <Settings className="h-4 w-4" />
        </Button>
        
        <Switch
          checked={automation.is_active}
          onCheckedChange={onToggle}
          disabled={automation.is_locked || isPending}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onConfigure}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/app/settings/automations/history?automation=${automation.id}`}>
                <History className="h-4 w-4 mr-2" />
                Ver historial
              </Link>
            </DropdownMenuItem>
            {automation.is_custom && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ─── Available Automation Row ─────────────────────────────────

function AvailableAutomationRow({
  item,
  onActivate,
  isPending,
}: {
  item: TenantAutomationCatalogItem;
  onActivate: () => void;
  isPending: boolean;
}) {
  const visibilityConfig = VISIBILITY_CONFIG[item.template.visibility as keyof typeof VISIBILITY_CONFIG];
  const categoryConfig = CATEGORY_CONFIG[item.template.category as keyof typeof CATEGORY_CONFIG];

  return (
    <div className={cn(
      "py-4 flex items-start gap-4",
      !item.can_activate && "opacity-60"
    )}>
      <span className="text-2xl flex-shrink-0">{item.template.icon || '⚡'}</span>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium">{item.template.name}</h4>
          <Badge className={cn('text-xs', visibilityConfig?.bgClass)}>
            {visibilityConfig?.badge} {visibilityConfig?.label}
          </Badge>
          {!item.can_activate && (
            <Badge variant="outline" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              {item.blocked_reason}
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mt-0.5">
          {item.template.description}
        </p>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs" style={{ borderColor: categoryConfig?.color }}>
            {categoryConfig?.icon} {categoryConfig?.label}
          </Badge>
        </div>
      </div>

      <Button
        onClick={onActivate}
        disabled={!item.can_activate || isPending}
        size="sm"
      >
        {isPending ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <>
            <Plus className="h-4 w-4 mr-1" />
            Activar
          </>
        )}
      </Button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-64" />
    </div>
  );
}
