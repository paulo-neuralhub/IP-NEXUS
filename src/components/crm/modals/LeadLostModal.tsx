/**
 * Modal para marcar un Lead como "Perdido"
 * Requiere seleccionar motivo y elegir acción (Stand By o Eliminar)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Lead } from '@/hooks/crm/useLeads';

const LOSS_REASONS = [
  { code: 'price', label: 'Precio demasiado alto' },
  { code: 'desisted', label: 'El cliente desistió' },
  { code: 'competitor', label: 'Eligió a la competencia' },
  { code: 'no_response', label: 'No responde / Sin contacto' },
  { code: 'out_of_scope', label: 'Fuera de nuestro alcance' },
  { code: 'other', label: 'Otro motivo' },
] as const;

type LossAction = 'standby' | 'delete';

interface LeadLostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onConfirm: (params: {
    reasonCode: string;
    reason: string;
    action: LossAction;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function LeadLostModal({
  open,
  onOpenChange,
  lead,
  onConfirm,
  isLoading = false,
}: LeadLostModalProps) {
  const [lossReason, setLossReason] = useState<string>('');
  const [otherReason, setOtherReason] = useState('');
  const [lostAction, setLostAction] = useState<LossAction>('standby');

  const handleConfirm = async () => {
    const reason = lossReason === 'other' ? otherReason : LOSS_REASONS.find(r => r.code === lossReason)?.label || lossReason;
    await onConfirm({
      reasonCode: lossReason,
      reason,
      action: lostAction,
    });
    resetForm();
  };

  const resetForm = () => {
    setLossReason('');
    setOtherReason('');
    setLostAction('standby');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const isValid = lossReason && (lossReason !== 'other' || otherReason.trim());

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>❌</span> Marcar Lead como Perdido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lead info */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm">
              <span className="text-muted-foreground">Lead:</span>{' '}
              <span className="font-medium">{lead.company_name || lead.contact_name}</span>
            </p>
          </div>

          {/* Motivo de pérdida */}
          <div className="space-y-3">
            <Label>¿Por qué se pierde este lead? *</Label>
            <RadioGroup value={lossReason} onValueChange={setLossReason}>
              {LOSS_REASONS.map((reason) => (
                <div key={reason.code} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.code} id={reason.code} />
                  <Label
                    htmlFor={reason.code}
                    className="font-normal cursor-pointer"
                  >
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Campo para "Otro motivo" */}
          {lossReason === 'other' && (
            <Textarea
              placeholder="Describe el motivo..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              className="min-h-[80px]"
            />
          )}

          {/* Acción a tomar */}
          <div className="space-y-3 border-t pt-4">
            <Label>¿Qué hacer con este lead?</Label>
            <RadioGroup
              value={lostAction}
              onValueChange={(v) => setLostAction(v as LossAction)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standby" id="action-standby" />
                <Label
                  htmlFor="action-standby"
                  className="font-normal cursor-pointer"
                >
                  Mover a Stand By (para revisar más adelante)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delete" id="action-delete" />
                <Label
                  htmlFor="action-delete"
                  className="font-normal cursor-pointer text-destructive"
                >
                  Eliminar definitivamente (no se podrá recuperar)
                </Label>
              </div>
            </RadioGroup>
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
            variant={lostAction === 'delete' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
          >
            {isLoading
              ? 'Procesando...'
              : lostAction === 'delete'
              ? 'Eliminar Lead'
              : 'Mover a Stand By'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
