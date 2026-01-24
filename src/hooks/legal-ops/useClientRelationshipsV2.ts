// ============================================
// src/hooks/legal-ops/useClientRelationshipsV2.ts
// Extended client relationships with external entities
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';

export type RelatedEntityType = 'client' | 'contact' | 'agent' | 'external';

export interface ClientRelationshipV2 {
  id: string;
  client_id: string;
  related_client_id: string | null;
  related_entity_type: RelatedEntityType;
  relationship_type: string;
  relationship_label: string | null;
  role_description: string | null;
  is_primary: boolean;
  valid_from: string | null;
  valid_until: string | null;
  notes: string | null;
  external_name: string | null;
  external_email: string | null;
  external_phone: string | null;
  external_company: string | null;
  created_at: string;
  created_by: string | null;
  // Joined data
  related_client?: {
    id: string;
    name: string;
    company_name: string | null;
    client_type: string | null;
    email: string | null;
    phone: string | null;
  };
  relationship_type_info?: {
    code: string;
    name_es: string;
    name_en: string;
    category: string;
    icon: string | null;
    requires_document: boolean;
  };
}

export interface GroupedRelationshipsV2 {
  legal: ClientRelationshipV2[];
  commercial: ClientRelationshipV2[];
  ip: ClientRelationshipV2[];
  contact: ClientRelationshipV2[];
}

export function useClientRelationshipsV2(clientId: string) {
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;

  return useQuery({
    queryKey: ['client-relationships-v2', clientId],
    queryFn: async (): Promise<GroupedRelationshipsV2> => {
      if (!organizationId) throw new Error('No organization');

      // Get all relationships for this client
      const { data: outgoing, error: outError } = await supabase
        .from('client_relationships')
        .select(`
          *,
          related_client:contacts!client_relationships_related_client_id_fkey(
            id, name, company_name, client_type, email, phone
          )
        `)
        .eq('client_id', clientId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (outError) throw outError;

      // Get relationships where this client is the related one (incoming)
      const { data: incoming, error: inError } = await supabase
        .from('client_relationships')
        .select(`
          *,
          related_client:contacts!client_relationships_client_id_fkey(
            id, name, company_name, client_type, email, phone
          )
        `)
        .eq('related_client_id', clientId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (inError) throw inError;

      // Get relationship types for enrichment
      const { data: types } = await supabase
        .from('relationship_types')
        .select('code, name_es, name_en, category, icon, requires_document');

      const typeMap = new Map(types?.map(t => [t.code, t]) || []);

      // Group relationships
      const grouped: GroupedRelationshipsV2 = {
        legal: [],
        commercial: [],
        ip: [],
        contact: [],
      };

      const processRelationship = (rel: unknown, isIncoming: boolean = false) => {
        const relationship = rel as ClientRelationshipV2;
        const typeInfo = typeMap.get(relationship.relationship_type);
        
        const enriched: ClientRelationshipV2 = {
          ...relationship,
          relationship_type_info: typeInfo ? {
            code: typeInfo.code,
            name_es: typeInfo.name_es,
            name_en: typeInfo.name_en,
            category: typeInfo.category,
            icon: typeInfo.icon,
            requires_document: typeInfo.requires_document,
          } : undefined,
        };

        // Determine category
        const category = (typeInfo?.category || 'commercial') as keyof GroupedRelationshipsV2;
        
        if (grouped[category]) {
          grouped[category].push(enriched);
        } else {
          grouped.commercial.push(enriched);
        }
      };

      // Process outgoing relationships
      (outgoing || []).forEach((rel) => processRelationship(rel, false));

      // Process incoming relationships (inverse view)
      (incoming || []).forEach((rel) => processRelationship(rel, true));

      return grouped;
    },
    enabled: !!clientId && !!organizationId,
  });
}

export interface CreateRelationshipInput {
  client_id: string;
  related_entity_type: RelatedEntityType;
  related_client_id?: string;
  relationship_type: string;
  relationship_label?: string;
  role_description?: string;
  is_primary?: boolean;
  valid_from?: string;
  valid_until?: string;
  notes?: string;
  external_name?: string;
  external_email?: string;
  external_phone?: string;
  external_company?: string;
}

export function useCreateClientRelationshipV2() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const organizationId = currentOrganization?.id;

  return useMutation({
    mutationFn: async (data: CreateRelationshipInput) => {
      if (!organizationId) throw new Error('No organization');

      const insertData = {
        ...data,
        organization_id: organizationId,
        created_by: user?.id,
      };

      const { error } = await supabase
        .from('client_relationships')
        .insert(insertData);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-relationships-v2', variables.client_id] });
      queryClient.invalidateQueries({ queryKey: ['client-relationships', variables.client_id] });
      if (variables.related_client_id) {
        queryClient.invalidateQueries({ queryKey: ['client-relationships-v2', variables.related_client_id] });
        queryClient.invalidateQueries({ queryKey: ['client-relationships', variables.related_client_id] });
      }
    },
  });
}

export function useUpdateClientRelationshipV2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      relationshipId,
      clientId,
      updates,
    }: {
      relationshipId: string;
      clientId: string;
      updates: Partial<CreateRelationshipInput>;
    }) => {
      const { error } = await supabase
        .from('client_relationships')
        .update(updates)
        .eq('id', relationshipId);

      if (error) throw error;
      return clientId;
    },
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ['client-relationships-v2', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-relationships', clientId] });
    },
  });
}

export function useDeleteClientRelationshipV2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ relationshipId, clientId }: { relationshipId: string; clientId: string }) => {
      const { error } = await supabase
        .from('client_relationships')
        .delete()
        .eq('id', relationshipId);

      if (error) throw error;
      return clientId;
    },
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ['client-relationships-v2', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-relationships', clientId] });
    },
  });
}

export function useSetPrimaryRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      relationshipId,
      clientId,
    }: {
      relationshipId: string;
      clientId: string;
    }) => {
      // The trigger handles unsetting other primaries
      const { error } = await supabase
        .from('client_relationships')
        .update({ is_primary: true })
        .eq('id', relationshipId);

      if (error) throw error;
      return clientId;
    },
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ['client-relationships-v2', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-relationships', clientId] });
    },
  });
}
