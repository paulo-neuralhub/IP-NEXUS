// ============================================================
// IP-NEXUS - CREATE CLIENT DIALOG
// L128: Quick client creation from matter wizard
// ============================================================

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserPlus, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (clientId: string) => void;
  initialName?: string;
}

interface NewClientData {
  name: string;
  nif: string;
  email: string;
  phone: string;
  client_type: string;
}

export function CreateClientDialog({
  open,
  onOpenChange,
  onClientCreated,
  initialName = '',
}: CreateClientDialogProps) {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<NewClientData>({
    name: initialName,
    nif: '',
    email: '',
    phone: '',
    client_type: 'company',
  });

  // Generate client token from name
  const generateClientToken = (name: string): string => {
    const words = name.toUpperCase().split(/\s+/);
    if (words.length >= 2) {
      return words.slice(0, 3).map(w => w.charAt(0)).join('');
    }
    return name.substring(0, 3).toUpperCase();
  };

  const createClient = useMutation({
    mutationFn: async () => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const client_token = generateClientToken(formData.name);

      const client: any = supabase;
      const { data, error } = await client
        .from('contacts')
        .insert({
          organization_id: currentOrganization.id,
          name: formData.name,
          nombre_fiscal: formData.name,
          nif: formData.nif || null,
          email: formData.email || null,
          phone: formData.phone || null,
          is_client: true,
          contact_type: formData.client_type,
          client_token,
          created_at: new Date().toISOString(),
        })
        .select('id, name, client_token')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts-for-matter'] });
      toast.success('Cliente creado correctamente', {
        description: `Token: ${data.client_token}`,
      });
      onClientCreated(data.id);
      onOpenChange(false);
      // Reset form
      setFormData({
        name: '',
        nif: '',
        email: '',
        phone: '',
        client_type: 'company',
      });
    },
    onError: (error) => {
      toast.error('Error al crear cliente', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    },
  });

  const handleChange = (field: keyof NewClientData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isValid = formData.name.trim().length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Nuevo Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre / Razón social <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ej: ACME Corporation S.L."
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              autoFocus
            />
          </div>

          {/* NIF and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nif">NIF / CIF</Label>
              <Input
                id="nif"
                placeholder="B12345678"
                value={formData.nif}
                onChange={(e) => handleChange('nif', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.client_type}
                onValueChange={(v) => handleChange('client_type', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Empresa
                    </div>
                  </SelectItem>
                  <SelectItem value="individual">Autónomo</SelectItem>
                  <SelectItem value="person">Particular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="info@empresa.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+34 612 345 678"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => createClient.mutate()}
            disabled={!isValid || createClient.isPending}
          >
            {createClient.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Crear Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
