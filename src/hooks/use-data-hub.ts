import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { Import, ImportTemplate, DataConnector, SyncJob } from '@/types/data-hub';

// ===== IMPORTACIONES =====
export function useImports() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['imports', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imports')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as Import[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useImport(id: string) {
  return useQuery({
    queryKey: ['import', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imports')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as Import;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === 'importing' || data?.status === 'validating' ? 2000 : false;
    },
  });
}

export function useCreateImport() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: {
      file: File;
      import_type: string;
      source_type: string;
      mapping?: Record<string, any>;
      options?: Record<string, any>;
    }) => {
      // Upload file to storage
      const filePath = `imports/${currentOrganization!.id}/${Date.now()}_${data.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('matter-documents')
        .upload(filePath, data.file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('matter-documents')
        .getPublicUrl(filePath);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create import record
      const { data: importRecord, error } = await supabase
        .from('imports')
        .insert({
          organization_id: currentOrganization!.id,
          import_type: data.import_type,
          source_type: data.source_type,
          file_name: data.file.name,
          file_url: urlData.publicUrl,
          file_size: data.file.size,
          mapping: data.mapping || {},
          options: data.options || {},
          status: 'pending',
          created_by: user?.id,
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return importRecord as unknown as Import;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
    },
  });
}

export function useUpdateImport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Import>) => {
      const { data: importRecord, error } = await supabase
        .from('imports')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return importRecord as unknown as Import;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['import', id] });
      queryClient.invalidateQueries({ queryKey: ['imports'] });
    },
  });
}

export function useValidateImport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ importId, mapping }: { importId: string; mapping: Record<string, any> }) => {
      // Update mapping and status
      await supabase
        .from('imports')
        .update({ mapping, status: 'validating' } as any)
        .eq('id', importId);
      
      // Invoke validation edge function
      const { data, error } = await supabase.functions.invoke('validate-import', {
        body: { import_id: importId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { importId }) => {
      queryClient.invalidateQueries({ queryKey: ['import', importId] });
    },
  });
}

export function useExecuteImport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (importId: string) => {
      await supabase
        .from('imports')
        .update({ status: 'importing', started_at: new Date().toISOString() } as any)
        .eq('id', importId);
      
      const { data, error } = await supabase.functions.invoke('execute-import', {
        body: { import_id: importId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, importId) => {
      queryClient.invalidateQueries({ queryKey: ['import', importId] });
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      queryClient.invalidateQueries({ queryKey: ['matters'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useCancelImport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (importId: string) => {
      const { error } = await supabase
        .from('imports')
        .update({ status: 'cancelled' } as any)
        .eq('id', importId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
    },
  });
}

export function useDeleteImport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (importId: string) => {
      const { error } = await supabase
        .from('imports')
        .delete()
        .eq('id', importId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
    },
  });
}

// ===== PLANTILLAS =====
export function useImportTemplates(importType?: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['import-templates', currentOrganization?.id, importType],
    queryFn: async () => {
      let query = supabase
        .from('import_templates')
        .select('*')
        .or(`is_system.eq.true,organization_id.eq.${currentOrganization!.id}`)
        .order('is_system', { ascending: false });
      
      if (importType) query = query.eq('import_type', importType);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ImportTemplate[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useSaveTemplate() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<ImportTemplate>) => {
      const { data: template, error } = await supabase
        .from('import_templates')
        .insert({
          ...data,
          organization_id: currentOrganization!.id,
          is_system: false,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return template as unknown as ImportTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-templates'] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('import_templates')
        .delete()
        .eq('id', templateId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-templates'] });
    },
  });
}

// ===== CONECTORES =====
export function useDataConnectors() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['data-connectors', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_connectors')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as DataConnector[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useDataConnector(id: string) {
  return useQuery({
    queryKey: ['data-connector', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_connectors')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as DataConnector;
    },
    enabled: !!id,
  });
}

export function useCreateConnector() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<DataConnector>) => {
      const { data: connector, error } = await supabase
        .from('data_connectors')
        .insert({
          ...data,
          organization_id: currentOrganization!.id,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return connector as unknown as DataConnector;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-connectors'] });
    },
  });
}

export function useUpdateConnector() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<DataConnector>) => {
      const { data: connector, error } = await supabase
        .from('data_connectors')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return connector as unknown as DataConnector;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['data-connector', id] });
      queryClient.invalidateQueries({ queryKey: ['data-connectors'] });
    },
  });
}

export function useDeleteConnector() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (connectorId: string) => {
      const { error } = await supabase
        .from('data_connectors')
        .delete()
        .eq('id', connectorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-connectors'] });
    },
  });
}

export function useTestConnector() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (connectorId: string) => {
      const { data, error } = await supabase.functions.invoke('test-connector', {
        body: { connector_id: connectorId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-connectors'] });
    },
  });
}

export function useSyncConnector() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ connectorId, syncType, filters }: {
      connectorId: string;
      syncType: string;
      filters?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.functions.invoke('sync-connector', {
        body: { connector_id: connectorId, sync_type: syncType, filters },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['data-connectors'] });
    },
  });
}

// ===== SYNC JOBS =====
export function useSyncJobs(connectorId?: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['sync-jobs', currentOrganization?.id, connectorId],
    queryFn: async () => {
      let query = supabase
        .from('sync_jobs')
        .select('*, connector:data_connectors(id, name, connector_type)')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (connectorId) query = query.eq('connector_id', connectorId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SyncJob[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useSyncJob(id: string) {
  return useQuery({
    queryKey: ['sync-job', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sync_jobs')
        .select('*, connector:data_connectors(id, name, connector_type)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as SyncJob;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === 'running' ? 2000 : false;
    },
  });
}

// ===== PARSER DE ARCHIVOS =====
export function useParseFile() {
  return useMutation({
    mutationFn: async ({ file, options }: { file: File; options?: any }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (options) formData.append('options', JSON.stringify(options));
      
      const { data, error } = await supabase.functions.invoke('parse-file', {
        body: formData,
      });
      
      if (error) throw error;
      return data as {
        headers: string[];
        rows: any[][];
        total_rows: number;
        preview: any[][];
      };
    },
  });
}
