import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";
import type { CRMDashboardKPIs } from "./types";

export function useCRMDashboardKPIs() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-dashboard-kpis", organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error("Missing organizationId");

      const [accountsResult, contactsResult, dealsResult, interactionsResult, tasksResult, aiResult] = await Promise.all([
        fromTable("crm_accounts").select("id, status, health_score, churn_risk_level").eq("organization_id", organizationId),
        fromTable("crm_contacts").select("id, is_lead, lead_score, lead_status").eq("organization_id", organizationId),
        fromTable("crm_deals")
          .select("id, stage, amount, weighted_amount, expected_close_date, actual_close_date, created_at")
          .eq("organization_id", organizationId),
        fromTable("crm_interactions")
          .select("id, created_at")
          .eq("organization_id", organizationId)
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        fromTable("crm_tasks").select("id, status").eq("organization_id", organizationId).eq("status", "pending"),
        fromTable("crm_ai_learning_logs")
          .select("id, human_action")
          .eq("organization_id", organizationId)
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      if (accountsResult.error) throw accountsResult.error;
      if (contactsResult.error) throw contactsResult.error;
      if (dealsResult.error) throw dealsResult.error;
      if (interactionsResult.error) throw interactionsResult.error;
      if (tasksResult.error) throw tasksResult.error;
      if (aiResult.error) throw aiResult.error;

      const accounts = accountsResult.data ?? [];
      const contacts = contactsResult.data ?? [];
      const deals = dealsResult.data ?? [];
      const interactions = interactionsResult.data ?? [];
      const tasks = tasksResult.data ?? [];
      const aiLogs = aiResult.data ?? [];

      const activeDeals = deals.filter((d) => !["won", "lost"].includes(d.stage));
      const wonDeals = deals.filter((d) => d.stage === "won");
      const closedDeals = deals.filter((d) => ["won", "lost"].includes(d.stage));
      const hotLeads = contacts.filter((c) => c.is_lead && (c.lead_score ?? 0) >= 75);
      const convertedLeads = contacts.filter((c) => c.lead_status === "converted");
      const totalLeads = contacts.filter((c) => c.is_lead);
      const aiAccepted = aiLogs.filter((l) => l.human_action === "accepted");

      const today = new Date().toISOString().split("T")[0];
      const interactionsToday = interactions.filter((i) => String(i.created_at).startsWith(today));

      const monthStart = new Date();
      monthStart.setDate(1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const dealsClosingThisMonth = activeDeals.filter((d) =>
        d.expected_close_date
          ? d.expected_close_date >= monthStart.toISOString().split("T")[0] && d.expected_close_date < monthEnd.toISOString().split("T")[0]
          : false
      );

      const kpis: CRMDashboardKPIs = {
        total_accounts: accounts.length,
        active_accounts: accounts.filter((a) => a.status === "active").length,
        at_risk_accounts: accounts.filter((a) => a.churn_risk_level === "high" || a.churn_risk_level === "critical").length,
        avg_health_score:
          accounts.length > 0
            ? Math.round(accounts.reduce((sum, a) => sum + (a.health_score ?? 0), 0) / accounts.length)
            : 0,

        total_contacts: contacts.length,
        total_leads: totalLeads.length,
        hot_leads: hotLeads.length,
        lead_conversion_rate: totalLeads.length > 0 ? Math.round((convertedLeads.length / totalLeads.length) * 100) : 0,

        total_pipeline_value: activeDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0),
        weighted_pipeline_value: activeDeals.reduce((sum, d) => sum + (d.weighted_amount ?? 0), 0),
        deals_closing_this_month: dealsClosingThisMonth.length,
        avg_deal_cycle_days: 30,
        win_rate: closedDeals.length > 0 ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0,

        interactions_today: interactionsToday.length,
        interactions_this_week: interactions.length,
        avg_response_time_hours: 4,
        pending_tasks: tasks.length,

        ai_drafts_accepted_rate: aiLogs.length > 0 ? Math.round((aiAccepted.length / aiLogs.length) * 100) : 0,
        nba_completion_rate: 0,
      };

      return kpis;
    },
    enabled: !!organizationId,
    refetchInterval: 5 * 60 * 1000,
  });
}
