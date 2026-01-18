import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useOrganization } from '@/contexts/organization-context';
import { useToast } from '@/hooks/use-toast';
import { useTemplates, useCreateAutomation, useUpdateAutomation } from '@/hooks/use-marketing';
import { cn, generateUniqueId } from '@/lib/utils';
import { AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS } from '@/lib/constants/marketing';
import { 
  ArrowLeft, Save, Play, Plus, Trash2, Settings, 
  Loader2, Target, Clock, Mail, Tag, GitBranch, 
  ListPlus, ListMinus, UserCog, Bell, Globe
} from 'lucide-react';
import type { Automation, AutomationAction } from '@/types/marketing';

const ACTION_ICONS: Record<string, React.ElementType> = {
  send_email: Mail,
  wait: Clock,
  condition: GitBranch,
  add_tag: Tag,
  remove_tag: Tag,
  add_to_list: ListPlus,
  remove_from_list: ListMinus,
  update_contact: UserCog,
  create_task: Settings,
  notify_team: Bell,
  webhook: Globe,
};

const getDefaultConfig = (type: AutomationAction['type']): Record<string, unknown> => {
  switch (type) {
    case 'send_email':
      return { template_id: '', subject_override: '' };
    case 'wait':
      return { duration: 1, unit: 'hours' };
    case 'condition':
      return { field: '', operator: 'equals', value: '' };
    case 'add_tag':
    case 'remove_tag':
      return { tag: '' };
    case 'add_to_list':
    case 'remove_from_list':
      return { list_id: '' };
    case 'update_contact':
      return { field: '', value: '' };
    default:
      return {};
  }
};

