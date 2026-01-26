// =============================================
// IP-NEXUS - WORKFLOW EXECUTION HISTORY PAGE
// Detailed view of workflow executions with timeline
// =============================================

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  AlertTriangle,
  RefreshCw,
  Filter,
  Search,
  Zap,
  ChevronDown,
  ChevronRight,
  Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from '@/components/ui/separator';
import { cn, formatDateTime, formatRelativeTime } from '@/lib/utils';
import { 
  useWorkflowExecutions, 
  useWorkflowExecution,
  useWorkflowActionLogs,
  useWorkflowTemplate,
  useTriggerWorkflowManually
} from '@/hooks/workflow/useWorkflows';

// Status colors
const STATUS_CONFIG = {
  completed: { label: 'Completado', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  running: { label: 'Ejecutando', color: 'bg-blue-100 text-blue-700', icon: Activity },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-700', icon: XCircle },
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700', icon: AlertTriangle },
};

export function WorkflowHistoryPage() {
  const { id } = useParams(); // workflow id
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [expandedExecution, setExpandedExecution] = useState<string | null>(null);

  const { data: workflow } = useWorkflowTemplate(id);
  const { data: executions = [], isLoading } = useWorkflowExecutions({ workflowId: id });
  const retryWorkflow = useTriggerWorkflowManually();

  // Filter executions
  const filteredExecutions = executions.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    return true;
  });

  const handleRetry = (executionId: string, triggerData: Record<string, unknown>) => {
    if (!id) return;
    retryWorkflow.mutate({ workflowId: id, triggerData });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/workflow')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Historial de Ejecuciones</h1>
            <p className="text-muted-foreground">
              {workflow?.name || 'Workflow'} • {filteredExecutions.length} ejecuciones
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(`/app/workflow/${id}/edit`)}>
          <Zap className="h-4 w-4 mr-2" />
          Ver Workflow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {(['completed', 'running', 'failed', 'pending'] as const).map(status => {
          const config = STATUS_CONFIG[status];
          const count = executions.filter(e => e.status === status).length;
          const Icon = config.icon;
          
          return (
            <Card 
              key={status}
              className={cn(
                "cursor-pointer transition-colors hover:border-primary",
                statusFilter === status && "border-primary"
              )}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <div className={cn("p-3 rounded-lg", config.color.split(' ')[0])}>
                    <Icon className={cn("h-5 w-5", config.color.split(' ')[1])} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por ID o trigger..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([value, config]) => (
              <SelectItem key={value} value={value}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Executions List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : filteredExecutions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">Sin ejecuciones</h3>
            <p className="text-muted-foreground text-sm">
              {statusFilter !== 'all' 
                ? `No hay ejecuciones con estado "${STATUS_CONFIG[statusFilter as keyof typeof STATUS_CONFIG]?.label}"`
                : 'Este workflow aún no ha sido ejecutado'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredExecutions.map(execution => (
            <ExecutionCard 
              key={execution.id}
              execution={execution}
              isExpanded={expandedExecution === execution.id}
              onToggle={() => setExpandedExecution(
                expandedExecution === execution.id ? null : execution.id
              )}
              onRetry={() => handleRetry(execution.id, execution.trigger_data)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Execution Card Component
interface ExecutionCardProps {
  execution: any;
  isExpanded: boolean;
  onToggle: () => void;
  onRetry: () => void;
}

function ExecutionCard({ execution, isExpanded, onToggle, onRetry }: ExecutionCardProps) {
  const { data: actionLogs = [] } = useWorkflowActionLogs(isExpanded ? execution.id : undefined);
  
  const statusConfig = STATUS_CONFIG[execution.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  const duration = execution.completed_at && execution.started_at
    ? new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()
    : null;

  return (
    <Collapsible open={isExpanded}>
      <Card className={cn(
        "transition-shadow",
        isExpanded && "shadow-md"
      )}>
        <CollapsibleTrigger className="w-full" onClick={onToggle}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-full", statusConfig.color.split(' ')[0])}>
                  {execution.status === 'running' ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <StatusIcon className={cn("h-4 w-4", statusConfig.color.split(' ')[1])} />
                  )}
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{execution.trigger_type}</span>
                    <Badge variant="outline" className={statusConfig.color}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatRelativeTime(execution.created_at)}
                    </span>
                    {duration !== null && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(1)}s`}
                      </span>
                    )}
                    <span>
                      {execution.actions_completed}/{execution.workflow?.actions?.length || 0} acciones
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {execution.status === 'failed' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onRetry(); }}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reintentar
                  </Button>
                )}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Separator />
          <CardContent className="p-4">
            {/* Error message */}
            {execution.error_message && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                <strong>Error:</strong> {execution.error_message}
              </div>
            )}

            {/* Action Timeline */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Timeline de Acciones</h4>
              
              {actionLogs.length === 0 ? (
                <p className="text-muted-foreground text-sm">Sin logs de acciones</p>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  
                  <div className="space-y-4">
                    {actionLogs.map((log, index) => {
                      const logStatus = STATUS_CONFIG[log.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                      const LogIcon = logStatus.icon;
                      
                      return (
                        <div key={log.id} className="relative flex gap-4 pl-8">
                          {/* Timeline dot */}
                          <div className={cn(
                            "absolute left-2 p-1 rounded-full bg-background border-2",
                            log.status === 'success' && "border-primary",
                            log.status === 'failed' && "border-destructive",
                            log.status === 'skipped' && "border-muted-foreground"
                          )}>
                            <LogIcon className={cn(
                              "h-3 w-3",
                              log.status === 'success' && "text-primary",
                              log.status === 'failed' && "text-destructive",
                              log.status === 'skipped' && "text-muted-foreground"
                            )} />
                          </div>

                          <div className="flex-1 bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{index + 1}</Badge>
                                <span className="font-medium text-sm">{log.action_type}</span>
                              </div>
                              {log.duration_ms && (
                                <span className="text-xs text-muted-foreground">
                                  {log.duration_ms}ms
                                </span>
                              )}
                            </div>

                            {log.error_message && (
                              <p className="text-sm text-destructive">{log.error_message}</p>
                            )}

                            {log.output_data && Object.keys(log.output_data).length > 0 && (
                              <details className="mt-2">
                                <summary className="text-xs text-muted-foreground cursor-pointer">
                                  Ver output
                                </summary>
                                <pre className="mt-1 text-xs bg-background p-2 rounded overflow-auto max-h-32">
                                  {JSON.stringify(log.output_data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trigger Data */}
              {execution.trigger_data && Object.keys(execution.trigger_data).length > 0 && (
                <details className="mt-4">
                  <summary className="text-sm font-medium cursor-pointer">
                    Datos del Trigger
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-48">
                    {JSON.stringify(execution.trigger_data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
