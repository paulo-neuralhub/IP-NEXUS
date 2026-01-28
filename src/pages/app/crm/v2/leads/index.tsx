import { useMemo, useState } from "react";
import { usePageTitle } from "@/contexts/page-context";
import { useCRMLeads } from "@/hooks/crm/v2/leads";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, UserPlus, TrendingUp, Clock, Phone, Mail, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadFormModal } from "@/components/features/crm/v2/LeadFormModal";

const STATUS_LABELS: Record<string, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  qualified: "Cualificado",
  nurturing: "Nurturing",
  converted: "Convertido",
  lost: "Perdido",
};

function LeadStatusBadge({ status }: { status?: string | null }) {
  const label = status ? (STATUS_LABELS[status] ?? status) : "—";
  const variant = status === "qualified" || status === "converted" ? "secondary" : status === "lost" ? "destructive" : "outline";
  return <Badge variant={variant as any}>{label}</Badge>;
}

function LeadScoreBadge({ score }: { score?: number | null }) {
  const s = Math.max(0, Math.min(100, Number(score ?? 0)));
  const stars = Math.max(1, Math.min(5, Math.ceil(s / 20)));

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 text-muted-foreground" aria-label={`Lead score ${s}/100`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "text-xs",
              i < stars ? "text-foreground" : "text-muted-foreground"
            )}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">{s}</span>
    </div>
  );
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default function CRMLeadsPage() {
  usePageTitle("Leads");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useCRMLeads({ search: search || undefined, status });

  const leads = useMemo(() => data ?? [], [data]);
  const total = leads.length;
  const hot = leads.filter((l) => (l.lead_score ?? 0) >= 80).length;
  const news = leads.filter((l) => (l.lead_status ?? "") === "new").length;
  const qualified = leads.filter((l) => (l.lead_status ?? "") === "qualified").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground">Gestiona tus leads y conviértelos en clientes</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setShowForm(true)}>
          <UserPlus className="w-4 h-4" />
          Nuevo Lead
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-2xl font-semibold text-foreground">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Leads calientes</div>
            <div className="text-2xl font-semibold text-foreground">{hot}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Nuevos</div>
            <div className="text-2xl font-semibold text-foreground">{news}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Cualificados</div>
            <div className="text-2xl font-semibold text-foreground">{qualified}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar leads…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["new", "contacted", "qualified", "nurturing"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? "default" : "outline"}
              onClick={() => setStatus(status === s ? null : s)}
            >
              {STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="py-14 px-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium">Sin leads</p>
              <p className="text-sm text-muted-foreground">No hay leads que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            <TooltipProvider>
              <div className="divide-y">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground shrink-0">
                      {lead.full_name?.charAt(0)?.toUpperCase() ?? "L"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground truncate">{lead.full_name}</p>
                        <LeadStatusBadge status={lead.lead_status} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-2 gap-y-1">
                        {lead.email ? (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </span>
                        ) : null}
                        {lead.account?.name ? <span>• {lead.account.name}</span> : null}
                      </div>
                    </div>

                    {/* Assigned user with tooltip */}
                    {lead.assigned_user ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={lead.assigned_user.avatar_url ?? undefined} />
                              <AvatarFallback className="text-xs">
                                {lead.assigned_user.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? <User className="w-3 h-3" />}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{lead.assigned_user.full_name ?? "Sin asignar"}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : null}

                    <div className="flex items-center justify-between md:justify-end gap-4">
                      <LeadScoreBadge score={lead.lead_score} />
                      <div className="text-xs text-muted-foreground inline-flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {timeAgo(lead.created_at)}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" disabled={!lead.phone} aria-label="Llamar">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" disabled={!lead.email} aria-label="Email">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" disabled={!lead.whatsapp_phone} aria-label="WhatsApp">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>

      <LeadFormModal open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
