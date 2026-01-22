// ============================================================
// IP-NEXUS AI BRAIN - MODEL DISCOVERY HOOK
// ============================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDiscoverAIModels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ providerId }: { providerId: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-discover-models', {
        body: { provider_id: providerId },
      });

      if (error) throw error;
      return data as { inserted: number; updated: number; provider_code: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
      toast.success(
        `Modelos sincronizados (${data.provider_code}): +${data.inserted} / ~${data.updated}`
      );
    },
    onError: (error: any) => {
      toast.error(`No se pudo sincronizar modelos: ${error?.message || 'Error desconocido'}`);
    },
  });
}
