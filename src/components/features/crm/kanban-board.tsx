import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import type { Pipeline, Deal } from '@/types/crm';
import { useUpdateDeal } from '@/hooks/use-crm';
import { KanbanColumn } from './kanban-column';
import { DealCard } from './deal-card';
import { toast } from 'sonner';

interface Props {
  pipeline: Pipeline;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onAddDeal: (stageId: string) => void;
}

export function KanbanBoard({ pipeline, deals, onDealClick, onAddDeal }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const updateDeal = useUpdateDeal();
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );
  
  const stages = [...(pipeline.stages || [])].sort((a, b) => a.position - b.position);

  // Agrupar deals por stage
  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = deals.filter(d => d.stage_id === stage.id);
    return acc;
  }, {} as Record<string, Deal[]>);
  
  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null;
  
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }
  
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    const dealId = active.id as string;
    const newStageId = over.id as string;
    
    // Verificar que es una stage válida
    const isValidStage = pipeline.stages?.some(s => s.id === newStageId);
    if (!isValidStage) return;
    
    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.stage_id === newStageId) return;
    
    // Verificar si es stage de ganado/perdido
    const newStage = pipeline.stages?.find(s => s.id === newStageId);
    
    try {
      const updateData: Record<string, unknown> = { stage_id: newStageId };
      
      if (newStage?.is_won_stage) {
        updateData.status = 'won';
        updateData.closed_at = new Date().toISOString();
      } else if (newStage?.is_lost_stage) {
        updateData.status = 'lost';
        updateData.closed_at = new Date().toISOString();
      } else {
        updateData.status = 'open';
        updateData.closed_at = null;
      }
      
      await updateDeal.mutateAsync({ id: dealId, data: updateData });
      
      toast.success(`Deal movido a "${newStage?.name}"`);
    } catch (error) {
      toast.error('No se pudo mover el deal');
    }
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] || []}
            onDealClick={onDealClick}
            onAddDeal={() => onAddDeal(stage.id)}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeDeal && <DealCard deal={activeDeal} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
