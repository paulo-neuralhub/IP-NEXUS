// ============================================================
// IP-NEXUS BACKOFFICE - DEMO MODE PAGE
// Página de administración del modo demo L63-A
// ============================================================

import { useState } from "react";
import { toast } from "sonner";
import { 
  Target, Play, Settings, BarChart3, Clock, TrendingUp, 
  Users, CheckCircle2, XCircle, Timer, Rocket, RefreshCw,
  Building2, Mail, User, Calendar
} from "lucide-react";

import { useOrganization } from "@/contexts/organization-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { 
  useDemoConfig, 
  useDemoStats, 
  useDemoSessions,
  useUpsertDemoConfig,
  useToggleDemoMode,
  useStartDemoSession,
  useEndDemoSession,
} from "@/hooks/backoffice/useDemoMode";
import {
  useSeedDemoData,
  useCleanupDemoData,
} from "@/hooks/backoffice/useDemoData";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function DemoModePage() {
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;

  // Queries
  const { data: config, isLoading: configLoading } = useDemoConfig(organizationId);
  const { data: stats } = useDemoStats(organizationId);
  const { data: sessions } = useDemoSessions(organizationId);

  // Mutations
  const upsertConfig = useUpsertDemoConfig();
  const toggleDemoMode = useToggleDemoMode();
  const startSession = useStartDemoSession();
  const endSession = useEndDemoSession();
  const seedDemo = useSeedDemoData();
  const cleanupDemo = useCleanupDemoData();

  // Local state
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [prospectCompany, setProspectCompany] = useState("");
  const [prospectContact, setProspectContact] = useState("");
  const [prospectEmail, setProspectEmail] = useState("");
  const [prospectIndustry, setProspectIndustry] = useState("");

  const handleToggleActive = async (active: boolean) => {
    if (!organizationId) return;
    try {
      await toggleDemoMode.mutateAsync({ organizationId, isActive: active });
      toast.success(active ? "Modo DEMO activado" : "Modo DEMO desactivado");
    } catch (e) {
      toast.error("Error al cambiar estado del modo demo");
    }
  };

  const handleUpdateConfig = async (updates: Record<string, boolean>) => {
    if (!organizationId) return;
    try {
      await upsertConfig.mutateAsync({ organization_id: organizationId, ...updates });
      toast.success("Configuración actualizada");
    } catch (e) {
      toast.error("Error al actualizar configuración");
    }
  };

  const handleStartDemo = async () => {
    if (!organizationId) return;
    try {
      await startSession.mutateAsync({
        organization_id: organizationId,
        prospect_company: prospectCompany || null,
        prospect_contact_name: prospectContact || null,
        prospect_contact_email: prospectEmail || null,
        prospect_industry: prospectIndustry || null,
        modules_visited: [],
        features_shown: [],
        ended_at: null,
        duration_seconds: null,
        notes: null,
        follow_up_date: null,
        presenter_id: null,
      });
      setShowStartDialog(false);
      setProspectCompany("");
      setProspectContact("");
      setProspectEmail("");
      setProspectIndustry("");
      toast.success("Sesión de demo iniciada");
    } catch (e) {
      toast.error("Error al iniciar demo");
    }
  };

  const handleSeedData = async () => {
    if (!organizationId) return;
    try {
      const res = await seedDemo.mutateAsync(organizationId);
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      await upsertConfig.mutateAsync({ organization_id: organizationId, data_loaded: true });
      toast.success("Datos demo generados correctamente");
    } catch (e) {
      toast.error("Error al generar datos demo");
    }
  };

  const handleCleanupData = async () => {
    if (!organizationId) return;
    try {
      const res = await cleanupDemo.mutateAsync({ organizationId });
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      await upsertConfig.mutateAsync({ organization_id: organizationId, data_loaded: false });
      toast.success("Datos demo eliminados");
    } catch (e) {
      toast.error("Error al limpiar datos demo");
    }
  };

  const activeSession = sessions?.find(s => s.status === 'in_progress');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Target className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Modo Demostración</h1>
              <p className="text-muted-foreground">
                Gestiona demos para clientes potenciales
              </p>
            </div>
          </div>
        </div>
        <Badge 
          variant={config?.is_active ? "default" : "secondary"}
          className={config?.is_active ? "bg-amber-500 hover:bg-amber-600" : ""}
        >
          {config?.is_active ? "ACTIVO" : "INACTIVO"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Demos hoy
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayDemos ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              sesiones realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversión
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats?.conversionRate ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.converted ?? 0} de {stats?.totalDemos ?? 0} demos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tiempo promedio
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgDuration ?? 0} min</div>
            <p className="text-xs text-muted-foreground">
              duración por demo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats?.pending ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              seguimiento pendiente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-amber-500" />
              Iniciar Demo
            </CardTitle>
            <CardDescription>
              Comienza una nueva sesión de demostración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSession ? (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Play className="h-4 w-4 animate-pulse" />
                  <span className="font-medium">Demo en curso</span>
                </div>
                {activeSession.prospect_company && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeSession.prospect_company}
                  </p>
                )}
              </div>
            ) : (
              <Button 
                onClick={() => setShowStartDialog(true)} 
                className="w-full bg-amber-500 hover:bg-amber-600"
                disabled={!config?.data_loaded}
              >
                <Play className="mr-2 h-4 w-4" />
                Iniciar Demo
              </Button>
            )}
            {!config?.data_loaded && (
              <p className="text-xs text-muted-foreground">
                Primero debes cargar los datos demo
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurar
            </CardTitle>
            <CardDescription>
              Ajusta las opciones de visualización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-guide" className="text-sm">
                Mostrar guía flotante
              </Label>
              <Switch
                id="show-guide"
                checked={config?.show_guide ?? true}
                onCheckedChange={(v) => handleUpdateConfig({ show_guide: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-highlights" className="text-sm">
                Mostrar highlights
              </Label>
              <Switch
                id="show-highlights"
                checked={config?.show_highlights ?? true}
                onCheckedChange={(v) => handleUpdateConfig({ show_highlights: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-comparisons" className="text-sm">
                Comparativas competencia
              </Label>
              <Switch
                id="show-comparisons"
                checked={config?.show_comparisons ?? true}
                onCheckedChange={(v) => handleUpdateConfig({ show_comparisons: v })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>
              Estadísticas de las demostraciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total demos:</span>
              <span className="font-medium">{stats?.totalDemos ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Convertidas:
              </span>
              <span className="font-medium text-emerald-600">{stats?.converted ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                Pendientes:
              </span>
              <span className="font-medium text-amber-600">{stats?.pending ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <XCircle className="h-3.5 w-3.5 text-destructive" />
                Perdidas:
              </span>
              <span className="font-medium text-destructive">{stats?.lost ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Tabs defaultValue="data" className="space-y-4">
        <TabsList>
          <TabsTrigger value="data">Datos Demo</TabsTrigger>
          <TabsTrigger value="sessions">Sesiones</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Estado de datos</CardTitle>
                <CardDescription>
                  Gestiona los datos de demostración
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${config?.data_loaded ? 'bg-emerald-500' : 'bg-muted'}`} />
                    <div>
                      <p className="font-medium">Datos cargados</p>
                      <p className="text-sm text-muted-foreground">
                        {config?.data_loaded 
                          ? "Los datos demo están listos" 
                          : "No hay datos demo cargados"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={config?.data_loaded ? "default" : "secondary"}>
                    {config?.data_loaded ? "OK" : "Vacío"}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSeedData}
                    disabled={seedDemo.isPending || config?.data_loaded}
                    className="flex-1"
                  >
                    {seedDemo.isPending ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Rocket className="mr-2 h-4 w-4" />
                    )}
                    Cargar datos
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleCleanupData}
                    disabled={cleanupDemo.isPending || !config?.data_loaded}
                    className="flex-1"
                  >
                    {cleanupDemo.isPending ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Resetear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modo Demo</CardTitle>
                <CardDescription>
                  Activa/desactiva el modo demostración
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Estado del modo</p>
                    <p className="text-sm text-muted-foreground">
                      {config?.is_active 
                        ? "Mostrando indicador visual y guías" 
                        : "Modo normal sin indicadores"}
                    </p>
                  </div>
                  <Switch
                    checked={config?.is_active ?? false}
                    onCheckedChange={handleToggleActive}
                    disabled={toggleDemoMode.isPending}
                  />
                </div>

                {config?.last_demo_at && (
                  <p className="text-xs text-muted-foreground">
                    Última demo: {formatDistanceToNow(new Date(config.last_demo_at), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de sesiones</CardTitle>
              <CardDescription>
                Últimas demostraciones realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions && sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.slice(0, 10).map((session) => (
                    <div 
                      key={session.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${
                          session.status === 'converted' ? 'bg-emerald-500' :
                          session.status === 'pending' ? 'bg-amber-500' :
                          session.status === 'lost' ? 'bg-destructive' :
                          session.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                          'bg-muted'
                        }`} />
                        <div>
                          <p className="font-medium">
                            {session.prospect_company || "Sin nombre"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(session.started_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                            {session.duration_seconds && (
                              <> · {Math.round(session.duration_seconds / 60)} min</>
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        session.status === 'converted' ? 'default' :
                        session.status === 'pending' ? 'secondary' :
                        session.status === 'lost' ? 'destructive' :
                        'outline'
                      }>
                        {session.status === 'converted' ? 'Convertida' :
                         session.status === 'pending' ? 'Pendiente' :
                         session.status === 'lost' ? 'Perdida' :
                         session.status === 'in_progress' ? 'En curso' :
                         'Completada'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Target className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No hay sesiones de demo registradas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Start Demo Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar nueva demo</DialogTitle>
            <DialogDescription>
              Registra los datos del prospecto para hacer seguimiento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prospect-company">Empresa</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="prospect-company"
                  placeholder="Nombre de la empresa"
                  value={prospectCompany}
                  onChange={(e) => setProspectCompany(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prospect-contact">Contacto</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="prospect-contact"
                  placeholder="Nombre del contacto"
                  value={prospectContact}
                  onChange={(e) => setProspectContact(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prospect-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="prospect-email"
                  type="email"
                  placeholder="email@empresa.com"
                  value={prospectEmail}
                  onChange={(e) => setProspectEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prospect-industry">Industria</Label>
              <Select value={prospectIndustry} onValueChange={setProspectIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona industria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Tecnología</SelectItem>
                  <SelectItem value="pharma">Farmacéutica</SelectItem>
                  <SelectItem value="legal">Legal / Despachos</SelectItem>
                  <SelectItem value="food">Alimentación</SelectItem>
                  <SelectItem value="fashion">Moda / Textil</SelectItem>
                  <SelectItem value="automotive">Automoción</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleStartDemo}
              disabled={startSession.isPending}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {startSession.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Iniciar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
