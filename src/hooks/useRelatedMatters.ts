// ============================================================
// IP-NEXUS - USE RELATED MATTERS HOOK
// Hook for managing matter relationships
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  MatterRelationship, 
  RelationshipType, 
  CreateRelationshipParams,
  RelationshipStatus 
} from '@/types/relationships';

// ============================================================
// QUERY: Get all relationships for a matter
// ============================================================

export function useRelatedMatters(matterId?: string) {
  return useQuery({
    queryKey: ['matter-relationships', matterId],
    queryFn: async () => {
      if (!matterId) return [];

      const client = supabase as any;

      // Get relationships where the matter is source OR target
      const { data, error } = await client
        .from('matter_relationships')
        .select(`
          *,
          source_matter:matters!source_matter_id(id, reference, title, status, type, jurisdiction),
          target_matter:matters!target_matter_id(id, reference, title, status, type, jurisdiction)
        `)
        .or(`source_matter_id.eq.${matterId},target_matter_id.eq.${matterId}`)
        .eq('status', 'active')
        .order('relationship_type');

      if (error) throw error;
      return (data || []) as MatterRelationship[];
    },
    enabled: !!matterId,
  });
}

// ============================================================
// QUERY: Get relationships by type
// ============================================================

export function useRelationshipsByType(matterId: string, types: RelationshipType[]) {
  return useQuery({
    queryKey: ['matter-relationships', matterId, 'types', types],
    queryFn: async () => {
      const client = supabase as any;

      const { data, error } = await client
        .from('matter_relationships')
        .select(`
          *,
          source_matter:matters!source_matter_id(id, reference, title, status, type),
          target_matter:matters!target_matter_id(id, reference, title, status, type)
        `)
        .or(`source_matter_id.eq.${matterId},target_matter_id.eq.${matterId}`)
        .in('relationship_type', types)
        .eq('status', 'active');

      if (error) throw error;
      return (data || []) as MatterRelationship[];
    },
    enabled: !!matterId && types.length > 0,
  });
}

// ============================================================
// QUERY: Get family tree (hierarchical relationships)
// ============================================================

export function useFamilyTree(matterId: string) {
  return useQuery({
    queryKey: ['matter-family-tree', matterId],
    queryFn: async () => {
      const client = supabase as any;

      // Get all hierarchical relationships (parent, divisional, continuation, etc.)
      const hierarchicalTypes: RelationshipType[] = [
        'parent', 'divisional', 'continuation', 'continuation_in_part',
        'basic_mark', 'designation', 'national_phase', 'validation'
      ];

      const { data, error } = await client
        .from('matter_relationships')
        .select(`
          *,
          source_matter:matters!source_matter_id(id, reference, title, status, type, jurisdiction),
          target_matter:matters!target_matter_id(id, reference, title, status, type, jurisdiction)
        `)
        .or(`source_matter_id.eq.${matterId},target_matter_id.eq.${matterId}`)
        .in('relationship_type', hierarchicalTypes)
        .eq('status', 'active');

      if (error) throw error;
      return (data || []) as MatterRelationship[];
    },
    enabled: !!matterId,
  });
}

// ============================================================
// MUTATION: Create relationship
// ============================================================

export function useCreateRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateRelationshipParams) => {
      const { data: user } = await supabase.auth.getUser();
      const client = supabase as any;

      const { data, error } = await client
        .from('matter_relationships')
        .insert({
          source_matter_id: params.sourceMatterId,
          target_matter_id: params.targetMatterId,
          relationship_type: params.relationshipType,
          is_bidirectional: params.isBidirectional ?? false,
          relationship_date: params.relationshipDate,
          effective_from: params.effectiveFrom,
          effective_until: params.effectiveUntil,
          notes: params.notes,
          relationship_data: params.relationshipData ?? {},
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MatterRelationship;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-relationships', variables.sourceMatterId] });
      queryClient.invalidateQueries({ queryKey: ['matter-relationships', variables.targetMatterId] });
      queryClient.invalidateQueries({ queryKey: ['matter-family-tree'] });
      toast.success('Relación creada correctamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear relación: ' + error.message);
    },
  });
}

// ============================================================
// MUTATION: Update relationship
// ============================================================

interface UpdateRelationshipParams {
  id: string;
  status?: RelationshipStatus;
  notes?: string;
  relationshipData?: Record<string, unknown>;
  effectiveUntil?: string;
}

export function useUpdateRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateRelationshipParams) => {
      const client = supabase as any;

      const updateData: Record<string, unknown> = {};
      if (params.status) updateData.status = params.status;
      if (params.notes !== undefined) updateData.notes = params.notes;
      if (params.relationshipData) updateData.relationship_data = params.relationshipData;
      if (params.effectiveUntil) updateData.effective_until = params.effectiveUntil;

      const { data, error } = await client
        .from('matter_relationships')
        .update(updateData)
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return data as MatterRelationship;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-relationships'] });
      queryClient.invalidateQueries({ queryKey: ['matter-family-tree'] });
      toast.success('Relación actualizada');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar: ' + error.message);
    },
  });
}

// ============================================================
// MUTATION: Delete relationship
// ============================================================

export function useDeleteRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (relationshipId: string) => {
      const client = supabase as any;

      const { error } = await client
        .from('matter_relationships')
        .delete()
        .eq('id', relationshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-relationships'] });
      queryClient.invalidateQueries({ queryKey: ['matter-family-tree'] });
      toast.success('Relación eliminada');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar: ' + error.message);
    },
  });
}

// ============================================================
// MUTATION: Terminate relationship (soft delete)
// ============================================================

export function useTerminateRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const client = supabase as any;

      const { error } = await client
        .from('matter_relationships')
        .update({
          status: 'terminated',
          effective_until: new Date().toISOString().split('T')[0],
          notes: reason,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-relationships'] });
      toast.success('Relación terminada');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Get the related matter from a relationship (the one that's NOT the current matter)
 */
export function getRelatedMatter(
  relationship: MatterRelationship,
  currentMatterId: string
): MatterRelationship['source_matter'] | MatterRelationship['target_matter'] {
  if (relationship.source_matter_id === currentMatterId) {
    return relationship.target_matter;
  }
  return relationship.source_matter;
}

/**
 * Check if current matter is the source in the relationship
 */
export function isSource(relationship: MatterRelationship, currentMatterId: string): boolean {
  return relationship.source_matter_id === currentMatterId;
}
