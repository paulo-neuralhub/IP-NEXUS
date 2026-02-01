// ════════════════════════════════════════════════════════════════════════════
// IP-NEXUS - Service Types
// PROMPT 4D: Tipos para categorías y plantillas de servicio
// ════════════════════════════════════════════════════════════════════════════

export interface ServiceCategory {
  id: string;
  code: string;
  name_en: string;
  name_es: string;
  description_en: string | null;
  description_es: string | null;
  right_type: string;
  icon: string | null;
  color: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface ServiceTemplate {
  id: string;
  code: string;
  name_en: string;
  name_es: string;
  description_en: string | null;
  description_es: string | null;
  category_id: string;
  right_type: string;
  jurisdiction_id: string | null;
  international_system: 'madrid' | 'pct' | 'hague' | 'none' | null;
  
  // Workflow configuration
  initial_phase: string;
  applicable_phases: string[];
  skippable_phases: string[];
  phase_durations: Record<string, number>;
  
  // Requirements
  required_fields: string[];
  optional_fields: string[];
  required_documents: string[];
  auto_deadlines: string[];
  
  // Pricing
  base_official_fee: number | null;
  base_professional_fee: number | null;
  currency: string;
  fee_notes?: string | null;
  
  // Metadata
  tags: string[];
  related_services: string[];
  internal_notes?: string | null;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  
  // Joined relations
  category?: ServiceCategory;
  jurisdiction?: {
    id: string;
    code: string;
    name_en: string;
    name_es?: string;
    flag_emoji?: string;
  };
}

export interface ServiceTemplateFilters {
  categoryId?: string;
  rightType?: string;
  jurisdictionId?: string;
  internationalSystem?: string;
  search?: string;
}

// Helper type for right types
export type ServiceRightType = 
  | 'trademark' 
  | 'patent' 
  | 'design' 
  | 'utility_model' 
  | 'copyright' 
  | 'domain' 
  | 'all';
