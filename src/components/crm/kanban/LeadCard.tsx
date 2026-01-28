/**
 * LeadCard - Card para lead en el Kanban CRM
 * Diseño mejorado con texto completo y mejor alineación
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '@/hooks/crm/useLeads';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  CheckCircle,
  Trash2,
  MoreVertical,
  Building2,
  Calendar,
  GripVertical,
  Globe,
  UserPlus,
  Linkedin,
  PhoneCall,
  CalendarDays,
  Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  onCall?: () => void;
  onEmail?: () => void;
  onApprove?: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
}

const SOURCE_CONFIG: Record<string, { label: string; icon: typeof Globe }> = {
  web: { label: 'Web', icon: Globe },
  referral: { label: 'Referido', icon: Users },
  linkedin: { label: 'LinkedIn', icon: Linkedin },
  cold_call: { label: 'Llamada', icon: PhoneCall },
  event: { label: 'Evento', icon: CalendarDays },
  partner: { label: 'Partner', icon: UserPlus },
  other: { label: 'Otro', icon: Globe },
};

export function LeadCard({
  lead,
  onCall,
  onEmail,
  onApprove,
  onDelete,
  isDragging,
}: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: lead.id,
    data: {
      type: 'lead',
      lead,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const initials = lead.contact_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sourceConfig = SOURCE_CONFIG[lead.source || 'other'] || SOURCE_CONFIG.other;
  const SourceIcon = sourceConfig.icon;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'w-full p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary'
      )}
    >
      {/* Header: Avatar + Nombre + Empresa */}
      <div className="flex items-start gap-3 mb-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-1"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* Nombre completo - sin truncar */}
          <p className="font-semibold text-sm leading-tight">{lead.contact_name}</p>
          
          {/* Empresa */}
          {lead.company_name && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="line-clamp-1">{lead.company_name}</span>
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
            {onCall && lead.contact_phone && (
              <DropdownMenuItem onClick={onCall}>
                <Phone className="w-4 h-4 mr-2" />
                Llamar
              </DropdownMenuItem>
            )}
            {onEmail && lead.contact_email && (
              <DropdownMenuItem onClick={onEmail}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onApprove && (
              <DropdownMenuItem onClick={onApprove} className="text-[hsl(var(--ip-success-text))]">
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprobar → Deal
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Valor estimado - destacado */}
      {lead.estimated_value && lead.estimated_value > 0 && (
        <div className="mb-3">
          <span className="text-lg font-bold text-primary">
            💰 {lead.estimated_value.toLocaleString('es-ES')} €
          </span>
        </div>
      )}

      {/* Tags de interés - con wrap */}
      {lead.interested_in && lead.interested_in.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {lead.interested_in.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Origen + Fecha */}
      <div className="flex items-center justify-between text-xs text-muted-foreground py-2 border-t">
        <span className="flex items-center gap-1">
          <SourceIcon className="w-3 h-3" />
          {sourceConfig.label}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es })}
        </span>
      </div>

      {/* Stand-by indicator */}
      {lead.status === 'standby' && lead.standby_until && (
        <div className="p-2 bg-[hsl(var(--ip-pending-bg))] rounded text-xs">
          <p className="text-[hsl(var(--ip-pending-text))] font-medium">
            📅 Reactivar: {new Date(lead.standby_until).toLocaleDateString('es-ES')}
          </p>
          {lead.standby_reason && (
            <p className="text-muted-foreground mt-0.5 line-clamp-2">{lead.standby_reason}</p>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-1 mt-2 pt-2 border-t">
        {onCall && lead.contact_phone && (
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={onCall}>
            <Phone className="w-3 h-3 mr-1" />
            Llamar
          </Button>
        )}
        {onEmail && lead.contact_email && (
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={onEmail}>
            <Mail className="w-3 h-3 mr-1" />
            Email
          </Button>
        )}
        {onApprove && (
          <Button
            variant="default"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={onApprove}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobar
          </Button>
        )}
      </div>
    </Card>
  );
}
