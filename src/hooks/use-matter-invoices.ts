/**
 * use-matter-invoices - Hook para facturas del expediente
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MatterInvoice {
  id: string;
  invoice_number: string;
  matter_id?: string;
  client_id?: string;
  status: string;
  total_amount?: number;
  currency?: string;
  issue_date?: string;
  due_date?: string;
  created_at: string;
}

export function useMatterInvoices(matterId: string) {
  return useQuery({
    queryKey: ['matter-invoices', matterId],
    queryFn: async () => {
      const client: any = supabase;
      const { data, error } = await client
        .from('invoices')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MatterInvoice[];
    },
    enabled: !!matterId,
  });
}
