// ============================================================
// IP-NEXUS - DEADLINE ITEM COMPONENT
// L125: Individual deadline item with visual urgency indicators
// ============================================================

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Clock,
  CheckCircle2,
  CalendarPlus,
  Eye,
  MoreHorizontal,
  Bell,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { MatterDeadline } from '@/hooks/useDeadlines';

// Matter type configuration
const TIPO_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  trademark: { icon: '®️', label: 'Marca', color: 'text-blue-600' },
  patent: { icon: '⚙️', label: 'Patente', color: 'text-purple-600' },
  design: { icon: '✏️', label: 'Diseño', color: 'text-pink-600' },
  utility_model: { icon: '🔧', label: 'Modelo U.', color: 'text-amber-600' },
  copyright: { icon: '©️', label: 'Copyright', color: 'text-green-600' },
};

export interface UrgencyInfo {
  status: string;
  label: string;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'slate';
  priority: number;
}

export interface DeadlineItemProps {
  deadline: MatterDeadline;
  urgency: UrgencyInfo;
  onComplete: () => void;
  onPostpone: (days: number) => void;
  onView: () => void;
}

export function DeadlineItem({
  deadline,
  urgency,
  onComplete,
  onPostpone,
  onView,
}: DeadlineItemProps) {
  const tipo = TIPO_CONFIG[deadline.matter?.type || 'trademark'] || TIPO_CONFIG.trademark;
  const isCompleted = deadline.status === 'completed';
  const isOverdue = urgency.status === 'overdue' || urgency.status === 'today';

  // Urgency colors mapping
  const urgencyStyles = {
    red: {
      border: 'border-red-300 dark:border-red-800',
      bar: 'bg-red-500',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-red-200',
      bg: isOverdue ? 'bg-red-50/70 dark:bg-red-950/30' : '',
    },
    orange: {
      border: 'border-orange-300 dark:border-orange-800',
      bar: 'bg-orange-500',
      badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200',
      bg: '',
    },
    yellow: {
      border: 'border-yellow-300 dark:border-yellow-800',
      bar: 'bg-yellow-500',
      badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200',
      bg: '',
    },
    green: {
      border: 'border-green-300 dark:border-green-800',
      bar: 'bg-green-500',
      badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200',
      bg: 'opacity-70',
    },
    slate: {
      border: 'border-border',
      bar: 'bg-muted-foreground/50',
      badge: 'bg-muted text-muted-foreground border-border',
      bg: '',
    },
  };

  const styles = urgencyStyles[urgency.color];

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all hover:shadow-md group',
        styles.border,
        styles.bg
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Urgency color bar */}
          <div className={cn('w-1 shrink-0', styles.bar)} />

          {/* Matter type icon */}
          <div className="flex items-center justify-center w-12 px-2 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-xl">{tipo.icon}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tipo.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Main content */}
          <div className="flex-1 py-3 pr-2 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {/* Title with priority indicator */}
                <div className="flex items-center gap-2">
                  {deadline.priority === 'critical' && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                      URGENTE
                    </Badge>
                  )}
                  <p
                    className={cn(
                      'font-medium text-sm truncate',
                      isCompleted && 'line-through text-muted-foreground'
                    )}
                  >
                    {deadline.title}
                  </p>
                </div>

                {/* Reference + Client */}
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="font-mono truncate">{deadline.matter?.reference}</span>
                  {deadline.matter?.client?.name && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1 truncate">
                        <Building2 className="h-3 w-3 shrink-0" />
                        {deadline.matter.client.name}
                      </span>
                    </>
                  )}
                </div>

                {/* Date */}
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(deadline.deadline_date), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>

              {/* Urgency badge */}
              <Badge variant="outline" className={cn('shrink-0 text-xs', styles.badge)}>
                {urgency.label}
              </Badge>
            </div>

            {/* Actions - visible on hover or always for urgent items */}
            <div
              className={cn(
                'flex items-center gap-1.5 mt-2 transition-opacity',
                isOverdue ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              )}
            >
              {!isCompleted && (
                <>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onComplete}>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completar
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <CalendarPlus className="h-3 w-3 mr-1" />
                        Posponer
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => onPostpone(1)}>+1 día</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPostpone(3)}>+3 días</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPostpone(7)}>+1 semana</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPostpone(14)}>+2 semanas</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onView}>
                <Eye className="h-3 w-3 mr-1" />
                Ver expediente
              </Button>
            </div>
          </div>

          {/* Context menu */}
          <div className="flex items-center pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver expediente
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  Configurar recordatorio
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {!isCompleted && (
                  <DropdownMenuItem onClick={onComplete}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar completado
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
