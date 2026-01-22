import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable, rpcFn } from "@/lib/supabase";
import type { Json } from "@/integrations/supabase/types";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";
import type { ContactFilters } from "./types";

export function useCRMContacts(filters?: ContactFilters) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-contacts", organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = fromTable("crm_contacts")
        .select(`*, account:crm_accounts!account_id(id, name, tier)`)
        .eq("organization_id", organizationId)
        .order("lead_score", { ascending: false });

      if (filters?.account_id) query = query.eq("account_id", filters.account_id);
      if (filters?.is_lead !== undefined) query = query.eq("is_lead", filters.is_lead);
      if (filters?.lead_status?.length) query = query.in("lead_status", filters.lead_status);
      if (filters?.lead_score_min !== undefined) query = query.gte("lead_score", filters.lead_score_min);
      if (filters?.lead_score_max !== undefined) query = query.lte("lead_score", filters.lead_score_max);
      if (filters?.whatsapp_enabled !== undefined) query = query.eq("whatsapp_enabled", filters.whatsapp_enabled);
      if (filters?.portal_access_enabled !== undefined) query = query.eq("portal_access_enabled", filters.portal_access_enabled);
      if (filters?.search) query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!organizationId,
  });
}

export function useCRMContact(contactId: string | undefined) {
  return useQuery({
    queryKey: ["crm-contact", contactId],
    queryFn: async () => {
      const { data, error } = await fromTable("crm_contacts")
        .select(`*, account:crm_accounts!account_id(*)`)
        .eq("id", contactId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!contactId,
  });
}

export function useCreateCRMContact() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (contact: Record<string, unknown>) => {
      if (!organizationId) throw new Error("Missing organizationId");
      const { data, error } = await fromTable("crm_contacts")
        .insert({ ...contact, organization_id: organizationId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-contacts"] });
      toast({ title: "Contacto creado correctamente" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast({ title: "Error al crear contacto", description: message, variant: "destructive" });
    },
  });
}

export function useLogLeadEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      contactId: string;
      eventType: string;
      eventData?: Record<string, unknown>;
      eventSource?: string;
    }) => {
      const { data, error } = await rpcFn("crm_log_lead_event", {
        p_contact_id: params.contactId,
        p_event_type: params.eventType,
        // Supabase Json type expects Json-compatible values
        p_event_data: (params.eventData ?? {}) as unknown as Json,
        p_event_source: params.eventSource ?? "manual",
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm-contact", variables.contactId] });
      queryClient.invalidateQueries({ queryKey: ["crm-contacts"] });
    },
  });
}
