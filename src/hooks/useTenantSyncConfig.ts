import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/organization-context";
import { toast } from "sonner";

export interface SyncConfig {
  id?: string;
  sync_status: boolean;
  sync_documents: boolean;
  auto_create_deadlines: boolean;
  notify_on_status_change: boolean;
  notify_on_new_document: boolean;
  send_daily_summary: boolean;
  notification_email?: string;
  sync_matter_types: string[];
  sync_matter_statuses: string[];
}

const defaultConfig: SyncConfig = {
  sync_status: true,
  sync_documents: true,
  auto_create_deadlines: true,
  notify_on_status_change: true,
  notify_on_new_document: true,
  send_daily_summary: false,
  notification_email: '',
  sync_matter_types: ['trademark', 'patent', 'design', 'utility_model'],
  sync_matter_statuses: ['filed', 'examination', 'published', 'registered'],
};

export function useTenantSyncConfig() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  const { data: config = defaultConfig, isLoading } = useQuery({
    queryKey: ['tenant-sync-config', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return defaultConfig;

      const { data, error } = await (supabase as any)
        .from('tenant_sync_config')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) return defaultConfig;

      return {
        id: data.id,
        sync_status: data.sync_status ?? true,
        sync_documents: data.sync_documents ?? true,
        auto_create_deadlines: data.auto_create_deadlines ?? true,
        notify_on_status_change: data.notify_on_status_change ?? true,
        notify_on_new_document: data.notify_on_new_document ?? true,
        send_daily_summary: false, // Not in DB yet
        notification_email: data.notification_email || '',
        sync_matter_types: data.sync_matter_types || defaultConfig.sync_matter_types,
        sync_matter_statuses: data.sync_matter_statuses || defaultConfig.sync_matter_statuses,
      } as SyncConfig;
    },
    enabled: !!currentOrganization?.id,
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<SyncConfig>) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const payload = {
        organization_id: currentOrganization.id,
        sync_status: newConfig.sync_status ?? config.sync_status,
        sync_documents: newConfig.sync_documents ?? config.sync_documents,
        auto_create_deadlines: newConfig.auto_create_deadlines ?? config.auto_create_deadlines,
        notify_on_status_change: newConfig.notify_on_status_change ?? config.notify_on_status_change,
        notify_on_new_document: newConfig.notify_on_new_document ?? config.notify_on_new_document,
        notification_email: newConfig.notification_email ?? config.notification_email,
        sync_matter_types: newConfig.sync_matter_types ?? config.sync_matter_types,
        sync_matter_statuses: newConfig.sync_matter_statuses ?? config.sync_matter_statuses,
      };

      if (config.id) {
        const { error } = await (supabase as any)
          .from('tenant_sync_config')
          .update(payload)
          .eq('id', config.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('tenant_sync_config')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-sync-config'] });
      toast.success('Preferencias guardadas');
    },
    onError: (error: Error) => {
      toast.error(`Error al guardar: ${error.message}`);
    },
  });

  return {
    config,
    isLoading,
    updateConfig: updateConfigMutation.mutateAsync,
    isUpdating: updateConfigMutation.isPending,
  };
}
