import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/organization-context";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

export interface ReviewItem {
  id: string;
  import_id: string;
  matter_id?: string;
  matter_ref?: string;
  office_code: string;
  extracted_data: Record<string, unknown>;
  current_data: Record<string, unknown>;
  confidence_score: number;
  fields_to_review: string[];
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  created_at: string;
  import_file_name?: string;
}

export interface ReviewItemDetail extends ReviewItem {
  document_url?: string;
}

export function useImportReview() {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get review queue from database
  const { data: reviewQueue = [], isLoading } = useQuery({
    queryKey: ['import-review-queue', currentOrganization?.id],
    queryFn: async (): Promise<ReviewItem[]> => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await (supabase as any)
        .from('import_review_queue')
        .select('*, file_imports(office_code, file_name)')
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        import_id: item.import_id,
        matter_id: item.matter_id,
        matter_ref: item.extracted_data?.application_number || item.extracted_data?.reference,
        office_code: item.file_imports?.office_code || 'Unknown',
        extracted_data: item.extracted_data || {},
        current_data: item.current_data || {},
        confidence_score: item.confidence_score || 0,
        fields_to_review: item.fields_to_review || [],
        status: item.status,
        created_at: item.created_at,
        import_file_name: item.file_imports?.file_name,
      }));
    },
    enabled: !!currentOrganization?.id,
  });

  // Get single review item detail
  const getReviewItem = async (id: string): Promise<ReviewItemDetail | null> => {
    const { data, error } = await (supabase as any)
      .from('import_review_queue')
      .select('*, file_imports(office_code, file_name)')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      import_id: data.import_id,
      matter_id: data.matter_id,
      matter_ref: data.extracted_data?.application_number || data.extracted_data?.reference,
      office_code: data.file_imports?.office_code || 'Unknown',
      extracted_data: data.extracted_data || {},
      current_data: data.current_data || {},
      confidence_score: data.confidence_score || 0,
      fields_to_review: data.fields_to_review || [],
      status: data.status,
      created_at: data.created_at,
      import_file_name: data.file_imports?.file_name,
      document_url: undefined,
    };
  };

  // Approve item
  const approveMutation = useMutation({
    mutationFn: async ({ id, finalData }: { id: string; finalData?: Record<string, unknown> }) => {
      const { error } = await (supabase as any)
        .from('import_review_queue')
        .update({
          status: 'approved',
          final_data: finalData || {},
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['import-history'] });
      toast.success('Registro aprobado y actualizado');
    },
    onError: (error: Error) => {
      toast.error(`Error al aprobar: ${error.message}`);
    },
  });

  // Reject item
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { error } = await supabase
        .from('import_review_queue')
        .update({
          status: 'rejected',
          review_notes: reason,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-review-queue'] });
      toast.success('Registro rechazado');
    },
    onError: (error: Error) => {
      toast.error(`Error al rechazar: ${error.message}`);
    },
  });

  // Bulk approve
  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('import_review_queue')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['import-review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['import-history'] });
      toast.success(`${ids.length} registros aprobados`);
    },
    onError: (error: Error) => {
      toast.error(`Error al aprobar: ${error.message}`);
    },
  });

  // Bulk reject
  const bulkRejectMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('import_review_queue')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['import-review-queue'] });
      toast.success(`${ids.length} registros rechazados`);
    },
    onError: (error: Error) => {
      toast.error(`Error al rechazar: ${error.message}`);
    },
  });

  return {
    reviewQueue,
    isLoading,
    getReviewItem,
    approveItem: approveMutation.mutateAsync,
    rejectItem: rejectMutation.mutateAsync,
    bulkApprove: bulkApproveMutation.mutateAsync,
    bulkReject: bulkRejectMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
