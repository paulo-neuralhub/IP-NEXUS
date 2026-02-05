import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Eye,
  ArrowRight,
  Radar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useSpiderStats, 
  useWatchResults, 
  useWatchlists 
} from '@/hooks/use-spider';
import { SpiderKPIs } from '@/components/features/spider/SpiderKPIs';
import { SilkResultCard } from '@/components/features/spider/SilkResultCard';
import { SilkAlertsPanel } from '@/components/features/spider/SilkAlertsPanel';
import { WATCHLIST_TYPES } from '@/lib/constants/spider';
import type { WatchlistType } from '@/types/spider';
import { InlineHelp } from '@/components/help';

const iconMap: Record<string, React.ElementType> = {
  Stamp: Radar,
  Lightbulb: Radar,
  Globe: Radar,
  Search: Search,
  Share2: Radar,
  ShoppingBag: Eye,
};

export default function SpiderDashboard() {
  const { data: stats, isLoading: statsLoading } = useSpiderStats();
  const { data: results, isLoading: resultsLoading } = useWatchResults({ status: 'new' });
  const { data: watchlists, isLoading: watchlistsLoading } = useWatchlists();

  const recentResults = results?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header SILK */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-[14px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #00b4d8, #00d4aa)',
              boxShadow: '0 4px 12px rgba(0, 180, 216, 0.25)'
            }}
          >
            <Radar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0a2540] flex items-center gap-2">
              IP-SPIDER
              <InlineHelp text="Sistema de vigilancia y monitorización de PI. Crea vigilancias para detectar marcas similares, publicaciones de patentes, cambios de estado en oficinas y amenazas potenciales." />
            </h1>
            <p className="text-sm text-muted-foreground">Vigilancia y monitorización de PI</p>
          </div>
        </div>
        
        {/* Primary Button SILK */}
        <Link to="/app/spider/watchlists/new">
          <button
            className="h-10 px-5 text-sm font-medium text-white rounded-lg flex items-center gap-2 transition-all hover:shadow-lg relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #00b4d8, #00d4aa)',
              boxShadow: '0 2px 8px rgba(0, 180, 216, 0.3)'
            }}
          >
            <span 
              className="absolute bottom-0 left-[15%] right-[15%] h-[2px] rounded-full"
              style={{ background: 'rgba(255,255,255,0.4)' }}
            />
            <Plus className="w-4 h-4" />
            Nueva Vigilancia
          </button>
        </Link>
      </div>

      {/* KPIs SILK */}
      <SpiderKPIs stats={stats} loading={statsLoading} />

      {/* Grid: Resultados + Alertas */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Resultados Recientes (8 cols) */}
        <div className="lg:col-span-8">
          <div 
            className="rounded-[14px] border border-black/[0.06] p-5"
            style={{ background: '#ffffff' }}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-[#0a2540] uppercase tracking-wide">
                Resultados Recientes
              </h2>
              <Link 
                to="/app/spider/results"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Results List */}
            <div className="space-y-3">
              {resultsLoading ? (
                <>
                  <Skeleton className="h-32 rounded-[14px]" />
                  <Skeleton className="h-32 rounded-[14px]" />
                </>
              ) : recentResults.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay resultados pendientes de revisión</p>
                </div>
              ) : (
                recentResults.map(result => (
                  <SilkResultCard 
                    key={result.id} 
                    result={result}
                    onViewDetail={() => {}}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Alertas Recientes (4 cols) */}
        <div className="lg:col-span-4">
          <div 
            className="rounded-[14px] border border-black/[0.06] p-5"
            style={{ background: '#ffffff' }}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-[#0a2540] uppercase tracking-wide">
                Alertas Recientes
              </h2>
              <Link 
                to="/app/spider/alerts"
                className="text-xs text-primary hover:underline"
              >
                Ver todas →
              </Link>
            </div>

            {/* Alerts Panel */}
            <SilkAlertsPanel limit={5} />
          </div>
        </div>
      </div>

      {/* Mis Vigilancias */}
      <div 
        className="rounded-[14px] border border-black/[0.06] p-5"
        style={{ background: '#ffffff' }}
      >
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-bold text-[#0a2540] uppercase tracking-wide">
            Mis Vigilancias
          </h2>
          <Link to="/app/spider/watchlists/new">
            <button
              className="h-8 px-4 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all"
              style={{
                background: '#f1f4f9',
                boxShadow: '3px 3px 6px #cdd1dc, -3px -3px 6px #ffffff',
                color: '#0a2540'
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Crear vigilancia
            </button>
          </Link>
        </div>

        {/* Watchlists Table */}
        {watchlistsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        ) : watchlists?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Radar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay vigilancias configuradas</p>
            <Link to="/app/spider/watchlists/new">
              <Button className="mt-4" size="sm">
                Crear tu primera vigilancia
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/[0.06]">
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Nombre</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Tipo</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Términos</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody>
                {watchlists?.map(watchlist => {
                  const typeConfig = WATCHLIST_TYPES[watchlist.type as WatchlistType];
                  const IconComponent = iconMap[typeConfig?.icon || 'Search'] || Search;
                  
                  return (
                    <tr 
                      key={watchlist.id} 
                      className="border-b border-black/[0.06] hover:bg-[#f1f4f9] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link 
                          to={`/app/spider/watchlists/${watchlist.id}`}
                          className="font-medium text-sm text-[#0a2540] hover:text-primary flex items-center gap-2"
                        >
                          <IconComponent className="w-4 h-4 text-[#00b4d8]" />
                          {watchlist.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {typeConfig?.label || watchlist.type}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {watchlist.watch_terms.slice(0, 3).map((term, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] bg-[#f1f4f9]">
                              {term}
                            </Badge>
                          ))}
                          {watchlist.watch_terms.length > 3 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{watchlist.watch_terms.length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span 
                          className="px-2 py-1 text-[10px] font-medium rounded-full"
                          style={{
                            backgroundColor: watchlist.is_active ? '#22c55e15' : '#94a3b815',
                            color: watchlist.is_active ? '#16a34a' : '#64748b'
                          }}
                        >
                          {watchlist.is_active ? 'Activo' : 'Pausado'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
