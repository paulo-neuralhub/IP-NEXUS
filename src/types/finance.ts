import type { Matter } from './matters';
import type { Contact } from './crm';

// ===== TARIFAS =====
export interface OfficialFee {
  id: string;
  code: string;
  name: string;
  description?: string;
  office: string;
  ip_type: 'trademark' | 'patent' | 'design' | 'domain' | 'copyright';
  fee_type: FeeType;
  amount: number;
  currency: string;
  per_class: boolean;
  base_classes: number;
  extra_class_fee?: number;
  effective_from: string;
  effective_until?: string;
  is_current: boolean;
  notes?: string;
  source_url?: string;
}

export type FeeType = 
  | 'filing' | 'examination' | 'publication' | 'registration'
  | 'renewal' | 'opposition' | 'appeal' | 'annuity'
  | 'restoration' | 'assignment' | 'license' | 'other';

export interface ServiceFee {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description?: string;
  category: ServiceFeeCategory;
  ip_type?: string;
  amount: number;
  currency: string;
  fee_model: 'fixed' | 'hourly' | 'percentage' | 'per_class' | 'tiered';
  hourly_rate?: number;
  estimated_hours?: number;
  percentage_rate?: number;
  percentage_base?: string;
  per_class_fee?: number;
  base_classes?: number;
  is_active: boolean;
}

export type ServiceFeeCategory = 
  | 'filing' | 'prosecution' | 'renewal' | 'opposition'
  | 'litigation' | 'advisory' | 'search' | 'watch'
  | 'valuation' | 'other';

// ===== COSTES =====
export type CostType = 'official_fee' | 'service_fee' | 'third_party' | 'translation' | 'other';
export type CostStatus = 'pending' | 'paid' | 'invoiced' | 'cancelled';

export interface MatterCost {
  id: string;
  organization_id: string;
  matter_id: string;
  cost_type: CostType;
  official_fee_id?: string;
  service_fee_id?: string;
  description: string;
  notes?: string;
  amount: number;
  currency: string;
  exchange_rate?: number;
  amount_local?: number;
  quantity: number;
  total_amount: number;
  status: CostStatus;
  cost_date: string;
  due_date?: string;
  paid_date?: string;
  is_billable: boolean;
  invoice_id?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  // Relaciones
  matter?: Matter;
  official_fee?: OfficialFee;
  service_fee?: ServiceFee;
}

// ===== CLIENTES FACTURACIÓN =====
export interface BillingClient {
  id: string;
  organization_id: string;
  contact_id?: string;
  legal_name: string;
  tax_id?: string;
  tax_id_type?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postal_code?: string;
  billing_country: string;
  billing_email?: string;
  billing_phone?: string;
  default_currency: string;
  payment_terms: number;
  tax_exempt: boolean;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Relaciones
  contact?: Contact;
}

// ===== FACTURAS =====
export type InvoiceStatus = 
  | 'draft' | 'sent' | 'viewed' | 'paid' 
  | 'partial' | 'overdue' | 'cancelled' | 'refunded' | 'rectified';

export type InvoiceType = 'FC' | 'FA' | 'FR' | 'NC';

export interface VatBreakdownItem {
  rate: number;
  base: number;
  amount: number;
  surcharge?: number;
  withholding?: number;
}

export interface Invoice {
  id: string;
  organization_id: string;
  invoice_number: string;
  invoice_series?: string;
  
  // Tipo de factura (Facturae)
  invoice_type?: InvoiceType;
  
  // Rectificativa
  corrected_invoice_id?: string;
  correction_reason?: string;
  correction_description?: string;
  
  billing_client_id: string;
  client_name: string;
  client_tax_id?: string;
  client_address?: string;
  invoice_date: string;
  due_date?: string;
  
  // Fecha devengo y período
  tax_point_date?: string;
  period_start?: string;
  period_end?: string;
  
  // Importes
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  
  // IVA desglosado (stored as JSON in DB)
  vat_breakdown?: VatBreakdownItem[] | unknown;
  total_surcharge?: number;
  total_withholding?: number;
  withholding_percent?: number;
  
  total: number;
  currency: string;
  status: InvoiceStatus;
  paid_amount: number;
  paid_date?: string;
  
  // Método de pago (Facturae)
  payment_method?: string;
  payment_method_code?: string;
  payment_reference?: string;
  bank_account?: string;
  
  notes?: string;
  internal_notes?: string;
  footer_text?: string;
  pdf_url?: string;
  
  // === SII (AEAT) ===
  sii_status?: string;
  sii_csv?: string;
  sii_sent_at?: string;
  sii_response?: unknown;
  sii_registration_key?: string;
  
