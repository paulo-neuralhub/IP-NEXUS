// ============================================================
// IP-NEXUS - DETAILS FORM COMPONENT
// L128: Matter details form for wizard step 3 with Nice classes
// ============================================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  FileText,
  Check,
  AlertCircle,
  Plus,
  Search,
  Loader2,
  Sparkles,
  Tag,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Command,
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
import { NiceClassSelector } from './NiceClassSelector';
import { CreateClientDialog } from './CreateClientDialog';

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
  nice_classes: number[];
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
  const [showCreateClient, setShowCreateClient] = useState(false);

  // Query clients/contacts
  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['contacts-for-matter', currentOrganization?.id],
    queryFn: async (): Promise<Array<{ 
      id: string; 
      name: string | null; 
      email: string | null; 
      phone: string | null; 
      client_token: string | null;
      nif: string | null;
      contact_type: string | null;
    }>> => {
      if (!currentOrganization?.id) return [];
      const client: any = supabase;
      const { data, error } = await client
        .from('contacts')
        .select('id, name, email, phone, client_token, nif, contact_type')
        .eq('organization_id', currentOrganization.id)
        .eq('is_client', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization?.id,
  });

  // Filter clients based on search
  const filteredClients = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.nif?.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectedClient = clients.find((c) => c.id === data.client_id);
  const isTrademarkType = matterType?.startsWith('TM') || matterType === 'NC';
  const isPatentType = matterType?.startsWith('PT') || matterType === 'UM';

  const handleClientCreated = (clientId: string) => {
    onChange({ client_id: clientId });
    setShowCreateClient(false);
  };

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
                  <div className="flex-1 text-left">
                    <span className="truncate">{selectedClient.name}</span>
                    {selectedClient.client_token && (
                      <Badge variant="outline" className="ml-2 font-mono text-xs">
                        {selectedClient.client_token}
                      </Badge>
                    )}
                  </div>
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
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Buscar por nombre, NIF o email..."
                value={clientSearch}
                onValueChange={setClientSearch}
              />
              <CommandList>
                {/* Loading state */}
                {loadingClients && (
                  <div className="flex items-center justify-center py-6 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Cargando clientes...
                  </div>
                )}

                {/* No results */}
                {!loadingClients && filteredClients.length === 0 && (
                  <div className="py-6 text-center">
                    <p className="text-muted-foreground mb-3">
                      {clientSearch ? `No se encontró "${clientSearch}"` : 'No hay clientes'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowCreateClient(true);
                        setClientOpen(false);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear nuevo cliente
                    </Button>
                  </div>
                )}

                {/* Results */}
                {!loadingClients && filteredClients.length > 0 && (
                  <CommandGroup>
                    {filteredClients.slice(0, 10).map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.id}
                        onSelect={() => {
                          onChange({ client_id: client.id });
                          setClientOpen(false);
                          setClientSearch('');
                        }}
                        className="py-3"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                            {client.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{client.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {client.nif && <span>{client.nif}</span>}
                              {client.contact_type && (
                                <Badge variant="secondary" className="text-xs">
                                  {client.contact_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {data.client_id === client.id && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Create new button - always visible when there are results */}
                {!loadingClients && filteredClients.length > 0 && (
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setShowCreateClient(true);
                        setClientOpen(false);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear nuevo cliente
                    </Button>
                  </div>
                )}
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
        <>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Denominación de la marca
            </Label>
            <Input
              placeholder="Ej: ACME"
              value={data.mark_name}
              onChange={(e) => onChange({ mark_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Clases Nice</Label>
            <NiceClassSelector
              value={data.nice_classes || []}
              onChange={(classes) => onChange({ nice_classes: classes })}
            />
            <p className="text-xs text-muted-foreground">
              Selecciona las clases de productos/servicios para la marca
            </p>
          </div>
        </>
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

      {/* Create Client Dialog */}
      <CreateClientDialog
        open={showCreateClient}
        onOpenChange={setShowCreateClient}
        onClientCreated={handleClientCreated}
        initialName={clientSearch}
      />
    </motion.div>
  );
}
