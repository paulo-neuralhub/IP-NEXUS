// ============================================
// src/components/shared/ActivityTimeline.tsx
// Unified activity timeline for matters and clients
// ============================================

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FilePlus, Edit, RefreshCw, CalendarPlus, CalendarCheck, Calendar,
  FileUp, FileX, UserPlus, UserMinus, ListPlus, StickyNote,
  Receipt, Send, CheckCircle, CircleDot, XCircle, FileText,
  ArrowRightCircle, Wallet, Mail, Inbox, Phone, Users,
  MessageCircle, ListTodo, CheckSquare, UserCheck, Bell,
  AlertTriangle, Upload, ExternalLink, Filter, Download, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  useMatterActivity,
  useClientActivity,
  groupActivitiesByDate,
  type ActivityLog,
  type GroupedActivities,
} from '@/hooks/legal-ops/useActivityLog';
import { cn } from '@/lib/utils';

const ACTION_ICONS: Record<string, React.ElementType> = {
  matter_created: FilePlus,
  matter_updated: Edit,
  status_changed: RefreshCw,
  deadline_added: CalendarPlus,
  deadline_completed: CalendarCheck,
  deadline_updated: Calendar,
  document_uploaded: FileUp,
  document_deleted: FileX,
  party_added: UserPlus,
  party_removed: UserMinus,
  class_added: ListPlus,
  note_added: StickyNote,
  invoice_created: Receipt,
  invoice_line_added: ListPlus,
  invoice_sent: Send,
  invoice_paid: CheckCircle,
  invoice_partial: CircleDot,
  invoice_cancelled: XCircle,
  quote_created: FileText,
  quote_sent: Send,
  quote_accepted: CheckCircle,
  quote_rejected: XCircle,
  quote_converted: ArrowRightCircle,
  cost_recorded: Wallet,
  email_sent: Mail,
  email_received: Inbox,
  call_logged: Phone,
  meeting_logged: Users,
  whatsapp_sent: MessageCircle,
  whatsapp_received: MessageCircle,
  task_created: ListTodo,
  task_completed: CheckSquare,
  task_assigned: UserCheck,
  reminder_sent: Bell,
  deadline_warning: AlertTriangle,
  auto_renewal: RefreshCw,
  import_completed: Upload,
  sync_completed: RefreshCw,
};

const CATEGORY_COLORS: Record<string, string> = {
  billing: 'text-emerald-600',
  communication: 'text-blue-600',
  document: 'text-purple-600',
  status: 'text-primary',
  task: 'text-amber-600',
  party: 'text-pink-600',
  deadline: 'text-orange-600',
  system: 'text-muted-foreground',
  note: 'text-slate-600',
  other: 'text-muted-foreground',
};

const CATEGORY_LABELS: Record<string, string> = {
  billing: 'Facturación',
  communication: 'Comunicaciones',
  document: 'Documentos',
  status: 'Estado',
  task: 'Tareas',
  party: 'Partes',
  deadline: 'Plazos',
  system: 'Sistema',
  note: 'Notas',
  other: 'Otros',
};

interface ActivityTimelineProps {
  entityType: 'matter' | 'client';
  entityId: string;
  showFilters?: boolean;
  showExport?: boolean;
  limit?: number;
  compact?: boolean;
}

