// ════════════════════════════════════════════════════════════════════════════
// IP-NEXUS - SERVICE TEMPLATE SELECTOR (PROMPT 4)
// Componente para seleccionar servicios en facturas/presupuestos
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, Filter, Loader2, Globe, FileText, Scale } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useServiceTemplates, useServiceCategories } from '@/hooks/useServiceTemplates';
import { JURISDICTIONS, SERVICE_TYPES } from '@/types/service-catalog';
import type { ServiceCatalogItem } from '@/types/service-catalog';
import { cn } from '@/lib/utils';

interface ServiceTemplateSelectorProps {
  onSelect: (service: ServiceCatalogItem) => void;
  selectedIds?: string[];
  trigger?: React.ReactNode;
  allowMultiple?: boolean;
}

export function ServiceTemplateSelector({
  onSelect,
  selectedIds = [],
  trigger,
  allowMultiple = false,
}: ServiceTemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const { data: categories, isLoading: loadingCategories } = useServiceCategories();
  const { data: services, isLoading: loadingServices } = useServiceTemplates({
    category_id: categoryFilter,
    jurisdiction: jurisdictionFilter,
    search: search.length >= 2 ? search : undefined,
  });

  // Agrupar servicios por categoría
  const groupedServices = useMemo(() => {
    if (!services || !categories) return {};

    const groups: Record<string, ServiceCatalogItem[]> = {};
    
    services.forEach(service => {
      const categoryId = service.category_id || 'uncategorized';
      if (!groups[categoryId]) {
        groups[categoryId] = [];
      }
      groups[categoryId].push(service);
    });

    return groups;
  }, [services, categories]);

  // Filtrar por tab
  const filteredServices = useMemo(() => {
    if (!services) return [];
    
    if (activeTab === 'all') return services;
    if (activeTab === 'trademarks') return services.filter(s => s.service_type?.startsWith('tm_'));
    if (activeTab === 'patents') return services.filter(s => s.service_type?.startsWith('pt_'));
    if (activeTab === 'designs') return services.filter(s => s.service_type?.startsWith('ds_'));
    if (activeTab === 'legal') return services.filter(s => ['legal_consulting', 'litigation'].includes(s.service_type || ''));
    
    return services;
  }, [services, activeTab]);

  const handleSelect = (service: ServiceCatalogItem) => {
    onSelect(service);
    if (!allowMultiple) {
      setOpen(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getJurisdictionDisplay = (code: string | null) => {
    if (!code) return { flag: '🌐', label: 'Global' };
    const j = JURISDICTIONS[code];
    return j ? { flag: j.flag, label: j.label } : { flag: '🌐', label: code };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Añadir servicio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Catálogo de Servicios IP
          </DialogTitle>
        </DialogHeader>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 py-2 border-b">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar servicio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories?.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name_es}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Jurisdicción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las jurisdicciones</SelectItem>
              {Object.entries(JURISDICTIONS).map(([code, j]) => (
                <SelectItem key={code} value={code}>
                  {j.flag} {j.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs por tipo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="trademarks">Marcas</TabsTrigger>
            <TabsTrigger value="patents">Patentes</TabsTrigger>
            <TabsTrigger value="designs">Diseños</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 mt-0 min-h-0">
            <ScrollArea className="h-[400px] pr-4">
              {loadingServices || loadingCategories ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Scale className="h-12 w-12 mb-4 opacity-50" />
                  <p>No se encontraron servicios</p>
                  <p className="text-sm">Prueba con otros filtros</p>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  {filteredServices.map((service) => {
                    const isSelected = selectedIds.includes(service.id);
                    const jurisdiction = getJurisdictionDisplay(service.jurisdiction);
                    const typeInfo = SERVICE_TYPES[service.service_type || ''];

                    return (
                      <div
                        key={service.id}
                        onClick={() => handleSelect(service)}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                            <span className="font-medium truncate">{service.name}</span>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {jurisdiction.flag} {jurisdiction.label}
                            </Badge>
                            {typeInfo && (
                              <Badge className={cn('text-xs flex-shrink-0', typeInfo.color)}>
                                {typeInfo.label}
                              </Badge>
                            )}
                          </div>
                          {service.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            {service.estimated_days && (
                              <span>⏱️ ~{service.estimated_days} días</span>
                            )}
                            {service.nice_classes_included > 0 && (
                              <span>📋 {service.nice_classes_included} clase(s) incluida(s)</span>
                            )}
                            {service.generates_matter && (
                              <span className="text-primary">📁 Genera expediente</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 ml-4">
                          <div className="font-semibold text-foreground">
                            {formatPrice(service.base_price, service.currency)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span>Oficial: {formatPrice(service.official_fee, service.currency)}</span>
                            <span className="mx-1">+</span>
                            <span>Prof: {formatPrice(service.professional_fee, service.currency)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {filteredServices.length} servicios disponibles
          </p>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ServiceTemplateSelector;