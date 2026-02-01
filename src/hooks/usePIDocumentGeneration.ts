// ════════════════════════════════════════════════════════════════════════════
// src/hooks/usePIDocumentGeneration.ts
// PROMPT 5: Generate documents from PI templates
// ════════════════════════════════════════════════════════════════════════════

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

// ══════════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════════

interface GenerateDocumentParams {
  matterId: string;
  templateId: string;
  customValues?: Record<string, string>;
  language?: string;
}

interface PreviewParams {
  templateId: string;
  matterId: string;
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Generate document from PI template
// ══════════════════════════════════════════════════════════════════════════

export function usePIGenerateDocument() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (params: GenerateDocumentParams) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!currentOrganization?.id) {
        throw new Error('Organization not found');
      }

      const client: any = supabase;

      // Get template
      const { data: template, error: templateError } = await client
        .from('document_templates')
        .select('*')
        .eq('id', params.templateId)
        .single();

      if (templateError) throw templateError;

      // Get matter data
      const { data: matter, error: matterError } = await client
        .from('matters')
        .select(`
          *,
          client:contacts(*)
        `)
        .eq('id', params.matterId)
        .single();

      if (matterError) throw matterError;

      // Build content from template
      let content = template.template_content || template.content_html || '';
      
      // Basic variable replacement
      const variables: Record<string, string> = {
        '{{matter_reference}}': matter.reference || '',
        '{{matter_title}}': matter.title || '',
        '{{client_name}}': matter.client?.name || '',
        '{{today_date}}': new Date().toLocaleDateString('es-ES'),
        '{{application_number}}': matter.application_number || '',
        '{{registration_number}}': matter.registration_number || '',
      };

      // Apply custom values
      if (params.customValues) {
        Object.assign(variables, params.customValues);
      }

      // Replace variables in content
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(key, 'g'), value);
      }

      // Generate file
      const fileName = `${template.code || 'DOC'}-${matter.reference || 'REF'}-${Date.now()}.html`;
      const blob = new Blob([content], { type: 'text/html' });
      const file = new File([blob], fileName, { type: 'text/html' });

      // Upload
      const storagePath = `${currentOrganization.id}/${params.matterId}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('matter-documents')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Create record
      const { data: document, error: docError } = await client
        .from('matter_documents')
        .insert({
          matter_id: params.matterId,
          organization_id: currentOrganization.id,
          template_id: params.templateId,
          name: `${template.name} - ${matter.reference || matter.title}`,
          category: template.category || 'other',
          document_type: 'generated',
          storage_path: storagePath,
          file_path: storagePath,
          file_name: fileName,
          file_size: blob.size,
          mime_type: 'text/html',
          file_extension: 'html',
          language: params.language ?? 'en',
          requires_signature: template.requires_signature || false,
          signature_status: template.requires_signature ? 'pending' : 'not_required',
          created_by: user.user?.id,
          uploaded_by: user.user?.id,
        })
        .select()
        .single();

      if (docError) throw docError;

      return document;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-documents', variables.matterId] });
      toast.success('Documento generado correctamente');
    },
    onError: (error) => {
      toast.error('Error al generar documento: ' + (error as Error).message);
    },
  });
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Preview document (without saving)
// ══════════════════════════════════════════════════════════════════════════

export function usePIDocumentPreview() {
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async ({ templateId, matterId }: PreviewParams) => {
      const client: any = supabase;

      // Get template
      const { data: template } = await client
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      // Get matter
      const { data: matter } = await client
        .from('matters')
        .select('*, client:contacts(*)')
        .eq('id', matterId)
        .single();

      // Get organization
      const { data: organization } = currentOrganization?.id ? await client
        .from('organizations')
        .select('*')
        .eq('id', currentOrganization.id)
        .single() : { data: null };

      // Build content
      let content = template?.template_content || template?.content_html || '';
      
      // Basic variable replacement
      const variables: Record<string, string> = {
        '{{matter_reference}}': matter?.reference || '[Referencia]',
        '{{matter_title}}': matter?.title || '[Título]',
        '{{client_name}}': matter?.client?.name || '[Cliente]',
        '{{today_date}}': new Date().toLocaleDateString('es-ES'),
        '{{org_name}}': organization?.name || '[Organización]',
        '{{application_number}}': matter?.application_number || '[Nº Solicitud]',
        '{{registration_number}}': matter?.registration_number || '[Nº Registro]',
      };

      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(key, 'g'), value);
      }

      return {
        content,
        template,
        matter,
      };
    },
  });
}
