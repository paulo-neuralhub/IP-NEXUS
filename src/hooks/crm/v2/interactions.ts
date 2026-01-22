import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";
import type { InteractionFilters } from "./types";

export function useCRMInteractions(filters?: InteractionFilters) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-interactions", organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];
      let query = fromTable("crm_interactions")
        .select(
          `*,
           contact:crm_contacts!contact_id(id, full_name, email, photo_url),
           account:crm_accounts!account_id(id, name),
           assigned_to_user:users!assigned_to(id, full_name, avatar_url)
          `
        )
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (filters?.account_id) query = query.eq("account_id", filters.account_id);
      if (filters?.contact_id) query = query.eq("contact_id", filters.contact_id);
      if (filters?.channel?.length) query = query.in("channel", filters.channel);
      if (filters?.direction?.length) query = query.in("direction", filters.direction);
      if (filters?.status?.length) query = query.in("status", filters.status);
      if (filters?.assigned_to) query = query.eq("assigned_to", filters.assigned_to);
      if (filters?.date_from) query = query.gte("created_at", filters.date_from);
      if (filters?.date_to) query = query.lte("created_at", filters.date_to);
      if (filters?.has_ai_draft) query = query.not("ai_suggested_response", "is", null);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!organizationId,
  });
}

export function useAccountTimeline(accountId: string | undefined, limit = 50) {
  return useQuery({
    queryKey: ["account-timeline", accountId, limit],
    queryFn: async () => {
      const { data, error } = await fromTable("crm_interactions")
        .select(`*, contact:crm_contacts!contact_id(id, full_name, photo_url)`)
        .eq("account_id", accountId!)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!accountId,
  });
}

export function useCreateInteraction() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();

  return useMutation({
    mutationFn: async (interaction: Record<string, unknown> & { account_id?: string }) => {
      if (!organizationId) throw new Error("Missing organizationId");

      const { data, error } = await fromTable("crm_interactions")
        .insert({ ...interaction, organization_id: organizationId })
        .select()
        .single();
      if (error) throw error;

      if (interaction.account_id) {
        await fromTable("crm_accounts")
          .update({ last_interaction_at: new Date().toISOString() })
          .eq("id", interaction.account_id);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crm-interactions"] });
      queryClient.invalidateQueries({ queryKey: ["account-timeline", data.account_id] });
      queryClient.invalidateQueries({ queryKey: ["client-360", data.account_id] });
    },
  });
}
