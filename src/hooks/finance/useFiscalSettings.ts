// src/hooks/finance/useFiscalSettings.ts
// Hooks for managing fiscal settings and invoice series

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { FiscalSettings, InvoiceSeries, RegulatorySubmission, PaymentMethodCode, CorrectionReasonCode } from '@/types/finance';

// ===== FISCAL SETTINGS =====
export function useFiscalSettings() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['fiscal-settings', currentOrganization?.id],
    queryFn: async (): Promise<FiscalSettings | null> => {
      const { data, error } = await supabase
        .from('fiscal_settings')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as FiscalSettings | null;
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCreateFiscalSettings() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<FiscalSettings>) => {
      const insertData = {
        organization_id: currentOrganization!.id,
        tax_id: data.tax_id || '',
        legal_name: data.legal_name || '',
        ...data,
      };
      
      const { data: settings, error } = await supabase
        .from('fiscal_settings')
        .insert(insertData as any)
        .select()
        .single();
      
      if (error) throw error;
      return settings as FiscalSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscal-settings'] });
    },
  });
}

export function useUpdateFiscalSettings() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<FiscalSettings>) => {
      const { data: settings, error } = await supabase
        .from('fiscal_settings')
        .update({ ...data, updated_at: new Date().toISOString() } as any)
        .eq('organization_id', currentOrganization!.id)
        .select()
        .single();
      
      if (error) throw error;
      return settings as FiscalSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscal-settings'] });
    },
  });
}

export function useUpsertFiscalSettings() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<FiscalSettings>) => {
      const upsertData = {
        organization_id: currentOrganization!.id,
        tax_id: data.tax_id || '',
        legal_name: data.legal_name || '',
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      const { data: settings, error } = await supabase
        .from('fiscal_settings')
        .upsert(upsertData as any, { onConflict: 'organization_id' })
        .select()
        .single();
      
      if (error) throw error;
      return settings as FiscalSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscal-settings'] });
    },
  });
}

// ===== INVOICE SERIES =====
export function useInvoiceSeries() {
  const { currentOrganization } = useOrganization();
  const currentYear = new Date().getFullYear();
  
  return useQuery({
    queryKey: ['invoice-series', currentOrganization?.id, currentYear],
    queryFn: async (): Promise<InvoiceSeries[]> => {
      const { data, error } = await supabase
        .from('invoice_series')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('fiscal_year', { ascending: false })
        .order('code');
      
      if (error) throw error;
      return (data as InvoiceSeries[]) ?? [];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCreateInvoiceSeries() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<InvoiceSeries>) => {
      const insertData = {
        organization_id: currentOrganization!.id,
        code: data.code || 'F',
        name: data.name || 'Facturas',
        fiscal_year: data.fiscal_year || new Date().getFullYear(),
        ...data,
      };
      
      const { data: series, error } = await supabase
        .from('invoice_series')
        .insert(insertData as any)
        .select()
        .single();
      
      if (error) throw error;
      return series as InvoiceSeries;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-series'] });
    },
  });
}

export function useUpdateInvoiceSeries() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InvoiceSeries> }) => {
      const { data: series, error } = await supabase
        .from('invoice_series')
        .update({ ...data, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return series as InvoiceSeries;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-series'] });
    },
  });
}

export function useDeleteInvoiceSeries() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoice_series')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-series'] });
    },
  });
}

// ===== REGULATORY SUBMISSIONS =====
export function useRegulatorySubmissions(invoiceId?: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['regulatory-submissions', currentOrganization?.id, invoiceId],
    queryFn: async (): Promise<RegulatorySubmission[]> => {
      let query = supabase
        .from('regulatory_submissions')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });
      
      if (invoiceId) {
        query = query.eq('invoice_id', invoiceId);
      }
      
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data as RegulatorySubmission[]) ?? [];
    },
    enabled: !!currentOrganization?.id,
  });
}

// ===== PAYMENT METHOD CODES =====
export function usePaymentMethodCodes() {
  return useQuery({
    queryKey: ['payment-method-codes'],
    queryFn: async (): Promise<PaymentMethodCode[]> => {
      const { data, error } = await supabase
        .from('payment_method_codes')
        .select('*')
        .order('code');
      
      if (error) throw error;
      return (data as PaymentMethodCode[]) ?? [];
    },
    staleTime: Infinity, // These codes don't change
  });
}

// ===== CORRECTION REASON CODES =====
export function useCorrectionReasonCodes() {
  return useQuery({
    queryKey: ['correction-reason-codes'],
    queryFn: async (): Promise<CorrectionReasonCode[]> => {
      const { data, error } = await supabase
        .from('correction_reason_codes')
        .select('*')
        .order('code');
      
      if (error) throw error;
      return (data as CorrectionReasonCode[]) ?? [];
    },
    staleTime: Infinity, // These codes don't change
  });
}

// ===== HELPER: Get next invoice number =====
export function useGetNextInvoiceNumber() {
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (seriesCode?: string): Promise<string> => {
      const { data, error } = await supabase
        .rpc('get_next_invoice_number', {
          p_org_id: currentOrganization!.id,
          p_series_code: seriesCode || null,
        });
      
      if (error) throw error;
      return data as string;
    },
  });
}
