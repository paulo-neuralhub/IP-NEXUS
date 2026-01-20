import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Mail, 
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Link2,
  XCircle,
  Loader2,
  Inbox
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  useEmailIngestionQueue, 
  useEmailIngestionStats,
  useProcessEmail,
  useRetryEmail,
  useDismissEmail
} from '@/hooks/docket';
import type { EmailIngestionItem } from '@/types/docket-god-mode';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800', icon: Loader2 },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  manual_review: { label: 'Revisión Manual', color: 'bg-purple-100 text-purple-800', icon: Eye },
};

export function EmailIngestionPanel() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: emails = [], isLoading, refetch } = useEmailIngestionQueue({
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 50,
  });
  const { data: stats } = useEmailIngestionStats();
  
  const processEmail = useProcessEmail();
  const retryEmail = useRetryEmail();
  const dismissEmail = useDismissEmail();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Cola de Ingesta de Emails
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatBadge label="Total" value={stats.total} />
            <StatBadge label="Pendientes" value={stats.pending} color="yellow" />
            <StatBadge label="Procesando" value={stats.processing} color="blue" />
            <StatBadge label="Completados" value={stats.completed} color="green" />
            <StatBadge label="Fallidos" value={stats.failed} color="red" />
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Email List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay emails en la cola</p>
            <p className="text-sm">Los emails entrantes aparecerán aquí para procesamiento</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Remitente</TableHead>
                  <TableHead>Recibido</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Expediente</TableHead>
                  <TableHead className="w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((email) => (
                  <EmailRow 
                    key={email.id} 
                    email={email}
                    onProcess={() => processEmail.mutate(email.id)}
                    onRetry={() => retryEmail.mutate(email.id)}
                    onDismiss={() => dismissEmail.mutate(email.id)}
                    isProcessing={processEmail.isPending}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EmailRowProps {
  email: EmailIngestionItem;
  onProcess: () => void;
  onRetry: () => void;
  onDismiss: () => void;
  isProcessing: boolean;
}

function EmailRow({ email, onProcess, onRetry, onDismiss, isProcessing }: EmailRowProps) {
  const statusConfig = STATUS_CONFIG[email.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusConfig?.icon || Clock;

  return (
    <TableRow>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium truncate max-w-[250px]">
            {email.subject || '(Sin asunto)'}
          </div>
          {email.extracted_data && (
            <div className="text-xs text-muted-foreground">
              Datos extraídos
            </div>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <span className="text-sm truncate max-w-[150px] block">
          {email.from_address}
        </span>
      </TableCell>
      
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {format(new Date(email.created_at), 'dd/MM/yy HH:mm', { locale: es })}
        </span>
      </TableCell>
      
      <TableCell>
        <Badge className={cn('gap-1', statusConfig?.color)}>
          <StatusIcon className={cn('h-3 w-3', email.status === 'processing' && 'animate-spin')} />
          {statusConfig?.label || email.status}
        </Badge>
        {email.retry_count > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            (x{email.retry_count})
          </span>
        )}
      </TableCell>
      
      <TableCell>
        {email.matched_matter_id ? (
          <Badge variant="outline" className="gap-1">
            <Link2 className="h-3 w-3" />
            Vinculado
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-1">
          {email.status === 'pending' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onProcess}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Procesar'
              )}
            </Button>
          )}
          {email.status === 'failed' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onRetry}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reintentar
            </Button>
          )}
          {['pending', 'failed'].includes(email.status) && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={onDismiss}
            >
              <XCircle className="h-3 w-3" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color?: string }) {
  const colorClass = color ? {
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
  }[color] : 'bg-gray-100 text-gray-800';

  return (
    <div className={cn('px-3 py-2 rounded-lg text-center', colorClass)}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}
