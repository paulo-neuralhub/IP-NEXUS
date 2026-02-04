/**
 * TimelineProfesional - Timeline estilo Linear/Notion
 * 
 * Features:
 * - Línea vertical conectora
 * - Separadores de fecha claros (HOY, AYER, fechas)
 * - Iconos diferenciados por tipo con colores
 * - Filtros por tipo con contadores
 * - Búsqueda integrada
 * - Items expandibles con acciones contextuales
 */

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Mail, Phone, MessageSquare, StickyNote, Calendar, FileText,
  Zap, Clock, Loader2, ChevronDown, ChevronRight, Download,
  ArrowDownLeft, ArrowUpRight, Search, RefreshCw, CheckSquare,
  Reply, Forward, Eye, ExternalLink, Headphones, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface TimelineProfesionalProps {
  matterId: string;
  className?: string;
  maxHeight?: string;
  onOpenCommunication?: (id: string) => void;
  onOpenDocument?: (id: string, filePath?: string) => void;
  onOpenTask?: (id: string) => void;
}

type TimelineItemType = 
  | 'email' 
  | 'call' 
  | 'whatsapp' 
  | 'sms'
  | 'phone'
  | 'note'
  | 'meeting' 
  | 'task'
  | 'document' 
  | 'phase_change' 
  | 'deadline'
  | 'system';

interface TimelineItem {
  id: string;
  type: TimelineItemType;
  direction?: 'inbound' | 'outbound' | 'internal';
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
  source: string;
}

// Visual configuration per type - using semantic colors
const TYPE_CONFIG: Record<TimelineItemType, { 
  icon: React.ElementType; 
  colorClass: string;
  bgClass: string;
  borderClass: string;
  label: string;
  emoji: string;
}> = {
  email: { 
    icon: Mail, 
    colorClass: 'text-blue-600 dark:text-blue-400', 
    bgClass: 'bg-blue-100 dark:bg-blue-900/50',
    borderClass: 'border-blue-200 dark:border-blue-800',
    label: 'Email',
    emoji: '📧'
  },
  call: { 
    icon: Phone, 
    colorClass: 'text-purple-600 dark:text-purple-400', 
    bgClass: 'bg-purple-100 dark:bg-purple-900/50',
    borderClass: 'border-purple-200 dark:border-purple-800',
    label: 'Llamada',
    emoji: '📞'
  },
  phone: { 
    icon: Phone, 
    colorClass: 'text-purple-600 dark:text-purple-400', 
    bgClass: 'bg-purple-100 dark:bg-purple-900/50',
    borderClass: 'border-purple-200 dark:border-purple-800',
    label: 'Llamada',
    emoji: '📞'
  },
  whatsapp: { 
    icon: MessageSquare, 
    colorClass: 'text-green-600 dark:text-green-400', 
    bgClass: 'bg-green-100 dark:bg-green-900/50',
    borderClass: 'border-green-200 dark:border-green-800',
    label: 'WhatsApp',
    emoji: '💬'
  },
  sms: { 
    icon: MessageSquare, 
    colorClass: 'text-amber-600 dark:text-amber-400', 
    bgClass: 'bg-amber-100 dark:bg-amber-900/50',
    borderClass: 'border-amber-200 dark:border-amber-800',
    label: 'SMS',
    emoji: '📱'
  },
  note: { 
    icon: StickyNote, 
    colorClass: 'text-amber-600 dark:text-amber-400', 
    bgClass: 'bg-amber-100 dark:bg-amber-900/50',
    borderClass: 'border-amber-200 dark:border-amber-800',
    label: 'Nota',
    emoji: '📝'
  },
  meeting: { 
    icon: Calendar, 
    colorClass: 'text-cyan-600 dark:text-cyan-400', 
    bgClass: 'bg-cyan-100 dark:bg-cyan-900/50',
    borderClass: 'border-cyan-200 dark:border-cyan-800',
    label: 'Reunión',
    emoji: '📅'
  },
  task: { 
    icon: CheckSquare, 
    colorClass: 'text-emerald-600 dark:text-emerald-400', 
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/50',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    label: 'Tarea',
    emoji: '✅'
  },
  document: { 
    icon: FileText, 
    colorClass: 'text-orange-600 dark:text-orange-400', 
    bgClass: 'bg-orange-100 dark:bg-orange-900/50',
    borderClass: 'border-orange-200 dark:border-orange-800',
    label: 'Documento',
    emoji: '📄'
  },
  phase_change: { 
    icon: Zap, 
    colorClass: 'text-indigo-600 dark:text-indigo-400', 
    bgClass: 'bg-indigo-100 dark:bg-indigo-900/50',
    borderClass: 'border-indigo-200 dark:border-indigo-800',
    label: 'Cambio fase',
    emoji: '⚡'
  },
  deadline: { 
    icon: Bell, 
    colorClass: 'text-red-600 dark:text-red-400', 
    bgClass: 'bg-red-100 dark:bg-red-900/50',
    borderClass: 'border-red-200 dark:border-red-800',
    label: 'Plazo',
    emoji: '🔔'
  },
  system: { 
    icon: Clock, 
    colorClass: 'text-slate-600 dark:text-slate-400', 
    bgClass: 'bg-slate-100 dark:bg-slate-900/50',
    borderClass: 'border-slate-200 dark:border-slate-800',
    label: 'Sistema',
    emoji: '🔄'
  },
};

