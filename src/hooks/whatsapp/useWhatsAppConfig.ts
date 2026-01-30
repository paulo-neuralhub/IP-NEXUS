/**
 * Hook for managing WhatsApp tenant configuration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { 
  WhatsAppTenantConfig, 
  WhatsAppSettingsForm,
  WhatsAppImplementationRequestForm 
} from '@/types/whatsapp';

export function useWhatsAppConfig() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = currentOrganization?.id;

  // Fetch config
  const configQuery = useQuery({
    queryKey: ['whatsapp-config', orgId],
    queryFn: async () => {
      if (!orgId) return null;

      const { data, error } = await supabase
        .from('whatsapp_tenant_config')
        .select('*')
        .eq('organization_id', orgId)
        .maybeSingle();

      if (error) throw error;
      return data as WhatsAppTenantConfig | null;
    },
    enabled: !!orgId,
  });

  // Create initial config if not exists
  const ensureConfig = useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error('No organization');

      const { data: existing } = await supabase
        .from('whatsapp_tenant_config')
        .select('id')
        .eq('organization_id', orgId)
        .maybeSingle();

      if (existing) return existing;

      const { data, error } = await supabase
        .from('whatsapp_tenant_config')
        .insert({ organization_id: orgId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-config', orgId] });
    },
  });

  // Update settings
  const updateSettings = useMutation({
    mutationFn: async (settings: Partial<WhatsAppSettingsForm>) => {
      if (!orgId) throw new Error('No organization');

      const { error } = await supabase
        .from('whatsapp_tenant_config')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', orgId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Configuración guardada');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-config', orgId] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Request implementation
  const requestImplementation = useMutation({
    mutationFn: async (form: WhatsAppImplementationRequestForm) => {
      if (!orgId) throw new Error('No organization');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create implementation request
      const { error: reqError } = await supabase
        .from('whatsapp_implementation_requests')
        .insert({
          organization_id: orgId,
          requested_by: user.id,
          ...form,
        });

      if (reqError) throw reqError;

      // Update config
      const { error: cfgError } = await supabase
        .from('whatsapp_tenant_config')
        .update({
          implementation_requested: true,
          implementation_request_date: new Date().toISOString(),
          implementation_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', orgId);

      if (cfgError) throw cfgError;
    },
    onSuccess: () => {
      toast.success('Solicitud enviada. Nos pondremos en contacto contigo pronto.');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-config', orgId] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  return {
    config: configQuery.data,
    isLoading: configQuery.isLoading,
    isConfigured: configQuery.data?.integration_type !== 'none',
    integrationType: configQuery.data?.integration_type || 'none',
    metaStatus: configQuery.data?.meta_status || 'not_configured',
    implementationStatus: configQuery.data?.implementation_status || 'none',
    
    ensureConfig,
    updateSettings,
    requestImplementation,
    
    refetch: configQuery.refetch,
  };
}
