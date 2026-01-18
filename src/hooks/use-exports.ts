import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { Export, ExportType, ExportFormat } from '@/types/reports';
import type { Json } from '@/integrations/supabase/types';

export function useExports() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['exports', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exports')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      
      return (data || []).map(d => ({
        id: d.id,
        organization_id: d.organization_id,
        export_type: d.export_type as ExportType,
        format: d.format as ExportFormat,
        filters: d.filters as Record<string, unknown>,
        columns: (d.columns || []) as string[],
        status: d.status as Export['status'],
        file_url: d.file_url,
        file_size: d.file_size,
        record_count: d.record_count,
        error_message: d.error_message,
        completed_at: d.completed_at,
        expires_at: d.expires_at || '',
        created_at: d.created_at || '',
        created_by: d.created_by,
      })) as Export[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCreateExport() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async ({ 
      exportType, 
      format,
      filters,
      columns 
    }: {
      exportType: ExportType;
      format: ExportFormat;
      filters?: Record<string, unknown>;
      columns?: string[];
    }) => {
      // Crear registro
      const { data: exportRecord, error: createError } = await supabase
        .from('exports')
        .insert({
          organization_id: currentOrganization!.id,
          export_type: exportType,
          format,
          filters: (filters || {}) as unknown as Json,
          columns: (columns || []) as unknown as Json,
          status: 'pending',
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Llamar a edge function
      const { data, error } = await supabase.functions.invoke('create-export', {
        body: { export_id: exportRecord.id },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exports'] });
    },
  });
}

export function useDownloadExport() {
  return useMutation({
    mutationFn: async (exportId: string) => {
      const { data, error } = await supabase
        .from('exports')
        .select('file_url, format')
        .eq('id', exportId)
        .single();
      
      if (error) throw error;
      if (!data.file_url) throw new Error('Archivo no disponible');
      
      // Descargar archivo
      const response = await fetch(data.file_url);
      const blob = await response.blob();
      
      // Crear link de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export.${data.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
  });
}

export function useDeleteExport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exports')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exports'] });
    },
  });
}

// Exportación rápida sin crear registro
export function useQuickExport() {
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async ({ 
      type, 
      format,
      filters 
    }: {
      type: ExportType;
      format: 'xlsx' | 'csv';
      filters?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase.functions.invoke('quick-export', {
        body: {
          organization_id: currentOrganization!.id,
          type,
          format,
          filters,
        },
      });
      
      if (error) throw error;
      
      // Descargar directamente
      const blob = new Blob([data], { 
        type: format === 'xlsx' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
  });
}
