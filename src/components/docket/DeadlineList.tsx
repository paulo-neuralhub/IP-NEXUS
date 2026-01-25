// ============================================================
// IP-NEXUS - DEADLINE LIST COMPONENT
// PROMPT 52: Docket Deadline Engine
// ============================================================

import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, 
  MoreVertical, ExternalLink, CalendarPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { useDeadlines, MatterDeadline } from '@/hooks/useDeadlines';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface DeadlineListProps {
  matterId?: string;
  limit?: number;
  showFilters?: boolean;
  compact?: boolean;
}

export function DeadlineList({ matterId, limit, showFilters = true, compact = false }: DeadlineListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const navigate = useNavigate();

  const { deadlines, isLoading, markAsCompleted } = useDeadlines({
    matterId,
    status: statusFilter === 'active' ? ['pending', 'upcoming', 'urgent'] : 
            statusFilter === 'all' ? undefined : [statusFilter],
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    limit
  });

  const getDaysUntil = (date: string) => differenceInDays(new Date(date), new Date());

  const getStatusBadge = (status: string | null, daysUntil: number) => {
    if (status === 'completed') {
      return <Badge variant="outline" className="bg-green-50 text-green-700">Completado</Badge>;
    }
    if (status === 'overdue' || daysUntil < 0) {
      return <Badge variant="destructive">Vencido hace {Math.abs(daysUntil)}d</Badge>;
    }
    if (daysUntil === 0) {
      return <Badge variant="destructive">Vence hoy</Badge>;
    }
    if (daysUntil === 1) {
      return <Badge className="bg-orange-500">Vence mañana</Badge>;
    }
    if (daysUntil <= 7) {
      return <Badge className="bg-orange-500">En {daysUntil} días</Badge>;
    }
    if (daysUntil <= 30) {
      return <Badge variant="secondary">En {daysUntil} días</Badge>;
    }
    return <Badge variant="outline">En {daysUntil} días</Badge>;
  };

  const getPriorityIcon = (priority: string | null) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Deadlines
          </CardTitle>

          {showFilters && (
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-8">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="urgent">Urgentes</SelectItem>
                  <SelectItem value="overdue">Vencidos</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : !deadlines?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay deadlines {statusFilter === 'active' ? 'activos' : ''}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {deadlines.map((deadline: MatterDeadline) => {
              const daysUntil = getDaysUntil(deadline.deadline_date);

              return (
                <div
                  key={deadline.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                    deadline.status === 'overdue' && 'border-red-200 bg-red-50',
                    deadline.status === 'urgent' && 'border-orange-200 bg-orange-50',
                    deadline.status === 'completed' && 'border-green-200 bg-green-50 opacity-60'
                  )}
                >
                  <div className="shrink-0">
                    {getPriorityIcon(deadline.priority)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{deadline.title}</span>
                      {deadline.status === 'completed' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="truncate">
                        {deadline.matter?.reference}
                      </span>
                      <span>•</span>
                      <span>
                        {format(new Date(deadline.deadline_date), 'dd MMM yyyy', { locale: es })}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {getStatusBadge(deadline.status, daysUntil)}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/app/docket/${deadline.matter_id}`)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver expediente
                      </DropdownMenuItem>

                      {deadline.status !== 'completed' && (
                        <>
                          <DropdownMenuItem onClick={() => markAsCompleted(deadline.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Marcar completado
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem>
                            <CalendarPlus className="h-4 w-4 mr-2" />
                            Añadir a calendario
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
