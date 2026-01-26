// =============================================
// PÁGINA: PlansManagementPage
// CRUD de planes de suscripción
// src/pages/backoffice/plans/index.tsx
// =============================================

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye,
  EyeOff,
  GripVertical,
  Star,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Plan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  tagline: string | null;
  price_monthly: number;
  price_yearly: number;
  max_users: number;
  max_matters: number;
  max_modules: number;
  max_addons: number;
  max_storage_gb: number;
  included_modules: string[] | null;
  included_addons: string[] | null;
  features: unknown;
  is_popular: boolean;
  is_enterprise: boolean;
  is_visible: boolean;
  requires_contact: boolean;
  badge_text: string | null;
  badge_color: string | null;
  display_order: number;
}

export default function PlansManagementPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Fetch plans
  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return (data || []) as unknown as Plan[];
    },
  });

  // Fetch modules for selection
  const { data: modules = [] } = useQuery({
    queryKey: ['admin-modules-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_modules')
        .select('code, name')
        .order('display_order');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch addons for selection
  const { data: addons = [] } = useQuery({
    queryKey: ['admin-addons-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_addons')
        .select('code, name')
        .order('display_order');
      if (error) throw error;
      return data || [];
    },
  });

  // Save plan mutation
  const savePlan = useMutation({
    mutationFn: async (plan: Partial<Plan>) => {
      if (plan.id) {
        const { error } = await fromTable('subscription_plans')
          .update(plan)
          .eq('id', plan.id);
        if (error) throw error;
      } else {
        const { error } = await fromTable('subscription_plans')
          .insert(plan);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      setIsDialogOpen(false);
      setEditingPlan(null);
      toast.success('Plan guardado correctamente');
    },
    onError: (error) => {
      toast.error('Error al guardar: ' + error.message);
    },
  });

  // Delete plan mutation
  const deletePlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      toast.success('Plan eliminado');
    },
  });

  // Toggle visibility
  const toggleVisibility = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_visible })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
    },
  });

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planes de Suscripción</h1>
          <p className="text-muted-foreground">Gestiona los planes y sus precios</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Plan
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Precio Mensual</TableHead>
              <TableHead>Precio Anual</TableHead>
              <TableHead>Límites</TableHead>
              <TableHead>Módulos Incluidos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : (
              plans?.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{plan.name}</span>
                      {plan.is_popular && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                      {plan.is_enterprise && (
                        <Badge variant="secondary" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          Enterprise
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {plan.tagline}
                    </p>
                  </TableCell>
                  <TableCell>
                    {plan.requires_contact ? (
                      <span className="text-muted-foreground">Consultar</span>
                    ) : (
                      <span className="font-medium">€{plan.price_monthly}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {plan.requires_contact ? (
                      <span className="text-muted-foreground">Consultar</span>
                    ) : (
                      <span className="font-medium">€{plan.price_yearly}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-0.5">
                      <p>{plan.max_users === -1 ? '∞' : plan.max_users} usuarios</p>
                      <p>{plan.max_modules === -1 ? '∞' : plan.max_modules} módulos</p>
                      <p>{plan.max_addons === -1 ? '∞' : plan.max_addons} add-ons</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {plan.included_modules?.slice(0, 3).map((m) => (
                        <Badge key={m} variant="outline" className="text-xs">
                          {m}
                        </Badge>
                      ))}
                      {(plan.included_modules?.length || 0) > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(plan.included_modules?.length || 0) - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility.mutate({ 
                        id: plan.id, 
                        is_visible: !plan.is_visible 
                      })}
                    >
                      {plan.is_visible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm('¿Eliminar este plan?')) {
                            deletePlan.mutate(plan.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de edición */}
      <PlanEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        plan={editingPlan}
        modules={modules}
        addons={addons}
        onSave={(plan) => savePlan.mutate(plan)}
        isSaving={savePlan.isPending}
      />
    </div>
  );
}

// =============================================
// Subcomponente: Dialog de edición de plan
// =============================================

interface PlanEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
  modules: { code: string; name: string }[];
  addons: { code: string; name: string }[];
  onSave: (plan: Partial<Plan>) => void;
  isSaving: boolean;
}

function PlanEditDialog({ 
  open, 
  onOpenChange, 
  plan, 
  modules, 
  addons,
  onSave,
  isSaving,
}: PlanEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Plan>>({
    code: '',
    name: '',
    description: '',
    tagline: '',
    price_monthly: 0,
    price_yearly: 0,
    max_users: 1,
    max_matters: 10,
    max_modules: 1,
    max_addons: 0,
    max_storage_gb: 1,
    included_modules: [],
    included_addons: [],
    features: [],
    is_popular: false,
    is_enterprise: false,
    is_visible: true,
    requires_contact: false,
    display_order: 0,
  });

  // Reset form when plan changes
  useEffect(() => {
    if (plan) {
      setFormData(plan);
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        tagline: '',
        price_monthly: 0,
        price_yearly: 0,
        max_users: 1,
        max_matters: 10,
        max_modules: 1,
        max_addons: 0,
        max_storage_gb: 1,
        included_modules: [],
        included_addons: [],
        features: [],
        is_popular: false,
        is_enterprise: false,
        is_visible: true,
        requires_contact: false,
        display_order: 0,
      });
    }
  }, [plan, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plan ? 'Editar Plan' : 'Nuevo Plan'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Código (único)</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="ej: basico"
                disabled={!!plan}
              />
            </div>
            <div>
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ej: Básico"
              />
            </div>
          </div>

          <div>
            <Label>Tagline</Label>
            <Input
              value={formData.tagline || ''}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="ej: Todo lo esencial para empezar"
            />
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del plan..."
            />
          </div>

          {/* Precios */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Precio Mensual (€)</Label>
              <Input
                type="number"
                value={formData.price_monthly}
                onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Precio Anual (€)</Label>
              <Input
                type="number"
                value={formData.price_yearly}
                onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Límites */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Máx. Usuarios (-1 = ∞)</Label>
              <Input
                type="number"
                value={formData.max_users}
                onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Máx. Expedientes</Label>
              <Input
                type="number"
                value={formData.max_matters}
                onChange={(e) => setFormData({ ...formData, max_matters: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Máx. Storage (GB)</Label>
              <Input
                type="number"
                value={formData.max_storage_gb}
                onChange={(e) => setFormData({ ...formData, max_storage_gb: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Máx. Módulos a elegir</Label>
              <Input
                type="number"
                value={formData.max_modules}
                onChange={(e) => setFormData({ ...formData, max_modules: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Máx. Add-ons</Label>
              <Input
                type="number"
                value={formData.max_addons}
                onChange={(e) => setFormData({ ...formData, max_addons: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Módulos incluidos */}
          <div>
            <Label>Módulos incluidos siempre</Label>
            <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-lg bg-muted/50">
              {modules.map((mod) => (
                <Badge
                  key={mod.code}
                  variant={formData.included_modules?.includes(mod.code) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const current = formData.included_modules || [];
                    const updated = current.includes(mod.code)
                      ? current.filter((c) => c !== mod.code)
                      : [...current, mod.code];
                    setFormData({ ...formData, included_modules: updated });
                  }}
                >
                  {mod.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.is_popular}
                onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
              />
              <span className="text-sm">Marcar como Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.is_enterprise}
                onCheckedChange={(checked) => setFormData({ ...formData, is_enterprise: checked })}
              />
              <span className="text-sm">Es Enterprise</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.requires_contact}
                onCheckedChange={(checked) => setFormData({ ...formData, requires_contact: checked })}
              />
              <span className="text-sm">Requiere contacto</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
              />
              <span className="text-sm">Visible</span>
            </label>
          </div>

          {/* Orden */}
          <div className="w-32">
            <Label>Orden</Label>
            <Input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
