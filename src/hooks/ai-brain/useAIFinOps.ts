// ============================================================
// IP-NEXUS AI BRAIN - FINOPS HOOKS (PHASE 3)
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { AIFinOpsDashboard } from '@/types/ai-finops.types';

interface FinOpsFilters {
  startDate?: Date;
  endDate?: Date;
}

function toDateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function useAIFinOpsDashboard(filters: FinOpsFilters = {}) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['ai-finops-dashboard', currentOrganization?.id, filters.startDate?.toISOString(), filters.endDate?.toISOString()],
    enabled: !!currentOrganization?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('ai_get_finops_dashboard', {
        p_organization_id: currentOrganization!.id,
        p_start_date: filters.startDate ? toDateOnly(filters.startDate) : null,
        p_end_date: filters.endDate ? toDateOnly(filters.endDate) : null,
      });

      if (error) throw error;
      // Supabase RPC returns `Json` typed data; we trust the RPC contract.
      return data as unknown as AIFinOpsDashboard;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
