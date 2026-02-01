import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BackofficeVoipOrgSummary } from '@/types/voip';

/**
 * Hook to fetch VOIP billing summary by organization
 * NOTE: View v_voip_billing_summary was dropped (voip_calls table doesn't exist yet)
 * Returns empty array until VOIP module is implemented
 */
export function useBackofficeVoipOrgs() {
  return useQuery({
    queryKey: ['backoffice-voip-orgs'],
    queryFn: async (): Promise<BackofficeVoipOrgSummary[]> => {
      // VOIP module not yet implemented - return empty array
      // When voip_calls table is created, this can query the view again
      return [];
    },
  });
}
