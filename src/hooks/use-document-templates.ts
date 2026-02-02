// ============================================================
// IP-NEXUS - DOCUMENT TEMPLATES HOOK
// PROMPT 23: Hook para gestión de plantillas de documentos
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

// =====================================================
// Types
// =====================================================

export interface TemplateCategory {
  id: string;
  code: string;
  name_es: string;
  name_en?: string;
  description_es?: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface TemplateVariable {
  key: string;
  label_es: string;
  label_en?: string;
  source: 'tenant' | 'client' | 'matter' | 'quote' | 'system' | 'input';
  type?: 'text' | 'date' | 'number' | 'boolean' | 'array';
  required?: boolean;
}

export interface DocumentTemplate {
  id: string;
  organization_id?: string | null;
  code: string;
  category?: string;
  category_code?: string;
  name: string;
  name_es?: string;
  name_en?: string;
  description?: string;
  description_es?: string;
  description_en?: string;
  output_format: 'pdf' | 'docx' | 'html' | 'email';
  template_content: string;
  content_html?: string;
  available_variables?: TemplateVariable[];
  variables?: TemplateVariable[];
  paper_size: string;
  orientation: string;
  margins?: Record<string, number>;
  applicable_matter_types?: string[];
  applicable_jurisdictions?: string[];
  applicable_offices?: string[];
  applicable_phases?: string[];
  requires_signature?: boolean;
  signature_positions?: Array<{
    role: string;
    label: string;
    page: number;
    x: number;
    y: number;
  }>;
  version: number;
  is_default?: boolean;
  is_active?: boolean;
  is_system_template?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GeneratedDocument {
  id: string;
  organization_id: string;
  matter_id?: string;
  template_id?: string;
  template_code?: string;
  document_number?: string;
  title: string;
  category?: string;
  content_html?: string;
  variables_used?: Record<string, unknown>;
  file_url?: string;
  file_size?: number;
  file_hash?: string;
  status: 'draft' | 'final' | 'signed' | 'sent' | 'archived';
  signature_request_id?: string;
  signed_at?: string;
  signed_file_url?: string;
  sent_to?: string[];
  sent_at?: string;
  sent_method?: string;
  generated_by?: string;
  created_at?: string;
  updated_at?: string;
}

// =====================================================
// Hook: Get template categories
// =====================================================

export function useTemplateCategories() {
  return useQuery({
    queryKey: ['template-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as TemplateCategory[];
    },
  });
}

// =====================================================
// Hook: Get document templates with filters
// =====================================================

interface TemplateFilters {
  categoryCode?: string;
  phase?: string;
  matterType?: string;
  jurisdiction?: string;
  office?: string;
  search?: string;
  includeGlobal?: boolean;
}

export function useDocumentTemplates(filters?: TemplateFilters) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['document-templates', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      // Filter by organization (own + global)
      if (filters?.includeGlobal !== false) {
        query = query.or(`organization_id.eq.${currentOrganization?.id},organization_id.is.null`);
      } else if (currentOrganization?.id) {
        query = query.eq('organization_id', currentOrganization.id);
      }

      // Category filter
      if (filters?.categoryCode) {
        query = query.eq('category_code', filters.categoryCode);
      }

      // Phase filter
      if (filters?.phase) {
        query = query.contains('applicable_phases', [filters.phase]);
      }

      // Matter type filter
      if (filters?.matterType) {
        query = query.or(`applicable_matter_types.cs.{${filters.matterType}},applicable_matter_types.is.null`);
      }

      // Search filter
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((t) => ({
        ...t,
        name: t.name || '',
        description: t.description || '',
        available_variables: Array.isArray(t.available_variables) ? t.available_variables : [],
      })) as unknown as DocumentTemplate[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// =====================================================
// Hook: Get single template
// =====================================================

export function useDocumentTemplate(templateId?: string) {
  return useQuery({
    queryKey: ['document-template', templateId],
    queryFn: async () => {
      if (!templateId) return null;

      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return {
        ...data,
        name: data.name || '',
        description: data.description || '',
        available_variables: Array.isArray(data.available_variables) ? data.available_variables : [],
      } as unknown as DocumentTemplate;
    },
    enabled: !!templateId,
  });
}

// =====================================================
// Hook: Get templates for a specific phase
// =====================================================

export function usePhaseTemplates(phase?: string, matterType?: string, jurisdiction?: string) {
  return useDocumentTemplates({
    phase,
    matterType,
    jurisdiction,
    includeGlobal: true,
  });
}

// =====================================================
// Hook: Generate document from template
// =====================================================

export interface GenerateDocumentParams {
  templateId: string;
  matterId?: string;
  variables: Record<string, unknown>;
  saveAsDraft?: boolean;
}

export function useGenerateDocument() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async ({ templateId, matterId, variables, saveAsDraft = true }: GenerateDocumentParams) => {
      // Get template
      const { data: template, error: templateError } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // Merge variables into template
      let content = template.template_content || template.content_html || '';
      
      // Replace {{variable}} patterns
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        content = content.replace(regex, String(value ?? ''));
      });

      // Handle conditionals {{#if variable}}...{{/if}}
      content = processConditionals(content, variables);

      // Handle loops {{#each array}}...{{/each}}
      content = processLoops(content, variables);

      // Generate document number
      const { data: docNumber } = await supabase.rpc('generate_document_number', {
        p_organization_id: currentOrganization?.id,
      });

      if (saveAsDraft && currentOrganization?.id) {
        // Save to database - use the actual table structure from types.ts
        const insertData = {
          organization_id: currentOrganization.id,
          matter_id: matterId || null,
          template_id: templateId,
          name: template.name || 'Documento generado',
          content: content,
          content_html: content,
          variables_input: variables as Record<string, never>,
          variables_resolved: variables as Record<string, never>,
          status: 'draft',
        };

        const { data: generated, error: genError } = await (supabase as unknown as { from: (table: string) => { insert: (data: typeof insertData) => { select: () => { single: () => Promise<{ data: Record<string, unknown>; error: Error | null }> } } } })
          .from('generated_documents')
          .insert(insertData)
          .select()
          .single();

        if (genError) throw genError;
        
        return {
          id: generated.id as string,
          organization_id: generated.organization_id as string,
          matter_id: (generated.matter_id as string) || undefined,
          template_id: (generated.template_id as string) || undefined,
          title: generated.name as string,
          content_html: (generated.content_html as string) || '',
          variables_used: generated.variables_resolved as Record<string, unknown> | undefined,
          status: generated.status as GeneratedDocument['status'],
          created_at: generated.created_at as string,
        } as GeneratedDocument;
      }

      return {
        id: '',
        organization_id: currentOrganization?.id || '',
        title: template.name || 'Documento',
        content_html: content,
        variables_used: variables,
        status: 'draft' as const,
      } as GeneratedDocument;
    },
    onSuccess: (_, variables) => {
      if (variables.matterId) {
        queryClient.invalidateQueries({ queryKey: ['generated-documents', variables.matterId] });
      }
      toast.success('Documento generado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al generar: ${error.message}`);
    },
  });
}

