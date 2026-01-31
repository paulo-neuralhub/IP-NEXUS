// ============================================================
// IP-NEXUS - DETAILS FORM COMPONENT
// L127: Matter details form for wizard step 3
// ============================================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  FileText,
  Calendar,
  Check,
  AlertCircle,
  Plus,
  Search,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface MatterDetailsData {
  title: string;
  client_id: string;
  reference: string;
  client_reference: string;
  mark_name: string;
  invention_title: string;
  internal_notes: string;
  is_urgent: boolean;
  is_confidential: boolean;
}

interface DetailsFormProps {
  data: MatterDetailsData;
  onChange: (data: Partial<MatterDetailsData>) => void;
  matterType: string;
  previewNumber?: string;
  isGeneratingNumber?: boolean;
}

export function DetailsForm({
  data,
  onChange,
  matterType,
  previewNumber,
  isGeneratingNumber,
}: DetailsFormProps) {
  const { currentOrganization } = useOrganization();
  const [clientOpen, setClientOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  // Query clients/contacts - use any to avoid deep type instantiation
  const { data: clients = [] } = useQuery({
    queryKey: ['contacts-for-matter', currentOrganization?.id],
    queryFn: async (): Promise<Array<{ id: string; name: string | null; email: string | null; phone: string | null; client_token: string | null }>> => {
      if (!currentOrganization?.id) return [];
      const client: any = supabase;
      const { data, error } = await client
        .from('contacts')
        .select('id, name, email, phone, client_token')
        .eq('organization_id', currentOrganization.id)
        .eq('is_client', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization?.id,
  });

  const filteredClients = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectedClient = clients.find((c) => c.id === data.client_id);
  const isTrademarkType = matterType?.startsWith('TM') || matterType === 'NC';
  const isPatentType = matterType?.startsWith('PT') || matterType === 'UM';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Detalles del expediente</h2>
        <p className="text-muted-foreground">Completa la información básica</p>
      </div>

      {/* Number Preview */}
      {previewNumber && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20 mb-6">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">Número de expediente</p>
            {isGeneratingNumber ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generando...</span>
              </div>
            ) : (
              <p className="font-mono text-lg font-semibold text-primary truncate">
                {previewNumber}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Client Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Cliente
        </Label>
        <Popover open={clientOpen} onOpenChange={setClientOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              className={cn(
                'w-full justify-start h-12',
                !selectedClient && 'text-muted-foreground'
              )}
            >
              {selectedClient ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {selectedClient.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="truncate">{selectedClient.name}</span>
                </div>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar cliente...
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Buscar por nombre o email..."
                value={clientSearch}
                onValueChange={setClientSearch}
              />
              <CommandList>
                <CommandEmpty>
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground mb-2">No se encontró el cliente</p>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear nuevo cliente
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {filteredClients.slice(0, 10).map((client) => (
                    <CommandItem
                      key={client.id}
                      value={client.id}
                      onSelect={() => {
                        onChange({ client_id: client.id });
                        setClientOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {client.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{client.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                        </div>
                        {data.client_id === client.id && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Título del expediente *
        </Label>
        <Input
          placeholder="Ej: Registro de marca ACME en España"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="h-12"
        />
        {data.title && data.title.length < 3 && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            El título debe tener al menos 3 caracteres
          </p>
        )}
      </div>

      {/* Type-specific fields */}
      {isTrademarkType && (
        <div className="space-y-2">
          <Label>Denominación de la marca</Label>
          <Input
            placeholder="Ej: ACME"
            value={data.mark_name}
            onChange={(e) => onChange({ mark_name: e.target.value })}
          />
        </div>
      )}

      {isPatentType && (
        <div className="space-y-2">
          <Label>Título de la invención</Label>
          <Input
            placeholder="Título técnico de la invención"
            value={data.invention_title}
            onChange={(e) => onChange({ invention_title: e.target.value })}
          />
        </div>
      )}

      {/* References */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Referencia interna</Label>
          <Input
            placeholder="Se genera automáticamente"
            value={data.reference}
            onChange={(e) => onChange({ reference: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Déjalo vacío para generar automáticamente
          </p>
        </div>
        <div className="space-y-2">
          <Label>Referencia del cliente</Label>
          <Input
            placeholder="Referencia que usa el cliente"
            value={data.client_reference}
            onChange={(e) => onChange({ client_reference: e.target.value })}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notas internas</Label>
        <Textarea
          placeholder="Notas adicionales..."
          value={data.internal_notes}
          onChange={(e) => onChange({ internal_notes: e.target.value })}
          rows={3}
        />
      </div>

      {/* Options */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div>
            <p className="font-medium">Urgente</p>
            <p className="text-sm text-muted-foreground">Marcar como expediente prioritario</p>
          </div>
          <Switch
            checked={data.is_urgent}
            onCheckedChange={(checked) => onChange({ is_urgent: checked })}
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div>
            <p className="font-medium">Confidencial</p>
            <p className="text-sm text-muted-foreground">Restringir acceso a usuarios autorizados</p>
          </div>
          <Switch
            checked={data.is_confidential}
            onCheckedChange={(checked) => onChange({ is_confidential: checked })}
          />
        </div>
      </div>
    </motion.div>
  );
}
