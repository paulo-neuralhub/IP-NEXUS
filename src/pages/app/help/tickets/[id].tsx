// ============================================================
// IP-NEXUS APP - TICKET DETAIL PAGE
// ============================================================

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Clock, CheckCircle2, AlertCircle, MessageSquare, User, Bot, FileQuestion } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { useSupportTicket, useAddTicketMessage, useSubmitTicketSatisfaction } from '@/hooks/help';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

const statusConfig = {
  open: { label: 'Abierto', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: Clock },
  in_progress: { label: 'En Progreso', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', icon: MessageSquare },
  waiting_customer: { label: 'Esperando Respuesta', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', icon: AlertCircle },
  waiting_internal: { label: 'En Revisión', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: Clock },
  resolved: { label: 'Resuelto', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
  closed: { label: 'Cerrado', color: 'bg-muted text-muted-foreground', icon: CheckCircle2 },
};

const priorityConfig = {
  low: { label: 'Baja', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [newMessage, setNewMessage] = useState('');

  const { data: ticket, isLoading } = useSupportTicket(id || '');
  const addMessage = useAddTicketMessage();
  const submitSatisfaction = useSubmitTicketSatisfaction();

  const handleSendMessage = () => {
    if (!newMessage.trim() || !ticket) return;

    addMessage.mutate(
      { ticketId: ticket.id, message: newMessage },
      {
        onSuccess: () => {
          setNewMessage('');
          toast({ title: 'Mensaje enviado' });
        },
      }
    );
  };

  const handleSatisfaction = (rating: number) => {
    if (!ticket) return;

    submitSatisfaction.mutate(
      { ticketId: ticket.id, rating },
      {
        onSuccess: () => {
          toast({
            title: '¡Gracias por tu feedback!',
            description: 'Tu opinión nos ayuda a mejorar.',
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Link to="/app/help/tickets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Tickets
          </Button>
        </Link>
        <EmptyState
          icon={<FileQuestion className="h-12 w-12" />}
          title="Ticket no encontrado"
          description="El ticket que buscas no existe o no tienes acceso."
        />
      </div>
    );
  }

  const status = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
  const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.normal;
  const StatusIcon = status.icon;
  const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to="/app/help/tickets">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Mis Tickets
        </Button>
      </Link>

      {/* Ticket Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  #{ticket.ticket_number}
                </Badge>
                <Badge className={cn('gap-1', status.color)} variant="secondary">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
                <Badge className={priority.color} variant="secondary">
                  {priority.label}
                </Badge>
              </div>
              <CardTitle className="text-xl">{ticket.subject}</CardTitle>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Creado el{' '}
            {format(new Date(ticket.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", {
              locale: es,
            })}
          </p>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conversación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Initial Message */}
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Tú</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(ticket.created_at), 'HH:mm')}
                </span>
              </div>
              <div className="bg-muted p-3 rounded-lg text-sm">
                {ticket.description}
              </div>
            </div>
          </div>

          {/* Thread Messages */}
          {ticket.messages?.map((msg) => {
            const isAgent = msg.author_type === 'agent';
            return (
              <div key={msg.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={isAgent ? 'bg-primary text-primary-foreground' : ''}>
                    {isAgent ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {isAgent ? 'Soporte IP-NEXUS' : 'Tú'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'p-3 rounded-lg text-sm',
                      isAgent ? 'bg-primary/10' : 'bg-muted'
                    )}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Reply Form */}
          {!isResolved && (
            <div className="pt-4 border-t space-y-3">
              <Textarea
                placeholder="Escribe tu respuesta..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || addMessage.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                </Button>
              </div>
            </div>
          )}

          {/* Satisfaction Survey */}
          {isResolved && !ticket.satisfaction_rating && (
            <div className="pt-4 border-t">
              <div className="text-center space-y-3">
                <p className="font-medium">¿Cómo calificarías la atención recibida?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant="outline"
                      size="lg"
                      onClick={() => handleSatisfaction(rating)}
                      disabled={submitSatisfaction.isPending}
                    >
                      {rating === 1 && '😞'}
                      {rating === 2 && '😕'}
                      {rating === 3 && '😐'}
                      {rating === 4 && '😊'}
                      {rating === 5 && '😍'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {ticket.satisfaction_rating && (
            <div className="pt-4 border-t text-center text-sm text-muted-foreground">
              Calificaste este ticket con {ticket.satisfaction_rating}/5 ⭐
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