export default function AutomationEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const isNew = !id || id === 'new';

  const { data: templates } = useTemplates();
  const createAutomation = useCreateAutomation();
  const updateAutomation = useUpdateAutomation();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<string>('contact_created');
  const [triggerConfig, setTriggerConfig] = useState<Record<string, unknown>>({});
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  const selectedAction = actions.find(a => a.id === selectedActionId);

  const addAction = (type: AutomationAction['type']) => {
    const newAction: AutomationAction = {
      id: generateUniqueId(),
      type,
      config: getDefaultConfig(type),
    };
    setActions([...actions, newAction]);
    setSelectedActionId(newAction.id);
  };

  const updateAction = (id: string, updates: Partial<AutomationAction>) => {
    setActions(actions.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
    if (selectedActionId === id) setSelectedActionId(null);
  };

  const handleSave = async (activate: boolean = false) => {
    if (!name || !triggerType) {
      toast({
        title: 'Campos requeridos',
        description: 'Nombre y trigger son obligatorios',
        variant: 'destructive'
      });
      return;
    }

    if (!currentOrganization) return;

    const automationData: Partial<Automation> = {
      name,
      description: description || undefined,
      trigger_type: triggerType as Automation['trigger_type'],
      trigger_config: triggerConfig,
      actions,
      status: activate ? 'active' : 'draft',
      organization_id: currentOrganization.id,
      owner_type: 'tenant',
    };

    try {
      if (isNew) {
        await createAutomation.mutateAsync(automationData);
        toast({ title: activate ? 'Automatización activada' : 'Automatización guardada' });
      } else if (id) {
        await updateAutomation.mutateAsync({ id, data: automationData });
        toast({ title: activate ? 'Automatización activada' : 'Automatización actualizada' });
      }
      navigate('/app/marketing/automations');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la automatización',
        variant: 'destructive'
      });
    }
  };

  const isSaving = createAutomation.isPending || updateAutomation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/marketing/automations')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? 'Nueva Automatización' : 'Editar Automatización'}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isSaving || actions.length === 0}>
            <Play className="w-4 h-4 mr-2" />
            Activar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Config */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Bienvenida nuevos contactos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe qué hace esta automatización..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Trigger *</Label>
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar trigger..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AUTOMATION_TRIGGERS).map(([key, trigger]) => (
                    <SelectItem key={key} value={key}>
                      {trigger.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Center: Workflow */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Flujo de Trabajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-2">
              {/* Trigger Node */}
              <div className="w-64 p-4 rounded-lg border-2 border-primary bg-primary/5 text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm">TRIGGER</p>
                <p className="text-sm text-muted-foreground">
                  {AUTOMATION_TRIGGERS[triggerType as keyof typeof AUTOMATION_TRIGGERS]?.label || triggerType}
                </p>
              </div>

              {/* Connector */}
              <div className="w-0.5 h-6 bg-border" />

              {/* Actions */}
              {actions.map((action, index) => {
                const ActionIcon = ACTION_ICONS[action.type] || Settings;
                const actionConfig = AUTOMATION_ACTIONS[action.type as keyof typeof AUTOMATION_ACTIONS];
                
                return (
                  <div key={action.id}>
                    <div
                      className={cn(
                        'w-64 p-4 rounded-lg border cursor-pointer transition-colors',
                        selectedActionId === action.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      )}
                      onClick={() => setSelectedActionId(action.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ActionIcon className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{actionConfig?.label || action.type}</p>
                            {action.type === 'wait' && action.config.duration && (
                              <p className="text-xs text-muted-foreground">
                                {action.config.duration as number} {action.config.unit as string}
                              </p>
                            )}
                            {action.type === 'send_email' && action.config.template_id && (
                              <p className="text-xs text-muted-foreground">
                                {templates?.find(t => t.id === action.config.template_id)?.name || 'Plantilla'}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAction(action.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="w-0.5 h-6 bg-border mx-auto" />
                  </div>
                );
              })}

              {/* Add Action Button */}
              <div className="relative">
                <Select onValueChange={(type) => addAction(type as AutomationAction['type'])}>
                  <SelectTrigger className="w-64">
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir acción
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AUTOMATION_ACTIONS).map(([key, action]) => {
                      const Icon = ACTION_ICONS[key] || Settings;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {action.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Config Panel */}
      <Sheet open={!!selectedAction} onOpenChange={() => setSelectedActionId(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              Configurar {selectedAction && AUTOMATION_ACTIONS[selectedAction.type as keyof typeof AUTOMATION_ACTIONS]?.label}
            </SheetTitle>
          </SheetHeader>
          
          {selectedAction && (
            <div className="mt-6 space-y-4">
              {/* Wait action config */}
              {selectedAction.type === 'wait' && (
                <>
                  <div className="space-y-2">
                    <Label>Duración</Label>
                    <Input
                      type="number"
                      value={selectedAction.config.duration as number || 1}
                      onChange={(e) => updateAction(selectedAction.id, {
                        config: { ...selectedAction.config, duration: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidad</Label>
                    <Select 
                      value={selectedAction.config.unit as string || 'hours'}
                      onValueChange={(unit) => updateAction(selectedAction.id, {
                        config: { ...selectedAction.config, unit }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutos</SelectItem>
                        <SelectItem value="hours">Horas</SelectItem>
                        <SelectItem value="days">Días</SelectItem>
                        <SelectItem value="weeks">Semanas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Send email config */}
              {selectedAction.type === 'send_email' && (
                <>
                  <div className="space-y-2">
                    <Label>Plantilla</Label>
                    <Select 
                      value={selectedAction.config.template_id as string || ''}
                      onValueChange={(template_id) => updateAction(selectedAction.id, {
                        config: { ...selectedAction.config, template_id }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plantilla..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templates?.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Asunto (override)</Label>
                    <Input
                      value={selectedAction.config.subject_override as string || ''}
                      onChange={(e) => updateAction(selectedAction.id, {
                        config: { ...selectedAction.config, subject_override: e.target.value }
                      })}
                      placeholder="Dejar vacío para usar el de la plantilla"
                    />
                  </div>
                </>
              )}

              {/* Tag config */}
              {(selectedAction.type === 'add_tag' || selectedAction.type === 'remove_tag') && (
                <div className="space-y-2">
                  <Label>Tag</Label>
                  <Input
                    value={selectedAction.config.tag as string || ''}
                    onChange={(e) => updateAction(selectedAction.id, {
                      config: { ...selectedAction.config, tag: e.target.value }
                    })}
                    placeholder="Nombre del tag"
                  />
                </div>
              )}

              <Button 
                className="w-full mt-6"
                onClick={() => setSelectedActionId(null)}
              >
                Guardar cambios
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
