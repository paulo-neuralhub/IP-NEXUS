import { useState } from 'react';
import { Building2, RefreshCw, Pencil, AlertTriangle, CheckCircle2, Clock, Calendar, FileText } from 'lucide-react';
import { useMatterOffice, type CheckResult } from '@/hooks/useMatterOffice';
import { useOfficeHistory } from '@/hooks/useOfficeHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { MatterOfficeLinkForm } from './MatterOfficeLinkForm';
import { MatterOfficeManualUpdate } from './MatterOfficeManualUpdate';
import { MatterOfficeCheckModal } from './MatterOfficeCheckModal';

interface Props {
  matterId: string;
}

const STATUS_COLORS: Record<string, string> = {
  'filed': 'bg-blue-100 text-blue-800 border-blue-200',
  'examination': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'published': 'bg-purple-100 text-purple-800 border-purple-200',
  'registered': 'bg-green-100 text-green-800 border-green-200',
  'rejected': 'bg-red-100 text-red-800 border-red-200',
  'expired': 'bg-gray-100 text-gray-800 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  'filed': 'Presentado',
  'examination': 'En examen',
  'published': 'Publicado',
  'registered': 'Registrado',
  'rejected': 'Denegado',
  'expired': 'Caducado',
};

export function MatterOfficialTab({ matterId }: Props) {
  const { officeStatus, isLoading, checkOfficeStatus, isChecking } = useMatterOffice(matterId);
  const { events } = useOfficeHistory(matterId, { limit: 5 });
  
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showManualUpdate, setShowManualUpdate] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);

  const handleCheck = async () => {
    const result = await checkOfficeStatus();
    setCheckResult(result);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // No office linked
  if (!officeStatus.hasOffice) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin conexión a oficina</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Este expediente no tiene número de solicitud oficial asignado.
              Añade el número para activar la sincronización automática.
            </p>
            <Button onClick={() => setShowLinkForm(true)}>
              <Building2 className="h-4 w-4 mr-2" />
              Vincular a oficina
            </Button>
          </div>
        </CardContent>

        <MatterOfficeLinkForm
          matterId={matterId}
          open={showLinkForm}
          onOpenChange={setShowLinkForm}
        />
      </Card>
    );
  }

  const statusColor = STATUS_COLORS[officeStatus.statusNormalized || ''] || 'bg-gray-100 text-gray-800';
  const statusLabel = STATUS_LABELS[officeStatus.statusNormalized || ''] || officeStatus.status || 'Desconocido';

  // Check for recent changes (within last 24 hours)
  const recentChanges = events.filter(e => {
    const eventTime = new Date(e.createdAt).getTime();
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return eventTime > dayAgo && e.type === 'status_change';
  });

  return (
    <div className="space-y-4">
      {/* Recent changes alert */}
      {recentChanges.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-amber-100">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-amber-900">
                  Cambio detectado ({formatRelativeTime(recentChanges[0].createdAt)})
                </p>
                <ul className="mt-2 space-y-1 text-sm text-amber-800">
                  {recentChanges.map(change => (
                    <li key={change.id}>• {change.title}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main office status card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{officeStatus.officeFlag}</span>
            <div>
              <CardTitle className="text-base">{officeStatus.officeName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Nº Solicitud: {officeStatus.applicationNumber}
                {officeStatus.registrationNumber && ` • Nº Registro: ${officeStatus.registrationNumber}`}
              </p>
            </div>
          </div>
          {officeStatus.supportsAutoSync ? (
            <Button onClick={handleCheck} disabled={isChecking} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          ) : (
            <Button onClick={() => setShowManualUpdate(true)} variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Actualizar datos
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Manual office notice */}
          {!officeStatus.supportsAutoSync && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted text-sm">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span>Esta oficina no tiene sincronización automática. Los datos se actualizan manualmente.</span>
            </div>
          )}

          {/* Current status */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Estado actual</h4>
            <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg border ${statusColor}`}>
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-semibold uppercase">{statusLabel}</p>
                {officeStatus.status && officeStatus.status !== statusLabel && (
                  <p className="text-sm opacity-80">{officeStatus.status}</p>
                )}
                {officeStatus.statusDate && (
                  <p className="text-sm opacity-80">Desde: {formatDate(officeStatus.statusDate)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Key dates */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Fechas clave</h4>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Presentación</dt>
                <dd className="font-medium">{officeStatus.filingDate ? formatDate(officeStatus.filingDate) : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Publicación</dt>
                <dd className="font-medium">{officeStatus.publicationDate ? formatDate(officeStatus.publicationDate) : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Registro</dt>
                <dd className="font-medium">{officeStatus.registrationDate ? formatDate(officeStatus.registrationDate) : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Vencimiento</dt>
                <dd className="font-medium">{officeStatus.expiryDate ? formatDate(officeStatus.expiryDate) : '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Sync info (only for auto-sync offices) */}
          {officeStatus.supportsAutoSync && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Sincronización</h4>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Última consulta: {officeStatus.lastSyncAt ? formatRelativeTime(officeStatus.lastSyncAt) : 'Nunca'}</span>
                </div>
                {officeStatus.nextSyncAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Próxima: {formatRelativeTime(officeStatus.nextSyncAt)}</span>
                  </div>
                )}
                <Badge variant={officeStatus.lastSyncStatus === 'success' ? 'default' : 'secondary'}>
                  {officeStatus.lastSyncStatus === 'success' ? '🟢 OK' : '⏳ Pendiente'}
                </Badge>
              </div>
            </div>
          )}

          {/* Recent activity */}
          {events.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Actividad reciente</h4>
              <div className="space-y-2">
                {events.slice(0, 3).map(event => (
                  <div key={event.id} className="flex items-center gap-3 text-sm p-2 rounded bg-muted/50">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{event.title}</span>
                    <span className="text-muted-foreground">{formatRelativeTime(event.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <MatterOfficeManualUpdate
        matterId={matterId}
        officeStatus={officeStatus}
        open={showManualUpdate}
        onOpenChange={setShowManualUpdate}
      />

      <MatterOfficeCheckModal
        result={checkResult}
        open={!!checkResult}
        onOpenChange={(open) => !open && setCheckResult(null)}
      />
    </div>
  );
}
