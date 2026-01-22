import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fromTable, supabase } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

type SeedAccount = {
  name: string;
  tier: string;
  status: string;
  health_score: number;
  churn_risk_level: string;
};

type SeedContact = {
  full_name: string;
  email: string;
  is_lead: boolean;
  lead_score: number;
  lead_status: string;
};

const STAGE_PROBABILITY: Record<string, number> = {
  lead_in: 10,
  contact: 20,
  needs: 35,
  proposal: 55,
  negotiation: 75,
  won: 100,
  lost: 0,
};

function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function useSeedCRMDemoData() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("Missing organizationId");

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const userId = userData.user?.id;
      if (!userId) throw new Error("Missing user");

      // 1) Accounts
      const accounts: SeedAccount[] = [
        { name: "LexNova IP", tier: "business", status: "active", health_score: 86, churn_risk_level: "low" },
        { name: "BrandForge Labs", tier: "professional", status: "active", health_score: 72, churn_risk_level: "medium" },
        { name: "Nube Retail Group", tier: "starter", status: "active", health_score: 58, churn_risk_level: "high" },
      ];

      const { data: accountRows, error: accountsError } = await fromTable("crm_accounts")
        .insert(
          accounts.map((a) => ({
            organization_id: organizationId,
            name: a.name,
            tier: a.tier,
            status: a.status,
            health_score: a.health_score,
            churn_risk_level: a.churn_risk_level,
            account_manager_id: userId,
          }))
        )
        .select("id, name");
      if (accountsError) throw accountsError;

      const typedAccountRows = (accountRows ?? []) as Array<{ id: string; name: string }>;
      const [accA, accB, accC] = typedAccountRows;
      if (!accA || !accB || !accC) throw new Error("No se pudieron crear cuentas demo");

      // 2) Contacts
      const contacts: Array<SeedContact & { account_id: string }> = [
        { account_id: accA.id, full_name: "María Gómez", email: "maria@lexnova.example", is_lead: true, lead_score: 82, lead_status: "new" },
        { account_id: accA.id, full_name: "Javier Ruiz", email: "javier@lexnova.example", is_lead: false, lead_score: 0, lead_status: "converted" },
        { account_id: accB.id, full_name: "Sofía Martín", email: "sofia@brandforge.example", is_lead: true, lead_score: 68, lead_status: "contacted" },
        { account_id: accC.id, full_name: "Diego Pérez", email: "diego@nube-retail.example", is_lead: true, lead_score: 91, lead_status: "qualified" },
      ];

      const { data: contactRows, error: contactsError } = await fromTable("crm_contacts")
        .insert(
          contacts.map((c) => ({
            organization_id: organizationId,
            account_id: c.account_id,
            full_name: c.full_name,
            email: c.email,
            is_lead: c.is_lead,
            lead_score: c.lead_score,
            lead_status: c.lead_status,
            whatsapp_enabled: true,
            portal_access_enabled: false,
          }))
        )
        .select("id, account_id, full_name");
      if (contactsError) throw contactsError;

      const contactByAccount = new Map<string, { id: string; full_name: string }>();
      const typedContactRows = (contactRows ?? []) as Array<{ id: string; account_id: string; full_name: string }>;
      typedContactRows.forEach((c) => {
        if (!contactByAccount.has(c.account_id)) contactByAccount.set(c.account_id, { id: c.id, full_name: c.full_name });
      });

      // 3) Deals (repartidos por etapas)
      const dealsSeed: Array<{ account_id: string; stage: string; amount: number; name: string; closeInDays: number }> = [
        { account_id: accA.id, stage: "lead_in", amount: 3200, name: "Registro de marca (prioridad) — LexNova", closeInDays: 25 },
        { account_id: accA.id, stage: "contact", amount: 6800, name: "Vigilancia + renovaciones — LexNova", closeInDays: 40 },
        { account_id: accB.id, stage: "needs", amount: 4900, name: "Pack PI anual — BrandForge", closeInDays: 35 },
        { account_id: accB.id, stage: "proposal", amount: 12500, name: "Proyecto EUIPO (multi-país) — BrandForge", closeInDays: 55 },
        { account_id: accC.id, stage: "negotiation", amount: 8900, name: "Oposición + estrategia — Nube Retail", closeInDays: 15 },
        { account_id: accA.id, stage: "won", amount: 2400, name: "Renovación (ejecutada) — LexNova", closeInDays: -3 },
        { account_id: accC.id, stage: "lost", amount: 4100, name: "Registro (perdido) — Nube Retail", closeInDays: -10 },
      ];

      const nowIso = new Date().toISOString();

      const { error: dealsError } = await fromTable("crm_deals").insert(
        dealsSeed.map((d) => {
          const prob = STAGE_PROBABILITY[d.stage] ?? 50;
          const weighted = Math.round((d.amount * prob) / 100);

          const contact = contactByAccount.get(d.account_id);
          return {
            organization_id: organizationId,
            account_id: d.account_id,
            contact_id: contact?.id ?? null,
            owner_id: userId,
            name: d.name,
            stage: d.stage,
            opportunity_type: "sales",
            amount: d.amount,
            weighted_amount: weighted,
            expected_close_date: addDaysISO(d.closeInDays),
            actual_close_date: d.stage === "won" || d.stage === "lost" ? addDaysISO(d.closeInDays) : null,
            stage_entered_at: nowIso,
          };
        })
      );
      if (dealsError) throw dealsError;

      // 4) Interactions (timeline)
      const interactionsSeed = [
        { account_id: accA.id, contact_id: contactByAccount.get(accA.id)?.id, channel: "email", direction: "inbound", subject: "Consulta inicial marca", daysAgo: 10 },
        { account_id: accA.id, contact_id: contactByAccount.get(accA.id)?.id, channel: "call", direction: "outbound", subject: "Seguimiento propuesta", daysAgo: 7 },
        { account_id: accB.id, contact_id: contactByAccount.get(accB.id)?.id, channel: "whatsapp", direction: "inbound", subject: "Duda renovación", daysAgo: 5 },
        { account_id: accC.id, contact_id: contactByAccount.get(accC.id)?.id, channel: "meeting", direction: "outbound", subject: "Reunión estrategia PI", daysAgo: 2 },
      ];

      const { error: interactionsError } = await fromTable("crm_interactions").insert(
        interactionsSeed.map((i) => ({
          organization_id: organizationId,
          account_id: i.account_id,
          contact_id: i.contact_id,
          channel: i.channel,
          direction: i.direction,
          subject: i.subject,
          created_at: new Date(Date.now() - i.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        }))
      );
      if (interactionsError) throw interactionsError;

      // 5) Tasks (pendientes + futuras)
      const tasksSeed = [
        { account_id: accA.id, title: "Preparar docs para registro marca", status: "pending", dueDays: 5 },
        { account_id: accB.id, title: "Follow-up propuesta multi-país", status: "in_progress", dueDays: 10 },
        { account_id: accC.id, title: "Enviar informe oposición", status: "pending", dueDays: 7 },
        { account_id: accA.id, title: "Revisar contrato renovación", status: "pending", dueDays: 15 },
      ];

      const { error: tasksError } = await fromTable("crm_tasks").insert(
        tasksSeed.map((t) => ({
          organization_id: organizationId,
          account_id: t.account_id,
          title: t.title,
          status: t.status,
          assigned_to: userId,
          due_date: addDaysISO(t.dueDays),
          created_at: nowIso,
        }))
      );
      if (tasksError) throw tasksError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-dashboard-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-summary"] });
      queryClient.invalidateQueries({ queryKey: ["crm-deals"] });
      queryClient.invalidateQueries({ queryKey: ["crm-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["crm-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["crm-interactions"] });
      queryClient.invalidateQueries({ queryKey: ["crm-tasks"] });

      toast({ title: "Datos demo completos", description: "CRM poblado: Accounts, Contacts, Deals, Interactions y Tasks." });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast({ title: "No se pudieron crear datos demo", description: message, variant: "destructive" });
    },
  });
}
