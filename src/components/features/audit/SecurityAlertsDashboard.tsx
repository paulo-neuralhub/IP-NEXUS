// ============================================================
// IP-NEXUS - SECURITY ALERTS DASHBOARD COMPONENT
// ============================================================

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  User,
  ChevronRight,
  Filter,
  RefreshCw,
  XCircle,
  ArrowUp,
} from 'lucide-react';
import {
  useSecurityAlerts,
  useOpenAlerts,
  useCriticalAlerts,
  useResolveSecurityAlert,
  useEscalateSecurityAlert,
  useSecurityStats,
  type SecurityAlert,
} from '@/hooks/audit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const SEVERITY_CONFIG = {
  critical: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
    badge: 'destructive' as const,
  },
  high: {
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200',
    badge: 'destructive' as const,
  },
  medium: {
    icon: AlertCircle,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200',
    badge: 'secondary' as const,
  },
  low: {
    icon: Info,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
    badge: 'outline' as const,
  },
};

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-red-500' },
  investigating: { label: 'Investigating', color: 'bg-yellow-500' },
  resolved: { label: 'Resolved', color: 'bg-green-500' },
  false_positive: { label: 'False Positive', color: 'bg-gray-500' },
  escalated: { label: 'Escalated', color: 'bg-purple-500' },
};

export function SecurityAlertsDashboard() {
  const { t } = useTranslation();
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  const { data: allAlerts, isLoading } = useSecurityAlerts();
  const { data: openAlerts } = useOpenAlerts();
  const { data: criticalAlerts } = useCriticalAlerts();
  const { data: stats } = useSecurityStats();

  const resolveMutation = useResolveSecurityAlert();
  const escalateMutation = useEscalateSecurityAlert();

  const handleResolve = async () => {
    if (!selectedAlert) return;
    
    await resolveMutation.mutateAsync({
      id: selectedAlert.id,
      resolution_notes: resolutionNotes,
      false_positive: false,
    });
    
    setShowResolveDialog(false);
    setSelectedAlert(null);
    setResolutionNotes('');
  };

  const handleEscalate = async (alert: SecurityAlert) => {
    await escalateMutation.mutateAsync({
      id: alert.id,
      escalation_level: (alert.escalation_level || 0) + 1,
    });
  };

  const getSeverityConfig = (severity: string) => {
    return SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.low;
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.open;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6" />
            {t('security.title', 'Security Alerts')}
          </h2>
          <p className="text-muted-foreground">
            {t('security.description', 'Monitor and respond to security events')}
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('common.refresh', 'Refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('security.stats.open', 'Open Alerts')}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.open_count || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('security.stats.critical', 'Critical')}
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.critical_count || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('security.stats.resolved', 'Resolved (30d)')}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.resolved_last_30_days || 0}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('security.stats.avgTime', 'Avg Resolution')}
                </p>
                <p className="text-2xl font-bold">
                  {stats?.avg_resolution_hours ? `${Math.round(stats.avg_resolution_hours)}h` : '-'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Tabs defaultValue="open" className="w-full">
        <TabsList>
          <TabsTrigger value="open" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            {t('security.tabs.open', 'Open')}
            {openAlerts && openAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {openAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="critical" className="gap-2">
            <XCircle className="h-4 w-4" />
            {t('security.tabs.critical', 'Critical')}
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <Shield className="h-4 w-4" />
            {t('security.tabs.all', 'All Alerts')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-4">
          <AlertsList
            alerts={openAlerts}
            isLoading={isLoading}
            onSelect={setSelectedAlert}
            onEscalate={handleEscalate}
            getSeverityConfig={getSeverityConfig}
            getStatusConfig={getStatusConfig}
          />
        </TabsContent>

        <TabsContent value="critical" className="mt-4">
          <AlertsList
            alerts={criticalAlerts}
            isLoading={isLoading}
            onSelect={setSelectedAlert}
            onEscalate={handleEscalate}
            getSeverityConfig={getSeverityConfig}
            getStatusConfig={getStatusConfig}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <AlertsList
            alerts={allAlerts}
            isLoading={isLoading}
            onSelect={setSelectedAlert}
            onEscalate={handleEscalate}
            getSeverityConfig={getSeverityConfig}
            getStatusConfig={getStatusConfig}
          />
        </TabsContent>
      </Tabs>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert && !showResolveDialog} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {selectedAlert?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedAlert?.created_at && format(new Date(selectedAlert.created_at), 'PPpp')}
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={getSeverityConfig(selectedAlert.severity).badge}>
                  {selectedAlert.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {selectedAlert.alert_type}
                </Badge>
                <Badge variant="secondary">
                  {getStatusConfig(selectedAlert.status).label}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('security.detail.description', 'Description')}
                </label>
                <p className="mt-1">{selectedAlert.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('security.detail.source', 'Source')}
                  </label>
                  <p>{selectedAlert.source || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('security.detail.affectedUser', 'Affected User')}
                  </label>
                  <p className="font-mono text-sm">{selectedAlert.affected_user_id || '-'}</p>
                </div>
              </div>

              {selectedAlert.evidence && Object.keys(selectedAlert.evidence).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('security.detail.evidence', 'Evidence')}
                  </label>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(selectedAlert.evidence, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAlert(null)}>
              {t('common.close', 'Close')}
            </Button>
            {selectedAlert?.status === 'open' && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => selectedAlert && handleEscalate(selectedAlert)}
                  disabled={escalateMutation.isPending}
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  {t('security.actions.escalate', 'Escalate')}
                </Button>
                <Button onClick={() => setShowResolveDialog(true)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t('security.actions.resolve', 'Resolve')}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('security.resolve.title', 'Resolve Alert')}</DialogTitle>
            <DialogDescription>
              {t('security.resolve.description', 'Provide resolution notes for this alert')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={t('security.resolve.placeholder', 'Describe how the issue was resolved...')}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleResolve} disabled={resolveMutation.isPending}>
              {t('security.resolve.confirm', 'Confirm Resolution')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Alerts List Component
function AlertsList({
  alerts,
  isLoading,
  onSelect,
  onEscalate,
  getSeverityConfig,
  getStatusConfig,
}: {
  alerts: SecurityAlert[] | undefined;
  isLoading: boolean;
  onSelect: (alert: SecurityAlert) => void;
  onEscalate: (alert: SecurityAlert) => void;
  getSeverityConfig: (severity: string) => typeof SEVERITY_CONFIG.critical;
  getStatusConfig: (status: string) => typeof STATUS_CONFIG.open;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium">{t('security.empty.title', 'No alerts')}</h3>
          <p className="text-muted-foreground">
            {t('security.empty.description', 'All clear! No security alerts at this time.')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = getSeverityConfig(alert.severity);
          const SeverityIcon = config.icon;
          const statusConfig = getStatusConfig(alert.status);

          return (
            <Card
              key={alert.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 border-l-4 ${config.color}`}
              onClick={() => onSelect(alert)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${config.color}`}>
                    <SeverityIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{alert.title}</span>
                      <Badge variant={config.badge} className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{alert.alert_type}</span>
                      <span>•</span>
                      <span>{alert.created_at && format(new Date(alert.created_at), 'MMM d, HH:mm')}</span>
                      <div className={`h-2 w-2 rounded-full ${statusConfig.color}`} />
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
