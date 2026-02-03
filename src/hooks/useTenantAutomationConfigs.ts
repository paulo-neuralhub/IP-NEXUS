// ============================================================
// IP-NEXUS - Tenant Automation Configs Hook
// CAPA 3: Gestión de configuraciones por tenant
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';
import type { MasterAutomationTemplate } from '@/hooks/backoffice/useMasterAutomationTemplates';

// Types
export interface TenantAutomationConfig {
  id: string;
  organization_id: string;
  master_template_id: string;
  is_enabled: boolean | null;
  is_customized: boolean | null;
  custom_params: Json;
  custom_conditions: Json | null;
  custom_actions: Json | null;
  execution_count: number | null;
  last_executed_at: string | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  error_count: number | null;
  created_at: string | null;
  updated_at: string | null;
  enabled_by: string | null;
  // Joined data
  master_template?: MasterAutomationTemplate;
}

export interface TenantAutomationCatalogItem extends MasterAutomationTemplate {
  tenant_config?: TenantAutomationConfig | null;
  is_enabled: boolean;
  can_enable: boolean;
  blocked_reason?: string;
}

// Hook: Get automation catalog for tenant (templates + config status)
export function useAutomationCatalog() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['automation-catalog', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      // Get visible master templates
      const { data: templates, error: templatesError } = await supabase
        .from('master_automation_templates')
        .select('*')
        .eq('is_visible', true)
        .eq('is_active', true)
        .order('sort_order')
        .order('name');

      if (templatesError) throw templatesError;

      // Get tenant's configs
      const { data: configs, error: configsError } = await supabase
        .from('tenant_automation_configs')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (configsError) throw configsError;

      // Map configs by template id
      const configMap = new Map(
        (configs || []).map(c => [c.master_template_id, c])
      );

      // TODO: Get tenant's plan for access control
      const tenantPlan = 'professional'; // Placeholder

      // Combine templates with configs
      const catalog: TenantAutomationCatalogItem[] = (templates || []).map(template => {
        const config = configMap.get(template.id);
        const planOrder = ['starter', 'professional', 'business', 'enterprise'];
        const templatePlanIndex = planOrder.indexOf(template.min_plan || 'starter');
        const tenantPlanIndex = planOrder.indexOf(tenantPlan);
        const canEnable = tenantPlanIndex >= templatePlanIndex;

        return {
          ...template,
          tenant_config: config || null,
          is_enabled: config?.is_enabled ?? false,
          can_enable: canEnable,
          blocked_reason: canEnable 
            ? undefined 
            : `Requiere plan ${template.min_plan || 'starter'}`,
        };
      });

      return catalog;
    },
    enabled: !!currentOrganization?.id,
  });
}

// Hook: Get tenant's enabled automation configs
export function useTenantAutomationConfigs() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['tenant-automation-configs', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('tenant_automation_configs')
        .select('*, master_automation_templates(*)')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(config => ({
        ...config,
        master_template: config.master_automation_templates,
      })) as TenantAutomationConfig[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// Hook: Enable automation for tenant
export function useEnableAutomation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async ({ 
      templateId, 
      customParams 
    }: { 
      templateId: string; 
      customParams?: Record<string, unknown>;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data, error } = await supabase
        .from('tenant_automation_configs')
        .upsert({
          organization_id: currentOrganization.id,
          master_template_id: templateId,
          is_enabled: true,
          custom_params: (customParams || {}) as Json,
        }, {
          onConflict: 'organization_id,master_template_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data as TenantAutomationConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-automation-configs'] });
      toast.success('Automatización activada');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Hook: Disable automation for tenant
export function useDisableAutomation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (templateId: string) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { error } = await supabase
        .from('tenant_automation_configs')
        .update({ is_enabled: false })
        .eq('organization_id', currentOrganization.id)
        .eq('master_template_id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-automation-configs'] });
      toast.success('Automatización desactivada');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Hook: Update custom params
export function useUpdateAutomationParams() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async ({ 
      templateId, 
      customParams 
    }: { 
      templateId: string; 
      customParams: Record<string, unknown>;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data, error } = await supabase
        .from('tenant_automation_configs')
        .update({ 
          custom_params: customParams as Json,
          is_customized: true,
        })
        .eq('organization_id', currentOrganization.id)
        .eq('master_template_id', templateId)
        .select()
        .single();

      if (error) throw error;
      return data as TenantAutomationConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-automation-configs'] });
      toast.success('Configuración actualizada');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Hook: Get execution logs for tenant
export function useAutomationExecutionLogs(filters?: {
  status?: string;
  automationCode?: string;
  limit?: number;
}) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['automation-execution-logs', currentOrganization?.id, filters],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 50);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.automationCode) {
        query = query.eq('automation_code', filters.automationCode);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization?.id,
  });
}

// Hook: Get automation stats for tenant
export function useTenantAutomationStats() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['tenant-automation-stats', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return null;

      // Get enabled automations count
      const { count: enabledCount } = await supabase
        .from('tenant_automation_configs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .eq('is_enabled', true);

      // Get recent executions
      const { data: recentLogs } = await supabase
        .from('automation_execution_logs')
        .select('status')
        .eq('organization_id', currentOrganization.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const logs = recentLogs || [];
      const completed = logs.filter(l => l.status === 'completed').length;
      const failed = logs.filter(l => l.status === 'failed').length;

      return {
        enabled: enabledCount || 0,
        executions30d: logs.length,
        completed,
        failed,
        successRate: logs.length > 0 ? Math.round((completed / logs.length) * 100) : 100,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}
