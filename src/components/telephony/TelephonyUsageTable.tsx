import { Phone, PhoneIncoming, PhoneOutgoing, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { TelephonyUsageLog } from '@/hooks/useTenantTelephony';

interface TelephonyUsageTableProps {
  logs: TelephonyUsageLog[];
  isLoading?: boolean;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatEur(amount: number | null) {
  if (amount === null) return '—';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}

function getUsageTypeIcon(type: string) {
  switch (type) {
    case 'voice_outbound':
      return <PhoneOutgoing className="h-4 w-4 text-primary" />;
    case 'voice_inbound':
      return <PhoneIncoming className="h-4 w-4 text-success" />;
    case 'sms_outbound':
    case 'sms_inbound':
      return <MessageSquare className="h-4 w-4 text-info" />;
    default:
      return <Phone className="h-4 w-4" />;
  }
}

function getUsageTypeLabel(type: string) {
  switch (type) {
    case 'voice_outbound':
      return 'Llamada saliente';
    case 'voice_inbound':
      return 'Llamada entrante';
    case 'sms_outbound':
      return 'SMS enviado';
    case 'sms_inbound':
      return 'SMS recibido';
    default:
      return type;
  }
}

function getStatusBadge(status: string | null) {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Completada
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Fallida
        </Badge>
      );
    case 'busy':
      return <Badge variant="secondary">Ocupado</Badge>;
    case 'no_answer':
      return <Badge variant="secondary">Sin respuesta</Badge>;
    default:
      return status ? <Badge variant="outline">{status}</Badge> : null;
  }
}

export function TelephonyUsageTable({ logs, isLoading }: TelephonyUsageTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <div className="p-8 text-center text-muted-foreground">Cargando historial...</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border">
        <div className="p-8 text-center text-muted-foreground">
          No hay registros de uso todavía.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Número</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Coste</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getUsageTypeIcon(log.usage_type)}
                  <span className="text-sm">{getUsageTypeLabel(log.usage_type)}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {log.usage_type.includes('outbound') ? log.to_number : log.from_number}
              </TableCell>
              <TableCell>{formatDuration(log.duration_seconds)}</TableCell>
              <TableCell>{formatEur(log.charged_cost)}</TableCell>
              <TableCell>{getStatusBadge(log.status)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(log.created_at).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
