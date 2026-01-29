/**
 * UnifiedMatterTimeline - Timeline unificado que combina:
 * - Comunicaciones (emails, llamadas, whatsapp)
 * - Actividades (notas, reuniones, tareas)
 * - Eventos del expediente (cambios de estado, documentos)
 * 
 * Vista cronológica completa de todo lo que pasa en un expediente
 */

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Mail, Phone, MessageSquare, StickyNote, Calendar, FileText,
  GitBranch, Clock, Loader2, ChevronDown, ChevronUp, Paperclip,
  ArrowDownLeft, ArrowUpRight, Filter, RefreshCw, CheckSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface UnifiedMatterTimelineProps {
  matterId: string;
  className?: string;
  maxHeight?: string;
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
  | 'workflow' 
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
  source: 'communications' | 'activities' | 'timeline' | 'documents';
}

const TYPE_CONFIG: Record<TimelineItemType, { 
  icon: React.ElementType; 
  colorClass: string;
  bgClass: string;
  label: string;
}> = {
  email: { 
    icon: Mail, 
    colorClass: 'text-primary', 
    bgClass: 'bg-primary/10',
    label: 'Email'
  },
  call: { 
    icon: Phone, 
    colorClass: 'text-success', 
    bgClass: 'bg-success/10',
    label: 'Llamada'
  },
  whatsapp: { 
    icon: MessageSquare, 
    colorClass: 'text-[#25D366]', 
    bgClass: 'bg-[#25D366]/10',
    label: 'WhatsApp'
  },
  sms: { 
    icon: MessageSquare, 
    colorClass: 'text-warning', 
    bgClass: 'bg-warning/10',
    label: 'SMS'
  },
  phone: { 
    icon: Phone, 
    colorClass: 'text-success', 
    bgClass: 'bg-success/10',
    label: 'Llamada'
  },
  note: { 
    icon: StickyNote, 
    colorClass: 'text-warning', 
    bgClass: 'bg-warning/10',
    label: 'Nota'
  },
  meeting: { 
    icon: Calendar, 
    colorClass: 'text-purple-600', 
    bgClass: 'bg-purple-600/10',
    label: 'Reunión'
  },
  task: { 
    icon: CheckSquare, 
    colorClass: 'text-info', 
    bgClass: 'bg-info/10',
    label: 'Tarea'
  },
  document: { 
    icon: FileText, 
    colorClass: 'text-orange-500', 
    bgClass: 'bg-orange-500/10',
    label: 'Documento'
  },
  workflow: { 
    icon: GitBranch, 
    colorClass: 'text-indigo-500', 
    bgClass: 'bg-indigo-500/10',
    label: 'Estado'
  },
  system: { 
    icon: Clock, 
    colorClass: 'text-muted-foreground', 
    bgClass: 'bg-muted',
    label: 'Sistema'
  },
};

