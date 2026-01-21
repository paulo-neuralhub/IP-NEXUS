import type { Matter } from './matters';

// ===== AGENTES =====
export type AgentType = 'guide' | 'ops' | 'legal' | 'watch' | 'docs' | 'translator';

export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  icon: string;
  color: string;
  capabilities: string[];
}

// ===== MODOS ESPECIALIZADOS =====
export type GeniusMode = 
  | 'general'           // Consultas generales de PI
  | 'patent_drafting'   // Redacción de patentes
  | 'trademark_search'  // Búsqueda de marcas similares
  | 'contract_review'   // Revisión de contratos
  | 'office_action'     // Respuesta a acciones de oficina
  | 'valuation'         // Valoración de activos
  | 'prior_art'         // Búsqueda de estado de la técnica
  | 'freedom_to_operate' // Análisis FTO
  | 'portfolio_strategy' // Estrategia de portfolio
  | 'translator';       // Traducción legal

export interface GeniusModeConfig {
  id: GeniusMode;
  name: { en: string; es: string };
  description: { en: string; es: string };
  icon: string;
  systemPrompt: string;
  suggestedQuestions: string[];
  requiredContext?: string[];
}

// ===== CONVERSACIONES =====
export type ConversationContextType = 'general' | 'matter' | 'contact' | 'document';

export interface AIConversation {
  id: string;
  organization_id: string;
  user_id: string;
  title?: string;
  agent_type: AgentType;
  matter_id?: string;
  contact_id?: string;
  document_id?: string;
  context_type?: ConversationContextType;
  context_id?: string;
  status: 'active' | 'archived';
  is_starred: boolean;
  is_pinned?: boolean;
  message_count: number;
  token_count: number;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  // Relaciones
  matter?: Matter;
  messages?: AIMessage[];
}

// ===== MENSAJES =====
export interface AIActionTaken {
  type: 'search_matters' | 'create_task' | 'get_deadlines' | 'search_contacts';
  results?: number;
  title?: string;
  data?: Record<string, unknown>;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used?: number;
  tokens_input?: number;
  tokens_output?: number;
  model_used?: string;
  sources?: AISource[];
  actions_taken?: AIActionTaken[];
  response_time_ms?: number;
  feedback?: 'positive' | 'negative';
  feedback_comment?: string;
  created_at: string;
}

export interface AISource {
  type: 'knowledge_base' | 'matter' | 'document' | 'web';
  id: string;
  title: string;
  excerpt?: string;
  relevance?: number;
  url?: string;
}

// ===== BASE DE CONOCIMIENTO =====
export type KnowledgeCategory = 
  | 'legislation'
  | 'case_law'
  | 'guidelines'
  | 'treaties'
  | 'procedures'
  | 'forms'
  | 'glossary'
  | 'faq';

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  title: string;
  description?: string;
  jurisdiction?: string;
  source?: string;
  source_url?: string;
  content: string;
  content_type: 'text' | 'markdown' | 'html';
  language: string;
  tags: string[];
  effective_date?: string;
  expiry_date?: string;
  is_current: boolean;
  created_at: string;
}

// ===== DOCUMENTOS GENERADOS =====
export type GeneratedDocType = 
  | 'opposition'
  | 'response'
  | 'renewal'
  | 'assignment'
  | 'license'
  | 'coexistence'
  | 'cease_desist'
  | 'watch_report'
  | 'valuation'
  | 'summary'
  | 'custom';

export interface AIGeneratedDocument {
  id: string;
  organization_id: string;
  conversation_id?: string;
  document_type: GeneratedDocType;
  title: string;
  content: string;
  content_format: string;
  matter_id?: string;
  version: number;
  parent_id?: string;
  status: 'draft' | 'review' | 'approved' | 'exported';
  created_by?: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

// ===== USO =====
export interface AIUsage {
  id: string;
  organization_id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  messages_count: number;
  tokens_input: number;
  tokens_output: number;
  chat_messages: number;
  document_analyses: number;
  document_generations: number;
  estimated_cost_cents: number;
}

// ===== PLANTILLAS =====
export interface PromptTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  agent_type: AgentType;
  category?: string;
  system_prompt: string;
  user_prompt_template?: string;
  default_model: string;
  default_temperature: number;
  max_tokens: number;
  is_active: boolean;
}

// ===== DOCUMENT CHUNKS (RAG) =====
export interface DocumentChunk {
  id: string;
  source_type: 'knowledge_base' | 'matter_document' | 'uploaded_file';
  source_id: string;
  organization_id?: string;
  chunk_index: number;
  content: string;
  tokens?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ===== CHAT REQUEST =====
export interface ChatRequest {
  conversation_id?: string;
  agent_type: AgentType;
  message: string;
  context?: {
    matter_id?: string;
    document_content?: string;
    include_portfolio?: boolean;
  };
}

export interface ChatResponse {
  conversation_id: string;
  message: AIMessage;
}

// ===== FILTERS =====
export interface ConversationFilters {
  agent_type?: AgentType;
  status?: 'active' | 'archived';
  is_starred?: boolean;
  search?: string;
  matter_id?: string;
}
