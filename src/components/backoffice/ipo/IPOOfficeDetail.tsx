// src/components/backoffice/ipo/IPOOfficeDetail.tsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building,
  Plug,
  Key,
  FileText,
  Brain,
  DollarSign,
  RefreshCw,
  Play,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Eye,
  EyeOff,
  RotateCcw,
  Loader2,
  ArrowLeft,
  Calendar,
  Clock,
} from 'lucide-react';
import { useIPOOffice, useRunHealthCheck, useTriggerSync, useSyncLogs } from '@/hooks/backoffice/useIPORegistry';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { OFFICE_TIERS, HEALTH_STATUS_CONFIG, IP_TYPES_CONFIG, CONNECTION_METHOD_TYPES } from '@/lib/constants/ipo-registry';

export function IPOOfficeDetail() {
  const { officeId } = useParams<{ officeId: string }>();
  const { data: office, isLoading } = useIPOOffice(officeId);
  const { data: syncLogs } = useSyncLogs(officeId);
  const runHealthCheck = useRunHealthCheck();
  const triggerSync = useTriggerSync();
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!office) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Oficina no encontrada</p>
        <Button asChild variant="link">
          <Link to="/backoffice/ipo">Volver al listado</Link>
        </Button>
      </div>
    );
  }

  const primaryMethod = office.connection_methods?.find(m => m.priority === 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/backoffice/ipo">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{office.name_short || office.code}</h1>
              <Badge className={OFFICE_TIERS[office.tier as keyof typeof OFFICE_TIERS]?.color}>
                Tier {office.tier}
              </Badge>
              {primaryMethod && (
                <Badge 
                  variant="outline" 
                  className={HEALTH_STATUS_CONFIG[primaryMethod.health_status]?.color}
                >
                  {HEALTH_STATUS_CONFIG[primaryMethod.health_status]?.label}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{office.name_official}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => primaryMethod && runHealthCheck.mutate(primaryMethod.id)}
            disabled={runHealthCheck.isPending || !primaryMethod}
          >
            {runHealthCheck.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Health Check
          </Button>
          <Button
            onClick={() => triggerSync.mutate({ 
              officeId: office.id, 
              syncType: 'delta',
              connectionMethodId: primaryMethod?.id 
            })}
            disabled={triggerSync.isPending}
          >
            {triggerSync.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Sync Ahora
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="identity">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="identity" className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span className="hidden md:inline">Identidad</span>
          </TabsTrigger>
          <TabsTrigger value="connectivity" className="flex items-center gap-1">
            <Plug className="h-4 w-4" />
            <span className="hidden md:inline">Conectividad</span>
          </TabsTrigger>
          <TabsTrigger value="credentials" className="flex items-center gap-1">
            <Key className="h-4 w-4" />
            <span className="hidden md:inline">Credenciales</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            <span className="hidden md:inline">Knowledge</span>
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="hidden md:inline">Tasas</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab A: Identity */}
        <TabsContent value="identity">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Identificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Código ST.3</Label>
                    <p className="font-mono text-lg">{office.code}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Código alternativo</Label>
                    <p className="font-mono">{office.code_alt || '-'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nombre oficial</Label>
                  <p>{office.name_official}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Región</Label>
                    <p className="capitalize">{office.region?.replace('_', ' ') || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tipo</Label>
                    <Badge variant="outline" className="capitalize">{office.office_type}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipos de PI</Label>
                  <div className="flex gap-2 mt-1">
                    {office.ip_types?.map((ipType: string) => (
                      <Badge 
                        key={ipType} 
                        className={IP_TYPES_CONFIG[ipType as keyof typeof IP_TYPES_CONFIG]?.color}
                      >
                        {IP_TYPES_CONFIG[ipType as keyof typeof IP_TYPES_CONFIG]?.label || ipType}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración Regional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Zona horaria</Label>
                  <p className="font-mono">{office.timezone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Idiomas oficiales</Label>
                  <div className="flex gap-2 mt-1">
                    {office.languages?.map((lang: string) => (
                      <Badge key={lang} variant="outline">{lang.toUpperCase()}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Moneda</Label>
                  <p>{office.currency}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Website oficial</Label>
                    {office.website_official ? (
                      <a 
                        href={office.website_official} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary flex items-center gap-1 hover:underline"
                      >
                        {office.website_official}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-muted-foreground">-</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Portal de búsqueda</Label>
                    {office.website_search ? (
                      <a 
                        href={office.website_search} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary flex items-center gap-1 hover:underline"
                      >
                        {office.website_search}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-muted-foreground">-</p>
                    )}
                  </div>
                </div>

                {office.contacts && office.contacts.length > 0 && (
                  <div className="pt-4 border-t">
                    <Label className="mb-2 block text-muted-foreground">Directorio de contactos</Label>
                    <div className="space-y-2">
                      {office.contacts.map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <p className="font-medium text-sm capitalize">{contact.contact_type.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">{contact.email || contact.phone}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{contact.hours}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab B: Connectivity */}
        <TabsContent value="connectivity">
          <div className="space-y-6">
            {!office.connection_methods?.length ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No hay métodos de conexión configurados</p>
                  <Button className="mt-4">Añadir método de conexión</Button>
                </CardContent>
              </Card>
            ) : (
              office.connection_methods.map((method) => (
                <Card 
                  key={method.id} 
                  className={method.health_status === 'unhealthy' ? 'border-red-500' : ''}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={method.priority === 1 ? 'default' : 'secondary'}>
                          {CONNECTION_METHOD_TYPES[method.method_type]?.label || method.method_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Prioridad: {method.priority}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${HEALTH_STATUS_CONFIG[method.health_status]?.bgColor}`} />
                      </div>
                      <Switch checked={method.is_enabled} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* API Config */}
                    {method.method_type === 'api' && method.api_config?.[0] && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-muted-foreground">Endpoint Base</Label>
                          <p className="font-mono text-sm bg-muted p-2 rounded">
                            {method.api_config[0].base_url}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Autenticación</Label>
                            <Badge variant="outline">{method.api_config[0].auth_type}</Badge>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Rate Limit</Label>
                            <p className="text-sm">{method.rate_limit_requests || '-'}/{method.rate_limit_period || '-'}s</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Versión API</Label>
                            <p className="text-sm">{method.api_config[0].api_version || 'v1'}</p>
                          </div>
                        </div>
                        {method.api_config[0].subscription_end && (
                          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-amber-600" />
                            <span className="text-sm">
                              Suscripción expira: {format(new Date(method.api_config[0].subscription_end), 'dd/MM/yyyy')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Scraper Config */}
                    {method.method_type === 'scraper' && method.scraper_config?.[0] && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-muted-foreground">Target URL</Label>
                          <p className="font-mono text-sm bg-muted p-2 rounded">
                            {method.scraper_config[0].target_url}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Script Version</Label>
                            <p className="text-sm">{method.scraper_config[0].script_version || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Generado por</Label>
                            <Badge variant="outline">
                              {method.scraper_config[0].script_generated_by === 'ai_auto_mend' ? '🤖 Auto-Mend' : '👤 Manual'}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">CAPTCHA</Label>
                            <p className="text-sm">{method.scraper_config[0].captcha_strategy || 'none'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Health metrics */}
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                      <div>
                        <Label className="text-xs text-muted-foreground">Última sync</Label>
                        <p className="text-sm">
                          {method.last_successful_sync 
                            ? formatDistanceToNow(new Date(method.last_successful_sync), { addSuffix: true, locale: es })
                            : 'Nunca'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Tiempo respuesta</Label>
                        <p className="text-sm">{method.avg_response_time_ms || '-'} ms</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Éxito 7d</Label>
                        <p className="text-sm">{method.success_rate_7d?.toFixed(1) || '-'}%</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Fallos consecutivos</Label>
                        <p className={`text-sm ${method.consecutive_failures > 0 ? 'text-red-600 font-bold' : ''}`}>
                          {method.consecutive_failures}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab C: Credentials */}
        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Bóveda de Credenciales
              </CardTitle>
              <CardDescription>
                Las credenciales están encriptadas. Solo usuarios autorizados pueden verlas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge>API Key</Badge>
                      <span className="text-sm text-muted-foreground">Client ID</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowCredentials(prev => ({ ...prev, clientId: !prev.clientId }))}
                    >
                      {showCredentials.clientId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="font-mono bg-muted p-2 rounded text-sm">
                    {showCredentials.clientId ? 'abc123-real-client-id' : '••••••••••••••••'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Expira: 15/05/2027</span>
                    <Button variant="ghost" size="sm">
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Rotar
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center py-4">
                  Las credenciales reales se gestionan de forma segura en Supabase Vault
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab D: Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Sincronizaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {!syncLogs?.length ? (
                    <p className="text-center text-muted-foreground py-8">No hay logs de sincronización</p>
                  ) : (
                    syncLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className={`p-3 rounded-lg border ${
                          log.status === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20' :
                          log.status === 'partial' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20' :
                          log.status === 'failed' ? 'bg-red-50 border-red-200 dark:bg-red-900/20' :
                          'bg-blue-50 border-blue-200 dark:bg-blue-900/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {log.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {log.status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                            {log.status === 'running' && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
                            <span className="font-medium text-sm uppercase">{log.sync_type}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.started_at), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Obtenidos:</span> {log.records_fetched}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Creados:</span> {log.records_created}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Actualizados:</span> {log.records_updated}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Errores:</span> {log.records_failed}
                          </div>
                        </div>
                        {log.errors?.length > 0 && (
                          <div className="mt-2 text-xs text-red-600">
                            {log.errors[0]?.message}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab E: Knowledge Base */}
        <TabsContent value="knowledge">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fuentes Legales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {office.knowledge_base?.filter(k => k.knowledge_type.includes('law')).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No hay fuentes legales configuradas</p>
                  ) : (
                    office.knowledge_base?.filter(k => k.knowledge_type.includes('law')).map((kb) => (
                      <div key={kb.id} className="p-3 border rounded-lg">
                        <p className="font-medium text-sm">{kb.title}</p>
                        {kb.content_url && (
                          <a href={kb.content_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                            {kb.content_url}
                          </a>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Última verificación: {kb.last_verified_at ? format(new Date(kb.last_verified_at), 'dd/MM/yyyy') : 'Nunca'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reglas de Plazos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!office.deadline_rules?.length ? (
                    <p className="text-muted-foreground text-center py-4">No hay reglas de plazos configuradas</p>
                  ) : (
                    office.deadline_rules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <span className="text-sm capitalize">{rule.deadline_type.replace(/_/g, ' ')}</span>
                          <p className="text-xs text-muted-foreground">{rule.ip_type}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {rule.days ? `${rule.days}d` : rule.months ? `${rule.months}m` : rule.years ? `${rule.years}y` : '-'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab F: Fees */}
        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Tasas Oficiales</span>
                {office.fees?.[0]?.last_verified_at && (
                  <Badge variant="outline">
                    Actualizado: {format(new Date(office.fees[0].last_verified_at), 'dd/MM/yyyy')}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!office.fees?.length ? (
                <p className="text-muted-foreground text-center py-8">No hay tasas configuradas</p>
              ) : (
                <div className="space-y-6">
                  {(['trademark', 'patent', 'design'] as const).map(ipType => {
                    const fees = office.fees?.filter(f => f.ip_type === ipType);
                    if (!fees?.length) return null;
                    
                    return (
                      <div key={ipType}>
                        <h4 className="font-medium mb-2">
                          {IP_TYPES_CONFIG[ipType]?.label || ipType}
                        </h4>
                        <div className="grid gap-2">
                          {fees.map((fee) => (
                            <div key={fee.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div>
                                <p className="text-sm capitalize">{fee.fee_type.replace(/_/g, ' ')}</p>
                                {fee.per_class && (
                                  <p className="text-xs text-muted-foreground">
                                    +{fee.additional_class_fee} {fee.currency}/clase adicional
                                  </p>
                                )}
                              </div>
                              <span className="font-mono font-medium">
                                {fee.amount} {fee.currency}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
