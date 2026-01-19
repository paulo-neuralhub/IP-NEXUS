// src/types/filing.types.ts

export interface FilingApplication {
  id: string;
  organization_id: string;
  filing_type: FilingType;
  ip_type: 'trademark' | 'patent' | 'design';
  office_id: string;
  office_code: string;
  matter_id?: string;
  applicant_id?: string;
  applicant_data: ApplicantData;
  representative_id?: string;
  representative_data?: RepresentativeData;
  power_of_attorney_id?: string;
  application_data: Record<string, any>;
  documents: FilingDocument[];
  priority_claims: PriorityClaim[];
  fees_calculated?: FeesCalculation;
  fees_paid: boolean;
  payment_reference?: string;
  payment_date?: string;
  status: FilingStatus;
  validation_status: ValidationStatus;
  validation_errors: ValidationError[];
  validation_warnings: ValidationWarning[];
  validated_at?: string;
  submission_method?: SubmissionMethod;
  submission_attempts: number;
  last_submission_at?: string;
  submission_response?: Record<string, any>;
  official_filing_number?: string;
  official_filing_date?: string;
  official_receipt_url?: string;
  tracking_number?: string;
  deadline_submission?: string;
  deadline_payment?: string;
  created_by?: string;
  submitted_by?: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  // Relations
  office?: {
    code: string;
    name_short?: string;
    name_official: string;
    currency: string;
  };
  trademark_data?: FilingTrademarkData[];
}

export type FilingType = 
  | 'new_application'
  | 'renewal'
  | 'assignment'
  | 'license_recordal'
  | 'opposition'
  | 'cancellation'
  | 'response_office_action'
  | 'appeal'
  | 'limitation'
  | 'division'
  | 'priority_claim'
  | 'seniority_claim'
  | 'pct_national_phase'
  | 'continuation'
  | 'divisional'
  | 'response_examination';

export type FilingStatus = 
  | 'draft'
  | 'validating'
  | 'ready'
  | 'submitting'
  | 'submitted'
  | 'acknowledged'
  | 'payment_pending'
  | 'accepted'
  | 'rejected'
  | 'error';

export type ValidationStatus = 'pending' | 'passed' | 'failed';

export type SubmissionMethod = 'api' | 'web_form' | 'email' | 'manual';

export interface ApplicantData {
  name: string;
  type: 'natural_person' | 'legal_entity';
  country: string;
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  tax_id?: string;
  email?: string;
  phone?: string;
}

export interface RepresentativeData {
  name: string;
  euipo_id?: string;
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  email?: string;
}

export interface FilingDocument {
  type: string;
  file_id: string;
  filename: string;
  size?: number;
}

export interface PriorityClaim {
  country: string;
  number: string;
  date: string;
}

export interface FeesCalculation {
  breakdown: {
    concept: string;
    amount: number;
    currency: string;
  }[];
  total: number;
  currency: string;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
}

export interface FilingTrademarkData {
  id: string;
  filing_id: string;
  mark_type: MarkType;
  mark_text?: string;
  mark_description?: string;
  mark_image_file_id?: string;
  mark_image_format?: string;
  mark_image_colors?: string;
  mark_sound_file_id?: string;
  mark_video_file_id?: string;
  is_color_claimed: boolean;
  colors_claimed?: string[];
  color_description?: string;
  nice_classes: number[];
  goods_services: Record<number, string>;
  vienna_codes?: string[];
  filing_language?: string;
  second_language?: string;
  is_collective_mark: boolean;
  is_certification_mark: boolean;
  collective_mark_regulations_id?: string;
  disclaimer?: string;
  translation?: string;
  transliteration?: string;
  created_at: string;
}

export type MarkType = 
  | 'word'
  | 'figurative'
  | 'combined'
  | 'shape_3d'
  | 'sound'
  | 'motion'
  | 'multimedia'
  | 'hologram'
  | 'position'
  | 'pattern'
  | 'color'
  | 'other';

export interface FilingStatusHistory {
  id: string;
  filing_id: string;
  status_from?: string;
  status_to: string;
  changed_by?: string;
  changed_at: string;
  notes?: string;
  system_message?: string;
  metadata?: Record<string, any>;
}

export interface FilingTemplate {
  id: string;
  organization_id?: string;
  name: string;
  description?: string;
  filing_type: FilingType;
  ip_type: 'trademark' | 'patent' | 'design';
  office_id?: string;
  template_data: Record<string, any>;
  use_count: number;
  last_used_at?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
}

