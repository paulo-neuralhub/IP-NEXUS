// src/pages/backoffice/ipo/logs.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Search, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface RequestLog {
  id: string;
  office_code: string;
  tenant_id?: string;
  matter_id?: string;
  endpoint: string;
  method: string;
  request_params?: Record<string, unknown>;
  status_code: number;
  response_size_bytes?: number;
  response_summary?: Record<string, unknown>;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  duration_ms: number;
  created_at: string;
}

export default function OfficeLogsPage() {
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('today');
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  // Fetch offices
  const { data: offices = [] } = useQuery({
    queryKey: ['ipo-offices-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipo_offices')
        .select('code, name_official')
        .order('name_official');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch logs
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['office-request-logs', selectedOffice, selectedStatus, searchTerm, dateRange, page],
    queryFn: async () => {
      let query = supabase
        .from('office_request_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (selectedOffice !== 'all') {
        query = query.eq('office_code', selectedOffice);
      }
      
      if (selectedStatus === 'success') {
        query = query.gte('status_code', 200).lt('status_code', 300);
      } else if (selectedStatus === 'error') {
        query = query.gte('status_code', 400);
      } else if (selectedStatus === 'timeout') {
        query = query.eq('status_code', 408);
      }

      if (searchTerm) {
        query = query.or(`endpoint.ilike.%${searchTerm}%,error_message.ilike.%${searchTerm}%`);
      }

      // Date filter
      const now = new Date();
      if (dateRange === 'today') {
        query = query.gte('created_at', new Date(now.setHours(0, 0, 0, 0)).toISOString());
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte('created_at', weekAgo.toISOString());
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte('created_at', monthAgo.toISOString());
      }
      
      const { data, error, count } = await query;
      if (error) throw error;
      return { logs: data as RequestLog[], total: count || 0 };
    }
  });

  const logs = logsData?.logs || [];
  const totalLogs = logsData?.total || 0;
  const totalPages = Math.ceil(totalLogs / pageSize);

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-100 text-green-800 border-0">{statusCode}</Badge>;
    } else if (statusCode === 408) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-0">{statusCode}</Badge>;
    } else if (statusCode === 429) {
      return <Badge className="bg-orange-100 text-orange-800 border-0">{statusCode}</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-0">{statusCode}</Badge>;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${ms}ms`;
  };

  const exportCSV = () => {
    const headers = ['Fecha', 'Hora', 'Oficina', 'Endpoint', 'Método', 'Status', 'Duración', 'Error'];
    const rows = logs.map(log => [
      format(new Date(log.created_at), 'yyyy-MM-dd'),
      format(new Date(log.created_at), 'HH:mm:ss'),
      log.office_code,
      log.endpoint,
      log.method,
      log.status_code,
      log.duration_ms,
      log.error_message || ''
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `office-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Logs de Requests</h1>
          <p className="text-muted-foreground">
            Historial de peticiones a oficinas de PI
          </p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label>Oficina:</Label>
              <Select value={selectedOffice} onValueChange={(v) => { setSelectedOffice(v); setPage(0); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {offices.map((o) => (
                    <SelectItem key={o.code} value={o.code}>{o.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); setPage(0); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="success">✓ Éxito (2xx)</SelectItem>
                  <SelectItem value="error">✗ Error (4xx/5xx)</SelectItem>
                  <SelectItem value="timeout">⏱ Timeout (408)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Periodo:</Label>
              <Select value={dateRange} onValueChange={(v) => { setDateRange(v); setPage(0); }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="all">Todo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar endpoint, error..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {totalLogs.toLocaleString()} requests encontrados
            </CardTitle>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page + 1} de {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay logs para los filtros seleccionados</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Oficina</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow 
                    key={log.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedLog(log)}
                  >
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.created_at), 'HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.office_code}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[300px] truncate">
                      <span className="text-muted-foreground">{log.method}</span>{' '}
                      {log.endpoint}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status_code)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatDuration(log.duration_ms)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-destructive">
                      {log.error_message}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Detalle de Request</DialogTitle>
            <DialogDescription>
              {selectedLog && format(new Date(selectedLog.created_at), 'dd/MM/yyyy HH:mm:ss')}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Oficina</Label>
                    <p className="font-medium">{selectedLog.office_code}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <p>{getStatusBadge(selectedLog.status_code)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Método</Label>
                    <p className="font-medium">{selectedLog.method}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Duración</Label>
                    <p className="font-medium">{formatDuration(selectedLog.duration_ms)}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Endpoint</Label>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{selectedLog.endpoint}</p>
                </div>

                {selectedLog.request_params && (
                  <div>
                    <Label className="text-muted-foreground">Request Params</Label>
                    <pre className="font-mono text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(selectedLog.request_params, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.response_summary && (
                  <div>
                    <Label className="text-muted-foreground">Response Summary</Label>
                    <pre className="font-mono text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(selectedLog.response_summary, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.error_message && (
                  <div>
                    <Label className="text-muted-foreground text-destructive">Error</Label>
                    <p className="font-mono text-sm bg-destructive/10 text-destructive p-2 rounded">
                      {selectedLog.error_message}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Response Size</Label>
                    <p>{selectedLog.response_size_bytes ? `${(selectedLog.response_size_bytes / 1024).toFixed(1)} KB` : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Matter ID</Label>
                    <p className="font-mono text-xs">{selectedLog.matter_id || '-'}</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
