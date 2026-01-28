import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

export function useCRMInteractions(filters?: { account_id?: string; contact_id?: string; deal_id?: string }) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-interactions", organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];
      let query = fromTable("crm_interactions")
        .select(`
          *, 
          account:crm_accounts!account_id(id, name), 
          contact:crm_contacts!contact_id(id, full_name),
          created_by_user:users!assigned_to(id, full_name)
        `)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (filters?.account_id) query = query.eq("account_id", filters.account_id);
      if (filters?.contact_id) query = query.eq("contact_id", filters.contact_id);

      const { data, error } = await query;
      if (error) throw error;
      // Map created_by_user to created_by_name for the UI
      return (data ?? []).map((row: Record<string, unknown>) => ({
        ...row,
        created_by_name: (row.created_by_user as { full_name?: string } | null)?.full_name,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateCRMInteraction() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (interaction: Record<string, unknown>) => {
      if (!organizationId) throw new Error("Missing organizationId");
      const { data, error } = await fromTable("crm_interactions")
        .insert({ ...interaction, organization_id: organizationId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-interactions"] });
      queryClient.invalidateQueries({ queryKey: ["crm-dashboard-kpis"] });
      toast({ title: "Interacción creada" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast({ title: "Error al crear interacción", description: message, variant: "destructive" });
    },
  });
}
