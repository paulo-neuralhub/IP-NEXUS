import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  Play,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Settings,
  Zap,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  useWorkflowTemplate,
  useCreateWorkflowTemplate,
  useUpdateWorkflowTemplate,
  useTriggerWorkflowManually
} from '@/hooks/workflow/useWorkflows';
import { 
  WORKFLOW_TRIGGER_TYPES, 
  WORKFLOW_ACTION_TYPES,
  type WorkflowAction,
  type WorkflowTriggerType,
  type WorkflowActionType,
  type WorkflowCategory,
  type WorkflowCondition,
  type WorkflowTriggerConfig
} from '@/types/workflow.types';
import { ConditionBuilder } from './ConditionBuilder';
import { ActionConfigFields } from './ActionConfigPanels';

const CATEGORIES: { value: WorkflowCategory; label: string }[] = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'deadlines', label: 'Plazos' },
  { value: 'notifications', label: 'Notificaciones' },
  { value: 'crm', label: 'CRM' },
  { value: 'billing', label: 'Facturación' },
  { value: 'spider', label: 'Spider' },
  { value: 'custom', label: 'Personalizado' },
];

interface WorkflowFormData {
  code: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  trigger_type: WorkflowTriggerType;
  trigger_config: WorkflowTriggerConfig;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  is_active: boolean;
  requires_approval: boolean;
  approval_message: string;
}

