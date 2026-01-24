import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCompleteCRMTask, useCreateCRMTask, useCRMTasks } from "@/hooks/crm/v2/tasks";

type Props = {
  dealId: string;
};

export function DealTasksSection({ dealId }: Props) {
  const { data: tasks = [], isLoading } = useCRMTasks({ deal_id: dealId, status: ["pending", "in_progress"] });
  const complete = useCompleteCRMTask();
  const create = useCreateCRMTask();
  const [newTitle, setNewTitle] = useState("");

  const sorted = useMemo(() => {
    return [...tasks].sort((a: any, b: any) => {
      const ad = a?.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY;
      const bd = b?.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY;
      return ad - bd;
    });
  }, [tasks]);

  async function handleAdd() {
    const title = newTitle.trim();
    if (!title) return;
    await create.mutateAsync({ title, status: "pending", deal_id: dealId, metadata: {} });
    setNewTitle("");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Tareas</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nueva tarea…"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <Button variant="outline" onClick={handleAdd} disabled={!newTitle.trim() || create.isPending}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando tareas…</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin tareas pendientes.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((t: any) => (
            <button
              key={t.id}
              type="button"
              className={cn(
                "w-full flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-left",
                "hover:bg-accent/50"
              )}
              onClick={() => complete.mutate(t.id)}
              disabled={complete.isPending}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm border bg-background">
                <Check className="h-3.5 w-3.5 opacity-80" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block truncate text-sm text-foreground">{t.title}</span>
                {t.due_date ? (
                  <span className="block text-xs text-muted-foreground">Vence: {t.due_date}</span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
