// =====================================================================
// IP-NEXUS BACKOFFICE - Editor de Master Templates
// =====================================================================

import { useState, useEffect } from 'react';
import { 
  X, Save, Zap, Settings, Clock, Filter, Play, 
  ChevronRight, Plus, Trash2, GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import {
  useCreateMasterTemplate,
  useUpdateMasterTemplate,
  useTenantInstancesCount,
} from '@/hooks/backoffice/useAutomationMasterTemplates';

import {
  CATEGORY_CONFIG,
  VISIBILITY_CONFIG,
  TRIGGER_TYPE_CONFIG,
  PLAN_TIER_CONFIG,
  ACTION_TYPE_CONFIG,
  getTriggerDescription,
  type AutomationMasterTemplate,
  type AutomationCategory,
  type AutomationVisibility,
  type TriggerType,
  type PlanTier,
  type ActionConfig,
  type ConditionConfig,
  type ConfigurableParam,
  type TriggerConfig,
} from '@/types/automations';

interface MasterTemplateEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: AutomationMasterTemplate | null;
  isCreating: boolean;
}

const DEFAULT_TEMPLATE: Omit<AutomationMasterTemplate, 'id' | 'created_at' | 'updated_at' | 'version'> = {
  code: '',
  name: '',
  name_en: '',
  description: '',
  description_en: '',
  category: 'deadlines',
  icon: '⚡',
  color: '#6366F1',
  visibility: 'optional',
  min_plan_tier: 'free',
  trigger_type: 'db_event',
  trigger_config: {},
  conditions: [],
  actions: [],
  configurable_params: [],
  is_published: false,
  is_active: true,
  tags: [],
  related_entity: 'matter',
  sort_order: 0,
};

