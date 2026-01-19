// src/types/legal-library.types.ts

export type DocumentLevel = 'primary' | 'secondary' | 'operational';
export type DocumentStatus = 'active' | 'amended' | 'partially_repealed' | 'repealed' | 'superseded' | 'expired';
export type SourceType = 'official_gazette' | 'government_portal' | 'wipo_lex' | 'office_website' | 'manual_upload';
export type SourceReliability = 'primary' | 'secondary' | 'tertiary';
export type ProcessingStatus = 'pending' | 'processing' | 'indexed' | 'failed' | 'needs_review';
export type ArticleType = 'title' | 'chapter' | 'section' | 'article' | 'paragraph' | 'item' | 'annex';
export type RelationType = 'repeals' | 'partially_repeals' | 'amends' | 'implements' | 'supersedes' | 'references' | 'complements' | 'conflicts_with';
export type TreatyStatus = 'member' | 'signatory' | 'not_member' | 'withdrawn';
export type FormType = 'application' | 'renewal' | 'assignment' | 'opposition' | 'appeal' | 'power_of_attorney' | 'declaration' | 'response' | 'withdrawal' | 'other';
export type ChangeType = 'new_law' | 'amendment' | 'repeal' | 'fee_change' | 'form_change' | 'deadline_change' | 'other';
export type ImpactLevel = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';
export type IngestionChannel = 'wipo_lex' | 'legal_crawler' | 'pdf_intelligence' | 'manual_upload';

export interface LegalDocument {
  id: string;
  office_id: string;
  title: string;
  title_original?: string;
  title_english?: string;
  document_level: DocumentLevel;
  document_type: string;
  official_number?: string;
  publication_date?: string;
  effective_date: string;
  expiry_date?: string;
  status: DocumentStatus;
  source_type: SourceType;
  source_url?: string;
  source_reliability: SourceReliability;
  language_original: string;
  languages_available?: string[];
  ip_types?: string[];
  applies_to_nationals?: boolean;
  applies_to_foreigners?: boolean;
  content_summary?: string;
  content_full?: string;
  content_url?: string;
  file_path?: string;
  file_hash?: string;
  file_size_bytes?: number;
  processing_status: ProcessingStatus;
  processing_error?: string;
  is_indexed: boolean;
  indexed_at?: string;
  chunk_count?: number;
  tags?: string[];
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_verified_at?: string;
  last_verified_by?: string;
}

export interface LegalDocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  version_label?: string;
  change_type: 'original' | 'amendment' | 'revision' | 'correction' | 'consolidation';
  change_description?: string;
  change_date: string;
  content_snapshot?: string;
  file_path?: string;
  file_hash?: string;
  diff_from_previous?: Record<string, unknown>;
  is_current: boolean;
  superseded_at?: string;
  superseded_by?: string;
  created_at: string;
}

export interface LegalArticle {
  id: string;
  document_id: string;
  version_id?: string;
  article_type: ArticleType;
  number?: string;
  full_reference?: string;
  parent_id?: string;
  hierarchy_path?: string;
  sort_order?: number;
  heading?: string;
  content: string;
  content_english?: string;
  status: 'active' | 'amended' | 'repealed' | 'suspended';
  ip_types?: string[];
  keywords?: string[];
  citation_format?: string;
  created_at: string;
  updated_at: string;
}

export interface LegalRelation {
  id: string;
  source_document_id: string;
  source_article_id?: string;
  target_document_id: string;
  target_article_id?: string;
  relation_type: RelationType;
  effective_date?: string;
  notes?: string;
  created_at: string;
}

