// ============================================================
// IP-NEXUS - CRITICAL DEADLINES WIDGET
// L89: Widget de plazos críticos para sidebar/dashboard
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { AlertTriangle, Clock, Calendar, ChevronRight, Folder } from 'lucide-react';
import { formatDistanceToNow, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface CriticalDeadlinesWidgetProps {
  limit?: number;
  showTitle?: boolean;
  compact?: boolean;
  className?: string;
}

interface Deadline {
  id: string;
  title: string;
  deadline_date: string;
  priority: string;
  status: string;
  matter_id: string;
  matter?: {
    id: string;
    reference: string;
    title: string;
  } | null;
}

export function CriticalDeadlinesWidget({
  limit = 5,
  showTitle = true,
  compact = false,
  className,
}: CriticalDeadlinesWidgetProps) {
  const { currentOrganization } = useOrganization();

  const { data: deadlines, isLoading } = useQuery({
    queryKey: ['critical-deadlines', currentOrganization?.id, limit],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const today = new Date();
      const in14Days = addDays(today, 14);

      const { data, error } = await supabase
        .from('matter_deadlines')
        .select(`
          id, title, deadline_date, priority, status, matter_id,
          matter:matters(id, reference, title)
        `)
        .eq('organization_id', currentOrganization.id)
        .in('status', ['pending', 'upcoming', 'urgent', 'overdue'])
        .lte('deadline_date', in14Days.toISOString().split('T')[0])
        .order('deadline_date', { ascending: true })
        .limit(limit * 2); // Obtener más para filtrar

      if (error) throw error;
      return (data as unknown as Deadline[]) || [];
    },
    enabled: !!currentOrganization?.id,
  });

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {showTitle && <Skeleton className="h-5 w-32" />}
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  // Separar por urgencia
  const today = new Date();
  const in7Days = addDays(today, 7);

  const fatal = deadlines?.filter((d) => d.priority === 'fatal') || [];
  const overdue = deadlines?.filter((d) => 
    d.priority !== 'fatal' && isBefore(new Date(d.deadline_date), today)
  ) || [];
  const urgent = deadlines?.filter((d) =>
    d.priority !== 'fatal' && 
    !isBefore(new Date(d.deadline_date), today) &&
    isBefore(new Date(d.deadline_date), in7Days)
  ) || [];
  const upcoming = deadlines?.filter((d) =>
    d.priority !== 'fatal' &&
    isAfter(new Date(d.deadline_date), in7Days)
  ) || [];

  const hasDeadlines = fatal.length > 0 || overdue.length > 0 || urgent.length > 0 || upcoming.length > 0;

  return (
    <div className={cn('space-y-3', className)}>
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Plazos Críticos
          </div>
          <Link
            to="/app/docket/deadlines"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            Ver todos <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {!hasDeadlines ? (
        <div className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
          ✓ No hay plazos críticos pendientes
        </div>
      ) : (
        <div className="space-y-3">
          {/* Plazos fatales */}
          {fatal.length > 0 && (
            <DeadlineSection
              title="FATALES"
              count={fatal.length}
              deadlines={fatal.slice(0, 3)}
              variant="fatal"
              compact={compact}
            />
          )}

          {/* Vencidos */}
          {overdue.length > 0 && (
            <DeadlineSection
              title="VENCIDOS"
              count={overdue.length}
              deadlines={overdue.slice(0, 3)}
              variant="overdue"
              compact={compact}
            />
          )}

          {/* Próximos 7 días */}
          {urgent.length > 0 && (
            <DeadlineSection
              title="Próximos 7 días"
              count={urgent.length}
              deadlines={urgent.slice(0, 3)}
              variant="urgent"
              compact={compact}
            />
          )}

          {/* Resto */}
          {!compact && upcoming.length > 0 && (
            <DeadlineSection
              title="Próximos"
              count={upcoming.length}
              deadlines={upcoming.slice(0, 2)}
              variant="upcoming"
              compact={compact}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Sección de plazos agrupados
interface DeadlineSectionProps {
  title: string;
  count: number;
  deadlines: Deadline[];
  variant: 'fatal' | 'overdue' | 'urgent' | 'upcoming';
  compact?: boolean;
}

function DeadlineSection({ title, count, deadlines, variant, compact }: DeadlineSectionProps) {
  const variantStyles = {
    fatal: 'border-l-destructive bg-destructive/5',
    overdue: 'border-l-destructive bg-destructive/5',
    urgent: 'border-l-orange-500 bg-orange-500/5',
    upcoming: 'border-l-yellow-500 bg-yellow-500/5',
  };

  const badgeStyles = {
    fatal: 'bg-destructive text-destructive-foreground',
    overdue: 'bg-destructive text-destructive-foreground',
    urgent: 'bg-orange-500 text-white',
    upcoming: 'bg-yellow-500 text-white',
  };

  return (
    <div className={cn('border-l-2 rounded-r-lg p-2', variantStyles[variant])}>
      <div className="flex items-center gap-2 mb-2">
        <Badge className={cn('text-[10px] px-1.5', badgeStyles[variant])}>
          {title} ({count})
        </Badge>
      </div>
      <div className="space-y-1.5">
        {deadlines.map((deadline) => (
          <DeadlineItem key={deadline.id} deadline={deadline} variant={variant} compact={compact} />
        ))}
      </div>
    </div>
  );
}

// Item individual de plazo
interface DeadlineItemProps {
  deadline: Deadline;
  variant: 'fatal' | 'overdue' | 'urgent' | 'upcoming';
  compact?: boolean;
}

function DeadlineItem({ deadline, variant, compact }: DeadlineItemProps) {
  const daysUntil = differenceInDays(new Date(deadline.deadline_date), new Date());
  
  return (
    <Link
      to={`/app/expedientes/${deadline.matter_id}`}
      className={cn(
        'block rounded-lg p-2 hover:bg-accent/50 transition-colors',
        'group'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate group-hover:text-primary">
            {deadline.title}
          </p>
          {!compact && deadline.matter && (
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <Folder className="h-3 w-3" />
              {deadline.matter.reference} · {deadline.matter.title}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span
            className={cn(
              'text-xs font-medium',
              variant === 'fatal' || variant === 'overdue' ? 'text-destructive' : '',
              variant === 'urgent' ? 'text-orange-600' : '',
              variant === 'upcoming' ? 'text-yellow-600' : ''
            )}
          >
            {daysUntil < 0
              ? `Hace ${Math.abs(daysUntil)}d`
              : daysUntil === 0
              ? 'Hoy'
              : `${daysUntil}d`}
          </span>
        </div>
      </div>
    </Link>
  );
}
