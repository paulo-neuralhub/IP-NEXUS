/**
 * Available Services Catalog
 * View for activating preconfigured services
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Check,
  ChevronDown,
  ChevronRight,
  Package,
  Loader2,
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import { ServiceActivateModal } from './ServiceActivateModal';
import {
  usePreconfiguredServices,
  useOrganizationServices,
  useBulkActivateServices,
  CATEGORY_CONFIG,
  SUBCATEGORY_LABELS,
  type PreconfiguredService,
} from '@/hooks/useServiceCatalogManagement';
import { cn } from '@/lib/utils';

export function ServicesAvailable() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(CATEGORY_CONFIG))
  );
  const [activatingService, setActivatingService] = useState<PreconfiguredService | null>(null);
  
  const { data: preconfigured = [], isLoading } = usePreconfiguredServices();
  const { data: orgServices = [] } = useOrganizationServices(true);
  const bulkActivate = useBulkActivateServices();
  
  // Get activated codes
  const activatedCodes = useMemo(() => 
    new Set(orgServices.filter(s => s.preconfigured_code).map(s => s.preconfigured_code)),
    [orgServices]
  );
  
  // Filter services
  const filteredServices = useMemo(() => 
    preconfigured.filter(service => {
      const matchesSearch = !search || 
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }),
    [preconfigured, search, categoryFilter]
  );
  
  // Group by category
  const groupedServices = useMemo(() => 
    Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
      const categoryServices = filteredServices.filter(s => s.category === key);
      const subcategories = [...new Set(categoryServices.map(s => s.subcategory))];
      
      return {
        category: key,
        label: config.label,
        icon: config.icon,
        count: categoryServices.length,
        activeCount: categoryServices.filter(s => activatedCodes.has(s.preconfigured_code)).length,
        subcategories: subcategories.map(sub => ({
          key: sub || 'general',
          label: SUBCATEGORY_LABELS[sub || 'general'] || sub || 'General',
          services: categoryServices.filter(s => s.subcategory === sub),
        })),
      };
    }).filter(g => g.count > 0),
    [filteredServices, activatedCodes]
  );
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };
  
  // Toggle service selection
  const toggleSelection = (code: string) => {
    const newSelection = new Set(selectedServices);
    if (newSelection.has(code)) {
      newSelection.delete(code);
    } else {
      newSelection.add(code);
    }
    setSelectedServices(newSelection);
  };
  
  // Handle bulk activation
  const handleBulkActivate = async () => {
    try {
      const codesToActivate = Array.from(selectedServices).filter(
        code => !activatedCodes.has(code)
      );
      
      if (codesToActivate.length === 0) {
        toast.info('No hay servicios nuevos para activar');
        return;
      }
      
      await bulkActivate.mutateAsync(codesToActivate);
      toast.success(`${codesToActivate.length} servicios activados`);
      setSelectedServices(new Set());
    } catch (error) {
      toast.error('Error al activar servicios');
    }
  };
  
  // Format price
  const formatPrice = (price: number, includesFees: boolean) => {
    if (price === 0) return 'A consultar';
    const formattedPrice = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    return includesFees ? `${formattedPrice} + tasas` : `${formattedPrice} sugerido`;
  };
  
  // Count selected not activated
  const selectableNotActivated = Array.from(selectedServices).filter(
    code => !activatedCodes.has(code)
  ).length;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/app/settings/servicios">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Servicios Disponibles</h1>
          <p className="text-muted-foreground">
            Activa los servicios que ofreces. Podrás personalizar precios y descripciones después.
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.icon} {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar servicios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      {/* Services List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2">Cargando catálogo...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedServices.map((group) => (
            <Card key={group.category}>
              <Collapsible
                open={expandedCategories.has(group.category)}
                onOpenChange={() => toggleCategory(group.category)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedCategories.has(group.category) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-xl">{group.icon}</span>
                        <span className="font-semibold text-lg">{group.label}</span>
                        <Badge variant="secondary">
                          {group.count} servicios
                        </Badge>
                      </div>
                      {expandedCategories.has(group.category) ? null : (
                        <span className="text-sm text-muted-foreground">
                          Expandir
                        </span>
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="divide-y">
                      {group.subcategories.map((subcategory) => (
                        <div key={subcategory.key} className="py-4 first:pt-0 last:pb-0">
                          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                            {subcategory.label}
                          </h4>
                          <div className="space-y-2">
                            {subcategory.services.map((service) => {
                              const isActivated = activatedCodes.has(service.preconfigured_code);
                              const isSelected = selectedServices.has(service.preconfigured_code);
                              
                              return (
                                <div
                                  key={service.preconfigured_code}
                                  className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                    isActivated 
                                      ? "bg-accent/50 border-accent" 
                                      : isSelected
                                        ? "bg-primary/5 border-primary"
                                        : "bg-background border-border hover:border-primary/50"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <Checkbox
                                      checked={isActivated || isSelected}
                                      disabled={isActivated}
                                      onCheckedChange={() => toggleSelection(service.preconfigured_code)}
                                    />
                                    <div>
                                      <p className="font-medium">{service.name}</p>
                                      {service.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                          {service.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                                      {formatPrice(service.base_price, service.includes_official_fees)}
                                    </span>
                                    {isActivated ? (
                                      <Badge variant="secondary">
                                        <Check className="mr-1 h-3 w-3" />
                                        Activo
                                      </Badge>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActivatingService(service)}
                                      >
                                        + Activar
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
      
      {/* Bulk Activation Bar */}
      {selectedServices.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <Card className="shadow-lg border-2">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="font-medium">
                Seleccionados: {selectedServices.size} de {preconfigured.length}
              </span>
              {selectableNotActivated > 0 && (
                <Button onClick={handleBulkActivate} disabled={bulkActivate.isPending}>
                  {bulkActivate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Activar {selectableNotActivated} seleccionados
                </Button>
              )}
              <Button variant="ghost" onClick={() => setSelectedServices(new Set())}>
                Limpiar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Activate Modal */}
      <ServiceActivateModal
        service={activatingService}
        open={!!activatingService}
        onOpenChange={(open) => !open && setActivatingService(null)}
      />
    </div>
  );
}
