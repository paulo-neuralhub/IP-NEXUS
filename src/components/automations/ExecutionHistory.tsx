// ============================================================
// IP-NEXUS - EXECUTION HISTORY
// Shows history of automation rule executions
// ============================================================

import { useState } from 'react';
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
  Filter,
  RefreshCw,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useAutomationRules, AutomationRule } from '@/hooks/useAutomationRules';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Mock execution history (will be replaced with actual data)
interface ExecutionLog {
  id: string;
  rule_id: string;
  rule_name: string;
  executed_at: string;
  status: 'success' | 'error' | 'pending';
  action_type: string;
  target_reference: string;
  details: string;
  error_message?: string;
}

export function ExecutionHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7d');

  const { data: rules, isLoading } = useAutomationRules();

  // Generate mock execution history from rules
  const executionLogs: ExecutionLog[] = rules
    ?.filter(r => r.last_executed_at)
    .flatMap(rule => {
      // Create mock logs based on execution count
      const count = Math.min(rule.execution_count || 0, 3);
      return Array.from({ length: count }, (_, i) => ({
        id: `${rule.id}-${i}`,
        rule_id: rule.id,
        rule_name: rule.name,
        executed_at: new Date(
          new Date(rule.last_executed_at!).getTime() - i * 86400000 * Math.random() * 7
        ).toISOString(),
        status: 'success' as const,
        action_type: rule.rule_type,
        target_reference: `EXP-2025-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
        details: getActionDetails(rule),
      }));
    })
    .sort((a, b) => new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime())
    .slice(0, 50) || [];

  function getActionDetails(rule: AutomationRule): string {
    const config = rule.deadline_config as Record<string, unknown> | null;
    const title = config?.title_template as string;
    if (title) {
      return title.replace(/\{\{[^}]+\}\}/g, '[...]');
    }
    return `Ejecutó acción: ${rule.rule_type}`;
  }

  // Filter logs
  const filteredLogs = executionLogs.filter(log => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!log.rule_name.toLowerCase().includes(q) && 
          !log.target_reference.toLowerCase().includes(q)) {
        return false;
      }
    }
    
    if (statusFilter !== 'all' && log.status !== statusFilter) {
      return false;
    }

    // Date filter
    const logDate = new Date(log.executed_at);
    const now = new Date();
    if (dateFilter === '24h') {
      if (now.getTime() - logDate.getTime() > 86400000) return false;
    } else if (dateFilter === '7d') {
      if (now.getTime() - logDate.getTime() > 7 * 86400000) return false;
    } else if (dateFilter === '30d') {
      if (now.getTime() - logDate.getTime() > 30 * 86400000) return false;
    }

    return true;
  });

  if (isLoading) {
    return <ExecutionHistorySkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Historial de Ejecuciones</h1>
          <p className="text-muted-foreground">
            Registro de todas las automatizaciones ejecutadas
          </p>
        </div>
        <Button variant="outline" size="sm">
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
                  placeholder="Buscar por regla o expediente..."
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
                <SelectItem value="pending">Pendiente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Últimas 24h</SelectItem>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="all">Todo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredLogs.filter(l => l.status === 'success').length}
                </p>
                <p className="text-xs text-muted-foreground">Exitosas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredLogs.filter(l => l.status === 'error').length}
                </p>
                <p className="text-xs text-muted-foreground">Errores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredLogs.filter(l => l.status === 'pending').length}
                </p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No hay ejecuciones en el período seleccionado
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-480px)]">
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div className={cn(
                      "p-2 rounded-full",
                      log.status === 'success' && "bg-green-100",
                      log.status === 'error' && "bg-red-100",
                      log.status === 'pending' && "bg-amber-100"
                    )}>
                      {log.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      {log.status === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                      {log.status === 'pending' && <Clock className="h-4 w-4 text-amber-600" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{log.rule_name}</span>
                        <Badge variant="outline" className="shrink-0">
                          {log.action_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {log.details}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{log.target_reference}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(log.executed_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-right text-xs text-muted-foreground shrink-0">
                      <p>{format(new Date(log.executed_at), "d MMM", { locale: es })}</p>
                      <p>{format(new Date(log.executed_at), "HH:mm")}</p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
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
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
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
