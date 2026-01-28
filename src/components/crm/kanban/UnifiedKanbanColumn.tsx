/**
 * UnifiedKanbanColumn - Columna del Kanban unificado
 * Soporta fondos de color según tipo (lead/deal)
 */

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UnifiedKanbanColumnProps {
  id: string;
  title: string;
  color: string;
  bgColor?: string; // bg-blue-50, bg-white, bg-green-50, etc.
  items: { id: string; value?: number | null }[];
  children: React.ReactNode;
  isWon?: boolean;
  isLost?: boolean;
}

export function UnifiedKanbanColumn({
  id,
  title,
  color,
  bgColor = 'bg-background',
  items,
  children,
  isWon,
  isLost,
}: UnifiedKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const totalValue = items.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full rounded-lg border transition-colors w-[280px] flex-shrink-0',
        bgColor,
        isOver && 'ring-2 ring-primary bg-primary/5',
        isWon && 'border-[hsl(var(--ip-success-text))]/30',
        isLost && 'border-destructive/30'
      )}
    >
      {/* Header */}
      <div className={cn(
        'p-3 border-b rounded-t-lg',
        isWon && 'bg-[hsl(var(--ip-success-bg))]',
        isLost && 'bg-destructive/10',
        !isWon && !isLost && 'bg-background'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-2.5 h-2.5 rounded-full', color)} />
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
              <span className="text-xl">
                {isWon ? '🎉' : isLost ? '😔' : '📭'}
              </span>
            </div>
            <p>Sin elementos</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
