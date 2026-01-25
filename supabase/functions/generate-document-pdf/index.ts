// supabase/functions/generate-document-pdf/index.ts
// Professional PDF generation for invoices, quotes, certificates, and letters

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================
// PROFESSIONAL STYLES
// ============================================================
const professionalStyles = {
  fonts: {
    heading: 'helvetica',
    body: 'helvetica',
  },
  fontSize: {
    h1: 24,
    h2: 18,
    h3: 14,
    body: 10,
    small: 9,
    tiny: 8,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 32,
  },
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  colors: {
    primary: [37, 99, 235],      // #2563eb
    secondary: [30, 64, 175],    // #1e40af
    text: [31, 41, 55],          // #1f2937
    muted: [107, 114, 128],      // #6b7280
    border: [229, 231, 235],     // #e5e7eb
    background: [249, 250, 251], // #f9fafb
    white: [255, 255, 255],
  },
};

// ============================================================
// TYPES
// ============================================================
interface GeneratePdfRequest {
  documentType: 'invoice' | 'quote' | 'certificate' | 'letter';
  documentId: string;
  templateId?: string;
  options?: {
    format?: 'A4' | 'Letter';
    language?: 'es' | 'en';
  };
}

interface Branding {
  logo_url?: string;
  logo_width?: number;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  company_legal_name?: string;
  company_tax_id?: string;
  company_address?: string;
  company_city?: string;
  company_postal_code?: string;
  company_country?: string;
  company_phone?: string;
  company_email?: string;
  company_website?: string;
  bank_name?: string;
  bank_iban?: string;
  bank_swift?: string;
  registry_info?: string;
  footer_text?: string;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
  }
  return [37, 99, 235]; // Default primary color
}

function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatDate(dateStr: string, lang = 'es'): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

// ============================================================
// PDF COMPONENTS
// ============================================================
function renderHeader(
  doc: jsPDF,
  branding: Branding,
  documentTitle: string,
  documentNumber: string,
  documentDate: string,
  pageWidth: number
): number {
  const { margins, fontSize, colors, spacing } = professionalStyles;
  let y = margins.top;
  
  const primaryColor = branding.primary_color 
    ? hexToRgb(branding.primary_color) 
    : colors.primary;

  // Company info on the left
  doc.setFontSize(fontSize.h3);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.text);
  doc.text(branding.company_legal_name || 'Empresa', margins.left, y);
  
  y += spacing.sm;
  doc.setFontSize(fontSize.small);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.muted);
  
  if (branding.company_tax_id) {
    doc.text(`NIF: ${branding.company_tax_id}`, margins.left, y);
    y += spacing.xs + 1;
  }
  
  if (branding.company_address) {
    doc.text(branding.company_address, margins.left, y);
    y += spacing.xs + 1;
  }
  
  if (branding.company_city || branding.company_postal_code) {
    const cityLine = [branding.company_postal_code, branding.company_city, branding.company_country]
      .filter(Boolean)
      .join(', ');
    doc.text(cityLine, margins.left, y);
    y += spacing.xs + 1;
  }
  
  if (branding.company_phone || branding.company_email) {
    const contactLine = [branding.company_phone, branding.company_email]
      .filter(Boolean)
      .join(' | ');
    doc.text(contactLine, margins.left, y);
  }

  // Document title on the right
  const titleX = pageWidth - margins.right;
  let titleY = margins.top;
  
  doc.setFontSize(fontSize.h1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(documentTitle, titleX, titleY, { align: 'right' });
  
  titleY += spacing.md;
  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.text(`Nº: ${documentNumber}`, titleX, titleY, { align: 'right' });
  
  titleY += spacing.sm;
  doc.text(`Fecha: ${formatShortDate(documentDate)}`, titleX, titleY, { align: 'right' });

  return Math.max(y, titleY) + spacing.xl;
}

