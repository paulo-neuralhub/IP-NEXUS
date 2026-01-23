import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BackofficeVoipGlobalStats } from '@/types/voip';

export function useBackofficeVoipStats() {
  return useQuery({
    queryKey: ['backoffice-voip-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_voip_global_stats')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as BackofficeVoipGlobalStats | null;
    },
  });
}
