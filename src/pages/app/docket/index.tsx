import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X, MoreHorizontal, Eye, Pencil, Copy, Trash2, Briefcase, Zap, List } from 'lucide-react';
import { useMatters, useDeleteMatter } from '@/hooks/use-matters';
import { MatterStatusBadge, MatterTypeBadge, ExpiryIndicator } from '@/components/features/docket';
import { MATTER_TYPES, MATTER_STATUSES, JURISDICTIONS } from '@/lib/constants/matters';
import type { MatterFilters, MatterType, MatterStatus } from '@/types/matters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
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
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { CommandCenter } from '@/components/docket/god-mode';
import { FeatureGuide, HelpBox } from '@/components/help';
import { useContextualHelp } from '@/hooks/useContextualHelp';
import { usePageTitle } from '@/contexts/page-context';

const ITEMS_PER_PAGE = 20;

export default function DocketPage() {
  const [activeView, setActiveView] = useState<'command' | 'matters'>('command');
  const { featureKey, currentGuide, shouldShowGuide } = useContextualHelp();

  usePageTitle(activeView === 'command' ? 'Docket · Command Center' : 'Docket · Expedientes');

  return (
    <div className="p-6 space-y-6">
      {currentGuide && shouldShowGuide(featureKey) ? (
        <FeatureGuide featureKey={featureKey} title={currentGuide.title} steps={currentGuide.steps} />
      ) : null}

      {activeView === 'command' ? (
        <CommandCenter
          afterStats={<DocketViewToggle value={activeView} onChange={setActiveView} />}
        />
      ) : (
        <div className="space-y-4">
          <DocketViewToggle value={activeView} onChange={setActiveView} />
          <MatterListView />
        </div>
      )}
    </div>
  );
}

function DocketViewToggle({
  value,
  onChange,
}: {
  value: 'command' | 'matters';
  onChange: (v: 'command' | 'matters') => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange('command')}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
          value === 'command'
            ? 'bg-primary text-primary-foreground border-primary/30'
            : 'bg-background-card text-foreground border-border hover:bg-muted/40',
        )}
      >
        <Zap className="h-4 w-4" />
        Command Center
      </button>
      <button
        type="button"
        onClick={() => onChange('matters')}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
          value === 'matters'
            ? 'bg-primary text-primary-foreground border-primary/30'
            : 'bg-background-card text-foreground border-border hover:bg-muted/40',
        )}
      >
        <List className="h-4 w-4" />
        Expedientes
      </button>
    </div>
  );
}

// Extracted Matter List as a separate component
function MatterListView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const deleteMatter = useDeleteMatter();
  
  const [filters, setFilters] = useState<MatterFilters>({});
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value || undefined }));
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  };
  
  const { data: matters, isLoading, error } = useMatters(filters);
  
  // Stats calculation
  const stats = useMemo(() => {
    if (!matters) return { total: 0, active: 0, expiring: 0, atRisk: 0 };
    
    const now = Date.now();
    const days30 = 30 * 24 * 60 * 60 * 1000;
    const days90 = 90 * 24 * 60 * 60 * 1000;
    
    return {
      total: matters.length,
      active: matters.filter(m => m.status === 'active' || m.status === 'granted').length,
      expiring: matters.filter(m => {
        if (!m.expiry_date) return false;
        const diff = new Date(m.expiry_date).getTime() - now;
        return diff > 0 && diff <= days90;
      }).length,
      atRisk: matters.filter(m => {
        if (m.status === 'opposed') return true;
        if (!m.expiry_date) return false;
        const diff = new Date(m.expiry_date).getTime() - now;
        return diff > 0 && diff <= days30;
      }).length,
    };
  }, [matters]);
  
  // Pagination
  const paginatedMatters = useMemo(() => {
    if (!matters) return [];
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return matters.slice(start, start + ITEMS_PER_PAGE);
  }, [matters, currentPage]);
  
  const totalPages = Math.ceil((matters?.length || 0) / ITEMS_PER_PAGE);
  
  const hasActiveFilters = filters.search || filters.type || filters.status || filters.jurisdiction;
  
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
  
  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Error al cargar expedientes: {error.message}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Lista de Expedientes</h2>
        <Button onClick={() => navigate('/app/docket/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Expediente
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, referencia, marca..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select
          value={filters.type as string || ''}
          onValueChange={(v) => {
            setFilters(prev => ({ ...prev, type: v as MatterType || undefined }));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MATTER_TYPES).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.status as string || ''}
          onValueChange={(v) => {
            setFilters(prev => ({ ...prev, status: v as MatterStatus || undefined }));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MATTER_STATUSES).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.jurisdiction || ''}
          onValueChange={(v) => {
            setFilters(prev => ({ ...prev, jurisdiction: v || undefined }));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Jurisdicción" />
          </SelectTrigger>
          <SelectContent>
            {JURISDICTIONS.map((j) => (
              <SelectItem key={j.code} value={j.code}>{j.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isLoading ? '-' : stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{isLoading ? '-' : stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Próximos a vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{isLoading ? '-' : stats.expiring}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En riesgo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{isLoading ? '-' : stats.atRisk}</p>
          </CardContent>
        </Card>
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
                <Button onClick={() => navigate('/app/docket/new')}>
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
                    <TableHead className="w-[100px]">Ref</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="w-[120px]">Tipo</TableHead>
                    <TableHead className="w-[120px]">Estado</TableHead>
                    <TableHead className="w-[80px]">Jurisd.</TableHead>
                    <TableHead className="w-[140px]">Vencimiento</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMatters.map((matter) => (
                    <TableRow 
                      key={matter.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/app/docket/${matter.id}`)}
                    >
                      <TableCell className="font-medium">{matter.reference}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={matter.title}>
                        {matter.title}
                      </TableCell>
                      <TableCell>
                        <MatterTypeBadge type={matter.type as MatterType} />
                      </TableCell>
                      <TableCell>
                        <MatterStatusBadge status={matter.status as MatterStatus} />
                      </TableCell>
                      <TableCell className="text-center">
                        {matter.jurisdiction_code || '—'}
                      </TableCell>
                      <TableCell>
                        <ExpiryIndicator date={matter.expiry_date} />
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
                              navigate(`/app/docket/${matter.id}`);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/app/docket/${matter.id}/edit`);
                            }}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              toast({ title: 'Duplicar', description: 'Funcionalidad próximamente' });
                            }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
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
                  ))}
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
              Esta acción no se puede deshacer. Se eliminarán todos los documentos y eventos asociados.
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
