// src/hooks/market/useModeration.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentReport, ReportStatus } from '@/types/kyc.types';
import { toast } from 'sonner';

export function useModerationQueue(status?: ReportStatus[]) {
  return useInfiniteQuery({
    queryKey: ['moderation-queue', status],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 20;
      let query = supabase
        .from('market_content_reports' as any)
        .select(`
          *,
          reporter:market_user_profiles!reporter_id(id, display_name, avatar_url),
          assigned:market_user_profiles!assigned_to(id, display_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: true }) as any;

      if (status && status.length > 0) {
        query = query.in('status', status);
      } else {
        query = query.in('status', ['pending', 'under_review']);
      }

      query = query.range(pageParam * limit, (pageParam + 1) * limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        reports: data as (ContentReport & { reporter: any; assigned: any })[],
        count,
        page: pageParam,
      };
    },
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil((lastPage.count || 0) / 20);
      return lastPage.page < totalPages - 1 ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 0,
  });
}

export function useReport(reportId: string | undefined) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      if (!reportId) return null;

      const { data, error } = await (supabase
        .from('market_content_reports' as any)
        .select(`
          *,
          reporter:market_user_profiles!reporter_id(*),
          assigned:market_user_profiles!assigned_to(*)
        `)
        .eq('id', reportId)
        .single() as any);

      if (error) throw error;
      return data as ContentReport;
    },
    enabled: !!reportId,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      reportType,
      description,
      evidenceUrls,
    }: {
      entityType: 'listing' | 'user' | 'message' | 'review';
      entityId: string;
      reportType: string;
      description: string;
      evidenceUrls?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('market_content_reports' as any)
        .insert({
          reporter_id: user.id,
          reported_entity_type: entityType,
          reported_entity_id: entityId,
          report_type: reportType,
          description,
          evidence_urls: evidenceUrls,
          status: 'pending',
        })
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      toast.success('Reporte enviado correctamente');
    },
    onError: () => {
      toast.error('Error al enviar reporte');
    },
  });
}

export function useAssignReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      moderatorId,
    }: {
      reportId: string;
      moderatorId: string;
    }) => {
      const { data, error } = await (supabase
        .from('market_content_reports' as any)
        .update({
          assigned_to: moderatorId,
          status: 'under_review',
        })
        .eq('id', reportId)
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
    },
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      resolution,
      action,
      notes,
    }: {
      reportId: string;
      resolution: 'valid' | 'invalid';
      action?: 'none' | 'warning' | 'content_removed' | 'user_suspended' | 'user_banned';
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: report, error: reportError } = await (supabase
        .from('market_content_reports' as any)
        .update({
          status: resolution === 'valid' ? 'resolved_valid' : 'resolved_invalid',
          action_taken: action || 'none',
          resolution_notes: notes,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId)
        .select()
        .single() as any);

      if (reportError) throw reportError;

      // Log moderation action
      if (action && action !== 'none') {
        await (supabase.from('market_moderation_actions' as any).insert({
          moderator_id: user.id,
          target_type: report.reported_entity_type,
          target_id: report.reported_entity_id,
          action: action === 'content_removed' ? 'remove' : 
                  action === 'user_suspended' ? 'suspend' :
                  action === 'user_banned' ? 'ban' : 'warn',
          reason: notes || 'Resultado de reporte',
          report_id: reportId,
        }) as any);
      }

      return report;
    },
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      toast.success('Reporte resuelto');
    },
    onError: () => {
      toast.error('Error al resolver reporte');
    },
  });
}

export function useKycReviewQueue() {
  return useInfiniteQuery({
    queryKey: ['kyc-review-queue'],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 20;
      const { data, error, count } = await (supabase
        .from('market_verifications' as any)
        .select(`
          *,
          user:market_user_profiles!user_id(id, display_name, avatar_url),
          documents:market_verification_documents(*)
        `, { count: 'exact' })
        .eq('status', 'in_review')
        .order('submitted_at', { ascending: true })
        .range(pageParam * limit, (pageParam + 1) * limit - 1) as any);

      if (error) throw error;

      return {
        verifications: data,
        count,
        page: pageParam,
      };
    },
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil((lastPage.count || 0) / 20);
      return lastPage.page < totalPages - 1 ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 0,
  });
}

export function useReviewVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      verificationId,
      decision,
      rejectionReason,
    }: {
      verificationId: string;
      decision: 'approve' | 'reject';
      rejectionReason?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('market_verifications' as any)
        .update({
          status: decision === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          rejection_reason: rejectionReason,
        })
        .eq('id', verificationId)
        .select('*, user_id')
        .single() as any);

      if (error) throw error;

      // Log audit
      await (supabase.from('market_kyc_audit_log' as any).insert({
        user_id: data.user_id,
        action: `verification_${decision}d`,
        entity_type: 'verification',
        entity_id: verificationId,
        new_value: { status: data.status, rejection_reason: rejectionReason },
        performed_by: user.id,
      }) as any);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-review-queue'] });
      toast.success('Verificación procesada');
    },
    onError: () => {
      toast.error('Error al procesar verificación');
    },
  });
}
