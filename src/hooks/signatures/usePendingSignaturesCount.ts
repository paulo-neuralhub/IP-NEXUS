/**
 * Hook for getting pending signatures count for sidebar badge
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

export function usePendingSignaturesCount() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['signature-pending-count', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return 0;
      
      const { count, error } = await supabase
        .from('signature_requests')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending signatures count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!currentOrganization?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
  });
}
