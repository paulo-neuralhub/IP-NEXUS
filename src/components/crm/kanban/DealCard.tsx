/**
 * DealCard - Card para deal en el Kanban CRM
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '@/hooks/crm/useDeals';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Phone,
  Mail,
  MessageSquare,
  Trophy,
  XCircle,
  MoreVertical,
  Calendar,
  GripVertical,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DealCardProps {
  deal: Deal;
  onCall?: () => void;
  onEmail?: () => void;
  onWhatsApp?: () => void;
  onWin?: () => void;
  onLose?: () => void;
  isDragging?: boolean;
}

export function DealCard({
  deal,
  onCall,
  onEmail,
  onWhatsApp,
  onWin,
  onLose,
  isDragging,
}: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: deal.id,
    data: {
      type: 'deal',
      deal,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Determinar si es urgente (próxima acción vencida o por vencer en 2 días)
  const isUrgent = deal.next_action_date && differenceInDays(new Date(deal.next_action_date), new Date()) <= 2;
  const isOverdue = deal.next_action_date && isPast(new Date(deal.next_action_date));

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary',
        isOverdue && 'border-destructive/50 bg-destructive/5'
      )}
    >
      {/* Header con drag handle y menú */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground mt-0.5"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate flex-1">{deal.name}</p>
              {isUrgent && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0 shrink-0">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {isOverdue ? 'Vencido' : 'Urgente'}
                </Badge>
              )}
            </div>
            {deal.client && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 shrink-0" />
                {deal.client.name}
                <span className="text-primary">({deal.client.client_number})</span>
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onCall && deal.client?.phone && (
              <DropdownMenuItem onClick={onCall}>
                <Phone className="w-4 h-4 mr-2" />
                Llamar
              </DropdownMenuItem>
            )}
            {onEmail && deal.client?.email && (
              <DropdownMenuItem onClick={onEmail}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </DropdownMenuItem>
            )}
            {onWhatsApp && deal.client?.phone && (
              <DropdownMenuItem onClick={onWhatsApp}>
                <MessageSquare className="w-4 h-4 mr-2 text-[hsl(var(--ip-action-whatsapp-text))]" />
                WhatsApp
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onWin && (
              <DropdownMenuItem onClick={onWin} className="text-[hsl(var(--ip-success-text))]">
                <Trophy className="w-4 h-4 mr-2" />
                Marcar como Ganado
              </DropdownMenuItem>
            )}
            {onLose && (
              <DropdownMenuItem onClick={onLose} className="text-destructive">
                <XCircle className="w-4 h-4 mr-2" />
                Marcar como Perdido
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Valor + Probabilidad */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-primary">
            {(deal.amount || 0).toLocaleString('es-ES')} €
          </span>
          <span className="text-xs text-muted-foreground">{deal.probability}%</span>
        </div>
        <Progress value={deal.probability} className="h-1.5" />
      </div>

      {/* Próxima acción */}
      {deal.next_action && (
        <div className={cn(
          'p-2 rounded text-xs mb-2',
          isOverdue 
            ? 'bg-destructive/10 text-destructive' 
            : isUrgent 
              ? 'bg-[hsl(var(--ip-pending-bg))] text-[hsl(var(--ip-pending-text))]'
              : 'bg-muted'
        )}>
          <p className="font-medium">{deal.next_action}</p>
          {deal.next_action_date && (
            <p className="flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              {format(new Date(deal.next_action_date), "d MMM yyyy", { locale: es })}
            </p>
          )}
        </div>
      )}

      {/* Deal number */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
        <span className="font-mono">{deal.deal_number}</span>
        {deal.expected_close_date && (
          <span>Cierre: {format(new Date(deal.expected_close_date), "MMM yyyy", { locale: es })}</span>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-1 mt-2 pt-2 border-t">
        {onCall && deal.client?.phone && (
          <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs" onClick={onCall}>
            <Phone className="w-3 h-3" />
          </Button>
        )}
        {onWhatsApp && deal.client?.phone && (
          <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs" onClick={onWhatsApp}>
            <MessageSquare className="w-3 h-3 text-[hsl(var(--ip-action-whatsapp-text))]" />
          </Button>
        )}
        {onEmail && deal.client?.email && (
          <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs" onClick={onEmail}>
            <Mail className="w-3 h-3" />
          </Button>
        )}
        {onWin && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-7 text-xs text-[hsl(var(--ip-success-text))]"
            onClick={onWin}
          >
            <Trophy className="w-3 h-3" />
          </Button>
        )}
        {onLose && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-7 text-xs text-destructive"
            onClick={onLose}
          >
            <XCircle className="w-3 h-3" />
          </Button>
        )}
      </div>
    </Card>
  );
}
