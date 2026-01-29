// ============================================
// Header del Calendario con navegación y vistas
// ============================================

import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { type View } from 'react-big-calendar';
import { Calendar, ChevronLeft, ChevronRight, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalendarHeaderProps {
  date: Date;
  view: View;
  onViewChange: (view: View) => void;
  onDateChange: (date: Date) => void;
  onSettingsClick: () => void;
  onTodayClick: () => void;
  onNewEvent: () => void;
}

export function CalendarHeader({
  date,
  view,
  onViewChange,
  onDateChange,
  onSettingsClick,
  onTodayClick,
  onNewEvent,
}: CalendarHeaderProps) {
  const navigate = (direction: 'prev' | 'next') => {
    let newDate: Date;
    if (view === 'day') {
      newDate = direction === 'next' ? addDays(date, 1) : subDays(date, 1);
    } else if (view === 'week') {
      newDate = direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1);
    } else {
      newDate = direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);
    }
    onDateChange(newDate);
  };
  
  const getTitle = () => {
    if (view === 'day') return format(date, "EEEE, d 'de' MMMM yyyy", { locale: es });
    if (view === 'week') return `Semana del ${format(date, "d 'de' MMMM", { locale: es })}`;
    if (view === 'agenda') return `Agenda - ${format(date, "MMMM yyyy", { locale: es })}`;
    return format(date, "MMMM yyyy", { locale: es });
  };
  
  const viewOptions: { value: View; label: string }[] = [
    { value: 'day', label: 'Día' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
    { value: 'agenda', label: 'Agenda' },
  ];
  
  return (
    <div className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Título */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold">Calendario</h1>
          </div>
          
          {/* Navegación de fecha */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('prev')}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onTodayClick}
              className="h-8 px-3"
            >
              Hoy
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('next')}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Título de fecha actual */}
          <h2 className="text-lg font-medium capitalize text-foreground">
            {getTitle()}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Selector de vista */}
          <div className="flex rounded-lg border bg-muted/30 p-1">
            {viewOptions.map((v) => (
              <button
                key={v.value}
                onClick={() => onViewChange(v.value)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  view === v.value 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
          
          {/* Botón de configuración */}
          <Button variant="outline" size="icon" onClick={onSettingsClick}>
            <Settings className="h-4 w-4" />
          </Button>
          
          {/* Crear evento */}
          <Button onClick={onNewEvent} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo evento
          </Button>
        </div>
      </div>
    </div>
  );
}
