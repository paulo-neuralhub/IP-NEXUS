/**
 * Services Dashboard
 * Main view for managing service catalog
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  ArrowRight,
  Search,
  Filter,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  CATEGORY_CONFIG,
  SUBCATEGORY_LABELS,
} from '@/hooks/useServiceCatalogManagement';

export function ServicesDashboard() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const stats = useServiceStats();
  const { data: services = [], isLoading } = useOrganizationServices(true);
  
  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = !search || 
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // Group by category and subcategory
  const groupedServices = Object.entries(CATEGORY_CONFIG)
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
    .filter(g => g.services.length > 0);
  
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
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear nuevo
        </Button>
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
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
            <p className="text-xs text-muted-foreground">
              (+{stats.available - stats.active} por activar)
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
      
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Servicios activos</h2>
        <Button variant="outline" asChild>
          <Link to="/app/settings/servicios/catalogo">
            Ver disponibles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
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
      
      {/* Services List by Category */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Cargando servicios...
        </div>
      ) : groupedServices.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No hay servicios activos</h3>
          <p className="mt-2 text-muted-foreground">
            Activa servicios del catálogo preconfigurado o crea uno nuevo.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/app/settings/servicios/catalogo">
                Ver catálogo
              </Link>
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
