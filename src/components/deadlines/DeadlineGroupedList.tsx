// ============================================================
// IP-NEXUS - DEADLINE GROUPED LIST COMPONENT
// L125: Deadlines grouped by time period with visual separators
// ============================================================

import { useMemo } from 'react';
import {
  differenceInDays,
  isToday,
  isTomorrow,
  addDays,
  endOfWeek,
} from 'date-fns';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  CalendarDays,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DeadlineItem, type UrgencyInfo } from './DeadlineItem';
import type { MatterDeadline } from '@/hooks/useDeadlines';

// Urgency calculation
function getUrgencyStatus(fecha: string, status?: string | null): UrgencyInfo {
  if (status === 'completed') {
    return { status: 'completed', label: 'Completado', color: 'green', priority: 5 };
  }

  const dias = differenceInDays(new Date(fecha), new Date());

  if (dias < 0) {
    return {
      status: 'overdue',
      label: `Vencido hace ${Math.abs(dias)}d`,
      color: 'red',
      priority: 1,
    };
  }
  if (isToday(new Date(fecha))) {
    return { status: 'today', label: 'VENCE HOY', color: 'red', priority: 1 };
  }
  if (isTomorrow(new Date(fecha))) {
    return { status: 'tomorrow', label: 'Mañana', color: 'orange', priority: 2 };
  }
  if (dias <= 7) {
    return { status: 'urgent', label: `En ${dias} días`, color: 'orange', priority: 2 };
  }
  if (dias <= 30) {
    return { status: 'upcoming', label: `En ${dias} días`, color: 'yellow', priority: 3 };
  }
  return { status: 'future', label: `En ${dias} días`, color: 'slate', priority: 4 };
}

interface DeadlineGroup {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  deadlines: MatterDeadline[];
}

// Group deadlines by period
function groupByPeriod(deadlines: MatterDeadline[]): Record<string, DeadlineGroup> {
  const groups: Record<string, DeadlineGroup> = {
    overdue: { label: '⚠️ VENCIDOS', color: 'red', icon: AlertOctagon, deadlines: [] },
    today: { label: '🔴 HOY', color: 'red', icon: AlertTriangle, deadlines: [] },
    tomorrow: { label: '🟠 MAÑANA', color: 'orange', icon: Clock, deadlines: [] },
    thisWeek: { label: '🟡 ESTA SEMANA', color: 'yellow', icon: CalendarDays, deadlines: [] },
    nextWeek: { label: '📅 PRÓXIMA SEMANA', color: 'blue', icon: Calendar, deadlines: [] },
    later: { label: '📆 MÁS ADELANTE', color: 'slate', icon: Calendar, deadlines: [] },
    completed: { label: '✅ COMPLETADOS', color: 'green', icon: CheckCircle2, deadlines: [] },
  };

  const today = new Date();
  const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
  const endOfNextWeek = endOfWeek(addDays(today, 7), { weekStartsOn: 1 });

  deadlines.forEach((deadline) => {
    const fecha = new Date(deadline.deadline_date);
    const dias = differenceInDays(fecha, today);

    if (deadline.status === 'completed') {
      groups.completed.deadlines.push(deadline);
    } else if (dias < 0) {
      groups.overdue.deadlines.push(deadline);
    } else if (isToday(fecha)) {
      groups.today.deadlines.push(deadline);
    } else if (isTomorrow(fecha)) {
      groups.tomorrow.deadlines.push(deadline);
    } else if (fecha <= endOfThisWeek) {
      groups.thisWeek.deadlines.push(deadline);
    } else if (fecha <= endOfNextWeek) {
      groups.nextWeek.deadlines.push(deadline);
    } else {
      groups.later.deadlines.push(deadline);
    }
  });

  return groups;
}

interface DeadlineGroupedListProps {
  deadlines: MatterDeadline[];
  onComplete: (id: string) => void;
  onPostpone: (id: string, days: number) => void;
  onView: (matterId: string) => void;
}

export function DeadlineGroupedList({
  deadlines,
  onComplete,
  onPostpone,
  onView,
}: DeadlineGroupedListProps) {
  const groupedDeadlines = useMemo(() => groupByPeriod(deadlines), [deadlines]);

  const groupOrder = ['overdue', 'today', 'tomorrow', 'thisWeek', 'nextWeek', 'later', 'completed'];

  if (deadlines.length === 0) {
    return (
      <div className="text-center py-16">
        <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">No hay plazos que mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupOrder.map((key) => {
        const group = groupedDeadlines[key];
        if (!group || group.deadlines.length === 0) return null;

        const colorClasses: Record<string, string> = {
          red: 'text-red-600 bg-red-100 dark:bg-red-900/30',
          orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
          yellow: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
          blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
          slate: 'text-muted-foreground bg-muted',
          green: 'text-green-600 bg-green-100 dark:bg-green-900/30',
        };

        const lineColors: Record<string, string> = {
          red: 'bg-red-300 dark:bg-red-700',
          orange: 'bg-orange-300 dark:bg-orange-700',
          yellow: 'bg-yellow-300 dark:bg-yellow-700',
          blue: 'bg-blue-300 dark:bg-blue-700',
          slate: 'bg-border',
          green: 'bg-green-300 dark:bg-green-700',
        };

        return (
          <div key={key}>
            {/* Group separator */}
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('h-px flex-1', lineColors[group.color])} />
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
                  colorClasses[group.color]
                )}
              >
                {group.label}
              </div>
              <Badge variant="secondary" className="text-xs">
                {group.deadlines.length}
              </Badge>
              <div className={cn('h-px flex-1', lineColors[group.color])} />
            </div>

            {/* Deadline cards */}
            <div className="space-y-2">
              {group.deadlines.map((deadline) => (
                <DeadlineItem
                  key={deadline.id}
                  deadline={deadline}
                  urgency={getUrgencyStatus(deadline.deadline_date, deadline.status)}
                  onComplete={() => onComplete(deadline.id)}
                  onPostpone={(days) => onPostpone(deadline.id, days)}
                  onView={() => onView(deadline.matter_id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
