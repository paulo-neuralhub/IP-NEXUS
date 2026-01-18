import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { BlockchainTimestamp, ResourceType, BlockchainType } from '@/types/advanced';

export function useBlockchainTimestamps(resourceType?: ResourceType, resourceId?: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['blockchain-timestamps', currentOrganization?.id, resourceType, resourceId],
    queryFn: async () => {
      let query = supabase
        .from('blockchain_timestamps')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });
      
      if (resourceType) query = query.eq('resource_type', resourceType);
      if (resourceId) query = query.eq('resource_id', resourceId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as BlockchainTimestamp[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useBlockchainTimestamp(id: string) {
  return useQuery({
    queryKey: ['blockchain-timestamp', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blockchain_timestamps')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as BlockchainTimestamp;
    },
    enabled: !!id,
  });
}

export function useCreateTimestamp() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: {
      file: File;
      resourceType: ResourceType;
      resourceId?: string;
      metadata?: Record<string, unknown>;
      blockchain?: BlockchainType;
    }) => {
      // Calcular hash del archivo
      const fileHash = await calculateFileHash(data.file);
      
      // Subir archivo a storage
      const filePath = `timestamps/${currentOrganization!.id}/${Date.now()}_${data.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, data.file);
      
      if (uploadError) throw uploadError;
      
      // Crear registro
      const contentHash = await calculateContentHash(fileHash, data.metadata || {});
      
      const { data: timestamp, error } = await supabase
        .from('blockchain_timestamps')
        .insert({
          organization_id: currentOrganization!.id,
          resource_type: data.resourceType,
          resource_id: data.resourceId,
          file_name: data.file.name,
          file_hash: fileHash,
          file_size: data.file.size,
          content_hash: contentHash,
          metadata: data.metadata || {},
          blockchain: data.blockchain || 'polygon',
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      
      // Enviar a blockchain
      await supabase.functions.invoke('submit-timestamp', {
        body: { timestamp_id: timestamp.id },
      });
      
      return timestamp as unknown as BlockchainTimestamp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockchain-timestamps'] });
    },
  });
}

export function useVerifyTimestamp() {
  return useMutation({
    mutationFn: async (data: { file: File; timestampId: string }) => {
      const fileHash = await calculateFileHash(data.file);
      
      const { data: timestamp, error } = await supabase
        .from('blockchain_timestamps')
        .select('*')
        .eq('id', data.timestampId)
        .single();
      
      if (error) throw error;
      
      const isValid = timestamp.file_hash === fileHash;
      
      return {
        isValid,
        timestamp: timestamp as unknown as BlockchainTimestamp,
        providedHash: fileHash,
        storedHash: timestamp.file_hash,
      };
    },
  });
}

export function useDownloadCertificate() {
  return useMutation({
    mutationFn: async (timestampId: string) => {
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: { timestamp_id: timestampId },
      });
      
      if (error) throw error;
      return data;
    },
  });
}

// Helpers
async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function calculateContentHash(fileHash: string, metadata: Record<string, unknown>): Promise<string> {
  const content = JSON.stringify({ fileHash, metadata, timestamp: Date.now() });
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
