import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Database, Trash2, Wand2 } from "lucide-react";

import { useOrganization } from "@/contexts/organization-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useCleanupDemoData, useSeedDemoData, useSeedDemoUsers } from "@/hooks/backoffice/useDemoData";

export default function DemoDataPage() {
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;

  const [lastRunId, setLastRunId] = useState<string>("");
  const [cleanupRunId, setCleanupRunId] = useState<string>("");

  const seedMutation = useSeedDemoData();
  const cleanupMutation = useCleanupDemoData();
  const seedUsersMutation = useSeedDemoUsers();

  const canRun = !!organizationId;

  const resolvedRunId = useMemo(() => {
    const t = cleanupRunId.trim();
    return t.length ? t : undefined;
  }, [cleanupRunId]);

  const handleSeed = async () => {
    if (!organizationId) {
      toast.error("Selecciona una organización primero");
      return;
    }

    try {
      const res = await seedMutation.mutateAsync(organizationId);
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      setLastRunId(res.run_id);
      toast.success("Demo data creada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error creando demo data");
    }
  };

  const handleCleanup = async () => {
    if (!organizationId) {
      toast.error("Selecciona una organización primero");
      return;
    }

    try {
      const res = await cleanupMutation.mutateAsync({
        organizationId,
        runId: resolvedRunId,
      });
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      setLastRunId("");
      setCleanupRunId("");
      toast.success("Demo data eliminada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error eliminando demo data");
    }
  };

  const handleSeedUsers = async () => {
    try {
      const res = await seedUsersMutation.mutateAsync();
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      toast.success(`Usuarios demo creados: ${res.created_count} (omitidos: ${res.skipped_count})`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error creando usuarios demo");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Demo Data</h1>
          <p className="text-muted-foreground">
            Seeding y limpieza quirúrgica de datos de demo en la organización actual.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Crear dataset demo
            </CardTitle>
            <CardDescription>
              Inserta contactos, expedientes, plazos, CRM, facturas, comunicaciones y actividades.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              <div>
                Organización: <span className="font-medium text-foreground">{currentOrganization?.name ?? "—"}</span>
              </div>
              {lastRunId ? (
                <div className="mt-1">
                  Último run_id: <span className="font-mono text-foreground">{lastRunId}</span>
                </div>
              ) : null}
            </div>

            <Button onClick={handleSeed} disabled={!canRun || seedMutation.isPending} className="w-full">
              <Wand2 className="h-4 w-4 mr-2" />
              {seedMutation.isPending ? "Creando…" : "Seed demo data"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Crear usuarios demo (Auth)
            </CardTitle>
            <CardDescription>
              Crea usuarios en Supabase Auth y los vincula por memberships a los tenants demo (requiere superadmin).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              <div>
                Organización (contexto):{" "}
                <span className="font-medium text-foreground">{currentOrganization?.name ?? "—"}</span>
              </div>
              <div className="mt-1 text-xs">
                Nota: este seed no depende de la org seleccionada; usa los tenants demo por slug.
              </div>
            </div>

            <Button
              onClick={handleSeedUsers}
              disabled={seedUsersMutation.isPending}
              className="w-full"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {seedUsersMutation.isPending ? "Creando…" : "Seed demo users"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Limpiar demo data
            </CardTitle>
            <CardDescription>
              Elimina solo lo creado por un run (por defecto, el último run de esta organización).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="runId">Run ID (opcional)</Label>
              <Input
                id="runId"
                value={cleanupRunId}
                onChange={(e) => setCleanupRunId(e.target.value)}
                placeholder="Si lo dejas vacío, usa el último run de esta org"
              />
              <p className="text-xs text-muted-foreground">
                Consejo: pega aquí el run_id que te devolvió el seeder para una limpieza exacta.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={!canRun || cleanupMutation.isPending}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {cleanupMutation.isPending ? "Eliminando…" : "Cleanup demo data"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar demo data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción borrará registros creados por el seed demo (según el run_id). No afecta datos reales
                    fuera de ese run.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCleanup}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
