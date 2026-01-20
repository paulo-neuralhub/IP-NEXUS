// ============================================================
// IP-NEXUS BACKOFFICE - HELP RULES MANAGEMENT
// Prompt 48: Knowledge Base & Rules Engine
// ============================================================

import { useState } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  MoreHorizontal,
  Zap,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  useHelpRules, 
  useCreateHelpRule, 
  useUpdateHelpRule, 
  useDeleteHelpRule,
  HelpRule 
} from '@/hooks/help/useHelpRules';
import { toast } from 'sonner';

const RULE_TYPE_CONFIG = {
  contextual: { label: 'Contextual', icon: HelpCircle, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  proactive: { label: 'Proactivo', icon: Lightbulb, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  onboarding: { label: 'Onboarding', icon: Zap, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  error: { label: 'Error', icon: AlertTriangle, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

const DISPLAY_TYPE_OPTIONS = [
  { value: 'tooltip', label: 'Tooltip' },
  { value: 'floating', label: 'Flotante' },
  { value: 'banner', label: 'Banner' },
  { value: 'modal', label: 'Modal' },
  { value: 'sidebar', label: 'Sidebar' },
];

export function HelpRulesPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<HelpRule | null>(null);

  const { data: rules, isLoading } = useHelpRules({ activeOnly: false });
  const createRule = useCreateHelpRule();
  const updateRule = useUpdateHelpRule();
  const deleteRule = useDeleteHelpRule();

  const filteredRules = rules?.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || rule.rule_type === typeFilter;
    return matchesSearch && matchesType;
  }) || [];

  const handleToggleActive = async (rule: HelpRule) => {
    await updateRule.mutateAsync({ id: rule.id, is_active: !rule.is_active });
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta regla de ayuda?')) {
      await deleteRule.mutateAsync(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Reglas de Ayuda Contextual
            </CardTitle>
            <CardDescription>
              Configura cuándo y cómo mostrar ayuda a los usuarios
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Regla
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar reglas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="contextual">Contextual</SelectItem>
              <SelectItem value="proactive">Proactivo</SelectItem>
              <SelectItem value="onboarding">Onboarding</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{rules?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Total Reglas</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{rules?.filter(r => r.is_active).length || 0}</div>
            <div className="text-xs text-muted-foreground">Activas</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{rules?.filter(r => r.rule_type === 'onboarding').length || 0}</div>
            <div className="text-xs text-muted-foreground">Onboarding</div>
          </div>
          <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">{rules?.filter(r => r.rule_type === 'proactive').length || 0}</div>
            <div className="text-xs text-muted-foreground">Proactivas</div>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Regla</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Display</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Límites</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Cargando reglas...
                  </TableCell>
                </TableRow>
              ) : filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron reglas
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map((rule) => (
                  <RuleRow
                    key={rule.id}
                    rule={rule}
                    onEdit={() => setEditingRule(rule)}
                    onDelete={() => handleDelete(rule.id)}
                    onToggle={() => handleToggleActive(rule)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Create/Edit Dialog */}
      <RuleDialog
        open={isCreateOpen || !!editingRule}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingRule(null);
          }
        }}
        rule={editingRule}
        onSave={async (data) => {
          if (editingRule) {
            await updateRule.mutateAsync({ id: editingRule.id, ...data });
          } else {
            await createRule.mutateAsync(data as { code: string; name: string });
          }
          setIsCreateOpen(false);
          setEditingRule(null);
        }}
      />
    </Card>
  );
}

interface RuleRowProps {
  rule: HelpRule;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

function RuleRow({ rule, onEdit, onDelete, onToggle }: RuleRowProps) {
  const typeConfig = RULE_TYPE_CONFIG[rule.rule_type as keyof typeof RULE_TYPE_CONFIG] || RULE_TYPE_CONFIG.contextual;
  const TypeIcon = typeConfig.icon;

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{rule.name}</div>
          <div className="text-xs text-muted-foreground font-mono">{rule.code}</div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={typeConfig.color}>
          <TypeIcon className="h-3 w-3 mr-1" />
          {typeConfig.label}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm capitalize">{rule.display_type}</span>
      </TableCell>
      <TableCell>
        <span className="font-mono text-sm">{rule.priority}</span>
      </TableCell>
      <TableCell>
        <div className="text-xs text-muted-foreground">
          <div>{rule.max_displays_per_user}x/usuario</div>
          <div>{rule.max_displays_per_session}x/sesión</div>
        </div>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" onClick={onToggle} className="p-0 h-auto">
          {rule.is_active ? (
            <ToggleRight className="h-6 w-6 text-green-500" />
          ) : (
            <ToggleLeft className="h-6 w-6 text-muted-foreground" />
          )}
        </Button>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

interface RuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: HelpRule | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

function RuleDialog({ open, onOpenChange, rule, onSave }: RuleDialogProps) {
  const [formData, setFormData] = useState({
    code: rule?.code || '',
    name: rule?.name || '',
    description: rule?.description || '',
    rule_type: rule?.rule_type || 'contextual',
    display_type: rule?.display_type || 'floating',
    custom_title: rule?.custom_title || '',
    custom_content: rule?.custom_content || '',
    priority: rule?.priority || 50,
    max_displays_per_user: rule?.max_displays_per_user || 3,
    max_displays_per_session: rule?.max_displays_per_session || 1,
    cooldown_hours: rule?.cooldown_hours || 24,
    is_active: rule?.is_active ?? true,
    conditions: JSON.stringify(rule?.conditions || {}, null, 2),
  });
  const [saving, setSaving] = useState(false);

  // Reset form when rule changes
  useState(() => {
    if (rule) {
      setFormData({
        code: rule.code,
        name: rule.name,
        description: rule.description || '',
        rule_type: rule.rule_type,
        display_type: rule.display_type,
        custom_title: rule.custom_title || '',
        custom_content: rule.custom_content || '',
        priority: rule.priority,
        max_displays_per_user: rule.max_displays_per_user,
        max_displays_per_session: rule.max_displays_per_session,
        cooldown_hours: rule.cooldown_hours,
        is_active: rule.is_active,
        conditions: JSON.stringify(rule.conditions || {}, null, 2),
      });
    }
  });

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Código y nombre son requeridos');
      return;
    }

    setSaving(true);
    try {
      let conditions = {};
      try {
        conditions = JSON.parse(formData.conditions);
      } catch {
        toast.error('JSON de condiciones inválido');
        setSaving(false);
        return;
      }

      await onSave({
        ...formData,
        conditions,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? 'Editar Regla' : 'Nueva Regla de Ayuda'}</DialogTitle>
          <DialogDescription>
            Configura cuándo y cómo mostrar ayuda contextual a los usuarios
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="first-visit-docket"
                disabled={!!rule}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Primera visita al Docket"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción interna de la regla"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Regla</Label>
              <Select
                value={formData.rule_type}
                onValueChange={(value: 'contextual' | 'proactive' | 'onboarding' | 'error') => 
                  setFormData({ ...formData, rule_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contextual">Contextual</SelectItem>
                  <SelectItem value="proactive">Proactivo</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Display</Label>
              <Select
                value={formData.display_type}
                onValueChange={(value: 'tooltip' | 'floating' | 'banner' | 'modal' | 'sidebar') => 
                  setFormData({ ...formData, display_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISPLAY_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_title">Título a Mostrar</Label>
            <Input
              id="custom_title"
              value={formData.custom_title}
              onChange={(e) => setFormData({ ...formData, custom_title: e.target.value })}
              placeholder="Título que verá el usuario"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_content">Contenido a Mostrar</Label>
            <Textarea
              id="custom_content"
              value={formData.custom_content}
              onChange={(e) => setFormData({ ...formData, custom_content: e.target.value })}
              placeholder="Texto de ayuda que verá el usuario"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conditions">Condiciones (JSON)</Label>
            <Textarea
              id="conditions"
              value={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
              placeholder='{"module": "docket", "page": "/app/docket"}'
              rows={3}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Ejemplo: {`{"module": "docket"}`} o {`{"page": "/app/spider"}`}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 50 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_user">Max/Usuario</Label>
              <Input
                id="max_user"
                type="number"
                value={formData.max_displays_per_user}
                onChange={(e) => setFormData({ ...formData, max_displays_per_user: parseInt(e.target.value) || 3 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_session">Max/Sesión</Label>
              <Input
                id="max_session"
                type="number"
                value={formData.max_displays_per_session}
                onChange={(e) => setFormData({ ...formData, max_displays_per_session: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cooldown">Cooldown (h)</Label>
              <Input
                id="cooldown"
                type="number"
                value={formData.cooldown_hours}
                onChange={(e) => setFormData({ ...formData, cooldown_hours: parseInt(e.target.value) || 24 })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label>Regla activa</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : rule ? 'Guardar Cambios' : 'Crear Regla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default HelpRulesPanel;
