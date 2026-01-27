import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Cpu, Code, Layers } from 'lucide-react';
import { AITaskAssignment, AIModel } from '@/types/ai-brain.types';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TaskRouterTabProps {
  tasks: AITaskAssignment[];
  models: AIModel[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (task: AITaskAssignment) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const MODULE_LABELS: Record<string, string> = {
  genius: 'Genius',
  guide: 'Guide',
  spider: 'Spider',
  documents: 'Documentos',
  translator: 'Traductor',
  import: 'Importación',
  migrator: 'Migrador',
  crm: 'CRM',
  portal: 'Portal',
  widget: 'Widget',
  backoffice: 'Backoffice',
  vision: 'Visión',
  images: 'Imágenes',
  general: 'General',
};

const CATEGORY_ICONS: Record<string, string> = {
  agent: '💬',
  analysis: '🔍',
  generation: '✍️',
  classification: '📋',
  general: '⚙️',
};

export function TaskRouterTab({ 
  tasks, 
  models,
  isLoading, 
  onAdd, 
  onEdit, 
  onDelete,
  onToggleActive 
}: TaskRouterTabProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('grouped');

  const getModelName = (modelId: string | null | undefined) => {
    if (!modelId) return '-';
    const model = models.find(m => m.id === modelId);
    return model?.name || modelId.slice(0, 8);
  };

  const getCategoryBadge = (category: string) => {
    const normalized = (category || 'general').toLowerCase();
    const icon = CATEGORY_ICONS[normalized] || '⚙️';
    return (
      <Badge variant="outline" className="gap-1">
        <span>{icon}</span>
        {normalized}
      </Badge>
    );
  };

  // Group tasks by module
  const tasksByModule = useMemo(() => {
    const grouped: Record<string, AITaskAssignment[]> = {};
    tasks.forEach(task => {
      const module = task.module || 'general';
      if (!grouped[module]) grouped[module] = [];
      grouped[module].push(task);
    });
    // Sort tasks within each module
    Object.keys(grouped).forEach(module => {
      grouped[module].sort((a, b) => a.task_name.localeCompare(b.task_name));
    });
    return grouped;
  }, [tasks]);

  const modules = Object.keys(tasksByModule).sort();
  const activeCount = tasks.filter(t => t.is_active).length;
  const totalCount = tasks.length;

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

  const TaskRow = ({ task }: { task: AITaskAssignment }) => (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{task.task_name}</p>
            {!task.is_active && (
              <Badge variant="secondary" className="text-xs">Inactivo</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs text-muted-foreground">{task.task_code}</code>
            {task.edge_function && (
              <Badge variant="outline" className="text-xs gap-1">
                <Code className="h-3 w-3" />
                {task.edge_function}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getCategoryBadge(task.category)}
        </div>

        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-xs">
            {getModelName(task.primary_model_id)}
          </Badge>
          {task.fallback_1_model_id && (
            <>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline" className="text-xs">
                {getModelName(task.fallback_1_model_id)}
              </Badge>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <Switch 
          checked={task.is_active} 
          onCheckedChange={(checked) => onToggleActive(task.id, checked)}
        />
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
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Task Router
          </CardTitle>
          <CardDescription>
            {activeCount} tareas activas de {totalCount} • {modules.length} módulos
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'grouped')}>
            <TabsList className="h-8">
              <TabsTrigger value="grouped" className="text-xs px-2">
                <Layers className="h-3 w-3 mr-1" />
                Agrupado
              </TabsTrigger>
              <TabsTrigger value="table" className="text-xs px-2">
                Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva tarea
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Cpu className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No hay tasks configurados</p>
            <p className="text-sm">Añade un task para comenzar</p>
          </div>
        ) : viewMode === 'grouped' ? (
          <div className="space-y-6">
            {modules.map(module => (
              <div key={module}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    {MODULE_LABELS[module] || module}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {tasksByModule[module].length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {tasksByModule[module].map(task => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Task</th>
                  <th className="text-left py-3 px-4 font-medium">Módulo</th>
                  <th className="text-left py-3 px-4 font-medium">Categoría</th>
                  <th className="text-left py-3 px-4 font-medium">Modelo</th>
                  <th className="text-left py-3 px-4 font-medium">Fallbacks</th>
                  <th className="text-left py-3 px-4 font-medium">Activo</th>
                  <th className="text-left py-3 px-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{task.task_name}</p>
                        <p className="text-xs text-muted-foreground">{task.task_code}</p>
                        {task.edge_function && (
                          <code className="text-xs text-muted-foreground">{task.edge_function}</code>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{MODULE_LABELS[task.module || 'general'] || task.module}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {getCategoryBadge(task.category)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{getModelName(task.primary_model_id)}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <Badge variant="outline">{getModelName(task.fallback_1_model_id)}</Badge>
                        {task.fallback_2_model_id && (
                          <Badge variant="outline">{getModelName(task.fallback_2_model_id)}</Badge>
                        )}
                      </div>
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
