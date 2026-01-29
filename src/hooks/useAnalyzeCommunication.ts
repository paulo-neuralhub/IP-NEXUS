/**
 * useAnalyzeCommunication - Hook for AI-powered communication analysis
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from 'sonner';

interface AnalyzeOptions {
  communicationId: string;
  force?: boolean;
}

interface AnalysisResult {
  summary: string;
  sentiment: number;
  sentiment_label: 'negative' | 'neutral' | 'positive';
  topics: string[];
  action_items: Array<{
    text: string;
    assignee_hint: 'self' | 'client' | 'other';
    due_hint: string | null;
  }>;
  urgency_score: number;
  entities: {
    people: string[];
    companies: string[];
    amounts: string[];
  };
  commitments: Array<{
    who: string;
    what: string;
    when: string | null;
  }>;
  key_dates: string[];
}

export function useAnalyzeCommunication() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();

  return useMutation({
    mutationFn: async ({ communicationId, force = false }: AnalyzeOptions): Promise<AnalysisResult> => {
      if (!organizationId) {
        throw new Error('No organization selected');
      }

      const { data, error } = await supabase.functions.invoke('analyze-communication', {
        body: {
          communication_id: communicationId,
          organization_id: organizationId,
          force,
        },
      });

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      if (data?.error) {
        if (data.code === 'AI_DISABLED') {
          throw new Error('El análisis IA no está habilitado para esta organización');
        }
        throw new Error(data.error);
      }

      return data.analysis;
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      queryClient.invalidateQueries({ queryKey: ['matter-timeline'] });
      queryClient.invalidateQueries({ queryKey: ['matter-communications'] });
    },
    onError: (error: Error) => {
      console.error('AI Analysis failed:', error);
      
      if (error.message.includes('Rate limit')) {
        toast.error('Límite de peticiones excedido. Intenta más tarde.');
      } else if (error.message.includes('credits')) {
        toast.error('Créditos de IA agotados. Contacta al administrador.');
      } else {
        toast.error(`Error en análisis: ${error.message}`);
      }
    },
  });
}

/**
 * Hook to analyze multiple communications in batch
 */
export function useBatchAnalyzeCommunications() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();

  return useMutation({
    mutationFn: async (communicationIds: string[]): Promise<{ success: number; failed: number }> => {
      if (!organizationId) {
        throw new Error('No organization selected');
      }

      let success = 0;
      let failed = 0;

      // Process in series to avoid rate limits
      for (const id of communicationIds) {
        try {
          await supabase.functions.invoke('analyze-communication', {
            body: {
              communication_id: id,
              organization_id: organizationId,
              force: false,
            },
          });
          success++;
        } catch {
          failed++;
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return { success, failed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      queryClient.invalidateQueries({ queryKey: ['matter-timeline'] });
    },
  });
}

export default useAnalyzeCommunication;
