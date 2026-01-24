// ============================================
// src/hooks/legal-ops/useClientRelationships.ts
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

// Tipos de relación disponibles
export const RELATIONSHIP_TYPES = {
  representative: { label: 'Representante legal', icon: 'user-check', inverse: 'represented_by' },
  agent: { label: 'Agente PI', icon: 'shield', inverse: 'represented_by' },
  partner: { label: 'Socio', icon: 'users', inverse: 'partner' },
  subsidiary: { label: 'Filial', icon: 'git-branch', inverse: 'parent_company' },
  parent_company: { label: 'Empresa matriz', icon: 'building', inverse: 'subsidiary' },
  licensee: { label: 'Licenciatario', icon: 'key', inverse: 'licensor' },
  licensor: { label: 'Licenciante', icon: 'award', inverse: 'licensee' },
  contact: { label: 'Contacto', icon: 'user', inverse: 'contact_of' },
  referral: { label: 'Referido por', icon: 'share-2', inverse: 'referred' },
  other: { label: 'Otro', icon: 'link', inverse: 'other' },
} as const;

export type RelationshipType = keyof typeof RELATIONSHIP_TYPES;

export interface ClientRelationship {
  id: string;
  client_id: string;
  related_client_id: string;
  relationship_type: RelationshipType;
  relationship_label: string | null;
  is_primary: boolean;
  valid_from: string | null;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
  // Datos del cliente relacionado (join)
  related_client?: {
    id: string;
    name: string;
    company_name: string | null;
    client_type: string | null;
    email: string | null;
    phone: string | null;
    is_billing_contact: boolean | null;
    is_primary_contact: boolean | null;
  };
}

export interface GroupedRelationships {
  represents: ClientRelationship[];        // Este cliente representa a otros
  representedBy: ClientRelationship[];     // Otros representan a este cliente
  corporateGroup: ClientRelationship[];    // Relaciones matriz/filial
  contacts: ClientRelationship[];          // Contactos de este cliente
  licensing: ClientRelationship[];         // Relaciones de licencia
  other: ClientRelationship[];             // Otras relaciones
}

// Hook principal para obtener relaciones de un cliente
export function useClientRelationships(clientId: string) {
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;

  return useQuery({
    queryKey: ['client-relationships', clientId],
    queryFn: async (): Promise<GroupedRelationships> => {
      if (!organizationId) throw new Error('No organization');

      // Obtener relaciones donde este cliente es el principal
      const { data: outgoing, error: outError } = await supabase
        .from('client_relationships')
        .select(`
          *,
          related_client:contacts!client_relationships_related_client_id_fkey(
            id, name, company_name, client_type, email, phone, is_billing_contact, is_primary_contact
          )
        `)
        .eq('client_id', clientId)
        .eq('organization_id', organizationId);

      if (outError) throw outError;

      // Obtener relaciones donde este cliente es el relacionado
      const { data: incoming, error: inError } = await supabase
        .from('client_relationships')
        .select(`
          *,
          related_client:contacts!client_relationships_client_id_fkey(
            id, name, company_name, client_type, email, phone, is_billing_contact, is_primary_contact
          )
        `)
        .eq('related_client_id', clientId)
        .eq('organization_id', organizationId);

      if (inError) throw inError;

      // Agrupar relaciones
      const grouped: GroupedRelationships = {
        represents: [],
        representedBy: [],
        corporateGroup: [],
        contacts: [],
        licensing: [],
        other: [],
      };

      // Procesar relaciones salientes (este cliente → otro)
      (outgoing || []).forEach((rel) => {
        const relationship = rel as unknown as ClientRelationship;
        switch (relationship.relationship_type) {
          case 'representative':
          case 'agent':
            grouped.represents.push(relationship);
            break;
          case 'subsidiary':
          case 'parent_company':
            grouped.corporateGroup.push(relationship);
            break;
          case 'contact':
            grouped.contacts.push(relationship);
            break;
          case 'licensee':
          case 'licensor':
            grouped.licensing.push(relationship);
            break;
          default:
            grouped.other.push(relationship);
        }
      });

      // Procesar relaciones entrantes (otro → este cliente)
      (incoming || []).forEach((rel) => {
        const relationship = rel as unknown as ClientRelationship;
        switch (relationship.relationship_type) {
          case 'representative':
          case 'agent':
            grouped.representedBy.push(relationship);
            break;
          case 'subsidiary':
          case 'parent_company':
            // Añadir al grupo corporativo también (inverso)
            grouped.corporateGroup.push({
              ...relationship,
              // Marcar como relación inversa
              relationship_type: relationship.relationship_type === 'subsidiary' 
                ? 'parent_company' 
                : 'subsidiary',
            });
            break;
          case 'contact':
            // Este cliente es contacto de otro
            grouped.other.push(relationship);
            break;
          case 'licensee':
          case 'licensor':
            grouped.licensing.push({
              ...relationship,
              relationship_type: relationship.relationship_type === 'licensee' 
                ? 'licensor' 
                : 'licensee',
            });
            break;
          default:
            grouped.other.push(relationship);
        }
      });

      return grouped;
    },
    enabled: !!clientId && !!organizationId
  });
}

// Hook para crear una nueva relación
export function useCreateClientRelationship() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;

  return useMutation({
    mutationFn: async (data: {
      client_id: string;
      related_client_id: string;
      relationship_type: RelationshipType;
      relationship_label?: string;
      is_primary?: boolean;
      valid_from?: string;
      valid_until?: string;
      notes?: string;
    }) => {
      if (!organizationId) throw new Error('No organization');

      const { error } = await supabase
        .from('client_relationships')
        .insert({
          ...data,
          organization_id: organizationId,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-relationships', variables.client_id] });
      queryClient.invalidateQueries({ queryKey: ['client-relationships', variables.related_client_id] });
    }
  });
}

// Hook para eliminar una relación
export function useDeleteClientRelationship() {
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
      queryClient.invalidateQueries({ queryKey: ['client-relationships', clientId] });
    }
  });
}

// Hook para actualizar una relación
export function useUpdateClientRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      relationshipId, 
      clientId,
      updates 
    }: { 
      relationshipId: string; 
      clientId: string;
      updates: Partial<{
        relationship_label: string;
        is_primary: boolean;
        valid_from: string;
        valid_until: string;
        notes: string;
      }>;
    }) => {
      const { error } = await supabase
        .from('client_relationships')
        .update(updates)
        .eq('id', relationshipId);

      if (error) throw error;
      return clientId;
    },
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ['client-relationships', clientId] });
    }
  });
}

// Hook para buscar clientes (para el selector)
export function useSearchClients(query: string, excludeId?: string) {
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;

  return useQuery({
    queryKey: ['search-clients', query, excludeId],
    queryFn: async () => {
      if (!organizationId || query.length < 2) return [];

      let queryBuilder = supabase
        .from('contacts')
        .select('id, name, company_name, client_type, email')
        .eq('organization_id', organizationId)
        .or(`name.ilike.%${query}%,company_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (excludeId) {
        queryBuilder = queryBuilder.neq('id', excludeId);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return data || [];
    },
    enabled: !!organizationId && query.length >= 2
  });
}
