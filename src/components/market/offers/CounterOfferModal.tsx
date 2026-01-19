// src/components/market/offers/CounterOfferModal.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PriceDisplay } from '../shared';
import type { MarketOffer } from '@/types/market.types';

interface CounterOfferModalProps {
  offer: MarketOffer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (offerId: string, amount: number, message?: string) => Promise<void>;
}

export function CounterOfferModal({ 
  offer, 
  open, 
  onOpenChange,
  onSubmit 
}: CounterOfferModalProps) {
  const [amount, setAmount] = useState<number>(offer?.amount || 0);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!offer) return;
    
    setIsLoading(true);
    try {
      await onSubmit(offer.id, amount, message);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!offer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contraoferta</DialogTitle>
          <DialogDescription>
            Propón un nuevo precio al comprador
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Oferta original:</p>
            <PriceDisplay 
              amount={offer.amount} 
              currency={offer.currency}
              className="text-xl font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="counter-amount">Tu contraoferta</Label>
            <div className="flex gap-2">
              <Input
                id="counter-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="flex-1"
              />
              <span className="flex items-center px-3 bg-muted rounded-md text-sm">
                {offer.currency}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="counter-message">Mensaje (opcional)</Label>
            <Textarea
              id="counter-message"
              placeholder="Explica tu contraoferta..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {amount > offer.amount && (
            <p className="text-sm text-green-600">
              +{((amount - offer.amount) / offer.amount * 100).toFixed(1)}% sobre la oferta original
            </p>
          )}
          {amount < offer.amount && (
            <p className="text-sm text-red-600">
              {((amount - offer.amount) / offer.amount * 100).toFixed(1)}% sobre la oferta original
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || amount <= 0}>
            {isLoading ? 'Enviando...' : 'Enviar contraoferta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
