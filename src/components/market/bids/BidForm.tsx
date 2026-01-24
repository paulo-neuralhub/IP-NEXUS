import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBid, CreateBidInput } from '@/hooks/market/useMarketBids';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, AlertTriangle, Loader2 } from 'lucide-react';

const bidSchema = z.object({
  amount: z.number().min(1, 'El importe debe ser mayor que 0'),
  currency: z.string().default('EUR'),
  estimated_days: z.number().min(1, 'El plazo debe ser al menos 1 día'),
  message: z.string().min(50, 'El mensaje debe tener al menos 50 caracteres'),
});

type BidFormData = z.infer<typeof bidSchema>;

interface BidFormProps {
  requestId: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BidForm({ 
  requestId, 
  budgetMin, 
  budgetMax, 
  budgetCurrency = 'EUR',
  onSuccess,
  onCancel,
}: BidFormProps) {
  const createBid = useCreateBid();

  const form = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: budgetMin || 0,
      currency: budgetCurrency,
      estimated_days: 7,
      message: '',
    },
  });

  const watchedAmount = form.watch('amount');
  const isOutsideBudget = (budgetMin && watchedAmount < budgetMin) || 
                          (budgetMax && watchedAmount > budgetMax);

  const handleSubmit = async (data: BidFormData) => {
    try {
      await createBid.mutateAsync({
        request_id: requestId,
        amount: data.amount,
        currency: data.currency,
        estimated_days: data.estimated_days,
        message: data.message,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Enviar Oferta
        </CardTitle>
        <CardDescription>
          Presenta tu propuesta para esta solicitud
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Amount & Currency */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Precio total</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    {budgetMin || budgetMax ? (
                      <FormDescription>
                        Presupuesto: {budgetMin?.toLocaleString()} - {budgetMax?.toLocaleString()} {budgetCurrency}
                      </FormDescription>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isOutsideBudget && (
              <Alert variant="default" className="border-warning bg-warning/10">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <AlertDescription>
                  Tu oferta está fuera del rango de presupuesto indicado. Puedes continuar, pero considera que puede ser rechazada.
                </AlertDescription>
              </Alert>
            )}

            {/* Estimated Days */}
            <FormField
              control={form.control}
              name="estimated_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plazo estimado (días)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="7"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormDescription>
                    Indica cuántos días laborables necesitas para completar el trabajo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Propuesta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe tu propuesta, metodología, experiencia relevante..."
                      className="min-h-32 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mínimo 50 caracteres. Explica por qué eres el mejor candidato para este trabajo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={createBid.isPending}>
                {createBid.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Oferta
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
