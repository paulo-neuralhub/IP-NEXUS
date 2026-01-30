// ============================================================
// Document Demo Data Generator
// Combines real tenant data with demo placeholders
// ============================================================

import { TenantDocumentSettings, DocumentVariables } from '@/types/documents';

interface CompanyInfo {
  name?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  cif?: string;
}

interface BankInfo {
  name?: string;
  iban?: string;
  swift?: string;
  accountHolder?: string;
}

/**
 * Generates demo variables combining real tenant data with example data
 * for variables that don't exist
 */
export function generateDemoVariables(
  tenantSettings: TenantDocumentSettings | null,
  matterData?: Record<string, unknown>,
  clientData?: Record<string, unknown>
): DocumentVariables {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Real tenant data (or demo fallbacks)
  const companyData: CompanyInfo = tenantSettings?.companyInfo || {};
  const bankData: BankInfo = tenantSettings?.bankInfo || {};

  return {
    // === COMPANY DATA (real from tenant or demo) ===
    company_name: companyData.name || 'González & Asociados IP',
    company_address: companyData.address || 'Calle Serrano 123, 4º Izq.',
    company_city: companyData.city || 'Madrid',
    company_postal_code: companyData.postalCode || '28006',
    company_country: companyData.country || 'España',
    company_phone: companyData.phone || '+34 912 345 678',
    company_email: companyData.email || 'info@gonzalezasociados.com',
    company_website: companyData.website || 'www.gonzalezasociados.com',
    company_cif: companyData.cif || 'B-12345678',

    // === BANK DATA (real from tenant or demo) ===
    bank_name: bankData.name || 'Banco Santander',
    bank_iban: bankData.iban || 'ES12 0049 1234 5678 9012 3456',
    bank_swift: bankData.swift || 'BSCHESMMXXX',
    bank_account_holder: bankData.accountHolder || companyData.name || 'González & Asociados IP',

    // === CLIENT DATA (real if exists or demo) ===
    client_name: (clientData?.name as string) || (clientData?.full_name as string) || 'María García López',
    client_company: (clientData?.company_name as string) || 'Tecnologías Innovadoras, S.L.',
    client_address: (clientData?.address as string) || 'Paseo de la Castellana 200',
    client_city: (clientData?.city as string) || 'Madrid',
    client_postal_code: (clientData?.postal_code as string) || '28046',
    client_phone: (clientData?.phone as string) || '+34 666 123 456',
    client_email: (clientData?.email as string) || 'mgarcia@tecinnova.es',
    client_cif: (clientData?.tax_id as string) || (clientData?.cif as string) || 'B-87654321',

    // === MATTER DATA (real if exists or demo) ===
    matter_ref: (matterData?.reference as string) || (matterData?.matter_number as string) || 'EXP-2026-00123',
    matter_title: (matterData?.title as string) || 'Registro de marca INNOVATECH',
    matter_type: (matterData?.type as string) || (matterData?.matter_type as string) || 'Marca',
    trademark_name: (matterData?.trademark_name as string) || (matterData?.mark_name as string) || 'INNOVATECH',
    trademark_classes: Array.isArray(matterData?.nice_classes) 
      ? (matterData.nice_classes as string[]).join(', ') 
      : (matterData?.nice_classes as string) || '9, 35, 42',
    filing_date: (matterData?.filing_date as string) || '15/01/2026',
    filing_number: (matterData?.filing_number as string) || (matterData?.application_number as string) || 'M-4123456',
    registration_date: (matterData?.registration_date as string) || '15/07/2026',
    registration_number: (matterData?.registration_number as string) || '4123456',
    jurisdiction: (matterData?.jurisdiction as string) || 'España',
    office: (matterData?.office as string) || 'OEPM',

    // === DOCUMENT DATA ===
    document_date: formattedDate,
    current_date: formattedDate,
    current_year: today.getFullYear().toString(),

    // === BILLING DATA (demo) ===
    invoice_subtotal: '1.500,00',
    invoice_tax_rate: (tenantSettings?.invoiceSettings?.taxRate || 21).toString(),
    invoice_tax_amount: '315,00',
    invoice_total: '1.815,00',
    payment_terms: tenantSettings?.invoiceSettings?.paymentTerms || '30 días desde la fecha de factura',
  };
}

/**
 * Replaces all {{variable}} placeholders in HTML with actual values
 */
export function replaceVariables(html: string, variables: DocumentVariables): string {
  let result = html;
  
  Object.entries(variables).forEach(([key, value]) => {
    if (value) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, String(value));
    }
  });
  
  // Clean up any remaining unmatched variables with a placeholder style
  result = result.replace(/\{\{([^}]+)\}\}/g, '<span class="text-muted-foreground">[[$1]]</span>');
  
  return result;
}

/**
 * Extracts variable names from template HTML
 */
export function extractVariableNames(html: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = html.matchAll(regex);
  const variables = new Set<string>();
  
  for (const match of matches) {
    variables.add(match[1]);
  }
  
  return Array.from(variables);
}
