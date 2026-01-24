// =============================================
// Service Catalog Types
// =============================================

export type ServiceType = 
  | 'marca' 
  | 'patente' 
  | 'diseño' 
  | 'vigilancia' 
  | 'renovacion' 
  | 'oposicion' 
  | 'informe' 
  | 'general';

export type Jurisdiction = 'ES' | 'EU' | 'INT' | 'US' | 'CN' | 'JP' | 'GB' | null;

export interface ServiceCatalogMetadata {
  duration_estimate?: string;
  includes?: string[];
  requirements?: string[];
}

export interface ServiceCatalogItem {
  id: string;
  organization_id: string;
  reference_code: string | null;
  name: string;
  description: string | null;
  category: string | null;
  service_type: ServiceType;
  jurisdiction: Jurisdiction;
  official_fee: number;
  professional_fee: number;
  base_price: number;
  currency: string;
  estimated_days: number | null;
  nice_classes_included: number;
  extra_class_fee: number;
  display_order: number | null;
  is_active: boolean;
  stripe_price_id: string | null;
  metadata?: ServiceCatalogMetadata | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCatalogFilters {
  service_type?: ServiceType | 'all';
  jurisdiction?: Jurisdiction | 'all';
  is_active?: boolean;
  search?: string;
}

// Reference code prefixes by service type
export const SERVICE_TYPE_PREFIXES: Record<ServiceType, string> = {
  marca: 'MAR',
  patente: 'PAT',
  diseño: 'DIS',
  vigilancia: 'VIG',
  renovacion: 'REN',
  oposicion: 'OPO',
  informe: 'INF',
  general: 'GEN',
};

export const SERVICE_TYPES: Record<ServiceType, { label: string; color: string }> = {
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
  INT: { label: 'Internacional', flag: '🌍', office: 'WIPO/Madrid' },
  US: { label: 'Estados Unidos', flag: '🇺🇸', office: 'USPTO' },
  CN: { label: 'China', flag: '🇨🇳', office: 'CNIPA' },
  JP: { label: 'Japón', flag: '🇯🇵', office: 'JPO' },
  GB: { label: 'Reino Unido', flag: '🇬🇧', office: 'UKIPO' },
  EP: { label: 'Patente Europea', flag: '🇪🇺', office: 'EPO' },
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
export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CNY'] as const;
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
