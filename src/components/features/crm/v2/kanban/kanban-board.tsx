import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import type { CRMPipeline, CRMPipelineStage } from "@/hooks/crm/v2/pipelines";
import { useUpdateDealStage } from "@/hooks/crm/v2/deals";
import { KanbanColumn } from "./kanban-column";
import { DealKanbanCard } from "./deal-kanban-card";

import type React from "react";

type DealRow = {
  id: string;
  name: string;
  amount?: number | null;
  stage_id?: string | null;
  stage_entered_at?: string | null;
  account?: { id: string; name?: string | null } | null;
};

function SortableDeal({ deal, onClick }: { deal: DealRow; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DealKanbanCard
        title={deal.name}
        subtitle={deal.account?.name ?? undefined}
        amount={deal.amount}
        probability={undefined}
        expectedCloseDate={null}
        ownerName={null}
        daysInStage={
          deal.stage_entered_at
            ? Math.floor((Date.now() - new Date(deal.stage_entered_at).getTime()) / (1000 * 60 * 60 * 24))
            : undefined
        }
        staleLevel={
          deal.stage_entered_at
            ? (() => {
                const days = Math.floor((Date.now() - new Date(deal.stage_entered_at).getTime()) / (1000 * 60 * 60 * 24));
                if (days > 14) return "danger" as const;
                if (days > 7) return "warn" as const;
                return "none" as const;
              })()
            : "none"
        }
        isHot={false}
        emailCount={0}
        callCount={0}
        attachmentCount={0}
        isDragging={isDragging}
        onClick={onClick}
      />
    </div>
  );
}

type Props = {
  pipeline: CRMPipeline;
  deals: DealRow[];
  onDealClick: (dealId: string) => void;
  onAddDeal: (stageId: string) => void;
};

export function DealsKanbanBoard({ pipeline, deals, onDealClick, onAddDeal }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const updateStage = useUpdateDealStage();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const stages = useMemo(
    () => (pipeline.stages ?? []).slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [pipeline.stages]
  );

  const dealsByStage = useMemo(() => {
    const map: Record<string, DealRow[]> = {};
    for (const s of stages) map[s.id] = [];
    const orphans: DealRow[] = [];
    for (const d of deals) {
      const sid = d.stage_id ?? "";
      if (!sid || !map[sid]) {
        orphans.push(d);
        continue;
      }
      map[sid].push(d);
    }
    // Si hay deals sin stage_id, los metemos en la primera columna con advertencia
    if (orphans.length > 0 && stages.length > 0) {
      map[stages[0].id] = [...orphans, ...map[stages[0].id]];
    }
    return map;
  }, [deals, stages]);

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const dealId = active.id as string;
    const newStageId = over.id as string;
    const isValidStage = stages.some((s) => s.id === newStageId);
    if (!isValidStage) return;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage_id === newStageId) return;

    try {
      await updateStage.mutateAsync({ dealId, newStageId });
      const stageName = stages.find((s) => s.id === newStageId)?.name ?? "";
      toast.success(`Deal movido a "${stageName}"`);
    } catch {
      toast.error("No se pudo mover el deal");
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[520px]">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage as CRMPipelineStage}
            deals={(dealsByStage[stage.id] ?? []).map((d) => ({
              id: d.id,
              name: d.name,
              amount: d.amount,
              account_name: d.account?.name ?? null,
            }))}
            onDealClick={onDealClick}
            onAddDeal={onAddDeal}
            renderDeal={(lite) => {
              const full = deals.find((d) => d.id === lite.id);
              if (!full) return null;
              return <SortableDeal deal={full} onClick={() => onDealClick(full.id)} />;
            }}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDeal ? (
          <DealKanbanCard
            title={activeDeal.name}
            subtitle={activeDeal.account?.name ?? undefined}
            amount={activeDeal.amount}
            probability={undefined}
            expectedCloseDate={null}
            ownerName={null}
            staleLevel="none"
            isHot={false}
            emailCount={0}
            callCount={0}
            attachmentCount={0}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
