import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LegalDocumentContent {
  id: string;
  code: string;
  title: string;
  short_summary: string;
  checkbox_text: string;
  full_content: string;
  link_text: string;
  version: string;
  is_active: boolean;
  updated_at: string;
}

export function useLegalDocumentContent(code: string) {
  return useQuery({
    queryKey: ['legal-document-content', code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_document_contents')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as LegalDocumentContent;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });
}

export function useAllLegalDocuments() {
  return useQuery({
    queryKey: ['legal-documents-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_document_contents')
        .select('*')
        .order('code');

      if (error) throw error;
      return data as LegalDocumentContent[];
    },
  });
}
