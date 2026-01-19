import { useState } from 'react';
import { FileText, User, Building2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuditLogs } from '@/hooks/use-admin';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AUDIT_ACTIONS } from '@/lib/constants/backoffice';

const RESOURCE_TYPES = [
  { value: 'subscriptions', label: 'Suscripciones' },
  { value: 'memberships', label: 'Membresías' },
  { value: 'organizations', label: 'Organizaciones' },
  { value: 'users', label: 'Usuarios' },
  { value: 'matters', label: 'Expedientes' },
];

export default function AdminAuditLogsPage() {
  const [filters, setFilters] = useState<{
    resource_type?: string;
    date_from?: string;
    date_to?: string;
  }>({});
  
  const { data: logs = [], isLoading } = useAuditLogs(filters);
  
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Logs de Auditoría</h1>
          <p className="text-muted-foreground">Historial de acciones del sistema</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <Select 
          value={filters.resource_type || 'all'} 
          onValueChange={(value) => setFilters({ ...filters, resource_type: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo de recurso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {RESOURCE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input
          type="date"
          value={filters.date_from || ''}
          onChange={(e) => setFilters({ ...filters, date_from: e.target.value || undefined })}
          placeholder="Desde"
          className="w-40"
        />
        
        <Input
          type="date"
          value={filters.date_to || ''}
          onChange={(e) => setFilters({ ...filters, date_to: e.target.value || undefined })}
          placeholder="Hasta"
          className="w-40"
        />
      </div>
      
      {/* Logs list */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="divide-y">
          {logs.map((log: any) => {
            const actionConfig = AUDIT_ACTIONS[log.action as keyof typeof AUDIT_ACTIONS] || { label: log.action, color: 'hsl(var(--muted-foreground))' };
            
            return (
              <div key={log.id} className="p-4 hover:bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-0.5 text-xs rounded-full font-medium"
                          style={{ backgroundColor: `${actionConfig.color}20`, color: actionConfig.color }}
                        >
                          {actionConfig.label}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {log.resource_type}
                        </Badge>
                        {log.resource_id && (
                          <span className="text-xs text-muted-foreground font-mono">
                            #{log.resource_id.slice(0, 8)}
                          </span>
                        )}
                      </div>
                      
                      {log.description && (
                        <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {log.user && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.user.full_name || log.user.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {log.changes && Object.keys(log.changes).length > 0 && (
                  <details className="mt-2 ml-11">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      Ver cambios
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(log.changes, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            );
          })}
          
          {logs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No hay logs de auditoría
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
