// ============================================================
// IP-NEXUS - Tenant Automations Hook
// CAPA 3: Gestión de automatizaciones por tenant
// Usa tipado manual hasta que se regeneren los tipos de Supabase
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { MasterAutomationTemplate, ConfigurableParam, ActionStep, Condition } from '@/hooks/backoffice/useMasterAutomationTemplates';

// Types alineados con el nuevo schema
export interface TenantAutomation {
  id: string;
  organization_id: string;
  master_template_id: string | null;
  master_template_version: number | null;
  name: string;
  description: string | null;
  category: 'deadlines' | 'communication' | 'case_management' | 'billing' | 'ip_surveillance' | 'internal' | 'reporting' | 'custom';
  icon: string | null;
  is_active: boolean;
  is_custom: boolean;
  is_locked: boolean;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  conditions: Condition[];
  actions: ActionStep[];
  custom_params: Record<string, unknown>;
  last_run_at: string | null;
  run_count: number;
  success_count: number;
  error_count: number;
  last_error: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  master_template?: MasterAutomationTemplate | null;
}

export interface AutomationExecution {
  id: string;
  organization_id: string;
  tenant_automation_id: string;
  trigger_type: string;
  trigger_data: Record<string, unknown>;
  entity_type: string | null;
  entity_id: string | null;
  status: 'running' | 'success' | 'partial' | 'error' | 'skipped' | 'cancelled';
  actions_log: Array<{
    order: number;
    type: string;
    status: string;
    started_at: string;
    completed_at?: string;
    result?: Record<string, unknown>;
    error?: string;
  }>;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  next_retry_at: string | null;
  duration_ms: number | null;
  started_at: string;
  completed_at: string | null;
  idempotency_key: string | null;
}

export interface TenantAutomationCatalogItem {
  template: MasterAutomationTemplate;
  tenant_automation?: TenantAutomation | null;
  is_active: boolean;
  is_locked: boolean;
  can_activate: boolean;
  blocked_reason?: string;
}

// Hook: Get automation catalog for tenant (templates + activation status)
export function useAutomationCatalog() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['automation-catalog', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      // Get published master templates (excluding system)
      const { data: templates, error: templatesError } = await supabase
        .from('automation_master_templates' as any)
        .select('*')
        .eq('is_published', true)
        .eq('is_active', true)
        .neq('visibility', 'system')
        .order('sort_order')
        .order('name');

      if (templatesError) throw templatesError;

      // Get tenant's automations
      const { data: tenantAutomations, error: automationsError } = await supabase
        .from('tenant_automations' as any)
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (automationsError) throw automationsError;

      // Map automations by template id
      const automationMap = new Map(
        ((tenantAutomations || []) as unknown as TenantAutomation[])
          .filter(a => a.master_template_id)
          .map(a => [a.master_template_id, a])
      );

      // Get tenant's plan from organization
      const tenantPlan = currentOrganization.plan || 'starter';

      // Combine templates with tenant automations
      const catalog: TenantAutomationCatalogItem[] = ((templates || []) as unknown as MasterAutomationTemplate[]).map(template => {
        const automation = automationMap.get(template.id);
        const planOrder = ['free', 'starter', 'professional', 'enterprise'];
        const templatePlanIndex = planOrder.indexOf(template.min_plan_tier || 'free');
        const tenantPlanIndex = planOrder.indexOf(tenantPlan);
        const canActivate = tenantPlanIndex >= templatePlanIndex;

        return {
          template,
          tenant_automation: automation || null,
          is_active: automation?.is_active ?? (template.visibility === 'mandatory' || template.visibility === 'recommended'),
          is_locked: template.visibility === 'mandatory',
          can_activate: canActivate,
          blocked_reason: canActivate 
            ? undefined 
            : `Requiere plan ${template.min_plan_tier || 'free'}`,
        };
      });

      return catalog;
    },
    enabled: !!currentOrganization?.id,
  });
}

