// ============================================================
// P58: DOCUMENT GENERATION TYPES
// ============================================================

// Variable Definition
export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'textarea';
  source: 'auto' | 'manual' | 'ai';
  source_path?: string;
  required?: boolean;
  options?: string[];
}

// Template Categories
export type TemplateCategory = 
  | 'trademark' 
  | 'patent' 
  | 'contract' 
  | 'correspondence' 
  | 'report' 
  | 'other';

// Template Types
export type TemplateType = 'ai_assisted' | 'fill_blanks' | 'hybrid';

// Output Formats
export type OutputFormat = 'markdown' | 'html' | 'docx';

// Document Template
export interface DocumentTemplate {
  id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  category: TemplateCategory;
  template_type: TemplateType;
  template_content: string;
  variables: TemplateVariable[];
  ai_system_prompt: string | null;
  ai_user_prompt_template: string | null;
  ai_model: string;
  ai_temperature: number;
  ai_max_tokens: number;
  output_format: OutputFormat;
  is_active: boolean;
  is_public: boolean;
  usage_count: number;
  average_rating: number | null;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Generated Document Status
export type GeneratedDocumentStatus = 
  | 'draft' 
  | 'reviewing' 
  | 'approved' 
  | 'exported' 
  | 'archived';

// Generated Document
export interface GeneratedDocument {
  id: string;
  organization_id: string;
  template_id: string | null;
  matter_id: string | null;
  name: string;
  content: string;
  variables_input: Record<string, unknown> | null;
  variables_resolved: Record<string, unknown> | null;
  ai_prompt_used: string | null;
  ai_model_used: string | null;
  ai_tokens_used: number | null;
  generation_time_ms: number | null;
  version: number;
  parent_id: string | null;
  status: GeneratedDocumentStatus;
  exported_document_id: string | null;
  exported_at: string | null;
  export_format: string | null;
  user_rating: number | null;
  user_feedback: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  template?: DocumentTemplate;
  matter?: {
    id: string;
    title: string;
    reference?: string;
  };
}

// Form Data Types
export interface DocumentTemplateFormData {
  name: string;
  description?: string;
  category: TemplateCategory;
  template_type: TemplateType;
  template_content: string;
  variables: TemplateVariable[];
  ai_system_prompt?: string;
  ai_user_prompt_template?: string;
  ai_model?: string;
  ai_temperature?: number;
  ai_max_tokens?: number;
  output_format?: OutputFormat;
  is_active?: boolean;
  tags?: string[];
}

// Generation Request
export interface DocumentGenerationRequest {
  templateId: string;
  matterId?: string;
  variables: Record<string, string | number | null>;
}

// Generation Response
export interface DocumentGenerationResponse {
  content: string;
  variables: Record<string, unknown>;
  generationTime: number;
  tokensUsed?: number;
}

// Template Filters
export interface TemplateFilters {
  category?: TemplateCategory;
  search?: string;
  isPublic?: boolean;
}
