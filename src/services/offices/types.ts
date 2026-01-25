// =====================================================
// IP OFFICES CONNECTION - Types
// =====================================================

export interface IpoOffice {
  id: string;
  code: string;
  code_alt?: string;
  name_official: string;
  name_short?: string;
  country_code?: string;
  region?: string;
  office_type?: string;
  ip_types?: string[];
  timezone?: string;
  languages?: string[];
  currency?: string;
  website_official?: string;
  website_search?: string;
  
  // API/Connection config
  data_source_type?: 'api' | 'scraping' | 'file_import' | 'manual' | 'ocr' | 'mixed';
  api_base_url?: string;
  api_version?: string;
  auth_type?: 'none' | 'api_key' | 'oauth2' | 'certificate' | 'scraping';
  
  // Capabilities
  supports_search?: boolean;
  supports_status?: boolean;
  supports_documents?: boolean;
  supports_events?: boolean;
  supports_fees?: boolean;
  
  // Rate limits
  rate_limit_per_minute?: number;
  rate_limit_per_day?: number;
  
  // Status
  is_active?: boolean;
  operational_status?: 'operational' | 'degraded' | 'maintenance' | 'down';
  last_health_check?: string;
  avg_response_time_ms?: number;
  
  // URLs
  fees_url?: string;
}

export interface SearchQuery {
  term: string;
  searchType?: 'exact' | 'phonetic' | 'fuzzy' | 'contains';
  niceClasses?: number[];
  filingDateFrom?: string;
  filingDateTo?: string;
  status?: string[];
  owner?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  applicationNumber: string;
  registrationNumber?: string;
  markName?: string;
  status: string;
  normalizedStatus?: string;
  filingDate?: string;
  registrationDate?: string;
  expiryDate?: string;
  applicant?: string;
  niceClasses?: number[];
  imageUrl?: string;
  sourceUrl?: string;
}

export interface Party {
  name: string;
  address?: string;
  country?: string;
  role?: string;
}

export interface OfficeEvent {
  date: string;
  code: string;
  description: string;
}

export interface ApplicationStatus {
  applicationNumber: string;
  registrationNumber?: string;
  status: string;
  normalizedStatus: string;
  statusDate?: string;
  
  // Key dates
  filingDate?: string;
  priorityDate?: string;
  publicationDate?: string;
  registrationDate?: string;
  expiryDate?: string;
  nextRenewalDate?: string;
  
  // Details
  markName?: string;
  markType?: string;
  niceClasses?: number[];
  goodsServices?: string;
  
  // Parties
  applicants?: Party[];
  representatives?: Party[];
  
  // Events
  events?: OfficeEvent[];
  
  // Flags
  hasOpposition?: boolean;
  hasNewDocuments?: boolean;
  documentsCount?: number;
}

export interface OfficeFee {
  id: string;
  code: string;
  name: string;
  description?: string;
  office: string;
  ip_type?: string;
  fee_type?: string;
  amount: number;
  currency: string;
  per_class?: boolean;
  base_classes?: number;
  extra_class_fee?: number;
  effective_from?: string;
  effective_until?: string;
  is_current?: boolean;
  source_url?: string;
}

export interface DocumentInfo {
  id: string;
  type: string;
  date: string;
  title: string;
  description?: string;
  pages?: number;
  downloadable: boolean;
}

export interface StatusMapping {
  id: string;
  office_code: string;
  office_status: string;
  normalized_status: string;
  status_category?: string;
  creates_deadline: boolean;
  deadline_type_code?: string;
}

export interface SyncConfig {
  id: string;
  tenant_id: string;
  sync_status: boolean;
  sync_documents: boolean;
  auto_create_deadlines: boolean;
  notify_on_status_change: boolean;
  notify_on_new_document: boolean;
  notification_email?: string;
  sync_matter_types: string[];
  sync_matter_statuses: string[];
}

export interface SyncHistoryEntry {
  id: string;
  tenant_id: string;
  sync_type: 'scheduled' | 'manual' | 'webhook';
  triggered_by?: string;
  status: 'running' | 'completed' | 'partial' | 'failed';
  matters_checked: number;
  matters_updated: number;
  documents_downloaded: number;
  deadlines_created: number;
  errors_count: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface FileImport {
  id: string;
  tenant_id: string;
  office_code: string;
  file_name: string;
  file_path?: string;
  file_type: string;
  file_size?: number;
  import_status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  processing_method?: string;
  records_found: number;
  records_imported: number;
  records_updated: number;
  records_failed: number;
  requires_review: boolean;
  created_at: string;
  processed_at?: string;
}

export interface ReviewQueueItem {
  id: string;
  import_id: string;
  matter_id?: string;
  extracted_data: Record<string, unknown>;
  confidence_score: number;
  current_data: Record<string, unknown>;
  fields_to_review: string[];
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  final_data?: Record<string, unknown>;
  review_notes?: string;
}

export interface FeesCalculation {
  officialFees: number;
  professionalFees: number;
  total: number;
  currency: string;
  breakdown: Array<{
    code: string;
    name: string;
    amount: number;
    quantity: number;
    subtotal: number;
  }>;
}
