/**
 * useCRMLead - Hook para obtener un Lead individual con todos sus datos relacionados
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromTable, supabase } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

export type CRMLeadDetail = {
  id: string;
  organization_id: string;
  title: string | null;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  company_name: string | null;
  company_tax_id: string | null;
  status: string;
  pipeline_id: string | null;
  stage_id: string | null;
  interested_in: string[];
  estimated_value: number | null;
  source: string | null;
  next_action: string | null;
  next_action_date: string | null;
  standby_until: string | null;
  standby_reason: string | null;
  converted_to_deal_id: string | null;
  converted_to_client_id: string | null;
  converted_at: string | null;
  assigned_to: string | null;
  notes: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Relations
  assigned_user?: { id: string; full_name?: string | null; avatar_url?: string | null } | null;
  pipeline?: { id: string; name: string; entity_type?: string | null } | null;
  stage?: { id: string; name: string; color: string; probability: number; is_won_stage?: boolean; is_lost_stage?: boolean } | null;
};

export function useCRMLead(leadId: string | undefined) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-lead", leadId],
    queryFn: async () => {
      if (!leadId || !organizationId) return null;

      const { data, error } = await fromTable("crm_leads")
        .select(`
          id, organization_id, title, contact_name, contact_email, contact_phone,
          company_name, company_tax_id, status, pipeline_id, stage_id,
          interested_in, estimated_value, source, next_action, next_action_date,
          standby_until, standby_reason, converted_to_deal_id, converted_to_client_id,
          converted_at, assigned_to, notes, tags, metadata, created_at, updated_at,
          assigned_user:users!assigned_to(id, full_name, avatar_url),
          pipeline:pipelines!pipeline_id(id, name, entity_type),
          stage:pipeline_stages!stage_id(id, name, color, probability, is_won_stage, is_lost_stage)
        `)
        .eq("id", leadId)
        .eq("organization_id", organizationId)
        .single();

      if (error) throw error;
      return data as CRMLeadDetail;
    },
    enabled: !!leadId && !!organizationId,
  });
}

export function useUpdateCRMLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<CRMLeadDetail, 'id'>>) => {
      const { data, error } = await fromTable("crm_leads")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm-lead", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      toast({ title: "Lead actualizado" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast({ title: "Error al actualizar lead", description: message, variant: "destructive" });
    },
  });
}
