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

export const JURISDICTIONS: Record<string, { label: string; flag: string }> = {
  ES: { label: 'España', flag: '🇪🇸' },
  EU: { label: 'Unión Europea', flag: '🇪🇺' },
  INT: { label: 'Internacional', flag: '🌍' },
  US: { label: 'Estados Unidos', flag: '🇺🇸' },
  CN: { label: 'China', flag: '🇨🇳' },
  JP: { label: 'Japón', flag: '🇯🇵' },
  GB: { label: 'Reino Unido', flag: '🇬🇧' },
};
