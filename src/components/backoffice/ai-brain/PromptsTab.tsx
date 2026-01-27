import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, Pencil, Trash2, FileText, Copy, Search, Filter,
  GitBranch, Send, CheckCircle, Clock, AlertCircle, Play,
  Variable, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  useAIPrompts, 
  useAIPrompt,
  useCreateAIPrompt, 
  useUpdateAIPrompt,
  useDeleteAIPrompt,
  useChangePromptStatus,
  useCreatePromptVersion,
  type AIPrompt,
  type AIPromptFormData,
  type PromptVariable,
} from '@/hooks/ai-brain';
import { useAITaskAssignments } from '@/hooks/ai-brain/useCombinedHooks';
import { useAIModels } from '@/hooks/ai-brain/useAIModels';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: typeof FileText }> = {
  draft: { bg: 'bg-muted', text: 'text-muted-foreground', icon: FileText },
  review: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  approved: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
  production: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  deprecated: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
};

const DEFAULT_FORM: AIPromptFormData = {
  task_id: '',
  model_code: null,
  name: '',
  description: '',
  system_prompt: '',
  user_prompt_template: '',
  variables: [],
  output_format: 'text',
  suggested_temperature: 0.7,
  suggested_max_tokens: 4096,
};

export function PromptsTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [taskFilter, setTaskFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null);
  const [form, setForm] = useState<AIPromptFormData>(DEFAULT_FORM);
  const [activeTab, setActiveTab] = useState('editor');

  // Queries
  const { data: prompts, isLoading } = useAIPrompts({ status: statusFilter, task_id: taskFilter });
  const { tasks } = useAITaskAssignments();
  const { data: models } = useAIModels();

  // Mutations
  const createPrompt = useCreateAIPrompt();
  const updatePrompt = useUpdateAIPrompt();
  const deletePrompt = useDeleteAIPrompt();
  const changeStatus = useChangePromptStatus();
  const createVersion = useCreatePromptVersion();

  // Filter prompts by search
  const filteredPrompts = prompts?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.task?.task_code?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const stats = {
    total: prompts?.length || 0,
    production: prompts?.filter(p => p.status === 'production').length || 0,
    review: prompts?.filter(p => p.status === 'review').length || 0,
    draft: prompts?.filter(p => p.status === 'draft').length || 0,
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copiado al portapapeles');
  };

  const openCreate = () => {
    setEditingPrompt(null);
    setForm(DEFAULT_FORM);
    setActiveTab('editor');
    setIsDialogOpen(true);
  };

  const openEdit = (prompt: AIPrompt) => {
    setEditingPrompt(prompt);
    setForm({
      task_id: prompt.task_id || '',
      model_code: prompt.model_code,
      name: prompt.name,
      description: prompt.description || '',
      system_prompt: prompt.system_prompt || '',
      user_prompt_template: prompt.user_prompt_template,
      variables: (prompt.variables as PromptVariable[]) || [],
      output_format: prompt.output_format || 'text',
      suggested_temperature: prompt.suggested_temperature || 0.7,
      suggested_max_tokens: prompt.suggested_max_tokens || 4096,
    });
    setActiveTab('editor');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.task_id || !form.user_prompt_template) {
      toast.error('Completa los campos requeridos');
      return;
    }

    if (editingPrompt) {
      await updatePrompt.mutateAsync({ id: editingPrompt.id, data: form });
    } else {
      await createPrompt.mutateAsync(form);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este prompt?')) {
      await deletePrompt.mutateAsync(id);
    }
  };

  const handleStatusChange = async (promptId: string, newStatus: string) => {
    await changeStatus.mutateAsync({ promptId, newStatus });
  };

  const handleCreateVersion = async (promptId: string) => {
    const newId = await createVersion.mutateAsync(promptId);
    toast.success('Nueva versión creada');
  };

  // Detect variables in template
  const detectVariables = () => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = [...(form.user_prompt_template.matchAll(regex))];
    const detected = matches.map(m => m[1]);
    
    const existing = form.variables.map(v => v.name);
    const newVars = detected.filter(d => !existing.includes(d)).map(name => ({
      name,
      type: 'string' as const,
      required: true,
      description: '',
    }));
    
    if (newVars.length > 0) {
      setForm({ ...form, variables: [...form.variables, ...newVars] });
      toast.success(`${newVars.length} variables detectadas`);
    } else {
      toast.info('No se encontraron nuevas variables');
    }
  };

  const addVariable = () => {
    setForm({
      ...form,
      variables: [...form.variables, { name: '', type: 'string', required: true, description: '' }]
    });
  };

  const removeVariable = (index: number) => {
    setForm({
      ...form,
      variables: form.variables.filter((_, i) => i !== index)
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prompts Studio</CardTitle>
          <CardDescription>Gestión y versionado de prompts del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Prompts</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">En Producción</p>
            <p className="text-2xl font-bold text-primary">{stats.production}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">En Revisión</p>
            <p className="text-2xl font-bold text-accent-foreground">{stats.review}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Borradores</p>
            <p className="text-2xl font-bold text-muted-foreground">{stats.draft}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prompts Studio
            </CardTitle>
            <CardDescription>Gestión y versionado de prompts del sistema</CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Prompt
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="review">En Revisión</SelectItem>
                <SelectItem value="approved">Aprobado</SelectItem>
                <SelectItem value="production">Producción</SelectItem>
                <SelectItem value="deprecated">Deprecado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={taskFilter} onValueChange={setTaskFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas las tareas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las tareas</SelectItem>
                {tasks?.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.task_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompts List */}
          {filteredPrompts?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay prompts configurados</p>
              <p className="text-sm">Añade un prompt para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrompts?.map((prompt) => {
                const statusConfig = STATUS_CONFIG[prompt.status] || STATUS_CONFIG.draft;
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div key={prompt.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{prompt.name}</p>
                          {prompt.task?.task_code && (
                            <Badge variant="outline">{prompt.task.task_code}</Badge>
                          )}
                          <Badge variant="secondary">
                            {prompt.model_code || 'Cualquier modelo'}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            <span className="text-xs">v{prompt.version}</span>
                            {prompt.is_latest && (
                              <Badge variant="secondary" className="text-xs">latest</Badge>
                            )}
                          </div>
                          <Badge className={`${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {prompt.status}
                          </Badge>
                        </div>
                        {prompt.description && (
                          <p className="text-sm text-muted-foreground mt-1">{prompt.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => copyPrompt(prompt.user_prompt_template)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(prompt)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive" 
                          onClick={() => handleDelete(prompt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Preview */}
                    <div className="bg-muted/50 rounded p-3 mt-2">
                      <p className="text-xs font-mono text-muted-foreground line-clamp-3">
                        {prompt.system_prompt || prompt.user_prompt_template}
                      </p>
                    </div>
                    
                    {/* Meta and Actions */}
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {prompt.suggested_temperature && <span>Temp: {prompt.suggested_temperature}</span>}
                        {prompt.suggested_max_tokens && <span>Max: {prompt.suggested_max_tokens} tokens</span>}
                        {prompt.execution_count > 0 && (
                          <span>{prompt.execution_count} ejecuciones</span>
                        )}
                        {prompt.avg_cost && (
                          <span>${prompt.avg_cost.toFixed(4)}/req</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {prompt.status === 'draft' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusChange(prompt.id, 'review')}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Enviar a Revisión
                          </Button>
                        )}
                        {prompt.status === 'review' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(prompt.id, 'draft')}
                            >
                              Rechazar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(prompt.id, 'approved')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aprobar
                            </Button>
                          </>
                        )}
                        {prompt.status === 'approved' && (
                          <Button 
                            size="sm"
                            onClick={() => handleStatusChange(prompt.id, 'production')}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Publicar
                          </Button>
                        )}
                        {prompt.status === 'production' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCreateVersion(prompt.id)}
                          >
                            <GitBranch className="h-3 w-3 mr-1" />
                            Nueva Versión
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prompt Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrompt ? `Editar: ${editingPrompt.name}` : 'Nuevo Prompt'}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="config">Configuración</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              {/* System Prompt */}
              <div>
                <Label>System Prompt</Label>
                <Textarea
                  value={form.system_prompt}
                  onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                  placeholder="Define el rol y comportamiento del modelo..."
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              {/* User Prompt Template */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>User Prompt Template *</Label>
                  <Button variant="outline" size="sm" onClick={detectVariables}>
                    <Variable className="w-4 h-4 mr-1" />
                    Detectar Variables
                  </Button>
                </div>
                <Textarea
                  value={form.user_prompt_template}
                  onChange={(e) => setForm({ ...form, user_prompt_template: e.target.value })}
                  placeholder="Usa {{variable}} para placeholders..."
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Usa {"{{variable}}"} para definir placeholders que se sustituirán en tiempo de ejecución.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="variables" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Variables del Prompt</Label>
                <Button variant="outline" size="sm" onClick={addVariable}>
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir Variable
                </Button>
              </div>

              {form.variables.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay variables definidas. Usa {"{{nombre}}"} en el template y detecta automáticamente.
                </p>
              ) : (
                <div className="space-y-3">
                  {form.variables.map((v, idx) => (
                    <div key={idx} className="flex gap-3 items-start p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs">Nombre</Label>
                          <Input
                            value={v.name}
                            onChange={(e) => {
                              const vars = [...form.variables];
                              vars[idx].name = e.target.value;
                              setForm({ ...form, variables: vars });
                            }}
                            placeholder="nombre_variable"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Tipo</Label>
                          <Select 
                            value={v.type}
                            onValueChange={(val) => {
                              const vars = [...form.variables];
                              vars[idx].type = val as PromptVariable['type'];
                              setForm({ ...form, variables: vars });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">String</SelectItem>
                              <SelectItem value="text">Text (largo)</SelectItem>
                              <SelectItem value="number">Número</SelectItem>
                              <SelectItem value="boolean">Booleano</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Descripción</Label>
                          <Input
                            value={v.description || ''}
                            onChange={(e) => {
                              const vars = [...form.variables];
                              vars[idx].description = e.target.value;
                              setForm({ ...form, variables: vars });
                            }}
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={v.required}
                              onChange={(e) => {
                                const vars = [...form.variables];
                                vars[idx].required = e.target.checked;
                                setForm({ ...form, variables: vars });
                              }}
                            />
                            <span className="text-sm">Requerido</span>
                          </label>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeVariable(idx)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nombre descriptivo"
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Qué hace este prompt..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tarea *</Label>
                  <Select value={form.task_id} onValueChange={(v) => setForm({ ...form, task_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tarea" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks?.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.task_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Modelo específico (opcional)</Label>
                  <Select 
                    value={form.model_code || ''} 
                    onValueChange={(v) => setForm({ ...form, model_code: v || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Cualquier modelo</SelectItem>
                      {models?.map(m => (
                        <SelectItem key={m.id} value={m.model_id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Formato de salida</Label>
                  <Select 
                    value={form.output_format}
                    onValueChange={(v) => setForm({ ...form, output_format: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto libre</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="structured">Structured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Temperatura</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={form.suggested_temperature}
                    onChange={(e) => setForm({ ...form, suggested_temperature: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    value={form.suggested_max_tokens}
                    onChange={(e) => setForm({ ...form, suggested_max_tokens: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={createPrompt.isPending || updatePrompt.isPending}
            >
              {editingPrompt ? 'Guardar Cambios' : 'Crear Prompt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
