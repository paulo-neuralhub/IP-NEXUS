// ============================================================
// IP-NEXUS - AUTOMATION RULES HOOK
// Unified hook for automation rules (replaces deadline_rules)
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface AutomationRule {
  id: string;
  tenant_id: string | null;
  code: string;
  name: string;
  description: string | null;
  rule_type: string;
  category: string;
  subcategory: string | null;
  trigger_type: string;
  trigger_event: string | null;
  trigger_config: Json;
  conditions: Json;
  legal_deadline_id: string | null;
  deadline_config: Json | null;
  notification_config: Json | null;
  task_config: Json | null;
  email_config: Json | null;
  is_system_rule: boolean | null;
  is_active: boolean | null;
  is_customized: boolean | null;
  last_executed_at: string | null;
  execution_count: number | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AutomationRuleFilters {
  category?: string;
  subcategory?: string;
  ruleType?: string;
  triggerType?: string;
  showSystemRules?: boolean;
  showCustomRules?: boolean;
  isActive?: boolean;
}

export interface CreateAutomationRuleDTO {
  code: string;
  name: string;
  description?: string;
  rule_type: string;
  category: string;
  subcategory?: string;
  trigger_type: string;
  trigger_event?: string;
  trigger_config?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
  legal_deadline_id?: string;
  deadline_config?: Record<string, unknown>;
  notification_config?: Record<string, unknown>;
  task_config?: Record<string, unknown>;
  email_config?: Record<string, unknown>;
  is_active?: boolean;
  display_order?: number;
}

// Get all automation rules (system + custom)
export function useAutomationRules(filters?: AutomationRuleFilters) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['automation-rules', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('automation_rules')
        .select('*')
        .order('display_order')
        .order('name');

      // Filter by category
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.subcategory) {
        query = query.eq('subcategory', filters.subcategory);
      }

      if (filters?.ruleType) {
        query = query.eq('rule_type', filters.ruleType);
      }

      if (filters?.triggerType) {
        query = query.eq('trigger_type', filters.triggerType);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as AutomationRule[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// Get single automation rule
export function useAutomationRule(id: string) {
  return useQuery({
    queryKey: ['automation-rule', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as AutomationRule;
    },
    enabled: !!id,
  });
}

// Get rules by category (useful for docket, crm, etc.)
export function useAutomationRulesByCategory(category: string) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['automation-rules-category', currentOrganization?.id, category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('category', category)
        .order('display_order')
        .order('name');

      if (error) throw error;
      return (data || []) as AutomationRule[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// Create custom rule
export function useCreateAutomationRule() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (dto: CreateAutomationRuleDTO) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const insertData = {
        tenant_id: currentOrganization.id,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        rule_type: dto.rule_type,
        category: dto.category,
        subcategory: dto.subcategory,
        trigger_type: dto.trigger_type,
        trigger_event: dto.trigger_event,
        trigger_config: (dto.trigger_config || {}) as Json,
        conditions: (dto.conditions || {}) as Json,
        legal_deadline_id: dto.legal_deadline_id,
        deadline_config: dto.deadline_config as Json | undefined,
        notification_config: dto.notification_config as Json | undefined,
        task_config: dto.task_config as Json | undefined,
        email_config: dto.email_config as Json | undefined,
        is_system_rule: false,
        is_active: dto.is_active ?? false,
        is_customized: false,
        display_order: dto.display_order || 0,
      };

      const { data, error } = await supabase
        .from('automation_rules')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data as AutomationRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Regla creada correctamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear regla: ' + error.message);
    },
  });
}

// Update rule
export function useUpdateAutomationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dto }: Partial<CreateAutomationRuleDTO> & { id: string }) => {
      const updateData: Record<string, unknown> = {};

      if (dto.code !== undefined) updateData.code = dto.code;
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.rule_type !== undefined) updateData.rule_type = dto.rule_type;
      if (dto.category !== undefined) updateData.category = dto.category;
      if (dto.subcategory !== undefined) updateData.subcategory = dto.subcategory;
      if (dto.trigger_type !== undefined) updateData.trigger_type = dto.trigger_type;
      if (dto.trigger_event !== undefined) updateData.trigger_event = dto.trigger_event;
      if (dto.trigger_config !== undefined) updateData.trigger_config = dto.trigger_config;
      if (dto.conditions !== undefined) updateData.conditions = dto.conditions;
      if (dto.legal_deadline_id !== undefined) updateData.legal_deadline_id = dto.legal_deadline_id;
      if (dto.deadline_config !== undefined) updateData.deadline_config = dto.deadline_config;
      if (dto.notification_config !== undefined) updateData.notification_config = dto.notification_config;
      if (dto.task_config !== undefined) updateData.task_config = dto.task_config;
      if (dto.email_config !== undefined) updateData.email_config = dto.email_config;
      if (dto.is_active !== undefined) updateData.is_active = dto.is_active;
      if (dto.display_order !== undefined) updateData.display_order = dto.display_order;

      // Mark as customized when editing
      updateData.is_customized = true;

      const { data, error } = await supabase
        .from('automation_rules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as AutomationRule;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      queryClient.invalidateQueries({ queryKey: ['automation-rule', id] });
      toast.success('Regla actualizada');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Toggle rule active status
export function useToggleAutomationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('automation_rules')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as AutomationRule;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success(data.is_active ? 'Regla activada' : 'Regla desactivada');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Delete rule (only custom)
export function useDeleteAutomationRule() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      // Only delete if it's a custom rule for this org
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id)
        .eq('tenant_id', currentOrganization.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Regla eliminada');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Clone system rule as custom
export function useCloneAutomationRule() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (ruleId: string) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      // Get original rule
      const { data: original, error: fetchError } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('id', ruleId)
        .single();

      if (fetchError) throw fetchError;

      // Create copy with new tenant
      const insertData = {
        tenant_id: currentOrganization.id,
        code: `${original.code}_CUSTOM`,
        name: `${original.name} (Personalizado)`,
        description: original.description,
        rule_type: original.rule_type,
        category: original.category,
        subcategory: original.subcategory,
        trigger_type: original.trigger_type,
        trigger_event: original.trigger_event,
        trigger_config: original.trigger_config,
        conditions: original.conditions,
        legal_deadline_id: original.legal_deadline_id,
        deadline_config: original.deadline_config,
        notification_config: original.notification_config,
        task_config: original.task_config,
        email_config: original.email_config,
        is_system_rule: false,
        is_active: false,
        is_customized: true,
        display_order: (original.display_order || 0) + 1,
      };

      const { data, error } = await supabase
        .from('automation_rules')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data as AutomationRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Regla clonada - ahora puedes editarla');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Get deadline rules specifically (filtered by rule_type = 'deadline')
export function useDeadlineRulesFromAutomation(filters?: { category?: string; office?: string }) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['deadline-automation-rules', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('automation_rules')
        .select('*, legal_deadlines(*)')
        .eq('rule_type', 'deadline')
        .order('display_order')
        .order('name');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as (AutomationRule & { legal_deadlines: unknown })[];
    },
    enabled: !!currentOrganization?.id,
  });
}
