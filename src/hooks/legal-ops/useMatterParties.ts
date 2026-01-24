// ============================================
// src/hooks/legal-ops/useMatterParties.ts
// Matter parties management with relationship import
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';

export interface PartyRole {
  id: string;
  code: string;
  name_es: string;
  name_en: string;
  category: 'ownership' | 'creation' | 'representation' | 'other';
  applies_to: string[];
  icon: string | null;
  sort_order: number;
}

export interface MatterParty {
  id: string;
  organization_id: string;
  matter_id: string;
  party_role: string;
  source_type: 'client' | 'relationship' | 'contact' | 'manual';
  source_relationship_id: string | null;
  client_id: string | null;
  contact_id: string | null;
  external_name: string | null;
  external_address: string | null;
  external_country: string | null;
  external_email: string | null;
  external_phone: string | null;
  percentage: number | null;
  is_primary: boolean;
  jurisdiction: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Joined data
  client?: {
    id: string;
    name: string;
    company_name: string | null;
    email: string | null;
  } | null;
  contact?: {
    id: string;
    name: string;
    email: string | null;
  } | null;
  role_info?: PartyRole;
  source_relationship?: {
    id: string;
    relationship_type: string;
    relationship_label: string | null;
  } | null;
}

export interface GroupedParties {
  ownership: MatterParty[];
  creation: MatterParty[];
  representation: MatterParty[];
  other: MatterParty[];
}

// Fetch party roles catalog
export function usePartyRoles(matterType?: string) {
  return useQuery({
    queryKey: ['party-roles', matterType],
    queryFn: async () => {
      let query = (supabase.from('party_roles') as any)
        .select('*')
        .order('sort_order', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;

      let roles = data as PartyRole[];
      
      // Filter by matter type if provided
      if (matterType) {
        roles = roles.filter(r => r.applies_to.includes(matterType));
      }

      return roles;
    },
  });
}

// Fetch matter parties grouped by category
export function useMatterParties(matterId: string) {
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;

  return useQuery({
    queryKey: ['matter-parties', matterId],
    queryFn: async (): Promise<GroupedParties> => {
      if (!organizationId || !matterId) throw new Error('Missing required params');

      // Get parties with joins
      const { data: parties, error } = await (supabase.from('matter_parties') as any)
        .select(`
          *,
          client:contacts!matter_parties_client_id_fkey(id, name, company_name, email),
          contact:contacts!matter_parties_contact_id_fkey(id, name, email)
        `)
        .eq('matter_id', matterId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get party roles for enrichment
      const { data: roles } = await (supabase.from('party_roles') as any)
        .select('*');

      const roleMap = new Map((roles || []).map((r: unknown) => {
        const role = r as PartyRole;
        return [role.code, role];
      }));

      // Group by category
      const grouped: GroupedParties = {
        ownership: [],
        creation: [],
        representation: [],
        other: [],
      };

      for (const party of (parties || []) as MatterParty[]) {
        const roleInfo = roleMap.get(party.party_role) as PartyRole | undefined;
        const enrichedParty: MatterParty = {
          ...party,
          role_info: roleInfo,
        };

        const category = (roleInfo?.category || 'other') as keyof GroupedParties;
        grouped[category].push(enrichedParty);
      }

      return grouped;
    },
    enabled: !!matterId && !!organizationId,
  });
}

export interface CreatePartyInput {
  matter_id: string;
  party_role: string;
  source_type: 'client' | 'relationship' | 'contact' | 'manual';
  source_relationship_id?: string;
  client_id?: string;
  contact_id?: string;
  external_name?: string;
  external_address?: string;
  external_country?: string;
  external_email?: string;
  external_phone?: string;
  percentage?: number;
  is_primary?: boolean;
  jurisdiction?: string;
  notes?: string;
}

export function useCreateMatterParty() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreatePartyInput) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { error } = await (supabase.from('matter_parties') as any)
        .insert({
          ...data,
          organization_id: currentOrganization.id,
          created_by: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-parties', variables.matter_id] });
    },
  });
}

