import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bell, AlertTriangle, Clock, DollarSign, Users, Calendar,
  Shield, Sparkles, CheckCircle, ThumbsUp, ThumbsDown, X, 
  ChevronRight, RefreshCw, Settings, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  usePredictiveAlerts, 
  useAlertStats, 
  useAcknowledgeAlert,
  useDismissAlert,
  useAlertFeedback,
  useRunPredictiveAnalysis
} from '@/hooks/usePredictiveAlerts';
import type { AlertType, AlertSeverity, AlertStatus } from '@/types/predictive-alerts';
import { ALERT_TYPE_LABELS, SEVERITY_LABELS } from '@/types/predictive-alerts';
import { toast } from 'sonner';

const ALERT_ICONS: Record<AlertType, React.ElementType> = {
  deadline_risk: Clock,
  payment_risk: DollarSign,
  workload_imbalance: Users,
  client_churn: Users,
  cost_overrun: DollarSign,
  renewal_upcoming: Calendar,
  conflict_detected: Shield,
  anomaly_detected: AlertTriangle,
  opportunity: Sparkles,
  compliance_risk: Shield,
};

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  low: 'bg-info/10 text-info border-info/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

const BORDER_COLORS: Record<AlertSeverity, string> = {
  low: 'border-l-info',
  medium: 'border-l-warning',
  high: 'border-l-orange-500',
  critical: 'border-l-destructive',
};

export default function AlertsPage() {
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('active');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');

  const { data: alerts, isLoading } = usePredictiveAlerts({ 
    status: statusFilter, 
    severity: severityFilter 
  });
  const { data: stats } = useAlertStats();

  const acknowledgeMutation = useAcknowledgeAlert();
  const dismissMutation = useDismissAlert();
  const feedbackMutation = useAlertFeedback();
  const analysisMutation = useRunPredictiveAnalysis();

  const handleRunAnalysis = async () => {
    try {
      await analysisMutation.mutateAsync();
      toast.success('Análisis completado');
    } catch {
      toast.error('Error al ejecutar análisis');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Alertas Inteligentes
          </h1>
          <p className="text-muted-foreground">
            Predicciones y recomendaciones basadas en IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRunAnalysis}
            disabled={analysisMutation.isPending}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", analysisMutation.isPending && "animate-spin")} />
            Analizar
          </Button>
          <Link to="/app/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-sm text-muted-foreground">Alertas activas</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{stats?.critical || 0}</div>
            <p className="text-sm text-destructive/80">Críticas</p>
          </CardContent>
        </Card>
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-700">{stats?.high || 0}</div>
            <p className="text-sm text-orange-600">Alta prioridad</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">
              {(stats?.medium || 0) + (stats?.low || 0)}
            </div>
            <p className="text-sm text-muted-foreground">Media/Baja</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AlertStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="acknowledged">Reconocidas</SelectItem>
            <SelectItem value="resolved">Resueltas</SelectItem>
            <SelectItem value="dismissed">Descartadas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as AlertSeverity | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Severidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="low">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {isLoading && (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {alerts?.map((alert) => {
          const Icon = ALERT_ICONS[alert.alert_type] || AlertTriangle;
          
          return (
            <Card 
              key={alert.id} 
              className={cn("border-l-4", BORDER_COLORS[alert.severity])}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-lg border", SEVERITY_STYLES[alert.severity])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge variant="outline" className={SEVERITY_STYLES[alert.severity]}>
                          {SEVERITY_LABELS[alert.severity]}
                        </Badge>
                        <Badge variant="secondary">
                          {ALERT_TYPE_LABELS[alert.alert_type]}
                        </Badge>
                        {alert.confidence_score && (
                          <Badge variant="outline" className="gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {alert.confidence_score}%
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground">{alert.description}</p>
                      
                      {alert.recommendation && (
                        <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                          <p className="text-sm">
                            <strong>💡 Recomendación:</strong> {alert.recommendation}
                          </p>
                        </div>
                      )}
                      
                      {/* Related entities */}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        {alert.matter && (
                          <Link 
                            to={`/app/docket/${alert.matter.id}`}
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            📁 {alert.matter.reference}
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        )}
                        {alert.contact && (
                          <Link 
                            to={`/app/crm/contacts/${alert.contact.id}`}
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            👤 {alert.contact.full_name}
                          </Link>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Generada {new Date(alert.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {alert.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeMutation.mutate(alert.id)}
                          disabled={acknowledgeMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Reconocer
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissMutation.mutate(alert.id)}
                          disabled={dismissMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {alert.status !== 'active' && alert.was_useful === null && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground mr-2">¿Útil?</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => feedbackMutation.mutate({ alertId: alert.id, wasUseful: true })}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => feedbackMutation.mutate({ alertId: alert.id, wasUseful: false })}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {alert.was_useful !== null && (
                      <Badge variant={alert.was_useful ? 'default' : 'secondary'}>
                        {alert.was_useful ? '👍 Útil' : '👎 No útil'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {!isLoading && alerts?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No hay alertas que mostrar</p>
              <p className="text-sm mt-1">Todo está bajo control</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
