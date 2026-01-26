/**
 * ServiceSearchInput - Campo de búsqueda con autocompletado de servicios
 * Al escribir en el campo, busca servicios activos y muestra sugerencias
 */

import { useState, useRef, useEffect } from 'react';
import { Search, Package, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useActiveServices } from '@/hooks/use-service-catalog';
import type { ServiceCatalogItem } from '@/types/service-catalog';
import { SERVICE_TYPES, JURISDICTIONS } from '@/types/service-catalog';

interface ServiceSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onServiceSelect?: (service: ServiceCatalogItem) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ServiceSearchInput({
  value,
  onChange,
  onServiceSelect,
  placeholder = 'Descripción del concepto...',
  className,
  disabled = false,
}: ServiceSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: services = [], isLoading } = useActiveServices();
  
  // Filter services based on search
  const filteredServices = services.filter(service => {
    if (!search || search.length < 2) return false;
    const searchLower = search.toLowerCase();
    return (
      service.name.toLowerCase().includes(searchLower) ||
      service.reference_code?.toLowerCase().includes(searchLower) ||
      service.description?.toLowerCase().includes(searchLower)
    );
  });
  
  const showSuggestions = search.length >= 2 && filteredServices.length > 0;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSearch(newValue);
    
    // Open popover only when typing and there are potential matches
    if (newValue.length >= 2) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };
  
  const handleSelectService = (service: ServiceCatalogItem) => {
    // Build description with reference
    const descriptionParts = [];
    if (service.reference_code) {
      descriptionParts.push(`[${service.reference_code}]`);
    }
    descriptionParts.push(service.name);
    if (service.description) {
      descriptionParts.push(`- ${service.description}`);
    }
    
    const fullDescription = descriptionParts.join(' ');
    onChange(fullDescription);
    setSearch('');
    setOpen(false);
    
    // Call callback with full service data
    if (onServiceSelect) {
      onServiceSelect(service);
    }
  };
  
  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative w-full">
      <Popover open={open && showSuggestions} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              value={value}
              onChange={handleInputChange}
              onFocus={() => {
                if (value.length >= 2) {
                  setSearch(value);
                  setOpen(true);
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'pr-8',
                className
              )}
            />
            {search.length >= 2 && (
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </PopoverAnchor>
        
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="border-b px-3 py-2 bg-muted/50">
            <p className="text-xs text-muted-foreground">
              {filteredServices.length} servicio(s) encontrado(s)
            </p>
          </div>
          <ScrollArea className="max-h-[250px]">
            <div className="p-1">
              {filteredServices.map((service) => {
                const typeConfig = SERVICE_TYPES[service.service_type as keyof typeof SERVICE_TYPES];
                const jurisdictionConfig = service.jurisdiction 
                  ? JURISDICTIONS[service.jurisdiction]
                  : null;
                
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleSelectService(service)}
                    className="w-full flex items-start gap-3 p-2 rounded-md hover:bg-accent text-left transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {service.reference_code && (
                          <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                            {service.reference_code}
                          </code>
                        )}
                        <span className="font-medium text-sm truncate">
                          {service.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {typeConfig && (
                          <Badge variant="secondary" className={cn('text-[10px] py-0', typeConfig.color)}>
                            {typeConfig.label}
                          </Badge>
                        )}
                        {jurisdictionConfig && (
                          <span className="text-xs text-muted-foreground">
                            {jurisdictionConfig.flag} {service.jurisdiction}
                          </span>
                        )}
                        <span className="text-xs font-medium text-primary ml-auto">
                          {service.base_price.toLocaleString('es-ES', {
                            style: 'currency',
                            currency: service.currency || 'EUR',
                          })}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
