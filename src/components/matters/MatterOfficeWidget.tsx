import { useState } from 'react';
import { Building2, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import { useMatterOffice } from '@/hooks/useMatterOffice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { MatterOfficeLinkForm } from './MatterOfficeLinkForm';

interface Props {
  matterId: string;
  onViewDetail?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  'filed': 'bg-blue-500',
  'examination': 'bg-yellow-500',
  'published': 'bg-purple-500',
  'registered': 'bg-green-500',
  'rejected': 'bg-red-500',
  'expired': 'bg-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  'filed': 'Presentado',
  'examination': 'En examen',
  'published': 'Publicado',
  'registered': 'Registrado',
  'rejected': 'Denegado',
  'expired': 'Caducado',
};

export function MatterOfficeWidget({ matterId, onViewDetail }: Props) {
  const { officeStatus, isLoading, checkOfficeStatus, isChecking } = useMatterOffice(matterId);
  const [showLinkForm, setShowLinkForm] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Not linked to office
  if (!officeStatus.hasOffice) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Estado Oficial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Sin vincular</p>
              <p className="text-xs text-muted-foreground mb-4">
                Añade el número de solicitud para activar sincronización.
              </p>
              <Button size="sm" variant="outline" onClick={() => setShowLinkForm(true)}>
                Vincular oficina →
              </Button>
            </div>
          </CardContent>
        </Card>

        <MatterOfficeLinkForm
          matterId={matterId}
          open={showLinkForm}
          onOpenChange={setShowLinkForm}
        />
      </>
    );
  }

  const statusColor = STATUS_COLORS[officeStatus.statusNormalized || ''] || 'bg-gray-500';
  const statusLabel = STATUS_LABELS[officeStatus.statusNormalized || ''] || officeStatus.status || 'Desconocido';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Estado Oficial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Office info */}
        <div className="flex items-center gap-2">
          <span className="text-xl">{officeStatus.officeFlag}</span>
          <div>
            <p className="font-medium">{officeStatus.officeName}</p>
            <p className="text-xs text-muted-foreground">Nº {officeStatus.applicationNumber}</p>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className="font-medium">{statusLabel}</span>
        </div>
        {officeStatus.statusDate && (
          <p className="text-xs text-muted-foreground">
            desde {formatDate(officeStatus.statusDate)}
          </p>
        )}

        {/* Last sync */}
        {officeStatus.supportsAutoSync && (
          <p className="text-xs text-muted-foreground">
            Última sync: {officeStatus.lastSyncAt ? formatRelativeTime(officeStatus.lastSyncAt) : 'Nunca'}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {officeStatus.supportsAutoSync && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => checkOfficeStatus()}
              disabled={isChecking}
              className="flex-1"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          )}
          {onViewDetail && (
            <Button size="sm" variant="ghost" onClick={onViewDetail} className="flex-1">
              Ver detalle
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
