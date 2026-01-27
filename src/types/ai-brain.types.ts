// ============================================================
// IP-NEXUS AI BRAIN - TYPE DEFINITIONS
// ============================================================

// AI Provider Types
export interface AIProvider {
  id: string;
  name: string;
  code: string;
  api_key_encrypted?: string | null;
  base_url?: string | null;
  is_gateway: boolean;
  supports_chat?: boolean;
  supports_embeddings?: boolean;
  supports_vision?: boolean;
  supports_tools?: boolean;
  status: 'active' | 'inactive' | 'error';
  health_status: 'healthy' | 'degraded' | 'down' | 'unknown';
  last_health_check_at?: string | null;
  health_latency_ms?: number | null;
  consecutive_failures?: number;
  logo_url?: string | null;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AIProviderFormData {
  name: string;
  code: string;
  api_key?: string;
  base_url?: string;
  is_gateway: boolean;
  status: 'active' | 'inactive' | 'error';
}

// AI Model Types
export interface AIModel {
  id: string;
  provider_id: string;
  model_id: string;
  name: string;
  capabilities: {
    vision?: boolean;
    tools?: boolean;
    streaming?: boolean;
    [key: string]: boolean | undefined;
  };
  context_window?: number | null;
  max_output_tokens?: number | null;
  input_cost_per_1m?: number | null;
  output_cost_per_1m?: number | null;
  is_active: boolean;
  tier: 'economy' | 'standard' | 'premium' | 'enterprise';
  speed_rating: number;
  quality_rating: number;
  discovered_at: string;
  deprecated_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  provider?: AIProvider;
}

export interface AIModelFormData {
  provider_id: string;
  model_id: string;
  name: string;
  capabilities: Record<string, boolean>;
  context_window?: number;
  max_output_tokens?: number;
  input_cost_per_1m?: number;
  output_cost_per_1m?: number;
  is_active: boolean;
  tier: 'economy' | 'standard' | 'premium' | 'enterprise';
  speed_rating: number;
  quality_rating: number;
}

// AI Task Assignment Types
export type TaskCategory = 'agent' | 'analysis' | 'generation' | 'classification' | 'general';

export interface AITaskAssignment {
  id: string;
  task_code: string;
  task_name: string;
  description?: string | null;
  category: TaskCategory;
  module?: string | null;
  edge_function?: string | null;
  requires_vision?: boolean;
  requires_tools?: boolean;
  primary_model_id?: string | null;
  fallback_1_model_id?: string | null;
  fallback_2_model_id?: string | null;
  prompt_id?: string | null;
  system_prompt_override?: string | null;
  temperature: number;
  max_tokens: number;
  timeout_ms: number;
  max_retries: number;
  rag_enabled: boolean;
  rag_collection_ids: string[];
  rag_top_k: number;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  // Joined data
  primary_model?: AIModel;
  fallback_1_model?: AIModel;
  fallback_2_model?: AIModel;
}

export interface AITaskAssignmentFormData {
  task_code: string;
  task_name: string;
  description?: string;
  category: TaskCategory;
  primary_model_id?: string;
  fallback_1_model_id?: string;
  fallback_2_model_id?: string;
  temperature: number;
  max_tokens: number;
  timeout_ms: number;
  max_retries: number;
  rag_enabled: boolean;
  rag_collection_ids: string[];
  rag_top_k: number;
  is_active: boolean;
}

// Circuit Breaker Types
export type CircuitState = 'closed' | 'open' | 'half_open';

export interface AICircuitBreakerState {
  id: string;
  provider_id: string;
  state: CircuitState;
  failure_count: number;
  success_count: number;
  last_failure_at?: string | null;
  last_success_at?: string | null;
  opened_at?: string | null;
  half_open_at?: string | null;
  failure_threshold: number;
  success_threshold: number;
  open_duration_ms: number;
  total_requests: number;
  total_failures: number;
  avg_latency_ms?: number | null;
  p95_latency_ms?: number | null;
  updated_at: string;
  // Joined data
  provider?: AIProvider;
}

// Request Log Types
export type RequestStatus = 'success' | 'error' | 'timeout' | 'rate_limited' | 'fallback_used';

export interface AIRequestLog {
  id: string;
  organization_id?: string | null;
  user_id?: string | null;
  task_code: string;
  model_id?: string | null;
  provider_id?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  cost_usd?: number | null;
  latency_ms?: number | null;
  time_to_first_token_ms?: number | null;
  status: RequestStatus;
  error_message?: string | null;
  fallback_used: boolean;
  fallback_model_id?: string | null;
  conversation_id?: string | null;
  request_metadata: Record<string, unknown>;
  created_at: string;
}

// RAG Collection Types
export interface AIRAGCollection {
  id: string;
  name: string;
  description?: string | null;
  collection_type: string;
  embedding_model: string;
  embedding_dimensions: number;
  chunk_size: number;
  chunk_overlap: number;
  document_count: number;
  chunk_count: number;
  total_tokens: number;
  auto_update_enabled: boolean;
  update_frequency?: string | null;
  last_updated_at?: string | null;
  next_update_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIRAGCollectionFormData {
  name: string;
  description?: string;
  collection_type: string;
  embedding_model: string;
  chunk_size: number;
  chunk_overlap: number;
  auto_update_enabled: boolean;
  update_frequency?: string;
  is_active: boolean;
}

// Usage Aggregate Types
export type PeriodType = 'hourly' | 'daily' | 'monthly';

export interface AIUsageAggregate {
  id: string;
  organization_id?: string | null;
  period_type: PeriodType;
  period_start: string;
  period_end: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_usd: number;
  by_task: Record<string, { requests: number; tokens: number; cost: number }>;
  by_model: Record<string, { requests: number; tokens: number; cost: number }>;
  avg_latency_ms?: number | null;
  p50_latency_ms?: number | null;
  p95_latency_ms?: number | null;
  p99_latency_ms?: number | null;
  created_at: string;
  updated_at: string;
}

// Rate Limit Types
export interface AIRateLimit {
  id: string;
  organization_id: string;
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  tokens_per_minute: number;
  tokens_per_day: number;
  current_minute_requests: number;
  current_hour_requests: number;
  current_day_requests: number;
  current_minute_tokens: number;
  current_day_tokens: number;
  minute_reset_at?: string | null;
  hour_reset_at?: string | null;
  day_reset_at?: string | null;
  updated_at: string;
}

// Analytics Types
export interface AIAnalyticsSummary {
  totalRequests: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  totalCost: number;
  avgLatency: number;
  successRate: number;
  byProvider: Array<{
    provider: string;
    requests: number;
    cost: number;
    percentage: number;
  }>;
  byTask: Array<{
    task: string;
    requests: number;
    cost: number;
    percentage: number;
  }>;
  byDay: Array<{
    date: string;
    requests: number;
    cost: number;
    tokens: number;
  }>;
}

// Task Router Config for Edge Functions
export interface TaskRouterConfig {
  task_code: string;
  model_id: string;
  provider_code: string;
  system_prompt?: string;
  temperature: number;
  max_tokens: number;
  timeout_ms: number;
  fallbacks: Array<{
    model_id: string;
    provider_code: string;
  }>;
}
