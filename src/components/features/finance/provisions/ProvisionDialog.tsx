// ============================================
// src/components/features/finance/provisions/ProvisionDialog.tsx
// Modal para crear/editar provisión
// ============================================

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateProvision, type Provision } from '@/hooks/finance/useProvisions';
import { useContacts } from '@/hooks/use-crm';
import { useMatters } from '@/hooks/use-matters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProvisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provision?: Provision;
  defaultMatterId?: string;
  defaultClientId?: string;
  onSuccess?: () => void;
}

export function ProvisionDialog({
  open,
  onOpenChange,
  provision,
  defaultMatterId,
  defaultClientId,
  onSuccess,
}: ProvisionDialogProps) {
  const [formData, setFormData] = useState({
    client_id: provision?.client_id || defaultClientId || '',
    matter_id: provision?.matter_id || defaultMatterId || '',
    concept: provision?.concept || '',
    description: provision?.description || '',
    amount: provision?.amount?.toString() || '',
    currency: provision?.currency || 'EUR',
  });

  const createProvision = useCreateProvision();
  const { data: contacts } = useContacts();
  const { data: matters } = useMatters();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.concept || !formData.amount) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    try {
      await createProvision.mutateAsync({
        client_id: formData.client_id || undefined,
        matter_id: formData.matter_id || undefined,
        concept: formData.concept,
        description: formData.description || undefined,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
      });
      
      toast.success('Provisión creada correctamente');
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setFormData({
        client_id: '',
        matter_id: '',
        concept: '',
        description: '',
        amount: '',
        currency: 'EUR',
      });
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la provisión');
    }
  };

  // Auto-fill client from matter (using owner_id as client reference)
  const handleMatterChange = (matterId: string) => {
    setFormData(prev => ({ ...prev, matter_id: matterId }));
    // Note: If matter has an owner/client reference, it could be linked here
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {provision ? 'Editar provisión' : 'Nueva provisión de fondos'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {contacts?.filter(c => c.type === 'company' || !c.type).map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expediente */}
          <div className="space-y-2">
            <Label htmlFor="matter">Expediente (opcional)</Label>
            <Select
              value={formData.matter_id}
              onValueChange={handleMatterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vincular a expediente" />
              </SelectTrigger>
              <SelectContent>
                {matters?.map((matter) => (
                  <SelectItem key={matter.id} value={matter.id}>
                    {matter.reference} - {matter.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Concepto */}
          <div className="space-y-2">
            <Label htmlFor="concept">Concepto *</Label>
            <Input
              id="concept"
              value={formData.concept}
              onChange={(e) => setFormData(prev => ({ ...prev, concept: e.target.value }))}
              placeholder="Ej: Provisión para tasas de registro EUIPO"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detalles adicionales..."
              rows={3}
            />
          </div>

          {/* Importe */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Importe *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - Dólar</SelectItem>
                  <SelectItem value="GBP">GBP - Libra</SelectItem>
                  <SelectItem value="CHF">CHF - Franco suizo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createProvision.isPending}>
              {createProvision.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {provision ? 'Guardar cambios' : 'Crear provisión'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
