// ============================================
// LEGAL OPS CORE - TypeScript Types
// ============================================

// Tipos de documentos legales
export type LegalDocType = 
  | 'tos' 
  | 'dpa' 
  | 'ai_disclosure' 
  | 'whatsapp_addendum' 
  | 'biometric_addendum'
  | 'privacy_policy';

export type ConsentStatus = 
  | 'pending' 
  | 'accepted' 
  | 'rejected' 
  | 'revoked' 
  | 'expired';

// Canales de comunicación
export type CommChannel = 
  | 'email' 
  | 'whatsapp' 
  | 'portal' 
  | 'phone' 
  | 'sms' 
  | 'in_person' 
  | 'other';

export type CommDirection = 'inbound' | 'outbound' | 'internal';

export type CommCategory = 
  | 'legal' 
  | 'administrative' 
  | 'commercial' 
  | 'urgent' 
  | 'general';

// WhatsApp
export type WhatsAppTier = 'tier1_api' | 'tier2_sync' | 'tier3_basic';

export type WhatsAppSessionStatus = 
  | 'disconnected' 
  | 'qr_pending' 
  | 'connecting' 
  | 'connected' 
  | 'error';

// Documentos
export type ClientDocType = 
  | 'poder_general'
  | 'poder_especial'
  | 'escritura_constitucion'
  | 'certificado_registro'
  | 'contrato'
  | 'factura'
  | 'notificacion_oficial'
  | 'correspondencia'
  | 'sentencia_resolucion'
  | 'informe_pericial'
  | 'otro';

export type DocValidityStatus = 
  | 'valid' 
  | 'expiring_soon' 
  | 'expired' 
  | 'pending_verification'
  | 'revoked';

// NER
export type NEREntityType = 
  | 'date_grant'
  | 'date_expiry'
  | 'date_signature'
  | 'party_grantor'
  | 'party_grantee'
  | 'party_notary'
  | 'id_document'
  | 'reference_protocol'
  | 'reference_registry'
  | 'reference_case'
  | 'power_type'
  | 'amount'
  | 'other';

// IA
export type LegalOpsAIInteractionType = 
  | 'classification'
  | 'ner_extraction'
  | 'transcription'
  | 'assistant_query'
  | 'document_summary'
  | 'rag_search';

export type AIConfidenceLevel = 'high' | 'medium' | 'low' | 'manual';

// ============================================
// INTERFACES DE ENTIDADES
// ============================================

export interface LegalDocument {
  id: string;
  doc_type: LegalDocType;
  version: string;
  title: string;
  content: string;
  content_hash: string;
  language: string;
  effective_from: string;
  effective_until?: string | null;
  is_current: boolean;
  changelog?: string | null;
  requires_re_consent: boolean;
  created_at: string;
  created_by?: string | null;
}

export interface TenantConsent {
  id: string;
  organization_id: string;
  accepted_by: string;
  legal_document_id: string;
  doc_type: LegalDocType;
  doc_version: string;
  doc_hash: string;
  status: ConsentStatus;
  accepted_at?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  revoked_at?: string | null;
  revocation_reason?: string | null;
  revoked_by?: string | null;
  signed_pdf_url?: string | null;
  signature_method?: string | null;
  signature_provider?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantAIConfig {
  id: string;
  organization_id: string;
  ai_classification_enabled: boolean;
  ai_classification_accepted_at?: string | null;
  ai_extraction_enabled: boolean;
  ai_extraction_accepted_at?: string | null;
  ai_assistant_enabled: boolean;
  ai_assistant_accepted_at?: string | null;
  audio_transcription_enabled: boolean;
  audio_transcription_accepted_at?: string | null;
  biometric_diarization_enabled: boolean;
  biometric_diarization_accepted_at?: string | null;
  biometric_addendum_signed: boolean;
  whatsapp_tier: WhatsAppTier;
  whatsapp_accepted_at?: string | null;
  whatsapp_addendum_signed: boolean;
  client_portal_enabled: boolean;
  client_assistant_enabled: boolean;
  updated_at: string;
  updated_by?: string | null;
}

export interface ConsentAuditLog {
  id: string;
  organization_id: string;
  user_id?: string | null;
  event_type: string;
  consent_type: string;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  document_version?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface CommunicationChannel {
  id: string;
  organization_id: string;
  channel: CommChannel;
  config: Record<string, unknown>;
  is_active: boolean;
  last_sync_at?: string | null;
  sync_status: string;
  credentials_encrypted?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  url: string;
}

export interface Communication {
  id: string;
  organization_id: string;
  client_id?: string | null;
  contact_id?: string | null;
  matter_id?: string | null;
  channel: CommChannel;
  direction: CommDirection;
  channel_config_id?: string | null;
  subject?: string | null;
  body?: string | null;
  body_html?: string | null;
  body_preview?: string | null;
  attachments: Attachment[];
  
