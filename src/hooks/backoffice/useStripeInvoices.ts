import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StripeInvoice {
  id: string;
  organization_id: string | null;
  stripe_invoice_id: string | null;
  invoice_number: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf_url: string | null;
  subtotal_cents: number | null;
  tax_cents: number | null;
  total_cents: number | null;
  amount_paid_cents: number | null;
  amount_due_cents: number | null;
  currency: string;
  status: string | null;
  period_start: string | null;
  period_end: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  // Joined
  organization?: {
    id: string;
    name: string;
  };
}

export interface InvoiceFilters {
  status?: string;
  period?: 'today' | 'week' | 'month' | 'year' | 'all';
  search?: string;
}

export function useStripeInvoices(filters?: InvoiceFilters) {
  return useQuery({
    queryKey: ['stripe-invoices', filters],
    queryFn: async () => {
      let query = supabase
        .from('stripe_invoices')
        .select(`
          *,
          organization:organizations(id, name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Date filter
      if (filters?.period && filters.period !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (filters.period) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as unknown as StripeInvoice[];
    },
  });
}

export function useStripeInvoiceStats(period?: string) {
  return useQuery({
    queryKey: ['stripe-invoice-stats', period],
    queryFn: async () => {
      let query = supabase
        .from('stripe_invoices')
        .select('total_cents, amount_paid_cents, amount_due_cents, status');

      // Apply period filter
      if (period && period !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (period) {
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        total: 0,
        paid: 0,
        pending: 0,
        count: data?.length || 0,
        paidCount: 0,
        pendingCount: 0,
      };

      (data || []).forEach((inv: { total_cents: number | null; amount_paid_cents: number | null; amount_due_cents: number | null; status: string | null }) => {
        stats.total += inv.total_cents || 0;
        if (inv.status === 'paid') {
          stats.paid += inv.amount_paid_cents || 0;
          stats.paidCount++;
        } else if (inv.status === 'open') {
          stats.pending += inv.amount_due_cents || 0;
          stats.pendingCount++;
        }
      });

      return stats;
    },
  });
}
