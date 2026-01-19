// ============================================================
// IP-NEXUS BACKOFFICE - TICKET DETAIL
// ============================================================

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  User, 
  Clock, 
  Tag,
  AlertCircle,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupportTicket, useAddAgentMessage, useUpdateSupportTicket } from '@/hooks/help/useSupportTickets';
import { SupportTicket } from '@/types/help';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const statusConfig: Record<SupportTicket['status'], { label: string; color: string; icon: any }> = {
  open: { label: 'Abierto', color: 'bg-blue-500', icon: AlertCircle },
  in_progress: { label: 'En Proceso', color: 'bg-yellow-500', icon: Clock },
  waiting_customer: { label: 'Esperando Cliente', color: 'bg-purple-500', icon: MessageSquare },
  waiting_internal: { label: 'Esperando Interno', color: 'bg-orange-500', icon: Clock },
  resolved: { label: 'Resuelto', color: 'bg-green-500', icon: CheckCircle2 },
  closed: { label: 'Cerrado', color: 'bg-muted', icon: CheckCircle2 },
};

export default function BackofficeTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const { data: ticket, isLoading: ticketLoading } = useSupportTicket(id!);
  const addMessage = useAddAgentMessage();
  const updateTicket = useUpdateSupportTicket();

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticket) return;

    try {
      await addMessage.mutateAsync({
        ticketId: ticket.id,
        message: newMessage,
        isInternal,
      });
      setNewMessage('');
      
      // Update status to waiting_customer if was open
      if (ticket.status === 'open') {
        await updateTicket.mutateAsync({
          id: ticket.id,
          status: 'waiting_customer',
        });
      }
      
      toast.success('Mensaje enviado');
    } catch (error) {
      toast.error('Error al enviar el mensaje');
    }
  };

  const handleStatusChange = async (newStatus: SupportTicket['status']) => {
    if (!ticket) return;
    
    try {
      await updateTicket.mutateAsync({
        id: ticket.id,
        status: newStatus,
        resolved_at: newStatus === 'resolved' ? new Date().toISOString() : undefined,
      });
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const handlePriorityChange = async (newPriority: SupportTicket['priority']) => {
    if (!ticket) return;
    
    try {
      await updateTicket.mutateAsync({
        id: ticket.id,
        priority: newPriority,
      });
      toast.success('Prioridad actualizada');
    } catch (error) {
      toast.error('Error al actualizar la prioridad');
    }
  };

  if (ticketLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ticket no encontrado</p>
        <Button variant="link" onClick={() => navigate('/backoffice/help/tickets')}>
          Volver a tickets
        </Button>
      </div>
    );
  }

  const StatusIcon = statusConfig[ticket.status]?.icon || AlertCircle;
  const messages = ticket.messages || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/backoffice/help/tickets')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-muted-foreground">#{ticket.ticket_number}</span>
            <Badge className={statusConfig[ticket.status]?.color}>
              {statusConfig[ticket.status]?.label}
            </Badge>
          </div>
          <h1 className="text-xl font-semibold text-foreground mt-1">
            {ticket.subject}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Original message */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Usuario</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ticket.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {/* Messages */}
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`p-4 rounded-lg border ${
                    msg.is_internal 
                      ? 'bg-yellow-500/10 border-yellow-500/30' 
                      : msg.author_type === 'agent'
                        ? 'bg-primary/5 border-primary/20 ml-8'
                        : 'bg-muted/50 border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      msg.author_type === 'agent' ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <User className={`h-4 w-4 ${msg.author_type === 'agent' ? 'text-primary' : 'text-foreground'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {msg.author_type === 'agent' ? 'Soporte' : msg.author_type === 'system' ? 'Sistema' : 'Usuario'}
                        </p>
                        {msg.is_internal && (
                          <Badge variant="outline" className="text-xs">Interno</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(msg.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}

              <Separator />

              {/* Reply form */}
              <div className="space-y-3">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  rows={4}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-muted-foreground">Nota interna (no visible para el usuario)</span>
                  </label>
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim() || addMessage.isPending}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={ticket.status} onValueChange={handleStatusChange}>
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
            </CardContent>
          </Card>

          {/* Priority */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Prioridad</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={ticket.priority} onValueChange={handlePriorityChange}>
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
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoría</span>
                <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creado</span>
                <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: es })}</span>
              </div>
              {ticket.resolved_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resuelto</span>
                  <span>{formatDistanceToNow(new Date(ticket.resolved_at), { addSuffix: true, locale: es })}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
