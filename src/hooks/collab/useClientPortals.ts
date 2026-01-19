import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

// =============================================
// CLIENT PORTALS
// =============================================

export function useClientPortals() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['client-portals', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('client_portals')
        .select(`
          *,
          client:contacts!client_id(id, name, email, company_name),
          users:portal_users(count)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrganization?.id
  });
}

export function useClientPortal(id: string | undefined) {
  return useQuery({
    queryKey: ['client-portal', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('client_portals')
        .select(`
          *,
          client:contacts!client_id(*),
          users:portal_users(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useCreatePortal() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      client_id: string;
      portal_name?: string;
      branding_config?: Json;
      settings?: Json;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      // Generate unique slug
      const slug = `${data.portal_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'portal'}-${Date.now().toString(36)}`;
      
      const { data: result, error } = await supabase
        .from('client_portals')
        .insert({
          organization_id: currentOrganization.id,
          client_id: data.client_id,
          portal_name: data.portal_name,
          portal_slug: slug,
          branding_config: data.branding_config || {},
          settings: data.settings || {},
          is_active: true,
          activated_at: new Date().toISOString(),
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-portals'] });
      toast.success('Portal creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
}

export function useUpdatePortal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      portal_name?: string;
      branding_config?: Json;
      settings?: Json;
      is_active?: boolean;
    }) => {
      const { error } = await supabase
        .from('client_portals')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-portals'] });
      queryClient.invalidateQueries({ queryKey: ['client-portal', variables.id] });
      toast.success('Portal actualizado');
    }
  });
}

export function useDeletePortal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('client_portals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-portals'] });
      toast.success('Portal eliminado');
    }
  });
}

// =============================================
// PORTAL USERS
// =============================================

export function usePortalUsers(portalId: string | undefined) {
  return useQuery({
    queryKey: ['portal-users', portalId],
    queryFn: async () => {
      if (!portalId) return [];
      
      const { data, error } = await supabase
        .from('portal_users')
        .select('*')
        .eq('portal_id', portalId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!portalId
  });
}

export function useInvitePortalUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      portal_id: string;
      email: string;
      name: string;
      role: 'admin' | 'approver' | 'viewer';
      permissions?: Json;
    }) => {
      // Generate magic link token
      const magicToken = crypto.randomUUID() + crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const defaultPermissions = {
        admin: { can_approve: true, can_sign: true, can_comment: true, can_download: true, can_invite: true },
        approver: { can_approve: true, can_sign: true, can_comment: true, can_download: true, can_invite: false },
        viewer: { can_approve: false, can_sign: false, can_comment: true, can_download: true, can_invite: false }
      };
      
      const { data: result, error } = await supabase
        .from('portal_users')
        .insert({
          portal_id: data.portal_id,
          email: data.email,
          name: data.name,
          role: data.role,
          permissions: data.permissions || defaultPermissions[data.role],
          magic_link_token: magicToken,
          magic_link_expires_at: expiresAt.toISOString(),
          status: 'invited',
          invited_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return { ...result, inviteLink: `/portal/invite/${magicToken}` };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['portal-users', variables.portal_id] });
      toast.success('Invitación enviada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
}

export function useUpdatePortalUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, portalId, ...data }: {
      id: string;
      portalId: string;
      role?: string;
      permissions?: Json;
      status?: string;
    }) => {
      const { error } = await supabase
        .from('portal_users')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['portal-users', variables.portalId] });
      toast.success('Usuario actualizado');
    }
  });
}

export function useDeletePortalUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, portalId }: { id: string; portalId: string }) => {
      const { error } = await supabase
        .from('portal_users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return portalId;
    },
    onSuccess: (portalId) => {
      queryClient.invalidateQueries({ queryKey: ['portal-users', portalId] });
      toast.success('Usuario eliminado');
    }
  });
}

// =============================================
// SHARED CONTENT
// =============================================

export function useSharedContent(portalId: string | undefined) {
  return useQuery({
    queryKey: ['shared-content', portalId],
    queryFn: async () => {
      if (!portalId) return [];
      
      const { data, error } = await supabase
        .from('portal_shared_content')
        .select('*')
        .eq('portal_id', portalId)
        .eq('is_active', true)
        .order('shared_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!portalId
  });
}

export function useShareContent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      portal_id: string;
      content_type: string;
      content_ids: string[];
      permissions?: Json;
      filters?: Json;
      expires_at?: string;
    }) => {
      const records = data.content_ids.map(contentId => ({
        portal_id: data.portal_id,
        content_type: data.content_type,
        content_id: contentId,
        permissions: data.permissions || { can_view: true, can_download: true },
        filters: data.filters || {},
        expires_at: data.expires_at,
        shared_by: user?.id
      }));
      
      const { error } = await supabase
        .from('portal_shared_content')
        .insert(records);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shared-content', variables.portal_id] });
      toast.success('Contenido compartido');
    }
  });
}

export function useUnshareContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, portalId }: { id: string; portalId: string }) => {
      const { error } = await supabase
        .from('portal_shared_content')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      return portalId;
    },
    onSuccess: (portalId) => {
      queryClient.invalidateQueries({ queryKey: ['shared-content', portalId] });
      toast.success('Contenido descompartido');
    }
  });
}
