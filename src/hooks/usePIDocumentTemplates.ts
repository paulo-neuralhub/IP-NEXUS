// ════════════════════════════════════════════════════════════════════════════
// src/hooks/usePIDocumentTemplates.ts
// PROMPT 5: PI Document templates for matter document generation
// ════════════════════════════════════════════════════════════════════════════

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PIDocumentTemplate, DocumentCategory } from '@/types/documents';

// ══════════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════════

interface TemplateFilters {
  category?: DocumentCategory;
  rightType?: string;
  jurisdictionId?: string;
  phase?: string;
  search?: string;
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Get PI document templates with filters
// ══════════════════════════════════════════════════════════════════════════

export function usePIDocumentTemplates(filters?: TemplateFilters) {
  return useQuery({
    queryKey: ['pi-document-templates', filters],
    queryFn: async () => {
      const client: any = supabase;
      let query = client
        .from('document_templates')
        .select(`
          id, code, name, description, category, 
          right_type, jurisdiction_id, typical_phase,
          format, template_content, content_html,
          variable_codes, is_required_for, auto_generate_on_phase,
          requires_signature, signature_type, available_languages,
          tags, is_active, display_order
        `)
        .eq('is_active', true)
        .order('display_order');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.rightType && filters.rightType !== 'all') {
        query = query.or(`right_type.eq.${filters.rightType},right_type.is.null,right_type.eq.all`);
      }

      if (filters?.jurisdictionId) {
        query = query.or(`jurisdiction_id.eq.${filters.jurisdictionId},jurisdiction_id.is.null`);
      }

      if (filters?.phase) {
        query = query.or(`typical_phase.eq.${filters.phase},typical_phase.is.null`);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Map to expected interface (name -> name_en/name_es)
      return (data || []).map((t: any) => ({
        ...t,
        name_en: t.name,
        name_es: t.name,
        description_en: t.description,
        description_es: t.description,
        variable_codes: t.variable_codes || [],
        is_required_for: t.is_required_for || [],
        available_languages: t.available_languages || ['en', 'es'],
        tags: t.tags || [],
      })) as PIDocumentTemplate[];
    },
  });
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Get single PI template by ID
// ══════════════════════════════════════════════════════════════════════════

export function usePIDocumentTemplate(templateId?: string) {
  return useQuery({
    queryKey: ['pi-document-template', templateId],
    queryFn: async () => {
      if (!templateId) return null;

      const client: any = supabase;
      const { data, error } = await client
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return {
        ...data,
        name_en: data.name,
        name_es: data.name,
        description_en: data.description,
        description_es: data.description,
      } as PIDocumentTemplate;
    },
    enabled: !!templateId,
  });
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Get templates for a specific workflow phase
// ══════════════════════════════════════════════════════════════════════════

export function usePhaseDocumentTemplates(phase?: string, rightType?: string) {
  return useQuery({
    queryKey: ['phase-document-templates', phase, rightType],
    queryFn: async () => {
      if (!phase) return [];

      const client: any = supabase;
      let query = client
        .from('document_templates')
        .select('id, code, name, category, requires_signature')
        .eq('is_active', true)
        .or(`typical_phase.eq.${phase},typical_phase.is.null`);

      if (rightType && rightType !== 'all') {
        query = query.or(`right_type.eq.${rightType},right_type.is.null,right_type.eq.all`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!phase,
  });
}
