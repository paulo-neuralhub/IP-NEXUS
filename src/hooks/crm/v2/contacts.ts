import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";

export function useCRMContacts(filters?: { account_id?: string; search?: string }) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-contacts", organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];
      let query = fromTable("crm_contacts")
        .select("id, account_id, full_name, email, is_lead, lead_score")
        .eq("organization_id", organizationId)
        .order("full_name", { ascending: true });

      if (filters?.account_id) query = query.eq("account_id", filters.account_id);
      if (filters?.search) query = query.ilike("full_name", `%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!organizationId,
  });
}

export function useCRMContact(id: string) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-contact", organizationId, id],
    queryFn: async () => {
      if (!organizationId || !id) return null;
      const { data, error } = await fromTable("crm_contacts")
        .select("*")
        .eq("id", id)
        .eq("organization_id", organizationId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId && !!id,
  });
}
