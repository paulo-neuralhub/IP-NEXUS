/**
 * PipelineKanbanColumn - Columna del pipeline con header profesional estilo Odoo
 * Barra de color superior, valor total, barra de progreso visual
 */

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PipelineKanbanColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  totalValue?: number;
  children: React.ReactNode;
  isWon?: boolean;
  isLost?: boolean;
  probability?: number;
  onAddItem?: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export function PipelineKanbanColumn({
  id,
  title,
  color,
  count,
  totalValue = 0,
  children,
  isWon,
  isLost,
  probability,
  onAddItem,
}: PipelineKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // Calculate weighted value for progress (for visualization)
  const maxValue = 150000; // Reference max for progress bar
  const barWidth = totalValue > 0 ? Math.min(100, (totalValue / maxValue) * 100) : 0;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-[14px] overflow-hidden transition-all w-[320px] flex-shrink-0',
        'border bg-slate-50 dark:bg-slate-900/50',
        isOver && 'ring-2 ring-primary scale-[1.01]',
        isWon && 'border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20',
        isLost && 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20',
        !isWon && !isLost && 'border-[rgba(0,0,0,0.06)]'
      )}
      style={{ height: '100%' }}
    >
      {/* Color Bar on top - Odoo style */}
      <div 
        className="h-1.5 w-full"
        style={{ backgroundColor: color }}
      />

      {/* Header */}
      <div className={cn(
        'p-4 border-b',
        isWon && 'bg-green-50 dark:bg-green-950/30',
        isLost && 'bg-red-50 dark:bg-red-950/30',
        !isWon && !isLost && 'bg-card'
      )}>
        {/* Title + Count + Value */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{title}</h3>
              <span 
                className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {count}
              </span>
            </div>
            {probability !== undefined && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {probability}% probabilidad
              </p>
            )}
          </div>
          <span className="text-sm font-bold text-green-600 dark:text-green-400 shrink-0">
            {formatCurrency(totalValue)}
          </span>
        </div>

        {/* Progress bar - visual indicator */}
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${barWidth}%`,
              backgroundColor: color,
              opacity: 0.8,
            }}
          />
        </div>
      </div>

      {/* Content - Cards area with VISIBLE scrollbar */}
      <div 
        className={cn(
          'flex-1 p-3 min-h-0 overflow-y-auto',
          isWon && 'bg-green-50/30 dark:bg-green-950/10',
          isLost && 'bg-red-50/30 dark:bg-red-950/10',
          !isWon && !isLost && 'bg-transparent'
        )}
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#94a3b8 #e2e8f0',
          maxHeight: 'calc(100% - 130px)',
        }}
      >
        {/* Sin SortableContext - usamos useDroppable en columna + useDraggable en cards */}
        <div className="space-y-3 min-h-[100px]">
          {children}
        </div>

        {count === 0 && (
          <div className="flex flex-col items-center justify-center text-muted-foreground text-sm py-10">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-2">
              <span className="text-xl">
                {isWon ? '🎉' : isLost ? '😔' : '📭'}
              </span>
            </div>
            <p className="font-medium">Sin elementos</p>
            <p className="text-xs opacity-70 mt-0.5">Arrastra aquí</p>
          </div>
        )}
      </div>

      {/* Add button */}
      {onAddItem && !isWon && !isLost && (
        <div className="p-2 border-t bg-card">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={onAddItem}
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir
          </Button>
        </div>
      )}
    </div>
  );
}
