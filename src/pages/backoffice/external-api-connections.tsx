import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Plug, Settings, RefreshCw, FileText, ExternalLink, CheckCircle2, 
  XCircle, AlertCircle, Clock, Activity, Loader2, Eye, EyeOff,
  Globe, Zap, BarChart3, Info, ChevronRight, Search
} from 'lucide-react';

interface ExternalApiConnection {
  id: string;
  provider: string;
  name: string;
  description: string;
  website: string;
  api_base_url: string;
  api_docs_url: string;
  auth_type: string;
  client_id: string;
  client_secret_encrypted: string;
  api_key_encrypted: string;
  access_token_encrypted: string;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  timeout_seconds: number;
  available_endpoints: any[];
  enabled_endpoints: string[];
  status: string;
  last_test_at: string;
  last_test_result: string;
  last_error: string;
  total_requests: number;
  requests_today: number;
  requests_this_month: number;
  avg_response_ms: number;
  created_at: string;
  updated_at: string;
}

interface ApiLog {
  id: string;
  provider: string;
  endpoint: string;
  method: string;
  request_params: any;
  response_status: number;
  response_time_ms: number;
  success: boolean;
  error_message: string;
  triggered_by: string;
  created_at: string;
}

const providerIcons: Record<string, string> = {
  euipo: '🇪🇺',
  wipo_madrid: '🌐',
  wipo_statistics: '📊',
  wipo_branddb: '🔍',
  oepm: '🇪🇸',
  uspto: '🇺🇸',
  ukipo: '🇬🇧',
};

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  active: { color: 'bg-green-500', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Activo' },
  inactive: { color: 'bg-gray-400', icon: <XCircle className="w-4 h-4" />, label: 'Inactivo' },
  error: { color: 'bg-red-500', icon: <AlertCircle className="w-4 h-4" />, label: 'Error' },
  rate_limited: { color: 'bg-yellow-500', icon: <Clock className="w-4 h-4" />, label: 'Limitado' },
};