  // Clasificación IA
  ai_category?: CommCategory | null;
  ai_subcategory?: string | null;
  ai_priority?: number | null;
  ai_confidence?: number | null;
  ai_classified_at?: string | null;
  ai_model?: string | null;
  
  // Clasificación manual
  manual_category?: CommCategory | null;
  manual_priority?: number | null;
  classified_by?: string | null;
  classified_at?: string | null;
  
  // Metadatos externos
  external_id?: string | null;
  external_metadata?: Record<string, unknown>;
  
  // Email específico
  email_from?: string | null;
  email_to?: string[] | null;
  email_cc?: string[] | null;
  email_bcc?: string[] | null;
  email_message_id?: string | null;
  email_thread_id?: string | null;
  email_in_reply_to?: string | null;
  
  // WhatsApp específico
  whatsapp_from?: string | null;
  whatsapp_to?: string | null;
  whatsapp_type?: string | null;
  whatsapp_media_url?: string | null;
  
  // Phone específico
  phone_from?: string | null;
  phone_to?: string | null;
  phone_duration_seconds?: number | null;
  phone_recording_url?: string | null;
  
  // Estado
  is_read: boolean;
  read_at?: string | null;
  read_by?: string | null;
  is_replied: boolean;
  replied_at?: string | null;
  reply_comm_id?: string | null;
  is_archived: boolean;
  archived_at?: string | null;
  is_starred: boolean;
  assigned_to?: string | null;
  assigned_at?: string | null;
  
