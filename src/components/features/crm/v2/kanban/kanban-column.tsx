import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CRMPipelineStage } from "@/hooks/crm/v2/pipelines";
import type React from "react";

type DealLite = {
  id: string;
  name: string;
  amount?: number | null;
  account_name?: string | null;
};

type Props = {
  stage: CRMPipelineStage;
  deals: DealLite[];
  onDealClick: (dealId: string) => void;
  onAddDeal: (stageId: string) => void;
  renderDeal: (deal: DealLite) => React.ReactNode;
};

function formatEUR(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

export function KanbanColumn({ stage, deals, onDealClick, onAddDeal, renderDeal }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = deals.reduce((sum, d) => sum + (d.amount ?? 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-80 rounded-xl border bg-muted/30 p-3 transition-colors",
        isOver && "bg-primary/10"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
            <h3 className="font-medium text-foreground truncate">{stage.name}</h3>
            <span className="text-sm text-muted-foreground">{deals.length}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{stage.probability}% prob.</p>
        </div>
        <div className="text-sm font-medium text-muted-foreground">{formatEUR(total)}</div>
      </div>

      <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[120px]">
          {deals.map((d) => (
            <div key={d.id} onDoubleClick={() => onDealClick(d.id)}>
              {renderDeal(d)}
            </div>
          ))}
        </div>
      </SortableContext>

      <button
        type="button"
        onClick={() => onAddDeal(stage.id)}
        className={cn(
          "w-full mt-2 p-2 text-sm text-muted-foreground rounded-lg",
          "border border-dashed border-muted-foreground/30",
          "hover:text-primary hover:bg-background hover:border-primary transition-colors",
          "flex items-center justify-center gap-1"
        )}
      >
        <Plus className="w-4 h-4" />
        Añadir deal
      </button>
    </div>
  );
}
