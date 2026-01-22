import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";
import type { AccountFilters } from "./types";

export function useCRMAccounts(filters?: AccountFilters) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-accounts", organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = fromTable("crm_accounts")
        .select(
          `*,
           account_manager:users!account_manager_id(id, full_name, avatar_url),
           contacts_count:crm_contacts(count),
           deals_count:crm_deals(count)
          `
        )
        .eq("organization_id", organizationId)
        .order("name");

      if (filters?.status?.length) query = query.in("status", filters.status);
      if (filters?.tier?.length) query = query.in("tier", filters.tier);
      if (filters?.health_score_min !== undefined) query = query.gte("health_score", filters.health_score_min);
      if (filters?.health_score_max !== undefined) query = query.lte("health_score", filters.health_score_max);
      if (filters?.churn_risk_level?.length) query = query.in("churn_risk_level", filters.churn_risk_level);
      if (filters?.account_manager_id) query = query.eq("account_manager_id", filters.account_manager_id);
      if (filters?.tags?.length) query = query.overlaps("tags", filters.tags);
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,legal_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!organizationId,
  });
}

export function useCRMAccount(accountId: string | undefined) {
  return useQuery({
    queryKey: ["crm-account", accountId],
    queryFn: async () => {
      const { data, error } = await fromTable("crm_accounts")
        .select(`*, account_manager:users!account_manager_id(id, full_name, avatar_url, email)`)
        .eq("id", accountId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!accountId,
  });
}

export function useCreateCRMAccount() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (account: Record<string, unknown>) => {
      if (!organizationId) throw new Error("Missing organizationId");
      const { data, error } = await fromTable("crm_accounts")
        .insert({ ...account, organization_id: organizationId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-accounts"] });
      toast({ title: "Cuenta creada correctamente" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast({ title: "Error al crear cuenta", description: message, variant: "destructive" });
    },
  });
}

export function useUpdateCRMAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
      const { data, error } = await fromTable("crm_accounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const accountId = (data as { id?: string } | null)?.id;
      queryClient.invalidateQueries({ queryKey: ["crm-accounts"] });
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: ["crm-account", accountId] });
        queryClient.invalidateQueries({ queryKey: ["client-360", accountId] });
      }
      toast({ title: "Cuenta actualizada" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast({ title: "Error al actualizar", description: message, variant: "destructive" });
    },
  });
}
