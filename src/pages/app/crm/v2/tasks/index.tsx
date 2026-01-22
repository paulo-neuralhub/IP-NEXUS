import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/contexts/page-context";
import { useCRMTasks, useCompleteCRMTask } from "@/hooks/crm/v2/tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, Check, Clock, Plus } from "lucide-react";
import { TaskFormModal } from "@/components/features/crm/v2/TaskFormModal";

type TaskRow = {
  id: string;
  title?: string | null;
  status?: string | null;
  due_date?: string | null;
  account?: { id: string; name?: string | null } | null;
  contact?: { id: string; full_name?: string | null } | null;
};

export default function CRMV2TasksList() {
  usePageTitle("Tareas");
  const [params] = useSearchParams();
  const accountId = params.get("account") ?? undefined;
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useCRMTasks({
    account_id: accountId,
    status: ["pending", "in_progress"],
  });
  const rows = useMemo(() => (data ?? []) as TaskRow[], [data]);
  const complete = useCompleteCRMTask();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tareas</h1>
          <p className="text-muted-foreground">Pendientes y en progreso</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="py-14 px-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <CheckSquare className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium">Sin tareas</p>
              <p className="text-sm text-muted-foreground">No hay tareas pendientes.</p>
            </div>
          ) : (
            <div className="divide-y">
              {rows.map((t) => (
                <div key={t.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.title || "Tarea"}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.account?.name ? `Cuenta: ${t.account.name}` : ""}
                      {t.contact?.full_name ? ` · Contacto: ${t.contact.full_name}` : ""}
                    </p>
                    {t.due_date ? (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Vence: {t.due_date}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={complete.isPending}
                    onClick={() => complete.mutate(t.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Completar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TaskFormModal open={showForm} onClose={() => setShowForm(false)} defaultAccountId={accountId} />
    </div>
  );
}
