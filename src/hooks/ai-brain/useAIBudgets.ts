// ============================================================
// IP-NEXUS AI BRAIN - BUDGETS HOOKS (PHASE 3)
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIBudgetConfig {
  id: string;
  organization_id: string | null;
  scope_type: string;
  module: string | null;
  model_id: string | null;
  period_type: string;
  budget_amount: number;
  daily_limit: number | null;
  per_request_limit: number | null;
  alert_at_50: boolean;
  alert_at_80: boolean;
  alert_at_100: boolean;
  alert_email: string | null;
  alert_webhook_url: string | null;
  hard_limit: boolean;
  hard_limit_action: string;
  fallback_model_id: string | null;
  current_period_start: string | null;
  current_period_spend: number;
  daily_spent: number;
  monthly_spent: number;
  total_spent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  organization?: { name: string } | null;
  model?: { name: string; model_id: string } | null;
  fallback_model?: { name: string; model_id: string } | null;
}

export interface AIBudgetAlert {
  id: string;
  budget_config_id: string | null;
  organization_id: string | null;
  alert_type: string;
  threshold_percent: number | null;
  current_spend: number | null;
  budget_amount: number | null;
  acknowledged: boolean;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  created_at: string;
}

export interface AICostHistory {
  date: string;
  total_cost: number;
  total_executions: number;
  total_tokens: number;
  cost_by_provider: Record<string, number>;
  cost_by_task: Record<string, number>;
  cost_by_model: Record<string, number>;
}

