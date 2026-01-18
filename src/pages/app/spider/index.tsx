import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Bell, 
  AlertTriangle, 
  Eye,
  ArrowRight,
  Radar,
  Globe,
  Stamp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useSpiderStats, 
  useWatchResults, 
  useWatchlists 
} from '@/hooks/use-spider';
import { AlertsPanel } from '@/components/features/spider/alerts-panel';
import { WatchResultCard } from '@/components/features/spider/watch-result-card';
import { WATCHLIST_TYPES } from '@/lib/constants/spider';
import type { WatchlistType } from '@/types/spider';

const iconMap: Record<string, React.ElementType> = {
  Stamp: Stamp,
  Lightbulb: AlertTriangle,
  Globe: Globe,
  Search: Search,
  Share2: Bell,
  ShoppingBag: Eye,
};

export default function SpiderDashboard() {
  const { data: stats, isLoading: statsLoading } = useSpiderStats();
  const { data: results, isLoading: resultsLoading } = useWatchResults({ status: 'new' });
  const { data: watchlists, isLoading: watchlistsLoading } = useWatchlists();

  const recentResults = results?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Radar className="w-7 h-7 text-purple-500" />
            IP-SPIDER
          </h1>
          <p className="text-muted-foreground">Vigilancia y monitorización de PI</p>
        </div>
        <Button asChild>
          <Link to="/app/spider/watchlists/new">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Vigilancia
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Search className="w-5 h-5 text-purple-500" />}
          label="Vigilancias activas"
          value={stats?.activeWatchlists}
          loading={statsLoading}
          color="purple"
        />
        <StatCard
          icon={<Eye className="w-5 h-5 text-blue-500" />}
          label="Sin revisar"
          value={stats?.unreviewedResults}
          loading={statsLoading}
          color="blue"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          label="Amenazas activas"
          value={stats?.activeThreats}
          loading={statsLoading}
          color="red"
        />
        <StatCard
          icon={<Bell className="w-5 h-5 text-orange-500" />}
          label="Alertas sin leer"
          value={stats?.unreadAlerts}
          loading={statsLoading}
          color="orange"
        />
      </div>

      {/* Two Columns: Results + Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Resultados Recientes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/spider/results">
                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {resultsLoading ? (
              <>
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </>
            ) : recentResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No hay resultados pendientes de revisión</p>
              </div>
            ) : (
              recentResults.map(result => (
                <WatchResultCard 
                  key={result.id} 
                  result={result}
                  onViewDetail={() => {}}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Alertas Recientes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/spider/alerts">
                Ver todas <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <AlertsPanel limit={5} />
          </CardContent>
        </Card>
      </div>

      {/* Watchlists Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Mis Vigilancias</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/spider/watchlists/new">
              <Plus className="w-4 h-4 mr-1" />
              Crear vigilancia
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {watchlistsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : watchlists?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Radar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No tienes vigilancias activas</p>
              <Button className="mt-4" asChild>
                <Link to="/app/spider/watchlists/new">
                  Crear tu primera vigilancia
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nombre</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Términos</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlists?.map(watchlist => {
                    const typeConfig = WATCHLIST_TYPES[watchlist.type as WatchlistType];
                    const IconComponent = iconMap[typeConfig?.icon || 'Search'] || Search;
                    
                    return (
                      <tr 
                        key={watchlist.id} 
                        className="border-b hover:bg-muted/50 cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <Link 
                            to={`/app/spider/watchlists/${watchlist.id}`}
                            className="font-medium text-foreground hover:text-primary flex items-center gap-2"
                          >
                            <IconComponent className="w-4 h-4 text-purple-500" />
                            {watchlist.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {typeConfig?.label || watchlist.type}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {watchlist.watch_terms.slice(0, 3).map((term, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {term}
                              </Badge>
                            ))}
                            {watchlist.watch_terms.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{watchlist.watch_terms.length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={watchlist.is_active ? 'default' : 'secondary'}>
                            {watchlist.is_active ? 'Activo' : 'Pausado'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  loading, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value?: number; 
  loading: boolean;
  color: string;
}) {
  const bgColors: Record<string, string> = {
    purple: 'bg-purple-50 dark:bg-purple-950/30',
    blue: 'bg-blue-50 dark:bg-blue-950/30',
    red: 'bg-red-50 dark:bg-red-950/30',
    orange: 'bg-orange-50 dark:bg-orange-950/30',
  };

  return (
    <Card className={bgColors[color]}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background rounded-lg shadow-sm">
            {icon}
          </div>
          <div>
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <p className="text-2xl font-bold">{value ?? 0}</p>
            )}
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
