import * as React from 'react';
import { useMemo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ColorPicker, STAGE_COLORS } from '@/components/ui/color-picker';

type SortableStageRowProps = {
  id: string;
  stage: any;
  onUpdate: (updates: Record<string, any>) => void;
  onDelete: () => void;
};

export const SortableStageRow = React.forwardRef<HTMLDivElement, SortableStageRowProps>(function SortableStageRow(
  { id, stage, onUpdate, onDelete },
  ref
) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [setNodeRef, ref]
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  const [name, setName] = useState(stage.name || '');
  const [prob, setProb] = useState<number>(Number(stage.probability ?? 50));

  const statusBadge = useMemo(() => {
    if (stage.is_won_stage) return <Badge variant="secondary" className="text-xs">Ganado</Badge>;
    if (stage.is_lost_stage) return <Badge variant="destructive" className="text-xs">Perdido</Badge>;
    return <Badge variant="outline" className="text-xs">Abierto</Badge>;
  }, [stage.is_won_stage, stage.is_lost_stage]);

  return (
    <div
      ref={setRefs}
      style={style}
      className={cn(
        'rounded-lg border bg-background px-3 py-2 flex items-start md:items-center gap-3',
        isDragging && 'opacity-70',
      )}
    >
      <button
        className="p-1 rounded-md hover:bg-muted text-muted-foreground"
        aria-label="Reordenar"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1 grid grid-cols-12 gap-3 items-start md:items-center">
        <div className="col-span-12 md:col-span-5">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (name.trim() && name.trim() !== stage.name) onUpdate({ name: name.trim() });
            }}
          />
        </div>

        <div className="col-span-6 md:col-span-2">
          <Input
            type="number"
            min={0}
            max={100}
            value={prob}
            onChange={(e) => setProb(Number(e.target.value))}
            onBlur={() => {
              const next = Math.max(0, Math.min(100, prob));
              if (next !== stage.probability) onUpdate({ probability: next });
            }}
          />
        </div>

        <div className="col-span-6 md:col-span-2 min-w-0">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted transition-colors"
              >
                <div 
                  className="h-5 w-5 shrink-0 rounded-full border-2 border-white shadow-sm" 
                  style={{ backgroundColor: stage.color }} 
                />
                <span className="min-w-0 text-xs text-muted-foreground truncate">
                  {STAGE_COLORS.find(c => c.value === stage.color)?.name || 'Color'}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <ColorPicker 
                value={stage.color} 
                onChange={(color) => onUpdate({ color })} 
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="col-span-12 md:col-span-3 flex items-start md:items-center justify-between gap-3">
          <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-2">
            {statusBadge}
            <div className="flex items-center gap-1">
              <Switch
                checked={!!stage.is_won_stage}
                onCheckedChange={(checked) => {
                  onUpdate({ is_won_stage: checked, is_lost_stage: checked ? false : stage.is_lost_stage });
                }}
              />
              <span className="text-xs text-muted-foreground">Won</span>
            </div>
            <div className="flex items-center gap-1">
              <Switch
                checked={!!stage.is_lost_stage}
                onCheckedChange={(checked) => {
                  onUpdate({ is_lost_stage: checked, is_won_stage: checked ? false : stage.is_won_stage });
                }}
              />
              <span className="text-xs text-muted-foreground">Lost</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

SortableStageRow.displayName = 'SortableStageRow';
