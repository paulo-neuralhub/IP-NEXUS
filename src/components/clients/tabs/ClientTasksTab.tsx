// =====================================================
// IP-NEXUS - CLIENT TASKS TAB (PROMPT 27)
// Tab de tareas pendientes del cliente
// =====================================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  CheckSquare,
  Calendar,
  User,
  Briefcase,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { fromTable } from '@/lib/supabase';
import { format, isPast, isToday, isTomorrow, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ClientTasksTabProps {
  clientId: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  assigned_to: string | null;
  matter_id: string | null;
  matter?: {
    reference: string;
    mark_name: string;
  } | null;
  assigned_user?: {
    full_name: string;
  } | null;
}

export function ClientTasksTab({ clientId }: ClientTasksTabProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue'>('pending');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['client-tasks', clientId, filter],
    queryFn: async () => {
      // Get matters for this client first
      const { data: matters } = await fromTable('matters')
        .select('id')
        .eq('client_id', clientId);

      if (!matters?.length) return [];

      const matterIds = matters.map((m: any) => m.id);

      let query = fromTable('tasks')
        .select(`
          id, title, description, due_date, priority, status, assigned_to, matter_id,
          matter:matter_id(reference, mark_name),
          assigned_user:assigned_to(full_name)
        `)
        .in('matter_id', matterIds)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (filter === 'pending') {
        query = query.neq('status', 'completed');
      } else if (filter === 'overdue') {
        query = query.neq('status', 'completed').lt('due_date', new Date().toISOString());
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data || []) as Task[];
    },
    enabled: !!clientId,
  });

  const completeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await fromTable('tasks')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tasks'] });
      toast({ title: 'Tarea completada' });
    },
  });

  const getDueDateBadge = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const overdue = isPast(date) && !isToday(date);
    const today = isToday(date);
    const tomorrow = isTomorrow(date);
    const thisWeek = date <= addDays(new Date(), 7);

    if (overdue) {
      return <Badge variant="destructive" className="text-xs">Vencida</Badge>;
    }
    if (today) {
      return <Badge className="bg-amber-500 text-xs">Hoy</Badge>;
    }
    if (tomorrow) {
      return <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">Mañana</Badge>;
    }
    if (thisWeek) {
      return <Badge variant="secondary" className="text-xs">Esta semana</Badge>;
    }
    return null;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-amber-500';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pendientes
          </Button>
          <Button
            size="sm"
            variant={filter === 'overdue' ? 'destructive' : 'outline'}
            onClick={() => setFilter('overdue')}
          >
            Vencidas
          </Button>
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Nueva tarea
        </Button>
      </div>

      {/* Tasks list */}
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              {filter === 'overdue' 
                ? 'No hay tareas vencidas' 
                : 'No hay tareas pendientes'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className={cn(
                  "hover:shadow-md transition-shadow",
                  task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date))
                    ? "border-l-4 border-l-red-500"
                    : ""
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={() => completeMutation.mutate(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("font-medium", task.status === 'completed' && "line-through text-muted-foreground")}>
                          {task.title}
                        </span>
                        {getDueDateBadge(task.due_date)}
                        <AlertTriangle className={cn("w-4 h-4", getPriorityColor(task.priority))} />
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {task.matter && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {task.matter.reference}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(task.due_date), 'dd MMM yyyy', { locale: es })}
                          </span>
                        )}
                        {task.assigned_user && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {task.assigned_user.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
