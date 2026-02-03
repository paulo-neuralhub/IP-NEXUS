// =====================================================================
// IP-NEXUS BACKOFFICE - Log de Ejecuciones de Automatizaciones
// =====================================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, ArrowLeft, Search, Filter, ChevronDown, ChevronRight,
  CheckCircle, XCircle, Clock, AlertTriangle, Play, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  useAutomationExecutions,
  useExecutionStats,
  useOrganizationsForFilter,
  type ExecutionWithRelations,
} from '@/hooks/backoffice/useAutomationExecutions';

import {
  EXECUTION_STATUS_CONFIG,
  TRIGGER_TYPE_CONFIG,
  CATEGORY_CONFIG,
  type ExecutionStatus,
} from '@/types/automations';

export default function ExecutionsPage() {
  const [statusFilter, setStatusFilter] = useState<ExecutionStatus | 'all'>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: organizations = [] } = useOrganizationsForFilter();

  const { data: executions, isLoading, refetch } = useAutomationExecutions({
    organizationId: tenantFilter !== 'all' ? tenantFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    limit: 200,
  });

  const { data: stats } = useExecutionStats(dateFrom || undefined, dateTo || undefined);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/backoffice/automations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Log de Ejecuciones
            </h1>
            <p className="text-muted-foreground">
              Historial de todas las ejecuciones de automatizaciones.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Exitosas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats?.success || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Errores</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats?.error || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Parciales</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats?.partial || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">En curso</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats?.running || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-muted-foreground">Tasa éxito</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats?.successRate || 0}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <Select value={tenantFilter} onValueChange={setTenantFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tenants</SelectItem>
                {organizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ExecutionStatus | 'all')}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(EXECUTION_STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Desde"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[160px]"
            />
            <Input
              type="date"
              placeholder="Hasta"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[160px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : !executions?.length ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">Sin ejecuciones</h3>
              <p className="text-muted-foreground mt-1">
                No hay ejecuciones que coincidan con los filtros.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Automatización</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Entidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executions.map((execution) => (
                  <ExecutionRow
                    key={execution.id}
                    execution={execution}
                    isExpanded={expandedRows.has(execution.id)}
                    onToggle={() => toggleRow(execution.id)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Execution Row Component ────────────────────────────────

function ExecutionRow({
  execution,
  isExpanded,
  onToggle,
}: {
  execution: ExecutionWithRelations;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const statusConfig = EXECUTION_STATUS_CONFIG[execution.status];
  const triggerConfig = TRIGGER_TYPE_CONFIG[execution.trigger_type];

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onToggle}>
        <TableCell>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell>
          <div>
            <p className="font-medium text-sm">
              {format(new Date(execution.started_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(execution.started_at), { addSuffix: true, locale: es })}
            </p>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm">{execution.organization?.name || 'N/A'}</span>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span>{execution.tenant_automation?.icon || '⚡'}</span>
            <span className="text-sm">{execution.tenant_automation?.name || 'N/A'}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5 text-sm">
            <span>{triggerConfig.icon}</span>
            <span className="text-muted-foreground">{triggerConfig.label}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge className={cn('text-xs', statusConfig.bgClass)}>
            {statusConfig.label}
          </Badge>
        </TableCell>
        <TableCell>
          <span className="text-sm text-muted-foreground">
            {execution.duration_ms ? `${execution.duration_ms}ms` : '-'}
          </span>
        </TableCell>
        <TableCell>
          <span className="text-sm text-muted-foreground">
            {execution.entity_type ? `${execution.entity_type}` : '-'}
          </span>
        </TableCell>
      </TableRow>
      
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/30 p-4">
            <div className="space-y-4">
              {execution.error_message && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Error:</p>
                  <p className="text-sm text-red-700 mt-1">{execution.error_message}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium mb-2">Log de Acciones:</h4>
                <div className="space-y-2">
                  {execution.actions_log?.length > 0 ? (
                    execution.actions_log.map((action, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'flex items-start gap-3 p-2 rounded-lg border',
                          action.status === 'success' && 'bg-green-50 border-green-200',
                          action.status === 'error' && 'bg-red-50 border-red-200',
                          action.status === 'skipped' && 'bg-slate-50 border-slate-200'
                        )}
                      >
                        <span className="text-lg">
                          {action.status === 'success' && '✅'}
                          {action.status === 'error' && '❌'}
                          {action.status === 'skipped' && '⏭️'}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            #{action.order} - {action.type}
                          </p>
                          {action.error && (
                            <p className="text-xs text-red-600 mt-1">{action.error}</p>
                          )}
                          {action.result && (
                            <pre className="text-xs text-muted-foreground mt-1 overflow-auto max-h-20">
                              {JSON.stringify(action.result, null, 2)}
                            </pre>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {action.completed_at ? format(new Date(action.completed_at), 'HH:mm:ss') : ''}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin log de acciones</p>
                  )}
                </div>
              </div>

              {execution.trigger_data && Object.keys(execution.trigger_data).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Datos del Trigger:</h4>
                  <pre className="text-xs bg-slate-100 p-3 rounded-lg overflow-auto max-h-40">
                    {JSON.stringify(execution.trigger_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
