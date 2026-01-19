import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { ImportTemplate, EntityType, SourceFormat, DuplicateHandling, ImportConfig, FieldMapping, ValidationRule } from '@/types/import-export';

export function useImportTemplates(entityType?: EntityType) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['import-templates', currentOrganization?.id, entityType],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = (supabase as any)
        .from('import_templates')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('name');

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ImportTemplate[];
    },
    enabled: !!currentOrganization?.id
  });
}

export function useImportTemplate(id: string) {
  return useQuery({
    queryKey: ['import-template', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('import_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ImportTemplate;
    },
    enabled: !!id
  });
}

export function useCreateImportTemplate() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      entity_type: EntityType;
      source_format: SourceFormat;
      config: ImportConfig;
      field_mappings: FieldMapping[];
      validation_rules?: ValidationRule[];
      duplicate_handling?: DuplicateHandling;
      duplicate_check_fields?: string[];
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data: user } = await supabase.auth.getUser();

      const { data: result, error } = await (supabase as any)
        .from('import_templates')
        .insert({
          organization_id: currentOrganization.id,
          name: data.name,
          description: data.description,
          entity_type: data.entity_type,
          source_format: data.source_format,
          config: data.config,
          field_mappings: data.field_mappings,
          validation_rules: data.validation_rules || [],
          duplicate_handling: data.duplicate_handling || 'skip',
          duplicate_check_fields: data.duplicate_check_fields || [],
          created_by: user.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return result as ImportTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-templates'] });
      toast.success('Plantilla de importación creada');
    },
    onError: (error: any) => {
      toast.error('Error al crear plantilla: ' + error.message);
    }
  });
}

export function useUpdateImportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<ImportTemplate> & { id: string }) => {
      const { data: result, error } = await (supabase as any)
        .from('import_templates')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as ImportTemplate;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['import-templates'] });
      queryClient.invalidateQueries({ queryKey: ['import-template', variables.id] });
      toast.success('Plantilla actualizada');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar: ' + error.message);
    }
  });
}

export function useDeleteImportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('import_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-templates'] });
      toast.success('Plantilla eliminada');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar: ' + error.message);
    }
  });
}
