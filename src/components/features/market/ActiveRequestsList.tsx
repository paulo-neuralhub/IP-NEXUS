import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Building2, 
  Clock, 
  MessageSquare, 
  ChevronRight, 
  Plus,
  FileQuestion,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface RfqRequest {
  id: string;
  reference: string;
  title: string;
  service_category: string;
  jurisdictions: string[];
  budget_min?: number;
  budget_max?: number;
  currency: string;
  deadline: string;
  quotes_count: number;
  status: 'open' | 'evaluating' | 'awarded' | 'cancelled';
  client_name?: string;
  created_at: string;
}

interface ActiveRequestsListProps {
  requests: RfqRequest[];
  isLoading?: boolean;
}

const STATUS_CONFIG = {
  open: { label: 'Abierta', color: 'bg-primary/10 text-primary border-primary/20' },
  evaluating: { label: 'Evaluando', color: 'bg-warning/10 text-warning border-warning/20' },
  awarded: { label: 'Adjudicada', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  cancelled: { label: 'Cancelada', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export function ActiveRequestsList({ requests, isLoading }: ActiveRequestsListProps) {
  const formatBudget = (min?: number, max?: number, currency = 'EUR') => {
    const fmt = (v: number) => new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(v);
    
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `Desde ${fmt(min)}`;
    if (max) return `Hasta ${fmt(max)}`;
    return 'A convenir';
  };

  const getRemainingTime = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return { text: 'Vencida', urgent: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return { text: `${days}d restantes`, urgent: days <= 2 };
    return { text: `${hours}h restantes`, urgent: true };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Activas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileQuestion className="h-5 w-5" />
          Solicitudes Activas
        </CardTitle>
        <Button asChild size="sm">
          <Link to="/app/market/rfq/new">
            <Plus className="h-4 w-4 mr-1" />
            Nueva Solicitud
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileQuestion className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No tienes solicitudes activas</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/app/market/rfq/new">Crear primera solicitud</Link>
            </Button>
          </div>
        ) : (
          requests.map((request) => {
            const status = STATUS_CONFIG[request.status];
            const remaining = getRemainingTime(request.deadline);
            
            return (
              <Link
                key={request.id}
                to={`/app/market/rfq/${request.id}`}
                className="block"
              >
                <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors group">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        {request.reference}
                      </span>
                      <Badge variant="outline" className={cn('text-xs', status.color)}>
                        {status.label}
                      </Badge>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>

                  {/* Title */}
                  <h4 className="font-medium mb-2">{request.title}</h4>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {request.client_name && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {request.client_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {request.jurisdictions.join(', ')}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatBudget(request.budget_min, request.budget_max, request.currency)}
                    </span>
                    <span className={cn(
                      'flex items-center gap-1',
                      remaining.urgent && 'text-destructive'
                    )}>
                      <Clock className="h-3.5 w-3.5" />
                      {remaining.text}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {request.quotes_count} presupuestos
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
