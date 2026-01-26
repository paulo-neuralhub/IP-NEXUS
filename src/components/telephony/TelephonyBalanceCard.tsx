import { Phone, MessageSquare, CreditCard, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { TenantTelephonyBalance } from '@/hooks/useTenantTelephony';

interface TelephonyBalanceCardProps {
  balance: TenantTelephonyBalance | null;
  isLoading?: boolean;
}

function formatEur(amount: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function TelephonyBalanceCard({ balance, isLoading }: TelephonyBalanceCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Saldo de Telefonía
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Saldo de Telefonía
          </CardTitle>
          <CardDescription>No tienes telefonía activada</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Compra un pack de minutos para empezar a usar el softphone.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isLowBalance = balance.minutes_balance <= balance.low_balance_threshold;
  const usagePercentage = balance.total_minutes_used > 0
    ? Math.min(100, (balance.minutes_balance / (balance.minutes_balance + balance.total_minutes_used)) * 100)
    : 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Saldo de Telefonía
          </CardTitle>
          {balance.is_enabled ? (
            <Badge variant="default">Activo</Badge>
          ) : (
            <Badge variant="secondary">Inactivo</Badge>
          )}
        </div>
        {balance.outbound_caller_id && (
          <CardDescription>Caller ID: {balance.outbound_caller_id}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isLowBalance && (
          <div className="flex items-center gap-2 rounded-lg bg-warning/10 p-3 text-warning">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Saldo bajo - considera recargar</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Phone className="h-4 w-4" />
            </div>
            <div className="mt-1 text-2xl font-bold text-foreground">
              {balance.minutes_balance.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">minutos</div>
          </div>

          <div className="rounded-lg border p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="mt-1 text-2xl font-bold text-foreground">
              {balance.sms_balance.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">SMS</div>
          </div>

          <div className="rounded-lg border p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="mt-1 text-2xl font-bold text-foreground">
              {formatEur(balance.credit_balance)}
            </div>
            <div className="text-xs text-muted-foreground">crédito</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Uso del saldo</span>
            <span className="font-medium">{usagePercentage.toFixed(0)}% disponible</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t text-sm">
          <div>
            <span className="text-muted-foreground">Total usado:</span>
            <span className="ml-2 font-medium">{balance.total_minutes_used.toLocaleString()} min</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total gastado:</span>
            <span className="ml-2 font-medium">{formatEur(balance.total_spent)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
