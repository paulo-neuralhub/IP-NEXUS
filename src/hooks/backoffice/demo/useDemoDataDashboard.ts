import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/organization-context";
import { useAuth } from "@/contexts/auth-context";
import type { ChartData } from "@/types/reports";

export interface DemoDeadlineRow {
  id: string;
  title: string;
  deadline_date: string;
  deadline_type: string | null;
  priority: string | null;
  matter_id: string;
  matter_ref: string | null;
}

export interface DemoTaskRow {
  id: string;
  title: string;
  due_date: string | null;
  priority: string | null;
  status: string | null;
  matter_id: string | null;
  matter_ref: string | null;
}

export interface DemoDataDashboardData {
  kpis: {
    totalMatters: number;
    upcomingDeadlines30d: number;
    pendingInvoicesEur: number;
    activeClients: number;
  };
  charts: {
    mattersByStatus: ChartData;
    monthlyEvolution: ChartData;
    mattersByJurisdiction: ChartData;
    mattersByType: ChartData;
  };
  lists: {
    deadlines: DemoDeadlineRow[];
    tasks: DemoTaskRow[];
  };
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, months: number) {
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
}

function priorityRank(priority: string | null | undefined): number {
  switch ((priority || "").toLowerCase()) {
    case "critical":
      return 0;
    case "high":
      return 1;
    case "medium":
      return 2;
    case "low":
      return 3;
    default:
      return 9;
  }
}

function buildSingleDatasetChart(labels: string[], values: number[], label: string): ChartData {
  return {
    labels,
    datasets: [{ label, data: values }],
  };
}

