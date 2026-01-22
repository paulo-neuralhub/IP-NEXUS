import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

export function useCRMTasks(filters?: {
  account_id?: string;
  assigned_to?: string;
  status?: string[];
  due_date_from?: string;
  due_date_to?: string;
}) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-tasks", organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];
      let query = fromTable("crm_tasks")
        .select(
          `*,
           account:crm_accounts!account_id(id, name),
           contact:crm_contacts!contact_id(id, full_name),
           assigned_to_user:users!assigned_to(id, full_name, avatar_url)
          `
        )
        .eq("organization_id", organizationId)
        .order("due_date", { ascending: true, nullsFirst: false });

      if (filters?.account_id) query = query.eq("account_id", filters.account_id);
      if (filters?.assigned_to) query = query.eq("assigned_to", filters.assigned_to);
      if (filters?.status?.length) query = query.in("status", filters.status);
      if (filters?.due_date_from) query = query.gte("due_date", filters.due_date_from);
      if (filters?.due_date_to) query = query.lte("due_date", filters.due_date_to);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!organizationId,
  });
}

export function useCreateCRMTask() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (task: Record<string, unknown>) => {
      if (!organizationId) throw new Error("Missing organizationId");
      const { data, error } = await fromTable("crm_tasks")
        .insert({ ...task, organization_id: organizationId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-tasks"] });
      toast({ title: "Tarea creada correctamente" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast({ title: "Error al crear tarea", description: message, variant: "destructive" });
    },
  });
}

export function useCompleteCRMTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await fromTable("crm_tasks")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", taskId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-tasks"] });
      toast({ title: "Tarea completada" });
    },
  });
}
