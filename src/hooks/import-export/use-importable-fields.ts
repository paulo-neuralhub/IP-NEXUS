import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ImportableField, EntityType } from '@/types/import-export';

export function useImportableFields(entityType?: EntityType) {
  return useQuery({
    queryKey: ['importable-fields', entityType],
    queryFn: async () => {
      let query = (supabase as any)
        .from('importable_fields')
        .select('*')
        .order('display_order');

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ImportableField[];
    }
  });
}

export function useImportableFieldsByEntity() {
  const { data: fields = [] } = useImportableFields();

  const fieldsByEntity = fields.reduce((acc, field) => {
    if (!acc[field.entity_type]) {
      acc[field.entity_type] = [];
    }
    acc[field.entity_type].push(field);
    return acc;
  }, {} as Record<EntityType, ImportableField[]>);

  return fieldsByEntity;
}
