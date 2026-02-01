// =============================================
// Service Catalog Types - Extended (PROMPT 4)
// =============================================

export type ServiceType = 
  | 'tm_registration'
  | 'tm_renewal'
  | 'tm_search'
  | 'tm_opposition'
  | 'tm_watch'
  | 'pt_filing'
  | 'pt_prosecution'
  | 'pt_maintenance'
  | 'ds_registration'
  | 'ds_renewal'
  | 'domain_registration'
  | 'domain_dispute'
  | 'legal_consulting'
  | 'litigation'
  | 'recordal'
  | 'certification'
  | 'legalization'
  | 'translation'
  | 'administrative'
  // Legacy types for backward compatibility
  | 'marca' 
  | 'patente' 
  | 'diseño' 
  | 'vigilancia' 
  | 'renovacion' 
  | 'oposicion' 
  | 'informe' 
  | 'general';

export type Jurisdiction = 'ES' | 'EU' | 'INT' | 'US' | 'CN' | 'JP' | 'GB' | 'WO' | 'EP' | 'PCT' | 'KR' | 'MX' | 'BR' | null;

export interface ServiceCatalogMetadata {
  duration_estimate?: string;
  includes?: string[];
  requirements?: string[];
}

// ═══════════════════════════════════════════════════════════════
// SERVICE CATEGORY
// ═══════════════════════════════════════════════════════════════

