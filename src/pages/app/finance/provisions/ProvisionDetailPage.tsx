// ============================================
// src/pages/app/finance/provisions/ProvisionDetailPage.tsx
// Detalle de una provisión con timeline de movimientos
// ============================================

import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Coins,
  RotateCcw,
  Clock,
  Receipt,
  AlertCircle,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/use-page-title';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  useProvision, 
  useProvisionMovements,
  type ProvisionStatus,
} from '@/hooks/finance/useProvisions';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { ProvisionMovementDialog } from '@/components/features/finance/provisions/ProvisionMovementDialog';

const statusConfig: Record<ProvisionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="w-4 h-4" /> },
  requested: { label: 'Solicitada', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <ArrowUpCircle className="w-4 h-4" /> },
  received: { label: 'Recibida', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <ArrowDownCircle className="w-4 h-4" /> },
  used: { label: 'Utilizada', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: <Coins className="w-4 h-4" /> },
  returned: { label: 'Devuelta', color: 'bg-muted text-muted-foreground', icon: <RotateCcw className="w-4 h-4" /> },
};

const movementTypeConfig = {
  request: { label: 'Solicitud', icon: ArrowUpCircle, color: 'text-blue-600' },
  receipt: { label: 'Ingreso recibido', icon: ArrowDownCircle, color: 'text-green-600' },
  use: { label: 'Uso de fondos', icon: Coins, color: 'text-purple-600' },
  return: { label: 'Devolución', icon: RotateCcw, color: 'text-amber-600' },
};

export default function ProvisionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  usePageTitle('Detalle de Provisión');

  const { data: provision, isLoading, error } = useProvision(id || '');
  const { data: movements } = useProvisionMovements(id || '');

  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [movementType, setMovementType] = useState<'request' | 'receipt' | 'use' | 'return'>('receipt');

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error al cargar la provisión</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading || !provision) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const status = statusConfig[provision.status] || statusConfig.pending;
  const available = Number(provision.amount) - Number(provision.used_amount) - Number(provision.returned_amount);

  const handleRegisterMovement = (type: 'request' | 'receipt' | 'use' | 'return') => {
    setMovementType(type);
    setShowMovementDialog(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/finance/provisions')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{provision.concept}</h1>
              <Badge className={`${status.color} gap-1`}>
                {status.icon}
                {status.label}
              </Badge>
            </div>
            {provision.client && (
              <p className="text-muted-foreground">{provision.client.name}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {provision.status === 'pending' && (
            <Button variant="outline" onClick={() => handleRegisterMovement('request')}>
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Solicitar
            </Button>
          )}
          {(provision.status === 'pending' || provision.status === 'requested') && (
            <Button onClick={() => handleRegisterMovement('receipt')}>
              <Receipt className="w-4 h-4 mr-2" />
              Registrar ingreso
            </Button>
          )}
          {provision.status === 'received' && available > 0 && (
            <>
              <Button variant="outline" onClick={() => handleRegisterMovement('use')}>
                <Coins className="w-4 h-4 mr-2" />
                Registrar uso
              </Button>
              <Button variant="outline" onClick={() => handleRegisterMovement('return')}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Devolver
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {provision.matter && (
                <div>
                  <p className="text-sm text-muted-foreground">Expediente</p>
                  <Link 
                    to={`/app/docket/${provision.matter.id}`}
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    {provision.matter.reference}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Fecha creación</p>
                <p className="font-medium">
                  {format(new Date(provision.created_at), 'PPP', { locale: es })}
                </p>
              </div>
            </div>
            
            {provision.description && (
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="text-sm">{provision.description}</p>
              </div>
            )}

            <Separator />

            {/* Financial Summary */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Solicitado:</span>
                <span className="font-medium">{formatCurrency(provision.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recibido:</span>
                <span className="font-medium text-green-600">
                  {provision.status === 'received' || provision.status === 'used' || provision.status === 'returned'
                    ? formatCurrency(provision.amount)
                    : formatCurrency(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Utilizado:</span>
                <span className="font-medium text-purple-600">
                  {formatCurrency(provision.used_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Devuelto:</span>
                <span className="font-medium text-amber-600">
                  {formatCurrency(provision.returned_amount)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Disponible:</span>
                <span className="font-bold text-primary">
                  {formatCurrency(Math.max(0, available))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Historial de movimientos</CardTitle>
            {provision.status === 'received' && available > 0 && (
              <Button size="sm" variant="outline" onClick={() => handleRegisterMovement('use')}>
                <Plus className="w-4 h-4 mr-1" />
                Añadir
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {(!movements || movements.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay movimientos registrados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {movements.map((movement, index) => {
                  const config = movementTypeConfig[movement.movement_type];
                  const Icon = config.icon;
                  
                  return (
                    <div key={movement.id} className="flex gap-3">
                      <div className={`mt-1 ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{config.label}</p>
                          <span className="font-medium">
                            {movement.movement_type === 'return' ? '-' : '+'}
                            {formatCurrency(movement.amount)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(movement.movement_date), 'PPP', { locale: es })}
                        </p>
                        {movement.reference && (
                          <p className="text-xs text-muted-foreground">
                            Ref: {movement.reference}
                          </p>
                        )}
                        {movement.description && (
                          <p className="text-sm mt-1">{movement.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Movement Dialog */}
      <ProvisionMovementDialog
        open={showMovementDialog}
        onOpenChange={setShowMovementDialog}
        provisionId={id || null}
        movementType={movementType}
      />
    </div>
  );
}
