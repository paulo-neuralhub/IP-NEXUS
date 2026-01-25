// src/hooks/useTemplatePreview.ts
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenantBranding } from './useTenantBranding';

interface SampleData {
  invoice?: {
    number: string;
    date: string;
    due_date: string;
    subtotal: string;
    tax_rate: string;
    tax_amount: string;
    total: string;
    status?: string;
  };
  quote?: {
    number: string;
    date: string;
    valid_until: string;
    subtotal: string;
    tax_rate: string;
    tax_amount: string;
    total: string;
    description?: string;
  };
  client?: {
    name: string;
    tax_id: string;
    address: string;
    city?: string;
    postal_code?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
  matter?: {
    reference: string;
    mark_name: string;
    nice_classes?: string;
    registration_number?: string;
    filing_date?: string;
    registration_date?: string;
    expiry_date?: string;
    jurisdiction?: string;
    office_name?: string;
  };
  company?: {
    name: string;
    tax_id: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    phone: string;
    email: string;
    website?: string;
  };
  signer?: {
    name: string;
    title: string;
  };
  certificate?: {
    number: string;
    date: string;
    verification_code?: string;
  };
  letter?: {
    date: string;
    reference: string;
    subject: string;
    body: string;
  };
}

const DEFAULT_SAMPLE_DATA: SampleData = {
  invoice: {
    number: 'INV-2025-0001',
    date: '25/01/2025',
    due_date: '25/02/2025',
    subtotal: '850,00 €',
    tax_rate: '21',
    tax_amount: '178,50 €',
    total: '1.028,50 €',
    status: 'Pendiente',
  },
  quote: {
    number: 'Q-2025-0042',
    date: '25/01/2025',
    valid_until: '25/02/2025',
    subtotal: '850,00 €',
    tax_rate: '21',
    tax_amount: '178,50 €',
    total: '1.028,50 €',
    description: 'Registro de marca en la Unión Europea',
  },
  client: {
    name: 'ACME Corporation S.L.',
    tax_id: 'B12345678',
    address: 'Calle Mayor 123, 4º Izq',
    city: 'Madrid',
    postal_code: '28001',
    country: 'España',
    email: 'contacto@acme.es',
    phone: '+34 912 345 678',
  },
  matter: {
    reference: 'ACME-2025-001',
    mark_name: 'ACME BRAND',
    nice_classes: '9, 35, 42',
    registration_number: '018123456',
    filing_date: '15/01/2025',
    registration_date: '15/06/2025',
    expiry_date: '15/01/2035',
    jurisdiction: 'EUIPO',
    office_name: 'Oficina de Propiedad Intelectual de la Unión Europea',
  },
  company: {
    name: 'Mi Despacho IP S.L.',
    tax_id: 'B87654321',
    address: 'Paseo de la Castellana 200',
    city: 'Madrid',
    postal_code: '28046',
    country: 'España',
    phone: '+34 917 654 321',
    email: 'info@midespacho.com',
    website: 'www.midespacho.com',
  },
  signer: {
    name: 'Juan García López',
    title: 'Agente de la Propiedad Industrial',
  },
  certificate: {
    number: 'CERT-2025-0001',
    date: '25 de enero de 2025',
    verification_code: 'ABC123XYZ',
  },
  letter: {
    date: '25 de enero de 2025',
    reference: 'REF-2025-001',
    subject: 'Notificación de registro de marca',
    body: 'Nos complace informarle que su solicitud de registro de marca ha sido procesada satisfactoriamente.',
  },
};

export function useTemplatePreview() {
  const { toast } = useToast();
  const { branding } = useTenantBranding();
  const [isGenerating, setIsGenerating] = useState(false);

  // Replace variables in template content
  const replaceVariables = useCallback((content: string, data: SampleData): string => {
    let result = content;

    // Replace all variable patterns {{group.key}}
    const variablePattern = /\{\{(\w+)\.(\w+)\}\}/g;
    
    result = result.replace(variablePattern, (match, group, key) => {
      const groupData = data[group as keyof SampleData] as Record<string, string> | undefined;
      if (groupData && groupData[key]) {
        return groupData[key];
      }
      return match; // Keep original if not found
    });

    // Also replace branding variables if available
    if (branding) {
      result = result.replace(/\{\{company\.name\}\}/g, branding.company_legal_name || data.company?.name || '');
      result = result.replace(/\{\{company\.tax_id\}\}/g, branding.company_tax_id || data.company?.tax_id || '');
      result = result.replace(/\{\{company\.address\}\}/g, branding.company_address || data.company?.address || '');
      result = result.replace(/\{\{company\.city\}\}/g, branding.company_city || data.company?.city || '');
      result = result.replace(/\{\{company\.postal_code\}\}/g, branding.company_postal_code || data.company?.postal_code || '');
      result = result.replace(/\{\{company\.country\}\}/g, branding.company_country || data.company?.country || '');
      result = result.replace(/\{\{company\.phone\}\}/g, branding.company_phone || data.company?.phone || '');
      result = result.replace(/\{\{company\.email\}\}/g, branding.company_email || data.company?.email || '');
      result = result.replace(/\{\{company\.website\}\}/g, branding.company_website || data.company?.website || '');
      result = result.replace(/\{\{company\.logo\}\}/g, branding.logo_url ? `[LOGO]` : '');
    }

    return result;
  }, [branding]);

  // Generate preview HTML
  const generatePreview = useCallback(async (
    templateContent: string,
    customData?: Partial<SampleData>
  ): Promise<string> => {
    const data = { ...DEFAULT_SAMPLE_DATA, ...customData };
    const processedContent = replaceVariables(templateContent, data);
    
    // Convert markdown-like content to HTML
    let html = processedContent
      // Headers
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Horizontal rules
      .replace(/^───+$/gm, '<hr class="my-4 border-gray-300" />')
      .replace(/^═══+$/gm, '<hr class="my-4 border-2 border-gray-400" />')
      // Tables
      .replace(/\|(.+)\|/g, (match, content) => {
        const cells = content.split('|').map((c: string) => c.trim());
        return `<tr>${cells.map((c: string) => `<td class="px-2 py-1 border">${c}</td>`).join('')}</tr>`;
      })
      // Checkboxes
      .replace(/☐/g, '<input type="checkbox" disabled class="mr-2" />')
      .replace(/☑/g, '<input type="checkbox" checked disabled class="mr-2" />')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="mb-2">')
      // Line breaks
      .replace(/\n/g, '<br />');

    // Wrap tables
    html = html.replace(/(<tr>.*<\/tr>)/gs, '<table class="w-full border-collapse my-4">$1</table>');

    return `
      <div class="preview-content font-sans text-sm leading-relaxed" style="
        font-family: ${branding?.font_family || 'Inter'}, sans-serif;
        color: #1f2937;
      ">
        <p class="mb-2">${html}</p>
      </div>
    `;
  }, [replaceVariables, branding]);

  // Download PDF (calls edge function)
  const downloadPdf = useCallback(async (
    templateId: string,
    data?: SampleData
  ): Promise<Blob | null> => {
    setIsGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-document-ai', {
        body: {
          templateId,
          variables: data,
        },
      });

      if (error) throw error;
      
      // For now, return null as PDF generation would need additional implementation
      toast({ title: 'Vista previa generada' });
      return null;
    } catch (error) {
      toast({
        title: 'Error al generar PDF',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  return {
    generatePreview,
    downloadPdf,
    isGenerating,
    sampleData: DEFAULT_SAMPLE_DATA,
  };
}
