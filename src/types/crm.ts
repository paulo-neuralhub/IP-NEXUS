// ===== CONTACTS =====
export type ContactType = 'person' | 'company';

export type LifecycleStage = 
  | 'subscriber' 
  | 'lead' 
  | 'mql' 
  | 'sql' 
  | 'opportunity' 
  | 'customer' 
  | 'evangelist' 
  | 'other';

export interface Contact {
  id: string;
  organization_id: string;
  owner_type: 'tenant' | 'backoffice';
  type: ContactType;
  name: string;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  company_name?: string | null;
  job_title?: string | null;
  department?: string | null;
  tax_id?: string | null;
  website?: string | null;
  industry?: string | null;
  employee_count?: string | null;
  annual_revenue?: number | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  source?: string | null;
  source_detail?: string | null;
  assigned_to?: string | null;
  lifecycle_stage: LifecycleStage;
  tags?: string[] | null;
  custom_fields?: Record<string, unknown> | null;
  avatar_url?: string | null;
  notes?: string | null;
  last_contacted_at?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

// ===== PIPELINES =====
export type PipelineType = 'sales' | 'registration' | 'opposition' | 'renewal' | 'support' | 'custom';

export interface Pipeline {
  id: string;
  organization_id: string;
  owner_type: 'tenant' | 'backoffice';
  name: string;
  description?: string | null;
  pipeline_type: PipelineType;
  is_default: boolean;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  stages?: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  color: string;
  position: number;
  is_won_stage: boolean;
  is_lost_stage: boolean;
  probability: number;
  required_fields?: string[] | null;
  auto_actions?: unknown[] | null;
  created_at: string;
}

// ===== DEALS =====
export type DealStatus = 'open' | 'won' | 'lost';
export type DealPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Deal {
  id: string;
  organization_id: string;
  owner_type: 'tenant' | 'backoffice';
  pipeline_id: string;
  stage_id: string;
  title: string;
  description?: string | null;
  value?: number | null;
  currency: string;
  contact_id?: string | null;
  company_id?: string | null;
  matter_id?: string | null;
  assigned_to?: string | null;
  expected_close_date?: string | null;
  actual_close_date?: string | null;
  status: DealStatus;
  lost_reason?: string | null;
  won_reason?: string | null;
  tags?: string[] | null;
  custom_fields?: Record<string, unknown> | null;
  priority: DealPriority;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  closed_at?: string | null;
  // Relaciones cargadas
  contact?: Contact;
  stage?: PipelineStage;
}

// ===== ACTIVITIES =====
export type ActivityType = 
  | 'email' 
  | 'call' 
  | 'whatsapp' 
  | 'meeting' 
  | 'note' 
  | 'task' 
  | 'stage_change' 
  | 'document' 
  | 'deal_created'
  | 'deal_won'
  | 'deal_lost'
  | 'contact_created'
  | 'other';

export interface Activity {
  id: string;
  organization_id: string;
  owner_type: 'tenant' | 'backoffice';
  type: ActivityType;
  contact_id?: string | null;
  deal_id?: string | null;
  matter_id?: string | null;
  subject?: string | null;
  content?: string | null;
  metadata?: Record<string, unknown> | null;
  direction?: 'inbound' | 'outbound' | null;
  email_from?: string | null;
  email_to?: string[] | null;
  email_cc?: string[] | null;
  email_message_id?: string | null;
  call_duration?: number | null;
  call_outcome?: string | null;
  call_recording_url?: string | null;
  meeting_start?: string | null;
  meeting_end?: string | null;
  meeting_location?: string | null;
  meeting_attendees?: string[] | null;
  due_date?: string | null;
  completed_at?: string | null;
  is_completed?: boolean | null;
  created_by?: string | null;
  created_at: string;
}

// ===== FILTERS =====
export interface ContactFilters {
  search?: string;
  type?: ContactType;
  lifecycle_stage?: LifecycleStage | LifecycleStage[];
  assigned_to?: string;
  tags?: string[];
  source?: string;
}

export interface DealFilters {
  search?: string;
  pipeline_id?: string;
  stage_id?: string;
  status?: DealStatus;
  assigned_to?: string;
  contact_id?: string;
  priority?: DealPriority;
}
