// ============================================
// src/components/features/finance/provisions/ProvisionMovementDialog.tsx
// Modal para registrar movimiento de provisión
// ============================================

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { 
  useProvision,
  useCreateProvisionMovement,
} from '@/hooks/finance/useProvisions';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface ProvisionMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provisionId: string | null;
  movementType: 'request' | 'receipt' | 'use' | 'return';
  onSuccess?: () => void;
}

const movementConfig = {
  request: {
    title: 'Solicitar provisión',
    description: 'Registra la solicitud de fondos al cliente',
    amountLabel: 'Importe solicitado',
    buttonText: 'Registrar solicitud',
  },
  receipt: {
    title: 'Registrar ingreso',
    description: 'Registra la recepción de fondos del cliente',
    amountLabel: 'Importe recibido',
    buttonText: 'Registrar ingreso',
  },
  use: {
    title: 'Registrar uso',
    description: 'Registra el uso de fondos para tasas o gastos',
    amountLabel: 'Importe utilizado',
    buttonText: 'Registrar uso',
  },
  return: {
    title: 'Devolver excedente',
    description: 'Registra la devolución de fondos sobrantes al cliente',
    amountLabel: 'Importe a devolver',
    buttonText: 'Registrar devolución',
  },
};

export function ProvisionMovementDialog({
  open,
  onOpenChange,
  provisionId,
  movementType,
  onSuccess,
}: ProvisionMovementDialogProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    reference: '',
    movement_date: new Date(),
  });

  const { data: provision } = useProvision(provisionId || '');
  const createMovement = useCreateProvisionMovement();

  const config = movementConfig[movementType];

  // Calculate available amount for use/return
  const availableAmount = provision 
    ? Number(provision.amount) - Number(provision.used_amount) - Number(provision.returned_amount)
    : 0;

  // Pre-fill amount based on movement type
  useEffect(() => {
    if (provision && open) {
      if (movementType === 'request' || movementType === 'receipt') {
        setFormData(prev => ({ ...prev, amount: provision.amount.toString() }));
      } else if (movementType === 'use' || movementType === 'return') {
        setFormData(prev => ({ ...prev, amount: availableAmount.toString() }));
      }
    }
  }, [provision, movementType, open, availableAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provisionId || !formData.amount) {
      toast.error('Introduce un importe válido');
      return;
    }

    const amount = parseFloat(formData.amount);
    
    if (movementType === 'use' || movementType === 'return') {
      if (amount > availableAmount) {
        toast.error(`El importe no puede ser mayor a ${formatCurrency(availableAmount)}`);
        return;
      }
    }

    try {
      await createMovement.mutateAsync({
        provision_id: provisionId,
        movement_type: movementType,
        amount,
        description: formData.description || undefined,
        reference: formData.reference || undefined,
        movement_date: format(formData.movement_date, 'yyyy-MM-dd'),
      });
      
      toast.success('Movimiento registrado correctamente');
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setFormData({
        amount: '',
        description: '',
        reference: '',
        movement_date: new Date(),
      });
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar el movimiento');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        
        {provision && (
          <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
            <p><strong>Concepto:</strong> {provision.concept}</p>
            <p><strong>Importe total:</strong> {formatCurrency(provision.amount)}</p>
            {(movementType === 'use' || movementType === 'return') && (
              <p><strong>Disponible:</strong> {formatCurrency(availableAmount)}</p>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fecha */}
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.movement_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.movement_date 
                    ? format(formData.movement_date, "PPP", { locale: es })
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.movement_date}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, movement_date: date }))}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Importe */}
          <div className="space-y-2">
            <Label htmlFor="amount">{config.amountLabel} *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={movementType === 'use' || movementType === 'return' ? availableAmount : undefined}
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          {/* Referencia */}
          <div className="space-y-2">
            <Label htmlFor="reference">Referencia</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              placeholder="Ej: Transferencia XXXX, Nº factura..."
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={
                movementType === 'use' 
                  ? "Ej: Pago tasa registro EUIPO" 
                  : "Detalles adicionales..."
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMovement.isPending}>
              {createMovement.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {config.buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