function renderClientSection(
  doc: jsPDF,
  client: Record<string, unknown>,
  startY: number,
  pageWidth: number
): number {
  const { margins, fontSize, colors, spacing } = professionalStyles;
  let y = startY;
  
  // Section title
  doc.setFontSize(fontSize.small);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.muted);
  doc.text('FACTURAR A:', margins.left, y);
  
  y += spacing.sm;
  
  // Client box
  const boxWidth = (pageWidth - margins.left - margins.right) / 2;
  doc.setFillColor(...colors.background);
  doc.roundedRect(margins.left, y, boxWidth, 40, 2, 2, 'F');
  
  y += spacing.sm;
  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.text);
  doc.text(String(client.name || ''), margins.left + spacing.sm, y);
  
  y += spacing.sm;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.muted);
  
  if (client.tax_id) {
    doc.text(`NIF: ${client.tax_id}`, margins.left + spacing.sm, y);
    y += spacing.xs + 2;
  }
  
  if (client.address) {
    doc.text(String(client.address), margins.left + spacing.sm, y);
    y += spacing.xs + 2;
  }
  
  const cityLine = [client.postal_code, client.city, client.country]
    .filter(Boolean)
    .join(', ');
  if (cityLine) {
    doc.text(cityLine, margins.left + spacing.sm, y);
  }

  return startY + 50;
}

function renderLineItemsTable(
  doc: jsPDF,
  items: Array<Record<string, unknown>>,
  startY: number,
  pageWidth: number,
  branding: Branding
): number {
  const { margins, fontSize, colors, spacing } = professionalStyles;
  const primaryColor = branding.primary_color 
    ? hexToRgb(branding.primary_color) 
    : colors.primary;
  
  const tableWidth = pageWidth - margins.left - margins.right;
  const columns = [
    { key: 'description', label: 'Descripción', width: tableWidth * 0.45, align: 'left' as const },
    { key: 'quantity', label: 'Cant.', width: tableWidth * 0.1, align: 'center' as const },
    { key: 'unit_price', label: 'Precio Unit.', width: tableWidth * 0.2, align: 'right' as const },
    { key: 'total', label: 'Total', width: tableWidth * 0.25, align: 'right' as const },
  ];
  
  const headerHeight = 10;
  const rowHeight = 12;
  let y = startY;
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(margins.left, y, tableWidth, headerHeight, 'F');
  
  doc.setFontSize(fontSize.small);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.white);
  
  let colX = margins.left;
  columns.forEach(col => {
    const textX = col.align === 'right' ? colX + col.width - spacing.sm : colX + spacing.sm;
    doc.text(col.label, textX, y + 7, { align: col.align === 'center' ? 'center' : col.align });
    colX += col.width;
  });
  
  y += headerHeight;
  
  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.setFontSize(fontSize.body);
  
  items.forEach((item, index) => {
    // Alternate row background
    if (index % 2 === 1) {
      doc.setFillColor(...colors.background);
      doc.rect(margins.left, y, tableWidth, rowHeight, 'F');
    }
    
    let cellX = margins.left;
    columns.forEach(col => {
      let value = item[col.key];
      
      // Format numbers as currency
      if ((col.key === 'unit_price' || col.key === 'total') && typeof value === 'number') {
        value = formatCurrency(value);
      }
      
      const textX = col.align === 'right' ? cellX + col.width - spacing.sm : cellX + spacing.sm;
      doc.text(String(value || ''), textX, y + 8, { 
        align: col.align === 'center' ? 'center' : col.align,
        maxWidth: col.width - spacing.md
      });
      cellX += col.width;
    });
    
    y += rowHeight;
  });
  
  // Bottom border
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.line(margins.left, y, margins.left + tableWidth, y);

  return y + spacing.lg;
}

