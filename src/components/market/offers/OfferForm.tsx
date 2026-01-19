// src/components/market/offers/OfferForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Send } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const offerSchema = z.object({
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  currency: z.string().default('EUR'),
  message: z.string().optional(),
  expires_at: z.date().optional(),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface OfferFormProps {
  listingId: string;
  askingPrice?: number;
  currency?: string;
  onSubmit: (data: OfferFormData) => Promise<void>;
  isLoading?: boolean;
}

export function OfferForm({ 
  listingId, 
  askingPrice, 
  currency = 'EUR',
  onSubmit,
  isLoading 
}: OfferFormProps) {
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(addDays(new Date(), 7));

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      currency,
      expires_at: expiryDate,
    },
  });

  const handleFormSubmit = async (data: OfferFormData) => {
    await onSubmit({
      ...data,
      expires_at: expiryDate,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hacer una oferta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Cantidad ofrecida</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
                className="flex-1"
              />
              <Select 
                defaultValue={currency}
                onValueChange={(v) => setValue('currency', v)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
            {askingPrice && (
              <p className="text-xs text-muted-foreground">
                Precio solicitado: {askingPrice.toLocaleString()} {currency}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Válida hasta</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? (
                    format(expiryDate, "PPP", { locale: es })
                  ) : (
                    "Seleccionar fecha"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Escribe un mensaje para el vendedor..."
              {...register('message')}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Enviando...' : 'Enviar oferta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
