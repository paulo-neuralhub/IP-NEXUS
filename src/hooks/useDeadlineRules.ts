// ============================================================
// IP-NEXUS - DEADLINE RULES HOOK
// Sistema de reglas para cálculo automático de plazos
// Now uses automation_rules table with rule_type='deadline'
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface DeadlineType {
  id: string;
  code: string;
  name_es: string;
  name_en?: string;
  description?: string;
  category: 'filing' | 'response' | 'renewal' | 'opposition' | 'payment' | 'other';
  matter_types: string[];
  is_system: boolean;
  is_active: boolean;
  sort_order: number;
}

// Interface compatible with automation_rules
export interface DeadlineRule {
  id: string;
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
  // Legacy compatibility
  jurisdiction?: string;
  matter_type?: string;
  event_type?: string;
  days_from_event?: number;
  calendar_type?: string;
  priority?: string;
  alert_days?: number[];
  auto_create_task?: boolean;
  creates_deadline?: boolean;
  source?: string;
  notes?: string;
}

export interface DeadlineRuleFilters {
  jurisdiction?: string;
  matterType?: string;
  category?: string;
}

// Helper to extract values from JSONB configs
function extractFromConfig(rule: Record<string, unknown>): Partial<DeadlineRule> {
  const deadlineConfig = rule.deadline_config as Record<string, unknown> | null;
  const conditions = rule.conditions as Record<string, unknown> | null;
  
  const offices = conditions?.offices as string[] | undefined;
  const matterTypes = conditions?.matter_types as string[] | undefined;
  
  return {
    jurisdiction: offices?.[0],
    matter_type: matterTypes?.[0],
    event_type: rule.trigger_event as string | undefined,
    days_from_event: deadlineConfig?.days_from_event as number | undefined,
    calendar_type: deadlineConfig?.calendar_type as string | undefined,
    priority: deadlineConfig?.priority as string | undefined,
    alert_days: deadlineConfig?.notify_before_days as number[] | undefined,
    auto_create_task: deadlineConfig?.auto_create_task as boolean | undefined,
    creates_deadline: true,
    source: rule.is_system_rule ? 'system' : 'custom',
    notes: rule.description as string | undefined,
  };
}

// Obtener tipos de plazo
export function useDeadlineTypes() {
  return useQuery({
    queryKey: ['deadline-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deadline_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return (data || []) as unknown as DeadlineType[];
    },
  });
}

// Obtener reglas de deadline (from automation_rules)
export function useDeadlineRules(filters?: DeadlineRuleFilters) {
  return useQuery({
    queryKey: ['deadline-rules', filters],
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
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Map to legacy interface
      return (data || []).map(rule => ({
        id: rule.id,
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
        ...extractFromConfig(rule as Record<string, unknown>),
      })) as DeadlineRule[];
    },
  });
}

// Crear regla personalizada
export function useCreateDeadlineRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      code: string;
      name: string;
      description?: string;
      category?: string;
      subcategory?: string;
      trigger_event?: string;
      conditions?: Record<string, unknown>;
      deadline_config?: Record<string, unknown>;
      legal_deadline_id?: string;
      // Legacy fields
      jurisdiction?: string;
      matter_type?: string;
      event_type?: string;
      days_from_event?: number;
      calendar_type?: string;
      priority?: string;
      alert_days?: number[];
      auto_create_task?: boolean;
    }) => {
      // Build configs from legacy fields
      const deadlineConfig = data.deadline_config || {
        priority: data.priority || 'medium',
        notify_before_days: data.alert_days || [30, 15, 7, 1],
        auto_create_task: data.auto_create_task ?? false,
        calendar_type: data.calendar_type || 'calendar',
        days_from_event: data.days_from_event,
      };

      const conditions = data.conditions || {
        matter_types: data.matter_type ? [data.matter_type] : [],
        offices: data.jurisdiction ? [data.jurisdiction] : [],
      };

      const insertData = {
        code: data.code,
        name: data.name,
        description: data.description,
        rule_type: 'deadline',
        category: data.category || 'general',
        subcategory: data.subcategory,
        trigger_type: 'event',
        trigger_event: data.trigger_event || data.event_type || 'matter_status_changed',
        trigger_config: {} as Json,
        conditions: conditions as Json,
        deadline_config: deadlineConfig as Json,
        legal_deadline_id: data.legal_deadline_id,
        is_system_rule: false,
        is_active: true,
        is_customized: false,
        display_order: 1000,
      };
      
      const { data: rule, error } = await supabase
        .from('automation_rules')
        .insert([insertData])
        .select()
        .single();
      
      if (error) throw error;
      return rule as unknown as DeadlineRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-rules'] });
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });
}

// Actualizar regla
export function useUpdateDeadlineRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string; 
      data: Partial<{
        code: string;
        name: string;
        description: string;
        category: string;
        subcategory: string;
        deadline_config: Record<string, unknown>;
        conditions: Record<string, unknown>;
        is_active: boolean;
      }>;
    }) => {
      const updateData: Record<string, unknown> = {};
      
      if (data.code !== undefined) updateData.code = data.code;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.subcategory !== undefined) updateData.subcategory = data.subcategory;
      if (data.deadline_config !== undefined) updateData.deadline_config = data.deadline_config;
      if (data.conditions !== undefined) updateData.conditions = data.conditions;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      
      updateData.is_customized = true;
      
      const { data: rule, error } = await supabase
        .from('automation_rules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return rule as unknown as DeadlineRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-rules'] });
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });
}

// Eliminar regla (solo custom)
export function useDeleteDeadlineRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id)
        .eq('is_system_rule', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-rules'] });
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });
}

// Obtener festivos
export function useHolidayCalendar(countryCode: string, year?: number) {
  const currentYear = year || new Date().getFullYear();
  
  return useQuery({
    queryKey: ['holidays', countryCode, currentYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holiday_calendars')
        .select('*')
        .eq('country_code', countryCode)
        .eq('year', currentYear)
        .order('date');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!countryCode,
  });
}

// Calcular plazos para un expediente
export function useCalculateDeadlines() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (matterId: string) => {
      const { data, error } = await supabase.functions.invoke('calculate-deadlines', {
        body: { matterId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, matterId) => {
      queryClient.invalidateQueries({ queryKey: ['matter-deadlines', matterId] });
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
    },
  });
}

// Recalcular plazos
export function useRecalculateDeadlines() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (matterId: string) => {
      const { data, error } = await supabase.functions.invoke('calculate-deadlines', {
        body: { matterId, recalculate: true },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, matterId) => {
      queryClient.invalidateQueries({ queryKey: ['matter-deadlines', matterId] });
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
    },
  });
}
