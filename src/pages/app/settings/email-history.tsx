import { useState } from 'react';
import { 
  Mail, 
  Check, 
  X, 
  Eye, 
  Clock,
  AlertTriangle,
  Search,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSentEmails } from '@/hooks/use-integrations';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendiente', color: '#6B7280', icon: Clock },
  sent: { label: 'Enviado', color: '#3B82F6', icon: Check },
  delivered: { label: 'Entregado', color: '#22C55E', icon: Check },
  opened: { label: 'Abierto', color: '#8B5CF6', icon: Eye },
  clicked: { label: 'Click', color: '#EC4899', icon: Eye },
  bounced: { label: 'Rebotado', color: '#F59E0B', icon: AlertTriangle },
  complained: { label: 'Queja', color: '#EF4444', icon: X },
  failed: { label: 'Error', color: '#EF4444', icon: X },
};

export default function EmailHistoryPage() {
  const [search, setSearch] = useState('');
  const { data: emails = [], isLoading, refetch } = useSentEmails();
  
  const filteredEmails = emails.filter(e =>
    !search ||
    e.to_email.toLowerCase().includes(search.toLowerCase()) ||
    e.subject.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historial de Emails</h1>
          <p className="text-muted-foreground">Emails enviados desde la plataforma</p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
          Actualizar
        </Button>
      </div>
      
      {/* Buscar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por email o asunto..."
          className="pl-10"
        />
      </div>
      
      {/* Lista */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Destinatario</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead className="text-center">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmails.map(email => {
              const status = email.status as string;
              const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;
              
              return (
                <TableRow key={email.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(email.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{email.to_email}</p>
                    {email.to_name && (
                      <p className="text-xs text-muted-foreground">{email.to_name}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm truncate max-w-md">{email.subject}</p>
                    {email.template_id && (
                      <p className="text-xs text-muted-foreground">Plantilla: {email.template_id}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      style={{ 
                        backgroundColor: `${statusConfig.color}15`,
                        color: statusConfig.color,
                        borderColor: `${statusConfig.color}30`,
                      }}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                    {email.error_message && (
                      <p className="text-xs text-destructive mt-1">{email.error_message}</p>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {filteredEmails.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay emails</p>
          </div>
        )}
      </div>
    </div>
  );
}
