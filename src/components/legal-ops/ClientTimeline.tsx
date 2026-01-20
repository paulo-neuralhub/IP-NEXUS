// ============================================
// src/components/legal-ops/ClientTimeline.tsx
// ============================================

import { useClientTimeline, TimelineEvent } from '@/hooks/legal-ops/useClientTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mail, MessageSquare, Phone, FileText, Clock, Calendar,
  Play, ChevronDown, Filter
} from 'lucide-react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useMemo } from 'react';

interface ClientTimelineProps {
  clientId: string;
}

const CHANNEL_FILTERS = [
  { id: 'email', label: 'Emails', icon: Mail },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { id: 'phone', label: 'Llamadas', icon: Phone },
  { id: 'document', label: 'Documentos', icon: FileText },
  { id: 'deadline', label: 'Vencimientos', icon: Clock },
];

export function ClientTimeline({ clientId }: ClientTimelineProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage,
    isFetchingNextPage 
  } = useClientTimeline(clientId, {
    channels: activeFilters.filter(f => ['email', 'whatsapp', 'phone'].includes(f))
  });

  const events = useMemo(() => {
    return data?.pages.flatMap(page => page.events) || [];
  }, [data]);

  // Agrupar eventos por fecha
  const groupedEvents = useMemo(() => {
    const groups: { date: Date; events: TimelineEvent[] }[] = [];
    let currentGroup: typeof groups[0] | null = null;

    events.forEach(event => {
      const eventDate = new Date(event.timestamp);
      
      if (!currentGroup || !isSameDay(currentGroup.date, eventDate)) {
        currentGroup = { date: eventDate, events: [] };
        groups.push(currentGroup);
      }
      
      currentGroup.events.push(event);
    });

    return groups;
  }, [events]);

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return 'Hoy';
    if (isYesterday(date)) return 'Ayer';
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Timeline</CardTitle>
          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Filtros:</span>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mt-2">
          {CHANNEL_FILTERS.map(filter => {
            const Icon = filter.icon;
            const isActive = activeFilters.includes(filter.id);
            
            return (
              <Button
                key={filter.id}
                variant={isActive ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => toggleFilter(filter.id)}
                className="h-7"
              >
                <Icon className="w-3 h-3 mr-1" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              Cargando timeline...
            </div>
          ) : events.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No hay actividad registrada
            </div>
          ) : (
            <div className="relative">
              {/* Línea vertical */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

              {groupedEvents.map((group, groupIdx) => (
                <div key={groupIdx}>
                  {/* Cabecera de fecha */}
                  <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-6 py-2 border-b">
                    <span className="text-sm font-medium">
                      {formatDateHeader(group.date)}
                    </span>
                  </div>

                  {/* Eventos del día */}
                  <div className="py-2">
                    {group.events.map((event) => (
                      <TimelineEventItem key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Cargar más */}
              {hasNextPage && (
                <div className="p-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Componente para cada evento
interface TimelineEventItemProps {
  event: TimelineEvent;
}

function TimelineEventItem({ event }: TimelineEventItemProps) {
  const getIcon = () => {
    switch (event.type) {
      case 'communication':
        const channel = event.metadata.channel as string;
        if (channel === 'email') return <Mail className="w-4 h-4" />;
        if (channel === 'whatsapp') return <MessageSquare className="w-4 h-4 text-green-500" />;
        if (channel === 'phone') return <Phone className="w-4 h-4" />;
        return <MessageSquare className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'deadline':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative pl-12 pr-6 py-2 hover:bg-muted/50 transition-colors cursor-pointer">
      {/* Punto en la línea */}
      <div className="absolute left-[18px] top-4 w-3 h-3 rounded-full bg-background border-2 border-primary" />
      
      {/* Icono */}
      <div className="absolute left-[34px] top-3">
        {getIcon()}
      </div>

      {/* Contenido */}
      <div className="ml-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{event.title}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(event.timestamp), 'HH:mm')}
          </span>
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
            {event.description}
          </p>
        )}

        {/* Metadata badges */}
        <div className="flex items-center gap-1 mt-1">
          {event.metadata.category && (
            <Badge variant="outline" className="text-xs h-5">
              {event.metadata.category as string}
            </Badge>
          )}
          {event.metadata.has_transcription && (
            <Badge variant="secondary" className="text-xs h-5">
              <Play className="w-2.5 h-2.5 mr-0.5" />
              Transcripción
            </Badge>
          )}
          {event.metadata.has_attachments && (
            <Badge variant="secondary" className="text-xs h-5">
              <FileText className="w-2.5 h-2.5 mr-0.5" />
              Adjuntos
            </Badge>
          )}
          {!event.metadata.is_read && event.type === 'communication' && (
            <Badge variant="destructive" className="text-xs h-5">
              Nuevo
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
