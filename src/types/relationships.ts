// ============================================================
// IP-NEXUS - MATTER RELATIONSHIPS TYPES
// Types for relationships between matters (families, divisionals, etc.)
// ============================================================

export type RelationshipType =
  // Familias de marcas
  | 'family'
  | 'series'
  | 'associated'
  // Derivaciones de patentes
  | 'divisional'
  | 'continuation'
  | 'continuation_in_part'
  | 'parent'
  // Sistemas internacionales
  | 'basic_mark'
  | 'designation'
  | 'national_phase'
  | 'validation'
  | 'conversion'
  // Procedimientos
  | 'opposition'
  | 'cancellation'
  | 'appeal'
  | 'litigation'
  // Otros
  | 'renewal'
  | 'prior_registration'
  | 'related'
  | 'conflicting';

export type RelationshipStatus = 'active' | 'expired' | 'terminated' | 'pending';

export interface MatterRelationship {
  id: string;
  source_matter_id: string;
  target_matter_id: string;
  relationship_type: RelationshipType;
  is_bidirectional: boolean;
  inverse_relationship_type: string | null;
  relationship_date: string | null;
  effective_from: string | null;
  effective_until: string | null;
  status: RelationshipStatus;
  notes: string | null;
  relationship_data: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data
  source_matter?: {
    id: string;
    reference: string;
    title: string;
    status: string;
    type?: string;
    jurisdiction?: string;
  };
  target_matter?: {
    id: string;
    reference: string;
    title: string;
    status: string;
    type?: string;
    jurisdiction?: string;
  };
}

export interface CreateRelationshipParams {
  sourceMatterId: string;
  targetMatterId: string;
  relationshipType: RelationshipType;
  isBidirectional?: boolean;
  relationshipDate?: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
  notes?: string;
  relationshipData?: Record<string, unknown>;
}

// ============================================================
// RELATIONSHIP TYPE METADATA
// ============================================================

export interface RelationshipTypeConfig {
  label: string;
  labelEs: string;
  icon: string;
  color: string;
  description: string;
  descriptionEs: string;
  applicableTo: ('trademark' | 'patent' | 'design' | 'utility_model' | 'all')[];
  isBidirectionalDefault: boolean;
  inverseType?: RelationshipType;
}

