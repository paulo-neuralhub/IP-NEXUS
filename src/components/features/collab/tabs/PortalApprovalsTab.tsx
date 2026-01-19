import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { useCreateApproval, useCancelApproval } from '@/hooks/collab';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PortalApprovalsTabProps {
  portalId: string;
  approvals: any[];
}

const APPROVAL_TYPES = [
  { value: 'renewal', label: 'Renovación' },
  { value: 'filing', label: 'Nueva solicitud' },
  { value: 'response', label: 'Respuesta a requerimiento' },
  { value: 'opposition', label: 'Oposición' },
  { value: 'assignment', label: 'Cesión/Transferencia' },
  { value: 'budget', label: 'Presupuesto' },
  { value: 'invoice', label: 'Factura' },
  { value: 'strategy', label: 'Estrategia' },
  { value: 'document', label: 'Documento' },
  { value: 'custom', label: 'Otro' }
];

export default function PortalApprovalsTab({ portalId, approvals }: PortalApprovalsTabProps) {
  const createApproval = useCreateApproval();
  const cancelApproval = useCancelApproval();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    approval_type: '',
    title: '',
    description: '',
    due_date: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent'
  });
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createApproval.mutateAsync({
        portal_id: portalId,
        ...formData,
        due_date: formData.due_date || undefined
      });
      
      setShowCreateDialog(false);
      setFormData({
        approval_type: '',
        title: '',
        description: '',
        due_date: '',
        priority: 'normal'
      });
    } catch (error) {
      // Handled by mutation
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'changes_requested':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      changes_requested: 'Cambios solicitados',
      expired: 'Expirado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };
  
  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      urgent: { variant: 'destructive', label: 'Urgente' },
      high: { variant: 'default', label: 'Alta' },
      normal: { variant: 'secondary', label: 'Normal' },
      low: { variant: 'outline', label: 'Baja' }
    };
    const { variant, label } = config[priority] || config.normal;
    return <Badge variant={variant}>{label}</Badge>;
  };
  
  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const otherApprovals = approvals.filter(a => a.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Pending */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Aprobaciones Pendientes</CardTitle>
            <CardDescription>
              Solicitudes esperando respuesta del cliente
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay aprobaciones pendientes
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(approval.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getPriorityBadge(approval.priority)}
                        <Badge variant="outline">
                          {APPROVAL_TYPES.find(t => t.value === approval.approval_type)?.label || approval.approval_type}
                        </Badge>
                      </div>
                      <h4 className="font-medium">{approval.title}</h4>
                      {approval.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {approval.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          Creado: {format(new Date(approval.created_at), 'dd MMM yyyy', { locale: es })}
                        </span>
                        {approval.due_date && (
                          <span className="text-amber-600">
                            Vence: {format(new Date(approval.due_date), 'dd MMM yyyy', { locale: es })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Bell className="h-4 w-4 mr-1" />
                      Recordar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelApproval.mutate(approval.id)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* History */}
      {otherApprovals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {otherApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(approval.status)}
                    <div>
                      <p className="font-medium">{approval.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {getStatusLabel(approval.status)}
                        {approval.responded_at && (
                          <> · {format(new Date(approval.responded_at), 'dd MMM yyyy', { locale: es })}</>
                        )}
                      </p>
                    </div>
                  </div>
                  {approval.response_comment && (
                    <p className="text-sm text-muted-foreground max-w-xs truncate">
                      "{approval.response_comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Solicitud de Aprobación</DialogTitle>
            <DialogDescription>
              Envía una solicitud de aprobación al cliente
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select
                  value={formData.approval_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, approval_type: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {APPROVAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Aprobación renovación marca ACME"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detalles adicionales para el cliente..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Fecha límite</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createApproval.isPending}>
                {createApproval.isPending ? 'Creando...' : 'Crear Solicitud'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
