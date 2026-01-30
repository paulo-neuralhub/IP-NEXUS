/**
 * Backoffice - WhatsApp Implementation Requests Management
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  MessageCircle, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Phone,
  Mail,
  User,
  DollarSign,
  MoreVertical,
  ExternalLink,
  Loader2
} from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface ImplementationRequest {
  id: string;
  organization_id: string;
  requested_by: string | null;
  requested_at: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  plan_type: 'standard' | 'premium' | 'enterprise';
  estimated_monthly_messages: number | null;
  current_whatsapp_number: string | null;
  additional_notes: string | null;
  status: 'pending' | 'contacted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  assigned_admin: string | null;
  admin_notes: string | null;
  contacted_at: string | null;
  completed_at: string | null;
  quoted_price: number | null;
  setup_fee: number | null;
  monthly_fee: number | null;
  created_at: string;
  updated_at: string;
  organization?: { id: string; name: string; slug: string } | null;
}

type RequestStatus = 'pending' | 'contacted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

const STATUS_CONFIG: Record<RequestStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  pending: { label: 'Pendiente', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  contacted: { label: 'Contactado', variant: 'default', icon: <Phone className="h-3 w-3" /> },
  in_progress: { label: 'En progreso', variant: 'default', icon: <Loader2 className="h-3 w-3" /> },
  completed: { label: 'Completado', variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: 'Rechazado', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelado', variant: 'outline', icon: <XCircle className="h-3 w-3" /> },
};

const PLAN_LABELS: Record<string, string> = {
  standard: 'Estándar',
  premium: 'Premium',
  enterprise: 'Enterprise',
};

export default function BackofficeWhatsAppRequestsPage() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<ImplementationRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch all requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['bo-whatsapp-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_implementation_requests')
        .select(`
          *,
          organization:organization_id (id, name, slug)
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ImplementationRequest[];
    },
  });

  // Update request mutation
  const updateRequest = useMutation({
    mutationFn: async (params: { id: string; updates: Partial<ImplementationRequest> }) => {
      const { error } = await supabase
        .from('whatsapp_implementation_requests')
        .update({
          ...params.updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Solicitud actualizada');
      queryClient.invalidateQueries({ queryKey: ['bo-whatsapp-requests'] });
      setSelectedRequest(null);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Filter requests
  const filteredRequests = requests?.filter(r => 
    statusFilter === 'all' || r.status === statusFilter
  ) || [];

  // Stats
  const stats = {
    total: requests?.length || 0,
    pending: requests?.filter(r => r.status === 'pending').length || 0,
    inProgress: requests?.filter(r => ['contacted', 'in_progress'].includes(r.status)).length || 0,
    completed: requests?.filter(r => r.status === 'completed').length || 0,
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const updates: Partial<ImplementationRequest> = { status: newStatus as any };
    
    if (newStatus === 'contacted') {
      updates.contacted_at = new Date().toISOString();
    } else if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    updateRequest.mutate({ id, updates });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Solicitudes WhatsApp Business</h1>
            <p className="text-muted-foreground">
              Gestión de solicitudes de implementación
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En progreso</p>
                <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold text-accent-foreground">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Solicitudes</CardTitle>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="in_progress">En progreso</TabsTrigger>
                <TabsTrigger value="completed">Completadas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/40" />
              <p className="mt-3 text-muted-foreground">No hay solicitudes</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={() => setSelectedRequest(request)}>
                      <div>
                        <p className="font-medium">{request.company_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.organization?.name || request.organization_id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => setSelectedRequest(request)}>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm">{request.contact_name}</p>
                          <p className="text-xs text-muted-foreground">{request.contact_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => setSelectedRequest(request)}>
                      <Badge variant="outline">{PLAN_LABELS[request.plan_type]}</Badge>
                    </TableCell>
                    <TableCell onClick={() => setSelectedRequest(request)}>
                      <Badge variant={STATUS_CONFIG[request.status]?.variant || 'secondary'}>
                        <span className="flex items-center gap-1">
                          {STATUS_CONFIG[request.status]?.icon}
                          {STATUS_CONFIG[request.status]?.label}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => setSelectedRequest(request)}>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(request.requested_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedRequest(request)}>
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'contacted')}>
                            Marcar como contactado
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'in_progress')}>
                            En progreso
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'completed')}>
                            Completar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(request.id, 'rejected')}
                            className="text-destructive"
                          >
                            Rechazar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <RequestDetailDialog
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onUpdate={(updates) => {
          if (selectedRequest) {
            updateRequest.mutate({ id: selectedRequest.id, updates });
          }
        }}
        isUpdating={updateRequest.isPending}
      />
    </div>
  );
}

interface RequestDetailDialogProps {
  request: ImplementationRequest | null;
  onClose: () => void;
  onUpdate: (updates: Partial<ImplementationRequest>) => void;
  isUpdating: boolean;
}

function RequestDetailDialog({ request, onClose, onUpdate, isUpdating }: RequestDetailDialogProps) {
  const [adminNotes, setAdminNotes] = useState(request?.admin_notes || '');
  const [quotedPrice, setQuotedPrice] = useState(request?.quoted_price?.toString() || '');
  const [setupFee, setSetupFee] = useState(request?.setup_fee?.toString() || '');
  const [monthlyFee, setMonthlyFee] = useState(request?.monthly_fee?.toString() || '');
  const [status, setStatus] = useState(request?.status || 'pending');

  // Reset form when request changes
  if (request?.id !== (request as any)?._prevId) {
    (request as any)._prevId = request?.id;
  }

  if (!request) return null;

  const handleSave = () => {
    onUpdate({
      admin_notes: adminNotes,
      quoted_price: quotedPrice ? parseFloat(quotedPrice) : null,
      setup_fee: setupFee ? parseFloat(setupFee) : null,
      monthly_fee: monthlyFee ? parseFloat(monthlyFee) : null,
      status: status as any,
      ...(status === 'contacted' && !request.contacted_at ? { contacted_at: new Date().toISOString() } : {}),
      ...(status === 'completed' && !request.completed_at ? { completed_at: new Date().toISOString() } : {}),
    });
  };

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {request.company_name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left column - Request info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Información de contacto</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{request.contact_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${request.contact_email}`} className="text-primary hover:underline">
                    {request.contact_email}
                  </a>
                </div>
                {request.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${request.contact_phone}`} className="text-primary hover:underline">
                      {request.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Detalles de la solicitud</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan solicitado:</span>
                  <Badge variant="outline">{PLAN_LABELS[request.plan_type]}</Badge>
                </div>
                {request.estimated_monthly_messages && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mensajes/mes (est.):</span>
                    <span>{request.estimated_monthly_messages.toLocaleString()}</span>
                  </div>
                )}
                {request.current_whatsapp_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Número actual:</span>
                    <span>{request.current_whatsapp_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha solicitud:</span>
                  <span>{format(new Date(request.requested_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                </div>
              </div>
            </div>

            {request.additional_notes && (
              <div>
                <h3 className="font-semibold mb-2">Notas del cliente</h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {request.additional_notes}
                </p>
              </div>
            )}
          </div>

          {/* Right column - Admin controls */}
          <div className="space-y-4">
            <div>
              <Label>Estado</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as RequestStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="contacted">Contactado</SelectItem>
                  <SelectItem value="in_progress">En progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Precio cotizado</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label>Setup fee</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={setupFee}
                    onChange={(e) => setSetupFee(e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label>Mensual</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Notas de administración</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Notas internas sobre esta solicitud..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