export const RELATIONSHIP_TYPES: Record<RelationshipType, RelationshipTypeConfig> = {
  // Familias de marcas
  family: {
    label: 'Family',
    labelEs: 'Familia',
    icon: '👨‍👩‍👧‍👦',
    color: 'blue',
    description: 'Same trademark family',
    descriptionEs: 'Misma familia de marcas',
    applicableTo: ['trademark'],
    isBidirectionalDefault: true,
  },
  series: {
    label: 'Series',
    labelEs: 'Serie',
    icon: '📚',
    color: 'blue',
    description: 'Series mark (UK)',
    descriptionEs: 'Marca en serie (UK)',
    applicableTo: ['trademark'],
    isBidirectionalDefault: true,
  },
  associated: {
    label: 'Associated',
    labelEs: 'Asociada',
    icon: '🔗',
    color: 'blue',
    description: 'Associated mark',
    descriptionEs: 'Marca asociada',
    applicableTo: ['trademark'],
    isBidirectionalDefault: true,
  },

  // Derivaciones de patentes
  divisional: {
    label: 'Divisional',
    labelEs: 'Divisional',
    icon: '✂️',
    color: 'purple',
    description: 'Divisional application',
    descriptionEs: 'Solicitud divisional',
    applicableTo: ['patent', 'utility_model'],
    isBidirectionalDefault: false,
    inverseType: 'parent',
  },
  continuation: {
    label: 'Continuation',
    labelEs: 'Continuación',
    icon: '➡️',
    color: 'purple',
    description: 'Continuation (US)',
    descriptionEs: 'Continuación (US)',
    applicableTo: ['patent'],
    isBidirectionalDefault: false,
    inverseType: 'parent',
  },
  continuation_in_part: {
    label: 'CIP',
    labelEs: 'CIP',
    icon: '➕',
    color: 'purple',
    description: 'Continuation-in-Part (US)',
    descriptionEs: 'Continuación parcial (US)',
    applicableTo: ['patent'],
    isBidirectionalDefault: false,
    inverseType: 'parent',
  },
  parent: {
    label: 'Parent',
    labelEs: 'Matriz',
    icon: '👆',
    color: 'purple',
    description: 'Parent application',
    descriptionEs: 'Solicitud matriz',
    applicableTo: ['patent', 'utility_model'],
    isBidirectionalDefault: false,
    inverseType: 'divisional',
  },

  // Sistemas internacionales
  basic_mark: {
    label: 'Basic Mark',
    labelEs: 'Marca Base',
    icon: '🏠',
    color: 'green',
    description: 'Basic mark for Madrid Protocol',
    descriptionEs: 'Marca base para Protocolo de Madrid',
    applicableTo: ['trademark'],
    isBidirectionalDefault: false,
    inverseType: 'designation',
  },
  designation: {
    label: 'Designation',
    labelEs: 'Designación',
    icon: '🎯',
    color: 'green',
    description: 'Madrid designation',
    descriptionEs: 'Designación Madrid',
    applicableTo: ['trademark'],
    isBidirectionalDefault: false,
    inverseType: 'basic_mark',
  },
  national_phase: {
    label: 'National Phase',
    labelEs: 'Fase Nacional',
    icon: '🏳️',
    color: 'green',
    description: 'PCT national phase entry',
    descriptionEs: 'Entrada en fase nacional PCT',
    applicableTo: ['patent'],
    isBidirectionalDefault: false,
    inverseType: 'parent',
  },
  validation: {
    label: 'Validation',
    labelEs: 'Validación',
    icon: '✅',
    color: 'green',
    description: 'EP patent validation',
    descriptionEs: 'Validación de patente EP',
    applicableTo: ['patent'],
    isBidirectionalDefault: false,
  },
  conversion: {
    label: 'Conversion',
    labelEs: 'Conversión',
    icon: '🔄',
    color: 'green',
    description: 'Converted registration (e.g., EUTM to UK post-Brexit)',
    descriptionEs: 'Registro convertido (ej: EUTM a UK post-Brexit)',
    applicableTo: ['all'],
    isBidirectionalDefault: false,
  },

  // Procedimientos
  opposition: {
    label: 'Opposition',
    labelEs: 'Oposición',
    icon: '⚔️',
    color: 'red',
    description: 'Opposition proceeding',
    descriptionEs: 'Procedimiento de oposición',
    applicableTo: ['all'],
    isBidirectionalDefault: true,
  },
  cancellation: {
    label: 'Cancellation',
    labelEs: 'Cancelación',
    icon: '❌',
    color: 'red',
    description: 'Cancellation proceeding',
    descriptionEs: 'Procedimiento de cancelación',
    applicableTo: ['all'],
    isBidirectionalDefault: true,
  },
  appeal: {
    label: 'Appeal',
    labelEs: 'Recurso',
    icon: '📜',
    color: 'orange',
    description: 'Appeal proceeding',
    descriptionEs: 'Procedimiento de recurso',
    applicableTo: ['all'],
    isBidirectionalDefault: false,
  },
  litigation: {
    label: 'Litigation',
    labelEs: 'Litigio',
    icon: '⚖️',
    color: 'red',
    description: 'Related litigation',
    descriptionEs: 'Litigio relacionado',
    applicableTo: ['all'],
    isBidirectionalDefault: true,
  },

  // Otros
  renewal: {
    label: 'Renewal',
    labelEs: 'Renovación',
    icon: '🔄',
    color: 'teal',
    description: 'Renewal record',
    descriptionEs: 'Registro de renovación',
    applicableTo: ['all'],
    isBidirectionalDefault: false,
  },
  prior_registration: {
    label: 'Prior Registration',
    labelEs: 'Registro Anterior',
    icon: '📋',
    color: 'gray',
    description: 'Prior registration (seniority claim)',
    descriptionEs: 'Registro anterior (reivindicación de antigüedad)',
    applicableTo: ['trademark'],
    isBidirectionalDefault: false,
  },
  related: {
    label: 'Related',
    labelEs: 'Relacionado',
    icon: '🔗',
    color: 'gray',
    description: 'Generic relationship',
    descriptionEs: 'Relación genérica',
    applicableTo: ['all'],
    isBidirectionalDefault: true,
  },
  conflicting: {
    label: 'Conflicting',
    labelEs: 'Conflictivo',
    icon: '⚠️',
    color: 'yellow',
    description: 'Conflicting mark/patent',
    descriptionEs: 'Marca/patente conflictiva',
    applicableTo: ['all'],
    isBidirectionalDefault: true,
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getRelationshipTypeConfig(type: RelationshipType): RelationshipTypeConfig {
  return RELATIONSHIP_TYPES[type] || RELATIONSHIP_TYPES.related;
}

export function getApplicableRelationshipTypes(
  rightType: 'trademark' | 'patent' | 'design' | 'utility_model'
): RelationshipType[] {
  return (Object.keys(RELATIONSHIP_TYPES) as RelationshipType[]).filter(type => {
    const config = RELATIONSHIP_TYPES[type];
    return config.applicableTo.includes('all') || config.applicableTo.includes(rightType);
  });
}
