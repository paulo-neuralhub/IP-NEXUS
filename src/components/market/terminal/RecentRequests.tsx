/**
 * Recent Requests Component
 * Live feed of recent market requests
 * Financial terminal style
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  MapPin, 
  Euro, 
  Clock, 
  ArrowRight,
  FileText,
  Sparkles,
  Search,
  Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MarketRequest {
  id: string;
  request_number: string;
  service_type: 'trademark' | 'patent' | 'design' | 'search' | 'opposition' | 'renewal';
  title: string;
  jurisdiction: string;
  budget_min?: number;
  budget_max?: number;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  bids_count: number;
  created_at: string;
  city?: string;
}

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

// Mock data for demo
const MOCK_REQUESTS: MarketRequest[] = [
  { 
    id: '1', request_number: 'MKT-2026-0145', service_type: 'trademark',
    title: 'Registro marca "InnoTech Solutions"', jurisdiction: 'ES',
    budget_min: 800, budget_max: 1500, status: 'open', bids_count: 4,
    created_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(), city: 'Madrid'
  },
  { 
    id: '2', request_number: 'MKT-2026-0144', service_type: 'patent',
    title: 'Patente sistema energía solar', jurisdiction: 'EU',
    budget_min: 3000, budget_max: 5000, status: 'open', bids_count: 2,
    created_at: new Date(Date.now() - 4 * 60 * 60000).toISOString(), city: 'Berlin'
  },
  { 
    id: '3', request_number: 'MKT-2026-0143', service_type: 'search',
    title: 'Búsqueda anterioridades EU-wide', jurisdiction: 'EU',
    budget_min: 500, budget_max: 1000, status: 'open', bids_count: 6,
    created_at: new Date(Date.now() - 6 * 60 * 60000).toISOString()
  },
  { 
    id: '4', request_number: 'MKT-2026-0142', service_type: 'opposition',
    title: 'Oposición marca clase 9 tecnología', jurisdiction: 'ES',
    budget_min: 2000, budget_max: 4000, status: 'assigned', bids_count: 3,
    created_at: new Date(Date.now() - 12 * 60 * 60000).toISOString(), city: 'Barcelona'
  },
  { 
    id: '5', request_number: 'MKT-2026-0141', service_type: 'design',
    title: 'Registro diseño industrial packaging', jurisdiction: 'US',
    budget_min: 1500, budget_max: 2500, status: 'open', bids_count: 1,
    created_at: new Date(Date.now() - 24 * 60 * 60000).toISOString(), city: 'NYC'
  },
  { 
    id: '6', request_number: 'MKT-2026-0140', service_type: 'renewal',
    title: 'Renovación 15 marcas portfolio', jurisdiction: 'INT',
    budget_min: 5000, budget_max: 8000, status: 'in_progress', bids_count: 5,
    created_at: new Date(Date.now() - 48 * 60 * 60000).toISOString()
  },
];

function formatBudget(min?: number, max?: number): string {
  if (!min && !max) return '-';
  if (min && max) return `€${min.toLocaleString()} - €${max.toLocaleString()}`;
  if (min) return `Desde €${min.toLocaleString()}`;
  return `Hasta €${max?.toLocaleString()}`;
}

export function RecentRequests({ 
  requests = MOCK_REQUESTS, 
  isLoading = false,
  showBidButton = true,
  className 
}: RecentRequestsProps) {
  if (isLoading) {
    return (
      <Card className={cn('bg-[#0d0d12] border-white/10', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            Solicitudes Recientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white/5 animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-[#0d0d12] border-white/10', className)}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
          Solicitudes Recientes
        </CardTitle>
        <Link to="/app/market/rfq">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
            Ver todas <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-1 p-0">
        {requests.slice(0, 8).map((request) => {
          const typeConfig = SERVICE_TYPE_CONFIG[request.service_type];
          const statusConfig = STATUS_CONFIG[request.status];

          return (
            <Link
              key={request.id}
              to={`/app/market/rfq/${request.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors group"
            >
              {/* Type Icon */}
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg shrink-0">
                {typeConfig.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('font-mono text-xs', typeConfig.color)}>
                    {typeConfig.label}
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/50 text-xs font-mono">
                    {request.request_number}
                  </span>
                </div>
                <p className="text-white font-medium text-sm truncate mt-0.5">
                  {request.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
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
                    <span className="text-white/40 text-xs">
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
