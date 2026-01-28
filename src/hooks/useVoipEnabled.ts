/**
 * Hook to check if VoIP is globally enabled in the platform
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VoipGlobalConfig {
  voip_enabled: boolean;
}

export function useVoipEnabled() {
  return useQuery({
    queryKey: ['voip-global-enabled'],
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from('telephony_config')
        .select('voip_enabled')
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching VoIP config:', error);
        return false;
      }
      
      return data?.voip_enabled ?? false;
    },
    staleTime: 30 * 1000, // Cache for 30 seconds - quick refresh for VoIP availability
    refetchOnMount: true,
  });
}
