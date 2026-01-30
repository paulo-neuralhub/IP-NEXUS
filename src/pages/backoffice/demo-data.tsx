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

import {
  useCleanupDemoData,
  useSeedDemoClientCommunications,
  useSeedDemoData,
  useSeedDemoDeadlinesCoverage,
  useSeedDemoFinanceFull,
  useSeedDemoDocumentsStructure,
  useSeedDemoTenantConfigs,
  useSeedDemoPortalConfig,
  useSeedDemoSpiderVigilance,
  useSeedDemoTasksWorkflows,
  useSeedDemoTenantsClients,
  useSeedDemoMattersCoverage,
  useSeedDemoUsers,
  useSeedDemoTimeSignatures,
} from "@/hooks/backoffice/useDemoData";

import { DemoDataDashboard } from "@/components/backoffice/demo/DemoDataDashboard";

export default function DemoDataPage() {
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;

  const [lastRunId, setLastRunId] = useState<string>("");
  const [cleanupRunId, setCleanupRunId] = useState<string>("");

  const seedMutation = useSeedDemoData();
  const cleanupMutation = useCleanupDemoData();
  const seedUsersMutation = useSeedDemoUsers();
  const seedTenantsClientsMutation = useSeedDemoTenantsClients();
  const seedMattersCoverageMutation = useSeedDemoMattersCoverage();
  const seedDeadlinesCoverageMutation = useSeedDemoDeadlinesCoverage();
  const seedClientCommsMutation = useSeedDemoClientCommunications();
  const seedFinanceFullMutation = useSeedDemoFinanceFull();
  const seedDocumentsStructureMutation = useSeedDemoDocumentsStructure();
  const seedTenantConfigsMutation = useSeedDemoTenantConfigs();
  const seedSpiderVigilanceMutation = useSeedDemoSpiderVigilance();
  const seedPortalConfigMutation = useSeedDemoPortalConfig();
  const seedTasksWorkflowsMutation = useSeedDemoTasksWorkflows();
  const seedTimeSignaturesMutation = useSeedDemoTimeSignatures();

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

  const handleSeedTenantsClients = async () => {
    try {
      const res = await seedTenantsClientsMutation.mutateAsync();
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      const summary = res.results.map((r) => `${r.slug}: ${r.companies} (run ${r.run_id})`).join(" · ");
      toast.success(`Clientes demo creados. ${summary}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error creando clientes demo");
    }
  };

  const handleSeedMattersCoverage = async () => {
    try {
      const res = await seedMattersCoverageMutation.mutateAsync();
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      const summary = res.results
        .map((r) => `${r.slug}: ${r.matters_created} (run ${r.run_id})`)
        .join(" · ");
      toast.success(`Expedientes demo creados. ${summary}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error creando expedientes demo");
    }
  };

  const handleSeedDeadlinesCoverage = async () => {
    try {
      const res = await seedDeadlinesCoverageMutation.mutateAsync();
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      const summary = res.results
        .map((r) => `${r.slug}: ${r.deadlines} plazos / ${r.alerts} alertas (run ${r.run_id})`)
        .join(" · ");
      toast.success(`Plazos demo creados. ${summary}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error creando plazos demo");
    }
  };

  const handleSeedClientComms = async () => {
    try {
      const res = await seedClientCommsMutation.mutateAsync();
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      const summary = res.results.map((r) => `${r.slug} (run ${r.run_id})`).join(" · ");
      toast.success(`Comunicaciones demo creadas. ${summary}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error creando comunicaciones demo");
    }
  };

  const handleSeedFinanceFull = async () => {
    try {
      const res = await seedFinanceFullMutation.mutateAsync();
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      const summary = res.results.map((r) => `${r.slug} (run ${r.run_id})`).join(" · ");
      toast.success(`Datos financieros demo creados. ${summary}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error creando datos financieros demo");
    }
  };

  const handleSeedSpiderVigilance = async () => {
    try {
      const res = await seedSpiderVigilanceMutation.mutateAsync();
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      const summary = res.results.map((r) => `${r.slug} (run ${r.run_id})`).join(" · ");
      toast.success(`Vigilancias y resultados Spider creados. ${summary}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error creando vigilancias Spider demo");
    }
  };

  const handleSeedPortalConfig = async () => {
    try {
      const res = await seedPortalConfigMutation.mutateAsync();
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      const summary = res.results.map((r) => `${r.slug} (run ${r.run_id})`).join(" · ");
      toast.success(`Portal configurado (demo-professional+). ${summary}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error creando portal demo");
    }
  };

  const handleSeedTasksWorkflows = async () => {
    try {
      const res = await seedTasksWorkflowsMutation.mutateAsync();
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      const summary = res.results.map((r) => `${r.slug} (run ${r.run_id})`).join(" · ");
      toast.success(`Tareas y workflows demo creados. ${summary}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error creando tareas/workflows demo");
    }
  };

  const handleSeedDocumentsStructure = async () => {
    try {
      const res = await seedDocumentsStructureMutation.mutateAsync();
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      const summary = res.results.map((r) => `${r.slug}: ${r.documents} docs (run ${r.run_id})`).join(" · ");
      toast.success(`Documentos demo creados en bucket "${res.bucket}". ${summary}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error creando documentos demo");
    }
  };

  const handleSeedTenantConfigs = async () => {
    try {
      const res = await seedTenantConfigsMutation.mutateAsync();
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      const summary = res.results.map((r) => `${r.slug} (run ${r.run_id})`).join(" · ");
      toast.success(`Configuraciones por tenant creadas. ${summary}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error creando configuraciones por tenant");
    }
  };

  const handleSeedTimeSignatures = async () => {
    if (!organizationId) {
      toast.error("Selecciona una organización primero");
      return;
    }
    try {
      const res = await seedTimeSignaturesMutation.mutateAsync(organizationId);
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      toast.success(`Time tracking & firmas creados: ${res.seeded.time_entries} entradas, ${res.seeded.signature_requests} solicitudes`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error creando time tracking/firmas demo");
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

      <DemoDataDashboard />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configuraciones específicas por tenant
            </CardTitle>
            <CardDescription>
              Crea templates personalizados (factura/email/informe), campos personalizados (business/enterprise), roles
              enterprise, integraciones (flags) y preferencias regionales por tenant (idioma/fecha/moneda/zona horaria).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSeedTenantConfigs} disabled={seedTenantConfigsMutation.isPending} className="w-full">
              <Database className="h-4 w-4 mr-2" />
              {seedTenantConfigsMutation.isPending ? "Creando…" : "Seed tenant configs (all tenants)"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Crear estructura de documentos (Storage)
            </CardTitle>
            <CardDescription>
              Sube ~500 documentos placeholder a Supabase Storage con estructura /expediente/… (/solicitud, /oficina,
              /cliente, /interno) y registra las rutas en matter_documents (sin guardar binarios en la DB).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSeedDocumentsStructure}
              disabled={seedDocumentsStructureMutation.isPending}
              className="w-full"
            >
              <Database className="h-4 w-4 mr-2" />
              {seedDocumentsStructureMutation.isPending ? "Creando…" : "Seed documents structure (all tenants)"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Crear tareas + workflows (activos)
            </CardTitle>
            <CardDescription>
              Genera 150 Smart Tasks (pending/in_progress/completed/cancelled) y workflows activos con instancias en curso
              (Nueva marca ES/EUIPO, Renovación, Respuesta Office Action) incluyendo pasos completados/pendientes,
              responsables, fechas límite y documentos adjuntos simulados en todos los tenants demo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSeedTasksWorkflows} disabled={seedTasksWorkflowsMutation.isPending} className="w-full">
              <Database className="h-4 w-4 mr-2" />
              {seedTasksWorkflowsMutation.isPending ? "Creando…" : "Seed tasks + workflows (all tenants)"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configurar Client Portal (demo-professional+)
            </CardTitle>
            <CardDescription>
              Crea portales y accesos para TechStart (2 usuarios), FarmaCorp (5 usuarios) y DistriFresh (invitado), con logo/URL,
              permisos, expedientes visibles (settings), actividad (logins/descargas/mensajes/facturas) y notificaciones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSeedPortalConfig} disabled={seedPortalConfigMutation.isPending} className="w-full">
              <Database className="h-4 w-4 mr-2" />
              {seedPortalConfigMutation.isPending ? "Creando…" : "Seed portal config + access (demo-professional+)"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Time Tracking + Firmas digitales (L108)
            </CardTitle>
            <CardDescription>
              Genera 400+ entradas de tiempo (6 meses de actividad), tarifas de facturación y 10+ solicitudes de firma
              (poderes, encargos, contratos) para la organización actual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSeedTimeSignatures} disabled={!canRun || seedTimeSignaturesMutation.isPending} className="w-full">
              <Database className="h-4 w-4 mr-2" />
              {seedTimeSignaturesMutation.isPending ? "Creando…" : "Seed time entries + signatures"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Crear vigilancias Spider + resultados
            </CardTitle>
            <CardDescription>
              Genera 20 vigilancias activas (marca propia/competidores/mercado) con 200 resultados y alertas (new/dismissed/threat/actioned)
              y screenshots simulados en todos los tenants demo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSeedSpiderVigilance} disabled={seedSpiderVigilanceMutation.isPending} className="w-full">
              <Database className="h-4 w-4 mr-2" />
              {seedSpiderVigilanceMutation.isPending ? "Creando…" : "Seed Spider vigilance + results (all tenants)"}
            </Button>
          </CardContent>
        </Card>

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
              <Database className="h-5 w-5" />
              Crear datos financieros (full)
            </CardTitle>
            <CardDescription>
              Genera 100 facturas (paid/sent/overdue/draft), 30 presupuestos (accepted/sent/rejected) y 50 gastos
              (matter_costs) con PDFs simulados en todos los tenants demo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSeedFinanceFull} disabled={seedFinanceFullMutation.isPending} className="w-full">
              <Database className="h-4 w-4 mr-2" />
              {seedFinanceFullMutation.isPending ? "Creando…" : "Seed finance full (all tenants)"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Crear comunicaciones (top 10 clientes)
            </CardTitle>
            <CardDescription>
              Genera emails (con PDFs simulados), llamadas, WhatsApp, reuniones y tareas para los 10 clientes principales
              de cada tenant demo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSeedClientComms} disabled={seedClientCommsMutation.isPending} className="w-full">
              <Database className="h-4 w-4 mr-2" />
              {seedClientCommsMutation.isPending ? "Creando…" : "Seed client communications (all tenants)"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Crear plazos (coverage)
            </CardTitle>
            <CardDescription>
              Genera plazos críticos/urgentes/normales/vencidos/completados con alertas programadas (30/15/7/1 días)
              en todos los tenants demo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSeedDeadlinesCoverage}
              disabled={seedDeadlinesCoverageMutation.isPending}
              className="w-full"
            >
              <Database className="h-4 w-4 mr-2" />
              {seedDeadlinesCoverageMutation.isPending ? "Creando…" : "Seed deadlines coverage (all tenants)"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Crear expedientes (coverage)
            </CardTitle>
            <CardDescription>
              Genera expedientes que cubren todos los estados/tipos/jurisdicciones (logos, clases, prioridades y familias)
              en todos los tenants demo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSeedMattersCoverage}
              disabled={seedMattersCoverageMutation.isPending}
              className="w-full"
            >
              <Database className="h-4 w-4 mr-2" />
              {seedMattersCoverageMutation.isPending ? "Creando…" : "Seed matters coverage (all tenants)"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Crear clientes demo (todos los tenants)
            </CardTitle>
            <CardDescription>
              Crea clientes realistas por tenant (contacts + billing + invoices + payments) y expedientes PI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              <div>
                Ejecuta seed masivo para: <span className="font-medium text-foreground">starter / professional / business / enterprise</span>.
              </div>
              <div className="mt-1 text-xs">Incluye run_id por tenant para poder hacer cleanup quirúrgico.</div>
            </div>

            <Button
              onClick={handleSeedTenantsClients}
              disabled={seedTenantsClientsMutation.isPending}
              className="w-full"
            >
              <Database className="h-4 w-4 mr-2" />
              {seedTenantsClientsMutation.isPending ? "Creando…" : "Seed demo clients (all tenants)"}
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
