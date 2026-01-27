/**
 * use-matter-documents - Hook para documentos del expediente
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

export interface MatterDocument {
  id: string;
  matter_id: string;
  organization_id: string;
  name: string;
  file_url: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  category?: string;
  description?: string;
  uploaded_by?: string;
  created_at: string;
}

export function useMatterDocuments(matterId: string) {
  return useQuery({
    queryKey: ['matter-documents', matterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matter_documents')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map to include file_url
      return (data || []).map(doc => ({
        ...doc,
        file_url: doc.file_path || '',
      })) as MatterDocument[];
    },
    enabled: !!matterId,
  });
}

export function useCreateMatterDocument() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: { matter_id: string; name: string; file_path: string; file_size?: number; category?: string }) => {
      const client: any = supabase;
      const { data: doc, error } = await client
        .from('matter_documents')
        .insert({ 
          matter_id: data.matter_id,
          organization_id: currentOrganization!.id,
          name: data.name,
          file_path: data.file_path,
          file_size: data.file_size,
          category: data.category,
        })
        .select()
        .single();
      
      if (error) throw error;
      return doc;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-documents', variables.matter_id] });
    },
  });
}

export function useDeleteMatterDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const client: any = supabase;
      const { error } = await client
        .from('matter_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-documents'] });
    },
  });
}
