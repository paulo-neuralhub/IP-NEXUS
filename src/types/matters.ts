export type MatterType = 'trademark' | 'patent' | 'design' | 'domain' | 'copyright' | 'other';

export type MatterStatus = 'draft' | 'pending' | 'filed' | 'published' | 'granted' | 'active' | 'opposed' | 'expired' | 'abandoned' | 'cancelled';

export type MarkType = 'word' | 'figurative' | 'combined' | 'sound' | '3d' | 'other';

export type DocumentCategory = 'application' | 'certificate' | 'correspondence' | 'invoice' | 'report' | 'other';

export type EventType = 'status_change' | 'deadline' | 'filing' | 'publication' | 'grant' | 'renewal' | 'opposition' | 'note' | 'document' | 'other';

export interface Matter {
  id: string;
  organization_id: string;
  reference: string;
  title: string;
  type: MatterType;
  status: MatterStatus;
  // NEW (extended base schema)
  ip_type?: MatterType | null;
  status_code?: string | null;
  status_date?: string | null;
  filing_number?: string | null;
  priority_date?: string | null;
  priority_number?: string | null;
  priority_country?: string | null;
  auto_renewal?: boolean | null;
  renewal_instructions?: string | null;
  internal_notes?: string | null;
  estimated_value?: number | null;
  cost_center?: string | null;
  is_archived?: boolean | null;
  jurisdiction?: string | null;
  jurisdiction_code?: string | null;
  application_number?: string | null;
  registration_number?: string | null;
  filing_date?: string | null;
  registration_date?: string | null;
  expiry_date?: string | null;
  next_renewal_date?: string | null;
  mark_name?: string | null;
  mark_type?: MarkType | null;
  nice_classes?: number[] | null;
  goods_services?: string | null;
  owner_name?: string | null;
  assigned_to?: string | null;
  official_fees?: number | null;
  professional_fees?: number | null;
  total_cost?: number | null;
  currency?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  // NEW: Mark image and gallery
  mark_image_url?: string | null;
  images?: string[] | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface MatterDocument {
  id: string;
  matter_id: string;
  organization_id: string;
  name: string;
  file_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  category?: DocumentCategory | null;
  description?: string | null;
  is_official?: boolean | null;
  document_date?: string | null;
  expiry_date?: string | null;
  uploaded_by?: string | null;
  created_at: string;
}

export interface MatterEvent {
  id: string;
  matter_id: string;
  organization_id: string;
  type: EventType;
  title: string;
  description?: string | null;
  event_date?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface MatterFilters {
  search?: string;
  type?: MatterType | MatterType[];
  status?: MatterStatus | MatterStatus[];
  jurisdiction?: string;
  assigned_to?: string;
  tags?: string[];
}

// File type validations
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/tiff'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