export interface ServiceCategory {
  id: string;
  code: string;
  name_en: string;
  name_es: string;
  description_en: string | null;
  description_es: string | null;
  icon: string;
  color: string;
  parent_id: string | null;
  position: number;
  is_active: boolean;
  right_types: string[];
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════
// SERVICE CATALOG ITEM
// ═══════════════════════════════════════════════════════════════

export interface ServiceCatalogItem {
  id: string;
  organization_id: string;
  category_id: string | null;
  category?: ServiceCategory;
  reference_code: string | null;
  preconfigured_code: string | null;
  name: string;
  description: string | null;
  category_name?: string | null;
  subcategory: string | null;
  service_type: ServiceType | string;
  jurisdiction: Jurisdiction | string | null;
  official_fee: number;
  professional_fee: number;
  base_price: number;
  currency: string;
  tax_rate: number;
  estimated_days: number | null;
  estimated_hours: number | null;
  estimated_duration: string | null;
  nice_classes_included: number;
  extra_class_fee: number;
  display_order: number | null;
  is_active: boolean;
  is_preconfigured: boolean;
  generates_matter: boolean;
  default_matter_type: string | null;
  default_matter_subtype: string | null;
  default_jurisdiction: string | null;
  includes_official_fees: boolean;
  official_fees_note: string | null;
  applicable_offices: string[] | null;
  stripe_price_id: string | null;
  metadata?: ServiceCatalogMetadata | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCatalogFilters {
  service_type?: ServiceType | string | 'all';
  jurisdiction?: Jurisdiction | string | 'all';
  category_id?: string | 'all';
  is_active?: boolean;
  is_preconfigured?: boolean;
  generates_matter?: boolean;
  search?: string;
}

// Reference code prefixes by service type
export const SERVICE_TYPE_PREFIXES: Record<string, string> = {
  tm_registration: 'TM',
  tm_renewal: 'TMR',
  tm_search: 'TMS',
  tm_opposition: 'TMO',
  tm_watch: 'TMW',
  pt_filing: 'PT',
  pt_prosecution: 'PTP',
  pt_maintenance: 'PTM',
  ds_registration: 'DS',
  ds_renewal: 'DSR',
  domain_registration: 'DN',
  domain_dispute: 'DND',
  legal_consulting: 'ADV',
  litigation: 'LIT',
  recordal: 'REC',
  certification: 'CRT',
  legalization: 'LEG',
  translation: 'TRA',
  administrative: 'ADM',
  // Legacy
  marca: 'MAR',
  patente: 'PAT',
  diseño: 'DIS',
  vigilancia: 'VIG',
  renovacion: 'REN',
  oposicion: 'OPO',
  informe: 'INF',
  general: 'GEN',
};

export const SERVICE_TYPES: Record<string, { label: string; color: string }> = {
  tm_registration: { label: 'Registro Marca', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  tm_renewal: { label: 'Renovación Marca', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  tm_search: { label: 'Búsqueda Marca', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  tm_opposition: { label: 'Oposición Marca', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  tm_watch: { label: 'Vigilancia Marca', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  pt_filing: { label: 'Solicitud Patente', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  pt_prosecution: { label: 'Tramitación Patente', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  pt_maintenance: { label: 'Mantenimiento Patente', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  ds_registration: { label: 'Registro Diseño', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  ds_renewal: { label: 'Renovación Diseño', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  domain_registration: { label: 'Registro Dominio', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  domain_dispute: { label: 'Disputa Dominio', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  legal_consulting: { label: 'Asesoría Legal', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400' },
  litigation: { label: 'Litigio', color: 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-400' },
  recordal: { label: 'Inscripción', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
  // Legacy
  marca: { label: 'Marca', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  patente: { label: 'Patente', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  diseño: { label: 'Diseño', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  vigilancia: { label: 'Vigilancia', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  renovacion: { label: 'Renovación', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  oposicion: { label: 'Oposición', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  informe: { label: 'Informe', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  general: { label: 'General', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
};

// Extended jurisdictions for IP offices
export const JURISDICTIONS: Record<string, { label: string; flag: string; office?: string }> = {
  ES: { label: 'España', flag: '🇪🇸', office: 'OEPM' },
  EU: { label: 'Unión Europea', flag: '🇪🇺', office: 'EUIPO' },
  WO: { label: 'Madrid System', flag: '🌍', office: 'WIPO/Madrid' },
  PCT: { label: 'PCT', flag: '🌐', office: 'WIPO/PCT' },
  EP: { label: 'Patente Europea', flag: '🇪🇺', office: 'EPO' },
  US: { label: 'Estados Unidos', flag: '🇺🇸', office: 'USPTO' },
  CN: { label: 'China', flag: '🇨🇳', office: 'CNIPA' },
  JP: { label: 'Japón', flag: '🇯🇵', office: 'JPO' },
  GB: { label: 'Reino Unido', flag: '🇬🇧', office: 'UKIPO' },
  KR: { label: 'Corea del Sur', flag: '🇰🇷', office: 'KIPO' },
  MX: { label: 'México', flag: '🇲🇽', office: 'IMPI' },
  BR: { label: 'Brasil', flag: '🇧🇷', office: 'INPI' },
  DE: { label: 'Alemania', flag: '🇩🇪', office: 'DPMA' },
  FR: { label: 'Francia', flag: '🇫🇷', office: 'INPI' },
  IT: { label: 'Italia', flag: '🇮🇹', office: 'UIBM' },
  CA: { label: 'Canadá', flag: '🇨🇦', office: 'CIPO' },
  AU: { label: 'Australia', flag: '🇦🇺', office: 'IP Australia' },
  IN: { label: 'India', flag: '🇮🇳', office: 'IPO India' },
};

// Currency options
export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CNY', 'MXN', 'BRL'] as const;
export type Currency = typeof CURRENCIES[number];

// Service price by jurisdiction
export interface ServicePrice {
  id: string;
  service_id: string;
  jurisdiction: string;
  official_fee: number;
  professional_fee: number;
  total_price: number;
  currency: string;
  classes_included: number;
  extra_class_fee: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Service with prices
export interface ServiceWithPrices extends ServiceCatalogItem {
  prices?: ServicePrice[];
}

// ═══════════════════════════════════════════════════════════════
// CATEGORY CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const CATEGORY_CODES = {
  TM_REG: 'TM_REG',
  TM_RENEWAL: 'TM_RENEWAL',
  TM_SEARCH: 'TM_SEARCH',
  TM_OPPOSITION: 'TM_OPPOSITION',
  TM_WATCH: 'TM_WATCH',
  PT_FILING: 'PT_FILING',
  PT_PROSECUTION: 'PT_PROSECUTION',
  PT_MAINTENANCE: 'PT_MAINTENANCE',
  DS_REG: 'DS_REG',
  DN_REG: 'DN_REG',
  LEGAL_ADV: 'LEGAL_ADV',
  LITIGATION: 'LITIGATION',
  MISC: 'MISC',
} as const;

export type CategoryCode = typeof CATEGORY_CODES[keyof typeof CATEGORY_CODES];