function renderTotals(
  doc: jsPDF,
  totals: { subtotal: number; taxRate: number; taxAmount: number; total: number },
  startY: number,
  pageWidth: number,
  branding: Branding
): number {
  const { margins, fontSize, colors, spacing } = professionalStyles;
  const primaryColor = branding.primary_color 
    ? hexToRgb(branding.primary_color) 
    : colors.primary;
  
  const boxWidth = 160;
  const boxX = pageWidth - margins.right - boxWidth;
  let y = startY;
  
  // Subtotal
  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.text('Subtotal', boxX, y);
  doc.text(formatCurrency(totals.subtotal), pageWidth - margins.right, y, { align: 'right' });
  
  y += spacing.sm;
  
  // Tax
  doc.setTextColor(...colors.muted);
  doc.text(`IVA (${totals.taxRate}%)`, boxX, y);
  doc.text(formatCurrency(totals.taxAmount), pageWidth - margins.right, y, { align: 'right' });
  
  y += spacing.md;
  
  // Total box
  doc.setFillColor(...primaryColor);
  doc.roundedRect(boxX - spacing.sm, y - 2, boxWidth + spacing.sm, 18, 2, 2, 'F');
  
  doc.setFontSize(fontSize.h3);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.white);
  doc.text('TOTAL', boxX, y + 10);
  doc.text(formatCurrency(totals.total), pageWidth - margins.right, y + 10, { align: 'right' });

  return y + 30;
}

function renderPaymentInfo(
  doc: jsPDF,
  branding: Branding,
  startY: number,
  pageWidth: number
): number {
  const { margins, fontSize, colors, spacing } = professionalStyles;
  
  if (!branding.bank_iban && !branding.bank_name) return startY;
  
  let y = startY + spacing.lg;
  
  // Payment section
  doc.setFontSize(fontSize.small);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.muted);
  doc.text('DATOS DE PAGO', margins.left, y);
  
  y += spacing.sm;
  
  const boxWidth = (pageWidth - margins.left - margins.right) * 0.5;
  doc.setFillColor(...colors.background);
  doc.roundedRect(margins.left, y, boxWidth, 30, 2, 2, 'F');
  
  y += spacing.sm;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize.body);
  doc.setTextColor(...colors.text);
  
  if (branding.bank_name) {
    doc.text(`Banco: ${branding.bank_name}`, margins.left + spacing.sm, y);
    y += spacing.sm;
  }
  
  if (branding.bank_iban) {
    doc.text(`IBAN: ${branding.bank_iban}`, margins.left + spacing.sm, y);
    y += spacing.sm;
  }
  
  if (branding.bank_swift) {
    doc.text(`SWIFT/BIC: ${branding.bank_swift}`, margins.left + spacing.sm, y);
  }

  return y + spacing.lg;
}

function renderFooter(
  doc: jsPDF,
  branding: Branding,
  pageWidth: number,
  pageHeight: number
): void {
  const { margins, fontSize, colors, spacing } = professionalStyles;
  
  const footerY = pageHeight - margins.bottom - 10;
  
  // Separator line
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.line(margins.left, footerY - spacing.sm, pageWidth - margins.right, footerY - spacing.sm);
  
  // Footer text
  doc.setFontSize(fontSize.tiny);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.muted);
  
  const footerText = branding.footer_text || branding.registry_info || '';
  if (footerText) {
    doc.text(footerText, pageWidth / 2, footerY, { align: 'center', maxWidth: pageWidth - margins.left - margins.right });
  }
  
  // Page number
  doc.text(`Página 1 de 1`, pageWidth - margins.right, footerY + spacing.xs, { align: 'right' });
}

