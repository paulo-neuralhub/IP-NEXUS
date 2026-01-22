import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";

export type CRMLead = {
  id: string;
  organization_id: string;
  account_id?: string | null;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp_phone?: string | null;
  lead_score?: number | null;
  lead_status?: string | null;
  tags?: string[] | null;
  created_at: string;
  account?: { id: string; name?: string | null } | null;
};

export function useCRMLeads(filters?: { search?: string; status?: string | null }) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-leads", organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = fromTable("crm_contacts")
        .select("id, organization_id, account_id, full_name, email, phone, whatsapp_phone, lead_score, lead_status, tags, created_at, account:crm_accounts(id, name)")
        .eq("organization_id", organizationId)
        .eq("is_lead", true)
        .order("lead_score", { ascending: false });

      if (filters?.search) {
        const s = filters.search.trim();
        if (s) query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%`);
      }

      if (filters?.status) query = query.eq("lead_status", filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as CRMLead[];
    },
    enabled: !!organizationId,
  });
}
