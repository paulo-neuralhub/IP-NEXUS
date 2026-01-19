import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import { INTEGRATION_PROVIDERS, type IntegrationConnection } from '@/types/integrations';

export function useIntegrationProviders() {
  return useQuery({
    queryKey: ['integration-providers'],
    queryFn: async () => INTEGRATION_PROVIDERS,
    staleTime: Infinity
  });
}

export function useIntegrationConnections() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['integration-connections', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('api_connections')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;
      return (data || []) as IntegrationConnection[];
    },
    enabled: !!currentOrganization?.id
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: { provider: string; credentials: Record<string, any>; config?: Record<string, any> }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data: result, error } = await supabase
        .from('api_connections')
        .insert({
          organization_id: currentOrganization.id,
          provider: data.provider,
          credentials: data.credentials,
          config: data.config || {},
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-connections'] });
      toast.success('Integración conectada');
    },
    onError: (error: any) => {
      toast.error('Error al conectar: ' + error.message);
    }
  });
}

export function useDisconnectIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('api_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-connections'] });
      toast.success('Integración desconectada');
    },
    onError: (error: any) => {
      toast.error('Error: ' + error.message);
    }
  });
}
