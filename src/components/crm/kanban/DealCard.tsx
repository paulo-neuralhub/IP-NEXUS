/**
 * DealCard - Card para deal en el Kanban CRM
 * Diseño mejorado con texto completo y mejor alineación
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '@/hooks/crm/useDeals';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Clock,
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

  // Iniciales del cliente
  const clientInitials = deal.client?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'CL';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'w-full p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary',
        isOverdue && 'border-destructive/50 bg-destructive/5'
      )}
    >
      {/* Header: Nombre + Cliente */}
      <div className="flex items-start gap-3 mb-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-1"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="text-sm font-medium bg-[hsl(var(--ip-success-bg))] text-[hsl(var(--ip-success-text))]">
            {clientInitials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* Nombre del deal */}
          <div className="flex items-start gap-2">
            <p className="font-semibold text-sm leading-tight flex-1">{deal.name}</p>
            {isUrgent && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0">
                {isOverdue ? '⚠️ Vencido' : '⏰ Urgente'}
              </Badge>
            )}
          </div>
          
          {/* Cliente */}
          {deal.client && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="line-clamp-1">{deal.client.name}</span>
              {deal.client.client_number && (
                <span className="text-primary">({deal.client.client_number})</span>
              )}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 -mt-1 -mr-1">
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

      {/* Valor + Probabilidad - destacados */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            💰 {(deal.amount || 0).toLocaleString('es-ES')} €
          </span>
          <Badge variant="outline" className="text-xs">
            {deal.probability}% prob.
          </Badge>
        </div>
        <Progress value={deal.probability} className="h-1.5" />
      </div>

      {/* Próxima acción */}
      {deal.next_action && (
        <div className={cn(
          'p-2 rounded text-xs mb-3',
          isOverdue 
            ? 'bg-destructive/10 text-destructive' 
            : isUrgent 
              ? 'bg-[hsl(var(--ip-pending-bg))] text-[hsl(var(--ip-pending-text))]'
              : 'bg-muted'
        )}>
          <p className="font-medium">📋 {deal.next_action}</p>
          {deal.next_action_date && (
            <p className="flex items-center gap-1 mt-1 opacity-80">
              <Clock className="w-3 h-3" />
              {format(new Date(deal.next_action_date), "EEEE d MMM", { locale: es })}
            </p>
          )}
        </div>
      )}

      {/* Deal number + Fecha cierre */}
      <div className="flex items-center justify-between text-xs text-muted-foreground py-2 border-t">
        <span className="font-mono">{deal.deal_number}</span>
        {deal.expected_close_date && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Cierre: {format(new Date(deal.expected_close_date), "MMM yyyy", { locale: es })}
          </span>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-1 mt-2 pt-2 border-t">
        {onCall && deal.client?.phone && (
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs px-2" onClick={onCall}>
            <Phone className="w-3 h-3" />
          </Button>
        )}
        {onWhatsApp && deal.client?.phone && (
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs px-2" onClick={onWhatsApp}>
            <MessageSquare className="w-3 h-3 text-[hsl(var(--ip-action-whatsapp-text))]" />
          </Button>
        )}
        {onEmail && deal.client?.email && (
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs px-2" onClick={onEmail}>
            <Mail className="w-3 h-3" />
          </Button>
        )}
        {onWin && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs px-2 text-[hsl(var(--ip-success-text))] hover:bg-[hsl(var(--ip-success-bg))]"
            onClick={onWin}
          >
            <Trophy className="w-3 h-3" />
          </Button>
        )}
        {onLose && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs px-2 text-destructive hover:bg-destructive/10"
            onClick={onLose}
          >
            <XCircle className="w-3 h-3" />
          </Button>
        )}
      </div>
    </Card>
  );
}