  // === TicketBAI (País Vasco) ===
  tbai_status?: string;
  tbai_identifier?: string;
  tbai_qr_url?: string;
  tbai_signature?: string;
  tbai_sent_at?: string;
  tbai_chain_hash?: string;
  
  // === VERI*FACTU (2025) ===
  verifactu_status?: string;
  verifactu_id?: string;
  verifactu_qr?: string;
  verifactu_hash?: string;
  verifactu_sent_at?: string;
  
  // === Facturae XML ===
  facturae_xml?: string;
  facturae_signed?: boolean;
  facturae_certificate_id?: string;
  
  // Envío y tracking
  sent_at?: string;
  sent_to_email?: string;
  viewed_at?: string;
  
  created_by?: string;
  created_at: string;
  updated_at?: string;
  
  // Relaciones (parciales para queries)
  billing_client?: Partial<BillingClient> & { id: string; legal_name: string };
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  line_number: number;
  matter_cost_id?: string;
  matter_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  
  // Recargo equivalencia
  surcharge_rate?: number;
  surcharge_amount?: number;
  
  // Código producto/servicio (Facturae)
  item_code?: string;
  
  // Total línea
  total?: number;
  
  // Referencias adicionales
  time_entry_id?: string;
  expense_id?: string;
  
  notes?: string;
  created_at?: string;
  
  // Relaciones (parciales para queries)
  matter?: Partial<Matter> & { id: string; reference?: string; title?: string };
  matter_cost?: Partial<MatterCost>;
}

// ===== PRESUPUESTOS =====
export type QuoteStatus = 
  | 'draft' | 'sent' | 'viewed' | 'accepted' 
  | 'rejected' | 'expired' | 'converted';

export interface Quote {
  id: string;
  organization_id: string;
  quote_number: string;
  billing_client_id?: string;
  contact_id?: string;
  deal_id?: string;
  client_name: string;
  client_email?: string;
  quote_date: string;
  valid_until?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  status: QuoteStatus;
  converted_invoice_id?: string;
  converted_at?: string;
  introduction?: string;
  terms?: string;
  notes?: string;
  pdf_url?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  sent_at?: string;
  accepted_at?: string;
  // Relaciones
  items?: QuoteItem[];
  billing_client?: BillingClient;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  subtotal: number;
  service_fee_id?: string;
  official_fee_id?: string;
  notes?: string;
  created_at?: string;
}

// ===== RENOVACIONES =====
export type RenewalType = 'trademark_renewal' | 'patent_annuity' | 'design_renewal' | 'domain_renewal';
export type RenewalStatus = 
  | 'upcoming' | 'due' | 'in_grace' | 'instructed' 
  | 'processing' | 'completed' | 'abandoned' | 'missed';
export type ClientInstruction = 'renew' | 'abandon' | 'pending';

export interface RenewalSchedule {
  id: string;
  organization_id: string;
  matter_id: string;
  renewal_type: RenewalType;
  due_date: string;
  grace_period_end?: string;
  official_fee_estimate?: number;
  service_fee_estimate?: number;
  total_estimate?: number;
  currency: string;
  status: RenewalStatus;
  client_instruction?: ClientInstruction;
  instruction_date?: string;
  instruction_by?: string;
  matter_cost_id?: string;
  reminders_sent: ReminderSent[];
  created_at?: string;
  updated_at?: string;
  // Relaciones
  matter?: Matter;
}

export interface ReminderSent {
  type: string;
  sent_at: string;
  to: string;
}

// ===== PAGOS (Stripe) =====
export type PaymentLinkStatus = 'active' | 'completed' | 'expired' | 'cancelled';

export interface PaymentLink {
  id: string;
  organization_id: string;
  invoice_id: string;
  stripe_payment_link_id?: string | null;
  stripe_checkout_session_id?: string | null;
  stripe_url?: string | null;
  amount: number;
  currency: string;
  status: PaymentLinkStatus;
  expires_at?: string | null;
  qr_code_url?: string | null;
  created_at: string;
  completed_at?: string | null;
}

export interface InvoicePayment {
  id: string;
  organization_id: string;
  invoice_id: string;
  payment_link_id?: string | null;
  amount: number;
  currency: string;
  method?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  paid_at?: string | null;
  created_at: string;
}

// ===== VALORACIÓN =====
export interface PortfolioValuation {
  id: string;
  organization_id: string;
  valuation_date: string;
  total_matters: number;
  total_value: number;
  currency: string;
  breakdown_by_type: Record<string, { count: number; value: number }>;
  breakdown_by_jurisdiction: Record<string, { count: number; value: number }>;
  breakdown_by_status: Record<string, { count: number; value: number }>;
  methodology?: string;
  assumptions?: string;
  notes?: string;
  report_url?: string;
  created_by?: string;
  created_at: string;
}

