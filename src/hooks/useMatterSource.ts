// =====================================================
// Matter Source Hook - Track origin of matters
// =====================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Matter } from '@/types/matters';

export interface MatterSource {
  type: 'manual' | 'quote' | 'import' | 'api';
  quote?: {
    id: string;
    quote_number: string;
    status: string;
    total: number;
    created_at: string;
  };
  invoice?: {
    id: string;
    invoice_number: string;
    status: string;
    total: number;
    created_at: string;
  };
  client?: {
    id: string;
    name: string;
    company_name?: string;
    email?: string;
  };
}

export function useMatterSource(matterId?: string) {
  const { data: source, isLoading } = useQuery({
    queryKey: ['matter-source', matterId],
    queryFn: async (): Promise<MatterSource | null> => {
      if (!matterId) return null;

      // Get matter with source info
      const { data: matter, error } = await supabase
        .from('matters')
        .select('source_type, source_quote_id, owner_name')
        .eq('id', matterId)
        .single();

      if (error || !matter) return null;

      const sourceType = (matter.source_type || 'manual') as MatterSource['type'];
      
      let quoteInfo = null;
      let invoiceInfo = null;
      let clientInfo = null;

      // Get quote info if from quote
      if (matter.source_quote_id) {
        const { data: quote } = await supabase
          .from('quotes')
          .select(`
            id,
            quote_number,
            status,
            total,
            created_at,
            contact_id,
            contact:contacts(id, name, company_name, email)
          `)
          .eq('id', matter.source_quote_id)
          .single();

        if (quote) {
          quoteInfo = {
            id: quote.id,
            quote_number: quote.quote_number,
            status: quote.status,
            total: quote.total,
            created_at: quote.created_at,
          };

          if (quote.contact) {
            const contact = quote.contact as any;
            clientInfo = {
              id: contact.id,
              name: contact.name,
              company_name: contact.company_name,
              email: contact.email,
            };
          }

          // Get invoice linked to quote
          const { data: invoice } = await (supabase
            .from('invoices')
            .select('id, invoice_number, status, total, created_at') as any)
            .eq('quote_id', quote.id)
            .single();

          if (invoice) {
            invoiceInfo = invoice;
          }
        }
      }

      return {
        type: sourceType,
        quote: quoteInfo || undefined,
        invoice: invoiceInfo || undefined,
        client: clientInfo || undefined,
      };
    },
    enabled: !!matterId,
  });

  return {
    source,
    isLoading,
    hasSource: !!source && source.type !== 'manual',
  };
}

export function useMattersFromQuote(quoteId?: string) {
  const { data: matters = [], isLoading } = useQuery({
    queryKey: ['matters-from-quote', quoteId],
    queryFn: async (): Promise<Matter[]> => {
      if (!quoteId) return [];

      const { data, error } = await (supabase
        .from('matters')
        .select('*') as any)
        .eq('source_quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as Matter[];
    },
    enabled: !!quoteId,
  });

  return { matters, isLoading };
}

export function useMattersFromClient(clientId?: string) {
  const { data: matters = [], isLoading } = useQuery({
    queryKey: ['matters-from-client', clientId],
    queryFn: async (): Promise<Matter[]> => {
      if (!clientId) return [];

      // Get matters where client is owner
      const { data, error } = await (supabase
        .from('matter_parties')
        .select('matter:matters(*)') as any)
        .eq('contact_id', clientId)
        .eq('role', 'owner');

      if (error) throw error;

      return (data || []).map((p: any) => p.matter).filter(Boolean) as Matter[];
    },
    enabled: !!clientId,
  });

  return { matters, isLoading };
}
