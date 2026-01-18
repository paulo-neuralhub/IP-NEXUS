import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowDownLeft,
  RefreshCw,
  History,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface SyncHistoryEntry {
  id: string;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'partial' | 'failed' | 'cancelled';
  triggered_by: 'schedule' | 'manual' | 'webhook' | 'system';
  stats: {
    duration_ms?: number;
    items_checked: number;
    items_created: number;
    items_updated: number;
    items_deleted: number;
    items_skipped: number;
  };
  errors: Array<{
    entity: string;
    source_id: string;
    error: string;
  }>;
}

interface SyncHistoryProps {
  syncId: string;
  syncName: string;
  history: SyncHistoryEntry[];
  onViewDetails: (entryId: string) => void;
  onTriggerSync: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary'; icon: typeof Clock }> = {
  running: { label: 'Ejecutando', variant: 'default', icon: RefreshCw },
  completed: { label: 'Completado', variant: 'outline', icon: CheckCircle2 },
  partial: { label: 'Parcial', variant: 'secondary', icon: AlertTriangle },
  failed: { label: 'Fallido', variant: 'destructive', icon: XCircle },
  cancelled: { label: 'Cancelado', variant: 'outline', icon: XCircle },
};

const TRIGGER_LABELS: Record<string, string> = {
  schedule: 'Programado',
  manual: 'Manual',
  webhook: 'Webhook',
  system: 'Sistema',
};

export function SyncHistory({ syncName, history, onViewDetails, onTriggerSync }: SyncHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Sincronización
            </CardTitle>
            <CardDescription>{syncName}</CardDescription>
          </div>
          <Button onClick={onTriggerSync}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sincronizar ahora
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay historial de sincronización</p>
            <p className="text-sm">Ejecuta la primera sincronización para ver resultados</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Disparador</TableHead>
                  <TableHead className="text-right">Creados</TableHead>
                  <TableHead className="text-right">Actualizados</TableHead>
                  <TableHead className="text-right">Errores</TableHead>
                  <TableHead className="text-right">Duración</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map(entry => {
                  const statusConfig = STATUS_CONFIG[entry.status];
                  const StatusIcon = statusConfig?.icon || Clock;

                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {format(new Date(entry.started_at), 'dd MMM yyyy', { locale: es })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.started_at), 'HH:mm:ss')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig?.variant || 'outline'} className="gap-1">
                          <StatusIcon className={cn(
                            "h-3 w-3",
                            entry.status === 'running' && "animate-spin"
                          )} />
                          {statusConfig?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {TRIGGER_LABELS[entry.triggered_by]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.stats.items_created > 0 && (
                          <span className="text-green-600 flex items-center justify-end gap-1">
                            <ArrowDownLeft className="h-3 w-3" />
                            {entry.stats.items_created}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.stats.items_updated > 0 && (
                          <span className="text-blue-600">
                            {entry.stats.items_updated}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.errors.length > 0 && (
                          <span className="text-red-600 flex items-center justify-end gap-1">
                            <XCircle className="h-3 w-3" />
                            {entry.errors.length}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {entry.stats.duration_ms 
                          ? `${(entry.stats.duration_ms / 1000).toFixed(1)}s`
                          : '—'
                        }
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onViewDetails(entry.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
