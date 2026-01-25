import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  useStripeConfig, 
  useStripeSubscriptionStats, 
  useStripeInvoiceStats,
  useStripeWebhookStats,
  useStripeProductStats 
} from '@/hooks/backoffice';
import { formatEur } from '@/components/voip/backoffice/format';
import { Skeleton } from '@/components/ui/skeleton';

export default function StripeDashboard() {
  const { data: config, isLoading: configLoading } = useStripeConfig();
  const { data: subStats, isLoading: subLoading } = useStripeSubscriptionStats();
  const { data: invoiceStats, isLoading: invoiceLoading } = useStripeInvoiceStats('month');
  const { data: webhookStats } = useStripeWebhookStats();
  const { data: productStats } = useStripeProductStats();

  const isConfigured = config?.is_configured && config?.has_secret_key;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Stripe</h1>
          <p className="text-muted-foreground">
            Gestiona pagos, suscripciones y facturación
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={config?.mode === 'live' ? 'default' : 'secondary'}>
            {config?.mode === 'live' ? '🔴 LIVE' : '🧪 TEST'}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Stripe Dashboard
            </a>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      {subLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="MRR"
            value={formatEur((subStats?.mrr || 0) * 100)}
            variant="blue"
            icon={TrendingUp}
          />
          <StatCard
            label="Suscripciones Activas"
            value={subStats?.active || 0}
            variant="emerald"
            icon={Users}
          />
          <StatCard
            label="Churn Rate"
            value={subStats?.total ? `${((subStats.canceled / subStats.total) * 100).toFixed(1)}%` : '0%'}
            variant="orange"
            icon={TrendingUp}
          />
          <StatCard
            label="En Trial"
            value={subStats?.trialing || 0}
            variant="purple"
            icon={Clock}
          />
        </div>
      )}

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado de Conexión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {configLoading ? (
              <Skeleton className="h-24" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {isConfigured ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span>Stripe {isConfigured ? 'conectado' : 'no configurado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {config?.has_webhook_secret ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span>Webhook {config?.has_webhook_secret ? 'activo' : 'no configurado'}</span>
                  {config?.last_webhook_at && (
                    <span className="text-xs text-muted-foreground">
                      (último: {new Date(config.last_webhook_at).toLocaleString()})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {productStats?.productsSynced === productStats?.totalProducts ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span>
                    Productos sincronizados ({productStats?.productsSynced || 0}/{productStats?.totalProducts || 0})
                  </span>
                </div>
                {subStats?.pastDue ? (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span className="text-red-600">{subStats.pastDue} pagos pendientes</span>
                  </div>
                ) : null}
              </>
            )}
            <div className="pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/backoffice/stripe/config">
                  Configurar Stripe
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Facturación Este Mes</CardTitle>
          </CardHeader>
          <CardContent>
            {invoiceLoading ? (
              <Skeleton className="h-24" />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total facturado</span>
                  <span className="font-semibold">{formatEur(invoiceStats?.total || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cobrado</span>
                  <span className="font-semibold text-green-600">{formatEur(invoiceStats?.paid || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pendiente</span>
                  <span className="font-semibold text-yellow-600">{formatEur(invoiceStats?.pending || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{invoiceStats?.paidCount || 0} facturas pagadas</span>
                  <span>{invoiceStats?.pendingCount || 0} pendientes</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link to="/backoffice/stripe/config">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 text-center">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Configuración</h3>
              <p className="text-sm text-muted-foreground">Credenciales y webhooks</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/backoffice/stripe/products">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 text-center">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Sync Productos</h3>
              <p className="text-sm text-muted-foreground">
                {productStats?.productsNotSynced || 0} sin sincronizar
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/backoffice/stripe/subscriptions">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Suscripciones</h3>
              <p className="text-sm text-muted-foreground">
                {subStats?.active || 0} activas
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/backoffice/stripe/webhooks">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Webhooks</h3>
              <p className="text-sm text-muted-foreground">
                {webhookStats?.failed || 0} errores
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
