// ============================================================
// IP-NEXUS - DEADLINE CALENDAR COMPONENT
// Calendar view for deadlines
// ============================================================

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, isPast, addMonths, subMonths, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useDeadlinesCalendar } from '@/hooks/useDeadlines';
import { Link } from 'react-router-dom';

interface DeadlineCalendarProps {
  onDayClick?: (date: Date) => void;
}

export function DeadlineCalendar({ onDayClick }: DeadlineCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const { data: deadlines, isLoading } = useDeadlinesCalendar(year, month);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the day of week the month starts on (0 = Sunday)
  const startDay = getDay(monthStart);
  // Adjust for Monday start
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
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayDeadlines = deadlinesByDate.get(dateStr) || [];
    
    if (dayDeadlines.length === 0) return null;
    
    const hasOverdue = isPast(date) && !isToday(date);
    const hasToday = isToday(date);
    const hasCritical = dayDeadlines.some(d => d.priority === 'critical');
    
    if (hasOverdue) return { color: 'bg-destructive', count: dayDeadlines.length };
    if (hasToday) return { color: 'bg-orange-500', count: dayDeadlines.length };
    if (hasCritical) return { color: 'bg-yellow-500', count: dayDeadlines.length };
    return { color: 'bg-green-500', count: dayDeadlines.length };
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
          <CardTitle className="text-lg">
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
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {/* Day cells */}
          {days.map((day) => {
            const status = getDeadlineStatus(day);
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayDeadlines = deadlinesByDate.get(dateStr) || [];
            
            return (
              <Popover key={day.toISOString()}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "aspect-square p-1 text-sm rounded-md relative transition-colors",
                      "hover:bg-accent",
                      isToday(day) && "bg-primary/10 font-bold",
                      !isSameMonth(day, currentMonth) && "text-muted-foreground opacity-50"
                    )}
                    onClick={() => onDayClick?.(day)}
                  >
                    <span className={cn(
                      "absolute top-1 left-1/2 -translate-x-1/2",
                      isToday(day) && "text-primary"
                    )}>
                      {format(day, 'd')}
                    </span>
                    
                    {status && (
                      <div className={cn(
                        "absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-white font-bold rounded-full px-1.5 min-w-[18px] text-center",
                        status.color
                      )}>
                        {status.count}
                      </div>
                    )}
                  </button>
                </PopoverTrigger>
                
                {dayDeadlines.length > 0 && (
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-2">
                      <h4 className="font-semibold">
                        {format(day, 'EEEE, d MMMM', { locale: es })}
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {dayDeadlines.map((deadline) => (
                          <Link 
                            key={deadline.id}
                            to={`/app/docket/${deadline.matter?.id}`}
                            className="block p-2 rounded-md bg-muted hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm truncate">{deadline.title}</span>
                              <Badge variant={
                                deadline.priority === 'critical' ? 'destructive' :
                                deadline.priority === 'high' ? 'default' : 'secondary'
                              } className="text-xs ml-2">
                                {deadline.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {deadline.matter?.reference} - {deadline.matter?.title}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span>Vencido</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Hoy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>1-7 días</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>+7 días</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
