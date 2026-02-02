// ============================================================
// IP-NEXUS - NICE SEARCH BOX
// Global search for Nice products/services
// ============================================================

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { NICE_CLASS_ICONS } from '@/types/nice-classification';
import { useDebounce } from '@/hooks/use-debounce';

interface NiceSearchResult {
  id: string;
  class_number: number;
  item_code: string;
  item_name_en: string;
  item_name_es?: string;
  is_generic_term: boolean;
}

interface Props {
  onSelect?: (item: NiceSearchResult) => void;
  placeholder?: string;
}

export function NiceSearchBox({ onSelect, placeholder = 'Buscar productos o servicios...' }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<NiceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) { 
      setResults([]); 
      return; 
    }

    async function doSearch() {
      setLoading(true);
      
      // Search in nice_products table (columns: name_en, name_es, wipo_code)
      const { data, error } = await supabase
        .from('nice_products')
        .select('id, class_number, wipo_code, name_en, name_es')
        .or(`name_en.ilike.%${debouncedSearch}%,name_es.ilike.%${debouncedSearch}%,wipo_code.ilike.%${debouncedSearch}%`)
        .limit(20);
      
      if (!error && data) {
        setResults(data.map(item => ({
          id: item.id,
          class_number: item.class_number,
          item_code: item.wipo_code || '',
          item_name_en: item.name_en,
          item_name_es: item.name_es || undefined,
          is_generic_term: false
        })));
      }
      
      setLoading(false);
    }
    doSearch();
  }, [debouncedSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className="pl-9 pr-10"
          />
          {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>
              {search.length < 2 ? 'Escribe al menos 2 caracteres' : 'Sin resultados'}
            </CommandEmpty>
            <CommandGroup>
              {results.map((item) => (
                <CommandItem 
                  key={item.id} 
                  onSelect={() => { onSelect?.(item); setOpen(false); setSearch(''); }}
                  className="cursor-pointer"
                >
                  <span className="mr-2 text-lg">{NICE_CLASS_ICONS[item.class_number] || '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.item_name_en}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.item_code && `${item.item_code} • `}Clase {item.class_number}
                    </p>
                  </div>
                  {item.is_generic_term && (
                    <Badge variant="secondary" className="ml-2 text-xs">Genérico</Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
