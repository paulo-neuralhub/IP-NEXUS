// src/types/ip-finance.types.ts
// Types for IP Portfolio Valuation Module

export type ValuationMethod = 'cost' | 'market' | 'income' | 'hybrid';

export type ValuationFrequency = 'monthly' | 'quarterly' | 'annually';

export type ValuationStatus = 'draft' | 'final' | 'approved';

export type PortfolioAssetStatus = 'active' | 'pending' | 'expired' | 'abandoned';

export interface FinancePortfolio {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  currency: string;
  total_assets: number;
  total_value: number;
  total_cost: number;
  unrealized_gain: number;
  valuation_frequency: ValuationFrequency;
  auto_revalue: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  assets?: PortfolioAsset[];
}

export interface PortfolioAsset {
  id: string;
  portfolio_id: string;
  asset_type: string;
  asset_id?: string;
  external_reference?: string;
  matter_id?: string;
  title: string;
  registration_number?: string;
  registration_office?: string;
  jurisdiction?: string;
  acquisition_date?: string;
  acquisition_cost?: number;
  acquisition_currency: string;
  current_value?: number;
  last_valuation_date?: string;
  valuation_method?: string;
  nice_classes?: number[];
  expiry_date?: string;
  status: PortfolioAssetStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Valuation {
  id: string;
  organization_id: string;
  portfolio_id?: string;
  asset_id?: string;
  valuation_date: string;
  valuation_type: 'asset' | 'portfolio' | 'batch';
  methods_used: ValuationMethod[];
  primary_method: ValuationMethod;
  estimated_value: number;
  value_range_low?: number;
  value_range_high?: number;
  confidence_level: number;
  currency: string;
  cost_approach_value?: number;
  market_approach_value?: number;
  income_approach_value?: number;
  factors: ValuationFactors;
  adjustments: ValuationAdjustment[];
  comparable_transactions: ComparableTransaction[];
  ai_analysis?: string;
  ai_confidence?: number;
  status: ValuationStatus;
  approved_by?: string;
  approved_at?: string;
  created_by?: string;
  created_at: string;
  notes?: string;
}

export interface ValuationFactors {
  // Cost factors
  developmentCost?: number;
  legalCost?: number;
  maintenanceCost?: number;
  opportunityCost?: number;
  
  // Income factors
  projectedRevenue?: number;
  royaltyRate?: number;
  discountRate?: number;
  growthRate?: number;
  usefulLife?: number;
  
  // Market factors
  comparableMultiplier?: number;
  marketTrend?: number;
  
  // Quality factors
  brandStrength?: number;
  marketPosition?: number;
  legalStrength?: number;
  competitiveAdvantage?: number;
}

export interface ValuationAdjustment {
  type: string;
  description: string;
  factor: number;
  impact: number;
}

export interface ComparableTransaction {
  description: string;
  date: string;
  value: number;
  currency: string;
  source?: string;
  similarity: number;
}

export interface ValuationInput {
  assetType: string;
  assetTitle: string;
  registrationNumber?: string;
  jurisdiction?: string;
  niceClasses?: number[];
  acquisitionCost?: number;
  acquisitionDate?: string;
  projectedRevenue?: number;
  industry?: string;
  brandStrength?: number;
  marketPosition?: number;
  legalStrength?: number;
  competitiveAdvantage?: number;
}

export interface ValuationParameters {
  id: string;
  asset_type?: string;
  jurisdiction?: string;
  development_cost_multiplier: number;
  legal_cost_base?: number;
  maintenance_cost_annual?: number;
  royalty_rate_low?: number;
  royalty_rate_mid?: number;
  royalty_rate_high?: number;
  discount_rate: number;
  growth_rate: number;
  useful_life_years: number;
  market_multiplier_low?: number;
  market_multiplier_mid?: number;
  market_multiplier_high?: number;
  brand_strength_factor: number;
  market_position_factor: number;
  legal_strength_factor: number;
  effective_date: string;
}

export interface ValuationResult {
  estimated_value: number;
  value_range_low: number;
  value_range_high: number;
  confidence_level: number;
  cost_approach_value?: number;
  market_approach_value?: number;
  income_approach_value?: number;
  ai_analysis?: string;
  methods_used: ValuationMethod[];
  primary_method: ValuationMethod;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  unrealizedGain: number;
  roi: number;
  valueChange: number;
  valueChangePercent: number;
  assetCount: number;
  currency: string;
}

// Asset type configuration for valuations
export const VALUATION_ASSET_TYPES = {
  trademark: { label: { es: 'Marca', en: 'Trademark' }, icon: 'Shield' },
  patent: { label: { es: 'Patente', en: 'Patent' }, icon: 'Lightbulb' },
  design: { label: { es: 'Diseño', en: 'Design' }, icon: 'Palette' },
  copyright: { label: { es: 'Derechos de autor', en: 'Copyright' }, icon: 'FileText' },
  domain: { label: { es: 'Dominio', en: 'Domain' }, icon: 'Globe' },
  trade_secret: { label: { es: 'Secreto comercial', en: 'Trade Secret' }, icon: 'Lock' },
} as const;

export const VALUATION_METHODS = {
  cost: {
    label: { es: 'Enfoque de Costos', en: 'Cost Approach' },
    description: { 
      es: 'Basado en costos de desarrollo y mantenimiento',
      en: 'Based on development and maintenance costs'
    },
  },
  market: {
    label: { es: 'Enfoque de Mercado', en: 'Market Approach' },
    description: { 
      es: 'Basado en transacciones comparables',
      en: 'Based on comparable transactions'
    },
  },
  income: {
    label: { es: 'Enfoque de Ingresos', en: 'Income Approach' },
    description: { 
      es: 'Basado en flujos de ingresos futuros',
      en: 'Based on future income streams'
    },
  },
  hybrid: {
    label: { es: 'Híbrido', en: 'Hybrid' },
    description: { 
      es: 'Combinación ponderada de métodos',
      en: 'Weighted combination of methods'
    },
  },
} as const;

export const JURISDICTIONS = {
  ES: { label: 'España (OEPM)', flag: '🇪🇸' },
  EU: { label: 'Unión Europea (EUIPO)', flag: '🇪🇺' },
  US: { label: 'Estados Unidos (USPTO)', flag: '🇺🇸' },
  INT: { label: 'Internacional (WIPO)', flag: '🌐' },
  UK: { label: 'Reino Unido (UKIPO)', flag: '🇬🇧' },
  DE: { label: 'Alemania (DPMA)', flag: '🇩🇪' },
  FR: { label: 'Francia (INPI)', flag: '🇫🇷' },
  CN: { label: 'China (CNIPA)', flag: '🇨🇳' },
} as const;
