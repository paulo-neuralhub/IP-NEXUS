// ============================================================
// IP-NEXUS - UNIFIED TASKS PAGE
// L90: Vista unificada de tareas (CRM + Expedientes)
// ============================================================

import { useState, useEffect } from 'react';
import { useAllTasks, useToggleTask, groupTasksByDate, type TaskFilters, type UnifiedTask } from '@/hooks/use-all-tasks';
import { usePageTitle } from '@/contexts/page-context';
import {
  CheckSquare, Circle, CheckCircle2, Filter, Plus,
  Calendar, Briefcase, Building, Clock, MoreHorizontal,
  Folder, Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TareasPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Tareas');
  }, [setTitle]);

  const [filters, setFilters] = useState<TaskFilters>({
    status: 'pending',
    assignedTo: 'all',
    source: 'all',
  });

  const { data: tasks, isLoading } = useAllTasks(filters);
  const toggleTask = useToggleTask();

  // Agrupar por fecha
  const groupedTasks = groupTasksByDate(tasks || []);

  // Orden de grupos
  const groupOrder = ['Vencidas', 'Hoy', 'Mañana', 'Esta semana', 'Próxima semana', 'Más adelante', 'Sin fecha'];
  const sortedGroups = Object.entries(groupedTasks).sort(
    ([a], [b]) => groupOrder.indexOf(a) - groupOrder.indexOf(b)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            Tareas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Todas las tareas de Expedientes y CRM en un solo lugar
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtros de estado */}
          <div className="flex rounded-lg border bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => setFilters({ ...filters, status: 'pending' })}
              className={cn(
                'px-3 py-1.5 text-sm transition-colors',
                filters.status === 'pending'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              Pendientes
            </button>
            <button
              type="button"
              onClick={() => setFilters({ ...filters, status: 'completed' })}
              className={cn(
                'px-3 py-1.5 text-sm transition-colors',
                filters.status === 'completed'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              Completadas
            </button>
            <button
              type="button"
              onClick={() => setFilters({ ...filters, status: 'all' })}
              className={cn(
                'px-3 py-1.5 text-sm transition-colors',
                filters.status === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              Todas
            </button>
          </div>

          {/* Filtro de fuente */}
          <Select
            value={filters.source}
            onValueChange={(v) => setFilters({ ...filters, source: v as TaskFilters['source'] })}
          >
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Fuente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fuentes</SelectItem>
              <SelectItem value="matter">Expedientes</SelectItem>
              <SelectItem value="crm">CRM</SelectItem>
            </SelectContent>
          </Select>

          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva tarea
          </Button>
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="space-y-6">
        {isLoading ? (
          <TasksSkeleton />
        ) : tasks?.length === 0 ? (
          <EmptyState status={filters.status} />
        ) : (
          sortedGroups.map(([dateLabel, dateTasks]) => (
            <div key={dateLabel} className="space-y-2">
              <h3
                className={cn(
                  'text-sm font-semibold flex items-center gap-2 sticky top-0 bg-background py-2 z-10',
                  dateLabel === 'Vencidas' && 'text-destructive',
                  dateLabel === 'Hoy' && 'text-primary'
                )}
              >
                <Calendar className="h-4 w-4" />
                {dateLabel}
                <Badge variant="secondary" className="ml-1">
                  {dateTasks.length}
                </Badge>
              </h3>
              <div className="space-y-1">
                {dateTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() =>
                      toggleTask.mutate({
                        taskId: task.id,
                        completed: !task.is_completed,
                      })
                    }
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Componente de tarjeta de tarea
interface TaskCardProps {
  task: UnifiedTask;
  onToggle: () => void;
}

function TaskCard({ task, onToggle }: TaskCardProps) {
  const isOverdue = !task.is_completed && task.due_date && new Date(task.due_date) < new Date();

  const priorityColors: Record<string, string> = {
    high: 'border-l-destructive',
    urgent: 'border-l-orange-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-muted',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
        'border-l-4',
        priorityColors[task.priority || 'medium'] || 'border-l-muted',
        task.is_completed && 'opacity-60'
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5',
          task.is_completed
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-muted-foreground/50 hover:border-primary'
        )}
      >
        {task.is_completed && <CheckCircle2 className="h-3 w-3" />}
      </button>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm font-medium',
              task.is_completed && 'line-through text-muted-foreground'
            )}
          >
            {task.subject || 'Sin título'}
          </p>

          {/* Badges de prioridad */}
          {task.priority === 'high' && (
            <Badge variant="destructive" className="text-[10px] shrink-0">
              Alta
            </Badge>
          )}
          {task.priority === 'urgent' && (
            <Badge className="bg-orange-500 text-white text-[10px] shrink-0">
              Urgente
            </Badge>
          )}
        </div>

        {task.content && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {task.content}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {/* Fuente */}
          <Link
            to={task.sourceUrl}
            className="flex items-center gap-1 hover:text-primary"
          >
            {task.source === 'matter' ? (
              <Folder className="h-3 w-3" />
            ) : (
              <Building className="h-3 w-3" />
            )}
            {task.sourceLabel}
          </Link>

          {/* Fecha */}
          {task.due_date && (
            <span className={cn('flex items-center gap-1', isOverdue && 'text-destructive')}>
              <Clock className="h-3 w-3" />
              {isOverdue && 'Vencida '}
              {formatDistanceToNow(new Date(task.due_date), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to={task.sourceUrl}>
              <Link2 className="h-4 w-4 mr-2" />
              Ver en contexto
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Editar</DropdownMenuItem>
          <DropdownMenuItem>Reprogramar</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function TasksSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

function EmptyState({ status }: { status?: string }) {
  return (
    <div className="text-center py-12 bg-muted/30 rounded-xl">
      <CheckSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
      <h3 className="font-semibold">
        {status === 'pending'
          ? '¡Sin tareas pendientes!'
          : status === 'completed'
          ? 'No hay tareas completadas'
          : 'No hay tareas'}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        {status === 'pending'
          ? 'Has completado todas las tareas. ¡Buen trabajo!'
          : 'Las tareas aparecerán aquí cuando se creen'}
      </p>
    </div>
  );
}
