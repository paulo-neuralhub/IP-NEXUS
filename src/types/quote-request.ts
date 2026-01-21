// =====================================================
// QUOTE REQUEST TYPES (RFQ System)
// =====================================================

import { MarketUser } from './market-users';

export type ServiceCategory = 
  | 'trademark'
  | 'patent'
  | 'design'
  | 'copyright'
  | 'domain'
  | 'litigation'
  | 'licensing'
  | 'valuation'
  | 'general';

export type ServiceType =
  // Marcas
  | 'tm_search'
  | 'tm_registration'
  | 'tm_renewal'
  | 'tm_opposition'
  | 'tm_cancellation'
  | 'tm_watch'
  | 'tm_portfolio_audit'
  // Patentes
  | 'pt_search'
  | 'pt_drafting'
  | 'pt_filing'
  | 'pt_prosecution'
  | 'pt_maintenance'
  | 'pt_freedom_to_operate'
  | 'pt_landscape'
  // Diseños
  | 'ds_registration'
  | 'ds_renewal'
  // Otros
  | 'litigation_infringement'
  | 'litigation_defense'
  | 'licensing_negotiation'
  | 'licensing_audit'
  | 'valuation_single'
  | 'valuation_portfolio'
  | 'general_consultation'
  | 'other';

export type RequestStatus = 'draft' | 'open' | 'evaluating' | 'awarded' | 'cancelled' | 'expired';
export type QuoteStatus = 'draft' | 'submitted' | 'viewed' | 'shortlisted' | 'awarded' | 'rejected' | 'withdrawn';
export type Urgency = 'urgent' | 'normal' | 'flexible';
export type PaymentTerms = 'upfront' | 'milestone' | 'completion' | 'split';
export type InvitationType = 'auto' | 'manual' | 'referral';
export type InvitationStatus = 'pending' | 'viewed' | 'accepted' | 'declined' | 'expired';

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface QuoteQuestion {
  id: string;
  from: 'agent' | 'requester';
  text: string;
  answer?: string;
  asked_at: string;
  answered_at?: string;
}

export interface RfqRequest {
  id: string;
  reference_number: string;
  requester_id: string;
  organization_id?: string;
  
  service_category: ServiceCategory;
  service_type: ServiceType;
  title: string;
  description: string;
  
  jurisdictions: string[];
  nice_classes?: number[];
  locarno_classes?: string[];
  details?: Record<string, any>;
  
  budget_min?: number;
  budget_max?: number;
  budget_currency: string;
  budget_type: 'total' | 'per_jurisdiction' | 'hourly';
  
  urgency: Urgency;
  deadline_response?: string;
  deadline_completion?: string;
  
  is_blind: boolean;
  max_quotes: number;
  auto_match: boolean;
  allow_counter_questions: boolean;
  invited_agent_ids: string[];
  requirements?: {
    min_rating?: number;
    min_reputation?: number;
    verified_only?: boolean;
    languages?: string[];
    experience_years?: number;
  };
  
  attachments: Attachment[];
  
  status: RequestStatus;
  awarded_quote_id?: string;
  awarded_at?: string;
  transaction_id?: string;
  
  views_count: number;
  quotes_received: number;
  
  published_at?: string;
  closes_at?: string;
  created_at: string;
  updated_at: string;
  
  // Joined
  requester?: MarketUser;
  quotes?: RfqQuote[];
}

export interface RfqQuote {
  id: string;
  reference_number: string;
  request_id: string;
  agent_id: string;
  
  total_price: number;
  currency: string;
  price_breakdown: {
    official_fees?: number;
    professional_fees?: number;
    search_fees?: number;
    translation?: number;
    other?: number;
    discount?: number;
    notes?: string;
  };
  price_per_jurisdiction?: Record<string, { official: number; professional: number }>;
  
  payment_terms: PaymentTerms;
  payment_milestones?: { description: string; percentage: number }[];
  
  estimated_duration_days: number;
  estimated_start_date?: string;
  
  proposal_summary: string;
  proposal_detail?: string;
  methodology?: string;
  relevant_experience?: string;
  similar_cases_count?: number;
  
  deliverables: { item: string; format: string }[];
  guarantees?: string;
  
  attachments: Attachment[];
  questions: QuoteQuestion[];
  
  status: QuoteStatus;
  submitted_at?: string;
  viewed_at?: string;
  shortlisted_at?: string;
  awarded_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  
  valid_until?: string;
  
  created_at: string;
  updated_at: string;
  
  // Joined
  agent?: MarketUser;
  request?: RfqRequest;
}

export interface RfqInvitation {
  id: string;
  request_id: string;
  agent_id: string;
  invitation_type: InvitationType;
  match_score?: number;
  match_reasons?: Record<string, number>;
  status: InvitationStatus;
  decline_reason?: string;
  sent_at: string;
  viewed_at?: string;
  responded_at?: string;
  expires_at?: string;
  email_sent: boolean;
  push_sent: boolean;
  created_at: string;
  
  // Joined
  request?: RfqRequest;
  agent?: MarketUser;
}