// =====================================================
// Hook: Get generated documents for a matter
// =====================================================

export function useMatterGeneratedDocuments(matterId?: string) {
  return useQuery({
    queryKey: ['generated-documents', matterId],
    queryFn: async () => {
      if (!matterId) return [];

      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((d) => ({
        id: d.id,
        organization_id: d.organization_id,
        matter_id: d.matter_id || undefined,
        template_id: d.template_id || undefined,
        title: d.name,
        content_html: d.content_html || '',
        variables_used: d.variables_resolved as Record<string, unknown> | undefined,
        status: d.status as GeneratedDocument['status'],
        created_at: d.created_at,
      })) as GeneratedDocument[];
    },
    enabled: !!matterId,
  });
}

// =====================================================
// Helper: Process conditionals
// =====================================================

function processConditionals(content: string, variables: Record<string, unknown>): string {
  const ifRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  
  return content.replace(ifRegex, (match, condition, inner) => {
    const value = getNestedValue(variables, condition.trim());
    if (value && value !== '' && value !== false) {
      return inner;
    }
    return '';
  });
}

// =====================================================
// Helper: Process loops
// =====================================================

function processLoops(content: string, variables: Record<string, unknown>): string {
  const eachRegex = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  
  return content.replace(eachRegex, (match, arrayKey, inner) => {
    const array = getNestedValue(variables, arrayKey.trim());
    if (!Array.isArray(array)) return '';

    return array.map((item, index) => {
      let itemContent = inner;
      
      // Replace this.property references
      if (typeof item === 'object' && item !== null) {
        Object.entries(item).forEach(([key, value]) => {
          const regex = new RegExp(`\\{\\{this\\.${key}\\}\\}`, 'g');
          itemContent = itemContent.replace(regex, String(value ?? ''));
        });
      }
      
      // Replace {{@index}}
      itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));
      
      return itemContent;
    }).join('');
  });
}

// =====================================================
// Helper: Get nested value from object
// =====================================================

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// =====================================================
// Hook: Update generated document
// =====================================================

export function useUpdateGeneratedDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, status, content_html }: { 
      id: string; 
      title?: string;
      status?: GeneratedDocument['status'];
      content_html?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (title) updateData.name = title;
      if (status) updateData.status = status;
      if (content_html) updateData.content_html = content_html;

      const { data, error } = await supabase
        .from('generated_documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        matter_id: data.matter_id,
        title: data.name,
        status: data.status,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['generated-documents', data.matter_id] });
      toast.success('Documento actualizado');
    },
  });
}

// =====================================================
// Hook: Delete generated document
// =====================================================

export function useDeleteGeneratedDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, matterId }: { id: string; matterId?: string }) => {
      const { error } = await supabase
        .from('generated_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, matterId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['generated-documents', data.matterId] });
      toast.success('Documento eliminado');
    },
  });
}