export function WorkflowBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: existingWorkflow, isLoading } = useWorkflowTemplate(id);
  const createWorkflow = useCreateWorkflowTemplate();
  const updateWorkflow = useUpdateWorkflowTemplate();
  const triggerManually = useTriggerWorkflowManually();

  const [formData, setFormData] = useState<WorkflowFormData>({
    code: '',
    name: '',
    description: '',
    category: 'custom',
    trigger_type: 'manual',
    trigger_config: {},
    conditions: [],
    actions: [],
    is_active: false,
    requires_approval: false,
    approval_message: ''
  });

  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());

  // Load existing workflow data
  useEffect(() => {
    if (existingWorkflow) {
      setFormData({
        code: existingWorkflow.code,
        name: existingWorkflow.name,
        description: existingWorkflow.description || '',
        category: existingWorkflow.category as WorkflowCategory,
        trigger_type: existingWorkflow.trigger_type as WorkflowTriggerType,
        trigger_config: existingWorkflow.trigger_config || {},
        conditions: existingWorkflow.conditions || [],
        actions: existingWorkflow.actions || [],
        is_active: existingWorkflow.is_active,
        requires_approval: existingWorkflow.requires_approval || false,
        approval_message: existingWorkflow.approval_message || ''
      });
      // Expand all actions by default in edit mode
      setExpandedActions(new Set((existingWorkflow.actions || []).map((a: WorkflowAction) => a.id)));
    }
  }, [existingWorkflow]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.code.trim()) {
      // Generate code from name
      formData.code = formData.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    }

    try {
      if (isEdit && id) {
        await updateWorkflow.mutateAsync({
          id,
          ...formData
        });
        toast.success('Workflow actualizado');
      } else {
        const workflow = await createWorkflow.mutateAsync({
          ...formData,
          is_system: false
        });
        toast.success('Workflow creado');
        navigate(`/app/workflow/${workflow.id}/edit`);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const handleTest = () => {
    if (!id) {
      toast.error('Guarda el workflow primero');
      return;
    }
    triggerManually.mutate({ workflowId: id });
  };

  const addAction = () => {
    const newAction: WorkflowAction = {
      id: `action_${Date.now()}`,
      type: 'send_notification',
      name: 'Nueva Acción',
      config: {}
    };
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));
    setExpandedActions(prev => new Set([...prev, newAction.id]));
  };

  const updateAction = (actionId: string, updates: Partial<WorkflowAction>) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map(a => 
        a.id === actionId ? { ...a, ...updates } : a
      )
    }));
  };

  const removeAction = (actionId: string) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter(a => a.id !== actionId)
    }));
  };

  const moveAction = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.actions.length) return;
    
    const newActions = [...formData.actions];
    [newActions[index], newActions[newIndex]] = [newActions[newIndex], newActions[index]];
    setFormData(prev => ({ ...prev, actions: newActions }));
  };

  const toggleActionExpanded = (actionId: string) => {
    setExpandedActions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(actionId)) {
        newSet.delete(actionId);
      } else {
        newSet.add(actionId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const selectedTrigger = WORKFLOW_TRIGGER_TYPES.find(t => t.type === formData.trigger_type);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/workflow')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? 'Editar Workflow' : 'Nuevo Workflow'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? formData.name : 'Configura tu automatización'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEdit && (
            <Button 
              variant="outline" 
              onClick={handleTest}
              disabled={triggerManually.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              Probar
            </Button>
          )}
          <Button 
            onClick={handleSave}
            disabled={createWorkflow.isPending || updateWorkflow.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Notificar nuevo expediente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Se genera automáticamente"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="¿Qué hace este workflow?"
              rows={2}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select 
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as WorkflowCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between space-x-2 pt-6">
              <Label htmlFor="active">Activar workflow</Label>
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          {/* Approval Section */}
          <div className="border-t pt-4 mt-4 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Control de Aprobación</span>
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="requires_approval">Requiere aprobación</Label>
                <p className="text-xs text-muted-foreground">
                  Si está activo, el workflow esperará aprobación antes de ejecutarse
                </p>
              </div>
              <Switch
                id="requires_approval"
                checked={formData.requires_approval}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_approval: checked }))}
              />
            </div>

            {formData.requires_approval && (
              <div className="space-y-2">
                <Label htmlFor="approval_message">Mensaje de aprobación (opcional)</Label>
                <Textarea
                  id="approval_message"
                  value={formData.approval_message}
                  onChange={(e) => setFormData(prev => ({ ...prev, approval_message: e.target.value }))}
                  placeholder="Mensaje que verán los aprobadores. Ej: Por favor revise los datos antes de aprobar..."
                  rows={2}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Disparador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>¿Cuándo se ejecuta?</Label>
            <Select 
              value={formData.trigger_type}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                trigger_type: value as WorkflowTriggerType,
                trigger_config: {}
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORKFLOW_TRIGGER_TYPES.map(trigger => (
                  <SelectItem key={trigger.type} value={trigger.type}>
                    <div className="flex items-center gap-2">
                      <span>{trigger.label}</span>
                      <span className="text-muted-foreground text-xs">- {trigger.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trigger-specific config */}
          {formData.trigger_type === 'deadline_approaching' && (
            <div className="space-y-2">
              <Label>Días antes del vencimiento</Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={formData.trigger_config.days_before || 7}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  trigger_config: { ...prev.trigger_config, days_before: parseInt(e.target.value) }
                }))}
              />
            </div>
          )}

          {formData.trigger_type === 'matter_status_changed' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Desde estado (opcional)</Label>
                <Input
                  value={formData.trigger_config.from_status || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    trigger_config: { ...prev.trigger_config, from_status: e.target.value }
                  }))}
                  placeholder="Cualquier estado"
                />
              </div>
              <div className="space-y-2">
                <Label>A estado (opcional)</Label>
                <Input
                  value={formData.trigger_config.to_status || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    trigger_config: { ...prev.trigger_config, to_status: e.target.value }
                  }))}
                  placeholder="Cualquier estado"
                />
              </div>
            </div>
          )}

          {selectedTrigger && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <span className="font-medium">{selectedTrigger.label}:</span>{' '}
              <span className="text-muted-foreground">{selectedTrigger.description}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Condiciones (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Define condiciones que deben cumplirse para ejecutar las acciones
          </p>
          <ConditionBuilder
            conditions={formData.conditions}
            onChange={(conditions) => setFormData(prev => ({ ...prev, conditions }))}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Acciones</CardTitle>
          <Button size="sm" onClick={addAction}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Acción
          </Button>
        </CardHeader>
        <CardContent>
          {formData.actions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay acciones configuradas</p>
              <p className="text-sm">Añade al menos una acción para que el workflow haga algo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.actions.map((action, index) => {
                const actionType = WORKFLOW_ACTION_TYPES.find(t => t.type === action.type);
                const isExpanded = expandedActions.has(action.id);

                return (
                  <Collapsible key={action.id} open={isExpanded}>
                    <div className="border rounded-lg">
                      <CollapsibleTrigger 
                        className="w-full p-4 flex items-center justify-between hover:bg-muted/50"
                        onClick={() => toggleActionExpanded(action.id)}
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <Badge variant="outline">{index + 1}</Badge>
                          <div className="text-left">
                            <p className="font-medium">{action.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {actionType?.label || action.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); moveAction(index, 'up'); }}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); moveAction(index, 'down'); }}
                            disabled={index === formData.actions.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); removeAction(action.id); }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="p-4 pt-0 border-t space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Nombre de la acción</Label>
                              <Input
                                value={action.name}
                                onChange={(e) => updateAction(action.id, { name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Tipo de acción</Label>
                              <Select 
                                value={action.type}
                                onValueChange={(value) => updateAction(action.id, { 
                                  type: value as WorkflowActionType,
                                  config: {}
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {WORKFLOW_ACTION_TYPES.map(type => (
                                    <SelectItem key={type.type} value={type.type}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Action-specific config fields */}
                          <ActionConfigFields 
                            action={action}
                            onUpdate={(config) => updateAction(action.id, { config })}
                          />
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
