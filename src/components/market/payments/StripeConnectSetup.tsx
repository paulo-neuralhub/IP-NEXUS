// src/components/market/payments/StripeConnectSetup.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  CreditCard,
  Building2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AccountStatus = 'not_created' | 'pending' | 'active' | 'restricted';

interface StripeConnectSetupProps {
  status: AccountStatus;
  onboardingComplete?: boolean;
  payoutsEnabled?: boolean;
  chargesEnabled?: boolean;
  requirements?: string[];
  onSetup: () => Promise<void>;
  onManage: () => Promise<void>;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<AccountStatus, {
  label: string;
  description: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}> = {
  not_created: {
    label: 'No configurado',
    description: 'Configura tu cuenta para recibir pagos',
    variant: 'secondary',
  },
  pending: {
    label: 'Pendiente',
    description: 'Completa la verificación para activar tu cuenta',
    variant: 'outline',
  },
  active: {
    label: 'Activo',
    description: 'Tu cuenta está lista para recibir pagos',
    variant: 'default',
  },
  restricted: {
    label: 'Restringido',
    description: 'Se requiere información adicional',
    variant: 'destructive',
  },
};

export function StripeConnectSetup({
  status,
  onboardingComplete = false,
  payoutsEnabled = false,
  chargesEnabled = false,
  requirements = [],
  onSetup,
  onManage,
  isLoading,
}: StripeConnectSetupProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Configuración de pagos
            </CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'not_created' ? (
          <>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Información del negocio</p>
                  <p className="text-sm text-muted-foreground">
                    Datos básicos de tu empresa o actividad profesional
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Verificación de identidad</p>
                  <p className="text-sm text-muted-foreground">
                    Documento de identidad para cumplir con regulaciones
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Cuenta bancaria</p>
                  <p className="text-sm text-muted-foreground">
                    Para recibir los pagos de tus ventas
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={onSetup} 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Configurando...' : 'Configurar cuenta de pagos'}
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </>
        ) : (
          <>
            {/* Status checklist */}
            <div className="space-y-2">
              <StatusItem 
                label="Onboarding completado" 
                completed={onboardingComplete} 
              />
              <StatusItem 
                label="Cobros habilitados" 
                completed={chargesEnabled} 
              />
              <StatusItem 
                label="Pagos habilitados" 
                completed={payoutsEnabled} 
              />
            </div>

            {/* Requirements */}
            {requirements.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Acciones requeridas</span>
                </div>
                <ul className="text-sm text-amber-600 dark:text-amber-400 space-y-1 ml-6 list-disc">
                  {requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button 
              variant={status === 'active' ? 'outline' : 'default'}
              onClick={status === 'active' ? onManage : onSetup} 
              className="w-full" 
              disabled={isLoading}
            >
              {status === 'active' ? (
                <>Gestionar cuenta</>
              ) : (
                <>
                  {isLoading ? 'Cargando...' : 'Completar configuración'}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StatusItem({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {completed ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={cn(
        'text-sm',
        completed ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {label}
      </span>
    </div>
  );
}
