import { Phone, MessageSquare, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TelephonyPack } from '@/hooks/useTelephonyPacks';

interface TelephonyPackCardProps {
  pack: TelephonyPack;
  onPurchase?: (pack: TelephonyPack) => void;
  isPurchasing?: boolean;
}

function formatEur(amount: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function TelephonyPackCard({ pack, onPurchase, isPurchasing }: TelephonyPackCardProps) {
  return (
    <Card className={`relative ${pack.is_featured ? 'ring-2 ring-primary' : ''}`}>
      {pack.badge_text && (
        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
          <Star className="mr-1 h-3 w-3" />
          {pack.badge_text}
        </Badge>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-lg">{pack.name}</CardTitle>
        <CardDescription>{pack.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <span className="text-3xl font-bold text-foreground">{formatEur(pack.price)}</span>
          {pack.savings_percentage && (
            <Badge variant="secondary" className="ml-2">
              -{pack.savings_percentage}%
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-muted p-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>Minutos</span>
            </div>
            <span className="font-semibold">{pack.minutes_included.toLocaleString()}</span>
          </div>

          {pack.sms_included > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted p-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span>SMS</span>
              </div>
              <span className="font-semibold">{pack.sms_included.toLocaleString()}</span>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg bg-muted p-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Validez</span>
            </div>
            <span className="font-semibold">{pack.validity_days} días</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={pack.is_featured ? 'default' : 'outline'}
          onClick={() => onPurchase?.(pack)}
          disabled={isPurchasing}
        >
          {isPurchasing ? 'Procesando...' : 'Comprar'}
        </Button>
      </CardFooter>
    </Card>
  );
}
