// ============================================================
// IP-NEXUS - DEADLINE CONFIGURATION HOOK
// Manage deadline rules via automation_rules table
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface DeadlineRuleConfig {
  id: string;
  tenant_id?: string | null;
  code: string;
  name: string;
  description?: string | null;
  category: string;
  subcategory?: string | null;
  trigger_type: string;
  trigger_event?: string | null;
  trigger_config: Json;
  conditions: Json;
  legal_deadline_id?: string | null;
  deadline_config: Json | null;
  is_system_rule: boolean | null;
  is_active: boolean | null;
  is_customized: boolean | null;
  display_order: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  // Computed
  is_fatal?: boolean;
  // Aliases for backward compatibility
  is_system?: boolean | null;
  notes?: string | null;
  // Legacy compatibility
  jurisdiction?: string;
  matter_type?: string;
  event_type?: string;
  days_from_event?: number;
  calendar_type?: string;
  priority?: string;
  alert_days?: number[];
  auto_create_task?: boolean;
}

export interface DeadlineRuleFilters {
  jurisdiction?: string;
  matterType?: string;
  eventType?: string;
  source?: 'system' | 'custom' | 'all';
  showSystem?: boolean;
  showCustom?: boolean;
  category?: string;
  subcategory?: string;
}

export interface CreateDeadlineRuleDTO {
  code: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  trigger_event?: string;
  conditions?: Record<string, unknown>;
  deadline_config?: Record<string, unknown>;
  legal_deadline_id?: string;
  // Legacy fields mapped to deadline_config
  jurisdiction?: string;
  matter_type?: string;
  event_type?: string;
  days_from_event?: number;
  calendar_type?: string;
  priority?: string;
  alert_days?: number[];
  auto_create_task?: boolean;
  notes?: string;
}

// Helper to extract deadline config values
function extractDeadlineConfig(config: Json | null): Partial<DeadlineRuleConfig> {
  if (!config || typeof config !== 'object') return {};
  const c = config as Record<string, unknown>;
  return {
    priority: c.priority as string | undefined,
    alert_days: c.notify_before_days as number[] | undefined,
    auto_create_task: c.auto_create_task as boolean | undefined,
  };
}

// Helper to extract conditions values
function extractConditions(conditions: Json): Partial<DeadlineRuleConfig> {
  if (!conditions || typeof conditions !== 'object') return {};
  const c = conditions as Record<string, unknown>;
  const offices = c.offices as string[] | undefined;
  const matterTypes = c.matter_types as string[] | undefined;
  return {
    jurisdiction: offices?.[0],
    matter_type: matterTypes?.[0],
  };
}

// Get all deadline rules (from automation_rules with rule_type = 'deadline')
export function useDeadlineRuleConfigs(filters?: DeadlineRuleFilters) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['deadline-rule-configs', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('automation_rules')
        .select('*')
        .eq('rule_type', 'deadline')
        .order('display_order')
        .order('name');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.subcategory) {
        query = query.eq('subcategory', filters.subcategory);
      }

      if (filters?.showSystem === false) {
        query = query.eq('is_system_rule', false);
      }

      if (filters?.showCustom === false) {
        query = query.eq('is_system_rule', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Map to legacy interface format
      return (data || []).map(rule => {
        const deadlineConfig = extractDeadlineConfig(rule.deadline_config);
        const conditionsData = extractConditions(rule.conditions);
        
        return {
          id: rule.id,
          tenant_id: rule.tenant_id,
          code: rule.code,
          name: rule.name,
          description: rule.description,
          category: rule.category,
          subcategory: rule.subcategory,
          trigger_type: rule.trigger_type,
          trigger_event: rule.trigger_event,
          trigger_config: rule.trigger_config,
          conditions: rule.conditions,
          legal_deadline_id: rule.legal_deadline_id,
          deadline_config: rule.deadline_config,
          is_system_rule: rule.is_system_rule,
          is_active: rule.is_active,
          is_customized: rule.is_customized,
          display_order: rule.display_order,
          created_at: rule.created_at,
          updated_at: rule.updated_at,
          // Computed
          is_fatal: deadlineConfig.priority === 'urgent' || deadlineConfig.priority === 'critical',
          // Aliases for backward compatibility
          is_system: rule.is_system_rule,
          notes: rule.description,
          // Legacy compatibility
          ...conditionsData,
          ...deadlineConfig,
        } as DeadlineRuleConfig;
      });
    },
    enabled: !!currentOrganization?.id,
  });
}

