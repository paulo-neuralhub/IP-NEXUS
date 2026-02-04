// ============================================================
// IP-NEXUS - DEADLINES DASHBOARD
// Centralized view for managing all matter deadlines
// ============================================================

import React, { useState } from 'react';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, 
  Filter, ChevronDown, User, Loader2, ExternalLink,
  MoreHorizontal, CalendarPlus, Check
} from 'lucide-react';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  useDeadlines, 
  useDeadlineStats,
  useGroupedDeadlines,
  type MatterDeadline,
  type DeadlineStats,
} from '@/hooks/useDeadlines';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui/empty-state';

// ══════════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════════

type DeadlineCriticality = 'low' | 'normal' | 'high' | 'critical' | 'absolute';
type DeadlineStatus = 'pending' | 'in_progress' | 'completed' | 'extended' | 'waived' | 'missed' | 'expired';

interface CriticalityStyle {
  bg: string;
  text: string;
  icon: string;
  label: string;
}

// ══════════════════════════════════════════════════════════════════════════
// Constants - Using semantic classes
// ══════════════════════════════════════════════════════════════════════════

const CRITICALITY_STYLES: Record<DeadlineCriticality, CriticalityStyle> = {
  low: { bg: 'bg-muted', text: 'text-muted-foreground', icon: '○', label: 'Baja' },
  normal: { bg: 'bg-primary/10', text: 'text-primary', icon: '●', label: 'Normal' },
  high: { bg: 'bg-warning/10', text: 'text-warning', icon: '▲', label: 'Alta' },
  critical: { bg: 'bg-orange-500/10', text: 'text-orange-600', icon: '◆', label: 'Crítica' },
  absolute: { bg: 'bg-destructive/10', text: 'text-destructive', icon: '⬤', label: 'Fatal' },
};

const STATUS_OPTIONS: { value: DeadlineStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'extended', label: 'Extendido' },
  { value: 'missed', label: 'Perdido' },
];

// ══════════════════════════════════════════════════════════════════════════
// Stats Card Component
// ══════════════════════════════════════════════════════════════════════════

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant: 'destructive' | 'warning' | 'primary' | 'secondary' | 'muted';
  onClick?: () => void;
  isActive?: boolean;
}

