// ============================================================
// IP-NEXUS - DOCUMENT VARIABLE RESOLVER
// PROMPT 23: Resolve variables from matter, client, tenant data
// ============================================================

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface MatterData {
  id: string;
  reference?: string;
  title?: string;
  denomination?: string;
  type?: string;
  jurisdiction?: string;
  office_code?: string;
  classes?: number[];
  status?: string;
  current_phase?: string;
  filing_date?: string;
  registration_number?: string;
  [key: string]: unknown;
}

export interface ClientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  is_company?: boolean;
  representative_name?: string;
  representative_title?: string;
  [key: string]: unknown;
}

export interface TenantData {
  id: string;
  name: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  logo_url?: string;
  representative_name?: string;
  [key: string]: unknown;
}

export interface QuoteData {
  id?: string;
  number?: string;
  date?: string;
  items?: Array<{
    description: string;
    quantity?: number;
    amount: number;
  }>;
  subtotal?: number;
  tax_rate?: number;
  vat?: number;
  total?: number;
  total_with_vat?: number;
  validity_days?: number;
  expiry_date?: string;
  terms?: string;
  acceptance_url?: string;
  [key: string]: unknown;
}

export interface VariableContext {
  matter?: MatterData;
  client?: ClientData;
  tenant?: TenantData;
  quote?: QuoteData;
  input?: Record<string, unknown>;
}

// =====================================================
// TYPE LABELS
// =====================================================

const MATTER_TYPE_LABELS: Record<string, string> = {
  trademark: 'Marca',
  patent: 'Patente',
  design: 'Diseño',
  utility_model: 'Modelo de Utilidad',
  copyright: 'Derecho de Autor',
  trade_secret: 'Secreto Comercial',
};

const JURISDICTION_LABELS: Record<string, string> = {
  ES: 'España',
  EU: 'Unión Europea',
  US: 'Estados Unidos',
  PCT: 'Internacional (PCT)',
  WIPO: 'OMPI',
  DE: 'Alemania',
  FR: 'Francia',
  GB: 'Reino Unido',
  CN: 'China',
  JP: 'Japón',
};

// =====================================================
// RESOLVE ALL VARIABLES
// =====================================================

export function resolveVariables(context: VariableContext): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};

  // System variables
  resolved['current_date'] = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });
  resolved['current_date_short'] = format(new Date(), 'dd/MM/yyyy');
  resolved['current_year'] = new Date().getFullYear();

  // Tenant variables
  if (context.tenant) {
    resolved['tenant.name'] = context.tenant.name;
    resolved['tenant.legal_name'] = context.tenant.legal_name || context.tenant.name;
    resolved['tenant.email'] = context.tenant.email || '';
    resolved['tenant.phone'] = context.tenant.phone || '';
    resolved['tenant.address'] = context.tenant.address || '';
    resolved['tenant.city'] = context.tenant.city || '';
    resolved['tenant.country'] = context.tenant.country || 'España';
    resolved['tenant.tax_id'] = context.tenant.tax_id || '';
    resolved['tenant.logo_url'] = context.tenant.logo_url || '';
    resolved['tenant.representative_name'] = context.tenant.representative_name || '';
  }

  // Client variables
  if (context.client) {
    resolved['client.name'] = context.client.name;
    resolved['client.email'] = context.client.email || '';
    resolved['client.phone'] = context.client.phone || '';
    resolved['client.address'] = context.client.address || '';
    resolved['client.city'] = context.client.city || '';
    resolved['client.postal_code'] = context.client.postal_code || '';
    resolved['client.country'] = context.client.country || 'España';
    resolved['client.tax_id'] = context.client.tax_id || '';
    resolved['client.is_company'] = context.client.is_company || false;
    resolved['client.representative_name'] = context.client.representative_name || '';
    resolved['client.representative_title'] = context.client.representative_title || '';
  }

  // Matter variables
  if (context.matter) {
    resolved['matter.reference'] = context.matter.reference || '';
    resolved['matter.title'] = context.matter.title || context.matter.denomination || '';
    resolved['matter.denomination'] = context.matter.denomination || '';
    resolved['matter.type'] = context.matter.type || '';
    resolved['matter.type_label'] = MATTER_TYPE_LABELS[context.matter.type || ''] || context.matter.type || '';
    resolved['matter.jurisdiction'] = context.matter.jurisdiction || '';
    resolved['matter.jurisdiction_label'] = JURISDICTION_LABELS[context.matter.jurisdiction || ''] || context.matter.jurisdiction || '';
    resolved['matter.office_code'] = context.matter.office_code || '';
    resolved['matter.classes'] = context.matter.classes || [];
    resolved['matter.classes_list'] = (context.matter.classes || []).join(', ');
    resolved['matter.status'] = context.matter.status || '';
    resolved['matter.current_phase'] = context.matter.current_phase || '';
    resolved['matter.filing_date'] = context.matter.filing_date 
      ? format(new Date(context.matter.filing_date), 'dd/MM/yyyy')
      : '';
    resolved['matter.registration_number'] = context.matter.registration_number || '';
  }

  // Quote variables
  if (context.quote) {
    resolved['quote.number'] = context.quote.number || '';
    resolved['quote.date'] = context.quote.date 
      ? format(new Date(context.quote.date), 'dd/MM/yyyy')
      : format(new Date(), 'dd/MM/yyyy');
    resolved['quote.items'] = context.quote.items || [];
    resolved['quote.subtotal'] = formatCurrency(context.quote.subtotal || 0);
    resolved['quote.vat'] = formatCurrency(context.quote.vat || 0);
    resolved['quote.total'] = formatCurrency(context.quote.total || 0);
    resolved['quote.total_with_vat'] = formatCurrency(context.quote.total_with_vat || 0);
    resolved['quote.validity_days'] = context.quote.validity_days || 30;
    resolved['quote.expiry_date'] = context.quote.expiry_date || '';
    resolved['quote.terms'] = context.quote.terms || 'Pago a 30 días. Honorarios exentos de IVA según Art. 20.1.18 LIVA.';
    resolved['quote.acceptance_url'] = context.quote.acceptance_url || '#';
  }

  // Input variables (user-provided)
  if (context.input) {
    Object.entries(context.input).forEach(([key, value]) => {
      resolved[key] = value;
      resolved[`input.${key}`] = value;
    });
  }

  return resolved;
}

