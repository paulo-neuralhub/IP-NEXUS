/**
 * AccountCombobox - Searchable client/account selector
 * L109D: Replaces basic Select with searchable Combobox
 */

import { useState } from 'react';
import { Check, ChevronsUpDown, Building2, User, Loader2 } from 'lucide-react';
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
import { useCRMAccounts } from '@/hooks/crm/v2/accounts';

interface AccountComboboxProps {
  value: string | null | undefined;
  onChange: (accountId: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** If true, only show accounts with client_token (for matter creation) */
  requireToken?: boolean;
}

export function AccountCombobox({ 
  value, 
  onChange, 
  placeholder = "Seleccionar cliente...",
  disabled = false,
  className,
  requireToken = false,
}: AccountComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Fetch accounts with search
  const { data: accounts, isLoading } = useCRMAccounts({ 
    search: search.length >= 2 ? search : undefined,
  });

  // Filter accounts by token requirement if needed
  const filteredAccounts = requireToken 
    ? accounts?.filter((a: any) => a.client_token) 
    : accounts;

  // Find selected account
  const selectedAccount = accounts?.find((a: any) => a.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {selectedAccount ? (
            <span className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{selectedAccount.name}</span>
              {selectedAccount.client_token && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {selectedAccount.client_token}
                </Badge>
              )}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar por nombre o NIF..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Buscando...
              </div>
            ) : !filteredAccounts || filteredAccounts.length === 0 ? (
              <CommandEmpty>
                {search.length < 2 
                  ? "Escribe al menos 2 caracteres para buscar"
                  : requireToken
                    ? "No se encontraron clientes con token"
                    : "No se encontraron clientes"
                }
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {/* Option to clear selection */}
                {value && (
                  <CommandItem
                    value="_clear_"
                    onSelect={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                    className="cursor-pointer text-muted-foreground"
                  >
                    <span className="text-sm">Sin cliente</span>
                  </CommandItem>
                )}
                {filteredAccounts.map((account: any) => (
                  <CommandItem
                    key={account.id}
                    value={account.id}
                    onSelect={() => {
                      onChange(account.id);
                      setOpen(false);
                      setSearch('');
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === account.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="font-medium truncate">{account.name}</span>
                        {account.client_token && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            {account.client_token}
                          </Badge>
                        )}
                      </div>
                      {(account.tax_id || account.legal_name) && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {account.tax_id && <span>{account.tax_id}</span>}
                          {account.tax_id && account.legal_name && <span> · </span>}
                          {account.legal_name && <span>{account.legal_name}</span>}
                        </p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
