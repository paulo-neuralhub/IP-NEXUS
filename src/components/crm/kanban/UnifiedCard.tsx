/**
 * UnifiedCard - Card unificada para Lead/Deal en Kanban CRM
 * Diseño consistente con diferencias visuales según tipo
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  Building2,
  Clock,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Lead } from '@/hooks/crm/useLeads';
import type { Deal } from '@/hooks/crm/useDeals';

type CardItem = {
  type: 'lead' | 'deal';
  data: Lead | Deal;
};

interface UnifiedCardProps {
  item: CardItem;
  onClick?: () => void;
  onCall?: () => void;
  onEmail?: () => void;
  onWhatsApp?: () => void;
  onApprove?: () => void;
  onWin?: () => void;
  onLose?: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
}

export function UnifiedCard({
  item,
  onClick,
  onCall,
  onEmail,
  onWhatsApp,
  onApprove,
  onWin,
  onLose,
  onDelete,
  isDragging,
}: UnifiedCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: item.data.id,
    data: {
      type: item.type,
      [item.type]: item.data,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isLead = item.type === 'lead';
  const lead = isLead ? (item.data as Lead) : null;
  const deal = !isLead ? (item.data as Deal) : null;

  // Common data extraction
  const name = isLead ? lead!.contact_name : deal!.client?.name || deal!.name;
  const company = isLead ? lead!.company_name : deal!.client?.name;
  const clientNumber = deal?.client?.client_number;
  const value = isLead ? lead!.estimated_value : deal!.amount;
  const probability = deal?.probability;
  const nextAction = isLead ? lead!.next_action : deal!.next_action;
  const nextActionDate = isLead ? lead!.next_action_date : deal!.next_action_date;
  const phone = isLead ? lead!.contact_phone : deal!.client?.phone;
  const email = isLead ? lead!.contact_email : deal!.client?.email;
  const tags = isLead ? lead!.interested_in : [];

  // Initials
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '??';

  // Urgency check
  const isUrgent = nextActionDate && differenceInDays(new Date(nextActionDate), new Date()) <= 2;
  const isOverdue = nextActionDate && isPast(new Date(nextActionDate));

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger click when dragging or clicking buttons/dropdown
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menuitem"]')) return;
    onClick?.();
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onClick={handleCardClick}
      className={cn(
        'w-full p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary',
        isOverdue && 'border-destructive/50 bg-destructive/5',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-1"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        
        <Avatar className={cn(
          "h-10 w-10 shrink-0",
          isLead ? "bg-primary/10" : "bg-[hsl(var(--ip-success-bg))]"
        )}>
          <AvatarFallback className={cn(
            "text-sm font-medium",
            isLead ? "text-primary" : "text-[hsl(var(--ip-success-text))]"
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">{name}</p>
          
          {company && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="line-clamp-1">{company}</span>
            </p>
          )}
          
          {/* Client number only for deals */}
          {clientNumber && (
            <p className="text-xs text-primary font-mono mt-0.5">
              {clientNumber}
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
            {onCall && phone && (
              <DropdownMenuItem onClick={onCall}>
                <Phone className="w-4 h-4 mr-2" />
                Llamar
              </DropdownMenuItem>
            )}
            {onEmail && email && (
              <DropdownMenuItem onClick={onEmail}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </DropdownMenuItem>
            )}
            {onWhatsApp && phone && (
              <DropdownMenuItem onClick={onWhatsApp}>
                <MessageSquare className="w-4 h-4 mr-2 text-[#25D366]" />
                WhatsApp
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {isLead && onApprove && (
              <DropdownMenuItem onClick={onApprove} className="text-[hsl(var(--ip-success-text))]">
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprobar → Deal
              </DropdownMenuItem>
            )}
            {!isLead && onWin && (
              <DropdownMenuItem onClick={onWin} className="text-[hsl(var(--ip-success-text))]">
                <Trophy className="w-4 h-4 mr-2" />
                Marcar Ganado
              </DropdownMenuItem>
            )}
            {!isLead && onLose && (
              <DropdownMenuItem onClick={onLose} className="text-destructive">
                <XCircle className="w-4 h-4 mr-2" />
                Marcar Perdido
              </DropdownMenuItem>
            )}
            {isLead && onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Value + Probability (deals only) */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            💰 {(value || 0).toLocaleString('es-ES')} €
          </span>
          {!isLead && probability !== undefined && (
            <Badge variant="outline" className="text-xs">
              {probability}%
            </Badge>
          )}
        </div>
        {/* Progress bar only for deals */}
        {!isLead && probability !== undefined && (
          <Progress value={probability} className="h-1.5" />
        )}
      </div>

      {/* Tags (leads only) */}
      {isLead && tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Next action */}
      {nextAction && (
        <div className={cn(
          'p-2 rounded text-xs mb-3',
          isOverdue 
            ? 'bg-destructive/10 text-destructive' 
            : isUrgent 
              ? 'bg-[hsl(var(--ip-pending-bg))] text-[hsl(var(--ip-pending-text))]'
              : 'bg-muted'
        )}>
          <p className="font-medium">📋 {nextAction}</p>
          {nextActionDate && (
            <p className="flex items-center gap-1 mt-1 opacity-80">
              <Clock className="w-3 h-3" />
              {format(new Date(nextActionDate), "EEEE d MMM", { locale: es })}
            </p>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-1 pt-2 border-t">
        {onCall && phone && (
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs px-1" onClick={onCall}>
            <Phone className="w-3 h-3" />
          </Button>
        )}
        {onWhatsApp && phone && (
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs px-1" onClick={onWhatsApp}>
            <MessageSquare className="w-3 h-3 text-[#25D366]" />
          </Button>
        )}
        {onEmail && email && (
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs px-1" onClick={onEmail}>
            <Mail className="w-3 h-3" />
          </Button>
        )}
        {isLead && onApprove && (
          <Button
            variant="default"
            size="sm"
            className="flex-1 h-8 text-xs px-2"
            onClick={onApprove}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobar
          </Button>
        )}
        {!isLead && onWin && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs px-1 text-[hsl(var(--ip-success-text))] hover:bg-[hsl(var(--ip-success-bg))]"
            onClick={onWin}
          >
            <Trophy className="w-3 h-3" />
          </Button>
        )}
        {!isLead && onLose && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs px-1 text-destructive hover:bg-destructive/10"
            onClick={onLose}
          >
            <XCircle className="w-3 h-3" />
          </Button>
        )}
      </div>
    </Card>
  );
}
