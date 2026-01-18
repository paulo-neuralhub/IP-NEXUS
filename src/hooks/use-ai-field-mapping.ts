import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useOrganization } from '@/contexts/organization-context';

export interface FieldAnalysis {
  sourceField: string;
  sourceType: string;
  sampleValues: string[];
  suggestedMapping: {
    targetEntity: string;
    targetField: string;
    confidence: number;
    reasoning: string;
  };
  alternativeMappings: Array<{
    targetEntity: string;
    targetField: string;
    confidence: number;
  }>;
  transformationRequired: boolean;
  suggestedTransformation?: {
    type: 'value_map' | 'date_format' | 'split' | 'concatenate' | 'normalize' | 'custom';
    config: Record<string, unknown>;
  };
  warnings: string[];
}

export interface MappingAnalysisResult {
  fields: FieldAnalysis[];
  overallConfidence: number;
  unmappedFields: string[];
  potentialIssues: Array<{
    severity: 'low' | 'medium' | 'high';
    message: string;
    affectedFields: string[];
    suggestion: string;
  }>;
  estimatedMigrationTime: number; // minutos
  dataQualityScore: number; // 0-100
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: string[];
  validRecords: number;
  invalidRecords: number;
  suggestions: string[];
}

export function useAIFieldMapping() {
  return useMutation({
    mutationFn: async (params: {
      sourceSystem: string;
      sourceData: Record<string, unknown>[];
      existingMappings?: Record<string, string>;
    }): Promise<MappingAnalysisResult> => {
      const { data, error } = await supabase.functions.invoke('ai-analyze-mapping', {
        body: params
      });

      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      toast.error(`Error al analizar campos: ${error.message}`);
    }
  });
}

export function useAIValidation() {
  return useMutation({
    mutationFn: async (params: {
      data: Record<string, unknown>[];
      mapping: Record<string, string>;
      targetEntity: string;
    }): Promise<ValidationResult> => {
      const { data, error } = await supabase.functions.invoke('ai-validate-data', {
        body: params
      });

      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      toast.error(`Error en validación: ${error.message}`);
    }
  });
}

export function useLearnedMappings(sourceSystem: string) {
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (params: {
      sourceField: string;
      targetEntity: string;
      targetField: string;
      confirmed: boolean;
    }): Promise<void> => {
      if (!currentOrganization?.id) throw new Error('No organization');

      // Use RPC or simple query to avoid deeply nested types
      const table = supabase.from('migration_learned_mappings');
      
      // Check if exists with a simple query
      const selectResult = await table
        .select('id, times_used, times_confirmed, times_rejected')
        .match({
          organization_id: currentOrganization.id,
          source_system: sourceSystem,
          source_field: params.sourceField,
          target_entity: params.targetEntity,
          target_field: params.targetField
        })
        .limit(1);

      const existing = selectResult.data?.[0] as { 
        id: string; 
        times_used: number | null; 
        times_confirmed: number | null; 
        times_rejected: number | null; 
      } | undefined;

      if (existing) {
        // Update existing record
        const newTimesUsed = (existing.times_used || 0) + 1;
        const newTimesConfirmed = (existing.times_confirmed || 0) + (params.confirmed ? 1 : 0);
        const newTimesRejected = (existing.times_rejected || 0) + (params.confirmed ? 0 : 1);
        const newConfidenceScore = newTimesConfirmed / newTimesUsed;

        const { error } = await table
          .update({
            times_used: newTimesUsed,
            times_confirmed: newTimesConfirmed,
            times_rejected: newTimesRejected,
            confidence_score: newConfidenceScore
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await table
          .insert({
            organization_id: currentOrganization.id,
            source_system: sourceSystem,
            source_field: params.sourceField,
            target_entity: params.targetEntity,
            target_field: params.targetField,
            times_used: 1,
            times_confirmed: params.confirmed ? 1 : 0,
            times_rejected: params.confirmed ? 0 : 1,
            confidence_score: params.confirmed ? 0.8 : 0.2
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Silent success - this is background learning
    },
    onError: (error: Error) => {
      console.error('Error saving learned mapping:', error);
    }
  });
}

export function useGetLearnedMappings(sourceSystem: string) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['learned-mappings', currentOrganization?.id, sourceSystem],
    queryFn: async (): Promise<unknown[]> => {
      if (!currentOrganization?.id) return [];

      const table = supabase.from('migration_learned_mappings');
      const result = await table
        .select('id, source_system, source_field, target_entity, target_field, confidence_score')
        .match({
          organization_id: currentOrganization.id,
          source_system: sourceSystem
        })
        .gte('confidence_score', 0.5);

      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: !!currentOrganization?.id && !!sourceSystem
  });
}

export function useDataPreview() {
  return useMutation({
    mutationFn: async (params: {
      sourceData: Record<string, unknown>[];
      mapping: Record<string, { targetEntity: string; targetField: string; transformation?: unknown }>;
      limit?: number;
    }) => {
      const { sourceData, mapping, limit = 10 } = params;
      
      // Transform data locally for preview
      const transformedData = sourceData.slice(0, limit).map((row, index) => {
        const transformed: Record<string, Record<string, unknown>> = {};
        
        Object.entries(mapping).forEach(([sourceField, config]) => {
          if (!config.targetEntity || !config.targetField) return;
          
          if (!transformed[config.targetEntity]) {
            transformed[config.targetEntity] = {};
          }
          
          let value = row[sourceField];
          
          // Apply simple transformations
          if (config.transformation && typeof config.transformation === 'object') {
            const trans = config.transformation as { type: string; config?: Record<string, unknown> };
            if (trans.type === 'value_map' && trans.config) {
              const valueMap = trans.config as Record<string, string>;
              const stringValue = String(value).toUpperCase();
              value = valueMap[stringValue] || value;
            }
          }
          
          transformed[config.targetEntity][config.targetField] = value;
        });
        
        return { rowIndex: index + 1, ...transformed };
      });

      return { preview: transformedData, totalRows: sourceData.length };
    }
  });
}
