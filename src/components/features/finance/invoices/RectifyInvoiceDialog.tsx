// =============================================
// RectifyInvoiceDialog - Modal para facturas rectificativas
// Códigos de rectificación según Facturae
// =============================================

import { useState } from 'react';
import { FileWarning, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Invoice } from '@/types/finance';
import { toast } from 'sonner';

// Códigos de motivo de rectificación según Facturae 3.2.2
const CORRECTION_REASONS = [
  { code: '01', label: 'Número de la factura' },
  { code: '02', label: 'Serie de la factura' },
  { code: '03', label: 'Fecha de expedición' },
  { code: '04', label: 'Nombre y apellidos/Razón social - Emisor' },
  { code: '05', label: 'Nombre y apellidos/Razón social - Destinatario' },
  { code: '06', label: 'Identificación fiscal Emisor/obligado' },
  { code: '07', label: 'Identificación fiscal Destinatario' },
  { code: '08', label: 'Domicilio Emisor/Obligado' },
  { code: '09', label: 'Domicilio Destinatario' },
  { code: '10', label: 'Detalle Operación' },
  { code: '11', label: 'Porcentaje impositivo a aplicar' },
  { code: '12', label: 'Cuota tributaria a aplicar' },
  { code: '13', label: 'Fecha/Período a aplicar' },
  { code: '14', label: 'Clase de factura' },
  { code: '15', label: 'Literales legales' },
  { code: '16', label: 'Base imponible' },
  { code: '80', label: 'Cálculo de cuotas repercutidas' },
  { code: '81', label: 'Cálculo de cuotas retenidas' },
  { code: '82', label: 'Base imponible modificada por devolución de envases/embalajes' },
  { code: '83', label: 'Base imponible modificada por descuentos y bonificaciones' },
  { code: '84', label: 'Base imponible modificada por resolución firme, judicial o administrativa' },
  { code: '85', label: 'Base imponible modificada cuotas repercutidas no satisfechas. Auto de declaración de concurso' },
];

interface RectifyInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
}

export function RectifyInvoiceDialog({ 
  open, 
  onOpenChange, 
  invoice 
}: RectifyInvoiceDialogProps) {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionDescription, setCorrectionDescription] = useState('');
  const [correctionType, setCorrectionType] = useState<'substitution' | 'difference'>('substitution');

  const handleCreate = async () => {
    if (!correctionReason) {
      toast.error('Selecciona un motivo de rectificación');
      return;
    }

    if (!correctionDescription.trim()) {
      toast.error('Introduce una descripción del motivo');
      return;
    }

    setIsCreating(true);

    try {
      // Navigate to invoice editor with rectification parameters
      const params = new URLSearchParams({
        rectify: invoice.id,
        reason: correctionReason,
        description: correctionDescription,
        type: correctionType,
      });
      
      navigate(`/app/finance/invoices/new?${params.toString()}`);
      onOpenChange(false);
    } catch (error) {
      console.error('Create rectification error:', error);
      toast.error('Error al crear la factura rectificativa');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-orange-500" />
            Rectificar factura {invoice.invoice_number}
          </DialogTitle>
          <DialogDescription>
            Se creará una nueva factura rectificativa (tipo FR) vinculada a esta factura.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tipo de rectificación */}
          <div className="space-y-3">
            <Label>Tipo de rectificación</Label>
            <RadioGroup 
              value={correctionType} 
              onValueChange={(v) => setCorrectionType(v as 'substitution' | 'difference')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="substitution" id="substitution" />
                <Label htmlFor="substitution" className="font-normal">
                  Sustitución completa
                  <span className="text-xs text-muted-foreground block">
                    La factura rectificativa sustituye íntegramente a la original
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="difference" id="difference" />
                <Label htmlFor="difference" className="font-normal">
                  Por diferencias
                  <span className="text-xs text-muted-foreground block">
                    Solo se recogen las diferencias con la factura original
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo de rectificación *</Label>
            <Select value={correctionReason} onValueChange={setCorrectionReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                {CORRECTION_REASONS.map((reason) => (
                  <SelectItem key={reason.code} value={reason.code}>
                    {reason.code} - {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción del motivo *</Label>
            <Textarea
              id="description"
              placeholder="Explica el motivo de la rectificación..."
              value={correctionDescription}
              onChange={(e) => setCorrectionDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Info de la factura original */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <p className="font-medium">Factura original:</p>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <span>Número:</span>
              <span className="font-medium text-foreground">{invoice.invoice_number}</span>
              <span>Fecha:</span>
              <span className="font-medium text-foreground">{invoice.invoice_date}</span>
              <span>Total:</span>
              <span className="font-medium text-foreground">
                {invoice.total.toLocaleString('es-ES', { style: 'currency', currency: invoice.currency })}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <FileWarning className="h-4 w-4 mr-2" />
                Crear rectificativa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
