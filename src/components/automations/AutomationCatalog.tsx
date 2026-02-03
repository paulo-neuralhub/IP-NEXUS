// ============================================================
// IP-NEXUS - Automation Catalog Component
// CAPA 2: Vista del catálogo de automatizaciones para tenants
// ============================================================

import { useState } from 'react';
import { 
  Zap, Search, Filter, Check, Lock, Settings, 
  Bell, Clock, Users, FileText, AlertTriangle, RefreshCw,
  ChevronDown, ChevronRight, Play
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
  useEnableAutomation,
  useDisableAutomation,
  useUpdateAutomationParams,
  useTenantAutomationStats,
  type TenantAutomationCatalogItem,
} from '@/hooks/useTenantAutomationConfigs';
import { TEMPLATE_CATEGORIES } from '@/hooks/backoffice/useMasterAutomationTemplates';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  deadlines: Clock,
  notifications: Bell,
  onboarding: Users,
  crm: Users,
  spider: AlertTriangle,
  billing: FileText,
  tasks: RefreshCw,
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

  const configurableParams = (item.configurable_params as Array<{
    key: string;
    type: string;
    label: string;
    default: unknown;
    min?: number;
    max?: number;
    options?: string[];
  }>) || [];

  const handleSave = () => {
    updateParams.mutate(
      { templateId: item.id, customParams: params },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar: {item.name_es || item.name}</DialogTitle>
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
                    min={param.min}
                    max={param.max}
                    defaultValue={
                      (item.tenant_config?.custom_params as Record<string, unknown>)?.[param.key] as number 
                      ?? param.default as number
                    }
                    onChange={(e) => setParams({ ...params, [param.key]: Number(e.target.value) })}
                  />
                ) : param.type === 'boolean' ? (
                  <Switch
                    id={param.key}
                    defaultChecked={
                      (item.tenant_config?.custom_params as Record<string, unknown>)?.[param.key] as boolean 
                      ?? param.default as boolean
                    }
                    onCheckedChange={(checked) => setParams({ ...params, [param.key]: checked })}
                  />
                ) : param.type === 'select' && param.options ? (
                  <Select
                    defaultValue={
                      ((item.tenant_config?.custom_params as Record<string, unknown>)?.[param.key] as string) 
                      ?? (param.default as string)
                    }
                    onValueChange={(value) => setParams({ ...params, [param.key]: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {param.options.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={param.key}
                    defaultValue={
                      ((item.tenant_config?.custom_params as Record<string, unknown>)?.[param.key] as string) 
                      ?? (param.default as string)
                    }
                    onChange={(e) => setParams({ ...params, [param.key]: e.target.value })}
                  />
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
  const enableAutomation = useEnableAutomation();
  const disableAutomation = useDisableAutomation();

  // Filter catalog
  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.name_es?.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedCatalog = filteredCatalog.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
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
    if (item.is_enabled) {
      disableAutomation.mutate(item.id);
    } else {
      enableAutomation.mutate({ templateId: item.id });
    }
  };

  const getCategoryConfig = (category: string) => {
    return TEMPLATE_CATEGORIES.find(c => c.value === category) ||
      { label: category, icon: 'zap', color: '#6B7280' };
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
            {stats?.enabled || 0} activas de {catalog.length} disponibles
          </p>
        </div>
        {stats && (
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
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
            const enabledCount = items.filter(i => i.is_enabled).length;

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
                              {enabledCount}/{items.length} activas
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
                            key={item.id}
                            className={cn(
                              "py-4 flex items-center justify-between",
                              !item.can_enable && "opacity-60"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">
                                  {item.name_es || item.name}
                                </h4>
                                {item.is_mandatory && (
                                  <Badge variant="secondary" className="text-xs">
                                    Obligatoria
                                  </Badge>
                                )}
                                {!item.can_enable && (
                                  <Badge variant="outline" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    {item.blocked_reason}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.description_es || item.description}
                              </p>
                              {item.is_enabled && item.tenant_config?.execution_count ? (
                                <p className="text-xs text-muted-foreground mt-1">
                                  <Play className="h-3 w-3 inline mr-1" />
                                  {item.tenant_config.execution_count} ejecuciones
                                </p>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                              {item.is_enabled && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setConfigItem(item)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              )}
                              <Switch
                                checked={item.is_enabled}
                                onCheckedChange={() => handleToggle(item)}
                                disabled={
                                  !item.can_enable ||
                                  enableAutomation.isPending ||
                                  disableAutomation.isPending
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
