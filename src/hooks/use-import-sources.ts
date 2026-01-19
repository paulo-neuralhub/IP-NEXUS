import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { ImportSource, SourceType, SourceConfig } from '@/types/universal-import';

export function useImportSources() {
  const { currentOrganization } = useOrganization();

  const { data: sources = [], isLoading, error, refetch } = useQuery({
    queryKey: ['import-sources', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('import_sources')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ImportSource[];
    },
    enabled: !!currentOrganization?.id
  });

  return {
    sources,
    isLoading,
    error,
    refetch,
    activeSources: sources.filter(s => s.status === 'active'),
    errorSources: sources.filter(s => s.status === 'error')
  };
}

export function useImportSource(id: string) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['import-source', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('import_sources')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as ImportSource;
    },
    enabled: !!id && !!currentOrganization?.id
  });
}

export function useCreateImportSource() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      source_type: SourceType;
      detected_system?: string;
      config: SourceConfig;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data: result, error } = await supabase
        .from('import_sources')
        .insert({
          organization_id: currentOrganization.id,
          name: data.name,
          description: data.description,
          source_type: data.source_type,
          detected_system: data.detected_system,
          config: data.config as any,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return result as unknown as ImportSource;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-sources'] });
      toast.success('Fuente de importación creada');
    },
    onError: (error) => {
      toast.error('Error al crear fuente: ' + error.message);
    }
  });
}

export function useUpdateImportSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; name?: string; description?: string; config?: any; status?: string }) => {
      const { data: result, error } = await supabase
        .from('import_sources')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as unknown as ImportSource;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['import-sources'] });
      queryClient.invalidateQueries({ queryKey: ['import-source', variables.id] });
      toast.success('Fuente actualizada');
    },
    onError: (error) => {
      toast.error('Error al actualizar fuente: ' + error.message);
    }
  });
}

export function useDeleteImportSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('import_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-sources'] });
      toast.success('Fuente eliminada');
    },
    onError: (error) => {
      toast.error('Error al eliminar fuente: ' + error.message);
    }
  });
}

export function useTestImportSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Update status to testing
      await supabase
        .from('import_sources')
        .update({ status: 'testing' })
        .eq('id', id);

      // Call edge function to test connection
      const { data, error } = await supabase.functions.invoke('test-import-source', {
        body: { source_id: id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['import-sources'] });
      queryClient.invalidateQueries({ queryKey: ['import-source', id] });
      
      if (data.success) {
        toast.success('Conexión exitosa');
      } else {
        toast.error('Error de conexión: ' + data.message);
      }
    },
    onError: (error) => {
      toast.error('Error al probar conexión: ' + error.message);
    }
  });
}
