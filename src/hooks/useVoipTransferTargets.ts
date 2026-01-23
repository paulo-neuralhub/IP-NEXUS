import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

export type VoipTransferUser = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
};

export function useVoipTransferTargets() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['voip-transfer-users', currentOrganization?.id],
    enabled: !!currentOrganization?.id,
    queryFn: async () => {
      if (!currentOrganization?.id) return [] as VoipTransferUser[];

      const { data, error } = await supabase
        .from('memberships')
        .select('user_id, users:user_id(full_name, phone)')
        .eq('organization_id', currentOrganization.id);
      if (error) throw error;

      return (data ?? []).map((r: any) => ({
        user_id: r.user_id as string,
        full_name: r.users?.full_name ?? null,
        phone: r.users?.phone ?? null,
      })) as VoipTransferUser[];
    },
  });
}