// ============================================================
// CERTIFICATE SPECIFIC RENDER
// ============================================================
function renderCertificate(
  doc: jsPDF,
  data: Record<string, unknown>,
  branding: Branding,
  template: Record<string, unknown>,
  pageWidth: number,
  pageHeight: number
): void {
  const { margins, fontSize, colors, spacing } = professionalStyles;
  const primaryColor = branding.primary_color 
    ? hexToRgb(branding.primary_color) 
    : colors.primary;
  
  // Decorative border
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(2);
  doc.rect(margins.left, margins.top, pageWidth - margins.left * 2, pageHeight - margins.top * 2);
  doc.setLineWidth(0.5);
  doc.rect(margins.left + 3, margins.top + 3, pageWidth - margins.left * 2 - 6, pageHeight - margins.top * 2 - 6);
  
  let y = margins.top + 40;
  
  // Title
  doc.setFontSize(fontSize.h1 + 4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('CERTIFICADO', pageWidth / 2, y, { align: 'center' });
  
  y += spacing.md;
  doc.setFontSize(fontSize.h3);
  doc.text(String(template.subtitle || 'DE REGISTRO'), pageWidth / 2, y, { align: 'center' });
  
  y += spacing.xl * 2;
  
  // Body text
  doc.setFontSize(fontSize.body + 1);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  
  const bodyText = `Por medio del presente documento, ${branding.company_legal_name || 'la empresa'} certifica que:`;
  doc.text(bodyText, pageWidth / 2, y, { align: 'center', maxWidth: pageWidth - margins.left * 4 });
  
  y += spacing.xl;
  
  // Details box
  const boxWidth = pageWidth - margins.left * 4;
  const boxX = (pageWidth - boxWidth) / 2;
  
  doc.setFillColor(...colors.background);
  doc.roundedRect(boxX, y, boxWidth, 80, 3, 3, 'F');
  
  y += spacing.lg;
  doc.setFontSize(fontSize.body);
  
  const details = [
    { label: 'Denominación:', value: data.mark_name || data.title || '' },
    { label: 'Número de Registro:', value: data.registration_number || data.reference || '' },
    { label: 'Fecha de Registro:', value: data.registration_date ? formatDate(String(data.registration_date)) : '' },
    { label: 'Titular:', value: data.client_name || '' },
    { label: 'Válido hasta:', value: data.expiry_date ? formatDate(String(data.expiry_date)) : '' },
  ];
  
  details.forEach(detail => {
    if (detail.value) {
      doc.setFont('helvetica', 'bold');
      doc.text(detail.label, boxX + spacing.lg, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(detail.value), boxX + 80, y);
      y += spacing.md;
    }
  });
  
  y += spacing.xl * 2;
  
  // Signature area
  const signY = pageHeight - margins.bottom - 80;
  
  doc.setFontSize(fontSize.body);
  doc.setTextColor(...colors.muted);
  const placeDate = `En ${branding.company_city || 'Madrid'}, a ${formatDate(new Date().toISOString())}`;
  doc.text(placeDate, pageWidth / 2, signY, { align: 'center' });
  
  // Signature line
  const lineWidth = 120;
  doc.setDrawColor(...colors.text);
  doc.line((pageWidth - lineWidth) / 2, signY + 35, (pageWidth + lineWidth) / 2, signY + 35);
  
  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'italic');
  doc.text('Firma autorizada', pageWidth / 2, signY + 42, { align: 'center' });
}

