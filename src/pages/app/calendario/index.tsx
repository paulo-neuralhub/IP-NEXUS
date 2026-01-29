// ============================================
// Calendario Unificado - Google Calendar Style
// ============================================

import { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, type View, type SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useCalendarEvents, type CalendarEvent, type EventFilters } from '@/hooks/use-calendar-events';
import { CalendarHeader } from '@/components/features/calendario/CalendarHeader';
import { CalendarSidebar } from '@/components/features/calendario/CalendarSidebar';
import { CalendarSettingsModal } from '@/components/features/calendario/CalendarSettingsModal';
import { EventDetailSheet } from '@/components/features/calendario/EventDetailSheet';
import { CreateEventModal } from '@/components/features/calendario/CreateEventModal';
import { Skeleton } from '@/components/ui/skeleton';

// Localizer para español
const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Mensajes en español
const calendarMessages = {
  today: 'Hoy',
  previous: 'Anterior',
  next: 'Siguiente',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay eventos en este rango.',
  showMore: (total: number) => `+ Ver ${total} más`,
};

// Función para aplicar estilos a los eventos
function eventStyleGetter(event: CalendarEvent) {
  return {
    style: {
      backgroundColor: event.color,
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: 'none',
      fontSize: '12px',
      padding: '2px 6px',
      cursor: 'pointer',
    },
  };
}

// Cargar preferencias guardadas
function loadSavedFilters(): EventFilters {
  try {
    const saved = localStorage.getItem('calendar_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.defaultFilters || getDefaultFilters();
    }
  } catch {}
  return getDefaultFilters();
}

function getDefaultFilters(): EventFilters {
  return {
    showDeadlines: true,
    showDeadlinesFatal: true,
    showRenewals: true,
    showTasks: true,
    showMeetings: true,
    showCalls: true,
    showReminders: true,
    showOnlyMine: false,
  };
}

function loadDefaultView(): View {
  try {
    const saved = localStorage.getItem('calendar_default_view');
    if (saved && ['day', 'week', 'month', 'agenda'].includes(saved)) {
      return saved as View;
    }
  } catch {}
  return Views.MONTH;
}

export default function CalendarioPage() {
  // Estado de vista y navegación
  const [view, setView] = useState<View>(loadDefaultView);
  const [date, setDate] = useState(new Date());
  const [filters, setFilters] = useState<EventFilters>(loadSavedFilters);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalDate, setCreateModalDate] = useState<Date>(new Date());
  
  // Calcular rango de fechas según la vista actual
  const dateRange = useMemo(() => {
    const start = startOfMonth(subMonths(date, 1));
    const end = endOfMonth(addMonths(date, 1));
    return { start, end };
  }, [date]);
  
  // Cargar eventos
  const { data, isLoading } = useCalendarEvents(dateRange.start, dateRange.end, filters);
  const events = data?.items || [];
  const stats = data?.stats;
  
  // Handlers
  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
    localStorage.setItem('calendar_default_view', newView);
  }, []);
  
  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);
  
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);
  
  const handleTodayClick = useCallback(() => {
    setDate(new Date());
  }, []);
  
  const handleNewEvent = useCallback(() => {
    setCreateModalDate(date);
    setCreateModalOpen(true);
  }, [date]);
  
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setCreateModalDate(slotInfo.start);
    setCreateModalOpen(true);
  }, []);
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <CalendarHeader
        date={date}
        view={view}
        onViewChange={handleViewChange}
        onDateChange={handleNavigate}
        onSettingsClick={() => setSettingsOpen(true)}
        onTodayClick={handleTodayClick}
        onNewEvent={handleNewEvent}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de filtros */}
        <CalendarSidebar
          date={date}
          onDateChange={handleNavigate}
          filters={filters}
          onFiltersChange={setFilters}
          stats={stats}
        />
        
        {/* Calendario principal */}
        <div className="flex-1 p-4 overflow-auto bg-background">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-[500px] w-full" />
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={handleViewChange}
              date={date}
              onNavigate={handleNavigate}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              eventPropGetter={eventStyleGetter}
              messages={calendarMessages}
              culture="es"
              popup
              selectable
              className="rounded-lg bg-card p-4 shadow-sm"
              style={{ height: 'calc(100vh - 12rem)' }}
              toolbar={false}
              views={['month', 'week', 'day', 'agenda']}
            />
          )}
        </div>
      </div>
      
      {/* Modal de configuración */}
      <CalendarSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      
      {/* Panel de detalle de evento */}
      <EventDetailSheet
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
      
      {/* Modal crear evento */}
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultDate={createModalDate}
      />
    </div>
  );
}
