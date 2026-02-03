// ============================================================
// IP-NEXUS - Automation Catalog Component
// CAPA 2: Vista del catálogo de automatizaciones para tenants
// ============================================================

import { useState } from 'react';
import { 
  Zap, Search, Filter, Check, Lock, Settings, 
  Bell, Clock, Users, FileText, AlertTriangle, RefreshCw,
  ChevronDown, ChevronRight, Play, Building, LineChart, Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  useAutomationCatalog,
  useActivateAutomation,
  useDeactivateAutomation,
  useUpdateAutomationParams,
  useTenantAutomationStats,
  type TenantAutomationCatalogItem,
} from '@/hooks/useTenantAutomationConfigs';
import { TEMPLATE_CATEGORIES, type ConfigurableParam } from '@/hooks/backoffice/useMasterAutomationTemplates';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  deadlines: Clock,
  communication: Mail,
  case_management: FileText,
  billing: FileText,
  ip_surveillance: AlertTriangle,
  internal: Users,
  reporting: LineChart,
  custom: Zap,
};

interface ConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TenantAutomationCatalogItem | null;
}

function ConfigDialog({ open, onOpenChange, item }: ConfigDialogProps) {
  const [params, setParams] = useState<Record<string, unknown>>({});
  const updateParams = useUpdateAutomationParams();

  if (!item) return null;

  const configurableParams = (item.template.configurable_params || []) as ConfigurableParam[];

  const handleSave = () => {
    if (!item.tenant_automation?.id) return;
    updateParams.mutate(
      { automationId: item.tenant_automation.id, customParams: params },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const currentParams = item.tenant_automation?.custom_params || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar: {item.template.name}</DialogTitle>
          <DialogDescription>
            Personaliza los parámetros de esta automatización
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {configurableParams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Esta automatización no tiene parámetros configurables
            </p>
          ) : (
            configurableParams.map(param => (
              <div key={param.key} className="space-y-2">
                <Label htmlFor={param.key}>{param.label}</Label>
                {param.type === 'number' ? (
                  <Input
                    id={param.key}
                    type="number"
                    min={param.validation?.min as number}
                    max={param.validation?.max as number}
                    defaultValue={
                      (currentParams[param.key] as number) ?? (param.default_value as number)
                    }
                    onChange={(e) => setParams({ ...params, [param.key]: Number(e.target.value) })}
                  />
                ) : param.type === 'boolean' ? (
                  <Switch
                    id={param.key}
                    defaultChecked={
                      (currentParams[param.key] as boolean) ?? (param.default_value as boolean)
                    }
                    onCheckedChange={(checked) => setParams({ ...params, [param.key]: checked })}
                  />
                ) : param.type === 'select' && param.options ? (
                  <Select
                    defaultValue={
                      (currentParams[param.key] as string) ?? (param.default_value as string)
                    }
                    onValueChange={(value) => setParams({ ...params, [param.key]: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {param.options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={param.key}
                    defaultValue={
                      (currentParams[param.key] as string) ?? (param.default_value as string)
                    }
                    onChange={(e) => setParams({ ...params, [param.key]: e.target.value })}
                  />
                )}
                {param.description && (
                  <p className="text-xs text-muted-foreground">{param.description}</p>
                )}
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={updateParams.isPending}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AutomationCatalog() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['deadlines']));
  const [configItem, setConfigItem] = useState<TenantAutomationCatalogItem | null>(null);

  const { data: catalog = [], isLoading } = useAutomationCatalog();
  const { data: stats } = useTenantAutomationStats();
  const activateAutomation = useActivateAutomation();
  const deactivateAutomation = useDeactivateAutomation();

  // Filter catalog
  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = !search ||
      item.template.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.template.name_en?.toLowerCase().includes(search.toLowerCase())) ||
      (item.template.description?.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || item.template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedCatalog = filteredCatalog.reduce((acc, item) => {
    const cat = item.template.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, TenantAutomationCatalogItem[]>);

  const toggleCategory = (category: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  const handleToggle = (item: TenantAutomationCatalogItem) => {
    if (item.is_active && item.tenant_automation?.id) {
      deactivateAutomation.mutate(item.tenant_automation.id);
    } else {
      activateAutomation.mutate({ templateId: item.template.id });
    }
  };

  const getCategoryConfig = (category: string) => {
    return TEMPLATE_CATEGORIES.find(c => c.value === category) ||
      { label: category, icon: '⚡', color: '#6B7280' };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Catálogo de Automatizaciones
          </h2>
          <p className="text-sm text-muted-foreground">
            {stats?.active || 0} activas de {catalog.length} disponibles
          </p>
        </div>
        {stats && (
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.success}</p>
              <p className="text-muted-foreground">Completadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-muted-foreground">Fallidas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.successRate}%</p>
              <p className="text-muted-foreground">Éxito</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar automatizaciones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {TEMPLATE_CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Catalog by Category */}
      {Object.keys(groupedCatalog).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No hay automatizaciones</h3>
            <p className="text-muted-foreground text-sm">
              No se encontraron automatizaciones que coincidan con tu búsqueda
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedCatalog).map(([category, items]) => {
            const catConfig = getCategoryConfig(category);
            const CategoryIcon = CATEGORY_ICONS[category] || Zap;
            const isExpanded = expandedCategories.has(category);
            const activeCount = items.filter(i => i.is_active).length;

            return (
              <Collapsible key={category} open={isExpanded}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${catConfig.color}20` }}
                          >
                            <CategoryIcon 
                              className="h-5 w-5"
                              style={{ color: catConfig.color }}
                            />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{catConfig.label}</CardTitle>
                            <CardDescription>
                              {activeCount}/{items.length} activas
                            </CardDescription>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="divide-y">
                        {items.map(item => (
                          <div 
                            key={item.template.id}
                            className={cn(
                              "py-4 flex items-center justify-between",
                              !item.can_activate && "opacity-60"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">
                                  {item.template.name}
                                </h4>
                                {item.is_locked && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Obligatoria
                                  </Badge>
                                )}
                                {!item.can_activate && (
                                  <Badge variant="outline" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    {item.blocked_reason}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.template.description}
                              </p>
                              {item.is_active && item.tenant_automation?.run_count ? (
                                <p className="text-xs text-muted-foreground mt-1">
                                  <Play className="h-3 w-3 inline mr-1" />
                                  {item.tenant_automation.run_count} ejecuciones
                                  {item.tenant_automation.success_count > 0 && (
                                    <span className="text-emerald-600 ml-2">
                                      ✓ {item.tenant_automation.success_count} exitosas
                                    </span>
                                  )}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                              {item.is_active && item.tenant_automation && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setConfigItem(item)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              )}
                              <Switch
                                checked={item.is_active}
                                onCheckedChange={() => handleToggle(item)}
                                disabled={
                                  !item.can_activate ||
                                  item.is_locked ||
                                  activateAutomation.isPending ||
                                  deactivateAutomation.isPending
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Config Dialog */}
      <ConfigDialog
        open={!!configItem}
        onOpenChange={(open) => !open && setConfigItem(null)}
        item={configItem}
      />
    </div>
  );
}
