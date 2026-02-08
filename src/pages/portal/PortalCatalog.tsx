/**
 * Portal Catálogo de Servicios - Vista mejorada
 */

import { useState, useMemo } from 'react';
import { useServiceCatalog, type ServiceCatalogItem } from '@/hooks/use-service-catalog';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  ShoppingCart, 
  Tag,
  Stamp,
  Lightbulb,
  Eye,
  Scale,
  Globe,
  FileText,
  LayoutGrid,
  List
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { ServiceDetailModal } from '@/components/portal/ServiceDetailModal';
import { ServiceCategoryCard } from '@/components/portal/ServiceCategoryCard';

// Configuración de categorías con iconos y colores
const CATEGORY_CONFIG: Record<string, { icon: typeof Stamp; color: string }> = {
  'Marcas': { icon: Stamp, color: 'bg-blue-600' },
  'Patentes': { icon: Lightbulb, color: 'bg-purple-600' },
  'Vigilancia': { icon: Eye, color: 'bg-amber-600' },
  'Litigios': { icon: Scale, color: 'bg-red-600' },
  'Dominios': { icon: Globe, color: 'bg-green-600' },
  'Otros': { icon: FileText, color: 'bg-gray-600' },
};

type ViewMode = 'categories' | 'list';

export default function PortalCatalog() {
  const catalogQuery = useServiceCatalog();
  const services = catalogQuery.data ?? [];
  const { user: portalUser } = usePortalAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedService, setSelectedService] = useState<ServiceCatalogItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Agrupar servicios por categoría
  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, ServiceCatalogItem[]> = {};
    
    services.forEach(service => {
      const categoryName = typeof service.category === 'object' ? service.category?.name_es : service.category || 'Otros';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(service);
    });

    return grouped;
  }, [services]);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    return Object.keys(servicesByCategory).sort();
  }, [servicesByCategory]);

  // Filtrar servicios
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = !searchQuery || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const categoryName = typeof service.category === 'object' ? service.category?.name_es : service.category || 'Otros';
      const matchesCategory = selectedCategory === 'all' || categoryName === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory]);

  // Servicios filtrados por categoría para vista grid
  const filteredByCategory = useMemo(() => {
    if (selectedCategory !== 'all') {
      return { [selectedCategory]: filteredServices };
    }
    
    const grouped: Record<string, ServiceCatalogItem[]> = {};
    filteredServices.forEach(service => {
      const categoryName = typeof service.category === 'object' ? service.category?.name_es : service.category || 'Otros';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(service);
    });
    return grouped;
  }, [filteredServices, selectedCategory]);

  const handleServiceClick = (service: ServiceCatalogItem) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  const handleRequest = async (service: ServiceCatalogItem) => {
    try {
      const orgId = portalUser?.portal?.organization_id;
      if (!orgId) {
        toast.error('No se pudo identificar la organización.');
        return;
      }

      // Create an activity log entry for the law firm to see
      const { error } = await supabase.from('activity_log').insert({
        organization_id: orgId,
        entity_type: 'service_request',
        entity_id: service.id,
        action: 'service_requested',
        title: `Solicitud de servicio: ${service.name}`,
        description: `El cliente ha solicitado el servicio "${service.name}" desde el portal.`,
        metadata: {
          service_id: service.id,
          service_name: service.name,
          service_category: typeof service.category === 'object' ? service.category?.name_es : service.category,
          base_price: service.base_price,
          currency: service.currency,
          source: 'portal_catalog',
        },
      });

      if (error) throw error;
      toast.success(`Solicitud de "${service.name}" registrada. El despacho se pondrá en contacto.`);
      setModalOpen(false);
    } catch (error) {
      toast.error('Error al registrar la solicitud. Inténtalo de nuevo.');
    }
  };

  const handleViewAll = (category: string) => {
    setSelectedCategory(category);
    setViewMode('list');
  };

  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryConfig = (category: string) => {
    return CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Otros'];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Servicios Disponibles</h1>
        <p className="text-muted-foreground">
          Explora y solicita los servicios de propiedad intelectual disponibles
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar servicios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'categories' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('categories')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista por categorías */}
      {viewMode === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(filteredByCategory).map(([category, categoryServices]) => {
            const config = getCategoryConfig(category);
            return (
              <ServiceCategoryCard
                key={category}
                category={category}
                icon={config.icon}
                color={config.color}
                services={categoryServices}
                onServiceClick={handleServiceClick}
                onViewAll={handleViewAll}
              />
            );
          })}
        </div>
      )}

      {/* Vista lista */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const categoryName = typeof service.category === 'object' ? service.category?.name_es : service.category || 'Otros';
            const config = getCategoryConfig(categoryName);
            const Icon = config.icon;
            
            return (
              <Card 
                key={service.id} 
                className="flex flex-col hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleServiceClick(service)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        config.color
                      )}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                        {service.name}
                      </CardTitle>
                    </div>
                  </div>
                  {categoryName && (
                    <Badge variant="secondary" className="w-fit text-xs mt-1">
                      <Tag className="w-3 h-3 mr-1" />
                      {categoryName}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-3">
                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-primary">
                        {service.base_price > 0 
                          ? formatCurrency(service.base_price, service.currency)
                          : 'Consultar'
                        }
                      </p>
                      {service.base_price > 0 && (
                        <p className="text-xs text-muted-foreground">Precio base</p>
                      )}
                    </div>
                    <Button size="sm" className="gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Solicitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {filteredServices.length === 0 && !catalogQuery.isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No se encontraron servicios</p>
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== 'all'
                ? 'Prueba ajustando los filtros de búsqueda'
                : 'No hay servicios disponibles en este momento'
              }
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal detalle */}
      <ServiceDetailModal
        service={selectedService}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onRequest={handleRequest}
      />
    </div>
  );
}
