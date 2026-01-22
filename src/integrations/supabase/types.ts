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
      access_audit_log: {
        Row: {
          action: string
          created_at: string | null
          denial_reason: string | null
          granted: boolean
          id: string
          ip_address: unknown
          metadata: Json | null
          organization_id: string | null
          permission_code: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          denial_reason?: string | null
          granted: boolean
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string | null
          permission_code?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          denial_reason?: string | null
          granted?: boolean
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string | null
          permission_code?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "access_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      access_logs: {
        Row: {
          auth_method: string | null
          created_at: string | null
          device_info: Json | null
          event_type: string
          failure_reason: string | null
          geo_location: Json | null
          id: string
          ip_address: string | null
          organization_id: string | null
          session_id: string | null
          status: string
          user_agent: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          auth_method?: string | null
          created_at?: string | null
          device_info?: Json | null
          event_type: string
          failure_reason?: string | null
          geo_location?: Json | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          session_id?: string | null
          status?: string
          user_agent?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          auth_method?: string | null
          created_at?: string | null
          device_info?: Json | null
          event_type?: string
          failure_reason?: string | null
          geo_location?: Json | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          session_id?: string | null
          status?: string
          user_agent?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "access_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      active_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          is_current: boolean | null
          last_activity_at: string | null
          location: Json | null
          organization_id: string | null
          refresh_token_hash: string | null
          revoked_at: string | null
          session_token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          is_current?: boolean | null
          last_activity_at?: string | null
          location?: Json | null
          organization_id?: string | null
          refresh_token_hash?: string | null
          revoked_at?: string | null
          session_token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          is_current?: boolean | null
          last_activity_at?: string | null
          location?: Json | null
          organization_id?: string | null
          refresh_token_hash?: string | null
          revoked_at?: string | null
          session_token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "active_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      agent_badges: {
        Row: {
          agent_id: string
          badge_type: string
          context: Json | null
          created_at: string | null
          earned_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
        }
        Insert: {
          agent_id: string
          badge_type: string
          context?: Json | null
          created_at?: string | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
        }
        Update: {
          agent_id?: string
          badge_type?: string
          context?: Json | null
          created_at?: string | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_badges_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "market_users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_rankings: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          jurisdiction: string | null
          rank_change: number | null
          rank_percentile: number | null
          rank_position: number
          rank_previous: number | null
          ranking_category: string | null
          ranking_date: string
          rating_avg: number
          reputation_score: number
          response_time_avg: number
          success_rate: number
          total_transactions: number
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          jurisdiction?: string | null
          rank_change?: number | null
          rank_percentile?: number | null
          rank_position: number
          rank_previous?: number | null
          ranking_category?: string | null
          ranking_date?: string
          rating_avg: number
          reputation_score: number
          response_time_avg: number
          success_rate: number
          total_transactions: number
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          jurisdiction?: string | null
          rank_change?: number | null
          rank_percentile?: number | null
          rank_position?: number
          rank_previous?: number | null
          ranking_category?: string | null
          ranking_date?: string
          rating_avg?: number
          reputation_score?: number
          response_time_avg?: number
          success_rate?: number
          total_transactions?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_rankings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "market_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_budget_alerts: {
        Row: {
          acknowledged: boolean
          acknowledged_at: string | null
          acknowledged_by: string | null
          action_details: Json | null
          action_taken: string | null
          alert_type: string
          budget_amount: number | null
          budget_config_id: string | null
          client_id: string | null
          created_at: string
          current_spend: number | null
          id: string
          organization_id: string | null
          threshold_percent: number | null
        }
        Insert: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_details?: Json | null
          action_taken?: string | null
          alert_type: string
          budget_amount?: number | null
          budget_config_id?: string | null
          client_id?: string | null
          created_at?: string
          current_spend?: number | null
          id?: string
          organization_id?: string | null
          threshold_percent?: number | null
        }
        Update: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_details?: Json | null
          action_taken?: string | null
          alert_type?: string
          budget_amount?: number | null
          budget_config_id?: string | null
          client_id?: string | null
          created_at?: string
          current_spend?: number | null
          id?: string
          organization_id?: string | null
          threshold_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_budget_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_budget_alerts_budget_config_id_fkey"
            columns: ["budget_config_id"]
            isOneToOne: false
            referencedRelation: "ai_budget_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_budget_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_budget_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_budget_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_budget_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_budget_config: {
        Row: {
          alert_at_100: boolean
          alert_at_50: boolean
          alert_at_80: boolean
          alert_email: string | null
          alert_webhook_url: string | null
          budget_amount: number
          created_at: string
          current_period_spend: number
          current_period_start: string | null
          fallback_model_id: string | null
          hard_limit: boolean
          hard_limit_action: string
          id: string
          is_active: boolean
          model_id: string | null
          module: string | null
          organization_id: string | null
          period_type: string
          scope_type: string
          updated_at: string
        }
        Insert: {
          alert_at_100?: boolean
          alert_at_50?: boolean
          alert_at_80?: boolean
          alert_email?: string | null
          alert_webhook_url?: string | null
          budget_amount: number
          created_at?: string
          current_period_spend?: number
          current_period_start?: string | null
          fallback_model_id?: string | null
          hard_limit?: boolean
          hard_limit_action?: string
          id?: string
          is_active?: boolean
          model_id?: string | null
          module?: string | null
          organization_id?: string | null
          period_type?: string
          scope_type: string
          updated_at?: string
        }
        Update: {
          alert_at_100?: boolean
          alert_at_50?: boolean
          alert_at_80?: boolean
          alert_email?: string | null
          alert_webhook_url?: string | null
          budget_amount?: number
          created_at?: string
          current_period_spend?: number
          current_period_start?: string | null
          fallback_model_id?: string | null
          hard_limit?: boolean
          hard_limit_action?: string
          id?: string
          is_active?: boolean
          model_id?: string | null
          module?: string | null
          organization_id?: string | null
          period_type?: string
          scope_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_budget_config_fallback_model_id_fkey"
            columns: ["fallback_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_budget_config_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_budget_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_budget_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_budget_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_circuit_breaker_states: {
        Row: {
          avg_latency_ms: number | null
          failure_count: number | null
          failure_threshold: number | null
          half_open_at: string | null
          id: string
          last_failure_at: string | null
          last_success_at: string | null
          open_duration_ms: number | null
          opened_at: string | null
          p95_latency_ms: number | null
          provider_id: string | null
          state: string | null
          success_count: number | null
          success_threshold: number | null
          total_failures: number | null
          total_requests: number | null
          updated_at: string | null
        }
        Insert: {
          avg_latency_ms?: number | null
          failure_count?: number | null
          failure_threshold?: number | null
          half_open_at?: string | null
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          open_duration_ms?: number | null
          opened_at?: string | null
          p95_latency_ms?: number | null
          provider_id?: string | null
          state?: string | null
          success_count?: number | null
          success_threshold?: number | null
          total_failures?: number | null
          total_requests?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_latency_ms?: number | null
          failure_count?: number | null
          failure_threshold?: number | null
          half_open_at?: string | null
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          open_duration_ms?: number | null
          opened_at?: string | null
          p95_latency_ms?: number | null
          provider_id?: string | null
          state?: string | null
          success_count?: number | null
          success_threshold?: number | null
          total_failures?: number | null
          total_requests?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_circuit_breaker_states_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          agent_type: string
          contact_id: string | null
          context_id: string | null
          context_type: string | null
          created_at: string | null
          document_id: string | null
          id: string
          is_pinned: boolean | null
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
          context_id?: string | null
          context_type?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          is_pinned?: boolean | null
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
          context_id?: string | null
          context_type?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          is_pinned?: boolean | null
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      ai_kb_disclaimers: {
        Row: {
          badge_color: string
          badge_text: string
          created_at: string | null
          id: string
          long_message: string
          short_message: string
          show_verification_prompt: boolean | null
          tier: string
          verification_message: string | null
        }
        Insert: {
          badge_color: string
          badge_text: string
          created_at?: string | null
          id?: string
          long_message: string
          short_message: string
          show_verification_prompt?: boolean | null
          tier: string
          verification_message?: string | null
        }
        Update: {
          badge_color?: string
          badge_text?: string
          created_at?: string | null
          id?: string
          long_message?: string
          short_message?: string
          show_verification_prompt?: boolean | null
          tier?: string
          verification_message?: string | null
        }
        Relationships: []
      }
      ai_kb_jurisdictions: {
        Row: {
          accuracy_feedback_negative: number | null
          accuracy_feedback_positive: number | null
          code: string
          confidence_tier: string
          coverage_gaps: string[] | null
          created_at: string | null
          data_sources: string[] | null
          flag_emoji: string | null
          id: string
          is_active: boolean | null
          is_beta: boolean | null
          known_limitations: string[] | null
          language_code: string | null
          last_content_update: string | null
          legal_disclaimer: string
          name: string
          name_local: string | null
          official_registry_url: string | null
          requires_plan: string | null
          score_data_availability: number | null
          score_knowledge_depth: number | null
          score_overall: number | null
          score_source_quality: number | null
          score_update_recency: number | null
          total_queries: number | null
          updated_at: string | null
        }
        Insert: {
          accuracy_feedback_negative?: number | null
          accuracy_feedback_positive?: number | null
          code: string
          confidence_tier?: string
          coverage_gaps?: string[] | null
          created_at?: string | null
          data_sources?: string[] | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          is_beta?: boolean | null
          known_limitations?: string[] | null
          language_code?: string | null
          last_content_update?: string | null
          legal_disclaimer?: string
          name: string
          name_local?: string | null
          official_registry_url?: string | null
          requires_plan?: string | null
          score_data_availability?: number | null
          score_knowledge_depth?: number | null
          score_overall?: number | null
          score_source_quality?: number | null
          score_update_recency?: number | null
          total_queries?: number | null
          updated_at?: string | null
        }
        Update: {
          accuracy_feedback_negative?: number | null
          accuracy_feedback_positive?: number | null
          code?: string
          confidence_tier?: string
          coverage_gaps?: string[] | null
          created_at?: string | null
          data_sources?: string[] | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          is_beta?: boolean | null
          known_limitations?: string[] | null
          language_code?: string | null
          last_content_update?: string | null
          legal_disclaimer?: string
          name?: string
          name_local?: string | null
          official_registry_url?: string | null
          requires_plan?: string | null
          score_data_availability?: number | null
          score_knowledge_depth?: number | null
          score_overall?: number | null
          score_source_quality?: number | null
          score_update_recency?: number | null
          total_queries?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_kb_legal_areas: {
        Row: {
          area_code: string
          area_icon: string | null
          area_limitations: string[] | null
          area_name: string
          area_score: number | null
          documents_indexed: number | null
          id: string
          is_active: boolean | null
          jurisdiction_id: string
          last_updated: string | null
          requires_plan: string | null
        }
        Insert: {
          area_code: string
          area_icon?: string | null
          area_limitations?: string[] | null
          area_name: string
          area_score?: number | null
          documents_indexed?: number | null
          id?: string
          is_active?: boolean | null
          jurisdiction_id: string
          last_updated?: string | null
          requires_plan?: string | null
        }
        Update: {
          area_code?: string
          area_icon?: string | null
          area_limitations?: string[] | null
          area_name?: string
          area_score?: number | null
          documents_indexed?: number | null
          id?: string
          is_active?: boolean | null
          jurisdiction_id?: string
          last_updated?: string | null
          requires_plan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_kb_legal_areas_jurisdiction_id_fkey"
            columns: ["jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "ai_kb_jurisdictions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          actions_taken: Json | null
          content: string
          conversation_id: string
          created_at: string | null
          feedback: string | null
          feedback_comment: string | null
          id: string
          model_used: string | null
          response_time_ms: number | null
          role: string
          sources: Json | null
          tokens_input: number | null
          tokens_output: number | null
          tokens_used: number | null
        }
        Insert: {
          actions_taken?: Json | null
          content: string
          conversation_id: string
          created_at?: string | null
          feedback?: string | null
          feedback_comment?: string | null
          id?: string
          model_used?: string | null
          response_time_ms?: number | null
          role: string
          sources?: Json | null
          tokens_input?: number | null
          tokens_output?: number | null
          tokens_used?: number | null
        }
        Update: {
          actions_taken?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          feedback?: string | null
          feedback_comment?: string | null
          id?: string
          model_used?: string | null
          response_time_ms?: number | null
          role?: string
          sources?: Json | null
          tokens_input?: number | null
          tokens_output?: number | null
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
      ai_models: {
        Row: {
          capabilities: Json | null
          context_window: number | null
          created_at: string | null
          deprecated_at: string | null
          discovered_at: string | null
          id: string
          input_cost_per_1m: number | null
          is_active: boolean | null
          max_output_tokens: number | null
          model_id: string
          name: string
          output_cost_per_1m: number | null
          provider_id: string | null
          quality_rating: number | null
          speed_rating: number | null
          tier: string | null
          updated_at: string | null
        }
        Insert: {
          capabilities?: Json | null
          context_window?: number | null
          created_at?: string | null
          deprecated_at?: string | null
          discovered_at?: string | null
          id?: string
          input_cost_per_1m?: number | null
          is_active?: boolean | null
          max_output_tokens?: number | null
          model_id: string
          name: string
          output_cost_per_1m?: number | null
          provider_id?: string | null
          quality_rating?: number | null
          speed_rating?: number | null
          tier?: string | null
          updated_at?: string | null
        }
        Update: {
          capabilities?: Json | null
          context_window?: number | null
          created_at?: string | null
          deprecated_at?: string | null
          discovered_at?: string | null
          id?: string
          input_cost_per_1m?: number | null
          is_active?: boolean | null
          max_output_tokens?: number | null
          model_id?: string
          name?: string
          output_cost_per_1m?: number | null
          provider_id?: string | null
          quality_rating?: number | null
          speed_rating?: number | null
          tier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_models_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
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
      ai_providers: {
        Row: {
          api_key_encrypted: string | null
          base_url: string | null
          code: string
          config: Json | null
          created_at: string | null
          health_status: string | null
          id: string
          is_gateway: boolean | null
          last_health_check_at: string | null
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          base_url?: string | null
          code: string
          config?: Json | null
          created_at?: string | null
          health_status?: string | null
          id?: string
          is_gateway?: boolean | null
          last_health_check_at?: string | null
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          base_url?: string | null
          code?: string
          config?: Json | null
          created_at?: string | null
          health_status?: string | null
          id?: string
          is_gateway?: boolean | null
          last_health_check_at?: string | null
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_rag_collections: {
        Row: {
          auto_update_enabled: boolean | null
          chunk_count: number | null
          chunk_overlap: number | null
          chunk_size: number | null
          collection_type: string | null
          created_at: string | null
          description: string | null
          document_count: number | null
          embedding_dimensions: number | null
          embedding_model: string | null
          id: string
          is_active: boolean | null
          last_updated_at: string | null
          name: string
          next_update_at: string | null
          total_tokens: number | null
          update_frequency: string | null
          updated_at: string | null
        }
        Insert: {
          auto_update_enabled?: boolean | null
          chunk_count?: number | null
          chunk_overlap?: number | null
          chunk_size?: number | null
          collection_type?: string | null
          created_at?: string | null
          description?: string | null
          document_count?: number | null
          embedding_dimensions?: number | null
          embedding_model?: string | null
          id?: string
          is_active?: boolean | null
          last_updated_at?: string | null
          name: string
          next_update_at?: string | null
          total_tokens?: number | null
          update_frequency?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_update_enabled?: boolean | null
          chunk_count?: number | null
          chunk_overlap?: number | null
          chunk_size?: number | null
          collection_type?: string | null
          created_at?: string | null
          description?: string | null
          document_count?: number | null
          embedding_dimensions?: number | null
          embedding_model?: string | null
          id?: string
          is_active?: boolean | null
          last_updated_at?: string | null
          name?: string
          next_update_at?: string | null
          total_tokens?: number | null
          update_frequency?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_rate_limits: {
        Row: {
          current_day_requests: number | null
          current_day_tokens: number | null
          current_hour_requests: number | null
          current_minute_requests: number | null
          current_minute_tokens: number | null
          day_reset_at: string | null
          hour_reset_at: string | null
          id: string
          minute_reset_at: string | null
          organization_id: string | null
          requests_per_day: number | null
          requests_per_hour: number | null
          requests_per_minute: number | null
          tokens_per_day: number | null
          tokens_per_minute: number | null
          updated_at: string | null
        }
        Insert: {
          current_day_requests?: number | null
          current_day_tokens?: number | null
          current_hour_requests?: number | null
          current_minute_requests?: number | null
          current_minute_tokens?: number | null
          day_reset_at?: string | null
          hour_reset_at?: string | null
          id?: string
          minute_reset_at?: string | null
          organization_id?: string | null
          requests_per_day?: number | null
          requests_per_hour?: number | null
          requests_per_minute?: number | null
          tokens_per_day?: number | null
          tokens_per_minute?: number | null
          updated_at?: string | null
        }
        Update: {
          current_day_requests?: number | null
          current_day_tokens?: number | null
          current_hour_requests?: number | null
          current_minute_requests?: number | null
          current_minute_tokens?: number | null
          day_reset_at?: string | null
          hour_reset_at?: string | null
          id?: string
          minute_reset_at?: string | null
          organization_id?: string | null
          requests_per_day?: number | null
          requests_per_hour?: number | null
          requests_per_minute?: number | null
          tokens_per_day?: number | null
          tokens_per_minute?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_rate_limits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_rate_limits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_rate_limits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_request_logs: {
        Row: {
          conversation_id: string | null
          cost_usd: number | null
          created_at: string | null
          error_message: string | null
          fallback_model_id: string | null
          fallback_used: boolean | null
          id: string
          input_tokens: number | null
          latency_ms: number | null
          model_id: string | null
          organization_id: string | null
          output_tokens: number | null
          provider_id: string | null
          request_metadata: Json | null
          status: string | null
          task_code: string
          time_to_first_token_ms: number | null
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          fallback_model_id?: string | null
          fallback_used?: boolean | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model_id?: string | null
          organization_id?: string | null
          output_tokens?: number | null
          provider_id?: string | null
          request_metadata?: Json | null
          status?: string | null
          task_code: string
          time_to_first_token_ms?: number | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          fallback_model_id?: string | null
          fallback_used?: boolean | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model_id?: string | null
          organization_id?: string | null
          output_tokens?: number | null
          provider_id?: string | null
          request_metadata?: Json | null
          status?: string | null
          task_code?: string
          time_to_first_token_ms?: number | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_request_logs_fallback_model_id_fkey"
            columns: ["fallback_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_request_logs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_request_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_request_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_request_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_request_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_request_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_task_assignments: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          fallback_1_model_id: string | null
          fallback_2_model_id: string | null
          id: string
          is_active: boolean | null
          max_retries: number | null
          max_tokens: number | null
          primary_model_id: string | null
          priority: number | null
          prompt_id: string | null
          rag_collection_ids: string[] | null
          rag_enabled: boolean | null
          rag_top_k: number | null
          system_prompt_override: string | null
          task_code: string
          task_name: string
          temperature: number | null
          timeout_ms: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          fallback_1_model_id?: string | null
          fallback_2_model_id?: string | null
          id?: string
          is_active?: boolean | null
          max_retries?: number | null
          max_tokens?: number | null
          primary_model_id?: string | null
          priority?: number | null
          prompt_id?: string | null
          rag_collection_ids?: string[] | null
          rag_enabled?: boolean | null
          rag_top_k?: number | null
          system_prompt_override?: string | null
          task_code: string
          task_name: string
          temperature?: number | null
          timeout_ms?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          fallback_1_model_id?: string | null
          fallback_2_model_id?: string | null
          id?: string
          is_active?: boolean | null
          max_retries?: number | null
          max_tokens?: number | null
          primary_model_id?: string | null
          priority?: number | null
          prompt_id?: string | null
          rag_collection_ids?: string[] | null
          rag_enabled?: boolean | null
          rag_top_k?: number | null
          system_prompt_override?: string | null
          task_code?: string
          task_name?: string
          temperature?: number | null
          timeout_ms?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_task_assignments_fallback_1_model_id_fkey"
            columns: ["fallback_1_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_task_assignments_fallback_2_model_id_fkey"
            columns: ["fallback_2_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_task_assignments_primary_model_id_fkey"
            columns: ["primary_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_task_assignments_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompt_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tier_quotas: {
        Row: {
          allowed_models: string[] | null
          created_at: string | null
          features: Json | null
          id: string
          max_context_tokens: number
          monthly_requests: number
          monthly_tokens: number
          tier: string
          updated_at: string | null
        }
        Insert: {
          allowed_models?: string[] | null
          created_at?: string | null
          features?: Json | null
          id?: string
          max_context_tokens?: number
          monthly_requests?: number
          monthly_tokens?: number
          tier: string
          updated_at?: string | null
        }
        Update: {
          allowed_models?: string[] | null
          created_at?: string | null
          features?: Json | null
          id?: string
          max_context_tokens?: number
          monthly_requests?: number
          monthly_tokens?: number
          tier?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_transaction_ledger: {
        Row: {
          billable_amount: number
          billing_strategy: string
          client_id: string | null
          cost_input: number
          cost_output: number
          cost_total: number
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          input_tokens: number
          is_billable: boolean
          jurisdiction_code: string | null
          latency_ms: number | null
          markup_percent: number | null
          matter_id: string | null
          model_code: string | null
          model_id: string | null
          module: string
          organization_id: string
          output_tokens: number
          provider_id: string | null
          routing_reason: string | null
          routing_rule_id: string | null
          session_id: string | null
          status: string
          task_type: string | null
          total_tokens: number
          transaction_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billable_amount?: number
          billing_strategy?: string
          client_id?: string | null
          cost_input?: number
          cost_output?: number
          cost_total?: number
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          input_tokens?: number
          is_billable?: boolean
          jurisdiction_code?: string | null
          latency_ms?: number | null
          markup_percent?: number | null
          matter_id?: string | null
          model_code?: string | null
          model_id?: string | null
          module: string
          organization_id: string
          output_tokens?: number
          provider_id?: string | null
          routing_reason?: string | null
          routing_rule_id?: string | null
          session_id?: string | null
          status?: string
          task_type?: string | null
          total_tokens?: number
          transaction_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billable_amount?: number
          billing_strategy?: string
          client_id?: string | null
          cost_input?: number
          cost_output?: number
          cost_total?: number
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          input_tokens?: number
          is_billable?: boolean
          jurisdiction_code?: string | null
          latency_ms?: number | null
          markup_percent?: number | null
          matter_id?: string | null
          model_code?: string | null
          model_id?: string | null
          module?: string
          organization_id?: string
          output_tokens?: number
          provider_id?: string | null
          routing_reason?: string | null
          routing_rule_id?: string | null
          session_id?: string | null
          status?: string
          task_type?: string | null
          total_tokens?: number
          transaction_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_transaction_ledger_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_transaction_ledger_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_transaction_ledger_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_transaction_ledger_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_transaction_ledger_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_transaction_ledger_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_transaction_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_translation_glossaries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_translations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
      ai_usage_aggregates: {
        Row: {
          avg_latency_ms: number | null
          by_model: Json | null
          by_task: Json | null
          created_at: string | null
          failed_requests: number | null
          id: string
          organization_id: string | null
          p50_latency_ms: number | null
          p95_latency_ms: number | null
          p99_latency_ms: number | null
          period_end: string
          period_start: string
          period_type: string
          successful_requests: number | null
          total_cost_usd: number | null
          total_input_tokens: number | null
          total_output_tokens: number | null
          total_requests: number | null
          updated_at: string | null
        }
        Insert: {
          avg_latency_ms?: number | null
          by_model?: Json | null
          by_task?: Json | null
          created_at?: string | null
          failed_requests?: number | null
          id?: string
          organization_id?: string | null
          p50_latency_ms?: number | null
          p95_latency_ms?: number | null
          p99_latency_ms?: number | null
          period_end: string
          period_start: string
          period_type: string
          successful_requests?: number | null
          total_cost_usd?: number | null
          total_input_tokens?: number | null
          total_output_tokens?: number | null
          total_requests?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_latency_ms?: number | null
          by_model?: Json | null
          by_task?: Json | null
          created_at?: string | null
          failed_requests?: number | null
          id?: string
          organization_id?: string | null
          p50_latency_ms?: number | null
          p95_latency_ms?: number | null
          p99_latency_ms?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          successful_requests?: number | null
          total_cost_usd?: number | null
          total_input_tokens?: number | null
          total_output_tokens?: number | null
          total_requests?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_aggregates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_aggregates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_usage_aggregates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_events: {
        Row: {
          conversation_id: string | null
          cost_usd: number | null
          created_at: string | null
          id: string
          input_tokens: number
          jurisdiction_code: string | null
          kb_chunks_used: string[] | null
          matter_id: string | null
          model_used: string | null
          module: string | null
          operation_type: string
          organization_id: string
          output_tokens: number
          query_hash: string | null
          response_quality: number | null
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          input_tokens?: number
          jurisdiction_code?: string | null
          kb_chunks_used?: string[] | null
          matter_id?: string | null
          model_used?: string | null
          module?: string | null
          operation_type: string
          organization_id: string
          output_tokens?: number
          query_hash?: string | null
          response_quality?: number | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          input_tokens?: number
          jurisdiction_code?: string | null
          kb_chunks_used?: string[] | null
          matter_id?: string | null
          model_used?: string | null
          module?: string | null
          operation_type?: string
          organization_id?: string
          output_tokens?: number
          query_hash?: string | null
          response_quality?: number | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_usage_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_configurations: {
        Row: {
          alert_type: string
          analyze_frequency: string | null
          auto_analyze_enabled: boolean | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          last_analyzed_at: string | null
          min_confidence: number | null
          min_severity: string | null
          notify_email: boolean | null
          notify_in_app: boolean | null
          notify_matter_owner: boolean | null
          notify_roles: string[] | null
          notify_slack: boolean | null
          organization_id: string
          slack_webhook_url: string | null
          updated_at: string | null
        }
        Insert: {
          alert_type: string
          analyze_frequency?: string | null
          auto_analyze_enabled?: boolean | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_analyzed_at?: string | null
          min_confidence?: number | null
          min_severity?: string | null
          notify_email?: boolean | null
          notify_in_app?: boolean | null
          notify_matter_owner?: boolean | null
          notify_roles?: string[] | null
          notify_slack?: boolean | null
          organization_id: string
          slack_webhook_url?: string | null
          updated_at?: string | null
        }
        Update: {
          alert_type?: string
          analyze_frequency?: string | null
          auto_analyze_enabled?: boolean | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_analyzed_at?: string | null
          min_confidence?: number | null
          min_severity?: string | null
          notify_email?: boolean | null
          notify_in_app?: boolean | null
          notify_matter_owner?: boolean | null
          notify_roles?: string[] | null
          notify_slack?: boolean | null
          organization_id?: string
          slack_webhook_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "alert_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_daily_metrics: {
        Row: {
          ai_queries: number | null
          avg_page_load_ms: number | null
          avg_session_duration_seconds: number | null
          bounce_rate: number | null
          client_errors: number | null
          created_at: string | null
          daily_active_users: number | null
          documents_generated: number | null
          id: string
          matters_created: number | null
          metric_date: string
          monthly_active_users: number | null
          new_users: number | null
          organization_id: string | null
          p95_page_load_ms: number | null
          pages_per_session: number | null
          quote_requests_created: number | null
          quotes_sent: number | null
          returning_users: number | null
          searches_performed: number | null
          server_errors: number | null
          top_features: Json | null
          top_pages: Json | null
          total_sessions: number | null
          updated_at: string | null
          weekly_active_users: number | null
        }
        Insert: {
          ai_queries?: number | null
          avg_page_load_ms?: number | null
          avg_session_duration_seconds?: number | null
          bounce_rate?: number | null
          client_errors?: number | null
          created_at?: string | null
          daily_active_users?: number | null
          documents_generated?: number | null
          id?: string
          matters_created?: number | null
          metric_date: string
          monthly_active_users?: number | null
          new_users?: number | null
          organization_id?: string | null
          p95_page_load_ms?: number | null
          pages_per_session?: number | null
          quote_requests_created?: number | null
          quotes_sent?: number | null
          returning_users?: number | null
          searches_performed?: number | null
          server_errors?: number | null
          top_features?: Json | null
          top_pages?: Json | null
          total_sessions?: number | null
          updated_at?: string | null
          weekly_active_users?: number | null
        }
        Update: {
          ai_queries?: number | null
          avg_page_load_ms?: number | null
          avg_session_duration_seconds?: number | null
          bounce_rate?: number | null
          client_errors?: number | null
          created_at?: string | null
          daily_active_users?: number | null
          documents_generated?: number | null
          id?: string
          matters_created?: number | null
          metric_date?: string
          monthly_active_users?: number | null
          new_users?: number | null
          organization_id?: string | null
          p95_page_load_ms?: number | null
          pages_per_session?: number | null
          quote_requests_created?: number | null
          quotes_sent?: number | null
          returning_users?: number | null
          searches_performed?: number | null
          server_errors?: number | null
          top_features?: Json | null
          top_pages?: Json | null
          total_sessions?: number | null
          updated_at?: string | null
          weekly_active_users?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_daily_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_daily_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "analytics_daily_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          browser: string | null
          country_code: string | null
          created_at: string | null
          device_type: string | null
          event_category: string
          event_date: string | null
          event_name: string
          id: string
          organization_id: string | null
          os: string | null
          page_path: string | null
          page_title: string | null
          properties: Json | null
          referrer: string | null
          region: string | null
          screen_resolution: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          country_code?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category: string
          event_date?: string | null
          event_name: string
          id?: string
          organization_id?: string | null
          os?: string | null
          page_path?: string | null
          page_title?: string | null
          properties?: Json | null
          referrer?: string | null
          region?: string | null
          screen_resolution?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          country_code?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string
          event_date?: string | null
          event_name?: string
          id?: string
          organization_id?: string | null
          os?: string | null
          page_path?: string | null
          page_title?: string | null
          properties?: Json | null
          referrer?: string | null
          region?: string | null
          screen_resolution?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "analytics_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_feature_usage: {
        Row: {
          context: Json | null
          created_at: string | null
          duration_seconds: number | null
          feature_key: string
          id: string
          organization_id: string | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          feature_key: string
          id?: string
          organization_id?: string | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          feature_key?: string
          id?: string
          organization_id?: string | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_feature_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_feature_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "analytics_feature_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      audio_transcriptions: {
        Row: {
          ai_confidence: number | null
          ai_model: string | null
          audio_duration_seconds: number | null
          audio_format: string | null
          audio_url: string
          communication_id: string | null
          created_at: string | null
          diarization_enabled: boolean | null
          id: string
          language_detected: string | null
          organization_id: string
          segments: Json | null
          source_type: string
          speakers_identified: Json | null
          transcribed_at: string | null
          transcription_status: string | null
          transcription_text: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_model?: string | null
          audio_duration_seconds?: number | null
          audio_format?: string | null
          audio_url: string
          communication_id?: string | null
          created_at?: string | null
          diarization_enabled?: boolean | null
          id?: string
          language_detected?: string | null
          organization_id: string
          segments?: Json | null
          source_type: string
          speakers_identified?: Json | null
          transcribed_at?: string | null
          transcription_status?: string | null
          transcription_text?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_model?: string | null
          audio_duration_seconds?: number | null
          audio_format?: string | null
          audio_url?: string
          communication_id?: string | null
          created_at?: string | null
          diarization_enabled?: boolean | null
          id?: string
          language_detected?: string | null
          organization_id?: string
          segments?: Json | null
          source_type?: string
          speakers_identified?: Json | null
          transcribed_at?: string | null
          transcription_status?: string | null
          transcription_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_transcriptions_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_transcriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_transcriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "audio_transcriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      availability_exceptions: {
        Row: {
          created_at: string | null
          end_time: string | null
          exception_date: string
          id: string
          is_available: boolean | null
          organization_id: string
          reason: string | null
          start_time: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          exception_date: string
          id?: string
          is_available?: boolean | null
          organization_id: string
          reason?: string | null
          start_time?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          exception_date?: string
          id?: string
          is_available?: boolean | null
          organization_id?: string
          reason?: string | null
          start_time?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_exceptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_exceptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "availability_exceptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_exceptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_slots: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_recurring: boolean | null
          organization_id: string
          slot_type: string | null
          start_time: string
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_recurring?: boolean | null
          organization_id: string
          slot_type?: string | null
          start_time: string
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          organization_id?: string
          slot_type?: string | null
          start_time?: string
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_slots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "availability_slots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_slots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      billing_events: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          error_message: string | null
          event_type: string
          id: string
          organization_id: string | null
          payload: Json
          processed_at: string | null
          status: string | null
          stripe_event_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          organization_id?: string | null
          payload?: Json
          processed_at?: string | null
          status?: string | null
          stripe_event_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          organization_id?: string | null
          payload?: Json
          processed_at?: string | null
          status?: string | null
          stripe_event_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "billing_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_rates: {
        Row: {
          contact_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          effective_from: string | null
          effective_until: string | null
          hourly_rate: number
          id: string
          is_active: boolean | null
          matter_type: string | null
          name: string | null
          organization_id: string
          rate_type: string
          role_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          effective_from?: string | null
          effective_until?: string | null
          hourly_rate: number
          id?: string
          is_active?: boolean | null
          matter_type?: string | null
          name?: string | null
          organization_id: string
          rate_type: string
          role_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          effective_from?: string | null
          effective_until?: string | null
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          matter_type?: string | null
          name?: string | null
          organization_id?: string
          rate_type?: string
          role_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_rates_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "billing_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_rates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blockchain_timestamps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      calendar_connections: {
        Row: {
          access_token: string
          calendar_color: string | null
          calendar_id: string
          calendar_name: string | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          last_sync_error: string | null
          organization_id: string
          provider: string
          refresh_token: string | null
          sync_deadlines: boolean | null
          sync_direction: string | null
          sync_enabled: boolean | null
          sync_meetings: boolean | null
          sync_status: string | null
          sync_tasks: boolean | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          calendar_color?: string | null
          calendar_id: string
          calendar_name?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          organization_id: string
          provider: string
          refresh_token?: string | null
          sync_deadlines?: boolean | null
          sync_direction?: string | null
          sync_enabled?: boolean | null
          sync_meetings?: boolean | null
          sync_status?: string | null
          sync_tasks?: boolean | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          calendar_color?: string | null
          calendar_id?: string
          calendar_name?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          organization_id?: string
          provider?: string
          refresh_token?: string | null
          sync_deadlines?: boolean | null
          sync_direction?: string | null
          sync_enabled?: boolean | null
          sync_meetings?: boolean | null
          sync_status?: string | null
          sync_tasks?: boolean | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "calendar_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_event_mappings: {
        Row: {
          calendar_connection_id: string
          created_at: string | null
          external_calendar_id: string
          external_event_id: string
          id: string
          last_synced_at: string | null
          source_id: string
          source_type: string
          sync_hash: string | null
        }
        Insert: {
          calendar_connection_id: string
          created_at?: string | null
          external_calendar_id: string
          external_event_id: string
          id?: string
          last_synced_at?: string | null
          source_id: string
          source_type: string
          sync_hash?: string | null
        }
        Update: {
          calendar_connection_id?: string
          created_at?: string | null
          external_calendar_id?: string
          external_event_id?: string
          id?: string
          last_synced_at?: string | null
          source_id?: string
          source_type?: string
          sync_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_event_mappings_calendar_connection_id_fkey"
            columns: ["calendar_connection_id"]
            isOneToOne: false
            referencedRelation: "calendar_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_integrations: {
        Row: {
          access_token: string
          calendar_id: string | null
          calendar_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          organization_id: string
          provider: string
          refresh_token: string | null
          sync_deadlines: boolean | null
          sync_direction: string | null
          sync_enabled: boolean | null
          sync_errors: Json | null
          sync_hearings: boolean | null
          sync_tasks: boolean | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          calendar_id?: string | null
          calendar_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          organization_id: string
          provider: string
          refresh_token?: string | null
          sync_deadlines?: boolean | null
          sync_direction?: string | null
          sync_enabled?: boolean | null
          sync_errors?: Json | null
          sync_hearings?: boolean | null
          sync_tasks?: boolean | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          calendar_id?: string | null
          calendar_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          organization_id?: string
          provider?: string
          refresh_token?: string | null
          sync_deadlines?: boolean | null
          sync_direction?: string | null
          sync_enabled?: boolean | null
          sync_errors?: Json | null
          sync_hearings?: boolean | null
          sync_tasks?: boolean | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "calendar_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      capabilities: {
        Row: {
          capability_type: string | null
          category: string
          code: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_metered: boolean | null
          module_code: string | null
          name: string
          sort_order: number | null
          unit_name: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          capability_type?: string | null
          category: string
          code: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_metered?: boolean | null
          module_code?: string | null
          name: string
          sort_order?: number | null
          unit_name?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          capability_type?: string | null
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_metered?: boolean | null
          module_code?: string | null
          name?: string
          sort_order?: number | null
          unit_name?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      capability_usage: {
        Row: {
          capability_code: string
          id: string
          limit_value: number | null
          organization_id: string
          period_end: string
          period_start: string
          updated_at: string | null
          usage_cost: number | null
          usage_count: number | null
        }
        Insert: {
          capability_code: string
          id?: string
          limit_value?: number | null
          organization_id: string
          period_end: string
          period_start: string
          updated_at?: string | null
          usage_cost?: number | null
          usage_count?: number | null
        }
        Update: {
          capability_code?: string
          id?: string
          limit_value?: number | null
          organization_id?: string
          period_end?: string
          period_start?: string
          updated_at?: string | null
          usage_cost?: number | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "capability_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capability_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "capability_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      change_history: {
        Row: {
          audit_log_id: string | null
          created_at: string | null
          data_type: string | null
          field_name: string
          field_path: string | null
          id: string
          new_value: string | null
          old_value: string | null
          resource_id: string
          resource_type: string
        }
        Insert: {
          audit_log_id?: string | null
          created_at?: string | null
          data_type?: string | null
          field_name: string
          field_path?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          resource_id: string
          resource_type: string
        }
        Update: {
          audit_log_id?: string | null
          created_at?: string | null
          data_type?: string | null
          field_name?: string
          field_path?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          resource_id?: string
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_history_audit_log_id_fkey"
            columns: ["audit_log_id"]
            isOneToOne: false
            referencedRelation: "audit_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      client_ai_billing_rules: {
        Row: {
          alert_email: string | null
          alert_threshold_percent: number
          billing_mode: string
          client_id: string | null
          created_at: string
          current_month: string
          current_month_queries: number
          current_month_spend: number
          current_month_tokens: number
          daily_budget: number | null
          downgrade_to_model_id: string | null
          flat_rate_per_query: number | null
          id: string
          invoice_line_description: string
          is_active: boolean
          last_alert_at: string | null
          limit_action: string
          markup_percent: number | null
          monthly_budget: number | null
          monthly_cap: number | null
          organization_id: string
          query_limit_daily: number | null
          query_limit_monthly: number | null
          show_on_invoice: boolean
          updated_at: string
        }
        Insert: {
          alert_email?: string | null
          alert_threshold_percent?: number
          billing_mode?: string
          client_id?: string | null
          created_at?: string
          current_month?: string
          current_month_queries?: number
          current_month_spend?: number
          current_month_tokens?: number
          daily_budget?: number | null
          downgrade_to_model_id?: string | null
          flat_rate_per_query?: number | null
          id?: string
          invoice_line_description?: string
          is_active?: boolean
          last_alert_at?: string | null
          limit_action?: string
          markup_percent?: number | null
          monthly_budget?: number | null
          monthly_cap?: number | null
          organization_id: string
          query_limit_daily?: number | null
          query_limit_monthly?: number | null
          show_on_invoice?: boolean
          updated_at?: string
        }
        Update: {
          alert_email?: string | null
          alert_threshold_percent?: number
          billing_mode?: string
          client_id?: string | null
          created_at?: string
          current_month?: string
          current_month_queries?: number
          current_month_spend?: number
          current_month_tokens?: number
          daily_budget?: number | null
          downgrade_to_model_id?: string | null
          flat_rate_per_query?: number | null
          id?: string
          invoice_line_description?: string
          is_active?: boolean
          last_alert_at?: string | null
          limit_action?: string
          markup_percent?: number | null
          monthly_budget?: number | null
          monthly_cap?: number | null
          organization_id?: string
          query_limit_daily?: number | null
          query_limit_monthly?: number | null
          show_on_invoice?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_ai_billing_rules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_ai_billing_rules_downgrade_to_model_id_fkey"
            columns: ["downgrade_to_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_ai_billing_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_ai_billing_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "client_ai_billing_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          doc_type: Database["public"]["Enums"]["client_doc_type"] | null
          doc_type_confidence: number | null
          doc_type_verified: boolean | null
          embedding_status: string | null
          file_hash: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          matter_id: string | null
          mime_type: string | null
          ner_completed_at: string | null
          ner_model: string | null
          ner_status: string | null
          notes: string | null
          ocr_completed_at: string | null
          ocr_confidence: number | null
          ocr_text: string | null
          organization_id: string
          parent_document_id: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          uploaded_by: string | null
          valid_from: string | null
          valid_until: string | null
          validity_status:
            | Database["public"]["Enums"]["doc_validity_status"]
            | null
          validity_verified: boolean | null
          validity_verified_at: string | null
          validity_verified_by: string | null
          version: number | null
          visible_in_portal: boolean | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          doc_type?: Database["public"]["Enums"]["client_doc_type"] | null
          doc_type_confidence?: number | null
          doc_type_verified?: boolean | null
          embedding_status?: string | null
          file_hash?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          matter_id?: string | null
          mime_type?: string | null
          ner_completed_at?: string | null
          ner_model?: string | null
          ner_status?: string | null
          notes?: string | null
          ocr_completed_at?: string | null
          ocr_confidence?: number | null
          ocr_text?: string | null
          organization_id: string
          parent_document_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          valid_from?: string | null
          valid_until?: string | null
          validity_status?:
            | Database["public"]["Enums"]["doc_validity_status"]
            | null
          validity_verified?: boolean | null
          validity_verified_at?: string | null
          validity_verified_by?: string | null
          version?: number | null
          visible_in_portal?: boolean | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          doc_type?: Database["public"]["Enums"]["client_doc_type"] | null
          doc_type_confidence?: number | null
          doc_type_verified?: boolean | null
          embedding_status?: string | null
          file_hash?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          matter_id?: string | null
          mime_type?: string | null
          ner_completed_at?: string | null
          ner_model?: string | null
          ner_status?: string | null
          notes?: string | null
          ocr_completed_at?: string | null
          ocr_confidence?: number | null
          ocr_text?: string | null
          organization_id?: string
          parent_document_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          valid_from?: string | null
          valid_until?: string | null
          validity_status?:
            | Database["public"]["Enums"]["doc_validity_status"]
            | null
          validity_verified?: boolean | null
          validity_verified_at?: string | null
          validity_verified_by?: string | null
          version?: number | null
          visible_in_portal?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "client_documents_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "client_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "client_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portals: {
        Row: {
          activated_at: string | null
          branding_config: Json | null
          client_id: string
          created_at: string | null
          created_by: string | null
          deactivated_at: string | null
          id: string
          is_active: boolean | null
          last_accessed_at: string | null
          organization_id: string
          portal_name: string | null
          portal_slug: string | null
          settings: Json | null
          total_logins: number | null
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          branding_config?: Json | null
          client_id: string
          created_at?: string | null
          created_by?: string | null
          deactivated_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          organization_id: string
          portal_name?: string | null
          portal_slug?: string | null
          settings?: Json | null
          total_logins?: number | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          branding_config?: Json | null
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          deactivated_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          organization_id?: string
          portal_name?: string | null
          portal_slug?: string | null
          settings?: Json | null
          total_logins?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_portals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "client_portals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_channels: {
        Row: {
          channel: Database["public"]["Enums"]["comm_channel"]
          config: Json | null
          created_at: string | null
          created_by: string | null
          credentials_encrypted: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          organization_id: string
          sync_status: string | null
          updated_at: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["comm_channel"]
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          credentials_encrypted?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          organization_id: string
          sync_status?: string | null
          updated_at?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["comm_channel"]
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          credentials_encrypted?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          organization_id?: string
          sync_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "communication_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          ai_category: Database["public"]["Enums"]["comm_category"] | null
          ai_classified_at: string | null
          ai_confidence: number | null
          ai_model: string | null
          ai_priority: number | null
          ai_subcategory: string | null
          archived_at: string | null
          assigned_at: string | null
          assigned_to: string | null
          attachments: Json | null
          body: string | null
          body_html: string | null
          body_preview: string | null
          channel: Database["public"]["Enums"]["comm_channel"]
          channel_config_id: string | null
          classified_at: string | null
          classified_by: string | null
          client_id: string | null
          contact_id: string | null
          created_at: string | null
          direction: Database["public"]["Enums"]["comm_direction"]
          email_bcc: string[] | null
          email_cc: string[] | null
          email_from: string | null
          email_in_reply_to: string | null
          email_message_id: string | null
          email_thread_id: string | null
          email_to: string[] | null
          external_id: string | null
          external_metadata: Json | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          is_replied: boolean | null
          is_starred: boolean | null
          manual_category: Database["public"]["Enums"]["comm_category"] | null
          manual_priority: number | null
          matter_id: string | null
          organization_id: string
          phone_duration_seconds: number | null
          phone_from: string | null
          phone_recording_url: string | null
          phone_to: string | null
          read_at: string | null
          read_by: string | null
          received_at: string
          replied_at: string | null
          reply_comm_id: string | null
          subject: string | null
          updated_at: string | null
          whatsapp_from: string | null
          whatsapp_media_url: string | null
          whatsapp_to: string | null
          whatsapp_type: string | null
        }
        Insert: {
          ai_category?: Database["public"]["Enums"]["comm_category"] | null
          ai_classified_at?: string | null
          ai_confidence?: number | null
          ai_model?: string | null
          ai_priority?: number | null
          ai_subcategory?: string | null
          archived_at?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          body?: string | null
          body_html?: string | null
          body_preview?: string | null
          channel: Database["public"]["Enums"]["comm_channel"]
          channel_config_id?: string | null
          classified_at?: string | null
          classified_by?: string | null
          client_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          direction: Database["public"]["Enums"]["comm_direction"]
          email_bcc?: string[] | null
          email_cc?: string[] | null
          email_from?: string | null
          email_in_reply_to?: string | null
          email_message_id?: string | null
          email_thread_id?: string | null
          email_to?: string[] | null
          external_id?: string | null
          external_metadata?: Json | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          is_replied?: boolean | null
          is_starred?: boolean | null
          manual_category?: Database["public"]["Enums"]["comm_category"] | null
          manual_priority?: number | null
          matter_id?: string | null
          organization_id: string
          phone_duration_seconds?: number | null
          phone_from?: string | null
          phone_recording_url?: string | null
          phone_to?: string | null
          read_at?: string | null
          read_by?: string | null
          received_at?: string
          replied_at?: string | null
          reply_comm_id?: string | null
          subject?: string | null
          updated_at?: string | null
          whatsapp_from?: string | null
          whatsapp_media_url?: string | null
          whatsapp_to?: string | null
          whatsapp_type?: string | null
        }
        Update: {
          ai_category?: Database["public"]["Enums"]["comm_category"] | null
          ai_classified_at?: string | null
          ai_confidence?: number | null
          ai_model?: string | null
          ai_priority?: number | null
          ai_subcategory?: string | null
          archived_at?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          body?: string | null
          body_html?: string | null
          body_preview?: string | null
          channel?: Database["public"]["Enums"]["comm_channel"]
          channel_config_id?: string | null
          classified_at?: string | null
          classified_by?: string | null
          client_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          direction?: Database["public"]["Enums"]["comm_direction"]
          email_bcc?: string[] | null
          email_cc?: string[] | null
          email_from?: string | null
          email_in_reply_to?: string | null
          email_message_id?: string | null
          email_thread_id?: string | null
          email_to?: string[] | null
          external_id?: string | null
          external_metadata?: Json | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          is_replied?: boolean | null
          is_starred?: boolean | null
          manual_category?: Database["public"]["Enums"]["comm_category"] | null
          manual_priority?: number | null
          matter_id?: string | null
          organization_id?: string
          phone_duration_seconds?: number | null
          phone_from?: string | null
          phone_recording_url?: string | null
          phone_to?: string | null
          read_at?: string | null
          read_by?: string | null
          received_at?: string
          replied_at?: string | null
          reply_comm_id?: string | null
          subject?: string | null
          updated_at?: string | null
          whatsapp_from?: string | null
          whatsapp_media_url?: string | null
          whatsapp_to?: string | null
          whatsapp_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_channel_config_id_fkey"
            columns: ["channel_config_id"]
            isOneToOne: false
            referencedRelation: "communication_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "communications_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "communications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_reply_comm_id_fkey"
            columns: ["reply_comm_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_checks: {
        Row: {
          category: string | null
          check_code: string
          check_description: string | null
          check_name: string
          created_at: string | null
          evidence_documents: string[] | null
          evidence_notes: string | null
          framework: string
          id: string
          last_checked_at: string | null
          next_review_at: string | null
          organization_id: string
          owner_id: string | null
          remediation_due_date: string | null
          remediation_plan: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          check_code: string
          check_description?: string | null
          check_name: string
          created_at?: string | null
          evidence_documents?: string[] | null
          evidence_notes?: string | null
          framework: string
          id?: string
          last_checked_at?: string | null
          next_review_at?: string | null
          organization_id: string
          owner_id?: string | null
          remediation_due_date?: string | null
          remediation_plan?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          check_code?: string
          check_description?: string | null
          check_name?: string
          created_at?: string | null
          evidence_documents?: string[] | null
          evidence_notes?: string | null
          framework?: string
          id?: string
          last_checked_at?: string | null
          next_review_at?: string | null
          organization_id?: string
          owner_id?: string | null
          remediation_due_date?: string | null
          remediation_plan?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_checks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_checks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "compliance_checks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_audit_log: {
        Row: {
          consent_type: string
          created_at: string | null
          document_version: string | null
          event_type: string
          id: string
          ip_address: unknown
          new_value: Json | null
          old_value: Json | null
          organization_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string | null
          document_version?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          organization_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string | null
          document_version?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          organization_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "consent_audit_log_organization_id_fkey"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_lists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
          crm_owner_id: string | null
          custom_fields: Json | null
          department: string | null
          email: string | null
          employee_count: string | null
          id: string
          industry: string | null
          is_decision_maker: boolean | null
          is_primary_contact: boolean | null
          job_title: string | null
          last_contacted_at: string | null
          last_interaction_at: string | null
          lead_classification: string | null
          lead_score: number | null
          lead_score_components: Json | null
          lead_source: string | null
          lead_status: string | null
          lifecycle_stage: string | null
          mobile: string | null
          name: string
          next_followup_date: string | null
          notes: string | null
          organization_id: string
          owner_type: string
          phone: string | null
          portal_access_enabled: boolean | null
          portal_last_login: string | null
          postal_code: string | null
          preferred_contact_method: string | null
          preferred_language: string | null
          search_vector: unknown
          source: string | null
          source_detail: string | null
          state: string | null
          tags: string[] | null
          tax_id: string | null
          timezone: string | null
          total_interactions: number | null
          type: string
          updated_at: string | null
          website: string | null
          whatsapp_enabled: boolean | null
          whatsapp_opted_in_at: string | null
          whatsapp_phone: string | null
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
          crm_owner_id?: string | null
          custom_fields?: Json | null
          department?: string | null
          email?: string | null
          employee_count?: string | null
          id?: string
          industry?: string | null
          is_decision_maker?: boolean | null
          is_primary_contact?: boolean | null
          job_title?: string | null
          last_contacted_at?: string | null
          last_interaction_at?: string | null
          lead_classification?: string | null
          lead_score?: number | null
          lead_score_components?: Json | null
          lead_source?: string | null
          lead_status?: string | null
          lifecycle_stage?: string | null
          mobile?: string | null
          name: string
          next_followup_date?: string | null
          notes?: string | null
          organization_id: string
          owner_type?: string
          phone?: string | null
          portal_access_enabled?: boolean | null
          portal_last_login?: string | null
          postal_code?: string | null
          preferred_contact_method?: string | null
          preferred_language?: string | null
          search_vector?: unknown
          source?: string | null
          source_detail?: string | null
          state?: string | null
          tags?: string[] | null
          tax_id?: string | null
          timezone?: string | null
          total_interactions?: number | null
          type?: string
          updated_at?: string | null
          website?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_opted_in_at?: string | null
          whatsapp_phone?: string | null
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
          crm_owner_id?: string | null
          custom_fields?: Json | null
          department?: string | null
          email?: string | null
          employee_count?: string | null
          id?: string
          industry?: string | null
          is_decision_maker?: boolean | null
          is_primary_contact?: boolean | null
          job_title?: string | null
          last_contacted_at?: string | null
          last_interaction_at?: string | null
          lead_classification?: string | null
          lead_score?: number | null
          lead_score_components?: Json | null
          lead_source?: string | null
          lead_status?: string | null
          lifecycle_stage?: string | null
          mobile?: string | null
          name?: string
          next_followup_date?: string | null
          notes?: string | null
          organization_id?: string
          owner_type?: string
          phone?: string | null
          portal_access_enabled?: boolean | null
          portal_last_login?: string | null
          postal_code?: string | null
          preferred_contact_method?: string | null
          preferred_language?: string | null
          search_vector?: unknown
          source?: string | null
          source_detail?: string | null
          state?: string | null
          tags?: string[] | null
          tax_id?: string | null
          timezone?: string | null
          total_interactions?: number | null
          type?: string
          updated_at?: string | null
          website?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_opted_in_at?: string | null
          whatsapp_phone?: string | null
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
            foreignKeyName: "contacts_crm_owner_id_fkey"
            columns: ["crm_owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      contextual_guide_progress: {
        Row: {
          feature_key: string
          first_seen_at: string
          id: string
          organization_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          feature_key: string
          first_seen_at?: string
          id?: string
          organization_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          feature_key?: string
          first_seen_at?: string
          id?: string
          organization_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contextual_guide_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contextual_guide_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "contextual_guide_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contextual_guide_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_account_health_history: {
        Row: {
          change_factors: Json | null
          churn_risk_score: number | null
          health_components: Json
          health_score: number
          id: string
          organization_id: string
          recorded_at: string | null
          triggered_by: string | null
        }
        Insert: {
          change_factors?: Json | null
          churn_risk_score?: number | null
          health_components: Json
          health_score: number
          id?: string
          organization_id: string
          recorded_at?: string | null
          triggered_by?: string | null
        }
        Update: {
          change_factors?: Json | null
          churn_risk_score?: number | null
          health_components?: Json
          health_score?: number
          id?: string
          organization_id?: string
          recorded_at?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_account_health_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_account_health_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_account_health_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_accounts: {
        Row: {
          account_manager_id: string | null
          churn_risk_level: string | null
          created_at: string
          health_score: number | null
          id: string
          last_interaction_at: string | null
          legal_name: string | null
          metadata: Json
          name: string
          organization_id: string
          status: string
          tags: string[]
          tier: string
          updated_at: string
        }
        Insert: {
          account_manager_id?: string | null
          churn_risk_level?: string | null
          created_at?: string
          health_score?: number | null
          id?: string
          last_interaction_at?: string | null
          legal_name?: string | null
          metadata?: Json
          name: string
          organization_id: string
          status?: string
          tags?: string[]
          tier?: string
          updated_at?: string
        }
        Update: {
          account_manager_id?: string | null
          churn_risk_level?: string | null
          created_at?: string
          health_score?: number | null
          id?: string
          last_interaction_at?: string | null
          legal_name?: string | null
          metadata?: Json
          name?: string
          organization_id?: string
          status?: string
          tags?: string[]
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_accounts_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_ai_learning_logs: {
        Row: {
          ai_model: string | null
          ai_output: string
          context_type: string
          correction_distance: number | null
          created_at: string | null
          created_by: string | null
          crm_interaction_id: string | null
          feedback_notes: string | null
          few_shot_quality_score: number | null
          human_action: string | null
          human_output: string | null
          id: string
          included_in_few_shot: boolean | null
          input_context: Json | null
          interaction_id: string | null
          organization_id: string
          processed_at: string | null
          processed_for_training: boolean | null
          prompt_hash: string | null
          semantic_similarity: number | null
          time_to_action_seconds: number | null
        }
        Insert: {
          ai_model?: string | null
          ai_output: string
          context_type: string
          correction_distance?: number | null
          created_at?: string | null
          created_by?: string | null
          crm_interaction_id?: string | null
          feedback_notes?: string | null
          few_shot_quality_score?: number | null
          human_action?: string | null
          human_output?: string | null
          id?: string
          included_in_few_shot?: boolean | null
          input_context?: Json | null
          interaction_id?: string | null
          organization_id: string
          processed_at?: string | null
          processed_for_training?: boolean | null
          prompt_hash?: string | null
          semantic_similarity?: number | null
          time_to_action_seconds?: number | null
        }
        Update: {
          ai_model?: string | null
          ai_output?: string
          context_type?: string
          correction_distance?: number | null
          created_at?: string | null
          created_by?: string | null
          crm_interaction_id?: string | null
          feedback_notes?: string | null
          few_shot_quality_score?: number | null
          human_action?: string | null
          human_output?: string | null
          id?: string
          included_in_few_shot?: boolean | null
          input_context?: Json | null
          interaction_id?: string | null
          organization_id?: string
          processed_at?: string | null
          processed_for_training?: boolean | null
          prompt_hash?: string | null
          semantic_similarity?: number | null
          time_to_action_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_ai_learning_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_ai_learning_logs_crm_interaction_id_fkey"
            columns: ["crm_interaction_id"]
            isOneToOne: false
            referencedRelation: "crm_interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_ai_learning_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_ai_learning_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_ai_learning_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_ai_recommendations: {
        Row: {
          action_taken: string | null
          actioned_at: string | null
          actioned_by: string | null
          actual_impact: number | null
          confidence: number | null
          contact_id: string | null
          created_at: string | null
          crm_contact_id: string | null
          crm_deal_id: string | null
          deal_id: string | null
          description: string | null
          expires_at: string | null
          id: string
          matter_id: string | null
          organization_id: string
          outcome: string | null
          outcome_measured: boolean | null
          predicted_impact: number | null
          priority: string | null
          reasoning: string | null
          status: string | null
          suggested_action: Json | null
          title: string
          type: string
          updated_at: string | null
          urgency: number | null
        }
        Insert: {
          action_taken?: string | null
          actioned_at?: string | null
          actioned_by?: string | null
          actual_impact?: number | null
          confidence?: number | null
          contact_id?: string | null
          created_at?: string | null
          crm_contact_id?: string | null
          crm_deal_id?: string | null
          deal_id?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          matter_id?: string | null
          organization_id: string
          outcome?: string | null
          outcome_measured?: boolean | null
          predicted_impact?: number | null
          priority?: string | null
          reasoning?: string | null
          status?: string | null
          suggested_action?: Json | null
          title: string
          type: string
          updated_at?: string | null
          urgency?: number | null
        }
        Update: {
          action_taken?: string | null
          actioned_at?: string | null
          actioned_by?: string | null
          actual_impact?: number | null
          confidence?: number | null
          contact_id?: string | null
          created_at?: string | null
          crm_contact_id?: string | null
          crm_deal_id?: string | null
          deal_id?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          matter_id?: string | null
          organization_id?: string
          outcome?: string | null
          outcome_measured?: boolean | null
          predicted_impact?: number | null
          priority?: string | null
          reasoning?: string | null
          status?: string | null
          suggested_action?: Json | null
          title?: string
          type?: string
          updated_at?: string | null
          urgency?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_ai_recommendations_actioned_by_fkey"
            columns: ["actioned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_ai_recommendations_crm_contact_id_fkey"
            columns: ["crm_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_ai_recommendations_crm_deal_id_fkey"
            columns: ["crm_deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_ai_recommendations_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "crm_ai_recommendations_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_ai_recommendations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_ai_recommendations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_ai_recommendations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_automation_action_types: {
        Row: {
          available_in_plans: string[] | null
          category: string
          code: string
          color: string
          config_schema: Json
          created_at: string | null
          description: string | null
          description_es: string | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          name_es: string
          requires_integration: string | null
          sort_order: number | null
        }
        Insert: {
          available_in_plans?: string[] | null
          category: string
          code: string
          color?: string
          config_schema?: Json
          created_at?: string | null
          description?: string | null
          description_es?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name: string
          name_es: string
          requires_integration?: string | null
          sort_order?: number | null
        }
        Update: {
          available_in_plans?: string[] | null
          category?: string
          code?: string
          color?: string
          config_schema?: Json
          created_at?: string | null
          description?: string | null
          description_es?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          name_es?: string
          requires_integration?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      crm_automation_approvals: {
        Row: {
          approval_type: string
          assigned_role: string | null
          assigned_to: string | null
          context_data: Json
          created_at: string | null
          decided_at: string | null
          decided_by: string | null
          decision_notes: string | null
          description: string | null
          execution_id: string
          expires_at: string | null
          id: string
          on_approve_actions: Json | null
          on_reject_actions: Json | null
          organization_id: string
          status: string | null
          title: string
        }
        Insert: {
          approval_type: string
          assigned_role?: string | null
          assigned_to?: string | null
          context_data: Json
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          description?: string | null
          execution_id: string
          expires_at?: string | null
          id?: string
          on_approve_actions?: Json | null
          on_reject_actions?: Json | null
          organization_id: string
          status?: string | null
          title: string
        }
        Update: {
          approval_type?: string
          assigned_role?: string | null
          assigned_to?: string | null
          context_data?: Json
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          description?: string | null
          execution_id?: string
          expires_at?: string | null
          id?: string
          on_approve_actions?: Json | null
          on_reject_actions?: Json | null
          organization_id?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_automation_approvals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_automation_approvals_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_automation_approvals_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "crm_automation_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_automation_approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_automation_approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_automation_approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_automation_executions: {
        Row: {
          actions_executed: Json | null
          automation_id: string
          completed_at: string | null
          context_data: Json | null
          current_action_index: number | null
          entity_id: string | null
          entity_type: string | null
          error_action_index: number | null
          error_message: string | null
          id: string
          next_action_at: string | null
          organization_id: string
          started_at: string | null
          status: string
          trigger_event: Json
        }
        Insert: {
          actions_executed?: Json | null
          automation_id: string
          completed_at?: string | null
          context_data?: Json | null
          current_action_index?: number | null
          entity_id?: string | null
          entity_type?: string | null
          error_action_index?: number | null
          error_message?: string | null
          id?: string
          next_action_at?: string | null
          organization_id: string
          started_at?: string | null
          status?: string
          trigger_event: Json
        }
        Update: {
          actions_executed?: Json | null
          automation_id?: string
          completed_at?: string | null
          context_data?: Json | null
          current_action_index?: number | null
          entity_id?: string | null
          entity_type?: string | null
          error_action_index?: number | null
          error_message?: string | null
          id?: string
          next_action_at?: string | null
          organization_id?: string
          started_at?: string | null
          status?: string
          trigger_event?: Json
        }
        Relationships: [
          {
            foreignKeyName: "crm_automation_executions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "crm_automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_automation_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_automation_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_automation_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_automation_templates: {
        Row: {
          category: string
          code: string
          color: string | null
          complexity: string | null
          created_at: string | null
          definition: Json
          description: string | null
          description_es: string | null
          estimated_impact: string | null
          icon: string | null
          id: string
          is_system: boolean | null
          name: string
          name_es: string
          recommended_for: string[] | null
          sort_order: number | null
        }
        Insert: {
          category: string
          code: string
          color?: string | null
          complexity?: string | null
          created_at?: string | null
          definition: Json
          description?: string | null
          description_es?: string | null
          estimated_impact?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          name_es: string
          recommended_for?: string[] | null
          sort_order?: number | null
        }
        Update: {
          category?: string
          code?: string
          color?: string | null
          complexity?: string | null
          created_at?: string | null
          definition?: Json
          description?: string | null
          description_es?: string | null
          estimated_impact?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          name_es?: string
          recommended_for?: string[] | null
          sort_order?: number | null
        }
        Relationships: []
      }
      crm_automations: {
        Row: {
          actions: Json
          category: string
          color: string | null
          conditions: Json | null
          cooldown_hours: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          failed_runs: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_paused: boolean | null
          last_run_at: string | null
          max_runs_per_day: number | null
          max_runs_per_entity: number | null
          name: string
          organization_id: string
          successful_runs: number | null
          template_id: string | null
          total_runs: number | null
          trigger_config: Json
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          actions?: Json
          category: string
          color?: string | null
          conditions?: Json | null
          cooldown_hours?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          failed_runs?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_paused?: boolean | null
          last_run_at?: string | null
          max_runs_per_day?: number | null
          max_runs_per_entity?: number | null
          name: string
          organization_id: string
          successful_runs?: number | null
          template_id?: string | null
          total_runs?: number | null
          trigger_config?: Json
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          category?: string
          color?: string | null
          conditions?: Json | null
          cooldown_hours?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          failed_runs?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_paused?: boolean | null
          last_run_at?: string | null
          max_runs_per_day?: number | null
          max_runs_per_entity?: number | null
          name?: string
          organization_id?: string
          successful_runs?: number | null
          template_id?: string | null
          total_runs?: number | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_automations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_automations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_automations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_automations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_automations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "crm_automation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          account_id: string | null
          created_at: string
          email: string | null
          email_opted_in: boolean | null
          email_opted_in_at: string | null
          full_name: string
          id: string
          is_lead: boolean
          last_contacted_at: string | null
          last_contacted_channel: string | null
          lead_score: number
          lead_status: string
          metadata: Json
          organization_id: string
          phone: string | null
          photo_url: string | null
          portal_access_enabled: boolean
          preferred_channel: string | null
          tags: string[]
          updated_at: string
          whatsapp_enabled: boolean
          whatsapp_opted_in: boolean | null
          whatsapp_opted_in_at: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          email?: string | null
          email_opted_in?: boolean | null
          email_opted_in_at?: string | null
          full_name: string
          id?: string
          is_lead?: boolean
          last_contacted_at?: string | null
          last_contacted_channel?: string | null
          lead_score?: number
          lead_status?: string
          metadata?: Json
          organization_id: string
          phone?: string | null
          photo_url?: string | null
          portal_access_enabled?: boolean
          preferred_channel?: string | null
          tags?: string[]
          updated_at?: string
          whatsapp_enabled?: boolean
          whatsapp_opted_in?: boolean | null
          whatsapp_opted_in_at?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string
          email?: string | null
          email_opted_in?: boolean | null
          email_opted_in_at?: string | null
          full_name?: string
          id?: string
          is_lead?: boolean
          last_contacted_at?: string | null
          last_contacted_channel?: string | null
          lead_score?: number
          lead_status?: string
          metadata?: Json
          organization_id?: string
          phone?: string | null
          photo_url?: string | null
          portal_access_enabled?: boolean
          preferred_channel?: string | null
          tags?: string[]
          updated_at?: string
          whatsapp_enabled?: boolean
          whatsapp_opted_in?: boolean | null
          whatsapp_opted_in_at?: string | null
          whatsapp_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_client_360_view"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "crm_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          account_id: string | null
          actual_close_date: string | null
          amount: number | null
          close_reason: string | null
          contact_id: string | null
          created_at: string
          expected_close_date: string | null
          id: string
          lost_to_competitor: string | null
          matter_id: string | null
          metadata: Json
          name: string
          opportunity_type: string | null
          organization_id: string
          owner_id: string | null
          patent_title: string | null
          pipeline_id: string | null
          renewal_date: string | null
          service_type: string | null
          stage: string
          stage_entered_at: string
          stage_history: Json
          stage_id: string | null
          territory: string | null
          trademark_name: string | null
          updated_at: string
          weighted_amount: number | null
        }
        Insert: {
          account_id?: string | null
          actual_close_date?: string | null
          amount?: number | null
          close_reason?: string | null
          contact_id?: string | null
          created_at?: string
          expected_close_date?: string | null
          id?: string
          lost_to_competitor?: string | null
          matter_id?: string | null
          metadata?: Json
          name: string
          opportunity_type?: string | null
          organization_id: string
          owner_id?: string | null
          patent_title?: string | null
          pipeline_id?: string | null
          renewal_date?: string | null
          service_type?: string | null
          stage?: string
          stage_entered_at?: string
          stage_history?: Json
          stage_id?: string | null
          territory?: string | null
          trademark_name?: string | null
          updated_at?: string
          weighted_amount?: number | null
        }
        Update: {
          account_id?: string | null
          actual_close_date?: string | null
          amount?: number | null
          close_reason?: string | null
          contact_id?: string | null
          created_at?: string
          expected_close_date?: string | null
          id?: string
          lost_to_competitor?: string | null
          matter_id?: string | null
          metadata?: Json
          name?: string
          opportunity_type?: string | null
          organization_id?: string
          owner_id?: string | null
          patent_title?: string | null
          pipeline_id?: string | null
          renewal_date?: string | null
          service_type?: string | null
          stage?: string
          stage_entered_at?: string
          stage_history?: Json
          stage_id?: string | null
          territory?: string | null
          trademark_name?: string | null
          updated_at?: string
          weighted_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_client_360_view"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "crm_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_crm_pipeline_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "crm_pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_crm_stage_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "crm_pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "crm_deals_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          category: string | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          from_email: string | null
          from_name: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          last_used_at: string | null
          metadata: Json | null
          name: string
          organization_id: string
          reply_to: string | null
          subject: string
          updated_at: string | null
          usage_count: number | null
          variables: Json | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          category?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          name: string
          organization_id: string
          reply_to?: string | null
          subject: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          category?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          name?: string
          organization_id?: string
          reply_to?: string | null
          subject?: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_email_tracking: {
        Row: {
          bcc_emails: string[] | null
          body_preview: string | null
          bounce_type: string | null
          cc_emails: string[] | null
          clicked_links: Json | null
          contact_id: string | null
          created_at: string | null
          deal_id: string | null
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          first_clicked_at: string | null
          first_opened_at: string | null
          from_email: string
          from_name: string | null
          id: string
          interaction_id: string | null
          last_opened_at: string | null
          metadata: Json | null
          opened_count: number | null
          organization_id: string
          provider: string | null
          provider_message_id: string | null
          reply_to: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_code: string | null
          to_email: string
          to_name: string | null
          updated_at: string | null
        }
        Insert: {
          bcc_emails?: string[] | null
          body_preview?: string | null
          bounce_type?: string | null
          cc_emails?: string[] | null
          clicked_links?: Json | null
          contact_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          first_clicked_at?: string | null
          first_opened_at?: string | null
          from_email: string
          from_name?: string | null
          id?: string
          interaction_id?: string | null
          last_opened_at?: string | null
          metadata?: Json | null
          opened_count?: number | null
          organization_id: string
          provider?: string | null
          provider_message_id?: string | null
          reply_to?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_code?: string | null
          to_email: string
          to_name?: string | null
          updated_at?: string | null
        }
        Update: {
          bcc_emails?: string[] | null
          body_preview?: string | null
          bounce_type?: string | null
          cc_emails?: string[] | null
          clicked_links?: Json | null
          contact_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          first_clicked_at?: string | null
          first_opened_at?: string | null
          from_email?: string
          from_name?: string | null
          id?: string
          interaction_id?: string | null
          last_opened_at?: string | null
          metadata?: Json | null
          opened_count?: number | null
          organization_id?: string
          provider?: string | null
          provider_message_id?: string | null
          reply_to?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_code?: string | null
          to_email?: string
          to_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_email_tracking_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_email_tracking_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_email_tracking_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "crm_interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_email_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_email_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_email_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_interactions: {
        Row: {
          account_id: string | null
          ai_suggested_response: string | null
          assigned_to: string | null
          channel: string
          contact_id: string | null
          content: string | null
          created_at: string
          direction: string | null
          id: string
          metadata: Json
          organization_id: string
          status: string | null
          subject: string | null
        }
        Insert: {
          account_id?: string | null
          ai_suggested_response?: string | null
          assigned_to?: string | null
          channel?: string
          contact_id?: string | null
          content?: string | null
          created_at?: string
          direction?: string | null
          id?: string
          metadata?: Json
          organization_id: string
          status?: string | null
          subject?: string | null
        }
        Update: {
          account_id?: string | null
          ai_suggested_response?: string | null
          assigned_to?: string | null
          channel?: string
          contact_id?: string | null
          content?: string | null
          created_at?: string
          direction?: string | null
          id?: string
          metadata?: Json
          organization_id?: string
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_client_360_view"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "crm_interactions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_lead_events: {
        Row: {
          contact_id: string
          created_at: string | null
          crm_contact_id: string | null
          decay_days: number | null
          event_data: Json | null
          event_type: string
          expires_at: string | null
          id: string
          occurred_at: string | null
          organization_id: string
          score_impact: number
          source: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          crm_contact_id?: string | null
          decay_days?: number | null
          event_data?: Json | null
          event_type: string
          expires_at?: string | null
          id?: string
          occurred_at?: string | null
          organization_id: string
          score_impact: number
          source?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          crm_contact_id?: string | null
          decay_days?: number | null
          event_data?: Json | null
          event_type?: string
          expires_at?: string | null
          id?: string
          occurred_at?: string | null
          organization_id?: string
          score_impact?: number
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_lead_events_crm_contact_id_fkey"
            columns: ["crm_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_lead_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_lead_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_lead_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_message_templates: {
        Row: {
          available_variables: Json | null
          category: string | null
          channel: string
          code: string | null
          created_at: string | null
          created_by: string | null
          email_body_html: string | null
          email_body_text: string | null
          email_subject: string | null
          id: string
          is_system: boolean | null
          name: string
          notification_action_url: string | null
          notification_body: string | null
          notification_title: string | null
          organization_id: string
          sms_body: string | null
          updated_at: string | null
          usage_count: number | null
          whatsapp_components: Json | null
          whatsapp_language: string | null
          whatsapp_status: string | null
          whatsapp_template_id: string | null
          whatsapp_template_name: string | null
        }
        Insert: {
          available_variables?: Json | null
          category?: string | null
          channel: string
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          email_body_html?: string | null
          email_body_text?: string | null
          email_subject?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          notification_action_url?: string | null
          notification_body?: string | null
          notification_title?: string | null
          organization_id: string
          sms_body?: string | null
          updated_at?: string | null
          usage_count?: number | null
          whatsapp_components?: Json | null
          whatsapp_language?: string | null
          whatsapp_status?: string | null
          whatsapp_template_id?: string | null
          whatsapp_template_name?: string | null
        }
        Update: {
          available_variables?: Json | null
          category?: string | null
          channel?: string
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          email_body_html?: string | null
          email_body_text?: string | null
          email_subject?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          notification_action_url?: string | null
          notification_body?: string | null
          notification_title?: string | null
          organization_id?: string
          sms_body?: string | null
          updated_at?: string | null
          usage_count?: number | null
          whatsapp_components?: Json | null
          whatsapp_language?: string | null
          whatsapp_status?: string | null
          whatsapp_template_id?: string | null
          whatsapp_template_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_message_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_message_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_message_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_message_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_pipeline_stages: {
        Row: {
          auto_actions: Json | null
          code: string
          color: string | null
          created_at: string | null
          creates_matter: boolean | null
          expected_days: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_lost: boolean | null
          is_won: boolean | null
          name: string
          name_es: string | null
          pipeline_id: string
          probability: number | null
          requires_amount: boolean | null
          requires_close_date: boolean | null
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          auto_actions?: Json | null
          code: string
          color?: string | null
          created_at?: string | null
          creates_matter?: boolean | null
          expected_days?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_lost?: boolean | null
          is_won?: boolean | null
          name: string
          name_es?: string | null
          pipeline_id: string
          probability?: number | null
          requires_amount?: boolean | null
          requires_close_date?: boolean | null
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          auto_actions?: Json | null
          code?: string
          color?: string | null
          created_at?: string | null
          creates_matter?: boolean | null
          expected_days?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_lost?: boolean | null
          is_won?: boolean | null
          name?: string
          name_es?: string | null
          pipeline_id?: string
          probability?: number | null
          requires_amount?: boolean | null
          requires_close_date?: boolean | null
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "crm_pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_pipeline_template_audit: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          metadata: Json
          template_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          template_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_pipeline_template_audit_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "crm_pipeline_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_pipeline_templates: {
        Row: {
          auto_trigger_pipeline: string | null
          category: string | null
          code: string
          color: string | null
          created_at: string
          default_stages: Json
          description_es: string | null
          icon: string | null
          id: string
          is_active: boolean
          is_system: boolean
          name_es: string
          pipeline_type: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          auto_trigger_pipeline?: string | null
          category?: string | null
          code: string
          color?: string | null
          created_at?: string
          default_stages?: Json
          description_es?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name_es: string
          pipeline_type?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          auto_trigger_pipeline?: string | null
          category?: string | null
          code?: string
          color?: string | null
          created_at?: string
          default_stages?: Json
          description_es?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name_es?: string
          pipeline_type?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      crm_pipelines: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          name_es: string | null
          organization_id: string
          pipeline_type: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          name_es?: string | null
          organization_id: string
          pipeline_type?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          name_es?: string | null
          organization_id?: string
          pipeline_type?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_pipelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_pipelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_pipelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          account_id: string | null
          assigned_to: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json
          organization_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json
          organization_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json
          organization_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_client_360_view"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "crm_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_whatsapp_messages: {
        Row: {
          contact_id: string | null
          content: string | null
          created_at: string | null
          delivered_at: string | null
          direction: string
          error_code: string | null
          error_message: string | null
          from_phone: string
          id: string
          interaction_id: string | null
          media_caption: string | null
          media_filename: string | null
          media_id: string | null
          media_mime_type: string | null
          media_url: string | null
          message_type: string
          metadata: Json | null
          organization_id: string
          read_at: string | null
          sent_at: string | null
          status: string | null
          template_components: Json | null
          template_language: string | null
          template_name: string | null
          template_namespace: string | null
          to_phone: string
          updated_at: string | null
          wa_conversation_id: string | null
          wa_message_id: string | null
          wa_phone_number_id: string | null
        }
        Insert: {
          contact_id?: string | null
          content?: string | null
          created_at?: string | null
          delivered_at?: string | null
          direction: string
          error_code?: string | null
          error_message?: string | null
          from_phone: string
          id?: string
          interaction_id?: string | null
          media_caption?: string | null
          media_filename?: string | null
          media_id?: string | null
          media_mime_type?: string | null
          media_url?: string | null
          message_type?: string
          metadata?: Json | null
          organization_id: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          template_components?: Json | null
          template_language?: string | null
          template_name?: string | null
          template_namespace?: string | null
          to_phone: string
          updated_at?: string | null
          wa_conversation_id?: string | null
          wa_message_id?: string | null
          wa_phone_number_id?: string | null
        }
        Update: {
          contact_id?: string | null
          content?: string | null
          created_at?: string | null
          delivered_at?: string | null
          direction?: string
          error_code?: string | null
          error_message?: string | null
          from_phone?: string
          id?: string
          interaction_id?: string | null
          media_caption?: string | null
          media_filename?: string | null
          media_id?: string | null
          media_mime_type?: string | null
          media_url?: string | null
          message_type?: string
          metadata?: Json | null
          organization_id?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          template_components?: Json | null
          template_language?: string | null
          template_name?: string | null
          template_namespace?: string | null
          to_phone?: string
          updated_at?: string | null
          wa_conversation_id?: string | null
          wa_message_id?: string | null
          wa_phone_number_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_whatsapp_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_whatsapp_messages_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "crm_interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_whatsapp_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_whatsapp_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_whatsapp_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_whatsapp_templates: {
        Row: {
          approved_at: string | null
          body_example: string | null
          body_text: string
          buttons: Json | null
          category: string | null
          code: string
          created_at: string | null
          footer_text: string | null
          header_example: string | null
          header_text: string | null
          header_type: string | null
          id: string
          language: string | null
          metadata: Json | null
          name: string
          organization_id: string
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          variables: Json | null
          wa_namespace: string | null
          wa_template_id: string | null
          wa_template_name: string
        }
        Insert: {
          approved_at?: string | null
          body_example?: string | null
          body_text: string
          buttons?: Json | null
          category?: string | null
          code: string
          created_at?: string | null
          footer_text?: string | null
          header_example?: string | null
          header_text?: string | null
          header_type?: string | null
          id?: string
          language?: string | null
          metadata?: Json | null
          name: string
          organization_id: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          variables?: Json | null
          wa_namespace?: string | null
          wa_template_id?: string | null
          wa_template_name: string
        }
        Update: {
          approved_at?: string | null
          body_example?: string | null
          body_text?: string
          buttons?: Json | null
          category?: string | null
          code?: string
          created_at?: string | null
          footer_text?: string | null
          header_example?: string | null
          header_text?: string | null
          header_type?: string | null
          id?: string
          language?: string | null
          metadata?: Json | null
          name?: string
          organization_id?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          variables?: Json | null
          wa_namespace?: string | null
          wa_template_id?: string | null
          wa_template_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_whatsapp_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_whatsapp_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_whatsapp_templates_organization_id_fkey"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_connectors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "data_connectors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_exports: {
        Row: {
          completed_at: string | null
          config: Json
          created_at: string | null
          current_step: string | null
          error_message: string | null
          export_type: string
          file_expires_at: string | null
          file_size_bytes: number | null
          file_url: string | null
          id: string
          organization_id: string
          progress: number | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          config?: Json
          created_at?: string | null
          current_step?: string | null
          error_message?: string | null
          export_type: string
          file_expires_at?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          organization_id: string
          progress?: number | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          config?: Json
          created_at?: string | null
          current_step?: string | null
          error_message?: string | null
          export_type?: string
          file_expires_at?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          organization_id?: string
          progress?: number | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_exports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_exports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "data_exports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_imports: {
        Row: {
          column_mapping: Json | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          data_type: string
          id: string
          import_results: Json | null
          options: Json | null
          organization_id: string
          source_file_id: string | null
          source_file_name: string | null
          source_type: string
          started_at: string | null
          status: string | null
          validated_at: string | null
          validation_results: Json | null
        }
        Insert: {
          column_mapping?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          data_type: string
          id?: string
          import_results?: Json | null
          options?: Json | null
          organization_id: string
          source_file_id?: string | null
          source_file_name?: string | null
          source_type: string
          started_at?: string | null
          status?: string | null
          validated_at?: string | null
          validation_results?: Json | null
        }
        Update: {
          column_mapping?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          data_type?: string
          id?: string
          import_results?: Json | null
          options?: Json | null
          organization_id?: string
          source_file_id?: string | null
          source_file_name?: string | null
          source_type?: string
          started_at?: string | null
          status?: string | null
          validated_at?: string | null
          validation_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "data_imports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_imports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "data_imports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_retention_policies: {
        Row: {
          archive_after_days: number | null
          created_at: string | null
          data_type: string
          delete_after_days: number | null
          exceptions: Json | null
          id: string
          is_active: boolean | null
          last_execution_at: string | null
          organization_id: string
          retention_days: number
          updated_at: string | null
        }
        Insert: {
          archive_after_days?: number | null
          created_at?: string | null
          data_type: string
          delete_after_days?: number | null
          exceptions?: Json | null
          id?: string
          is_active?: boolean | null
          last_execution_at?: string | null
          organization_id: string
          retention_days: number
          updated_at?: string | null
        }
        Update: {
          archive_after_days?: number | null
          created_at?: string | null
          data_type?: string
          delete_after_days?: number | null
          exceptions?: Json | null
          id?: string
          is_active?: boolean | null
          last_execution_at?: string | null
          organization_id?: string
          retention_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_retention_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_retention_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "data_retention_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      deadline_alerts: {
        Row: {
          alert_type: string
          body: string | null
          channel: string
          created_at: string | null
          deadline_id: string
          delivered_at: string | null
          error_message: string | null
          id: string
          organization_id: string
          read_at: string | null
          recipient_email: string | null
          recipient_id: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          alert_type: string
          body?: string | null
          channel: string
          created_at?: string | null
          deadline_id: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          organization_id: string
          read_at?: string | null
          recipient_email?: string | null
          recipient_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          alert_type?: string
          body?: string | null
          channel?: string
          created_at?: string | null
          deadline_id?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          organization_id?: string
          read_at?: string | null
          recipient_email?: string | null
          recipient_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deadline_alerts_deadline_id_fkey"
            columns: ["deadline_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["deadline_id"]
          },
          {
            foreignKeyName: "deadline_alerts_deadline_id_fkey"
            columns: ["deadline_id"]
            isOneToOne: false
            referencedRelation: "matter_deadlines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadline_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadline_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "deadline_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadline_alerts_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deadline_rules: {
        Row: {
          alert_days: number[] | null
          auto_create_task: boolean | null
          calendar_type: string | null
          code: string
          conditions: Json | null
          created_at: string | null
          creates_deadline: boolean | null
          days_from_event: number
          deadline_type: string | null
          description: string | null
          event_type: string
          id: string
          is_active: boolean | null
          jurisdiction: string
          matter_type: string
          name: string
          notes: string | null
          priority: string | null
          source: string | null
          task_template_id: string | null
          updated_at: string | null
        }
        Insert: {
          alert_days?: number[] | null
          auto_create_task?: boolean | null
          calendar_type?: string | null
          code: string
          conditions?: Json | null
          created_at?: string | null
          creates_deadline?: boolean | null
          days_from_event: number
          deadline_type?: string | null
          description?: string | null
          event_type: string
          id?: string
          is_active?: boolean | null
          jurisdiction: string
          matter_type: string
          name: string
          notes?: string | null
          priority?: string | null
          source?: string | null
          task_template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          alert_days?: number[] | null
          auto_create_task?: boolean | null
          calendar_type?: string | null
          code?: string
          conditions?: Json | null
          created_at?: string | null
          creates_deadline?: boolean | null
          days_from_event?: number
          deadline_type?: string | null
          description?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          jurisdiction?: string
          matter_type?: string
          name?: string
          notes?: string | null
          priority?: string | null
          source?: string | null
          task_template_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          search_vector: unknown
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
          search_vector?: unknown
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
          search_vector?: unknown
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      demo_seed_entities: {
        Row: {
          created_at: string
          id: string
          row_id: string
          run_id: string
          table_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          row_id: string
          run_id: string
          table_name: string
        }
        Update: {
          created_at?: string
          id?: string
          row_id?: string
          run_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_seed_entities_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "demo_seed_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_seed_runs: {
        Row: {
          created_at: string
          created_by: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          organization_id: string
          seed_version: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          organization_id: string
          seed_version?: string
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          organization_id?: string
          seed_version?: string
          status?: string
        }
        Relationships: []
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "document_chunks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_embeddings: {
        Row: {
          chunk_index: number | null
          chunk_text: string
          chunk_tokens: number | null
          client_id: string | null
          created_at: string | null
          doc_type: string | null
          embedding: string | null
          id: string
          matter_id: string | null
          organization_id: string
          source_id: string
          source_type: string
        }
        Insert: {
          chunk_index?: number | null
          chunk_text: string
          chunk_tokens?: number | null
          client_id?: string | null
          created_at?: string | null
          doc_type?: string | null
          embedding?: string | null
          id?: string
          matter_id?: string | null
          organization_id: string
          source_id: string
          source_type: string
        }
        Update: {
          chunk_index?: number | null
          chunk_text?: string
          chunk_tokens?: number | null
          client_id?: string | null
          created_at?: string | null
          doc_type?: string | null
          embedding?: string | null
          id?: string
          matter_id?: string | null
          organization_id?: string
          source_id?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_embeddings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_embeddings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "document_embeddings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_entities: {
        Row: {
          bounding_box: Json | null
          confidence: number | null
          confidence_level:
            | Database["public"]["Enums"]["ai_confidence_level"]
            | null
          created_at: string | null
          document_id: string
          entity_normalized: string | null
          entity_type: Database["public"]["Enums"]["ner_entity_type"]
          entity_value: string
          id: string
          is_verified: boolean | null
          linked_contact_id: string | null
          linked_matter_id: string | null
          organization_id: string
          page_number: number | null
          surrounding_text: string | null
          text_offset_end: number | null
          text_offset_start: number | null
          verified_at: string | null
          verified_by: string | null
          verified_value: string | null
        }
        Insert: {
          bounding_box?: Json | null
          confidence?: number | null
          confidence_level?:
            | Database["public"]["Enums"]["ai_confidence_level"]
            | null
          created_at?: string | null
          document_id: string
          entity_normalized?: string | null
          entity_type: Database["public"]["Enums"]["ner_entity_type"]
          entity_value: string
          id?: string
          is_verified?: boolean | null
          linked_contact_id?: string | null
          linked_matter_id?: string | null
          organization_id: string
          page_number?: number | null
          surrounding_text?: string | null
          text_offset_end?: number | null
          text_offset_start?: number | null
          verified_at?: string | null
          verified_by?: string | null
          verified_value?: string | null
        }
        Update: {
          bounding_box?: Json | null
          confidence?: number | null
          confidence_level?:
            | Database["public"]["Enums"]["ai_confidence_level"]
            | null
          created_at?: string | null
          document_id?: string
          entity_normalized?: string | null
          entity_type?: Database["public"]["Enums"]["ner_entity_type"]
          entity_value?: string
          id?: string
          is_verified?: boolean | null
          linked_contact_id?: string | null
          linked_matter_id?: string | null
          organization_id?: string
          page_number?: number | null
          surrounding_text?: string | null
          text_offset_end?: number | null
          text_offset_start?: number | null
          verified_at?: string | null
          verified_by?: string | null
          verified_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_entities_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "client_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_entities_linked_contact_id_fkey"
            columns: ["linked_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_entities_linked_matter_id_fkey"
            columns: ["linked_matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "document_entities_linked_matter_id_fkey"
            columns: ["linked_matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_entities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_entities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "document_entities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          ai_max_tokens: number | null
          ai_model: string | null
          ai_system_prompt: string | null
          ai_temperature: number | null
          ai_user_prompt_template: string | null
          average_rating: number | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string
          organization_id: string | null
          output_format: string | null
          tags: string[] | null
          template_content: string
          template_type: string | null
          updated_at: string | null
          usage_count: number | null
          variables: Json | null
        }
        Insert: {
          ai_max_tokens?: number | null
          ai_model?: string | null
          ai_system_prompt?: string | null
          ai_temperature?: number | null
          ai_user_prompt_template?: string | null
          average_rating?: number | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name: string
          organization_id?: string | null
          output_format?: string | null
          tags?: string[] | null
          template_content: string
          template_type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Update: {
          ai_max_tokens?: number | null
          ai_model?: string | null
          ai_system_prompt?: string | null
          ai_temperature?: number | null
          ai_user_prompt_template?: string | null
          average_rating?: number | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string
          organization_id?: string | null
          output_format?: string | null
          tags?: string[] | null
          template_content?: string
          template_type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "document_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_validity_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          days_until_expiry: number | null
          document_id: string
          expiry_date: string
          id: string
          notifications_sent: Json | null
          organization_id: string
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          days_until_expiry?: number | null
          document_id: string
          expiry_date: string
          id?: string
          notifications_sent?: Json | null
          organization_id: string
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          days_until_expiry?: number | null
          document_id?: string
          expiry_date?: string
          id?: string
          notifications_sent?: Json | null
          organization_id?: string
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_validity_alerts_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "client_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_validity_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_validity_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "document_validity_alerts_organization_id_fkey"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      email_ingestion_queue: {
        Row: {
          attachments: Json | null
          body_html: string | null
          body_text: string | null
          created_at: string | null
          created_tasks: string[] | null
          error_message: string | null
          extracted_data: Json | null
          from_address: string | null
          id: string
          matched_matter_id: string | null
          message_id: string | null
          organization_id: string
          processing_completed_at: string | null
          processing_started_at: string | null
          retry_count: number | null
          source: string
          status: string | null
          subject: string | null
          to_addresses: string[] | null
        }
        Insert: {
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          created_tasks?: string[] | null
          error_message?: string | null
          extracted_data?: Json | null
          from_address?: string | null
          id?: string
          matched_matter_id?: string | null
          message_id?: string | null
          organization_id: string
          processing_completed_at?: string | null
          processing_started_at?: string | null
          retry_count?: number | null
          source: string
          status?: string | null
          subject?: string | null
          to_addresses?: string[] | null
        }
        Update: {
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          created_tasks?: string[] | null
          error_message?: string | null
          extracted_data?: Json | null
          from_address?: string | null
          id?: string
          matched_matter_id?: string | null
          message_id?: string | null
          organization_id?: string
          processing_completed_at?: string | null
          processing_started_at?: string | null
          retry_count?: number | null
          source?: string
          status?: string | null
          subject?: string | null
          to_addresses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "email_ingestion_queue_matched_matter_id_fkey"
            columns: ["matched_matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "email_ingestion_queue_matched_matter_id_fkey"
            columns: ["matched_matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_ingestion_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_ingestion_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "email_ingestion_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          slug: string | null
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
          slug?: string | null
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
          slug?: string | null
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_unsubscribes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      filing_applications: {
        Row: {
          applicant_data: Json
          applicant_id: string | null
          application_data: Json
          created_at: string | null
          created_by: string | null
          deadline_payment: string | null
          deadline_submission: string | null
          documents: Json | null
          fees_calculated: Json | null
          fees_paid: boolean | null
          filing_type: string
          id: string
          ip_type: string
          last_submission_at: string | null
          matter_id: string | null
          office_code: string
          office_id: string
          official_filing_date: string | null
          official_filing_number: string | null
          official_receipt_url: string | null
          organization_id: string
          payment_date: string | null
          payment_reference: string | null
          power_of_attorney_id: string | null
          priority_claims: Json | null
          representative_data: Json | null
          representative_id: string | null
          status: string
          submission_attempts: number | null
          submission_method: string | null
          submission_response: Json | null
          submitted_at: string | null
          submitted_by: string | null
          tracking_number: string | null
          updated_at: string | null
          validated_at: string | null
          validation_errors: Json | null
          validation_status: string | null
          validation_warnings: Json | null
        }
        Insert: {
          applicant_data?: Json
          applicant_id?: string | null
          application_data?: Json
          created_at?: string | null
          created_by?: string | null
          deadline_payment?: string | null
          deadline_submission?: string | null
          documents?: Json | null
          fees_calculated?: Json | null
          fees_paid?: boolean | null
          filing_type: string
          id?: string
          ip_type: string
          last_submission_at?: string | null
          matter_id?: string | null
          office_code: string
          office_id: string
          official_filing_date?: string | null
          official_filing_number?: string | null
          official_receipt_url?: string | null
          organization_id: string
          payment_date?: string | null
          payment_reference?: string | null
          power_of_attorney_id?: string | null
          priority_claims?: Json | null
          representative_data?: Json | null
          representative_id?: string | null
          status?: string
          submission_attempts?: number | null
          submission_method?: string | null
          submission_response?: Json | null
          submitted_at?: string | null
          submitted_by?: string | null
          tracking_number?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validation_errors?: Json | null
          validation_status?: string | null
          validation_warnings?: Json | null
        }
        Update: {
          applicant_data?: Json
          applicant_id?: string | null
          application_data?: Json
          created_at?: string | null
          created_by?: string | null
          deadline_payment?: string | null
          deadline_submission?: string | null
          documents?: Json | null
          fees_calculated?: Json | null
          fees_paid?: boolean | null
          filing_type?: string
          id?: string
          ip_type?: string
          last_submission_at?: string | null
          matter_id?: string | null
          office_code?: string
          office_id?: string
          official_filing_date?: string | null
          official_filing_number?: string | null
          official_receipt_url?: string | null
          organization_id?: string
          payment_date?: string | null
          payment_reference?: string | null
          power_of_attorney_id?: string | null
          priority_claims?: Json | null
          representative_data?: Json | null
          representative_id?: string | null
          status?: string
          submission_attempts?: number | null
          submission_method?: string | null
          submission_response?: Json | null
          submitted_at?: string | null
          submitted_by?: string | null
          tracking_number?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validation_errors?: Json | null
          validation_status?: string | null
          validation_warnings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "filing_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_applications_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "filing_applications_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_applications_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_applications_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "filing_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_applications_power_of_attorney_id_fkey"
            columns: ["power_of_attorney_id"]
            isOneToOne: false
            referencedRelation: "matter_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_applications_representative_id_fkey"
            columns: ["representative_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      filing_communication_logs: {
        Row: {
          comm_type: string
          direction: string
          endpoint: string | null
          error_code: string | null
          error_message: string | null
          filing_id: string
          id: string
          ip_address: string | null
          method: string | null
          request_body: string | null
          request_headers: Json | null
          response_body: string | null
          response_headers: Json | null
          response_status: number | null
          response_time_ms: number | null
          sent_at: string | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          comm_type: string
          direction: string
          endpoint?: string | null
          error_code?: string | null
          error_message?: string | null
          filing_id: string
          id?: string
          ip_address?: string | null
          method?: string | null
          request_body?: string | null
          request_headers?: Json | null
          response_body?: string | null
          response_headers?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          sent_at?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          comm_type?: string
          direction?: string
          endpoint?: string | null
          error_code?: string | null
          error_message?: string | null
          filing_id?: string
          id?: string
          ip_address?: string | null
          method?: string | null
          request_body?: string | null
          request_headers?: Json | null
          response_body?: string | null
          response_headers?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          sent_at?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "filing_communication_logs_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filing_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      filing_drafts: {
        Row: {
          auto_saved_at: string | null
          converted_to_filing_id: string | null
          current_step: number | null
          expires_at: string | null
          filing_type: string
          id: string
          ip_type: string
          office_id: string | null
          organization_id: string
          user_id: string
          wizard_data: Json
        }
        Insert: {
          auto_saved_at?: string | null
          converted_to_filing_id?: string | null
          current_step?: number | null
          expires_at?: string | null
          filing_type: string
          id?: string
          ip_type: string
          office_id?: string | null
          organization_id: string
          user_id: string
          wizard_data?: Json
        }
        Update: {
          auto_saved_at?: string | null
          converted_to_filing_id?: string | null
          current_step?: number | null
          expires_at?: string | null
          filing_type?: string
          id?: string
          ip_type?: string
          office_id?: string | null
          organization_id?: string
          user_id?: string
          wizard_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "filing_drafts_converted_to_filing_id_fkey"
            columns: ["converted_to_filing_id"]
            isOneToOne: false
            referencedRelation: "filing_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_drafts_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_drafts_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_drafts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_drafts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "filing_drafts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      filing_status_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          filing_id: string
          id: string
          metadata: Json | null
          notes: string | null
          status_from: string | null
          status_to: string
          system_message: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          filing_id: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          status_from?: string | null
          status_to: string
          system_message?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          filing_id?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          status_from?: string | null
          status_to?: string
          system_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "filing_status_history_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filing_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      filing_submission_queue: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          filing_id: string
          id: string
          last_attempt_at: string | null
          last_error: string | null
          locked_at: string | null
          max_attempts: number | null
          next_attempt_at: string | null
          priority: number | null
          status: string | null
          worker_id: string | null
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          filing_id: string
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          locked_at?: string | null
          max_attempts?: number | null
          next_attempt_at?: string | null
          priority?: number | null
          status?: string | null
          worker_id?: string | null
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          filing_id?: string
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          locked_at?: string | null
          max_attempts?: number | null
          next_attempt_at?: string | null
          priority?: number | null
          status?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "filing_submission_queue_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filing_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      filing_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          filing_type: string
          id: string
          ip_type: string
          is_active: boolean | null
          last_used_at: string | null
          name: string
          office_id: string | null
          organization_id: string | null
          template_data: Json
          use_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filing_type: string
          id?: string
          ip_type: string
          is_active?: boolean | null
          last_used_at?: string | null
          name: string
          office_id?: string | null
          organization_id?: string | null
          template_data?: Json
          use_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filing_type?: string
          id?: string
          ip_type?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name?: string
          office_id?: string | null
          organization_id?: string | null
          template_data?: Json
          use_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "filing_templates_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_templates_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "filing_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      filing_trademark_data: {
        Row: {
          collective_mark_regulations_id: string | null
          color_description: string | null
          colors_claimed: string[] | null
          created_at: string | null
          disclaimer: string | null
          filing_id: string
          filing_language: string | null
          goods_services: Json
          id: string
          is_certification_mark: boolean | null
          is_collective_mark: boolean | null
          is_color_claimed: boolean | null
          mark_description: string | null
          mark_image_colors: string | null
          mark_image_file_id: string | null
          mark_image_format: string | null
          mark_sound_file_id: string | null
          mark_text: string | null
          mark_type: string
          mark_video_file_id: string | null
          nice_classes: number[]
          second_language: string | null
          translation: string | null
          transliteration: string | null
          vienna_codes: string[] | null
        }
        Insert: {
          collective_mark_regulations_id?: string | null
          color_description?: string | null
          colors_claimed?: string[] | null
          created_at?: string | null
          disclaimer?: string | null
          filing_id: string
          filing_language?: string | null
          goods_services?: Json
          id?: string
          is_certification_mark?: boolean | null
          is_collective_mark?: boolean | null
          is_color_claimed?: boolean | null
          mark_description?: string | null
          mark_image_colors?: string | null
          mark_image_file_id?: string | null
          mark_image_format?: string | null
          mark_sound_file_id?: string | null
          mark_text?: string | null
          mark_type: string
          mark_video_file_id?: string | null
          nice_classes?: number[]
          second_language?: string | null
          translation?: string | null
          transliteration?: string | null
          vienna_codes?: string[] | null
        }
        Update: {
          collective_mark_regulations_id?: string | null
          color_description?: string | null
          colors_claimed?: string[] | null
          created_at?: string | null
          disclaimer?: string | null
          filing_id?: string
          filing_language?: string | null
          goods_services?: Json
          id?: string
          is_certification_mark?: boolean | null
          is_collective_mark?: boolean | null
          is_color_claimed?: boolean | null
          mark_description?: string | null
          mark_image_colors?: string | null
          mark_image_file_id?: string | null
          mark_image_format?: string | null
          mark_sound_file_id?: string | null
          mark_text?: string | null
          mark_type?: string
          mark_video_file_id?: string | null
          nice_classes?: number[]
          second_language?: string | null
          translation?: string | null
          transliteration?: string | null
          vienna_codes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "filing_trademark_data_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filing_applications"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_portfolios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_valuations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      gdpr_requests: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string
          export_file_expires_at: string | null
          export_file_url: string | null
          extended_until: string | null
          extension_reason: string | null
          id: string
          identity_verified: boolean | null
          identity_verified_at: string | null
          identity_verified_by: string | null
          organization_id: string
          request_type: string
          requester_email: string
          requester_name: string | null
          requester_user_id: string | null
          resolution_notes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          export_file_expires_at?: string | null
          export_file_url?: string | null
          extended_until?: string | null
          extension_reason?: string | null
          id?: string
          identity_verified?: boolean | null
          identity_verified_at?: string | null
          identity_verified_by?: string | null
          organization_id: string
          request_type: string
          requester_email: string
          requester_name?: string | null
          requester_user_id?: string | null
          resolution_notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          export_file_expires_at?: string | null
          export_file_url?: string | null
          extended_until?: string | null
          extension_reason?: string | null
          id?: string
          identity_verified?: boolean | null
          identity_verified_at?: string | null
          identity_verified_by?: string | null
          organization_id?: string
          request_type?: string
          requester_email?: string
          requester_name?: string | null
          requester_user_id?: string | null
          resolution_notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gdpr_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gdpr_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "gdpr_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_documents: {
        Row: {
          ai_model_used: string | null
          ai_prompt_used: string | null
          ai_tokens_used: number | null
          content: string
          created_at: string | null
          created_by: string | null
          export_format: string | null
          exported_at: string | null
          exported_document_id: string | null
          generation_time_ms: number | null
          id: string
          matter_id: string | null
          name: string
          organization_id: string
          parent_id: string | null
          status: string | null
          template_id: string | null
          updated_at: string | null
          user_feedback: string | null
          user_rating: number | null
          variables_input: Json | null
          variables_resolved: Json | null
          version: number | null
        }
        Insert: {
          ai_model_used?: string | null
          ai_prompt_used?: string | null
          ai_tokens_used?: number | null
          content: string
          created_at?: string | null
          created_by?: string | null
          export_format?: string | null
          exported_at?: string | null
          exported_document_id?: string | null
          generation_time_ms?: number | null
          id?: string
          matter_id?: string | null
          name: string
          organization_id: string
          parent_id?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_feedback?: string | null
          user_rating?: number | null
          variables_input?: Json | null
          variables_resolved?: Json | null
          version?: number | null
        }
        Update: {
          ai_model_used?: string | null
          ai_prompt_used?: string | null
          ai_tokens_used?: number | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          export_format?: string | null
          exported_at?: string | null
          exported_document_id?: string | null
          generation_time_ms?: number | null
          id?: string
          matter_id?: string | null
          name?: string
          organization_id?: string
          parent_id?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_feedback?: string | null
          user_rating?: number | null
          variables_input?: Json | null
          variables_resolved?: Json | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_exported_document_id_fkey"
            columns: ["exported_document_id"]
            isOneToOne: false
            referencedRelation: "matter_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "generated_documents_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "generated_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "generated_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genius_generated_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genius_trademark_comparisons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "genius_trademark_comparisons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      help_announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "help_announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      help_announcements: {
        Row: {
          affected_modules: string[] | null
          announcement_type: string
          audience: string | null
          content: string
          created_at: string | null
          created_by: string | null
          expire_at: string | null
          id: string
          image_url: string | null
          is_breaking_change: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          learn_more_url: string | null
          publish_at: string | null
          summary: string | null
          title: string
          updated_at: string | null
          version: string | null
          video_url: string | null
        }
        Insert: {
          affected_modules?: string[] | null
          announcement_type: string
          audience?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          expire_at?: string | null
          id?: string
          image_url?: string | null
          is_breaking_change?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          learn_more_url?: string | null
          publish_at?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
          version?: string | null
          video_url?: string | null
        }
        Update: {
          affected_modules?: string[] | null
          announcement_type?: string
          audience?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          expire_at?: string | null
          id?: string
          image_url?: string | null
          is_breaking_change?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          learn_more_url?: string | null
          publish_at?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          version?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      help_article_feedback: {
        Row: {
          article_id: string
          created_at: string | null
          feedback_text: string | null
          id: string
          is_helpful: boolean
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          article_id: string
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          is_helpful: boolean
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          is_helpful?: boolean
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_article_feedback_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "help_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_article_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_article_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "help_article_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_article_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      help_articles: {
        Row: {
          article_type: string | null
          category_id: string | null
          content: string
          content_es: string | null
          created_at: string | null
          created_by: string | null
          display_order: number | null
          excerpt: string | null
          excerpt_es: string | null
          featured_image: string | null
          helpful_count: number | null
          helpful_no: number | null
          helpful_yes: number | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          language: string | null
          meta_description: string | null
          meta_title: string | null
          module: string | null
          not_helpful_count: number | null
          published_at: string | null
          search_vector: unknown
          slug: string
          sort_order: number | null
          status: string | null
          summary: string | null
          tags: string[] | null
          title: string
          title_es: string | null
          translations: Json | null
          updated_at: string | null
          video_duration: number | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          article_type?: string | null
          category_id?: string | null
          content: string
          content_es?: string | null
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          excerpt?: string | null
          excerpt_es?: string | null
          featured_image?: string | null
          helpful_count?: number | null
          helpful_no?: number | null
          helpful_yes?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          language?: string | null
          meta_description?: string | null
          meta_title?: string | null
          module?: string | null
          not_helpful_count?: number | null
          published_at?: string | null
          search_vector?: unknown
          slug: string
          sort_order?: number | null
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          title_es?: string | null
          translations?: Json | null
          updated_at?: string | null
          video_duration?: number | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          article_type?: string | null
          category_id?: string | null
          content?: string
          content_es?: string | null
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          excerpt?: string | null
          excerpt_es?: string | null
          featured_image?: string | null
          helpful_count?: number | null
          helpful_no?: number | null
          helpful_yes?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          language?: string | null
          meta_description?: string | null
          meta_title?: string | null
          module?: string | null
          not_helpful_count?: number | null
          published_at?: string | null
          search_vector?: unknown
          slug?: string
          sort_order?: number | null
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          title_es?: string | null
          translations?: Json | null
          updated_at?: string | null
          video_duration?: number | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "help_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_articles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      help_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          description_es: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          title: string | null
          title_es: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          description_es?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          title?: string | null
          title_es?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          description_es?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          title?: string | null
          title_es?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      help_faqs: {
        Row: {
          answer: string
          answer_es: string
          category: string
          created_at: string
          id: string
          is_active: boolean
          question: string
          question_es: string
          sort_order: number
        }
        Insert: {
          answer: string
          answer_es: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          question_es: string
          sort_order?: number
        }
        Update: {
          answer?: string
          answer_es?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          question_es?: string
          sort_order?: number
        }
        Relationships: []
      }
      help_rule_execution_log: {
        Row: {
          action_taken: string | null
          created_at: string | null
          id: string
          organization_id: string | null
          rule_id: string | null
          trigger_context: Json | null
          trigger_type: string | null
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          rule_id?: string | null
          trigger_context?: Json | null
          trigger_type?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          rule_id?: string | null
          trigger_context?: Json | null
          trigger_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_rule_execution_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_rule_execution_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "help_rule_execution_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_rule_execution_log_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "help_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_rule_execution_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      help_rule_triggers: {
        Row: {
          created_at: string | null
          id: string
          rule_id: string | null
          trigger_config: Json | null
          trigger_target: string | null
          trigger_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rule_id?: string | null
          trigger_config?: Json | null
          trigger_target?: string | null
          trigger_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rule_id?: string | null
          trigger_config?: Json | null
          trigger_target?: string | null
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_rule_triggers_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "help_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      help_rules: {
        Row: {
          code: string
          conditions: Json | null
          cooldown_hours: number | null
          created_at: string | null
          custom_content: string | null
          custom_title: string | null
          description: string | null
          display_delay_ms: number | null
          display_duration_ms: number | null
          display_type: string | null
          id: string
          is_active: boolean | null
          max_displays_per_session: number | null
          max_displays_per_user: number | null
          name: string
          priority: number | null
          rule_type: string | null
          target_article_id: string | null
          target_url: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          conditions?: Json | null
          cooldown_hours?: number | null
          created_at?: string | null
          custom_content?: string | null
          custom_title?: string | null
          description?: string | null
          display_delay_ms?: number | null
          display_duration_ms?: number | null
          display_type?: string | null
          id?: string
          is_active?: boolean | null
          max_displays_per_session?: number | null
          max_displays_per_user?: number | null
          name: string
          priority?: number | null
          rule_type?: string | null
          target_article_id?: string | null
          target_url?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          conditions?: Json | null
          cooldown_hours?: number | null
          created_at?: string | null
          custom_content?: string | null
          custom_title?: string | null
          description?: string | null
          display_delay_ms?: number | null
          display_duration_ms?: number | null
          display_type?: string | null
          id?: string
          is_active?: boolean | null
          max_displays_per_session?: number | null
          max_displays_per_user?: number | null
          name?: string
          priority?: number | null
          rule_type?: string | null
          target_article_id?: string | null
          target_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_rules_target_article_id_fkey"
            columns: ["target_article_id"]
            isOneToOne: false
            referencedRelation: "help_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      help_search_logs: {
        Row: {
          clicked_article_id: string | null
          context_module: string | null
          context_page: string | null
          created_at: string | null
          id: string
          organization_id: string | null
          query: string
          results_count: number | null
          user_id: string | null
        }
        Insert: {
          clicked_article_id?: string | null
          context_module?: string | null
          context_page?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          query: string
          results_count?: number | null
          user_id?: string | null
        }
        Update: {
          clicked_article_id?: string | null
          context_module?: string | null
          context_page?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          query?: string
          results_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_search_logs_clicked_article_id_fkey"
            columns: ["clicked_article_id"]
            isOneToOne: false
            referencedRelation: "help_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_search_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_search_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "help_search_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_search_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      help_system_status: {
        Row: {
          component: string
          created_at: string | null
          description: string | null
          expected_resolution_at: string | null
          id: string
          impact: string | null
          resolved_at: string | null
          started_at: string | null
          status: string
          title: string | null
          updated_at: string | null
          updates: Json | null
        }
        Insert: {
          component: string
          created_at?: string | null
          description?: string | null
          expected_resolution_at?: string | null
          id?: string
          impact?: string | null
          resolved_at?: string | null
          started_at?: string | null
          status: string
          title?: string | null
          updated_at?: string | null
          updates?: Json | null
        }
        Update: {
          component?: string
          created_at?: string | null
          description?: string | null
          expected_resolution_at?: string | null
          id?: string
          impact?: string | null
          resolved_at?: string | null
          started_at?: string | null
          status?: string
          title?: string | null
          updated_at?: string | null
          updates?: Json | null
        }
        Relationships: []
      }
      help_tooltips: {
        Row: {
          content: string
          created_at: string | null
          element_selector: string | null
          help_article_id: string | null
          help_url: string | null
          id: string
          is_active: boolean | null
          page_path: string | null
          show_conditions: Json | null
          title: string | null
          tooltip_key: string
          tooltip_type: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          element_selector?: string | null
          help_article_id?: string | null
          help_url?: string | null
          id?: string
          is_active?: boolean | null
          page_path?: string | null
          show_conditions?: Json | null
          title?: string | null
          tooltip_key: string
          tooltip_type?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          element_selector?: string | null
          help_article_id?: string | null
          help_url?: string | null
          id?: string
          is_active?: boolean | null
          page_path?: string | null
          show_conditions?: Json | null
          title?: string | null
          tooltip_key?: string
          tooltip_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_tooltips_help_article_id_fkey"
            columns: ["help_article_id"]
            isOneToOne: false
            referencedRelation: "help_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      help_tour_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          id: string
          skipped_at: string | null
          status: string | null
          tour_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          skipped_at?: string | null
          status?: string | null
          tour_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          skipped_at?: string | null
          status?: string | null
          tour_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_tour_progress_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "help_tours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_tour_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      help_tours: {
        Row: {
          can_skip: boolean | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          show_once: boolean | null
          steps: Json
          tour_key: string
          trigger_conditions: Json | null
          updated_at: string | null
        }
        Insert: {
          can_skip?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          show_once?: boolean | null
          steps?: Json
          tour_key: string
          trigger_conditions?: Json | null
          updated_at?: string | null
        }
        Update: {
          can_skip?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          show_once?: boolean | null
          steps?: Json
          tour_key?: string
          trigger_conditions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      holidays: {
        Row: {
          country_code: string
          created_at: string | null
          date: string
          id: string
          is_recurring: boolean | null
          name: string
          recurring_day: number | null
          recurring_month: number | null
          region_code: string | null
          type: string | null
        }
        Insert: {
          country_code: string
          created_at?: string | null
          date: string
          id?: string
          is_recurring?: boolean | null
          name: string
          recurring_day?: number | null
          recurring_month?: number | null
          region_code?: string | null
          type?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string | null
          date?: string
          id?: string
          is_recurring?: boolean | null
          name?: string
          recurring_day?: number | null
          recurring_month?: number | null
          region_code?: string | null
          type?: string | null
        }
        Relationships: []
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_mapping_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_sync_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "import_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      importable_fields: {
        Row: {
          allowed_values: string[] | null
          available_transforms: string[] | null
          data_type: string
          description: string | null
          display_order: number | null
          entity_type: string
          example_value: string | null
          field_label: string
          field_name: string
          id: string
          is_required: boolean | null
          is_unique: boolean | null
          max_length: number | null
        }
        Insert: {
          allowed_values?: string[] | null
          available_transforms?: string[] | null
          data_type: string
          description?: string | null
          display_order?: number | null
          entity_type: string
          example_value?: string | null
          field_label: string
          field_name: string
          id?: string
          is_required?: boolean | null
          is_unique?: boolean | null
          max_length?: number | null
        }
        Update: {
          allowed_values?: string[] | null
          available_transforms?: string[] | null
          data_type?: string
          description?: string | null
          display_order?: number | null
          entity_type?: string
          example_value?: string | null
          field_label?: string
          field_name?: string
          id?: string
          is_required?: boolean | null
          is_unique?: boolean | null
          max_length?: number | null
        }
        Relationships: []
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      jurisdiction_knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string | null
          effective_date: string | null
          embedding: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          jurisdiction_code: string
          last_verified_at: string | null
          previous_version_id: string | null
          source_date: string | null
          source_name: string | null
          source_url: string | null
          subcategory: string | null
          summary: string | null
          title: string
          updated_at: string | null
          verified_by: string | null
          version: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          effective_date?: string | null
          embedding?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction_code: string
          last_verified_at?: string | null
          previous_version_id?: string | null
          source_date?: string | null
          source_name?: string | null
          source_url?: string | null
          subcategory?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
          verified_by?: string | null
          version?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          effective_date?: string | null
          embedding?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction_code?: string
          last_verified_at?: string | null
          previous_version_id?: string | null
          source_date?: string | null
          source_name?: string | null
          source_url?: string | null
          subcategory?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          verified_by?: string | null
          version?: number | null
        }
        Relationships: []
      }
      jurisdiction_rules: {
        Row: {
          actions: Json | null
          base_days: number | null
          business_days_only: boolean | null
          conditions: Json | null
          created_at: string | null
          description: string | null
          exclude_holidays: boolean | null
          holiday_calendar: string | null
          id: string
          ip_type: string
          is_active: boolean | null
          is_system: boolean | null
          jurisdiction_code: string
          organization_id: string | null
          priority: number | null
          rule_name: string
          rule_type: string
          trigger_event: string | null
          updated_at: string | null
        }
        Insert: {
          actions?: Json | null
          base_days?: number | null
          business_days_only?: boolean | null
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          exclude_holidays?: boolean | null
          holiday_calendar?: string | null
          id?: string
          ip_type: string
          is_active?: boolean | null
          is_system?: boolean | null
          jurisdiction_code: string
          organization_id?: string | null
          priority?: number | null
          rule_name: string
          rule_type: string
          trigger_event?: string | null
          updated_at?: string | null
        }
        Update: {
          actions?: Json | null
          base_days?: number | null
          business_days_only?: boolean | null
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          exclude_holidays?: boolean | null
          holiday_calendar?: string | null
          id?: string
          ip_type?: string
          is_active?: boolean | null
          is_system?: boolean | null
          jurisdiction_code?: string
          organization_id?: string | null
          priority?: number | null
          rule_name?: string
          rule_type?: string
          trigger_event?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jurisdiction_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "jurisdiction_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      jurisdictions: {
        Row: {
          code: string
          created_at: string | null
          flag_emoji: string | null
          has_api_integration: boolean | null
          has_deadline_rules: boolean | null
          has_knowledge_base: boolean | null
          has_official_forms: boolean | null
          has_spider_monitoring: boolean | null
          icon: string | null
          id: string
          ipo_api_url: string | null
          ipo_name: string | null
          ipo_url: string | null
          is_active: boolean | null
          kb_last_updated: string | null
          name: string
          name_local: string | null
          price_monthly: number
          price_yearly: number | null
          region: string
          sort_order: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          tier: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          flag_emoji?: string | null
          has_api_integration?: boolean | null
          has_deadline_rules?: boolean | null
          has_knowledge_base?: boolean | null
          has_official_forms?: boolean | null
          has_spider_monitoring?: boolean | null
          icon?: string | null
          id?: string
          ipo_api_url?: string | null
          ipo_name?: string | null
          ipo_url?: string | null
          is_active?: boolean | null
          kb_last_updated?: string | null
          name: string
          name_local?: string | null
          price_monthly: number
          price_yearly?: number | null
          region: string
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          tier?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          flag_emoji?: string | null
          has_api_integration?: boolean | null
          has_deadline_rules?: boolean | null
          has_knowledge_base?: boolean | null
          has_official_forms?: boolean | null
          has_spider_monitoring?: boolean | null
          icon?: string | null
          id?: string
          ipo_api_url?: string | null
          ipo_name?: string | null
          ipo_url?: string | null
          is_active?: boolean | null
          kb_last_updated?: string | null
          name?: string
          name_local?: string | null
          price_monthly?: number
          price_yearly?: number | null
          region?: string
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          tier?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
      legal_documents: {
        Row: {
          changelog: string | null
          content: string
          content_hash: string
          created_at: string | null
          created_by: string | null
          doc_type: Database["public"]["Enums"]["legal_doc_type"]
          effective_from: string
          effective_until: string | null
          id: string
          is_current: boolean | null
          language: string | null
          requires_re_consent: boolean | null
          title: string
          version: string
        }
        Insert: {
          changelog?: string | null
          content: string
          content_hash: string
          created_at?: string | null
          created_by?: string | null
          doc_type: Database["public"]["Enums"]["legal_doc_type"]
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_current?: boolean | null
          language?: string | null
          requires_re_consent?: boolean | null
          title: string
          version: string
        }
        Update: {
          changelog?: string | null
          content?: string
          content_hash?: string
          created_at?: string | null
          created_by?: string | null
          doc_type?: Database["public"]["Enums"]["legal_doc_type"]
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_current?: boolean | null
          language?: string | null
          requires_re_consent?: boolean | null
          title?: string
          version?: string
        }
        Relationships: []
      }
      legalops_ai_feedback: {
        Row: {
          approved_for_training: boolean | null
          corrected_output: string | null
          created_at: string | null
          feedback_comment: string | null
          feedback_type: string
          id: string
          interaction_id: string
          organization_id: string
          original_output: string | null
          training_exported_at: string | null
          user_id: string
        }
        Insert: {
          approved_for_training?: boolean | null
          corrected_output?: string | null
          created_at?: string | null
          feedback_comment?: string | null
          feedback_type: string
          id?: string
          interaction_id: string
          organization_id: string
          original_output?: string | null
          training_exported_at?: string | null
          user_id: string
        }
        Update: {
          approved_for_training?: boolean | null
          corrected_output?: string | null
          created_at?: string | null
          feedback_comment?: string | null
          feedback_type?: string
          id?: string
          interaction_id?: string
          organization_id?: string
          original_output?: string | null
          training_exported_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legalops_ai_feedback_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "legalops_ai_interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legalops_ai_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legalops_ai_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "legalops_ai_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      legalops_ai_interactions: {
        Row: {
          client_id: string | null
          confidence: number | null
          confidence_level:
            | Database["public"]["Enums"]["ai_confidence_level"]
            | null
          cost_usd: number | null
          created_at: string | null
          feedback_at: string | null
          id: string
          input_metadata: Json | null
          input_text: string | null
          input_tokens: number | null
          interaction_type: Database["public"]["Enums"]["legalops_ai_interaction_type"]
          latency_ms: number | null
          matter_id: string | null
          model_name: string | null
          model_provider: string | null
          model_version: string | null
          organization_id: string
          output_metadata: Json | null
          output_text: string | null
          output_tokens: number | null
          sources: Json | null
          user_correction: string | null
          user_feedback: string | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          confidence?: number | null
          confidence_level?:
            | Database["public"]["Enums"]["ai_confidence_level"]
            | null
          cost_usd?: number | null
          created_at?: string | null
          feedback_at?: string | null
          id?: string
          input_metadata?: Json | null
          input_text?: string | null
          input_tokens?: number | null
          interaction_type: Database["public"]["Enums"]["legalops_ai_interaction_type"]
          latency_ms?: number | null
          matter_id?: string | null
          model_name?: string | null
          model_provider?: string | null
          model_version?: string | null
          organization_id: string
          output_metadata?: Json | null
          output_text?: string | null
          output_tokens?: number | null
          sources?: Json | null
          user_correction?: string | null
          user_feedback?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          confidence?: number | null
          confidence_level?:
            | Database["public"]["Enums"]["ai_confidence_level"]
            | null
          cost_usd?: number | null
          created_at?: string | null
          feedback_at?: string | null
          id?: string
          input_metadata?: Json | null
          input_text?: string | null
          input_tokens?: number | null
          interaction_type?: Database["public"]["Enums"]["legalops_ai_interaction_type"]
          latency_ms?: number | null
          matter_id?: string | null
          model_name?: string | null
          model_provider?: string | null
          model_version?: string | null
          organization_id?: string
          output_metadata?: Json | null
          output_text?: string | null
          output_tokens?: number | null
          sources?: Json | null
          user_correction?: string | null
          user_feedback?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legalops_ai_interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legalops_ai_interactions_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "legalops_ai_interactions_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legalops_ai_interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legalops_ai_interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "legalops_ai_interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      market_user_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          flag_reason: string | null
          id: string
          is_flagged: boolean | null
          is_verified: boolean | null
          is_visible: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          rating_communication: number | null
          rating_overall: number
          rating_quality: number | null
          rating_timeliness: number | null
          rating_value: number | null
          response: string | null
          response_at: string | null
          reviewed_user_id: string
          reviewer_id: string
          title: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          is_visible?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          rating_communication?: number | null
          rating_overall: number
          rating_quality?: number | null
          rating_timeliness?: number | null
          rating_value?: number | null
          response?: string | null
          response_at?: string | null
          reviewed_user_id: string
          reviewer_id: string
          title?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          is_visible?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          rating_communication?: number | null
          rating_overall?: number
          rating_quality?: number | null
          rating_timeliness?: number | null
          rating_value?: number | null
          response?: string | null
          response_at?: string | null
          reviewed_user_id?: string
          reviewer_id?: string
          title?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_user_reviews_reviewed_user_id_fkey"
            columns: ["reviewed_user_id"]
            isOneToOne: false
            referencedRelation: "market_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_user_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "market_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_user_reviews_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "market_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      market_users: {
        Row: {
          accepts_new_clients: boolean | null
          agent_type: string | null
          agent_verification_notes: string | null
          agent_verified_at: string | null
          auth_user_id: string | null
          avatar_url: string | null
          badges: string[] | null
          bar_association: string | null
          bio: string | null
          city: string | null
          communication_score: number | null
          company_logo_url: string | null
          company_name: string | null
          company_type: string | null
          company_website: string | null
          country: string
          created_at: string | null
          display_name: string
          email: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          is_agent: boolean | null
          is_public_profile: boolean | null
          is_verified_agent: boolean | null
          jurisdictions: string[] | null
          kyc_documents: Json | null
          kyc_expires_at: string | null
          kyc_level: number | null
          kyc_status: string | null
          kyc_verified_at: string | null
          languages: string[] | null
          last_active_at: string | null
          license_number: string | null
          notification_preferences: Json | null
          organization_id: string | null
          phone: string | null
          rank_percentile: number | null
          rank_position: number | null
          rate_currency: string | null
          rating_avg: number | null
          ratings_count: number | null
          reputation_score: number | null
          response_time_avg: number | null
          specializations: string[] | null
          success_rate: number | null
          successful_transactions: number | null
          timezone: string | null
          total_transactions: number | null
          total_volume: number | null
          updated_at: string | null
          user_type: string
          years_experience: number | null
        }
        Insert: {
          accepts_new_clients?: boolean | null
          agent_type?: string | null
          agent_verification_notes?: string | null
          agent_verified_at?: string | null
          auth_user_id?: string | null
          avatar_url?: string | null
          badges?: string[] | null
          bar_association?: string | null
          bio?: string | null
          city?: string | null
          communication_score?: number | null
          company_logo_url?: string | null
          company_name?: string | null
          company_type?: string | null
          company_website?: string | null
          country: string
          created_at?: string | null
          display_name: string
          email: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_agent?: boolean | null
          is_public_profile?: boolean | null
          is_verified_agent?: boolean | null
          jurisdictions?: string[] | null
          kyc_documents?: Json | null
          kyc_expires_at?: string | null
          kyc_level?: number | null
          kyc_status?: string | null
          kyc_verified_at?: string | null
          languages?: string[] | null
          last_active_at?: string | null
          license_number?: string | null
          notification_preferences?: Json | null
          organization_id?: string | null
          phone?: string | null
          rank_percentile?: number | null
          rank_position?: number | null
          rate_currency?: string | null
          rating_avg?: number | null
          ratings_count?: number | null
          reputation_score?: number | null
          response_time_avg?: number | null
          specializations?: string[] | null
          success_rate?: number | null
          successful_transactions?: number | null
          timezone?: string | null
          total_transactions?: number | null
          total_volume?: number | null
          updated_at?: string | null
          user_type: string
          years_experience?: number | null
        }
        Update: {
          accepts_new_clients?: boolean | null
          agent_type?: string | null
          agent_verification_notes?: string | null
          agent_verified_at?: string | null
          auth_user_id?: string | null
          avatar_url?: string | null
          badges?: string[] | null
          bar_association?: string | null
          bio?: string | null
          city?: string | null
          communication_score?: number | null
          company_logo_url?: string | null
          company_name?: string | null
          company_type?: string | null
          company_website?: string | null
          country?: string
          created_at?: string | null
          display_name?: string
          email?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_agent?: boolean | null
          is_public_profile?: boolean | null
          is_verified_agent?: boolean | null
          jurisdictions?: string[] | null
          kyc_documents?: Json | null
          kyc_expires_at?: string | null
          kyc_level?: number | null
          kyc_status?: string | null
          kyc_verified_at?: string | null
          languages?: string[] | null
          last_active_at?: string | null
          license_number?: string | null
          notification_preferences?: Json | null
          organization_id?: string | null
          phone?: string | null
          rank_percentile?: number | null
          rank_position?: number | null
          rate_currency?: string | null
          rating_avg?: number | null
          ratings_count?: number | null
          reputation_score?: number | null
          response_time_avg?: number | null
          specializations?: string[] | null
          success_rate?: number | null
          successful_transactions?: number | null
          timezone?: string | null
          total_transactions?: number | null
          total_volume?: number | null
          updated_at?: string | null
          user_type?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "market_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      matter_activity: {
        Row: {
          activity_type: string
          changes: Json | null
          created_at: string | null
          description: string
          id: string
          matter_id: string | null
          organization_id: string | null
          reference_id: string | null
          reference_type: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          changes?: Json | null
          created_at?: string | null
          description: string
          id?: string
          matter_id?: string | null
          organization_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          changes?: Json | null
          created_at?: string | null
          description?: string
          id?: string
          matter_id?: string | null
          organization_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matter_activity_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "matter_activity_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_activity_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_activity_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "matter_activity_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matter_comments: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          matter_id: string | null
          mentions: string[] | null
          organization_id: string | null
          parent_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          matter_id?: string | null
          mentions?: string[] | null
          organization_id?: string | null
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          matter_id?: string | null
          mentions?: string[] | null
          organization_id?: string | null
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matter_comments_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "matter_comments_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "matter_comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "matter_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_costs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      matter_deadlines: {
        Row: {
          alerts_sent: Json | null
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          created_at: string | null
          deadline_date: string
          deadline_type: string
          description: string | null
          extended_by: string | null
          extension_count: number | null
          extension_reason: string | null
          google_event_id: string | null
          id: string
          matter_id: string
          metadata: Json | null
          next_alert_date: string | null
          organization_id: string
          original_deadline: string | null
          outlook_event_id: string | null
          priority: string | null
          rule_code: string | null
          rule_id: string | null
          status: string | null
          task_id: string | null
          title: string
          trigger_date: string
          updated_at: string | null
        }
        Insert: {
          alerts_sent?: Json | null
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string | null
          deadline_date: string
          deadline_type: string
          description?: string | null
          extended_by?: string | null
          extension_count?: number | null
          extension_reason?: string | null
          google_event_id?: string | null
          id?: string
          matter_id: string
          metadata?: Json | null
          next_alert_date?: string | null
          organization_id: string
          original_deadline?: string | null
          outlook_event_id?: string | null
          priority?: string | null
          rule_code?: string | null
          rule_id?: string | null
          status?: string | null
          task_id?: string | null
          title: string
          trigger_date: string
          updated_at?: string | null
        }
        Update: {
          alerts_sent?: Json | null
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string | null
          deadline_date?: string
          deadline_type?: string
          description?: string | null
          extended_by?: string | null
          extension_count?: number | null
          extension_reason?: string | null
          google_event_id?: string | null
          id?: string
          matter_id?: string
          metadata?: Json | null
          next_alert_date?: string | null
          organization_id?: string
          original_deadline?: string | null
          outlook_event_id?: string | null
          priority?: string | null
          rule_code?: string | null
          rule_id?: string | null
          status?: string | null
          task_id?: string | null
          title?: string
          trigger_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matter_deadlines_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_deadlines_extended_by_fkey"
            columns: ["extended_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_deadlines_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "matter_deadlines_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_deadlines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_deadlines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "matter_deadlines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_deadlines_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "deadline_rules"
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      matter_family_relations: {
        Row: {
          child_matter_id: string
          claim_numbers: string[] | null
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string
          parent_matter_id: string
          priority_date: string | null
          relation_type: string
        }
        Insert: {
          child_matter_id: string
          claim_numbers?: string[] | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          parent_matter_id: string
          priority_date?: string | null
          relation_type: string
        }
        Update: {
          child_matter_id?: string
          claim_numbers?: string[] | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          parent_matter_id?: string
          priority_date?: string | null
          relation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "matter_family_relations_child_matter_id_fkey"
            columns: ["child_matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "matter_family_relations_child_matter_id_fkey"
            columns: ["child_matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_family_relations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_family_relations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "matter_family_relations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_family_relations_parent_matter_id_fkey"
            columns: ["parent_matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "matter_family_relations_parent_matter_id_fkey"
            columns: ["parent_matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
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
          auto_renewal: boolean | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          expiry_date: string | null
          family_position: Json | null
          family_root_id: string | null
          filing_date: string | null
          goods_services: string | null
          id: string
          images: string[] | null
          jurisdiction: string | null
          jurisdiction_code: string | null
          last_rule_check_at: string | null
          mark_image_url: string | null
          mark_name: string | null
          mark_type: string | null
          next_deadline: string | null
          next_renewal_date: string | null
          nice_classes: number[] | null
          notes: string | null
          official_fees: number | null
          organization_id: string
          owner_name: string | null
          portfolio_id: string | null
          professional_fees: number | null
          reference: string
          registration_date: string | null
          registration_number: string | null
          renewal_instructions: string | null
          risk_score: number | null
          search_vector: unknown
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
          auto_renewal?: boolean | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          expiry_date?: string | null
          family_position?: Json | null
          family_root_id?: string | null
          filing_date?: string | null
          goods_services?: string | null
          id?: string
          images?: string[] | null
          jurisdiction?: string | null
          jurisdiction_code?: string | null
          last_rule_check_at?: string | null
          mark_image_url?: string | null
          mark_name?: string | null
          mark_type?: string | null
          next_deadline?: string | null
          next_renewal_date?: string | null
          nice_classes?: number[] | null
          notes?: string | null
          official_fees?: number | null
          organization_id: string
          owner_name?: string | null
          portfolio_id?: string | null
          professional_fees?: number | null
          reference: string
          registration_date?: string | null
          registration_number?: string | null
          renewal_instructions?: string | null
          risk_score?: number | null
          search_vector?: unknown
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
          auto_renewal?: boolean | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          expiry_date?: string | null
          family_position?: Json | null
          family_root_id?: string | null
          filing_date?: string | null
          goods_services?: string | null
          id?: string
          images?: string[] | null
          jurisdiction?: string | null
          jurisdiction_code?: string | null
          last_rule_check_at?: string | null
          mark_image_url?: string | null
          mark_name?: string | null
          mark_type?: string | null
          next_deadline?: string | null
          next_renewal_date?: string | null
          nice_classes?: number[] | null
          notes?: string | null
          official_fees?: number | null
          organization_id?: string
          owner_name?: string | null
          portfolio_id?: string | null
          professional_fees?: number | null
          reference?: string
          registration_date?: string | null
          registration_number?: string | null
          renewal_instructions?: string | null
          risk_score?: number | null
          search_vector?: unknown
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
            foreignKeyName: "matters_family_root_id_fkey"
            columns: ["family_root_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "matters_family_root_id_fkey"
            columns: ["family_root_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "matters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
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
          role_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          permissions?: Json | null
          role?: string
          role_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          permissions?: Json | null
          role?: string
          role_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
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
          computed_at: string | null
          dimensions: Json | null
          expires_at: string | null
          id: string
          is_stale: boolean | null
          metric_key: string
          organization_id: string
          period_end: string | null
          period_start: string | null
          period_type: string | null
          value_json: Json | null
          value_numeric: number | null
        }
        Insert: {
          computed_at?: string | null
          dimensions?: Json | null
          expires_at?: string | null
          id?: string
          is_stale?: boolean | null
          metric_key: string
          organization_id: string
          period_end?: string | null
          period_start?: string | null
          period_type?: string | null
          value_json?: Json | null
          value_numeric?: number | null
        }
        Update: {
          computed_at?: string | null
          dimensions?: Json | null
          expires_at?: string | null
          id?: string
          is_stale?: boolean | null
          metric_key?: string
          organization_id?: string
          period_end?: string | null
          period_start?: string | null
          period_type?: string | null
          value_json?: Json | null
          value_numeric?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_cache_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metrics_cache_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_syncs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      module_usage_log: {
        Row: {
          details: Json | null
          id: string
          metric_code: string
          metric_value: number
          module_code: string
          organization_id: string
          period_end: string
          period_start: string
          recorded_at: string | null
        }
        Insert: {
          details?: Json | null
          id?: string
          metric_code: string
          metric_value?: number
          module_code: string
          organization_id: string
          period_end: string
          period_start: string
          recorded_at?: string | null
        }
        Update: {
          details?: Json | null
          id?: string
          metric_code?: string
          metric_value?: number
          module_code?: string
          organization_id?: string
          period_end?: string
          period_start?: string
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_usage_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_usage_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "module_usage_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitored_deadlines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
          digest_day: number | null
          digest_enabled: boolean | null
          digest_frequency: string | null
          digest_time: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          invoice_notifications: boolean | null
          marketing_notifications: boolean | null
          preferences: Json | null
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
          digest_day?: number | null
          digest_enabled?: boolean | null
          digest_frequency?: string | null
          digest_time?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          invoice_notifications?: boolean | null
          marketing_notifications?: boolean | null
          preferences?: Json | null
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
          digest_day?: number | null
          digest_enabled?: boolean | null
          digest_frequency?: string | null
          digest_time?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          invoice_notifications?: boolean | null
          marketing_notifications?: boolean | null
          preferences?: Json | null
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
          action_label: string | null
          action_url: string | null
          archived_at: string | null
          body: string
          category: string | null
          channels_sent: Json | null
          created_at: string | null
          data: Json | null
          expires_at: string | null
          group_key: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_archived: boolean | null
          is_read: boolean | null
          metadata: Json | null
          organization_id: string | null
          priority: string | null
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
          action_label?: string | null
          action_url?: string | null
          archived_at?: string | null
          body: string
          category?: string | null
          channels_sent?: Json | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          group_key?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
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
          action_label?: string | null
          action_url?: string | null
          archived_at?: string | null
          body?: string
          category?: string | null
          channels_sent?: Json | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          group_key?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
      oauth_applications: {
        Row: {
          active_tokens: number | null
          allowed_scopes: Json | null
          client_id: string
          client_secret_hash: string
          created_at: string | null
          created_by: string | null
          description: string | null
          homepage_url: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          logo_url: string | null
          name: string
          organization_id: string
          privacy_policy_url: string | null
          redirect_uris: Json
          terms_of_service_url: string | null
          total_authorizations: number | null
          updated_at: string | null
        }
        Insert: {
          active_tokens?: number | null
          allowed_scopes?: Json | null
          client_id: string
          client_secret_hash: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          homepage_url?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          logo_url?: string | null
          name: string
          organization_id: string
          privacy_policy_url?: string | null
          redirect_uris?: Json
          terms_of_service_url?: string | null
          total_authorizations?: number | null
          updated_at?: string | null
        }
        Update: {
          active_tokens?: number | null
          allowed_scopes?: Json | null
          client_id?: string
          client_secret_hash?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          homepage_url?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          logo_url?: string | null
          name?: string
          organization_id?: string
          privacy_policy_url?: string | null
          redirect_uris?: Json
          terms_of_service_url?: string | null
          total_authorizations?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oauth_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "oauth_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_states: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          provider: string
          redirect_uri: string | null
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          provider: string
          redirect_uri?: string | null
          state: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          provider?: string
          redirect_uri?: string | null
          state?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_states_user_id_fkey"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocr_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      office_holidays: {
        Row: {
          created_at: string | null
          holiday_date: string
          holiday_type: string | null
          id: string
          is_active: boolean | null
          is_recurring: boolean | null
          jurisdiction: string
          name: string
          office_code: string | null
          recurrence_pattern: string | null
        }
        Insert: {
          created_at?: string | null
          holiday_date: string
          holiday_type?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          jurisdiction: string
          name: string
          office_code?: string | null
          recurrence_pattern?: string | null
        }
        Update: {
          created_at?: string | null
          holiday_date?: string
          holiday_type?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          jurisdiction?: string
          name?: string
          office_code?: string | null
          recurrence_pattern?: string | null
        }
        Relationships: []
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
      onboarding_progress: {
        Row: {
          collected_data: Json | null
          completed_at: string | null
          current_step: number | null
          id: string
          last_activity_at: string | null
          organization_id: string
          started_at: string | null
          started_by: string | null
          status: string | null
          steps_completed: Json | null
          total_steps: number | null
          tour_completed: boolean | null
          tour_progress: Json | null
        }
        Insert: {
          collected_data?: Json | null
          completed_at?: string | null
          current_step?: number | null
          id?: string
          last_activity_at?: string | null
          organization_id: string
          started_at?: string | null
          started_by?: string | null
          status?: string | null
          steps_completed?: Json | null
          total_steps?: number | null
          tour_completed?: boolean | null
          tour_progress?: Json | null
        }
        Update: {
          collected_data?: Json | null
          completed_at?: string | null
          current_step?: number | null
          id?: string
          last_activity_at?: string | null
          organization_id?: string
          started_at?: string | null
          started_by?: string | null
          status?: string | null
          steps_completed?: Json | null
          total_steps?: number | null
          tour_completed?: boolean | null
          tour_progress?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "onboarding_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_tips: {
        Row: {
          content: string
          created_at: string | null
          dismissible: boolean | null
          highlight_selector: string | null
          id: string
          is_active: boolean | null
          is_tour_step: boolean | null
          module: string | null
          position: string | null
          show_once: boolean | null
          tip_key: string
          title: string
          tour_order: number | null
          trigger_condition: Json | null
          trigger_type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          dismissible?: boolean | null
          highlight_selector?: string | null
          id?: string
          is_active?: boolean | null
          is_tour_step?: boolean | null
          module?: string | null
          position?: string | null
          show_once?: boolean | null
          tip_key: string
          title: string
          tour_order?: number | null
          trigger_condition?: Json | null
          trigger_type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          dismissible?: boolean | null
          highlight_selector?: string | null
          id?: string
          is_active?: boolean | null
          is_tour_step?: boolean | null
          module?: string | null
          position?: string | null
          show_once?: boolean | null
          tip_key?: string
          title?: string
          tour_order?: number | null
          trigger_condition?: Json | null
          trigger_type?: string | null
        }
        Relationships: []
      }
      organization_branding: {
        Row: {
          accent_color: string | null
          app_name: string | null
          colors: Json | null
          created_at: string | null
          custom_domain: string | null
          custom_domain_ssl_status: string | null
          custom_domain_verified: boolean | null
          custom_email_domain: string | null
          custom_email_from_name: string | null
          domain_verification_token: string | null
          favicon_url: string | null
          font_family: string | null
          heading_font_family: string | null
          id: string
          logo_dark_url: string | null
          logo_url: string | null
          meta_description: string | null
          meta_title: string | null
          organization_id: string | null
          plan_allows_white_label: boolean | null
          portal_background_url: string | null
          portal_logo_url: string | null
          portal_primary_color: string | null
          portal_welcome_message: string | null
          primary_color: string | null
          secondary_color: string | null
          show_powered_by: boolean | null
          smtp_host: string | null
          smtp_last_test_at: string | null
          smtp_password_encrypted: string | null
          smtp_port: number | null
          smtp_user: string | null
          smtp_verified: boolean | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          app_name?: string | null
          colors?: Json | null
          created_at?: string | null
          custom_domain?: string | null
          custom_domain_ssl_status?: string | null
          custom_domain_verified?: boolean | null
          custom_email_domain?: string | null
          custom_email_from_name?: string | null
          domain_verification_token?: string | null
          favicon_url?: string | null
          font_family?: string | null
          heading_font_family?: string | null
          id?: string
          logo_dark_url?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          organization_id?: string | null
          plan_allows_white_label?: boolean | null
          portal_background_url?: string | null
          portal_logo_url?: string | null
          portal_primary_color?: string | null
          portal_welcome_message?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          show_powered_by?: boolean | null
          smtp_host?: string | null
          smtp_last_test_at?: string | null
          smtp_password_encrypted?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          smtp_verified?: boolean | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          app_name?: string | null
          colors?: Json | null
          created_at?: string | null
          custom_domain?: string | null
          custom_domain_ssl_status?: string | null
          custom_domain_verified?: boolean | null
          custom_email_domain?: string | null
          custom_email_from_name?: string | null
          domain_verification_token?: string | null
          favicon_url?: string | null
          font_family?: string | null
          heading_font_family?: string | null
          id?: string
          logo_dark_url?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          organization_id?: string | null
          plan_allows_white_label?: boolean | null
          portal_background_url?: string | null
          portal_logo_url?: string | null
          portal_primary_color?: string | null
          portal_welcome_message?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          show_powered_by?: boolean | null
          smtp_host?: string | null
          smtp_last_test_at?: string | null
          smtp_password_encrypted?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          smtp_verified?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_branding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_branding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_branding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_capabilities: {
        Row: {
          capability_code: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_unlimited: boolean | null
          limit_override: number | null
          organization_id: string
          purchased_at: string | null
          stripe_subscription_item_id: string | null
          updated_at: string | null
        }
        Insert: {
          capability_code: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_unlimited?: boolean | null
          limit_override?: number | null
          organization_id: string
          purchased_at?: string | null
          stripe_subscription_item_id?: string | null
          updated_at?: string | null
        }
        Update: {
          capability_code?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_unlimited?: boolean | null
          limit_override?: number | null
          organization_id?: string
          purchased_at?: string | null
          stripe_subscription_item_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_capabilities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_capabilities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_capabilities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_jurisdictions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_base: boolean | null
          is_favorite: boolean | null
          is_from_plan: boolean | null
          jurisdiction_code: string
          organization_id: string
          purchased_at: string | null
          sort_order: number | null
          stripe_subscription_item_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_base?: boolean | null
          is_favorite?: boolean | null
          is_from_plan?: boolean | null
          jurisdiction_code: string
          organization_id: string
          purchased_at?: string | null
          sort_order?: number | null
          stripe_subscription_item_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_base?: boolean | null
          is_favorite?: boolean | null
          is_from_plan?: boolean | null
          jurisdiction_code?: string
          organization_id?: string
          purchased_at?: string | null
          sort_order?: number | null
          stripe_subscription_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_jurisdictions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_jurisdictions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_jurisdictions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_module_licenses: {
        Row: {
          billing_cycle: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          license_type: string
          limits_override: Json | null
          module_id: string
          organization_id: string
          price_override: number | null
          starts_at: string
          status: string | null
          stripe_subscription_item_id: string | null
          tier_code: string
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          license_type: string
          limits_override?: Json | null
          module_id: string
          organization_id: string
          price_override?: number | null
          starts_at?: string
          status?: string | null
          stripe_subscription_item_id?: string | null
          tier_code: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          license_type?: string
          limits_override?: Json | null
          module_id?: string
          organization_id?: string
          price_override?: number | null
          starts_at?: string
          status?: string | null
          stripe_subscription_item_id?: string | null
          tier_code?: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_module_licenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_module_licenses_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "platform_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_module_licenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_module_licenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_module_licenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_offices: {
        Row: {
          created_at: string | null
          credentials_configured: boolean | null
          id: string
          is_favorite: boolean | null
          office_id: string
          organization_id: string
        }
        Insert: {
          created_at?: string | null
          credentials_configured?: boolean | null
          id?: string
          is_favorite?: boolean | null
          office_id: string
          organization_id: string
        }
        Update: {
          created_at?: string | null
          credentials_configured?: boolean | null
          id?: string
          is_favorite?: boolean | null
          office_id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_offices_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_health_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_offices_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_offices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_offices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_offices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          branding: Json | null
          created_at: string | null
          defaults: Json | null
          email: Json | null
          general: Json | null
          id: string
          integrations: Json | null
          modules: Json | null
          organization_id: string
          regional: Json | null
          security: Json | null
          updated_at: string | null
        }
        Insert: {
          branding?: Json | null
          created_at?: string | null
          defaults?: Json | null
          email?: Json | null
          general?: Json | null
          id?: string
          integrations?: Json | null
          modules?: Json | null
          organization_id: string
          regional?: Json | null
          security?: Json | null
          updated_at?: string | null
        }
        Update: {
          branding?: Json | null
          created_at?: string | null
          defaults?: Json | null
          email?: Json | null
          general?: Json | null
          id?: string
          integrations?: Json | null
          modules?: Json | null
          organization_id?: string
          regional?: Json | null
          security?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          auto_recharge: boolean | null
          auto_recharge_amount: number | null
          auto_recharge_threshold: number | null
          billing_cycle: string | null
          cancel_reason: string | null
          canceled_at: string | null
          created_at: string | null
          credit_balance: number | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string
          plan_id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
          updated_at: string | null
        }
        Insert: {
          auto_recharge?: boolean | null
          auto_recharge_amount?: number | null
          auto_recharge_threshold?: number | null
          billing_cycle?: string | null
          cancel_reason?: string | null
          canceled_at?: string | null
          created_at?: string | null
          credit_balance?: number | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id: string
          plan_id: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_recharge?: boolean | null
          auto_recharge_amount?: number | null
          auto_recharge_threshold?: number | null
          billing_cycle?: string | null
          cancel_reason?: string | null
          canceled_at?: string | null
          created_at?: string | null
          credit_balance?: number | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string
          plan_id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          account_source: string | null
          account_tier: string | null
          addons: string[] | null
          churn_risk_level: string | null
          churn_risk_score: number | null
          created_at: string | null
          crm_owner_id: string | null
          days_since_contact: number | null
          default_language: string | null
          email_from_address: string | null
          email_from_name: string | null
          health_components: Json | null
          health_score: number | null
          id: string
          industry: string | null
          ip_portfolio_summary: Json | null
          is_platform_org: boolean | null
          last_interaction_at: string | null
          lifetime_value: number | null
          name: string
          outstanding_balance: number | null
          payment_score: number | null
          plan: string
          sentiment_score: number | null
          settings: Json | null
          slug: string
          status: string
          updated_at: string | null
          whatsapp_business_id: string | null
          whatsapp_phone: string | null
          whatsapp_phone_number_id: string | null
        }
        Insert: {
          account_source?: string | null
          account_tier?: string | null
          addons?: string[] | null
          churn_risk_level?: string | null
          churn_risk_score?: number | null
          created_at?: string | null
          crm_owner_id?: string | null
          days_since_contact?: number | null
          default_language?: string | null
          email_from_address?: string | null
          email_from_name?: string | null
          health_components?: Json | null
          health_score?: number | null
          id?: string
          industry?: string | null
          ip_portfolio_summary?: Json | null
          is_platform_org?: boolean | null
          last_interaction_at?: string | null
          lifetime_value?: number | null
          name: string
          outstanding_balance?: number | null
          payment_score?: number | null
          plan?: string
          sentiment_score?: number | null
          settings?: Json | null
          slug: string
          status?: string
          updated_at?: string | null
          whatsapp_business_id?: string | null
          whatsapp_phone?: string | null
          whatsapp_phone_number_id?: string | null
        }
        Update: {
          account_source?: string | null
          account_tier?: string | null
          addons?: string[] | null
          churn_risk_level?: string | null
          churn_risk_score?: number | null
          created_at?: string | null
          crm_owner_id?: string | null
          days_since_contact?: number | null
          default_language?: string | null
          email_from_address?: string | null
          email_from_name?: string | null
          health_components?: Json | null
          health_score?: number | null
          id?: string
          industry?: string | null
          ip_portfolio_summary?: Json | null
          is_platform_org?: boolean | null
          last_interaction_at?: string | null
          lifetime_value?: number | null
          name?: string
          outstanding_balance?: number | null
          payment_score?: number | null
          plan?: string
          sentiment_score?: number | null
          settings?: Json | null
          slug?: string
          status?: string
          updated_at?: string | null
          whatsapp_business_id?: string | null
          whatsapp_phone?: string | null
          whatsapp_phone_number_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_crm_owner_id_fkey"
            columns: ["crm_owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      permission_definitions: {
        Row: {
          action: Database["public"]["Enums"]["permission_action"]
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          module: string
          name: string
        }
        Insert: {
          action: Database["public"]["Enums"]["permission_action"]
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          module: string
          name: string
        }
        Update: {
          action?: Database["public"]["Enums"]["permission_action"]
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          module?: string
          name?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          auto_actions: Json | null
          code: string | null
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
          code?: string | null
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
          code?: string | null
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
          template_code: string | null
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
          template_code?: string | null
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
          template_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "pipelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_capabilities: {
        Row: {
          capability_code: string
          config_override: Json | null
          created_at: string | null
          id: string
          limit_period: string | null
          limit_value: number | null
          plan_id: string
        }
        Insert: {
          capability_code: string
          config_override?: Json | null
          created_at?: string | null
          id?: string
          limit_period?: string | null
          limit_value?: number | null
          plan_id: string
        }
        Update: {
          capability_code?: string
          config_override?: Json | null
          created_at?: string | null
          id?: string
          limit_period?: string | null
          limit_value?: number | null
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_capabilities_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_jurisdictions: {
        Row: {
          created_at: string | null
          id: string
          inclusion_type: string | null
          jurisdiction_code: string
          plan_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          inclusion_type?: string | null
          jurisdiction_code: string
          plan_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          inclusion_type?: string | null
          jurisdiction_code?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_jurisdictions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_modules: {
        Row: {
          badge_text: string | null
          base_price_monthly: number | null
          base_price_yearly: number | null
          category: string
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          docs_url: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_addon_available: boolean | null
          is_beta: boolean | null
          is_core: boolean | null
          is_standalone_available: boolean | null
          landing_url: string | null
          launch_date: string | null
          name: string
          pricing_model: string | null
          recommended_modules: string[] | null
          required_modules: string[] | null
          show_in_sidebar: boolean | null
          sort_order: number | null
          tagline: string | null
          tiers: Json | null
          updated_at: string | null
        }
        Insert: {
          badge_text?: string | null
          base_price_monthly?: number | null
          base_price_yearly?: number | null
          category: string
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          docs_url?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_addon_available?: boolean | null
          is_beta?: boolean | null
          is_core?: boolean | null
          is_standalone_available?: boolean | null
          landing_url?: string | null
          launch_date?: string | null
          name: string
          pricing_model?: string | null
          recommended_modules?: string[] | null
          required_modules?: string[] | null
          show_in_sidebar?: boolean | null
          sort_order?: number | null
          tagline?: string | null
          tiers?: Json | null
          updated_at?: string | null
        }
        Update: {
          badge_text?: string | null
          base_price_monthly?: number | null
          base_price_yearly?: number | null
          category?: string
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          docs_url?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_addon_available?: boolean | null
          is_beta?: boolean | null
          is_core?: boolean | null
          is_standalone_available?: boolean | null
          landing_url?: string | null
          launch_date?: string | null
          name?: string
          pricing_model?: string | null
          recommended_modules?: string[] | null
          required_modules?: string[] | null
          show_in_sidebar?: boolean | null
          sort_order?: number | null
          tagline?: string | null
          tiers?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      portal_activity_log: {
        Row: {
          action: string
          actor_external_id: string | null
          actor_internal_id: string | null
          actor_name: string | null
          actor_type: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          portal_id: string
          resource_id: string | null
          resource_name: string | null
          resource_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_external_id?: string | null
          actor_internal_id?: string | null
          actor_name?: string | null
          actor_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          portal_id: string
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_external_id?: string | null
          actor_internal_id?: string | null
          actor_name?: string | null
          actor_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          portal_id?: string
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_activity_log_actor_external_id_fkey"
            columns: ["actor_external_id"]
            isOneToOne: false
            referencedRelation: "portal_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_activity_log_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "client_portals"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_approvals: {
        Row: {
          approval_type: string
          attachments: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          details: Json | null
          due_date: string | null
          expires_at: string | null
          id: string
          organization_id: string
          portal_id: string
          priority: string | null
          reference_id: string | null
          reference_type: string | null
          reminder_count: number | null
          reminder_sent_at: string | null
          responded_at: string | null
          responded_by: string | null
          response: string | null
          response_comment: string | null
          response_options: Json | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approval_type: string
          attachments?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          details?: Json | null
          due_date?: string | null
          expires_at?: string | null
          id?: string
          organization_id: string
          portal_id: string
          priority?: string | null
          reference_id?: string | null
          reference_type?: string | null
          reminder_count?: number | null
          reminder_sent_at?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          response_comment?: string | null
          response_options?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approval_type?: string
          attachments?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          details?: Json | null
          due_date?: string | null
          expires_at?: string | null
          id?: string
          organization_id?: string
          portal_id?: string
          priority?: string | null
          reference_id?: string | null
          reference_type?: string | null
          reminder_count?: number | null
          reminder_sent_at?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          response_comment?: string | null
          response_options?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "portal_approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_approvals_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "client_portals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_approvals_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "portal_users"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_comments: {
        Row: {
          attachments: Json | null
          author_external_id: string | null
          author_internal_id: string | null
          author_name: string
          author_type: string
          content: string
          context_id: string | null
          context_type: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          is_internal: boolean | null
          is_pinned: boolean | null
          is_resolved: boolean | null
          mentions: string[] | null
          parent_id: string | null
          portal_id: string
          resolved_at: string | null
          resolved_by: string | null
          thread_id: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          author_external_id?: string | null
          author_internal_id?: string | null
          author_name: string
          author_type: string
          content: string
          context_id?: string | null
          context_type: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_internal?: boolean | null
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          mentions?: string[] | null
          parent_id?: string | null
          portal_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          author_external_id?: string | null
          author_internal_id?: string | null
          author_name?: string
          author_type?: string
          content?: string
          context_id?: string | null
          context_type?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_internal?: boolean | null
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          mentions?: string[] | null
          parent_id?: string | null
          portal_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_comments_author_external_id_fkey"
            columns: ["author_external_id"]
            isOneToOne: false
            referencedRelation: "portal_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "portal_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_comments_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "client_portals"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_notifications: {
        Row: {
          created_at: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          notification_type: string
          portal_id: string
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          notification_type: string
          portal_id: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          notification_type?: string
          portal_id?: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_notifications_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "client_portals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "portal_users"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity_at: string | null
          refresh_token: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          refresh_token?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          refresh_token?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "portal_users"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_shared_content: {
        Row: {
          content_id: string
          content_type: string
          expires_at: string | null
          filters: Json | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          portal_id: string
          shared_at: string | null
          shared_by: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          expires_at?: string | null
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          portal_id: string
          shared_at?: string | null
          shared_by?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          expires_at?: string | null
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          portal_id?: string
          shared_at?: string | null
          shared_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_shared_content_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "client_portals"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_signatures: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          document_file_id: string | null
          document_hash: string | null
          document_type: string
          document_url: string | null
          expires_at: string | null
          id: string
          organization_id: string
          portal_id: string
          sent_at: string | null
          signature_config: Json | null
          signed_document_file_id: string | null
          signed_document_url: string | null
          signers: Json
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_file_id?: string | null
          document_hash?: string | null
          document_type: string
          document_url?: string | null
          expires_at?: string | null
          id?: string
          organization_id: string
          portal_id: string
          sent_at?: string | null
          signature_config?: Json | null
          signed_document_file_id?: string | null
          signed_document_url?: string | null
          signers?: Json
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_file_id?: string | null
          document_hash?: string | null
          document_type?: string
          document_url?: string | null
          expires_at?: string | null
          id?: string
          organization_id?: string
          portal_id?: string
          sent_at?: string | null
          signature_config?: Json | null
          signed_document_file_id?: string | null
          signed_document_url?: string | null
          signers?: Json
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_signatures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_signatures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "portal_signatures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_signatures_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "client_portals"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_users: {
        Row: {
          activated_at: string | null
          created_at: string | null
          email: string
          id: string
          invited_at: string | null
          invited_by: string | null
          job_title: string | null
          last_login_at: string | null
          login_count: number | null
          magic_link_expires_at: string | null
          magic_link_token: string | null
          name: string
          notification_preferences: Json | null
          password_hash: string | null
          permissions: Json | null
          phone: string | null
          portal_id: string
          role: string | null
          status: string | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          job_title?: string | null
          last_login_at?: string | null
          login_count?: number | null
          magic_link_expires_at?: string | null
          magic_link_token?: string | null
          name: string
          notification_preferences?: Json | null
          password_hash?: string | null
          permissions?: Json | null
          phone?: string | null
          portal_id: string
          role?: string | null
          status?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          job_title?: string | null
          last_login_at?: string | null
          login_count?: number | null
          magic_link_expires_at?: string | null
          magic_link_token?: string | null
          name?: string
          notification_preferences?: Json | null
          password_hash?: string | null
          permissions?: Json | null
          phone?: string | null
          portal_id?: string
          role?: string | null
          status?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_users_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "client_portals"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_valuations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      portfolios: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          owner_id: string | null
          parent_portfolio_id: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          owner_id?: string | null
          parent_portfolio_id?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          owner_id?: string | null
          parent_portfolio_id?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "portfolios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolios_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolios_parent_portfolio_id_fkey"
            columns: ["parent_portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      predictive_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          analysis_data: Json | null
          confidence_score: number | null
          contact_id: string | null
          created_at: string | null
          description: string
          expires_at: string | null
          feedback_notes: string | null
          id: string
          invoice_id: string | null
          matter_id: string | null
          organization_id: string
          recommendation: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          was_useful: boolean | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          analysis_data?: Json | null
          confidence_score?: number | null
          contact_id?: string | null
          created_at?: string | null
          description: string
          expires_at?: string | null
          feedback_notes?: string | null
          id?: string
          invoice_id?: string | null
          matter_id?: string | null
          organization_id: string
          recommendation?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          was_useful?: boolean | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          analysis_data?: Json | null
          confidence_score?: number | null
          contact_id?: string | null
          created_at?: string | null
          description?: string
          expires_at?: string | null
          feedback_notes?: string | null
          id?: string
          invoice_id?: string | null
          matter_id?: string | null
          organization_id?: string
          recommendation?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          was_useful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "predictive_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictive_alerts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictive_alerts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictive_alerts_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "predictive_alerts_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictive_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictive_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "predictive_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictive_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictive_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renewal_schedule_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      report_definitions: {
        Row: {
          available_formats: string[] | null
          category: string
          color: string | null
          config: Json
          created_at: string | null
          created_by: string | null
          default_view: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_favorite: boolean | null
          is_scheduled: boolean | null
          last_run_at: string | null
          name: string
          organization_id: string | null
          report_type: string
          run_count: number | null
          schedule_config: Json | null
          slug: string
          tags: string[] | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          available_formats?: string[] | null
          category: string
          color?: string | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          default_view?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_favorite?: boolean | null
          is_scheduled?: boolean | null
          last_run_at?: string | null
          name: string
          organization_id?: string | null
          report_type?: string
          run_count?: number | null
          schedule_config?: Json | null
          slug: string
          tags?: string[] | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          available_formats?: string[] | null
          category?: string
          color?: string | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          default_view?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_favorite?: boolean | null
          is_scheduled?: boolean | null
          last_run_at?: string | null
          name?: string
          organization_id?: string | null
          report_type?: string
          run_count?: number | null
          schedule_config?: Json | null
          slug?: string
          tags?: string[] | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "report_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      report_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          executed_by: string | null
          id: string
          organization_id: string
          output_files: Json | null
          parameters: Json | null
          report_id: string
          result_summary: Json | null
          started_at: string | null
          status: string
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          executed_by?: string | null
          id?: string
          organization_id: string
          output_files?: Json | null
          parameters?: Json | null
          report_id: string
          result_summary?: Json | null
          started_at?: string | null
          status?: string
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          executed_by?: string | null
          id?: string
          organization_id?: string
          output_files?: Json | null
          parameters?: Json | null
          report_id?: string
          result_summary?: Json | null
          started_at?: string | null
          status?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "report_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_executions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report_definitions"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      resource_permissions: {
        Row: {
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          grantee_id: string
          grantee_type: string
          id: string
          organization_id: string
          permission_id: string
          resource_id: string
          resource_type: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          grantee_id: string
          grantee_type: string
          id?: string
          organization_id: string
          permission_id: string
          resource_id: string
          resource_type: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          grantee_id?: string
          grantee_type?: string
          id?: string
          organization_id?: string
          permission_id?: string
          resource_id?: string
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "resource_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permission_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      retention_executions: {
        Row: {
          completed_at: string | null
          details: Json | null
          error_message: string | null
          id: string
          policy_id: string
          records_anonymized: number | null
          records_archived: number | null
          records_deleted: number | null
          records_processed: number | null
          records_skipped: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          policy_id: string
          records_anonymized?: number | null
          records_archived?: number | null
          records_deleted?: number | null
          records_processed?: number | null
          records_skipped?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          policy_id?: string
          records_anonymized?: number | null
          records_archived?: number | null
          records_deleted?: number | null
          records_processed?: number | null
          records_skipped?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retention_executions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "retention_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      retention_policies: {
        Row: {
          action: string | null
          conditions: Json | null
          created_at: string | null
          data_type: string
          description: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          last_run_count: number | null
          legal_hold: boolean | null
          legal_hold_reason: string | null
          legal_hold_until: string | null
          name: string
          organization_id: string | null
          retention_days: number
          updated_at: string | null
        }
        Insert: {
          action?: string | null
          conditions?: Json | null
          created_at?: string | null
          data_type: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          last_run_count?: number | null
          legal_hold?: boolean | null
          legal_hold_reason?: string | null
          legal_hold_until?: string | null
          name: string
          organization_id?: string | null
          retention_days: number
          updated_at?: string | null
        }
        Update: {
          action?: string | null
          conditions?: Json | null
          created_at?: string | null
          data_type?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          last_run_count?: number | null
          legal_hold?: boolean | null
          legal_hold_reason?: string | null
          legal_hold_until?: string | null
          name?: string
          organization_id?: string | null
          retention_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retention_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retention_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "retention_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_invitations: {
        Row: {
          agent_id: string
          created_at: string | null
          decline_reason: string | null
          email_sent: boolean | null
          expires_at: string | null
          id: string
          invitation_type: string | null
          match_reasons: Json | null
          match_score: number | null
          push_sent: boolean | null
          request_id: string
          responded_at: string | null
          sent_at: string | null
          status: string | null
          viewed_at: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          decline_reason?: string | null
          email_sent?: boolean | null
          expires_at?: string | null
          id?: string
          invitation_type?: string | null
          match_reasons?: Json | null
          match_score?: number | null
          push_sent?: boolean | null
          request_id: string
          responded_at?: string | null
          sent_at?: string | null
          status?: string | null
          viewed_at?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          decline_reason?: string | null
          email_sent?: boolean | null
          expires_at?: string | null
          id?: string
          invitation_type?: string | null
          match_reasons?: Json | null
          match_score?: number | null
          push_sent?: boolean | null
          request_id?: string
          responded_at?: string | null
          sent_at?: string | null
          status?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfq_invitations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "market_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_invitations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "rfq_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_quotes: {
        Row: {
          agent_id: string
          attachments: Json | null
          awarded_at: string | null
          created_at: string | null
          currency: string | null
          deliverables: Json | null
          estimated_duration_days: number
          estimated_start_date: string | null
          guarantees: string | null
          id: string
          methodology: string | null
          payment_milestones: Json | null
          payment_terms: string | null
          price_breakdown: Json
          price_per_jurisdiction: Json | null
          proposal_detail: string | null
          proposal_summary: string
          questions: Json | null
          reference_number: string
          rejected_at: string | null
          rejection_reason: string | null
          relevant_experience: string | null
          request_id: string
          shortlisted_at: string | null
          similar_cases_count: number | null
          status: string | null
          submitted_at: string | null
          total_price: number
          updated_at: string | null
          valid_until: string | null
          viewed_at: string | null
        }
        Insert: {
          agent_id: string
          attachments?: Json | null
          awarded_at?: string | null
          created_at?: string | null
          currency?: string | null
          deliverables?: Json | null
          estimated_duration_days: number
          estimated_start_date?: string | null
          guarantees?: string | null
          id?: string
          methodology?: string | null
          payment_milestones?: Json | null
          payment_terms?: string | null
          price_breakdown?: Json
          price_per_jurisdiction?: Json | null
          proposal_detail?: string | null
          proposal_summary: string
          questions?: Json | null
          reference_number?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          relevant_experience?: string | null
          request_id: string
          shortlisted_at?: string | null
          similar_cases_count?: number | null
          status?: string | null
          submitted_at?: string | null
          total_price: number
          updated_at?: string | null
          valid_until?: string | null
          viewed_at?: string | null
        }
        Update: {
          agent_id?: string
          attachments?: Json | null
          awarded_at?: string | null
          created_at?: string | null
          currency?: string | null
          deliverables?: Json | null
          estimated_duration_days?: number
          estimated_start_date?: string | null
          guarantees?: string | null
          id?: string
          methodology?: string | null
          payment_milestones?: Json | null
          payment_terms?: string | null
          price_breakdown?: Json
          price_per_jurisdiction?: Json | null
          proposal_detail?: string | null
          proposal_summary?: string
          questions?: Json | null
          reference_number?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          relevant_experience?: string | null
          request_id?: string
          shortlisted_at?: string | null
          similar_cases_count?: number | null
          status?: string | null
          submitted_at?: string | null
          total_price?: number
          updated_at?: string | null
          valid_until?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfq_quotes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "market_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_quotes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "rfq_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_requests: {
        Row: {
          allow_counter_questions: boolean | null
          attachments: Json | null
          auto_match: boolean | null
          awarded_at: string | null
          awarded_notes: string | null
          awarded_quote_id: string | null
          budget_currency: string | null
          budget_max: number | null
          budget_min: number | null
          budget_type: string | null
          closes_at: string | null
          created_at: string | null
          deadline_completion: string | null
          deadline_response: string | null
          description: string
          details: Json | null
          id: string
          invited_agent_ids: string[] | null
          is_blind: boolean | null
          jurisdictions: string[]
          locarno_classes: string[] | null
          max_quotes: number | null
          nice_classes: number[] | null
          organization_id: string | null
          published_at: string | null
          quotes_received: number | null
          reference_number: string
          requester_id: string
          requirements: Json | null
          service_category: string
          service_type: string
          status: string | null
          title: string
          transaction_id: string | null
          updated_at: string | null
          urgency: string | null
          views_count: number | null
        }
        Insert: {
          allow_counter_questions?: boolean | null
          attachments?: Json | null
          auto_match?: boolean | null
          awarded_at?: string | null
          awarded_notes?: string | null
          awarded_quote_id?: string | null
          budget_currency?: string | null
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string | null
          closes_at?: string | null
          created_at?: string | null
          deadline_completion?: string | null
          deadline_response?: string | null
          description: string
          details?: Json | null
          id?: string
          invited_agent_ids?: string[] | null
          is_blind?: boolean | null
          jurisdictions?: string[]
          locarno_classes?: string[] | null
          max_quotes?: number | null
          nice_classes?: number[] | null
          organization_id?: string | null
          published_at?: string | null
          quotes_received?: number | null
          reference_number?: string
          requester_id: string
          requirements?: Json | null
          service_category: string
          service_type: string
          status?: string | null
          title: string
          transaction_id?: string | null
          updated_at?: string | null
          urgency?: string | null
          views_count?: number | null
        }
        Update: {
          allow_counter_questions?: boolean | null
          attachments?: Json | null
          auto_match?: boolean | null
          awarded_at?: string | null
          awarded_notes?: string | null
          awarded_quote_id?: string | null
          budget_currency?: string | null
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string | null
          closes_at?: string | null
          created_at?: string | null
          deadline_completion?: string | null
          deadline_response?: string | null
          description?: string
          details?: Json | null
          id?: string
          invited_agent_ids?: string[] | null
          is_blind?: boolean | null
          jurisdictions?: string[]
          locarno_classes?: string[] | null
          max_quotes?: number | null
          nice_classes?: number[] | null
          organization_id?: string | null
          published_at?: string | null
          quotes_received?: number | null
          reference_number?: string
          requester_id?: string
          requirements?: Json | null
          service_category?: string
          service_type?: string
          status?: string | null
          title?: string
          transaction_id?: string | null
          updated_at?: string | null
          urgency?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rfq_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "rfq_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "market_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_requests_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "market_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          conditions: Json | null
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_id: string
          role_id: string
          scope: Database["public"]["Enums"]["permission_scope"] | null
        }
        Insert: {
          conditions?: Json | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id: string
          role_id: string
          scope?: Database["public"]["Enums"]["permission_scope"] | null
        }
        Update: {
          conditions?: Json | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id?: string
          role_id?: string
          scope?: Database["public"]["Enums"]["permission_scope"] | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permission_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          hierarchy_level: number | null
          id: string
          is_editable: boolean | null
          is_system: boolean | null
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          hierarchy_level?: number | null
          id?: string
          is_editable?: boolean | null
          is_system?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          hierarchy_level?: number | null
          id?: string
          is_editable?: boolean | null
          is_system?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          alert_enabled: boolean | null
          alert_frequency: string | null
          created_at: string | null
          description: string | null
          entity_types: string[] | null
          filters: Json | null
          id: string
          is_pinned: boolean | null
          is_shared: boolean | null
          last_used_at: string | null
          name: string
          organization_id: string
          query: string | null
          sort_by: string | null
          sort_order: string | null
          updated_at: string | null
          use_count: number | null
          user_id: string
        }
        Insert: {
          alert_enabled?: boolean | null
          alert_frequency?: string | null
          created_at?: string | null
          description?: string | null
          entity_types?: string[] | null
          filters?: Json | null
          id?: string
          is_pinned?: boolean | null
          is_shared?: boolean | null
          last_used_at?: string | null
          name: string
          organization_id: string
          query?: string | null
          sort_by?: string | null
          sort_order?: string | null
          updated_at?: string | null
          use_count?: number | null
          user_id: string
        }
        Update: {
          alert_enabled?: boolean | null
          alert_frequency?: string | null
          created_at?: string | null
          description?: string | null
          entity_types?: string[] | null
          filters?: Json | null
          id?: string
          is_pinned?: boolean | null
          is_shared?: boolean | null
          last_used_at?: string | null
          name?: string
          organization_id?: string
          query?: string | null
          sort_by?: string | null
          sort_order?: string | null
          updated_at?: string | null
          use_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_searches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "saved_searches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_exports: {
        Row: {
          created_at: string | null
          created_by: string | null
          export_format: string
          failure_count: number | null
          fixed_parameters: Json | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          organization_id: string
          recipients: Json
          report_id: string
          schedule_config: Json
          schedule_type: string
          success_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          export_format?: string
          failure_count?: number | null
          fixed_parameters?: Json | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          organization_id: string
          recipients?: Json
          report_id: string
          schedule_config: Json
          schedule_type: string
          success_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          export_format?: string
          failure_count?: number | null
          fixed_parameters?: Json | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          organization_id?: string
          recipients?: Json
          report_id?: string
          schedule_config?: Json
          schedule_type?: string
          success_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_exports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_exports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "scheduled_exports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_exports_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report_definitions"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      scim_sync_logs: {
        Row: {
          changes_applied: Json | null
          created_at: string | null
          error_message: string | null
          external_id: string | null
          id: string
          operation: string | null
          organization_id: string | null
          resource_type: string | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          changes_applied?: Json | null
          created_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          operation?: string | null
          organization_id?: string | null
          resource_type?: string | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          changes_applied?: Json | null
          created_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          operation?: string | null
          organization_id?: string | null
          resource_type?: string | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scim_sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scim_sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "scim_sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scim_sync_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string | null
          entity_types: string[] | null
          filters: Json | null
          id: string
          organization_id: string
          query: string
          source: string | null
          total_results: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_types?: string[] | null
          filters?: Json | null
          id?: string
          organization_id: string
          query: string
          source?: string | null
          total_results?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_types?: string[] | null
          filters?: Json | null
          id?: string
          organization_id?: string
          query?: string
          source?: string | null
          total_results?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "search_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      search_synonyms: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          synonym_type: string | null
          synonyms: string[]
          term: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          synonym_type?: string | null
          synonyms: string[]
          term: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          synonym_type?: string | null
          synonyms?: string[]
          term?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_synonyms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_synonyms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "search_synonyms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_credentials: {
        Row: {
          created_at: string
          credential_key: string
          encrypted_value: string
          id: string
          organization_id: string | null
          owner_type: string
          provider: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_key: string
          encrypted_value: string
          id?: string
          organization_id?: string | null
          owner_type?: string
          provider: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_key?: string
          encrypted_value?: string
          id?: string
          organization_id?: string | null
          owner_type?: string
          provider?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "secure_credentials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_credentials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "secure_credentials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      security_alerts: {
        Row: {
          actions_taken: Json | null
          alert_type: string
          created_at: string | null
          description: string | null
          evidence: Json | null
          id: string
          organization_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          actions_taken?: Json | null
          alert_type: string
          created_at?: string | null
          description?: string | null
          evidence?: Json | null
          id?: string
          organization_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          actions_taken?: Json | null
          alert_type?: string
          created_at?: string | null
          description?: string | null
          evidence?: Json | null
          id?: string
          organization_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "security_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sent_emails_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_fees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "service_fees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      settings_audit_log: {
        Row: {
          action: string
          category: string
          changes: Json | null
          created_at: string | null
          id: string
          ip_address: string | null
          organization_id: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          category: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          category?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "settings_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      signature_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_ip: string | null
          actor_name: string | null
          actor_type: string | null
          actor_user_agent: string | null
          created_at: string | null
          details: Json | null
          id: string
          signature_request_id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_ip?: string | null
          actor_name?: string | null
          actor_type?: string | null
          actor_user_agent?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          signature_request_id: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_ip?: string | null
          actor_name?: string | null
          actor_type?: string | null
          actor_user_agent?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          signature_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signature_audit_log_signature_request_id_fkey"
            columns: ["signature_request_id"]
            isOneToOne: false
            referencedRelation: "signature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      signature_requests: {
        Row: {
          certificate_url: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          document_hash: string | null
          document_id: string | null
          document_name: string
          document_url: string
          email_message: string | null
          email_subject: string | null
          expires_at: string | null
          external_envelope_id: string | null
          id: string
          last_reminder_at: string | null
          matter_id: string | null
          organization_id: string
          provider: string | null
          reminder_sent_count: number | null
          sent_at: string | null
          signature_type: string | null
          signed_document_hash: string | null
          signed_document_url: string | null
          signers: Json
          status: string | null
          updated_at: string | null
          voided_at: string | null
          voided_reason: string | null
        }
        Insert: {
          certificate_url?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          document_hash?: string | null
          document_id?: string | null
          document_name: string
          document_url: string
          email_message?: string | null
          email_subject?: string | null
          expires_at?: string | null
          external_envelope_id?: string | null
          id?: string
          last_reminder_at?: string | null
          matter_id?: string | null
          organization_id: string
          provider?: string | null
          reminder_sent_count?: number | null
          sent_at?: string | null
          signature_type?: string | null
          signed_document_hash?: string | null
          signed_document_url?: string | null
          signers?: Json
          status?: string | null
          updated_at?: string | null
          voided_at?: string | null
          voided_reason?: string | null
        }
        Update: {
          certificate_url?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          document_hash?: string | null
          document_id?: string | null
          document_name?: string
          document_url?: string
          email_message?: string | null
          email_subject?: string | null
          expires_at?: string | null
          external_envelope_id?: string | null
          id?: string
          last_reminder_at?: string | null
          matter_id?: string | null
          organization_id?: string
          provider?: string | null
          reminder_sent_count?: number | null
          sent_at?: string | null
          signature_type?: string | null
          signed_document_hash?: string | null
          signed_document_url?: string | null
          signers?: Json
          status?: string | null
          updated_at?: string | null
          voided_at?: string | null
          voided_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signature_requests_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "matter_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_requests_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "signature_requests_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "signature_requests_organization_id_fkey"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "similarity_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      smart_tasks: {
        Row: {
          assigned_by: string | null
          assigned_to: string | null
          auto_action: Json | null
          blocking_task_ids: string[] | null
          cancelled_at: string | null
          cancelled_reason: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          description: string | null
          due_date: string
          grace_period_days: number | null
          id: string
          is_auto_generated: boolean | null
          matter_id: string | null
          metadata: Json | null
          organization_id: string
          parent_task_id: string | null
          portfolio_id: string | null
          priority: string | null
          reminder_date: string | null
          rule_id: string | null
          started_at: string | null
          status: string | null
          task_type: string
          title: string
          trigger_date: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_to?: string | null
          auto_action?: Json | null
          blocking_task_ids?: string[] | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          grace_period_days?: number | null
          id?: string
          is_auto_generated?: boolean | null
          matter_id?: string | null
          metadata?: Json | null
          organization_id: string
          parent_task_id?: string | null
          portfolio_id?: string | null
          priority?: string | null
          reminder_date?: string | null
          rule_id?: string | null
          started_at?: string | null
          status?: string | null
          task_type: string
          title: string
          trigger_date?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string | null
          auto_action?: Json | null
          blocking_task_ids?: string[] | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          grace_period_days?: number | null
          id?: string
          is_auto_generated?: boolean | null
          matter_id?: string | null
          metadata?: Json | null
          organization_id?: string
          parent_task_id?: string | null
          portfolio_id?: string | null
          priority?: string | null
          reminder_date?: string | null
          rule_id?: string | null
          started_at?: string | null
          status?: string | null
          task_type?: string
          title?: string
          trigger_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_tasks_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "smart_tasks_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "smart_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "smart_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_tasks_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_tasks_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "jurisdiction_rules"
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spider_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      spider_connector_credentials: {
        Row: {
          access_token: string | null
          connector_id: string
          created_at: string | null
          credentials: Json
          id: string
          is_valid: boolean | null
          last_used_at: string | null
          last_validated_at: string | null
          organization_id: string
          refresh_token: string | null
          token_expires_at: string | null
          total_requests: number | null
          updated_at: string | null
          validation_error: string | null
        }
        Insert: {
          access_token?: string | null
          connector_id: string
          created_at?: string | null
          credentials: Json
          id?: string
          is_valid?: boolean | null
          last_used_at?: string | null
          last_validated_at?: string | null
          organization_id: string
          refresh_token?: string | null
          token_expires_at?: string | null
          total_requests?: number | null
          updated_at?: string | null
          validation_error?: string | null
        }
        Update: {
          access_token?: string | null
          connector_id?: string
          created_at?: string | null
          credentials?: Json
          id?: string
          is_valid?: boolean | null
          last_used_at?: string | null
          last_validated_at?: string | null
          organization_id?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          total_requests?: number | null
          updated_at?: string | null
          validation_error?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spider_connector_credentials_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "spider_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spider_connector_credentials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spider_connector_credentials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "spider_connector_credentials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      spider_connector_health: {
        Row: {
          connector_code: string
          created_at: string | null
          error_count: number | null
          id: string
          last_check_at: string | null
          last_error: string | null
          last_success_at: string | null
          latency_ms: number | null
          metadata: Json | null
          status: string | null
          success_count: number | null
          updated_at: string | null
        }
        Insert: {
          connector_code: string
          created_at?: string | null
          error_count?: number | null
          id?: string
          last_check_at?: string | null
          last_error?: string | null
          last_success_at?: string | null
          latency_ms?: number | null
          metadata?: Json | null
          status?: string | null
          success_count?: number | null
          updated_at?: string | null
        }
        Update: {
          connector_code?: string
          created_at?: string | null
          error_count?: number | null
          id?: string
          last_check_at?: string | null
          last_error?: string | null
          last_success_at?: string | null
          latency_ms?: number | null
          metadata?: Json | null
          status?: string | null
          success_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      spider_connector_runs: {
        Row: {
          checkpoint: Json | null
          completed_at: string | null
          connector_id: string
          created_at: string | null
          duration_ms: number | null
          error_code: string | null
          error_message: string | null
          id: string
          job_id: string
          rate_limit_remaining: number | null
          rate_limit_reset_at: string | null
          raw_response_sample: Json | null
          records_fetched: number | null
          records_matched: number | null
          records_new: number | null
          search_params: Json
          started_at: string | null
          status: string | null
        }
        Insert: {
          checkpoint?: Json | null
          completed_at?: string | null
          connector_id: string
          created_at?: string | null
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          job_id: string
          rate_limit_remaining?: number | null
          rate_limit_reset_at?: string | null
          raw_response_sample?: Json | null
          records_fetched?: number | null
          records_matched?: number | null
          records_new?: number | null
          search_params: Json
          started_at?: string | null
          status?: string | null
        }
        Update: {
          checkpoint?: Json | null
          completed_at?: string | null
          connector_id?: string
          created_at?: string | null
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          job_id?: string
          rate_limit_remaining?: number | null
          rate_limit_reset_at?: string | null
          raw_response_sample?: Json | null
          records_fetched?: number | null
          records_matched?: number | null
          records_new?: number | null
          search_params?: Json
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spider_connector_runs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "spider_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spider_connector_runs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "spider_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      spider_connectors: {
        Row: {
          auth_type: string | null
          base_url: string | null
          code: string
          connector_type: string
          created_at: string | null
          default_config: Json | null
          description: string | null
          documentation_url: string | null
          health_check_config: Json | null
          health_status: string | null
          id: string
          is_active: boolean | null
          jurisdictions: string[] | null
          last_health_check: string | null
          logo_url: string | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          max_concurrent_requests: number | null
          name: string
          rate_limit_period_seconds: number | null
          rate_limit_requests: number | null
          required_tier: string | null
          source_category: string | null
          updated_at: string | null
        }
        Insert: {
          auth_type?: string | null
          base_url?: string | null
          code: string
          connector_type: string
          created_at?: string | null
          default_config?: Json | null
          description?: string | null
          documentation_url?: string | null
          health_check_config?: Json | null
          health_status?: string | null
          id?: string
          is_active?: boolean | null
          jurisdictions?: string[] | null
          last_health_check?: string | null
          logo_url?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          max_concurrent_requests?: number | null
          name: string
          rate_limit_period_seconds?: number | null
          rate_limit_requests?: number | null
          required_tier?: string | null
          source_category?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_type?: string | null
          base_url?: string | null
          code?: string
          connector_type?: string
          created_at?: string | null
          default_config?: Json | null
          description?: string | null
          documentation_url?: string | null
          health_check_config?: Json | null
          health_status?: string | null
          id?: string
          is_active?: boolean | null
          jurisdictions?: string[] | null
          last_health_check?: string | null
          logo_url?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          max_concurrent_requests?: number | null
          name?: string
          rate_limit_period_seconds?: number | null
          rate_limit_requests?: number | null
          required_tier?: string | null
          source_category?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      spider_jobs: {
        Row: {
          alerts_created: number | null
          completed_at: string | null
          connectors_completed: string[] | null
          connectors_failed: string[] | null
          connectors_to_run: string[] | null
          created_at: string | null
          error_code: string | null
          error_details: Json | null
          error_message: string | null
          execution_metadata: Json | null
          id: string
          job_type: string | null
          max_retries: number | null
          organization_id: string
          progress_message: string | null
          progress_percent: number | null
          queued_at: string | null
          results_found: number | null
          results_new: number | null
          results_updated: number | null
          retry_after: string | null
          retry_count: number | null
          scheduled_at: string
          started_at: string | null
          status: string | null
          timeout_at: string | null
          watchlist_id: string
        }
        Insert: {
          alerts_created?: number | null
          completed_at?: string | null
          connectors_completed?: string[] | null
          connectors_failed?: string[] | null
          connectors_to_run?: string[] | null
          created_at?: string | null
          error_code?: string | null
          error_details?: Json | null
          error_message?: string | null
          execution_metadata?: Json | null
          id?: string
          job_type?: string | null
          max_retries?: number | null
          organization_id: string
          progress_message?: string | null
          progress_percent?: number | null
          queued_at?: string | null
          results_found?: number | null
          results_new?: number | null
          results_updated?: number | null
          retry_after?: string | null
          retry_count?: number | null
          scheduled_at: string
          started_at?: string | null
          status?: string | null
          timeout_at?: string | null
          watchlist_id: string
        }
        Update: {
          alerts_created?: number | null
          completed_at?: string | null
          connectors_completed?: string[] | null
          connectors_failed?: string[] | null
          connectors_to_run?: string[] | null
          created_at?: string | null
          error_code?: string | null
          error_details?: Json | null
          error_message?: string | null
          execution_metadata?: Json | null
          id?: string
          job_type?: string | null
          max_retries?: number | null
          organization_id?: string
          progress_message?: string | null
          progress_percent?: number | null
          queued_at?: string | null
          results_found?: number | null
          results_new?: number | null
          results_updated?: number | null
          retry_after?: string | null
          retry_count?: number | null
          scheduled_at?: string
          started_at?: string | null
          status?: string | null
          timeout_at?: string | null
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spider_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spider_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "spider_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spider_jobs_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      spider_search_cache: {
        Row: {
          cached_at: string | null
          connector_code: string
          expires_at: string | null
          id: string
          results: Json
          results_count: number | null
          search_hash: string
          search_params: Json
        }
        Insert: {
          cached_at?: string | null
          connector_code: string
          expires_at?: string | null
          id?: string
          results?: Json
          results_count?: number | null
          search_hash: string
          search_params: Json
        }
        Update: {
          cached_at?: string | null
          connector_code?: string
          expires_at?: string | null
          id?: string
          results?: Json
          results_count?: number | null
          search_hash?: string
          search_params?: Json
        }
        Relationships: []
      }
      spider_source_cache: {
        Row: {
          cached_data: Json
          connector_code: string
          content_hash: string | null
          expires_at: string | null
          fetched_at: string | null
          id: string
          is_stale: boolean | null
          source_id: string
          source_type: string | null
        }
        Insert: {
          cached_data: Json
          connector_code: string
          content_hash?: string | null
          expires_at?: string | null
          fetched_at?: string | null
          id?: string
          is_stale?: boolean | null
          source_id: string
          source_type?: string | null
        }
        Update: {
          cached_data?: Json
          connector_code?: string
          content_hash?: string | null
          expires_at?: string | null
          fetched_at?: string | null
          id?: string
          is_stale?: boolean | null
          source_id?: string
          source_type?: string | null
        }
        Relationships: []
      }
      sso_configurations: {
        Row: {
          allowed_domains: string[] | null
          attribute_mapping: Json | null
          auto_provision_users: boolean | null
          auto_update_users: boolean | null
          created_at: string | null
          default_role: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_sync_at: string | null
          oidc_authorization_url: string | null
          oidc_client_id: string | null
          oidc_client_secret_encrypted: string | null
          oidc_issuer_url: string | null
          oidc_scopes: string | null
          oidc_token_url: string | null
          oidc_userinfo_url: string | null
          organization_id: string | null
          provider_type: string
          require_sso: boolean | null
          role_mapping: Json | null
          saml_certificate: string | null
          saml_entity_id: string | null
          saml_metadata_url: string | null
          saml_slo_url: string | null
          saml_sso_url: string | null
          updated_at: string | null
        }
        Insert: {
          allowed_domains?: string[] | null
          attribute_mapping?: Json | null
          auto_provision_users?: boolean | null
          auto_update_users?: boolean | null
          created_at?: string | null
          default_role?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_sync_at?: string | null
          oidc_authorization_url?: string | null
          oidc_client_id?: string | null
          oidc_client_secret_encrypted?: string | null
          oidc_issuer_url?: string | null
          oidc_scopes?: string | null
          oidc_token_url?: string | null
          oidc_userinfo_url?: string | null
          organization_id?: string | null
          provider_type: string
          require_sso?: boolean | null
          role_mapping?: Json | null
          saml_certificate?: string | null
          saml_entity_id?: string | null
          saml_metadata_url?: string | null
          saml_slo_url?: string | null
          saml_sso_url?: string | null
          updated_at?: string | null
        }
        Update: {
          allowed_domains?: string[] | null
          attribute_mapping?: Json | null
          auto_provision_users?: boolean | null
          auto_update_users?: boolean | null
          created_at?: string | null
          default_role?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_sync_at?: string | null
          oidc_authorization_url?: string | null
          oidc_client_id?: string | null
          oidc_client_secret_encrypted?: string | null
          oidc_issuer_url?: string | null
          oidc_scopes?: string | null
          oidc_token_url?: string | null
          oidc_userinfo_url?: string | null
          organization_id?: string | null
          provider_type?: string
          require_sso?: boolean | null
          role_mapping?: Json | null
          saml_certificate?: string | null
          saml_entity_id?: string | null
          saml_metadata_url?: string | null
          saml_slo_url?: string | null
          saml_sso_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sso_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "sso_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_sessions: {
        Row: {
          attributes_received: Json | null
          id: string
          ip_address: string | null
          logged_in_at: string | null
          logged_out_at: string | null
          logout_reason: string | null
          name_id: string | null
          session_index: string | null
          sso_configuration_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attributes_received?: Json | null
          id?: string
          ip_address?: string | null
          logged_in_at?: string | null
          logged_out_at?: string | null
          logout_reason?: string | null
          name_id?: string | null
          session_index?: string | null
          sso_configuration_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attributes_received?: Json | null
          id?: string
          ip_address?: string | null
          logged_in_at?: string | null
          logged_out_at?: string | null
          logout_reason?: string | null
          name_id?: string | null
          session_index?: string | null
          sso_configuration_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_sessions_sso_configuration_id_fkey"
            columns: ["sso_configuration_id"]
            isOneToOne: false
            referencedRelation: "sso_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sso_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_customers: {
        Row: {
          balance: number | null
          created_at: string | null
          default_payment_method_id: string | null
          email: string | null
          id: string
          invoice_settings: Json | null
          metadata: Json | null
          name: string | null
          organization_id: string
          stripe_customer_id: string
          tax_exempt: string | null
          tax_ids: Json | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          default_payment_method_id?: string | null
          email?: string | null
          id?: string
          invoice_settings?: Json | null
          metadata?: Json | null
          name?: string | null
          organization_id: string
          stripe_customer_id: string
          tax_exempt?: string | null
          tax_ids?: Json | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          default_payment_method_id?: string | null
          email?: string | null
          id?: string
          invoice_settings?: Json | null
          metadata?: Json | null
          name?: string | null
          organization_id?: string
          stripe_customer_id?: string
          tax_exempt?: string | null
          tax_ids?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "stripe_customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_prices: {
        Row: {
          active: boolean | null
          billing_scheme: string | null
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          meter_id: string | null
          nickname: string | null
          recurring_interval: string | null
          recurring_interval_count: number | null
          stripe_price_id: string
          stripe_product_id: string
          tiers: Json | null
          tiers_mode: string | null
          transform_quantity: Json | null
          unit_amount: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          billing_scheme?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          meter_id?: string | null
          nickname?: string | null
          recurring_interval?: string | null
          recurring_interval_count?: number | null
          stripe_price_id: string
          stripe_product_id: string
          tiers?: Json | null
          tiers_mode?: string | null
          transform_quantity?: Json | null
          unit_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          billing_scheme?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          meter_id?: string | null
          nickname?: string | null
          recurring_interval?: string | null
          recurring_interval_count?: number | null
          stripe_price_id?: string
          stripe_product_id?: string
          tiers?: Json | null
          tiers_mode?: string | null
          transform_quantity?: Json | null
          unit_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stripe_products: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          metadata: Json | null
          module_code: string | null
          name: string
          stripe_product_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          metadata?: Json | null
          module_code?: string | null
          name: string
          stripe_product_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          metadata?: Json | null
          module_code?: string | null
          name?: string
          stripe_product_id?: string
          updated_at?: string | null
        }
        Relationships: []
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      subscription_packs: {
        Row: {
          badge_text: string | null
          code: string
          created_at: string | null
          currency: string | null
          description: string | null
          display_order: number | null
          features_highlight: string[] | null
          id: string
          included_modules: Json
          is_active: boolean | null
          is_featured: boolean | null
          is_public: boolean | null
          max_organizations: number | null
          max_users: number | null
          name: string
          pack_type: string
          price_monthly: number
          price_yearly: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          stripe_product_id: string | null
          tagline: string | null
          updated_at: string | null
        }
        Insert: {
          badge_text?: string | null
          code: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_order?: number | null
          features_highlight?: string[] | null
          id?: string
          included_modules?: Json
          is_active?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          max_organizations?: number | null
          max_users?: number | null
          name: string
          pack_type?: string
          price_monthly?: number
          price_yearly?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          tagline?: string | null
          updated_at?: string | null
        }
        Update: {
          badge_text?: string | null
          code?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_order?: number | null
          features_highlight?: string[] | null
          id?: string
          included_modules?: Json
          is_active?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          max_organizations?: number | null
          max_users?: number | null
          name?: string
          pack_type?: string
          price_monthly?: number
          price_yearly?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          tagline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          badge_color: string | null
          badge_text: string | null
          code: string
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json
          highlight: boolean | null
          id: string
          is_active: boolean | null
          is_enterprise: boolean | null
          is_popular: boolean | null
          is_public: boolean | null
          limits: Json
          max_storage_gb: number | null
          max_users: number | null
          name: string
          plan_type: string | null
          price_monthly: number
          price_yearly: number
          sort_order: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          stripe_product_id: string | null
          trial_days: number | null
          trial_includes_all: boolean | null
          ui_config: Json | null
          updated_at: string | null
        }
        Insert: {
          badge_color?: string | null
          badge_text?: string | null
          code: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json
          highlight?: boolean | null
          id?: string
          is_active?: boolean | null
          is_enterprise?: boolean | null
          is_popular?: boolean | null
          is_public?: boolean | null
          limits?: Json
          max_storage_gb?: number | null
          max_users?: number | null
          name: string
          plan_type?: string | null
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          trial_days?: number | null
          trial_includes_all?: boolean | null
          ui_config?: Json | null
          updated_at?: string | null
        }
        Update: {
          badge_color?: string | null
          badge_text?: string | null
          code?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json
          highlight?: boolean | null
          id?: string
          is_active?: boolean | null
          is_enterprise?: boolean | null
          is_popular?: boolean | null
          is_public?: boolean | null
          limits?: Json
          max_storage_gb?: number | null
          max_users?: number | null
          name?: string
          plan_type?: string | null
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          trial_days?: number | null
          trial_includes_all?: boolean | null
          ui_config?: Json | null
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
      support_tickets: {
        Row: {
          affected_module: string | null
          assigned_at: string | null
          assigned_to: string | null
          attachments: Json | null
          browser_info: Json | null
          category: string
          created_at: string | null
          description: string
          first_response_at: string | null
          id: string
          organization_id: string
          page_url: string | null
          priority: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          satisfaction_feedback: string | null
          satisfaction_rating: number | null
          sla_due_at: string | null
          status: string | null
          subject: string
          ticket_number: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          affected_module?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          browser_info?: Json | null
          category: string
          created_at?: string | null
          description: string
          first_response_at?: string | null
          id?: string
          organization_id: string
          page_url?: string | null
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          satisfaction_feedback?: string | null
          satisfaction_rating?: number | null
          sla_due_at?: string | null
          status?: string | null
          subject: string
          ticket_number: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          affected_module?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          browser_info?: Json | null
          category?: string
          created_at?: string | null
          description?: string
          first_response_at?: string | null
          id?: string
          organization_id?: string
          page_url?: string | null
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          satisfaction_feedback?: string | null
          satisfaction_rating?: number | null
          sla_due_at?: string | null
          status?: string | null
          subject?: string
          ticket_number?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      task_comments: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "smart_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          role_in_team: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role_in_team?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role_in_team?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          leader_id: string | null
          name: string
          organization_id: string
          parent_team_id: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          name: string
          organization_id: string
          parent_team_id?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          name?: string
          organization_id?: string
          parent_team_id?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_parent_team_id_fkey"
            columns: ["parent_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_ai_config: {
        Row: {
          ai_assistant_accepted_at: string | null
          ai_assistant_enabled: boolean | null
          ai_classification_accepted_at: string | null
          ai_classification_enabled: boolean | null
          ai_extraction_accepted_at: string | null
          ai_extraction_enabled: boolean | null
          audio_transcription_accepted_at: string | null
          audio_transcription_enabled: boolean | null
          biometric_addendum_signed: boolean | null
          biometric_diarization_accepted_at: string | null
          biometric_diarization_enabled: boolean | null
          client_assistant_enabled: boolean | null
          client_portal_enabled: boolean | null
          id: string
          organization_id: string
          updated_at: string | null
          updated_by: string | null
          whatsapp_accepted_at: string | null
          whatsapp_addendum_signed: boolean | null
          whatsapp_tier: Database["public"]["Enums"]["whatsapp_tier"] | null
        }
        Insert: {
          ai_assistant_accepted_at?: string | null
          ai_assistant_enabled?: boolean | null
          ai_classification_accepted_at?: string | null
          ai_classification_enabled?: boolean | null
          ai_extraction_accepted_at?: string | null
          ai_extraction_enabled?: boolean | null
          audio_transcription_accepted_at?: string | null
          audio_transcription_enabled?: boolean | null
          biometric_addendum_signed?: boolean | null
          biometric_diarization_accepted_at?: string | null
          biometric_diarization_enabled?: boolean | null
          client_assistant_enabled?: boolean | null
          client_portal_enabled?: boolean | null
          id?: string
          organization_id: string
          updated_at?: string | null
          updated_by?: string | null
          whatsapp_accepted_at?: string | null
          whatsapp_addendum_signed?: boolean | null
          whatsapp_tier?: Database["public"]["Enums"]["whatsapp_tier"] | null
        }
        Update: {
          ai_assistant_accepted_at?: string | null
          ai_assistant_enabled?: boolean | null
          ai_classification_accepted_at?: string | null
          ai_classification_enabled?: boolean | null
          ai_extraction_accepted_at?: string | null
          ai_extraction_enabled?: boolean | null
          audio_transcription_accepted_at?: string | null
          audio_transcription_enabled?: boolean | null
          biometric_addendum_signed?: boolean | null
          biometric_diarization_accepted_at?: string | null
          biometric_diarization_enabled?: boolean | null
          client_assistant_enabled?: boolean | null
          client_portal_enabled?: boolean | null
          id?: string
          organization_id?: string
          updated_at?: string | null
          updated_by?: string | null
          whatsapp_accepted_at?: string | null
          whatsapp_addendum_signed?: boolean | null
          whatsapp_tier?: Database["public"]["Enums"]["whatsapp_tier"] | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_ai_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_ai_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "tenant_ai_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_consents: {
        Row: {
          accepted_at: string | null
          accepted_by: string
          created_at: string | null
          doc_hash: string
          doc_type: Database["public"]["Enums"]["legal_doc_type"]
          doc_version: string
          id: string
          ip_address: unknown
          legal_document_id: string
          organization_id: string
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          signature_method: string | null
          signature_provider: string | null
          signed_pdf_url: string | null
          status: Database["public"]["Enums"]["consent_status"] | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by: string
          created_at?: string | null
          doc_hash: string
          doc_type: Database["public"]["Enums"]["legal_doc_type"]
          doc_version: string
          id?: string
          ip_address?: unknown
          legal_document_id: string
          organization_id: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          signature_method?: string | null
          signature_provider?: string | null
          signed_pdf_url?: string | null
          status?: Database["public"]["Enums"]["consent_status"] | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string
          created_at?: string | null
          doc_hash?: string
          doc_type?: Database["public"]["Enums"]["legal_doc_type"]
          doc_version?: string
          id?: string
          ip_address?: unknown
          legal_document_id?: string
          organization_id?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          signature_method?: string | null
          signature_provider?: string | null
          signed_pdf_url?: string | null
          status?: Database["public"]["Enums"]["consent_status"] | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_consents_legal_document_id_fkey"
            columns: ["legal_document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_consents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_consents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "tenant_consents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachments: Json | null
          author_id: string | null
          author_name: string | null
          author_type: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          ticket_id: string
        }
        Insert: {
          attachments?: Json | null
          author_id?: string | null
          author_name?: string | null
          author_type: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          ticket_id: string
        }
        Update: {
          attachments?: Json | null
          author_id?: string | null
          author_name?: string | null
          author_type?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          activity_type: string | null
          approved_at: string | null
          approved_by: string | null
          billing_amount: number | null
          billing_rate: number | null
          billing_rate_id: string | null
          billing_status: string | null
          created_at: string | null
          currency: string | null
          date: string
          description: string
          duration_minutes: number
          end_time: string | null
          id: string
          invoice_id: string | null
          invoice_line_id: string | null
          is_billable: boolean | null
          matter_id: string
          organization_id: string
          rejection_reason: string | null
          start_time: string | null
          task_id: string | null
          timer_running: boolean | null
          timer_started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          approved_at?: string | null
          approved_by?: string | null
          billing_amount?: number | null
          billing_rate?: number | null
          billing_rate_id?: string | null
          billing_status?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string
          description: string
          duration_minutes: number
          end_time?: string | null
          id?: string
          invoice_id?: string | null
          invoice_line_id?: string | null
          is_billable?: boolean | null
          matter_id: string
          organization_id: string
          rejection_reason?: string | null
          start_time?: string | null
          task_id?: string | null
          timer_running?: boolean | null
          timer_started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string | null
          approved_at?: string | null
          approved_by?: string | null
          billing_amount?: number | null
          billing_rate?: number | null
          billing_rate_id?: string | null
          billing_status?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string
          description?: string
          duration_minutes?: number
          end_time?: string | null
          id?: string
          invoice_id?: string | null
          invoice_line_id?: string | null
          is_billable?: boolean | null
          matter_id?: string
          organization_id?: string
          rejection_reason?: string | null
          start_time?: string | null
          task_id?: string | null
          timer_running?: boolean | null
          timer_started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_billing_rate_id_fkey"
            columns: ["billing_rate_id"]
            isOneToOne: false
            referencedRelation: "billing_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "time_entries_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "time_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trademark_visuals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "usage_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_records: {
        Row: {
          billing_period_end: string | null
          billing_period_start: string | null
          created_at: string | null
          feature_code: string
          id: string
          metadata: Json | null
          module_code: string
          organization_id: string
          quantity: number
          stripe_meter_event_id: string | null
          stripe_meter_id: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string | null
          feature_code: string
          id?: string
          metadata?: Json | null
          module_code: string
          organization_id: string
          quantity?: number
          stripe_meter_event_id?: string | null
          stripe_meter_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string | null
          feature_code?: string
          id?: string
          metadata?: Json | null
          module_code?: string
          organization_id?: string
          quantity?: number
          stripe_meter_event_id?: string | null
          stripe_meter_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "usage_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consents: {
        Row: {
          consent_type: string
          document_url: string | null
          document_version: string | null
          granted: boolean
          granted_at: string | null
          id: string
          ip_address: string | null
          organization_id: string | null
          revoked_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_type: string
          document_url?: string | null
          document_version?: string | null
          granted: boolean
          granted_at?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          revoked_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_type?: string
          document_url?: string | null
          document_version?: string | null
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          revoked_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_consents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_consents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "user_consents_organization_id_fkey"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
      user_presence: {
        Row: {
          current_matter_id: string | null
          current_page: string | null
          device_type: string | null
          id: string
          last_seen_at: string | null
          organization_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          current_matter_id?: string | null
          current_page?: string | null
          device_type?: string | null
          id?: string
          last_seen_at?: string | null
          organization_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          current_matter_id?: string | null
          current_page?: string | null
          device_type?: string | null
          id?: string
          last_seen_at?: string | null
          organization_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_current_matter_id_fkey"
            columns: ["current_matter_id"]
            isOneToOne: false
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
          },
          {
            foreignKeyName: "user_presence_current_matter_id_fkey"
            columns: ["current_matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_presence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_presence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "user_presence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity_at: string | null
          organization_id: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity_at?: string | null
          organization_id?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity_at?: string | null
          organization_id?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "user_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          dashboard: Json | null
          display: Json | null
          id: string
          profile: Json | null
          security: Json | null
          shortcuts: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dashboard?: Json | null
          display?: Json | null
          id?: string
          profile?: Json | null
          security?: Json | null
          shortcuts?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dashboard?: Json | null
          display?: Json | null
          id?: string
          profile?: Json | null
          security?: Json | null
          shortcuts?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_tip_progress: {
        Row: {
          dismissed_at: string | null
          id: string
          seen_at: string | null
          status: string | null
          tip_id: string
          user_id: string
        }
        Insert: {
          dismissed_at?: string | null
          id?: string
          seen_at?: string | null
          status?: string | null
          tip_id: string
          user_id: string
        }
        Update: {
          dismissed_at?: string | null
          id?: string
          seen_at?: string | null
          status?: string | null
          tip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tip_progress_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "onboarding_tips"
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vision_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
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
            referencedRelation: "matter_deadline_summary"
            referencedColumns: ["matter_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_sessions: {
        Row: {
          created_at: string | null
          device_name: string | null
          error_at: string | null
          error_message: string | null
          id: string
          last_seen_at: string | null
          last_sync_at: string | null
          messages_synced: number | null
          organization_id: string
          phone_number: string | null
          session_data_encrypted: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_name?: string | null
          error_at?: string | null
          error_message?: string | null
          id?: string
          last_seen_at?: string | null
          last_sync_at?: string | null
          messages_synced?: number | null
          organization_id: string
          phone_number?: string | null
          session_data_encrypted?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_name?: string | null
          error_at?: string | null
          error_message?: string | null
          id?: string
          last_seen_at?: string | null
          last_sync_at?: string | null
          messages_synced?: number | null
          organization_id?: string
          phone_number?: string | null
          session_data_encrypted?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "whatsapp_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_action_logs: {
        Row: {
          action_config: Json | null
          action_index: number
          action_type: string
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          execution_id: string
          id: string
          input_data: Json | null
          output_data: Json | null
          retry_count: number | null
          started_at: string | null
          status: string
        }
        Insert: {
          action_config?: Json | null
          action_index: number
          action_type: string
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          execution_id: string
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: string
        }
        Update: {
          action_config?: Json | null
          action_index?: number
          action_type?: string
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          execution_id?: string
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_action_logs_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          actions_completed: number | null
          actions_failed: number | null
          completed_at: string | null
          context: Json | null
          created_at: string | null
          current_action_index: number | null
          error_message: string | null
          id: string
          organization_id: string
          result: Json | null
          started_at: string | null
          status: string
          trigger_data: Json | null
          trigger_type: string
          workflow_id: string
        }
        Insert: {
          actions_completed?: number | null
          actions_failed?: number | null
          completed_at?: string | null
          context?: Json | null
          created_at?: string | null
          current_action_index?: number | null
          error_message?: string | null
          id?: string
          organization_id: string
          result?: Json | null
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          trigger_type: string
          workflow_id: string
        }
        Update: {
          actions_completed?: number | null
          actions_failed?: number | null
          completed_at?: string | null
          context?: Json | null
          created_at?: string | null
          current_action_index?: number | null
          error_message?: string | null
          id?: string
          organization_id?: string
          result?: Json | null
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          trigger_type?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "workflow_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          execution_id: string | null
          id: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          max_attempts: number | null
          organization_id: string
          priority: number | null
          scheduled_for: string | null
          status: string
          trigger_data: Json | null
          trigger_type: string
          workflow_id: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          execution_id?: string | null
          id?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number | null
          organization_id: string
          priority?: number | null
          scheduled_for?: string | null
          status?: string
          trigger_data?: Json | null
          trigger_type: string
          workflow_id: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          execution_id?: string | null
          id?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number | null
          organization_id?: string
          priority?: number | null
          scheduled_for?: string | null
          status?: string
          trigger_data?: Json | null
          trigger_type?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_queue_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "workflow_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_queue_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_schedules: {
        Row: {
          created_at: string | null
          cron_expression: string | null
          description: string | null
          id: string
          interval_minutes: number | null
          is_active: boolean | null
          last_run_at: string | null
          name: string
          next_run_at: string | null
          organization_id: string
          run_count: number | null
          schedule_type: string
          timezone: string | null
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          cron_expression?: string | null
          description?: string | null
          id?: string
          interval_minutes?: number | null
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          organization_id: string
          run_count?: number | null
          schedule_type?: string
          timezone?: string | null
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          cron_expression?: string | null
          description?: string | null
          id?: string
          interval_minutes?: number | null
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          organization_id?: string
          run_count?: number | null
          schedule_type?: string
          timezone?: string | null
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "workflow_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_schedules_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          actions: Json | null
          category: string
          code: string
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          last_executed_at: string | null
          name: string
          organization_id: string | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          actions?: Json | null
          category?: string
          code: string
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          last_executed_at?: string | null
          name: string
          organization_id?: string | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json | null
          category?: string
          code?: string
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          last_executed_at?: string | null
          name?: string
          organization_id?: string | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "workflow_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_variables: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_secret: boolean | null
          key: string
          organization_id: string
          scope: string
          scope_id: string | null
          updated_at: string | null
          value: Json
          value_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_secret?: boolean | null
          key: string
          organization_id: string
          scope?: string
          scope_id?: string | null
          updated_at?: string | null
          value: Json
          value_type?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_secret?: boolean | null
          key?: string
          organization_id?: string
          scope?: string
          scope_id?: string | null
          updated_at?: string | null
          value?: Json
          value_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_variables_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_variables_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "workflow_variables_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ai_usage_monthly: {
        Row: {
          id: string | null
          organization_id: string | null
          period_end: string | null
          period_start: string | null
          total_agent_runs: number | null
          total_analyses: number | null
          total_cost_usd: number | null
          total_generations: number | null
          total_input_tokens: number | null
          total_output_tokens: number | null
          total_queries: number | null
          total_tokens: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          organization_id?: string | null
          period_end?: string | null
          period_start?: string | null
          total_agent_runs?: never
          total_analyses?: never
          total_cost_usd?: never
          total_generations?: never
          total_input_tokens?: never
          total_output_tokens?: never
          total_queries?: never
          total_tokens?: never
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          organization_id?: string | null
          period_end?: string | null
          period_start?: string | null
          total_agent_runs?: never
          total_analyses?: never
          total_cost_usd?: never
          total_generations?: never
          total_input_tokens?: never
          total_output_tokens?: never
          total_queries?: never
          total_tokens?: never
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      backoffice_tenant_crm: {
        Row: {
          account_tier: string | null
          ai_conversations_30d: number | null
          billing_cycle: string | null
          churn_risk_level: string | null
          churn_risk_score: number | null
          customer_since: string | null
          days_since_contact: number | null
          health_score: number | null
          id: string | null
          industry: string | null
          last_interaction_at: string | null
          last_matter_created: string | null
          lifetime_value: number | null
          matters_last_30d: number | null
          name: string | null
          plan: string | null
          renewal_date: string | null
          sentiment_score: number | null
          slug: string | null
          status: string | null
          subscription_status: string | null
          total_contacts: number | null
          total_deals: number | null
          total_matters: number | null
          total_users: number | null
        }
        Relationships: []
      }
      crm_client_360_view: {
        Row: {
          account_id: string | null
          account_name: string | null
          account_status: string | null
          account_tier: string | null
          churn_risk_level: string | null
          created_at: string | null
          health_score: number | null
          interactions_30d: number | null
          last_interaction_at: string | null
          last_interaction_date: string | null
          open_deals: number | null
          open_pipeline_value: number | null
          organization_id: string | null
          pending_tasks: number | null
          total_contacts: number | null
          total_leads: number | null
          total_revenue: number | null
          updated_at: string | null
          won_deals: number | null
        }
        Insert: {
          account_id?: string | null
          account_name?: string | null
          account_status?: string | null
          account_tier?: string | null
          churn_risk_level?: string | null
          created_at?: string | null
          health_score?: number | null
          interactions_30d?: never
          last_interaction_at?: string | null
          last_interaction_date?: never
          open_deals?: never
          open_pipeline_value?: never
          organization_id?: string | null
          pending_tasks?: never
          total_contacts?: never
          total_leads?: never
          total_revenue?: never
          updated_at?: string | null
          won_deals?: never
        }
        Update: {
          account_id?: string | null
          account_name?: string | null
          account_status?: string | null
          account_tier?: string | null
          churn_risk_level?: string | null
          created_at?: string | null
          health_score?: number | null
          interactions_30d?: never
          last_interaction_at?: string | null
          last_interaction_date?: never
          open_deals?: never
          open_pipeline_value?: never
          organization_id?: string | null
          pending_tasks?: never
          total_contacts?: never
          total_leads?: never
          total_revenue?: never
          updated_at?: string | null
          won_deals?: never
        }
        Relationships: [
          {
            foreignKeyName: "crm_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "crm_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      matter_deadline_summary: {
        Row: {
          deadline_date: string | null
          deadline_id: string | null
          deadline_status: string | null
          deadline_title: string | null
          matter_id: string | null
          organization_id: string | null
          priority: string | null
          reference: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
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
      organization_usage_stats: {
        Row: {
          name: string | null
          organization_id: string | null
          total_contacts: number | null
          total_matters: number | null
          total_users: number | null
        }
        Relationships: []
      }
      signature_stats: {
        Row: {
          completed_count: number | null
          declined_count: number | null
          expired_count: number | null
          organization_id: string | null
          pending_count: number | null
          total_count: number | null
          voided_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "signature_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "backoffice_tenant_crm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_usage_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "signature_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_change_organization_plan: {
        Args: {
          p_billing_cycle?: string
          p_organization_id: string
          p_pack_code: string
        }
        Returns: Json
      }
      ai_get_client_billing_summary: {
        Args: { p_month?: string; p_organization_id: string }
        Returns: Json
      }
      ai_get_finops_dashboard: {
        Args: {
          p_end_date?: string
          p_organization_id: string
          p_start_date?: string
        }
        Returns: Json
      }
      ai_get_models: { Args: { p_include_inactive?: boolean }; Returns: Json }
      ai_get_routing_rules: {
        Args: { p_include_inactive?: boolean }
        Returns: Json
      }
      ai_log_transaction: {
        Args: {
          p_client_id?: string
          p_error_code?: string
          p_error_message?: string
          p_input_tokens: number
          p_jurisdiction_code?: string
          p_latency_ms: number
          p_module: string
          p_organization_id: string
          p_output_tokens: number
          p_routing_reason?: string
          p_routing_rule_id?: string
          p_session_id?: string
          p_status?: string
          p_task_code: string
          p_task_type?: string
          p_user_id?: string
        }
        Returns: Json
      }
      ai_log_transaction_with_billing: {
        Args: {
          p_client_id?: string
          p_error_code?: string
          p_error_message?: string
          p_input_tokens: number
          p_jurisdiction_code?: string
          p_latency_ms: number
          p_model_id: string
          p_module: string
          p_organization_id: string
          p_output_tokens: number
          p_routing_reason?: string
          p_routing_rule_id?: string
          p_session_id?: string
          p_status?: string
          p_task_type?: string
          p_user_id?: string
        }
        Returns: Json
      }
      ai_route_request: {
        Args: {
          p_category?: string
          p_requires_vision?: boolean
          p_task_code: string
        }
        Returns: Json
      }
      apply_docket_rules: { Args: { matter_uuid: string }; Returns: number }
      assign_automatic_badges: { Args: never; Returns: undefined }
      backoffice_get_platform_metrics: { Args: never; Returns: Json }
      backoffice_get_tenant_detail: {
        Args: { p_tenant_id: string }
        Returns: Json
      }
      backoffice_get_tenant_list: {
        Args: {
          p_filter_plan?: string
          p_filter_risk?: string
          p_limit?: number
          p_offset?: number
          p_sort_by?: string
          p_sort_order?: string
        }
        Returns: Json
      }
      calculate_daily_analytics: {
        Args: { p_date?: string }
        Returns: undefined
      }
      calculate_daily_rankings: { Args: never; Returns: undefined }
      calculate_deadline: {
        Args: {
          business_days_only?: boolean
          country?: string
          days_to_add: number
          exclude_holidays?: boolean
          start_date: string
        }
        Returns: string
      }
      calculate_deadline_date: {
        Args: {
          p_calendar_type: string
          p_days: number
          p_jurisdiction?: string
          p_start_date: string
        }
        Returns: string
      }
      calculate_kyc_level: { Args: { p_user_id: string }; Returns: number }
      calculate_trademark_similarity: {
        Args: { term_a: string; term_b: string }
        Returns: Record<string, unknown>
      }
      calculate_validity_status: {
        Args: { valid_until: string }
        Returns: Database["public"]["Enums"]["doc_validity_status"]
      }
      check_capability: {
        Args: {
          p_capability_code: string
          p_increment?: boolean
          p_organization_id: string
        }
        Returns: Json
      }
      check_jurisdiction: {
        Args: { p_jurisdiction_code: string; p_organization_id: string }
        Returns: Json
      }
      check_module_access: {
        Args: {
          p_module_code: string
          p_organization_id: string
          p_required_tier?: string
        }
        Returns: boolean
      }
      check_user_permission: {
        Args: {
          _organization_id: string
          _permission_code: string
          _user_id: string
        }
        Returns: boolean
      }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      crm_activate_automation_template: {
        Args: { p_organization_id: string; p_template_code: string }
        Returns: string
      }
      crm_get_automation_executions: {
        Args: { p_automation_id: string; p_limit?: number; p_status?: string }
        Returns: Json
      }
      crm_get_automations: {
        Args: {
          p_active_only?: boolean
          p_category?: string
          p_organization_id: string
        }
        Returns: Json
      }
      crm_get_client_360: { Args: { p_account_id: string }; Returns: Json }
      crm_get_contact_communications: {
        Args: { p_contact_id: string; p_limit?: number }
        Returns: Json
      }
      crm_get_dashboard_kpis: {
        Args: {
          p_date_from?: string
          p_date_to?: string
          p_organization_id: string
        }
        Returns: Json
      }
      crm_get_pending_approvals: { Args: { p_user_id?: string }; Returns: Json }
      crm_get_pipeline_summary: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      crm_initialize_default_email_templates: {
        Args: { p_organization_id: string }
        Returns: number
      }
      crm_initialize_default_pipelines: {
        Args: { p_organization_id: string }
        Returns: number
      }
      crm_initialize_tenant_pipelines: {
        Args: { p_organization_id: string }
        Returns: number
      }
      crm_log_email_sent: {
        Args: {
          p_body_preview?: string
          p_contact_id?: string
          p_deal_id?: string
          p_from_email: string
          p_from_name?: string
          p_interaction_id?: string
          p_metadata?: Json
          p_organization_id: string
          p_provider?: string
          p_provider_message_id?: string
          p_subject: string
          p_template_code?: string
          p_to_email: string
        }
        Returns: string
      }
      crm_log_lead_event: {
        Args: {
          p_contact_id: string
          p_event_data?: Json
          p_event_source?: string
          p_event_type: string
        }
        Returns: string
      }
      crm_log_whatsapp_sent: {
        Args: {
          p_contact_id?: string
          p_content?: string
          p_interaction_id?: string
          p_message_type: string
          p_metadata?: Json
          p_organization_id: string
          p_template_name?: string
          p_to_phone: string
          p_wa_conversation_id?: string
          p_wa_message_id?: string
          p_wa_phone_number_id?: string
        }
        Returns: string
      }
      crm_reorder_pipeline_stages: {
        Args: { p_pipeline_id: string; p_stage_ids: string[] }
        Returns: boolean
      }
      crm_resolve_approval: {
        Args: { p_approval_id: string; p_decision: string; p_notes?: string }
        Returns: boolean
      }
      daitch_mokotoff: { Args: { "": string }; Returns: string[] }
      days_until_expiry: { Args: { expiry_date: string }; Returns: number }
      dmetaphone: { Args: { "": string }; Returns: string }
      dmetaphone_alt: { Args: { "": string }; Returns: string }
      expire_trials: { Args: never; Returns: number }
      get_active_calendar_connections: {
        Args: never
        Returns: {
          access_token: string
          calendar_color: string | null
          calendar_id: string
          calendar_name: string | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          last_sync_error: string | null
          organization_id: string
          provider: string
          refresh_token: string | null
          sync_deadlines: boolean | null
          sync_direction: string | null
          sync_enabled: boolean | null
          sync_meetings: boolean | null
          sync_status: string | null
          sync_tasks: boolean | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "calendar_connections"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_analytics_stats: {
        Args: { p_days?: number; p_organization_id: string }
        Returns: Json
      }
      get_applicable_rate: {
        Args: {
          p_matter_id: string
          p_organization_id: string
          p_user_id: string
        }
        Returns: number
      }
      get_assets_grouped: {
        Args: { p_group_by: string; p_organization_id: string }
        Returns: {
          label: string
          value: number
        }[]
      }
      get_matter_family_tree: {
        Args: { matter_uuid: string }
        Returns: {
          depth: number
          filing_date: string
          id: string
          ip_type: string
          jurisdiction: string
          parent_id: string
          reference_number: string
          relation_type: string
          status: string
          title: string
        }[]
      }
      get_module_limit: {
        Args: {
          p_limit_key: string
          p_module_code: string
          p_organization_id: string
        }
        Returns: number
      }
      get_organization_jurisdictions: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      get_ui_config: { Args: { p_organization_id: string }; Returns: Json }
      get_user_org_ids: { Args: never; Returns: string[] }
      get_user_organization_ids: { Args: never; Returns: string[] }
      get_user_permissions: {
        Args: { _organization_id: string; _user_id: string }
        Returns: {
          module: string
          permission_code: string
          permission_name: string
          scope: Database["public"]["Enums"]["permission_scope"]
        }[]
      }
      get_user_platform_role: { Args: never; Returns: string }
      get_user_role: {
        Args: { _organization_id: string; _user_id: string }
        Returns: {
          legacy_role: string
          role_code: string
          role_id: string
          role_name: string
        }[]
      }
      get_user_role_in_org: { Args: { org_id: string }; Returns: string }
      get_workflow_stats: {
        Args: { p_days?: number; p_organization_id: string }
        Returns: {
          avg_duration_ms: number
          by_workflow: Json
          failed: number
          pending: number
          successful: number
          total_executions: number
        }[]
      }
      has_feature_access: {
        Args: {
          p_feature: string
          p_module_code: string
          p_organization_id: string
        }
        Returns: boolean
      }
      has_module_access: {
        Args: { p_module_code: string; p_organization_id: string }
        Returns: boolean
      }
      increment_article_feedback: {
        Args: { p_article_id: string; p_is_helpful: boolean }
        Returns: undefined
      }
      increment_help_counter: {
        Args: { p_article_id: string; p_field: string }
        Returns: undefined
      }
      increment_help_view_count: {
        Args: { p_article_id: string }
        Returns: undefined
      }
      increment_rate_limit: {
        Args: { p_api_key_id: string }
        Returns: undefined
      }
      is_backoffice_admin: { Args: never; Returns: boolean }
      is_holiday: {
        Args: { check_date: string; country: string; region?: string }
        Returns: boolean
      }
      is_member_of_org: { Args: { org_id: string }; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
      provision_pack_modules: {
        Args: {
          p_billing_cycle?: string
          p_organization_id: string
          p_pack_code: string
        }
        Returns: {
          module_code: string
          result_status: string
          tier_code: string
        }[]
      }
      search_all: {
        Args: {
          p_entity_types?: string[]
          p_filters?: Json
          p_limit?: number
          p_offset?: number
          p_organization_id: string
          p_query: string
        }
        Returns: {
          entity_id: string
          entity_type: string
          highlight: string
          metadata: Json
          rank: number
          subtitle: string
          title: string
        }[]
      }
      search_facets: {
        Args: { p_organization_id: string; p_query: string }
        Returns: {
          count: number
          entity_type: string
        }[]
      }
      secure_credentials_status: {
        Args: { p_organization_id: string }
        Returns: {
          credential_key: string
          is_configured: boolean
          provider: string
          updated_at: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      soundex: { Args: { "": string }; Returns: string }
      start_module_trial: {
        Args: { p_pack_code: string; p_trial_days?: number }
        Returns: undefined
      }
      sync_market_user_from_nexus: {
        Args: { p_auth_user_id: string; p_organization_id: string }
        Returns: string
      }
      text_soundex: { Args: { "": string }; Returns: string }
      trigger_workflow_manually: {
        Args: { p_trigger_data?: Json; p_workflow_id: string }
        Returns: string
      }
      update_deadline_statuses: { Args: never; Returns: number }
      use_ai_query: {
        Args: {
          p_input_tokens?: number
          p_jurisdiction_code?: string
          p_model?: string
          p_operation_type?: string
          p_organization_id: string
          p_output_tokens?: number
          p_user_id: string
        }
        Returns: Json
      }
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
      ai_confidence_level: "high" | "medium" | "low" | "manual"
      client_doc_type:
        | "poder_general"
        | "poder_especial"
        | "escritura_constitucion"
        | "certificado_registro"
        | "contrato"
        | "factura"
        | "notificacion_oficial"
        | "correspondencia"
        | "sentencia_resolucion"
        | "informe_pericial"
        | "otro"
      comm_category:
        | "legal"
        | "administrative"
        | "commercial"
        | "urgent"
        | "general"
      comm_channel:
        | "email"
        | "whatsapp"
        | "portal"
        | "phone"
        | "sms"
        | "in_person"
        | "other"
      comm_direction: "inbound" | "outbound" | "internal"
      consent_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "revoked"
        | "expired"
      doc_validity_status:
        | "valid"
        | "expiring_soon"
        | "expired"
        | "pending_verification"
        | "revoked"
      legal_doc_type:
        | "tos"
        | "dpa"
        | "ai_disclosure"
        | "whatsapp_addendum"
        | "biometric_addendum"
        | "privacy_policy"
      legalops_ai_interaction_type:
        | "classification"
        | "ner_extraction"
        | "transcription"
        | "assistant_query"
        | "document_summary"
        | "rag_search"
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
      ner_entity_type:
        | "date_grant"
        | "date_expiry"
        | "date_signature"
        | "party_grantor"
        | "party_grantee"
        | "party_notary"
        | "id_document"
        | "reference_protocol"
        | "reference_registry"
        | "reference_case"
        | "power_type"
        | "amount"
        | "other"
      permission_action:
        | "view"
        | "create"
        | "edit"
        | "delete"
        | "export"
        | "configure"
        | "manage"
        | "approve"
      permission_scope: "all" | "team" | "own" | "assigned"
      whatsapp_tier: "tier1_api" | "tier2_sync" | "tier3_basic"
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
      ai_confidence_level: ["high", "medium", "low", "manual"],
      client_doc_type: [
        "poder_general",
        "poder_especial",
        "escritura_constitucion",
        "certificado_registro",
        "contrato",
        "factura",
        "notificacion_oficial",
        "correspondencia",
        "sentencia_resolucion",
        "informe_pericial",
        "otro",
      ],
      comm_category: [
        "legal",
        "administrative",
        "commercial",
        "urgent",
        "general",
      ],
      comm_channel: [
        "email",
        "whatsapp",
        "portal",
        "phone",
        "sms",
        "in_person",
        "other",
      ],
      comm_direction: ["inbound", "outbound", "internal"],
      consent_status: ["pending", "accepted", "rejected", "revoked", "expired"],
      doc_validity_status: [
        "valid",
        "expiring_soon",
        "expired",
        "pending_verification",
        "revoked",
      ],
      legal_doc_type: [
        "tos",
        "dpa",
        "ai_disclosure",
        "whatsapp_addendum",
        "biometric_addendum",
        "privacy_policy",
      ],
      legalops_ai_interaction_type: [
        "classification",
        "ner_extraction",
        "transcription",
        "assistant_query",
        "document_summary",
        "rag_search",
      ],
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
      ner_entity_type: [
        "date_grant",
        "date_expiry",
        "date_signature",
        "party_grantor",
        "party_grantee",
        "party_notary",
        "id_document",
        "reference_protocol",
        "reference_registry",
        "reference_case",
        "power_type",
        "amount",
        "other",
      ],
      permission_action: [
        "view",
        "create",
        "edit",
        "delete",
        "export",
        "configure",
        "manage",
        "approve",
      ],
      permission_scope: ["all", "team", "own", "assigned"],
      whatsapp_tier: ["tier1_api", "tier2_sync", "tier3_basic"],
    },
  },
} as const
