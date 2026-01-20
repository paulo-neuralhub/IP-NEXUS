import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

export interface SpiderConnector {
  id: string;
  code: string;
  name: string;
  description: string | null;
  connector_type: string;
  source_category: string | null;
  jurisdictions: string[];
  base_url: string | null;
  auth_type: string;
  required_tier: string;
  is_active: boolean;
  maintenance_mode: boolean;
  health_status: string;
  logo_url: string | null;
}

export interface ConnectorCredential {
  id: string;
  connector_id: string;
  is_valid: boolean;
  last_validated_at: string | null;
  last_used_at: string | null;
  total_requests: number;
}

// Obtener todos los conectores disponibles
export function useSpiderConnectors(tier?: string) {
  return useQuery({
    queryKey: ['spider-connectors', tier],
    queryFn: async (): Promise<SpiderConnector[]> => {
      let query = supabase
        .from('spider_connectors')
        .select('*')
        .eq('is_active', true)
        .order('required_tier', { ascending: true });

      if (tier) {
        const tiers = tier === 'enterprise' 
          ? ['basic', 'pro', 'enterprise']
          : tier === 'pro' 
            ? ['basic', 'pro']
            : ['basic'];
        query = query.in('required_tier', tiers);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SpiderConnector[];
    },
  });
}

// Obtener credenciales de la organización
export function useConnectorCredentials() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['connector-credentials', currentOrganization?.id],
    queryFn: async (): Promise<Record<string, ConnectorCredential>> => {
      const { data, error } = await supabase
        .from('spider_connector_credentials')
        .select('*')
        .eq('organization_id', currentOrganization!.id);

      if (error) throw error;

      return (data || []).reduce((acc, cred) => {
        acc[cred.connector_id] = cred;
        return acc;
      }, {} as Record<string, ConnectorCredential>);
    },
    enabled: !!currentOrganization?.id,
  });
}

// Guardar credenciales de un conector
export function useSaveConnectorCredentials() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async ({
      connectorId,
      credentials,
    }: {
      connectorId: string;
      credentials: Record<string, string>;
    }) => {
      const { data, error } = await supabase
        .from('spider_connector_credentials')
        .upsert({
          organization_id: currentOrganization!.id,
          connector_id: connectorId,
          credentials,
          is_valid: true,
          last_validated_at: new Date().toISOString(),
        }, {
          onConflict: 'organization_id,connector_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connector-credentials'] });
      toast.success('Credenciales guardadas');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al guardar credenciales');
    },
  });
}

// Eliminar credenciales
export function useDeleteConnectorCredentials() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (connectorId: string) => {
      const { error } = await supabase
        .from('spider_connector_credentials')
        .delete()
        .eq('organization_id', currentOrganization!.id)
        .eq('connector_id', connectorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connector-credentials'] });
      toast.success('Credenciales eliminadas');
    },
  });
}
