import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { EmailIngestionItem } from '@/types/docket-god-mode';

export function useEmailIngestionQueue(filters?: {
  status?: string;
  limit?: number;
}) {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['email-ingestion', currentOrganization?.id, filters],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('email_ingestion_queue')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as EmailIngestionItem[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useEmailIngestionItem(id: string) {
  return useQuery({
    queryKey: ['email-ingestion-item', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_ingestion_queue')
        .select(`
          *,
          matched_matter:matters(id, title, reference_number)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as EmailIngestionItem;
    },
    enabled: !!id,
  });
}

export function useProcessEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Update status to processing
      await supabase
        .from('email_ingestion_queue')
        .update({
          status: 'processing',
          processing_started_at: new Date().toISOString(),
        })
        .eq('id', id);

      // Call edge function for AI processing
      const { data, error } = await supabase.functions.invoke('parse-incoming-email', {
        body: { emailId: id },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-ingestion'] });
      toast.success('Email procesado');
    },
    onError: (error) => {
      toast.error('Error procesando email: ' + error.message);
    },
  });
}

export function useRetryEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_ingestion_queue')
        .update({
          status: 'pending',
          error_message: null,
          retry_count: supabase.rpc('increment_retry_count'),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-ingestion'] });
      toast.success('Email en cola para reintento');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useMatchEmailToMatter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emailId, matterId }: { emailId: string; matterId: string }) => {
      const { error } = await supabase
        .from('email_ingestion_queue')
        .update({
          matched_matter_id: matterId,
          status: 'completed',
          processing_completed_at: new Date().toISOString(),
        })
        .eq('id', emailId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-ingestion'] });
      toast.success('Email vinculado al expediente');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useDismissEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_ingestion_queue')
        .update({
          status: 'manual_review',
          processing_completed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-ingestion'] });
      toast.success('Email marcado para revisión manual');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useEmailIngestionStats() {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['email-ingestion-stats', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return null;

      const { data, error } = await supabase
        .from('email_ingestion_queue')
        .select('status')
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter((e) => e.status === 'pending').length,
        processing: data.filter((e) => e.status === 'processing').length,
        completed: data.filter((e) => e.status === 'completed').length,
        failed: data.filter((e) => e.status === 'failed').length,
        manualReview: data.filter((e) => e.status === 'manual_review').length,
      };

      return stats;
    },
    enabled: !!currentOrganization?.id,
  });
}