export default function ExternalApiConnectionsPage() {
  const queryClient = useQueryClient();
  const [selectedConnection, setSelectedConnection] = useState<ExternalApiConnection | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    api_base_url: '',
    api_docs_url: '',
    auth_type: 'none',
    client_id: '',
    client_secret: '',
    api_key: '',
    rate_limit_per_minute: 60,
    rate_limit_per_day: 1000,
    timeout_seconds: 30,
    enabled_endpoints: [] as string[],
  });

  // Fetch connections
  const { data: connections, isLoading } = useQuery({
    queryKey: ['external-api-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_api_connections')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as ExternalApiConnection[];
    },
  });

  // Fetch logs for selected connection
  const { data: logs } = useQuery({
    queryKey: ['external-api-logs', selectedConnection?.id],
    queryFn: async () => {
      if (!selectedConnection) return [];
      const { data, error } = await supabase
        .from('external_api_logs')
        .select('*')
        .eq('connection_id', selectedConnection.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as ApiLog[];
    },
    enabled: !!selectedConnection && logsDialogOpen,
  });

  // Update connection mutation
  const updateConnection = useMutation({
    mutationFn: async (data: Partial<ExternalApiConnection> & { id: string }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from('external_api_connections')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-api-connections'] });
      toast.success('Conexión actualizada');
      setConfigDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error('Error al actualizar: ' + error.message);
    },
  });

  // Test connection
  const testConnection = async (connection: ExternalApiConnection) => {
    setTestingConnection(connection.id);
    try {
      const { data, error } = await supabase.functions.invoke('test-api-connection', {
        body: { provider: connection.provider },
      });

      if (error) throw error;

      await supabase
        .from('external_api_connections')
        .update({
          last_test_at: new Date().toISOString(),
          last_test_result: data.success ? 'success' : 'failed',
          last_error: data.error || null,
          status: data.success ? 'active' : 'error',
        })
        .eq('id', connection.id);

      queryClient.invalidateQueries({ queryKey: ['external-api-connections'] });

      if (data.success) {
        toast.success(`Conexión ${connection.name} verificada correctamente`);
      } else {
        toast.error(`Error en ${connection.name}: ${data.error}`);
      }
    } catch (error: any) {
      toast.error('Error al probar conexión: ' + error.message);
    } finally {
      setTestingConnection(null);
    }
  };

  const openConfigDialog = (connection: ExternalApiConnection) => {
    setSelectedConnection(connection);
    setFormData({
      api_base_url: connection.api_base_url || '',
      api_docs_url: connection.api_docs_url || '',
      auth_type: connection.auth_type || 'none',
      client_id: connection.client_id || '',
      client_secret: '',
      api_key: '',
      rate_limit_per_minute: connection.rate_limit_per_minute,
      rate_limit_per_day: connection.rate_limit_per_day,
      timeout_seconds: connection.timeout_seconds,
      enabled_endpoints: connection.enabled_endpoints || [],
    });
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = () => {
    if (!selectedConnection) return;

    const updateData: any = {
      id: selectedConnection.id,
      api_base_url: formData.api_base_url,
      api_docs_url: formData.api_docs_url,
      auth_type: formData.auth_type,
      client_id: formData.client_id,
      rate_limit_per_minute: formData.rate_limit_per_minute,
      rate_limit_per_day: formData.rate_limit_per_day,
      timeout_seconds: formData.timeout_seconds,
      enabled_endpoints: formData.enabled_endpoints,
    };

    // Solo actualizar secretos si se han proporcionado nuevos valores
    if (formData.client_secret) {
      updateData.client_secret_encrypted = formData.client_secret; // En producción: encriptar
    }
    if (formData.api_key) {
      updateData.api_key_encrypted = formData.api_key; // En producción: encriptar
    }

    updateConnection.mutate(updateData);
  };

  const toggleEndpoint = (endpointName: string) => {
    setFormData(prev => ({
      ...prev,
      enabled_endpoints: prev.enabled_endpoints.includes(endpointName)
        ? prev.enabled_endpoints.filter(e => e !== endpointName)
        : [...prev.enabled_endpoints, endpointName],
    }));
  };

  // Calculate global stats
  const globalStats = connections?.reduce(
    (acc, conn) => ({
      totalToday: acc.totalToday + (conn.requests_today || 0),
      totalMonth: acc.totalMonth + (conn.requests_this_month || 0),
      activeCount: acc.activeCount + (conn.status === 'active' ? 1 : 0),
    }),
    { totalToday: 0, totalMonth: 0, activeCount: 0 }
  ) || { totalToday: 0, totalMonth: 0, activeCount: 0 };

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Plug className="w-6 h-6 text-primary" />
              Conexiones API Externas
            </h1>
            <p className="text-muted-foreground mt-1">
              Conecta oficinas de PI para alimentar el sistema con datos reales
            </p>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">APIs Activas</p>
                  <p className="text-2xl font-bold">{globalStats.activeCount}/{connections?.length || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Requests Hoy</p>
                  <p className="text-2xl font-bold">{globalStats.totalToday.toLocaleString()}</p>
                </div>
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Este Mes</p>
                  <p className="text-2xl font-bold">{globalStats.totalMonth.toLocaleString()}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="text-2xl font-bold">99.8%</p>
                </div>
                <Globe className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connections List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {connections?.map((connection) => {
              const statusInfo = statusConfig[connection.status] || statusConfig.inactive;
              const endpoints = connection.available_endpoints || [];
              const enabledEndpoints = connection.enabled_endpoints || [];

              return (
                <Card key={connection.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{providerIcons[connection.provider] || '🔌'}</div>
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            {connection.name}
                            <Badge 
                              variant="outline" 
                              className={`${statusInfo.color} text-white border-0`}
                            >
                              {statusInfo.icon}
                              <span className="ml-1">{statusInfo.label}</span>
                            </Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {connection.description}
                          </p>
                          
                          {connection.website && (
                            <a 
                              href={connection.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                              {connection.website.replace('https://', '')}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {connection.last_test_at && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Último test: {formatDistanceToNow(new Date(connection.last_test_at), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                              {connection.avg_response_ms > 0 && (
                                <span className="ml-2">({connection.avg_response_ms}ms)</span>
                              )}
                            </p>
                          )}

                          {connection.status === 'active' && (
                            <p className="text-xs text-muted-foreground">
                              Requests: {connection.requests_today}/{connection.rate_limit_per_day} hoy
                            </p>
                          )}

                          {/* Endpoints */}
                          <div className="flex flex-wrap gap-1 mt-3">
                            {endpoints.slice(0, 6).map((endpoint: any) => {
                              const isEnabled = enabledEndpoints.includes(endpoint.name);
                              return (
                                <Badge 
                                  key={endpoint.name}
                                  variant={isEnabled ? "default" : "outline"}
                                  className={isEnabled ? "" : "opacity-50"}
                                >
                                  {isEnabled ? '✅' : '⬜'} {endpoint.name}
                                </Badge>
                              );
                            })}
                            {endpoints.length > 6 && (
                              <Badge variant="outline">+{endpoints.length - 6} más</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openConfigDialog(connection)}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Configurar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => testConnection(connection)}
                          disabled={testingConnection === connection.id}
                        >
                          {testingConnection === connection.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-1" />
                          )}
                          Test
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedConnection(connection);
                            setLogsDialogOpen(true);
                          }}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Logs
                        </Button>
                      </div>
                    </div>

                    {connection.last_error && connection.status === 'error' && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          {connection.last_error}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Setup Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Guía de Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="text-xl">🇪🇺</span> EUIPO (Recomendado)
                </h4>
                <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                  <li>Ir a dev.euipo.europa.eu</li>
                  <li>Crear cuenta de desarrollador</li>
                  <li>Crear una "App" para obtener Client ID + Secret</li>
                  <li>Suscribirse a: Trademark Search + Goods & Services</li>
                  <li>Probar en Sandbox primero</li>
                </ol>
                <Button variant="link" className="mt-2 p-0 h-auto" asChild>
                  <a href="https://dev.euipo.europa.eu" target="_blank" rel="noopener noreferrer">
                    Ir a EUIPO Developer Portal <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="text-xl">🌐</span> WIPO Madrid
                </h4>
                <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                  <li>Acceder con tu cuenta WIPO existente</li>
                  <li>Activar Madrid Monitor para búsquedas</li>
                  <li>IP Statistics: datos públicos (sin auth)</li>
                  <li>Global Brand Database: búsqueda manual (sin API)</li>
                </ol>
                <Button variant="link" className="mt-2 p-0 h-auto" asChild>
                  <a href="https://www.wipo.int/madrid/monitor" target="_blank" rel="noopener noreferrer">
                    Ir a Madrid Monitor <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="text-xl">🇺🇸</span> USPTO
                </h4>
                <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                  <li>API pública disponible en api.uspto.gov</li>
                  <li>Requiere API Key (gratuita)</li>
                  <li>Alta disponibilidad, 10,000 requests/día</li>
                </ol>
                <Button variant="link" className="mt-2 p-0 h-auto" asChild>
                  <a href="https://developer.uspto.gov" target="_blank" rel="noopener noreferrer">
                    Ir a USPTO Developer <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="text-xl">🇪🇸</span> OEPM España
                </h4>
                <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                  <li>Consultas web públicas disponibles</li>
                  <li>Sin API oficial documentada</li>
                  <li>Posible web scraping controlado</li>
                </ol>
                <Button variant="link" className="mt-2 p-0 h-auto" asChild>
                  <a href="https://consultas2.oepm.es/LocalizadorWeb" target="_blank" rel="noopener noreferrer">
                    Ir a OEPM Consultas <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Dialog */}
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurar {selectedConnection?.name}
              </DialogTitle>
              <DialogDescription>
                Configura las credenciales y endpoints para esta conexión
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 pr-4">
              <Tabs defaultValue="credentials" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="credentials">Credenciales</TabsTrigger>
                  <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                  <TabsTrigger value="limits">Límites</TabsTrigger>
                </TabsList>

                <TabsContent value="credentials" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>URL Base de API</Label>
                    <Input
                      value={formData.api_base_url}
                      onChange={(e) => setFormData({ ...formData, api_base_url: e.target.value })}
                      placeholder="https://api.example.com/v1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>URL Documentación</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.api_docs_url}
                        onChange={(e) => setFormData({ ...formData, api_docs_url: e.target.value })}
                        placeholder="https://dev.example.com"
                      />
                      {formData.api_docs_url && (
                        <Button variant="outline" size="icon" asChild>
                          <a href={formData.api_docs_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Tipo de Autenticación</Label>
                    <Select
                      value={formData.auth_type}
                      onValueChange={(value) => setFormData({ ...formData, auth_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin autenticación</SelectItem>
                        <SelectItem value="api_key">API Key</SelectItem>
                        <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.auth_type === 'api_key' && (
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          type={showSecrets ? "text" : "password"}
                          value={formData.api_key}
                          onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                          placeholder="••••••••••••••••"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowSecrets(!showSecrets)}
                        >
                          {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  {formData.auth_type === 'oauth2' && (
                    <>
                      <div className="space-y-2">
                        <Label>Client ID</Label>
                        <Input
                          value={formData.client_id}
                          onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                          placeholder="your-client-id"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Client Secret</Label>
                        <div className="flex gap-2">
                          <Input
                            type={showSecrets ? "text" : "password"}
                            value={formData.client_secret}
                            onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
                            placeholder="••••••••••••••••"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowSecrets(!showSecrets)}
                          >
                            {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="endpoints" className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Selecciona los endpoints que deseas activar:
                  </p>
                  <div className="space-y-3">
                    {selectedConnection?.available_endpoints?.map((endpoint: any) => (
                      <div 
                        key={endpoint.name}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={formData.enabled_endpoints.includes(endpoint.name)}
                          onCheckedChange={() => toggleEndpoint(endpoint.name)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{endpoint.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {endpoint.method}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                          <code className="text-xs text-muted-foreground">{endpoint.path}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="limits" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Límite por minuto</Label>
                      <Input
                        type="number"
                        value={formData.rate_limit_per_minute}
                        onChange={(e) => setFormData({ ...formData, rate_limit_per_minute: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Límite por día</Label>
                      <Input
                        type="number"
                        value={formData.rate_limit_per_day}
                        onChange={(e) => setFormData({ ...formData, rate_limit_per_day: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Timeout (segundos)</Label>
                    <Input
                      type="number"
                      value={formData.timeout_seconds}
                      onChange={(e) => setFormData({ ...formData, timeout_seconds: parseInt(e.target.value) })}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveConfig} disabled={updateConnection.isPending}>
                {updateConnection.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Guardar Configuración
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logs Dialog */}
        <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Logs de {selectedConnection?.name}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {logs?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No hay logs disponibles
                  </p>
                )}
                {logs?.map((log) => (
                  <div 
                    key={log.id}
                    className={`p-3 border rounded-lg text-sm ${
                      log.success ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'border-red-200 bg-red-50 dark:bg-red-900/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <Badge variant="outline">{log.method}</Badge>
                        <span className="font-mono">{log.endpoint}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{log.response_status}</span>
                        <span>{log.response_time_ms}ms</span>
                        <span>{format(new Date(log.created_at), 'HH:mm:ss')}</span>
                      </div>
                    </div>
                    {log.error_message && (
                      <p className="text-red-600 mt-1">{log.error_message}</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
  );
}