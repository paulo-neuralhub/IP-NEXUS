import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search,
  Download,
  ExternalLink,
  Eye
} from 'lucide-react';
import { useStripeSubscriptions, useCancelSubscription, type TenantSubscription } from '@/hooks/backoffice';
import { formatEur } from '@/components/voip/backoffice/format';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: '🟢 Activo', variant: 'default' },
  trialing: { label: '🔵 Trial', variant: 'secondary' },
  past_due: { label: '🟡 Pago pendiente', variant: 'outline' },
  canceled: { label: '🔴 Cancelado', variant: 'destructive' },
  unpaid: { label: '🔴 Impago', variant: 'destructive' },
  incomplete: { label: '⚪ Incompleto', variant: 'outline' },
};

export default function StripeSubscriptionsPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });
  const [selectedSubscription, setSelectedSubscription] = useState<TenantSubscription | null>(null);

  const { data: subscriptions, isLoading } = useStripeSubscriptions(filters);
  const cancelSubscription = useCancelSubscription();

  const filteredSubscriptions = subscriptions?.filter((sub) => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        sub.organization?.name?.toLowerCase().includes(search) ||
        sub.stripe_subscription_id?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const calculateMRR = (sub: TenantSubscription) => {
    let mrr = 0;
    if (sub.price) {
      const amount = sub.price.price || 0;
      if (sub.price.billing_period === 'yearly') {
        mrr = Math.round(amount / 12);
      } else {
        mrr = amount;
      }
    }
    // Add add-ons
    sub.items?.forEach((item) => {
      if (item.price) {
        mrr += (item.price.price || 0) * (item.quantity || 1);
      }
    });
    return mrr;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Suscripciones</h1>
          <p className="text-muted-foreground">
            Gestiona las suscripciones de los tenants
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por tenant o ID..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(v) => setFilters({ ...filters, status: v })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="trialing">En trial</SelectItem>
                <SelectItem value="past_due">Pago pendiente</SelectItem>
                <SelectItem value="canceled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions?.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="font-medium">{sub.organization?.name || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{sub.product?.name || 'N/A'}</div>
                        {sub.items && sub.items.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            + {sub.items.map(i => i.product?.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatEur(calculateMRR(sub) * 100)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[sub.status]?.variant || 'secondary'}>
                        {statusConfig[sub.status]?.label || sub.status}
                      </Badge>
                      {sub.status === 'trialing' && sub.trial_end && (
                        <div className="text-xs text-muted-foreground mt-1">
                          ({Math.ceil((new Date(sub.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días)
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.created_at ? format(new Date(sub.created_at), 'dd/MM/yy', { locale: es }) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedSubscription(sub)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSubscriptions?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No se encontraron suscripciones
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex justify-center gap-4 text-sm text-muted-foreground">
        <span>🟢 Activo</span>
        <span>🔵 Trial</span>
        <span>🟡 Pago pendiente</span>
        <span>🔴 Cancelado</span>
      </div>

      {/* Subscription Detail Dialog */}
      <Dialog open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Suscripción: {selectedSubscription?.organization?.name}</DialogTitle>
            <DialogDescription>
              Detalles de la suscripción
            </DialogDescription>
          </DialogHeader>

          {selectedSubscription && (
            <div className="space-y-6">
              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tenant:</span>
                  <span className="ml-2 font-medium">{selectedSubscription.organization?.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Stripe Customer:</span>
                  <code className="ml-2 text-xs">{selectedSubscription.stripe_customer_id || '-'}</code>
                </div>
                <div>
                  <span className="text-muted-foreground">Stripe Subscription:</span>
                  <code className="ml-2 text-xs">{selectedSubscription.stripe_subscription_id || '-'}</code>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>
                  <Badge className="ml-2" variant={statusConfig[selectedSubscription.status]?.variant}>
                    {statusConfig[selectedSubscription.status]?.label}
                  </Badge>
                </div>
              </div>

              {/* Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Plan Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {selectedSubscription.product?.name} ({selectedSubscription.billing_cycle})
                      </div>
                      {selectedSubscription.items && selectedSubscription.items.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          + {selectedSubscription.items.map(i => i.product?.name).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-xl font-semibold">
                      {formatEur(calculateMRR(selectedSubscription) * 100)}/mes
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Fechas</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Inicio suscripción:</span>
                    <span className="ml-2">
                      {selectedSubscription.created_at 
                        ? format(new Date(selectedSubscription.created_at), 'dd/MM/yyyy', { locale: es })
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Período actual:</span>
                    <span className="ml-2">
                      {selectedSubscription.current_period_start && selectedSubscription.current_period_end
                        ? `${format(new Date(selectedSubscription.current_period_start), 'dd/MM/yyyy')} - ${format(new Date(selectedSubscription.current_period_end), 'dd/MM/yyyy')}`
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Próxima factura:</span>
                    <span className="ml-2">
                      {selectedSubscription.next_invoice_date 
                        ? format(new Date(selectedSubscription.next_invoice_date), 'dd/MM/yyyy', { locale: es })
                        : '-'}
                    </span>
                  </div>
                  {selectedSubscription.canceled_at && (
                    <div>
                      <span className="text-muted-foreground">Cancelación:</span>
                      <span className="ml-2 text-red-600">
                        {format(new Date(selectedSubscription.canceled_at), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                {selectedSubscription.stripe_subscription_id && (
                  <Button variant="outline" asChild>
                    <a
                      href={`https://dashboard.stripe.com/subscriptions/${selectedSubscription.stripe_subscription_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver en Stripe
                    </a>
                  </Button>
                )}
                {selectedSubscription.status === 'active' && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      cancelSubscription.mutate({
                        subscriptionId: selectedSubscription.stripe_subscription_id!,
                        atPeriodEnd: true,
                      });
                      setSelectedSubscription(null);
                    }}
                    disabled={cancelSubscription.isPending}
                  >
                    Cancelar al final del período
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
