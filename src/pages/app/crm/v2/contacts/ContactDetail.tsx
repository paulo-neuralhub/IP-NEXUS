import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePageTitle } from "@/contexts/page-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useCRMContact } from "@/hooks/crm/v2/contacts";
import { useCRMDeals } from "@/hooks/crm/v2/deals";
import { useCRMInteractions } from "@/hooks/crm/v2/interactions";
import { useOrganization } from "@/contexts/organization-context";
import { ContactHeader360 } from "@/pages/app/crm/v2/contacts/components/ContactHeader360";
import { ContactTabs360 } from "@/pages/app/crm/v2/contacts/components/ContactTabs360";
import { ContactTimelinePanel } from "@/pages/app/crm/v2/contacts/components/ContactTimelinePanel";

type Contact = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  account_id?: string | null;
  account?: { id: string; name?: string | null } | null;
  is_lead?: boolean | null;
  lead_status?: string | null;
  lead_score?: number | null;
};

type DealRow = { id: string; name?: string | null; stage?: string | null; amount?: number | null };
type InteractionRow = { id: string; created_at?: string | null; subject?: string | null; channel?: string | null };

export default function CRMV2ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [activeTab, setActiveTab] = useState<
    "info" | "matters" | "portfolio" | "deals" | "documents" | "finance"
  >("info");

  const { data: contactData, isLoading: loadingContact } = useCRMContact(id);
  const contact = useMemo(() => (contactData as Contact | null) ?? null, [contactData]);

  const { data: dealsData, isLoading: loadingDeals } = useCRMDeals(
    contact?.account_id ? { account_id: contact.account_id } : undefined
  );
  const { data: interactionsData, isLoading: loadingInteractions } = useCRMInteractions(
    contact?.account_id ? { account_id: contact.account_id } : undefined
  );

  const deals = useMemo(() => ((dealsData ?? []) as DealRow[]).slice(0, 5), [dealsData]);
  const interactions = useMemo(() => ((interactionsData ?? []) as InteractionRow[]).slice(0, 5), [interactionsData]);

  usePageTitle(contact?.full_name || "Contacto");

  if (loadingContact) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-7 w-60" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="space-y-2">
        <p className="text-muted-foreground">Contacto no encontrado</p>
        <Button variant="link" onClick={() => navigate("/app/crm/contacts")}>Volver</Button>
      </div>
    );
  }

  const dealsForContact = (dealsData ?? []) as DealRow[];
  const pipelineValue = dealsForContact
    .filter((d) => (d as any)?.contact_id === contact.id)
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/crm/contacts")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left */}
        <div className="xl:col-span-8 space-y-6">
          <ContactHeader360
            contact={contact as any}
            stats={{
              matters: 0,
              trademarks: 0,
              patents: 0,
              pipelineValue,
            }}
          />

          <ContactTabs360
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={{
              deals: dealsForContact.filter((d) => (d as any)?.contact_id === contact.id).length,
            }}
          />
        </div>

        {/* Right */}
        <div className="xl:col-span-4">
          {currentOrganization?.id ? (
            <ContactTimelinePanel contactId={contact.id} organizationId={currentOrganization.id} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
