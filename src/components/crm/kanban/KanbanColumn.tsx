/**
 * KanbanColumn - Columna del Kanban con contador y total
 */

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  color?: string;
  items: { id: string; estimated_value?: number | null; amount?: number | null }[];
  children: React.ReactNode;
  isDropTarget?: boolean;
}

export function KanbanColumn({
  id,
  title,
  color = 'bg-muted',
  items,
  children,
  isDropTarget,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const totalValue = items.reduce((sum, item) => sum + (item.estimated_value || item.amount || 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full bg-muted/30 rounded-lg border transition-colors',
        isOver && 'ring-2 ring-primary bg-primary/5',
        isDropTarget && 'ring-2 ring-dashed ring-primary/50'
      )}
    >
      {/* Header */}
      <div className="p-3 border-b bg-background rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', color)} />
            <span className="font-medium text-sm">{title}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        </div>
        {totalValue > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Total: <span className="font-semibold text-foreground">{totalValue.toLocaleString('es-ES')} €</span>
          </p>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-2">
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {children}
          </div>
        </SortableContext>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center text-muted-foreground text-sm py-12">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-2">
              <span className="text-xl">📭</span>
            </div>
            <p>Sin elementos</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
