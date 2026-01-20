import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { MatterFamilyRelation, FamilyTreeNode, CreateFamilyRelationDTO } from '@/types/docket-god-mode';

export function useFamilyTree(matterId: string) {
  return useQuery({
    queryKey: ['family-tree', matterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_matter_family_tree', { matter_uuid: matterId });

      if (error) throw error;
      return data as FamilyTreeNode[];
    },
    enabled: !!matterId,
  });
}

export function useFamilyRelations(matterId: string) {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['family-relations', matterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matter_family_relations')
        .select(`
          *,
          parent_matter:matters!matter_family_relations_parent_matter_id_fkey(
            id, title, reference_number, ip_type, jurisdiction, status
          ),
          child_matter:matters!matter_family_relations_child_matter_id_fkey(
            id, title, reference_number, ip_type, jurisdiction, status
          )
        `)
        .or(`parent_matter_id.eq.${matterId},child_matter_id.eq.${matterId}`)
        .eq('organization_id', currentOrganization?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!matterId && !!currentOrganization?.id,
  });
}

export function useCreateFamilyRelation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async (dto: CreateFamilyRelationDTO) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data, error } = await supabase
        .from('matter_family_relations')
        .insert({
          ...dto,
          organization_id: currentOrganization.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, dto) => {
      queryClient.invalidateQueries({ queryKey: ['family-tree', dto.parent_matter_id] });
      queryClient.invalidateQueries({ queryKey: ['family-tree', dto.child_matter_id] });
      queryClient.invalidateQueries({ queryKey: ['family-relations'] });
      toast.success('Relación familiar creada');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useDeleteFamilyRelation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('matter_family_relations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-tree'] });
      queryClient.invalidateQueries({ queryKey: ['family-relations'] });
      toast.success('Relación eliminada');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Convert family tree data to ReactFlow nodes/edges
export function useFamilyTreeGraph(matterId: string) {
  const { data: treeData, isLoading, error } = useFamilyTree(matterId);

  const nodes = treeData?.map((node, index) => ({
    id: node.id,
    type: node.id === matterId ? 'currentMatter' : 'matter',
    position: { 
      x: node.depth * 300, 
      y: index * 100 
    },
    data: {
      label: node.title || node.reference_number || 'Sin título',
      ...node,
    },
  })) || [];

  const edges = treeData
    ?.filter((node) => node.parent_id)
    .map((node) => ({
      id: `${node.parent_id}-${node.id}`,
      source: node.parent_id!,
      target: node.id,
      label: node.relation_type.replace('_parent', ''),
      type: 'smoothstep',
      animated: node.relation_type.includes('parent'),
    })) || [];

  return { nodes, edges, isLoading, error };
}
