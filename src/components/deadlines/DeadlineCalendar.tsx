// ============================================================
// IP-NEXUS - DEADLINE CALENDAR COMPONENT
// Calendar view for deadlines with rich visual information
// ============================================================

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, FileText, CreditCard, RefreshCw, AlertTriangle, Gavel, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isPast, addMonths, subMonths, getDay, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useDeadlinesCalendar } from '@/hooks/useDeadlines';
import { Link } from 'react-router-dom';

interface DeadlineCalendarProps {
  onDayClick?: (date: Date) => void;
}

// Deadline type icons and colors
const deadlineTypeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  filing: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
  payment: { icon: CreditCard, color: 'text-green-600', bg: 'bg-green-100' },
  renewal: { icon: RefreshCw, color: 'text-purple-600', bg: 'bg-purple-100' },
  opposition: { icon: Gavel, color: 'text-orange-600', bg: 'bg-orange-100' },
  office_action: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  default: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' },
};

const priorityColors: Record<string, string> = {
  critical: 'border-l-red-500 bg-red-50',
  high: 'border-l-orange-500 bg-orange-50',
  normal: 'border-l-blue-500 bg-blue-50',
  low: 'border-l-gray-400 bg-gray-50',
};

export function DeadlineCalendar({ onDayClick }: DeadlineCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const { data: deadlines, isLoading } = useDeadlinesCalendar(year, month);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDay = getDay(monthStart);
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

  // Group deadlines by date
  const deadlinesByDate = React.useMemo(() => {
    const map = new Map<string, typeof deadlines>();
    deadlines?.forEach((deadline) => {
      const dateKey = deadline.deadline_date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)?.push(deadline);
    });
    return map;
  }, [deadlines]);

  const getDeadlineStatus = (date: Date) => {
    const isOverdue = isPast(date) && !isToday(date);
    const isTodayDate = isToday(date);
    const daysUntil = differenceInDays(date, new Date());
    
    if (isOverdue) return 'overdue';
    if (isTodayDate) return 'today';
    if (daysUntil <= 7) return 'urgent';
    return 'upcoming';
  };

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </CardTitle>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
          {Array.from({ length: adjustedStartDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px]" />
          ))}
          
          {/* Day cells */}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayDeadlines = deadlinesByDate.get(dateStr) || [];
            const status = dayDeadlines.length > 0 ? getDeadlineStatus(day) : null;
            const visibleDeadlines = dayDeadlines.slice(0, 3);
            const remainingCount = dayDeadlines.length - 3;
            
            return (
              <Popover key={day.toISOString()}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "min-h-[100px] p-1 text-sm rounded-lg relative transition-colors flex flex-col",
                      "hover:bg-accent border border-transparent",
                      isToday(day) && "bg-primary/5 border-primary/20",
                      !isSameMonth(day, currentMonth) && "opacity-50",
                      status === 'overdue' && "bg-red-50/50",
                      status === 'today' && "bg-orange-50/50",
                      status === 'urgent' && "bg-yellow-50/50"
                    )}
                    onClick={() => onDayClick?.(day)}
                  >
                    {/* Day number */}
                    <span className={cn(
                      "text-xs font-medium mb-1 self-end px-1 rounded",
                      isToday(day) && "bg-primary text-primary-foreground"
                    )}>
                      {format(day, 'd')}
                    </span>
                    
                    {/* Deadline items */}
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                      {visibleDeadlines.map((deadline) => {
                        const typeConfig = deadlineTypeConfig[deadline.deadline_type] || deadlineTypeConfig.default;
                        const Icon = typeConfig.icon;
                        
                        return (
                          <div
                            key={deadline.id}
                            className={cn(
                              "text-[10px] leading-tight px-1 py-0.5 rounded truncate border-l-2",
                              priorityColors[deadline.priority] || priorityColors.normal
                            )}
                            title={`${deadline.title} - ${deadline.matter?.reference}`}
                          >
                            <div className="flex items-center gap-0.5">
                              <Icon className={cn("h-2.5 w-2.5 flex-shrink-0", typeConfig.color)} />
                              <span className="truncate font-medium">
                                {deadline.matter?.reference || deadline.title}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {remainingCount > 0 && (
                        <div className="text-[10px] text-muted-foreground px-1 font-medium">
                          +{remainingCount} más
                        </div>
                      )}
                    </div>
                  </button>
                </PopoverTrigger>
                
                {dayDeadlines.length > 0 && (
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-2">
                      <h4 className="font-semibold capitalize">
                        {format(day, 'EEEE, d MMMM', { locale: es })}
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {dayDeadlines.map((deadline) => {
                          const typeConfig = deadlineTypeConfig[deadline.deadline_type] || deadlineTypeConfig.default;
                          const Icon = typeConfig.icon;
                          
                          return (
                            <Link 
                              key={deadline.id}
                              to={`/app/docket/${deadline.matter?.id}`}
                              className="block p-2 rounded-md bg-muted hover:bg-accent transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={cn("p-1 rounded", typeConfig.bg)}>
                                    <Icon className={cn("h-3.5 w-3.5", typeConfig.color)} />
                                  </div>
                                  <span className="font-medium text-sm truncate">{deadline.title}</span>
                                </div>
                                <Badge 
                                  variant={
                                    deadline.priority === 'critical' ? 'destructive' :
                                    deadline.priority === 'high' ? 'default' : 'secondary'
                                  } 
                                  className="text-xs flex-shrink-0"
                                >
                                  {deadline.priority}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-xs text-muted-foreground truncate">
                                  {deadline.matter?.reference} - {deadline.matter?.title}
                                </span>
                              </div>
                              <div className="mt-1">
                                <Badge variant="outline" className="text-[10px]">
                                  {deadline.deadline_type}
                                </Badge>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-50 border-l-2 border-red-500" />
            <span>Crítico</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-orange-50 border-l-2 border-orange-500" />
            <span>Alto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-50 border-l-2 border-blue-500" />
            <span>Normal</span>
          </div>
          <span className="text-muted-foreground/50">|</span>
          <div className="flex items-center gap-1.5">
            <FileText className="h-3 w-3 text-blue-600" />
            <span>Filing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3 w-3 text-green-600" />
            <span>Pago</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 text-purple-600" />
            <span>Renovación</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gavel className="h-3 w-3 text-orange-600" />
            <span>Oposición</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
