import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/organization-context";
import { toast } from "sonner";

export interface ImportableOffice {
  id: string;
  code: string;
  name: string;
  country_code?: string;
  flag_emoji?: string;
  accepted_formats: string[];
  has_template: boolean;
  template_url?: string;
}

export interface ImportRecord {
  id: string;
  office_code: string;
  office_name?: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  import_status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  records_found: number;
  records_imported: number;
  records_updated: number;
  records_failed: number;
  requires_review: boolean;
  review_count?: number;
  created_at: string;
  processed_at?: string;
}

export interface ImportResult {
  success: boolean;
  import_id?: string;
  records_found?: number;
  records_imported?: number;
  records_failed?: number;
  requires_review?: boolean;
  review_count?: number;
  error?: string;
}

function getFlagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function useFileImport() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  // Get offices that support file import
  const { data: importableOffices = [], isLoading: loadingOffices } = useQuery({
    queryKey: ['importable-offices'],
    queryFn: async (): Promise<ImportableOffice[]> => {
      const { data, error } = await supabase
        .from('ipo_offices')
        .select('*')
        .eq('is_active', true)
        .in('data_source_type', ['file_import', 'manual', 'mixed']);

      if (error) throw error;

      return (data || []).map(office => ({
        id: office.id,
        code: office.code,
        name: office.name_official,
        country_code: office.country_code || undefined,
        flag_emoji: getFlagEmoji(office.country_code || undefined),
        accepted_formats: ['xlsx', 'csv', 'pdf'],
        has_template: true,
        template_url: `/templates/import-${office.code.toLowerCase()}.xlsx`,
      }));
    },
  });

  // Get import history from database
  const { data: importHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['import-history', currentOrganization?.id],
    queryFn: async (): Promise<ImportRecord[]> => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('file_imports')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        office_code: item.office_code || 'Unknown',
        office_name: undefined,
        file_name: item.file_name,
        file_type: item.file_type,
        file_size: item.file_size,
        import_status: item.import_status,
        records_found: item.records_found || 0,
        records_imported: item.records_imported || 0,
        records_updated: item.records_updated || 0,
        records_failed: item.records_failed || 0,
        requires_review: (item.requires_review || 0) > 0,
        review_count: item.requires_review || 0,
        created_at: item.created_at,
        processed_at: item.processed_at,
      }));
    },
    enabled: !!currentOrganization?.id,
  });

  // Upload and process file
  const uploadFileMutation = useMutation({
    mutationFn: async ({ officeId, file }: { officeId: string; file: File }): Promise<ImportResult> => {
      if (!currentOrganization?.id) throw new Error('No organization');

      // Find office
      const office = importableOffices.find(o => o.id === officeId);
      if (!office) throw new Error('Oficina no encontrada');

      // Upload file to storage first
      const filePath = `${currentOrganization.id}/imports/${Date.now()}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('matter-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Call edge function to process
      const response = await supabase.functions.invoke('process-file-import', {
        body: { 
          tenantId: currentOrganization.id,
          officeCode: office.code,
          filePath,
          fileName: file.name,
          fileType: file.name.split('.').pop() || 'unknown',
          fileSize: file.size,
        },
      });

      if (response.error) {
        return {
          success: false,
          error: response.error.message,
        };
      }

      return response.data as ImportResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['import-history'] });
      if (result.success) {
        toast.success(`Importación completada: ${result.records_imported || 0} registros`);
      } else {
        toast.error(`Error en importación: ${result.error}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Error al importar: ${error.message}`);
    },
  });

  return {
    importableOffices,
    importHistory,
    isLoading: loadingOffices || loadingHistory,
    uploadFile: uploadFileMutation.mutateAsync,
    isUploading: uploadFileMutation.isPending,
  };
}
