/**
 * Services Dashboard
 * Main view for managing service catalog
 * Unified view with tabs for active and available services
 */

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ServiceCategoryAccordion } from './ServiceCategoryAccordion';
import { ServiceForm } from '@/components/service-catalog/ServiceForm';
import {
  useServiceStats,
  useOrganizationServices,
  usePreconfiguredServices,
  CATEGORY_CONFIG,
  SUBCATEGORY_LABELS,
} from '@/hooks/useServiceCatalogManagement';

export function ServicesDashboard() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAvailable, setShowAvailable] = useState(false);
  
  const stats = useServiceStats();
  const { data: services = [], isLoading } = useOrganizationServices(true);
  const { data: preconfigured = [], isLoading: loadingPreconfigured } = usePreconfiguredServices();
  
  // Map of activated preconfigured codes
  const activatedCodes = useMemo(() => 
    new Set(services.filter(s => s.preconfigured_code).map(s => s.preconfigured_code)),
    [services]
  );
  
  // Count available (not yet activated)
  const availableCount = preconfigured.filter(s => !activatedCodes.has(s.preconfigured_code)).length;

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['preconfigured-services'] });
    await queryClient.invalidateQueries({ queryKey: ['organization-services'] });
  };
  
  // Filter organization services
  const filteredServices = useMemo(() => 
    services.filter(service => {
      const matchesSearch = !search || 
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }),
    [services, search, categoryFilter]
  );
  
  // Filter preconfigured services (show all, indicate which are activated)
  const filteredPreconfigured = useMemo(() => 
    preconfigured.filter(service => {
      const matchesSearch = !search || 
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }),
    [preconfigured, search, categoryFilter]
  );
  
  // Group organization services by category
  const groupedServices = useMemo(() => 
    Object.entries(CATEGORY_CONFIG)
      .map(([key, config]) => {
        const categoryServices = filteredServices.filter(s => s.category === key);
        const subcategories = [...new Set(categoryServices.map(s => s.subcategory))];
        
        return {
          category: key,
          label: config.label,
          icon: config.icon,
          services: categoryServices,
          subcategories: subcategories.map(sub => ({
            key: sub || 'general',
            label: SUBCATEGORY_LABELS[sub || 'general'] || sub || 'General',
            services: categoryServices.filter(s => s.subcategory === sub),
          })),
        };
      })
      .filter(g => g.services.length > 0),
    [filteredServices]
  );
  
  // Group preconfigured services by category
  const groupedPreconfigured = useMemo(() => 
    Object.entries(CATEGORY_CONFIG)
      .map(([key, config]) => {
        const categoryServices = filteredPreconfigured.filter(s => s.category === key);
        const subcategories = [...new Set(categoryServices.map(s => s.subcategory))];
        
        return {
          category: key,
          label: config.label,
          icon: config.icon,
          services: categoryServices,
          subcategories: subcategories.map(sub => ({
            key: sub || 'general',
            label: SUBCATEGORY_LABELS[sub || 'general'] || sub || 'General',
            services: categoryServices.filter(s => s.subcategory === sub),
          })),
        };
      })
      .filter(g => g.services.length > 0),
    [filteredPreconfigured]
  );
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de Servicios</h1>
          <p className="text-muted-foreground">
            Gestiona los servicios que ofreces a tus clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isLoading || loadingPreconfigured}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${(isLoading || loadingPreconfigured) ? 'animate-spin' : ''}`} />
            Refrescar
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear nuevo
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              servicios disponibles
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Catálogo</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingPreconfigured ? (
                <span className="text-muted-foreground">...</span>
              ) : (
                stats.available
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {loadingPreconfigured ? 'cargando...' : `${availableCount} por activar`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Layers className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">
              tipos de servicio
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio pendiente</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPrice}</div>
            <p className="text-xs text-muted-foreground">
              sin configurar precio
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* View Toggle */}
      <div className="flex gap-2">
        <Button 
          variant={!showAvailable ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAvailable(false)}
        >
          Mis servicios ({services.length})
        </Button>
        <Button 
          variant={showAvailable ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAvailable(true)}
        >
          Ver disponibles ({preconfigured.length})
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Todas las categorías" />
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
      {(isLoading || loadingPreconfigured) ? (
        <div className="text-center py-8 text-muted-foreground">
          Cargando servicios...
        </div>
      ) : showAvailable ? (
        // Available/Preconfigured Services View
        groupedPreconfigured.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No hay servicios</h3>
            <p className="mt-2 text-muted-foreground">
              No se encontraron servicios con los filtros aplicados.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {groupedPreconfigured.map((group) => (
              <ServiceCategoryAccordion
                key={group.category}
                category={group.category}
                label={group.label}
                icon={group.icon}
                subcategories={group.subcategories}
                activatedCodes={activatedCodes}
                showAvailableActions={true}
              />
            ))}
          </div>
        )
      ) : (
        // Organization Services View
        groupedServices.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No hay servicios activos</h3>
            <p className="mt-2 text-muted-foreground">
              Activa servicios del catálogo o crea uno nuevo.
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <Button variant="outline" onClick={() => setShowAvailable(true)}>
                Ver disponibles
              </Button>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear nuevo
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {groupedServices.map((group) => (
              <ServiceCategoryAccordion
                key={group.category}
                category={group.category}
                label={group.label}
                icon={group.icon}
                subcategories={group.subcategories}
              />
            ))}
          </div>
        )
      )}
      
      {/* Create Service Modal */}
      <ServiceForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={() => setShowCreateForm(false)}
      />
    </div>
  );
}
