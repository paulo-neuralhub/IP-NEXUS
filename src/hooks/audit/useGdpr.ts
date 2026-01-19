// ============================================================
// IP-NEXUS - GDPR HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import type { 
  GdprRequest, 
  GdprRequestType, 
  GdprRequestStatus, 
  UserConsent, 
  DataExport,
  GdprStats 
} from '@/types/audit';

// ==========================================
// GDPR REQUESTS
// ==========================================

export function useGdprRequests(status?: GdprRequestStatus | GdprRequestStatus[]) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['gdpr-requests', currentOrganization?.id, status],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('gdpr_requests')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (status) {
        if (Array.isArray(status)) {
          query = query.in('status', status);
        } else {
          query = query.eq('status', status);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as GdprRequest[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useGdprRequest(requestId: string | undefined) {
  return useQuery({
    queryKey: ['gdpr-request', requestId],
    queryFn: async () => {
      if (!requestId) return null;

      const { data, error } = await supabase
        .from('gdpr_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) throw error;
      return data as GdprRequest;
    },
    enabled: !!requestId,
  });
}

export function useCreateGdprRequest() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (request: {
      requester_email: string;
      requester_name?: string;
      request_type: GdprRequestType;
      description?: string;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');

      const { data: { user } } = await supabase.auth.getUser();

      // GDPR: 30 days deadline
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const { data, error } = await supabase
        .from('gdpr_requests')
        .insert({
          organization_id: currentOrganization.id,
          requester_user_id: user?.id,
          requester_email: request.requester_email,
          requester_name: request.requester_name,
          request_type: request.request_type,
          description: request.description,
          due_date: dueDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as GdprRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gdpr-requests'] });
      queryClient.invalidateQueries({ queryKey: ['gdpr-stats'] });
    },
  });
}

export function useUpdateGdprRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<GdprRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('gdpr_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as GdprRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gdpr-requests'] });
      queryClient.invalidateQueries({ queryKey: ['gdpr-request', data.id] });
      queryClient.invalidateQueries({ queryKey: ['gdpr-stats'] });
    },
  });
}

export function useProcessGdprRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      action,
      notes,
    }: {
      requestId: string;
      action: 'approve' | 'reject' | 'complete';
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const updates: Partial<GdprRequest> = {};

      if (action === 'approve') {
        updates.status = 'in_progress';
        updates.assigned_to = user?.id;
      } else if (action === 'reject') {
        updates.status = 'rejected';
        updates.resolution_notes = notes;
        updates.completed_at = new Date().toISOString();
      } else if (action === 'complete') {
        updates.status = 'completed';
        updates.resolution_notes = notes;
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('gdpr_requests')
        .update(updates)
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data as GdprRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gdpr-requests'] });
      queryClient.invalidateQueries({ queryKey: ['gdpr-request', data.id] });
      queryClient.invalidateQueries({ queryKey: ['gdpr-stats'] });
    },
  });
}

export function useVerifyGdprIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('gdpr_requests')
        .update({
          identity_verified: true,
          identity_verified_at: new Date().toISOString(),
          identity_verified_by: user?.id,
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data as GdprRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gdpr-request', data.id] });
    },
  });
}

// ==========================================
// USER CONSENTS
// ==========================================

export function useUserConsents(userId?: string) {
  const { data: { user } } = supabase.auth.getUser() as { data: { user: { id: string } | null } };
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ['user-consents', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', targetUserId)
        .order('granted_at', { ascending: false });

      if (error) throw error;
      return data as UserConsent[];
    },
    enabled: !!targetUserId,
  });
}

export function useUpdateConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      consent_type,
      granted,
      document_version,
      document_url,
    }: {
      consent_type: string;
      granted: boolean;
      document_version?: string;
      document_url?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_consents')
        .upsert({
          user_id: user.id,
          consent_type,
          granted,
          document_version,
          document_url,
          granted_at: granted ? new Date().toISOString() : undefined,
          revoked_at: !granted ? new Date().toISOString() : undefined,
          user_agent: navigator.userAgent,
        }, {
          onConflict: 'user_id,consent_type,organization_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserConsent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-consents'] });
    },
  });
}

// ==========================================
// DATA EXPORTS
// ==========================================

export function useDataExports() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['data-exports', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('data_exports')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DataExport[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCreateDataExport() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (config: {
      export_type: string;
      include_assets?: boolean;
      include_contacts?: boolean;
      include_documents?: boolean;
      include_audit_logs?: boolean;
      date_from?: string;
      date_to?: string;
      format?: 'json' | 'csv' | 'xlsx';
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('data_exports')
        .insert({
          organization_id: currentOrganization.id,
          user_id: user.id,
          export_type: config.export_type,
          config: {
            include_assets: config.include_assets ?? true,
            include_contacts: config.include_contacts ?? true,
            include_documents: config.include_documents ?? true,
            include_audit_logs: config.include_audit_logs ?? false,
            date_from: config.date_from,
            date_to: config.date_to,
            format: config.format ?? 'json',
          },
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data as DataExport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-exports'] });
    },
  });
}

// ==========================================
// GDPR STATS
// ==========================================

export function useGdprStats() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['gdpr-stats', currentOrganization?.id],
    queryFn: async (): Promise<GdprStats> => {
      if (!currentOrganization?.id) {
        return {
          total: 0,
          pending: 0,
          in_progress: 0,
          completed: 0,
          rejected: 0,
          overdue: 0,
          compliance_score: 0,
          consents_ok: false,
          retention_ok: false,
          rights_ok: false,
        };
      }

      const { data: requests } = await supabase
        .from('gdpr_requests')
        .select('status, due_date')
        .eq('organization_id', currentOrganization.id);

      const now = new Date();
      const stats = {
        total: requests?.length || 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        rejected: 0,
        overdue: 0,
      };

      (requests || []).forEach((r) => {
        if (r.status === 'pending') stats.pending++;
        else if (r.status === 'in_progress') stats.in_progress++;
        else if (r.status === 'completed') stats.completed++;
        else if (r.status === 'rejected') stats.rejected++;

        if (['pending', 'in_progress'].includes(r.status) && new Date(r.due_date) < now) {
          stats.overdue++;
        }
      });

      // Check consents
      const { count: consentsCount } = await supabase
        .from('user_consents')
        .select('*', { count: 'exact', head: true })
        .eq('granted', true);

      // Check retention policies
      const { count: retentionCount } = await supabase
        .from('retention_policies')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .eq('is_active', true);

      const consentsOk = (consentsCount || 0) > 0;
      const retentionOk = (retentionCount || 0) > 0;
      const rightsOk = stats.overdue === 0;

      // Calculate compliance score
      let score = 0;
      if (consentsOk) score += 33;
      if (retentionOk) score += 33;
      if (rightsOk) score += 34;

      return {
        ...stats,
        compliance_score: score,
        consents_ok: consentsOk,
        retention_ok: retentionOk,
        rights_ok: rightsOk,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}
