import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Tag, 
  Globe,
  Clock
} from 'lucide-react';
import { useRfqRequests, RfqRequestFilters } from '@/hooks/market/useRfqRequests';
import { RfqRequestCard } from '@/components/market/rfq';
import { 
  SERVICE_CATEGORY_LABELS, 
  URGENCY_LABELS, 
  JURISDICTIONS,
  ServiceCategory 
} from '@/types/quote-request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export default function RfqListPage() {
  const [filters, setFilters] = useState<RfqRequestFilters>({});
  const [searchInput, setSearchInput] = useState('');
  
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useRfqRequests(filters);
  
  const requests = data?.pages.flatMap(p => p.requests) || [];
  
  const handleSearch = () => {
    setFilters(f => ({ ...f, search: searchInput || undefined }));
  };
  
  const toggleCategory = (category: ServiceCategory) => {
    setFilters(f => {
      const current = f.service_category || [];
      const updated = current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category];
      return { ...f, service_category: updated.length ? updated : undefined };
    });
  };
  
  const toggleJurisdiction = (code: string) => {
    setFilters(f => {
      const current = f.jurisdictions || [];
      const updated = current.includes(code)
        ? current.filter(j => j !== code)
        : [...current, code];
      return { ...f, jurisdictions: updated.length ? updated : undefined };
    });
  };
  
  const clearFilters = () => {
    setFilters({});
    setSearchInput('');
  };
  
  const activeFiltersCount = 
    (filters.service_category?.length || 0) + 
    (filters.jurisdictions?.length || 0) + 
    (filters.urgency ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Solicitudes de Presupuesto
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Explora solicitudes abiertas y envía tus propuestas
          </p>
        </div>
        <Button asChild>
          <Link to="/app/market/rfq/new">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Solicitud
          </Link>
        </Button>
      </div>
      
      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar solicitudes..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button variant="secondary" onClick={handleSearch}>
              Buscar
            </Button>
          </div>
          
          {/* Filter buttons */}
          <div className="flex items-center gap-2">
            {/* Category filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Tag className="w-4 h-4 mr-2" />
                  Categoría
                  {filters.service_category?.length ? (
                    <Badge variant="secondary" className="ml-2">
                      {filters.service_category.length}
                    </Badge>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3">
                <div className="space-y-2">
                  {Object.entries(SERVICE_CATEGORY_LABELS).map(([key, config]) => (
                    <label 
                      key={key} 
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded"
                    >
                      <Checkbox
                        checked={filters.service_category?.includes(key as ServiceCategory)}
                        onCheckedChange={() => toggleCategory(key as ServiceCategory)}
                      />
                      <span className="text-sm">{config.es}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Jurisdiction filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Globe className="w-4 h-4 mr-2" />
                  Jurisdicción
                  {filters.jurisdictions?.length ? (
                    <Badge variant="secondary" className="ml-2">
                      {filters.jurisdictions.length}
                    </Badge>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 max-h-80 overflow-y-auto">
                <div className="space-y-2">
                  {JURISDICTIONS.map((j) => (
                    <label 
                      key={j.code} 
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded"
                    >
                      <Checkbox
                        checked={filters.jurisdictions?.includes(j.code)}
                        onCheckedChange={() => toggleJurisdiction(j.code)}
                      />
                      <span className="text-sm">{j.name}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Urgency filter */}
            <Select
              value={filters.urgency || 'all'}
              onValueChange={(v) => setFilters(f => ({ 
                ...f, 
                urgency: v === 'all' ? undefined : v 
              }))}
            >
              <SelectTrigger className="w-[140px]">
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Urgencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(URGENCY_LABELS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.es}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Clear filters */}
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar ({activeFiltersCount})
              </Button>
            )}
          </div>
        </div>
      </Card>
      
      {/* Results */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay solicitudes abiertas</h3>
          <p className="text-muted-foreground mb-4">
            {activeFiltersCount > 0 
              ? 'Prueba a ajustar los filtros de búsqueda'
              : 'Sé el primero en crear una solicitud de presupuesto'}
          </p>
          {activeFiltersCount > 0 ? (
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          ) : (
            <Button asChild>
              <Link to="/app/market/rfq/new">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Solicitud
              </Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <RfqRequestCard key={request.id} request={request} />
          ))}
          
          {hasNextPage && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
