import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import type { Invitation } from '@/types/backoffice';

// ===== INVITACIONES PENDIENTES =====
export function useInvitations() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['invitations', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          inviter:users!invited_by(id, full_name, email)
        `)
        .eq('organization_id', currentOrganization!.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Invitation[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// ===== CREAR INVITACIÓN =====
export function useCreateInvitation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      // Verificar si ya existe usuario con ese email
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (existingUser) {
        // Usuario existe, añadir directamente como miembro
        const { data: existingMember } = await supabase
          .from('memberships')
          .select('id')
          .eq('user_id', existingUser.id)
          .eq('organization_id', currentOrganization!.id)
          .maybeSingle();
        
        if (existingMember) {
          throw new Error('El usuario ya es miembro de esta organización');
        }
        
        // Crear membership directamente
        const { error } = await supabase
          .from('memberships')
          .insert({
            user_id: existingUser.id,
            organization_id: currentOrganization!.id,
            role,
          });
        if (error) throw error;
        
        return { type: 'direct', email };
      }
      
      // Usuario no existe, crear invitación
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          organization_id: currentOrganization!.id,
          email,
          role,
          invited_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      
      // Send invitation email (fire and forget)
      supabase.functions.invoke('send-email', {
        body: {
          to: email,
          template: 'team-invitation',
          data: { organizationId: currentOrganization!.id, role }
        }
      }).catch(() => {});
      
      return { type: 'invitation', data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['org-members'] });
    },
  });
}

// ===== REENVIAR INVITACIÓN =====
export function useResendInvitation() {
  return useMutation({
    mutationFn: async (invitationId: string) => {
      // Actualizar fecha de expiración
      const { data, error } = await supabase
        .from('invitations')
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', invitationId)
        .select()
        .single();
      if (error) throw error;
      
      // Resend invitation email (fire and forget)
      supabase.functions.invoke('send-email', {
        body: {
          to: data.email,
          template: 'team-invitation-resend',
          data: { invitationId }
        }
      }).catch(() => {});
      
      return data;
    },
  });
}

// ===== REVOCAR INVITACIÓN =====
export function useRevokeInvitation() {
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
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

// ===== ACEPTAR INVITACIÓN (por token) =====
export function useAcceptInvitation() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (token: string) => {
      // Buscar invitación
      const { data: invitation, error: findError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();
      
      if (findError || !invitation) {
        throw new Error('Invitación no válida o expirada');
      }
      
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('La invitación ha expirado');
      }
      
      if (invitation.email !== user?.email) {
        throw new Error('Esta invitación es para otro email');
      }
      
      // Crear membership
      const { error: memberError } = await supabase
        .from('memberships')
        .insert({
          user_id: user!.id,
          organization_id: invitation.organization_id,
          role: invitation.role,
        });
      if (memberError) throw memberError;
      
      // Marcar invitación como aceptada
      await supabase
        .from('invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);
      
      return invitation;
    },
  });
}
