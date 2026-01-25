import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  RefreshCw,
  Eye,
  Loader2
} from 'lucide-react';
import { 
  useStripeWebhooks, 
  useStripeWebhookLog,
  useRetryWebhook,
  useStripeEventTypes,
  useStripeWebhookStats,
  type StripeWebhookLog 
} from '@/hooks/backoffice';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  processed: { label: '✅', variant: 'default' },
  failed: { label: '❌', variant: 'destructive' },
  received: { label: '⏳', variant: 'secondary' },
  processing: { label: '⏳', variant: 'outline' },
};

export default function StripeWebhooksPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    eventType: 'all',
    period: 'today' as const,
  });
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);

  const { data: webhooks, isLoading } = useStripeWebhooks(filters);
  const { data: stats } = useStripeWebhookStats();
  const { data: eventTypes } = useStripeEventTypes();
  const { data: selectedWebhook, isLoading: loadingDetail } = useStripeWebhookLog(selectedWebhookId || '');
  const retryWebhook = useRetryWebhook();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Log de Webhooks</h1>
          <p className="text-muted-foreground">
            Historial de eventos recibidos de Stripe
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-sm text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats?.processed || 0}</div>
            <p className="text-sm text-muted-foreground">Procesados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats?.failed || 0}</div>
            <p className="text-sm text-muted-foreground">Fallidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select
              value={filters.period}
              onValueChange={(v) => setFilters({ ...filters, period: v as typeof filters.period })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="all">Todo</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.eventType}
              onValueChange={(v) => setFilters({ ...filters, eventType: v })}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {eventTypes?.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(v) => setFilters({ ...filters, status: v })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="processed">Procesados</SelectItem>
                <SelectItem value="failed">Fallidos</SelectItem>
                <SelectItem value="received">Pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Hora</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead className="w-[80px]">Estado</TableHead>
                  <TableHead className="text-right w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks?.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell className="font-mono text-xs">
                      {webhook.created_at 
                        ? format(new Date(webhook.created_at), 'HH:mm:ss', { locale: es })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {webhook.event_type}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[webhook.status]?.variant || 'secondary'}>
                        {statusConfig[webhook.status]?.label || webhook.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedWebhookId(webhook.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {webhook.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => retryWebhook.mutate(webhook.id)}
                            disabled={retryWebhook.isPending}
                          >
                            {retryWebhook.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {webhooks?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No se encontraron webhooks
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-sm text-muted-foreground">
        <span>✅ Procesado</span>
        <span>❌ Error</span>
        <span>⏳ Pendiente</span>
      </div>

      {/* Webhook Detail Dialog */}
      <Dialog open={!!selectedWebhookId} onOpenChange={() => setSelectedWebhookId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Detalle del Webhook</DialogTitle>
            <DialogDescription>
              {selectedWebhook?.event_type}
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : selectedWebhook ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Event ID:</span>
                  <code className="ml-2 text-xs">{selectedWebhook.stripe_event_id}</code>
                </div>
                <div>
                  <span className="text-muted-foreground">Recibido:</span>
                  <span className="ml-2">
                    {selectedWebhook.created_at 
                      ? format(new Date(selectedWebhook.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>
                  <Badge className="ml-2" variant={statusConfig[selectedWebhook.status]?.variant}>
                    {statusConfig[selectedWebhook.status]?.label} {selectedWebhook.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Procesado:</span>
                  <span className="ml-2">
                    {selectedWebhook.processed_at 
                      ? format(new Date(selectedWebhook.processed_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })
                      : '-'}
                  </span>
                </div>
              </div>

              {selectedWebhook.error_message && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  <strong>Error:</strong> {selectedWebhook.error_message}
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Payload:</h4>
                <ScrollArea className="h-[300px] rounded border">
                  <pre className="p-4 text-xs">
                    {JSON.stringify(selectedWebhook.payload, null, 2)}
                  </pre>
                </ScrollArea>
              </div>

              {selectedWebhook.status === 'failed' && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      retryWebhook.mutate(selectedWebhook.id);
                      setSelectedWebhookId(null);
                    }}
                    disabled={retryWebhook.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reintentar
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
