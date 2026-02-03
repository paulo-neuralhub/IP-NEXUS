// ============================================================
// IP-NEXUS BACKOFFICE - Master Automation Templates Hook
// CAPA 1: Gestión de templates maestros (solo backoffice)
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

// Types
export interface ConfigurableParam {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  label: string;
  default: string | number | boolean;
  min?: number;
  max?: number;
  options?: string[];
}

export interface ActionStep {
  type: string;
  config: Record<string, unknown>;
}

export interface MasterAutomationTemplate {
  id: string;
  code: string;
  name: string;
  name_es: string | null;
  description: string | null;
  description_es: string | null;
  category: string;
  subcategory: string | null;
  icon: string | null;
  color: string | null;
  trigger_type: string;
  trigger_event: string | null;
  trigger_config: Json;
  conditions: Json;
  actions: Json;
  email_template_code: string | null;
  notification_template_code: string | null;
  min_plan: string | null;
  required_module: string | null;
  configurable_params: Json;
  is_visible: boolean | null;
  is_mandatory: boolean | null;
  is_active: boolean | null;
  version: number | null;
  changelog: Json;
  sort_order: number | null;
  tags: string[] | null;
  estimated_impact: string | null;
  complexity: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface MasterTemplateFilters {
  category?: string;
  trigger_type?: string;
  min_plan?: string;
  is_active?: boolean;
  search?: string;
}

export interface CreateMasterTemplateDTO {
  code: string;
  name: string;
  name_es?: string;
  description?: string;
  description_es?: string;
  category: string;
  subcategory?: string;
  icon?: string;
  color?: string;
  trigger_type: string;
  trigger_event?: string;
  trigger_config?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
  actions?: ActionStep[];
  email_template_code?: string;
  notification_template_code?: string;
  min_plan?: string;
  required_module?: string;
  configurable_params?: ConfigurableParam[];
  is_visible?: boolean;
  is_mandatory?: boolean;
  is_active?: boolean;
  sort_order?: number;
  tags?: string[];
  estimated_impact?: string;
  complexity?: string;
}

// Hook: Get all master templates (backoffice)
export function useMasterAutomationTemplates(filters?: MasterTemplateFilters) {
  return useQuery({
    queryKey: ['master-automation-templates', filters],
    queryFn: async () => {
      let query = supabase
        .from('master_automation_templates')
        .select('*')
        .order('sort_order')
        .order('name');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.trigger_type) {
        query = query.eq('trigger_type', filters.trigger_type);
      }
      if (filters?.min_plan) {
        query = query.eq('min_plan', filters.min_plan);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as MasterAutomationTemplate[];
    },
  });
}

// Hook: Get single template
export function useMasterAutomationTemplate(id: string) {
  return useQuery({
    queryKey: ['master-automation-template', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_automation_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as MasterAutomationTemplate;
    },
    enabled: !!id,
  });
}

// Hook: Create template
export function useCreateMasterTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateMasterTemplateDTO) => {
      const { data, error } = await supabase
        .from('master_automation_templates')
        .insert([{
          code: dto.code,
          name: dto.name,
          name_es: dto.name_es,
          description: dto.description,
          description_es: dto.description_es,
          category: dto.category,
          subcategory: dto.subcategory,
          icon: dto.icon || 'zap',
          color: dto.color || '#3B82F6',
          trigger_type: dto.trigger_type,
          trigger_event: dto.trigger_event,
          trigger_config: (dto.trigger_config || {}) as unknown as Json,
          conditions: (dto.conditions || {}) as unknown as Json,
          actions: (dto.actions || []) as unknown as Json,
          email_template_code: dto.email_template_code,
          notification_template_code: dto.notification_template_code,
          min_plan: dto.min_plan || 'starter',
          required_module: dto.required_module,
          configurable_params: (dto.configurable_params || []) as unknown as Json,
          is_visible: dto.is_visible ?? true,
          is_mandatory: dto.is_mandatory ?? false,
          is_active: dto.is_active ?? true,
          sort_order: dto.sort_order || 0,
          tags: dto.tags || [],
          estimated_impact: dto.estimated_impact,
          complexity: dto.complexity || 'simple',
        }])
        .select()
        .single();

      if (error) throw error;
      return data as MasterAutomationTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-automation-templates'] });
      toast.success('Template creado correctamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear template: ' + error.message);
    },
  });
}

