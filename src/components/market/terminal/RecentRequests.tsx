/**
 * Recent Requests Component
 * Live feed of recent market requests
 * Financial terminal style - USES REAL DATA
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  MapPin, 
  Clock, 
  ArrowRight,
  Inbox
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useRecentMarketRequests, type MarketRequest } from '@/hooks/use-market-requests';

interface RecentRequestsProps {
  requests?: MarketRequest[];
  isLoading?: boolean;
  showBidButton?: boolean;
  className?: string;
}

const SERVICE_TYPE_CONFIG = {
  trademark: { icon: '®️', color: 'text-emerald-400', label: 'Marca' },
  patent: { icon: '📜', color: 'text-blue-400', label: 'Patente' },
  design: { icon: '🎨', color: 'text-amber-400', label: 'Diseño' },
  search: { icon: '🔍', color: 'text-purple-400', label: 'Búsqueda' },
  opposition: { icon: '⚔️', color: 'text-red-400', label: 'Oposición' },
  renewal: { icon: '🔄', color: 'text-cyan-400', label: 'Renovación' },
};

const STATUS_CONFIG = {
  open: { color: 'bg-emerald-500/20 text-emerald-400', label: 'Abierto' },
  assigned: { color: 'bg-blue-500/20 text-blue-400', label: 'Asignado' },
  in_progress: { color: 'bg-amber-500/20 text-amber-400', label: 'En Proceso' },
  completed: { color: 'bg-green-500/20 text-green-400', label: 'Completado' },
  cancelled: { color: 'bg-gray-500/20 text-gray-400', label: 'Cancelado' },
};

function formatBudget(min?: number, max?: number): string {
  if (!min && !max) return '-';
  if (min && max) return `€${min.toLocaleString()} - €${max.toLocaleString()}`;
  if (min) return `Desde €${min.toLocaleString()}`;
  return `Hasta €${max?.toLocaleString()}`;
}

export function RecentRequests({ 
  requests: externalRequests,
  isLoading: externalLoading,
  showBidButton = true,
  className 
}: RecentRequestsProps) {
  // Use hook if no external data provided
  const { data: hookRequests, isLoading: hookLoading } = useRecentMarketRequests(8);
  
  const requests = externalRequests ?? hookRequests ?? [];
  const isLoading = externalLoading ?? hookLoading;

  if (isLoading) {
    return (
      <Card className={cn('terminal-card', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="terminal-text flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            Solicitudes Recientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 terminal-skeleton animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (requests.length === 0) {
    return (
      <Card className={cn('terminal-card', className)}>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="terminal-text flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            Solicitudes Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Sin solicitudes recientes</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Las nuevas solicitudes del marketplace aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('terminal-card', className)}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="terminal-text flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
          Solicitudes Recientes
        </CardTitle>
        <Link to="/app/market/rfq">
          <Button variant="ghost" size="sm" className="terminal-text-muted hover:terminal-text">
            Ver todas <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-1 p-0">
        {requests.slice(0, 8).map((request) => {
          const typeConfig = SERVICE_TYPE_CONFIG[request.service_type] || SERVICE_TYPE_CONFIG.trademark;
          const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.open;

          return (
            <Link
              key={request.id}
              to={`/app/market/rfq/${request.id}`}
              className="flex items-center gap-3 px-4 py-3 terminal-hover transition-colors group"
            >
              {/* Type Icon */}
              <div className="w-10 h-10 rounded-lg terminal-skeleton flex items-center justify-center text-lg shrink-0">
                {typeConfig.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('font-mono text-xs', typeConfig.color)}>
                    {typeConfig.label}
                  </span>
                  <span className="terminal-text-dim">•</span>
                  <span className="terminal-text-muted text-xs font-mono">
                    {request.request_number}
                  </span>
                </div>
                <p className="terminal-text font-medium text-sm truncate mt-0.5">
                  {request.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs terminal-text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {request.jurisdiction}
                    {request.city && ` - ${request.city}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: es })}
                  </span>
                </div>
              </div>

              {/* Budget & Status */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-emerald-400 font-mono text-sm font-medium">
                  {formatBudget(request.budget_min, request.budget_max)}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', statusConfig.color)}>
                    {statusConfig.label}
                  </Badge>
                  {request.bids_count > 0 && (
                    <span className="terminal-text-dim text-xs">
                      {request.bids_count} ofertas
                    </span>
                  )}
                </div>
              </div>

              {/* Bid Button */}
              {showBidButton && request.status === 'open' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20"
                >
                  Ofertar
                </Button>
              )}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
