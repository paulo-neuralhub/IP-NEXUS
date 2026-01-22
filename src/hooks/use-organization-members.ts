import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

// ===== MIEMBROS DE LA ORGANIZACIÓN =====
export function useOrganizationMembers() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['org-members', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memberships')
        .select(`
          *,
          user:users(id, email, full_name, avatar_url, created_at)
        `)
        .eq('organization_id', currentOrganization!.id)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrganization?.id,
  });
}

// ===== ACTUALIZAR ORGANIZACIÓN =====
export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (
      data: Partial<{
        name: string;
        slug: string;
        website: string;
        logo_url: string;
        whatsapp_business_id: string;
        whatsapp_phone: string;
        whatsapp_phone_number_id: string;
      }>
    ) => {
      const { data: org, error } = await supabase
        .from('organizations')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', currentOrganization!.id)
        .select()
        .single();
      if (error) throw error;
      return org;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership'] });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });
}

// ===== CAMBIAR ROL DE MIEMBRO =====
export function useChangeMemberRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase
        .from('memberships')
        .update({ role })
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members'] });
    },
  });
}

// ===== ELIMINAR MIEMBRO =====
export function useRemoveMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members'] });
    },
  });
}
