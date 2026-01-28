/**
 * Modal de confirmación cuando un Lead llega a etapa "Ganado"
 * Requiere confirmación explícita con checkbox antes de convertir
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Lead } from '@/hooks/crm/useLeads';

interface LeadWonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function LeadWonModal({
  open,
  onOpenChange,
  lead,
  onConfirm,
  isLoading = false,
}: LeadWonModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    await onConfirm();
    setConfirmed(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmed(false);
    }
    onOpenChange(newOpen);
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>🎉</span> Convertir Lead a Negociación
          </DialogTitle>
          <DialogDescription>
            Estás a punto de convertir este lead en una negociación activa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Se creará automáticamente:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Una negociación en el pipeline de ventas</li>
            <li>El cliente en el sistema (si no existe)</li>
          </ul>

          {/* Datos del lead */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-foreground">📋 Datos del Lead</h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Nombre:</span>{' '}
                <span className="font-medium">{lead.company_name || lead.contact_name}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Contacto:</span>{' '}
                <span className="font-medium">{lead.contact_name}</span>
              </p>
              {lead.estimated_value && (
                <p>
                  <span className="text-muted-foreground">Valor estimado:</span>{' '}
                  <span className="font-medium text-primary">€{lead.estimated_value.toLocaleString()}</span>
                </p>
              )}
              {lead.interested_in && lead.interested_in.length > 0 && (
                <p>
                  <span className="text-muted-foreground">Interés:</span>{' '}
                  <span className="font-medium">{lead.interested_in.join(', ')}</span>
                </p>
              )}
            </div>
          </div>

          {/* Checkbox de confirmación obligatorio */}
          <div className="flex items-start gap-3 p-3 border rounded-lg bg-background">
            <Checkbox
              id="confirm-won"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              className="mt-0.5"
            />
            <label
              htmlFor="confirm-won"
              className="text-sm cursor-pointer leading-relaxed"
            >
              Confirmo que este lead ha aceptado nuestra propuesta y deseo crear la negociación en el sistema.
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!confirmed || isLoading}
          >
            {isLoading ? 'Creando...' : '✓ Confirmar y Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
