import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AlertPriority = "low" | "medium" | "high" | "critical";
export type AlertStatus = "active" | "acknowledged" | "in_progress" | "resolved" | "dismissed";

export function useActiveBackofficeAlerts(params?: { priority?: AlertPriority; limit?: number }) {
  return useQuery({
    queryKey: ["backoffice-active-alerts", params],
    queryFn: async () => {
      // Query spider_alerts directly (v_active_alerts view uses security_invoker now)
      let q = supabase
        .from("spider_alerts")
        .select("*")
        .in("status", ["new", "in_review", "pending"])
        .order("created_at", { ascending: false })
        .limit(params?.limit ?? 50);

      if (params?.priority) q = q.eq("severity", params.priority);

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30_000,
  });
}

export function useActiveBackofficeAlertsCount() {
  return useQuery({
    queryKey: ["backoffice-active-alerts-count"],
    queryFn: async () => {
      // Query spider_alerts directly
      const { count, error } = await supabase
        .from("spider_alerts")
        .select("id", { count: "exact", head: true })
        .in("status", ["new", "in_review", "pending"]);
      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 30_000,
  });
}

export function useAlertActions() {
  const qc = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AlertStatus }) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id ?? null;

      const patch: Record<string, unknown> = { status };
      if (status === "acknowledged") {
        patch.acknowledged_by = userId;
        patch.acknowledged_at = new Date().toISOString();
      }
      if (status === "resolved") {
        patch.resolved_by = userId;
        patch.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase.from("system_alerts").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["backoffice-active-alerts"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Error actualizando alerta");
    },
  });

  return {
    acknowledge: (id: string) => updateStatus.mutate({ id, status: "acknowledged" }),
    inProgress: (id: string) => updateStatus.mutate({ id, status: "in_progress" }),
    resolve: (id: string) => updateStatus.mutate({ id, status: "resolved" }),
    dismiss: (id: string) => updateStatus.mutate({ id, status: "dismissed" }),
    isUpdating: updateStatus.isPending,
  };
}
