/**
 * ContactCombobox - Searchable contact selector (contacts table)
 * Used by Matters V2 creation to satisfy FK matters_v2.client_id -> contacts.id
 */

import React, { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/organization-context";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

type ContactRow = {
  id: string;
  name: string;
  company_name: string | null;
  tax_id: string | null;
  client_token: string | null;
};

interface ContactComboboxProps {
  value: string | null | undefined;
  onChange: (contactId: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** If true, only show contacts with client_token */
  requireToken?: boolean;
}

export const ContactCombobox = React.forwardRef<
  HTMLButtonElement,
  ContactComboboxProps
>(function ContactCombobox(
  {
    value,
    onChange,
    placeholder = "Seleccionar cliente...",
    disabled = false,
    className,
    requireToken = false,
  },
  ref
) {
  const { currentOrganization } = useOrganization();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts-combobox", currentOrganization?.id, search],
    queryFn: async () => {
      if (!currentOrganization?.id) return [] as ContactRow[];

      let query = supabase
        .from("contacts")
        .select("id, name, company_name, tax_id, client_token")
        .eq("organization_id", currentOrganization.id)
        .order("name", { ascending: true });

      if (search.trim().length >= 2) {
        const q = search.trim();
        query = query.or(
          `name.ilike.%${q}%,tax_id.ilike.%${q}%,company_name.ilike.%${q}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ContactRow[];
    },
    enabled: !!currentOrganization?.id,
    staleTime: 1000 * 30,
  });

  const filteredContacts = useMemo(() => {
    const base = contacts ?? [];
    return requireToken ? base.filter((c) => !!c.client_token) : base;
  }, [contacts, requireToken]);

  const selected = useMemo(
    () => filteredContacts.find((c) => c.id === value) ?? null,
    [filteredContacts, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
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
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{selected.name}</span>
              {selected.client_token && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {selected.client_token}
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
            ) : filteredContacts.length === 0 ? (
              <CommandEmpty>
                {search.trim().length < 2
                  ? "Escribe al menos 2 caracteres para buscar"
                  : requireToken
                    ? "No se encontraron clientes con token"
                    : "No se encontraron clientes"}
              </CommandEmpty>
            ) : (
              <CommandGroup>
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

                {filteredContacts.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={c.id}
                    onSelect={() => {
                      onChange(c.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === c.id ? "opacity-100" : "opacity-0"
                      )}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="font-medium truncate">{c.name}</span>
                        {c.client_token && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            {c.client_token}
                          </Badge>
                        )}
                      </div>
                      {(c.tax_id || c.company_name) && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {c.tax_id && <span>{c.tax_id}</span>}
                          {c.tax_id && c.company_name && <span> · </span>}
                          {c.company_name && <span>{c.company_name}</span>}
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
});

ContactCombobox.displayName = "ContactCombobox";
