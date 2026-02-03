// ============================================================
// IP-NEXUS - EXECUTION HISTORY (TENANT)
// Shows history of automation executions for the current tenant
// ============================================================

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Calendar,
  ArrowLeft,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

import {
  useAutomationExecutions,
  useTenantAutomations,
  type AutomationExecution,
} from '@/hooks/useTenantAutomationConfigs';

import { EXECUTION_STATUS_CONFIG, TRIGGER_TYPE_CONFIG } from '@/types/automations';

export function ExecutionHistory() {
  const [searchParams] = useSearchParams();
  const automationFilter = searchParams.get('automation') || '';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: automations = [] } = useTenantAutomations();
  const { data: executions = [], isLoading, refetch } = useAutomationExecutions({
    automationId: automationFilter || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    limit: 100,
  });

  // Filter executions
  const filteredExecutions = executions.filter(exec => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const automation = automations.find(a => a.id === exec.tenant_automation_id);
    return (
      automation?.name.toLowerCase().includes(q) ||
      exec.entity_type?.toLowerCase().includes(q) ||
      exec.entity_id?.toLowerCase().includes(q)
    );
  });

  // Stats
  const stats = {
    total: filteredExecutions.length,
    success: filteredExecutions.filter(e => e.status === 'success').length,
    error: filteredExecutions.filter(e => e.status === 'error').length,
    partial: filteredExecutions.filter(e => e.status === 'partial').length,
    running: filteredExecutions.filter(e => e.status === 'running').length,
  };

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

  const getAutomationName = (automationId: string) => {
    const automation = automations.find(a => a.id === automationId);
    return automation?.name || 'Automatización desconocida';
  };

  const getAutomationIcon = (automationId: string) => {
    const automation = automations.find(a => a.id === automationId);
    return automation?.icon || '⚡';
  };

  if (isLoading) {
    return <ExecutionHistorySkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/app/settings/automations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Historial de Ejecuciones</h1>
            <p className="text-muted-foreground">
              Registro de todas las automatizaciones ejecutadas
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por automatización o entidad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="success">Exitoso</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="running">En curso</SelectItem>
              </SelectContent>
            </Select>
            {automationFilter && (
              <Button variant="outline" asChild>
                <Link to="/app/settings/automations/history">
                  <XCircle className="h-4 w-4 mr-2" />
                  Quitar filtro
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Play className="h-6 w-6 text-primary" />
              <div>
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-xl font-bold">{stats.success}</p>
                <p className="text-xs text-muted-foreground">Exitosas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-xl font-bold">{stats.error}</p>
                <p className="text-xs text-muted-foreground">Errores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <div>
                <p className="text-xl font-bold">{stats.partial}</p>
                <p className="text-xs text-muted-foreground">Parciales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-xl font-bold">{stats.running}</p>
                <p className="text-xs text-muted-foreground">En curso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      {filteredExecutions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="font-medium mb-1">Sin ejecuciones</h3>
            <p className="text-muted-foreground text-sm">
              No hay ejecuciones que coincidan con los filtros seleccionados
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-520px)] min-h-[400px]">
          <div className="space-y-2">
            {filteredExecutions.map((exec) => {
              const isExpanded = expandedRows.has(exec.id);
              const statusConfig = EXECUTION_STATUS_CONFIG[exec.status as keyof typeof EXECUTION_STATUS_CONFIG];
              const triggerConfig = TRIGGER_TYPE_CONFIG[exec.trigger_type as keyof typeof TRIGGER_TYPE_CONFIG];

              return (
                <Card key={exec.id}>
                  <CardContent
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleRow(exec.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Expand Icon */}
                      <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>

                      {/* Status Icon */}
                      <div className={cn('p-2 rounded-full flex-shrink-0', statusConfig?.bgClass)}>
                        {exec.status === 'success' && <CheckCircle2 className="h-4 w-4" />}
                        {exec.status === 'error' && <XCircle className="h-4 w-4" />}
                        {exec.status === 'partial' && <AlertTriangle className="h-4 w-4" />}
                        {exec.status === 'running' && <Clock className="h-4 w-4" />}
                        {exec.status === 'skipped' && <XCircle className="h-4 w-4" />}
                        {exec.status === 'cancelled' && <XCircle className="h-4 w-4" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getAutomationIcon(exec.tenant_automation_id)}</span>
                          <span className="font-medium truncate">
                            {getAutomationName(exec.tenant_automation_id)}
                          </span>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {triggerConfig?.icon} {triggerConfig?.label || exec.trigger_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {exec.entity_type && (
                            <span>{exec.entity_type}</span>
                          )}
                          {exec.duration_ms && (
                            <>
                              <span>•</span>
                              <span>{exec.duration_ms}ms</span>
                            </>
                          )}
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(exec.started_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="text-right text-xs text-muted-foreground shrink-0">
                        <p>{format(new Date(exec.started_at), "d MMM yyyy", { locale: es })}</p>
                        <p>{format(new Date(exec.started_at), "HH:mm:ss")}</p>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-4 ml-12 space-y-4" onClick={(e) => e.stopPropagation()}>
                        {/* Error Message */}
                        {exec.error_message && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium text-red-800">Error:</p>
                            <p className="text-sm text-red-700 mt-1">{exec.error_message}</p>
                          </div>
                        )}

                        {/* Actions Log */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Log de Acciones:</h4>
                          <div className="space-y-2">
                            {exec.actions_log?.length > 0 ? (
                              exec.actions_log.map((action, idx) => (
                                <div
                                  key={idx}
                                  className={cn(
                                    'flex items-start gap-3 p-2 rounded-lg border',
                                    action.status === 'success' && 'bg-emerald-50 border-emerald-200',
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

                        {/* Trigger Data */}
                        {exec.trigger_data && Object.keys(exec.trigger_data).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Datos del Trigger:</h4>
                            <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-40">
                              {JSON.stringify(exec.trigger_data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function ExecutionHistorySkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-14" />
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}