export function MasterTemplateEditorDialog({
  open,
  onOpenChange,
  template,
  isCreating,
}: MasterTemplateEditorDialogProps) {
  const [formData, setFormData] = useState<typeof DEFAULT_TEMPLATE>(DEFAULT_TEMPLATE);
  const [activeTab, setActiveTab] = useState('general');

  const createMutation = useCreateMasterTemplate();
  const updateMutation = useUpdateMasterTemplate();
  const { data: instancesCount } = useTenantInstancesCount(template?.id);

  // Initialize form data
  useEffect(() => {
    if (template) {
      setFormData({
        code: template.code,
        name: template.name,
        name_en: template.name_en || '',
        description: template.description || '',
        description_en: template.description_en || '',
        category: template.category,
        icon: template.icon,
        color: template.color,
        visibility: template.visibility,
        min_plan_tier: template.min_plan_tier,
        trigger_type: template.trigger_type,
        trigger_config: template.trigger_config,
        conditions: template.conditions,
        actions: template.actions,
        configurable_params: template.configurable_params,
        is_published: template.is_published,
        is_active: template.is_active,
        tags: template.tags,
        related_entity: template.related_entity,
        sort_order: template.sort_order,
      });
    } else {
      setFormData(DEFAULT_TEMPLATE);
    }
    setActiveTab('general');
  }, [template, open]);

  const handleSave = () => {
    if (template && !isCreating) {
      updateMutation.mutate({
        id: template.id,
        ...formData,
      }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{formData.icon}</span>
              {isCreating ? 'Nueva Automatización' : formData.name}
              {!isCreating && template && (
                <Badge variant="secondary" className="ml-2">v{template.version}</Badge>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b px-6">
            <TabsList className="h-12 bg-transparent border-0">
              <TabsTrigger value="general" className="data-[state=active]:bg-muted">
                <Settings className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="trigger" className="data-[state=active]:bg-muted">
                <Clock className="h-4 w-4 mr-2" />
                Trigger
              </TabsTrigger>
              <TabsTrigger value="conditions" className="data-[state=active]:bg-muted">
                <Filter className="h-4 w-4 mr-2" />
                Condiciones
              </TabsTrigger>
              <TabsTrigger value="actions" className="data-[state=active]:bg-muted">
                <Play className="h-4 w-4 mr-2" />
                Acciones
              </TabsTrigger>
              <TabsTrigger value="params" className="data-[state=active]:bg-muted">
                <Zap className="h-4 w-4 mr-2" />
                Parámetros
              </TabsTrigger>
              {!isCreating && (
                <TabsTrigger value="status" className="data-[state=active]:bg-muted">
                  Estado
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {/* Tab 1: General */}
              <TabsContent value="general" className="mt-0 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código</Label>
                    <Input
                      id="code"
                      placeholder="trademark_renewal_reminder"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      disabled={!isCreating}
                    />
                    <p className="text-xs text-muted-foreground">
                      Identificador único (snake_case). No modificable después de crear.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Orden</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre (ES)</Label>
                    <Input
                      id="name"
                      placeholder="Aviso renovación de marca"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name_en">Nombre (EN)</Label>
                    <Input
                      id="name_en"
                      placeholder="Trademark renewal reminder"
                      value={formData.name_en || ''}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción (ES)</Label>
                    <Textarea
                      id="description"
                      placeholder="Descripción de la automatización..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description_en">Descripción (EN)</Label>
                    <Textarea
                      id="description_en"
                      placeholder="Automation description..."
                      value={formData.description_en || ''}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v as AutomationCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.icon} {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Visibilidad</Label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(v) => setFormData({ ...formData, visibility: v as AutomationVisibility })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(VISIBILITY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.badge} {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Plan Mínimo</Label>
                    <Select
                      value={formData.min_plan_tier}
                      onValueChange={(v) => setFormData({ ...formData, min_plan_tier: v as PlanTier })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PLAN_TIER_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Entidad</Label>
                    <Select
                      value={formData.related_entity || 'matter'}
                      onValueChange={(v) => setFormData({ ...formData, related_entity: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="matter">Expediente</SelectItem>
                        <SelectItem value="contact">Contacto</SelectItem>
                        <SelectItem value="invoice">Factura</SelectItem>
                        <SelectItem value="task">Tarea</SelectItem>
                        <SelectItem value="deadline">Plazo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icono (emoji)</Label>
                    <Input
                      id="icon"
                      placeholder="⚡"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="text-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#6366F1"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="renovación, marca, vencimiento"
                    value={(formData.tags || []).join(', ')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                    })}
                  />
                  <p className="text-xs text-muted-foreground">Separados por comas</p>
                </div>
              </TabsContent>

              {/* Tab 2: Trigger */}
              <TabsContent value="trigger" className="mt-0 space-y-6">
                <div className="space-y-2">
                  <Label>Tipo de Trigger</Label>
                  <Select
                    value={formData.trigger_type}
                    onValueChange={(v) => setFormData({ 
                      ...formData, 
                      trigger_type: v as TriggerType,
                      trigger_config: {} 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRIGGER_TYPE_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{config.icon}</span>
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {TRIGGER_TYPE_CONFIG[formData.trigger_type]?.description}
                  </p>
                </div>

                {/* Trigger Config JSON */}
                <div className="space-y-2">
                  <Label>Configuración del Trigger (JSON)</Label>
                  <Textarea
                    value={JSON.stringify(formData.trigger_config, null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData({ ...formData, trigger_config: JSON.parse(e.target.value) });
                      } catch {}
                    }}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="p-4 rounded-lg border bg-muted/50">
                  <p className="text-sm font-medium">Preview:</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getTriggerDescription(formData.trigger_type, formData.trigger_config)}
                  </p>
                </div>
              </TabsContent>

              {/* Tab 3: Conditions */}
              <TabsContent value="conditions" className="mt-0 space-y-6">
                <div className="space-y-2">
                  <Label>Condiciones (JSON)</Label>
                  <Textarea
                    value={JSON.stringify(formData.conditions, null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData({ ...formData, conditions: JSON.parse(e.target.value) });
                      } catch {}
                    }}
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Array de condiciones con field, operator y value.
                  </p>
                </div>
              </TabsContent>

              {/* Tab 4: Actions */}
              <TabsContent value="actions" className="mt-0 space-y-6">
                <div className="space-y-2">
                  <Label>Acciones (JSON)</Label>
                  <Textarea
                    value={JSON.stringify(formData.actions, null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData({ ...formData, actions: JSON.parse(e.target.value) });
                      } catch {}
                    }}
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Array de acciones con order, type y config.
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-muted/50">
                  <p className="text-sm font-medium mb-2">Tipos de acción disponibles:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(ACTION_TYPE_CONFIG).map(([key, config]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <span>{config.icon}</span>
                        <span className="text-muted-foreground">{config.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 5: Params */}
              <TabsContent value="params" className="mt-0 space-y-6">
                <div className="space-y-2">
                  <Label>Parámetros Configurables (JSON)</Label>
                  <Textarea
                    value={JSON.stringify(formData.configurable_params, null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData({ ...formData, configurable_params: JSON.parse(e.target.value) });
                      } catch {}
                    }}
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Array de parámetros que el tenant puede personalizar.
                  </p>
                </div>
              </TabsContent>

              {/* Tab 6: Status */}
              {!isCreating && (
                <TabsContent value="status" className="mt-0 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm font-medium">Versión</p>
                      <p className="text-2xl font-bold mt-1">{template?.version || 1}</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm font-medium">Instancias en Tenants</p>
                      <p className="text-2xl font-bold mt-1">
                        {instancesCount?.active || 0} activas / {instancesCount?.total || 0} total
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Publicada</p>
                        <p className="text-sm text-muted-foreground">
                          Visible en el catálogo de automatizaciones para tenants.
                        </p>
                      </div>
                      <Switch
                        checked={formData.is_published}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Activa</p>
                        <p className="text-sm text-muted-foreground">
                          Si está desactivada, no se ejecutará en ningún tenant.
                        </p>
                      </div>
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                    </div>
                  </div>
                </TabsContent>
              )}
            </div>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending || !formData.code || !formData.name}>
            {isPending && <Spinner className="h-4 w-4 mr-2" />}
            <Save className="h-4 w-4 mr-2" />
            {isCreating ? 'Crear' : 'Guardar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