export interface TreatyStatusRecord {
  id: string;
  office_id: string;
  treaty_code: string;
  treaty_name: string;
  status: TreatyStatus;
  ratification_date?: string;
  entry_into_force_date?: string;
  withdrawal_date?: string;
  has_reservations: boolean;
  reservations_text?: string;
  source_url?: string;
  last_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OfficialForm {
  id: string;
  office_id: string;
  form_code?: string;
  form_name: string;
  form_name_english?: string;
  form_type: FormType;
  ip_type?: string;
  file_path_original?: string;
  file_path_fillable?: string;
  file_format?: string;
  supports_efiling: boolean;
  efiling_url?: string;
  efiling_format?: string;
  efiling_schema?: string;
  requires_signature: boolean;
  requires_legalization: boolean;
  requires_notarization: boolean;
  language: string;
  version?: string;
  effective_date?: string;
  expiry_date?: string;
  status: string;
  last_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LegalChunk {
  id: string;
  document_id?: string;
  article_id?: string;
  chunk_index: number;
  chunk_text: string;
  chunk_size?: number;
  context_before?: string;
  context_after?: string;
  citation_info: {
    document_title?: string;
    official_number?: string;
    article?: string;
    full_citation?: string;
    source_url?: string;
    reliability?: string;
  };
  language?: string;
  office_id?: string;
  ip_types?: string[];
  keywords?: string[];
  created_at: string;
}

export interface IngestionJob {
  id: string;
  office_id?: string;
  channel: IngestionChannel;
  source_url?: string;
  config?: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'needs_review';
  started_at?: string;
  completed_at?: string;
  documents_found?: number;
  documents_imported?: number;
  documents_updated?: number;
  documents_skipped?: number;
  errors?: unknown[];
  created_by?: string;
  created_at: string;
}

export interface LegalChangeAlert {
  id: string;
  office_id: string;
  document_id?: string;
  change_type: ChangeType;
  title: string;
  summary?: string;
  impact_level: ImpactLevel;
  affected_ip_types?: string[];
  detected_at: string;
  effective_date?: string;
  status: AlertStatus;
  acknowledged_by?: string;
  acknowledged_at?: string;
  diff_data?: Record<string, unknown>;
  source_url?: string;
  created_at: string;
}

export interface FeeHistory {
  id: string;
  fee_id: string;
  amount_old?: number;
  amount_new: number;
  currency: string;
  change_date: string;
  change_reason?: string;
  source_document_id?: string;
  source_url?: string;
  created_at: string;
}

// Constants
export const DOCUMENT_LEVELS: Record<DocumentLevel, { label: string; color: string }> = {
  primary: { label: 'Primaria', color: 'bg-purple-100 text-purple-700' },
  secondary: { label: 'Secundaria', color: 'bg-blue-100 text-blue-700' },
  operational: { label: 'Operativa', color: 'bg-green-100 text-green-700' },
};

export const DOCUMENT_TYPES: Record<string, string> = {
  law: 'Ley',
  decree: 'Decreto',
  treaty: 'Tratado',
  constitution: 'Constitución',
  code: 'Código',
  examination_guide: 'Guía de Examen',
  manual: 'Manual',
  resolution: 'Resolución',
  directive: 'Directiva',
  guideline: 'Directriz',
  fee_schedule: 'Tabla de Tasas',
  form_template: 'Formulario',
  circular: 'Circular',
  notice: 'Aviso',
  faq: 'FAQ',
};

export const STATUS_LABELS: Record<DocumentStatus, { label: string; color: string }> = {
  active: { label: 'Vigente', color: 'bg-green-100 text-green-700' },
  amended: { label: 'Enmendada', color: 'bg-blue-100 text-blue-700' },
  partially_repealed: { label: 'Parcialmente derogada', color: 'bg-amber-100 text-amber-700' },
  repealed: { label: 'Derogada', color: 'bg-red-100 text-red-700' },
  superseded: { label: 'Reemplazada', color: 'bg-gray-100 text-gray-700' },
  expired: { label: 'Expirada', color: 'bg-gray-100 text-gray-700' },
};

export const RELIABILITY_LABELS: Record<SourceReliability, { label: string; color: string }> = {
  primary: { label: 'Oficial', color: 'bg-green-100 text-green-700' },
  secondary: { label: 'WIPO', color: 'bg-blue-100 text-blue-700' },
  tertiary: { label: 'No oficial', color: 'bg-amber-100 text-amber-700' },
};

export const IMPACT_LEVELS: Record<ImpactLevel, { label: string; color: string; bgColor: string }> = {
  critical: { label: 'Crítico', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
  high: { label: 'Alto', color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200' },
  medium: { label: 'Medio', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  low: { label: 'Bajo', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200' },
};

export const TREATIES = [
  { code: 'paris_convention', name: 'Paris Convention', category: 'general' },
  { code: 'madrid_protocol', name: 'Madrid Protocol', category: 'trademarks' },
  { code: 'madrid_agreement', name: 'Madrid Agreement', category: 'trademarks' },
  { code: 'pct', name: 'Patent Cooperation Treaty', category: 'patents' },
  { code: 'hague_agreement', name: 'Hague Agreement', category: 'designs' },
  { code: 'nice_agreement', name: 'Nice Agreement', category: 'classification' },
  { code: 'vienna_agreement', name: 'Vienna Agreement', category: 'classification' },
  { code: 'trips', name: 'TRIPS Agreement', category: 'general' },
  { code: 'singapore_treaty', name: 'Singapore Treaty', category: 'trademarks' },
  { code: 'trademark_law_treaty', name: 'Trademark Law Treaty', category: 'trademarks' },
  { code: 'lisbon_agreement', name: 'Lisbon Agreement', category: 'appellations' },
  { code: 'locarno_agreement', name: 'Locarno Agreement', category: 'classification' },
];
