import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BackofficeVoipOrgSummary } from '@/types/voip';

export function useBackofficeVoipOrgs() {
  return useQuery({
    queryKey: ['backoffice-voip-orgs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_voip_billing_summary')
        .select('*')
        .order('organization_name');
      if (error) throw error;
      return (data ?? []) as BackofficeVoipOrgSummary[];
    },
  });
}
