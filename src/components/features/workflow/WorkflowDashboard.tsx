import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Plus, 
  Settings, 
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { 
  useWorkflowTemplates, 
  useWorkflowExecutions, 
  useWorkflowStats,
  useToggleWorkflowActive,
  useDeleteWorkflowTemplate,
  useTriggerWorkflowManually
} from '@/hooks/workflow/useWorkflows';
import { WORKFLOW_TRIGGER_TYPES } from '@/types/workflow.types';
import type { WorkflowTemplate, WorkflowExecution } from '@/types/workflow.types';
import { InlineHelp } from '@/components/help';

export function WorkflowDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('workflows');

  const { data: workflows = [], isLoading: loadingWorkflows } = useWorkflowTemplates();
  const { data: executions = [], isLoading: loadingExecutions } = useWorkflowExecutions({ limit: 50 });
  const { data: stats } = useWorkflowStats(30);
  
  const toggleActive = useToggleWorkflowActive();
  const deleteWorkflow = useDeleteWorkflowTemplate();
  const triggerManually = useTriggerWorkflowManually();

  // Filter workflows
  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = !search || 
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || w.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getTriggerInfo = (type: string) => {
    return WORKFLOW_TRIGGER_TYPES.find(t => t.type === type);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'running': return 'bg-blue-100 text-blue-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      onboarding: 'bg-blue-100 text-blue-700',
      deadlines: 'bg-orange-100 text-orange-700',
      notifications: 'bg-purple-100 text-purple-700',
      crm: 'bg-pink-100 text-pink-700',
      billing: 'bg-amber-100 text-amber-700',
      spider: 'bg-red-100 text-red-700',
      custom: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors.custom;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Workflows
            <InlineHelp text="Motor de automatización para crear flujos de trabajo. Configura triggers (plazos, eventos, fechas) y acciones automáticas (emails, tareas, cambios de estado)." />
          </h1>
          <p className="text-muted-foreground">Automatiza procesos con flujos de trabajo inteligentes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/app/workflow/templates')}>
            <Copy className="h-4 w-4 mr-2" />
            Plantillas
          </Button>
          <Button onClick={() => navigate('/app/workflow/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Workflow
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Workflows Activos</p>
                <p className="text-2xl font-bold">{workflows.filter(w => w.is_active).length}</p>
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
                <p className="text-sm text-muted-foreground">Ejecuciones (30d)</p>
                <p className="text-2xl font-bold">{stats?.total_executions || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exitosas</p>
                <p className="text-2xl font-bold text-emerald-600">{stats?.successful || 0}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fallidas</p>
                <p className="text-2xl font-bold text-red-600">{stats?.failed || 0}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Ejecuciones</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar workflows..."
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
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="deadlines">Plazos</SelectItem>
                <SelectItem value="notifications">Notificaciones</SelectItem>
                <SelectItem value="crm">CRM</SelectItem>
                <SelectItem value="billing">Facturación</SelectItem>
                <SelectItem value="spider">Spider</SelectItem>
                <SelectItem value="custom">Personalizados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Workflows List */}
          {loadingWorkflows ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">No hay workflows</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Crea tu primer workflow o usa una plantilla
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => navigate('/app/workflow/templates')}>
                    Ver Plantillas
                  </Button>
                  <Button onClick={() => navigate('/app/workflow/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredWorkflows.map(workflow => {
                const triggerInfo = getTriggerInfo(workflow.trigger_type);
                
                return (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={cn(
                            "p-2.5 rounded-lg",
                            workflow.is_active ? "bg-primary/10" : "bg-muted"
                          )}>
                            <Zap className={cn(
                              "h-5 w-5",
                              workflow.is_active ? "text-primary" : "text-muted-foreground"
                            )} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{workflow.name}</h3>
                              {workflow.is_system && (
                                <Badge variant="secondary" className="text-xs">Sistema</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {workflow.description || `Trigger: ${triggerInfo?.label || workflow.trigger_type}`}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className={getCategoryColor(workflow.category)}>
                                {workflow.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {workflow.actions?.length || 0} acciones
                              </span>
                              {workflow.execution_count > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  • {workflow.execution_count} ejecuciones
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {workflow.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                            <Switch
                              checked={workflow.is_active}
                              onCheckedChange={(checked) => 
                                toggleActive.mutate({ id: workflow.id, isActive: checked })
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
                              <DropdownMenuItem onClick={() => navigate(`/app/workflow/${workflow.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/app/workflow/${workflow.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => triggerManually.mutate({ workflowId: workflow.id })}
                                disabled={!workflow.is_active}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Ejecutar Manualmente
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  if (confirm('¿Eliminar este workflow?')) {
                                    deleteWorkflow.mutate(workflow.id);
                                  }
                                }}
                                disabled={workflow.is_system}
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
        </TabsContent>

        <TabsContent value="executions" className="mt-4">
          {loadingExecutions ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : executions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">Sin ejecuciones</h3>
                <p className="text-muted-foreground text-sm">
                  Las ejecuciones de workflows aparecerán aquí
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {executions.map(execution => (
                    <div 
                      key={execution.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/app/workflow/execution/${execution.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          execution.status === 'completed' && "bg-emerald-100",
                          execution.status === 'running' && "bg-blue-100",
                          execution.status === 'failed' && "bg-red-100",
                          execution.status === 'pending' && "bg-yellow-100"
                        )}>
                          {execution.status === 'running' ? (
                            <Spinner className="h-4 w-4" />
                          ) : execution.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          ) : execution.status === 'failed' ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>

                        <div>
                          <p className="font-medium">
                            {(execution.workflow as any)?.name || 'Workflow'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {execution.trigger_type} • {execution.actions_completed}/{(execution.workflow as any)?.actions?.length || 0} acciones
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(execution.created_at).toLocaleString('es-ES')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
