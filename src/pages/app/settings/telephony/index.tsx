// ============================================================
// IP-NEXUS APP - Tenant Telephony Settings Page
// ============================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  MessageSquare, 
  Clock, 
  TrendingUp,
  Settings2,
  AlertTriangle,
  ChevronRight,
  PhoneOutgoing,
  PhoneIncoming,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useTenantTelephonyBalance, useTelephonyUsageLogs, useUpdateTelephonySettings } from '@/hooks/useTenantTelephony';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatPhoneNumber(phone: string | null): string {
  if (!phone) return 'Desconocido';
  // Mask middle digits for privacy
  if (phone.length > 8) {
    return phone.slice(0, 4) + '...' + phone.slice(-4);
  }
  return phone;
}

interface TelephonySettingsPageProps {
  embedded?: boolean;
}

export default function TelephonySettingsPage({ embedded = false }: TelephonySettingsPageProps) {
  const { data: balance, isLoading: isLoadingBalance } = useTenantTelephonyBalance();
  const { data: usageLogs = [], isLoading: isLoadingLogs } = useTelephonyUsageLogs(10);
  const updateSettings = useUpdateTelephonySettings();

  const [isEnabled, setIsEnabled] = useState(balance?.is_enabled ?? true);
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState(balance?.low_balance_threshold ?? 30);
  const [accessMode, setAccessMode] = useState<string>('all');

  const hasBalance = balance && balance.minutes_balance > 0;
  const balancePercentage = balance
    ? (balance.minutes_balance / (balance.minutes_balance + balance.total_minutes_used)) * 100
    : 0;
  const isLowBalance = balance && balance.minutes_balance <= (balance.low_balance_threshold || 30);

  // Calculate monthly stats
  const monthlyStats = {
    calls: usageLogs.filter(l => l.usage_type === 'call').length,
    totalMinutes: usageLogs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0),
    sms: usageLogs.filter(l => l.usage_type === 'sms').length,
    avgDuration: usageLogs.length > 0
      ? usageLogs.reduce((sum, l) => sum + (l.duration_seconds || 0), 0) / usageLogs.filter(l => l.usage_type === 'call').length
      : 0
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings.mutateAsync({
        is_enabled: isEnabled,
        low_balance_threshold: lowBalanceThreshold,
      });
      toast.success('Configuración guardada');
    } catch {
      toast.error('Error al guardar configuración');
    }
  };

  // Group calls by date
  const groupedCalls = usageLogs.reduce((acc, log) => {
    const date = format(new Date(log.created_at), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof usageLogs>);

  // When embedded, skip container wrapper
  const Wrapper = embedded 
    ? ({ children }: { children: React.ReactNode }) => <div className="space-y-6">{children}</div>
    : ({ children }: { children: React.ReactNode }) => <div className="container max-w-4xl py-6 space-y-6">{children}</div>;

  return (
    <Wrapper>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Telefonía</h1>
          <p className="text-muted-foreground">Gestiona tu saldo y configuración de telefonía</p>
        </div>
        <Button asChild>
          <Link to="/app/settings/telephony/packs">
            + Comprar minutos
          </Link>
        </Button>
      </div>

      {/* Balance Card */}
      <Card className={isLowBalance ? 'border-warning' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Mi Saldo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingBalance ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-muted rounded-lg" />
            </div>
          ) : !hasBalance ? (
            /* No balance state */
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-4">
                <span className="text-3xl font-bold text-destructive">0</span>
              </div>
              <p className="text-lg font-medium text-foreground mb-1">minutos disponibles</p>
              <p className="text-muted-foreground mb-6">
                No tienes minutos disponibles. Compra un pack para realizar llamadas.
              </p>
              <Button asChild size="lg">
                <Link to="/app/settings/telephony/packs">
                  Comprar pack de minutos
                </Link>
              </Button>
            </div>
          ) : (
            /* Has balance state */
            <div className="space-y-6">
              <div className="text-center py-4">
                <div className="inline-flex flex-col items-center justify-center p-6 rounded-xl bg-primary/5 border border-primary/10">
                  <span className="text-4xl font-bold text-primary mb-1">
                    {balance.minutes_balance.toLocaleString()}
                  </span>
                  <span className="text-lg text-muted-foreground">minutos disponibles</span>
                  
                  <div className="w-full mt-4 space-y-2">
                    <Progress value={balancePercentage} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      {balancePercentage.toFixed(0)}% restante de tu saldo
                    </p>
                  </div>
                </div>
              </div>

              {isLowBalance && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Saldo bajo - considera recargar minutos
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">SMS disponibles: </span>
                  <span className="font-medium">{balance.sms_balance}</span>
                </div>
                {balance.outbound_caller_id && (
                  <div>
                    <span className="text-muted-foreground">Caller ID: </span>
                    <span className="font-medium">{balance.outbound_caller_id}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/app/settings/telephony/packs">
                    + Comprar más minutos
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <PhoneOutgoing className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{monthlyStats.calls}</p>
            <p className="text-xs text-muted-foreground">Llamadas realizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">
              {Math.floor(monthlyStats.totalMinutes)}:{((monthlyStats.totalMinutes % 1) * 60).toFixed(0).padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground">Total minutos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <MessageSquare className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{monthlyStats.sms}</p>
            <p className="text-xs text-muted-foreground">SMS enviados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">
              {monthlyStats.avgDuration > 0 ? formatDuration(Math.round(monthlyStats.avgDuration)) : '0:00'}
            </p>
            <p className="text-xs text-muted-foreground">Promedio llamada</p>
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Configuración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="telephony-enabled" className="text-base font-medium">
                Estado del módulo
              </Label>
              <p className="text-sm text-muted-foreground">
                Activa o desactiva la telefonía para tu organización
              </p>
            </div>
            <Switch
              id="telephony-enabled"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>

          <Separator />

          {/* Caller ID */}
          <div className="space-y-2">
            <Label>Número para llamadas salientes (Caller ID)</Label>
            <Select defaultValue={balance?.outbound_caller_id || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un número" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+34912345678">+34 912 345 678</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Low Balance Alert */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch id="low-balance-alert" defaultChecked />
              <Label htmlFor="low-balance-alert">
                Notificarme cuando tenga menos de
              </Label>
              <Input
                type="number"
                value={lowBalanceThreshold}
                onChange={(e) => setLowBalanceThreshold(Number(e.target.value))}
                className="w-20"
                min={1}
              />
              <span className="text-sm text-muted-foreground">minutos</span>
            </div>
          </div>

          <Separator />

          {/* Access Control */}
          <div className="space-y-3">
            <Label>Usuarios con acceso a telefonía</Label>
            <RadioGroup value={accessMode} onValueChange={setAccessMode}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="access-all" />
                <Label htmlFor="access-all" className="font-normal">
                  Todos los usuarios
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admins" id="access-admins" />
                <Label htmlFor="access-admins" className="font-normal">
                  Solo administradores
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="select" id="access-select" />
                <Label htmlFor="access-select" className="font-normal">
                  Seleccionar usuarios
                </Label>
                {accessMode === 'select' && (
                  <Button variant="link" size="sm" className="ml-2">
                    <Users className="h-4 w-4 mr-1" />
                    Gestionar
                  </Button>
                )}
              </div>
            </RadioGroup>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
              {updateSettings.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Calls */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Últimas llamadas</CardTitle>
            <CardDescription>Actividad reciente de telefonía</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/settings/telephony/historial">
              Ver historial completo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          ) : usageLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay llamadas recientes
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedCalls).slice(0, 3).map(([date, calls]) => (
                <div key={date}>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {format(new Date(date), "d 'de' MMMM", { locale: es })}
                  </p>
                  <div className="space-y-2">
                    {calls.map(call => (
                      <div 
                        key={call.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                      <div className="flex items-center gap-3">
                          {call.usage_type === 'call' ? (
                            <PhoneOutgoing className="h-4 w-4 text-primary" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-info" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {formatPhoneNumber(call.from_number)} → {formatPhoneNumber(call.to_number)}
                            </p>
                            {call.country_code && (
                              <p className="text-xs text-muted-foreground">
                                {call.country_code}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {call.duration_seconds ? formatDuration(call.duration_seconds) : '-'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(call.created_at), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Wrapper>
  );
}
