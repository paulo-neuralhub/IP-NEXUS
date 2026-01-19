import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { 
  MigrationConfig, 
  MigrationJob, 
  MigrationSourceSystem, 
  ConnectionConfig,
  EntityMapping,
  FieldMapping,
  MigrationJobType,
  MigrationJobStatus
} from '@/types/import-export';

export function useMigrationConfigs() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['migration-configs', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await (supabase as any)
        .from('migration_configs')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('name');

      if (error) throw error;
      return (data || []) as MigrationConfig[];
    },
    enabled: !!currentOrganization?.id
  });
}

export function useMigrationConfig(id: string) {
  return useQuery({
    queryKey: ['migration-config', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('migration_configs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as MigrationConfig;
    },
    enabled: !!id
  });
}

export function useCreateMigrationConfig() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: {
      source_system: MigrationSourceSystem;
      source_version?: string;
      name: string;
      description?: string;
      connection_config?: ConnectionConfig;
      entity_mappings: Record<string, EntityMapping>;
      field_mappings: Record<string, FieldMapping[]>;
      value_mappings?: Record<string, Record<string, string>>;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data: user } = await supabase.auth.getUser();

      const { data: result, error } = await (supabase as any)
        .from('migration_configs')
        .insert({
          organization_id: currentOrganization.id,
          source_system: data.source_system,
          source_version: data.source_version,
          name: data.name,
          description: data.description,
          connection_config: data.connection_config,
          entity_mappings: data.entity_mappings,
          field_mappings: data.field_mappings,
          value_mappings: data.value_mappings || {},
          created_by: user.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return result as MigrationConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-configs'] });
      toast.success('Configuración de migración creada');
    },
    onError: (error: any) => {
      toast.error('Error al crear configuración: ' + error.message);
    }
  });
}

export function useDeleteMigrationConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('migration_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-configs'] });
      toast.success('Configuración eliminada');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar: ' + error.message);
    }
  });
}

export function useMigrationJobs(configId?: string) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['migration-jobs', currentOrganization?.id, configId],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = (supabase as any)
        .from('migration_jobs')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (configId) {
        query = query.eq('migration_config_id', configId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as MigrationJob[];
    },
    enabled: !!currentOrganization?.id
  });
}

export function useCreateMigrationJob() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: { migration_config_id: string; job_type: MigrationJobType }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data: user } = await supabase.auth.getUser();

      const { data: result, error } = await (supabase as any)
        .from('migration_jobs')
        .insert({
          migration_config_id: data.migration_config_id,
          organization_id: currentOrganization.id,
          job_type: data.job_type,
          created_by: user.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return result as MigrationJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
      toast.success('Migración iniciada');
    },
    onError: (error: any) => {
      toast.error('Error al iniciar migración: ' + error.message);
    }
  });
}
