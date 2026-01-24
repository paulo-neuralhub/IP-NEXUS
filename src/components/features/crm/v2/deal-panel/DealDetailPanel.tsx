import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Edit2, Mail, Phone, Trash2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TimelineItem } from "@/components/ui/timeline-item";
import { cn } from "@/lib/utils";
import { useUpdateCRMDeal, useDeleteCRMDeal } from "@/hooks/crm/v2/deals";
import { useCreateCRMInteraction, useCRMInteractions } from "@/hooks/crm/v2/interactions";
import type { CRMPipelineStage } from "@/hooks/crm/v2/pipelines";
import { DealTasksSection } from "./DealTasksSection";
import { QuickActivityDialog } from "./QuickActivityDialog";
import { StageBadge } from "./StageBadge";

type Deal = {
  id: string;
  name?: string | null;
  stage?: string | null;
  stage_id?: string | null;
  amount?: number | null;
  probability?: number | null;
  expected_close_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  account?: { id: string; name?: string | null } | null;
  contact?: { id: string; full_name?: string | null; email?: string | null; phone?: string | null } | null;
  owner?: { id: string; full_name?: string | null } | null;
};

function formatEUR(amount?: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

export function DealDetailPanel({
  deal,
  open,
  onClose,
  stages,
  onEdit,
}: {
  deal: Deal | null;
  open: boolean;
  onClose: () => void;
  stages: CRMPipelineStage[];
  onEdit: (dealId: string) => void;
}) {
  const updateDeal = useUpdateCRMDeal();
  const deleteDeal = useDeleteCRMDeal();
  const createInteraction = useCreateCRMInteraction();

  const [titleDraft, setTitleDraft] = useState("");
  const [amountDraft, setAmountDraft] = useState<string>("");
  const [probDraft, setProbDraft] = useState<string>("");

  const [activityType, setActivityType] = useState<"email" | "call" | "meeting" | "note" | null>(null);

  const stage = useMemo(() => stages.find((s) => s.id === deal?.stage_id) ?? null, [stages, deal?.stage_id]);

  const { data: interactions = [] } = useCRMInteractions({
    // Filtramos por dealId via metadata (ver hook).
    deal_id: deal?.id ?? undefined,
  });

  const top5 = useMemo(() => (interactions ?? []).slice(0, 5), [interactions]);

  const phoneHref = deal?.contact?.phone ? `tel:${deal.contact.phone}` : undefined;
  const mailHref = deal?.contact?.email ? `mailto:${deal.contact.email}` : undefined;

  function syncDraftsFromDeal(d: Deal | null) {
    setTitleDraft(d?.name ?? "");
    setAmountDraft(d?.amount != null ? String(d.amount) : "");
    setProbDraft(d?.probability != null ? String(d.probability) : "");
  }

  // Keep drafts in sync when opening / switching deals.
  useEffect(() => {
    if (open) syncDraftsFromDeal(deal);
  }, [deal?.id, open]);

  async function commitInline(fields: Partial<Pick<Deal, "name" | "amount" | "probability">>) {
    if (!deal) return;
    await updateDeal.mutateAsync({ id: deal.id, data: fields as any });
  }

  if (!deal) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => (v ? null : onClose())}>
      <SheetContent className="sm:max-w-[560px] overflow-y-auto p-0">
        {/* HEADER */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={() => {
                  if ((deal.name ?? "") !== titleDraft.trim()) commitInline({ name: titleDraft.trim() || null });
                }}
                className="text-lg font-semibold"
              />

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StageBadge label={deal.stage ?? stage?.name ?? "—"} stage={stage} />
                {deal.expected_close_date ? (
                  <span className="text-xs text-muted-foreground">Cierre: {deal.expected_close_date}</span>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onEdit(deal.id)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" disabled title="Próximamente">
                Convertir a Expediente
              </Button>
              <Button
                variant="outline"
                className="text-destructive"
                onClick={async () => {
                  await deleteDeal.mutateAsync(deal.id);
                  onClose();
                }}
                disabled={deleteDeal.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Valor</p>
              <Input
                value={amountDraft}
                onChange={(e) => setAmountDraft(e.target.value)}
                onBlur={() => {
                  const parsed = amountDraft.trim() ? Number(amountDraft) : null;
                  if (Number.isNaN(parsed as any)) return;
                  if ((deal.amount ?? null) !== (parsed as any)) commitInline({ amount: parsed as any });
                }}
                placeholder={formatEUR(deal.amount)}
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Probabilidad (%)</p>
              <Input
                value={probDraft}
                onChange={(e) => setProbDraft(e.target.value)}
                onBlur={() => {
                  const parsed = probDraft.trim() ? Number(probDraft) : null;
                  if (Number.isNaN(parsed as any)) return;
                  const clamped = parsed == null ? null : Math.max(0, Math.min(100, parsed));
                  if ((deal.probability ?? null) !== clamped) commitInline({ probability: clamped as any });
                }}
                placeholder={deal.probability != null ? String(deal.probability) : "—"}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* CLIENTE */}
        <div className="p-5 space-y-3">
          <p className="text-sm font-medium text-foreground">Cliente</p>
          <div className="rounded-lg border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {deal.account?.id ? (
                  <Link
                    to={`/app/crm/v2/accounts/${deal.account.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {deal.account?.name ?? "Cuenta"}
                  </Link>
                ) : (
                  <p className="font-medium text-foreground">{deal.account?.name ?? "Sin cuenta"}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {deal.contact?.full_name ?? "Sin contacto principal"}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" asChild disabled={!phoneHref}>
                  <a href={phoneHref} aria-label="Llamar">
                    <Phone className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild disabled={!mailHref}>
                  <a href={mailHref} aria-label="Email">
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* TIMELINE (mini) */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Timeline</p>
            <Button variant="link" asChild className="h-auto p-0">
              <Link to={`/app/crm/v2/deals/${deal.id}`}>Ver todo</Link>
            </Button>
          </div>

          {top5.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
          ) : (
            <div className="space-y-2">
              {top5.map((i: any) => (
                <TimelineItem
                  key={i.id}
                  type={(i.channel ?? "note") as any}
                  title={i.subject ?? "Interacción"}
                  description={i.content ?? undefined}
                  time={i.created_at}
                  user={i.assigned_to?.full_name ? { name: i.assigned_to.full_name } : undefined}
                />
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* ACTIVIDADES RÁPIDAS */}
        <div className="p-5 space-y-3">
          <p className="text-sm font-medium text-foreground">Actividades rápidas</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setActivityType("email")}>+ Email</Button>
            <Button variant="outline" onClick={() => setActivityType("call")}>+ Llamada</Button>
            <Button variant="outline" onClick={() => setActivityType("meeting")}>+ Reunión</Button>
            <Button variant="outline" onClick={() => setActivityType("note")}>+ Nota</Button>
          </div>
        </div>

        <Separator />

        {/* TAREAS */}
        <div className="p-5">
          <DealTasksSection dealId={deal.id} />
        </div>

        <Separator />

        {/* ARCHIVOS (placeholder) */}
        <div className="p-5 space-y-2">
          <p className="text-sm font-medium text-foreground">Archivos</p>
          <div className={cn("rounded-lg border bg-background p-4 text-sm text-muted-foreground")}> 
            Dropzone (placeholder): upload drag & drop se activará cuando configuremos Storage.
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 pt-0 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          <span>Creado: {deal.created_at ?? "—"}</span>
          <span>Actualizado: {deal.updated_at ?? "—"}</span>
          <span>Asignado: {deal.owner?.full_name ?? "—"}</span>
        </div>

        <QuickActivityDialog
          open={activityType !== null}
          onOpenChange={(v) => setActivityType(v ? activityType : null)}
          title={
            activityType === "email"
              ? "Nuevo email"
              : activityType === "call"
                ? "Nueva llamada"
                : activityType === "meeting"
                  ? "Nueva reunión"
                  : "Nueva nota"
          }
          submitLabel="Registrar"
          onSubmit={async ({ subject, content }) => {
            const channel = activityType ?? "note";
            await createInteraction.mutateAsync({
              channel,
              subject,
              content,
              account_id: deal.account?.id ?? null,
              contact_id: deal.contact?.id ?? null,
              metadata: { deal_id: deal.id },
            });
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
