// ============================================================
// IP-NEXUS BACKOFFICE - Master Automation Templates Page
// CAPA 1: Gestión de templates maestros de automatización
// ============================================================

import { useState } from 'react';
import { 
  Zap, Plus, Search, Filter, MoreVertical, 
  Eye, Edit, Trash2, Copy, Power, PowerOff, Send,
  Bell, Clock, Users, FileText, RefreshCw, AlertTriangle, Mail, LineChart
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  useMasterAutomationTemplates,
  useMasterTemplateStats,
  useToggleMasterTemplateActive,
  useToggleMasterTemplatePublished,
  usePropagateTemplateUpdate,
  useDeleteMasterTemplate,
  TEMPLATE_CATEGORIES,
  PLAN_LEVELS,
  VISIBILITY_TYPES,
  type MasterAutomationTemplate,
} from '@/hooks/backoffice/useMasterAutomationTemplates';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  deadlines: Clock,
  communication: Mail,
  case_management: FileText,
  billing: FileText,
  ip_surveillance: AlertTriangle,
  internal: Users,
  reporting: LineChart,
};

export default function MasterAutomationTemplatesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MasterAutomationTemplate | null>(null);

  const { data: templates = [], isLoading } = useMasterAutomationTemplates({
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    min_plan_tier: planFilter !== 'all' ? planFilter : undefined,
    search: search || undefined,
  });
  const { data: stats } = useMasterTemplateStats();
  const toggleActive = useToggleMasterTemplateActive();
  const togglePublished = useToggleMasterTemplatePublished();
  const propagate = usePropagateTemplateUpdate();
  const deleteTemplate = useDeleteMasterTemplate();

  // Filter by search client-side for instant feedback
  const filteredTemplates = templates.filter(t => 
    !search || 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (selectedTemplate) {
      deleteTemplate.mutate(selectedTemplate.id, {
        onSuccess: () => setDeleteDialogOpen(false),
      });
    }
  };

  const getCategoryConfig = (category: string) => {
    return TEMPLATE_CATEGORIES.find(c => c.value === category) || 
      { label: category, icon: '⚡', color: '#6B7280' };
  };

  const getVisibilityBadge = (visibility: string) => {
    const config = VISIBILITY_TYPES.find(v => v.value === visibility);
    if (!config) return null;
    
    const colors: Record<string, string> = {
      system: '#6B7280',
      mandatory: '#EF4444',
      recommended: '#10B981',
      optional: '#3B82F6',
    };
    
    return (
      <Badge 
        variant="outline" 
        style={{ borderColor: colors[visibility], color: colors[visibility] }}
      >
        {config.label}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string | null) => {
    const config = PLAN_LEVELS.find(p => p.value === plan) || PLAN_LEVELS[0];
    return (
      <Badge 
        variant="outline" 
        style={{ borderColor: config.color, color: config.color }}
      >
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Templates de Automatización
          </h1>
          <p className="text-muted-foreground">
            Gestiona los templates maestros que los tenants pueden activar
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Zap className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-emerald-600">{stats?.active || 0}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Power className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publicados</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.published || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categorías</p>
                <p className="text-2xl font-bold">
                  {Object.keys(stats?.byCategory || {}).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Filter className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
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
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Plan mínimo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los planes</SelectItem>
            {PLAN_LEVELS.map(plan => (
              <SelectItem key={plan.value} value={plan.value}>
                {plan.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No hay templates</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Crea tu primer template de automatización
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTemplates.map(template => {
            const catConfig = getCategoryConfig(template.category);
            const CategoryIcon = CATEGORY_ICONS[template.category] || Zap;

            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div 
                        className="p-2.5 rounded-lg"
                        style={{ backgroundColor: `${template.color || catConfig.color}20` }}
                      >
                        <CategoryIcon 
                          className="h-5 w-5" 
                          style={{ color: template.color || catConfig.color }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {template.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {template.code}
                          </Badge>
                          {template.visibility === 'mandatory' && (
                            <Badge variant="destructive" className="text-xs">
                              Obligatoria
                            </Badge>
                          )}
                          {template.is_published && (
                            <Badge variant="default" className="text-xs bg-blue-600">
                              Publicado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline"
                            style={{ borderColor: catConfig.color, color: catConfig.color }}
                          >
                            {catConfig.label}
                          </Badge>
                          {getVisibilityBadge(template.visibility)}
                          {getPlanBadge(template.min_plan_tier)}
                          <span className="text-xs text-muted-foreground">
                            v{template.version} • {template.trigger_type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {template.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        <Switch
                          checked={template.is_active ?? false}
                          onCheckedChange={(checked) =>
                            toggleActive.mutate({ id: template.id, isActive: checked })
                          }
                          disabled={toggleActive.isPending}
                        />
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => togglePublished.mutate({ 
                              id: template.id, 
                              isPublished: !template.is_published 
                            })}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {template.is_published ? 'Despublicar' : 'Publicar'}
                          </DropdownMenuItem>
                          {template.is_published && (
                            <DropdownMenuItem
                              onClick={() => propagate.mutate(template.id)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Propagar a Tenants
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar template?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará el template{' '}
              <strong>{selectedTemplate?.name}</strong>{' '}
              y todas las configuraciones de tenants asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteTemplate.isPending}
            >
              {deleteTemplate.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
