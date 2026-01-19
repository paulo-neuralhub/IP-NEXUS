// src/components/market/payments/EscrowStatus.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PriceDisplay } from '../shared';

type EscrowStatusType = 'pending' | 'funded' | 'in_progress' | 'released' | 'refunded' | 'disputed';

interface EscrowStatusProps {
  status: EscrowStatusType;
  amount: number;
  currency: string;
  fundedAt?: string;
  releasedAt?: string;
  expiresAt?: string;
}

const STATUS_CONFIG: Record<EscrowStatusType, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  progress: number;
}> = {
  pending: { 
    label: 'Pendiente de pago', 
    icon: Clock, 
    color: 'text-yellow-500',
    progress: 0 
  },
  funded: { 
    label: 'Fondos recibidos', 
    icon: CreditCard, 
    color: 'text-blue-500',
    progress: 33 
  },
  in_progress: { 
    label: 'Transferencia en proceso', 
    icon: ArrowRight, 
    color: 'text-purple-500',
    progress: 66 
  },
  released: { 
    label: 'Fondos liberados', 
    icon: CheckCircle2, 
    color: 'text-green-500',
    progress: 100 
  },
  refunded: { 
    label: 'Reembolsado', 
    icon: ArrowRight, 
    color: 'text-orange-500',
    progress: 100 
  },
  disputed: { 
    label: 'En disputa', 
    icon: AlertTriangle, 
    color: 'text-red-500',
    progress: 50 
  },
};

export function EscrowStatus({ 
  status, 
  amount, 
  currency,
  fundedAt,
  releasedAt,
  expiresAt 
}: EscrowStatusProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Estado del Escrow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn('h-5 w-5', config.color)} />
            <span className="font-medium">{config.label}</span>
          </div>
          <Badge variant={status === 'released' ? 'default' : 'secondary'}>
            {status === 'released' ? 'Completado' : 'En proceso'}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={config.progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Inicio</span>
            <span>Completado</span>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Monto en escrow</span>
          </div>
          <PriceDisplay amount={amount} currency={currency} className="font-bold" />
        </div>

        {/* Dates */}
        <div className="space-y-2 text-sm">
          {fundedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fondos recibidos:</span>
              <span>{format(new Date(fundedAt), 'dd MMM yyyy, HH:mm', { locale: es })}</span>
            </div>
          )}
          {releasedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fondos liberados:</span>
              <span>{format(new Date(releasedAt), 'dd MMM yyyy, HH:mm', { locale: es })}</span>
            </div>
          )}
          {expiresAt && status !== 'released' && status !== 'refunded' && (
            <div className="flex justify-between text-amber-600">
              <span>Expira:</span>
              <span>{format(new Date(expiresAt), 'dd MMM yyyy', { locale: es })}</span>
            </div>
          )}
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
          <Shield className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            Los fondos están protegidos por nuestro sistema de escrow. 
            No se liberarán hasta que ambas partes confirmen la transacción.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
