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
  | 'partial' | 'overdue' | 'cancelled' | 'refunded';

export interface Invoice {
  id: string;
  organization_id: string;
  invoice_number: string;
  invoice_series?: string;
  billing_client_id: string;
  client_name: string;
  client_tax_id?: string;
  client_address?: string;
  invoice_date: string;
  due_date?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  paid_amount: number;
  paid_date?: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  internal_notes?: string;
  footer_text?: string;
  pdf_url?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  sent_at?: string;
  // Relaciones
  billing_client?: BillingClient;
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
  notes?: string;
  created_at?: string;
  // Relaciones
  matter?: Matter;
  matter_cost?: MatterCost;
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
