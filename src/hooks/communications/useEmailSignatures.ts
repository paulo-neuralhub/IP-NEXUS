// =============================================
// HOOK: useEmailSignatures
// Gestión de firmas de email
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export interface EmailSignature {
  id: string;
  organization_id: string;
  user_id: string;
  name: string;
  content_html: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useEmailSignatures() {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: signatures, isLoading } = useQuery({
    queryKey: ['email-signatures', currentOrganization?.id, user?.id],
    queryFn: async () => {
      if (!currentOrganization?.id || !user?.id) return [];
      
      const { data, error } = await supabase
        .from('email_signatures')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('name');
      
      if (error) throw error;
      return data as EmailSignature[];
    },
    enabled: !!currentOrganization?.id && !!user?.id,
  });

  const defaultSignature = signatures?.find(s => s.is_default) || signatures?.[0];

  const saveSignature = useMutation({
    mutationFn: async (signature: Partial<EmailSignature> & { id?: string }) => {
      if (!currentOrganization?.id || !user?.id) {
        throw new Error('No organization or user');
      }

      const data = {
        name: signature.name,
        content_html: signature.content_html,
        is_default: signature.is_default,
        is_active: signature.is_active ?? true,
        organization_id: currentOrganization.id,
        user_id: user.id,
      };

      if (signature.id) {
        const { error } = await supabase
          .from('email_signatures')
          .update(data)
          .eq('id', signature.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_signatures')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-signatures'] });
      toast.success('Firma guardada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteSignature = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_signatures')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-signatures'] });
      toast.success('Firma eliminada');
    },
  });

  const setDefault = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_signatures')
        .update({ is_default: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-signatures'] });
      toast.success('Firma predeterminada actualizada');
    },
  });

  return {
    signatures,
    defaultSignature,
    isLoading,
    saveSignature,
    deleteSignature,
    setDefault,
  };
}