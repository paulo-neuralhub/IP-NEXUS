import { useMemo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function SortableStageRow({
  id,
  stage,
  onUpdate,
  onDelete,
}: {
  id: string;
  stage: any;
  onUpdate: (updates: Record<string, any>) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
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
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border bg-background px-3 py-2 flex items-center gap-3',
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

      <div className="min-w-0 flex-1 grid grid-cols-12 gap-3 items-center">
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

        <div className="col-span-6 md:col-span-2 flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm border" style={{ backgroundColor: stage.color }} />
          <span className="text-xs text-muted-foreground truncate">{stage.color}</span>
        </div>

        <div className="col-span-12 md:col-span-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
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
}
