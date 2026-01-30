// ============================================================
// IP-NEXUS - Expedientes List Page (Matters V2)
// ============================================================

import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, Search, X, MoreHorizontal, Eye, Pencil, Trash2, 
  Briefcase, Filter, Archive, AlertTriangle, CheckCircle2,
  Globe, Building2, Flag
} from 'lucide-react';
import { useMattersV2, useDeleteMatterV2, useMatterTypes, useMatterClients, useMatterJurisdictions } from '@/hooks/use-matters-v2';
import type { MatterV2Filters } from '@/hooks/use-matters-v2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { usePageTitle } from '@/contexts/page-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 20;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-slate-100 text-slate-700' },
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  filed: { label: 'Presentado', color: 'bg-blue-100 text-blue-700' },
  published: { label: 'Publicado', color: 'bg-purple-100 text-purple-700' },
  granted: { label: 'Concedido', color: 'bg-green-100 text-green-700' },
  active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700' },
  opposed: { label: 'En oposición', color: 'bg-red-100 text-red-700' },
  expired: { label: 'Expirado', color: 'bg-gray-100 text-gray-500' },
  abandoned: { label: 'Abandonado', color: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

const JURISDICTION_LABELS: Record<string, string> = {
  ES: '🇪🇸 España',
  EU: '🇪🇺 Unión Europea',
  US: '🇺🇸 Estados Unidos',
  EP: '🇪🇺 Patente Europea',
  WIPO: '🌐 WIPO/PCT',
  GB: '🇬🇧 Reino Unido',
  DE: '🇩🇪 Alemania',
  FR: '🇫🇷 Francia',
  CN: '🇨🇳 China',
  JP: '🇯🇵 Japón',
};

export default function ExpedientesPage() {
  usePageTitle('Expedientes');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const deleteMatter = useDeleteMatterV2();
  const { data: matterTypes } = useMatterTypes();
  const { data: clients } = useMatterClients();
  const { data: jurisdictions } = useMatterJurisdictions();
  
  const [filters, setFilters] = useState<MatterV2Filters>({});
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  
  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value || undefined }));
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  };
  
  const { data: matters, isLoading, error } = useMattersV2(filters);
  
  // Stats calculation
  const stats = useMemo(() => {
    if (!matters) return { total: 0, active: 0, pending: 0, atRisk: 0 };
    
    return {
      total: matters.length,
      active: matters.filter(m => m.status === 'active' || m.status === 'granted').length,
      pending: matters.filter(m => m.status === 'pending' || m.status === 'filed').length,
      atRisk: matters.filter(m => m.status === 'opposed' || m.is_urgent).length,
    };
  }, [matters]);
  
  // Pagination
  const paginatedMatters = useMemo(() => {
    if (!matters) return [];
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return matters.slice(start, start + ITEMS_PER_PAGE);
  }, [matters, currentPage]);
  
  const totalPages = Math.ceil((matters?.length || 0) / ITEMS_PER_PAGE);
  
  const hasActiveFilters = filters.search || filters.matter_type || filters.status || filters.jurisdiction || filters.client_id;
  const activeFilterCount = [filters.matter_type, filters.status, filters.jurisdiction, filters.client_id].filter(Boolean).length;
  
  const clearFilters = () => {
    setFilters({});
    setSearchInput('');
    setCurrentPage(1);
  };
  
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMatter.mutateAsync(deleteId);
      toast({ title: 'Expediente eliminado' });
      setDeleteId(null);
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    }
  };

  const getTypeConfig = (code: string) => {
    return matterTypes?.find(t => t.code === code) || { 
      name_es: code, 
      color: '#6B7280',
      icon: 'File'
    };
  };

  const selectedClient = clients?.find(c => c.id === filters.client_id);
  
  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error al cargar expedientes: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expedientes</h1>
          <p className="text-muted-foreground">Gestión de propiedad intelectual</p>
        </div>
        <Button onClick={() => navigate('/app/expedientes/nuevo')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Expediente
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isLoading ? '-' : stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{isLoading ? '-' : stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Archive className="h-4 w-4 text-blue-600" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{isLoading ? '-' : stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              En riesgo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{isLoading ? '-' : stats.atRisk}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, número, marca..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select
          value={filters.matter_type || ''}
          onValueChange={(v) => {
            setFilters(prev => ({ ...prev, matter_type: v || undefined }));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {matterTypes?.map((type) => (
              <SelectItem key={type.code} value={type.code}>
                {type.name_es}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.status || ''}
          onValueChange={(v) => {
            setFilters(prev => ({ ...prev, status: v || undefined }));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Jurisdiction Filter */}
        <Select
          value={filters.jurisdiction || ''}
          onValueChange={(v) => {
            setFilters(prev => ({ ...prev, jurisdiction: v || undefined }));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Jurisdicción" />
          </SelectTrigger>
          <SelectContent>
            {jurisdictions?.map((jur) => (
              <SelectItem key={jur} value={jur}>
                {JURISDICTION_LABELS[jur] || jur}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Client Filter with Search */}
        <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={clientSearchOpen}
              className={cn(
                "w-[200px] justify-between",
                filters.client_id && "border-primary"
              )}
            >
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
              <span className="truncate">
                {selectedClient?.name || "Cliente"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar cliente..." />
              <CommandList>
                <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                <CommandGroup>
                  {clients?.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={client.name}
                      onSelect={() => {
                        setFilters(prev => ({ 
                          ...prev, 
                          client_id: prev.client_id === client.id ? undefined : client.id 
                        }));
                        setCurrentPage(1);
                        setClientSearchOpen(false);
                      }}
                    >
                      <span className={cn(
                        "truncate",
                        filters.client_id === client.id && "font-semibold"
                      )}>
                        {client.name}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpiar {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        )}
      </div>
      
      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !matters?.length ? (
            <EmptyState
              icon={<Briefcase className="h-8 w-8" />}
              title="Sin expedientes"
              description={hasActiveFilters 
                ? "No se encontraron expedientes con los filtros seleccionados." 
                : "Crea tu primer expediente para empezar a gestionar tu propiedad intelectual."
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>Limpiar filtros</Button>
                ) : (
                  <Button onClick={() => navigate('/app/expedientes/nuevo')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primer expediente
                  </Button>
                )
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Número</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="w-[150px]">Cliente</TableHead>
                    <TableHead className="w-[100px]">Jurisdicción</TableHead>
                    <TableHead className="w-[120px]">Tipo</TableHead>
                    <TableHead className="w-[120px]">Estado</TableHead>
                    <TableHead className="w-[100px]">Fecha</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMatters.map((matter) => {
                    const typeConfig = getTypeConfig(matter.matter_type);
                    const statusConfig = STATUS_CONFIG[matter.status] || STATUS_CONFIG.draft;
                    
                    return (
                      <TableRow 
                        key={matter.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/app/expedientes/${matter.id}`)}
                      >
                        <TableCell className="font-mono text-sm">
                          {matter.matter_number}
                          {matter.is_urgent && (
                            <Badge variant="destructive" className="ml-2 text-xs">!</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium truncate max-w-[250px]">{matter.title}</p>
                            {matter.mark_name && (
                              <p className="text-sm text-muted-foreground">
                                {matter.mark_name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {matter.client_id && matter.client_name ? (
                            <Link
                              to={`/app/crm/clients/${matter.client_id}`}
                              className="text-primary hover:underline truncate block max-w-[140px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {matter.client_name}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {matter.jurisdiction_primary ? (
                            <Badge variant="outline" className="font-mono">
                              {JURISDICTION_LABELS[matter.jurisdiction_primary]?.split(' ')[0] || matter.jurisdiction_primary}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            style={{ 
                              backgroundColor: `${typeConfig.color}20`,
                              color: typeConfig.color,
                              borderColor: `${typeConfig.color}40`
                            }}
                          >
                            {typeConfig.name_es}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color} variant="secondary">
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(matter.created_at), 'dd MMM yy', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/app/expedientes/${matter.id}`);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/app/expedientes/${matter.id}/editar`);
                              }}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(matter.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                    {Math.min(currentPage * ITEMS_PER_PAGE, matters.length)} de {matters.length}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar expediente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los datos asociados al expediente.
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