// Get single rule
export function useDeadlineRuleConfig(id: string) {
  return useQuery({
    queryKey: ['deadline-rule-config', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const deadlineConfig = extractDeadlineConfig(data.deadline_config);
      const conditionsData = extractConditions(data.conditions);

      return {
        ...data,
        is_fatal: deadlineConfig.priority === 'urgent' || deadlineConfig.priority === 'critical',
        is_system: data.is_system_rule,
        notes: data.description,
        ...conditionsData,
        ...deadlineConfig,
      } as DeadlineRuleConfig;
    },
    enabled: !!id,
  });
}

// Create custom rule
export function useCreateDeadlineRuleConfig() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (dto: CreateDeadlineRuleDTO) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      // Build deadline_config from legacy fields
      const deadlineConfig = dto.deadline_config || {
        priority: dto.priority || 'medium',
        notify_before_days: dto.alert_days || [30, 15, 7, 1],
        auto_create_task: dto.auto_create_task ?? false,
        calendar_type: dto.calendar_type || 'calendar',
        days_from_event: dto.days_from_event,
      };

      // Build conditions from legacy fields
      const conditions = dto.conditions || {
        matter_types: dto.matter_type ? [dto.matter_type] : [],
        offices: dto.jurisdiction ? [dto.jurisdiction] : [],
      };

      const insertData = {
        tenant_id: currentOrganization.id,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        rule_type: 'deadline',
        category: dto.category || 'general',
        subcategory: dto.subcategory,
        trigger_type: 'event',
        trigger_event: dto.trigger_event || dto.event_type || 'matter_status_changed',
        trigger_config: {} as Json,
        conditions: conditions as Json,
        deadline_config: deadlineConfig as Json,
        legal_deadline_id: dto.legal_deadline_id,
        is_system_rule: false,
        is_active: true,
        is_customized: false,
        display_order: 1000,
      };

      const { data, error } = await supabase
        .from('automation_rules')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-rule-configs'] });
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Regla creada correctamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear regla: ' + error.message);
    },
  });
}