// Hook: Get tenant's automations (active ones)
export function useTenantAutomations() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['tenant-automations', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('tenant_automations' as any)
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('is_active', { ascending: false })
        .order('name');

      if (error) throw error;
      return (data || []) as unknown as TenantAutomation[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// Hook: Activate automation for tenant (from catalog)
export function useActivateAutomation() {
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

      // Get the template to copy data
      const { data: template, error: templateError } = await supabase
        .from('automation_master_templates' as any)
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;
      const t = template as unknown as MasterAutomationTemplate;

      // Upsert tenant automation
      const { data, error } = await supabase
        .from('tenant_automations' as any)
        .upsert({
          organization_id: currentOrganization.id,
          master_template_id: templateId,
          master_template_version: t.version,
          name: t.name,
          description: t.description,
          category: t.category,
          icon: t.icon,
          is_active: true,
          is_custom: false,
          is_locked: t.visibility === 'mandatory',
          trigger_type: t.trigger_type,
          trigger_config: t.trigger_config,
          conditions: t.conditions,
          actions: t.actions,
          custom_params: customParams || {},
        }, {
          onConflict: 'organization_id,master_template_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as TenantAutomation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-automations'] });
      toast.success('Automatización activada');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Hook: Deactivate automation for tenant
export function useDeactivateAutomation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (automationId: string) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      // Check if it's locked (mandatory)
      const { data: automation } = await supabase
        .from('tenant_automations' as any)
        .select('is_locked')
        .eq('id', automationId)
        .single();

      if ((automation as unknown as TenantAutomation)?.is_locked) {
        throw new Error('Esta automatización es obligatoria y no puede desactivarse');
      }

      const { error } = await supabase
        .from('tenant_automations' as any)
        .update({ is_active: false })
        .eq('id', automationId)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-automations'] });
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
      automationId, 
      customParams 
    }: { 
      automationId: string; 
      customParams: Record<string, unknown>;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data, error } = await supabase
        .from('tenant_automations' as any)
        .update({ custom_params: customParams })
        .eq('id', automationId)
        .eq('organization_id', currentOrganization.id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as TenantAutomation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-automations'] });
      toast.success('Configuración actualizada');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Hook: Get execution logs for tenant
export function useAutomationExecutions(filters?: {
  automationId?: string;
  status?: string;
  limit?: number;
}) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['automation-executions', currentOrganization?.id, filters],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('automation_executions' as any)
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('started_at', { ascending: false })
        .limit(filters?.limit || 50);

      if (filters?.automationId) {
        query = query.eq('tenant_automation_id', filters.automationId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as AutomationExecution[];
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

      // Get active automations count
      const { count: activeCount } = await supabase
        .from('tenant_automations' as any)
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .eq('is_active', true);

      // Get recent executions
      const { data: recentExecutions } = await supabase
        .from('automation_executions' as any)
        .select('status')
        .eq('organization_id', currentOrganization.id)
        .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const executions = (recentExecutions || []) as unknown as Array<{ status: string }>;
      const success = executions.filter(e => e.status === 'success').length;
      const failed = executions.filter(e => e.status === 'error').length;

      return {
        active: activeCount || 0,
        executions30d: executions.length,
        success,
        failed,
        successRate: executions.length > 0 ? Math.round((success / executions.length) * 100) : 100,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}

// Hook: Create custom automation (tenant-created)
export function useCreateCustomAutomation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (dto: {
      name: string;
      description?: string;
      trigger_type: string;
      trigger_config: Record<string, unknown>;
      conditions?: Condition[];
      actions: ActionStep[];
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data, error } = await supabase
        .from('tenant_automations' as any)
        .insert([{
          organization_id: currentOrganization.id,
          name: dto.name,
          description: dto.description,
          category: 'custom',
          icon: '⚡',
          is_active: true,
          is_custom: true,
          is_locked: false,
          trigger_type: dto.trigger_type,
          trigger_config: dto.trigger_config,
          conditions: dto.conditions || [],
          actions: dto.actions,
          custom_params: {},
        }])
        .select()
        .single();

      if (error) throw error;
      return data as unknown as TenantAutomation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-automations'] });
      toast.success('Automatización creada');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}
