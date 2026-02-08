// ============================================
// src/components/legal-ops/ClientTimeline.tsx
// Timeline Interactivo con entradas expandibles
// ============================================

import { useClientTimeline, TimelineEvent } from '@/hooks/legal-ops/useClientTimeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Mail, MessageSquare, Phone, FileText, Clock, Calendar,
  Play, ChevronDown, ChevronUp, Plus, PenLine, Send, 
  ExternalLink, CalendarPlus, Briefcase
} from 'lucide-react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

interface ClientTimelineProps {
  clientId: string;
}

type FilterType = 'all' | 'email' | 'whatsapp' | 'phone' | 'document';

const FILTERS: { id: FilterType; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Todo', icon: Calendar },
  { id: 'email', label: 'Emails', icon: Mail },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { id: 'phone', label: 'Llamadas', icon: Phone },
  { id: 'document', label: 'Docs', icon: FileText },
];

export function ClientTimeline({ clientId }: ClientTimelineProps) {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [quickComment, setQuickComment] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Quick comment mutation
  const addNote = useMutation({
    mutationFn: async (content: string) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('activity_log').insert({
        organization_id: currentOrganization.id,
        client_id: clientId,
        entity_type: 'client',
        entity_id: clientId,
        action: 'note_added',
        title: 'Nota rápida',
        description: content,
        is_internal: true,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-timeline', clientId] });
      setQuickComment('');
      toast.success('Nota añadida');
    },
    onError: () => toast.error('Error al guardar nota'),
  });
  
  const channelFilters = activeFilter !== 'all' && activeFilter !== 'document' 
    ? [activeFilter as 'email' | 'whatsapp' | 'phone'] 
    : undefined;

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage,
    isFetchingNextPage 
  } = useClientTimeline(clientId, {
    channels: channelFilters
  });

  const events = useMemo(() => {
    const allEvents = data?.pages.flatMap(page => page.events) || [];
    
    // Filtrar por tipo si es documento
    if (activeFilter === 'document') {
      return allEvents.filter(e => e.type === 'document');
    }
    
    return allEvents;
  }, [data, activeFilter]);

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

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return 'Hoy';
    if (isYesterday(date)) return 'Ayer';
    return format(date, "d 'de' MMMM", { locale: es });
  };

  const handleQuickComment = () => {
    if (!quickComment.trim()) return;
    addNote.mutate(quickComment.trim());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Input rápido */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex gap-2">
          <Input 
            placeholder="Comentario rápido..." 
            value={quickComment}
            onChange={e => setQuickComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleQuickComment()}
            className="h-8 text-sm"
          />
          <Button 
            size="sm" 
            className="h-8 px-3 shrink-0"
            onClick={handleQuickComment}
            disabled={!quickComment.trim() || addNote.isPending}
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
        
        {/* Filtros */}
        <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
          {FILTERS.map(filter => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            
            return (
              <Button
                key={filter.id}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className="h-6 px-2 text-xs shrink-0"
              >
                <Icon className="w-3 h-3 mr-1" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">
            Cargando timeline...
          </div>
        ) : events.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay actividad registrada</p>
          </div>
        ) : (
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

            {groupedEvents.map((group, groupIdx) => (
              <div key={groupIdx}>
                {/* Separador de fecha */}
                <div className="relative flex items-center gap-3 px-4 py-2">
                  <div className="absolute left-5 w-px h-full bg-border" />
                  <div className="relative z-10 w-2 h-2 rounded-full bg-muted-foreground/30" />
                  <span className="text-xs font-medium text-muted-foreground bg-background px-2">
                    {formatDateHeader(group.date)}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Eventos del día */}
                <div>
                  {group.events.map((event) => (
                    <TimelineEventItem 
                      key={event.id} 
                      event={event}
                      expanded={expandedItems.has(event.id)}
                      onToggle={() => toggleExpanded(event.id)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Cargar más */}
            {hasNextPage && (
              <div className="p-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Cargando...' : 'Ver más'}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para cada evento
interface TimelineEventItemProps {
  event: TimelineEvent;
  expanded: boolean;
  onToggle: () => void;
}

function TimelineEventItem({ event, expanded, onToggle }: TimelineEventItemProps) {
  const isExpandable =
    (event.type === 'communication' && (event.metadata.channel === 'email' || event.description)) ||
    (event.type === 'note' && !!event.description) ||
    (event.type === 'document');

  const getIcon = () => {
    switch (event.type) {
      case 'communication':
        const channel = event.metadata.channel as string;
        if (channel === 'email') return <Mail className="w-4 h-4" />;
        if (channel === 'whatsapp') return <MessageSquare className="w-4 h-4 text-[hsl(var(--ip-action-whatsapp-text))]" />;
        if (channel === 'phone') return <Phone className="w-4 h-4 text-primary" />;
        return <MessageSquare className="w-4 h-4" />;
      case 'note':
        return <PenLine className="w-4 h-4 text-[hsl(var(--ip-pending-text))]" />;
      case 'document':
        return <FileText className="w-4 h-4 text-primary" />;
      case 'deadline':
        return <Clock className="w-4 h-4 text-destructive" />;
      case 'matter':
        return <Briefcase className="w-4 h-4 text-primary" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getDirectionBadge = () => {
    if (event.type !== 'communication') return null;
    const direction = event.metadata.direction as string;
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "h-5 text-[10px]",
          direction === 'inbound' 
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
            : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
        )}
      >
        {direction === 'inbound' ? '← Recibido' : '→ Enviado'}
      </Badge>
    );
  };

  return (
    <div className="relative pl-10 pr-3">
      {/* Punto en la línea */}
      <div className={cn(
        "absolute left-[14px] top-4 w-3 h-3 rounded-full border-2 border-background shadow-sm",
        event.type === 'communication' && event.metadata.channel === 'email' ? "bg-blue-500" :
        event.type === 'communication' && event.metadata.channel === 'whatsapp' ? "bg-emerald-500" :
        event.type === 'communication' && event.metadata.channel === 'phone' ? "bg-amber-500" :
        event.type === 'document' ? "bg-slate-500" :
        event.type === 'deadline' ? "bg-red-500" :
        "bg-primary"
      )} />

      {/* Contenido */}
      <div 
        className={cn(
          "py-2 transition-colors rounded-lg",
          isExpandable && "cursor-pointer hover:bg-muted/50"
        )}
        onClick={isExpandable ? onToggle : undefined}
      >
        {/* Header */}
        <div className="flex items-start gap-2">
          <div className="shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium line-clamp-1">{event.title}</span>
              {getDirectionBadge()}
              {!event.metadata.is_read && event.type === 'communication' && (
                <Badge variant="destructive" className="h-5 text-[10px]">
                  Nuevo
                </Badge>
              )}
            </div>
            
            {/* Preview (solo si no está expandido) */}
            {!expanded && event.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {event.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-muted-foreground">
              {format(new Date(event.timestamp), 'HH:mm')}
            </span>
            {isExpandable && (
              expanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )
            )}
          </div>
        </div>

        {/* Contenido expandido */}
        {expanded && isExpandable && (
          <div className="mt-3 ml-6 p-3 bg-muted/30 rounded-lg border text-sm">
            {/* Body del mensaje */}
            <p className="text-muted-foreground whitespace-pre-wrap">
              {event.description || 'Sin contenido'}
            </p>
            
            {/* Metadata badges */}
            {(event.type === 'communication' && (event.metadata.has_attachments || event.metadata.has_transcription)) && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                {event.metadata.has_attachments && (
                  <Badge variant="secondary" className="text-xs h-5">
                    <FileText className="w-3 h-3 mr-1" />
                    Adjuntos
                  </Badge>
                )}
                {event.metadata.has_transcription && (
                  <Badge variant="secondary" className="text-xs h-5">
                    <Play className="w-3 h-3 mr-1" />
                    Transcripción
                  </Badge>
                )}
              </div>
            )}
            
            {/* Acciones inline */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              {event.type === 'communication' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Extract real ID from prefixed event id (e.g. "comm-uuid")
                    const realId = event.id.replace(/^comm-/, '');
                    window.open(`/app/communications?id=${realId}`, '_blank');
                  }}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Abrir
                </Button>
              )}
              {event.type === 'document' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    const realId = event.id.replace(/^doc-/, '');
                    // Open document download via Supabase storage
                    toast.info('Abriendo documento...');
                    supabase.from('client_documents').select('file_path').eq('id', realId).single().then(({ data }) => {
                      if (data?.file_path) {
                        const { data: urlData } = supabase.storage.from('client-documents').getPublicUrl(data.file_path);
                        window.open(urlData.publicUrl, '_blank');
                      }
                    });
                  }}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Descargar
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 text-xs">
                <PenLine className="w-3 h-3 mr-1" />
                Nota
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
