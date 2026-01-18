import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { PipelineStage, Deal } from '@/types/crm';
import { DealCard } from './deal-card';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  stage: PipelineStage;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onAddDeal: () => void;
}

function formatCurrency(value: number, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(value);
}

export function KanbanColumn({ stage, deals, onDealClick, onAddDeal }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-72 bg-muted/50 rounded-xl p-3 transition-colors",
        isOver && "bg-primary/10"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="font-medium text-foreground">{stage.name}</h3>
          <span className="text-sm text-muted-foreground">{deals.length}</span>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {formatCurrency(totalValue)}
        </span>
      </div>
      
      {/* Probabilidad */}
      <div className="mb-3">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-1 rounded-full transition-all"
            style={{ 
              width: `${stage.probability}%`,
              backgroundColor: stage.color 
            }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{stage.probability}% prob.</span>
      </div>
      
      {/* Deals */}
      <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[100px]">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onClick={() => onDealClick(deal)}
            />
          ))}
        </div>
      </SortableContext>
      
      {/* Add button */}
      <button
        onClick={onAddDeal}
        className="w-full mt-2 p-2 text-sm text-muted-foreground hover:text-primary hover:bg-background rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary transition-colors flex items-center justify-center gap-1"
      >
        <Plus className="w-4 h-4" />
        Añadir deal
      </button>
    </div>
  );
}
