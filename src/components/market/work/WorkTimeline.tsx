// src/components/market/work/WorkTimeline.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  MessageSquare, 
  FileText, 
  CreditCard, 
  Star,
  Clock,
  Circle
} from 'lucide-react';
import { useWorkTimeline, type TimelineEvent } from '@/hooks/market/useWorkflow';

interface WorkTimelineProps {
  transactionId: string;
}

const EVENT_ICONS = {
  status_change: CheckCircle,
  message: MessageSquare,
  file: FileText,
  payment: CreditCard,
  review: Star,
};

const EVENT_COLORS = {
  status_change: 'text-primary bg-primary/10',
  message: 'text-blue-500 bg-blue-500/10',
  file: 'text-amber-500 bg-amber-500/10',
  payment: 'text-emerald-500 bg-emerald-500/10',
  review: 'text-yellow-500 bg-yellow-500/10',
};

export function WorkTimeline({ transactionId }: WorkTimelineProps) {
  const { data: events = [], isLoading } = useWorkTimeline(transactionId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline del Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline del Trabajo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-6">
            {events.map((event, index) => {
              const Icon = EVENT_ICONS[event.type];
              const colorClass = EVENT_COLORS[event.type];
              const isLast = index === events.length - 1;

              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={cn(
                    'relative z-10 flex items-center justify-center w-8 h-8 rounded-full',
                    colorClass
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{event.title}</p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 truncate">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(event.timestamp), 'dd MMM HH:mm', { locale: es })}
                      </time>
                    </div>

                    {event.user && (
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={event.user.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {event.user.display_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {event.user.display_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {events.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay eventos en el timeline</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