export interface MatterValuation {
  id: string;
  portfolio_valuation_id?: string;
  matter_id: string;
  estimated_value?: number;
  currency: string;
  factors: Record<string, unknown>;
  methodology?: string;
  calculation_notes?: string;
  created_at?: string;
  // Relaciones
  matter?: Matter;
}

// ===== FILTROS =====
export interface CostFilters {
  matter_id?: string;
  status?: CostStatus | CostStatus[];
  cost_type?: CostType | CostType[];
  is_billable?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus | InvoiceStatus[];
  billing_client_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface RenewalFilters {
  status?: RenewalStatus | RenewalStatus[];
  renewal_type?: RenewalType | RenewalType[];
  due_before?: string;
  due_after?: string;
}

// ===== DASHBOARD STATS =====
export interface FinanceStats {
  total_revenue: number;
  total_pending: number;
  invoices_count: number;
  overdue_count: number;
  upcoming_renewals: number;
  portfolio_value?: number;
}

// ===== CONFIGURACIÓN FISCAL =====
export type VatRegime = 'general' | 'simplified' | 'surcharge' | 'exempt' | 'oss';
export type TaxIdType = 'NIF' | 'CIF' | 'NIE' | 'VAT' | 'OTHER';
export type TbaiTerritory = 'BI' | 'SS' | 'VI';

export interface FiscalSettings {
  id: string;
  organization_id: string;
  
  // Datos fiscales
  tax_id: string;
  tax_id_type: TaxIdType;
  legal_name: string;
  trade_name?: string;
  
  // Dirección fiscal
  address_line1?: string;
  address_line2?: string;
  postal_code?: string;
  city?: string;
  province?: string;
  country_code: string;
  
  // Configuración IVA
  vat_regime: VatRegime;
  default_vat_rate: number;
  applies_surcharge: boolean;
  default_withholding: number;
  
  // Formatos numeración
  invoice_number_format?: string;
  quote_number_format?: string;
  
  // === SII ===
  sii_enabled: boolean;
  sii_test_mode: boolean;
  sii_certificate_id?: string;
  
  // === TicketBAI ===
  tbai_enabled: boolean;
  tbai_territory?: TbaiTerritory;
  tbai_license_key?: string;
  tbai_software_name?: string;
  tbai_software_version?: string;
  
  // === VERI*FACTU ===
  verifactu_enabled: boolean;
  verifactu_certificate_id?: string;
  
  // Certificado digital
  certificate_data?: string;
  certificate_password_encrypted?: string;
  certificate_expires_at?: string;
  certificate_subject?: string;
  
  // Cuenta bancaria por defecto
  default_bank_account?: string;
  default_bank_name?: string;
  default_bank_bic?: string;
  
  // Textos legales
  invoice_footer?: string;
  invoice_notes?: string;
  dpd_clause?: string;
  
  created_at: string;
  updated_at: string;
}

// ===== SERIES DE FACTURACIÓN =====
export interface InvoiceSeries {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description?: string;
  
  // Numeración
  current_number: number;
  prefix?: string;
  suffix?: string;
  
  // Tipo de documentos
  for_invoices: boolean;
  for_quotes: boolean;
  for_credit_notes: boolean;
  for_proforma: boolean;
  
  // Año fiscal
  fiscal_year: number;
  reset_yearly: boolean;
  
  // Estado
  is_default: boolean;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

// ===== ENVÍOS REGULATORIOS =====
export type SubmissionType = 'sii' | 'tbai' | 'verifactu' | 'facturae';
export type SubmissionOperation = 'alta' | 'modificacion' | 'anulacion';
export type SubmissionStatus = 'pending' | 'sent' | 'accepted' | 'rejected' | 'error' | 'cancelled';

export interface RegulatorySubmission {
  id: string;
  organization_id: string;
  invoice_id: string;
  
  submission_type: SubmissionType;
  operation: SubmissionOperation;
  status: SubmissionStatus;
  
  // Request/Response
  request_xml?: string;
  request_json?: unknown;
  response_xml?: string;
  response_json?: unknown;
  
  // Identificadores
  csv_code?: string;
  registration_id?: string;
  
  // Error
  error_code?: string;
  error_message?: string;
  
  // Fechas
  sent_at?: string;
  response_at?: string;
  
  // Reintentos
  retry_count: number;
  next_retry_at?: string;
  
  created_at: string;
}

// ===== CÓDIGOS FACTURAE =====
export interface PaymentMethodCode {
  code: string;
  name_es: string;
  name_en: string;
}

export interface CorrectionReasonCode {
  code: string;
  name_es: string;
}
