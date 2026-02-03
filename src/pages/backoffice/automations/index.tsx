// =====================================================================
// IP-NEXUS BACKOFFICE - Motor de Automatizaciones (Página Principal)
// =====================================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, Plus, Search, Filter, MoreVertical, 
  Copy, Send, Eye, Trash2, FileText, ChevronDown,
  CheckCircle, XCircle, Clock, Zap, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
  useAutomationMasterTemplates,
  useAutomationTemplateStats,
  useTogglePublishTemplate,
  useDuplicateMasterTemplate,
  useDeleteMasterTemplate,
  usePropagateMasterTemplate,
  useTenantInstancesCount,
} from '@/hooks/backoffice/useAutomationMasterTemplates';

import { useTestAutomation } from '@/hooks/backoffice/useAutomationExecutions';

import {
  CATEGORY_CONFIG,
  VISIBILITY_CONFIG,
  TRIGGER_TYPE_CONFIG,
  PLAN_TIER_CONFIG,
  getTriggerDescription,
  type AutomationCategory,
  type AutomationVisibility,
  type PlanTier,
  type AutomationMasterTemplate,
} from '@/types/automations';

import { MasterTemplateEditorDialog } from '@/components/backoffice/automations/MasterTemplateEditorDialog';

export default function AutomationTemplatesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AutomationCategory | 'all'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<AutomationVisibility | 'all'>('all');
  const [planFilter, setPlanFilter] = useState<PlanTier | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationMasterTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propagateDialogOpen, setPropagateDialogOpen] = useState(false);
  const [templateToAction, setTemplateToAction] = useState<AutomationMasterTemplate | null>(null);

  // Queries
  const { data: templates, isLoading } = useAutomationMasterTemplates({
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    visibility: visibilityFilter !== 'all' ? visibilityFilter : undefined,
    planTier: planFilter !== 'all' ? planFilter : undefined,
    isPublished: statusFilter === 'all' ? undefined : statusFilter === 'published',
    search: search || undefined,
  });
  
  const { data: stats } = useAutomationTemplateStats();

  // Mutations
  const togglePublish = useTogglePublishTemplate();
  const duplicate = useDuplicateMasterTemplate();
  const deleteTemplate = useDeleteMasterTemplate();
  const propagate = usePropagateMasterTemplate();
  const testAutomation = useTestAutomation();

  // Handlers
  const handleEdit = (template: AutomationMasterTemplate) => {
    setSelectedTemplate(template);
    setIsCreating(false);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsCreating(true);
    setIsEditorOpen(true);
  };

  const handleDuplicate = (template: AutomationMasterTemplate) => {
    duplicate.mutate(template.id);
  };

  const handleTogglePublish = (template: AutomationMasterTemplate) => {
    togglePublish.mutate({ id: template.id, isPublished: !template.is_published });
  };

  const handleDelete = () => {
    if (templateToAction) {
      deleteTemplate.mutate(templateToAction.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setTemplateToAction(null);
        },
      });
    }
  };

  const handlePropagate = () => {
    if (templateToAction) {
      propagate.mutate(templateToAction.id, {
        onSuccess: () => {
          setPropagateDialogOpen(false);
          setTemplateToAction(null);
        },
      });
    }
  };

  const handleTest = (template: AutomationMasterTemplate) => {
    // For testing, we need a tenant_automation instance
    // Since we're in backoffice, we'll look for any active instance
    toast.info('Buscando instancia de tenant para probar...');
    // This would normally fetch a tenant instance first
    // For now, we show a message
    toast.warning('El botón Test requiere una instancia de tenant. Usa "Ver instancias" para probar.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Motor de Automatizaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las automatizaciones disponibles para todos los tenants.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Automatización
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="category">Por Categoría</TabsTrigger>
          <TabsTrigger value="executions" asChild>
            <Link to="/backoffice/automations/executions">Ejecuciones</Link>
          </TabsTrigger>
          <TabsTrigger value="variables" asChild>
            <Link to="/backoffice/automations/variables">Variables</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Total</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats?.total || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Publicadas</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats?.published || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-muted-foreground">Borrador</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats?.draft || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔒</span>
                  <span className="text-sm text-muted-foreground">Obligatorias</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats?.mandatory || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">⭐</span>
                  <span className="text-sm text-muted-foreground">Recomendadas</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats?.recommended || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, código..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as AutomationCategory | 'all')}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.icon} {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={visibilityFilter} onValueChange={(v) => setVisibilityFilter(v as AutomationVisibility | 'all')}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Visibilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {Object.entries(VISIBILITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.badge} {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={(v) => setPlanFilter(v as PlanTier | 'all')}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(PLAN_TIER_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'published' | 'draft')}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="published">Publicadas</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : !templates?.length ? (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No hay automatizaciones</h3>
                  <p className="text-muted-foreground mt-1">
                    Crea la primera automatización para comenzar.
                  </p>
                  <Button className="mt-4" onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Automatización
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Visibilidad</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TemplateRow
                        key={template.id}
                        template={template}
                        onEdit={handleEdit}
                        onDuplicate={handleDuplicate}
                        onTogglePublish={handleTogglePublish}
                        onDelete={(t) => {
                          setTemplateToAction(t);
                          setDeleteDialogOpen(true);
                        }}
                        onPropagate={(t) => {
                          setTemplateToAction(t);
                          setPropagateDialogOpen(true);
                        }}
                        onTest={handleTest}
                        isTestPending={testAutomation.isPending}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <CategoryView templates={templates || []} onEdit={handleEdit} />
        </TabsContent>
      </Tabs>

      {/* Editor Dialog */}
      <MasterTemplateEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        template={selectedTemplate}
        isCreating={isCreating}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar automatización?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la automatización "{templateToAction?.name}".
              Las instancias en los tenants quedarán huérfanas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Propagate Confirmation */}
      <AlertDialog open={propagateDialogOpen} onOpenChange={setPropagateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Propagar cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto actualizará la lógica de "{templateToAction?.name}" en todos los tenants que la tienen instanciada.
              Los parámetros personalizados de cada tenant NO se sobrescribirán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePropagate}>
              <Send className="h-4 w-4 mr-2" />
              Propagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Template Row Component ─────────────────────────────────

function TemplateRow({
  template,
  onEdit,
  onDuplicate,
  onTogglePublish,
  onDelete,
  onPropagate,
  onTest,
  isTestPending,
}: {
  template: AutomationMasterTemplate;
  onEdit: (t: AutomationMasterTemplate) => void;
  onDuplicate: (t: AutomationMasterTemplate) => void;
  onTogglePublish: (t: AutomationMasterTemplate) => void;
  onDelete: (t: AutomationMasterTemplate) => void;
  onPropagate: (t: AutomationMasterTemplate) => void;
  onTest: (t: AutomationMasterTemplate) => void;
  isTestPending: boolean;
}) {
  const categoryConfig = CATEGORY_CONFIG[template.category];
  const visibilityConfig = VISIBILITY_CONFIG[template.visibility];
  const triggerConfig = TRIGGER_TYPE_CONFIG[template.trigger_type];
  const planConfig = PLAN_TIER_CONFIG[template.min_plan_tier];

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => onEdit(template)}>
      <TableCell>
        <span className="text-xl">{template.icon}</span>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{template.name}</p>
          <p className="text-xs text-muted-foreground">{template.code}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" style={{ borderColor: categoryConfig.color, color: categoryConfig.color }}>
          {categoryConfig.icon} {categoryConfig.label}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-sm">
          <span>{triggerConfig.icon}</span>
          <span className="text-muted-foreground">{triggerConfig.label}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={cn('text-xs', visibilityConfig.bgClass)}>
          {visibilityConfig.badge} {visibilityConfig.label}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{planConfig.label}</Badge>
      </TableCell>
      <TableCell>
        {template.is_published ? (
          <Badge className="bg-green-100 text-green-700">Publicada</Badge>
        ) : (
          <Badge variant="outline">Borrador</Badge>
        )}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(template)}>
              <Eye className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(template)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTogglePublish(template)}>
              {template.is_published ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Retirar
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Publicar
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onTest(template)}
              disabled={isTestPending}
            >
              <Play className="h-4 w-4 mr-2" />
              {isTestPending ? 'Ejecutando...' : 'Probar'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPropagate(template)}>
              <Send className="h-4 w-4 mr-2" />
              Propagar a tenants
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/backoffice/automations/instances?template=${template.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Ver instancias
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(template)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// ─── Category View Component ────────────────────────────────

function CategoryView({
  templates,
  onEdit,
}: {
  templates: AutomationMasterTemplate[];
  onEdit: (t: AutomationMasterTemplate) => void;
}) {
  const grouped = templates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<AutomationCategory, AutomationMasterTemplate[]>);

  return (
    <div className="grid gap-6">
      {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
        const categoryTemplates = grouped[category as AutomationCategory] || [];
        if (categoryTemplates.length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span>{config.icon}</span>
                {config.label}
                <Badge variant="secondary" className="ml-2">{categoryTemplates.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => onEdit(template)}
                    className="flex items-start gap-3 p-3 rounded-lg border text-left hover:bg-muted transition-colors"
                  >
                    <span className="text-xl">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{template.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {TRIGGER_TYPE_CONFIG[template.trigger_type].label}
                      </p>
                    </div>
                    {template.is_published ? (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
