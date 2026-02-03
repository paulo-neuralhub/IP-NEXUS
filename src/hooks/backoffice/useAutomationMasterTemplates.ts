// =====================================================================
// Hook para gestionar Automation Master Templates (Backoffice)
// =====================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AutomationMasterTemplate, AutomationCategory, AutomationVisibility, PlanTier, ActionConfig, ConditionConfig, ConfigurableParam, TriggerConfig } from '@/types/automations';
import type { Json } from '@/integrations/supabase/types';

const QUERY_KEY = ['automation-master-templates'];

// Helper to transform DB row to typed template
function transformDbRow(row: Record<string, unknown>): AutomationMasterTemplate {
  return {
    ...row,
    trigger_config: row.trigger_config as TriggerConfig,
    conditions: row.conditions as ConditionConfig[],
    actions: row.actions as ActionConfig[],
    configurable_params: row.configurable_params as ConfigurableParam[],
    category: row.category as AutomationCategory,
    visibility: row.visibility as AutomationVisibility,
    min_plan_tier: row.min_plan_tier as PlanTier,
    tags: row.tags as string[],
  } as AutomationMasterTemplate;
}

// ─── Fetch all templates ────────────────────────────────────

export function useAutomationMasterTemplates(filters?: {
  category?: AutomationCategory;
  visibility?: AutomationVisibility;
  planTier?: PlanTier;
  isPublished?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('automation_master_templates')
        .select('*')
        .order('sort_order', { ascending: true });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.visibility) {
        query = query.eq('visibility', filters.visibility);
      }
      if (filters?.planTier) {
        query = query.eq('min_plan_tier', filters.planTier);
      }
      if (filters?.isPublished !== undefined) {
        query = query.eq('is_published', filters.isPublished);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(row => transformDbRow(row as Record<string, unknown>));
    },
  });
}

// ─── Fetch single template ──────────────────────────────────

export function useAutomationMasterTemplate(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('automation_master_templates')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return transformDbRow(data as Record<string, unknown>);
    },
    enabled: !!id,
  });
}

// ─── Stats ──────────────────────────────────────────────────

export function useAutomationTemplateStats() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_master_templates')
        .select('id, is_published, is_active, visibility, category');
      
      if (error) throw error;
      
      const templates = data || [];
      return {
        total: templates.length,
        published: templates.filter(t => t.is_published).length,
        draft: templates.filter(t => !t.is_published).length,
        active: templates.filter(t => t.is_active).length,
        mandatory: templates.filter(t => t.visibility === 'mandatory').length,
        recommended: templates.filter(t => t.visibility === 'recommended').length,
        optional: templates.filter(t => t.visibility === 'optional').length,
        byCategory: templates.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    },
  });
}

// ─── Create template ────────────────────────────────────────

export function useCreateMasterTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<AutomationMasterTemplate, 'id' | 'created_at' | 'updated_at' | 'version'>) => {
      const { data, error } = await supabase
        .from('automation_master_templates')
        .insert({
          code: template.code,
          name: template.name,
          name_en: template.name_en,
          description: template.description,
          description_en: template.description_en,
          category: template.category,
          icon: template.icon,
          color: template.color,
          visibility: template.visibility,
          min_plan_tier: template.min_plan_tier,
          trigger_type: template.trigger_type,
          trigger_config: template.trigger_config as unknown as Json,
          conditions: template.conditions as unknown as Json,
          actions: template.actions as unknown as Json,
          configurable_params: template.configurable_params as unknown as Json,
          tags: template.tags,
          related_entity: template.related_entity,
          sort_order: template.sort_order,
          is_published: template.is_published,
          is_active: template.is_active,
        })
        .select()
        .single();
      if (error) throw error;
      return transformDbRow(data as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Template creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear template: ${error.message}`);
    },
  });
}

// ─── Update template ────────────────────────────────────────

export function useUpdateMasterTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AutomationMasterTemplate> & { id: string }) => {
      // Increment version on update
      const { data: current } = await supabase
        .from('automation_master_templates')
        .select('version')
        .eq('id', id)
        .single();

      const updatePayload: Record<string, unknown> = {
        ...updates,
        version: (current?.version || 0) + 1,
      };
      
      // Convert complex types to Json
      if (updates.trigger_config) {
        updatePayload.trigger_config = updates.trigger_config as unknown as Json;
      }
      if (updates.conditions) {
        updatePayload.conditions = updates.conditions as unknown as Json;
      }
      if (updates.actions) {
        updatePayload.actions = updates.actions as unknown as Json;
      }
      if (updates.configurable_params) {
        updatePayload.configurable_params = updates.configurable_params as unknown as Json;
      }

      const { data, error } = await supabase
        .from('automation_master_templates')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return transformDbRow(data as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Template actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar template: ${error.message}`);
    },
  });
}

// ─── Delete template ────────────────────────────────────────

export function useDeleteMasterTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('automation_master_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Template eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar template: ${error.message}`);
    },
  });
}

// ─── Toggle publish status ──────────────────────────────────

export function useTogglePublishTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { data, error } = await supabase
        .from('automation_master_templates')
        .update({ is_published: isPublished })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return transformDbRow(data as Record<string, unknown>);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(data.is_published ? 'Template publicado' : 'Template retirado del catálogo');
    },
    onError: (error: Error) => {
      toast.error(`Error al cambiar estado: ${error.message}`);
    },
  });
}

// ─── Duplicate template ─────────────────────────────────────

export function useDuplicateMasterTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Fetch original
      const { data: original, error: fetchError } = await supabase
        .from('automation_master_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;

      // Create copy
      const { data, error } = await supabase
        .from('automation_master_templates')
        .insert({
          code: `${original.code}_copy`,
          name: `${original.name} (Copia)`,
          name_en: original.name_en ? `${original.name_en} (Copy)` : null,
          description: original.description,
          description_en: original.description_en,
          category: original.category,
          icon: original.icon,
          color: original.color,
          visibility: 'optional',
          min_plan_tier: original.min_plan_tier,
          trigger_type: original.trigger_type,
          trigger_config: original.trigger_config,
          conditions: original.conditions,
          actions: original.actions,
          configurable_params: original.configurable_params,
          tags: original.tags,
          related_entity: original.related_entity,
          sort_order: original.sort_order + 1,
          is_published: false,
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return transformDbRow(data as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Template duplicado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al duplicar template: ${error.message}`);
    },
  });
}

// ─── Propagate to tenants ───────────────────────────────────

export function usePropagateMasterTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('propagate_master_template_update', {
        p_template_id: id,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(`Template propagado a ${count} tenants`);
    },
    onError: (error: Error) => {
      toast.error(`Error al propagar: ${error.message}`);
    },
  });
}

// ─── Count tenant instances ─────────────────────────────────

export function useTenantInstancesCount(templateId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'instances', templateId],
    queryFn: async () => {
      if (!templateId) return { total: 0, active: 0 };
      
      const { data, error } = await supabase
        .from('tenant_automations')
        .select('id, is_active')
        .eq('master_template_id', templateId);
      
      if (error) throw error;
      
      return {
        total: data?.length || 0,
        active: data?.filter(t => t.is_active).length || 0,
      };
    },
    enabled: !!templateId,
  });
}
