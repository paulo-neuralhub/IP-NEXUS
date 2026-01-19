import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { AITaskAssignment, AITaskAssignmentFormData, AIModel, TaskCategory } from '@/types/ai-brain.types';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: AITaskAssignment | null;
  models: AIModel[];
  onSave: (data: AITaskAssignmentFormData) => void;
  isSaving: boolean;
}

const categories: TaskCategory[] = ['agent', 'analysis', 'generation', 'classification', 'general'];

export function TaskDialog({ 
  open, 
  onOpenChange, 
  task, 
  models,
  onSave, 
  isSaving 
}: TaskDialogProps) {
  const [form, setForm] = useState<AITaskAssignmentFormData>({
    task_code: '',
    task_name: '',
    description: '',
    category: 'general',
    primary_model_id: '',
    fallback_1_model_id: '',
    fallback_2_model_id: '',
    temperature: 0.7,
    max_tokens: 4096,
    timeout_ms: 30000,
    max_retries: 3,
    rag_enabled: false,
    rag_collection_ids: [],
    rag_top_k: 5,
    is_active: true
  });

  useEffect(() => {
    if (task) {
      setForm({
        task_code: task.task_code,
        task_name: task.task_name,
        description: task.description || '',
        category: task.category,
        primary_model_id: task.primary_model_id || '',
        fallback_1_model_id: task.fallback_1_model_id || '',
        fallback_2_model_id: task.fallback_2_model_id || '',
        temperature: task.temperature,
        max_tokens: task.max_tokens,
        timeout_ms: task.timeout_ms,
        max_retries: task.max_retries,
        rag_enabled: task.rag_enabled,
        rag_collection_ids: task.rag_collection_ids,
        rag_top_k: task.rag_top_k,
        is_active: task.is_active
      });
    } else {
      setForm({
        task_code: '',
        task_name: '',
        description: '',
        category: 'general',
        primary_model_id: '',
        fallback_1_model_id: '',
        fallback_2_model_id: '',
        temperature: 0.7,
        max_tokens: 4096,
        timeout_ms: 30000,
        max_retries: 3,
        rag_enabled: false,
        rag_collection_ids: [],
        rag_top_k: 5,
        is_active: true
      });
    }
  }, [task, open]);

  const handleSubmit = () => {
    onSave(form);
  };

  const activeModels = models.filter(m => m.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Editar Task Route' : 'Nuevo Task Route'}</DialogTitle>
          <DialogDescription>
            Configura el enrutamiento de modelos para esta tarea
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-code">Código</Label>
              <Input
                id="task-code"
                value={form.task_code}
                onChange={(e) => setForm({ ...form, task_code: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                placeholder="ej: nexus_legal"
                disabled={!!task}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-name">Nombre</Label>
              <Input
                id="task-name"
                value={form.task_name}
                onChange={(e) => setForm({ ...form, task_name: e.target.value })}
                placeholder="ej: NEXUS LEGAL"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-desc">Descripción</Label>
            <Textarea
              id="task-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe el propósito de esta tarea..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select 
              value={form.category} 
              onValueChange={(v) => setForm({ ...form, category: v as TaskCategory })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Primary Model</Label>
              <Select 
                value={form.primary_model_id} 
                onValueChange={(v) => setForm({ ...form, primary_model_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {activeModels.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fallback 1</Label>
              <Select
                value={form.fallback_1_model_id || "__none__"}
                onValueChange={(v) =>
                  setForm({ ...form, fallback_1_model_id: v === "__none__" ? "" : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ninguno" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="__none__">Ninguno</SelectItem>
                  {activeModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fallback 2</Label>
              <Select
                value={form.fallback_2_model_id || "__none__"}
                onValueChange={(v) =>
                  setForm({ ...form, fallback_2_model_id: v === "__none__" ? "" : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ninguno" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="__none__">Ninguno</SelectItem>
                  {activeModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Temperature: {form.temperature}</Label>
            <Slider
              value={[form.temperature]}
              onValueChange={([v]) => setForm({ ...form, temperature: v })}
              min={0}
              max={2}
              step={0.1}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-tokens">Max Tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                value={form.max_tokens}
                onChange={(e) => setForm({ ...form, max_tokens: parseInt(e.target.value) || 4096 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={form.timeout_ms}
                onChange={(e) => setForm({ ...form, timeout_ms: parseInt(e.target.value) || 30000 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retries">Max Retries</Label>
              <Input
                id="retries"
                type="number"
                value={form.max_retries}
                onChange={(e) => setForm({ ...form, max_retries: parseInt(e.target.value) || 3 })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="space-y-0.5">
              <Label>RAG Enabled</Label>
              <p className="text-xs text-muted-foreground">
                Habilitar retrieval augmented generation
              </p>
            </div>
            <Switch
              checked={form.rag_enabled}
              onCheckedChange={(checked) => setForm({ ...form, rag_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activo</Label>
              <p className="text-xs text-muted-foreground">
                Las tareas inactivas no se ejecutarán
              </p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSaving || !form.task_code || !form.task_name}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
