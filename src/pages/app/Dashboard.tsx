import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useOrganization } from "@/contexts/organization-context";
import { usePageTitle } from "@/contexts/page-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SpiderWidget } from "@/components/features/spider/spider-widget";
import { PLANS } from "@/lib/constants";
import { FileText, Clock, Bell, Calendar, Brain, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { profile } = useAuth();
  const { currentOrganization } = useOrganization();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Dashboard");
  }, [setTitle]);

  const planInfo = PLANS[currentOrganization?.plan as keyof typeof PLANS];
  const firstName = profile?.full_name?.split(" ")[0] || "Usuario";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-background-card rounded-xl p-6 border border-border">
        <h1 className="text-2xl font-bold text-secondary">
          👋 Bienvenido, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1">
          {currentOrganization?.name} · Plan{" "}
          <Badge variant="secondary">{planInfo?.name || "Starter"}</Badge>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expedientes</CardTitle>
            <FileText className="h-4 w-4 text-module-docket" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">+0 este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <Link to="/app/docket" className="text-xs text-primary hover:underline flex items-center">
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alertas Activas</CardTitle>
            <Bell className="h-4 w-4 text-module-spider" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <Link to="/app/spider" className="text-xs text-primary hover:underline flex items-center">
              Ver todas <ChevronRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Próximos Vencimientos</CardTitle>
            <Calendar className="h-4 w-4 text-module-finance" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Próximos 30 días</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Recent Files */}
          <Card className="border-l-4 border-l-module-docket">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-module-docket" />
                Expedientes Recientes
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/docket">Ver más</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<FileText className="h-12 w-12" />}
                title="No hay expedientes aún"
                description="Crea tu primer expediente para empezar a gestionar tu cartera de PI"
                actionLabel="Crear Expediente"
                onAction={() => {}}
              />
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="border-l-4 border-l-module-finance">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-module-finance" />
                Próximos Vencimientos
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/finance">Ver más</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Calendar className="h-12 w-12" />}
                title="Sin vencimientos próximos"
                description="Los vencimientos de tu cartera aparecerán aquí"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Spider Widget */}
          <SpiderWidget />

          {/* Genius */}
          <Card className="border-l-4 border-l-module-genius bg-background-warm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-module-genius" />
                NEXUS Genius
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">¿En qué puedo ayudarte hoy?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background-card focus:outline-none focus:ring-2 focus:ring-module-genius"
                />
                <Button className="bg-module-genius hover:bg-module-genius/90">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Sugerencias rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    ¿Qué plazos tengo esta semana?
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    Resume mi cartera
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
