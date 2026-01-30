/**
 * MatterSelector - Selector de expediente con búsqueda
 * Para asociar comunicaciones y otras entidades a expedientes
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

export interface MatterOption {
  id: string;
  reference: string;
  title: string;
  client_name?: string;
  status?: string;
}

interface MatterSelectorProps {
  value?: string | null;
  onChange: (matterId: string | null, matter?: MatterOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
  showClearOption?: boolean;
  className?: string;
  /** Si se proporciona, el selector muestra info del matter pero no permite cambiar */
  readOnly?: boolean;
  /** Matter preseleccionado para mostrar en modo readonly */
  preselectedMatter?: MatterOption | null;
}

export function MatterSelector({
  value,
  onChange,
  placeholder = 'Seleccionar expediente...',
  disabled = false,
  showClearOption = true,
  className,
  readOnly = false,
  preselectedMatter,
}: MatterSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { currentOrganization } = useOrganization();

  // Fetch matters with search
  const { data: matters = [], isLoading } = useQuery({
    queryKey: ['matters-selector', currentOrganization?.id, search],
    queryFn: async (): Promise<MatterOption[]> => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('matters')
        .select(`
          id,
          reference,
          mark_name,
          status,
          client:client_id (
            id,
            name
          )
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (search) {
        query = query.or(`mark_name.ilike.%${search}%,reference.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(m => ({
        id: m.id,
        reference: m.reference || '',
        title: m.mark_name || m.reference || '',
        client_name: (m.client as any)?.name || undefined,
        status: m.status || undefined,
      }));
    },
    enabled: !!currentOrganization?.id && open,
  });

  // Fetch selected matter if not in list
  const { data: selectedMatter } = useQuery({
    queryKey: ['matter-selected', value],
    queryFn: async (): Promise<MatterOption | null> => {
      if (!value) return null;
      if (preselectedMatter) return preselectedMatter;

      const { data, error } = await supabase
        .from('matters')
        .select(`
          id,
          reference,
          mark_name,
          status,
          client:client_id (
            id,
            name
          )
        `)
        .eq('id', value)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        reference: data.reference || '',
        title: data.mark_name || data.reference || '',
        client_name: (data.client as any)?.name || undefined,
        status: data.status || undefined,
      };
    },
    enabled: !!value && !preselectedMatter,
  });

  const displayMatter = preselectedMatter || selectedMatter;

  // Readonly mode - just show the linked matter
  if (readOnly && displayMatter) {
    return (
      <div className={cn("flex items-center gap-2 p-2 border rounded-lg bg-muted/30", className)}>
        <FileText className="w-4 h-4 text-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{displayMatter.reference}</p>
          <p className="text-xs text-muted-foreground truncate">{displayMatter.title}</p>
        </div>
        {displayMatter.client_name && (
          <Badge variant="outline" className="shrink-0 text-xs">
            {displayMatter.client_name}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {displayMatter ? (
            <span className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 shrink-0 text-primary" />
              <span className="truncate">
                {displayMatter.reference} - {displayMatter.title}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar expediente..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Buscando...' : 'No se encontraron expedientes'}
            </CommandEmpty>
            <CommandGroup>
              {showClearOption && (
                <CommandItem
                  value="_none_"
                  onSelect={() => {
                    onChange(null, null);
                    setOpen(false);
                  }}
                  className="text-muted-foreground"
                >
                  <X className="mr-2 h-4 w-4" />
                  Sin expediente asociado
                </CommandItem>
              )}
              {matters.map((matter) => (
                <CommandItem
                  key={matter.id}
                  value={matter.id}
                  onSelect={() => {
                    onChange(matter.id, matter);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === matter.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary">
                        {matter.reference}
                      </span>
                      {matter.status && (
                        <Badge variant="outline" className="text-[10px] h-4">
                          {matter.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm truncate">{matter.title}</p>
                    {matter.client_name && (
                      <p className="text-xs text-muted-foreground truncate">
                        {matter.client_name}
                      </p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