function StatCard({ icon, label, value, variant, onClick, isActive }: StatCardProps) {
  const variantStyles = {
    destructive: 'border-destructive/50 bg-destructive/5',
    warning: 'border-orange-500/50 bg-orange-500/5',
    primary: 'border-primary/50 bg-primary/5',
    secondary: 'border-secondary/50 bg-secondary/5',
    muted: 'border-border bg-muted/50',
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        variantStyles[variant],
        isActive && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-lg bg-background">
            {icon}
          </div>
          <span className="text-3xl font-bold">{value}</span>
        </div>
        <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Deadline Item Component
// ══════════════════════════════════════════════════════════════════════════

interface DeadlineItemProps {
  deadline: MatterDeadline;
  onComplete: (id: string) => void;
  onPostpone: (id: string, days: number) => void;
}

function DeadlineItem({ deadline, onComplete, onPostpone }: DeadlineItemProps) {
  const navigate = useNavigate();
  
  const getDueDateInfo = (dueDate: string) => {
    const date = new Date(dueDate);
    const isOverdue = isPast(date) && !isToday(date);
    const isDueToday = isToday(date);
    const isDueTomorrow = isTomorrow(date);
    const isDueThisWeek = isThisWeek(date);

    let label = format(date, 'd MMM yyyy', { locale: es });
    let colorClass = 'text-muted-foreground';

    if (isOverdue) {
      label = `Vencido (${formatDistanceToNow(date, { addSuffix: true, locale: es })})`;
      colorClass = 'text-destructive font-medium';
    } else if (isDueToday) {
      label = 'Hoy';
      colorClass = 'text-orange-600 font-medium';
    } else if (isDueTomorrow) {
      label = 'Mañana';
      colorClass = 'text-warning font-medium';
    } else if (isDueThisWeek) {
      label = format(date, 'EEEE', { locale: es });
      colorClass = 'text-primary';
    }

    return { label, colorClass, isOverdue };
  };

  const dueDate = deadline.deadline_date || '';
  const { label: dueDateLabel, colorClass, isOverdue } = getDueDateInfo(dueDate);
  const criticality = (deadline.priority || deadline.criticality || 'normal') as DeadlineCriticality;
  const critStyle = CRITICALITY_STYLES[criticality];
  const isCompleted = deadline.status === 'completed';

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
        isOverdue && !isCompleted && "border-destructive/50 bg-destructive/5",
        isCompleted && "opacity-60",
        !isOverdue && !isCompleted && "border-border hover:bg-muted/50"
      )}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => onComplete(deadline.id)}
        className="shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs", critStyle.text)}>
            {critStyle.icon}
          </span>
          <span className={cn("font-medium truncate", isCompleted && "line-through")}>
            {deadline.title}
          </span>
          {deadline.matter && (
            <Badge variant="outline" className="text-xs shrink-0">
              {deadline.matter.reference}
            </Badge>
          )}
        </div>
        {deadline.matter?.title && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {deadline.matter.title}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className={cn("text-sm", colorClass)}>{dueDateLabel}</p>
          {deadline.assigned_user && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <User className="h-3 w-3" />
              <span>{deadline.assigned_user.full_name}</span>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={() => onComplete(deadline.id)}>
              <Check className="h-4 w-4 mr-2" />
              {isCompleted ? 'Marcar pendiente' : 'Completar'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onPostpone(deadline.id, 1)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Posponer 1 día
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPostpone(deadline.id, 3)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Posponer 3 días
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPostpone(deadline.id, 7)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Posponer 1 semana
            </DropdownMenuItem>
            {deadline.matter && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => navigate(`/app/expedientes/${deadline.matter!.id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver expediente
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Main Dashboard Component
// ══════════════════════════════════════════════════════════════════════════

export function DeadlinesDashboard() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<DeadlineStatus[]>(['pending', 'in_progress']);
  const [criticalityFilter, setCriticalityFilter] = useState<DeadlineCriticality[]>([]);
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useDeadlineStats();
  const { data: deadlines, isLoading } = useGroupedDeadlines();
  const { markAsCompleted, postpone1Day, postpone3Days, postpone1Week } = useDeadlines();

  const handleComplete = (id: string) => {
    markAsCompleted(id);
  };

  const handlePostpone = (id: string, days: number) => {
    if (days === 1) postpone1Day(id);
    else if (days === 3) postpone3Days(id);
    else if (days === 7) postpone1Week(id);
  };

  const toggleStatusFilter = (status: DeadlineStatus, checked: boolean) => {
    if (checked) {
      setStatusFilter([...statusFilter, status]);
    } else {
      setStatusFilter(statusFilter.filter((s) => s !== status));
    }
  };

  const toggleCriticalityFilter = (crit: DeadlineCriticality, checked: boolean) => {
    if (checked) {
      setCriticalityFilter([...criticalityFilter, crit]);
    } else {
      setCriticalityFilter(criticalityFilter.filter((c) => c !== crit));
    }
  };

  // Flatten grouped deadlines for display
  const allDeadlines = deadlines ? [
    ...deadlines.overdue,
    ...deadlines.today,
    ...deadlines.tomorrow,
    ...deadlines.thisWeek,
    ...deadlines.nextWeek,
    ...deadlines.later,
  ] : [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
          label="Vencidos"
          value={stats?.overdue ?? 0}
          variant="destructive"
          isActive={activeStatFilter === 'overdue'}
          onClick={() => setActiveStatFilter(activeStatFilter === 'overdue' ? null : 'overdue')}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-warning" />}
          label="Hoy"
          value={stats?.today ?? 0}
          variant="warning"
          isActive={activeStatFilter === 'today'}
          onClick={() => setActiveStatFilter(activeStatFilter === 'today' ? null : 'today')}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-primary" />}
          label="Esta Semana"
          value={stats?.thisWeek ?? 0}
          variant="primary"
          isActive={activeStatFilter === 'week'}
          onClick={() => setActiveStatFilter(activeStatFilter === 'week' ? null : 'week')}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
          label="Críticos"
          value={(stats?.byCriticality?.critical ?? 0) + (stats?.byCriticality?.absolute ?? 0)}
          variant="warning"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-muted-foreground" />}
          label="Total Pendientes"
          value={stats?.total ?? 0}
          variant="muted"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Estado
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-popover">
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={statusFilter.includes(option.value)}
                onCheckedChange={(checked) => toggleStatusFilter(option.value, checked)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Criticidad
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-popover">
            {(Object.entries(CRITICALITY_STYLES) as [DeadlineCriticality, CriticalityStyle][]).map(([crit, style]) => (
              <DropdownMenuCheckboxItem
                key={crit}
                checked={criticalityFilter.includes(crit)}
                onCheckedChange={(checked) => toggleCriticalityFilter(crit, checked)}
              >
                <span className={cn("mr-2", style.text)}>{style.icon}</span>
                {style.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {(statusFilter.length > 0 || criticalityFilter.length > 0) && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setStatusFilter(['pending', 'in_progress']);
              setCriticalityFilter([]);
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Deadlines List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Plazos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : allDeadlines.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-8 w-8" />}
              title="Sin plazos pendientes"
              description="No hay plazos que coincidan con los filtros seleccionados"
            />
          ) : (
            <div className="space-y-2">
              {/* Overdue Section */}
              {deadlines?.overdue && deadlines.overdue.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    VENCIDOS ({deadlines.overdue.length})
                  </h3>
                  {deadlines.overdue.map((d) => (
                    <DeadlineItem 
                      key={d.id} 
                      deadline={d} 
                      onComplete={handleComplete}
                      onPostpone={handlePostpone}
                    />
                  ))}
                </div>
              )}

              {/* Today Section */}
              {deadlines?.today && deadlines.today.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-semibold text-warning flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    HOY ({deadlines.today.length})
                  </h3>
                  {deadlines.today.map((d) => (
                    <DeadlineItem 
                      key={d.id} 
                      deadline={d} 
                      onComplete={handleComplete}
                      onPostpone={handlePostpone}
                    />
                  ))}
                </div>
              )}

              {/* Tomorrow Section */}
              {deadlines?.tomorrow && deadlines.tomorrow.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-semibold text-warning flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    MAÑANA ({deadlines.tomorrow.length})
                  </h3>
                  {deadlines.tomorrow.map((d) => (
                    <DeadlineItem 
                      key={d.id} 
                      deadline={d} 
                      onComplete={handleComplete}
                      onPostpone={handlePostpone}
                    />
                  ))}
                </div>
              )}

              {/* This Week Section */}
              {deadlines?.thisWeek && deadlines.thisWeek.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    ESTA SEMANA ({deadlines.thisWeek.length})
                  </h3>
                  {deadlines.thisWeek.map((d) => (
                    <DeadlineItem 
                      key={d.id} 
                      deadline={d} 
                      onComplete={handleComplete}
                      onPostpone={handlePostpone}
                    />
                  ))}
                </div>
              )}

              {/* Next Week Section */}
              {deadlines?.nextWeek && deadlines.nextWeek.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    PRÓXIMA SEMANA ({deadlines.nextWeek.length})
                  </h3>
                  {deadlines.nextWeek.map((d) => (
                    <DeadlineItem 
                      key={d.id} 
                      deadline={d} 
                      onComplete={handleComplete}
                      onPostpone={handlePostpone}
                    />
                  ))}
                </div>
              )}

              {/* Later Section */}
              {deadlines?.later && deadlines.later.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    MÁS ADELANTE ({deadlines.later.length})
                  </h3>
                  {deadlines.later.map((d) => (
                    <DeadlineItem 
                      key={d.id} 
                      deadline={d} 
                      onComplete={handleComplete}
                      onPostpone={handlePostpone}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DeadlinesDashboard;
