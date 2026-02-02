// ============================================================
// IP-NEXUS - IPO OFFICES TYPES
// Complete type definitions for global IP office catalog
// ============================================================

export interface IPOOfficeData {
  code: string;
  codeAlt?: string;
  nameOfficial: string;
  nameShort?: string;
  countryCode: string | null;
  countryName: string;
  flagEmoji: string;
  region: IPORegion;
  officeType: 'national' | 'regional' | 'international';
  ipTypes: ('trademark' | 'patent' | 'design' | 'copyright' | 'utility_model')[];
  timezone: string;
  languages: string[];
  currency: string;
  tier: 1 | 2 | 3;
  automationLevel: 'A' | 'B' | 'C' | 'D' | 'E';
  automationPercentage: number;
  websiteOfficial?: string;
  websiteSearch?: string;
  hasApi: boolean;
  apiType?: 'REST' | 'SOAP' | 'GraphQL' | null;
  eFilingAvailable: boolean;
  onlinePayment: boolean;
  isMadridMember?: boolean;
  isPctMember?: boolean;
  isHagueMember?: boolean;
  capabilities?: IPOCapabilities;
}

export type IPORegion = 
  | 'europe'
  | 'north_america'
  | 'latin_america'
  | 'asia_pacific'
  | 'middle_east'
  | 'africa'
  | 'oceania'
  | 'caribbean'
  | 'international';

export interface IPOCapabilities {
  filing?: { available: boolean; method: 'api' | 'web' | 'manual'; notes?: string };
  search?: { available: boolean; method: 'api' | 'web' | 'manual'; notes?: string };
  payment?: { available: boolean; method: 'api' | 'web' | 'manual'; notes?: string };
  documentUpload?: { available: boolean; method: 'api' | 'web' | 'manual'; notes?: string };
  statusTracking?: { available: boolean; method: 'api' | 'web' | 'manual'; notes?: string };
  renewal?: { available: boolean; method: 'api' | 'web' | 'manual'; notes?: string };
  opposition?: { available: boolean; method: 'api' | 'web' | 'manual'; notes?: string };
  niceClassification?: { available: boolean; method: 'api' | 'web' | 'manual'; notes?: string };
}

// Automation level descriptions
export const AUTOMATION_LEVELS = {
  A: { label: 'Full API', percentage: 100, description: 'Fully automated via API' },
  B: { label: 'Partial API', percentage: 75, description: 'Mostly automated with some manual steps' },
  C: { label: 'Web + API', percentage: 50, description: 'Mix of web and API integration' },
  D: { label: 'Web Only', percentage: 25, description: 'Web portal only, limited automation' },
  E: { label: 'Manual', percentage: 0, description: 'Manual process, no automation' },
} as const;

// Region labels
export const REGION_LABELS: Record<IPORegion, string> = {
  europe: 'Europa',
  north_america: 'América del Norte',
  latin_america: 'América Latina',
  asia_pacific: 'Asia Pacífico',
  middle_east: 'Oriente Medio',
  africa: 'África',
  oceania: 'Oceanía',
  caribbean: 'Caribe',
  international: 'Internacional',
};
