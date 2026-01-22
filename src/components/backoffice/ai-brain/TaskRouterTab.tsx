import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Cpu } from 'lucide-react';
import { AITaskAssignment, AIModel } from '@/types/ai-brain.types';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskRouterTabProps {
  tasks: AITaskAssignment[];
  models: AIModel[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (task: AITaskAssignment) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export function TaskRouterTab({ 
  tasks, 
  models,
  isLoading, 
  onAdd, 
  onEdit, 
  onDelete,
  onToggleActive 
}: TaskRouterTabProps) {
  const getModelName = (modelId: string | null | undefined) => {
    if (!modelId) return '-';
    const model = models.find(m => m.id === modelId);
    return model?.name || modelId.slice(0, 8);
  };

  const getCategoryBadge = (category: string) => {
    // Nota: evitamos colores hardcodeados; usamos variantes semánticas del design system.
    const normalized = (category || 'general').toLowerCase();
    const variant: 'default' | 'secondary' | 'destructive' | 'outline' =
      normalized === 'analysis' ? 'secondary' : normalized === 'agent' ? 'default' : 'outline';
    return <Badge variant={variant}>{normalized}</Badge>;
  };

  const sortedTasks = [...tasks].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Task Router</CardTitle>
            <CardDescription>Configuración de modelos por funcionalidad con fallbacks</CardDescription>
          </div>
          <Skeleton className="h-9 w-28" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Task Router</CardTitle>
          <CardDescription>Configuración de modelos por funcionalidad con fallbacks</CardDescription>
        </div>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva tarea
        </Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Cpu className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No hay tasks configurados</p>
            <p className="text-sm">Añade un task para comenzar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Prioridad</th>
                  <th className="text-left py-3 px-4 font-medium">Task</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Primary</th>
                  <th className="text-left py-3 px-4 font-medium">Fallback 1</th>
                  <th className="text-left py-3 px-4 font-medium">Fallback 2</th>
                  <th className="text-left py-3 px-4 font-medium">Timeout</th>
                  <th className="text-left py-3 px-4 font-medium">Active</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.map((task) => (
                  <tr key={task.id} className="border-b">
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{task.priority ?? 0}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{task.task_name}</p>
                        <p className="text-xs text-muted-foreground">{task.task_code}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getCategoryBadge(task.category)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{getModelName(task.primary_model_id)}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{getModelName(task.fallback_1_model_id)}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{getModelName(task.fallback_2_model_id)}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {task.timeout_ms / 1000}s
                    </td>
                    <td className="py-3 px-4">
                      <Switch 
                        checked={task.is_active} 
                        onCheckedChange={(checked) => onToggleActive(task.id, checked)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive" 
                          onClick={() => onDelete(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
