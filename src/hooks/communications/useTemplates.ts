// =============================================
// HOOK: useTemplates
// Gestión unificada de plantillas de comunicación
// Ahora usa la tabla communication_templates
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export type TemplateChannelType = 'email' | 'whatsapp' | 'sms';

export interface TemplateVariable {
  name: string;
  label?: string;
  description?: string;
  example?: string;
  required?: boolean;
}

export interface EmailTemplate {
  id: string;
  organization_id: string | null;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  variables: TemplateVariable[] | null;
  is_active: boolean | null;
  is_system: boolean | null;
  usage_count: number | null;
  last_used_at: string | null;
  created_at: string | null;
  tags: string[] | null;
}

export interface WhatsAppTemplate {
  id: string;
  organization_id: string | null;
  code: string;
  name: string;
  wa_template_name: string;
  category: string | null;
  language: string | null;
  header_type: string | null;
  header_text: string | null;
  body_text: string;
  footer_text: string | null;
  buttons: Json | null;
  variables: TemplateVariable[] | null;
  status: 'pending' | 'approved' | 'rejected' | string | null;
  is_system: boolean | null;
  usage_count: number | null;
  created_at: string | null;
  tags: string[] | null;
}

// Available variables for templates
export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { name: 'client_name', description: 'Nombre del cliente' },
  { name: 'client_email', description: 'Email del cliente' },
  { name: 'contact_name', description: 'Nombre del contacto' },
  { name: 'matter_ref', description: 'Referencia del expediente' },
  { name: 'matter_title', description: 'Título del expediente' },
  { name: 'deadline_date', description: 'Fecha del plazo' },
  { name: 'company_name', description: 'Nombre de tu empresa' },
  { name: 'agent_name', description: 'Nombre del agente' },
  { name: 'company_phone', description: 'Teléfono de la empresa' },
  { name: 'company_email', description: 'Email de la empresa' },
  { name: 'current_date', description: 'Fecha actual' },
  { name: 'portal_url', description: 'Link al portal del cliente' },
];

export const TEMPLATE_CATEGORIES = [
  { value: 'bienvenida', label: 'Bienvenida', color: '#10B981' },
  { value: 'seguimiento', label: 'Seguimiento', color: '#8B5CF6' },
  { value: 'plazos', label: 'Plazos', color: '#F59E0B' },
  { value: 'facturacion', label: 'Facturación', color: '#06B6D4' },
  { value: 'legal', label: 'Legal', color: '#EF4444' },
  { value: 'notificaciones', label: 'Notificaciones', color: '#6B7280' },
  { value: 'confirmaciones', label: 'Confirmaciones', color: '#3B82F6' },
  { value: 'recordatorios', label: 'Recordatorios', color: '#F97316' },
];

// =============================================
// Email Templates (from communication_templates)
// =============================================

export function useEmailTemplates(options?: { category?: string; search?: string }) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['email-templates', currentOrganization?.id, options],
    queryFn: async () => {
      // Use any to avoid TS overload issues
      const client: any = supabase;
      
      let query = client
        .from('communication_templates')
        .select('*')
        .eq('channel', 'email')
        .eq('is_active', true)
        .or(`organization_id.eq.${currentOrganization?.id},organization_id.is.null`)
        .order('is_system', { ascending: false })
        .order('name');

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Map database rows to EmailTemplate
      let templates = (data || []).map((row: any) => ({
        id: row.id,
        organization_id: row.organization_id,
        code: row.code,
        name: row.name,
        description: row.description,
        category: row.category,
        subject: row.subject,
        body_html: row.content_html,
        body_text: row.content_text,
        variables: Array.isArray(row.variables) ? row.variables as TemplateVariable[] : null,
        is_active: row.is_active,
        is_system: row.is_system,
        usage_count: row.usage_count,
        last_used_at: row.last_used_at,
        created_at: row.created_at,
        tags: row.tags,
      })) as EmailTemplate[];

      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        templates = templates.filter(t =>
          t.name.toLowerCase().includes(searchLower) ||
          (t.subject?.toLowerCase().includes(searchLower)) ||
          t.code.toLowerCase().includes(searchLower)
        );
      }

      return templates;
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useSaveEmailTemplate() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Partial<EmailTemplate> & { id?: string }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const client: any = supabase;
      const variables = template.variables as unknown as Json;

      const dataToSave = {
        name: template.name,
        code: template.code,
        description: template.description,
        category: template.category,
        channel: 'email',
        subject: template.subject,
        content_html: template.body_html,
        content_text: template.body_text,
        variables,
        is_active: template.is_active ?? true,
        is_system: false,
        organization_id: currentOrganization.id,
      };

      if (template.id) {
        const { error } = await client
          .from('communication_templates')
          .update(dataToSave)
          .eq('id', template.id);
        if (error) throw error;
      } else {
        const { error } = await client
          .from('communication_templates')
          .insert(dataToSave);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Plantilla guardada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const client: any = supabase;
      const { error } = await client
        .from('communication_templates')
        .delete()
        .eq('id', id)
        .eq('is_system', false); // Only delete non-system templates
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Plantilla eliminada');
    },
  });
}

