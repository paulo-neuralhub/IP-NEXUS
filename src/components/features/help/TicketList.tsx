// ============================================================
// IP-NEXUS HELP - TICKET LIST COMPONENT
// ============================================================

import { Link } from 'react-router-dom';
import { useSupportTickets } from '@/hooks/help';
import { SupportTicket } from '@/types/help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Plus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const statusConfig: Record<SupportTicket['status'], { label: string; color: string; icon: typeof Clock }> = {
  open: { label: 'Abierto', color: 'bg-blue-500', icon: Clock },
  in_progress: { label: 'En progreso', color: 'bg-yellow-500', icon: Clock },
  waiting_customer: { label: 'Esperando respuesta', color: 'bg-orange-500', icon: MessageSquare },
  waiting_internal: { label: 'En revisión', color: 'bg-purple-500', icon: Clock },
  resolved: { label: 'Resuelto', color: 'bg-green-500', icon: CheckCircle },
  closed: { label: 'Cerrado', color: 'bg-muted', icon: CheckCircle },
};

const priorityConfig: Record<SupportTicket['priority'], { label: string; color: string }> = {
  low: { label: 'Baja', color: 'text-muted-foreground' },
  normal: { label: 'Normal', color: 'text-foreground' },
  high: { label: 'Alta', color: 'text-orange-500' },
  urgent: { label: 'Urgente', color: 'text-red-500' },
};

interface TicketListProps {
  basePath?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

export function TicketList({ 
  basePath = '/app/help',
  showCreateButton = true,
  onCreateClick
}: TicketListProps) {
  const { data: tickets, isLoading } = useSupportTickets();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium text-foreground mb-2">
          No tienes tickets abiertos
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          Crea un ticket si necesitas ayuda con algo.
        </p>
        {showCreateButton && (
          <Button onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Crear ticket
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => {
        const status = statusConfig[ticket.status];
        const priority = priorityConfig[ticket.priority];
        const StatusIcon = status.icon;

        return (
          <Link
            key={ticket.id}
            to={`${basePath}/ticket/${ticket.id}`}
            className="block"
          >
            <div className={cn(
              "p-4 rounded-lg border border-border bg-card",
              "hover:border-primary/50 hover:shadow-sm transition-all"
            )}>
              <div className="flex items-start gap-4">
                <div className={cn("p-2 rounded-lg", status.color + '/20')}>
                  <StatusIcon className={cn("h-5 w-5", status.color.replace('bg-', 'text-'))} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      #{ticket.ticket_number}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", priority.color)}
                    >
                      {priority.label}
                    </Badge>
                  </div>

                  <h4 className="font-medium text-foreground truncate">
                    {ticket.subject}
                  </h4>

                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(ticket.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {status.label}
                    </Badge>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