export function TimelineProfesional({ 
  matterId, 
  className,
  maxHeight = '600px',
  onOpenCommunication,
  onOpenDocument,
  onOpenTask,
}: TimelineProfesionalProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Handle opening timeline items
  const handleOpenItem = (item: TimelineItem) => {
    switch (item.type) {
      case 'email':
      case 'whatsapp':
      case 'call':
      case 'sms':
      case 'phone':
        if (item.source === 'communications' && onOpenCommunication) {
          onOpenCommunication(item.id);
        }
        break;
      case 'document':
        if (onOpenDocument) {
          onOpenDocument(item.id, item.metadata?.file_path);
        }
        break;
      case 'task':
        if (onOpenTask) {
          onOpenTask(item.id);
        }
        break;
      default:
        // For system/phase_change/deadline events, just log or do nothing
        console.log('Opening item:', item.type, item.id);
    }
  };

  // Fetch all timeline data
  const { data: timelineData, isLoading, refetch } = useQuery({
    queryKey: ['timeline-profesional', matterId],
    queryFn: async () => {
      const [comms, activities, events] = await Promise.all([
        supabase
          .from('communications')
          .select('*')
          .eq('matter_id', matterId)
          .order('received_at', { ascending: false })
          .limit(50),
        supabase
          .from('activities')
          .select('*')
          .eq('matter_id', matterId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('matter_timeline')
          .select('*')
          .eq('matter_id', matterId)
          .order('event_date', { ascending: false })
          .limit(30)
      ]);

      return { 
        comms: comms.data || [], 
        activities: activities.data || [], 
        events: events.data || [] 
      };
    },
    enabled: !!matterId,
    staleTime: 30000,
  });

  // Normalize and combine all items
  const unifiedItems = useMemo(() => {
    const items: TimelineItem[] = [];

    // Map communications
    timelineData?.comms?.forEach((comm: any) => {
      const channelType = (comm.channel || 'email') as TimelineItemType;
      items.push({
        id: comm.id,
        type: channelType === 'phone' ? 'call' : channelType,
        direction: comm.direction,
        title: comm.subject || getCommTitle(comm),
        description: comm.body_preview || comm.body?.substring(0, 200),
        timestamp: comm.received_at || comm.created_at,
        metadata: {
          from: comm.email_from || comm.whatsapp_from || comm.phone_from,
          to: comm.email_to,
          duration: comm.phone_duration_seconds,
        },
        source: 'communications',
      });
    });

    // Map activities
    timelineData?.activities?.forEach((activity: any) => {
      const actType = mapActivityType(activity.type);
      items.push({
        id: activity.id,
        type: actType,
        direction: activity.direction,
        title: activity.subject || getActivityTitle(activity),
        description: activity.content,
        timestamp: activity.meeting_start || activity.created_at,
        metadata: {
          meeting_location: activity.meeting_location,
          call_duration: activity.call_duration,
          call_outcome: activity.call_outcome,
        },
        source: 'activities',
      });
    });

    // Map timeline events
    timelineData?.events?.forEach((event: any) => {
      items.push({
        id: event.id,
        type: mapEventType(event.event_type),
        title: event.title || event.event_type,
        description: event.description,
        timestamp: event.event_date || event.created_at,
        metadata: event.metadata,
        source: 'timeline',
      });
    });

    // Sort by timestamp descending
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return items;
  }, [timelineData]);

  // Filter items
  const filteredItems = useMemo(() => {
    return unifiedItems.filter(item => {
      const matchesFilter = filter === 'all' || item.type === filter;
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [unifiedItems, filter, searchQuery]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, TimelineItem[]> = {};
    
    filteredItems.forEach(item => {
      const dateKey = format(new Date(item.timestamp), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    return groups;
  }, [filteredItems]);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Count by type
  const countByType = useMemo(() => {
    const counts: Record<string, number> = {};
    unifiedItems.forEach(item => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return counts;
  }, [unifiedItems]);

  const toggleExpand = (id: string) => {
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

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'HOY';
    if (isYesterday(date)) return 'AYER';
    return format(date, "d 'de' MMMM", { locale: es }).toUpperCase();
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Historial Completo
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 w-36 text-sm"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs shrink-0"
            onClick={() => setFilter('all')}
          >
            Todos
            <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
              {unifiedItems.length}
            </Badge>
          </Button>

          {Object.entries(TYPE_CONFIG).map(([type, config]) => {
            const count = countByType[type] || 0;
            if (count === 0) return null;
            
            return (
              <Button
                key={type}
                variant={filter === type ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs shrink-0"
                onClick={() => setFilter(type)}
              >
                <span className="mr-1">{config.emoji}</span>
                {config.label}
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "ml-1.5 h-4 px-1 text-[10px]",
                    filter === type && "bg-background/20"
                  )}
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">
                {searchQuery || filter !== 'all'
                  ? 'No hay resultados'
                  : 'No hay actividad registrada'
                }
              </p>
              <p className="text-sm mt-1">
                Las comunicaciones y eventos aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="px-4 pb-4">
              {sortedDates.map((dateKey) => {
                const items = groupedByDate[dateKey];
                
                return (
                  <div key={dateKey} className="mt-6 first:mt-2">
                    {/* Date separator - prominent style */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs font-bold tracking-wider text-muted-foreground px-3 py-1 bg-muted rounded-full">
                        {formatDateHeader(dateKey)}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Timeline items with vertical line */}
                    <div className="relative pl-6">
                      {/* Vertical connecting line */}
                      <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border rounded-full" />

                      <div className="space-y-3">
                        {items.map((item, idx) => (
                          <TimelineItemCard
                            key={`${item.source}-${item.id}`}
                            item={item}
                            expanded={expandedItems.has(item.id)}
                            onToggleExpand={() => toggleExpand(item.id)}
                            isLast={idx === items.length - 1}
                            onOpenItem={handleOpenItem}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Load more */}
              {filteredItems.length >= 20 && (
                <div className="text-center mt-6 pt-4 border-t">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Cargar más antiguo
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

// Individual timeline item card
interface TimelineItemCardProps {
  item: TimelineItem;
  expanded: boolean;
  onToggleExpand: () => void;
  isLast: boolean;
  onOpenItem?: (item: TimelineItem) => void;
}

function TimelineItemCard({ item, expanded, onToggleExpand, isLast, onOpenItem }: TimelineItemCardProps) {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
  const Icon = config.icon;
  const hasContent = !!(item.description && item.description.length > 0);

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenItem?.(item);
  };

  const DirectionIcon = item.direction === 'inbound' 
    ? ArrowDownLeft 
    : item.direction === 'outbound' 
    ? ArrowUpRight 
    : null;

  return (
    <Collapsible open={expanded} onOpenChange={onToggleExpand}>
      <div className="relative">
        {/* Timeline node */}
        <div className={cn(
          "absolute -left-6 top-3 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all",
          config.bgClass,
          "border-2 border-background shadow-sm",
          expanded && "scale-110 ring-2 ring-primary/20"
        )}>
          <Icon className={cn("h-3 w-3", config.colorClass)} />
        </div>

        {/* Card content */}
        <CollapsibleTrigger asChild>
          <div className={cn(
            "ml-3 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden",
            "hover:shadow-md hover:border-primary/30",
            config.borderClass,
            expanded && "ring-2 ring-primary/20 shadow-md"
          )}>
            {/* Header - always visible */}
            <div className={cn(
              "p-3",
              expanded && "border-b bg-muted/30"
            )}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Time + Type + Direction */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">
                      {format(new Date(item.timestamp), 'HH:mm')}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-[10px] h-5 px-1.5",
                        config.bgClass,
                        config.colorClass
                      )}
                    >
                      {config.label}
                    </Badge>
                    {item.direction && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] h-5 px-1.5",
                          item.direction === 'inbound' 
                            ? 'text-green-600 border-green-200' 
                            : 'text-blue-600 border-blue-200'
                        )}
                      >
                        {DirectionIcon && <DirectionIcon className="h-2.5 w-2.5 mr-0.5" />}
                        {item.direction === 'inbound' ? 'Recibido' : 'Enviado'}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <p className="font-semibold text-sm line-clamp-1">
                    {item.title}
                  </p>

                  {/* Preview when collapsed */}
                  {!expanded && item.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  )}

                  {/* Metadata badges */}
                  {item.metadata?.duration && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 mt-2">
                      ⏱️ {formatDuration(item.metadata.duration)}
                    </Badge>
                  )}
                </div>

                {/* Expand indicator */}
                {hasContent && (
                  <div className={cn(
                    "shrink-0 p-1 rounded transition-transform duration-200",
                    expanded && "rotate-180"
                  )}>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Expanded content */}
        <CollapsibleContent>
          <div className="ml-3 px-4 py-3 bg-muted/20 rounded-b-xl border border-t-0 border-muted">
            {/* Full content */}
            {item.description && (
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {/* Document metadata */}
            {item.type === 'document' && item.metadata && (
              <div className="flex items-center gap-3 p-2 bg-background rounded-lg border mt-3">
                <div className={cn("p-2 rounded-lg", config.bgClass)}>
                  <FileText className={cn("h-5 w-5", config.colorClass)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {item.metadata.fileName || 'Documento'}
                  </p>
                  {item.metadata.fileSize && (
                    <p className="text-xs text-muted-foreground">
                      {Math.round(item.metadata.fileSize / 1024)} KB
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              {(item.type === 'email' || item.type === 'whatsapp') && (
                <>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Reply className="h-3 w-3 mr-1" />
                    Responder
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Forward className="h-3 w-3 mr-1" />
                    Reenviar
                  </Button>
                </>
              )}

              {item.type === 'document' && (
                <>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Descargar
                  </Button>
                </>
              )}

              {item.type === 'call' && item.metadata?.recordingUrl && (
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Headphones className="h-3 w-3 mr-1" />
                  Escuchar
                </Button>
              )}

              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs ml-auto"
                onClick={handleOpenClick}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Helper functions
function getCommTitle(comm: any): string {
  const type = comm.channel || 'Comunicación';
  const direction = comm.direction === 'inbound' ? 'recibido' : 'enviado';
  return `${type} ${direction}`;
}

function getActivityTitle(activity: any): string {
  switch (activity.type) {
    case 'note': return 'Nota añadida';
    case 'meeting': return 'Reunión';
    case 'call': return 'Llamada';
    case 'task': return 'Tarea';
    default: return activity.type;
  }
}

function mapActivityType(type: string): TimelineItemType {
  const mapping: Record<string, TimelineItemType> = {
    note: 'note',
    meeting: 'meeting',
    call: 'call',
    task: 'task',
    email: 'email',
    whatsapp: 'whatsapp',
  };
  return mapping[type] || 'system';
}

function mapEventType(type: string): TimelineItemType {
  if (type?.includes('phase') || type?.includes('status')) return 'phase_change';
  if (type?.includes('document')) return 'document';
  if (type?.includes('deadline')) return 'deadline';
  return 'system';
}

function formatDuration(seconds: number): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
