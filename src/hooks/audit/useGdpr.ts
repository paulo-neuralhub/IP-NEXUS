// ============================================================
// IP-NEXUS - GDPR HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { GdprRequest, UserConsent, DataExport, GdprStats, GdprRequestType, GdprRequestStatus } from '@/types/audit';

// ==========================================
// GDPR REQUESTS
// ==========================================

export function useGdprRequests(filters?: { status?: string; type?: string }) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['gdpr-requests', currentOrganization?.id, filters],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('gdpr_requests')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.type) {
        query = query.eq('request_type', filters.type);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as GdprRequest[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useGdprRequest(id: string) {
  return useQuery({
    queryKey: ['gdpr-request', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gdpr_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as GdprRequest;
    },
    enabled: !!id,
  });
}

// ==========================================
// CREATE GDPR REQUEST
// ==========================================

export function useCreateGdprRequest() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (request: {
      requester_email: string;
      requester_name?: string;
      request_type: GdprRequestType;
      description?: string;
      data_categories?: string[];
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      // Calculate due date (30 days by default for GDPR)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const { data, error } = await supabase
        .from('gdpr_requests')
        .insert({
          organization_id: currentOrganization.id,
          requester_email: request.requester_email,
          requester_name: request.requester_name,
          request_type: request.request_type,
          description: request.description,
          data_categories: request.data_categories,
          due_date: dueDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as GdprRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gdpr-requests'] });
    },
  });
}

// ==========================================
// UPDATE GDPR REQUEST
// ==========================================

export function useUpdateGdprRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<GdprRequest, 'id' | 'organization_id' | 'created_at'>>) => {
      const { data, error } = await supabase
        .from('gdpr_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as GdprRequest;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gdpr-requests'] });
      queryClient.invalidateQueries({ queryKey: ['gdpr-request', variables.id] });
    },
  });
}

// ==========================================
// PROCESS GDPR REQUEST
// ==========================================

export function useProcessGdprRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      notes 
    }: { 
      id: string; 
      status: GdprRequestStatus; 
      notes?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      
      const updateData: Record<string, unknown> = {
        status,
        processing_notes: notes,
      };

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user?.id;
      }

      const { data, error } = await supabase
        .from('gdpr_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as GdprRequest;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gdpr-requests'] });
      queryClient.invalidateQueries({ queryKey: ['gdpr-request', variables.id] });
    },
  });
}

// ==========================================
// VERIFY IDENTITY
// ==========================================

export function useVerifyGdprIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      const { data, error } = await supabase
        .from('gdpr_requests')
        .update({
          identity_verified: true,
          identity_verified_at: new Date().toISOString(),
          identity_verified_by: user?.id,
          status: 'in_progress',
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as GdprRequest;
    },
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: ['gdpr-requests'] });
      queryClient.invalidateQueries({ queryKey: ['gdpr-request', requestId] });
    },
  });
}

// ==========================================
// USER CONSENTS
// ==========================================

export function useUserConsents(userId?: string) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['user-consents', currentOrganization?.id, userId],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('user_consents')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as UserConsent[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useUpdateConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      isGranted 
    }: { 
      id: string; 
      isGranted: boolean;
    }) => {
      const updateData: Record<string, unknown> = {
        is_granted: isGranted,
      };

      if (isGranted) {
        updateData.granted_at = new Date().toISOString();
        updateData.revoked_at = null;
      } else {
        updateData.revoked_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('user_consents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as UserConsent;
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
      return (data || []) as unknown as DataExport[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCreateDataExport() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (params: {
      user_id: string;
      export_type: string;
      config?: Record<string, unknown>;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { data, error } = await supabase
        .from('data_exports')
        .insert({
          user_id: params.user_id,
          export_type: params.export_type,
          config: params.config || {},
          status: 'pending',
          file_expires_at: expiresAt.toISOString(),
          organization_id: currentOrganization.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as DataExport;
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
    queryFn: async (): Promise<GdprStats | null> => {
      if (!currentOrganization?.id) return null;

      // Total requests
      const { count: total } = await supabase
        .from('gdpr_requests')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id);

      // Pending requests
      const { count: pending } = await supabase
        .from('gdpr_requests')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .in('status', ['pending', 'identity_verification', 'in_progress']);

      // Completed requests
      const { count: completed } = await supabase
        .from('gdpr_requests')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'completed');

      // By type
      const { data: typeData } = await supabase
        .from('gdpr_requests')
        .select('request_type')
        .eq('organization_id', currentOrganization.id);

      const byType: Record<string, number> = {};
      (typeData || []).forEach((d) => {
        const type = d.request_type || 'unknown';
        byType[type] = (byType[type] || 0) + 1;
      });

      // By status
      const { data: statusData } = await supabase
        .from('gdpr_requests')
        .select('status')
        .eq('organization_id', currentOrganization.id);

      const byStatus: Record<string, number> = {};
      (statusData || []).forEach((d) => {
        const status = d.status || 'unknown';
        byStatus[status] = (byStatus[status] || 0) + 1;
      });

      return {
        total_requests: total || 0,
        pending_requests: pending || 0,
        completed_requests: completed || 0,
        avg_completion_days: 5, // Would need actual calculation
        by_type: byType,
        by_status: byStatus,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}
