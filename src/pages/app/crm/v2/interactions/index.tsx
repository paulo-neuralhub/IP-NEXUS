import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/contexts/page-context";
import { useCRMInteractions } from "@/hooks/crm/v2/interactions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquareText, Plus } from "lucide-react";
import { InteractionFormModal } from "@/components/features/crm/v2/InteractionFormModal";

type InteractionRow = {
  id: string;
  created_at?: string | null;
  channel?: string | null;
  direction?: string | null;
  status?: string | null;
  subject?: string | null;
  content?: string | null;
  account?: { id: string; name?: string | null } | null;
  contact?: { id: string; full_name?: string | null } | null;
};

export default function CRMV2InteractionsList() {
  usePageTitle("Interacciones");
  const [params] = useSearchParams();
  const accountId = params.get("account") ?? undefined;
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useCRMInteractions(accountId ? { account_id: accountId } : undefined);
  const rows = useMemo(() => (data ?? []) as InteractionRow[], [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Interacciones</h1>
          <p className="text-muted-foreground">Timeline de comunicaciones (email, call, whatsapp, etc.)</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="py-14 px-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <MessageSquareText className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium">Sin interacciones</p>
              <p className="text-sm text-muted-foreground">Aún no hay actividad registrada.</p>
            </div>
          ) : (
            <div className="divide-y">
              {rows.map((i) => (
                <div key={i.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{i.subject || i.channel || "Interacción"}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.created_at ? new Date(i.created_at).toLocaleString("es-ES") : ""}
                        {i.account?.name ? ` · ${i.account.name}` : ""}
                        {i.contact?.full_name ? ` · ${i.contact.full_name}` : ""}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {(i.direction || "").toUpperCase()} {i.status ? `· ${i.status}` : ""}
                    </div>
                  </div>
                  {i.content ? <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{i.content}</p> : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <InteractionFormModal open={showForm} onClose={() => setShowForm(false)} defaultAccountId={accountId} />
    </div>
  );
}
