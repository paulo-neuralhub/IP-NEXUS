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
    customData?: Partial<SampleData>,
    layout?: string
  ): Promise<string> => {
    const data = { ...DEFAULT_SAMPLE_DATA, ...customData };
    const processedContent = replaceVariables(templateContent, data);

    // If content is empty or just a placeholder, generate default based on layout
    if (!processedContent || processedContent.trim() === '{{invoice_content}}' || processedContent.trim() === '{{quote_content}}') {
      return generateDefaultPreview(layout || 'classic', data);
    }

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

  // Generate default professional preview based on layout
  const generateDefaultPreview = (layout: string, data: SampleData): string => {
    const primaryColor = branding?.primary_color || '#0F172A';
    const logoUrl = branding?.logo_url;
    
    // Classic Invoice Layout
    if (layout === 'classic') {
      return `
        <div style="
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          font-family: ${branding?.font_family || 'Inter'}, sans-serif;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        ">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid ${primaryColor};">
            <div>
              ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="max-height: 60px; margin-bottom: 15px;" />` : ''}
              <h1 style="margin: 0; font-size: 14px; color: #64748B; font-weight: 600; letter-spacing: 0.5px;">FACTURA</h1>
              <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: 700; color: ${primaryColor};">${data.invoice?.number}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 13px; font-weight: 600; color: #334155;">${data.company?.name}</p>
              <p style="margin: 3px 0 0 0; font-size: 12px; color: #64748B;">${data.company?.tax_id}</p>
              <p style="margin: 3px 0 0 0; font-size: 12px; color: #64748B;">${data.company?.address}</p>
              <p style="margin: 0; font-size: 12px; color: #64748B;">${data.company?.postal_code} ${data.company?.city}</p>
            </div>
          </div>

          <!-- Client Info -->
          <div style="margin-bottom: 30px;">
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Facturar a:</p>
            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; border-left: 3px solid ${primaryColor};">
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1E293B;">${data.client?.name}</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748B;">${data.client?.tax_id}</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748B;">${data.client?.address}</p>
              <p style="margin: 0; font-size: 13px; color: #64748B;">${data.client?.postal_code} ${data.client?.city}</p>
            </div>
          </div>

          <!-- Invoice Details -->
          <div style="display: flex; gap: 20px; margin-bottom: 30px;">
            <div style="flex: 1;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748B; font-weight: 600;">FECHA</p>
              <p style="margin: 0; font-size: 14px; color: #1E293B; font-weight: 500;">${data.invoice?.date}</p>
            </div>
            <div style="flex: 1;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748B; font-weight: 600;">VENCIMIENTO</p>
              <p style="margin: 0; font-size: 14px; color: #1E293B; font-weight: 500;">${data.invoice?.due_date}</p>
            </div>
            <div style="flex: 1;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748B; font-weight: 600;">EXPEDIENTE</p>
              <p style="margin: 0; font-size: 14px; color: #1E293B; font-weight: 500;">${data.matter?.reference}</p>
            </div>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background: ${primaryColor}; color: white;">
                <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; letter-spacing: 0.3px;">DESCRIPCIÓN</th>
                <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; letter-spacing: 0.3px;">CANTIDAD</th>
                <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; letter-spacing: 0.3px;">PRECIO</th>
                <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; letter-spacing: 0.3px;">IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 15px 12px; font-size: 13px; color: #1E293B;">Tasas oficiales de registro - ${data.matter?.mark_name}</td>
                <td style="padding: 15px 12px; text-align: right; font-size: 13px; color: #64748B;">1</td>
                <td style="padding: 15px 12px; text-align: right; font-size: 13px; color: #64748B;">350,00 €</td>
                <td style="padding: 15px 12px; text-align: right; font-size: 14px; font-weight: 600; color: #1E293B;">350,00 €</td>
              </tr>
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 15px 12px; font-size: 13px; color: #1E293B;">Honorarios profesionales</td>
                <td style="padding: 15px 12px; text-align: right; font-size: 13px; color: #64748B;">1</td>
                <td style="padding: 15px 12px; text-align: right; font-size: 13px; color: #64748B;">500,00 €</td>
                <td style="padding: 15px 12px; text-align: right; font-size: 14px; font-weight: 600; color: #1E293B;">500,00 €</td>
              </tr>
            </tbody>
          </table>

          <!-- Totals -->
          <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
            <div style="width: 280px;">
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E2E8F0;">
                <span style="font-size: 13px; color: #64748B;">Subtotal</span>
                <span style="font-size: 14px; font-weight: 500; color: #1E293B;">${data.invoice?.subtotal}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E2E8F0;">
                <span style="font-size: 13px; color: #64748B;">IVA (${data.invoice?.tax_rate}%)</span>
                <span style="font-size: 14px; font-weight: 500; color: #1E293B;">${data.invoice?.tax_amount}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 15px 0; background: ${primaryColor}; color: white; margin-top: 1px; padding-left: 15px; padding-right: 15px; border-radius: 6px;">
                <span style="font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">TOTAL</span>
                <span style="font-size: 20px; font-weight: 700;">${data.invoice?.total}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="border-top: 2px solid #F1F5F9; padding-top: 20px; margin-top: 40px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748B;">
              <div>
                <p style="margin: 0 0 3px 0; font-weight: 600;">${data.company?.name}</p>
                <p style="margin: 0;">${data.company?.phone} • ${data.company?.email}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0 0 3px 0;">www.midespacho.com</p>
                <p style="margin: 0;">Página 1 de 1</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Certificate layout
    if (layout === 'certificate') {
      return `
        <div style="
          max-width: 800px;
          margin: 0 auto;
          padding: 60px 50px;
          font-family: ${branding?.font_family || 'Inter'}, sans-serif;
          background: white;
          border: 8px solid ${primaryColor};
          position: relative;
        ">
          <!-- Decorative corners -->
          <div style="position: absolute; top: 20px; left: 20px; width: 40px; height: 40px; border-top: 3px solid #D4AF37; border-left: 3px solid #D4AF37;"></div>
          <div style="position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border-top: 3px solid #D4AF37; border-right: 3px solid #D4AF37;"></div>
          <div style="position: absolute; bottom: 20px; left: 20px; width: 40px; height: 40px; border-bottom: 3px solid #D4AF37; border-left: 3px solid #D4AF37;"></div>
          <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border-bottom: 3px solid #D4AF37; border-right: 3px solid #D4AF37;"></div>

          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="max-height: 70px; margin-bottom: 20px;" />` : ''}
            <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: ${primaryColor}; letter-spacing: 1px;">CERTIFICADO</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #64748B; letter-spacing: 2px; text-transform: uppercase;">de Registro de Marca</p>
          </div>

          <!-- Certificate Number -->
          <div style="text-align: center; margin-bottom: 30px; padding: 15px; background: #F8FAFC; border-left: 4px solid #D4AF37; border-right: 4px solid #D4AF37;">
            <p style="margin: 0; font-size: 12px; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">Certificado Nº</p>
            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: 700; color: ${primaryColor};">${data.certificate?.number}</p>
          </div>

          <!-- Body -->
          <div style="text-align: center; margin-bottom: 40px; line-height: 1.8;">
            <p style="margin: 0 0 25px 0; font-size: 15px; color: #1E293B;">Por medio del presente se certifica que:</p>
            <div style="background: linear-gradient(to right, transparent, #F8FAFC, transparent); padding: 30px 20px; margin: 25px 0;">
              <p style="margin: 0 0 15px 0; font-size: 28px; font-weight: 700; color: ${primaryColor};">${data.matter?.mark_name}</p>
              <p style="margin: 0; font-size: 14px; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">Marca Registrada</p>
            </div>
            <p style="margin: 20px 0; font-size: 14px; color: #1E293B; line-height: 1.8;">
              Ha sido debidamente registrada ante <strong>${data.matter?.office_name}</strong><br/>
              con el número de registro <strong>${data.matter?.registration_number}</strong><br/>
              en las clases <strong>${data.matter?.nice_classes}</strong> de la Clasificación de Niza.
            </p>
          </div>

          <!-- Details Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; padding: 20px; background: #FAFAFA; border-radius: 8px;">
            <div>
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase;">Fecha de Solicitud</p>
              <p style="margin: 0; font-size: 14px; color: #1E293B; font-weight: 500;">${data.matter?.filing_date}</p>
            </div>
            <div>
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase;">Fecha de Registro</p>
              <p style="margin: 0; font-size: 14px; color: #1E293B; font-weight: 500;">${data.matter?.registration_date}</p>
            </div>
            <div>
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase;">Jurisdicción</p>
              <p style="margin: 0; font-size: 14px; color: #1E293B; font-weight: 500;">${data.matter?.jurisdiction}</p>
            </div>
            <div>
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase;">Fecha de Vencimiento</p>
              <p style="margin: 0; font-size: 14px; color: #1E293B; font-weight: 500;">${data.matter?.expiry_date}</p>
            </div>
          </div>

          <!-- Signature -->
          <div style="margin-top: 50px; text-align: center;">
            <div style="border-top: 2px solid #CBD5E1; width: 300px; margin: 0 auto 10px auto;"></div>
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1E293B;">${data.signer?.name}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748B;">${data.signer?.title}</p>
            <p style="margin: 20px 0 0 0; font-size: 11px; color: #94A3B8;">Expedido en Madrid, a ${data.certificate?.date}</p>
          </div>

          <!-- Verification -->
          <div style="margin-top: 40px; text-align: center; padding: 15px; background: #F8FAFC; border-radius: 6px;">
            <p style="margin: 0 0 5px 0; font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Código de Verificación</p>
            <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1E293B; font-family: 'Courier New', monospace; letter-spacing: 2px;">${data.certificate?.verification_code}</p>
          </div>
        </div>
      `;
    }

    // Default fallback
    return `<div style="padding: 40px; text-align: center; color: #64748B;">Vista previa no disponible</div>`;
  };

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
