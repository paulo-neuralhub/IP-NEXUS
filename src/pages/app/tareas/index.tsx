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

      {/* Lista de tareas - SILK Style */}
      <div className="space-y-6">
        {isLoading ? (
          <TasksSkeleton />
        ) : tasks?.length === 0 ? (
          <EmptyState status={filters.status} />
        ) : (
          sortedGroups.map(([dateLabel, dateTasks]) => {
            // SILK: Color mapping for sections
            const sectionConfig = getSectionConfig(dateLabel);
            
            return (
              <div key={dateLabel} className="space-y-3">
                {/* SILK Section Header */}
                <div 
                  className="flex items-center justify-between pb-2 border-b-2 sticky top-0 bg-background py-2 z-10"
                  style={{ borderColor: sectionConfig.borderColor }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: sectionConfig.iconBg,
                        border: `2px solid ${sectionConfig.iconBorder}`,
                        boxShadow: `0 2px 6px ${sectionConfig.shadowColor}`
                      }}
                    >
                      <span className="text-sm">{sectionConfig.icon}</span>
                    </div>
                    <h3 
                      className="text-sm font-bold"
                      style={{ color: '#0a2540' }}
                    >
                      {dateLabel}
                    </h3>
                  </div>
                  
                  {/* SILK NeoBadge counter */}
                  <div 
                    className="px-2.5 py-1 rounded-lg border"
                    style={{
                      background: `linear-gradient(135deg, ${sectionConfig.badgeBg} 0%, white 100%)`,
                      borderColor: sectionConfig.badgeBorder,
                      boxShadow: `0 2px 4px ${sectionConfig.shadowColor}, inset 0 1px 1px rgba(255,255,255,0.9)`
                    }}
                  >
                    <span 
                      className="text-xs font-bold"
                      style={{ color: sectionConfig.textColor }}
                    >
                      {dateTasks.length}
                    </span>
                  </div>
                </div>
                
                {/* Tasks list */}
                <div className="space-y-2">
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
            );
          })
        )}
      </div>
    </div>
  );
}

// SILK Section Config helper
function getSectionConfig(dateLabel: string) {
  const configs: Record<string, {
    icon: string;
    iconBg: string;
    iconBorder: string;
    borderColor: string;
    badgeBg: string;
    badgeBorder: string;
    textColor: string;
    shadowColor: string;
  }> = {
    'Vencidas': {
      icon: '🔴',
      iconBg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      iconBorder: '#fca5a5',
      borderColor: '#fca5a5',
      badgeBg: '#fef2f2',
      badgeBorder: '#fca5a5',
      textColor: '#dc2626',
      shadowColor: 'rgba(239, 68, 68, 0.2)'
    },
    'Hoy': {
      icon: '🔥',
      iconBg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      iconBorder: '#fdba74',
      borderColor: '#fdba74',
      badgeBg: '#fff7ed',
      badgeBorder: '#fdba74',
      textColor: '#ea580c',
      shadowColor: 'rgba(249, 115, 22, 0.2)'
    },
    'Mañana': {
      icon: '⚡',
      iconBg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      iconBorder: '#fdba74',
      borderColor: '#fdba74',
      badgeBg: '#fff7ed',
      badgeBorder: '#fdba74',
      textColor: '#ea580c',
      shadowColor: 'rgba(249, 115, 22, 0.2)'
    },
    'Esta semana': {
      icon: '📅',
      iconBg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
      iconBorder: '#67e8f9',
      borderColor: '#67e8f9',
      badgeBg: '#ecfeff',
      badgeBorder: '#67e8f9',
      textColor: '#0891b2',
      shadowColor: 'rgba(0, 180, 216, 0.2)'
    },
    'Próxima semana': {
      icon: '📆',
      iconBg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      iconBorder: '#86efac',
      borderColor: '#86efac',
      badgeBg: '#f0fdf4',
      badgeBorder: '#86efac',
      textColor: '#16a34a',
      shadowColor: 'rgba(22, 163, 74, 0.2)'
    },
  };
  
  return configs[dateLabel] || {
    icon: '📋',
    iconBg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    iconBorder: '#cbd5e1',
    borderColor: '#cbd5e1',
    badgeBg: '#f8fafc',
    badgeBorder: '#cbd5e1',
    textColor: '#64748b',
    shadowColor: 'rgba(100, 116, 139, 0.15)'
  };
}

// Priority border colors (SILK 3px)
const PRIORITY_BORDERS: Record<string, { color: string; shadow: string }> = {
  high: { color: '#ef4444', shadow: 'rgba(239, 68, 68, 0.1)' },
  urgent: { color: '#f97316', shadow: 'rgba(249, 115, 22, 0.1)' },
  medium: { color: '#eab308', shadow: 'rgba(234, 179, 8, 0.1)' },
  low: { color: '#94a3b8', shadow: 'rgba(148, 163, 184, 0.1)' },
};

// Componente de tarjeta de tarea - SILK Style
interface TaskCardProps {
  task: UnifiedTask;
  onToggle: () => void;
}

function TaskCard({ task, onToggle }: TaskCardProps) {
  const isOverdue = !task.is_completed && task.due_date && new Date(task.due_date) < new Date();
  const priorityConfig = PRIORITY_BORDERS[task.priority || 'medium'] || PRIORITY_BORDERS.medium;

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-200 hover:shadow-md',
        task.is_completed && 'opacity-60'
      )}
      style={{
        padding: '12px 14px',
        background: '#f1f4f9',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        borderLeft: `3px solid ${priorityConfig.color}`,
        boxShadow: `0 2px 6px rgba(0, 0, 0, 0.04), 0 0 0 1px ${priorityConfig.shadow}`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = '1px solid rgba(0, 180, 216, 0.15)';
        e.currentTarget.style.borderLeft = `3px solid ${priorityConfig.color}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.borderLeft = `3px solid ${priorityConfig.color}`;
      }}
    >
      <div className="flex items-start gap-3">
        {/* SILK Checkbox */}
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 mt-0.5"
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '6px',
            border: task.is_completed ? '2px solid #00b4d8' : '2px solid #cbd5e1',
            background: task.is_completed ? 'linear-gradient(135deg, #00b4d8 0%, #00d4aa 100%)' : '#fff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {task.is_completed && <CheckCircle2 className="h-3 w-3 text-white" />}
        </button>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'text-sm font-semibold',
                task.is_completed && 'line-through text-muted-foreground'
              )}
              style={{ color: task.is_completed ? '#94a3b8' : '#0a2540' }}
            >
              {task.subject || 'Sin título'}
            </p>

            {/* Priority badges - SILK NeoBadge style */}
            {task.priority === 'high' && (
              <div 
                className="px-2 py-0.5 rounded-lg border text-[10px] font-semibold uppercase"
                style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, white 100%)',
                  borderColor: '#fca5a5',
                  color: '#dc2626',
                  boxShadow: '0 1px 3px rgba(239, 68, 68, 0.15), inset 0 1px 1px rgba(255,255,255,0.9)'
                }}
              >
                Alta
              </div>
            )}
            {task.priority === 'urgent' && (
              <div 
                className="px-2 py-0.5 rounded-lg border text-[10px] font-semibold uppercase"
                style={{
                  background: 'linear-gradient(135deg, #fff7ed 0%, white 100%)',
                  borderColor: '#fdba74',
                  color: '#ea580c',
                  boxShadow: '0 1px 3px rgba(249, 115, 22, 0.15), inset 0 1px 1px rgba(255,255,255,0.9)'
                }}
              >
                Urgente
              </div>
            )}
          </div>

          {task.content && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
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
