export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          call_duration: number | null
          call_outcome: string | null
          call_recording_url: string | null
          completed_at: string | null
          contact_id: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          deal_id: string | null
          direction: string | null
          due_date: string | null
          email_cc: string[] | null
          email_from: string | null
          email_message_id: string | null
          email_to: string[] | null
          id: string
          is_completed: boolean | null
          matter_id: string | null
          meeting_attendees: string[] | null
          meeting_end: string | null
          meeting_location: string | null
          meeting_start: string | null
          metadata: Json | null
          organization_id: string
          owner_type: string
          subject: string | null
          type: string
        }
        Insert: {
          call_duration?: number | null
          call_outcome?: string | null
          call_recording_url?: string | null
          completed_at?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          direction?: string | null
          due_date?: string | null
          email_cc?: string[] | null
          email_from?: string | null
          email_message_id?: string | null
          email_to?: string[] | null
          id?: string
          is_completed?: boolean | null
          matter_id?: string | null
          meeting_attendees?: string[] | null
          meeting_end?: string | null
          meeting_location?: string | null
          meeting_start?: string | null
          metadata?: Json | null
          organization_id: string
          owner_type?: string
          subject?: string | null
          type: string
        }
        Update: {
          call_duration?: number | null
          call_outcome?: string | null
          call_recording_url?: string | null
          completed_at?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          direction?: string | null
          due_date?: string | null
          email_cc?: string[] | null
          email_from?: string | null
          email_message_id?: string | null
          email_to?: string[] | null
          id?: string
          is_completed?: boolean | null
          matter_id?: string | null
          meeting_attendees?: string[] | null
          meeting_end?: string | null
          meeting_location?: string | null
          meeting_start?: string | null
          metadata?: Json | null
          organization_id?: string
          owner_type?: string
          subject?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          agent_type: string
          contact_id: string | null
          created_at: string | null
          document_id: string | null
          id: string
          is_starred: boolean | null
          last_message_at: string | null
          matter_id: string | null
          message_count: number | null
          organization_id: string
          status: string | null
          title: string | null
          token_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_type?: string
          contact_id?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          is_starred?: boolean | null
          last_message_at?: string | null
          matter_id?: string | null
          message_count?: number | null
          organization_id: string
          status?: string | null
          title?: string | null
          token_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_type?: string
          contact_id?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          is_starred?: boolean | null
          last_message_at?: string | null
          matter_id?: string | null
          message_count?: number | null
          organization_id?: string
          status?: string | null
          title?: string | null
          token_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "matter_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generated_documents: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content: string
          content_format: string | null
          conversation_id: string | null
          created_at: string | null
          created_by: string | null
          document_type: string
          id: string
          matter_id: string | null
          organization_id: string
          parent_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content: string
          content_format?: string | null
          conversation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type: string
          id?: string
          matter_id?: string | null
          organization_id: string
          parent_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content?: string
          content_format?: string | null
          conversation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type?: string
          id?: string
          matter_id?: string | null
          organization_id?: string
          parent_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_documents_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_documents_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_documents_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_documents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ai_generated_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_glossary_terms: {
        Row: {
          context: string | null
          created_at: string | null
          glossary_id: string
          id: string
          source_term: string
          target_term: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          glossary_id: string
          id?: string
          source_term: string
          target_term: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          glossary_id?: string
          id?: string
          source_term?: string
          target_term?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_glossary_terms_glossary_id_fkey"
            columns: ["glossary_id"]
            isOneToOne: false
            referencedRelation: "ai_translation_glossaries"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          feedback: string | null
          feedback_comment: string | null
          id: string
          model_used: string | null
          role: string
          sources: Json | null
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          feedback?: string | null
          feedback_comment?: string | null
          id?: string
          model_used?: string | null
          role: string
          sources?: Json | null
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          feedback?: string | null
          feedback_comment?: string | null
          id?: string
          model_used?: string | null
          role?: string
          sources?: Json | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompt_templates: {
        Row: {
          agent_type: string
          category: string | null
          code: string
          created_at: string | null
          default_model: string | null
          default_temperature: number | null
          description: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          name: string
          system_prompt: string
          updated_at: string | null
          user_prompt_template: string | null
        }
        Insert: {
          agent_type: string
          category?: string | null
          code: string
          created_at?: string | null
          default_model?: string | null
          default_temperature?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          name: string
          system_prompt: string
          updated_at?: string | null
          user_prompt_template?: string | null
        }
        Update: {
          agent_type?: string
          category?: string | null
          code?: string
          created_at?: string | null
          default_model?: string | null
          default_temperature?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          name?: string
          system_prompt?: string
          updated_at?: string | null
          user_prompt_template?: string | null
        }
        Relationships: []
      }
      ai_translation_glossaries: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          is_official: boolean | null
          is_public: boolean | null
          name: string
          organization_id: string | null
          source_language: string
          target_language: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          is_official?: boolean | null
          is_public?: boolean | null
          name: string
          organization_id?: string | null
          source_language: string
          target_language: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          is_official?: boolean | null
          is_public?: boolean | null
          name?: string
          organization_id?: string | null
          source_language?: string
          target_language?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_translation_glossaries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_translations: {
        Row: {
          character_count: number | null
          completed_at: string | null
          confidence_score: number | null
          created_at: string | null
          disclaimer_accepted: boolean | null
          disclaimer_accepted_at: string | null
          document_type: string
          glossary_id: string | null
          id: string
          organization_id: string
          processing_time_ms: number | null
          source_language: string
          source_text: string
          status: string | null
          target_language: string
          terms_used: Json | null
          translated_text: string | null
          user_id: string
          word_count: number | null
        }
        Insert: {
          character_count?: number | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          disclaimer_accepted?: boolean | null
          disclaimer_accepted_at?: string | null
          document_type: string
          glossary_id?: string | null
          id?: string
          organization_id: string
          processing_time_ms?: number | null
          source_language: string
          source_text: string
          status?: string | null
          target_language: string
          terms_used?: Json | null
          translated_text?: string | null
          user_id: string
          word_count?: number | null
        }
        Update: {
          character_count?: number | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          disclaimer_accepted?: boolean | null
          disclaimer_accepted_at?: string | null
          document_type?: string
          glossary_id?: string | null
          id?: string
          organization_id?: string
          processing_time_ms?: number | null
          source_language?: string
          source_text?: string
          status?: string | null
          target_language?: string
          terms_used?: Json | null
          translated_text?: string | null
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_translations_glossary_id_fkey"
            columns: ["glossary_id"]
            isOneToOne: false
            referencedRelation: "ai_translation_glossaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_translations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage: {
        Row: {
          chat_messages: number | null
          created_at: string | null
          document_analyses: number | null
          document_generations: number | null
          estimated_cost_cents: number | null
          id: string
          messages_count: number | null
          organization_id: string
          period_end: string
          period_start: string
          tokens_input: number | null
          tokens_output: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chat_messages?: number | null
          created_at?: string | null
          document_analyses?: number | null
          document_generations?: number | null
          estimated_cost_cents?: number | null
          id?: string
          messages_count?: number | null
          organization_id: string
          period_end: string
          period_start: string
          tokens_input?: number | null
          tokens_output?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chat_messages?: number | null
          created_at?: string | null
          document_analyses?: number | null
          document_generations?: number | null
          estimated_cost_cents?: number | null
          id?: string
          messages_count?: number | null
          organization_id?: string
          period_end?: string
          period_start?: string
          tokens_input?: number | null
          tokens_output?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_connections: {
        Row: {
          config: Json | null
          created_at: string | null
          credentials: Json | null
          id: string
          is_active: boolean | null
          last_error: string | null
          last_sync_at: string | null
          organization_id: string
          provider: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          credentials?: Json | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          organization_id: string
          provider: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          credentials?: Json | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          organization_id?: string
          provider?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          allowed_ips: Json | null
          allowed_origins: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          rate_limit_per_day: number | null
          rate_limit_per_minute: number | null
          scopes: Json | null
        }
        Insert: {
          allowed_ips?: Json | null
          allowed_origins?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          scopes?: Json | null
        }
        Update: {
          allowed_ips?: Json | null
          allowed_origins?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          scopes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_logs: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          endpoint: string
          error_message: string | null
          id: string
          ip_address: string | null
          method: string
          organization_id: string | null
          query_params: Json | null
          request_body: Json | null
          response_size_bytes: number | null
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          method: string
          organization_id?: string | null
          query_params?: Json | null
          request_body?: Json | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          method?: string
          organization_id?: string | null
          query_params?: Json | null
          request_body?: Json | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_rate_limits: {
        Row: {
          api_key_id: string
          id: string
          request_count: number | null
          window_start: string
          window_type: string
        }
        Insert: {
          api_key_id: string
          id?: string
          request_count?: number | null
          window_start: string
          window_type: string
        }
        Update: {
          api_key_id?: string
          id?: string
          request_count?: number | null
          window_start?: string
          window_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_rate_limits_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          description: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_enrollments: {
        Row: {
          action_history: Json | null
          automation_id: string
          completed_at: string | null
          contact_id: string
          current_action_id: string | null
          enrolled_at: string | null
          exit_reason: string | null
          exited_at: string | null
          id: string
          metadata: Json | null
          next_action_at: string | null
          status: string | null
        }
        Insert: {
          action_history?: Json | null
          automation_id: string
          completed_at?: string | null
          contact_id: string
          current_action_id?: string | null
          enrolled_at?: string | null
          exit_reason?: string | null
          exited_at?: string | null
          id?: string
          metadata?: Json | null
          next_action_at?: string | null
          status?: string | null
        }
        Update: {
          action_history?: Json | null
          automation_id?: string
          completed_at?: string | null
          contact_id?: string
          current_action_id?: string | null
          enrolled_at?: string | null
          exit_reason?: string | null
          exited_at?: string | null
          id?: string
          metadata?: Json | null
          next_action_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_enrollments_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_enrollments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          actions: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          filter_conditions: Json | null
          id: string
          name: string
          organization_id: string
          owner_type: string
          status: string | null
          total_completed: number | null
          total_enrolled: number | null
          total_exited: number | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          actions?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filter_conditions?: Json | null
          id?: string
          name: string
          organization_id: string
          owner_type?: string
          status?: string | null
          total_completed?: number | null
          total_enrolled?: number | null
          total_exited?: number | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filter_conditions?: Json | null
          id?: string
          name?: string
          organization_id?: string
          owner_type?: string
          status?: string | null
          total_completed?: number | null
          total_enrolled?: number | null
          total_exited?: number | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_clients: {
        Row: {
          billing_address: string | null
          billing_city: string | null
          billing_country: string | null
          billing_email: string | null
          billing_phone: string | null
          billing_postal_code: string | null
          billing_state: string | null
          contact_id: string | null
          created_at: string | null
          default_currency: string | null
          id: string
          is_active: boolean | null
          legal_name: string
          notes: string | null
          organization_id: string
          payment_terms: number | null
          tax_exempt: boolean | null
          tax_id: string | null
          tax_id_type: string | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_email?: string | null
          billing_phone?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          contact_id?: string | null
          created_at?: string | null
          default_currency?: string | null
          id?: string
          is_active?: boolean | null
          legal_name: string
          notes?: string | null
          organization_id: string
          payment_terms?: number | null
          tax_exempt?: boolean | null
          tax_id?: string | null
          tax_id_type?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_email?: string | null
          billing_phone?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          contact_id?: string | null
          created_at?: string | null
          default_currency?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string
          notes?: string | null
          organization_id?: string
          payment_terms?: number | null
          tax_exempt?: boolean | null
          tax_id?: string | null
          tax_id_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_clients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      blockchain_timestamps: {
        Row: {
          block_number: number | null
          block_timestamp: string | null
          blockchain: string | null
          certificate_data: Json | null
          certificate_url: string | null
          confirmed_at: string | null
          content_hash: string
          created_at: string | null
          created_by: string | null
          error_message: string | null
          file_hash: string
          file_name: string | null
          file_size: number | null
          id: string
          metadata: Json | null
          organization_id: string
          resource_id: string | null
          resource_type: string
          status: string | null
          submitted_at: string | null
          tx_hash: string | null
        }
        Insert: {
          block_number?: number | null
          block_timestamp?: string | null
          blockchain?: string | null
          certificate_data?: Json | null
          certificate_url?: string | null
          confirmed_at?: string | null
          content_hash: string
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          file_hash: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          organization_id: string
          resource_id?: string | null
          resource_type: string
          status?: string | null
          submitted_at?: string | null
          tx_hash?: string | null
        }
        Update: {
          block_number?: number | null
          block_timestamp?: string | null
          blockchain?: string | null
          certificate_data?: Json | null
          certificate_url?: string | null
          confirmed_at?: string | null
          content_hash?: string
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          file_hash?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          resource_id?: string | null
          resource_type?: string
          status?: string | null
          submitted_at?: string | null
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_timestamps_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blockchain_timestamps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_list_members: {
        Row: {
          added_at: string | null
          added_by: string | null
          contact_id: string
          id: string
          list_id: string
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          contact_id: string
          id?: string
          list_id: string
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          contact_id?: string
          id?: string
          list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_list_members_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_list_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_list_members_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_lists: {
        Row: {
          contact_count: number | null
          created_at: string | null
          description: string | null
          filter_conditions: Json | null
          id: string
          is_active: boolean | null
          last_count_at: string | null
          name: string
          organization_id: string
          owner_type: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          contact_count?: number | null
          created_at?: string | null
          description?: string | null
          filter_conditions?: Json | null
          id?: string
          is_active?: boolean | null
          last_count_at?: string | null
          name: string
          organization_id: string
          owner_type?: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_count?: number | null
          created_at?: string | null
          description?: string | null
          filter_conditions?: Json | null
          id?: string
          is_active?: boolean | null
          last_count_at?: string | null
          name?: string
          organization_id?: string
          owner_type?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_lists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          annual_revenue: number | null
          assigned_to: string | null
          avatar_url: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          custom_fields: Json | null
          department: string | null
          email: string | null
          employee_count: string | null
          id: string
          industry: string | null
          job_title: string | null
          last_contacted_at: string | null
          lifecycle_stage: string | null
          mobile: string | null
          name: string
          notes: string | null
          organization_id: string
          owner_type: string
          phone: string | null
          postal_code: string | null
          source: string | null
          source_detail: string | null
          state: string | null
          tags: string[] | null
          tax_id: string | null
          type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          annual_revenue?: number | null
          assigned_to?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          department?: string | null
          email?: string | null
          employee_count?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          last_contacted_at?: string | null
          lifecycle_stage?: string | null
          mobile?: string | null
          name: string
          notes?: string | null
          organization_id: string
          owner_type?: string
          phone?: string | null
          postal_code?: string | null
          source?: string | null
          source_detail?: string | null
          state?: string | null
          tags?: string[] | null
          tax_id?: string | null
          type?: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          annual_revenue?: number | null
          assigned_to?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          department?: string | null
          email?: string | null
          employee_count?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          last_contacted_at?: string | null
          lifecycle_stage?: string | null
          mobile?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          owner_type?: string
          phone?: string | null
          postal_code?: string | null
          source?: string | null
          source_detail?: string | null
          state?: string | null
          tags?: string[] | null
          tax_id?: string | null
          type?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widgets: {
        Row: {
          available_options: Json | null
          code: string
          created_at: string | null
          data_source: string
          default_config: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          widget_type: string
        }
        Insert: {
          available_options?: Json | null
          code: string
          created_at?: string | null
          data_source: string
          default_config?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          widget_type: string
        }
        Update: {
          available_options?: Json | null
          code?: string
          created_at?: string | null
          data_source?: string
          default_config?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          widget_type?: string
        }
        Relationships: []
      }
      dashboards: {
        Row: {
          config: Json | null
          created_at: string | null
          created_by: string | null
          dashboard_type: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_public: boolean | null
          layout: Json
          name: string
          organization_id: string
          shared_with: Json | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          dashboard_type?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          layout?: Json
          name: string
          organization_id: string
          shared_with?: Json | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          dashboard_type?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          layout?: Json
          name?: string
          organization_id?: string
          shared_with?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_connectors: {
        Row: {
          config: Json | null
          connection_status: string | null
          connector_type: string
          created_at: string | null
          credentials: Json | null
          id: string
          is_active: boolean | null
          last_error: string | null
          last_sync_at: string | null
          name: string
          next_sync_at: string | null
          organization_id: string
          sync_enabled: boolean | null
          sync_frequency: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          connection_status?: string | null
          connector_type: string
          created_at?: string | null
          credentials?: Json | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          name: string
          next_sync_at?: string | null
          organization_id: string
          sync_enabled?: boolean | null
          sync_frequency?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          connection_status?: string | null
          connector_type?: string
          created_at?: string | null
          credentials?: Json | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          name?: string
          next_sync_at?: string | null
          organization_id?: string
          sync_enabled?: boolean | null
          sync_frequency?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_connectors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          actual_close_date: string | null
          assigned_to: string | null
          closed_at: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          custom_fields: Json | null
          description: string | null
          expected_close_date: string | null
          id: string
          lost_reason: string | null
          matter_id: string | null
          organization_id: string
          owner_type: string
          pipeline_id: string
          priority: string | null
          stage_id: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          value: number | null
          won_reason: string | null
        }
        Insert: {
          actual_close_date?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          matter_id?: string | null
          organization_id: string
          owner_type?: string
          pipeline_id: string
          priority?: string | null
          stage_id: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          value?: number | null
          won_reason?: string | null
        }
        Update: {
          actual_close_date?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          matter_id?: string | null
          organization_id?: string
          owner_type?: string
          pipeline_id?: string
          priority?: string | null
          stage_id?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          value?: number | null
          won_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          source_id: string
          source_type: string
          tokens: number | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          source_id: string
          source_type: string
          tokens?: number | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          source_id?: string
          source_type?: string
          tokens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          ab_test_config: Json | null
          campaign_type: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          exclude_list_ids: string[] | null
          from_email: string
          from_name: string
          html_content: string | null
          id: string
          is_ab_test: boolean | null
          json_content: Json | null
          list_ids: string[] | null
          name: string
          organization_id: string
          owner_type: string
          preview_text: string | null
          reply_to: string | null
          scheduled_at: string | null
          segment_conditions: Json | null
          started_at: string | null
          status: string | null
          subject: string
          template_id: string | null
          total_bounced: number | null
          total_clicked: number | null
          total_complained: number | null
          total_delivered: number | null
          total_opened: number | null
          total_recipients: number | null
          total_sent: number | null
          total_unsubscribed: number | null
          updated_at: string | null
        }
        Insert: {
          ab_test_config?: Json | null
          campaign_type?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          exclude_list_ids?: string[] | null
          from_email: string
          from_name: string
          html_content?: string | null
          id?: string
          is_ab_test?: boolean | null
          json_content?: Json | null
          list_ids?: string[] | null
          name: string
          organization_id: string
          owner_type?: string
          preview_text?: string | null
          reply_to?: string | null
          scheduled_at?: string | null
          segment_conditions?: Json | null
          started_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
          total_bounced?: number | null
          total_clicked?: number | null
          total_complained?: number | null
          total_delivered?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          total_unsubscribed?: number | null
          updated_at?: string | null
        }
        Update: {
          ab_test_config?: Json | null
          campaign_type?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          exclude_list_ids?: string[] | null
          from_email?: string
          from_name?: string
          html_content?: string | null
          id?: string
          is_ab_test?: boolean | null
          json_content?: Json | null
          list_ids?: string[] | null
          name?: string
          organization_id?: string
          owner_type?: string
          preview_text?: string | null
          reply_to?: string | null
          scheduled_at?: string | null
          segment_conditions?: Json | null
          started_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
          total_bounced?: number | null
          total_clicked?: number | null
          total_complained?: number | null
          total_delivered?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          total_unsubscribed?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_clicks: {
        Row: {
          browser: string | null
          campaign_id: string
          clicked_at: string | null
          contact_id: string
          device_type: string | null
          id: string
          ip_address: string | null
          os: string | null
          send_id: string
          url: string
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          campaign_id: string
          clicked_at?: string | null
          contact_id: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          os?: string | null
          send_id: string
          url: string
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          campaign_id?: string
          clicked_at?: string | null
          contact_id?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          os?: string | null
          send_id?: string
          url?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_clicks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_clicks_send_id_fkey"
            columns: ["send_id"]
            isOneToOne: false
            referencedRelation: "email_sends"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sends: {
        Row: {
          ab_variant: string | null
          bounce_reason: string | null
          bounce_type: string | null
          campaign_id: string
          click_count: number | null
          contact_id: string
          created_at: string | null
          delivered_at: string | null
          email_provider_id: string | null
          first_clicked_at: string | null
          first_opened_at: string | null
          id: string
          last_opened_at: string | null
          metadata: Json | null
          open_count: number | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          ab_variant?: string | null
          bounce_reason?: string | null
          bounce_type?: string | null
          campaign_id: string
          click_count?: number | null
          contact_id: string
          created_at?: string | null
          delivered_at?: string | null
          email_provider_id?: string | null
          first_clicked_at?: string | null
          first_opened_at?: string | null
          id?: string
          last_opened_at?: string | null
          metadata?: Json | null
          open_count?: number | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          ab_variant?: string | null
          bounce_reason?: string | null
          bounce_type?: string | null
          campaign_id?: string
          click_count?: number | null
          contact_id?: string
          created_at?: string | null
          delivered_at?: string | null
          email_provider_id?: string | null
          first_clicked_at?: string | null
          first_opened_at?: string | null
          id?: string
          last_opened_at?: string | null
          metadata?: Json | null
          open_count?: number | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sends_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          available_variables: string[] | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          html_content: string
          id: string
          is_active: boolean | null
          is_system: boolean | null
          json_content: Json | null
          name: string
          organization_id: string
          owner_type: string
          plain_text: string | null
          preview_text: string | null
          subject: string
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          available_variables?: string[] | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          json_content?: Json | null
          name: string
          organization_id: string
          owner_type?: string
          plain_text?: string | null
          preview_text?: string | null
          subject: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          available_variables?: string[] | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          json_content?: Json | null
          name?: string
          organization_id?: string
          owner_type?: string
          plain_text?: string | null
          preview_text?: string | null
          subject?: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_unsubscribes: {
        Row: {
          campaign_id: string | null
          contact_id: string | null
          email: string
          feedback: string | null
          id: string
          organization_id: string
          reason: string | null
          source: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          contact_id?: string | null
          email: string
          feedback?: string | null
          id?: string
          organization_id: string
          reason?: string | null
          source?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          contact_id?: string | null
          email?: string
          feedback?: string | null
          id?: string
          organization_id?: string
          reason?: string | null
          source?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_unsubscribes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_unsubscribes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_unsubscribes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      exports: {
        Row: {
          columns: Json | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          expires_at: string | null
          export_type: string
          file_size: number | null
          file_url: string | null
          filters: Json | null
          format: string
          id: string
          organization_id: string
          record_count: number | null
          status: string | null
        }
        Insert: {
          columns?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_type: string
          file_size?: number | null
          file_url?: string | null
          filters?: Json | null
          format: string
          id?: string
          organization_id: string
          record_count?: number | null
          status?: string | null
        }
        Update: {
          columns?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_type?: string
          file_size?: number | null
          file_url?: string | null
          filters?: Json | null
          format?: string
          id?: string
          organization_id?: string
          record_count?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          enabled_for_orgs: string[] | null
          enabled_for_plans: string[] | null
          enabled_for_users: string[] | null
          id: string
          is_enabled: boolean | null
          metadata: Json | null
          name: string
          rollout_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          enabled_for_orgs?: string[] | null
          enabled_for_plans?: string[] | null
          enabled_for_users?: string[] | null
          id?: string
          is_enabled?: boolean | null
          metadata?: Json | null
          name: string
          rollout_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          enabled_for_orgs?: string[] | null
          enabled_for_plans?: string[] | null
          enabled_for_users?: string[] | null
          id?: string
          is_enabled?: boolean | null
          metadata?: Json | null
          name?: string
          rollout_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      finance_portfolio_assets: {
        Row: {
          acquisition_cost: number | null
          acquisition_currency: string | null
          acquisition_date: string | null
          asset_id: string | null
          asset_type: string
          created_at: string | null
          current_value: number | null
          expiry_date: string | null
          external_reference: string | null
          id: string
          jurisdiction: string | null
          last_valuation_date: string | null
          matter_id: string | null
          nice_classes: number[] | null
          notes: string | null
          portfolio_id: string
          registration_number: string | null
          registration_office: string | null
          status: string | null
          title: string
          updated_at: string | null
          valuation_method: string | null
        }
        Insert: {
          acquisition_cost?: number | null
          acquisition_currency?: string | null
          acquisition_date?: string | null
          asset_id?: string | null
          asset_type: string
          created_at?: string | null
          current_value?: number | null
          expiry_date?: string | null
          external_reference?: string | null
          id?: string
          jurisdiction?: string | null
          last_valuation_date?: string | null
          matter_id?: string | null
          nice_classes?: number[] | null
          notes?: string | null
          portfolio_id: string
          registration_number?: string | null
          registration_office?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          valuation_method?: string | null
        }
        Update: {
          acquisition_cost?: number | null
          acquisition_currency?: string | null
          acquisition_date?: string | null
          asset_id?: string | null
          asset_type?: string
          created_at?: string | null
          current_value?: number | null
          expiry_date?: string | null
          external_reference?: string | null
          id?: string
          jurisdiction?: string | null
          last_valuation_date?: string | null
          matter_id?: string | null
          nice_classes?: number[] | null
          notes?: string | null
          portfolio_id?: string
          registration_number?: string | null
          registration_office?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          valuation_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_portfolio_assets_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_portfolio_assets_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "finance_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_portfolios: {
        Row: {
          auto_revalue: boolean | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          total_assets: number | null
          total_cost: number | null
          total_value: number | null
          unrealized_gain: number | null
          updated_at: string | null
          valuation_frequency: string | null
        }
        Insert: {
          auto_revalue?: boolean | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          total_assets?: number | null
          total_cost?: number | null
          total_value?: number | null
          unrealized_gain?: number | null
          updated_at?: string | null
          valuation_frequency?: string | null
        }
        Update: {
          auto_revalue?: boolean | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          total_assets?: number | null
          total_cost?: number | null
          total_value?: number | null
          unrealized_gain?: number | null
          updated_at?: string | null
          valuation_frequency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_portfolios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_portfolios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_valuation_parameters: {
        Row: {
          asset_type: string | null
          brand_strength_factor: number | null
          created_at: string | null
          development_cost_multiplier: number | null
          discount_rate: number | null
          effective_date: string | null
          growth_rate: number | null
          id: string
          jurisdiction: string | null
          legal_cost_base: number | null
          legal_strength_factor: number | null
          maintenance_cost_annual: number | null
          market_multiplier_high: number | null
          market_multiplier_low: number | null
          market_multiplier_mid: number | null
          market_position_factor: number | null
          royalty_rate_high: number | null
          royalty_rate_low: number | null
          royalty_rate_mid: number | null
          useful_life_years: number | null
        }
        Insert: {
          asset_type?: string | null
          brand_strength_factor?: number | null
          created_at?: string | null
          development_cost_multiplier?: number | null
          discount_rate?: number | null
          effective_date?: string | null
          growth_rate?: number | null
          id?: string
          jurisdiction?: string | null
          legal_cost_base?: number | null
          legal_strength_factor?: number | null
          maintenance_cost_annual?: number | null
          market_multiplier_high?: number | null
          market_multiplier_low?: number | null
          market_multiplier_mid?: number | null
          market_position_factor?: number | null
          royalty_rate_high?: number | null
          royalty_rate_low?: number | null
          royalty_rate_mid?: number | null
          useful_life_years?: number | null
        }
        Update: {
          asset_type?: string | null
          brand_strength_factor?: number | null
          created_at?: string | null
          development_cost_multiplier?: number | null
          discount_rate?: number | null
          effective_date?: string | null
          growth_rate?: number | null
          id?: string
          jurisdiction?: string | null
          legal_cost_base?: number | null
          legal_strength_factor?: number | null
          maintenance_cost_annual?: number | null
          market_multiplier_high?: number | null
          market_multiplier_low?: number | null
          market_multiplier_mid?: number | null
          market_position_factor?: number | null
          royalty_rate_high?: number | null
          royalty_rate_low?: number | null
          royalty_rate_mid?: number | null
          useful_life_years?: number | null
        }
        Relationships: []
      }
      finance_valuations: {
        Row: {
          adjustments: Json | null
          ai_analysis: string | null
          ai_confidence: number | null
          approved_at: string | null
          approved_by: string | null
          asset_id: string | null
          comparable_transactions: Json | null
          confidence_level: number | null
          cost_approach_value: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          estimated_value: number
          factors: Json | null
          id: string
          income_approach_value: number | null
          market_approach_value: number | null
          methods_used: Json | null
          notes: string | null
          organization_id: string
          portfolio_id: string | null
          primary_method: string | null
          status: string | null
          valuation_date: string
          valuation_type: string
          value_range_high: number | null
          value_range_low: number | null
        }
        Insert: {
          adjustments?: Json | null
          ai_analysis?: string | null
          ai_confidence?: number | null
          approved_at?: string | null
          approved_by?: string | null
          asset_id?: string | null
          comparable_transactions?: Json | null
          confidence_level?: number | null
          cost_approach_value?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          estimated_value: number
          factors?: Json | null
          id?: string
          income_approach_value?: number | null
          market_approach_value?: number | null
          methods_used?: Json | null
          notes?: string | null
          organization_id: string
          portfolio_id?: string | null
          primary_method?: string | null
          status?: string | null
          valuation_date?: string
          valuation_type: string
          value_range_high?: number | null
          value_range_low?: number | null
        }
        Update: {
          adjustments?: Json | null
          ai_analysis?: string | null
          ai_confidence?: number | null
          approved_at?: string | null
          approved_by?: string | null
          asset_id?: string | null
          comparable_transactions?: Json | null
          confidence_level?: number | null
          cost_approach_value?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          estimated_value?: number
          factors?: Json | null
          id?: string
          income_approach_value?: number | null
          market_approach_value?: number | null
          methods_used?: Json | null
          notes?: string | null
          organization_id?: string
          portfolio_id?: string | null
          primary_method?: string | null
          status?: string | null
          valuation_date?: string
          valuation_type?: string
          value_range_high?: number | null
          value_range_low?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_valuations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_valuations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "finance_portfolio_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_valuations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_valuations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_valuations_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "finance_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      gazette_sources: {
        Row: {
          code: string
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_issue_date: string | null
          last_scraped_at: string | null
          name: string
          scrape_config: Json | null
          scrape_frequency: string | null
          source_type: string
          url: string | null
        }
        Insert: {
          code: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_issue_date?: string | null
          last_scraped_at?: string | null
          name: string
          scrape_config?: Json | null
          scrape_frequency?: string | null
          source_type: string
          url?: string | null
        }
        Update: {
          code?: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_issue_date?: string | null
          last_scraped_at?: string | null
          name?: string
          scrape_config?: Json | null
          scrape_frequency?: string | null
          source_type?: string
          url?: string | null
        }
        Relationships: []
      }
      generated_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          error_message: string | null
          expires_at: string | null
          file_format: string | null
          file_size: number | null
          file_url: string | null
          generated_at: string | null
          id: string
          metadata: Json | null
          name: string
          organization_id: string
          parameters: Json | null
          report_type: string
          status: string | null
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_format?: string | null
          file_size?: number | null
          file_url?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          organization_id: string
          parameters?: Json | null
          report_type: string
          status?: string | null
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_format?: string | null
          file_size?: number | null
          file_url?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string
          parameters?: Json | null
          report_type?: string
          status?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      genius_generated_documents: {
        Row: {
          citations: Json | null
          content_html: string | null
          content_markdown: string | null
          created_at: string | null
          disclaimer_accepted: boolean | null
          disclaimer_accepted_at: string | null
          document_type: string
          estimated_fees: Json | null
          export_formats: Json | null
          id: string
          input_data: Json
          legal_analysis: Json | null
          organization_id: string
          risk_assessment: Json | null
          title: string | null
          tone: string | null
          trademark_analysis: Json | null
          updated_at: string | null
          user_approved: boolean | null
          user_id: string
          user_notes: string | null
          verification_status: string | null
          verification_warnings: Json | null
          verified_at: string | null
        }
        Insert: {
          citations?: Json | null
          content_html?: string | null
          content_markdown?: string | null
          created_at?: string | null
          disclaimer_accepted?: boolean | null
          disclaimer_accepted_at?: string | null
          document_type: string
          estimated_fees?: Json | null
          export_formats?: Json | null
          id?: string
          input_data: Json
          legal_analysis?: Json | null
          organization_id: string
          risk_assessment?: Json | null
          title?: string | null
          tone?: string | null
          trademark_analysis?: Json | null
          updated_at?: string | null
          user_approved?: boolean | null
          user_id: string
          user_notes?: string | null
          verification_status?: string | null
          verification_warnings?: Json | null
          verified_at?: string | null
        }
        Update: {
          citations?: Json | null
          content_html?: string | null
          content_markdown?: string | null
          created_at?: string | null
          disclaimer_accepted?: boolean | null
          disclaimer_accepted_at?: string | null
          document_type?: string
          estimated_fees?: Json | null
          export_formats?: Json | null
          id?: string
          input_data?: Json
          legal_analysis?: Json | null
          organization_id?: string
          risk_assessment?: Json | null
          title?: string | null
          tone?: string | null
          trademark_analysis?: Json | null
          updated_at?: string | null
          user_approved?: boolean | null
          user_id?: string
          user_notes?: string | null
          verification_status?: string | null
          verification_warnings?: Json | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genius_generated_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      genius_legal_sources: {
        Row: {
          content: string
          created_at: string | null
          effective_date: string | null
          expiry_date: string | null
          id: string
          is_current: boolean | null
          jurisdiction: string
          language: string | null
          reference_number: string | null
          source_type: string
          title: string
          updated_at: string | null
          url: string | null
          version: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_current?: boolean | null
          jurisdiction: string
          language?: string | null
          reference_number?: string | null
          source_type: string
          title: string
          updated_at?: string | null
          url?: string | null
          version?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_current?: boolean | null
          jurisdiction?: string
          language?: string | null
          reference_number?: string | null
          source_type?: string
          title?: string
          updated_at?: string | null
          url?: string | null
          version?: number | null
        }
        Relationships: []
      }
      genius_official_fees: {
        Row: {
          base_fee: number
          created_at: string | null
          currency: string | null
          effective_from: string
          effective_until: string | null
          extension_fee: number | null
          id: string
          last_verified_at: string | null
          office: string
          per_class_fee: number | null
          procedure_type: string
          source_url: string | null
        }
        Insert: {
          base_fee: number
          created_at?: string | null
          currency?: string | null
          effective_from: string
          effective_until?: string | null
          extension_fee?: number | null
          id?: string
          last_verified_at?: string | null
          office: string
          per_class_fee?: number | null
          procedure_type: string
          source_url?: string | null
        }
        Update: {
          base_fee?: number
          created_at?: string | null
          currency?: string | null
          effective_from?: string
          effective_until?: string | null
          extension_fee?: number | null
          id?: string
          last_verified_at?: string | null
          office?: string
          per_class_fee?: number | null
          procedure_type?: string
          source_url?: string | null
        }
        Relationships: []
      }
      genius_trademark_comparisons: {
        Row: {
          analysis_methodology: Json | null
          conceptual_analysis: string | null
          conceptual_details: Json | null
          conceptual_similarity: number | null
          created_at: string | null
          goods_analysis: string | null
          goods_details: Json | null
          goods_similarity: number | null
          id: string
          mark_a_classes: number[] | null
          mark_a_goods: string | null
          mark_a_image_url: string | null
          mark_a_text: string | null
          mark_b_classes: number[] | null
          mark_b_goods: string | null
          mark_b_image_url: string | null
          mark_b_text: string | null
          organization_id: string
          overall_risk: string | null
          overall_score: number | null
          phonetic_analysis: string | null
          phonetic_details: Json | null
          phonetic_similarity: number | null
          recommendation: string | null
          user_id: string
          visual_analysis: string | null
          visual_similarity: number | null
        }
        Insert: {
          analysis_methodology?: Json | null
          conceptual_analysis?: string | null
          conceptual_details?: Json | null
          conceptual_similarity?: number | null
          created_at?: string | null
          goods_analysis?: string | null
          goods_details?: Json | null
          goods_similarity?: number | null
          id?: string
          mark_a_classes?: number[] | null
          mark_a_goods?: string | null
          mark_a_image_url?: string | null
          mark_a_text?: string | null
          mark_b_classes?: number[] | null
          mark_b_goods?: string | null
          mark_b_image_url?: string | null
          mark_b_text?: string | null
          organization_id: string
          overall_risk?: string | null
          overall_score?: number | null
          phonetic_analysis?: string | null
          phonetic_details?: Json | null
          phonetic_similarity?: number | null
          recommendation?: string | null
          user_id: string
          visual_analysis?: string | null
          visual_similarity?: number | null
        }
        Update: {
          analysis_methodology?: Json | null
          conceptual_analysis?: string | null
          conceptual_details?: Json | null
          conceptual_similarity?: number | null
          created_at?: string | null
          goods_analysis?: string | null
          goods_details?: Json | null
          goods_similarity?: number | null
          id?: string
          mark_a_classes?: number[] | null
          mark_a_goods?: string | null
          mark_a_image_url?: string | null
          mark_a_text?: string | null
          mark_b_classes?: number[] | null
          mark_b_goods?: string | null
          mark_b_image_url?: string | null
          mark_b_text?: string | null
          organization_id?: string
          overall_risk?: string | null
          overall_score?: number | null
          phonetic_analysis?: string | null
          phonetic_details?: Json | null
          phonetic_similarity?: number | null
          recommendation?: string | null
          user_id?: string
          visual_analysis?: string | null
          visual_similarity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "genius_trademark_comparisons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      import_files: {
        Row: {
          analysis_result: Json | null
          analysis_status: string | null
          analyzed_at: string | null
          field_mapping: Json | null
          file_size: number
          filename: string
          id: string
          job_id: string | null
          mapping_confirmed: boolean | null
          mime_type: string
          organization_id: string
          original_filename: string
          processed_at: string | null
          processing_result: Json | null
          processing_status: string | null
          storage_path: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          analysis_result?: Json | null
          analysis_status?: string | null
          analyzed_at?: string | null
          field_mapping?: Json | null
          file_size: number
          filename: string
          id?: string
          job_id?: string | null
          mapping_confirmed?: boolean | null
          mime_type: string
          organization_id: string
          original_filename: string
          processed_at?: string | null
          processing_result?: Json | null
          processing_status?: string | null
          storage_path: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          analysis_result?: Json | null
          analysis_status?: string | null
          analyzed_at?: string | null
          field_mapping?: Json | null
          file_size?: number
          filename?: string
          id?: string
          job_id?: string | null
          mapping_confirmed?: boolean | null
          mime_type?: string
          organization_id?: string
          original_filename?: string
          processed_at?: string | null
          processing_result?: Json | null
          processing_status?: string | null
          storage_path?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_files_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      import_jobs: {
        Row: {
          completed_at: string | null
          config: Json
          created_at: string | null
          created_by: string | null
          id: string
          job_type: string
          organization_id: string
          parent_job_id: string | null
          progress: Json | null
          results: Json | null
          rollback_snapshot_id: string | null
          scheduled_at: string | null
          shadow_comparison: Json | null
          shadow_data: Json | null
          source_files: Json | null
          source_id: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          job_type: string
          organization_id: string
          parent_job_id?: string | null
          progress?: Json | null
          results?: Json | null
          rollback_snapshot_id?: string | null
          scheduled_at?: string | null
          shadow_comparison?: Json | null
          shadow_data?: Json | null
          source_files?: Json | null
          source_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          job_type?: string
          organization_id?: string
          parent_job_id?: string | null
          progress?: Json | null
          results?: Json | null
          rollback_snapshot_id?: string | null
          scheduled_at?: string | null
          shadow_comparison?: Json | null
          shadow_data?: Json | null
          source_files?: Json | null
          source_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_jobs_parent_job_id_fkey"
            columns: ["parent_job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "import_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      import_mapping_templates: {
        Row: {
          avg_accuracy: number | null
          created_at: string | null
          entity_type: string
          field_mappings: Json
          id: string
          is_system_template: boolean | null
          organization_id: string | null
          source_system: string
          source_type: string
          times_confirmed: number | null
          times_modified: number | null
          times_used: number | null
          updated_at: string | null
        }
        Insert: {
          avg_accuracy?: number | null
          created_at?: string | null
          entity_type: string
          field_mappings: Json
          id?: string
          is_system_template?: boolean | null
          organization_id?: string | null
          source_system: string
          source_type: string
          times_confirmed?: number | null
          times_modified?: number | null
          times_used?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_accuracy?: number | null
          created_at?: string | null
          entity_type?: string
          field_mappings?: Json
          id?: string
          is_system_template?: boolean | null
          organization_id?: string | null
          source_system?: string
          source_type?: string
          times_confirmed?: number | null
          times_modified?: number | null
          times_used?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_mapping_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      import_scraping_rules: {
        Row: {
          created_at: string | null
          extraction_rules: Json
          id: string
          is_working: boolean | null
          last_test_result: Json | null
          last_tested_at: string | null
          login_steps: Json
          rate_limit_config: Json | null
          source_id: string
          system_version: string | null
          target_system: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          extraction_rules: Json
          id?: string
          is_working?: boolean | null
          last_test_result?: Json | null
          last_tested_at?: string | null
          login_steps: Json
          rate_limit_config?: Json | null
          source_id: string
          system_version?: string | null
          target_system: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          extraction_rules?: Json
          id?: string
          is_working?: boolean | null
          last_test_result?: Json | null
          last_tested_at?: string | null
          login_steps?: Json
          rate_limit_config?: Json | null
          source_id?: string
          system_version?: string | null
          target_system?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_scraping_rules_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "import_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      import_snapshots: {
        Row: {
          affected_records: Json
          created_at: string | null
          expires_at: string | null
          id: string
          job_id: string
          organization_id: string
          snapshot_data: Json
          snapshot_size: number | null
        }
        Insert: {
          affected_records: Json
          created_at?: string | null
          expires_at?: string | null
          id?: string
          job_id: string
          organization_id: string
          snapshot_data: Json
          snapshot_size?: number | null
        }
        Update: {
          affected_records?: Json
          created_at?: string | null
          expires_at?: string | null
          id?: string
          job_id?: string
          organization_id?: string
          snapshot_data?: Json
          snapshot_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "import_snapshots_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      import_sources: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          credentials_vault_id: string | null
          description: string | null
          detected_system: string | null
          id: string
          last_test_at: string | null
          last_test_result: Json | null
          name: string
          organization_id: string
          source_metadata: Json | null
          source_type: string
          status: string | null
          system_confidence: number | null
          updated_at: string | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          credentials_vault_id?: string | null
          description?: string | null
          detected_system?: string | null
          id?: string
          last_test_at?: string | null
          last_test_result?: Json | null
          name: string
          organization_id: string
          source_metadata?: Json | null
          source_type: string
          status?: string | null
          system_confidence?: number | null
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          credentials_vault_id?: string | null
          description?: string | null
          detected_system?: string | null
          id?: string
          last_test_at?: string | null
          last_test_result?: Json | null
          name?: string
          organization_id?: string
          source_metadata?: Json | null
          source_type?: string
          status?: string | null
          system_confidence?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      import_sync_configs: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          entities_config: Json
          id: string
          last_sync_at: string | null
          last_sync_job_id: string | null
          last_sync_status: string | null
          name: string
          next_sync_at: string | null
          organization_id: string
          schedule_cron: string | null
          schedule_timezone: string | null
          source_id: string
          status: string | null
          sync_cursors: Json | null
          sync_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          entities_config: Json
          id?: string
          last_sync_at?: string | null
          last_sync_job_id?: string | null
          last_sync_status?: string | null
          name: string
          next_sync_at?: string | null
          organization_id: string
          schedule_cron?: string | null
          schedule_timezone?: string | null
          source_id: string
          status?: string | null
          sync_cursors?: Json | null
          sync_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          entities_config?: Json
          id?: string
          last_sync_at?: string | null
          last_sync_job_id?: string | null
          last_sync_status?: string | null
          name?: string
          next_sync_at?: string | null
          organization_id?: string
          schedule_cron?: string | null
          schedule_timezone?: string | null
          source_id?: string
          status?: string | null
          sync_cursors?: Json | null
          sync_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_sync_configs_last_sync_job_id_fkey"
            columns: ["last_sync_job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_sync_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_sync_configs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "import_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      import_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          import_type: string
          is_system: boolean | null
          mapping: Json
          name: string
          options: Json | null
          organization_id: string | null
          source_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          import_type: string
          is_system?: boolean | null
          mapping: Json
          name: string
          options?: Json | null
          organization_id?: string | null
          source_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          import_type?: string
          is_system?: boolean | null
          mapping?: Json
          name?: string
          options?: Json | null
          organization_id?: string | null
          source_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      imports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          created_ids: Json | null
          error_rows: number | null
          errors: Json | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          import_type: string
          mapping: Json | null
          options: Json | null
          organization_id: string
          processed_rows: number | null
          skipped_rows: number | null
          source_type: string
          started_at: string | null
          status: string | null
          success_rows: number | null
          total_rows: number | null
          updated_ids: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          created_ids?: Json | null
          error_rows?: number | null
          errors?: Json | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          import_type: string
          mapping?: Json | null
          options?: Json | null
          organization_id: string
          processed_rows?: number | null
          skipped_rows?: number | null
          source_type: string
          started_at?: string | null
          status?: string | null
          success_rows?: number | null
          total_rows?: number | null
          updated_ids?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          created_ids?: Json | null
          error_rows?: number | null
          errors?: Json | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          import_type?: string
          mapping?: Json | null
          options?: Json | null
          organization_id?: string
          processed_rows?: number | null
          skipped_rows?: number | null
          source_type?: string
          started_at?: string | null
          status?: string | null
          success_rows?: number | null
          total_rows?: number | null
          updated_ids?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "imports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: string
          status: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: string
          status?: string | null
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: string
          status?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          discount_percent: number | null
          id: string
          invoice_id: string
          line_number: number
          matter_cost_id: string | null
          matter_id: string | null
          notes: string | null
          quantity: number | null
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          discount_percent?: number | null
          id?: string
          invoice_id: string
          line_number: number
          matter_cost_id?: string | null
          matter_id?: string | null
          notes?: string | null
          quantity?: number | null
          subtotal: number
          tax_amount?: number | null
          tax_rate?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          discount_percent?: number | null
          id?: string
          invoice_id?: string
          line_number?: number
          matter_cost_id?: string | null
          matter_id?: string | null
          notes?: string | null
          quantity?: number | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_matter_cost_id_fkey"
            columns: ["matter_cost_id"]
            isOneToOne: false
            referencedRelation: "matter_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          billing_client_id: string
          client_address: string | null
          client_name: string
          client_tax_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          discount_amount: number | null
          due_date: string | null
          footer_text: string | null
          id: string
          internal_notes: string | null
          invoice_date: string
          invoice_number: string
          invoice_series: string | null
          notes: string | null
          organization_id: string
          paid_amount: number | null
          paid_date: string | null
          payment_method: string | null
          payment_reference: string | null
          pdf_url: string | null
          sent_at: string | null
          status: string | null
          subtotal: number
          tax_amount: number
          tax_rate: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          billing_client_id: string
          client_address?: string | null
          client_name: string
          client_tax_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          discount_amount?: number | null
          due_date?: string | null
          footer_text?: string | null
          id?: string
          internal_notes?: string | null
          invoice_date?: string
          invoice_number: string
          invoice_series?: string | null
          notes?: string | null
          organization_id: string
          paid_amount?: number | null
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number | null
          total?: number
          updated_at?: string | null
        }
        Update: {
          billing_client_id?: string
          client_address?: string | null
          client_name?: string
          client_tax_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          discount_amount?: number | null
          due_date?: string | null
          footer_text?: string | null
          id?: string
          internal_notes?: string | null
          invoice_date?: string
          invoice_number?: string
          invoice_series?: string | null
          notes?: string | null
          organization_id?: string
          paid_amount?: number | null
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_billing_client_id_fkey"
            columns: ["billing_client_id"]
            isOneToOne: false
            referencedRelation: "billing_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_alert_configs: {
        Row: {
          alert_type: string
          cooldown_minutes: number | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          notify_emails: string[] | null
          notify_slack_channel: string | null
          notify_webhook_url: string | null
          office_id: string | null
          threshold_unit: string | null
          threshold_value: number | null
        }
        Insert: {
          alert_type: string
          cooldown_minutes?: number | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          notify_emails?: string[] | null
          notify_slack_channel?: string | null
          notify_webhook_url?: string | null
          office_id?: string | null
          threshold_unit?: string | null
          threshold_value?: number | null
        }
        Update: {
          alert_type?: string
          cooldown_minutes?: number | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          notify_emails?: string[] | null
          notify_slack_channel?: string | null
          notify_webhook_url?: string | null
          office_id?: string | null
          threshold_unit?: string | null
          threshold_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_alert_configs_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_alert_configs_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          data: Json | null
          id: string
          office_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          data?: Json | null
          id?: string
          office_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          office_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_alerts_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_alerts_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_api_configs: {
        Row: {
          api_version: string | null
          auth_config: Json | null
          auth_type: string
          base_url: string
          connection_method_id: string
          created_at: string | null
          docs_format: string | null
          docs_url: string | null
          endpoints: Json | null
          id: string
          renewal_alert_days: number | null
          required_headers: Json | null
          subscription_cost: number | null
          subscription_currency: string | null
          subscription_end: string | null
          subscription_plan: string | null
          subscription_responsible: string | null
          subscription_start: string | null
        }
        Insert: {
          api_version?: string | null
          auth_config?: Json | null
          auth_type: string
          base_url: string
          connection_method_id: string
          created_at?: string | null
          docs_format?: string | null
          docs_url?: string | null
          endpoints?: Json | null
          id?: string
          renewal_alert_days?: number | null
          required_headers?: Json | null
          subscription_cost?: number | null
          subscription_currency?: string | null
          subscription_end?: string | null
          subscription_plan?: string | null
          subscription_responsible?: string | null
          subscription_start?: string | null
        }
        Update: {
          api_version?: string | null
          auth_config?: Json | null
          auth_type?: string
          base_url?: string
          connection_method_id?: string
          created_at?: string | null
          docs_format?: string | null
          docs_url?: string | null
          endpoints?: Json | null
          id?: string
          renewal_alert_days?: number | null
          required_headers?: Json | null
          subscription_cost?: number | null
          subscription_currency?: string | null
          subscription_end?: string | null
          subscription_plan?: string | null
          subscription_responsible?: string | null
          subscription_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_api_configs_connection_method_id_fkey"
            columns: ["connection_method_id"]
            isOneToOne: false
            referencedRelation: "ipo_connection_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_api_configs_connection_method_id_fkey"
            columns: ["connection_method_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["connection_method_id"]
          },
        ]
      }
      ipo_automend_jobs: {
        Row: {
          actions_taken: Json | null
          completed_at: string | null
          connection_method_id: string | null
          created_at: string | null
          diagnosis_results: Json | null
          error_summary: string | null
          final_status: string | null
          id: string
          office_id: string
          started_at: string | null
          status: string
          trigger_type: string
          triggered_by: string | null
        }
        Insert: {
          actions_taken?: Json | null
          completed_at?: string | null
          connection_method_id?: string | null
          created_at?: string | null
          diagnosis_results?: Json | null
          error_summary?: string | null
          final_status?: string | null
          id?: string
          office_id: string
          started_at?: string | null
          status?: string
          trigger_type: string
          triggered_by?: string | null
        }
        Update: {
          actions_taken?: Json | null
          completed_at?: string | null
          connection_method_id?: string | null
          created_at?: string | null
          diagnosis_results?: Json | null
          error_summary?: string | null
          final_status?: string | null
          id?: string
          office_id?: string
          started_at?: string | null
          status?: string
          trigger_type?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_automend_jobs_connection_method_id_fkey"
            columns: ["connection_method_id"]
            isOneToOne: false
            referencedRelation: "ipo_connection_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_automend_jobs_connection_method_id_fkey"
            columns: ["connection_method_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["connection_method_id"]
          },
          {
            foreignKeyName: "ipo_automend_jobs_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_automend_jobs_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_bulk_configs: {
        Row: {
          chunk_size: number | null
          connection_method_id: string
          created_at: string | null
          decompress_strategy: string | null
          file_encoding: string | null
          file_format: string
          host: string
          id: string
          path_pattern: string | null
          port: number | null
          protocol: string
          schedule_cron: string | null
          schedule_timezone: string | null
          xml_standard: string | null
        }
        Insert: {
          chunk_size?: number | null
          connection_method_id: string
          created_at?: string | null
          decompress_strategy?: string | null
          file_encoding?: string | null
          file_format: string
          host: string
          id?: string
          path_pattern?: string | null
          port?: number | null
          protocol: string
          schedule_cron?: string | null
          schedule_timezone?: string | null
          xml_standard?: string | null
        }
        Update: {
          chunk_size?: number | null
          connection_method_id?: string
          created_at?: string | null
          decompress_strategy?: string | null
          file_encoding?: string | null
          file_format?: string
          host?: string
          id?: string
          path_pattern?: string | null
          port?: number | null
          protocol?: string
          schedule_cron?: string | null
          schedule_timezone?: string | null
          xml_standard?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_bulk_configs_connection_method_id_fkey"
            columns: ["connection_method_id"]
            isOneToOne: false
            referencedRelation: "ipo_connection_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_bulk_configs_connection_method_id_fkey"
            columns: ["connection_method_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["connection_method_id"]
          },
        ]
      }
      ipo_connection_methods: {
        Row: {
          avg_response_time_ms: number | null
          config: Json
          consecutive_failures: number | null
          created_at: string | null
          health_status: string | null
          id: string
          is_enabled: boolean | null
          last_health_check: string | null
          last_successful_sync: string | null
          maintenance_schedule: Json | null
          method_type: string
          office_id: string
          preferred_hours: Json | null
          priority: number | null
          rate_limit_burst: number | null
          rate_limit_period: number | null
          rate_limit_requests: number | null
          status: string | null
          success_rate_7d: number | null
          updated_at: string | null
        }
        Insert: {
          avg_response_time_ms?: number | null
          config?: Json
          consecutive_failures?: number | null
          created_at?: string | null
          health_status?: string | null
          id?: string
          is_enabled?: boolean | null
          last_health_check?: string | null
          last_successful_sync?: string | null
          maintenance_schedule?: Json | null
          method_type: string
          office_id: string
          preferred_hours?: Json | null
          priority?: number | null
          rate_limit_burst?: number | null
          rate_limit_period?: number | null
          rate_limit_requests?: number | null
          status?: string | null
          success_rate_7d?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_response_time_ms?: number | null
          config?: Json
          consecutive_failures?: number | null
          created_at?: string | null
          health_status?: string | null
          id?: string
          is_enabled?: boolean | null
          last_health_check?: string | null
          last_successful_sync?: string | null
          maintenance_schedule?: Json | null
          method_type?: string
          office_id?: string
          preferred_hours?: Json | null
          priority?: number | null
          rate_limit_burst?: number | null
          rate_limit_period?: number | null
          rate_limit_requests?: number | null
          status?: string | null
          success_rate_7d?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_connection_methods_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_connection_methods_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_credentials: {
        Row: {
          connection_method_id: string
          created_at: string | null
          created_by: string | null
          credential_data: string
          credential_type: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_rotated_at: string | null
          rotation_count: number | null
          rotation_reminder_days: number | null
          updated_at: string | null
        }
        Insert: {
          connection_method_id: string
          created_at?: string | null
          created_by?: string | null
          credential_data: string
          credential_type: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_rotated_at?: string | null
          rotation_count?: number | null
          rotation_reminder_days?: number | null
          updated_at?: string | null
        }
        Update: {
          connection_method_id?: string
          created_at?: string | null
          created_by?: string | null
          credential_data?: string
          credential_type?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_rotated_at?: string | null
          rotation_count?: number | null
          rotation_reminder_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_credentials_connection_method_id_fkey"
            columns: ["connection_method_id"]
            isOneToOne: false
            referencedRelation: "ipo_connection_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_credentials_connection_method_id_fkey"
            columns: ["connection_method_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["connection_method_id"]
          },
        ]
      }
      ipo_deadline_rules: {
        Row: {
          consequence_if_missed: string | null
          created_at: string | null
          days: number | null
          deadline_type: string
          exclude_holidays: boolean | null
          extension_available: boolean | null
          extension_days: number | null
          extension_fee_id: string | null
          id: string
          ip_type: string
          is_calendar_days: boolean | null
          max_extensions: number | null
          months: number | null
          notes: string | null
          office_id: string
          trigger_event: string
          years: number | null
        }
        Insert: {
          consequence_if_missed?: string | null
          created_at?: string | null
          days?: number | null
          deadline_type: string
          exclude_holidays?: boolean | null
          extension_available?: boolean | null
          extension_days?: number | null
          extension_fee_id?: string | null
          id?: string
          ip_type: string
          is_calendar_days?: boolean | null
          max_extensions?: number | null
          months?: number | null
          notes?: string | null
          office_id: string
          trigger_event: string
          years?: number | null
        }
        Update: {
          consequence_if_missed?: string | null
          created_at?: string | null
          days?: number | null
          deadline_type?: string
          exclude_holidays?: boolean | null
          extension_available?: boolean | null
          extension_days?: number | null
          extension_fee_id?: string | null
          id?: string
          ip_type?: string
          is_calendar_days?: boolean | null
          max_extensions?: number | null
          months?: number | null
          notes?: string | null
          office_id?: string
          trigger_event?: string
          years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_deadline_rules_extension_fee_id_fkey"
            columns: ["extension_fee_id"]
            isOneToOne: false
            referencedRelation: "ipo_official_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_deadline_rules_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_deadline_rules_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_error_patterns: {
        Row: {
          auto_fixable: boolean | null
          category: string | null
          created_at: string | null
          error_code: string | null
          error_message_pattern: string | null
          http_status_codes: number[] | null
          id: string
          office_id: string | null
          office_specific: boolean | null
          probable_cause: string | null
          recommended_action: string | null
        }
        Insert: {
          auto_fixable?: boolean | null
          category?: string | null
          created_at?: string | null
          error_code?: string | null
          error_message_pattern?: string | null
          http_status_codes?: number[] | null
          id?: string
          office_id?: string | null
          office_specific?: boolean | null
          probable_cause?: string | null
          recommended_action?: string | null
        }
        Update: {
          auto_fixable?: boolean | null
          category?: string | null
          created_at?: string | null
          error_code?: string | null
          error_message_pattern?: string | null
          http_status_codes?: number[] | null
          id?: string
          office_id?: string | null
          office_specific?: boolean | null
          probable_cause?: string | null
          recommended_action?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_error_patterns_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_error_patterns_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_fee_history: {
        Row: {
          amount_new: number
          amount_old: number | null
          change_date: string
          change_reason: string | null
          created_at: string | null
          currency: string
          fee_id: string
          id: string
          source_document_id: string | null
          source_url: string | null
        }
        Insert: {
          amount_new: number
          amount_old?: number | null
          change_date: string
          change_reason?: string | null
          created_at?: string | null
          currency: string
          fee_id: string
          id?: string
          source_document_id?: string | null
          source_url?: string | null
        }
        Update: {
          amount_new?: number
          amount_old?: number | null
          change_date?: string
          change_reason?: string | null
          created_at?: string | null
          currency?: string
          fee_id?: string
          id?: string
          source_document_id?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_fee_history_fee_id_fkey"
            columns: ["fee_id"]
            isOneToOne: false
            referencedRelation: "ipo_official_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_fee_history_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "ipo_legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_field_mappings: {
        Row: {
          created_at: string | null
          data_type: string
          id: string
          is_active: boolean | null
          mappings: Json
          office_id: string
          source_format: string | null
          updated_at: string | null
          validations: Json | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          data_type: string
          id?: string
          is_active?: boolean | null
          mappings: Json
          office_id: string
          source_format?: string | null
          updated_at?: string | null
          validations?: Json | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          data_type?: string
          id?: string
          is_active?: boolean | null
          mappings?: Json
          office_id?: string
          source_format?: string | null
          updated_at?: string | null
          validations?: Json | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_field_mappings_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_field_mappings_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_health_checks: {
        Row: {
          check_type: string
          checked_at: string | null
          connection_method_id: string
          error_code: string | null
          error_details: Json | null
          error_message: string | null
          id: string
          records_fetched: number | null
          response_time_ms: number | null
          status: string
        }
        Insert: {
          check_type: string
          checked_at?: string | null
          connection_method_id: string
          error_code?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          records_fetched?: number | null
          response_time_ms?: number | null
          status: string
        }
        Update: {
          check_type?: string
          checked_at?: string | null
          connection_method_id?: string
          error_code?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          records_fetched?: number | null
          response_time_ms?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ipo_health_checks_connection_method_id_fkey"
            columns: ["connection_method_id"]
            isOneToOne: false
            referencedRelation: "ipo_connection_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_health_checks_connection_method_id_fkey"
            columns: ["connection_method_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["connection_method_id"]
          },
        ]
      }
      ipo_holidays: {
        Row: {
          created_at: string | null
          holiday_date: string
          id: string
          is_recurring: boolean | null
          name: string | null
          office_id: string
          recurring_day: number | null
          recurring_month: number | null
        }
        Insert: {
          created_at?: string | null
          holiday_date: string
          id?: string
          is_recurring?: boolean | null
          name?: string | null
          office_id: string
          recurring_day?: number | null
          recurring_month?: number | null
        }
        Update: {
          created_at?: string | null
          holiday_date?: string
          id?: string
          is_recurring?: boolean | null
          name?: string | null
          office_id?: string
          recurring_day?: number | null
          recurring_month?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_holidays_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_holidays_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_knowledge_base: {
        Row: {
          auto_update: boolean | null
          content: string | null
          content_language: string | null
          content_url: string | null
          created_at: string | null
          effective_date: string | null
          expiry_date: string | null
          id: string
          knowledge_type: string
          last_crawled_at: string | null
          last_verified_at: string | null
          office_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          auto_update?: boolean | null
          content?: string | null
          content_language?: string | null
          content_url?: string | null
          created_at?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          knowledge_type: string
          last_crawled_at?: string | null
          last_verified_at?: string | null
          office_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          auto_update?: boolean | null
          content?: string | null
          content_language?: string | null
          content_url?: string | null
          created_at?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          knowledge_type?: string
          last_crawled_at?: string | null
          last_verified_at?: string | null
          office_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_knowledge_base_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_knowledge_base_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_legal_articles: {
        Row: {
          article_type: string
          citation_format: string | null
          content: string
          content_english: string | null
          created_at: string | null
          document_id: string
          full_reference: string | null
          heading: string | null
          hierarchy_path: string | null
          id: string
          ip_types: string[] | null
          keywords: string[] | null
          number: string | null
          parent_id: string | null
          sort_order: number | null
          status: string | null
          updated_at: string | null
          version_id: string | null
        }
        Insert: {
          article_type: string
          citation_format?: string | null
          content: string
          content_english?: string | null
          created_at?: string | null
          document_id: string
          full_reference?: string | null
          heading?: string | null
          hierarchy_path?: string | null
          id?: string
          ip_types?: string[] | null
          keywords?: string[] | null
          number?: string | null
          parent_id?: string | null
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
          version_id?: string | null
        }
        Update: {
          article_type?: string
          citation_format?: string | null
          content?: string
          content_english?: string | null
          created_at?: string | null
          document_id?: string
          full_reference?: string | null
          heading?: string | null
          hierarchy_path?: string | null
          id?: string
          ip_types?: string[] | null
          keywords?: string[] | null
          number?: string | null
          parent_id?: string | null
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_legal_articles_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ipo_legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_legal_articles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ipo_legal_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_legal_articles_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "ipo_legal_document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_legal_change_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          affected_ip_types: string[] | null
          change_type: string
          created_at: string | null
          detected_at: string | null
          diff_data: Json | null
          document_id: string | null
          effective_date: string | null
          id: string
          impact_level: string
          office_id: string
          source_url: string | null
          status: string | null
          summary: string | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_ip_types?: string[] | null
          change_type: string
          created_at?: string | null
          detected_at?: string | null
          diff_data?: Json | null
          document_id?: string | null
          effective_date?: string | null
          id?: string
          impact_level: string
          office_id: string
          source_url?: string | null
          status?: string | null
          summary?: string | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_ip_types?: string[] | null
          change_type?: string
          created_at?: string | null
          detected_at?: string | null
          diff_data?: Json | null
          document_id?: string | null
          effective_date?: string | null
          id?: string
          impact_level?: string
          office_id?: string
          source_url?: string | null
          status?: string | null
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ipo_legal_change_alerts_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ipo_legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_legal_change_alerts_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_legal_change_alerts_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_legal_chunks: {
        Row: {
          article_id: string | null
          chunk_index: number
          chunk_size: number | null
          chunk_text: string
          citation_info: Json
          context_after: string | null
          context_before: string | null
          created_at: string | null
          document_id: string | null
          id: string
          ip_types: string[] | null
          keywords: string[] | null
          language: string | null
          office_id: string | null
        }
        Insert: {
          article_id?: string | null
          chunk_index: number
          chunk_size?: number | null
          chunk_text: string
          citation_info: Json
          context_after?: string | null
          context_before?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          ip_types?: string[] | null
          keywords?: string[] | null
          language?: string | null
          office_id?: string | null
        }
        Update: {
          article_id?: string | null
          chunk_index?: number
          chunk_size?: number | null
          chunk_text?: string
          citation_info?: Json
          context_after?: string | null
          context_before?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          ip_types?: string[] | null
          keywords?: string[] | null
          language?: string | null
          office_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_legal_chunks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "ipo_legal_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_legal_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ipo_legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_legal_chunks_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_legal_chunks_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_legal_document_versions: {
        Row: {
          change_date: string
          change_description: string | null
          change_type: string
          content_snapshot: string | null
          created_at: string | null
          diff_from_previous: Json | null
          document_id: string
          file_hash: string | null
          file_path: string | null
          id: string
          is_current: boolean | null
          superseded_at: string | null
          superseded_by: string | null
          version_label: string | null
          version_number: number
        }
        Insert: {
          change_date: string
          change_description?: string | null
          change_type: string
          content_snapshot?: string | null
          created_at?: string | null
          diff_from_previous?: Json | null
          document_id: string
          file_hash?: string | null
          file_path?: string | null
          id?: string
          is_current?: boolean | null
          superseded_at?: string | null
          superseded_by?: string | null
          version_label?: string | null
          version_number: number
        }
        Update: {
          change_date?: string
          change_description?: string | null
          change_type?: string
          content_snapshot?: string | null
          created_at?: string | null
          diff_from_previous?: Json | null
          document_id?: string
          file_hash?: string | null
          file_path?: string | null
          id?: string
          is_current?: boolean | null
          superseded_at?: string | null
          superseded_by?: string | null
          version_label?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "ipo_legal_document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ipo_legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_legal_document_versions_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "ipo_legal_document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_legal_documents: {
        Row: {
          applies_to_foreigners: boolean | null
          applies_to_nationals: boolean | null
          chunk_count: number | null
          content_full: string | null
          content_summary: string | null
          content_url: string | null
          created_at: string | null
          created_by: string | null
          document_level: string
          document_type: string
          effective_date: string
          expiry_date: string | null
          file_hash: string | null
          file_path: string | null
          file_size_bytes: number | null
          id: string
          indexed_at: string | null
          ip_types: string[] | null
          is_indexed: boolean | null
          language_original: string
          languages_available: string[] | null
          last_verified_at: string | null
          last_verified_by: string | null
          notes: string | null
          office_id: string
          official_number: string | null
          processing_error: string | null
          processing_status: string | null
          publication_date: string | null
          source_reliability: string
          source_type: string
          source_url: string | null
          status: string
          tags: string[] | null
          title: string
          title_english: string | null
          title_original: string | null
          updated_at: string | null
        }
        Insert: {
          applies_to_foreigners?: boolean | null
          applies_to_nationals?: boolean | null
          chunk_count?: number | null
          content_full?: string | null
          content_summary?: string | null
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          document_level: string
          document_type: string
          effective_date: string
          expiry_date?: string | null
          file_hash?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          indexed_at?: string | null
          ip_types?: string[] | null
          is_indexed?: boolean | null
          language_original: string
          languages_available?: string[] | null
          last_verified_at?: string | null
          last_verified_by?: string | null
          notes?: string | null
          office_id: string
          official_number?: string | null
          processing_error?: string | null
          processing_status?: string | null
          publication_date?: string | null
          source_reliability?: string
          source_type: string
          source_url?: string | null
          status?: string
          tags?: string[] | null
          title: string
          title_english?: string | null
          title_original?: string | null
          updated_at?: string | null
        }
        Update: {
          applies_to_foreigners?: boolean | null
          applies_to_nationals?: boolean | null
          chunk_count?: number | null
          content_full?: string | null
          content_summary?: string | null
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          document_level?: string
          document_type?: string
          effective_date?: string
          expiry_date?: string | null
          file_hash?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          indexed_at?: string | null
          ip_types?: string[] | null
          is_indexed?: boolean | null
          language_original?: string
          languages_available?: string[] | null
          last_verified_at?: string | null
          last_verified_by?: string | null
          notes?: string | null
          office_id?: string
          official_number?: string | null
          processing_error?: string | null
          processing_status?: string | null
          publication_date?: string | null
          source_reliability?: string
          source_type?: string
          source_url?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          title_english?: string | null
          title_original?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_legal_documents_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_legal_documents_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_legal_ingestion_jobs: {
        Row: {
          channel: string
          completed_at: string | null
          config: Json | null
          created_at: string | null
          created_by: string | null
          documents_found: number | null
          documents_imported: number | null
          documents_skipped: number | null
          documents_updated: number | null
          errors: Json | null
          id: string
          office_id: string | null
          source_url: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          channel: string
          completed_at?: string | null
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          documents_found?: number | null
          documents_imported?: number | null
          documents_skipped?: number | null
          documents_updated?: number | null
          errors?: Json | null
          id?: string
          office_id?: string | null
          source_url?: string | null
          started_at?: string | null
          status?: string
        }
        Update: {
          channel?: string
          completed_at?: string | null
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          documents_found?: number | null
          documents_imported?: number | null
          documents_skipped?: number | null
          documents_updated?: number | null
          errors?: Json | null
          id?: string
          office_id?: string | null
          source_url?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ipo_legal_ingestion_jobs_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_legal_ingestion_jobs_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_legal_relations: {
        Row: {
          created_at: string | null
          effective_date: string | null
          id: string
          notes: string | null
          relation_type: string
          source_article_id: string | null
          source_document_id: string
          target_article_id: string | null
          target_document_id: string
        }
        Insert: {
          created_at?: string | null
          effective_date?: string | null
          id?: string
          notes?: string | null
          relation_type: string
          source_article_id?: string | null
          source_document_id: string
          target_article_id?: string | null
          target_document_id: string
        }
        Update: {
          created_at?: string | null
          effective_date?: string | null
          id?: string
          notes?: string | null
          relation_type?: string
          source_article_id?: string | null
          source_document_id?: string
          target_article_id?: string | null
          target_document_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ipo_legal_relations_source_article_id_fkey"
            columns: ["source_article_id"]
            isOneToOne: false
            referencedRelation: "ipo_legal_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_legal_relations_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "ipo_legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_legal_relations_target_article_id_fkey"
            columns: ["target_article_id"]
            isOneToOne: false
            referencedRelation: "ipo_legal_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_legal_relations_target_document_id_fkey"
            columns: ["target_document_id"]
            isOneToOne: false
            referencedRelation: "ipo_legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_office_contacts: {
        Row: {
          contact_type: string
          created_at: string | null
          email: string | null
          hours: string | null
          id: string
          is_primary: boolean | null
          name: string | null
          notes: string | null
          office_id: string
          phone: string | null
          role: string | null
        }
        Insert: {
          contact_type: string
          created_at?: string | null
          email?: string | null
          hours?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string | null
          notes?: string | null
          office_id: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          contact_type?: string
          created_at?: string | null
          email?: string | null
          hours?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string | null
          notes?: string | null
          office_id?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_office_contacts_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_office_contacts_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_offices: {
        Row: {
          address: string | null
          code: string
          code_alt: string | null
          country_code: string | null
          created_at: string | null
          currency: string | null
          email_general: string | null
          id: string
          ip_types: string[] | null
          languages: string[] | null
          name_official: string
          name_short: string | null
          notes: string | null
          office_type: string
          phone_general: string | null
          priority_score: number | null
          region: string | null
          status: string | null
          tier: number | null
          timezone: string
          updated_at: string | null
          website_official: string | null
          website_search: string | null
        }
        Insert: {
          address?: string | null
          code: string
          code_alt?: string | null
          country_code?: string | null
          created_at?: string | null
          currency?: string | null
          email_general?: string | null
          id?: string
          ip_types?: string[] | null
          languages?: string[] | null
          name_official: string
          name_short?: string | null
          notes?: string | null
          office_type: string
          phone_general?: string | null
          priority_score?: number | null
          region?: string | null
          status?: string | null
          tier?: number | null
          timezone: string
          updated_at?: string | null
          website_official?: string | null
          website_search?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          code_alt?: string | null
          country_code?: string | null
          created_at?: string | null
          currency?: string | null
          email_general?: string | null
          id?: string
          ip_types?: string[] | null
          languages?: string[] | null
          name_official?: string
          name_short?: string | null
          notes?: string | null
          office_type?: string
          phone_general?: string | null
          priority_score?: number | null
          region?: string | null
          status?: string | null
          tier?: number | null
          timezone?: string
          updated_at?: string | null
          website_official?: string | null
          website_search?: string | null
        }
        Relationships: []
      }
      ipo_official_fees: {
        Row: {
          additional_class_fee: number | null
          amount: number
          base_classes: number | null
          created_at: string | null
          currency: string
          description: string | null
          effective_from: string
          effective_until: string | null
          fee_type: string
          id: string
          ip_type: string
          last_verified_at: string | null
          office_id: string
          online_discount: number | null
          per_class: boolean | null
          small_entity_discount: number | null
          source_url: string | null
        }
        Insert: {
          additional_class_fee?: number | null
          amount: number
          base_classes?: number | null
          created_at?: string | null
          currency: string
          description?: string | null
          effective_from: string
          effective_until?: string | null
          fee_type: string
          id?: string
          ip_type: string
          last_verified_at?: string | null
          office_id: string
          online_discount?: number | null
          per_class?: boolean | null
          small_entity_discount?: number | null
          source_url?: string | null
        }
        Update: {
          additional_class_fee?: number | null
          amount?: number
          base_classes?: number | null
          created_at?: string | null
          currency?: string
          description?: string | null
          effective_from?: string
          effective_until?: string | null
          fee_type?: string
          id?: string
          ip_type?: string
          last_verified_at?: string | null
          office_id?: string
          online_discount?: number | null
          per_class?: boolean | null
          small_entity_discount?: number | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_official_fees_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_official_fees_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_official_forms: {
        Row: {
          created_at: string | null
          effective_date: string | null
          efiling_format: string | null
          efiling_schema: string | null
          efiling_url: string | null
          expiry_date: string | null
          file_format: string | null
          file_path_fillable: string | null
          file_path_original: string | null
          form_code: string | null
          form_name: string
          form_name_english: string | null
          form_type: string
          id: string
          ip_type: string | null
          language: string
          last_verified_at: string | null
          office_id: string
          requires_legalization: boolean | null
          requires_notarization: boolean | null
          requires_signature: boolean | null
          status: string | null
          supports_efiling: boolean | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          effective_date?: string | null
          efiling_format?: string | null
          efiling_schema?: string | null
          efiling_url?: string | null
          expiry_date?: string | null
          file_format?: string | null
          file_path_fillable?: string | null
          file_path_original?: string | null
          form_code?: string | null
          form_name: string
          form_name_english?: string | null
          form_type: string
          id?: string
          ip_type?: string | null
          language: string
          last_verified_at?: string | null
          office_id: string
          requires_legalization?: boolean | null
          requires_notarization?: boolean | null
          requires_signature?: boolean | null
          status?: string | null
          supports_efiling?: boolean | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          effective_date?: string | null
          efiling_format?: string | null
          efiling_schema?: string | null
          efiling_url?: string | null
          expiry_date?: string | null
          file_format?: string | null
          file_path_fillable?: string | null
          file_path_original?: string | null
          form_code?: string | null
          form_name?: string
          form_name_english?: string | null
          form_type?: string
          id?: string
          ip_type?: string | null
          language?: string
          last_verified_at?: string | null
          office_id?: string
          requires_legalization?: boolean | null
          requires_notarization?: boolean | null
          requires_signature?: boolean | null
          status?: string | null
          supports_efiling?: boolean | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_official_forms_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_official_forms_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_scraper_configs: {
        Row: {
          browser_headless: boolean | null
          browser_type: string | null
          captcha_strategy: string | null
          connection_method_id: string
          created_at: string | null
          detail_url_pattern: string | null
          id: string
          previous_versions: Json | null
          proxy_country: string | null
          proxy_strategy: string | null
          script_content: string | null
          script_generated_at: string | null
          script_generated_by: string | null
          script_version: string | null
          search_url: string | null
          selectors: Json
          target_url: string
          updated_at: string | null
          user_agent: string | null
          viewport_height: number | null
          viewport_width: number | null
          wait_strategy: Json | null
        }
        Insert: {
          browser_headless?: boolean | null
          browser_type?: string | null
          captcha_strategy?: string | null
          connection_method_id: string
          created_at?: string | null
          detail_url_pattern?: string | null
          id?: string
          previous_versions?: Json | null
          proxy_country?: string | null
          proxy_strategy?: string | null
          script_content?: string | null
          script_generated_at?: string | null
          script_generated_by?: string | null
          script_version?: string | null
          search_url?: string | null
          selectors?: Json
          target_url: string
          updated_at?: string | null
          user_agent?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
          wait_strategy?: Json | null
        }
        Update: {
          browser_headless?: boolean | null
          browser_type?: string | null
          captcha_strategy?: string | null
          connection_method_id?: string
          created_at?: string | null
          detail_url_pattern?: string | null
          id?: string
          previous_versions?: Json | null
          proxy_country?: string | null
          proxy_strategy?: string | null
          script_content?: string | null
          script_generated_at?: string | null
          script_generated_by?: string | null
          script_version?: string | null
          search_url?: string | null
          selectors?: Json
          target_url?: string
          updated_at?: string | null
          user_agent?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
          wait_strategy?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_scraper_configs_connection_method_id_fkey"
            columns: ["connection_method_id"]
            isOneToOne: false
            referencedRelation: "ipo_connection_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_scraper_configs_connection_method_id_fkey"
            columns: ["connection_method_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["connection_method_id"]
          },
        ]
      }
      ipo_scraper_versions: {
        Row: {
          activated_at: string | null
          created_at: string | null
          deactivated_at: string | null
          deactivation_reason: string | null
          generated_by: string
          generation_prompt: string | null
          id: string
          is_active: boolean | null
          scraper_config_id: string
          script_content: string
          selectors: Json
          test_results: Json | null
          test_status: string | null
          version: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          deactivation_reason?: string | null
          generated_by: string
          generation_prompt?: string | null
          id?: string
          is_active?: boolean | null
          scraper_config_id: string
          script_content: string
          selectors: Json
          test_results?: Json | null
          test_status?: string | null
          version: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          deactivation_reason?: string | null
          generated_by?: string
          generation_prompt?: string | null
          id?: string
          is_active?: boolean | null
          scraper_config_id?: string
          script_content?: string
          selectors?: Json
          test_results?: Json | null
          test_status?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "ipo_scraper_versions_scraper_config_id_fkey"
            columns: ["scraper_config_id"]
            isOneToOne: false
            referencedRelation: "ipo_scraper_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_sync_logs: {
        Row: {
          completed_at: string | null
          connection_method_id: string | null
          duration_ms: number | null
          errors: Json | null
          id: string
          office_id: string
          records_created: number | null
          records_failed: number | null
          records_fetched: number | null
          records_updated: number | null
          source_file: string | null
          started_at: string
          status: string
          sync_type: string
          triggered_by: string | null
          triggered_by_user: string | null
        }
        Insert: {
          completed_at?: string | null
          connection_method_id?: string | null
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          office_id: string
          records_created?: number | null
          records_failed?: number | null
          records_fetched?: number | null
          records_updated?: number | null
          source_file?: string | null
          started_at: string
          status: string
          sync_type: string
          triggered_by?: string | null
          triggered_by_user?: string | null
        }
        Update: {
          completed_at?: string | null
          connection_method_id?: string | null
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          office_id?: string
          records_created?: number | null
          records_failed?: number | null
          records_fetched?: number | null
          records_updated?: number | null
          source_file?: string | null
          started_at?: string
          status?: string
          sync_type?: string
          triggered_by?: string | null
          triggered_by_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_sync_logs_connection_method_id_fkey"
            columns: ["connection_method_id"]
            isOneToOne: false
            referencedRelation: "ipo_connection_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_sync_logs_connection_method_id_fkey"
            columns: ["connection_method_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["connection_method_id"]
          },
          {
            foreignKeyName: "ipo_sync_logs_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_sync_logs_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_treaty_status: {
        Row: {
          created_at: string | null
          entry_into_force_date: string | null
          has_reservations: boolean | null
          id: string
          last_verified_at: string | null
          office_id: string
          ratification_date: string | null
          reservations_text: string | null
          source_url: string | null
          status: string
          treaty_code: string
          treaty_name: string
          updated_at: string | null
          withdrawal_date: string | null
        }
        Insert: {
          created_at?: string | null
          entry_into_force_date?: string | null
          has_reservations?: boolean | null
          id?: string
          last_verified_at?: string | null
          office_id: string
          ratification_date?: string | null
          reservations_text?: string | null
          source_url?: string | null
          status: string
          treaty_code: string
          treaty_name: string
          updated_at?: string | null
          withdrawal_date?: string | null
        }
        Update: {
          created_at?: string | null
          entry_into_force_date?: string | null
          has_reservations?: boolean | null
          id?: string
          last_verified_at?: string | null
          office_id?: string
          ratification_date?: string | null
          reservations_text?: string | null
          source_url?: string | null
          status?: string
          treaty_code?: string
          treaty_name?: string
          updated_at?: string | null
          withdrawal_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_treaty_status_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_treaty_status_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          category: string
          content: string
          content_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          effective_date: string | null
          expiry_date: string | null
          id: string
          is_current: boolean | null
          jurisdiction: string | null
          language: string | null
          source: string | null
          source_url: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          content_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_current?: boolean | null
          jurisdiction?: string | null
          language?: string | null
          source?: string | null
          source_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          content_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_current?: boolean | null
          jurisdiction?: string | null
          language?: string | null
          source?: string | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      market_alerts: {
        Row: {
          asset_types: Database["public"]["Enums"]["market_asset_type"][] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          jurisdictions: string[] | null
          keywords: string[] | null
          last_triggered_at: string | null
          max_price: number | null
          min_price: number | null
          name: string | null
          nice_classes: number[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asset_types?:
            | Database["public"]["Enums"]["market_asset_type"][]
            | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          jurisdictions?: string[] | null
          keywords?: string[] | null
          last_triggered_at?: string | null
          max_price?: number | null
          min_price?: number | null
          name?: string | null
          nice_classes?: number[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asset_types?:
            | Database["public"]["Enums"]["market_asset_type"][]
            | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          jurisdictions?: string[] | null
          keywords?: string[] | null
          last_triggered_at?: string | null
          max_price?: number | null
          min_price?: number | null
          name?: string | null
          nice_classes?: number[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      market_assets: {
        Row: {
          abstract: string | null
          asset_category: Database["public"]["Enums"]["market_asset_category"]
          asset_type: Database["public"]["Enums"]["market_asset_type"]
          author: string | null
          claims: string[] | null
          created_at: string | null
          creation_date: string | null
          description: string | null
          documents: Json | null
          domain_name: string | null
          expiration_date: string | null
          filing_date: string | null
          id: string
          images: string[] | null
          inventors: string[] | null
          jurisdiction: string | null
          logo_url: string | null
          metadata: Json | null
          nice_classes: number[] | null
          owner_id: string
          pct_number: string | null
          registrar: string | null
          registration_date: string | null
          registration_number: string | null
          title: string
          updated_at: string | null
          verification_data: Json | null
          verification_expires_at: string | null
          verification_status:
            | Database["public"]["Enums"]["market_verification_status"]
            | null
          verified_at: string | null
          word_mark: string | null
        }
        Insert: {
          abstract?: string | null
          asset_category: Database["public"]["Enums"]["market_asset_category"]
          asset_type: Database["public"]["Enums"]["market_asset_type"]
          author?: string | null
          claims?: string[] | null
          created_at?: string | null
          creation_date?: string | null
          description?: string | null
          documents?: Json | null
          domain_name?: string | null
          expiration_date?: string | null
          filing_date?: string | null
          id?: string
          images?: string[] | null
          inventors?: string[] | null
          jurisdiction?: string | null
          logo_url?: string | null
          metadata?: Json | null
          nice_classes?: number[] | null
          owner_id: string
          pct_number?: string | null
          registrar?: string | null
          registration_date?: string | null
          registration_number?: string | null
          title: string
          updated_at?: string | null
          verification_data?: Json | null
          verification_expires_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["market_verification_status"]
            | null
          verified_at?: string | null
          word_mark?: string | null
        }
        Update: {
          abstract?: string | null
          asset_category?: Database["public"]["Enums"]["market_asset_category"]
          asset_type?: Database["public"]["Enums"]["market_asset_type"]
          author?: string | null
          claims?: string[] | null
          created_at?: string | null
          creation_date?: string | null
          description?: string | null
          documents?: Json | null
          domain_name?: string | null
          expiration_date?: string | null
          filing_date?: string | null
          id?: string
          images?: string[] | null
          inventors?: string[] | null
          jurisdiction?: string | null
          logo_url?: string | null
          metadata?: Json | null
          nice_classes?: number[] | null
          owner_id?: string
          pct_number?: string | null
          registrar?: string | null
          registration_date?: string | null
          registration_number?: string | null
          title?: string
          updated_at?: string | null
          verification_data?: Json | null
          verification_expires_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["market_verification_status"]
            | null
          verified_at?: string | null
          word_mark?: string | null
        }
        Relationships: []
      }
      market_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      market_certifications: {
        Row: {
          blockchain_network: string | null
          blockchain_tx_hash: string | null
          certificate_data: Json | null
          certificate_url: string | null
          certification_level: Database["public"]["Enums"]["market_certification_level"]
          created_at: string | null
          document_hash: string
          id: string
          metadata_hash: string | null
          method: string
          provider: string | null
          provider_reference: string | null
          smart_contract_address: string | null
          token_id: string | null
          transaction_id: string
          verification_url: string | null
          verified: boolean | null
        }
        Insert: {
          blockchain_network?: string | null
          blockchain_tx_hash?: string | null
          certificate_data?: Json | null
          certificate_url?: string | null
          certification_level: Database["public"]["Enums"]["market_certification_level"]
          created_at?: string | null
          document_hash: string
          id?: string
          metadata_hash?: string | null
          method: string
          provider?: string | null
          provider_reference?: string | null
          smart_contract_address?: string | null
          token_id?: string | null
          transaction_id: string
          verification_url?: string | null
          verified?: boolean | null
        }
        Update: {
          blockchain_network?: string | null
          blockchain_tx_hash?: string | null
          certificate_data?: Json | null
          certificate_url?: string | null
          certification_level?: Database["public"]["Enums"]["market_certification_level"]
          created_at?: string | null
          document_hash?: string
          id?: string
          metadata_hash?: string | null
          method?: string
          provider?: string | null
          provider_reference?: string | null
          smart_contract_address?: string | null
          token_id?: string | null
          transaction_id?: string
          verification_url?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "market_certifications_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "market_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      market_compliance_checks: {
        Row: {
          check_type: string
          created_at: string | null
          expires_at: string | null
          id: string
          notes: string | null
          provider: string
          provider_reference: string | null
          request_data: Json | null
          results: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string | null
          risk_score: number | null
          status: string
          user_id: string
        }
        Insert: {
          check_type: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          provider: string
          provider_reference?: string | null
          request_data?: Json | null
          results?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          risk_score?: number | null
          status?: string
          user_id: string
        }
        Update: {
          check_type?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          provider?: string
          provider_reference?: string | null
          request_data?: Json | null
          results?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          risk_score?: number | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      market_content_reports: {
        Row: {
          action_taken: string | null
          assigned_to: string | null
          created_at: string | null
          description: string
          evidence_urls: string[] | null
          id: string
          report_type: string
          reported_entity_id: string
          reported_entity_type: string
          reporter_id: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          action_taken?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description: string
          evidence_urls?: string[] | null
          id?: string
          report_type: string
          reported_entity_id: string
          reported_entity_type: string
          reporter_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          action_taken?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          evidence_urls?: string[] | null
          id?: string
          report_type?: string
          reported_entity_id?: string
          reported_entity_type?: string
          reporter_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: []
      }
      market_favorites: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "market_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      market_kyc_audit_log: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          new_value: Json | null
          old_value: Json | null
          performed_by: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          performed_by?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          performed_by?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      market_kyc_verifications: {
        Row: {
          created_at: string | null
          documents: Json | null
          expires_at: string | null
          external_reference: string | null
          id: string
          provider: string | null
          rejection_reason: string | null
          status:
            | Database["public"]["Enums"]["market_verification_status"]
            | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
          verification_result: Json | null
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          documents?: Json | null
          expires_at?: string | null
          external_reference?: string | null
          id?: string
          provider?: string | null
          rejection_reason?: string | null
          status?:
            | Database["public"]["Enums"]["market_verification_status"]
            | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
          verification_result?: Json | null
          verification_type: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          documents?: Json | null
          expires_at?: string | null
          external_reference?: string | null
          id?: string
          provider?: string | null
          rejection_reason?: string | null
          status?:
            | Database["public"]["Enums"]["market_verification_status"]
            | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
          verification_result?: Json | null
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      market_listings: {
        Row: {
          asking_price: number | null
          asset_id: string
          available_classes: number[] | null
          available_territories: string[] | null
          created_at: string | null
          currency: string | null
          description: string | null
          expires_at: string | null
          favorite_count: number | null
          featured_until: string | null
          highlights: string[] | null
          id: string
          industries: string[] | null
          inquiry_count: number | null
          is_featured: boolean | null
          is_urgent: boolean | null
          keywords: string[] | null
          license_terms: Json | null
          listing_number: string
          minimum_offer: number | null
          offer_count: number | null
          price_negotiable: boolean | null
          published_at: string | null
          seller_id: string
          status: Database["public"]["Enums"]["market_listing_status"] | null
          title: string
          transaction_types: Database["public"]["Enums"]["market_transaction_type"][]
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          asking_price?: number | null
          asset_id: string
          available_classes?: number[] | null
          available_territories?: string[] | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          favorite_count?: number | null
          featured_until?: string | null
          highlights?: string[] | null
          id?: string
          industries?: string[] | null
          inquiry_count?: number | null
          is_featured?: boolean | null
          is_urgent?: boolean | null
          keywords?: string[] | null
          license_terms?: Json | null
          listing_number: string
          minimum_offer?: number | null
          offer_count?: number | null
          price_negotiable?: boolean | null
          published_at?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["market_listing_status"] | null
          title: string
          transaction_types: Database["public"]["Enums"]["market_transaction_type"][]
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          asking_price?: number | null
          asset_id?: string
          available_classes?: number[] | null
          available_territories?: string[] | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          favorite_count?: number | null
          featured_until?: string | null
          highlights?: string[] | null
          id?: string
          industries?: string[] | null
          inquiry_count?: number | null
          is_featured?: boolean | null
          is_urgent?: boolean | null
          keywords?: string[] | null
          license_terms?: Json | null
          listing_number?: string
          minimum_offer?: number | null
          offer_count?: number | null
          price_negotiable?: boolean | null
          published_at?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["market_listing_status"] | null
          title?: string
          transaction_types?: Database["public"]["Enums"]["market_transaction_type"][]
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_listings_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "market_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          listing_id: string | null
          message: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          thread_id: string
          transaction_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          message: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          thread_id: string
          transaction_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          message?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          thread_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "market_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_messages_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "market_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      market_moderation_actions: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          moderator_id: string
          reason: string
          report_id: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          moderator_id: string
          reason: string
          report_id?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          moderator_id?: string
          reason?: string
          report_id?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_moderation_actions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "market_content_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      market_offers: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          listing_id: string
          message: string | null
          offer_type: string
          parent_offer_id: string | null
          proposed_terms: Json | null
          responded_at: string | null
          response_message: string | null
          status: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          listing_id: string
          message?: string | null
          offer_type: string
          parent_offer_id?: string | null
          proposed_terms?: Json | null
          responded_at?: string | null
          response_message?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          listing_id?: string
          message?: string | null
          offer_type?: string
          parent_offer_id?: string | null
          proposed_terms?: Json | null
          responded_at?: string | null
          response_message?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "market_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_offers_parent_offer_id_fkey"
            columns: ["parent_offer_id"]
            isOneToOne: false
            referencedRelation: "market_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_offers_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "market_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      market_reviews: {
        Row: {
          accuracy_rating: number | null
          communication_rating: number | null
          created_at: string | null
          flagged: boolean | null
          id: string
          overall_rating: number
          professionalism_rating: number | null
          responded_at: string | null
          response: string | null
          review: string | null
          reviewed_id: string
          reviewer_id: string
          title: string | null
          transaction_id: string
          updated_at: string | null
          visible: boolean | null
        }
        Insert: {
          accuracy_rating?: number | null
          communication_rating?: number | null
          created_at?: string | null
          flagged?: boolean | null
          id?: string
          overall_rating: number
          professionalism_rating?: number | null
          responded_at?: string | null
          response?: string | null
          review?: string | null
          reviewed_id: string
          reviewer_id: string
          title?: string | null
          transaction_id: string
          updated_at?: string | null
          visible?: boolean | null
        }
        Update: {
          accuracy_rating?: number | null
          communication_rating?: number | null
          created_at?: string | null
          flagged?: boolean | null
          id?: string
          overall_rating?: number
          professionalism_rating?: number | null
          responded_at?: string | null
          response?: string | null
          review?: string | null
          reviewed_id?: string
          reviewer_id?: string
          title?: string | null
          transaction_id?: string
          updated_at?: string | null
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "market_reviews_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "market_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      market_risk_assessments: {
        Row: {
          calculated_at: string | null
          created_at: string | null
          factors: Json
          flags: string[] | null
          id: string
          overall_level: string
          overall_score: number
          recommendations: string[] | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          calculated_at?: string | null
          created_at?: string | null
          factors?: Json
          flags?: string[] | null
          id?: string
          overall_level?: string
          overall_score?: number
          recommendations?: string[] | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          calculated_at?: string | null
          created_at?: string | null
          factors?: Json
          flags?: string[] | null
          id?: string
          overall_level?: string
          overall_score?: number
          recommendations?: string[] | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      market_transactions: {
        Row: {
          agreed_price: number | null
          asset_id: string
          blockchain_tx_hash: string | null
          buyer_id: string
          certificate_url: string | null
          certification_hash: string | null
          certification_level:
            | Database["public"]["Enums"]["market_certification_level"]
            | null
          certification_timestamp: string | null
          commission_amount: number | null
          commission_rate: number | null
          completed_at: string | null
          contract_signed_at: string | null
          contract_url: string | null
          created_at: string | null
          currency: string | null
          dispute_id: string | null
          dispute_reason: string | null
          due_diligence_completed: boolean | null
          due_diligence_report: Json | null
          escrow_provider: string | null
          escrow_reference: string | null
          escrow_status: string | null
          id: string
          license_terms: Json | null
          listing_id: string
          metadata: Json | null
          nda_signed_at: string | null
          nda_url: string | null
          notes: string | null
          offered_price: number | null
          paid_at: string | null
          payment_intent_id: string | null
          payment_method: string | null
          seller_id: string
          status:
            | Database["public"]["Enums"]["market_transaction_status"]
            | null
          transaction_number: string
          transaction_type: Database["public"]["Enums"]["market_transaction_type"]
          transfer_completed: boolean | null
          transfer_proof_url: string | null
          updated_at: string | null
        }
        Insert: {
          agreed_price?: number | null
          asset_id: string
          blockchain_tx_hash?: string | null
          buyer_id: string
          certificate_url?: string | null
          certification_hash?: string | null
          certification_level?:
            | Database["public"]["Enums"]["market_certification_level"]
            | null
          certification_timestamp?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          completed_at?: string | null
          contract_signed_at?: string | null
          contract_url?: string | null
          created_at?: string | null
          currency?: string | null
          dispute_id?: string | null
          dispute_reason?: string | null
          due_diligence_completed?: boolean | null
          due_diligence_report?: Json | null
          escrow_provider?: string | null
          escrow_reference?: string | null
          escrow_status?: string | null
          id?: string
          license_terms?: Json | null
          listing_id: string
          metadata?: Json | null
          nda_signed_at?: string | null
          nda_url?: string | null
          notes?: string | null
          offered_price?: number | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          seller_id: string
          status?:
            | Database["public"]["Enums"]["market_transaction_status"]
            | null
          transaction_number: string
          transaction_type: Database["public"]["Enums"]["market_transaction_type"]
          transfer_completed?: boolean | null
          transfer_proof_url?: string | null
          updated_at?: string | null
        }
        Update: {
          agreed_price?: number | null
          asset_id?: string
          blockchain_tx_hash?: string | null
          buyer_id?: string
          certificate_url?: string | null
          certification_hash?: string | null
          certification_level?:
            | Database["public"]["Enums"]["market_certification_level"]
            | null
          certification_timestamp?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          completed_at?: string | null
          contract_signed_at?: string | null
          contract_url?: string | null
          created_at?: string | null
          currency?: string | null
          dispute_id?: string | null
          dispute_reason?: string | null
          due_diligence_completed?: boolean | null
          due_diligence_report?: Json | null
          escrow_provider?: string | null
          escrow_reference?: string | null
          escrow_status?: string | null
          id?: string
          license_terms?: Json | null
          listing_id?: string
          metadata?: Json | null
          nda_signed_at?: string | null
          nda_url?: string | null
          notes?: string | null
          offered_price?: number | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          seller_id?: string
          status?:
            | Database["public"]["Enums"]["market_transaction_status"]
            | null
          transaction_number?: string
          transaction_type?: Database["public"]["Enums"]["market_transaction_type"]
          transfer_completed?: boolean | null
          transfer_proof_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_transactions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "market_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "market_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      market_user_profiles: {
        Row: {
          address: Json | null
          agent_license_number: string | null
          avatar_url: string | null
          average_rating: number | null
          bar_association: string | null
          bio: string | null
          company_name: string | null
          company_registration_number: string | null
          company_vat_number: string | null
          country_code: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_agent: boolean | null
          is_company: boolean | null
          kyc_expires_at: string | null
          kyc_level: Database["public"]["Enums"]["market_kyc_level"] | null
          kyc_verified_at: string | null
          legal_representative_name: string | null
          notification_preferences: Json | null
          phone: string | null
          phone_verified: boolean | null
          preferred_currency: string | null
          preferred_language: string | null
          professional_insurance: Json | null
          total_listings: number | null
          total_transactions: number | null
          total_volume: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: Json | null
          agent_license_number?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          bar_association?: string | null
          bio?: string | null
          company_name?: string | null
          company_registration_number?: string | null
          company_vat_number?: string | null
          country_code?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_agent?: boolean | null
          is_company?: boolean | null
          kyc_expires_at?: string | null
          kyc_level?: Database["public"]["Enums"]["market_kyc_level"] | null
          kyc_verified_at?: string | null
          legal_representative_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          preferred_currency?: string | null
          preferred_language?: string | null
          professional_insurance?: Json | null
          total_listings?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: Json | null
          agent_license_number?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          bar_association?: string | null
          bio?: string | null
          company_name?: string | null
          company_registration_number?: string | null
          company_vat_number?: string | null
          country_code?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_agent?: boolean | null
          is_company?: boolean | null
          kyc_expires_at?: string | null
          kyc_level?: Database["public"]["Enums"]["market_kyc_level"] | null
          kyc_verified_at?: string | null
          legal_representative_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          preferred_currency?: string | null
          preferred_language?: string | null
          professional_insurance?: Json | null
          total_listings?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      market_verification_documents: {
        Row: {
          document_type: string
          extracted_data: Json | null
          file_name: string
          file_size: number
          file_url: string
          id: string
          mime_type: string
          ocr_text: string | null
          rejection_reason: string | null
          status: string
          uploaded_at: string | null
          user_id: string
          verification_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_type: string
          extracted_data?: Json | null
          file_name: string
          file_size: number
          file_url: string
          id?: string
          mime_type: string
          ocr_text?: string | null
          rejection_reason?: string | null
          status?: string
          uploaded_at?: string | null
          user_id: string
          verification_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_type?: string
          extracted_data?: Json | null
          file_name?: string
          file_size?: number
          file_url?: string
          id?: string
          mime_type?: string
          ocr_text?: string | null
          rejection_reason?: string | null
          status?: string
          uploaded_at?: string | null
          user_id?: string
          verification_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_verification_documents_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "market_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      market_verifications: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          last_attempt_at: string | null
          metadata: Json | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_attempt_at?: string | null
          metadata?: Json | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_attempt_at?: string | null
          metadata?: Json | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      matter_costs: {
        Row: {
          amount: number
          amount_local: number | null
          cost_date: string
          cost_type: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string
          due_date: string | null
          exchange_rate: number | null
          id: string
          invoice_id: string | null
          is_billable: boolean | null
          matter_id: string
          notes: string | null
          official_fee_id: string | null
          organization_id: string
          paid_date: string | null
          quantity: number | null
          service_fee_id: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          amount_local?: number | null
          cost_date?: string
          cost_type: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description: string
          due_date?: string | null
          exchange_rate?: number | null
          id?: string
          invoice_id?: string | null
          is_billable?: boolean | null
          matter_id: string
          notes?: string | null
          official_fee_id?: string | null
          organization_id: string
          paid_date?: string | null
          quantity?: number | null
          service_fee_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          amount_local?: number | null
          cost_date?: string
          cost_type?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string
          due_date?: string | null
          exchange_rate?: number | null
          id?: string
          invoice_id?: string | null
          is_billable?: boolean | null
          matter_id?: string
          notes?: string | null
          official_fee_id?: string | null
          organization_id?: string
          paid_date?: string | null
          quantity?: number | null
          service_fee_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matter_costs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_costs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_costs_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_costs_official_fee_id_fkey"
            columns: ["official_fee_id"]
            isOneToOne: false
            referencedRelation: "official_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_costs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_costs_service_fee_id_fkey"
            columns: ["service_fee_id"]
            isOneToOne: false
            referencedRelation: "service_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      matter_documents: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          document_date: string | null
          expiry_date: string | null
          file_path: string
          file_size: number | null
          id: string
          is_official: boolean | null
          matter_id: string
          mime_type: string | null
          name: string
          organization_id: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          document_date?: string | null
          expiry_date?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          is_official?: boolean | null
          matter_id: string
          mime_type?: string | null
          name: string
          organization_id: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          document_date?: string | null
          expiry_date?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          is_official?: boolean | null
          matter_id?: string
          mime_type?: string | null
          name?: string
          organization_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matter_documents_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matter_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          event_date: string | null
          id: string
          matter_id: string
          organization_id: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          matter_id: string
          organization_id: string
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          matter_id?: string
          organization_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "matter_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_events_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      matter_valuations: {
        Row: {
          calculation_notes: string | null
          created_at: string | null
          currency: string | null
          estimated_value: number | null
          factors: Json | null
          id: string
          matter_id: string
          methodology: string | null
          portfolio_valuation_id: string | null
        }
        Insert: {
          calculation_notes?: string | null
          created_at?: string | null
          currency?: string | null
          estimated_value?: number | null
          factors?: Json | null
          id?: string
          matter_id: string
          methodology?: string | null
          portfolio_valuation_id?: string | null
        }
        Update: {
          calculation_notes?: string | null
          created_at?: string | null
          currency?: string | null
          estimated_value?: number | null
          factors?: Json | null
          id?: string
          matter_id?: string
          methodology?: string | null
          portfolio_valuation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matter_valuations_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_valuations_portfolio_valuation_id_fkey"
            columns: ["portfolio_valuation_id"]
            isOneToOne: false
            referencedRelation: "portfolio_valuations"
            referencedColumns: ["id"]
          },
        ]
      }
      matters: {
        Row: {
          application_number: string | null
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          expiry_date: string | null
          filing_date: string | null
          goods_services: string | null
          id: string
          images: string[] | null
          jurisdiction: string | null
          jurisdiction_code: string | null
          mark_image_url: string | null
          mark_name: string | null
          mark_type: string | null
          next_renewal_date: string | null
          nice_classes: number[] | null
          notes: string | null
          official_fees: number | null
          organization_id: string
          owner_name: string | null
          professional_fees: number | null
          reference: string
          registration_date: string | null
          registration_number: string | null
          status: string
          tags: string[] | null
          title: string
          total_cost: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          application_number?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          expiry_date?: string | null
          filing_date?: string | null
          goods_services?: string | null
          id?: string
          images?: string[] | null
          jurisdiction?: string | null
          jurisdiction_code?: string | null
          mark_image_url?: string | null
          mark_name?: string | null
          mark_type?: string | null
          next_renewal_date?: string | null
          nice_classes?: number[] | null
          notes?: string | null
          official_fees?: number | null
          organization_id: string
          owner_name?: string | null
          professional_fees?: number | null
          reference: string
          registration_date?: string | null
          registration_number?: string | null
          status?: string
          tags?: string[] | null
          title: string
          total_cost?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          application_number?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          expiry_date?: string | null
          filing_date?: string | null
          goods_services?: string | null
          id?: string
          images?: string[] | null
          jurisdiction?: string | null
          jurisdiction_code?: string | null
          mark_image_url?: string | null
          mark_name?: string | null
          mark_type?: string | null
          next_renewal_date?: string | null
          nice_classes?: number[] | null
          notes?: string | null
          official_fees?: number | null
          organization_id?: string
          owner_name?: string | null
          professional_fees?: number | null
          reference?: string
          registration_date?: string | null
          registration_number?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          total_cost?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matters_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          permissions?: Json | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          permissions?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_cache: {
        Row: {
          calculated_at: string | null
          expires_at: string | null
          id: string
          metric_code: string
          metric_value: Json
          organization_id: string
          period_end: string | null
          period_start: string | null
          period_type: string
        }
        Insert: {
          calculated_at?: string | null
          expires_at?: string | null
          id?: string
          metric_code: string
          metric_value: Json
          organization_id: string
          period_end?: string | null
          period_start?: string | null
          period_type: string
        }
        Update: {
          calculated_at?: string | null
          expires_at?: string | null
          id?: string
          metric_code?: string
          metric_value?: Json
          organization_id?: string
          period_end?: string | null
          period_start?: string | null
          period_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "metrics_cache_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_agents: {
        Row: {
          active_connections: number | null
          agent_key: string
          agent_secret_hash: string
          agent_version: string | null
          capabilities: Json | null
          created_at: string | null
          hostname: string | null
          id: string
          last_activity: string | null
          last_error: string | null
          last_heartbeat: string | null
          name: string
          organization_id: string
          os_type: string | null
          os_version: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          active_connections?: number | null
          agent_key: string
          agent_secret_hash: string
          agent_version?: string | null
          capabilities?: Json | null
          created_at?: string | null
          hostname?: string | null
          id?: string
          last_activity?: string | null
          last_error?: string | null
          last_heartbeat?: string | null
          name: string
          organization_id: string
          os_type?: string | null
          os_version?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          active_connections?: number | null
          agent_key?: string
          agent_secret_hash?: string
          agent_version?: string | null
          capabilities?: Json | null
          created_at?: string | null
          hostname?: string | null
          id?: string
          last_activity?: string | null
          last_error?: string | null
          last_heartbeat?: string | null
          name?: string
          organization_id?: string
          os_type?: string | null
          os_version?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "migration_agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_connections: {
        Row: {
          agent_id: string | null
          auth_type: string
          connection_config: Json | null
          created_at: string | null
          created_by: string | null
          credentials_vault_id: string | null
          description: string | null
          id: string
          last_successful_connection: string | null
          last_test_at: string | null
          last_test_result: Json | null
          name: string
          organization_id: string
          status: string | null
          system_metadata: Json | null
          system_type: string
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          auth_type: string
          connection_config?: Json | null
          created_at?: string | null
          created_by?: string | null
          credentials_vault_id?: string | null
          description?: string | null
          id?: string
          last_successful_connection?: string | null
          last_test_at?: string | null
          last_test_result?: Json | null
          name: string
          organization_id: string
          status?: string | null
          system_metadata?: Json | null
          system_type: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          auth_type?: string
          connection_config?: Json | null
          created_at?: string | null
          created_by?: string | null
          credentials_vault_id?: string | null
          description?: string | null
          id?: string
          last_successful_connection?: string | null
          last_test_at?: string | null
          last_test_result?: Json | null
          name?: string
          organization_id?: string
          status?: string | null
          system_metadata?: Json | null
          system_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "migration_connections_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "migration_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_files: {
        Row: {
          analysis: Json | null
          column_mapping: Json | null
          created_at: string | null
          entity_type: string
          failed_rows: number | null
          file_format: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          migrated_rows: number | null
          organization_id: string
          processed_rows: number | null
          project_id: string
          skipped_rows: number | null
          total_rows: number | null
          transformations: Json | null
          validation_errors: Json | null
          validation_status: string | null
          validation_warnings: Json | null
        }
        Insert: {
          analysis?: Json | null
          column_mapping?: Json | null
          created_at?: string | null
          entity_type: string
          failed_rows?: number | null
          file_format?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          migrated_rows?: number | null
          organization_id: string
          processed_rows?: number | null
          project_id: string
          skipped_rows?: number | null
          total_rows?: number | null
          transformations?: Json | null
          validation_errors?: Json | null
          validation_status?: string | null
          validation_warnings?: Json | null
        }
        Update: {
          analysis?: Json | null
          column_mapping?: Json | null
          created_at?: string | null
          entity_type?: string
          failed_rows?: number | null
          file_format?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          migrated_rows?: number | null
          organization_id?: string
          processed_rows?: number | null
          project_id?: string
          skipped_rows?: number | null
          total_rows?: number | null
          transformations?: Json | null
          validation_errors?: Json | null
          validation_status?: string | null
          validation_warnings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "migration_files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "migration_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_id_mapping: {
        Row: {
          created_at: string | null
          entity_type: string
          id: string
          project_id: string
          source_id: string
          target_id: string
        }
        Insert: {
          created_at?: string | null
          entity_type: string
          id?: string
          project_id: string
          source_id: string
          target_id: string
        }
        Update: {
          created_at?: string | null
          entity_type?: string
          id?: string
          project_id?: string
          source_id?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "migration_id_mapping_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "migration_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_learned_mappings: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          recommended_transform: Json | null
          source_field: string
          source_field_type: string | null
          source_sample_values: Json | null
          source_system: string
          target_entity: string
          target_field: string
          times_confirmed: number | null
          times_rejected: number | null
          times_used: number | null
          updated_at: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          recommended_transform?: Json | null
          source_field: string
          source_field_type?: string | null
          source_sample_values?: Json | null
          source_system: string
          target_entity: string
          target_field: string
          times_confirmed?: number | null
          times_rejected?: number | null
          times_used?: number | null
          updated_at?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          recommended_transform?: Json | null
          source_field?: string
          source_field_type?: string | null
          source_sample_values?: Json | null
          source_system?: string
          target_entity?: string
          target_field?: string
          times_confirmed?: number | null
          times_rejected?: number | null
          times_used?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migration_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          entity_type: string | null
          file_id: string | null
          id: string
          log_type: string
          message: string
          project_id: string
          row_number: number | null
          source_id: string | null
          target_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          entity_type?: string | null
          file_id?: string | null
          id?: string
          log_type: string
          message: string
          project_id: string
          row_number?: number | null
          source_id?: string | null
          target_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          entity_type?: string | null
          file_id?: string | null
          id?: string
          log_type?: string
          message?: string
          project_id?: string
          row_number?: number | null
          source_id?: string | null
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "migration_logs_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "migration_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "migration_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_projects: {
        Row: {
          completed_at: string | null
          config: Json | null
          created_at: string | null
          created_by: string | null
          current_step: number | null
          description: string | null
          errors: Json | null
          field_mapping: Json | null
          id: string
          name: string
          organization_id: string
          source_system: string
          source_system_version: string | null
          started_at: string | null
          stats: Json | null
          status: string | null
          total_steps: number | null
          updated_at: string | null
          uploaded_files: Json | null
        }
        Insert: {
          completed_at?: string | null
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_step?: number | null
          description?: string | null
          errors?: Json | null
          field_mapping?: Json | null
          id?: string
          name: string
          organization_id: string
          source_system: string
          source_system_version?: string | null
          started_at?: string | null
          stats?: Json | null
          status?: string | null
          total_steps?: number | null
          updated_at?: string | null
          uploaded_files?: Json | null
        }
        Update: {
          completed_at?: string | null
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_step?: number | null
          description?: string | null
          errors?: Json | null
          field_mapping?: Json | null
          id?: string
          name?: string
          organization_id?: string
          source_system?: string
          source_system_version?: string | null
          started_at?: string | null
          stats?: Json | null
          status?: string | null
          total_steps?: number | null
          updated_at?: string | null
          uploaded_files?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "migration_projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_scraping_sessions: {
        Row: {
          completed_at: string | null
          connection_id: string
          current_entity: string | null
          current_page: string | null
          errors: Json | null
          extracted_data: Json | null
          id: string
          items_scraped: number | null
          items_total: number | null
          last_request_at: string | null
          project_id: string | null
          rate_limit_until: string | null
          requests_made: number | null
          retry_count: number | null
          session_data_vault_id: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          connection_id: string
          current_entity?: string | null
          current_page?: string | null
          errors?: Json | null
          extracted_data?: Json | null
          id?: string
          items_scraped?: number | null
          items_total?: number | null
          last_request_at?: string | null
          project_id?: string | null
          rate_limit_until?: string | null
          requests_made?: number | null
          retry_count?: number | null
          session_data_vault_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          connection_id?: string
          current_entity?: string | null
          current_page?: string | null
          errors?: Json | null
          extracted_data?: Json | null
          id?: string
          items_scraped?: number | null
          items_total?: number | null
          last_request_at?: string | null
          project_id?: string | null
          rate_limit_until?: string | null
          requests_made?: number | null
          retry_count?: number | null
          session_data_vault_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "migration_scraping_sessions_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "migration_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_scraping_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "migration_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_sync_history: {
        Row: {
          changes: Json | null
          completed_at: string | null
          errors: Json | null
          id: string
          started_at: string
          stats: Json | null
          status: string
          sync_id: string
          triggered_by: string | null
        }
        Insert: {
          changes?: Json | null
          completed_at?: string | null
          errors?: Json | null
          id?: string
          started_at?: string
          stats?: Json | null
          status: string
          sync_id: string
          triggered_by?: string | null
        }
        Update: {
          changes?: Json | null
          completed_at?: string | null
          errors?: Json | null
          id?: string
          started_at?: string
          stats?: Json | null
          status?: string
          sync_id?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "migration_sync_history_sync_id_fkey"
            columns: ["sync_id"]
            isOneToOne: false
            referencedRelation: "migration_syncs"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_syncs: {
        Row: {
          connection_id: string
          created_at: string | null
          entities_config: Json
          id: string
          last_sync_at: string | null
          last_sync_stats: Json | null
          last_sync_status: string | null
          name: string
          next_sync_at: string | null
          organization_id: string
          schedule_cron: string | null
          schedule_timezone: string | null
          status: string | null
          sync_cursors: Json | null
          sync_type: string
          updated_at: string | null
        }
        Insert: {
          connection_id: string
          created_at?: string | null
          entities_config: Json
          id?: string
          last_sync_at?: string | null
          last_sync_stats?: Json | null
          last_sync_status?: string | null
          name: string
          next_sync_at?: string | null
          organization_id: string
          schedule_cron?: string | null
          schedule_timezone?: string | null
          status?: string | null
          sync_cursors?: Json | null
          sync_type: string
          updated_at?: string | null
        }
        Update: {
          connection_id?: string
          created_at?: string | null
          entities_config?: Json
          id?: string
          last_sync_at?: string | null
          last_sync_stats?: Json | null
          last_sync_status?: string | null
          name?: string
          next_sync_at?: string | null
          organization_id?: string
          schedule_cron?: string | null
          schedule_timezone?: string | null
          status?: string | null
          sync_cursors?: Json | null
          sync_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "migration_syncs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "migration_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_syncs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_templates: {
        Row: {
          created_at: string | null
          default_mapping: Json
          entity_type: string
          id: string
          is_verified: boolean | null
          last_used_at: string | null
          source_system: string
          source_system_version: string | null
          use_count: number | null
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          default_mapping: Json
          entity_type: string
          id?: string
          is_verified?: boolean | null
          last_used_at?: string | null
          source_system: string
          source_system_version?: string | null
          use_count?: number | null
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          default_mapping?: Json
          entity_type?: string
          id?: string
          is_verified?: boolean | null
          last_used_at?: string | null
          source_system?: string
          source_system_version?: string | null
          use_count?: number | null
          validation_rules?: Json | null
        }
        Relationships: []
      }
      monitored_deadlines: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          deadline_date: string
          deadline_type: string
          description: string | null
          id: string
          last_reminder_sent: string | null
          matter_id: string | null
          organization_id: string
          reminder_days: number[] | null
          status: string | null
          title: string
          watch_result_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          deadline_date: string
          deadline_type: string
          description?: string | null
          id?: string
          last_reminder_sent?: string | null
          matter_id?: string | null
          organization_id: string
          reminder_days?: number[] | null
          status?: string | null
          title: string
          watch_result_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          deadline_date?: string
          deadline_type?: string
          description?: string | null
          id?: string
          last_reminder_sent?: string | null
          matter_id?: string | null
          organization_id?: string
          reminder_days?: number[] | null
          status?: string | null
          title?: string
          watch_result_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitored_deadlines_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitored_deadlines_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitored_deadlines_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitored_deadlines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitored_deadlines_watch_result_id_fkey"
            columns: ["watch_result_id"]
            isOneToOne: false
            referencedRelation: "watch_results"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          deadline_reminder_days: number[] | null
          deadline_reminders: boolean | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          invoice_notifications: boolean | null
          marketing_notifications: boolean | null
          push_enabled: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          renewal_reminder_days: number[] | null
          renewal_reminders: boolean | null
          team_notifications: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          watch_alerts: boolean | null
        }
        Insert: {
          created_at?: string | null
          deadline_reminder_days?: number[] | null
          deadline_reminders?: boolean | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          invoice_notifications?: boolean | null
          marketing_notifications?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          renewal_reminder_days?: number[] | null
          renewal_reminders?: boolean | null
          team_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          watch_alerts?: boolean | null
        }
        Update: {
          created_at?: string | null
          deadline_reminder_days?: number[] | null
          deadline_reminders?: boolean | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          invoice_notifications?: boolean | null
          marketing_notifications?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          renewal_reminder_days?: number[] | null
          renewal_reminders?: boolean | null
          team_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          watch_alerts?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_data: Json | null
          action_url: string | null
          body: string
          created_at: string | null
          expires_at: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_read: boolean | null
          metadata: Json | null
          organization_id: string | null
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          sent_via: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          action_url?: string | null
          body: string
          created_at?: string | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          sent_via?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_data?: Json | null
          action_url?: string | null
          body?: string
          created_at?: string | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          sent_via?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_results: {
        Row: {
          completed_at: string | null
          confidence: number | null
          created_at: string | null
          document_id: string | null
          entities: Json | null
          error_message: string | null
          extracted_text: string | null
          file_name: string | null
          file_url: string | null
          id: string
          language: string | null
          organization_id: string
          pages: Json | null
          processing_time_ms: number | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          confidence?: number | null
          created_at?: string | null
          document_id?: string | null
          entities?: Json | null
          error_message?: string | null
          extracted_text?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          language?: string | null
          organization_id: string
          pages?: Json | null
          processing_time_ms?: number | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          confidence?: number | null
          created_at?: string | null
          document_id?: string | null
          entities?: Json | null
          error_message?: string | null
          extracted_text?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          language?: string | null
          organization_id?: string
          pages?: Json | null
          processing_time_ms?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ocr_results_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "matter_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocr_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      official_fees: {
        Row: {
          amount: number
          base_classes: number | null
          code: string
          created_at: string | null
          currency: string | null
          description: string | null
          effective_from: string
          effective_until: string | null
          extra_class_fee: number | null
          fee_type: string
          id: string
          ip_type: string
          is_current: boolean | null
          name: string
          notes: string | null
          office: string
          per_class: boolean | null
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          base_classes?: number | null
          code: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          effective_from: string
          effective_until?: string | null
          extra_class_fee?: number | null
          fee_type: string
          id?: string
          ip_type: string
          is_current?: boolean | null
          name: string
          notes?: string | null
          office: string
          per_class?: boolean | null
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          base_classes?: number | null
          code?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          effective_from?: string
          effective_until?: string | null
          extra_class_fee?: number | null
          fee_type?: string
          id?: string
          ip_type?: string
          is_current?: boolean | null
          name?: string
          notes?: string | null
          office?: string
          per_class?: boolean | null
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          addons: string[] | null
          created_at: string | null
          default_language: string | null
          id: string
          name: string
          plan: string
          settings: Json | null
          slug: string
          status: string
          updated_at: string | null
        }
        Insert: {
          addons?: string[] | null
          created_at?: string | null
          default_language?: string | null
          id?: string
          name: string
          plan?: string
          settings?: Json | null
          slug: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          addons?: string[] | null
          created_at?: string | null
          default_language?: string | null
          id?: string
          name?: string
          plan?: string
          settings?: Json | null
          slug?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          failure_message: string | null
          id: string
          internal_invoice_id: string | null
          metadata: Json | null
          organization_id: string
          paid_at: string | null
          status: string
          stripe_charge_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          failure_message?: string | null
          id?: string
          internal_invoice_id?: string | null
          metadata?: Json | null
          organization_id: string
          paid_at?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          failure_message?: string | null
          id?: string
          internal_invoice_id?: string | null
          metadata?: Json | null
          organization_id?: string
          paid_at?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_internal_invoice_id_fkey"
            columns: ["internal_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          auto_actions: Json | null
          color: string | null
          created_at: string | null
          id: string
          is_lost_stage: boolean | null
          is_won_stage: boolean | null
          name: string
          pipeline_id: string
          position: number
          probability: number | null
          required_fields: string[] | null
        }
        Insert: {
          auto_actions?: Json | null
          color?: string | null
          created_at?: string | null
          id?: string
          is_lost_stage?: boolean | null
          is_won_stage?: boolean | null
          name: string
          pipeline_id: string
          position: number
          probability?: number | null
          required_fields?: string[] | null
        }
        Update: {
          auto_actions?: Json | null
          color?: string | null
          created_at?: string | null
          id?: string
          is_lost_stage?: boolean | null
          is_won_stage?: boolean | null
          name?: string
          pipeline_id?: string
          position?: number
          probability?: number | null
          required_fields?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          organization_id: string
          owner_type: string
          pipeline_type: string | null
          position: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          organization_id: string
          owner_type?: string
          pipeline_type?: string | null
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          organization_id?: string
          owner_type?: string
          pipeline_type?: string | null
          position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_valuations: {
        Row: {
          assumptions: string | null
          breakdown_by_jurisdiction: Json | null
          breakdown_by_status: Json | null
          breakdown_by_type: Json | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          id: string
          methodology: string | null
          notes: string | null
          organization_id: string
          report_url: string | null
          total_matters: number | null
          total_value: number | null
          valuation_date: string
        }
        Insert: {
          assumptions?: string | null
          breakdown_by_jurisdiction?: Json | null
          breakdown_by_status?: Json | null
          breakdown_by_type?: Json | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          methodology?: string | null
          notes?: string | null
          organization_id: string
          report_url?: string | null
          total_matters?: number | null
          total_value?: number | null
          valuation_date?: string
        }
        Update: {
          assumptions?: string | null
          breakdown_by_jurisdiction?: Json | null
          breakdown_by_status?: Json | null
          breakdown_by_type?: Json | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          methodology?: string | null
          notes?: string | null
          organization_id?: string
          report_url?: string | null
          total_matters?: number | null
          total_value?: number | null
          valuation_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_valuations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_valuations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string | null
          device_type: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          last_used_at: string | null
          p256dh_key: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string | null
          device_type?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          p256dh_key: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string | null
          device_type?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          p256dh_key?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string | null
          description: string
          discount_percent: number | null
          id: string
          line_number: number
          notes: string | null
          official_fee_id: string | null
          quantity: number | null
          quote_id: string
          service_fee_id: string | null
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          discount_percent?: number | null
          id?: string
          line_number: number
          notes?: string | null
          official_fee_id?: string | null
          quantity?: number | null
          quote_id: string
          service_fee_id?: string | null
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          discount_percent?: number | null
          id?: string
          line_number?: number
          notes?: string | null
          official_fee_id?: string | null
          quantity?: number | null
          quote_id?: string
          service_fee_id?: string | null
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_official_fee_id_fkey"
            columns: ["official_fee_id"]
            isOneToOne: false
            referencedRelation: "official_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_service_fee_id_fkey"
            columns: ["service_fee_id"]
            isOneToOne: false
            referencedRelation: "service_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          accepted_at: string | null
          billing_client_id: string | null
          client_email: string | null
          client_name: string
          contact_id: string | null
          converted_at: string | null
          converted_invoice_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          deal_id: string | null
          discount_amount: number | null
          id: string
          introduction: string | null
          notes: string | null
          organization_id: string
          pdf_url: string | null
          quote_date: string
          quote_number: string
          sent_at: string | null
          status: string | null
          subtotal: number
          tax_amount: number
          tax_rate: number | null
          terms: string | null
          total: number
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          accepted_at?: string | null
          billing_client_id?: string | null
          client_email?: string | null
          client_name: string
          contact_id?: string | null
          converted_at?: string | null
          converted_invoice_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          discount_amount?: number | null
          id?: string
          introduction?: string | null
          notes?: string | null
          organization_id: string
          pdf_url?: string | null
          quote_date?: string
          quote_number: string
          sent_at?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number | null
          terms?: string | null
          total?: number
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          accepted_at?: string | null
          billing_client_id?: string | null
          client_email?: string | null
          client_name?: string
          contact_id?: string | null
          converted_at?: string | null
          converted_invoice_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          discount_amount?: number | null
          id?: string
          introduction?: string | null
          notes?: string | null
          organization_id?: string
          pdf_url?: string | null
          quote_date?: string
          quote_number?: string
          sent_at?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number | null
          terms?: string | null
          total?: number
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_billing_client_id_fkey"
            columns: ["billing_client_id"]
            isOneToOne: false
            referencedRelation: "billing_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_converted_invoice_id_fkey"
            columns: ["converted_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      renewal_schedule: {
        Row: {
          client_instruction: string | null
          created_at: string | null
          currency: string | null
          due_date: string
          grace_period_end: string | null
          id: string
          instruction_by: string | null
          instruction_date: string | null
          matter_cost_id: string | null
          matter_id: string
          official_fee_estimate: number | null
          organization_id: string
          reminders_sent: Json | null
          renewal_type: string
          service_fee_estimate: number | null
          status: string | null
          total_estimate: number | null
          updated_at: string | null
        }
        Insert: {
          client_instruction?: string | null
          created_at?: string | null
          currency?: string | null
          due_date: string
          grace_period_end?: string | null
          id?: string
          instruction_by?: string | null
          instruction_date?: string | null
          matter_cost_id?: string | null
          matter_id: string
          official_fee_estimate?: number | null
          organization_id: string
          reminders_sent?: Json | null
          renewal_type: string
          service_fee_estimate?: number | null
          status?: string | null
          total_estimate?: number | null
          updated_at?: string | null
        }
        Update: {
          client_instruction?: string | null
          created_at?: string | null
          currency?: string | null
          due_date?: string
          grace_period_end?: string | null
          id?: string
          instruction_by?: string | null
          instruction_date?: string | null
          matter_cost_id?: string | null
          matter_id?: string
          official_fee_estimate?: number | null
          organization_id?: string
          reminders_sent?: Json | null
          renewal_type?: string
          service_fee_estimate?: number | null
          status?: string | null
          total_estimate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "renewal_schedule_instruction_by_fkey"
            columns: ["instruction_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renewal_schedule_matter_cost_id_fkey"
            columns: ["matter_cost_id"]
            isOneToOne: false
            referencedRelation: "matter_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renewal_schedule_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renewal_schedule_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          code: string
          config: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          organization_id: string | null
          report_type: string
          style: Json | null
          updated_at: string | null
        }
        Insert: {
          code: string
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          organization_id?: string | null
          report_type: string
          style?: Json | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          organization_id?: string | null
          report_type?: string
          style?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          last_error: string | null
          last_run_at: string | null
          name: string
          next_run_at: string | null
          organization_id: string
          parameters: Json | null
          recipients: Json | null
          schedule_config: Json | null
          schedule_type: string
          template_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          organization_id: string
          parameters?: Json | null
          recipients?: Json | null
          schedule_config?: Json | null
          schedule_type: string
          template_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          organization_id?: string
          parameters?: Json | null
          recipients?: Json | null
          schedule_config?: Json | null
          schedule_type?: string
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sent_emails: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          organization_id: string | null
          provider: string | null
          provider_id: string | null
          status: string | null
          subject: string
          template_data: Json | null
          template_id: string | null
          to_email: string
          to_name: string | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          organization_id?: string | null
          provider?: string | null
          provider_id?: string | null
          status?: string | null
          subject: string
          template_data?: Json | null
          template_id?: string | null
          to_email: string
          to_name?: string | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          organization_id?: string | null
          provider?: string | null
          provider_id?: string | null
          status?: string | null
          subject?: string
          template_data?: Json | null
          template_id?: string | null
          to_email?: string
          to_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sent_emails_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      service_fees: {
        Row: {
          amount: number
          base_classes: number | null
          category: string
          code: string
          created_at: string | null
          currency: string | null
          description: string | null
          estimated_hours: number | null
          fee_model: string | null
          hourly_rate: number | null
          id: string
          ip_type: string | null
          is_active: boolean | null
          name: string
          organization_id: string
          per_class_fee: number | null
          percentage_base: string | null
          percentage_rate: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          base_classes?: number | null
          category: string
          code: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          estimated_hours?: number | null
          fee_model?: string | null
          hourly_rate?: number | null
          id?: string
          ip_type?: string | null
          is_active?: boolean | null
          name: string
          organization_id: string
          per_class_fee?: number | null
          percentage_base?: string | null
          percentage_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          base_classes?: number | null
          category?: string
          code?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          estimated_hours?: number | null
          fee_model?: string | null
          hourly_rate?: number | null
          id?: string
          ip_type?: string | null
          is_active?: boolean | null
          name?: string
          organization_id?: string
          per_class_fee?: number | null
          percentage_base?: string | null
          percentage_rate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_fees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      similarity_analyses: {
        Row: {
          ai_explanation: string | null
          ai_recommendation: string | null
          analysis_details: Json | null
          analysis_method: string | null
          conceptual_score: number | null
          created_at: string | null
          created_by: string | null
          id: string
          image_a_url: string | null
          image_b_url: string | null
          organization_id: string
          overall_score: number
          phonetic_score: number | null
          term_a: string
          term_b: string
          visual_score: number | null
        }
        Insert: {
          ai_explanation?: string | null
          ai_recommendation?: string | null
          analysis_details?: Json | null
          analysis_method?: string | null
          conceptual_score?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_a_url?: string | null
          image_b_url?: string | null
          organization_id: string
          overall_score: number
          phonetic_score?: number | null
          term_a: string
          term_b: string
          visual_score?: number | null
        }
        Update: {
          ai_explanation?: string | null
          ai_recommendation?: string | null
          analysis_details?: Json | null
          analysis_method?: string | null
          conceptual_score?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_a_url?: string | null
          image_b_url?: string | null
          organization_id?: string
          overall_score?: number
          phonetic_score?: number | null
          term_a?: string
          term_b?: string
          visual_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "similarity_analyses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "similarity_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      spider_alerts: {
        Row: {
          action_url: string | null
          actioned_at: string | null
          actioned_by: string | null
          alert_type: string
          created_at: string | null
          data: Json | null
          id: string
          matter_id: string | null
          message: string
          notified_at: string | null
          notified_via: string[] | null
          organization_id: string
          read_at: string | null
          read_by: string | null
          severity: string | null
          status: string | null
          title: string
          watch_result_id: string | null
          watchlist_id: string | null
        }
        Insert: {
          action_url?: string | null
          actioned_at?: string | null
          actioned_by?: string | null
          alert_type: string
          created_at?: string | null
          data?: Json | null
          id?: string
          matter_id?: string | null
          message: string
          notified_at?: string | null
          notified_via?: string[] | null
          organization_id: string
          read_at?: string | null
          read_by?: string | null
          severity?: string | null
          status?: string | null
          title: string
          watch_result_id?: string | null
          watchlist_id?: string | null
        }
        Update: {
          action_url?: string | null
          actioned_at?: string | null
          actioned_by?: string | null
          alert_type?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          matter_id?: string | null
          message?: string
          notified_at?: string | null
          notified_via?: string[] | null
          organization_id?: string
          read_at?: string | null
          read_by?: string | null
          severity?: string | null
          status?: string | null
          title?: string
          watch_result_id?: string | null
          watchlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spider_alerts_actioned_by_fkey"
            columns: ["actioned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spider_alerts_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spider_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spider_alerts_read_by_fkey"
            columns: ["read_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spider_alerts_watch_result_id_fkey"
            columns: ["watch_result_id"]
            isOneToOne: false
            referencedRelation: "watch_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spider_alerts_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_history: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          event_type: string
          id: string
          metadata: Json | null
          new_plan_id: string | null
          organization_id: string
          previous_plan_id: string | null
          subscription_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          new_plan_id?: string | null
          organization_id: string
          previous_plan_id?: string | null
          subscription_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          new_plan_id?: string | null
          organization_id?: string
          previous_plan_id?: string | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_new_plan_id_fkey"
            columns: ["new_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_previous_plan_id_fkey"
            columns: ["previous_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          code: string
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json
          id: string
          is_active: boolean | null
          is_enterprise: boolean | null
          is_popular: boolean | null
          limits: Json
          name: string
          price_monthly: number
          price_yearly: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          is_enterprise?: boolean | null
          is_popular?: boolean | null
          limits?: Json
          name: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          is_enterprise?: boolean | null
          is_popular?: boolean | null
          limits?: Json
          name?: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          cancellation_reason: string | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          metadata: Json | null
          organization_id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          metadata?: Json | null
          organization_id: string
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      superadmins: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "superadmins_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "superadmins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_jobs: {
        Row: {
          completed_at: string | null
          connector_id: string
          created_at: string | null
          error_message: string | null
          errors: number | null
          filters: Json | null
          id: string
          new_items: number | null
          organization_id: string
          processed_items: number | null
          result: Json | null
          started_at: string | null
          status: string | null
          sync_type: string
          total_items: number | null
          updated_items: number | null
        }
        Insert: {
          completed_at?: string | null
          connector_id: string
          created_at?: string | null
          error_message?: string | null
          errors?: number | null
          filters?: Json | null
          id?: string
          new_items?: number | null
          organization_id: string
          processed_items?: number | null
          result?: Json | null
          started_at?: string | null
          status?: string | null
          sync_type: string
          total_items?: number | null
          updated_items?: number | null
        }
        Update: {
          completed_at?: string | null
          connector_id?: string
          created_at?: string | null
          error_message?: string | null
          errors?: number | null
          filters?: Json | null
          id?: string
          new_items?: number | null
          organization_id?: string
          processed_items?: number | null
          result?: Json | null
          started_at?: string | null
          status?: string | null
          sync_type?: string
          total_items?: number | null
          updated_items?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_jobs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "data_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_announcements: {
        Row: {
          created_at: string | null
          created_by: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          is_dismissible: boolean | null
          message: string
          show_as_banner: boolean | null
          show_on_dashboard: boolean | null
          starts_at: string
          target_audience: string | null
          target_orgs: string[] | null
          target_plans: string[] | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          is_dismissible?: boolean | null
          message: string
          show_as_banner?: boolean | null
          show_on_dashboard?: boolean | null
          starts_at?: string
          target_audience?: string | null
          target_orgs?: string[] | null
          target_plans?: string[] | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          is_dismissible?: boolean | null
          message?: string
          show_as_banner?: boolean | null
          show_on_dashboard?: boolean | null
          starts_at?: string
          target_audience?: string | null
          target_orgs?: string[] | null
          target_plans?: string[] | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          description: string | null
          id: string
          is_public: boolean | null
          is_required: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
          value_type: string | null
        }
        Insert: {
          category?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_required?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
          value_type?: string | null
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_required?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
          value_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trademark_visuals: {
        Row: {
          color_histogram: Json | null
          created_at: string | null
          id: string
          image_hash: string
          image_url: string
          is_combination: boolean | null
          is_device_mark: boolean | null
          is_text_mark: boolean | null
          mark_name: string | null
          matter_id: string | null
          nice_classes: number[] | null
          organization_id: string | null
          shape_descriptor: Json | null
          thumbnail_url: string | null
        }
        Insert: {
          color_histogram?: Json | null
          created_at?: string | null
          id?: string
          image_hash: string
          image_url: string
          is_combination?: boolean | null
          is_device_mark?: boolean | null
          is_text_mark?: boolean | null
          mark_name?: string | null
          matter_id?: string | null
          nice_classes?: number[] | null
          organization_id?: string | null
          shape_descriptor?: Json | null
          thumbnail_url?: string | null
        }
        Update: {
          color_histogram?: Json | null
          created_at?: string | null
          id?: string
          image_hash?: string
          image_url?: string
          is_combination?: boolean | null
          is_device_mark?: boolean | null
          is_text_mark?: boolean | null
          mark_name?: string | null
          matter_id?: string | null
          nice_classes?: number[] | null
          organization_id?: string | null
          shape_descriptor?: Json | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trademark_visuals_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trademark_visuals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_metrics: {
        Row: {
          created_at: string | null
          id: string
          metrics: Json
          organization_id: string
          period_end: string
          period_start: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metrics?: Json
          organization_id: string
          period_end: string
          period_start: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metrics?: Json
          organization_id?: string
          period_end?: string
          period_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          organization_id: string | null
          page_url: string | null
          priority: string | null
          resolved_at: string | null
          resolved_by: string | null
          screenshot_url: string | null
          status: string | null
          subject: string
          type: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          organization_id?: string | null
          page_url?: string | null
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          screenshot_url?: string | null
          status?: string | null
          subject: string
          type: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          organization_id?: string | null
          page_url?: string | null
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          screenshot_url?: string | null
          status?: string | null
          subject?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedback_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vision_analyses: {
        Row: {
          analysis_type: string
          compare_with_id: string | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          image_hash: string | null
          image_url: string
          model_version: string | null
          organization_id: string
          processing_time_ms: number | null
          results: Json | null
          similarity_score: number | null
          status: string | null
        }
        Insert: {
          analysis_type: string
          compare_with_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          image_hash?: string | null
          image_url: string
          model_version?: string | null
          organization_id: string
          processing_time_ms?: number | null
          results?: Json | null
          similarity_score?: number | null
          status?: string | null
        }
        Update: {
          analysis_type?: string
          compare_with_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          image_hash?: string | null
          image_url?: string
          model_version?: string | null
          organization_id?: string
          processing_time_ms?: number | null
          results?: Json | null
          similarity_score?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vision_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_results: {
        Row: {
          action_by: string | null
          action_date: string | null
          action_notes: string | null
          action_taken: string | null
          applicant_country: string | null
          applicant_name: string | null
          classes: number[] | null
          description: string | null
          detected_at: string | null
          domain_name: string | null
          expiry_date: string | null
          filing_date: string | null
          found_text: string | null
          found_url: string | null
          id: string
          opposition_deadline: string | null
          organization_id: string
          priority: string | null
          publication_date: string | null
          raw_data: Json | null
          registrar: string | null
          registration_date: string | null
          related_deal_id: string | null
          related_matter_id: string | null
          result_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          screenshot_url: string | null
          similarity_details: Json | null
          similarity_score: number | null
          similarity_type: string | null
          source: string | null
          source_id: string | null
          source_url: string | null
          status: string | null
          title: string
          watchlist_id: string
        }
        Insert: {
          action_by?: string | null
          action_date?: string | null
          action_notes?: string | null
          action_taken?: string | null
          applicant_country?: string | null
          applicant_name?: string | null
          classes?: number[] | null
          description?: string | null
          detected_at?: string | null
          domain_name?: string | null
          expiry_date?: string | null
          filing_date?: string | null
          found_text?: string | null
          found_url?: string | null
          id?: string
          opposition_deadline?: string | null
          organization_id: string
          priority?: string | null
          publication_date?: string | null
          raw_data?: Json | null
          registrar?: string | null
          registration_date?: string | null
          related_deal_id?: string | null
          related_matter_id?: string | null
          result_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          similarity_details?: Json | null
          similarity_score?: number | null
          similarity_type?: string | null
          source?: string | null
          source_id?: string | null
          source_url?: string | null
          status?: string | null
          title: string
          watchlist_id: string
        }
        Update: {
          action_by?: string | null
          action_date?: string | null
          action_notes?: string | null
          action_taken?: string | null
          applicant_country?: string | null
          applicant_name?: string | null
          classes?: number[] | null
          description?: string | null
          detected_at?: string | null
          domain_name?: string | null
          expiry_date?: string | null
          filing_date?: string | null
          found_text?: string | null
          found_url?: string | null
          id?: string
          opposition_deadline?: string | null
          organization_id?: string
          priority?: string | null
          publication_date?: string | null
          raw_data?: Json | null
          registrar?: string | null
          registration_date?: string | null
          related_deal_id?: string | null
          related_matter_id?: string | null
          result_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          similarity_details?: Json | null
          similarity_score?: number | null
          similarity_type?: string | null
          source?: string | null
          source_id?: string | null
          source_url?: string | null
          status?: string | null
          title?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_results_action_by_fkey"
            columns: ["action_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_results_related_deal_id_fkey"
            columns: ["related_deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_results_related_matter_id_fkey"
            columns: ["related_matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_results_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_results_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          filter_config: Json | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          matter_id: string | null
          name: string
          next_run_at: string | null
          notify_email: boolean | null
          notify_frequency: string | null
          notify_in_app: boolean | null
          notify_users: string[] | null
          organization_id: string
          owner_type: string
          run_frequency: string | null
          similarity_threshold: number | null
          type: string
          updated_at: string | null
          watch_classes: number[] | null
          watch_jurisdictions: string[] | null
          watch_terms: string[]
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filter_config?: Json | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          matter_id?: string | null
          name: string
          next_run_at?: string | null
          notify_email?: boolean | null
          notify_frequency?: string | null
          notify_in_app?: boolean | null
          notify_users?: string[] | null
          organization_id: string
          owner_type?: string
          run_frequency?: string | null
          similarity_threshold?: number | null
          type: string
          updated_at?: string | null
          watch_classes?: number[] | null
          watch_jurisdictions?: string[] | null
          watch_terms?: string[]
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filter_config?: Json | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          matter_id?: string | null
          name?: string
          next_run_at?: string | null
          notify_email?: boolean | null
          notify_frequency?: string | null
          notify_in_app?: boolean | null
          notify_users?: string[] | null
          organization_id?: string
          owner_type?: string
          run_frequency?: string | null
          similarity_threshold?: number | null
          type?: string
          updated_at?: string | null
          watch_classes?: number[] | null
          watch_jurisdictions?: string[] | null
          watch_terms?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "watchlists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlists_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          event_type: string
          id: string
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          response_status: number | null
          response_time_ms: number | null
          status: string | null
          webhook_id: string
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          next_retry_at?: string | null
          payload: Json
          response_body?: string | null
          response_status?: number | null
          response_time_ms?: number | null
          status?: string | null
          webhook_id: string
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          next_retry_at?: string | null
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          response_time_ms?: number | null
          status?: string | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_id: string | null
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          retry_count: number | null
          source: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string | null
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          retry_count?: number | null
          source: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          retry_count?: number | null
          source?: string
          status?: string | null
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string | null
          events: Json
          failed_deliveries: number | null
          headers: Json | null
          id: string
          is_active: boolean | null
          last_delivery_at: string | null
          last_error: string | null
          max_retries: number | null
          name: string
          organization_id: string
          retry_delay_seconds: number | null
          secret: string
          successful_deliveries: number | null
          total_deliveries: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          events?: Json
          failed_deliveries?: number | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_delivery_at?: string | null
          last_error?: string | null
          max_retries?: number | null
          name: string
          organization_id: string
          retry_delay_seconds?: number | null
          secret: string
          successful_deliveries?: number | null
          total_deliveries?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          events?: Json
          failed_deliveries?: number | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_delivery_at?: string | null
          last_error?: string | null
          max_retries?: number | null
          name?: string
          organization_id?: string
          retry_delay_seconds?: number | null
          secret?: string
          successful_deliveries?: number | null
          total_deliveries?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ipo_expiring_credentials: {
        Row: {
          code: string | null
          credential_type: string | null
          days_until_expiry: unknown
          expires_at: string | null
          name_short: string | null
        }
        Relationships: []
      }
      ipo_health_overview: {
        Row: {
          avg_response_time_ms: number | null
          code: string | null
          connection_method_id: string | null
          consecutive_failures: number | null
          health_status: string | null
          id: string | null
          last_successful_sync: string | null
          method_type: string | null
          name_official: string | null
          name_short: string | null
          office_status: string | null
          region: string | null
          success_rate_7d: number | null
          tier: number | null
          traffic_light: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_kyc_level: { Args: { p_user_id: string }; Returns: number }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      get_user_org_ids: { Args: never; Returns: string[] }
      get_user_role_in_org: { Args: { org_id: string }; Returns: string }
      increment_rate_limit: {
        Args: { p_api_key_id: string }
        Returns: undefined
      }
      is_member_of_org: { Args: { org_id: string }; Returns: boolean }
      verify_api_key: {
        Args: { p_key: string }
        Returns: {
          api_key_id: string
          is_valid: boolean
          organization_id: string
          rate_limit_exceeded: boolean
          scopes: Json
        }[]
      }
    }
    Enums: {
      market_asset_category:
        | "industrial_property"
        | "intellectual_property"
        | "intangible_assets"
      market_asset_type:
        | "patent_invention"
        | "patent_utility"
        | "patent_design"
        | "trademark_word"
        | "trademark_figurative"
        | "trademark_mixed"
        | "trademark_3d"
        | "trademark_sound"
        | "industrial_design"
        | "copyright_software"
        | "copyright_literary"
        | "copyright_musical"
        | "copyright_artistic"
        | "domain_gtld"
        | "domain_cctld"
        | "know_how"
        | "trade_secret"
        | "trade_name"
        | "portfolio"
      market_certification_level: "basic" | "standard" | "premium"
      market_kyc_level: "0" | "1" | "2" | "3" | "4"
      market_listing_status:
        | "draft"
        | "pending_verification"
        | "active"
        | "under_offer"
        | "reserved"
        | "sold"
        | "licensed"
        | "expired"
        | "withdrawn"
        | "suspended"
      market_transaction_status:
        | "inquiry"
        | "negotiation"
        | "offer_made"
        | "offer_accepted"
        | "due_diligence"
        | "contract_draft"
        | "contract_review"
        | "pending_payment"
        | "payment_in_escrow"
        | "pending_transfer"
        | "completed"
        | "cancelled"
        | "disputed"
      market_transaction_type:
        | "full_sale"
        | "partial_assignment"
        | "swap"
        | "exclusive_license"
        | "non_exclusive_license"
        | "cross_license"
        | "franchise"
        | "option_to_buy"
        | "auction"
        | "rfp"
        | "coexistence"
        | "settlement"
      market_verification_status:
        | "pending"
        | "verified"
        | "failed"
        | "expired"
        | "not_required"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      market_asset_category: [
        "industrial_property",
        "intellectual_property",
        "intangible_assets",
      ],
      market_asset_type: [
        "patent_invention",
        "patent_utility",
        "patent_design",
        "trademark_word",
        "trademark_figurative",
        "trademark_mixed",
        "trademark_3d",
        "trademark_sound",
        "industrial_design",
        "copyright_software",
        "copyright_literary",
        "copyright_musical",
        "copyright_artistic",
        "domain_gtld",
        "domain_cctld",
        "know_how",
        "trade_secret",
        "trade_name",
        "portfolio",
      ],
      market_certification_level: ["basic", "standard", "premium"],
      market_kyc_level: ["0", "1", "2", "3", "4"],
      market_listing_status: [
        "draft",
        "pending_verification",
        "active",
        "under_offer",
        "reserved",
        "sold",
        "licensed",
        "expired",
        "withdrawn",
        "suspended",
      ],
      market_transaction_status: [
        "inquiry",
        "negotiation",
        "offer_made",
        "offer_accepted",
        "due_diligence",
        "contract_draft",
        "contract_review",
        "pending_payment",
        "payment_in_escrow",
        "pending_transfer",
        "completed",
        "cancelled",
        "disputed",
      ],
      market_transaction_type: [
        "full_sale",
        "partial_assignment",
        "swap",
        "exclusive_license",
        "non_exclusive_license",
        "cross_license",
        "franchise",
        "option_to_buy",
        "auction",
        "rfp",
        "coexistence",
        "settlement",
      ],
      market_verification_status: [
        "pending",
        "verified",
        "failed",
        "expired",
        "not_required",
      ],
    },
  },
} as const