export function useDemoDataDashboard() {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["backoffice-demo-data-dashboard", currentOrganization?.id, user?.id],
    enabled: !!currentOrganization?.id && !!user?.id,
    queryFn: async (): Promise<DemoDataDashboardData> => {
      const organizationId = currentOrganization?.id;
      const userId = user?.id;
      if (!organizationId || !userId) throw new Error("Missing organization/user");

      const now = new Date();
      const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const rangeStart = startOfMonth(addMonths(now, -11));
      const rangeEnd = addMonths(startOfMonth(now), 1);

      const [
        mattersCount,
        mattersRows,
        deadlinesCount,
        deadlineRows,
        invoicesRows,
        clientsCount,
        tasksRows,
      ] = await Promise.all([
        // Total expedientes
        supabase
          .from("matters")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId),

        // Para charts (status/tipo/jurisdicción + evolución mensual)
        supabase
          .from("matters")
          .select("status, type, jurisdiction_code, jurisdiction, created_at")
          .eq("organization_id", organizationId),

        // Plazos próximos 30 días (count)
        supabase
          .from("matter_deadlines")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .in("status", ["open", "pending", "in_progress"]) // tolerante a variantes
          .gte("deadline_date", now.toISOString().slice(0, 10))
          .lte("deadline_date", in30.toISOString().slice(0, 10)),

        // Lista 5 más urgentes
        supabase
          .from("matter_deadlines")
          .select(
            "id, title, deadline_date, deadline_type, priority, matter_id, matters(reference)",
          )
          .eq("organization_id", organizationId)
          .in("status", ["open", "pending", "in_progress"]) // tolerante a variantes
          .order("deadline_date", { ascending: true })
          .limit(20),

        // Facturas pendientes (sumatorio EUR)
        supabase
          .from("invoices")
          .select("total, paid_amount, currency, status")
          .eq("organization_id", organizationId),

        // Clientes activos (empresas)
        supabase
          .from("contacts")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .eq("type", "company"),

        // Tareas asignadas al usuario actual
        supabase
          .from("smart_tasks")
          .select("id, title, due_date, priority, status, matter_id, matters(reference)")
          .eq("organization_id", organizationId)
          .eq("assigned_to", userId)
          .in("status", ["pending", "in_progress"]) // solo activas
          .limit(100),
      ]);

      if (mattersCount.error) throw mattersCount.error;
      if (mattersRows.error) throw mattersRows.error;
      if (deadlinesCount.error) throw deadlinesCount.error;
      if (deadlineRows.error) throw deadlineRows.error;
      if (invoicesRows.error) throw invoicesRows.error;
      if (clientsCount.error) throw clientsCount.error;
      if (tasksRows.error) throw tasksRows.error;

      const matters = mattersRows.data || [];

      // --- KPI: facturas pendientes (EUR) ---
      const pendingInvoicesEur = (invoicesRows.data || [])
        .filter((i) => (i.currency || "EUR").toUpperCase() === "EUR")
        .filter((i) => {
          const status = (i.status || "").toLowerCase();
          return status !== "paid" && status !== "void" && status !== "cancelled";
        })
        .reduce((sum, i) => {
          const total = Number(i.total || 0);
          const paid = Number(i.paid_amount || 0);
          return sum + Math.max(0, total - paid);
        }, 0);

      // --- Charts ---
      const byStatus = new Map<string, number>();
      const byType = new Map<string, number>();
      const byJurisdiction = new Map<string, number>();
      const byMonth = new Map<string, number>();

      // init months
      for (let i = 0; i < 12; i++) {
        const m = addMonths(rangeStart, i);
        const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
        byMonth.set(key, 0);
      }

      matters.forEach((m) => {
        const status = (m.status || "sin estado").toString();
        const type = (m.type || "other").toString();
        const jurisdiction = (m.jurisdiction_code || m.jurisdiction || "—").toString();

        byStatus.set(status, (byStatus.get(status) || 0) + 1);
        byType.set(type, (byType.get(type) || 0) + 1);
        byJurisdiction.set(jurisdiction, (byJurisdiction.get(jurisdiction) || 0) + 1);

        const createdAt = m.created_at ? new Date(m.created_at) : null;
        if (createdAt && createdAt >= rangeStart && createdAt < rangeEnd) {
          const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
          byMonth.set(key, (byMonth.get(key) || 0) + 1);
        }
      });

      const statusLabels = Array.from(byStatus.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([k]) => k);
      const statusValues = statusLabels.map((k) => byStatus.get(k) || 0);

      const typeLabels = Array.from(byType.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([k]) => k);
      const typeValues = typeLabels.map((k) => byType.get(k) || 0);

      const jurisdictionLabels = Array.from(byJurisdiction.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([k]) => k);
      const jurisdictionValues = jurisdictionLabels.map((k) => byJurisdiction.get(k) || 0);

      const monthLabels = Array.from(byMonth.keys());
      const monthValues = monthLabels.map((k) => byMonth.get(k) || 0);

      // --- Lists ---
      const deadlinesRaw = (deadlineRows.data as any[]) || [];
      const deadlines: DemoDeadlineRow[] = deadlinesRaw
        .map((d: any) => ({
          id: d.id,
          title: d.title,
          deadline_date: d.deadline_date,
          deadline_type: d.deadline_type ?? null,
          priority: d.priority ?? null,
          matter_id: d.matter_id,
          matter_ref: d.matters?.reference ?? null,
        }))
        .sort((a, b) => {
          const pr = priorityRank(a.priority) - priorityRank(b.priority);
          if (pr !== 0) return pr;
          return new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime();
        })
        .slice(0, 5);

      const tasksRaw = (tasksRows.data as any[]) || [];
      const tasks: DemoTaskRow[] = tasksRaw
        .map((t: any) => ({
          id: t.id,
          title: t.title,
          due_date: t.due_date ?? null,
          priority: t.priority ?? null,
          status: t.status ?? null,
          matter_id: t.matter_id ?? null,
          matter_ref: t.matters?.reference ?? null,
        }))
        .sort((a, b) => {
          const pr = priorityRank(a.priority) - priorityRank(b.priority);
          if (pr !== 0) return pr;
          const ad = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY;
          const bd = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY;
          return ad - bd;
        })
        .slice(0, 10);

      return {
        kpis: {
          totalMatters: mattersCount.count || 0,
          upcomingDeadlines30d: deadlinesCount.count || 0,
          pendingInvoicesEur,
          activeClients: clientsCount.count || 0,
        },
        charts: {
          mattersByStatus: buildSingleDatasetChart(statusLabels, statusValues, "Expedientes"),
          monthlyEvolution: {
            labels: monthLabels,
            datasets: [{ label: "Altas", data: monthValues }],
          },
          mattersByJurisdiction: buildSingleDatasetChart(jurisdictionLabels, jurisdictionValues, "Expedientes"),
          mattersByType: buildSingleDatasetChart(typeLabels, typeValues, "Expedientes"),
        },
        lists: {
          deadlines,
          tasks,
        },
      };
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
