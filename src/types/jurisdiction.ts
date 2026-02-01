// ============================================================
// IP-NEXUS - JURISDICTION TYPES
// Complete type definitions for global IP jurisdiction system
// ============================================================

export type JurisdictionType = 'country' | 'regional' | 'international' | 'supranational';
export type RightType = 'trademark' | 'patent' | 'utility_model' | 'design' | 'copyright';
export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multi_select' | 'checkbox' | 'radio' | 'file' | 'country_select';
export type GridColumn = 'full' | 'half' | 'third';

export interface Jurisdiction {
  id: string;
  code: string;
  name: string;
  name_en: string | null;
  name_es: string | null;
  name_local: string | null;
  jurisdiction_type: JurisdictionType;
  tier: number;
  region: string;
  
  // Office info
  ipo_name: string | null;
  office_acronym: string | null;
  office_website: string | null;
  ipo_url: string | null;
  
  // Regional settings
  official_languages: string[];
  filing_languages: string[];
  currency_code: string | null;
  timezone: string | null;
  phone_code: string | null;
  
  // IP Capabilities
  supports_trademarks: boolean;
  supports_patents: boolean;
  supports_utility_models: boolean;
  supports_designs: boolean;
  
  // International memberships
  is_madrid_member: boolean;
  is_pct_member: boolean;
  is_hague_member: boolean;
  is_paris_member: boolean;
  
  // Deadlines
  paris_priority_months_tm: number;
  paris_priority_months_pt: number;
  paris_priority_months_ds: number;
  opposition_period_days: number | null;
  trademark_duration_years: number;
  patent_duration_years: number;
  
  // Requirements
  requires_local_agent: boolean;
  requires_translation: boolean;
  has_subclasses: boolean;
  use_requirement: boolean;
  use_declaration_required: boolean;
  
  // UI
  flag_emoji: string | null;
  flag_code: string | null;
  icon: string | null;
  
  // Features (from original schema)
  has_knowledge_base: boolean;
  has_spider_monitoring: boolean;
  has_deadline_rules: boolean;
  has_official_forms: boolean;
  has_api_integration: boolean;
  
  // Pricing (from original schema)
  price_monthly: number;
  price_yearly: number | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  
  // Status
  is_active: boolean;
  notes: string | null;
  sort_order: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface JurisdictionFieldOption {
  value: string;
  label: string;
}

export interface JurisdictionFieldConfig {
  id: string;
  jurisdiction_id: string;
  right_type: RightType;
  field_key: string;
  field_label_en: string;
  field_label_es: string | null;
  field_description: string | null;
  field_placeholder: string | null;
  field_type: FieldType;
  field_options: JurisdictionFieldOption[] | null;
  is_required: boolean;
  is_required_condition: string | null;
  visible_condition: string | null;
  validation_regex: string | null;
  min_length: number | null;
  max_length: number | null;
  field_group: string | null;
  display_order: number;
  grid_column: GridColumn;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Grouped fields by group name
export interface GroupedJurisdictionFields {
  [groupName: string]: JurisdictionFieldConfig[];
}

// Jurisdiction with its field configs
export interface JurisdictionWithFields extends Jurisdiction {
  field_configs?: JurisdictionFieldConfig[];
}

// Filter options
export interface JurisdictionFilters {
  types?: JurisdictionType[];
  tiers?: number[];
  regions?: string[];
  madridMember?: boolean;
  pctMember?: boolean;
  hagueMember?: boolean;
  supportsTrademarks?: boolean;
  supportsPatents?: boolean;
  active?: boolean;
}

// For the selector component
export interface JurisdictionSelectOption {
  id: string;
  code: string;
  name: string;
  flag: string;
  office: string;
  region: string;
  tier: number;
  popular: boolean;
}
