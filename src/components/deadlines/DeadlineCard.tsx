// ============================================================
// IP-NEXUS - DEADLINE CARD COMPONENT
// Individual deadline display with actions
// ============================================================

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, format, differenceInDays, isPast, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { MatterDeadline } from '@/hooks/useDeadlines';

interface DeadlineCardProps {
  deadline: MatterDeadline;
  onComplete?: (id: string) => void;
  onExtend?: (id: string) => void;
  variant?: 'default' | 'compact';
}

export function DeadlineCard({ deadline, onComplete, onExtend, variant = 'default' }: DeadlineCardProps) {
  const dueDate = new Date(deadline.deadline_date);
  const daysUntil = differenceInDays(dueDate, new Date());
  const isOverdue = isPast(dueDate) && !isToday(dueDate);
  const isDueToday = isToday(dueDate);

  const getStatusConfig = () => {
    if (isOverdue || deadline.status === 'overdue') {
      return {
        icon: '🔴',
        color: 'border-l-destructive',
        badge: 'destructive' as const,
        badgeText: `Hace ${formatDistanceToNow(dueDate, { locale: es })}`,
      };
    }
    if (isDueToday) {
      return {
        icon: '🟠',
        color: 'border-l-orange-500',
        badge: 'default' as const,
        badgeText: 'Hoy',
      };
    }
    if (daysUntil <= 7) {
      return {
        icon: '🟡',
        color: 'border-l-yellow-500',
        badge: 'secondary' as const,
        badgeText: `En ${daysUntil} días`,
      };
    }
    return {
      icon: '🟢',
      color: 'border-l-green-500',
      badge: 'outline' as const,
      badgeText: `En ${daysUntil} días`,
    };
  };

  const getPriorityBadge = () => {
    switch (deadline.priority) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">CRÍTICO</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 text-xs">ALTA</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">MEDIA</Badge>;
      default:
        return null;
    }
  };

  const config = getStatusConfig();

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 border-l-4 rounded-lg bg-card hover:bg-accent/50 transition-colors",
        config.color
      )}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-lg">{config.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{deadline.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {deadline.matter?.reference} - {deadline.matter?.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={config.badge}>{config.badgeText}</Badge>
          <Link to={`/app/docket/${deadline.matter_id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("border-l-4 hover:shadow-md transition-shadow", config.color)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h3 className="font-semibold text-lg">{deadline.title}</h3>
              <p className="text-sm text-muted-foreground">
                {deadline.matter?.client?.name || 'Sin cliente'} - {deadline.matter?.reference}
              </p>
            </div>
          </div>
          {getPriorityBadge()}
        </div>

        {/* Details */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Vencimiento: {format(dueDate, 'dd/MM/yyyy', { locale: es })}</span>
            <Badge variant={config.badge} className="ml-1">{config.badgeText}</Badge>
          </div>
          
          {deadline.matter?.jurisdiction && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Jurisdicción: {deadline.matter.jurisdiction}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Expediente: {deadline.matter?.title}</span>
          </div>
        </div>

        {/* Extended info */}
        {(deadline.extension_count || 0) > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-3 py-2 rounded-md">
            <RefreshCw className="h-4 w-4" />
            <span>Plazo extendido {deadline.extension_count}x {deadline.original_deadline ? `desde ${format(new Date(deadline.original_deadline), 'dd/MM/yyyy')}` : ''}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <Link to={`/app/docket/${deadline.matter_id}`}>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Ver expediente
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            {onExtend && deadline.status !== 'completed' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onExtend(deadline.id)}
              >
                <Clock className="h-4 w-4 mr-2" />
                Extender plazo
              </Button>
            )}
            
            {onComplete && deadline.status !== 'completed' && (
              <Button 
                size="sm"
                onClick={() => onComplete(deadline.id)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar completado
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini version for widgets
export function DeadlineCardMini({ deadline }: { deadline: MatterDeadline }) {
  const dueDate = new Date(deadline.deadline_date);
  const isOverdue = isPast(dueDate) && !isToday(dueDate);
  const isDueToday = isToday(dueDate);

  const icon = isOverdue ? '🔴' : isDueToday ? '🟠' : '🟢';

  return (
    <Link 
      to={`/app/docket/${deadline.matter_id}`}
      className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span>{icon}</span>
        <span className="truncate text-sm">{deadline.title}</span>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
        {isOverdue 
          ? `Hace ${formatDistanceToNow(dueDate, { locale: es })}` 
          : isDueToday 
            ? 'Hoy' 
            : format(dueDate, 'dd/MM', { locale: es })
        }
      </span>
    </Link>
  );
}