// Fetch all budgets
export function useAIBudgets() {
  return useQuery({
    queryKey: ['ai-budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_budget_config')
        .select(`
          *,
          organization:organizations(name),
          model:ai_models!model_id(name, model_id),
          fallback_model:ai_models!fallback_model_id(name, model_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as AIBudgetConfig[];
    },
  });
}

// Fetch budget alerts
export function useAIBudgetAlerts(acknowledged?: boolean) {
  return useQuery({
    queryKey: ['ai-budget-alerts', acknowledged],
    queryFn: async () => {
      let query = supabase
        .from('ai_budget_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (acknowledged !== undefined) {
        query = query.eq('acknowledged', acknowledged);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AIBudgetAlert[];
    },
  });
}

// Create budget
export function useCreateAIBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: Partial<AIBudgetConfig>) => {
      const { data, error } = await supabase
        .from('ai_budget_config')
        .insert({
          organization_id: budget.organization_id,
          scope_type: budget.scope_type || 'organization',
          module: budget.module,
          model_id: budget.model_id,
          period_type: budget.period_type || 'monthly',
          budget_amount: budget.budget_amount || 0,
          daily_limit: budget.daily_limit,
          per_request_limit: budget.per_request_limit,
          alert_at_50: budget.alert_at_50 ?? false,
          alert_at_80: budget.alert_at_80 ?? true,
          alert_at_100: budget.alert_at_100 ?? true,
          alert_email: budget.alert_email,
          hard_limit: budget.hard_limit ?? false,
          hard_limit_action: budget.hard_limit_action || 'degrade',
          fallback_model_id: budget.fallback_model_id,
          is_active: budget.is_active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-budgets'] });
      toast.success('Presupuesto creado');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Update budget
export function useUpdateAIBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...budget }: Partial<AIBudgetConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from('ai_budget_config')
        .update({
          budget_amount: budget.budget_amount,
          daily_limit: budget.daily_limit,
          per_request_limit: budget.per_request_limit,
          alert_at_50: budget.alert_at_50,
          alert_at_80: budget.alert_at_80,
          alert_at_100: budget.alert_at_100,
          alert_email: budget.alert_email,
          hard_limit: budget.hard_limit,
          hard_limit_action: budget.hard_limit_action,
          fallback_model_id: budget.fallback_model_id,
          is_active: budget.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-budgets'] });
      toast.success('Presupuesto actualizado');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Delete budget
export function useDeleteAIBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_budget_config')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-budgets'] });
      toast.success('Presupuesto eliminado');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Acknowledge alert
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('ai_budget_alerts')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-budget-alerts'] });
      toast.success('Alerta reconocida');
    },
  });
}

// Fetch cost history
export function useAICostHistory(days: number = 30, tenantId?: string) {
  return useQuery({
    queryKey: ['ai-cost-history', days, tenantId],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('ai_cost_history')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate by date
      const byDate: Record<string, AICostHistory> = {};
      (data || []).forEach((row: any) => {
        const date = row.date;
        if (!byDate[date]) {
          byDate[date] = {
            date,
            total_cost: 0,
            total_executions: 0,
            total_tokens: 0,
            cost_by_provider: {},
            cost_by_task: {},
            cost_by_model: {},
          };
        }
        byDate[date].total_cost += row.total_cost || 0;
        byDate[date].total_executions += row.total_executions || 0;
        byDate[date].total_tokens += row.total_tokens || 0;

        // Merge JSONB objects
        Object.entries(row.cost_by_provider || {}).forEach(([k, v]) => {
          byDate[date].cost_by_provider[k] = (byDate[date].cost_by_provider[k] || 0) + (v as number);
        });
        Object.entries(row.cost_by_task || {}).forEach(([k, v]) => {
          byDate[date].cost_by_task[k] = (byDate[date].cost_by_task[k] || 0) + (v as number);
        });
        Object.entries(row.cost_by_model || {}).forEach(([k, v]) => {
          byDate[date].cost_by_model[k] = (byDate[date].cost_by_model[k] || 0) + (v as number);
        });
      });

      return Object.values(byDate);
    },
  });
}

// Get budget usage summary
export function useAIBudgetSummary() {
  return useQuery({
    queryKey: ['ai-budget-summary'],
    queryFn: async () => {
      const { data: budgets } = await supabase
        .from('ai_budget_config')
        .select('budget_amount, current_period_spend, daily_spent, daily_limit, is_active')
        .eq('is_active', true);

      const totalMonthlyBudget = budgets?.reduce((sum, b) => sum + (b.budget_amount || 0), 0) || 0;
      const totalMonthlySpent = budgets?.reduce((sum, b) => sum + (b.current_period_spend || 0), 0) || 0;
      const totalDailyBudget = budgets?.reduce((sum, b) => sum + (b.daily_limit || 0), 0) || 0;
      const totalDailySpent = budgets?.reduce((sum, b) => sum + (b.daily_spent || 0), 0) || 0;
      const activeBudgets = budgets?.length || 0;
      const atRisk = budgets?.filter(b => {
        const pct = b.budget_amount ? (b.current_period_spend / b.budget_amount) * 100 : 0;
        return pct >= 80;
      }).length || 0;

      return {
        totalMonthlyBudget,
        totalMonthlySpent,
        totalDailyBudget,
        totalDailySpent,
        activeBudgets,
        atRisk,
        monthlyUsagePercent: totalMonthlyBudget > 0 ? (totalMonthlySpent / totalMonthlyBudget) * 100 : 0,
      };
    },
  });
}

// Check budget before execution (for edge functions to call)
export function useCheckBudget() {
  return useMutation({
    mutationFn: async ({ tenantId, taskCode, estimatedCost }: {
      tenantId: string;
      taskCode: string;
      estimatedCost: number;
    }) => {
      const { data, error } = await supabase.rpc('check_budget_before_execution', {
        p_tenant_id: tenantId,
        p_task_code: taskCode,
        p_estimated_cost: estimatedCost,
      });

      if (error) throw error;
      return data?.[0] || { can_execute: true, action: 'allow', reason: 'OK' };
    },
  });
}

// Estimate cost
export function useEstimateCost() {
  return useMutation({
    mutationFn: async ({ modelCode, inputTokens, outputTokens }: {
      modelCode: string;
      inputTokens: number;
      outputTokens?: number;
    }) => {
      const { data, error } = await supabase.rpc('estimate_execution_cost', {
        p_model_code: modelCode,
        p_estimated_input_tokens: inputTokens,
        p_estimated_output_tokens: outputTokens || null,
      });

      if (error) throw error;
      return data as number;
    },
  });
}
