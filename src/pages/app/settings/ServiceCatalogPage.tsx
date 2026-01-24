/**
 * Service Catalog Page
 * Configuration page for managing service catalog items
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  AlertCircle,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/use-page-title';
import { useServiceCatalog, useDeleteService, useUpdateService } from '@/hooks/use-service-catalog';
import { ServiceForm, ExpandableServiceRow } from '@/components/service-catalog';
import { 
  SERVICE_TYPES, 
  type ServiceCatalogItem, 
  type ServiceType,
} from '@/types/service-catalog';
import { toast } from 'sonner';

export default function ServiceCatalogPage() {
  usePageTitle('Catálogo de Servicios');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ServiceType | 'all'>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceCatalogItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceCatalogItem | null>(null);

  const { data: services, isLoading, error, refetch } = useServiceCatalog({
    is_active: showInactive ? undefined : true,
  });
  const deleteService = useDeleteService();
  const updateService = useUpdateService();

  // Filter services
  const filteredServices = (services || []).filter(service => {
    const matchesSearch = !searchQuery || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.reference_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || service.service_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Stats
  const stats = {
    total: services?.length || 0,
    active: services?.filter(s => s.is_active).length || 0,
    byType: Object.entries(SERVICE_TYPES).map(([key]) => ({
      type: key,
      count: services?.filter(s => s.service_type === key).length || 0,
    })),
  };

  // Handlers
  const handleEdit = (service: ServiceCatalogItem) => {
    setSelectedService(service);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      await deleteService.mutateAsync(serviceToDelete.id);
      toast.success('Servicio eliminado');
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar servicio');
    }
  };

  const handleToggleActive = async (service: ServiceCatalogItem) => {
    try {
      await updateService.mutateAsync({
        id: service.id,
        data: { is_active: !service.is_active },
      });
      toast.success(service.is_active ? 'Servicio desactivado' : 'Servicio activado');
    } catch (error) {
      toast.error('Error al actualizar servicio');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedService(null);
  };

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de Servicios</h1>
          <p className="text-muted-foreground">Gestiona los servicios que ofreces a tus clientes</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Error al cargar servicios: {error.message}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de Servicios</h1>
          <p className="text-muted-foreground">
            Gestiona los servicios y tarifas que ofreces a tus clientes
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total servicios</div>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats.total}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Activos</div>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-primary">{stats.active}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Marcas</div>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">
                {stats.byType.find(t => t.type === 'marca')?.count || 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Patentes</div>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">
                {stats.byType.find(t => t.type === 'patente')?.count || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Lista de servicios</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mostrar inactivos</span>
                <Switch checked={showInactive} onCheckedChange={setShowInactive} />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ServiceType | 'all')}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-28">Referencia</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-28">Tipo</TableHead>
                <TableHead className="w-24">Jurisd.</TableHead>
                <TableHead className="text-right w-24">Tasas</TableHead>
                <TableHead className="text-right w-24">Honor.</TableHead>
                <TableHead className="text-right w-24">Total</TableHead>
                <TableHead className="w-16">Activo</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              
              {!isLoading && filteredServices.map((service) => (
                <ExpandableServiceRow
                  key={service.id}
                  service={service}
                  onEdit={handleEdit}
                  onDelete={(s) => {
                    setServiceToDelete(s);
                    setDeleteDialogOpen(true);
                  }}
                  onToggleActive={handleToggleActive}
                />
              ))}

              {/* Empty state */}
              {!isLoading && filteredServices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">No hay servicios</p>
                        <p className="text-sm text-muted-foreground">
                          {searchQuery 
                            ? `No se encontraron resultados para "${searchQuery}"`
                            : 'Crea tu primer servicio para empezar'
                          }
                        </p>
                      </div>
                      {!searchQuery && (
                        <Button size="sm" onClick={() => setShowForm(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Crear primer servicio
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Service Form Modal */}
      <ServiceForm
        open={showForm}
        onOpenChange={handleFormClose}
        service={selectedService}
        onSuccess={() => refetch()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El servicio "{serviceToDelete?.name}" 
              será eliminado permanentemente del catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
