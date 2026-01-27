// ============================================================
// src/hooks/use-document-extraction.ts
// Hook para extracción inteligente de documentos
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from 'sonner';

export interface ExtractedEntity {
  company_names?: string[];
  person_names?: string[];
  official_numbers?: {
    application?: string;
    registration?: string;
    publication?: string;
  };
  dates?: {
    filing?: string;
    registration?: string;
    grant?: string;
    publication?: string;
    expiry?: string;
    priority?: string;
  };
  nice_classes?: number[];
  goods_services?: string;
  mark_name?: string;
  title?: string;
  addresses?: string[];
  emails?: string[];
  phones?: string[];
  vat_numbers?: string[];
  amounts?: Array<{ value: number; currency: string; concept: string }>;
}

export interface ExtractionSuggestion {
  field: string;
  target: 'matter' | 'filing' | 'client';
  current_value: any;
  suggested_value: any;
  action: 'add' | 'update' | 'conflict' | 'confirm';
  confidence: number;
  reason: string;
  status?: 'pending' | 'applied' | 'rejected';
}

export interface DocumentExtraction {
  id: string;
  organization_id: string;
  document_id?: string;
  document_source: string;
  storage_path?: string;
  file_name?: string;
  file_type?: string;
  matter_id?: string;
  client_id?: string;
  document_type?: string;
  detected_jurisdiction?: string;
  detected_language?: string;
  confidence_score?: number;
  raw_text?: string;
  extracted_entities: ExtractedEntity;
  suggestions: ExtractionSuggestion[];
  client_data?: any;
  status: 'pending' | 'reviewed' | 'applied' | 'partial' | 'rejected';
  suggestions_applied: number;
  suggestions_rejected: number;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
  processing_time_ms?: number;
  ai_model_used?: string;
}

export interface ClientDataFromDocument {
  name?: string;
  tax_id?: string;
  address?: string;
  email?: string;
  phone?: string;
  contact_person?: string;
}

// Hook para extraer datos de un documento
export function useExtractDocument() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      documentId?: string;
      storagePath: string;
      matterId?: string;
      clientId?: string;
      documentSource?: string;
      fileName?: string;
      ocrText?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('extract-document-data', {
        body: {
          document_id: params.documentId,
          storage_path: params.storagePath,
          matter_id: params.matterId,
          client_id: params.clientId,
          organization_id: organizationId,
          document_source: params.documentSource || 'matter_documents',
          file_name: params.fileName,
          ocr_text: params.ocrText,
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data as {
        success: boolean;
        extraction_id: string;
        document_type: string;
        jurisdiction?: string;
        confidence?: number;
        suggestions_count: number;
        entities_count: number;
        client_data?: ClientDataFromDocument;
        processing_time_ms: number;
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['document-extractions'] });
      if (data.suggestions_count > 0) {
        toast.success(`Extracción completada: ${data.suggestions_count} sugerencias encontradas`);
      } else {
        toast.info('Documento analizado, sin sugerencias adicionales');
      }
    },
    onError: (error: any) => {
      console.error('Extraction error:', error);
      toast.error(`Error en extracción: ${error.message}`);
    }
  });
}

// Hook para obtener extracción por ID
export function useDocumentExtraction(extractionId: string | undefined) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['document-extraction', extractionId],
    queryFn: async () => {
      if (!extractionId) return null;
      
      const { data, error } = await supabase
        .from('document_extractions')
        .select('*')
        .eq('id', extractionId)
        .eq('organization_id', organizationId)
        .single() as any;

      if (error) throw error;
      return data as DocumentExtraction;
    },
    enabled: !!extractionId && !!organizationId
  });
}

// Hook para obtener extracciones de un expediente
export function useMatterExtractions(matterId: string | undefined) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['matter-extractions', matterId],
    queryFn: async () => {
      if (!matterId) return [];
      
      const { data, error } = await supabase
        .from('document_extractions')
        .select('*')
        .eq('matter_id', matterId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false }) as any;

      if (error) throw error;
      return data as DocumentExtraction[];
    },
    enabled: !!matterId && !!organizationId
  });
}

// Hook para aplicar una sugerencia
export function useApplySuggestion() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      extractionId: string;
      suggestion: ExtractionSuggestion;
      matterId?: string;
      filingId?: string;
      clientId?: string;
    }) => {
      const { extractionId, suggestion, matterId, filingId, clientId } = params;
      
      let targetTable = '';
      let targetId = '';
      
      switch (suggestion.target) {
        case 'matter':
          targetTable = 'matters_v2';
          targetId = matterId!;
          break;
        case 'filing':
          targetTable = 'matter_filings';
          targetId = filingId!;
          break;
        case 'client':
          targetTable = 'contacts';
          targetId = clientId!;
          break;
      }

      if (!targetId) {
        throw new Error(`No se encontró ID para ${suggestion.target}`);
      }

      // 1. Actualizar el campo en la tabla destino
      const { error: updateError } = await supabase
        .from(targetTable as any)
        .update({ [suggestion.field]: suggestion.suggested_value })
        .eq('id', targetId);

      if (updateError) throw updateError;

      // 2. Registrar en log
      await (supabase.from('extraction_suggestion_log') as any).insert({
        organization_id: organizationId,
        extraction_id: extractionId,
        field_name: suggestion.field,
        target_table: targetTable,
        target_id: targetId,
        old_value: suggestion.current_value ? String(suggestion.current_value) : null,
        new_value: String(suggestion.suggested_value),
        action: 'applied'
      });

      // 3. Actualizar status parcial (no podemos incrementar sin RPC, se hará en backend)
      // Por ahora solo marcamos que hubo cambios
      return suggestion;

      return suggestion;
    },
    onSuccess: (suggestion) => {
      queryClient.invalidateQueries({ queryKey: ['matter'] });
      queryClient.invalidateQueries({ queryKey: ['document-extraction'] });
      toast.success(`Campo "${suggestion.field}" actualizado`);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });
}

// Hook para rechazar una sugerencia
export function useRejectSuggestion() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      extractionId: string;
      suggestion: ExtractionSuggestion;
      notes?: string;
    }) => {
      const { extractionId, suggestion, notes } = params;

      // 1. Registrar en log
      await (supabase.from('extraction_suggestion_log') as any).insert({
        organization_id: organizationId,
        extraction_id: extractionId,
        field_name: suggestion.field,
        target_table: suggestion.target,
        old_value: suggestion.current_value ? String(suggestion.current_value) : null,
        new_value: String(suggestion.suggested_value),
        action: 'rejected',
        notes
      });

      // 2. Actualizar se hará cuando cierre el panel
      return suggestion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-extraction'] });
    }
  });
}

// Hook para aplicar todas las sugerencias pendientes
export function useApplyAllSuggestions() {
  const applySuggestion = useApplySuggestion();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      extraction: DocumentExtraction;
      matterId?: string;
      filingId?: string;
      clientId?: string;
    }) => {
      const { extraction, matterId, filingId, clientId } = params;
      
      const pendingSuggestions = extraction.suggestions.filter(
        s => s.action !== 'conflict' && s.action !== 'confirm'
      );

      let applied = 0;
      for (const suggestion of pendingSuggestions) {
        try {
          await applySuggestion.mutateAsync({
            extractionId: extraction.id,
            suggestion,
            matterId,
            filingId,
            clientId
          });
          applied++;
        } catch (e) {
          console.error(`Error applying suggestion ${suggestion.field}:`, e);
        }
      }

      return applied;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['matter'] });
      queryClient.invalidateQueries({ queryKey: ['document-extraction'] });
      toast.success(`${count} campos actualizados`);
    }
  });
}
