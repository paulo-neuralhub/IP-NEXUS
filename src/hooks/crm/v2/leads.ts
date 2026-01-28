import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromTable, supabase } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

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
  assigned_to?: string | null;
  assigned_user?: { id: string; full_name?: string | null; avatar_url?: string | null } | null;
  account?: { id: string; name?: string | null } | null;
};

export function useCRMLeads(filters?: { search?: string; status?: string | null }) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-leads", organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = fromTable("crm_contacts")
        .select(`
          id, organization_id, account_id, full_name, email, phone, whatsapp_phone, 
          lead_score, lead_status, tags, created_at, assigned_to,
          assigned_user:users!assigned_to(id, full_name, avatar_url),
          account:crm_accounts(id, name)
        `)
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

export function useCreateCRMLead() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lead: Record<string, unknown>) => {
      if (!organizationId) throw new Error("Missing organizationId");
      
      // Get current user for default assignment
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await fromTable("crm_contacts")
        .insert({ 
          ...lead, 
          organization_id: organizationId,
          is_lead: true,
          lead_status: lead.lead_status ?? "new",
          assigned_to: lead.assigned_to || user?.id, // Default to current user
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      toast({ title: "Lead creado" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast({ title: "Error al crear lead", description: message, variant: "destructive" });
    },
  });
}
