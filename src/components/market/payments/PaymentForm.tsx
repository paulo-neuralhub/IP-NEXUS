// src/components/market/payments/PaymentForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Building2, Shield, Lock } from 'lucide-react';
import { PriceDisplay } from '../shared';

interface PaymentFormProps {
  amount: number;
  currency: string;
  serviceFee: number;
  onSubmit: (paymentMethod: 'card' | 'bank_transfer') => Promise<void>;
  isLoading?: boolean;
}

export function PaymentForm({ 
  amount, 
  currency, 
  serviceFee,
  onSubmit,
  isLoading 
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('card');
  const total = amount + serviceFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(paymentMethod);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Pago seguro
        </CardTitle>
        <CardDescription>
          Tu pago estará protegido en escrow hasta que se complete la transferencia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resumen */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Precio del activo</span>
              <PriceDisplay amount={amount} currency={currency} />
            </div>
            <div className="flex justify-between text-sm">
              <span>Comisión del servicio (5%)</span>
              <PriceDisplay amount={serviceFee} currency={currency} />
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <PriceDisplay amount={total} currency={currency} className="text-lg" />
            </div>
          </div>

          {/* Método de pago */}
          <div className="space-y-3">
            <Label>Método de pago</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(v) => setPaymentMethod(v as 'card' | 'bank_transfer')}
              className="grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="card"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="card" id="card" className="sr-only" />
                <CreditCard className="mb-3 h-6 w-6" />
                <span className="text-sm font-medium">Tarjeta</span>
                <span className="text-xs text-muted-foreground">Visa, Mastercard</span>
              </Label>
              
              <Label
                htmlFor="bank"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="bank_transfer" id="bank" className="sr-only" />
                <Building2 className="mb-3 h-6 w-6" />
                <span className="text-sm font-medium">Transferencia</span>
                <span className="text-xs text-muted-foreground">SEPA, Wire</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Info de seguridad */}
          <div className="flex items-start gap-3 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-lg p-4">
            <Shield className="h-5 w-5 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Protección del comprador</p>
              <p className="text-green-600 dark:text-green-400">
                Tu pago se mantendrá en escrow hasta verificar la transferencia del activo.
                Si hay algún problema, recibirás un reembolso completo.
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : `Pagar ${total.toLocaleString()} ${currency}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
