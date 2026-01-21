/**
 * Hook para gestionar configuración SSO
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

export interface SSOConfiguration {
  id: string;
  organization_id: string;
  provider_type: 'azure_ad' | 'google_workspace' | 'okta' | 'saml_generic' | 'oidc_generic';
  
  // SAML
  saml_entity_id: string | null;
  saml_sso_url: string | null;
  saml_slo_url: string | null;
  saml_certificate: string | null;
  saml_metadata_url: string | null;
  
  // OIDC
  oidc_client_id: string | null;
  oidc_client_secret_encrypted: string | null;
  oidc_issuer_url: string | null;
  oidc_authorization_url: string | null;
  oidc_token_url: string | null;
  oidc_userinfo_url: string | null;
  oidc_scopes: string | null;
  
  // Mappings
  attribute_mapping: Record<string, string>;
  role_mapping: Record<string, string>;
  
  // Options
  auto_provision_users: boolean;
  auto_update_users: boolean;
  default_role: string;
  require_sso: boolean;
  allowed_domains: string[];
  
  // Status
  is_active: boolean;
  is_verified: boolean;
  last_sync_at: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface SSOSession {
  id: string;
  sso_configuration_id: string;
  user_id: string;
  session_index: string | null;
  name_id: string | null;
  attributes_received: Record<string, unknown>;
  logged_in_at: string;
  logged_out_at: string | null;
  logout_reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export function useSSOConfig() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  const { data: config, isLoading, error } = useQuery({
    queryKey: ['sso-config', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return null;
      
      const { data, error } = await supabase
        .from('sso_configurations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as SSOConfiguration | null;
    },
    enabled: !!currentOrganization?.id,
  });

  const createConfig = useMutation({
    mutationFn: async (providerType: SSOConfiguration['provider_type']) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      const { data, error } = await supabase
        .from('sso_configurations')
        .insert({
          organization_id: currentOrganization.id,
          provider_type: providerType,
          is_active: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sso-config'] });
      toast.success('Configuración SSO iniciada');
    },
    onError: (error) => {
      toast.error(`Error al crear configuración: ${error.message}`);
    },
  });

  const updateConfig = useMutation({
    mutationFn: async (updates: Partial<SSOConfiguration>) => {
      if (!config?.id) throw new Error('No SSO config');
      
      const { data, error } = await supabase
        .from('sso_configurations')
        .update(updates)
        .eq('id', config.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sso-config'] });
      toast.success('Configuración SSO actualizada');
    },
    onError: (error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });

  const deleteConfig = useMutation({
    mutationFn: async () => {
      if (!config?.id) throw new Error('No SSO config');
      
      const { error } = await supabase
        .from('sso_configurations')
        .delete()
        .eq('id', config.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sso-config'] });
      toast.success('Configuración SSO eliminada');
    },
    onError: (error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });

  const testConnection = useMutation({
    mutationFn: async () => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      const { data, error } = await supabase.functions.invoke('sso-test-connection', {
        body: { organizationId: currentOrganization.id }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Conexión SSO verificada correctamente');
      } else {
        toast.error(`Error de conexión: ${data.error}`);
      }
    },
    onError: (error) => {
      toast.error(`Error al probar conexión: ${error.message}`);
    },
  });

  const activateSSO = useMutation({
    mutationFn: async () => {
      if (!config?.id) throw new Error('No SSO config');
      
      const { data, error } = await supabase
        .from('sso_configurations')
        .update({ is_active: true, is_verified: true })
        .eq('id', config.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sso-config'] });
      toast.success('SSO activado correctamente');
    },
    onError: (error) => {
      toast.error(`Error al activar SSO: ${error.message}`);
    },
  });

  const deactivateSSO = useMutation({
    mutationFn: async () => {
      if (!config?.id) throw new Error('No SSO config');
      
      const { data, error } = await supabase
        .from('sso_configurations')
        .update({ is_active: false })
        .eq('id', config.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sso-config'] });
      toast.success('SSO desactivado');
    },
    onError: (error) => {
      toast.error(`Error al desactivar SSO: ${error.message}`);
    },
  });

  return {
    config,
    isLoading,
    error,
    createConfig,
    updateConfig,
    deleteConfig,
    testConnection,
    activateSSO,
    deactivateSSO,
  };
}

export function useSSOSessions() {
  const { currentOrganization } = useOrganization();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sso-sessions', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('sso_sessions')
        .select(`
          *,
          user:users(full_name, email, avatar_url),
          sso_configuration:sso_configurations(provider_type)
        `)
        .order('logged_in_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrganization?.id,
  });

  return { sessions, isLoading };
}

// Helper para obtener SSO config por dominio de email (para login page)
export function useSSOByDomain(email: string | null) {
  const domain = email?.split('@')[1];

  const { data: ssoConfig, isLoading } = useQuery({
    queryKey: ['sso-by-domain', domain],
    queryFn: async () => {
      if (!domain) return null;
      
      const { data, error } = await supabase
        .from('sso_configurations')
        .select(`
          id,
          provider_type,
          organization:organizations(id, name)
        `)
        .eq('is_active', true)
        .contains('allowed_domains', [domain])
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!domain,
  });

  return { ssoConfig, isLoading };
}
