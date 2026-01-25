// =============================================
// DOCKET GOD MODE - TYPES
// =============================================

import type { TaskType, TaskStatus, TaskPriority, RelationType, RuleType, TriggerEvent } from '@/lib/constants/docket-god-mode';

export interface Portfolio {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  parent_portfolio_id?: string;
  owner_id?: string;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Computed
  matter_count?: number;
  children?: Portfolio[];
}

export interface JurisdictionRule {
  id: string;
  organization_id?: string;
  jurisdiction_code: string;
  ip_type: string;
  rule_type: RuleType;
  rule_name: string;
  description?: string;
  base_days: number;
  business_days_only: boolean;
  exclude_holidays: boolean;
  holiday_calendar?: string;
  trigger_event: TriggerEvent;
  priority: number;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SmartTask {
  id: string;
  organization_id: string;
  matter_id?: string;
  portfolio_id?: string;
  
  title: string;
  description?: string;
  task_type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  
  // Date Trident
  trigger_date?: string;
  reminder_date?: string;
  due_date: string;
  grace_period_days: number;
  
  // Assignment
  assigned_to?: string;
  assigned_by?: string;
  
  // Automation
  rule_id?: string;
  is_auto_generated: boolean;
  auto_action?: Record<string, unknown>;
  
  // Tracking
  started_at?: string;
  completed_at?: string;
  completed_by?: string;
  cancelled_at?: string;
  cancelled_reason?: string;
  
  // Related
  parent_task_id?: string;
  blocking_task_ids: string[];
  
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  
  // Joined data
  matter?: {
    id: string;
    title: string;
    reference?: string;
    ip_type: string;
    jurisdiction: string;
  };
  assigned_user?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  rule?: JurisdictionRule;
  comments_count?: number;
}

export interface MatterFamilyRelation {
  id: string;
  organization_id: string;
  parent_matter_id: string;
  child_matter_id: string;
  relation_type: RelationType;
  priority_date?: string;
  claim_numbers?: string[];
  notes?: string;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  created_at: string;
  updated_at: string;
  // Joined
  user?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface EmailIngestionItem {
  id: string;
  organization_id: string;
  source: string;
  message_id?: string;
  from_address?: string;
  to_addresses?: string[];
  subject?: string;
  body_text?: string;
  body_html?: string;
  attachments: Array<{
    filename: string;
    content_type: string;
    size: number;
    url?: string;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review';
  processing_started_at?: string;
  processing_completed_at?: string;
  extracted_data?: {
    matter_reference?: string;
    deadline_dates?: string[];
    action_required?: string;
    sender_type?: 'office' | 'client' | 'agent' | 'unknown';
    confidence: number;
  };
  matched_matter_id?: string;
  created_tasks: string[];
  error_message?: string;
  retry_count: number;
  created_at: string;
}

export interface Holiday {
  id: string;
  country_code: string;
  region_code?: string;
  date: string;
  name: string;
  type: string;
  is_recurring: boolean;
  recurring_month?: number;
  recurring_day?: number;
  created_at: string;
}

// Family Tree Node (for ReactFlow)
export interface FamilyTreeNode {
  id: string;
  parent_id?: string;
  relation_type: string;
  title: string;
  reference?: string;
  ip_type: string;
  status: string;
  jurisdiction: string;
  filing_date?: string;
  depth: number;
}

// Filters
export interface SmartTaskFilters {
  search?: string;
  statuses?: TaskStatus[];
  priorities?: TaskPriority[];
  types?: TaskType[];
  assignedTo?: string;
  matterId?: string;
  portfolioId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  isOverdue?: boolean;
}

export interface PortfolioFilters {
  search?: string;
  isActive?: boolean;
  parentId?: string;
  ownerId?: string;
}

// Create/Update DTOs
export interface CreateSmartTaskDTO {
  matter_id?: string;
  portfolio_id?: string;
  title: string;
  description?: string;
  task_type: TaskType;
  priority?: TaskPriority;
  trigger_date?: string;
  reminder_date?: string;
  due_date: string;
  grace_period_days?: number;
  assigned_to?: string;
  parent_task_id?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateSmartTaskDTO extends Partial<CreateSmartTaskDTO> {
  status?: TaskStatus;
  cancelled_reason?: string;
}

export interface CreatePortfolioDTO {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parent_portfolio_id?: string;
  owner_id?: string;
  settings?: Record<string, unknown>;
}

export interface CreateFamilyRelationDTO {
  parent_matter_id: string;
  child_matter_id: string;
  relation_type: RelationType;
  priority_date?: string;
  claim_numbers?: string[];
  notes?: string;
}

export interface CreateJurisdictionRuleDTO {
  jurisdiction_code: string;
  ip_type: string;
  rule_type: RuleType;
  rule_name: string;
  description?: string;
  base_days: number;
  business_days_only?: boolean;
  exclude_holidays?: boolean;
  holiday_calendar?: string;
  trigger_event: TriggerEvent;
  priority?: number;
  conditions?: Record<string, unknown>;
  actions?: Record<string, unknown>;
}

// Dashboard Stats
export interface DocketDashboardStats {
  totalTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completedThisWeek: number;
  upcomingDeadlines: SmartTask[];
  tasksByPriority: Record<TaskPriority, number>;
  tasksByType: Record<TaskType, number>;
}
