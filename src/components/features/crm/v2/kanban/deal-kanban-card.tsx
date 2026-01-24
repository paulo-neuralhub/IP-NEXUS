import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Building2, Calendar, Mail, Paperclip, Phone, User } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  amount?: number | null;
  probability?: number;
  expectedCloseDate?: string | null;
  ownerName?: string | null;
  daysInStage?: number | null;
  staleLevel?: "none" | "warn" | "danger";
  isHot?: boolean;
  emailCount?: number;
  callCount?: number;
  attachmentCount?: number;
  isDragging?: boolean;
  onClick?: () => void;
};

function formatEUR(amount?: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

export function DealKanbanCard({
  title,
  subtitle,
  amount,
  probability,
  expectedCloseDate,
  ownerName,
  daysInStage,
  staleLevel,
  isHot,
  emailCount,
  callCount,
  attachmentCount,
  isDragging,
  onClick,
}: Props) {
  const showDays = typeof daysInStage === "number";
  const pct = Math.max(0, Math.min(100, probability ?? 0));
  const staleLabel = showDays ? `${daysInStage ?? 0}d` : undefined;

  const staleClass =
    staleLevel === "danger" ? "text-destructive" : staleLevel === "warn" ? "text-foreground" : "text-muted-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border bg-background p-3 shadow-sm transition",
        "hover:shadow-md hover:border-border",
        isDragging && "opacity-80"
      )}
    >
      {/* Row 1: account + amount */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{subtitle ?? "—"}</p>
          <p className="text-sm text-muted-foreground truncate mt-0.5">{title}</p>
        </div>
        <div className="text-xs text-muted-foreground shrink-0">{formatEUR(amount)}</div>
      </div>

      {/* Row 2: progress */}
      <div className="mt-3 flex items-center gap-2">
        <Progress value={pct} className="h-2" />
        <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
      </div>

      {/* Row 3: indicators */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5" />
          <span className="truncate max-w-[160px]">{subtitle ?? "—"}</span>
        </span>

        {isHot ? (
          <span className="inline-flex items-center gap-1 text-foreground">
            <span aria-hidden>🔥</span>
            Hot
          </span>
        ) : null}

        {expectedCloseDate ? (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {expectedCloseDate}
          </span>
        ) : null}

        {staleLabel ? (
          <span className={cn("inline-flex items-center gap-1", staleClass)}>
            <span aria-hidden>⚠️</span>
            {staleLabel}
          </span>
        ) : null}
      </div>

      {/* Row 4: owner + counts */}
      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <div className="min-w-0 text-muted-foreground inline-flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          <span className="truncate">{ownerName ?? "—"}</span>
        </div>

        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="inline-flex items-center gap-1" title="Emails">
            <Mail className="h-3.5 w-3.5" />
            {emailCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1" title="Llamadas">
            <Phone className="h-3.5 w-3.5" />
            {callCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1" title="Adjuntos">
            <Paperclip className="h-3.5 w-3.5" />
            {attachmentCount ?? 0}
          </span>
        </div>
      </div>
    </button>
  );
}
