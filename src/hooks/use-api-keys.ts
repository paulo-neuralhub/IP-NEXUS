import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { ApiKey, ApiKeyWithSecret, ApiScope, ApiLog } from '@/types/api';

export function useApiKeys() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['api-keys', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as ApiKey[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      scopes: ApiScope[];
      allowed_ips?: string[];
      expires_at?: string;
    }): Promise<ApiKeyWithSecret> => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      // Generar API key
      const key = generateApiKey();
      const keyPrefix = key.substring(0, 8);
      const keyHash = await hashKey(key);
      
      const { data: session } = await supabase.auth.getSession();
      
      const { data: apiKey, error } = await supabase
        .from('api_keys')
        .insert({
          organization_id: currentOrganization.id,
          name: data.name,
          description: data.description,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          scopes: data.scopes,
          allowed_ips: data.allowed_ips || [],
          expires_at: data.expires_at,
          created_by: session?.session?.user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return { ...(apiKey as unknown as ApiKey), key };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API Key creada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear API Key: ${error.message}`);
    },
  });
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string; 
      data: Partial<Pick<ApiKey, 'name' | 'description' | 'scopes' | 'allowed_ips' | 'allowed_origins' | 'is_active' | 'expires_at'>>
    }) => {
      const { data: apiKey, error } = await supabase
        .from('api_keys')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return apiKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API Key actualizada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API Key revocada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API Key eliminada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useApiLogs(limit = 100) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['api-logs', currentOrganization?.id, limit],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('api_logs')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as unknown as ApiLog[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useApiKeyStats(apiKeyId: string) {
  return useQuery({
    queryKey: ['api-key-stats', apiKeyId],
    queryFn: async () => {
      // Get logs for this API key
      const { data: logs, error } = await supabase
        .from('api_logs')
        .select('status_code, created_at, response_time_ms')
        .eq('api_key_id', apiKeyId)
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (error) throw error;
      
      const totalRequests = logs?.length || 0;
      const successRequests = logs?.filter(l => l.status_code >= 200 && l.status_code < 400).length || 0;
      const errorRequests = logs?.filter(l => l.status_code >= 400).length || 0;
      const avgResponseTime = logs?.length 
        ? logs.reduce((acc, l) => acc + (l.response_time_ms || 0), 0) / logs.length 
        : 0;
      
      return {
        totalRequests,
        successRequests,
        errorRequests,
        avgResponseTime: Math.round(avgResponseTime),
        successRate: totalRequests > 0 ? (successRequests / totalRequests) * 100 : 0,
      };
    },
    enabled: !!apiKeyId,
  });
}

// Helpers
function generateApiKey(): string {
  const prefix = 'ipn_';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = prefix;
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
