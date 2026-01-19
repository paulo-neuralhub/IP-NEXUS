// src/components/market/offers/OfferCard.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, X, MessageSquare, RotateCcw } from 'lucide-react';
import { PriceDisplay } from '../shared';
import type { MarketOffer } from '@/types/market.types';

interface OfferCardProps {
  offer: MarketOffer;
  buyer?: any;
  isOwner?: boolean;
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  onCounter?: (offerId: string) => void;
  onMessage?: (offerId: string) => void;
}

const STATUS_STYLES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendiente', variant: 'secondary' },
  accepted: { label: 'Aceptada', variant: 'default' },
  rejected: { label: 'Rechazada', variant: 'destructive' },
  countered: { label: 'Contraoferta', variant: 'outline' },
  expired: { label: 'Expirada', variant: 'secondary' },
  withdrawn: { label: 'Retirada', variant: 'secondary' },
};

export function OfferCard({ 
  offer, 
  isOwner = false,
  onAccept,
  onReject,
  buyer,
  onCounter,
  onMessage,
  buyer: buyerProp
}: OfferCardProps) {
  const statusInfo = STATUS_STYLES[offer.status] || STATUS_STYLES.pending;
  const isPending = offer.status === 'pending';
  const buyerData = buyerProp || {};

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={buyerData?.avatar_url} />
              <AvatarFallback>
                {buyerData?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{buyerData?.display_name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(offer.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
              </p>
            </div>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Oferta:</span>
          <PriceDisplay 
            amount={offer.amount} 
            currency={offer.currency} 
            className="text-lg font-bold"
          />
        </div>

        {offer.message && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm">{offer.message}</p>
          </div>
        )}

        {offer.expires_at && (
          <p className="text-xs text-muted-foreground">
            Expira: {format(new Date(offer.expires_at), "dd MMM yyyy, HH:mm", { locale: es })}
          </p>
        )}

        {isOwner && isPending && (
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onAccept?.(offer.id)}
            >
              <Check className="h-4 w-4 mr-1" />
              Aceptar
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onCounter?.(offer.id)}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Contraoferta
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onReject?.(offer.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Rechazar
            </Button>
          </div>
        )}

        {!isOwner && (
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full"
            onClick={() => onMessage?.(offer.id)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Enviar mensaje
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
