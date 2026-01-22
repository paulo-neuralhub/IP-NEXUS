import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable, rpcFn } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";
import type { DealFilters, PipelineSummary } from "./types";

export function useCRMDeals(filters?: DealFilters) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-deals", organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];
      let query = fromTable("crm_deals")
        .select(
          `*,
           account:crm_accounts!account_id(id, name, tier, health_score),
           contact:crm_contacts!contact_id(id, full_name, email),
           owner:users!owner_id(id, full_name, avatar_url)
          `
        )
        .eq("organization_id", organizationId)
        .order("expected_close_date", { ascending: true, nullsFirst: false });

      if (filters?.stage?.length) query = query.in("stage", filters.stage);
      if (filters?.owner_id) query = query.eq("owner_id", filters.owner_id);
      if (filters?.account_id) query = query.eq("account_id", filters.account_id);
      if (filters?.opportunity_type?.length) query = query.in("opportunity_type", filters.opportunity_type);
      if (filters?.amount_min !== undefined) query = query.gte("amount", filters.amount_min);
      if (filters?.amount_max !== undefined) query = query.lte("amount", filters.amount_max);
      if (filters?.expected_close_from) query = query.gte("expected_close_date", filters.expected_close_from);
      if (filters?.expected_close_to) query = query.lte("expected_close_date", filters.expected_close_to);
      if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!organizationId,
  });
}

export function usePipelineSummary() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["pipeline-summary", organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error("Missing organizationId");
      const { data, error } = await rpcFn("crm_get_pipeline_summary", { p_organization_id: organizationId });
      if (error) throw error;
      return data as unknown as PipelineSummary;
    },
    enabled: !!organizationId,
  });
}

export function useCreateCRMDeal() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (deal: Record<string, unknown>) => {
      if (!organizationId) throw new Error("Missing organizationId");
      const { data, error } = await fromTable("crm_deals")
        .insert({ ...deal, organization_id: organizationId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-deals"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-summary"] });
      toast({ title: "Oportunidad creada correctamente" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast({ title: "Error al crear oportunidad", description: message, variant: "destructive" });
    },
  });
}

export function useUpdateDealStage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      dealId: string;
      newStage: string;
      closeReason?: string;
      lostToCompetitor?: string;
    }) => {
      const { data: currentDeal, error: currentError } = await fromTable("crm_deals")
        .select("stage, stage_entered_at, stage_history")
        .eq("id", params.dealId)
        .single();
      if (currentError) throw currentError;

      const stageHistory = (currentDeal?.stage_history as unknown[] | null) ?? [];
      stageHistory.push({
        stage: currentDeal?.stage,
        entered_at: currentDeal?.stage_entered_at,
        exited_at: new Date().toISOString(),
        days_in_stage: Math.floor(
          (Date.now() - new Date((currentDeal?.stage_entered_at as string | undefined) ?? Date.now()).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      });

      const updates: Record<string, unknown> = {
        stage: params.newStage,
        stage_entered_at: new Date().toISOString(),
        stage_history: stageHistory,
      };

      if (params.newStage === "won" || params.newStage === "lost") {
        updates.actual_close_date = new Date().toISOString().split("T")[0];
        if (params.closeReason) updates.close_reason = params.closeReason;
        if (params.lostToCompetitor) updates.lost_to_competitor = params.lostToCompetitor;
      }

      const { data, error } = await fromTable("crm_deals").update(updates).eq("id", params.dealId).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-deals"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-summary"] });
      toast({ title: "Etapa actualizada" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast({ title: "Error al actualizar etapa", description: message, variant: "destructive" });
    },
  });
}