// ============================================================
// LETTER SPECIFIC RENDER
// ============================================================
function renderLetter(
  doc: jsPDF,
  data: Record<string, unknown>,
  branding: Branding,
  pageWidth: number
): void {
  const { margins, fontSize, colors, spacing } = professionalStyles;
  
  let y = margins.top;
  
  // Letterhead
  doc.setFontSize(fontSize.h3);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.text);
  doc.text(branding.company_legal_name || '', margins.left, y);
  
  y += spacing.sm;
  doc.setFontSize(fontSize.small);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.muted);
  
  const addressLine = [branding.company_address, branding.company_city, branding.company_postal_code]
    .filter(Boolean)
    .join(', ');
  doc.text(addressLine, margins.left, y);
  
  y += spacing.xs + 2;
  const contactLine = [branding.company_phone, branding.company_email].filter(Boolean).join(' | ');
  doc.text(contactLine, margins.left, y);
  
  // Date and reference on the right
  y = margins.top;
  doc.setTextColor(...colors.text);
  doc.text(`${branding.company_city || 'Madrid'}, ${formatDate(String(data.date) || new Date().toISOString())}`, pageWidth - margins.right, y, { align: 'right' });
  
  if (data.reference) {
    y += spacing.sm;
    doc.text(`Ref: ${data.reference}`, pageWidth - margins.right, y, { align: 'right' });
  }
  
  y = margins.top + 40;
  
  // Separator
  doc.setDrawColor(...colors.border);
  doc.line(margins.left, y, pageWidth - margins.right, y);
  
  y += spacing.xl;
  
  // Recipient
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontSize.body);
  doc.setTextColor(...colors.text);
  doc.text(String(data.recipient_name || ''), margins.left, y);
  
  if (data.recipient_company) {
    y += spacing.sm;
    doc.setFont('helvetica', 'normal');
    doc.text(String(data.recipient_company), margins.left, y);
  }
  
  if (data.recipient_address) {
    y += spacing.sm;
    doc.text(String(data.recipient_address), margins.left, y);
  }
  
  y += spacing.xl;
  
  // Subject
  if (data.subject) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Asunto: ${data.subject}`, margins.left, y);
    y += spacing.lg;
  }
  
  // Salutation
  doc.setFont('helvetica', 'normal');
  doc.text(String(data.salutation || 'Estimado/a Sr./Sra.:'), margins.left, y);
  y += spacing.lg;
  
  // Body
  if (data.body) {
    const bodyLines = doc.splitTextToSize(String(data.body), pageWidth - margins.left - margins.right);
    doc.text(bodyLines, margins.left, y);
    y += bodyLines.length * 5 + spacing.lg;
  }
  
  // Closing
  y += spacing.lg;
  doc.text(String(data.closing || 'Atentamente,'), margins.left, y);
  
  y += spacing.xl * 2;
  
  // Signature
  doc.setFont('helvetica', 'bold');
  doc.text(String(data.signer_name || ''), margins.left, y);
  
  if (data.signer_title) {
    y += spacing.sm;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.muted);
    doc.text(String(data.signer_title), margins.left, y);
  }
}

// ============================================================
// MAIN GENERATION FUNCTION
// ============================================================
// deno-lint-ignore no-explicit-any
async function generateDocumentPdf(
  supabaseClient: any,
  input: GeneratePdfRequest
): Promise<{ pdfUrl: string; pdfBase64: string }> {
  const { documentType, documentId, templateId, options } = input;
  const format = options?.format || 'A4';
  const lang = options?.language || 'es';
  
  // Get document data
  let document: Record<string, unknown>;
  let organizationId = '';
  let client: Record<string, unknown> = {};
  let lineItems: Array<Record<string, unknown>> = [];
  
  if (documentType === 'invoice') {
    const { data, error } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        client:contacts!invoices_client_id_fkey(*)
      `)
      .eq('id', documentId)
      .single();
    
    if (error || !data) throw new Error(`Invoice not found: ${documentId}`);
    document = data as Record<string, unknown>;
    organizationId = String((data as Record<string, unknown>).organization_id || '');
    client = ((data as Record<string, unknown>).client as Record<string, unknown>) || {};
    
    // Get line items
    const { data: items } = await supabaseClient
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', documentId)
      .order('position');
    
    lineItems = (items as Array<Record<string, unknown>>) || [];
    
  } else if (documentType === 'quote') {
    const { data, error } = await supabaseClient
      .from('quotes')
      .select(`
        *,
        client:contacts!quotes_client_id_fkey(*)
      `)
      .eq('id', documentId)
      .single();
    
    if (error || !data) throw new Error(`Quote not found: ${documentId}`);
    document = data as Record<string, unknown>;
    organizationId = String((data as Record<string, unknown>).organization_id || '');
    client = ((data as Record<string, unknown>).client as Record<string, unknown>) || {};
    
    // Get line items
    const { data: items } = await supabaseClient
      .from('quote_items')
      .select('*')
      .eq('quote_id', documentId)
      .order('position');
    
    lineItems = (items as Array<Record<string, unknown>>) || [];
    
  } else if (documentType === 'certificate' || documentType === 'letter') {
    // For certificates and letters, we might use matter data
    const { data, error } = await supabaseClient
      .from('matters')
      .select(`
        *,
        client:contacts!matters_client_id_fkey(*)
      `)
      .eq('id', documentId)
      .single();
    
    if (error || !data) throw new Error(`Matter not found: ${documentId}`);
    document = data as Record<string, unknown>;
    organizationId = String((data as Record<string, unknown>).organization_id || '');
    client = ((data as Record<string, unknown>).client as Record<string, unknown>) || {};
  } else {
    throw new Error(`Unsupported document type: ${documentType}`);
  }
  
  // Get branding
  const { data: branding } = await supabaseClient
    .from('organization_branding')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();
  
  const brandingData: Branding = branding || {};
  
  // Get template
  let template: Record<string, unknown> = {};
  if (templateId) {
    const { data } = await supabaseClient
      .from('document_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    template = (data as Record<string, unknown>) || {};
  } else {
    // Get default template
    const { data } = await supabaseClient
      .from('document_templates')
      .select('*')
      .eq('document_type', documentType)
      .eq('is_default', true)
      .or(`organization_id.is.null,organization_id.eq.${organizationId}`)
      .order('organization_id', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    template = (data as Record<string, unknown>) || {};
  }
  
  // Create PDF
  const pageWidth = format === 'A4' ? 210 : 215.9;
  const pageHeight = format === 'A4' ? 297 : 279.4;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: format === 'A4' ? 'a4' : 'letter',
  });
  
  // Generate based on document type
  if (documentType === 'invoice' || documentType === 'quote') {
    const docTitle = documentType === 'invoice' 
      ? (lang === 'es' ? 'FACTURA' : 'INVOICE')
      : (lang === 'es' ? 'PRESUPUESTO' : 'QUOTE');
    
    const docNumber = String(document.invoice_number || document.quote_number || document.reference || '');
    const docDate = String(document.issue_date || document.created_at || new Date().toISOString());
    
    let y = renderHeader(doc, brandingData, docTitle, docNumber, docDate, pageWidth);
    
    y = renderClientSection(doc, client, y, pageWidth);
    
    y += professionalStyles.spacing.lg;
    
    // Map line items
    const mappedItems = lineItems.map(item => ({
      description: item.description || item.concept || '',
      quantity: item.quantity || 1,
      unit_price: Number(item.unit_price) || 0,
      total: Number(item.total) || (Number(item.quantity) || 1) * (Number(item.unit_price) || 0),
    }));
    
    y = renderLineItemsTable(doc, mappedItems, y, pageWidth, brandingData);
    
    // Calculate totals
    const subtotal = Number(document.subtotal) || mappedItems.reduce((sum, i) => sum + i.total, 0);
    const taxRate = Number(document.tax_rate) || 21;
    const taxAmount = Number(document.tax_amount) || subtotal * (taxRate / 100);
    const total = Number(document.total) || subtotal + taxAmount;
    
    y = renderTotals(doc, { subtotal, taxRate, taxAmount, total }, y, pageWidth, brandingData);
    
    renderPaymentInfo(doc, brandingData, y, pageWidth);
    renderFooter(doc, brandingData, pageWidth, pageHeight);
    
  } else if (documentType === 'certificate') {
    const certData = {
      ...document,
      mark_name: document.mark_name || document.title,
      registration_number: document.registration_number || document.reference,
      client_name: client.name || '',
    };
    renderCertificate(doc, certData, brandingData, template, pageWidth, pageHeight);
    
  } else if (documentType === 'letter') {
    const letterData = {
      ...document,
      recipient_name: client.name || '',
      recipient_company: client.company_name || '',
      recipient_address: client.address || '',
      date: document.created_at || new Date().toISOString(),
    };
    renderLetter(doc, letterData, brandingData, pageWidth);
  }
  
  // Generate output
  const pdfBase64 = doc.output('datauristring');
  const pdfBlob = doc.output('blob');
  
  // Upload to storage
  const fileName = `${organizationId}/${documentType}s/${documentId}_${Date.now()}.pdf`;
  
  const { error: uploadError } = await supabaseClient.storage
    .from('documents')
    .upload(fileName, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });
  
  if (uploadError) {
    console.error('Upload error:', uploadError);
    // Return base64 even if upload fails
    return { pdfUrl: '', pdfBase64 };
  }
  
  const { data: { publicUrl } } = supabaseClient.storage
    .from('documents')
    .getPublicUrl(fileName);
  
  return { pdfUrl: publicUrl, pdfBase64 };
}

// ============================================================
// MAIN HANDLER
// ============================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const input: GeneratePdfRequest = await req.json();
    
    if (!input.documentType || !input.documentId) {
      return new Response(
        JSON.stringify({ error: 'documentType and documentId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const result = await generateDocumentPdf(supabase, input);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (err) {
    console.error('Error generating PDF:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate PDF';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
