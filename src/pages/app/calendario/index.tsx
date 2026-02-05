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

// Función para aplicar estilos SILK a los eventos
function eventStyleGetter(event: CalendarEvent) {
  // Determine if color is a dark color for text contrast
  const color = event.color || '#3b82f6';
  
  // Create gradient colors
  const lighterColor = adjustColorBrightness(color, 20);
  
  return {
    style: {
      background: `linear-gradient(135deg, ${color} 0%, ${lighterColor} 100%)`,
      borderRadius: '8px',
      opacity: 1,
      color: 'white',
      border: `1px solid ${color}`,
      fontSize: '12px',
      padding: '4px 8px',
      cursor: 'pointer',
      boxShadow: `0 2px 6px ${color}40`,
      transition: 'all 0.2s ease',
    },
  };
}

// Helper to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
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
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
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
        {/* Sidebar izquierdo - FIJO */}
        <aside className="w-64 flex-shrink-0 border-r bg-muted/30 overflow-y-auto">
          <CalendarSidebar
            date={date}
            onDateChange={handleNavigate}
            filters={filters}
            onFiltersChange={setFilters}
            stats={stats}
          />
        </aside>
        
        {/* Calendario principal - FLEX GROW */}
        <main className="flex-1 overflow-hidden p-4">
          {isLoading ? (
            <div className="space-y-4 h-full">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <div className="h-full bg-card rounded-lg border shadow-sm">
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
                className="p-4 h-full [&_.rbc-calendar]:h-full [&_.rbc-month-view]:flex-1"
                style={{ height: '100%' }}
                toolbar={false}
                views={['month', 'week', 'day', 'agenda']}
              />
            </div>
          )}
        </main>
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
