import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePageTitle } from "@/contexts/page-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, MessageSquareText } from "lucide-react";
import { useCRMAccount } from "@/hooks/crm/v2/accounts";
import { useClient360 } from "@/hooks/crm/v2/client360";
import { useCRMInteractions } from "@/hooks/crm/v2/interactions";

type Account = {
  id: string;
  name?: string | null;
  legal_name?: string | null;
  status?: string | null;
  tier?: string | null;
  health_score?: number | null;
  churn_risk_level?: string | null;
};

type TimelineItem = {
  id: string;
  created_at?: string | null;
  channel?: string | null;
  direction?: string | null;
  subject?: string | null;
  content?: string | null;
  contact?: { full_name?: string | null } | null;
};

export default function CRMV2AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: accountData, isLoading: loadingAccount } = useCRMAccount(id);
  const { data: client360, isLoading: loading360 } = useClient360(id);
  const { data: timelineData, isLoading: loadingTimeline } = useCRMInteractions({ account_id: id });

  const account = useMemo(() => (accountData as Account | null) ?? null, [accountData]);
  const timeline = useMemo(() => (timelineData as TimelineItem[]) ?? [], [timelineData]);

  usePageTitle(account?.name || account?.legal_name || "Cuenta");

  if (loadingAccount) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-7 w-60" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="space-y-2">
        <p className="text-muted-foreground">Cuenta no encontrada</p>
        <Button variant="link" onClick={() => navigate("/app/crm/accounts")}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/crm/accounts")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{account.name || account.legal_name || account.id}</h1>
            <p className="text-muted-foreground text-sm">{account.status ?? "—"} · {account.tier ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Client 360</CardTitle>
            </CardHeader>
            <CardContent>
              {loading360 ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Contacts</span>
                    <span className="font-medium">{(client360 as any)?.contacts?.length ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Deals</span>
                    <span className="font-medium">{(client360 as any)?.deals?.length ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Interactions</span>
                    <span className="font-medium">{(client360 as any)?.interactions?.length ?? 0}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTimeline ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin interacciones todavía.</p>
              ) : (
                <div className="space-y-4">
                  {timeline.map((t) => (
                    <div key={t.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{t.subject || t.channel || "Interacción"}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.created_at ? new Date(t.created_at).toLocaleString("es-ES") : ""}
                            {t.contact?.full_name ? ` · ${t.contact.full_name}` : ""}
                          </p>
                        </div>
                      </div>
                      {t.content ? (
                        <>
                          <Separator className="my-2" />
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t.content}</p>
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Health</span>
                <span className="font-medium">{account.health_score ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Churn risk</span>
                <span className="font-medium">{account.churn_risk_level ?? "—"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquareText className="w-4 h-4" />
                Acciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" onClick={() => navigate(`/app/crm/interactions?account=${account.id}`)}>
                Ver interacciones
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate(`/app/crm/tasks?account=${account.id}`)}>
                Ver tareas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