export function ActivityTimeline({
  entityType,
  entityId,
  showFilters = true,
  showExport = false,
  limit,
  compact = false,
}: ActivityTimelineProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  // Fetch based on entity type
  const matterQuery = useMatterActivity(entityType === 'matter' ? entityId : '', { limit });
  const clientQuery = useClientActivity(entityType === 'client' ? entityId : '', { limit });

  const { data: activities, isLoading, error } = entityType === 'matter' ? matterQuery : clientQuery;

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    if (selectedCategories.size === 0) return activities;
    return activities.filter(a => selectedCategories.has(a.action_category || 'other'));
  }, [activities, selectedCategories]);

  // Group by date
  const groupedActivities = useMemo(
    () => groupActivitiesByDate(filteredActivities),
    [filteredActivities]
  );

  // Get unique categories for filter
  const availableCategories = useMemo(() => {
    if (!activities) return [];
    const cats = new Set(activities.map(a => a.action_category || 'other'));
    return Array.from(cats).sort();
  }, [activities]);

  const toggleCategory = (category: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setSelectedCategories(newSet);
  };

  if (isLoading) {
    return <ActivityTimelineSkeleton compact={compact} />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Error al cargar el historial
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      {(showFilters || showExport) && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Historial</h3>
          <div className="flex gap-2">
            {showFilters && availableCategories.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                    {selectedCategories.size > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {selectedCategories.size}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Categorías</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableCategories.map(cat => (
                    <DropdownMenuCheckboxItem
                      key={cat}
                      checked={selectedCategories.has(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                    >
                      {CATEGORY_LABELS[cat] || cat}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {selectedCategories.size > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={false}
                        onCheckedChange={() => setSelectedCategories(new Set())}
                      >
                        Limpiar filtros
                      </DropdownMenuCheckboxItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {showExport && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      {groupedActivities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Eye className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              No hay actividad registrada
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedActivities.map(group => (
            <div key={group.date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {group.label}
                </span>
              </div>
              <div className={cn('space-y-1', !compact && 'ml-2 border-l-2 border-border pl-4')}>
                {group.activities.map(activity => (
                  <ActivityRow 
                    key={activity.id} 
                    activity={activity} 
                    compact={compact}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ActivityRowProps {
  activity: ActivityLog;
  compact?: boolean;
}

function ActivityRow({ activity, compact = false }: ActivityRowProps) {
  const Icon = ACTION_ICONS[activity.action] || Edit;
  const colorClass = CATEGORY_COLORS[activity.action_category || 'other'];
  const time = format(new Date(activity.created_at), 'HH:mm', { locale: es });

  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1.5 text-sm">
        <Icon className={cn('h-4 w-4 shrink-0', colorClass)} />
        <span className="text-muted-foreground">{time}</span>
        <span className="truncate">{activity.title}</span>
        {activity.amount && (
          <Badge variant="secondary" className="ml-auto text-xs shrink-0">
            {activity.amount.toLocaleString('es-ES')} {activity.currency}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex gap-3 py-2 group">
      {/* Timeline dot */}
      <div className={cn(
        'absolute -left-[21px] top-3 h-2.5 w-2.5 rounded-full border-2 bg-background',
        activity.is_system ? 'border-muted-foreground/50' : 'border-primary'
      )} />

      {/* Icon */}
      <div className={cn(
        'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
        activity.is_system ? 'bg-muted' : 'bg-primary/10'
      )}>
        <Icon className={cn('h-4 w-4', activity.is_system ? 'text-muted-foreground' : colorClass)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm">{activity.title}</p>
            {activity.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                {activity.description}
              </p>
            )}
            {activity.old_value && activity.new_value && (
              <p className="text-sm text-muted-foreground mt-0.5">
                <span className="line-through">{activity.old_value}</span>
                {' → '}
                <span className="font-medium text-foreground">{activity.new_value}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activity.amount && (
              <Badge variant="secondary" className="text-xs">
                {activity.amount.toLocaleString('es-ES')} {activity.currency}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{time}</span>
          </div>
        </div>

        {/* Reference link */}
        {activity.reference_number && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-primary"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Ver {activity.reference_number}
          </Button>
        )}

        {/* Creator info */}
        {activity.creator && !activity.is_system && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
            <Avatar className="h-4 w-4">
              <AvatarImage src={activity.creator.avatar_url || undefined} />
              <AvatarFallback className="text-[8px]">
                {activity.creator.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span>{activity.creator.full_name || 'Usuario'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityTimelineSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="space-y-6">
        <div>
          <Skeleton className="h-4 w-16 mb-3" />
          <div className="ml-2 border-l-2 border-border pl-4 space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className={compact ? 'h-6 w-full' : 'h-16 w-full'} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