export function useUpdateMatterParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      partyId,
      matterId,
      updates,
    }: {
      partyId: string;
      matterId: string;
      updates: Partial<CreatePartyInput>;
    }) => {
      const { error } = await (supabase.from('matter_parties') as any)
        .update(updates)
        .eq('id', partyId);

      if (error) throw error;
      return matterId;
    },
    onSuccess: (matterId) => {
      queryClient.invalidateQueries({ queryKey: ['matter-parties', matterId] });
    },
  });
}

export function useDeleteMatterParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partyId, matterId }: { partyId: string; matterId: string }) => {
      const { error } = await (supabase.from('matter_parties') as any)
        .delete()
        .eq('id', partyId);

      if (error) throw error;
      return matterId;
    },
    onSuccess: (matterId) => {
      queryClient.invalidateQueries({ queryKey: ['matter-parties', matterId] });
    },
  });
}

// Import parties from client relationships
export function useImportPartiesFromClient() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      matterId,
      clientId,
      relationshipIds,
    }: {
      matterId: string;
      clientId: string;
      relationshipIds: string[];
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      // Get the mapping table
      const { data: mappings } = await (supabase.from('relationship_to_party_mapping') as any)
        .select('*');

      const mappingByType = new Map(
        (mappings || []).map((m: { relationship_type: string; party_role: string }) => [m.relationship_type, m.party_role])
      );

      // Get selected relationships
      const { data: relationships, error: relError } = await (supabase.from('client_relationships') as any)
        .select(`
          *,
          related_client:contacts!client_relationships_related_client_id_fkey(id, name, company_name, email)
        `)
        .in('id', relationshipIds);

      if (relError) throw relError;

      // Create matter parties from relationships
      const partiesToInsert = (relationships || []).map((rel: any) => {
        const partyRole = mappingByType.get(rel.relationship_type) || 'interested_party';

        return {
          organization_id: currentOrganization.id,
          matter_id: matterId,
          party_role: partyRole,
          source_type: 'relationship',
          source_relationship_id: rel.id,
          client_id: rel.related_client_id,
          external_name: rel.external_name,
          external_email: rel.external_email,
          external_phone: rel.external_phone,
          is_primary: rel.is_primary,
          notes: rel.notes,
          created_by: user?.id,
        };
      });

      if (partiesToInsert.length > 0) {
        const { error } = await (supabase.from('matter_parties') as any)
          .insert(partiesToInsert);

        if (error) throw error;
      }

      return matterId;
    },
    onSuccess: (matterId) => {
      queryClient.invalidateQueries({ queryKey: ['matter-parties', matterId] });
    },
  });
}

// Get suggested parties based on client relationships
export function useSuggestedParties(matterId: string, clientId?: string) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['suggested-parties', matterId, clientId],
    queryFn: async () => {
      if (!currentOrganization?.id || !clientId) return [];

      // Get relationships that can be imported
      const { data: relationships, error } = await (supabase.from('client_relationships') as any)
        .select(`
          *,
          related_client:contacts!client_relationships_related_client_id_fkey(id, name, company_name, email)
        `)
        .eq('client_id', clientId)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      // Get mapping
      const { data: mappings } = await (supabase.from('relationship_to_party_mapping') as any)
        .select('*')
        .eq('auto_import', true);

      const autoImportTypes = new Set(
        (mappings || []).map((m: { relationship_type: string }) => m.relationship_type)
      );

      // Get already imported relationships
      const { data: existingParties } = await (supabase.from('matter_parties') as any)
        .select('source_relationship_id')
        .eq('matter_id', matterId)
        .not('source_relationship_id', 'is', null);

      const importedIds = new Set(
        (existingParties || []).map((p: { source_relationship_id: string }) => p.source_relationship_id)
      );

      // Filter to relevant, not-yet-imported relationships
      return (relationships || []).filter((rel: any) => 
        autoImportTypes.has(rel.relationship_type) && !importedIds.has(rel.id)
      );
    },
    enabled: !!matterId && !!clientId && !!currentOrganization?.id,
  });
}
