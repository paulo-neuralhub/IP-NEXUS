/**
 * Service Selector Component
 * Modal for selecting services from catalog to add to quotes/invoices
 */

import { useState } from 'react';
import { Search, Plus, Check } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { useActiveServices } from '@/hooks/use-service-catalog';
import { SERVICE_TYPES, JURISDICTIONS, type ServiceCatalogItem, type ServiceType } from '@/types/service-catalog';

interface ServiceSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (service: ServiceCatalogItem) => void;
  multiSelect?: boolean;
  selectedIds?: string[];
}

export function ServiceSelector({ 
  open, 
  onOpenChange, 
  onSelect,
  multiSelect = false,
  selectedIds = [],
}: ServiceSelectorProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ServiceType | 'all'>('all');
  const [localSelected, setLocalSelected] = useState<string[]>(selectedIds);

  const { data: services, isLoading } = useActiveServices();

  // Filter services
  const filteredServices = (services || []).filter(service => {
    const matchesSearch = !search || 
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.reference_code?.toLowerCase().includes(search.toLowerCase()) ||
      service.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'all' || service.service_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleSelect = (service: ServiceCatalogItem) => {
    if (multiSelect) {
      if (localSelected.includes(service.id)) {
        setLocalSelected(prev => prev.filter(id => id !== service.id));
      } else {
        setLocalSelected(prev => [...prev, service.id]);
      }
    } else {
      onSelect(service);
      onOpenChange(false);
    }
  };

  const handleConfirm = () => {
    if (multiSelect) {
      const selectedServices = services?.filter(s => localSelected.includes(s.id)) || [];
      selectedServices.forEach(service => onSelect(service));
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Seleccionar Servicio del Catálogo</DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o referencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ServiceType | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {Object.entries(SERVICE_TYPES).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Service List */}
        <ScrollArea className="h-[400px] border rounded-lg">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-10 w-24" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
              <Search className="w-10 h-10 mb-3 opacity-50" />
              <p className="font-medium">No se encontraron servicios</p>
              <p className="text-sm">Prueba con otros filtros</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredServices.map((service) => {
                const typeConfig = SERVICE_TYPES[service.service_type as ServiceType] || SERVICE_TYPES.general;
                const isSelected = localSelected.includes(service.id);
                
                return (
                  <div
                    key={service.id}
                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleSelect(service)}
                  >
                    <div className="flex-shrink-0 w-24">
                      <Badge variant="outline" className="text-xs font-mono">
                        {service.reference_code || '-'}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{service.name}</span>
                        <Badge className={typeConfig.color} variant="secondary">
                          {typeConfig.label}
                        </Badge>
                        {service.jurisdiction && JURISDICTIONS[service.jurisdiction] && (
                          <span className="text-sm">
                            {JURISDICTIONS[service.jurisdiction].flag}
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {service.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 text-right">
                      <div className="font-semibold">
                        {service.base_price.toLocaleString('es-ES', { 
                          minimumFractionDigits: 2 
                        })} €
                      </div>
                      {service.official_fee > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Tasas: {service.official_fee}€ + Hon: {service.professional_fee}€
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 w-10">
                      {isSelected ? (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {multiSelect && (
            <Button onClick={handleConfirm} disabled={localSelected.length === 0}>
              Añadir {localSelected.length > 0 ? `(${localSelected.length})` : ''}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
