import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Play,
  Pause,
  Trash2,
  Edit,
  Eye,
  Filter
} from 'lucide-react';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSmartTasks, useUpdateSmartTask, useDeleteSmartTask } from '@/hooks/docket';
import { TASK_PRIORITIES, TASK_STATUSES, TASK_TYPES } from '@/lib/constants/docket-god-mode';
import type { SmartTask, SmartTaskFilters } from '@/types/docket-god-mode';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function SmartTasksPanel() {
  const [filters, setFilters] = useState<SmartTaskFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tasks = [], isLoading } = useSmartTasks({
    ...filters,
    search: searchQuery || undefined,
  });

  const updateTask = useUpdateSmartTask();
  const deleteTask = useDeleteSmartTask();

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTask.mutate({ id: taskId, status: newStatus as SmartTask['status'] });
  };

  const handleDelete = (taskId: string) => {
    if (confirm('¿Eliminar esta tarea?')) {
      deleteTask.mutate(taskId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Smart Tasks - Date Trident</CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tareas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <Select
            value={filters.statuses?.[0] || 'all'}
            onValueChange={(value) => 
              setFilters(prev => ({ 
                ...prev, 
                statuses: value === 'all' ? undefined : [value as SmartTask['status']] 
              }))
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(TASK_STATUSES).map(([key, status]) => (
                <SelectItem key={key} value={key}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.priorities?.[0] || 'all'}
            onValueChange={(value) => 
              setFilters(prev => ({ 
                ...prev, 
                priorities: value === 'all' ? undefined : [value as SmartTask['priority']] 
              }))
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(TASK_PRIORITIES).map(([key, priority]) => (
                <SelectItem key={key} value={key}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setFilters(prev => ({ ...prev, isOverdue: !prev.isOverdue }))}
            className={filters.isOverdue ? 'bg-red-100 text-red-700' : ''}
          >
            <AlertTriangle className="h-4 w-4" />
          </Button>
        </div>

        {/* Tasks Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay tareas que mostrar</p>
            <p className="text-sm">Crea una nueva tarea o ajusta los filtros</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Tarea</TableHead>
                  <TableHead>Expediente</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskRowProps {
  task: SmartTask;
  onStatusChange: (taskId: string, status: string) => void;
  onDelete: (taskId: string) => void;
}

function TaskRow({ task, onStatusChange, onDelete }: TaskRowProps) {
  const dueDate = new Date(task.due_date);
  const isOverdue = isPast(dueDate) && !isToday(dueDate) && task.status !== 'completed';
  const daysUntilDue = differenceInDays(dueDate, new Date());

  const statusConfig = TASK_STATUSES[task.status as keyof typeof TASK_STATUSES];
  const priorityConfig = TASK_PRIORITIES[task.priority as keyof typeof TASK_PRIORITIES];
  const typeConfig = TASK_TYPES[task.task_type as keyof typeof TASK_TYPES];

  return (
    <TableRow className={cn(isOverdue && 'bg-red-50/50 dark:bg-red-950/10')}>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium flex items-center gap-2">
            {task.is_auto_generated && (
              <Badge variant="outline" className="text-xs">Auto</Badge>
            )}
            {task.title}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            {typeConfig && (
              <Badge variant="secondary" className="text-xs">
                {typeConfig.label}
              </Badge>
            )}
            {task.description && (
              <span className="truncate max-w-[200px]">{task.description}</span>
            )}
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        {task.matter ? (
          <div className="text-sm">
            <div className="font-medium">{task.matter.reference}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
              {task.matter.title}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
      
      <TableCell>
        <DateTriident
          triggerDate={task.trigger_date}
          reminderDate={task.reminder_date}
          dueDate={task.due_date}
          isOverdue={isOverdue}
          daysUntilDue={daysUntilDue}
        />
      </TableCell>
      
      <TableCell>
        <Badge 
          variant="outline" 
          className={cn('capitalize', statusConfig?.color)}
        >
          {statusConfig?.label || task.status}
        </Badge>
      </TableCell>
      
      <TableCell>
        <Badge 
          variant="outline"
          className={cn(priorityConfig?.color)}
        >
          {priorityConfig?.label || task.priority}
        </Badge>
      </TableCell>
      
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            {task.status === 'pending' && (
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in_progress')}>
                <Play className="h-4 w-4 mr-2" />
                Iniciar
              </DropdownMenuItem>
            )}
            {task.status === 'in_progress' && (
              <>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'completed')}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Completar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'on_hold')}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem 
              onClick={() => onDelete(task.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

interface DateTriidentProps {
  triggerDate?: string;
  reminderDate?: string;
  dueDate: string;
  isOverdue: boolean;
  daysUntilDue: number;
}

function DateTriident({ triggerDate, reminderDate, dueDate, isOverdue, daysUntilDue }: DateTriidentProps) {
  return (
    <div className="space-y-1 text-xs">
      {triggerDate && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">T</span>
          {format(new Date(triggerDate), 'dd/MM/yy', { locale: es })}
        </div>
      )}
      {reminderDate && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]">R</span>
          {format(new Date(reminderDate), 'dd/MM/yy', { locale: es })}
        </div>
      )}
      <div className={cn(
        "flex items-center gap-1 font-medium",
        isOverdue ? 'text-red-600' : daysUntilDue <= 7 ? 'text-amber-600' : 'text-foreground'
      )}>
        <span className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center text-[10px]",
          isOverdue ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
        )}>D</span>
        {format(new Date(dueDate), 'dd/MM/yy', { locale: es })}
        {isOverdue && <AlertTriangle className="h-3 w-3 ml-1" />}
      </div>
    </div>
  );
}
