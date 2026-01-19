import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useContacts } from '@/hooks/use-crm';
import { useCreatePortal } from '@/hooks/collab';

interface CreatePortalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreatePortalDialog({ open, onOpenChange }: CreatePortalDialogProps) {
  const { data: contacts = [] } = useContacts({ type: 'company' });
  const createPortal = useCreatePortal();
  
  const [formData, setFormData] = useState({
    client_id: '',
    portal_name: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id) return;
    
    try {
      await createPortal.mutateAsync({
        client_id: formData.client_id,
        portal_name: formData.portal_name || undefined
      });
      
      onOpenChange(false);
      setFormData({ client_id: '', portal_name: '' });
    } catch (error) {
      // Error handled by mutation
    }
  };
  
  const selectedClient = contacts.find(c => c.id === formData.client_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Portal de Cliente</DialogTitle>
          <DialogDescription>
            Crea un portal para que tu cliente pueda ver su portfolio, aprobar acciones y firmar documentos.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                client_id: value,
                portal_name: prev.portal_name || contacts.find(c => c.id === value)?.name || ''
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                    {contact.company_name && ` - ${contact.company_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {contacts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay clientes tipo empresa. Crea uno primero en el CRM.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portal_name">Nombre del Portal</Label>
            <Input
              id="portal_name"
              value={formData.portal_name}
              onChange={(e) => setFormData(prev => ({ ...prev, portal_name: e.target.value }))}
              placeholder={selectedClient?.name || 'Ej: Portal ACME Corp'}
            />
            <p className="text-xs text-muted-foreground">
              Opcional. Si no lo indicas, se usará el nombre del cliente.
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.client_id || createPortal.isPending}
            >
              {createPortal.isPending ? 'Creando...' : 'Crear Portal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
