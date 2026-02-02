// =====================================================
// IP-NEXUS - HOLDER SELECTOR COMBOBOX (PROMPT 26)
// =====================================================

import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus, Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useHolders } from '@/hooks/useHolders';
import { HolderDialog } from './HolderDialog';
import type { Holder } from '@/types/holders';
import { HOLDER_TYPE_LABELS } from '@/types/holders';

interface Props {
  value?: string;
  onValueChange: (holderId: string | undefined, holder?: Holder) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowCreate?: boolean;
}

export function HolderSelector({
  value,
  onValueChange,
  placeholder = 'Seleccionar titular...',
  disabled = false,
  className,
  allowCreate = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: holders = [], isLoading } = useHolders({ 
    search: search || undefined,
    isActive: true,
    limit: 50 
  });

  const selectedHolder = holders.find(h => h.id === value);

  const handleSelect = (holder: Holder) => {
    onValueChange(holder.id, holder);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onValueChange(undefined);
    setOpen(false);
  };

  const handleCreateSuccess = (holder: Holder) => {
    onValueChange(holder.id, holder);
    setCreateDialogOpen(false);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between font-normal',
              !selectedHolder && 'text-muted-foreground',
              className
            )}
            disabled={disabled}
          >
            {selectedHolder ? (
              <div className="flex items-center gap-2 truncate">
                {selectedHolder.holder_type === 'individual' ? (
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className="truncate">{selectedHolder.legal_name}</span>
                {selectedHolder.country && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    {selectedHolder.country}
                  </Badge>
                )}
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Buscar titular..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Cargando...
                </div>
              ) : holders.length === 0 ? (
                <CommandEmpty>
                  No se encontraron titulares
                  {search && ` para "${search}"`}
                </CommandEmpty>
              ) : (
                <CommandGroup heading="Titulares">
                  {holders.map((holder) => (
                    <CommandItem
                      key={holder.id}
                      value={holder.id}
                      onSelect={() => handleSelect(holder)}
                      className="flex items-center gap-2"
                    >
                      <Check
                        className={cn(
                          'h-4 w-4 flex-shrink-0',
                          value === holder.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {holder.holder_type === 'individual' ? (
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-medium">
                            {holder.legal_name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {holder.tax_id && `${holder.tax_id} · `}
                            {HOLDER_TYPE_LABELS[holder.holder_type]}
                            {holder.country && ` · ${holder.country}`}
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {value && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem onSelect={handleClear} className="text-muted-foreground">
                      Limpiar selección
                    </CommandItem>
                  </CommandGroup>
                </>
              )}

              {allowCreate && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setCreateDialogOpen(true);
                        setOpen(false);
                      }}
                      className="text-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear nuevo titular
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <HolderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
