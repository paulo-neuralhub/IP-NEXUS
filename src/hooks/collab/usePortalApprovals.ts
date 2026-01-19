import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

// =============================================
// PORTAL APPROVALS
// =============================================

export function usePortalApprovals(options?: { portalId?: string; status?: string }) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['portal-approvals', currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      let query = supabase
        .from('portal_approvals')
        .select(`
          *,
          portal:client_portals(id, portal_name, client:contacts!client_id(name)),
          responder:portal_users!responded_by(name, email)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });
      
      if (options?.portalId) {
        query = query.eq('portal_id', options.portalId);
      }
      
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrganization?.id
  });
}

export function usePortalApproval(id: string | undefined) {
  return useQuery({
    queryKey: ['portal-approval', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('portal_approvals')
        .select(`
          *,
          portal:client_portals(*, client:contacts!client_id(*)),
          responder:portal_users!responded_by(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useCreateApproval() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      portal_id: string;
      approval_type: string;
      title: string;
      description?: string;
      reference_type?: string;
      reference_id?: string;
      details?: Json;
      attachments?: Json;
      due_date?: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      const { data: result, error } = await supabase
        .from('portal_approvals')
        .insert({
          ...data,
          organization_id: currentOrganization.id,
          status: 'pending',
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-approvals'] });
      toast.success('Solicitud de aprobación creada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
}

export function useCancelApproval() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('portal_approvals')
        .update({ status: 'cancelled' })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-approvals'] });
      toast.success('Solicitud cancelada');
    }
  });
}

export function useSendApprovalReminder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Update reminder_sent_at
      const { data: approval } = await supabase
        .from('portal_approvals')
        .select('reminder_count')
        .eq('id', id)
        .single();
      
      const { error } = await supabase
        .from('portal_approvals')
        .update({
          reminder_sent_at: new Date().toISOString(),
          reminder_count: (approval?.reminder_count || 0) + 1
        })
        .eq('id', id);
      
      if (error) throw error;
    },
      // TODO: Send email reminder via edge function
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-approvals'] });
      toast.success('Recordatorio enviado');
    }
  });
}

// =============================================
// PORTAL SIGNATURES
// =============================================

export function usePortalSignatures(options?: { portalId?: string; status?: string }) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['portal-signatures', currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      let query = supabase
        .from('portal_signatures')
        .select(`
          *,
          portal:client_portals(id, portal_name, client:contacts!client_id(name))
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });
      
      if (options?.portalId) {
        query = query.eq('portal_id', options.portalId);
      }
      
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrganization?.id
  });
}

export function usePortalSignature(id: string | undefined) {
  return useQuery({
    queryKey: ['portal-signature', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('portal_signatures')
        .select(`
          *,
          portal:client_portals(*, client:contacts!client_id(*))
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useCreateSignatureRequest() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      portal_id: string;
      document_type: string;
      title: string;
      description?: string;
      document_file_id?: string;
      document_url?: string;
      signers: Array<{
        user_id: string;
        name: string;
        email: string;
        role: string;
        order?: number;
      }>;
      signature_config?: Json;
      expires_at?: string;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      const signersWithStatus = data.signers.map((signer, index) => ({
        ...signer,
        order: signer.order || index + 1,
        status: 'pending',
        signed_at: null,
        signature_data: null
      }));
      
      const { data: result, error } = await supabase
        .from('portal_signatures')
        .insert({
          portal_id: data.portal_id,
          organization_id: currentOrganization.id,
          document_type: data.document_type,
          title: data.title,
          description: data.description,
          document_file_id: data.document_file_id,
          document_url: data.document_url,
          signers: signersWithStatus as unknown as Json,
          signature_config: data.signature_config || { require_all: true, sequential: false },
          status: 'pending',
          sent_at: new Date().toISOString(),
          expires_at: data.expires_at,
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-signatures'] });
      toast.success('Solicitud de firma creada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
}

export function useCancelSignatureRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('portal_signatures')
        .update({ status: 'cancelled' })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-signatures'] });
      toast.success('Solicitud cancelada');
    }
  });
}

// =============================================
// PORTAL COMMENTS
// =============================================

export function usePortalComments(portalId: string | undefined, contextType?: string, contextId?: string) {
  return useQuery({
    queryKey: ['portal-comments', portalId, contextType, contextId],
    queryFn: async () => {
      if (!portalId) return [];
      
      let query = supabase
        .from('portal_comments')
        .select('*')
        .eq('portal_id', portalId)
        .eq('is_internal', false)
        .order('created_at', { ascending: true });
      
      if (contextType) {
        query = query.eq('context_type', contextType);
      }
      
      if (contextId) {
        query = query.eq('context_id', contextId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!portalId
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      portal_id: string;
      context_type: string;
      context_id?: string;
      content: string;
      attachments?: Json;
      parent_id?: string;
      is_internal?: boolean;
    }) => {
      // Get thread_id if replying
      let threadId = null;
      if (data.parent_id) {
        const { data: parent } = await supabase
          .from('portal_comments')
          .select('thread_id, id')
          .eq('id', data.parent_id)
          .single();
        threadId = parent?.thread_id || parent?.id;
      }
      
      // Get user info
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user?.id)
        .single();
      
      const { data: result, error } = await supabase
        .from('portal_comments')
        .insert({
          portal_id: data.portal_id,
          context_type: data.context_type,
          context_id: data.context_id,
          parent_id: data.parent_id,
          thread_id: threadId,
          content: data.content,
          attachments: data.attachments || [],
          author_type: 'internal',
          author_internal_id: user?.id,
          author_name: userData?.full_name || user?.email || 'Usuario',
          is_internal: data.is_internal || false
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['portal-comments', variables.portal_id] 
      });
    }
  });
}

export function useResolveComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, portalId }: { id: string; portalId: string }) => {
      const { error } = await supabase
        .from('portal_comments')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id
        })
        .eq('id', id);
      
      if (error) throw error;
      return portalId;
    },
    onSuccess: (portalId) => {
      queryClient.invalidateQueries({ queryKey: ['portal-comments', portalId] });
      toast.success('Comentario resuelto');
    }
  });
}

// =============================================
// PORTAL ACTIVITY
// =============================================

export function usePortalActivity(portalId: string | undefined, limit: number = 50) {
  return useQuery({
    queryKey: ['portal-activity', portalId, limit],
    queryFn: async () => {
      if (!portalId) return [];
      
      const { data, error } = await supabase
        .from('portal_activity_log')
        .select('*')
        .eq('portal_id', portalId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
    enabled: !!portalId
  });
}