// =====================================================
// CONSTANTS
// =====================================================

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, { en: string; es: string; icon: string }> = {
  trademark: { en: 'Trademarks', es: 'Marcas', icon: 'Tag' },
  patent: { en: 'Patents', es: 'Patentes', icon: 'FileText' },
  design: { en: 'Designs', es: 'Diseños', icon: 'PenTool' },
  copyright: { en: 'Copyright', es: 'Derechos de Autor', icon: 'Copyright' },
  domain: { en: 'Domains', es: 'Dominios', icon: 'Globe' },
  litigation: { en: 'Litigation', es: 'Litigios', icon: 'Gavel' },
  licensing: { en: 'Licensing', es: 'Licencias', icon: 'Key' },
  valuation: { en: 'Valuation', es: 'Valoración', icon: 'DollarSign' },
  general: { en: 'General', es: 'General', icon: 'HelpCircle' },
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, { en: string; es: string; category: ServiceCategory }> = {
  tm_search: { en: 'Trademark Search', es: 'Búsqueda de Marca', category: 'trademark' },
  tm_registration: { en: 'Trademark Registration', es: 'Registro de Marca', category: 'trademark' },
  tm_renewal: { en: 'Trademark Renewal', es: 'Renovación de Marca', category: 'trademark' },
  tm_opposition: { en: 'Trademark Opposition', es: 'Oposición de Marca', category: 'trademark' },
  tm_cancellation: { en: 'Trademark Cancellation', es: 'Cancelación de Marca', category: 'trademark' },
  tm_watch: { en: 'Trademark Watch', es: 'Vigilancia de Marca', category: 'trademark' },
  tm_portfolio_audit: { en: 'Portfolio Audit', es: 'Auditoría de Portfolio', category: 'trademark' },
  pt_search: { en: 'Patent Search', es: 'Búsqueda de Patentes', category: 'patent' },
  pt_drafting: { en: 'Patent Drafting', es: 'Redacción de Patente', category: 'patent' },
  pt_filing: { en: 'Patent Filing', es: 'Presentación de Patente', category: 'patent' },
  pt_prosecution: { en: 'Patent Prosecution', es: 'Tramitación de Patente', category: 'patent' },
  pt_maintenance: { en: 'Patent Maintenance', es: 'Mantenimiento de Patente', category: 'patent' },
  pt_freedom_to_operate: { en: 'Freedom to Operate', es: 'Libertad de Operación', category: 'patent' },
  pt_landscape: { en: 'Patent Landscape', es: 'Landscape de Patentes', category: 'patent' },
  ds_registration: { en: 'Design Registration', es: 'Registro de Diseño', category: 'design' },
  ds_renewal: { en: 'Design Renewal', es: 'Renovación de Diseño', category: 'design' },
  litigation_infringement: { en: 'Infringement Litigation', es: 'Litigio por Infracción', category: 'litigation' },
  litigation_defense: { en: 'Litigation Defense', es: 'Defensa en Litigio', category: 'litigation' },
  licensing_negotiation: { en: 'License Negotiation', es: 'Negociación de Licencia', category: 'licensing' },
  licensing_audit: { en: 'License Audit', es: 'Auditoría de Licencias', category: 'licensing' },
  valuation_single: { en: 'Single Asset Valuation', es: 'Valoración de Activo', category: 'valuation' },
  valuation_portfolio: { en: 'Portfolio Valuation', es: 'Valoración de Portfolio', category: 'valuation' },
  general_consultation: { en: 'General Consultation', es: 'Consulta General', category: 'general' },
  other: { en: 'Other', es: 'Otro', category: 'general' },
};

export const URGENCY_LABELS: Record<Urgency, { en: string; es: string; color: string; bgColor: string }> = {
  urgent: { en: 'Urgent', es: 'Urgente', color: 'text-red-700', bgColor: 'bg-red-100' },
  normal: { en: 'Normal', es: 'Normal', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  flexible: { en: 'Flexible', es: 'Flexible', color: 'text-green-700', bgColor: 'bg-green-100' },
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, { en: string; es: string; color: string; bgColor: string }> = {
  draft: { en: 'Draft', es: 'Borrador', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  open: { en: 'Open', es: 'Abierta', color: 'text-green-700', bgColor: 'bg-green-100' },
  evaluating: { en: 'Evaluating', es: 'En Evaluación', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  awarded: { en: 'Awarded', es: 'Adjudicada', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  cancelled: { en: 'Cancelled', es: 'Cancelada', color: 'text-red-700', bgColor: 'bg-red-100' },
  expired: { en: 'Expired', es: 'Expirada', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, { en: string; es: string; color: string; bgColor: string }> = {
  draft: { en: 'Draft', es: 'Borrador', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  submitted: { en: 'Submitted', es: 'Enviado', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  viewed: { en: 'Viewed', es: 'Visto', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  shortlisted: { en: 'Shortlisted', es: 'Preseleccionado', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  awarded: { en: 'Awarded', es: 'Adjudicado', color: 'text-green-700', bgColor: 'bg-green-100' },
  rejected: { en: 'Rejected', es: 'Rechazado', color: 'text-red-700', bgColor: 'bg-red-100' },
  withdrawn: { en: 'Withdrawn', es: 'Retirado', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, { en: string; es: string }> = {
  upfront: { en: '100% Upfront', es: '100% Adelantado' },
  milestone: { en: 'By Milestones', es: 'Por Hitos' },
  completion: { en: 'On Completion', es: 'Al Finalizar' },
  split: { en: '50/50 Split', es: '50/50' },
};

export const JURISDICTIONS = [
  { code: 'ES', name: 'España' },
  { code: 'EU', name: 'Unión Europea (EUIPO)' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'DE', name: 'Alemania' },
  { code: 'FR', name: 'Francia' },
  { code: 'IT', name: 'Italia' },
  { code: 'PT', name: 'Portugal' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japón' },
  { code: 'KR', name: 'Corea del Sur' },
  { code: 'BR', name: 'Brasil' },
  { code: 'MX', name: 'México' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'WIPO', name: 'OMPI (Madrid)' },
  { code: 'PCT', name: 'PCT (Patentes)' },
] as const;

export function getServiceTypesByCategory(category: ServiceCategory): { value: ServiceType; label: string }[] {
  return Object.entries(SERVICE_TYPE_LABELS)
    .filter(([_, config]) => config.category === category)
    .map(([key, config]) => ({ value: key as ServiceType, label: config.es }));
}
