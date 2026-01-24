// ============================================================
// IP-NEXUS - DEADLINE STATS COMPONENT
// Summary cards for deadline dashboard
// ============================================================

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Calendar, CalendarClock, CalendarDays, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeadlineStats } from '@/hooks/useDeadlines';
export type { DeadlineStats };

interface DeadlineStatsCardsProps {
  stats: DeadlineStats;
  isLoading?: boolean;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  isActive?: boolean;
  onClick?: () => void;
}

function StatCard({ icon, label, value, color, bgColor, isActive, onClick }: StatCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isActive && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-lg", bgColor)}>
            {icon}
          </div>
          <span className={cn("text-3xl font-bold", color)}>{value}</span>
        </div>
        <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

export function DeadlineStatsCards({ stats, isLoading, activeFilter, onFilterChange }: DeadlineStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="mt-2 h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
        label="VENCIDOS"
        value={stats.overdue}
        color="text-destructive"
        bgColor="bg-destructive/10"
        isActive={activeFilter === 'overdue'}
        onClick={() => onFilterChange?.('overdue')}
      />
      <StatCard
        icon={<Clock className="h-5 w-5 text-orange-500" />}
        label="HOY"
        value={stats.today}
        color="text-orange-500"
        bgColor="bg-orange-500/10"
        isActive={activeFilter === 'today'}
        onClick={() => onFilterChange?.('today')}
      />
      <StatCard
        icon={<CalendarClock className="h-5 w-5 text-yellow-500" />}
        label="7 DÍAS"
        value={stats.thisWeek}
        color="text-yellow-500"
        bgColor="bg-yellow-500/10"
        isActive={activeFilter === 'week'}
        onClick={() => onFilterChange?.('week')}
      />
      <StatCard
        icon={<CalendarDays className="h-5 w-5 text-green-500" />}
        label="30 DÍAS"
        value={stats.thisMonth}
        color="text-green-500"
        bgColor="bg-green-500/10"
        isActive={activeFilter === 'month'}
        onClick={() => onFilterChange?.('month')}
      />
    </div>
  );
}

// Inline stats for widgets
export function DeadlineStatsInline({ stats, isLoading }: { stats: DeadlineStats; isLoading?: boolean }) {
  if (isLoading) {
    return <Skeleton className="h-6 w-48" />;
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="flex items-center gap-1">
        <span className="text-lg">🔴</span>
        <span className="font-medium">{stats.overdue}</span>
        <span className="text-muted-foreground">vencidos</span>
      </span>
      <span className="flex items-center gap-1">
        <span className="text-lg">🟠</span>
        <span className="font-medium">{stats.today}</span>
        <span className="text-muted-foreground">hoy</span>
      </span>
      <span className="flex items-center gap-1">
        <span className="text-lg">🟡</span>
        <span className="font-medium">{stats.thisWeek}</span>
        <span className="text-muted-foreground">esta semana</span>
      </span>
    </div>
  );
}
