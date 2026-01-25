import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OfficeDocument {
  id: string;
  name: string;
  type: string;
  officeCode: string;
  officeName: string;
  documentDate: string;
  downloadedAt?: string;
  isNew: boolean;
  pageCount?: number;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface NewDocsResult {
  success: boolean;
  newDocuments: number;
  documents?: OfficeDocument[];
  error?: string;
}

export function useOfficeDocuments(matterId: string) {
  const queryClient = useQueryClient();

  // Get office documents for this matter
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['office-documents', matterId],
    queryFn: async (): Promise<OfficeDocument[]> => {
      const { data, error } = await supabase
        .from('matter_documents')
        .select('*')
        .eq('matter_id', matterId)
        .eq('is_official', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;

      return (data || []).map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.category || 'official',
        officeCode: '',
        officeName: '',
        documentDate: doc.document_date || doc.created_at,
        downloadedAt: doc.created_at,
        isNew: (now.getTime() - new Date(doc.created_at).getTime()) < oneDay,
        pageCount: undefined,
        filePath: doc.file_path || undefined,
        fileSize: doc.file_size || undefined,
        mimeType: doc.mime_type || undefined,
      }));
    },
    enabled: !!matterId,
  });

  // Download document
  const downloadDocumentMutation = useMutation({
    mutationFn: async (docId: string): Promise<void> => {
      const doc = documents.find(d => d.id === docId);
      if (!doc?.filePath) throw new Error('Documento no encontrado');

      const { data, error } = await supabase.storage
        .from('matter-documents')
        .download(doc.filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (error: Error) => {
      toast.error(`Error al descargar: ${error.message}`);
    },
  });

  // Check for new documents from office
  const checkForNewDocsMutation = useMutation({
    mutationFn: async (): Promise<NewDocsResult> => {
      const response = await supabase.functions.invoke('check-office-documents', {
        body: { matterId },
      });

      if (response.error) {
        return { success: false, newDocuments: 0, error: response.error.message };
      }

      return response.data as NewDocsResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['office-documents', matterId] });
      if (result.success && result.newDocuments > 0) {
        toast.success(`${result.newDocuments} documento(s) nuevo(s) encontrado(s)`);
      } else if (result.success) {
        toast.info('No hay documentos nuevos');
      }
    },
    onError: (error: Error) => {
      toast.error(`Error al buscar documentos: ${error.message}`);
    },
  });

  return {
    documents,
    isLoading,
    downloadDocument: downloadDocumentMutation.mutateAsync,
    isDownloading: downloadDocumentMutation.isPending,
    checkForNewDocuments: checkForNewDocsMutation.mutateAsync,
    isChecking: checkForNewDocsMutation.isPending,
  };
}
