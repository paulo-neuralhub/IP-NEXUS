/**
 * MatterTasksTab - Pestaña de tareas del expediente
 */

import { useState } from 'react';
import { CheckSquare, Plus, Check, Clock, User, AlertTriangle, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMatterTasks, useCompleteMatterTask, type MatterTask } from '@/hooks/use-matter-tasks';
import { format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AddTaskModal } from './AddTaskModal';
import { TaskEditModal } from './TaskEditModal';
import { useToast } from '@/hooks/use-toast';

interface MatterTasksTabProps {
  matterId: string;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Media', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-700' },
};

export function MatterTasksTab({ matterId }: MatterTasksTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MatterTask | null>(null);
  const [filter, setFilter] = useState<'pending' | 'overdue' | 'all'>('pending');
  const { toast } = useToast();
  
  const { data: tasks, isLoading } = useMatterTasks(matterId);
  const completeTask = useCompleteMatterTask();

  const handleComplete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await completeTask.mutateAsync(id);
      toast({ title: 'Tarea completada' });
    } catch {
      toast({ title: 'Error al completar', variant: 'destructive' });
    }
  };

  const allSorted = [...(tasks || [])].sort((a, b) => {
    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - 
           (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
  });

  const sortedTasks = allSorted.filter((task) => {
    if (filter === 'pending') return !task.is_completed;
    if (filter === 'overdue') return !task.is_completed && task.due_date && isPast(new Date(task.due_date));
    return true;
  });

  const overdueCount = (tasks || []).filter(t => !t.is_completed && t.due_date && isPast(new Date(t.due_date))).length;
  const pendingCount = (tasks || []).filter(t => !t.is_completed).length;

  return (
    <div className="space-y-3">
      {/* Sub-tabs outside the card */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pendientes
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">{pendingCount}</Badge>
            )}
          </Button>
          <Button
            size="sm"
            variant={filter === 'overdue' ? 'destructive' : 'outline'}
            onClick={() => setFilter('overdue')}
          >
            Vencidas
            {overdueCount > 0 && (
              <Badge variant="destructive" className="ml-1.5 h-5 px-1.5 text-xs">{overdueCount}</Badge>
            )}
          </Button>
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nueva tarea
        </Button>
      </div>

    <Card>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : !sortedTasks?.length ? (
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No hay tareas</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'overdue' ? 'Sin tareas vencidas' : filter === 'pending' ? 'Crea la primera tarea del expediente' : 'Sin tareas registradas'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => {
              const priorityConfig = PRIORITY_CONFIG[task.priority || 'medium'] || PRIORITY_CONFIG.medium;
              const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !task.is_completed;
              
              return (
                <div 
                  key={task.id} 
                  onClick={() => setSelectedTask(task)}
                  className={cn(
                    "flex items-start justify-between p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                    task.is_completed && "opacity-60",
                    isOverdue && "border-destructive/50 bg-destructive/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => !task.is_completed && handleComplete(e, task.id)}
                      className={cn(
                        "h-6 w-6 rounded border-2 flex items-center justify-center mt-0.5",
                        task.is_completed 
                          ? "bg-green-500 border-green-500 text-white" 
                          : "border-muted-foreground/30 hover:border-primary"
                      )}
                      disabled={task.is_completed || completeTask.isPending}
                    >
                      {task.is_completed && <Check className="h-4 w-4" />}
                    </button>
                    <div>
                      <p className={cn(
                        "font-medium",
                        task.is_completed && "line-through"
                      )}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={priorityConfig.color} variant="secondary">
                          {priorityConfig.label}
                        </Badge>
                        {task.due_date && (
                          <span className={cn(
                            "text-sm flex items-center gap-1",
                            isOverdue ? "text-destructive" : "text-muted-foreground"
                          )}>
                            {isOverdue && <AlertTriangle className="h-3 w-3" />}
                            <Clock className="h-3 w-3" />
                            {format(new Date(task.due_date), "dd MMM", { locale: es })}
                          </span>
                        )}
                        {task.assigned_to_name && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assigned_to_name}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>

      <AddTaskModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        matterId={matterId}
      />

      {selectedTask && (
        <TaskEditModal
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          task={selectedTask}
        />
      )}
    </div>
  );
}
