import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

export interface EmailTemplate {
  id: string;
  code: string;
  name: string;
  subject: string;
  category: string;
  body_html: string;
  html_content: string;
  plain_text: string | null;
  variables: unknown[];
  is_active: boolean;
  is_system: boolean;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailVariable {
  name: string;
  description?: string;
  default?: string;
}

export interface EmailVariable {
  name: string;
  description?: string;
  default?: string;
}

// Get all email templates
export function useEmailTemplates(options?: { 
  category?: string; 
  search?: string;
  isActive?: boolean;
}) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['email-templates', currentOrganization?.id, options],
    queryFn: async () => {
      let query = supabase
        .from('email_templates')
        .select('*')
        .or(`organization_id.eq.${currentOrganization?.id},organization_id.is.null`)
        .order('name', { ascending: true });
      
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      
      if (options?.isActive !== undefined) {
        query = query.eq('is_active', options.isActive);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      let templates = (data || []).map(t => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables : []
      })) as EmailTemplate[];
      
      // Filter by search
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        templates = templates.filter(t => 
          t.name.toLowerCase().includes(searchLower) ||
          t.subject.toLowerCase().includes(searchLower) ||
          t.code.toLowerCase().includes(searchLower)
        );
      }
      
      return templates;
    },
    enabled: !!currentOrganization?.id
  });
}

// Get single email template
export function useEmailTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ['email-template', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        variables: Array.isArray(data.variables) ? data.variables : []
      } as EmailTemplate;
    },
    enabled: !!id
  });
}

// Get email template by code
export function useEmailTemplateByCode(code: string | undefined) {
  return useQuery({
    queryKey: ['email-template-code', code],
    queryFn: async () => {
      if (!code) return null;
      
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('code', code)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        variables: Array.isArray(data.variables) ? data.variables : []
      } as EmailTemplate;
    },
    enabled: !!code
  });
}

// Preview email with variables replaced
export function useEmailPreview(code: string | undefined, variables?: Record<string, string>) {
  return useQuery({
    queryKey: ['email-preview', code, variables],
    queryFn: async () => {
      if (!code) return null;
      
      const { data, error } = await supabase
        .from('email_templates')
        .select('subject, body_html, html_content')
        .eq('code', code)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      let subject = data.subject || '';
      let body = data.html_content || data.body_html || '';
      
      // Replace variables
      if (variables) {
        Object.entries(variables).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          subject = subject.replace(regex, value);
          body = body.replace(regex, value);
        });
      }
      
      return { subject, body };
    },
    enabled: !!code
  });
}

// Get email categories
export function useEmailCategories() {
  return useQuery({
    queryKey: ['email-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('category');
      
      if (error) throw error;
      
      const categories = [...new Set(data.map(t => t.category))].filter(Boolean);
      return categories as string[];
    }
  });
}
