/**
 * useCRMDeal - Hook para obtener un Deal individual con todos sus datos relacionados
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromTable, supabase } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

export type CRMDealDetail = {
  id: string;
  organization_id: string;
  name: string;
  stage: string | null;
  stage_id: string | null;
  pipeline_id: string | null;
  amount: number | null;
  currency: string;
  weighted_amount: number | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  probability: number | null;
  won: boolean | null;
  lost_reason: string | null;
  close_reason: string | null;
  lost_to_competitor: string | null;
  description: string | null;
  notes: string | null;
  opportunity_type: string | null;
  source: string | null;
  next_step: string | null;
  next_step_date: string | null;
  stage_entered_at: string | null;
  stage_history: unknown[];
  tags: string[];
  account_id: string | null;
  contact_id: string | null;
  owner_id: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  account?: { id: string; name?: string | null; tier?: string | null; email?: string | null } | null;
  contact?: { id: string; full_name?: string | null; email?: string | null; phone?: string | null } | null;
  owner?: { id: string; full_name?: string | null; avatar_url?: string | null } | null;
  assigned_user?: { id: string; full_name?: string | null; avatar_url?: string | null } | null;
  pipeline?: { id: string; name: string; entity_type?: string | null } | null;
  stage_info?: { id: string; name: string; color: string; probability: number; is_won_stage?: boolean; is_lost_stage?: boolean } | null;
};

export function useCRMDeal(dealId: string | undefined) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-deal", dealId],
    queryFn: async () => {
      if (!dealId || !organizationId) return null;

      const { data, error } = await fromTable("crm_deals")
        .select(`
          id, organization_id, name, stage, stage_id, pipeline_id,
          amount, currency, weighted_amount, expected_close_date, actual_close_date,
          probability, won, lost_reason, close_reason, lost_to_competitor,
          description, notes, opportunity_type, source, next_step, next_step_date,
          stage_entered_at, stage_history, tags, account_id, contact_id, owner_id,
          assigned_to, created_at, updated_at,
          account:crm_accounts!account_id(id, name, tier, email),
          contact:crm_contacts!contact_id(id, full_name, email, phone),
          owner:users!owner_id(id, full_name, avatar_url),
          assigned_user:users!assigned_to(id, full_name, avatar_url),
          pipeline:pipelines!pipeline_id(id, name, entity_type),
          stage_info:pipeline_stages!stage_id(id, name, color, probability, is_won_stage, is_lost_stage)
        `)
        .eq("id", dealId)
        .eq("organization_id", organizationId)
        .single();

      if (error) throw error;
      return data as CRMDealDetail;
    },
    enabled: !!dealId && !!organizationId,
  });
}

export function useUpdateCRMDealDetail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<CRMDealDetail, 'id'>>) => {
      const { data, error } = await fromTable("crm_deals")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm-deal", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["crm-deals"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-summary"] });
      toast({ title: "Deal actualizado" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast({ title: "Error al actualizar deal", description: message, variant: "destructive" });
    },
  });
}
