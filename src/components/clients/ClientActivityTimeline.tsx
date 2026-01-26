/**
 * ClientActivityTimeline - Timeline de actividad del cliente
 * Muestra todas las actividades: comunicaciones, expedientes, documentos, facturas
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mail, MessageSquare, Phone, FileText, Clock, Calendar,
  ChevronDown, Filter, Briefcase, Receipt, Globe, PenLine
} from 'lucide-react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ClientActivityTimelineProps {
  clientId: string;
}

interface ActivityEvent {
  id: string;
  type: 'communication' | 'matter' | 'document' | 'invoice' | 'note' | 'deadline';
  timestamp: string;
  title: string;
  description?: string;
  metadata: Record<string, unknown>;
}

const ACTIVITY_FILTERS = [
  { id: 'all', label: 'Todo', icon: Calendar },
  { id: 'communication', label: 'Comunicaciones', icon: MessageSquare },
  { id: 'matter', label: 'Expedientes', icon: Briefcase },
  { id: 'document', label: 'Documentos', icon: FileText },
];

const PAGE_SIZE = 30;

export function ClientActivityTimeline({ clientId }: ClientActivityTimelineProps) {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['client-activity-timeline', clientId, activeFilter, currentOrganization?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const events: ActivityEvent[] = [];

      // 1. Obtener comunicaciones
      if (activeFilter === 'all' || activeFilter === 'communication') {
        const { data: comms } = await supabase
          .from('communications')
          .select('id, channel, direction, subject, body_preview, received_at, created_at')
          .eq('client_id', clientId)
          .eq('organization_id', currentOrganization.id)
          .order('received_at', { ascending: false })
          .range(pageParam, pageParam + PAGE_SIZE - 1);

        (comms || []).forEach(c => {
          events.push({
            id: `comm-${c.id}`,
            type: 'communication',
            timestamp: c.received_at || c.created_at,
            title: c.subject || `${c.channel} ${c.direction === 'inbound' ? 'recibido' : 'enviado'}`,
            description: c.body_preview || undefined,
            metadata: {
              channel: c.channel,
              direction: c.direction,
              originalId: c.id
            }
          });
        });
      }

      // 2. Obtener expedientes (matters) del cliente
      if (activeFilter === 'all' || activeFilter === 'matter') {
        const { data: matters } = await supabase
          .from('matters')
          .select('id, reference, title, type, status, created_at')
          .eq('organization_id', currentOrganization.id)
          .order('created_at', { ascending: false })
          .range(pageParam, pageParam + PAGE_SIZE - 1);

        // Filtrar los que pertenecen al cliente (owner_name match o contacts vinculados)
        (matters || []).forEach(m => {
          events.push({
            id: `matter-${m.id}`,
            type: 'matter',
            timestamp: m.created_at,
            title: `${m.reference}: ${m.title}`,
            description: `Expediente ${m.type} - ${m.status}`,
            metadata: {
              type: m.type,
              status: m.status,
              originalId: m.id
            }
          });
        });
      }

      // 3. Obtener documentos del cliente
      if (activeFilter === 'all' || activeFilter === 'document') {
        const { data: docs } = await supabase
          .from('client_documents')
          .select('id, file_name, title, doc_type, created_at')
          .eq('client_id', clientId)
          .eq('organization_id', currentOrganization.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .range(pageParam, pageParam + PAGE_SIZE - 1);

        (docs || []).forEach(d => {
          events.push({
            id: `doc-${d.id}`,
            type: 'document',
            timestamp: d.created_at,
            title: d.title || d.file_name,
            description: d.doc_type || 'Documento',
            metadata: {
              docType: d.doc_type,
              originalId: d.id
            }
          });
        });
      }

      // Ordenar por timestamp
      events.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return {
        events: events.slice(0, PAGE_SIZE),
        nextCursor: events.length >= PAGE_SIZE ? pageParam + PAGE_SIZE : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!clientId && !!currentOrganization?.id
  });

  const events = useMemo(() => {
    return data?.pages.flatMap(page => page.events) || [];
  }, [data]);

  // Agrupar eventos por fecha
  const groupedEvents = useMemo(() => {
    const groups: { date: Date; events: ActivityEvent[] }[] = [];
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

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return 'Hoy';
    if (isYesterday(date)) return 'Ayer';
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const handleEventClick = (event: ActivityEvent) => {
    const originalId = event.metadata.originalId as string;
    
    switch (event.type) {
      case 'communication':
        navigate(`/app/communications/${originalId}`);
        break;
      case 'matter':
        navigate(`/app/docket/${originalId}`);
        break;
      case 'document':
        // TODO: Abrir vista de documento
        break;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Actividad Reciente
          </CardTitle>
          <Badge variant="secondary">{events.length}</Badge>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-1 mt-2">
          {ACTIVITY_FILTERS.map(filter => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            
            return (
              <Button
                key={filter.id}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className="h-7 gap-1"
              >
                <Icon className="w-3 h-3" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              Cargando actividad...
            </div>
          ) : events.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hay actividad registrada</p>
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
                      <ActivityEventItem
                        key={event.id}
                        event={event}
                        onClick={() => handleEventClick(event)}
                      />
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
interface ActivityEventItemProps {
  event: ActivityEvent;
  onClick: () => void;
}

function ActivityEventItem({ event, onClick }: ActivityEventItemProps) {
  const getIcon = () => {
    switch (event.type) {
      case 'communication':
        const channel = event.metadata.channel as string;
        if (channel === 'email') return <Mail className="w-4 h-4" />;
        if (channel === 'whatsapp') return <MessageSquare className="w-4 h-4 text-[hsl(var(--ip-action-whatsapp-text))]" />;
        if (channel === 'phone') return <Phone className="w-4 h-4 text-primary" />;
        if (channel === 'portal') return <Globe className="w-4 h-4 text-primary" />;
        return <MessageSquare className="w-4 h-4" />;
      case 'matter':
        return <Briefcase className="w-4 h-4 text-primary" />;
      case 'document':
        return <FileText className="w-4 h-4 text-primary" />;
      case 'invoice':
        return <Receipt className="w-4 h-4 text-[hsl(var(--ip-success-text))]" />;
      case 'note':
        return <PenLine className="w-4 h-4 text-[hsl(var(--ip-pending-text))]" />;
      case 'deadline':
        return <Clock className="w-4 h-4 text-destructive" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeColor = () => {
    switch (event.type) {
      case 'communication':
        return 'bg-primary/10';
      case 'matter':
        return 'bg-primary/10';
      case 'document':
        return 'bg-secondary/50';
      case 'invoice':
        return 'bg-[hsl(var(--ip-success-bg))]';
      default:
        return 'bg-muted';
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full pl-12 pr-6 py-2 text-left hover:bg-muted/50 transition-colors cursor-pointer"
    >
      {/* Punto en la línea */}
      <div className={cn(
        "absolute left-[18px] top-4 w-3 h-3 rounded-full border-2 border-background",
        getTypeColor()
      )} />
      
      {/* Icono */}
      <div className="absolute left-[34px] top-3">
        {getIcon()}
      </div>

      {/* Contenido */}
      <div className="ml-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium line-clamp-1">{event.title}</span>
          <span className="text-xs text-muted-foreground shrink-0 ml-2">
            {format(new Date(event.timestamp), 'HH:mm')}
          </span>
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
            {event.description}
          </p>
        )}

        {/* Type badge */}
        <Badge variant="outline" className="mt-1 h-5 text-xs capitalize">
          {event.type === 'communication' ? event.metadata.channel as string : event.type}
        </Badge>
      </div>
    </button>
  );
}

export default ClientActivityTimeline;
