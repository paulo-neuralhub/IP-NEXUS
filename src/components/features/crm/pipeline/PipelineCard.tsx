/**
 * PipelineCard - Tarjeta visual profesional estilo Odoo/Bitrix
 * Border izquierdo color, badge tipo, valor, avatar, acciones, fechas
 */

import { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Building2,
  Clock,
  Star,
} from 'lucide-react';
import { format, differenceInDays, isPast, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Lead } from '@/hooks/crm/useLeads';
import type { Deal } from '@/hooks/crm/useDeals';

interface PipelineCardProps {
  item: Lead | Deal;
  type: 'leads' | 'deals';
  onClick?: () => void;
  isDragging?: boolean;
}

// Badge de tipo según el servicio
const TYPE_BADGES: Record<string, { label: string; className: string; border: string }> = {
  marca_es: { label: 'MARCA ES', className: 'bg-blue-500 text-white', border: 'border-l-blue-500' },
  marca_eu: { label: 'MARCA EU', className: 'bg-purple-500 text-white', border: 'border-l-purple-500' },
  patente: { label: 'PATENTE', className: 'bg-green-500 text-white', border: 'border-l-green-500' },
  diseno: { label: 'DISEÑO', className: 'bg-orange-500 text-white', border: 'border-l-orange-500' },
  oposicion: { label: 'OPOSICIÓN', className: 'bg-red-500 text-white', border: 'border-l-red-500' },
  vigilancia: { label: 'VIGILANCIA', className: 'bg-slate-500 text-white', border: 'border-l-slate-500' },
  default: { label: 'OTROS', className: 'bg-slate-400 text-white', border: 'border-l-slate-400' },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

function isLead(item: Lead | Deal): item is Lead {
  return 'contact_name' in item;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const PipelineCard = forwardRef<HTMLDivElement, PipelineCardProps>(
  function PipelineCard({ item, type, onClick, isDragging }, forwardedRef) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({
      id: item.id,
      data: { type, item },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

  // Extract data
  const lead = isLead(item) ? item : null;
  const deal = !isLead(item) ? item : null;

  const name = lead?.contact_name || deal?.name || 'Sin nombre';
  const company = lead?.company_name || deal?.client?.name;
  const value = lead?.estimated_value || deal?.amount || 0;
  const phone = lead?.contact_phone || deal?.client?.phone;
  const email = lead?.contact_email || deal?.client?.email;
  const nextAction = lead?.next_action || deal?.next_action;
  const nextActionDate = lead?.next_action_date || deal?.next_action_date;
  const ownerName = 'EF'; // TODO: connect to actual owner initials
  const lastActivity = item.updated_at || item.created_at;
  const rating = 3; // Default rating - connect to actual data when available

  // Get type badge
  const serviceType = lead?.interested_in?.[0] || 'default';
  const typeBadge = TYPE_BADGES[serviceType] || TYPE_BADGES.default;

  // Urgency check
  const isOverdue = nextActionDate && isPast(new Date(nextActionDate));
  const isUrgent = nextActionDate && differenceInDays(new Date(nextActionDate), new Date()) <= 2;

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    onClick?.();
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) window.dispatchEvent(new CustomEvent('ip-nexus:initiate-call', { detail: { number: phone } }));
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (email) window.open(`mailto:${email}`, '_blank');
  };

  // Merge refs for forwardRef + dnd-kit
  const mergedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  return (
    <div
      ref={mergedRef}
      style={style}
      onClick={handleClick}
      className={cn(
        'w-full rounded-xl overflow-hidden transition-all duration-200 cursor-grab',
        'bg-card border shadow-sm',
        'hover:shadow-lg hover:scale-[1.02]',
        isDragging && 'opacity-70 shadow-2xl ring-2 ring-primary rotate-1 cursor-grabbing',
        isOverdue && 'border-destructive/50'
      )}
      {...attributes}
      {...listeners}
    >
      {/* Left border color based on type */}
      <div className={cn('border-l-4', typeBadge.border)}>
        <div className="p-4">
          {/* Row 1: Badge tipo + Valor */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <Badge className={cn('text-[10px] font-bold px-2 py-0.5', typeBadge.className)}>
              {typeBadge.label}
            </Badge>
            <span className="text-base font-bold text-green-600 dark:text-green-400">
              {formatCurrency(value)}
            </span>
          </div>

          {/* Row 2: Title + Company */}
          <div className="mb-3">
            <h4 className="font-semibold text-foreground line-clamp-2 leading-tight">
              {company || name}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Building2 className="w-3 h-3" />
              <span className="truncate">{company ? name : 'Sin empresa'}</span>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-border mb-3" />

          {/* Row 3: Rating + Tags */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5",
                    i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <div className="flex gap-1">
              {lead?.interested_in?.slice(0, 2).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-[9px] px-1.5 py-0">
                  {tag.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Row 4: Dates */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 bg-muted/50 rounded-lg p-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {nextActionDate 
                  ? format(new Date(nextActionDate), 'd MMM', { locale: es })
                  : 'Sin fecha'
                }
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {lastActivity 
                  ? formatDistanceToNow(new Date(lastActivity), { locale: es, addSuffix: false })
                  : '—'
                }
              </span>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-border mb-3" />

          {/* Row 5: Avatar + Actions */}
          <div className="flex items-center justify-between">
            {/* Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {ownerName}
              </div>
              <span className="text-xs text-muted-foreground">Elena Fernández</span>
            </div>

            {/* Actions */}
            <TooltipProvider>
              <div className="flex items-center gap-1">
                {phone && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                        onClick={handleCall}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Llamar</TooltipContent>
                  </Tooltip>
                )}
                {phone && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg bg-muted text-muted-foreground hover:bg-green-500 hover:text-white"
                        onClick={handleWhatsApp}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>WhatsApp</TooltipContent>
                  </Tooltip>
                )}
                {email && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg bg-muted text-muted-foreground hover:bg-purple-500 hover:text-white"
                        onClick={handleEmail}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Email</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          </div>

          {/* Pending task (if exists) */}
          {nextAction && (
            <div className={cn(
              'mt-3 p-2 rounded-lg text-xs',
              isOverdue 
                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                : isUrgent
                  ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900'
                  : 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
            )}>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  isOverdue ? 'bg-destructive' : isUrgent ? 'bg-orange-500' : 'bg-blue-500'
                )} />
                <span className="font-medium truncate">{nextAction}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

PipelineCard.displayName = 'PipelineCard';
