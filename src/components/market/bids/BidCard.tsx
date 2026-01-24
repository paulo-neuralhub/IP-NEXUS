import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MarketBid, useAcceptBid, useRejectBid } from '@/hooks/market/useMarketBids';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Star,
  CheckCircle,
  Clock,
  TrendingUp,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  User,
  XCircle,
  Check,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BidCardProps {
  bid: MarketBid;
  isOwner?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export function BidCard({ 
  bid, 
  isOwner = false, 
  showActions = true, 
  compact = false 
}: BidCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const acceptBid = useAcceptBid();
  const rejectBid = useRejectBid();

  const agent = bid.agent;
  const initials = agent?.display_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AG';

  const statusConfig = {
    pending: { label: 'Pendiente', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    accepted: { label: 'Aceptada', color: 'text-green-700', bgColor: 'bg-green-100' },
    rejected: { label: 'Rechazada', color: 'text-red-700', bgColor: 'bg-red-100' },
    withdrawn: { label: 'Retirada', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  };

  const status = statusConfig[bid.status];

  const handleAccept = async () => {
    await acceptBid.mutateAsync(bid.id);
  };

  const handleReject = async () => {
    await rejectBid.mutateAsync({ bidId: bid.id, reason: rejectReason });
    setShowRejectDialog(false);
    setRejectReason('');
  };

  return (
    <Card className={cn(
      "transition-all",
      bid.status === 'accepted' && "border-green-500 bg-green-50/50",
      bid.status === 'rejected' && "opacity-60"
    )}>
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start gap-4">
          {/* Agent Avatar */}
          <Link to={`/app/market/agents/${agent?.id}`} className="shrink-0">
            <div className="relative">
              <Avatar className={cn(compact ? "h-10 w-10" : "h-12 w-12")}>
                <AvatarImage src={agent?.avatar_url || undefined} alt={agent?.display_name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {agent?.is_verified_agent && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </Link>

          {/* Agent Info & Bid Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link 
                  to={`/app/market/agents/${agent?.id}`}
                  className="font-semibold hover:text-primary transition-colors"
                >
                  {agent?.display_name || 'Agente'}
                </Link>
                
                {/* Rating & Stats */}
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    {agent?.rating_avg?.toFixed(1) || '0.0'}
                    <span className="text-xs">({agent?.ratings_count || 0})</span>
                  </span>
                  {agent?.is_verified_agent && (
                    <Badge variant="outline" className="text-xs h-5 py-0">
                      <BadgeCheck className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
              </div>

              {/* Price & Status */}
              <div className="text-right shrink-0">
                <p className="text-xl font-bold text-primary">
                  {bid.amount.toLocaleString()} {bid.currency}
                </p>
                <div className="flex items-center gap-2 justify-end mt-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {bid.estimated_days} días
                  </span>
                  <Badge className={cn("text-xs", status.bgColor, status.color)}>
                    {status.label}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Agent Stats Row */}
            {!compact && agent && (
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {agent.total_transactions} trabajos
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {agent.success_rate?.toFixed(0)}% éxito
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatResponseTime(agent.response_time_avg || 0)}
                </span>
              </div>
            )}

            {/* Message Preview / Expanded */}
            <div className="mt-3">
              <p className={cn(
                "text-sm text-muted-foreground",
                !expanded && "line-clamp-2"
              )}>
                {bid.message}
              </p>
              {bid.message.length > 150 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary mt-1"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Ver menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Ver más
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Time */}
            <p className="text-xs text-muted-foreground mt-2">
              Enviada {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true, locale: es })}
            </p>
          </div>
        </div>

        {/* Actions (for request owner) */}
        {showActions && isOwner && bid.status === 'pending' && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              asChild
            >
              <Link to={`/app/market/agents/${agent?.id}`}>
                <User className="w-4 h-4 mr-2" />
                Ver Perfil
              </Link>
            </Button>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rechazar oferta</DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de que quieres rechazar esta oferta? El agente será notificado.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Motivo (opcional)</Label>
                    <Textarea
                      placeholder="Indica brevemente por qué rechazas esta oferta..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReject}
                    disabled={rejectBid.isPending}
                  >
                    {rejectBid.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Rechazar'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Aceptar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Aceptar oferta</AlertDialogTitle>
                  <AlertDialogDescription>
                    Al aceptar esta oferta:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>El agente <strong>{agent?.display_name}</strong> será asignado</li>
                      <li>Las demás ofertas serán rechazadas automáticamente</li>
                      <li>La solicitud pasará a estado "Adjudicada"</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleAccept}
                    disabled={acceptBid.isPending}
                  >
                    {acceptBid.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Confirmar'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Accepted Status */}
        {bid.status === 'accepted' && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Oferta aceptada</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function
function formatResponseTime(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}
