import { useState } from 'react';
import { useMarketUsers, useMarketUserStats } from '@/hooks/market/useMarketUsers';
import { AgentCard, AgentFilters } from '@/components/market/agents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Users, 
  BadgeCheck, 
  Star, 
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import { MarketUserFilters } from '@/types/market-users';

export default function AgentsDirectoryPage() {
  const [filters, setFilters] = useState<MarketUserFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const { data: stats } = useMarketUserStats();
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useMarketUsers({
    ...filters,
    search: searchQuery,
  });

  const agents = data?.pages.flatMap(page => page.users) || [];

  const handleSearch = (search: string) => {
    setSearchQuery(search);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalAgents || 0}</p>
              <p className="text-xs text-muted-foreground">Agentes registrados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <BadgeCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.verifiedAgents || 0}</p>
              <p className="text-xs text-muted-foreground">Verificados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Star className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">4.7</p>
              <p className="text-xs text-muted-foreground">Rating promedio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <AgentFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        onSearch={handleSearch}
      />

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && searchQuery && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Buscando: "{searchQuery}"
          </span>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar todo
          </Button>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : agents.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  'Cargar más agentes'
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron agentes</h3>
            <p className="text-muted-foreground mb-4">
              Intenta ajustar los filtros de búsqueda
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
