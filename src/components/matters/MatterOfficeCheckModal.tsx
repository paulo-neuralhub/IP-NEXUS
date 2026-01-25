import { CheckCircle2, XCircle, AlertTriangle, FileText, Calendar, RefreshCw } from 'lucide-react';
import type { CheckResult } from '@/hooks/useMatterOffice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  result: CheckResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry?: () => void;
}

export function MatterOfficeCheckModal({ result, open, onOpenChange, onRetry }: Props) {
  if (!result) return null;

  // Error state
  if (!result.success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error de conexión
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-muted-foreground mb-4">
              No se pudo conectar con la oficina.
            </p>
            {result.error && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                Error: {result.error}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              La oficina puede estar experimentando problemas. Inténtalo de nuevo más tarde.
            </p>
          </div>

          <DialogFooter>
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            )}
            <Button onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // No changes
  if (!result.hasChanges) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Actualización completada
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <p className="font-medium">Sin cambios detectados</p>
            <p className="text-muted-foreground mt-2">
              El expediente está actualizado con los datos de la oficina.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Última consulta: Justo ahora
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // With changes
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Actualización completada
          </DialogTitle>
          <DialogDescription>
            Se detectaron cambios en la oficina
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">CAMBIOS APLICADOS</h4>
          
          <ul className="space-y-3">
            {result.changes?.map((change, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">{change.field} actualizado</p>
                  <p className="text-sm text-muted-foreground">
                    {change.oldValue} → {change.newValue}
                  </p>
                </div>
              </li>
            ))}
            
            {(result.documentsDownloaded || 0) > 0 && (
              <li className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Documentos descargados</p>
                  <p className="text-sm text-muted-foreground">
                    {result.documentsDownloaded} documento(s) nuevo(s)
                  </p>
                </div>
              </li>
            )}
            
            {(result.deadlinesCreated || 0) > 0 && (
              <li className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Plazos creados</p>
                  <p className="text-sm text-muted-foreground">
                    {result.deadlinesCreated} plazo(s) nuevo(s)
                  </p>
                </div>
              </li>
            )}
          </ul>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
