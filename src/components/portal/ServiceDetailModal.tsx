/**
 * Modal de detalle de servicio
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle2, 
  ShoppingCart,
  Tag,
  FileText,
  Info
} from 'lucide-react';
import type { ServiceCatalogItem, ServiceCatalogMetadata } from '@/hooks/use-service-catalog';

interface ServiceDetailModalProps {
  service: ServiceCatalogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequest: (service: ServiceCatalogItem) => void;
}

export function ServiceDetailModal({ 
  service, 
  open, 
  onOpenChange,
  onRequest 
}: ServiceDetailModalProps) {
  if (!service) return null;

  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  // Get metadata
  const metadata: ServiceCatalogMetadata | null = (service as { metadata?: ServiceCatalogMetadata }).metadata ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <DialogTitle className="text-xl">{service.name}</DialogTitle>
              {service.category && (
                <Badge variant="secondary" className="mt-2">
                  <Tag className="w-3 h-3 mr-1" />
                  {typeof service.category === 'object' ? service.category?.name_es : service.category}
                </Badge>
              )}
            </div>
          </div>
          {service.description && (
            <DialogDescription className="text-base pt-2">
              {service.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Precio */}
          <div className="bg-primary/5 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Precio</p>
            <p className="text-3xl font-bold text-primary">
              {service.base_price > 0 
                ? `desde ${formatCurrency(service.base_price, service.currency)}`
                : 'Consultar'
              }
            </p>
          </div>

          {/* Tiempo estimado */}
          {metadata?.duration_estimate && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tiempo estimado</p>
                <p className="font-medium">{metadata.duration_estimate}</p>
              </div>
            </div>
          )}

          {/* Qué incluye */}
          {metadata?.includes && metadata.includes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Qué incluye
              </h4>
              <ul className="space-y-2">
                {metadata.includes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requisitos */}
          {metadata?.requirements && metadata.requirements.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Requisitos
                </h4>
                <ul className="space-y-2">
                  {metadata.requirements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Info className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={() => onRequest(service)} className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            Solicitar servicio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
