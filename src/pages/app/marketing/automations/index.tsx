import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAutomations, useUpdateAutomation, useDeleteAutomation } from '@/hooks/use-marketing';
import { 
  Plus, Search, MoreHorizontal, Edit, Trash2, Zap, Play, 
  Pause, Eye, Users, CheckCircle, XCircle, Mail 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AUTOMATION_TRIGGERS, AUTOMATION_STATUSES } from '@/lib/constants/marketing';

type TabValue = 'all' | 'active' | 'paused' | 'draft';

export default function AutomationList() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const { data: automations, isLoading } = useAutomations();
  const updateAutomation = useUpdateAutomation();
  const deleteAutomation = useDeleteAutomation();

  const filteredAutomations = automations?.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || automation.status === activeTab;
    return matchesSearch && matchesTab;
  }) || [];

  const getTriggerLabel = (triggerType: string) => {
    const trigger = AUTOMATION_TRIGGERS[triggerType as keyof typeof AUTOMATION_TRIGGERS];
    return trigger?.label || triggerType;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = AUTOMATION_STATUSES[status as keyof typeof AUTOMATION_STATUSES];
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: 'secondary',
      active: 'default',
      paused: 'outline',
      archived: 'destructive'
    };
    return (
      <Badge 
        variant={variants[status] || 'secondary'}
        className={status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
      >
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const handleToggleStatus = (automation: NonNullable<typeof automations>[0]) => {
    const newStatus = automation.status === 'active' ? 'paused' : 'active';
    updateAutomation.mutate({ 
      id: automation.id, 
      data: { status: newStatus }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automatizaciones</h1>
          <p className="text-muted-foreground">Flujos automáticos de emails y acciones</p>
        </div>
        <Button asChild>
          <Link to="/app/marketing/automations/new">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Automatización
          </Link>
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="active">Activas</TabsTrigger>
            <TabsTrigger value="paused">Pausadas</TabsTrigger>
            <TabsTrigger value="draft">Borradores</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar automatizaciones..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Automations List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAutomations.length > 0 ? (
        <div className="space-y-4">
          {filteredAutomations.map((automation) => (
            <Card key={automation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg shrink-0 ${
                    automation.status === 'active' ? 'bg-green-100' : 'bg-muted'
                  }`}>
                    <Zap className={`w-6 h-6 ${
                      automation.status === 'active' ? 'text-green-600' : 'text-muted-foreground'
                    }`} />
                  </div>
                  
                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold truncate">{automation.name}</h3>
                      {getStatusBadge(automation.status)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      Trigger: {getTriggerLabel(automation.trigger_type)}
                      {automation.actions && ` · ${automation.actions.length} acciones`}
                    </p>

                    {/* Metrics */}
                    <div className="flex items-center gap-6 p-3 bg-muted/50 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{automation.total_enrolled || 0}</span>
                        <span className="text-muted-foreground">Inscritos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{automation.total_completed || 0}</span>
                        <span className="text-muted-foreground">Completados</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="font-medium">{automation.total_exited || 0}</span>
                        <span className="text-muted-foreground">Salidos</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Switch
                      checked={automation.status === 'active'}
                      onCheckedChange={() => handleToggleStatus(automation)}
                      disabled={automation.status === 'draft' || automation.status === 'archived'}
                    />

                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/app/marketing/automations/${automation.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Link>
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/app/marketing/automations/${automation.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        {automation.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handleToggleStatus(automation)}>
                            <Pause className="w-4 h-4 mr-2" />
                            Pausar
                          </DropdownMenuItem>
                        ) : automation.status === 'paused' && (
                          <DropdownMenuItem onClick={() => handleToggleStatus(automation)}>
                            <Play className="w-4 h-4 mr-2" />
                            Activar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteAutomation.mutate(automation.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Zap className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {activeTab === 'all' ? 'No hay automatizaciones' : `No hay automatizaciones ${activeTab === 'active' ? 'activas' : activeTab === 'paused' ? 'pausadas' : 'en borrador'}`}
            </h3>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              Crea flujos automatizados para enviar emails basados en eventos o comportamientos
            </p>
            <Button asChild>
              <Link to="/app/marketing/automations/new">
                <Plus className="w-4 h-4 mr-2" />
                Crear Automatización
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
