// ============================================================
// IP-NEXUS AI BRAIN - BUDGETS TAB (PHASE 3)
// ============================================================

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  Plus,
  AlertTriangle,
  TrendingUp,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Bell,
} from 'lucide-react';
import {
  useAIBudgets,
  useAIBudgetSummary,
  useAIBudgetAlerts,
  useCreateAIBudget,
  useUpdateAIBudget,
  useDeleteAIBudget,
  useAcknowledgeAlert,
  type AIBudgetConfig,
} from '@/hooks/ai-brain/useAIBudgets';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

export function BudgetsTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Partial<AIBudgetConfig> | null>(null);

  const { data: budgets, isLoading } = useAIBudgets();
  const { data: summary } = useAIBudgetSummary();
  const { data: alerts } = useAIBudgetAlerts(false);
  const createBudget = useCreateAIBudget();
  const updateBudget = useUpdateAIBudget();
  const deleteBudget = useDeleteAIBudget();
  const acknowledgeAlert = useAcknowledgeAlert();

  // Load organizations
  const { data: organizations } = useQuery({
    queryKey: ['organizations-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name');
      return data || [];
    },
  });

  // Load models
  const { data: models } = useQuery({
    queryKey: ['ai-models-active'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_models')
        .select('id, name, model_id')
        .eq('is_active', true)
        .order('name');
      return data || [];
    },
  });

  const getUsagePercent = (spent: number, limit: number) => {
    if (!limit) return 0;
    return Math.min(100, (spent / limit) * 100);
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSave = async (data: Partial<AIBudgetConfig>) => {
    if (editingBudget?.id) {
      await updateBudget.mutateAsync({ id: editingBudget.id, ...data });
    } else {
      await createBudget.mutateAsync(data);
    }
    setIsDialogOpen(false);
    setEditingBudget(null);
  };

  const handleEdit = (budget: AIBudgetConfig) => {
    setEditingBudget(budget);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este presupuesto?')) {
      await deleteBudget.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Gasto Mensual</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">
              {formatCurrency(summary?.totalMonthlySpent || 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              de {formatCurrency(summary?.totalMonthlyBudget || 0)}
            </p>
            <Progress
              value={summary?.monthlyUsagePercent || 0}
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Gasto Hoy</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">
              {formatCurrency(summary?.totalDailySpent || 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              límite: {formatCurrency(summary?.totalDailyBudget || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Presupuestos</p>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold">
              {summary?.activeBudgets || 0}
            </p>
            <p className="text-xs text-muted-foreground">activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">En Riesgo</p>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold">
              {summary?.atRisk || 0}
            </p>
            <p className="text-xs text-muted-foreground">&gt;80% usado</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertas Pendientes ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {alert.alert_type === 'exceeded' ? 'Presupuesto Excedido' :
                       alert.alert_type === 'threshold_80' ? 'Umbral 80% alcanzado' :
                       alert.alert_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Gastado: {formatCurrency(alert.current_spend || 0)} / {formatCurrency(alert.budget_amount || 0)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => acknowledgeAlert.mutate(alert.id)}
                  >
                    Reconocer
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budgets Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Presupuestos</CardTitle>
            <CardDescription>Control de gastos por organización</CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditingBudget({});
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Presupuesto
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organización</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Límite Diario</TableHead>
                <TableHead>Límite Mensual</TableHead>
                <TableHead>Uso Mensual</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets?.map((budget) => {
                const monthlyPercent = getUsagePercent(
                  budget.current_period_spend,
                  budget.budget_amount
                );

                return (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">
                      {budget.organization?.name || 'Global'}
                    </TableCell>
                    <TableCell>
                      {budget.module ? (
                        <Badge variant="outline">{budget.module}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Todos</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {budget.daily_limit
                        ? formatCurrency(budget.daily_limit)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {budget.budget_amount
                        ? formatCurrency(budget.budget_amount)
                        : '-'}
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{formatCurrency(budget.current_period_spend || 0)}</span>
                          <span>{monthlyPercent.toFixed(0)}%</span>
                        </div>
                        <Progress
                          value={monthlyPercent}
                          className={`h-1.5 ${getUsageColor(monthlyPercent)}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          budget.hard_limit_action === 'block'
                            ? 'destructive'
                            : budget.hard_limit_action === 'degrade'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {budget.hard_limit_action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {budget.is_active ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(budget)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!budgets || budgets.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay presupuestos configurados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Budget Dialog */}
      <BudgetDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingBudget(null);
        }}
        budget={editingBudget}
        organizations={organizations || []}
        models={models || []}
        onSave={handleSave}
        isLoading={createBudget.isPending || updateBudget.isPending}
      />
    </div>
  );
}

// Budget Form Dialog
interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Partial<AIBudgetConfig> | null;
  organizations: Array<{ id: string; name: string }>;
  models: Array<{ id: string; name: string; model_id: string }>;
  onSave: (data: Partial<AIBudgetConfig>) => void;
  isLoading: boolean;
}

function BudgetDialog({
  open,
  onOpenChange,
  budget,
  organizations,
  models,
  onSave,
  isLoading,
}: BudgetDialogProps) {
  const [form, setForm] = useState<Partial<AIBudgetConfig>>({});

  // Reset form when dialog opens
  useState(() => {
    if (open && budget) {
      setForm(budget);
    }
  });

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {budget?.id ? 'Editar' : 'Nuevo'} Presupuesto
          </DialogTitle>
          <DialogDescription>
            Configura límites de gasto para controlar costes de IA
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Organización</Label>
            <Select
              value={form.organization_id || ''}
              onValueChange={(v) => setForm({ ...form, organization_id: v || undefined })}
              disabled={!!budget?.id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar organización" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Módulo (opcional)</Label>
            <Select
              value={form.module || ''}
              onValueChange={(v) => setForm({ ...form, module: v || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los módulos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="genius">Genius</SelectItem>
                <SelectItem value="guide">Guide</SelectItem>
                <SelectItem value="translator">Translator</SelectItem>
                <SelectItem value="import">Import</SelectItem>
                <SelectItem value="documents">Documents</SelectItem>
                <SelectItem value="crm">CRM</SelectItem>
                <SelectItem value="spider">Spider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Límite Diario (USD)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.daily_limit || ''}
                onChange={(e) =>
                  setForm({ ...form, daily_limit: parseFloat(e.target.value) || undefined })
                }
                placeholder="Ej: 10.00"
              />
            </div>
            <div className="grid gap-2">
              <Label>Límite Mensual (USD)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.budget_amount || ''}
                onChange={(e) =>
                  setForm({ ...form, budget_amount: parseFloat(e.target.value) || undefined })
                }
                placeholder="Ej: 100.00"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Límite por Request (USD)</Label>
            <Input
              type="number"
              step="0.0001"
              value={form.per_request_limit || ''}
              onChange={(e) =>
                setForm({ ...form, per_request_limit: parseFloat(e.target.value) || undefined })
              }
              placeholder="Ej: 0.50"
            />
          </div>

          <div className="grid gap-2">
            <Label>Acción cuando se excede</Label>
            <Select
              value={form.hard_limit_action || 'degrade'}
              onValueChange={(v) => setForm({ ...form, hard_limit_action: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alert">Solo alertar</SelectItem>
                <SelectItem value="degrade">Degradar a modelo barato</SelectItem>
                <SelectItem value="block">Bloquear ejecución</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.hard_limit_action === 'degrade' && (
            <div className="grid gap-2">
              <Label>Modelo de Fallback</Label>
              <Select
                value={form.fallback_model_id || ''}
                onValueChange={(v) => setForm({ ...form, fallback_model_id: v || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar modelo" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-3">
            <Label>Alertas</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm">Alertar al 50%</span>
              <Switch
                checked={form.alert_at_50 ?? false}
                onCheckedChange={(v) => setForm({ ...form, alert_at_50: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Alertar al 80%</span>
              <Switch
                checked={form.alert_at_80 ?? true}
                onCheckedChange={(v) => setForm({ ...form, alert_at_80: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Alertar al 100%</span>
              <Switch
                checked={form.alert_at_100 ?? true}
                onCheckedChange={(v) => setForm({ ...form, alert_at_100: v })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Email de Alerta</Label>
            <Input
              type="email"
              value={form.alert_email || ''}
              onChange={(e) => setForm({ ...form, alert_email: e.target.value || undefined })}
              placeholder="admin@empresa.com"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Presupuesto activo</span>
            <Switch
              checked={form.is_active ?? true}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !form.organization_id}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
