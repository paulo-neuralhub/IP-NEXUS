import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Download,
  CheckCircle,
  X,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWatchResults, useWatchlists, useMarkResultReviewed } from '@/hooks/use-spider';
import { WatchResultCard } from '@/components/features/spider/watch-result-card';
import { RESULT_STATUSES, RESULT_PRIORITIES } from '@/lib/constants/spider';
import type { WatchResultStatus, WatchResultPriority, WatchResultFilters } from '@/types/spider';

export default function WatchResultList() {
  const [filters, setFilters] = useState<WatchResultFilters>({});
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const { data: results, isLoading } = useWatchResults({
    ...filters,
    search: search || undefined,
  });
  const { data: watchlists } = useWatchlists(false);
  const markReviewed = useMarkResultReviewed();

  const handleSelectAll = () => {
    if (selectedIds.size === results?.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results?.map(r => r.id) || []));
    }
  };

  const handleSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = async (status: WatchResultStatus) => {
    for (const id of selectedIds) {
      await markReviewed.mutateAsync({ id, status });
    }
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/app/spider">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Resultados de Vigilancia</h1>
            <p className="text-muted-foreground">
              {results?.length || 0} resultados encontrados
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar resultados..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <Select
                value={filters.watchlist_id || 'all'}
                onValueChange={(v) => setFilters({ ...filters, watchlist_id: v === 'all' ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vigilancia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {watchlists?.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={(filters.status as string) || 'all'}
                onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? undefined : v as WatchResultStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(RESULT_STATUSES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={(filters.priority as string) || 'all'}
                onValueChange={(v) => setFilters({ ...filters, priority: v === 'all' ? undefined : v as WatchResultPriority })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(RESULT_PRIORITIES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="ghost" 
                onClick={() => {
                  setFilters({});
                  setSearch('');
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedIds.size} seleccionados</Badge>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                Deseleccionar
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('reviewing')}
                disabled={markReviewed.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Marcar revisado
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('dismissed')}
                disabled={markReviewed.isPending}
              >
                <X className="w-4 h-4 mr-1" />
                Descartar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleBulkAction('threat')}
                disabled={markReviewed.isPending}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Marcar amenaza
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </>
        ) : results?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No se encontraron resultados</p>
              <p className="text-sm">Prueba a ajustar los filtros o crear una nueva vigilancia</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center gap-2 px-2">
              <input
                type="checkbox"
                checked={selectedIds.size === results?.length && results.length > 0}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span className="text-sm text-muted-foreground">
                Seleccionar todos
              </span>
            </div>
            
            {results?.map(result => (
              <WatchResultCard
                key={result.id}
                result={result}
                selected={selectedIds.has(result.id)}
                onSelect={(selected) => handleSelect(result.id, selected)}
                onViewDetail={() => {}}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
