import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  amount?: number | null;
  isDragging?: boolean;
  onClick?: () => void;
};

function formatEUR(amount?: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

export function DealKanbanCard({ title, subtitle, amount, isDragging, onClick }: Props) {
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{title}</p>
          {subtitle ? <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p> : null}
        </div>
        <div className="text-xs text-muted-foreground shrink-0">{formatEUR(amount)}</div>
      </div>
    </button>
  );
}
