// ============================================================
// IP-NEXUS - DEADLINE CONFIGURATION HOOK
// Manage custom deadline rules per organization
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface DeadlineRuleConfig {
  id: string;
  organization_id?: string | null;
  jurisdiction: string;
  matter_type: string;
  event_type: string;
  code: string;
  name: string;
  description?: string | null;
  days_from_event: number;
  calendar_type: string | null;
  conditions?: Json | null;
  creates_deadline: boolean | null;
  deadline_type?: string | null;
  priority: string | null;
  auto_create_task: boolean | null;
  task_template_id?: string | null;
  alert_days: number[] | null;
  is_active: boolean | null;
  is_system: boolean | null;
  source: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  // Computed
  is_fatal?: boolean;
}

export interface DeadlineRuleFilters {
  jurisdiction?: string;
  matterType?: string;
  eventType?: string;
  source?: 'system' | 'custom' | 'all';
  showSystem?: boolean;
  showCustom?: boolean;
}

export interface CreateDeadlineRuleDTO {
  jurisdiction: string;
  matter_type: string;
  event_type: string;
  code: string;
  name: string;
  description?: string;
  days_from_event: number;
  calendar_type?: string;
  priority?: string;
  alert_days?: number[];
  auto_create_task?: boolean;
  notes?: string;
}

// Get all deadline rules (system + custom)
export function useDeadlineRuleConfigs(filters?: DeadlineRuleFilters) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['deadline-rule-configs', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('deadline_rules')
        .select('*')
        .eq('is_active', true)
        .order('jurisdiction')
        .order('matter_type')
        .order('name');

      // Include system rules (org is null) and org-specific rules
      if (currentOrganization?.id) {
        if (filters?.showSystem !== false && filters?.showCustom !== false) {
          query = query.or(`organization_id.eq.${currentOrganization.id},organization_id.is.null`);
        } else if (filters?.showSystem === false) {
          query = query.eq('organization_id', currentOrganization.id);
        } else if (filters?.showCustom === false) {
          query = query.is('organization_id', null);
        }
      }

      if (filters?.jurisdiction) {
        query = query.eq('jurisdiction', filters.jurisdiction);
      }

      if (filters?.matterType) {
        query = query.eq('matter_type', filters.matterType);
      }

      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Map to our interface
      return (data || []).map(rule => ({
        ...rule,
        is_fatal: rule.priority === 'critical',
      })) as DeadlineRuleConfig[];
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
        .from('deadline_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        ...data,
        is_fatal: data.priority === 'critical',
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

      const insertData = {
        organization_id: currentOrganization.id,
        jurisdiction: dto.jurisdiction,
        matter_type: dto.matter_type,
        event_type: dto.event_type,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        days_from_event: dto.days_from_event,
        calendar_type: dto.calendar_type || 'calendar',
        priority: dto.priority || 'medium',
        alert_days: dto.alert_days || [30, 15, 7, 1],
        auto_create_task: dto.auto_create_task ?? false,
        is_active: true,
        is_system: false,
        source: 'custom',
        creates_deadline: true,
        notes: dto.notes,
      };

      const { data, error } = await supabase
        .from('deadline_rules')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-rule-configs'] });
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

      if (dto.jurisdiction !== undefined) updateData.jurisdiction = dto.jurisdiction;
      if (dto.matter_type !== undefined) updateData.matter_type = dto.matter_type;
      if (dto.event_type !== undefined) updateData.event_type = dto.event_type;
      if (dto.code !== undefined) updateData.code = dto.code;
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.days_from_event !== undefined) updateData.days_from_event = dto.days_from_event;
      if (dto.calendar_type !== undefined) updateData.calendar_type = dto.calendar_type;
      if (dto.priority !== undefined) updateData.priority = dto.priority;
      if (dto.alert_days !== undefined) updateData.alert_days = dto.alert_days;
      if (dto.auto_create_task !== undefined) updateData.auto_create_task = dto.auto_create_task;
      if (dto.notes !== undefined) updateData.notes = dto.notes;

      const { data, error } = await supabase
        .from('deadline_rules')
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

      // Only delete if it's a custom rule for this org
      const { error } = await supabase
        .from('deadline_rules')
        .delete()
        .eq('id', id)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-rule-configs'] });
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

      // Get original rule
      const { data: original, error: fetchError } = await supabase
        .from('deadline_rules')
        .select('*')
        .eq('id', ruleId)
        .single();

      if (fetchError) throw fetchError;

      // Create copy with new org
      const insertData = {
        organization_id: currentOrganization.id,
        jurisdiction: newJurisdiction || original.jurisdiction,
        matter_type: original.matter_type,
        event_type: original.event_type,
        code: `${original.code}_CUSTOM`,
        name: `${original.name} (Personalizado)`,
        description: original.description,
        days_from_event: original.days_from_event,
        calendar_type: original.calendar_type,
        priority: original.priority,
        alert_days: original.alert_days,
        auto_create_task: original.auto_create_task,
        is_active: true,
        is_system: false,
        source: 'custom',
        creates_deadline: original.creates_deadline,
        notes: `Override de regla sistema: ${original.name}`,
      };

      const { data, error } = await supabase
        .from('deadline_rules')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-rule-configs'] });
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
      
      // Apply offsets
      let result = new Date(baseDate);
      result.setFullYear(result.getFullYear() + yearsOffset);
      result.setMonth(result.getMonth() + monthsOffset);
      
      if (calendarType === 'business') {
        // Simple business days calculation
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

      // Adjust if lands on weekend
      const dayOfWeek = result.getDay();
      const adjustments: string[] = [];
      
      if (dayOfWeek === 0) {
        result.setDate(result.getDate() + 1);
        adjustments.push(`${result.toLocaleDateString('es-ES')} era domingo → ajustado a lunes`);
      } else if (dayOfWeek === 6) {
        result.setDate(result.getDate() + 2);
        adjustments.push(`${result.toLocaleDateString('es-ES')} era sábado → ajustado a lunes`);
      }

      // Calculate reminder dates
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
