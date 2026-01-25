// ============================================================
// IP-NEXUS - DEADLINE TYPES CONFIGURATION HOOK
// Manage custom deadline types per organization
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

export interface DeadlineTypeConfig {
  id: string;
  code: string;
  name_es: string;
  name_en?: string | null;
  description?: string | null;
  category: string;
  matter_types: string[];
  is_system: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
  organization_id?: string | null;
  created_at?: string | null;
}

export interface CreateDeadlineTypeDTO {
  code: string;
  name_es: string;
  name_en?: string;
  description?: string;
  category: string;
  matter_types?: string[];
}

export const DEADLINE_CATEGORIES = [
  { value: 'filing', label: 'Presentación', color: '#8B5CF6' },
  { value: 'response', label: 'Respuesta', color: '#3B82F6' },
  { value: 'renewal', label: 'Renovación', color: '#22C55E' },
  { value: 'opposition', label: 'Oposición', color: '#EF4444' },
  { value: 'payment', label: 'Pago', color: '#F59E0B' },
  { value: 'other', label: 'Otro', color: '#6B7280' },
] as const;

// Get all deadline types
export function useDeadlineTypesConfig() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['deadline-types-config', currentOrganization?.id],
    queryFn: async () => {
      let query = supabase
        .from('deadline_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      // Include system types and org-specific types
      if (currentOrganization?.id) {
        query = query.or(`organization_id.eq.${currentOrganization.id},organization_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as DeadlineTypeConfig[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// Create custom type
export function useCreateDeadlineType() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (dto: CreateDeadlineTypeDTO) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const insertData = {
        organization_id: currentOrganization.id,
        code: dto.code.toUpperCase().replace(/\s+/g, '_'),
        name_es: dto.name_es,
        name_en: dto.name_en,
        description: dto.description,
        category: dto.category,
        matter_types: dto.matter_types || ['trademark', 'patent', 'design', 'utility_model'],
        is_system: false,
        is_active: true,
        sort_order: 100, // Custom types go after system types
      };

      const { data, error } = await supabase
        .from('deadline_types')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-types-config'] });
      queryClient.invalidateQueries({ queryKey: ['deadline-types'] });
      toast.success('Tipo de plazo creado');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Update type
export function useUpdateDeadlineType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dto }: Partial<CreateDeadlineTypeDTO> & { id: string }) => {
      const updateData: Record<string, unknown> = {};

      if (dto.code !== undefined) updateData.code = dto.code.toUpperCase().replace(/\s+/g, '_');
      if (dto.name_es !== undefined) updateData.name_es = dto.name_es;
      if (dto.name_en !== undefined) updateData.name_en = dto.name_en;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.category !== undefined) updateData.category = dto.category;
      if (dto.matter_types !== undefined) updateData.matter_types = dto.matter_types;

      const { data, error } = await supabase
        .from('deadline_types')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-types-config'] });
      queryClient.invalidateQueries({ queryKey: ['deadline-types'] });
      toast.success('Tipo actualizado');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Delete type (only custom)
export function useDeleteDeadlineType() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { error } = await supabase
        .from('deadline_types')
        .delete()
        .eq('id', id)
        .eq('organization_id', currentOrganization.id)
        .eq('is_system', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-types-config'] });
      queryClient.invalidateQueries({ queryKey: ['deadline-types'] });
      toast.success('Tipo eliminado');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}
