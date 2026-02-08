import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { 
  MigrationConnection, 
  SystemType, 
  AuthType,
  MigrationAgent,
  MigrationSync,
  MigrationSyncHistory
} from '@/types/migration-advanced';

// =====================================================
// CONNECTIONS
// =====================================================

export function useMigrationConnections() {
  const { currentOrganization } = useOrganization();

  const connectionsQuery = useQuery({
    queryKey: ['migration-connections', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('migration_connections')
        .select(`
          *,
          agent:migration_agents(id, name, status, last_heartbeat)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as MigrationConnection[];
    },
    enabled: !!currentOrganization?.id
  });

  return {
    connections: connectionsQuery.data ?? [],
    isLoading: connectionsQuery.isLoading,
    error: connectionsQuery.error,
    refetch: connectionsQuery.refetch
  };
}

export function useMigrationConnection(connectionId: string | undefined) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['migration-connection', connectionId],
    queryFn: async () => {
      if (!connectionId) return null;

      const { data, error } = await supabase
        .from('migration_connections')
        .select(`
          *,
          agent:migration_agents(*)
        `)
        .eq('id', connectionId)
        .single();

      if (error) throw error;
      return data as unknown as MigrationConnection;
    },
    enabled: !!connectionId && !!currentOrganization?.id
  });
}

export function useCreateConnection() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      system_type: SystemType;
      name: string;
      description?: string;
      auth_type: AuthType;
      credentials: Record<string, any>;
      connection_config?: Record<string, any>;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization found');

      // Store credentials securely via Edge Function
      const { data: vaultResult, error: vaultError } = await supabase.functions.invoke(
        'store-migration-credentials',
        { body: { credentials: data.credentials } }
      );

      // If vault function doesn't exist yet, store config directly (temporary)
      const credentialsVaultId = vaultResult?.vault_id || null;

      const { data: connection, error } = await supabase
        .from('migration_connections')
        .insert({
          organization_id: currentOrganization.id,
          system_type: data.system_type,
          name: data.name,
          description: data.description,
          auth_type: data.auth_type,
          credentials_vault_id: credentialsVaultId,
          connection_config: {
            ...data.connection_config,
            // Temporarily store credentials in config until vault is set up
            ...(credentialsVaultId ? {} : { _temp_credentials: data.credentials })
          }
        })
        .select()
        .single();

      if (error) throw error;
      return connection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-connections'] });
      toast.success('Conexión creada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear conexión: ${error.message}`);
    }
  });
}

export function useUpdateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      name,
      description,
      status,
      connection_config
    }: { id: string; name?: string; description?: string; status?: string; connection_config?: Record<string, any> }) => {
      const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (status) updateData.status = status;
      if (connection_config) updateData.connection_config = connection_config;

      const { data: updated, error } = await supabase
        .from('migration_connections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-connections'] });
      toast.success('Conexión actualizada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('migration_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-connections'] });
      toast.success('Conexión eliminada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
}

export function useTestConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      // Update status to testing
      await supabase
        .from('migration_connections')
        .update({ status: 'testing' })
        .eq('id', connectionId);

      // Call Edge Function to test connection
      const { data, error } = await supabase.functions.invoke(
        'test-migration-connection',
        { body: { connection_id: connectionId } }
      );

      if (error) throw error;

      // Update connection with test result
      await supabase
        .from('migration_connections')
        .update({
          status: data.success ? 'connected' : 'error',
          last_test_at: new Date().toISOString(),
          last_test_result: data,
          last_successful_connection: data.success ? new Date().toISOString() : undefined,
          system_metadata: data.metadata || undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['migration-connections'] });
      if (data.success) {
        toast.success('Conexión exitosa', {
          description: data.metadata?.total_matters 
            ? `Se encontraron ${data.metadata.total_matters.toLocaleString()} expedientes`
            : 'Sistema conectado correctamente'
        });
      } else {
        toast.error('Error de conexión', {
          description: data.message
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Error al probar conexión: ${error.message}`);
    }
  });
}

// =====================================================
// AGENTS
// =====================================================

export function useMigrationAgents() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['migration-agents', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('migration_agents')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as MigrationAgent[];
    },
    enabled: !!currentOrganization?.id
  });
}

export function useCreateAgent() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      if (!currentOrganization?.id) throw new Error('No organization found');

      // Generate agent key and secret
      const agentKey = `agent_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
      const agentSecret = crypto.randomUUID().replace(/-/g, '');
      
      // Hash the secret using SHA-256 before storing
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(agentSecret));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const secretHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const { data: agent, error } = await supabase
        .from('migration_agents')
        .insert({
          organization_id: currentOrganization.id,
          name: data.name,
          agent_key: agentKey,
          agent_secret_hash: secretHash
        })
        .select()
        .single();

      if (error) throw error;
      
      // Return agent with plain secret for display (only time it's shown)
      return { ...agent, _plain_secret: agentSecret };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-agents'] });
      toast.success('Agente creado. Guarda las credenciales!');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
}

// =====================================================
// SYNCS
// =====================================================

export function useMigrationSyncs(connectionId?: string) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['migration-syncs', currentOrganization?.id, connectionId],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('migration_syncs')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (connectionId) {
        query = query.eq('connection_id', connectionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as MigrationSync[];
    },
    enabled: !!currentOrganization?.id
  });
}

export function useCreateSync() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      connection_id: string;
      name: string;
      sync_type: 'manual' | 'scheduled' | 'realtime';
      entities_config: Record<string, any>;
      schedule_cron?: string;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization found');

      const { data: sync, error } = await supabase
        .from('migration_syncs')
        .insert({
          organization_id: currentOrganization.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;
      return sync;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-syncs'] });
      toast.success('Sincronización configurada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
}

export function useRunSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (syncId: string) => {
      const { data, error } = await supabase.functions.invoke(
        'execute-migration-sync',
        { body: { sync_id: syncId } }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-syncs'] });
      toast.success('Sincronización iniciada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
}

export function useSyncHistory(syncId?: string) {
  return useQuery({
    queryKey: ['migration-sync-history', syncId],
    queryFn: async () => {
      if (!syncId) return [];

      const { data, error } = await supabase
        .from('migration_sync_history')
        .select('*')
        .eq('sync_id', syncId)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as unknown as MigrationSyncHistory[];
    },
    enabled: !!syncId
  });
}

// =====================================================
// LIVE MIGRATION
// =====================================================

export function useLiveMigration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      connectionId: string;
      projectId: string;
      entities: string[];
      options?: {
        limit?: number;
        filters?: Record<string, any>;
        includeDocuments?: boolean;
      };
    }) => {
      const { data, error } = await supabase.functions.invoke(
        'execute-live-migration',
        { body: params }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-projects'] });
      toast.success('Migración en vivo iniciada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
}
