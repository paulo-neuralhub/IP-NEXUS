// ============================================================
// IP-NEXUS - CLIENT SELECTOR COMPONENT
// L129: Simple Popover-based client search that works
// ============================================================

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Loader2, Building2, User, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Client {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  client_token: string | null;
  tax_id: string | null; // was 'nif' - use actual column name
  client_type: string | null;
}

interface ClientSelectorProps {
  value: string;
  onChange: (clientId: string) => void;
  onCreateNew: () => void;
}

export function ClientSelector({ value, onChange, onCreateNew }: ClientSelectorProps) {
  const { currentOrganization } = useOrganization();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Query clients - use correct column names from contacts table
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients-for-wizard', currentOrganization?.id],
    queryFn: async (): Promise<Client[]> => {
      if (!currentOrganization?.id) return [];
      const client: any = supabase;
      
      // Query contacts that are clients (client_type is set or lifecycle_stage indicates client)
      const { data, error } = await client
        .from('contacts')
        .select('id, name, email, phone, client_token, tax_id, client_type')
        .eq('organization_id', currentOrganization.id)
        .not('client_type', 'is', null)
        .order('name');
      
      if (error) {
        console.error('❌ Error fetching clients:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!currentOrganization?.id,
    staleTime: 1000 * 60 * 5, // Cache 5 min
  });

  // Filter clients manually (not using Command filtering)
  const filteredClients = useMemo(() => {
    if (!clients.length) return [];
    if (!search.trim()) return clients.slice(0, 20);
    
    const s = search.toLowerCase().trim();
    return clients.filter(c =>
      c.name?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.tax_id?.toLowerCase().includes(s) ||
      c.client_token?.toLowerCase().includes(s)
    ).slice(0, 20);
  }, [clients, search]);

  // Get selected client
  const selectedClient = clients.find(c => c.id === value);

  const handleSelect = (clientId: string) => {
    onChange(clientId);
    setOpen(false);
    setSearch('');
  };

  const handleCreateNew = () => {
    setOpen(false);
    onCreateNew();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className={cn(
            'w-full justify-start h-12 font-normal',
            !selectedClient && 'text-muted-foreground'
          )}
        >
          {selectedClient ? (
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium shrink-0">
                {selectedClient.name?.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <span className="truncate block">{selectedClient.name}</span>
              </div>
              {selectedClient.client_token && (
                <Badge variant="outline" className="font-mono text-xs shrink-0">
                  {selectedClient.client_token}
                </Badge>
              )}
            </div>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2 shrink-0" />
              <span>Buscar cliente...</span>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="start">
        {/* Search Input */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, NIF o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[300px]">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Cargando clientes...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mb-2 text-destructive" />
              <span className="text-sm">Error al cargar clientes</span>
            </div>
          )}

          {/* No results */}
          {!isLoading && !error && filteredClients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <User className="h-8 w-8 mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mb-3">
                {search ? `No se encontró "${search}"` : 'No hay clientes'}
              </p>
              <Button variant="outline" size="sm" onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Crear nuevo cliente
              </Button>
            </div>
          )}

          {/* Results list */}
          {!isLoading && !error && filteredClients.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-2 mb-2">
                {filteredClients.length} de {clients.length} clientes
              </p>
              {filteredClients.map((client) => {
                const isSelected = value === client.id;
                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleSelect(client.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                      "hover:bg-muted/50",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {client.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{client.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {client.tax_id && <span>{client.tax_id}</span>}
                        {client.email && <span className="truncate">· {client.email}</span>}
                      </div>
                    </div>
                    {client.client_token && (
                      <Badge variant="outline" className="font-mono text-xs shrink-0">
                        {client.client_token}
                      </Badge>
                    )}
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer - Create new */}
        {!isLoading && !error && filteredClients.length > 0 && (
          <div className="p-2 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleCreateNew}
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear nuevo cliente
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