// Update rule
export function useUpdateDeadlineRuleConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dto }: Partial<CreateDeadlineRuleDTO> & { id: string }) => {
      const updateData: Record<string, unknown> = {};

      if (dto.code !== undefined) updateData.code = dto.code;
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.category !== undefined) updateData.category = dto.category;
      if (dto.subcategory !== undefined) updateData.subcategory = dto.subcategory;

      // Handle legacy fields by updating deadline_config
      if (dto.priority !== undefined || dto.alert_days !== undefined || 
          dto.auto_create_task !== undefined || dto.days_from_event !== undefined ||
          dto.calendar_type !== undefined) {
        // Fetch current config first
        const { data: current } = await supabase
          .from('automation_rules')
          .select('deadline_config')
          .eq('id', id)
          .single();

        const currentConfig = (current?.deadline_config as Record<string, unknown>) || {};
        
        updateData.deadline_config = {
          ...currentConfig,
          ...(dto.priority !== undefined && { priority: dto.priority }),
          ...(dto.alert_days !== undefined && { notify_before_days: dto.alert_days }),
          ...(dto.auto_create_task !== undefined && { auto_create_task: dto.auto_create_task }),
          ...(dto.days_from_event !== undefined && { days_from_event: dto.days_from_event }),
          ...(dto.calendar_type !== undefined && { calendar_type: dto.calendar_type }),
        };
      }

      // Handle conditions update
      if (dto.jurisdiction !== undefined || dto.matter_type !== undefined) {
        const { data: current } = await supabase
          .from('automation_rules')
          .select('conditions')
          .eq('id', id)
          .single();

        const currentConditions = (current?.conditions as Record<string, unknown>) || {};
        
        updateData.conditions = {
          ...currentConditions,
          ...(dto.jurisdiction !== undefined && { offices: [dto.jurisdiction] }),
          ...(dto.matter_type !== undefined && { matter_types: [dto.matter_type] }),
        };
      }

      updateData.is_customized = true;

      const { data, error } = await supabase
        .from('automation_rules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['deadline-rule-configs'] });
      queryClient.invalidateQueries({ queryKey: ['deadline-rule-config', id] });
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Regla actualizada');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Delete rule (only custom)
export function useDeleteDeadlineRuleConfig() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id)
        .eq('tenant_id', currentOrganization.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-rule-configs'] });
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Regla eliminada');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Duplicate rule (to create override)
export function useDuplicateDeadlineRule() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async ({ ruleId, newJurisdiction }: { ruleId: string; newJurisdiction?: string }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data: original, error: fetchError } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('id', ruleId)
        .single();

      if (fetchError) throw fetchError;

      // Update conditions with new jurisdiction if provided
      let conditions = original.conditions as Record<string, unknown> || {};
      if (newJurisdiction) {
        conditions = { ...conditions, offices: [newJurisdiction] };
      }

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
        conditions: conditions as Json,
        legal_deadline_id: original.legal_deadline_id,
        deadline_config: original.deadline_config,
        notification_config: original.notification_config,
        task_config: original.task_config,
        email_config: original.email_config,
        is_system_rule: false,
        is_active: true,
        is_customized: true,
        display_order: (original.display_order || 0) + 1,
      };

      const { data, error } = await supabase
        .from('automation_rules')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-rule-configs'] });
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Regla duplicada - ahora puedes editarla');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Calculate deadline preview
export function useCalculateDeadlinePreview() {
  return useMutation({
    mutationFn: async ({
      eventDate,
      daysOffset,
      monthsOffset = 0,
      yearsOffset = 0,
      calendarType = 'calendar',
      alertDays = [30, 15, 7, 1],
    }: {
      eventDate: string;
      daysOffset: number;
      monthsOffset?: number;
      yearsOffset?: number;
      calendarType?: 'calendar' | 'business';
      countryCode?: string;
      alertDays?: number[];
    }) => {
      const baseDate = new Date(eventDate);
      
      let result = new Date(baseDate);
      result.setFullYear(result.getFullYear() + yearsOffset);
      result.setMonth(result.getMonth() + monthsOffset);
      
      if (calendarType === 'business') {
        let daysToAdd = Math.abs(daysOffset);
        const direction = daysOffset >= 0 ? 1 : -1;
        
        while (daysToAdd > 0) {
          result.setDate(result.getDate() + direction);
          const dayOfWeek = result.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            daysToAdd--;
          }
        }
      } else {
        result.setDate(result.getDate() + daysOffset);
      }

      const dayOfWeek = result.getDay();
      const adjustments: string[] = [];
      
      if (dayOfWeek === 0) {
        result.setDate(result.getDate() + 1);
        adjustments.push(`${result.toLocaleDateString('es-ES')} era domingo → ajustado a lunes`);
      } else if (dayOfWeek === 6) {
        result.setDate(result.getDate() + 2);
        adjustments.push(`${result.toLocaleDateString('es-ES')} era sábado → ajustado a lunes`);
      }

      const reminders = alertDays.map(days => {
        const reminderDate = new Date(result);
        reminderDate.setDate(reminderDate.getDate() - days);
        return {
          days,
          date: reminderDate.toISOString().split('T')[0],
          formatted: reminderDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
        };
      });

      return {
        eventDate: baseDate.toISOString().split('T')[0],
        calculatedDate: result.toISOString().split('T')[0],
        finalDate: result.toISOString().split('T')[0],
        adjustments,
        reminders,
      };
    },
  });
}
