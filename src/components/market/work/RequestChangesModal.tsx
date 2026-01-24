// src/components/market/work/RequestChangesModal.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useRequestChanges } from '@/hooks/market/useWorkflow';

interface RequestChangesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
}

export function RequestChangesModal({
  open,
  onOpenChange,
  transactionId,
}: RequestChangesModalProps) {
  const [reason, setReason] = useState('');

  const requestChanges = useRequestChanges();

  const handleSubmit = async () => {
    if (!reason.trim()) return;

    await requestChanges.mutateAsync({
      transactionId,
      reason,
    });

    onOpenChange(false);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-amber-500" />
            Solicitar Cambios
          </DialogTitle>
          <DialogDescription>
            El trabajo volverá a estar en progreso y el agente será notificado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">¿Qué cambios necesitas? *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe los cambios o ajustes que necesitas en el trabajo entregado..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason.trim() || requestChanges.isPending}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {requestChanges.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Solicitar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
