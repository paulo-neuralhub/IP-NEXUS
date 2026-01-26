import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SubmissionType = 'facturae' | 'sii' | 'ticketbai' | 'verifactu';

export interface RegulatorySubmission {
  id: string;
  organization_id: string;
  invoice_id: string;
  submission_type: SubmissionType;
  status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'error';
  request_data?: Record<string, any>;
  response_data?: Record<string, any>;
  error_message?: string;
  submitted_at?: string;
  created_at: string;
}

// Generate Facturae XML
export function useGenerateFacturae() {
  return useMutation({
    mutationFn: async ({ invoiceId, sign = false }: { invoiceId: string; sign?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('generate-facturae', {
        body: { invoice_id: invoiceId, sign },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      toast.success('XML Facturae generado', {
        description: data.signed ? 'XML firmado correctamente' : 'XML generado sin firma',
      });
    },
    onError: (error: Error) => {
      toast.error('Error generando Facturae', {
        description: error.message,
      });
    },
  });
}

// Submit to SII (AEAT)
export function useSubmitSII() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ invoiceId, testMode = true }: { invoiceId: string; testMode?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('submit-sii', {
        body: { invoice_id: invoiceId, test_mode: testMode },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['regulatory-submissions'] });
      
      toast.success('Factura enviada al SII', {
        description: data.test_mode 
          ? `Simulación completada. CSV: ${data.csv}` 
          : `Registrada con CSV: ${data.csv}`,
      });
    },
    onError: (error: Error) => {
      toast.error('Error enviando al SII', {
        description: error.message,
      });
    },
  });
}

// Submit to TicketBAI (Basque Country)
export function useSubmitTicketBAI() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ invoiceId, testMode = true }: { invoiceId: string; testMode?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('submit-ticketbai', {
        body: { invoice_id: invoiceId, test_mode: testMode },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['regulatory-submissions'] });
      
      toast.success('Factura enviada a TicketBAI', {
        description: `ID: ${data.tbai_identifier}`,
      });
    },
    onError: (error: Error) => {
      toast.error('Error enviando a TicketBAI', {
        description: error.message,
      });
    },
  });
}

// Submit to VERI*FACTU (2025)
export function useSubmitVeriFactu() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ invoiceId, testMode = true }: { invoiceId: string; testMode?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('submit-verifactu', {
        body: { invoice_id: invoiceId, test_mode: testMode },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['regulatory-submissions'] });
      
      toast.success('Factura registrada en VERI*FACTU', {
        description: `ID: ${data.verifactu_id}`,
      });
    },
    onError: (error: Error) => {
      toast.error('Error enviando a VERI*FACTU', {
        description: error.message,
      });
    },
  });
}

// Get submission history for an invoice
export function useInvoiceSubmissions(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ['regulatory-submissions', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];
      
      const { data, error } = await supabase
        .from('regulatory_submissions')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RegulatorySubmission[];
    },
    enabled: !!invoiceId,
  });
}

// Download Facturae XML
export function useDownloadFacturae() {
  const generateFacturae = useGenerateFacturae();
  
  const downloadXml = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const result = await generateFacturae.mutateAsync({ invoiceId, sign: false });
      
      if (result?.xml) {
        const blob = new Blob([result.xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoiceNumber}_facturae.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading Facturae:', error);
    }
  };
  
  return {
    downloadXml,
    isLoading: generateFacturae.isPending,
  };
}
