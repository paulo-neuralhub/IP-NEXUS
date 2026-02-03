// ============================================================
// IP-NEXUS BACKOFFICE - Master Automation Templates Hook
// CAPA 1: Gestión de templates maestros (solo backoffice)
// Usa tipado manual hasta que se regeneren los tipos de Supabase
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types alineados con el nuevo schema
export interface ConfigurableParam {
  key: string;
  label: string;
  label_en?: string;
  type: 'string' | 'number' | 'boolean' | 'textarea' | 'select' | 'multi_select' | 'number_array' | 'string_array' | 'date' | 'cron_expression' | 'email';
  default_value: unknown;
  validation?: Record<string, unknown>;
  options?: Array<{ value: string; label: string }>;
  description?: string;
}

export interface ActionStep {
  order: number;
  type: string;
  config: Record<string, unknown>;
}

export interface Condition {
  field: string;
  operator: string;
  value: unknown;
  logic?: 'AND' | 'OR';
  conditions?: Condition[];
}

export interface MasterAutomationTemplate {
  id: string;
  code: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  category: 'deadlines' | 'communication' | 'case_management' | 'billing' | 'ip_surveillance' | 'internal' | 'reporting';
  icon: string | null;
  color: string | null;
  visibility: 'system' | 'mandatory' | 'recommended' | 'optional';
  min_plan_tier: 'free' | 'starter' | 'professional' | 'enterprise';
  trigger_type: 'db_event' | 'field_change' | 'cron' | 'date_relative' | 'webhook' | 'manual';
  trigger_config: Record<string, unknown>;
  conditions: Condition[];
  actions: ActionStep[];
  configurable_params: ConfigurableParam[];
  version: number;
  is_published: boolean;
  is_active: boolean;
  tags: string[];
  related_entity: string | null;
  sort_order: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MasterTemplateFilters {
  category?: string;
  trigger_type?: string;
  visibility?: string;
  min_plan_tier?: string;
  is_active?: boolean;
  is_published?: boolean;
  search?: string;
}

export interface CreateMasterTemplateDTO {
  code: string;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  category: MasterAutomationTemplate['category'];
  icon?: string;
  color?: string;
  visibility?: MasterAutomationTemplate['visibility'];
  min_plan_tier?: MasterAutomationTemplate['min_plan_tier'];
  trigger_type: MasterAutomationTemplate['trigger_type'];
  trigger_config?: Record<string, unknown>;
  conditions?: Condition[];
  actions?: ActionStep[];
  configurable_params?: ConfigurableParam[];
  is_published?: boolean;
  is_active?: boolean;
  sort_order?: number;
  tags?: string[];
  related_entity?: string;
}

// Hook: Get all master templates (backoffice)
export function useMasterAutomationTemplates(filters?: MasterTemplateFilters) {
  return useQuery({
    queryKey: ['master-automation-templates', filters],
    queryFn: async () => {
      let query = supabase
        .from('automation_master_templates' as any)
        .select('*')
        .order('sort_order')
        .order('name');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.trigger_type) {
        query = query.eq('trigger_type', filters.trigger_type);
      }
      if (filters?.visibility) {
        query = query.eq('visibility', filters.visibility);
      }
      if (filters?.min_plan_tier) {
        query = query.eq('min_plan_tier', filters.min_plan_tier);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters?.is_published !== undefined) {
        query = query.eq('is_published', filters.is_published);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as MasterAutomationTemplate[];
    },
  });
}

// Hook: Get single template
export function useMasterAutomationTemplate(id: string) {
  return useQuery({
    queryKey: ['master-automation-template', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_master_templates' as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as MasterAutomationTemplate;
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
        .from('automation_master_templates' as any)
        .insert([{
          code: dto.code,
          name: dto.name,
          name_en: dto.name_en,
          description: dto.description,
          description_en: dto.description_en,
          category: dto.category,
          icon: dto.icon || '⚡',
          color: dto.color || '#6366F1',
          visibility: dto.visibility || 'optional',
          min_plan_tier: dto.min_plan_tier || 'free',
          trigger_type: dto.trigger_type,
          trigger_config: dto.trigger_config || {},
          conditions: dto.conditions || [],
          actions: dto.actions || [],
          configurable_params: dto.configurable_params || [],
          is_published: dto.is_published ?? false,
          is_active: dto.is_active ?? true,
          sort_order: dto.sort_order || 0,
          tags: dto.tags || [],
          related_entity: dto.related_entity,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as unknown as MasterAutomationTemplate;
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
      if (dto.name_en !== undefined) updateData.name_en = dto.name_en;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.description_en !== undefined) updateData.description_en = dto.description_en;
      if (dto.category !== undefined) updateData.category = dto.category;
      if (dto.icon !== undefined) updateData.icon = dto.icon;
      if (dto.color !== undefined) updateData.color = dto.color;
      if (dto.visibility !== undefined) updateData.visibility = dto.visibility;
      if (dto.min_plan_tier !== undefined) updateData.min_plan_tier = dto.min_plan_tier;
      if (dto.trigger_type !== undefined) updateData.trigger_type = dto.trigger_type;
      if (dto.trigger_config !== undefined) updateData.trigger_config = dto.trigger_config;
      if (dto.conditions !== undefined) updateData.conditions = dto.conditions;
      if (dto.actions !== undefined) updateData.actions = dto.actions;
      if (dto.configurable_params !== undefined) updateData.configurable_params = dto.configurable_params;
      if (dto.is_published !== undefined) updateData.is_published = dto.is_published;
      if (dto.is_active !== undefined) updateData.is_active = dto.is_active;
      if (dto.sort_order !== undefined) updateData.sort_order = dto.sort_order;
      if (dto.tags !== undefined) updateData.tags = dto.tags;
      if (dto.related_entity !== undefined) updateData.related_entity = dto.related_entity;

      const { data, error } = await supabase
        .from('automation_master_templates' as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as MasterAutomationTemplate;
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

// Hook: Toggle published status
export function useToggleMasterTemplatePublished() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { data, error } = await supabase
        .from('automation_master_templates' as any)
        .update({ is_published: isPublished, version: supabase.rpc ? 1 : 1 })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as MasterAutomationTemplate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['master-automation-templates'] });
      toast.success(data.is_published ? 'Template publicado' : 'Template despublicado');
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
        .from('automation_master_templates' as any)
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as MasterAutomationTemplate;
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
        .from('automation_master_templates' as any)
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

// Hook: Propagate template update to all tenants
export function usePropagateTemplateUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { data, error } = await supabase.rpc('propagate_master_template_update', {
        p_template_id: templateId,
      });

      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-automations'] });
      toast.success(`Template propagado a ${count} tenants`);
    },
    onError: (error: Error) => {
      toast.error('Error al propagar: ' + error.message);
    },
  });
}

// Hook: Get stats
export function useMasterTemplateStats() {
  return useQuery({
    queryKey: ['master-automation-template-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_master_templates' as any)
        .select('category, visibility, min_plan_tier, is_active, is_published');

      if (error) throw error;

      const templates = (data || []) as unknown as Array<{
        category: string;
        visibility: string;
        min_plan_tier: string;
        is_active: boolean;
        is_published: boolean;
      }>;

      const byCategory: Record<string, number> = {};
      const byVisibility: Record<string, number> = {};
      const byPlan: Record<string, number> = {};
      let active = 0;
      let published = 0;

      templates.forEach(t => {
        byCategory[t.category] = (byCategory[t.category] || 0) + 1;
        byVisibility[t.visibility] = (byVisibility[t.visibility] || 0) + 1;
        byPlan[t.min_plan_tier || 'free'] = (byPlan[t.min_plan_tier || 'free'] || 0) + 1;
        if (t.is_active) active++;
        if (t.is_published) published++;
      });

      return {
        total: templates.length,
        active,
        published,
        byCategory,
        byVisibility,
        byPlan,
      };
    },
  });
}

// Constants
export const TEMPLATE_CATEGORIES = [
  { value: 'deadlines', label: 'Plazos y Vencimientos', icon: '⏰', color: '#F59E0B' },
  { value: 'communication', label: 'Comunicación', icon: '📧', color: '#8B5CF6' },
  { value: 'case_management', label: 'Gestión de Casos', icon: '📁', color: '#10B981' },
  { value: 'billing', label: 'Facturación', icon: '💰', color: '#F97316' },
  { value: 'ip_surveillance', label: 'Vigilancia PI', icon: '🔍', color: '#EF4444' },
  { value: 'internal', label: 'Gestión Interna', icon: '👥', color: '#0EA5E9' },
  { value: 'reporting', label: 'Informes y KPIs', icon: '📊', color: '#EC4899' },
];

export const TRIGGER_TYPES = [
  { value: 'db_event', label: 'Evento BD', description: 'INSERT/UPDATE/DELETE en tabla' },
  { value: 'field_change', label: 'Cambio de Campo', description: 'Campo específico cambia de valor' },
  { value: 'cron', label: 'Programado', description: 'Ejecución periódica (cron)' },
  { value: 'date_relative', label: 'Fecha Relativa', description: 'X días antes/después de fecha' },
  { value: 'webhook', label: 'Webhook', description: 'HTTP POST externo' },
  { value: 'manual', label: 'Manual', description: 'Click del usuario' },
];

export const VISIBILITY_TYPES = [
  { value: 'system', label: 'Sistema', description: 'Invisible para tenant, siempre activa' },
  { value: 'mandatory', label: 'Obligatoria', description: 'Visible, siempre activa' },
  { value: 'recommended', label: 'Recomendada', description: 'Visible, activa por defecto' },
  { value: 'optional', label: 'Opcional', description: 'Visible, desactivada por defecto' },
];

export const PLAN_LEVELS = [
  { value: 'free', label: 'Free', color: '#6B7280' },
  { value: 'starter', label: 'Starter', color: '#22C55E' },
  { value: 'professional', label: 'Professional', color: '#3B82F6' },
  { value: 'enterprise', label: 'Enterprise', color: '#F59E0B' },
];

export const ACTION_TYPES = [
  { value: 'send_email', label: 'Enviar Email', icon: '📧' },
  { value: 'create_notification', label: 'Crear Notificación', icon: '🔔' },
  { value: 'create_task', label: 'Crear Tarea', icon: '✅' },
  { value: 'update_field', label: 'Actualizar Campo', icon: '✏️' },
  { value: 'create_record', label: 'Crear Registro', icon: '➕' },
  { value: 'webhook_call', label: 'Llamar Webhook', icon: '🔗' },
  { value: 'delay', label: 'Esperar', icon: '⏳' },
  { value: 'condition', label: 'Condición IF/ELSE', icon: '🔀' },
  { value: 'generate_document', label: 'Generar Documento', icon: '📄' },
];
