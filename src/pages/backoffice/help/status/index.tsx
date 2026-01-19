// ============================================================
// IP-NEXUS BACKOFFICE - SYSTEM STATUS MANAGEMENT
// ============================================================

import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSystemStatus, useCreateSystemStatus, useUpdateSystemStatus, useDeleteSystemStatus } from '@/hooks/help/useHelpAnnouncements';
import { HelpSystemStatus } from '@/types/help';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const statusConfig: Record<HelpSystemStatus['status'], { label: string; icon: any; color: string }> = {
  operational: { label: 'Operativo', icon: CheckCircle2, color: 'text-green-500' },
  degraded: { label: 'Degradado', icon: AlertTriangle, color: 'text-yellow-500' },
  partial_outage: { label: 'Interrupción Parcial', icon: AlertTriangle, color: 'text-orange-500' },
  major_outage: { label: 'Interrupción Mayor', icon: XCircle, color: 'text-red-500' },
  maintenance: { label: 'Mantenimiento', icon: Clock, color: 'text-blue-500' },
};

const components = [
  'platform',
  'authentication',
  'database',
  'storage',
  'ai',
  'email',
  'integrations',
  'api',
];

export default function SystemStatusManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<HelpSystemStatus | null>(null);
  
  const { data: statuses = [], isLoading } = useSystemStatus();
  const createStatus = useCreateSystemStatus();
  const updateStatus = useUpdateSystemStatus();
  const deleteStatus = useDeleteSystemStatus();

  const [form, setForm] = useState({
    component: '',
    status: 'operational' as HelpSystemStatus['status'],
    title: '',
    description: '',
  });

  const handleOpenDialog = (status?: HelpSystemStatus) => {
    if (status) {
      setEditingStatus(status);
      setForm({
        component: status.component,
        status: status.status,
        title: status.title || '',
        description: status.description || '',
      });
    } else {
      setEditingStatus(null);
      setForm({
        component: '',
        status: 'operational',
        title: '',
        description: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.component || !form.status) {
      toast.error('Componente y estado son requeridos');
      return;
    }

    try {
      const payload = {
        component: form.component,
        status: form.status,
        title: form.title,
        description: form.description,
        started_at: new Date().toISOString(),
      };

      if (editingStatus) {
        await updateStatus.mutateAsync({ id: editingStatus.id, ...payload });
        toast.success('Estado actualizado');
      } else {
        await createStatus.mutateAsync(payload);
        toast.success('Estado creado');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al guardar el estado');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    
    try {
      await deleteStatus.mutateAsync(id);
      toast.success('Registro eliminado');
    } catch (error) {
      toast.error('Error al eliminar el registro');
    }
  };

  const handleResolve = async (status: HelpSystemStatus) => {
    try {
      await updateStatus.mutateAsync({
        id: status.id,
        status: 'operational',
        resolved_at: new Date().toISOString(),
      });
      toast.success('Incidencia resuelta');
    } catch (error) {
      toast.error('Error al resolver la incidencia');
    }
  };

  // Group by status
  const activeIncidents = statuses.filter(s => s.status !== 'operational' && !s.resolved_at);
  const resolvedIncidents = statuses.filter(s => s.resolved_at);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Gestiona el estado del sistema y las incidencias
        </p>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Incidencia
        </Button>
      </div>

      {/* Current Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Estado Actual del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {components.map((component) => {
              const status = statuses.find(s => s.component === component && !s.resolved_at);
              const config = statusConfig[status?.status || 'operational'];
              const Icon = config.icon;
              
              return (
                <div key={component} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <div>
                    <p className="font-medium capitalize">{component}</p>
                    <p className={`text-sm ${config.color}`}>{config.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Incidencias Activas ({activeIncidents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeIncidents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay incidencias activas. ¡Todo operativo!
            </p>
          ) : (
            <div className="space-y-4">
              {activeIncidents.map((incident) => {
                const config = statusConfig[incident.status];
                const Icon = config.icon;
                
                return (
                  <div key={incident.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{incident.title || incident.component}</h3>
                            <Badge variant="outline" className="capitalize">
                              {incident.component}
                            </Badge>
                          </div>
                          {incident.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {incident.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Iniciado: {format(new Date(incident.started_at || incident.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolve(incident)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Resolver
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(incident)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolved Incidents */}
      {resolvedIncidents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Historial de Incidencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolvedIncidents.slice(0, 10).map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{incident.title || incident.component}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(incident.resolved_at || incident.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(incident.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStatus ? 'Editar Incidencia' : 'Nueva Incidencia'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Componente *</Label>
                <Select
                  value={form.component}
                  onValueChange={(v) => setForm({ ...form, component: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona componente" />
                  </SelectTrigger>
                  <SelectContent>
                    {components.map((component) => (
                      <SelectItem key={component} value={component} className="capitalize">
                        {component}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: HelpSystemStatus['status']) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Título de la incidencia"
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descripción de la incidencia"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={createStatus.isPending || updateStatus.isPending}>
              {editingStatus ? 'Guardar Cambios' : 'Crear Incidencia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
