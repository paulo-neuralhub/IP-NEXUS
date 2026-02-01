import { useQuery } from '@tanstack/react-query';
import type { BackofficeVoipGlobalStats } from '@/types/voip';

/**
 * Hook to fetch global VOIP statistics
 * NOTE: View v_voip_global_stats was dropped (voip_calls table doesn't exist yet)
 * Returns null until VOIP module is implemented
 */
export function useBackofficeVoipStats() {
  return useQuery({
    queryKey: ['backoffice-voip-stats'],
    queryFn: async (): Promise<BackofficeVoipGlobalStats | null> => {
      // VOIP module not yet implemented - return null
      // When voip_calls table is created, this can query the view again
      return null;
    },
  });
}