export function useDuplicateEmailTemplate() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: EmailTemplate) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const client: any = supabase;
      const { error } = await client
        .from('communication_templates')
        .insert({
          organization_id: currentOrganization.id,
          name: `${template.name} (copia)`,
          code: `${template.code}_copy_${Date.now()}`,
          description: template.description,
          category: template.category,
          channel: 'email',
          subject: template.subject,
          content_html: template.body_html,
          content_text: template.body_text,
          variables: template.variables as unknown as Json,
          is_system: false,
          is_active: true,
          usage_count: 0,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Plantilla duplicada');
    },
  });
}

// =============================================
// WhatsApp Templates (from communication_templates)
// =============================================

export function useWhatsAppTemplates(options?: { category?: string; status?: string }) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['whatsapp-templates', currentOrganization?.id, options],
    queryFn: async () => {
      const client: any = supabase;
      
      let query = client
        .from('communication_templates')
        .select('*')
        .eq('channel', 'whatsapp')
        .eq('is_active', true)
        .or(`organization_id.eq.${currentOrganization?.id},organization_id.is.null`)
        .order('name');

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Map database rows to WhatsAppTemplate
      return (data || []).map((row: any) => ({
        id: row.id,
        organization_id: row.organization_id,
        code: row.code,
        name: row.name,
        wa_template_name: row.code, // Use code as WA template name
        category: row.category,
        language: 'es',
        header_type: null,
        header_text: null,
        body_text: row.content_text,
        footer_text: null,
        buttons: null,
        variables: Array.isArray(row.variables) ? row.variables as TemplateVariable[] : null,
        status: 'approved', // Local templates are always approved
        is_system: row.is_system,
        usage_count: row.usage_count,
        created_at: row.created_at,
        tags: row.tags,
      })) as WhatsAppTemplate[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useSaveWhatsAppTemplate() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Partial<WhatsAppTemplate> & { id?: string }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const client: any = supabase;
      const variables = template.variables as unknown as Json;

      const dataToSave = {
        name: template.name,
        code: template.code || template.wa_template_name,
        description: null,
        category: template.category,
        channel: 'whatsapp',
        subject: null,
        content_text: template.body_text,
        content_html: null,
        variables,
        is_active: true,
        is_system: false,
        organization_id: currentOrganization.id,
      };

      if (template.id) {
        const { error } = await client
          .from('communication_templates')
          .update(dataToSave)
          .eq('id', template.id);
        if (error) throw error;
      } else {
        const { error } = await client
          .from('communication_templates')
          .insert(dataToSave);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
      toast.success('Plantilla guardada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useDeleteWhatsAppTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const client: any = supabase;
      const { error } = await client
        .from('communication_templates')
        .delete()
        .eq('id', id)
        .eq('is_system', false); // Only delete non-system templates
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
      toast.success('Plantilla eliminada');
    },
  });
}

// =============================================
// Template Utilities
// =============================================

export function detectVariables(text: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const matches = [...text.matchAll(regex)];
  return [...new Set(matches.map(m => m[1]))];
}

export function renderTemplate(text: string, data: Record<string, string>): string {
  let result = text;
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });
  // Replace remaining variables with placeholders
  TEMPLATE_VARIABLES.forEach(v => {
    result = result.replace(
      new RegExp(`\\{\\{${v.name}\\}\\}`, 'g'),
      `[${v.description}]`
    );
  });
  return result;
}
