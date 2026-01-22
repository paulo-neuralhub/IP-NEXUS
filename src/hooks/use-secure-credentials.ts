import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

export type SecureCredentialProvider = 'smtp' | 'whatsapp' | 'calendar' | string;

export interface SecureCredentialStatusItem {
  provider: string;
  credential_key: string;
  is_configured: boolean;
  updated_at: string | null;
}

export function useSecureCredentialStatus() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['secure-credential-status', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return { encryption_ready: false, credentials: [] as SecureCredentialStatusItem[] };
      const { data, error } = await supabase.functions.invoke('secure-credentials', {
        body: { action: 'status', organization_id: currentOrganization.id },
      });
      if (error) throw error;
      return data as { encryption_ready: boolean; credentials: SecureCredentialStatusItem[] };
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useUpsertSecureCredential() {
  const { currentOrganization } = useOrganization();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: { provider: SecureCredentialProvider; credential_key: string; value: string }) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      const { data, error } = await supabase.functions.invoke('secure-credentials', {
        body: {
          action: 'upsert',
          organization_id: currentOrganization.id,
          provider: params.provider,
          credential_key: params.credential_key,
          value: params.value,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.message || data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['secure-credential-status'] });
    },
  });
}