export function UnifiedMatterTimeline({ 
  matterId, 
  className,
  maxHeight = '500px'
}: UnifiedMatterTimelineProps) {
  const [filter, setFilter] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Fetch all timeline data from multiple sources
  const { data: timelineData, isLoading, refetch } = useQuery({
    queryKey: ['unified-matter-timeline', matterId],
    queryFn: async () => {
      // Fetch communications
      const { data: comms } = await supabase
        .from('communications')
        .select(`
          id, channel, direction, subject, body_preview, received_at, created_at,
          email_from, email_to, whatsapp_from, phone_from, phone_duration_seconds,
          is_read, created_by
        `)
        .eq('matter_id', matterId)
        .order('received_at', { ascending: false })
        .limit(50);

      // Fetch activities (notes, meetings, tasks)
      const { data: activities } = await supabase
        .from('activities')
        .select(`
          id, type, subject, content, direction, created_at, created_by,
          meeting_start, meeting_end, meeting_location, call_duration, call_outcome,
          metadata
        `)
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch matter timeline events
      const { data: events } = await supabase
        .from('matter_timeline')
        .select('*')
        .eq('matter_id', matterId)
        .order('event_date', { ascending: false })
        .limit(30);

      return { comms, activities, events };
    },
    enabled: !!matterId,
    staleTime: 30000,
  });

  // Normalize and combine all items
  const unifiedItems = useMemo(() => {
    const items: TimelineItem[] = [];

    // Map communications
    timelineData?.comms?.forEach((comm: any) => {
      const channelType = comm.channel as TimelineItemType;
      items.push({
        id: comm.id,
        type: channelType === 'phone' ? 'call' : channelType,
        direction: comm.direction,
        title: comm.subject || getCommTitle(comm),
        description: comm.body_preview,
        timestamp: comm.received_at || comm.created_at,
        metadata: {
          from: comm.email_from || comm.whatsapp_from || comm.phone_from,
          to: comm.email_to,
          duration: comm.phone_duration_seconds,
          is_read: comm.is_read,
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
          ...activity.metadata,
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

    // Filter if needed
    if (filter !== 'all') {
      return items.filter(item => item.type === filter);
    }

    return items;
  }, [timelineData, filter]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, TimelineItem[]> = {};
    
    unifiedItems.forEach(item => {
      const dateKey = format(new Date(item.timestamp), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    return groups;
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
    if (isToday(date)) return 'Hoy';
    if (isYesterday(date)) return 'Ayer';
    return format(date, "d 'de' MMMM", { locale: es });
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Actividad
            <Badge variant="secondary">{unifiedItems.length}</Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32 h-8">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo</SelectItem>
                <SelectItem value="email">📧 Emails</SelectItem>
                <SelectItem value="call">📞 Llamadas</SelectItem>
                <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                <SelectItem value="note">📝 Notas</SelectItem>
                <SelectItem value="meeting">📅 Reuniones</SelectItem>
                <SelectItem value="workflow">🔄 Estados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : unifiedItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay actividad registrada</p>
              <p className="text-sm mt-1">
                Las comunicaciones y eventos aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="px-4 pb-4">
              {Object.entries(groupedByDate).map(([dateKey, items]) => (
                <div key={dateKey} className="mt-4 first:mt-0">
                  {/* Date separator */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-medium text-muted-foreground px-2 bg-background">
                      {formatDateHeader(dateKey)}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {items.map((item) => (
                      <TimelineItemCard
                        key={`${item.source}-${item.id}`}
                        item={item}
                        expanded={expandedItems.has(item.id)}
                        onToggleExpand={() => toggleExpand(item.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
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
}

function TimelineItemCard({ item, expanded, onToggleExpand }: TimelineItemCardProps) {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
  const Icon = config.icon;
  const hasLongDescription = item.description && item.description.length > 100;

  const DirectionIcon = item.direction === 'inbound' 
    ? ArrowDownLeft 
    : item.direction === 'outbound' 
    ? ArrowUpRight 
    : null;

  return (
    <div 
      className={cn(
        "p-3 rounded-lg border transition-colors",
        "hover:bg-muted/30 cursor-pointer"
      )}
      onClick={hasLongDescription ? onToggleExpand : undefined}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          config.bgClass
        )}>
          <Icon className={cn("h-4 w-4", config.colorClass)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {DirectionIcon && (
                <DirectionIcon className={cn(
                  "h-3 w-3 shrink-0",
                  item.direction === 'inbound' ? 'text-success' : 'text-primary'
                )} />
              )}
              <span className="font-medium text-sm truncate">
                {item.title}
              </span>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {format(new Date(item.timestamp), 'HH:mm')}
            </span>
          </div>

          {/* Description */}
          {item.description && (
            <p className={cn(
              "text-sm text-muted-foreground mt-1",
              !expanded && hasLongDescription && "line-clamp-2"
            )}>
              {item.description}
            </p>
          )}

          {/* Metadata badges */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className="text-xs h-5">
              {config.label}
            </Badge>
            
            {item.metadata?.duration && (
              <Badge variant="secondary" className="text-xs h-5">
                {formatDuration(item.metadata.duration)}
              </Badge>
            )}
            
            {item.metadata?.call_outcome && (
              <Badge variant="secondary" className="text-xs h-5">
                {item.metadata.call_outcome}
              </Badge>
            )}

            {item.metadata?.meeting_location && (
              <Badge variant="secondary" className="text-xs h-5">
                📍 {item.metadata.meeting_location}
              </Badge>
            )}
          </div>

          {/* Expand/collapse indicator */}
          {hasLongDescription && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs mt-1 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Ver más
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getCommTitle(comm: any): string {
  if (comm.channel === 'email') {
    return comm.direction === 'inbound' 
      ? `Email de ${comm.email_from || 'desconocido'}`
      : `Email enviado`;
  }
  if (comm.channel === 'whatsapp') {
    return comm.direction === 'inbound'
      ? `WhatsApp de ${comm.whatsapp_from || 'desconocido'}`
      : 'WhatsApp enviado';
  }
  if (comm.channel === 'phone') {
    return comm.direction === 'inbound'
      ? `Llamada de ${comm.phone_from || 'desconocido'}`
      : 'Llamada realizada';
  }
  return 'Comunicación';
}

function getActivityTitle(activity: any): string {
  switch (activity.type) {
    case 'note': return 'Nota añadida';
    case 'meeting': return 'Reunión programada';
    case 'call': return 'Llamada registrada';
    case 'task': return 'Tarea';
    default: return activity.type;
  }
}

function mapActivityType(type: string): TimelineItemType {
  const mapping: Record<string, TimelineItemType> = {
    'note': 'note',
    'meeting': 'meeting',
    'call': 'call',
    'email': 'email',
    'task': 'task',
    'whatsapp': 'whatsapp',
  };
  return mapping[type] || 'system';
}

function mapEventType(type: string): TimelineItemType {
  if (type.includes('status') || type.includes('workflow') || type.includes('phase')) {
    return 'workflow';
  }
  if (type.includes('document')) {
    return 'document';
  }
  return 'system';
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
  }
  return `${secs}s`;
}

export default UnifiedMatterTimeline;
