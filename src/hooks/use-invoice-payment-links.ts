import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PaymentLink } from '@/types/finance';

export function usePaymentLinkByInvoice(invoiceId?: string) {
  return useQuery({
    queryKey: ['payment-link', invoiceId],
    queryFn: async (): Promise<PaymentLink | null> => {
      if (!invoiceId) return null;

      const { data, error } = await supabase
        .from('payment_links')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data as PaymentLink) ?? null;
    },
    enabled: !!invoiceId,
  });
}

export function usePaymentLinksForInvoices(invoiceIds: string[]) {
  return useQuery({
    queryKey: ['payment-links', invoiceIds],
    queryFn: async (): Promise<PaymentLink[]> => {
      if (!invoiceIds.length) return [];

      const { data, error } = await supabase
        .from('payment_links')
        .select('*')
        .in('invoice_id', invoiceIds);

      if (error) throw error;
      return (data as PaymentLink[]) ?? [];
    },
    enabled: invoiceIds.length > 0,
  });
}

export function useCreatePaymentLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId }: { invoiceId: string }) => {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: { invoiceId },
      });
      if (error) throw error;
      return data as { url: string; qrCode: string };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment-link', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['payment-links'] });
      toast.success('Link de pago generado');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'No se pudo generar el link de pago';
      toast.error(message);
    },
  });
}
