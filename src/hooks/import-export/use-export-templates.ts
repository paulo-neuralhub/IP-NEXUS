import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { ExportTemplate, EntityType, TargetFormat, ExportColumn, FormatOptions } from '@/types/import-export';

export function useExportTemplates(entityType?: EntityType) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['export-templates', currentOrganization?.id, entityType],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = (supabase as any)
        .from('export_templates')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('name');

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ExportTemplate[];
    },
    enabled: !!currentOrganization?.id
  });
}

export function useExportTemplate(id: string) {
  return useQuery({
    queryKey: ['export-template', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('export_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ExportTemplate;
    },
    enabled: !!id
  });
}

export function useCreateExportTemplate() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      entity_type: EntityType;
      target_format: TargetFormat;
      columns: ExportColumn[];
      default_filters?: Record<string, any>;
      default_sort?: { field: string; direction: 'asc' | 'desc' };
      format_options?: FormatOptions;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data: user } = await supabase.auth.getUser();

      const { data: result, error } = await (supabase as any)
        .from('export_templates')
        .insert({
          organization_id: currentOrganization.id,
          name: data.name,
          description: data.description,
          entity_type: data.entity_type,
          target_format: data.target_format,
          columns: data.columns,
          default_filters: data.default_filters || {},
          default_sort: data.default_sort,
          format_options: data.format_options || {},
          created_by: user.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return result as ExportTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-templates'] });
      toast.success('Plantilla de exportación creada');
    },
    onError: (error: any) => {
      toast.error('Error al crear plantilla: ' + error.message);
    }
  });
}

export function useUpdateExportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<ExportTemplate> & { id: string }) => {
      const { data: result, error } = await (supabase as any)
        .from('export_templates')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as ExportTemplate;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['export-templates'] });
      queryClient.invalidateQueries({ queryKey: ['export-template', variables.id] });
      toast.success('Plantilla actualizada');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar: ' + error.message);
    }
  });
}

export function useDeleteExportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('export_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-templates'] });
      toast.success('Plantilla eliminada');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar: ' + error.message);
    }
  });
}