// =====================================================
// FORMAT CURRENCY
// =====================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// =====================================================
// MERGE TEMPLATE WITH VARIABLES
// =====================================================

export function mergeTemplate(templateContent: string, variables: Record<string, unknown>): string {
  let content = templateContent;

  // Process conditionals first
  content = processConditionals(content, variables);

  // Process loops
  content = processLoops(content, variables);

  // Replace simple variables {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, 'g');
    content = content.replace(regex, formatValue(value));
  });

  // Clean up unreplaced variables
  content = content.replace(/\{\{[^}]+\}\}/g, '');

  return content;
}

// =====================================================
// PROCESS CONDITIONALS
// =====================================================

function processConditionals(content: string, variables: Record<string, unknown>): string {
  // {{#if condition}}...{{else}}...{{/if}} or {{#if condition}}...{{/if}}
  const ifElseRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
  const ifOnlyRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

  // Process if-else first
  content = content.replace(ifElseRegex, (match, condition, ifContent, elseContent) => {
    const value = getNestedValue(variables, condition.trim());
    return isTruthy(value) ? ifContent : elseContent;
  });

  // Then process simple if
  content = content.replace(ifOnlyRegex, (match, condition, inner) => {
    const value = getNestedValue(variables, condition.trim());
    return isTruthy(value) ? inner : '';
  });

  return content;
}

// =====================================================
// PROCESS LOOPS
// =====================================================

function processLoops(content: string, variables: Record<string, unknown>): string {
  const eachRegex = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

  return content.replace(eachRegex, (match, arrayKey, inner) => {
    const array = getNestedValue(variables, arrayKey.trim());
    if (!Array.isArray(array)) return '';

    return array.map((item, index) => {
      let itemContent = inner;

      // Replace this.property references
      if (typeof item === 'object' && item !== null) {
        Object.entries(item as Record<string, unknown>).forEach(([key, value]) => {
          const regex = new RegExp(`\\{\\{this\\.${escapeRegex(key)}\\}\\}`, 'g');
          itemContent = itemContent.replace(regex, formatValue(value));
        });
      }

      // Replace {{@index}} and {{@first}} {{@last}}
      itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));
      itemContent = itemContent.replace(/\{\{@first\}\}/g, String(index === 0));
      itemContent = itemContent.replace(/\{\{@last\}\}/g, String(index === array.length - 1));

      return itemContent;
    }).join('');
  });
}

// =====================================================
// HELPERS
// =====================================================

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function isTruthy(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (value instanceof Date) return format(value, 'dd/MM/yyyy');
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
