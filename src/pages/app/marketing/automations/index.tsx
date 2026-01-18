import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAutomations, useUpdateAutomation, useDeleteAutomation } from '@/hooks/use-marketing';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Zap, Play, Pause } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AUTOMATION_TRIGGERS, AUTOMATION_STATUSES } from '@/lib/constants/marketing';

export default function AutomationList() {
  const [search, setSearch] = useState('');
  const { data: automations, isLoading } = useAutomations();
  const updateAutomation = useUpdateAutomation();
  const deleteAutomation = useDeleteAutomation();

  const filteredAutomations = automations?.filter(automation =>
    automation.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

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
      <Badge variant={variants[status] || 'secondary'}>
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar automatizaciones..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild>
          <Link to="/app/marketing/automations/new">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Automatización
          </Link>
        </Button>
      </div>

      {/* Automations List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAutomations.length > 0 ? (
        <div className="space-y-3">
          {filteredAutomations.map((automation) => (
            <Card key={automation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${automation.status === 'active' ? 'bg-green-100' : 'bg-muted'}`}>
                    <Zap className={`w-6 h-6 ${automation.status === 'active' ? 'text-green-600' : 'text-muted-foreground'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{automation.name}</h3>
                      {getStatusBadge(automation.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Trigger: {getTriggerLabel(automation.trigger_type)}
                    </p>
                  </div>

                  <div className="hidden md:flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <p className="font-medium">{automation.total_enrolled || 0}</p>
                      <p className="text-muted-foreground">Inscritos</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{automation.total_completed || 0}</p>
                      <p className="text-muted-foreground">Completados</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={automation.status === 'active'}
                      onCheckedChange={() => handleToggleStatus(automation)}
                      disabled={automation.status === 'draft' || automation.status === 'archived'}
                    />

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
            <h3 className="text-lg font-medium mb-2">No hay automatizaciones</h3>
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
