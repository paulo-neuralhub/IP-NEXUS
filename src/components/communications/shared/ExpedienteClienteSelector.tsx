/**
 * ExpedienteClienteSelector - Selector unificado para asociar comunicaciones
 * Permite buscar y seleccionar un expediente O un cliente directamente
 * Al seleccionar expediente, auto-selecciona el cliente vinculado
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Briefcase, User, X } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

interface ExpedienteClienteSelectorProps {
  matterId?: string | null;
  clientId?: string | null;
  onMatterChange: (id: string | null, clientId?: string | null) => void;
  onClientChange: (id: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

interface MatterResult {
  id: string;
  reference: string;
  mark_name: string;
  client_id: string | null;
  client_name?: string;
}

interface ClientResult {
  id: string;
  name: string;
  email?: string;
}

export function ExpedienteClienteSelector({
  matterId,
  clientId,
  onMatterChange,
  onClientChange,
  placeholder = "Asociar a expediente o cliente...",
  disabled = false,
  required = false,
  className,
}: ExpedienteClienteSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { currentOrganization } = useOrganization();

  // Fetch matters with search
  const { data: matters = [] } = useQuery({
    queryKey: ['expedientes-selector', currentOrganization?.id, search],
    queryFn: async (): Promise<MatterResult[]> => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('matters')
        .select(`
          id,
          reference,
          mark_name,
          client_id,
          client:client_id (name)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (search && search.length > 0) {
        query = query.or(`reference.ilike.%${search}%,mark_name.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching matters:', error);
        return [];
      }

      return (data || []).map(m => ({
        id: m.id,
        reference: m.reference || '',
        mark_name: m.mark_name || '',
        client_id: m.client_id,
        client_name: (m.client as any)?.name || undefined,
      }));
    },
    enabled: open && !!currentOrganization?.id,
  });

  // Fetch clients with search
  const { data: clients = [] } = useQuery({
    queryKey: ['clients-selector', currentOrganization?.id, search],
    queryFn: async (): Promise<ClientResult[]> => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('contacts')
        .select('id, name, email')
        .eq('organization_id', currentOrganization.id)
        .eq('type', 'client')
        .order('name')
        .limit(10);

      if (search && search.length > 0) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching clients:', error);
        return [];
      }

      return (data || []).map(c => ({
        id: c.id,
        name: c.name || 'Sin nombre',
        email: c.email || undefined,
      }));
    },
    enabled: open && !!currentOrganization?.id,
  });

  // Fetch selected matter if set
  const { data: selectedMatter } = useQuery({
    queryKey: ['matter-selected', matterId],
    queryFn: async (): Promise<MatterResult | null> => {
      if (!matterId) return null;

      const { data } = await supabase
        .from('matters')
        .select(`
          id,
          reference,
          mark_name,
          client_id,
          client:client_id (name)
        `)
        .eq('id', matterId)
        .single();

      if (!data) return null;

      return {
        id: data.id,
        reference: data.reference || '',
        mark_name: data.mark_name || '',
        client_id: data.client_id,
        client_name: (data.client as any)?.name || undefined,
      };
    },
    enabled: !!matterId,
  });

  // Fetch selected client if set (and no matter selected)
  const { data: selectedClient } = useQuery({
    queryKey: ['client-selected', clientId, matterId],
    queryFn: async (): Promise<ClientResult | null> => {
      if (!clientId || matterId) return null;

      const { data } = await supabase
        .from('contacts')
        .select('id, name, email')
        .eq('id', clientId)
        .single();

      if (!data) return null;

      return {
        id: data.id,
        name: data.name || 'Sin nombre',
        email: data.email || undefined,
      };
    },
    enabled: !!clientId && !matterId,
  });

  // Get display text
  const getSelectedText = () => {
    if (matterId && selectedMatter) {
      return `📁 ${selectedMatter.reference} - ${selectedMatter.mark_name}`;
    }
    if (clientId && selectedClient && !matterId) {
      return `👤 ${selectedClient.name}`;
    }
    if (matterId) return '📁 Expediente seleccionado...';
    if (clientId) return '👤 Cliente seleccionado...';
    return null;
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMatterChange(null, null);
    onClientChange(null);
  };

  const selectedText = getSelectedText();
  const hasSelection = matterId || clientId;

  return (
    <div className={cn("space-y-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className={cn("truncate", !selectedText && "text-muted-foreground")}>
              {selectedText || placeholder}
            </span>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {hasSelection && (
                <button
                  onClick={handleClear}
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label="Limpiar selección"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar expediente o cliente..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {search.length > 0
                  ? "No se encontraron resultados"
                  : "Escribe para buscar..."}
              </CommandEmpty>

              {/* Matters group */}
              {matters.length > 0 && (
                <CommandGroup heading="Expedientes">
                  {matters.map((matter) => (
                    <CommandItem
                      key={matter.id}
                      value={`matter-${matter.id}`}
                      onSelect={() => {
                        onMatterChange(matter.id, matter.client_id);
                        onClientChange(null);
                        setOpen(false);
                        setSearch('');
                      }}
                      className="cursor-pointer"
                    >
                      <Briefcase className="h-4 w-4 mr-2 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {matter.reference}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {matter.mark_name} • {matter.client_name || 'Sin cliente'}
                        </p>
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          matterId === matter.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Clients group */}
              {clients.length > 0 && (
                <CommandGroup heading="Clientes">
                  {clients.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={`client-${client.id}`}
                      onSelect={() => {
                        onClientChange(client.id);
                        onMatterChange(null);
                        setOpen(false);
                        setSearch('');
                      }}
                      className="cursor-pointer"
                    >
                      <User className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {client.name}
                        </p>
                        {client.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {client.email}
                          </p>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          clientId === client.id && !matterId ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {required && !hasSelection && (
        <p className="text-xs text-muted-foreground">
          💡 Recomendado: Asocia esta comunicación a un expediente o cliente
        </p>
      )}
    </div>
  );
}