  // Timestamps
  received_at: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppSession {
  id: string;
  organization_id: string;
  user_id: string;
  status: WhatsAppSessionStatus;
  phone_number?: string | null;
  device_name?: string | null;
  session_data_encrypted?: string | null;
  last_seen_at?: string | null;
  last_sync_at?: string | null;
  messages_synced: number;
  error_message?: string | null;
  error_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence?: number;
}

export interface IdentifiedSpeaker {
  id: string;
  name?: string;
  contact_id?: string;
  confidence?: number;
}

export interface AudioTranscription {
  id: string;
  organization_id: string;
  communication_id?: string | null;
  source_type: string;
  audio_url: string;
  audio_duration_seconds?: number | null;
  audio_format?: string | null;
  transcription_text?: string | null;
  transcription_status: string;
  segments: TranscriptionSegment[];
  diarization_enabled: boolean;
  speakers_identified: IdentifiedSpeaker[];
  ai_model?: string | null;
  ai_confidence?: number | null;
  language_detected?: string | null;
  transcribed_at?: string | null;
  created_at: string;
}

export interface ClientDocument {
  id: string;
  organization_id: string;
  client_id: string;
  matter_id?: string | null;
  file_name: string;
  file_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  file_hash?: string | null;
  doc_type: ClientDocType;
  doc_type_confidence?: number | null;
  doc_type_verified: boolean;
  title?: string | null;
  description?: string | null;
  validity_status: DocValidityStatus;
  valid_from?: string | null;
  valid_until?: string | null;
  validity_verified: boolean;
  validity_verified_by?: string | null;
  validity_verified_at?: string | null;
  ocr_text?: string | null;
  ocr_completed_at?: string | null;
  ocr_confidence?: number | null;
  ner_status: string;
  ner_completed_at?: string | null;
  ner_model?: string | null;
  embedding_status: string;
  tags?: string[] | null;
  notes?: string | null;
  visible_in_portal: boolean;
  version: number;
  parent_document_id?: string | null;
  uploaded_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DocumentEntity {
  id: string;
  organization_id: string;
  document_id: string;
  entity_type: NEREntityType;
  entity_value: string;
  entity_normalized?: string | null;
  page_number?: number | null;
  bounding_box?: BoundingBox | null;
  text_offset_start?: number | null;
  text_offset_end?: number | null;
  surrounding_text?: string | null;
  confidence?: number | null;
  confidence_level?: AIConfidenceLevel | null;
  is_verified: boolean;
  verified_value?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  linked_contact_id?: string | null;
  linked_matter_id?: string | null;
  created_at: string;
}

export interface DocumentValidityAlert {
  id: string;
  organization_id: string;
  document_id: string;
  alert_type: string;
  days_until_expiry?: number | null;
  expiry_date: string;
  status: string;
  acknowledged_by?: string | null;
  acknowledged_at?: string | null;
  notifications_sent: Array<{
    channel: string;
    sent_at: string;
    recipient: string;
  }>;
  created_at: string;
  resolved_at?: string | null;
}

export interface DocumentEmbedding {
  id: string;
  organization_id: string;
  source_type: string;
  source_id: string;
  chunk_index: number;
  chunk_text: string;
  chunk_tokens?: number | null;
  embedding?: number[] | null;
  client_id?: string | null;
  matter_id?: string | null;
  doc_type?: string | null;
  created_at: string;
}

export interface AISource {
  type: 'document' | 'communication' | 'transcription';
  id: string;
  title: string;
  excerpt: string;
  relevance: number;
}

export interface LegalOpsAIInteraction {
  id: string;
  organization_id: string;
  user_id?: string | null;
  client_id?: string | null;
  matter_id?: string | null;
  interaction_type: LegalOpsAIInteractionType;
  input_text?: string | null;
  input_tokens?: number | null;
  input_metadata?: Record<string, unknown>;
  output_text?: string | null;
  output_tokens?: number | null;
  output_metadata?: Record<string, unknown>;
  sources: AISource[];
  confidence?: number | null;
  confidence_level?: AIConfidenceLevel | null;
  model_provider?: string | null;
  model_name?: string | null;
  model_version?: string | null;
  latency_ms?: number | null;
  cost_usd?: number | null;
  user_feedback?: 'positive' | 'negative' | 'corrected' | null;
  user_correction?: string | null;
  feedback_at?: string | null;
  created_at: string;
}

export interface LegalOpsAIFeedback {
  id: string;
  organization_id: string;
  interaction_id: string;
  user_id: string;
  feedback_type: string;
  original_output?: string | null;
  corrected_output?: string | null;
  feedback_comment?: string | null;
  approved_for_training: boolean;
  training_exported_at?: string | null;
  created_at: string;
}

export interface DataRetentionPolicy {
  id: string;
  organization_id: string;
  data_type: string;
  retention_days: number;
  archive_after_days?: number | null;
  delete_after_days?: number | null;
  exceptions?: Record<string, unknown>;
  is_active: boolean;
  last_execution_at?: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// INTERFACES DE FORMULARIOS
// ============================================

export interface ConsentFormData {
  tos_accepted: boolean;
  dpa_accepted: boolean;
  ai_classification_accepted: boolean;
  ai_extraction_accepted: boolean;
  ai_assistant_accepted: boolean;
  audio_transcription_accepted: boolean;
  whatsapp_sync_accepted: boolean;
  biometric_accepted: boolean;
}

export interface AIDisclosureFormData {
  has_read_disclosure: boolean;
  understands_ai_limitations: boolean;
  accepts_human_verification_requirement: boolean;
}

// ============================================
// CONSTANTES
// ============================================

export const LEGAL_DOC_TYPES: Record<LegalDocType, string> = {
  tos: 'Términos de Servicio',
  dpa: 'Acuerdo de Procesamiento de Datos',
  ai_disclosure: 'Disclosure de IA (EU AI Act)',
  whatsapp_addendum: 'Addendum WhatsApp',
  biometric_addendum: 'Addendum Datos Biométricos',
  privacy_policy: 'Política de Privacidad',
};

export const CONSENT_STATUSES: Record<ConsentStatus, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
  revoked: 'Revocado',
  expired: 'Expirado',
};

export const COMM_CHANNELS: Record<CommChannel, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  portal: 'Portal Cliente',
  phone: 'Teléfono',
  sms: 'SMS',
  in_person: 'Presencial',
  other: 'Otro',
};

export const COMM_DIRECTIONS: Record<CommDirection, string> = {
  inbound: 'Entrante',
  outbound: 'Saliente',
  internal: 'Interno',
};

export const COMM_CATEGORIES: Record<CommCategory, string> = {
  legal: 'Legal',
  administrative: 'Administrativo',
  commercial: 'Comercial',
  urgent: 'Urgente',
  general: 'General',
};

export const WHATSAPP_TIERS: Record<WhatsAppTier, string> = {
  tier1_api: 'API Oficial (BSP)',
  tier2_sync: 'Sincronización (Read-only)',
  tier3_basic: 'Click-to-Chat',
};

export const CLIENT_DOC_TYPES: Record<ClientDocType, string> = {
  poder_general: 'Poder General',
  poder_especial: 'Poder Especial',
  escritura_constitucion: 'Escritura de Constitución',
  certificado_registro: 'Certificado de Registro',
  contrato: 'Contrato',
  factura: 'Factura',
  notificacion_oficial: 'Notificación Oficial',
  correspondencia: 'Correspondencia',
  sentencia_resolucion: 'Sentencia/Resolución',
  informe_pericial: 'Informe Pericial',
  otro: 'Otro',
};

export const DOC_VALIDITY_STATUSES: Record<DocValidityStatus, string> = {
  valid: 'Vigente',
  expiring_soon: 'Próximo a Caducar',
  expired: 'Caducado',
  pending_verification: 'Pendiente Verificación',
  revoked: 'Revocado',
};

export const NER_ENTITY_TYPES: Record<NEREntityType, string> = {
  date_grant: 'Fecha de Otorgamiento',
  date_expiry: 'Fecha de Caducidad',
  date_signature: 'Fecha de Firma',
  party_grantor: 'Otorgante/Poderdante',
  party_grantee: 'Apoderado',
  party_notary: 'Notario',
  id_document: 'DNI/NIF/Pasaporte',
  reference_protocol: 'Número de Protocolo',
  reference_registry: 'Referencia Registral',
  reference_case: 'Número de Expediente',
  power_type: 'Tipo de Poder',
  amount: 'Importe/Cantidad',
  other: 'Otro',
};

export const AI_CONFIDENCE_LEVELS: Record<AIConfidenceLevel, string> = {
  high: 'Alta (≥85%)',
  medium: 'Media (70-84%)',
  low: 'Baja (<70%)',
  manual: 'Manual',
};

export const LEGALOPS_AI_INTERACTION_TYPES: Record<LegalOpsAIInteractionType, string> = {
  classification: 'Clasificación',
  ner_extraction: 'Extracción de Entidades',
  transcription: 'Transcripción',
  assistant_query: 'Consulta Asistente',
  document_summary: 'Resumen de Documento',
  rag_search: 'Búsqueda RAG',
};

// ============================================
// UTILITY TYPES
// ============================================

export type CommunicationWithRelations = Communication & {
  client?: { id: string; name: string } | null;
  contact?: { id: string; name: string } | null;
  matter?: { id: string; reference: string; title: string } | null;
  assigned_user?: { id: string; full_name: string } | null;
};

export type ClientDocumentWithEntities = ClientDocument & {
  entities?: DocumentEntity[];
  client?: { id: string; name: string } | null;
  matter?: { id: string; reference: string } | null;
};

export type LegalOpsAIInteractionWithSources = LegalOpsAIInteraction & {
  user?: { id: string; full_name: string } | null;
  client?: { id: string; name: string } | null;
  matter?: { id: string; reference: string } | null;
};
