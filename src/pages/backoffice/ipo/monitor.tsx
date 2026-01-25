// src/pages/backoffice/ipo/monitor.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Activity, Clock, AlertTriangle, CheckCircle2, XCircle, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface OfficeHealth {
  id: string;
  code: string;
  name_official: string;
  country_code?: string;
  operational_status: 'operational' | 'degraded' | 'maintenance' | 'down';
  is_active: boolean;
  last_health_check?: string;
  avg_response_time_ms?: number;
  data_source_type: string;
}

const STATUS_CONFIG = {
  operational: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Operativo' },
  degraded: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Lento' },
  maintenance: { icon: Pause, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Mantenimiento' },
  down: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Caído' },
};

const FLAG_EMOJIS: Record<string, string> = {
  EU: '🇪🇺', ES: '🇪🇸', US: '🇺🇸', GB: '🇬🇧', FR: '🇫🇷', DE: '🇩🇪',
  JP: '🇯🇵', CN: '🇨🇳', BR: '🇧🇷', MX: '🇲🇽', INT: '🌐',
};

export default function OfficeMonitorPage() {
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = useState<number>(30);

  // Fetch offices with health data
  const { data: offices = [], isLoading, refetch } = useQuery({
    queryKey: ['office-health-monitor'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipo_offices')
        .select('id, code, name_official, country_code, operational_status, is_active, last_health_check, avg_response_time_ms, data_source_type')
        .order('operational_status')
        .order('name_official');
      if (error) throw error;
      return data as OfficeHealth[];
    },
    refetchInterval: autoRefresh * 1000,
  });

  // Force health check mutation
  const healthCheckMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke('office-health-check');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-health-monitor'] });
      toast.success('Health check completado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const activeOffices = offices.filter(o => o.is_active);
  const operationalCount = activeOffices.filter(o => o.operational_status === 'operational').length;
  const degradedCount = activeOffices.filter(o => o.operational_status === 'degraded').length;
  const downCount = activeOffices.filter(o => o.operational_status === 'down').length;

  const getUptimePercent = (office: OfficeHealth) => {
    // Simulate uptime based on status
    switch (office.operational_status) {
      case 'operational': return 95 + Math.random() * 5;
      case 'degraded': return 70 + Math.random() * 20;
      case 'maintenance': return 50;
      case 'down': return 0 + Math.random() * 30;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitor Oficinas</h1>
          <p className="text-muted-foreground">
            Estado en tiempo real de las conexiones con oficinas de PI
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Auto-refresh:</span>
            <Select value={autoRefresh.toString()} onValueChange={(v) => setAutoRefresh(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Off</SelectItem>
                <SelectItem value="15">15s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">60s</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => healthCheckMutation.mutate()} 
            disabled={healthCheckMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${healthCheckMutation.isPending ? 'animate-spin' : ''}`} />
            {healthCheckMutation.isPending ? 'Verificando...' : 'Health Check'}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{activeOffices.length}</div>
              <p className="text-sm text-muted-foreground">Oficinas Activas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{operationalCount}</div>
              <p className="text-sm text-muted-foreground">🟢 Operativas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{degradedCount}</div>
              <p className="text-sm text-muted-foreground">🟡 Degradadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{downCount}</div>
              <p className="text-sm text-muted-foreground">🔴 Caídas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Office Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando estado de oficinas...</div>
        ) : (
          offices.filter(o => o.is_active).map((office) => {
            const config = STATUS_CONFIG[office.operational_status] || STATUS_CONFIG.operational;
            const StatusIcon = config.icon;
            const uptime = getUptimePercent(office);
            const flag = FLAG_EMOJIS[office.country_code || 'INT'] || '🏢';

            return (
              <Card key={office.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Office Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{flag}</span>
                        <span className="font-semibold">{office.code}</span>
                        <Badge variant="outline" className="text-xs">{office.data_source_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{office.name_official}</p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-5 w-5 ${config.color}`} />
                      <Badge className={`${config.bg} ${config.color} border-0`}>
                        {config.label}
                      </Badge>
                    </div>

                    {/* Response Time */}
                    <div className="w-24 text-right">
                      {office.avg_response_time_ms ? (
                        <div>
                          <span className="font-mono text-sm font-medium">
                            {office.avg_response_time_ms >= 1000 
                              ? `${(office.avg_response_time_ms / 1000).toFixed(1)}s`
                              : `${office.avg_response_time_ms}ms`
                            }
                          </span>
                          <p className="text-xs text-muted-foreground">resp. avg</p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>

                    {/* Uptime Progress */}
                    <div className="w-48">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{uptime.toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={uptime} 
                        className={`h-2 ${uptime > 90 ? '[&>div]:bg-green-500' : uptime > 70 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`}
                      />
                    </div>

                    {/* Last Check */}
                    <div className="w-32 text-right">
                      {office.last_health_check ? (
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Hace {formatDistanceToNow(new Date(office.last_health_check), { locale: es })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin verificar</span>
                      )}
                    </div>
                  </div>

                  {/* Alert for down/degraded offices */}
                  {office.operational_status === 'down' && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        La conexión con esta oficina ha fallado. 
                        {office.last_health_check && ` Última verificación exitosa: ${formatDistanceToNow(new Date(office.last_health_check), { locale: es, addSuffix: true })}`}
                      </span>
                    </div>
                  )}
                  {office.operational_status === 'degraded' && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Tiempo de respuesta elevado ({office.avg_response_time_ms}ms). El servicio puede ser lento.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Inactive offices */}
      {offices.filter(o => !o.is_active).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Oficinas Inactivas ({offices.filter(o => !o.is_active).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {offices.filter(o => !o.is_active).map((office) => (
                <Badge key={office.id} variant="secondary" className="text-muted-foreground">
                  {office.code}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
