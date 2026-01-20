import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

// Fetch team members (memberships) for the current organization
export function useTeamMembers() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['team-members', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('memberships')
        .select(`
          id,
          role,
          status,
          created_at,
          user_id,
          users:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', currentOrganization.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization?.id,
  });
}

// Fetch pending invitations
export function usePendingInvitations() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['pending-invitations', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization?.id,
  });
}

// Invite a new team member
export function useInviteTeamMember() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Generate a unique token for the invitation
      const token = crypto.randomUUID();
      
      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          organization_id: currentOrganization.id,
          email: email.toLowerCase().trim(),
          role,
          token,
          expires_at: expiresAt.toISOString(),
          invited_by: user.id,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Send invitation email via edge function
      await supabase.functions.invoke('send-email', {
        body: {
          to: email.toLowerCase().trim(),
          template: 'team-invitation',
          data: {
            organizationName: currentOrganization.name,
            role,
            inviteLink: `${window.location.origin}/accept-invite?token=${token}`
          }
        }
      }).catch(() => {
        // Email sending is not critical - invitation still created
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invitations', currentOrganization?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Error al enviar la invitación: ${error.message}`);
    },
  });
}

// Revoke/cancel an invitation
export function useRevokeInvitation() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invitations', currentOrganization?.id] });
      toast.success('Invitación cancelada');
    },
    onError: (error: Error) => {
      toast.error(`Error al cancelar la invitación: ${error.message}`);
    },
  });
}

// Remove a team member
export function useRemoveTeamMember() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (membershipId: string) => {
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', membershipId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', currentOrganization?.id] });
      toast.success('Miembro eliminado del equipo');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar miembro: ${error.message}`);
    },
  });
}

// Update team member role
export function useUpdateTeamMemberRole() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ membershipId, role }: { membershipId: string; role: string }) => {
      const { error } = await supabase
        .from('memberships')
        .update({ role })
        .eq('id', membershipId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', currentOrganization?.id] });
      toast.success('Rol actualizado');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar rol: ${error.message}`);
    },
  });
}
