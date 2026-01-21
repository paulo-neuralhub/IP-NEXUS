// ============================================================
// IP-NEXUS HELP & SUPPORT - TYPE DEFINITIONS
// ============================================================

export interface HelpCategory {
  id: string;
  slug: string;
  name: string;
  /** P77 bilingual fields (optional; kept for backward compatibility) */
  title?: string | null;
  title_es?: string | null;
  description: string | null;
  description_es?: string | null;
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  display_order: number;
  /** P77 ordering (optional; kept for backward compatibility) */
  sort_order?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  /** P77 bilingual fields (optional; kept for backward compatibility) */
  title_es?: string | null;
  summary: string | null;
  content: string;
  /** P77 bilingual fields (optional; kept for backward compatibility) */
  content_es?: string | null;
  excerpt?: string | null;
  excerpt_es?: string | null;
  category_id: string | null;
  category?: HelpCategory;
  tags: string[];
  module: string | null;
  article_type: 'guide' | 'tutorial' | 'faq' | 'troubleshooting' | 'reference' | 'video';
  featured_image: string | null;
  video_url: string | null;
  video_duration: number | null;
  meta_title: string | null;
  meta_description: string | null;
  display_order: number;
  /** P77 ordering (optional; kept for backward compatibility) */
  sort_order?: number | null;
  is_featured: boolean;
  is_published: boolean;
  /** P77 status (optional; kept for backward compatibility) */
  status?: 'draft' | 'published' | 'archived' | string | null;
  language: string;
  translations: Record<string, string>;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HelpArticleFeedback {
  id: string;
  article_id: string;
  user_id: string | null;
  organization_id: string | null;
  is_helpful: boolean;
  feedback_text: string | null;
  created_at: string;
}

export interface HelpFAQ {
  id: string;
  question: string;
  question_es: string;
  answer: string;
  answer_es: string;
  category: string;
  sort_order: number;
  is_active?: boolean;
  created_at?: string;
}

export interface SupportTicket {
  id: string;
  organization_id: string;
  user_id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: 'bug' | 'feature_request' | 'question' | 'billing' | 'account' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'waiting_internal' | 'resolved' | 'closed';
  assigned_to: string | null;
  assigned_at: string | null;
  affected_module: string | null;
  attachments: TicketAttachment[];
  browser_info: Record<string, any> | null;
  page_url: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  first_response_at: string | null;
  sla_due_at: string | null;
  satisfaction_rating: number | null;
  satisfaction_feedback: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  user?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  assigned_user?: {
    full_name: string;
    email: string;
  };
  messages?: TicketMessage[];
}

export interface TicketAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  author_type: 'customer' | 'agent' | 'system';
  author_id: string | null;
  author_name: string | null;
  message: string;
  attachments: TicketAttachment[];
  is_internal: boolean;
  created_at: string;
  // Relations
  author?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface HelpTooltip {
  id: string;
  tooltip_key: string;
  title: string | null;
  content: string;
  page_path: string | null;
  element_selector: string | null;
  help_article_id: string | null;
  help_url: string | null;
  tooltip_type: 'info' | 'tip' | 'warning' | 'new_feature';
  show_conditions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HelpTour {
  id: string;
  tour_key: string;
  name: string;
  description: string | null;
  steps: TourStep[];
  trigger_conditions: Record<string, any>;
  show_once: boolean;
  can_skip: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'bottom-end' | 'bottom-start';
  spotlight?: boolean;
}

export interface HelpTourProgress {
  id: string;
  user_id: string;
  tour_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  current_step: number;
  completed_at: string | null;
  skipped_at: string | null;
  created_at: string;
}

export interface HelpAnnouncement {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  announcement_type: 'feature' | 'improvement' | 'fix' | 'maintenance' | 'security' | 'deprecation';
  version: string | null;
  affected_modules: string[];
  audience: 'all' | 'admins' | 'enterprise' | 'beta';
  image_url: string | null;
  video_url: string | null;
  learn_more_url: string | null;
  is_featured: boolean;
  is_breaking_change: boolean;
  publish_at: string;
  expire_at: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Computed
  is_read?: boolean;
}

export interface HelpSystemStatus {
  id: string;
  component: string;
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance';
  title: string | null;
  description: string | null;
  impact: 'none' | 'minor' | 'major' | 'critical' | null;
  started_at: string;
  resolved_at: string | null;
  expected_resolution_at: string | null;
  updates: SystemStatusUpdate[];
  created_at: string;
  updated_at: string;
}

export interface SystemStatusUpdate {
  timestamp: string;
  message: string;
}

// Form types
export interface CreateTicketForm {
  subject: string;
  description: string;
  category: SupportTicket['category'];
  priority: SupportTicket['priority'];
  affected_module?: string;
  attachments?: File[];
}

export interface CreateArticleForm {
  slug: string;
  title: string;
  summary?: string;
  content: string;
  category_id?: string;
  tags?: string[];
  module?: string;
  article_type: HelpArticle['article_type'];
  featured_image?: string;
  video_url?: string;
  video_duration?: number;
  is_featured?: boolean;
  is_published?: boolean;
}
