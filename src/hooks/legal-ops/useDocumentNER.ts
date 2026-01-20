// ============================================
// src/hooks/legal-ops/useDocumentNER.ts
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { NEREntityType, DocValidityStatus } from '@/types/legal-ops';

export interface NERExtractionResult {
  document_type: string;
  document_type_confidence: number;
  entities: ExtractedEntity[];
  validity: {
    valid_from?: string;
    valid_until?: string;
    confidence: number;
  } | null;
}

export interface ExtractedEntity {
  type: NEREntityType;
  value: string;
  normalized?: string;
  confidence: number;
  page?: number;
  context?: string;
}

export function useDocumentNER(documentId: string) {
  const organizationId = useOrganizationId();
  const queryClient = useQueryClient();

  // Obtener entidades extraídas
  const entitiesQuery = useQuery({
    queryKey: ['document-entities', documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_entities')
        .select('*')
        .eq('document_id', documentId)
        .eq('organization_id', organizationId)
        .order('entity_type');

      if (error) throw error;
      return data;
    },
    enabled: !!documentId && !!organizationId
  });

  // Procesar documento con NER
  const processDocument = useMutation({
    mutationFn: async (): Promise<NERExtractionResult> => {
      const { data, error } = await supabase.functions.invoke('process-document-ner', {
        body: {
          document_id: documentId,
          organization_id: organizationId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-entities', documentId] });
      queryClient.invalidateQueries({ queryKey: ['client-documents'] });
    }
  });

  // Verificar entidad extraída
  const verifyEntity = useMutation({
    mutationFn: async ({
      entityId,
      verifiedValue
    }: {
      entityId: string;
      verifiedValue?: string;
    }) => {
      const { error } = await supabase
        .from('document_entities')
        .update({
          is_verified: true,
          verified_value: verifiedValue,
          verified_at: new Date().toISOString()
        })
        .eq('id', entityId)
        .eq('organization_id', organizationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-entities', documentId] });
    }
  });

  // Verificar vigencia del documento
  const verifyValidity = useMutation({
    mutationFn: async ({
      valid_from,
      valid_until
    }: {
      valid_from?: string;
      valid_until?: string;
    }) => {
      const validityStatus: DocValidityStatus = valid_until 
        ? calculateValidityStatus(valid_until)
        : 'valid';

      const { error } = await supabase
        .from('client_documents')
        .update({
          valid_from,
          valid_until,
          validity_verified: true,
          validity_verified_at: new Date().toISOString(),
          validity_status: validityStatus
        })
        .eq('id', documentId)
        .eq('organization_id', organizationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-documents'] });
      queryClient.invalidateQueries({ queryKey: ['client-detail'] });
    }
  });

  return {
    entities: entitiesQuery.data || [],
    isLoading: entitiesQuery.isLoading,
    processDocument,
    verifyEntity,
    verifyValidity,
    isProcessing: processDocument.isPending
  };
}

// Helper para calcular estado de vigencia
function calculateValidityStatus(validUntil: string): DocValidityStatus {
  const daysRemaining = Math.ceil(
    (new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 90) return 'expiring_soon';
  return 'valid';
}

// Hook para documentos de cliente
export function useClientDocuments(clientId: string) {
  const organizationId = useOrganizationId();

  return useQuery({
    queryKey: ['client-documents', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_documents')
        .select(`
          *,
          entities:document_entities(*)
        `)
        .eq('client_id', clientId)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clientId && !!organizationId
  });
}
