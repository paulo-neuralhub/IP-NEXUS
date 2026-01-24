// src/components/market/work/CompleteWorkModal.tsx
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Loader2, AlertTriangle, FileCheck } from 'lucide-react';
import { useMarkWorkComplete } from '@/hooks/market/useWorkflow';
import { useWorkFiles } from '@/hooks/market/useWorkflow';

interface CompleteWorkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
}

export function CompleteWorkModal({
  open,
  onOpenChange,
  transactionId,
}: CompleteWorkModalProps) {
  const [summary, setSummary] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const { data: files = [] } = useWorkFiles(transactionId);
  const markComplete = useMarkWorkComplete();

  const handleSubmit = async () => {
    if (!summary.trim() || !confirmed) return;

    await markComplete.mutateAsync({
      transactionId,
      summary,
      deliverables: files.map(f => f.file_name),
    });

    onOpenChange(false);
    setSummary('');
    setConfirmed(false);
  };

  const hasFiles = files.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Marcar Trabajo como Completado
          </DialogTitle>
          <DialogDescription>
            El cliente será notificado y podrá revisar los entregables antes de aprobar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Files Warning */}
          {!hasFiles && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No hay archivos compartidos. Se recomienda adjuntar al menos un entregable.
              </AlertDescription>
            </Alert>
          )}

          {/* Files List */}
          {hasFiles && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Entregables ({files.length})
              </Label>
              <div className="bg-muted rounded-md p-3 max-h-32 overflow-y-auto">
                <ul className="space-y-1 text-sm">
                  {files.map(file => (
                    <li key={file.id} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {file.file_name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Resumen del trabajo realizado *</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe brevemente el trabajo completado, los entregables y cualquier información relevante..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Confirmation */}
          <div className="flex items-start gap-2 pt-2">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <Label htmlFor="confirm" className="text-sm font-normal leading-relaxed cursor-pointer">
              Confirmo que el trabajo ha sido completado según los términos acordados y que los 
              entregables han sido compartidos con el cliente.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!summary.trim() || !confirmed || markComplete.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {markComplete.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Marcar como Completado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