// Hook: Update template
export function useUpdateMasterTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dto }: Partial<CreateMasterTemplateDTO> & { id: string }) => {
      const updateData: Record<string, unknown> = {};

      if (dto.code !== undefined) updateData.code = dto.code;
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.name_es !== undefined) updateData.name_es = dto.name_es;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.description_es !== undefined) updateData.description_es = dto.description_es;
      if (dto.category !== undefined) updateData.category = dto.category;
      if (dto.subcategory !== undefined) updateData.subcategory = dto.subcategory;
      if (dto.icon !== undefined) updateData.icon = dto.icon;
      if (dto.color !== undefined) updateData.color = dto.color;
      if (dto.trigger_type !== undefined) updateData.trigger_type = dto.trigger_type;
      if (dto.trigger_event !== undefined) updateData.trigger_event = dto.trigger_event;
      if (dto.trigger_config !== undefined) updateData.trigger_config = dto.trigger_config;
      if (dto.conditions !== undefined) updateData.conditions = dto.conditions;
      if (dto.actions !== undefined) updateData.actions = dto.actions;
      if (dto.email_template_code !== undefined) updateData.email_template_code = dto.email_template_code;
      if (dto.notification_template_code !== undefined) updateData.notification_template_code = dto.notification_template_code;
      if (dto.min_plan !== undefined) updateData.min_plan = dto.min_plan;
      if (dto.required_module !== undefined) updateData.required_module = dto.required_module;
      if (dto.configurable_params !== undefined) updateData.configurable_params = dto.configurable_params;
      if (dto.is_visible !== undefined) updateData.is_visible = dto.is_visible;
      if (dto.is_mandatory !== undefined) updateData.is_mandatory = dto.is_mandatory;
      if (dto.is_active !== undefined) updateData.is_active = dto.is_active;
      if (dto.sort_order !== undefined) updateData.sort_order = dto.sort_order;
      if (dto.tags !== undefined) updateData.tags = dto.tags;
      if (dto.estimated_impact !== undefined) updateData.estimated_impact = dto.estimated_impact;
      if (dto.complexity !== undefined) updateData.complexity = dto.complexity;

      const { data, error } = await supabase
        .from('master_automation_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MasterAutomationTemplate;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['master-automation-templates'] });
      queryClient.invalidateQueries({ queryKey: ['master-automation-template', id] });
      toast.success('Template actualizado');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Hook: Toggle active status
export function useToggleMasterTemplateActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('master_automation_templates')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MasterAutomationTemplate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['master-automation-templates'] });
      toast.success(data.is_active ? 'Template activado' : 'Template desactivado');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Hook: Delete template
export function useDeleteMasterTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('master_automation_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-automation-templates'] });
      toast.success('Template eliminado');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Hook: Get stats
export function useMasterTemplateStats() {
  return useQuery({
    queryKey: ['master-automation-template-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_automation_templates')
        .select('category, is_active, min_plan');

      if (error) throw error;

      const templates = data || [];
      const byCategory: Record<string, number> = {};
      const byPlan: Record<string, number> = {};
      let active = 0;
      let inactive = 0;

      templates.forEach(t => {
        byCategory[t.category] = (byCategory[t.category] || 0) + 1;
        byPlan[t.min_plan || 'starter'] = (byPlan[t.min_plan || 'starter'] || 0) + 1;
        if (t.is_active) active++;
        else inactive++;
      });

      return {
        total: templates.length,
        active,
        inactive,
        byCategory,
        byPlan,
      };
    },
  });
}

// Constants
export const TEMPLATE_CATEGORIES = [
  { value: 'deadlines', label: 'Plazos', icon: 'clock', color: '#F59E0B' },
  { value: 'notifications', label: 'Notificaciones', icon: 'bell', color: '#8B5CF6' },
  { value: 'onboarding', label: 'Onboarding', icon: 'user-plus', color: '#10B981' },
  { value: 'crm', label: 'CRM', icon: 'users', color: '#EC4899' },
  { value: 'spider', label: 'Spider/Vigilancia', icon: 'search', color: '#EF4444' },
  { value: 'billing', label: 'Facturación', icon: 'file-text', color: '#F97316' },
  { value: 'tasks', label: 'Tareas', icon: 'check-square', color: '#0EA5E9' },
];

export const TRIGGER_TYPES = [
  { value: 'event', label: 'Evento', description: 'Se ejecuta cuando ocurre un evento específico' },
  { value: 'schedule', label: 'Programado', description: 'Se ejecuta según un horario (cron)' },
  { value: 'deadline_approaching', label: 'Plazo próximo', description: 'Se ejecuta X días antes de un plazo' },
  { value: 'manual', label: 'Manual', description: 'Se ejecuta manualmente por el usuario' },
];

export const PLAN_LEVELS = [
  { value: 'starter', label: 'Starter', color: '#6B7280' },
  { value: 'professional', label: 'Professional', color: '#3B82F6' },
  { value: 'business', label: 'Business', color: '#8B5CF6' },
  { value: 'enterprise', label: 'Enterprise', color: '#F59E0B' },
];
