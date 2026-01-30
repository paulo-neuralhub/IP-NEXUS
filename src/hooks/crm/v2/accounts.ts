import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromTable, supabase } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

export function useCRMAccounts(filters?: { search?: string; limit?: number }) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-accounts", organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];
      let query = fromTable("crm_accounts")
        .select(`
          id, name, legal_name, 
          tax_id, client_token,
          status, tier, health_score, 
          rating_stars, tags,
          last_interaction_at,
          created_at, updated_at,
          assigned_to,
          assigned_user:users!assigned_to(id, full_name, avatar_url),
          client_type:client_type_config(id, name, color),
          payment_classification:payment_classification_config(id, name, color, alert_level)
        `)
        .eq("organization_id", organizationId)
        .order("name", { ascending: true });

      // Search by name OR tax_id (NIF/CIF)
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,tax_id.ilike.%${filters.search}%,legal_name.ilike.%${filters.search}%`);
      }

      // Limit results for performance
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!organizationId,
    staleTime: 1000 * 30, // Cache 30s for combobox performance
  });
}

export function useCRMAccount(id: string) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-account", organizationId, id],
    queryFn: async () => {
      if (!organizationId || !id) return null;
      const { data, error } = await fromTable("crm_accounts")
        .select(`
          *,
          assigned_user:users!assigned_to(id, full_name, avatar_url),
          client_type:client_type_config(id, name, color),
          payment_classification:payment_classification_config(id, name, color, alert_level)
        `)
        .eq("id", id)
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId && !!id,
  });
}

export function useCreateCRMAccount() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (account: Record<string, unknown>) => {
      if (!organizationId) throw new Error("Missing organizationId");
      
      // Get current user for default assignment
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await fromTable("crm_accounts")
        .insert({ 
          ...account, 
          organization_id: organizationId,
          assigned_to: account.assigned_to || user?.id, // Default to current user
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-accounts"] });
      toast({ title: "Cuenta creada" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast({ title: "Error al crear cuenta", description: message, variant: "destructive" });
    },
  });
}
