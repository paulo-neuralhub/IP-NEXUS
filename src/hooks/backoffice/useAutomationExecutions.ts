// =====================================================================
// Hook para gestionar Automation Executions (Backoffice)
// Usa las tablas reales: automation_executions, tenant_automations
// =====================================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ExecutionStatus, ActionLog, TriggerType } from '@/types/automations';

const QUERY_KEY = ['automation-executions'];

interface ExecutionFilters {
  organizationId?: string;
  automationId?: string;
  status?: ExecutionStatus;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

// Typed execution for display
export interface ExecutionWithRelations {
  id: string;
  organization_id: string;
  tenant_automation_id: string;
  trigger_type: TriggerType;
  trigger_data: Record<string, unknown>;
  entity_type?: string;
  entity_id?: string;
  status: ExecutionStatus;
  actions_log: ActionLog[];
  error_message?: string;
  retry_count: number;
  max_retries: number;
  duration_ms?: number;
  started_at: string;
  completed_at?: string;
  tenant_automation: { id: string; name: string; icon: string; category: string } | null;
  organization: { id: string; name: string } | null;
}

// ─── Fetch all executions (global) ──────────────────────────

export function useAutomationExecutions(filters?: ExecutionFilters) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('automation_executions')
        .select(`
          *,
          tenant_automation:tenant_automations(id, name, icon, category),
          organization:organizations(id, name)
        `)
        .order('started_at', { ascending: false })
        .limit(filters?.limit || 100);

      if (filters?.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
      }
      if (filters?.automationId) {
        query = query.eq('tenant_automation_id', filters.automationId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte('started_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('started_at', filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform data to typed format
      return (data || []).map(row => ({
        ...row,
        trigger_type: row.trigger_type as TriggerType,
        trigger_data: row.trigger_data as Record<string, unknown>,
        status: row.status as ExecutionStatus,
        actions_log: row.actions_log as unknown as ActionLog[],
        tenant_automation: row.tenant_automation as { id: string; name: string; icon: string; category: string } | null,
        organization: row.organization as { id: string; name: string } | null,
      })) as ExecutionWithRelations[];
    },
  });
}

// ─── Fetch single execution ─────────────────────────────────

export function useAutomationExecution(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('automation_executions')
        .select(`
          *,
          tenant_automation:tenant_automations(*),
          organization:organizations(id, name)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return {
        ...data,
        trigger_type: data.trigger_type as TriggerType,
        trigger_data: data.trigger_data as Record<string, unknown>,
        status: data.status as ExecutionStatus,
        actions_log: data.actions_log as unknown as ActionLog[],
      };
    },
    enabled: !!id,
  });
}

// ─── Execution stats ────────────────────────────────────────

export function useExecutionStats(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'stats', dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('automation_executions')
        .select('status, duration_ms, started_at');

      if (dateFrom) {
        query = query.gte('started_at', dateFrom);
      }
      if (dateTo) {
        query = query.lte('started_at', dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      const executions = data || [];
      const durations = executions.filter(e => e.duration_ms).map(e => e.duration_ms!);
      
      return {
        total: executions.length,
        success: executions.filter(e => e.status === 'success').length,
        error: executions.filter(e => e.status === 'error').length,
        partial: executions.filter(e => e.status === 'partial').length,
        running: executions.filter(e => e.status === 'running').length,
        avgDurationMs: durations.length > 0 
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
          : 0,
        successRate: executions.length > 0
          ? Math.round((executions.filter(e => e.status === 'success').length / executions.length) * 100)
          : 0,
      };
    },
  });
}
