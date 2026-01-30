// src/hooks/useDocumentTemplates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export type DocumentType = 'invoice' | 'quote' | 'certificate' | 'letter' | 'report';
export type TemplateLayout = 'classic' | 'modern' | 'minimal' | 'corporate' | 'certificate' | 'letter';

export interface DocumentTemplate {
  id: string;
  organization_id: string | null;
  code: string;
  name: string;
  description: string | null;
  document_type: DocumentType;
  category: string;
  is_system_template: boolean;
  layout: TemplateLayout;
  template_content: string;
  content_html: string | null; // Full HTML template content
  
  // Visual config
  show_logo: boolean;
  show_header: boolean;
  show_footer: boolean;
  
  // Content sections
  body_sections: Json;
  custom_texts: Json;
  type_config: Json;
  
  // Numbering
  numbering_prefix: string | null;
  numbering_suffix: string | null;
  numbering_digits: number;
  
  // Status
  is_active: boolean;
  is_default: boolean;
  usage_count: number;
  
  created_at: string;
  updated_at: string | null;
}

export interface TemplateVariable {
  id: string;
  document_type: string;
  variable_code: string;
  variable_name: string;
  variable_group: string | null;
  example_value: string | null;
}

export function useDocumentTemplates(documentType?: DocumentType) {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const orgId = currentOrganization?.id;

  // Fetch templates
  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['document-templates', orgId, documentType],
    queryFn: async () => {
      let query = supabase
        .from('document_templates')
        .select('*')
        .or(`organization_id.is.null,organization_id.eq.${orgId}`)
        .eq('is_active', true)
        .order('is_system_template', { ascending: false })
        .order('name');

      if (documentType) {
        query = query.eq('document_type', documentType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DocumentTemplate[];
    },
    enabled: !!orgId,
  });

  // Fetch single template
  const getTemplate = async (id: string): Promise<DocumentTemplate | null> => {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as DocumentTemplate;
  };

  // Update template
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DocumentTemplate> }) => {
      const { error } = await supabase
        .from('document_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({ title: 'Plantilla actualizada' });
    },
    onError: (error) => {
      toast({
        title: 'Error al actualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Duplicate template
  const duplicateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      if (!orgId) throw new Error('No organization');

      // Get original template
      const original = await getTemplate(templateId);
      if (!original) throw new Error('Template not found');

      // Create copy
      const { data, error } = await supabase
        .from('document_templates')
        .insert({
          organization_id: orgId,
          code: `${original.code}_COPY_${Date.now()}`,
          name: `${original.name} (copia)`,
          description: original.description,
          document_type: original.document_type,
          category: original.category,
          is_system_template: false,
          layout: original.layout,
          template_content: original.template_content,
          show_logo: original.show_logo,
          show_header: original.show_header,
          show_footer: original.show_footer,
          body_sections: original.body_sections,
          custom_texts: original.custom_texts,
          type_config: original.type_config,
          numbering_prefix: original.numbering_prefix,
          numbering_suffix: original.numbering_suffix,
          numbering_digits: original.numbering_digits,
          is_active: true,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DocumentTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({ title: 'Plantilla duplicada' });
    },
    onError: (error) => {
      toast({
        title: 'Error al duplicar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Set default template
  const setDefaultMutation = useMutation({
    mutationFn: async ({ templateId, docType }: { templateId: string; docType: DocumentType }) => {
      if (!orgId) throw new Error('No organization');

      // First, unset all defaults for this type
      await supabase
        .from('document_templates')
        .update({ is_default: false })
        .or(`organization_id.is.null,organization_id.eq.${orgId}`)
        .eq('document_type', docType);

      // Set new default
      const { error } = await supabase
        .from('document_templates')
        .update({ is_default: true })
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({ title: 'Plantilla por defecto actualizada' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete template
  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('document_templates')
        .update({ is_active: false })
        .eq('id', templateId)
        .eq('is_system_template', false); // Can't delete system templates

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({ title: 'Plantilla eliminada' });
    },
    onError: (error) => {
      toast({
        title: 'Error al eliminar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    templates,
    isLoading,
    error,
    getTemplate,
    updateTemplate: (id: string, updates: Partial<DocumentTemplate>) => 
      updateMutation.mutateAsync({ id, updates }),
    duplicateTemplate: duplicateMutation.mutateAsync,
    setDefaultTemplate: (id: string, docType: DocumentType) => 
      setDefaultMutation.mutateAsync({ templateId: id, docType }),
    deleteTemplate: deleteMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  };
}

// Hook for template variables
export function useTemplateVariables(documentType?: DocumentType) {
  const { data: variables = [], isLoading } = useQuery({
    queryKey: ['template-variables', documentType],
    queryFn: async () => {
      let query = supabase
        .from('document_template_variables')
        .select('*')
        .order('variable_group')
        .order('variable_code');

      if (documentType) {
        query = query.eq('document_type', documentType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TemplateVariable[];
    },
  });

  // Group variables by group
  const groupedVariables = variables.reduce((acc, v) => {
    const group = v.variable_group || 'Otros';
    if (!acc[group]) acc[group] = [];
    acc[group].push(v);
    return acc;
  }, {} as Record<string, TemplateVariable[]>);

  return { variables, groupedVariables, isLoading };
}
