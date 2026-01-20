import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { JurisdictionRule, CreateJurisdictionRuleDTO } from '@/types/docket-god-mode';
import type { Json } from '@/integrations/supabase/types';

export function useJurisdictionRules(filters?: {
  jurisdiction?: string;
  ipType?: string;
  ruleType?: string;
  includeSystem?: boolean;
}) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['jurisdiction-rules', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('jurisdiction_rules')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      // Include system rules (org_id is null) and org-specific rules
      if (currentOrganization?.id) {
        if (filters?.includeSystem !== false) {
          query = query.or(`organization_id.eq.${currentOrganization.id},organization_id.is.null`);
        } else {
          query = query.eq('organization_id', currentOrganization.id);
        }
      }

      if (filters?.jurisdiction) {
        query = query.eq('jurisdiction_code', filters.jurisdiction);
      }

      if (filters?.ipType) {
        query = query.eq('ip_type', filters.ipType);
      }

      if (filters?.ruleType) {
        query = query.eq('rule_type', filters.ruleType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as JurisdictionRule[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useJurisdictionRule(id: string) {
  return useQuery({
    queryKey: ['jurisdiction-rule', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jurisdiction_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as JurisdictionRule;
    },
    enabled: !!id,
  });
}

export function useCreateJurisdictionRule() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (dto: CreateJurisdictionRuleDTO) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const insertData = {
        jurisdiction_code: dto.jurisdiction_code,
        ip_type: dto.ip_type,
        rule_type: dto.rule_type,
        rule_name: dto.rule_name,
        description: dto.description,
        base_days: dto.base_days,
        business_days_only: dto.business_days_only ?? false,
        exclude_holidays: dto.exclude_holidays ?? true,
        holiday_calendar: dto.holiday_calendar,
        conditions: dto.conditions as Json,
        actions: dto.actions as Json,
        organization_id: currentOrganization.id,
        is_system: false,
      };

      const { data, error } = await supabase
        .from('jurisdiction_rules')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jurisdiction-rules'] });
      toast.success('Regla creada');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useUpdateJurisdictionRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dto }: Partial<CreateJurisdictionRuleDTO> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      
      if (dto.jurisdiction_code !== undefined) updateData.jurisdiction_code = dto.jurisdiction_code;
      if (dto.ip_type !== undefined) updateData.ip_type = dto.ip_type;
      if (dto.rule_type !== undefined) updateData.rule_type = dto.rule_type;
      if (dto.rule_name !== undefined) updateData.rule_name = dto.rule_name;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.base_days !== undefined) updateData.base_days = dto.base_days;
      if (dto.business_days_only !== undefined) updateData.business_days_only = dto.business_days_only;
      if (dto.exclude_holidays !== undefined) updateData.exclude_holidays = dto.exclude_holidays;
      if (dto.holiday_calendar !== undefined) updateData.holiday_calendar = dto.holiday_calendar;
      if (dto.conditions !== undefined) updateData.conditions = dto.conditions as Json;
      if (dto.actions !== undefined) updateData.actions = dto.actions as Json;

      const { data, error } = await supabase
        .from('jurisdiction_rules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['jurisdiction-rules'] });
      queryClient.invalidateQueries({ queryKey: ['jurisdiction-rule', id] });
      toast.success('Regla actualizada');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useDeleteJurisdictionRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('jurisdiction_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jurisdiction-rules'] });
      toast.success('Regla eliminada');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useApplyRulesToMatter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matterId: string) => {
      const { data, error } = await supabase
        .rpc('apply_docket_rules', { matter_uuid: matterId });

      if (error) throw error;
      return data as number;
    },
    onSuccess: (tasksCreated, matterId) => {
      queryClient.invalidateQueries({ queryKey: ['smart-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['matter', matterId] });
      if (tasksCreated > 0) {
        toast.success(`Se crearon ${tasksCreated} tareas automáticas`);
      } else {
        toast.info('No se generaron tareas nuevas');
      }
    },
    onError: (error) => {
      toast.error('Error aplicando reglas: ' + error.message);
    },
  });
}

export function useHolidays(countryCode: string, year?: number) {
  return useQuery({
    queryKey: ['holidays', countryCode, year],
    queryFn: async () => {
      let query = supabase
        .from('holidays')
        .select('*')
        .eq('country_code', countryCode)
        .order('date');

      if (year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!countryCode,
  });
}

export function useCalculateDeadline() {
  return useMutation({
    mutationFn: async ({
      startDate,
      daysToAdd,
      country = 'ES',
      businessDaysOnly = false,
      excludeHolidays = true,
    }: {
      startDate: string;
      daysToAdd: number;
      country?: string;
      businessDaysOnly?: boolean;
      excludeHolidays?: boolean;
    }) => {
      const { data, error } = await supabase
        .rpc('calculate_deadline', {
          start_date: startDate,
          days_to_add: daysToAdd,
          country,
          business_days_only: businessDaysOnly,
          exclude_holidays: excludeHolidays,
        });

      if (error) throw error;
      return data as string;
    },
  });
}