export interface FilingDraft {
  id: string;
  organization_id: string;
  user_id: string;
  filing_type: FilingType;
  ip_type: 'trademark' | 'patent' | 'design';
  office_id?: string;
  current_step: number;
  wizard_data: Record<string, any>;
  converted_to_filing_id?: string;
  auto_saved_at: string;
  expires_at: string;
}

// Constants
export const FILING_STATUS_CONFIG: Record<FilingStatus, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
  validating: { label: 'Validando', color: 'bg-blue-100 text-blue-700' },
  ready: { label: 'Listo', color: 'bg-green-100 text-green-700' },
  submitting: { label: 'Enviando', color: 'bg-yellow-100 text-yellow-700' },
  submitted: { label: 'Enviado', color: 'bg-purple-100 text-purple-700' },
  acknowledged: { label: 'Recibido', color: 'bg-purple-100 text-purple-700' },
  payment_pending: { label: 'Pendiente pago', color: 'bg-orange-100 text-orange-700' },
  accepted: { label: 'Aceptado', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700' },
  error: { label: 'Error', color: 'bg-red-100 text-red-700' },
};

export const FILING_TYPE_LABELS: Record<FilingType, string> = {
  new_application: 'Nueva solicitud',
  renewal: 'Renovación',
  assignment: 'Cesión',
  license_recordal: 'Inscripción licencia',
  opposition: 'Oposición',
  cancellation: 'Cancelación',
  response_office_action: 'Respuesta requerimiento',
  appeal: 'Recurso',
  limitation: 'Limitación',
  division: 'División',
  priority_claim: 'Reivindicación prioridad',
  seniority_claim: 'Reivindicación antigüedad',
  pct_national_phase: 'Fase nacional PCT',
  continuation: 'Continuación',
  divisional: 'División',
  response_examination: 'Respuesta examen',
};

export const MARK_TYPE_CONFIG: Record<MarkType, { label: string; description: string; requiresImage: boolean; requiresText: boolean }> = {
  word: { label: 'Denominativa', description: 'Solo texto, sin diseño', requiresImage: false, requiresText: true },
  figurative: { label: 'Gráfica', description: 'Logo o diseño sin texto', requiresImage: true, requiresText: false },
  combined: { label: 'Mixta', description: 'Combinación de texto y diseño', requiresImage: true, requiresText: true },
  shape_3d: { label: 'Tridimensional', description: 'Forma 3D del producto', requiresImage: true, requiresText: false },
  sound: { label: 'Sonora', description: 'Sonido o melodía', requiresImage: false, requiresText: false },
  motion: { label: 'Movimiento', description: 'Animación o secuencia', requiresImage: false, requiresText: false },
  multimedia: { label: 'Multimedia', description: 'Combinación audiovisual', requiresImage: false, requiresText: false },
  hologram: { label: 'Holograma', description: 'Imagen holográfica', requiresImage: true, requiresText: false },
  position: { label: 'Posición', description: 'Ubicación específica', requiresImage: true, requiresText: false },
  pattern: { label: 'Patrón', description: 'Patrón repetitivo', requiresImage: true, requiresText: false },
  color: { label: 'Color', description: 'Color o combinación', requiresImage: false, requiresText: false },
  other: { label: 'Otro', description: 'Otro tipo', requiresImage: false, requiresText: false },
};

export const SUPPORTED_OFFICES = ['EM', 'ES', 'US', 'WO', 'GB'] as const;

export const OFFICE_FILING_INFO: Record<string, { description: string; features: string[] }> = {
  'EM': {
    description: 'Marca de la Unión Europea - Protección en 27 países',
    features: ['E-filing API', 'Pago online', 'Fast Track disponible'],
  },
  'ES': {
    description: 'Marca Nacional Española',
    features: ['E-filing Web Service', 'Integración Cl@ve'],
  },
  'US': {
    description: 'Marca Federal de Estados Unidos',
    features: ['TEAS filing', 'Pago online'],
  },
  'WO': {
    description: 'Marca Internacional (Sistema de Madrid)',
    features: ['Madrid e-Filing', 'Designación múltiple países'],
  },
  'GB': {
    description: 'Marca del Reino Unido',
    features: ['API REST', 'Pago online'],
  },
};
