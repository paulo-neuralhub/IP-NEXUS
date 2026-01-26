// ============================================================
// IP-NEXUS - AUTOMATIONS DASHBOARD
// Unified dashboard for automation rules and legal deadlines
// ============================================================

import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Zap, 
  BookOpen, 
  History, 
  ArrowRight,
  Tag,
  FileText,
  Palette,
  Users,
  CreditCard,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useAutomationRules } from '@/hooks/useAutomationRules';
import { useLegalDeadlinesStats } from '@/hooks/useLegalDeadlines';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CATEGORY_CONFIG = {
  trademarks: { label: 'Marcas', icon: Tag, color: 'text-purple-600' },
  patents: { label: 'Patentes', icon: FileText, color: 'text-blue-600' },
  designs: { label: 'Diseños', icon: Palette, color: 'text-pink-600' },
  clients: { label: 'Clientes', icon: Users, color: 'text-green-600' },
  billing: { label: 'Facturación', icon: CreditCard, color: 'text-amber-600' },
  general: { label: 'General', icon: Settings, color: 'text-gray-600' },
};

export function AutomationsDashboard() {
  const { data: rules, isLoading: rulesLoading } = useAutomationRules();
  const { data: legalStats, isLoading: statsLoading } = useLegalDeadlinesStats();

  // Calculate stats
  const activeRules = rules?.filter(r => r.is_active).length || 0;
  const totalRules = rules?.length || 0;
  const totalExecutions = rules?.reduce((sum, r) => sum + (r.execution_count || 0), 0) || 0;
  const errors = 0; // TODO: Track from execution logs

  // Group rules by category
  const rulesByCategory = rules?.reduce((acc, rule) => {
    const cat = rule.category || 'general';
    if (!acc[cat]) acc[cat] = { total: 0, active: 0 };
    acc[cat].total++;
    if (rule.is_active) acc[cat].active++;
    return acc;
  }, {} as Record<string, { total: number; active: number }>);

  // Recent activity (last executed rules)
  const recentActivity = rules
    ?.filter(r => r.last_executed_at)
    .sort((a, b) => new Date(b.last_executed_at!).getTime() - new Date(a.last_executed_at!).getTime())
    .slice(0, 5) || [];

  if (rulesLoading || statsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Automatizaciones</h1>
        <p className="text-muted-foreground">
          Gestiona reglas de automatización y consulta plazos legales oficiales
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Reglas activas"
          value={activeRules}
          subtitle={`de ${totalRules} totales`}
          icon={Zap}
          color="text-primary"
        />
        <StatCard
          title="Plazos legales"
          value={legalStats?.total || 0}
          subtitle="en base de datos"
          icon={BookOpen}
          color="text-blue-600"
        />
        <StatCard
          title="Ejecuciones"
          value={totalExecutions}
          subtitle="totales"
          icon={CheckCircle2}
          color="text-green-600"
        />
        <StatCard
          title="Errores"
          value={errors}
          subtitle="este mes"
          icon={AlertTriangle}
          color={errors > 0 ? 'text-red-600' : 'text-muted-foreground'}
        />
      </div>

      {/* Quick Access Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Reglas de Automatización</CardTitle>
                <CardDescription>
                  Automatizaciones que se ejecutan cuando ocurren eventos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {activeRules}/{totalRules} activas
              </span>
              <Button asChild variant="outline" size="sm">
                <Link to="/app/settings/automations/rules">
                  Gestionar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Plazos Legales</CardTitle>
                <CardDescription>
                  Base de datos de plazos oficiales por jurisdicción
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Última verificación:{' '}
                {legalStats?.lastVerified
                  ? format(new Date(legalStats.lastVerified), "d MMM yyyy", { locale: es })
                  : 'N/A'}
              </span>
              <Button asChild variant="outline" size="sm">
                <Link to="/app/settings/automations/legal-deadlines">
                  Consultar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Reglas por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const stats = rulesByCategory?.[key];
              if (!stats) return null;

              return (
                <Link
                  key={key}
                  to={`/app/settings/automations/rules?category=${key}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <config.icon className={cn("h-5 w-5", config.color)} />
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {stats.total} reglas ({stats.active} activas)
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Actividad Reciente</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/app/settings/automations/history">
              Ver historial completo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay actividad reciente
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((rule) => (
                <div key={rule.id} className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Ejecutada{' '}
                      {format(new Date(rule.last_executed_at!), "d MMM 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {rule.execution_count}x
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-muted", color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
