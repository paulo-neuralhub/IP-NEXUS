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
        ]
      }
      activity_action_types: {
        Row: {
          category: string
          code: string
          color: string | null
          icon: string | null
          name_en: string
          name_es: string
          sort_order: number | null
        }
        Insert: {
          category: string
          code: string
          color?: string | null
          icon?: string | null
          name_en: string
          name_es: string
          sort_order?: number | null
        }
        Update: {
          category?: string
          code?: string
          color?: string | null
          icon?: string | null
          name_en?: string
          name_es?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          action: string
          action_category: string | null
          amount: number | null
          batch_id: string | null
          changed_fields: Json | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          deal_id: string | null
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          invoice_id: string | null
          is_internal: boolean | null
          is_system: boolean | null
          matter_id: string | null
          metadata: Json | null
          new_value: string | null
          old_value: string | null
          organization_id: string
          quote_id: string | null
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
          title: string
        }
        Insert: {
          action: string
          action_category?: string | null
          amount?: number | null
          batch_id?: string | null
          changed_fields?: Json | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          invoice_id?: string | null
          is_internal?: boolean | null
          is_system?: boolean | null
          matter_id?: string | null
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          organization_id: string
          quote_id?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          title: string
        }
        Update: {
          action?: string
          action_category?: string | null
          amount?: number | null
          batch_id?: string | null
          changed_fields?: Json | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          invoice_id?: string | null
          is_internal?: boolean | null
          is_system?: boolean | null
          matter_id?: string | null
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          organization_id?: string
          quote_id?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          metadata: Json | null
          severity: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          severity?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          severity?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      agent_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      agent_chat_messages: {
        Row: {
          content: string | null
          cost_cents: number | null
          created_at: string | null
          id: string
          input_tokens: number | null
          latency_ms: number | null
          metadata: Json | null
          model_used: string | null
          output_tokens: number | null
          role: string
          session_id: string | null
          tool_calls: Json | null
          tool_results: Json | null
        }
        Insert: {
          content?: string | null
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          metadata?: Json | null
          model_used?: string | null
          output_tokens?: number | null
          role: string
          session_id?: string | null
          tool_calls?: Json | null
          tool_results?: Json | null
        }
        Update: {
          content?: string | null
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          metadata?: Json | null
          model_used?: string | null
          output_tokens?: number | null
          role?: string
          session_id?: string | null
          tool_calls?: Json | null
          tool_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "agent_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_chat_sessions: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          model: string | null
          status: string | null
          title: string | null
          total_cost_cents: number | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          model?: string | null
          status?: string | null
          title?: string | null
          total_cost_cents?: number | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          model?: string | null
          status?: string | null
          title?: string | null
          total_cost_cents?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      agent_config: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      agent_emails: {
        Row: {
          body_html: string | null
          body_text: string | null
          classification: string | null
          created_at: string | null
          from_address: string | null
          id: string
          message_id: string | null
          status: string | null
          subject: string | null
          to_address: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          classification?: string | null
          created_at?: string | null
          from_address?: string | null
          id?: string
          message_id?: string | null
          status?: string | null
          subject?: string | null
          to_address?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          classification?: string | null
          created_at?: string | null
          from_address?: string | null
          id?: string
          message_id?: string | null
          status?: string | null
          subject?: string | null
          to_address?: string | null
        }
        Relationships: []
      }
      agent_instance_config: {
        Row: {
          allowed_tools: Json
          brand_name: string
          created_at: string | null
          id: string
          instance_id: string
          is_active: boolean | null
          llm_max_tokens: number | null
          llm_model: string | null
          llm_provider: string | null
          llm_temperature: number | null
          memory_enabled: boolean | null
          rag_enabled: boolean | null
          rag_max_chunks: number | null
          rag_similarity_threshold: number | null
          system_prompt: string
          tool_definitions: Json
          updated_at: string | null
        }
        Insert: {
          allowed_tools?: Json
          brand_name: string
          created_at?: string | null
          id?: string
          instance_id: string
          is_active?: boolean | null
          llm_max_tokens?: number | null
          llm_model?: string | null
          llm_provider?: string | null
          llm_temperature?: number | null
          memory_enabled?: boolean | null
          rag_enabled?: boolean | null
          rag_max_chunks?: number | null
          rag_similarity_threshold?: number | null
          system_prompt: string
          tool_definitions?: Json
          updated_at?: string | null
        }
        Update: {
          allowed_tools?: Json
          brand_name?: string
          created_at?: string | null
          id?: string
          instance_id?: string
          is_active?: boolean | null
          llm_max_tokens?: number | null
          llm_model?: string | null
          llm_provider?: string | null
          llm_temperature?: number | null
          memory_enabled?: boolean | null
          rag_enabled?: boolean | null
          rag_max_chunks?: number | null
          rag_similarity_threshold?: number | null
          system_prompt?: string
          tool_definitions?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_jurisdiction_profiles: {
        Row: {
          cases_processed: number | null
          created_at: string | null
          currency: string | null
          expertise_description: string | null
          flag_code: string
          flag_emoji: string
          id: string
          ipo_office_id: string | null
          is_active: boolean | null
          jurisdiction_code: string
          jurisdiction_name: string
          kb_chunk_filter: string | null
          kb_chunks_count: number | null
          kb_last_updated: string | null
          kb_status: string | null
          key_institutions: string[] | null
          legislation_refs: string[] | null
          official_language: string | null
          sort_order: number | null
          system_prompt_extension: string | null
          typical_timeline: string | null
          updated_at: string | null
        }
        Insert: {
          cases_processed?: number | null
          created_at?: string | null
          currency?: string | null
          expertise_description?: string | null
          flag_code: string
          flag_emoji: string
          id?: string
          ipo_office_id?: string | null
          is_active?: boolean | null
          jurisdiction_code: string
          jurisdiction_name: string
          kb_chunk_filter?: string | null
          kb_chunks_count?: number | null
          kb_last_updated?: string | null
          kb_status?: string | null
          key_institutions?: string[] | null
          legislation_refs?: string[] | null
          official_language?: string | null
          sort_order?: number | null
          system_prompt_extension?: string | null
          typical_timeline?: string | null
          updated_at?: string | null
        }
        Update: {
          cases_processed?: number | null
          created_at?: string | null
          currency?: string | null
          expertise_description?: string | null
          flag_code?: string
          flag_emoji?: string
          id?: string
          ipo_office_id?: string | null
          is_active?: boolean | null
          jurisdiction_code?: string
          jurisdiction_name?: string
          kb_chunk_filter?: string | null
          kb_chunks_count?: number | null
          kb_last_updated?: string | null
          kb_status?: string | null
          key_institutions?: string[] | null
          legislation_refs?: string[] | null
          official_language?: string | null
          sort_order?: number | null
          system_prompt_extension?: string | null
          typical_timeline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_learned_knowledge: {
        Row: {
          answer_summary: string
          category: string | null
          confidence: number | null
          created_at: string | null
          id: string
          instance_id: string
          jurisdiction: string | null
          knowledge_chunk: string
          promoted_to_rag: boolean | null
          question_summary: string
          times_confirmed: number | null
          times_used: number | null
          updated_at: string | null
        }
        Insert: {
          answer_summary: string
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          instance_id?: string
          jurisdiction?: string | null
          knowledge_chunk: string
          promoted_to_rag?: boolean | null
          question_summary: string
          times_confirmed?: number | null
          times_used?: number | null
          updated_at?: string | null
        }
        Update: {
          answer_summary?: string
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          instance_id?: string
          jurisdiction?: string | null
          knowledge_chunk?: string
          promoted_to_rag?: boolean | null
          question_summary?: string
          times_confirmed?: number | null
          times_used?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_memory: {
        Row: {
          created_at: string | null
          expires_at: string | null
          fact_text: string
          fact_type: string
          id: string
          instance_id: string
          metadata: Json | null
          relevance_score: number | null
          session_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          fact_text: string
          fact_type: string
          id?: string
          instance_id?: string
          metadata?: Json | null
          relevance_score?: number | null
          session_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          fact_text?: string
          fact_type?: string
          id?: string
          instance_id?: string
          metadata?: Json | null
          relevance_score?: number | null
          session_id?: string | null
        }
        Relationships: []
      }
      agent_portal_monitors: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          monitor_type: string | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          monitor_type?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          monitor_type?: string | null
          name?: string | null
        }
        Relationships: []
      }
      agent_providers_config: {
        Row: {
          config_encrypted: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          provider_type: string
        }
        Insert: {
          config_encrypted?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider_type: string
        }
        Update: {
          config_encrypted?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider_type?: string
        }
        Relationships: []
      }
      agent_query_log: {
        Row: {
          aliases_detected: Json | null
          classes_requested: number | null
          country_codes_requested: string[] | null
          country_codes_resolved: string[] | null
          created_at: string | null
          had_missing_data: boolean | null
          had_stale_data: boolean | null
          id: string
          min_confidence_returned: number | null
          response_ms: number | null
          results_found: number | null
          service_type: string | null
          session_id: string | null
          tool_action: string
          user_id: string | null
        }
        Insert: {
          aliases_detected?: Json | null
          classes_requested?: number | null
          country_codes_requested?: string[] | null
          country_codes_resolved?: string[] | null
          created_at?: string | null
          had_missing_data?: boolean | null
          had_stale_data?: boolean | null
          id?: string
          min_confidence_returned?: number | null
          response_ms?: number | null
          results_found?: number | null
          service_type?: string | null
          session_id?: string | null
          tool_action: string
          user_id?: string | null
        }
        Update: {
          aliases_detected?: Json | null
          classes_requested?: number | null
          country_codes_requested?: string[] | null
          country_codes_resolved?: string[] | null
          created_at?: string | null
          had_missing_data?: boolean | null
          had_stale_data?: boolean | null
          id?: string
          min_confidence_returned?: number | null
          response_ms?: number | null
          results_found?: number | null
          service_type?: string | null
          session_id?: string | null
          tool_action?: string
          user_id?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      agent_service_fees: {
        Row: {
          additional_class_fee: number | null
          additional_class_fee_currency: string | null
          agent_id: string | null
          classes_included: number | null
          created_at: string | null
          excludes_description: string | null
          fee_amount: number
          fee_amount_eur: number | null
          fee_currency: string | null
          id: string
          includes_apostille: boolean | null
          includes_official_fee: boolean | null
          includes_pow_preparation: boolean | null
          includes_translations: boolean | null
          ipo_office_id: string | null
          last_confirmed_date: string | null
          notes: string | null
          partner_id: string | null
          service_type: string
          source: string | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          additional_class_fee?: number | null
          additional_class_fee_currency?: string | null
          agent_id?: string | null
          classes_included?: number | null
          created_at?: string | null
          excludes_description?: string | null
          fee_amount: number
          fee_amount_eur?: number | null
          fee_currency?: string | null
          id?: string
          includes_apostille?: boolean | null
          includes_official_fee?: boolean | null
          includes_pow_preparation?: boolean | null
          includes_translations?: boolean | null
          ipo_office_id?: string | null
          last_confirmed_date?: string | null
          notes?: string | null
          partner_id?: string | null
          service_type: string
          source?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          additional_class_fee?: number | null
          additional_class_fee_currency?: string | null
          agent_id?: string | null
          classes_included?: number | null
          created_at?: string | null
          excludes_description?: string | null
          fee_amount?: number
          fee_amount_eur?: number | null
          fee_currency?: string | null
          id?: string
          includes_apostille?: boolean | null
          includes_official_fee?: boolean | null
          includes_pow_preparation?: boolean | null
          includes_translations?: boolean | null
          ipo_office_id?: string | null
          last_confirmed_date?: string | null
          notes?: string | null
          partner_id?: string | null
          service_type?: string
          source?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_service_fees_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_service_fees_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_service_fees_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_service_fees_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "agent_service_fees_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "agent_service_fees_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          address: string | null
          avg_response_hours: number | null
          city: string | null
          contact_person: string | null
          contract_expiry: string | null
          contract_url: string | null
          country_code: string
          created_at: string | null
          currency: string | null
          email: string | null
          firm_name: string | null
          handles_apostille: boolean | null
          handles_legalization: boolean | null
          handles_pow: boolean | null
          handles_translations: boolean | null
          id: string
          internal_rating_notes: string | null
          is_active: boolean | null
          is_vetted: boolean | null
          jurisdictions: Json | null
          languages: Json | null
          linkedin_url: string | null
          name: string
          notes: string | null
          payment_methods: Json | null
          payment_terms: string | null
          phone: string | null
          rating: number | null
          relationship_since: string | null
          relationship_type: string | null
          service_types: Json | null
          specializations: Json | null
          success_rate_pct: number | null
          timezone: string | null
          total_cases_handled: number | null
          updated_at: string | null
          vetted_by: string | null
          vetted_date: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          avg_response_hours?: number | null
          city?: string | null
          contact_person?: string | null
          contract_expiry?: string | null
          contract_url?: string | null
          country_code: string
          created_at?: string | null
          currency?: string | null
          email?: string | null
          firm_name?: string | null
          handles_apostille?: boolean | null
          handles_legalization?: boolean | null
          handles_pow?: boolean | null
          handles_translations?: boolean | null
          id?: string
          internal_rating_notes?: string | null
          is_active?: boolean | null
          is_vetted?: boolean | null
          jurisdictions?: Json | null
          languages?: Json | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          payment_methods?: Json | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          relationship_since?: string | null
          relationship_type?: string | null
          service_types?: Json | null
          specializations?: Json | null
          success_rate_pct?: number | null
          timezone?: string | null
          total_cases_handled?: number | null
          updated_at?: string | null
          vetted_by?: string | null
          vetted_date?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          avg_response_hours?: number | null
          city?: string | null
          contact_person?: string | null
          contract_expiry?: string | null
          contract_url?: string | null
          country_code?: string
          created_at?: string | null
          currency?: string | null
          email?: string | null
          firm_name?: string | null
          handles_apostille?: boolean | null
          handles_legalization?: boolean | null
          handles_pow?: boolean | null
          handles_translations?: boolean | null
          id?: string
          internal_rating_notes?: string | null
          is_active?: boolean | null
          is_vetted?: boolean | null
          jurisdictions?: Json | null
          languages?: Json | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          payment_methods?: Json | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          relationship_since?: string | null
          relationship_type?: string | null
          service_types?: Json | null
          specializations?: Json | null
          success_rate_pct?: number | null
          timezone?: string | null
          total_cases_handled?: number | null
          updated_at?: string | null
          vetted_by?: string | null
          vetted_date?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      ai_agent_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          referenced_events: string[]
          referenced_organizations: string[]
          response_time_ms: number | null
          role: string
          session_id: string
          tokens_used: number | null
          tools_used: Json
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          referenced_events?: string[]
          referenced_organizations?: string[]
          response_time_ms?: number | null
          role: string
          session_id: string
          tokens_used?: number | null
          tools_used?: Json
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          referenced_events?: string[]
          referenced_organizations?: string[]
          response_time_ms?: number | null
          role?: string
          session_id?: string
          tokens_used?: number | null
          tools_used?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_sessions: {
        Row: {
          context_data: Json
          context_organization_id: string | null
          created_at: string
          id: string
          last_message_at: string | null
          status: string
          total_messages: number
          total_tokens: number
          updated_at: string
          user_id: string
        }
        Insert: {
          context_data?: Json
          context_organization_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          total_messages?: number
          total_tokens?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          context_data?: Json
          context_organization_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          total_messages?: number
          total_tokens?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_annual_cost_summary: {
        Row: {
          closed_at: string | null
          created_at: string
          id: string
          total_cost_cents: number
          total_executions: number
          updated_at: string
          year: number
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          id?: string
          total_cost_cents?: number
          total_executions?: number
          updated_at?: string
          year: number
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          id?: string
          total_cost_cents?: number
          total_executions?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
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
          daily_limit: number | null
          daily_spent: number | null
          fallback_model_id: string | null
          hard_limit: boolean
          hard_limit_action: string
          id: string
          is_active: boolean
          last_alert_sent_at: string | null
          last_daily_reset: string | null
          model_id: string | null
          module: string | null
          monthly_spent: number | null
          organization_id: string | null
          per_request_limit: number | null
          period_type: string
          scope_type: string
          total_spent: number | null
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
          daily_limit?: number | null
          daily_spent?: number | null
          fallback_model_id?: string | null
          hard_limit?: boolean
          hard_limit_action?: string
          id?: string
          is_active?: boolean
          last_alert_sent_at?: string | null
          last_daily_reset?: string | null
          model_id?: string | null
          module?: string | null
          monthly_spent?: number | null
          organization_id?: string | null
          per_request_limit?: number | null
          period_type?: string
          scope_type: string
          total_spent?: number | null
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
          daily_limit?: number | null
          daily_spent?: number | null
          fallback_model_id?: string | null
          hard_limit?: boolean
          hard_limit_action?: string
          id?: string
          is_active?: boolean
          last_alert_sent_at?: string | null
          last_daily_reset?: string | null
          model_id?: string | null
          module?: string | null
          monthly_spent?: number | null
          organization_id?: string | null
          per_request_limit?: number | null
          period_type?: string
          scope_type?: string
          total_spent?: number | null
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
        ]
      }
      ai_capabilities: {
        Row: {
          code: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
        }
        Relationships: []
      }
      ai_capability_assignments: {
        Row: {
          capability_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          model_id: string | null
          priority_order: number | null
          provider_code: string | null
        }
        Insert: {
          capability_key: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_id?: string | null
          priority_order?: number | null
          provider_code?: string | null
        }
        Update: {
          capability_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_id?: string | null
          priority_order?: number | null
          provider_code?: string | null
        }
        Relationships: []
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
        ]
      }
      ai_cost_history: {
        Row: {
          cost_by_model: Json | null
          cost_by_provider: Json | null
          cost_by_task: Json | null
          created_at: string | null
          date: string
          hour: number | null
          id: string
          tenant_id: string | null
          total_cost: number | null
          total_executions: number | null
          total_tokens: number | null
        }
        Insert: {
          cost_by_model?: Json | null
          cost_by_provider?: Json | null
          cost_by_task?: Json | null
          created_at?: string | null
          date: string
          hour?: number | null
          id?: string
          tenant_id?: string | null
          total_cost?: number | null
          total_executions?: number | null
          total_tokens?: number | null
        }
        Update: {
          cost_by_model?: Json | null
          cost_by_provider?: Json | null
          cost_by_task?: Json | null
          created_at?: string | null
          date?: string
          hour?: number | null
          id?: string
          tenant_id?: string | null
          total_cost?: number | null
          total_executions?: number | null
          total_tokens?: number | null
        }
        Relationships: []
      }
      ai_cost_log: {
        Row: {
          action: string
          category: string
          cost_usd: number | null
          created_at: string | null
          details: string | null
          id: string
          metadata: Json | null
          model: string | null
          provider: string | null
          tokens_input: number | null
          tokens_output: number | null
          user_email: string | null
        }
        Insert: {
          action: string
          category: string
          cost_usd?: number | null
          created_at?: string | null
          details?: string | null
          id?: string
          metadata?: Json | null
          model?: string | null
          provider?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_email?: string | null
        }
        Update: {
          action?: string
          category?: string
          cost_usd?: number | null
          created_at?: string | null
          details?: string | null
          id?: string
          metadata?: Json | null
          model?: string | null
          provider?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_email?: string | null
        }
        Relationships: []
      }
      ai_execution_logs: {
        Row: {
          capability_key: string | null
          cost_cents: number | null
          created_at: string | null
          id: string
          latency_ms: number | null
          model_id: string | null
          provider_code: string | null
          status: string | null
          tokens_input: number | null
          tokens_output: number | null
        }
        Insert: {
          capability_key?: string | null
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          model_id?: string | null
          provider_code?: string | null
          status?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Update: {
          capability_key?: string | null
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          model_id?: string | null
          provider_code?: string | null
          status?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Relationships: []
      }
      ai_function_config: {
        Row: {
          ab_test_model_id: string | null
          ab_test_percentage: number | null
          created_at: string | null
          current_model_id: string
          description: string | null
          display_name: string
          estimated_monthly_calls: number | null
          estimated_monthly_cost: number | null
          function_name: string
          id: string
          is_active: boolean | null
          is_user_facing: boolean | null
          quality_requirement: string | null
          updated_at: string | null
        }
        Insert: {
          ab_test_model_id?: string | null
          ab_test_percentage?: number | null
          created_at?: string | null
          current_model_id: string
          description?: string | null
          display_name: string
          estimated_monthly_calls?: number | null
          estimated_monthly_cost?: number | null
          function_name: string
          id?: string
          is_active?: boolean | null
          is_user_facing?: boolean | null
          quality_requirement?: string | null
          updated_at?: string | null
        }
        Update: {
          ab_test_model_id?: string | null
          ab_test_percentage?: number | null
          created_at?: string | null
          current_model_id?: string
          description?: string | null
          display_name?: string
          estimated_monthly_calls?: number | null
          estimated_monthly_cost?: number | null
          function_name?: string
          id?: string
          is_active?: boolean | null
          is_user_facing?: boolean | null
          quality_requirement?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_function_config_ab_test_model_id_fkey"
            columns: ["ab_test_model_id"]
            isOneToOne: false
            referencedRelation: "ai_model_catalog"
            referencedColumns: ["model_id"]
          },
          {
            foreignKeyName: "ai_function_config_current_model_id_fkey"
            columns: ["current_model_id"]
            isOneToOne: false
            referencedRelation: "ai_model_catalog"
            referencedColumns: ["model_id"]
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
            foreignKeyName: "ai_generated_documents_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
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
      ai_knowledge_base: {
        Row: {
          category: string
          chatbot_scope: string | null
          content: string
          conversion_hook: string | null
          created_at: string
          embedding: string | null
          id: string
          is_active: boolean
          is_current: boolean | null
          kb_code: string | null
          keywords: string[]
          language: string | null
          priority: number | null
          retrieval_count: number | null
          search_vector: unknown
          source: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          category: string
          chatbot_scope?: string | null
          content: string
          conversion_hook?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          is_active?: boolean
          is_current?: boolean | null
          kb_code?: string | null
          keywords?: string[]
          language?: string | null
          priority?: number | null
          retrieval_count?: number | null
          search_vector?: unknown
          source?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          category?: string
          chatbot_scope?: string | null
          content?: string
          conversion_hook?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          is_active?: boolean
          is_current?: boolean | null
          kb_code?: string | null
          keywords?: string[]
          language?: string | null
          priority?: number | null
          retrieval_count?: number | null
          search_vector?: unknown
          source?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
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
      ai_model_catalog: {
        Row: {
          created_at: string | null
          deprecated_date: string | null
          id: string
          is_active: boolean | null
          model_id: string
          model_name: string
          notes: string | null
          price_cache_read_per_mtok: number | null
          price_cache_write_per_mtok: number | null
          price_input_per_mtok: number
          price_output_per_mtok: number
          price_web_search_per_call: number | null
          provider: string
          quality_classification: number | null
          quality_extraction: number | null
          quality_reasoning: number | null
          release_date: string | null
          supports_computer_use: boolean | null
          supports_web_search: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deprecated_date?: string | null
          id?: string
          is_active?: boolean | null
          model_id: string
          model_name: string
          notes?: string | null
          price_cache_read_per_mtok?: number | null
          price_cache_write_per_mtok?: number | null
          price_input_per_mtok?: number
          price_output_per_mtok?: number
          price_web_search_per_call?: number | null
          provider?: string
          quality_classification?: number | null
          quality_extraction?: number | null
          quality_reasoning?: number | null
          release_date?: string | null
          supports_computer_use?: boolean | null
          supports_web_search?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deprecated_date?: string | null
          id?: string
          is_active?: boolean | null
          model_id?: string
          model_name?: string
          notes?: string | null
          price_cache_read_per_mtok?: number | null
          price_cache_write_per_mtok?: number | null
          price_input_per_mtok?: number
          price_output_per_mtok?: number
          price_web_search_per_call?: number | null
          provider?: string
          quality_classification?: number | null
          quality_extraction?: number | null
          quality_reasoning?: number | null
          release_date?: string | null
          supports_computer_use?: boolean | null
          supports_web_search?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_model_prices: {
        Row: {
          created_at: string | null
          currency: string | null
          effective_from: string
          effective_to: string | null
          id: string
          input_price_per_million: number
          model_id: string
          output_price_per_million: number
          source: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          input_price_per_million: number
          model_id: string
          output_price_per_million: number
          source?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          input_price_per_million?: number
          model_id?: string
          output_price_per_million?: number
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_model_prices_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          capabilities: Json | null
          context_window: number | null
          cost_per_1k_input: number | null
          cost_per_1k_output: number | null
          created_at: string | null
          deprecated_at: string | null
          description: string | null
          discovered_at: string | null
          id: string
          input_cost_per_1m: number | null
          is_active: boolean | null
          is_default_for_provider: boolean | null
          max_output_tokens: number | null
          model_id: string
          model_name: string | null
          name: string
          output_cost_per_1m: number | null
          price_per_million_input: number | null
          price_per_million_output: number | null
          provider_id: string | null
          quality_rating: number | null
          speed_rating: number | null
          supports_function_calling: boolean | null
          supports_vision: boolean | null
          tier: string | null
          updated_at: string | null
          use_case: string | null
        }
        Insert: {
          capabilities?: Json | null
          context_window?: number | null
          cost_per_1k_input?: number | null
          cost_per_1k_output?: number | null
          created_at?: string | null
          deprecated_at?: string | null
          description?: string | null
          discovered_at?: string | null
          id?: string
          input_cost_per_1m?: number | null
          is_active?: boolean | null
          is_default_for_provider?: boolean | null
          max_output_tokens?: number | null
          model_id: string
          model_name?: string | null
          name: string
          output_cost_per_1m?: number | null
          price_per_million_input?: number | null
          price_per_million_output?: number | null
          provider_id?: string | null
          quality_rating?: number | null
          speed_rating?: number | null
          supports_function_calling?: boolean | null
          supports_vision?: boolean | null
          tier?: string | null
          updated_at?: string | null
          use_case?: string | null
        }
        Update: {
          capabilities?: Json | null
          context_window?: number | null
          cost_per_1k_input?: number | null
          cost_per_1k_output?: number | null
          created_at?: string | null
          deprecated_at?: string | null
          description?: string | null
          discovered_at?: string | null
          id?: string
          input_cost_per_1m?: number | null
          is_active?: boolean | null
          is_default_for_provider?: boolean | null
          max_output_tokens?: number | null
          model_id?: string
          model_name?: string | null
          name?: string
          output_cost_per_1m?: number | null
          price_per_million_input?: number | null
          price_per_million_output?: number | null
          provider_id?: string | null
          quality_rating?: number | null
          speed_rating?: number | null
          supports_function_calling?: boolean | null
          supports_vision?: boolean | null
          tier?: string | null
          updated_at?: string | null
          use_case?: string | null
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
      ai_module_config: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          features: Json
          included_in_plans: string[]
          module_code: string
          monthly_limit: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          features?: Json
          included_in_plans?: string[]
          module_code: string
          monthly_limit?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          features?: Json
          included_in_plans?: string[]
          module_code?: string
          monthly_limit?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_module_usage: {
        Row: {
          created_at: string
          id: string
          module_code: string
          organization_id: string | null
          period_start: string
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_code: string
          organization_id?: string | null
          period_start: string
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module_code?: string
          organization_id?: string | null
          period_start?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      ai_optimization_suggestions: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          created_at: string | null
          current_cost_monthly: number | null
          current_model_id: string | null
          function_name: string
          id: string
          priority: string | null
          quality_impact: string | null
          rationale: string | null
          rejection_reason: string | null
          savings_per_month_usd: number | null
          savings_percentage: number | null
          status: string | null
          suggested_cost_monthly: number | null
          suggested_model_id: string | null
          suggestion_type: string
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          created_at?: string | null
          current_cost_monthly?: number | null
          current_model_id?: string | null
          function_name: string
          id?: string
          priority?: string | null
          quality_impact?: string | null
          rationale?: string | null
          rejection_reason?: string | null
          savings_per_month_usd?: number | null
          savings_percentage?: number | null
          status?: string | null
          suggested_cost_monthly?: number | null
          suggested_model_id?: string | null
          suggestion_type: string
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          created_at?: string | null
          current_cost_monthly?: number | null
          current_model_id?: string | null
          function_name?: string
          id?: string
          priority?: string | null
          quality_impact?: string | null
          rationale?: string | null
          rejection_reason?: string | null
          savings_per_month_usd?: number | null
          savings_percentage?: number | null
          status?: string | null
          suggested_cost_monthly?: number | null
          suggested_model_id?: string | null
          suggestion_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_prompt_changes: {
        Row: {
          change_reason: string | null
          changed_at: string | null
          changed_by: string | null
          field_changed: string
          id: string
          new_value: string | null
          old_value: string | null
          prompt_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          field_changed: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          prompt_id: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          field_changed?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          prompt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_changes_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompt_comments: {
        Row: {
          comment: string
          comment_type: string | null
          created_at: string | null
          created_by: string | null
          field_reference: string | null
          id: string
          is_resolved: boolean | null
          line_number: number | null
          prompt_id: string
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          comment: string
          comment_type?: string | null
          created_at?: string | null
          created_by?: string | null
          field_reference?: string | null
          id?: string
          is_resolved?: boolean | null
          line_number?: number | null
          prompt_id: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          comment?: string
          comment_type?: string | null
          created_at?: string | null
          created_by?: string | null
          field_reference?: string | null
          id?: string
          is_resolved?: boolean | null
          line_number?: number | null
          prompt_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_comments_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
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
      ai_prompts: {
        Row: {
          avg_cost: number | null
          avg_input_tokens: number | null
          avg_latency_ms: number | null
          avg_output_tokens: number | null
          avg_quality_score: number | null
          created_at: string | null
          created_by: string | null
          deprecated_at: string | null
          deprecated_by: string | null
          deprecation_reason: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_latest: boolean | null
          model_code: string | null
          name: string
          output_format: string | null
          output_schema: Json | null
          parent_version_id: string | null
          prompt_id: string | null
          published_at: string | null
          published_by: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_by: string | null
          submitted_for_review_at: string | null
          success_rate: number | null
          suggested_max_tokens: number | null
          suggested_temperature: number | null
          system_prompt: string | null
          task_id: string | null
          tools_enabled: boolean | null
          tools_schema: Json | null
          updated_at: string | null
          updated_by: string | null
          user_prompt_template: string
          variables: Json | null
          version: number
        }
        Insert: {
          avg_cost?: number | null
          avg_input_tokens?: number | null
          avg_latency_ms?: number | null
          avg_output_tokens?: number | null
          avg_quality_score?: number | null
          created_at?: string | null
          created_by?: string | null
          deprecated_at?: string | null
          deprecated_by?: string | null
          deprecation_reason?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_latest?: boolean | null
          model_code?: string | null
          name: string
          output_format?: string | null
          output_schema?: Json | null
          parent_version_id?: string | null
          prompt_id?: string | null
          published_at?: string | null
          published_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_by?: string | null
          submitted_for_review_at?: string | null
          success_rate?: number | null
          suggested_max_tokens?: number | null
          suggested_temperature?: number | null
          system_prompt?: string | null
          task_id?: string | null
          tools_enabled?: boolean | null
          tools_schema?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          user_prompt_template: string
          variables?: Json | null
          version?: number
        }
        Update: {
          avg_cost?: number | null
          avg_input_tokens?: number | null
          avg_latency_ms?: number | null
          avg_output_tokens?: number | null
          avg_quality_score?: number | null
          created_at?: string | null
          created_by?: string | null
          deprecated_at?: string | null
          deprecated_by?: string | null
          deprecation_reason?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_latest?: boolean | null
          model_code?: string | null
          name?: string
          output_format?: string | null
          output_schema?: Json | null
          parent_version_id?: string | null
          prompt_id?: string | null
          published_at?: string | null
          published_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_by?: string | null
          submitted_for_review_at?: string | null
          success_rate?: number | null
          suggested_max_tokens?: number | null
          suggested_temperature?: number | null
          system_prompt?: string | null
          task_id?: string | null
          tools_enabled?: boolean | null
          tools_schema?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          user_prompt_template?: string
          variables?: Json | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompts_parent_version_id_fkey"
            columns: ["parent_version_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompts_task_fk"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "ai_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "ai_task_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_provider_connections: {
        Row: {
          api_key_encrypted: string | null
          api_key_hint: string | null
          base_url: string | null
          config: Json | null
          config_encrypted: string | null
          created_at: string | null
          created_by: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_verified_at: string | null
          provider_name: string
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          api_key_hint?: string | null
          base_url?: string | null
          config?: Json | null
          config_encrypted?: string | null
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_verified_at?: string | null
          provider_name: string
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          api_key_hint?: string | null
          base_url?: string | null
          config?: Json | null
          config_encrypted?: string | null
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_verified_at?: string | null
          provider_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_provider_health_log: {
        Row: {
          check_type: string | null
          checked_at: string | null
          created_at: string | null
          error_code: string | null
          error_message: string | null
          execution_id: string | null
          id: string
          is_healthy: boolean
          latency_ms: number | null
          provider_id: string
        }
        Insert: {
          check_type?: string | null
          checked_at?: string | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          execution_id?: string | null
          id?: string
          is_healthy: boolean
          latency_ms?: number | null
          provider_id: string
        }
        Update: {
          check_type?: string | null
          checked_at?: string | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          execution_id?: string | null
          id?: string
          is_healthy?: boolean
          latency_ms?: number | null
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_provider_health_log_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_providers: {
        Row: {
          api_base_url: string | null
          api_key_configured: boolean | null
          api_key_encrypted: string | null
          avg_latency_1h: number | null
          avg_latency_ms: number | null
          base_url: string | null
          circuit_half_open_at: string | null
          circuit_open: boolean | null
          circuit_opened_at: string | null
          code: string
          config: Json | null
          consecutive_failures: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          docs_url: string | null
          error_count_1h: number | null
          get_api_key_url: string | null
          health_latency_ms: number | null
          health_status: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_configured: boolean | null
          is_gateway: boolean | null
          last_error_at: string | null
          last_error_message: string | null
          last_health_check_at: string | null
          last_used_at: string | null
          logo_url: string | null
          models_last_synced_at: string | null
          name: string
          provider_id: string | null
          rate_limit_rpm: number | null
          status: string | null
          success_count_1h: number | null
          success_rate_24h: number | null
          supported_features: string[] | null
          supports_chat: boolean | null
          supports_embeddings: boolean | null
          supports_tools: boolean | null
          supports_vision: boolean | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          api_base_url?: string | null
          api_key_configured?: boolean | null
          api_key_encrypted?: string | null
          avg_latency_1h?: number | null
          avg_latency_ms?: number | null
          base_url?: string | null
          circuit_half_open_at?: string | null
          circuit_open?: boolean | null
          circuit_opened_at?: string | null
          code: string
          config?: Json | null
          consecutive_failures?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          docs_url?: string | null
          error_count_1h?: number | null
          get_api_key_url?: string | null
          health_latency_ms?: number | null
          health_status?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_configured?: boolean | null
          is_gateway?: boolean | null
          last_error_at?: string | null
          last_error_message?: string | null
          last_health_check_at?: string | null
          last_used_at?: string | null
          logo_url?: string | null
          models_last_synced_at?: string | null
          name: string
          provider_id?: string | null
          rate_limit_rpm?: number | null
          status?: string | null
          success_count_1h?: number | null
          success_rate_24h?: number | null
          supported_features?: string[] | null
          supports_chat?: boolean | null
          supports_embeddings?: boolean | null
          supports_tools?: boolean | null
          supports_vision?: boolean | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          api_base_url?: string | null
          api_key_configured?: boolean | null
          api_key_encrypted?: string | null
          avg_latency_1h?: number | null
          avg_latency_ms?: number | null
          base_url?: string | null
          circuit_half_open_at?: string | null
          circuit_open?: boolean | null
          circuit_opened_at?: string | null
          code?: string
          config?: Json | null
          consecutive_failures?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          docs_url?: string | null
          error_count_1h?: number | null
          get_api_key_url?: string | null
          health_latency_ms?: number | null
          health_status?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_configured?: boolean | null
          is_gateway?: boolean | null
          last_error_at?: string | null
          last_error_message?: string | null
          last_health_check_at?: string | null
          last_used_at?: string | null
          logo_url?: string | null
          models_last_synced_at?: string | null
          name?: string
          provider_id?: string | null
          rate_limit_rpm?: number | null
          status?: string | null
          success_count_1h?: number | null
          success_rate_24h?: number | null
          supported_features?: string[] | null
          supports_chat?: boolean | null
          supports_embeddings?: boolean | null
          supports_tools?: boolean | null
          supports_vision?: boolean | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      ai_quality_evaluations: {
        Row: {
          criteria_scores: Json | null
          evaluated_at: string | null
          evaluated_by: string
          execution_id: string | null
          id: string
          score: number
          strengths: string | null
          suggestions: string | null
          test_result_id: string | null
          weaknesses: string | null
        }
        Insert: {
          criteria_scores?: Json | null
          evaluated_at?: string | null
          evaluated_by: string
          execution_id?: string | null
          id?: string
          score: number
          strengths?: string | null
          suggestions?: string | null
          test_result_id?: string | null
          weaknesses?: string | null
        }
        Update: {
          criteria_scores?: Json | null
          evaluated_at?: string | null
          evaluated_by?: string
          execution_id?: string | null
          id?: string
          score?: number
          strengths?: string | null
          suggestions?: string | null
          test_result_id?: string | null
          weaknesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_quality_evaluations_test_result_id_fkey"
            columns: ["test_result_id"]
            isOneToOne: false
            referencedRelation: "ai_test_results"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
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
            foreignKeyName: "ai_request_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_research_reports: {
        Row: {
          citations: string[] | null
          created_at: string | null
          focus_areas: string[] | null
          functions_analyzed: number | null
          id: string
          models_analyzed: number | null
          raw_content: string | null
          report_type: string
          structured_data: Json | null
        }
        Insert: {
          citations?: string[] | null
          created_at?: string | null
          focus_areas?: string[] | null
          functions_analyzed?: number | null
          id?: string
          models_analyzed?: number | null
          raw_content?: string | null
          report_type?: string
          structured_data?: Json | null
        }
        Update: {
          citations?: string[] | null
          created_at?: string | null
          focus_areas?: string[] | null
          functions_analyzed?: number | null
          id?: string
          models_analyzed?: number | null
          raw_content?: string | null
          report_type?: string
          structured_data?: Json | null
        }
        Relationships: []
      }
      ai_task_assignments: {
        Row: {
          ai_task_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          edge_function: string | null
          fallback_1_model_id: string | null
          fallback_2_model_id: string | null
          id: string
          is_active: boolean | null
          max_retries: number | null
          max_tokens: number | null
          module: string | null
          primary_model_id: string | null
          priority: number | null
          prompt_id: string | null
          provider_id: string | null
          rag_collection_ids: string[] | null
          rag_enabled: boolean | null
          rag_top_k: number | null
          requires_tools: boolean | null
          requires_vision: boolean | null
          system_prompt_override: string | null
          task_code: string
          task_name: string
          temperature: number | null
          timeout_ms: number | null
          updated_at: string | null
        }
        Insert: {
          ai_task_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          edge_function?: string | null
          fallback_1_model_id?: string | null
          fallback_2_model_id?: string | null
          id?: string
          is_active?: boolean | null
          max_retries?: number | null
          max_tokens?: number | null
          module?: string | null
          primary_model_id?: string | null
          priority?: number | null
          prompt_id?: string | null
          provider_id?: string | null
          rag_collection_ids?: string[] | null
          rag_enabled?: boolean | null
          rag_top_k?: number | null
          requires_tools?: boolean | null
          requires_vision?: boolean | null
          system_prompt_override?: string | null
          task_code: string
          task_name: string
          temperature?: number | null
          timeout_ms?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_task_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          edge_function?: string | null
          fallback_1_model_id?: string | null
          fallback_2_model_id?: string | null
          id?: string
          is_active?: boolean | null
          max_retries?: number | null
          max_tokens?: number | null
          module?: string | null
          primary_model_id?: string | null
          priority?: number | null
          prompt_id?: string | null
          provider_id?: string | null
          rag_collection_ids?: string[] | null
          rag_enabled?: boolean | null
          rag_top_k?: number | null
          requires_tools?: boolean | null
          requires_vision?: boolean | null
          system_prompt_override?: string | null
          task_code?: string
          task_name?: string
          temperature?: number | null
          timeout_ms?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_task_assignments_ai_task_id_fkey"
            columns: ["ai_task_id"]
            isOneToOne: false
            referencedRelation: "ai_tasks"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "ai_task_assignments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_task_rag_config: {
        Row: {
          auto_filter_current: boolean | null
          auto_filter_jurisdiction: boolean | null
          auto_filter_language: boolean | null
          created_at: string | null
          id: string
          injection_template: string | null
          is_active: boolean | null
          knowledge_base_ids: string[]
          max_context_tokens: number | null
          similarity_threshold: number | null
          task_id: string | null
          tenant_id: string | null
          top_k: number | null
          updated_at: string | null
        }
        Insert: {
          auto_filter_current?: boolean | null
          auto_filter_jurisdiction?: boolean | null
          auto_filter_language?: boolean | null
          created_at?: string | null
          id?: string
          injection_template?: string | null
          is_active?: boolean | null
          knowledge_base_ids: string[]
          max_context_tokens?: number | null
          similarity_threshold?: number | null
          task_id?: string | null
          tenant_id?: string | null
          top_k?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_filter_current?: boolean | null
          auto_filter_jurisdiction?: boolean | null
          auto_filter_language?: boolean | null
          created_at?: string | null
          id?: string
          injection_template?: string | null
          is_active?: boolean | null
          knowledge_base_ids?: string[]
          max_context_tokens?: number | null
          similarity_threshold?: number | null
          task_id?: string | null
          tenant_id?: string | null
          top_k?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_task_rag_config_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "ai_task_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tasks: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string | null
          priority: number | null
          task_code: string | null
          task_id: string | null
          task_name: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id: string
          is_active?: boolean | null
          name?: string | null
          priority?: number | null
          task_code?: string | null
          task_id?: string | null
          task_name?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          priority?: number | null
          task_code?: string | null
          task_id?: string | null
          task_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_test_cases: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          expected_contains: string[] | null
          expected_format: string | null
          expected_max_length: number | null
          expected_min_length: number | null
          expected_not_contains: string[] | null
          expected_schema: Json | null
          id: string
          input_variables: Json
          is_active: boolean | null
          is_golden: boolean | null
          name: string
          priority: number | null
          reference_output: string | null
          similarity_threshold: number | null
          suite_id: string
          tags: string[] | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_contains?: string[] | null
          expected_format?: string | null
          expected_max_length?: number | null
          expected_min_length?: number | null
          expected_not_contains?: string[] | null
          expected_schema?: Json | null
          id?: string
          input_variables?: Json
          is_active?: boolean | null
          is_golden?: boolean | null
          name: string
          priority?: number | null
          reference_output?: string | null
          similarity_threshold?: number | null
          suite_id: string
          tags?: string[] | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_contains?: string[] | null
          expected_format?: string | null
          expected_max_length?: number | null
          expected_min_length?: number | null
          expected_not_contains?: string[] | null
          expected_schema?: Json | null
          id?: string
          input_variables?: Json
          is_active?: boolean | null
          is_golden?: boolean | null
          name?: string
          priority?: number | null
          reference_output?: string | null
          similarity_threshold?: number | null
          suite_id?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_test_cases_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "ai_test_suites"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_test_results: {
        Row: {
          actual_output: string | null
          cost: number | null
          created_at: string | null
          error_message: string | null
          evaluated_at: string | null
          evaluated_by: string | null
          id: string
          input_tokens: number | null
          latency_ms: number | null
          output_tokens: number | null
          quality_notes: string | null
          quality_score: number | null
          run_id: string
          status: string
          test_case_id: string
          validations: Json | null
        }
        Insert: {
          actual_output?: string | null
          cost?: number | null
          created_at?: string | null
          error_message?: string | null
          evaluated_at?: string | null
          evaluated_by?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          output_tokens?: number | null
          quality_notes?: string | null
          quality_score?: number | null
          run_id: string
          status: string
          test_case_id: string
          validations?: Json | null
        }
        Update: {
          actual_output?: string | null
          cost?: number | null
          created_at?: string | null
          error_message?: string | null
          evaluated_at?: string | null
          evaluated_by?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          output_tokens?: number | null
          quality_notes?: string | null
          quality_score?: number | null
          run_id?: string
          status?: string
          test_case_id?: string
          validations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_test_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ai_test_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_test_results_test_case_id_fkey"
            columns: ["test_case_id"]
            isOneToOne: false
            referencedRelation: "ai_test_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_test_runs: {
        Row: {
          avg_latency_ms: number | null
          avg_quality_score: number | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          failed_tests: number | null
          id: string
          model_code: string | null
          pass_rate: number | null
          passed: boolean | null
          passed_tests: number | null
          prompt_id: string | null
          skipped_tests: number | null
          started_at: string | null
          status: string | null
          suite_id: string
          temperature: number | null
          total_cost: number | null
          total_latency_ms: number | null
          total_tests: number | null
          total_tokens: number | null
          triggered_by: string
          triggered_by_user: string | null
        }
        Insert: {
          avg_latency_ms?: number | null
          avg_quality_score?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          failed_tests?: number | null
          id?: string
          model_code?: string | null
          pass_rate?: number | null
          passed?: boolean | null
          passed_tests?: number | null
          prompt_id?: string | null
          skipped_tests?: number | null
          started_at?: string | null
          status?: string | null
          suite_id: string
          temperature?: number | null
          total_cost?: number | null
          total_latency_ms?: number | null
          total_tests?: number | null
          total_tokens?: number | null
          triggered_by?: string
          triggered_by_user?: string | null
        }
        Update: {
          avg_latency_ms?: number | null
          avg_quality_score?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          failed_tests?: number | null
          id?: string
          model_code?: string | null
          pass_rate?: number | null
          passed?: boolean | null
          passed_tests?: number | null
          prompt_id?: string | null
          skipped_tests?: number | null
          started_at?: string | null
          status?: string | null
          suite_id?: string
          temperature?: number | null
          total_cost?: number | null
          total_latency_ms?: number | null
          total_tests?: number | null
          total_tokens?: number | null
          triggered_by?: string
          triggered_by_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_test_runs_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "ai_test_suites"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_test_suites: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_required_for_publish: boolean | null
          name: string
          pass_threshold: number | null
          task_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required_for_publish?: boolean | null
          name: string
          pass_threshold?: number | null
          task_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required_for_publish?: boolean | null
          name?: string
          pass_threshold?: number | null
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_test_suites_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "ai_task_assignments"
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
            foreignKeyName: "ai_transaction_ledger_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      ai_usage_log: {
        Row: {
          cache_read_tokens: number | null
          cache_write_tokens: number | null
          chat_message_id: string | null
          chat_session_id: string | null
          computer_use_steps: number | null
          context_id: string | null
          context_type: string | null
          cost_cache_read_usd: number | null
          cost_cache_write_usd: number | null
          cost_computer_use_usd: number | null
          cost_input_usd: number | null
          cost_output_usd: number | null
          cost_total_cents: number | null
          cost_total_usd: number | null
          cost_web_search_usd: number | null
          created_at: string | null
          function_name: string | null
          had_retry: boolean | null
          id: string
          input_tokens: number | null
          latency_ms: number | null
          model_id: string | null
          output_tokens: number | null
          processing_ms: number | null
          prompt_efficiency_score: number | null
          provider: string | null
          provider_code: string | null
          retry_count: number | null
          status: string | null
          stop_reason: string | null
          success: boolean | null
          task_category: string | null
          task_subcategory: string | null
          tokens_input: number | null
          tokens_output: number | null
          user_id: string | null
          web_search_calls: number | null
        }
        Insert: {
          cache_read_tokens?: number | null
          cache_write_tokens?: number | null
          chat_message_id?: string | null
          chat_session_id?: string | null
          computer_use_steps?: number | null
          context_id?: string | null
          context_type?: string | null
          cost_cache_read_usd?: number | null
          cost_cache_write_usd?: number | null
          cost_computer_use_usd?: number | null
          cost_input_usd?: number | null
          cost_output_usd?: number | null
          cost_total_cents?: number | null
          cost_total_usd?: number | null
          cost_web_search_usd?: number | null
          created_at?: string | null
          function_name?: string | null
          had_retry?: boolean | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model_id?: string | null
          output_tokens?: number | null
          processing_ms?: number | null
          prompt_efficiency_score?: number | null
          provider?: string | null
          provider_code?: string | null
          retry_count?: number | null
          status?: string | null
          stop_reason?: string | null
          success?: boolean | null
          task_category?: string | null
          task_subcategory?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
          web_search_calls?: number | null
        }
        Update: {
          cache_read_tokens?: number | null
          cache_write_tokens?: number | null
          chat_message_id?: string | null
          chat_session_id?: string | null
          computer_use_steps?: number | null
          context_id?: string | null
          context_type?: string | null
          cost_cache_read_usd?: number | null
          cost_cache_write_usd?: number | null
          cost_computer_use_usd?: number | null
          cost_input_usd?: number | null
          cost_output_usd?: number | null
          cost_total_cents?: number | null
          cost_total_usd?: number | null
          cost_web_search_usd?: number | null
          created_at?: string | null
          function_name?: string | null
          had_retry?: boolean | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model_id?: string | null
          output_tokens?: number | null
          processing_ms?: number | null
          prompt_efficiency_score?: number | null
          provider?: string | null
          provider_code?: string | null
          retry_count?: number | null
          status?: string | null
          stop_reason?: string | null
          success?: boolean | null
          task_category?: string | null
          task_subcategory?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
          web_search_calls?: number | null
        }
        Relationships: []
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
        Relationships: []
      }
      alert_types: {
        Row: {
          auto_email: boolean | null
          code: string
          created_at: string | null
          default_priority: string | null
          description: string | null
          email_template: string | null
          id: string
          is_active: boolean | null
          name: string
          suggested_action: string | null
        }
        Insert: {
          auto_email?: boolean | null
          code: string
          created_at?: string | null
          default_priority?: string | null
          description?: string | null
          email_template?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          suggested_action?: string | null
        }
        Update: {
          auto_email?: boolean | null
          code?: string
          created_at?: string | null
          default_priority?: string | null
          description?: string | null
          email_template?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          suggested_action?: string | null
        }
        Relationships: []
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
          page_url: string | null
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
          page_url?: string | null
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
          page_url?: string | null
          properties?: Json | null
          referrer?: string | null
          region?: string | null
          screen_resolution?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      b2c_cases: {
        Row: {
          assigned_agent_id: string | null
          brand_name: string | null
          brand_type: string | null
          case_number: string
          classes: Json | null
          created_at: string
          currency: string | null
          holder_data: Json | null
          id: string
          jurisdiction_code: string | null
          jurisdiction_id: string | null
          logo_url: string | null
          nice_classes: Json | null
          payment_date: string | null
          pricing: Json | null
          quote_sent_at: string | null
          requires_manual_pricing: boolean | null
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          total_amount: number | null
          trademark_name: string | null
          trademark_type: string | null
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          brand_name?: string | null
          brand_type?: string | null
          case_number: string
          classes?: Json | null
          created_at?: string
          currency?: string | null
          holder_data?: Json | null
          id?: string
          jurisdiction_code?: string | null
          jurisdiction_id?: string | null
          logo_url?: string | null
          nice_classes?: Json | null
          payment_date?: string | null
          pricing?: Json | null
          quote_sent_at?: string | null
          requires_manual_pricing?: boolean | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number | null
          trademark_name?: string | null
          trademark_type?: string | null
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          brand_name?: string | null
          brand_type?: string | null
          case_number?: string
          classes?: Json | null
          created_at?: string
          currency?: string | null
          holder_data?: Json | null
          id?: string
          jurisdiction_code?: string | null
          jurisdiction_id?: string | null
          logo_url?: string | null
          nice_classes?: Json | null
          payment_date?: string | null
          pricing?: Json | null
          quote_sent_at?: string | null
          requires_manual_pricing?: boolean | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number | null
          trademark_name?: string | null
          trademark_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bella_knowledge_base: {
        Row: {
          content: string
          embedding: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          section: string
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          content: string
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          section: string
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          content?: string
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          section?: string
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      bug_report_replies: {
        Row: {
          author_id: string | null
          author_name: string | null
          author_role: string | null
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          report_id: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          author_role?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          report_id: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          author_role?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bug_report_replies_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "bug_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      bug_reports: {
        Row: {
          admin_notes: string | null
          browser_info: Json | null
          console_errors: Json | null
          created_at: string
          description: string | null
          id: string
          navigation_history: Json | null
          page_route: string | null
          page_title: string | null
          page_url: string | null
          reporter_email: string | null
          reporter_id: string | null
          reporter_name: string | null
          reporter_role: string | null
          resolved_at: string | null
          screenshot_url: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          browser_info?: Json | null
          console_errors?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          navigation_history?: Json | null
          page_route?: string | null
          page_title?: string | null
          page_url?: string | null
          reporter_email?: string | null
          reporter_id?: string | null
          reporter_name?: string | null
          reporter_role?: string | null
          resolved_at?: string | null
          screenshot_url?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          browser_info?: Json | null
          console_errors?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          navigation_history?: Json | null
          page_route?: string | null
          page_title?: string | null
          page_url?: string | null
          reporter_email?: string | null
          reporter_id?: string | null
          reporter_name?: string | null
          reporter_role?: string | null
          resolved_at?: string | null
          screenshot_url?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      classification_sync_logs: {
        Row: {
          classification_system: Database["public"]["Enums"]["classification_system"]
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          records_added: number | null
          records_deleted: number | null
          records_updated: number | null
          started_at: string
          status: string
          version_after: string
          version_before: string | null
        }
        Insert: {
          classification_system: Database["public"]["Enums"]["classification_system"]
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          records_added?: number | null
          records_deleted?: number | null
          records_updated?: number | null
          started_at?: string
          status?: string
          version_after: string
          version_before?: string | null
        }
        Update: {
          classification_system?: Database["public"]["Enums"]["classification_system"]
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          records_added?: number | null
          records_deleted?: number | null
          records_updated?: number | null
          started_at?: string
          status?: string
          version_after?: string
          version_before?: string | null
        }
        Relationships: []
      }
      classification_systems: {
        Row: {
          code: Database["public"]["Enums"]["classification_system"]
          created_at: string | null
          current_version: string
          description: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          name: string
          next_sync_at: string | null
          source_url: string
          sync_status: string | null
          updated_at: string | null
          version_date: string
        }
        Insert: {
          code: Database["public"]["Enums"]["classification_system"]
          created_at?: string | null
          current_version: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name: string
          next_sync_at?: string | null
          source_url: string
          sync_status?: string | null
          updated_at?: string | null
          version_date: string
        }
        Update: {
          code?: Database["public"]["Enums"]["classification_system"]
          created_at?: string | null
          current_version?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name?: string
          next_sync_at?: string | null
          source_url?: string
          sync_status?: string | null
          updated_at?: string | null
          version_date?: string
        }
        Relationships: []
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
        ]
      }
      client_contacts: {
        Row: {
          client_id: string
          created_at: string | null
          created_by: string | null
          department: string | null
          email: string | null
          first_name: string
          id: string
          is_active: boolean | null
          is_billing_contact: boolean | null
          is_legal_contact: boolean | null
          is_primary: boolean | null
          job_title: string | null
          last_name: string | null
          metadata: Json | null
          mobile: string | null
          notes: string | null
          organization_id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          is_billing_contact?: boolean | null
          is_legal_contact?: boolean | null
          is_primary?: boolean | null
          job_title?: string | null
          last_name?: string | null
          metadata?: Json | null
          mobile?: string | null
          notes?: string | null
          organization_id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          is_billing_contact?: boolean | null
          is_legal_contact?: boolean | null
          is_primary?: boolean | null
          job_title?: string | null
          last_name?: string | null
          metadata?: Json | null
          mobile?: string | null
          notes?: string | null
          organization_id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_crm_clients"
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
            foreignKeyName: "client_documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "client_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      client_folder_documents: {
        Row: {
          client_id: string
          created_at: string | null
          description: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          folder_id: string
          id: string
          name: string
          organization_id: string
          source_id: string | null
          source_type: string | null
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder_id: string
          id?: string
          name: string
          organization_id: string
          source_id?: string | null
          source_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder_id?: string
          id?: string
          name?: string
          organization_id?: string
          source_id?: string | null
          source_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_folder_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_folder_documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "client_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      client_folders: {
        Row: {
          client_id: string
          color: string | null
          created_at: string | null
          description: string | null
          folder_type: string
          icon: string | null
          id: string
          name: string
          organization_id: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          folder_type: string
          icon?: string | null
          id?: string
          name: string
          organization_id: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          folder_type?: string
          icon?: string | null
          id?: string
          name?: string
          organization_id?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_folders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "client_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      client_holders: {
        Row: {
          account_id: string
          client_reference: string | null
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          holder_id: string
          id: string
          is_active: boolean | null
          jurisdictions: string[] | null
          notes: string | null
          organization_id: string
          relationship_type: string
          representation_scope: string | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          client_reference?: string | null
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          holder_id: string
          id?: string
          is_active?: boolean | null
          jurisdictions?: string[] | null
          notes?: string | null
          organization_id: string
          relationship_type?: string
          representation_scope?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          client_reference?: string | null
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          holder_id?: string
          id?: string
          is_active?: boolean | null
          jurisdictions?: string[] | null
          notes?: string | null
          organization_id?: string
          relationship_type?: string
          representation_scope?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_holders_holder_id_fkey"
            columns: ["holder_id"]
            isOneToOne: false
            referencedRelation: "holders"
            referencedColumns: ["id"]
          },
        ]
      }
      client_relationships: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          external_company: string | null
          external_email: string | null
          external_name: string | null
          external_phone: string | null
          id: string
          is_primary: boolean | null
          notes: string | null
          organization_id: string
          related_client_id: string | null
          related_entity_type: string | null
          relationship_label: string | null
          relationship_type: string
          role_description: string | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          external_company?: string | null
          external_email?: string | null
          external_name?: string | null
          external_phone?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          organization_id: string
          related_client_id?: string | null
          related_entity_type?: string | null
          relationship_label?: string | null
          relationship_type: string
          role_description?: string | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          external_company?: string | null
          external_email?: string | null
          external_name?: string | null
          external_phone?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          organization_id?: string
          related_client_id?: string | null
          related_entity_type?: string | null
          relationship_label?: string | null
          relationship_type?: string
          role_description?: string | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_relationships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_relationships_related_client_id_fkey"
            columns: ["related_client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tag_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      client_tag_config: {
        Row: {
          category_id: string | null
          color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          category_id?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          category_id?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_tag_config_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "client_tag_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tags: {
        Row: {
          client_id: string
          created_at: string | null
          tag_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          tag_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "client_tag_config"
            referencedColumns: ["id"]
          },
        ]
      }
      client_type_config: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          assigned_to: string | null
          auth_user_id: string | null
          billing_address: Json | null
          billing_email: string | null
          city: string | null
          client_number: string | null
          client_type: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          email: string | null
          id: string
          last_order_at: string | null
          legal_name: string | null
          metadata: Json | null
          mobile: string | null
          name: string
          notes: string | null
          order_count: number | null
          payment_terms: number | null
          phone: string | null
          postal_code: string | null
          segment: string | null
          source: string | null
          source_deal_id: string | null
          source_lead_id: string | null
          state: string | null
          status: string | null
          stripe_customer_id: string | null
          tags: string[] | null
          tax_id: string | null
          total_spent: number | null
          updated_at: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          assigned_to?: string | null
          auth_user_id?: string | null
          billing_address?: Json | null
          billing_email?: string | null
          city?: string | null
          client_number?: string | null
          client_type?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          last_order_at?: string | null
          legal_name?: string | null
          metadata?: Json | null
          mobile?: string | null
          name: string
          notes?: string | null
          order_count?: number | null
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          segment?: string | null
          source?: string | null
          source_deal_id?: string | null
          source_lead_id?: string | null
          state?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          tags?: string[] | null
          tax_id?: string | null
          total_spent?: number | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          assigned_to?: string | null
          auth_user_id?: string | null
          billing_address?: Json | null
          billing_email?: string | null
          city?: string | null
          client_number?: string | null
          client_type?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          last_order_at?: string | null
          legal_name?: string | null
          metadata?: Json | null
          mobile?: string | null
          name?: string
          notes?: string | null
          order_count?: number | null
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          segment?: string | null
          source?: string | null
          source_deal_id?: string | null
          source_lead_id?: string | null
          state?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          tags?: string[] | null
          tax_id?: string | null
          total_spent?: number | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      comp_ai_scans: {
        Row: {
          ai_model: string | null
          ai_provider: string | null
          changes_detected: number | null
          competitor_id: string | null
          completed_at: string | null
          cost_estimate: number | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          prices_found: number | null
          results: Json | null
          scan_type: string
          services_found: number | null
          status: string | null
          summary: string | null
          tokens_used: number | null
        }
        Insert: {
          ai_model?: string | null
          ai_provider?: string | null
          changes_detected?: number | null
          competitor_id?: string | null
          completed_at?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          prices_found?: number | null
          results?: Json | null
          scan_type: string
          services_found?: number | null
          status?: string | null
          summary?: string | null
          tokens_used?: number | null
        }
        Update: {
          ai_model?: string | null
          ai_provider?: string | null
          changes_detected?: number | null
          competitor_id?: string | null
          completed_at?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          prices_found?: number | null
          results?: Json | null
          scan_type?: string
          services_found?: number | null
          status?: string | null
          summary?: string | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_ai_scans_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_alerts: {
        Row: {
          alert_type: string
          change_data: Json | null
          competitor_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          new_value: string | null
          old_value: string | null
          read_at: string | null
          severity: string | null
          title: string
        }
        Insert: {
          alert_type: string
          change_data?: Json | null
          competitor_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          new_value?: string | null
          old_value?: string | null
          read_at?: string | null
          severity?: string | null
          title: string
        }
        Update: {
          alert_type?: string
          change_data?: Json | null
          competitor_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          new_value?: string | null
          old_value?: string | null
          read_at?: string | null
          severity?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "comp_alerts_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_analyses: {
        Row: {
          analysis_type: string | null
          competitor_id: string | null
          created_at: string | null
          id: string
          key_findings: Json | null
          market_position: string | null
          pricing_analysis: Json | null
          recommendations: Json | null
          swot: Json | null
        }
        Insert: {
          analysis_type?: string | null
          competitor_id?: string | null
          created_at?: string | null
          id?: string
          key_findings?: Json | null
          market_position?: string | null
          pricing_analysis?: Json | null
          recommendations?: Json | null
          swot?: Json | null
        }
        Update: {
          analysis_type?: string | null
          competitor_id?: string | null
          created_at?: string | null
          id?: string
          key_findings?: Json | null
          market_position?: string | null
          pricing_analysis?: Json | null
          recommendations?: Json | null
          swot?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_analyses_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_analysis_snapshots: {
        Row: {
          analysis_date: string | null
          analysis_type: string
          created_by: string | null
          id: string
          market_summary: Json | null
          min_margin_pct: number | null
          missing_services_detail: Json | null
          recommendations_bajar: number | null
          recommendations_detail: Json | null
          recommendations_generated: number | null
          recommendations_sin_cambio: number | null
          recommendations_subir: number | null
          services_not_in_catalog: number | null
          services_with_market_data: number | null
          services_without_market_data: number | null
          strategy_name: string | null
          target_percentile: number | null
          total_captured_prices: number | null
          total_competitors: number | null
          total_deduplicated_prices: number | null
          total_normalized_prices: number | null
        }
        Insert: {
          analysis_date?: string | null
          analysis_type?: string
          created_by?: string | null
          id?: string
          market_summary?: Json | null
          min_margin_pct?: number | null
          missing_services_detail?: Json | null
          recommendations_bajar?: number | null
          recommendations_detail?: Json | null
          recommendations_generated?: number | null
          recommendations_sin_cambio?: number | null
          recommendations_subir?: number | null
          services_not_in_catalog?: number | null
          services_with_market_data?: number | null
          services_without_market_data?: number | null
          strategy_name?: string | null
          target_percentile?: number | null
          total_captured_prices?: number | null
          total_competitors?: number | null
          total_deduplicated_prices?: number | null
          total_normalized_prices?: number | null
        }
        Update: {
          analysis_date?: string | null
          analysis_type?: string
          created_by?: string | null
          id?: string
          market_summary?: Json | null
          min_margin_pct?: number | null
          missing_services_detail?: Json | null
          recommendations_bajar?: number | null
          recommendations_detail?: Json | null
          recommendations_generated?: number | null
          recommendations_sin_cambio?: number | null
          recommendations_subir?: number | null
          services_not_in_catalog?: number | null
          services_with_market_data?: number | null
          services_without_market_data?: number | null
          strategy_name?: string | null
          target_percentile?: number | null
          total_captured_prices?: number | null
          total_competitors?: number | null
          total_deduplicated_prices?: number | null
          total_normalized_prices?: number | null
        }
        Relationships: []
      }
      comp_business_rules_alerts: {
        Row: {
          action_taken: string | null
          actioned_at: string | null
          actioned_by: string | null
          alert_type: string
          change_percentage: number | null
          competitor_id: string | null
          created_at: string | null
          current_value: Json | null
          description: string
          evidence: Json | null
          id: string
          previous_value: Json | null
          service_key: string | null
          severity: string | null
          status: string | null
          title: string
        }
        Insert: {
          action_taken?: string | null
          actioned_at?: string | null
          actioned_by?: string | null
          alert_type: string
          change_percentage?: number | null
          competitor_id?: string | null
          created_at?: string | null
          current_value?: Json | null
          description: string
          evidence?: Json | null
          id?: string
          previous_value?: Json | null
          service_key?: string | null
          severity?: string | null
          status?: string | null
          title: string
        }
        Update: {
          action_taken?: string | null
          actioned_at?: string | null
          actioned_by?: string | null
          alert_type?: string
          change_percentage?: number | null
          competitor_id?: string | null
          created_at?: string | null
          current_value?: Json | null
          description?: string
          evidence?: Json | null
          id?: string
          previous_value?: Json | null
          service_key?: string | null
          severity?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "comp_business_rules_alerts_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_captured_prices: {
        Row: {
          additional_classes_price: number | null
          capture_id: string | null
          captured_at: string | null
          classes_included: number | null
          competitor_id: string
          confidence: number | null
          confidence_score: number | null
          created_at: string | null
          currency: string | null
          data_completeness: string | null
          extraction_confidence: number | null
          extraction_method: string | null
          id: string
          includes_official_fees: boolean | null
          includes_vat: boolean | null
          incompleteness_reason: string | null
          is_current: boolean | null
          is_promo_price: boolean | null
          is_verified: boolean | null
          is_volume_discount: boolean | null
          mapped_service_key: string | null
          notes: string | null
          original_text_snippet: string | null
          price: number | null
          price_includes_official_fee: boolean | null
          price_includes_search: boolean | null
          price_includes_vat: boolean | null
          price_max: number | null
          price_min: number | null
          price_original_text: string | null
          price_type: string | null
          raw_service_name: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          scan_job_id: string | null
          service_code: string | null
          service_description: string | null
          service_name: string | null
          source_page_title: string | null
          source_url: string | null
          total_displayed: number | null
          updated_at: string | null
          user_corrected_at: string | null
          user_correction_note: string | null
          user_correction_price: number | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          additional_classes_price?: number | null
          capture_id?: string | null
          captured_at?: string | null
          classes_included?: number | null
          competitor_id: string
          confidence?: number | null
          confidence_score?: number | null
          created_at?: string | null
          currency?: string | null
          data_completeness?: string | null
          extraction_confidence?: number | null
          extraction_method?: string | null
          id?: string
          includes_official_fees?: boolean | null
          includes_vat?: boolean | null
          incompleteness_reason?: string | null
          is_current?: boolean | null
          is_promo_price?: boolean | null
          is_verified?: boolean | null
          is_volume_discount?: boolean | null
          mapped_service_key?: string | null
          notes?: string | null
          original_text_snippet?: string | null
          price?: number | null
          price_includes_official_fee?: boolean | null
          price_includes_search?: boolean | null
          price_includes_vat?: boolean | null
          price_max?: number | null
          price_min?: number | null
          price_original_text?: string | null
          price_type?: string | null
          raw_service_name?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scan_job_id?: string | null
          service_code?: string | null
          service_description?: string | null
          service_name?: string | null
          source_page_title?: string | null
          source_url?: string | null
          total_displayed?: number | null
          updated_at?: string | null
          user_corrected_at?: string | null
          user_correction_note?: string | null
          user_correction_price?: number | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          additional_classes_price?: number | null
          capture_id?: string | null
          captured_at?: string | null
          classes_included?: number | null
          competitor_id?: string
          confidence?: number | null
          confidence_score?: number | null
          created_at?: string | null
          currency?: string | null
          data_completeness?: string | null
          extraction_confidence?: number | null
          extraction_method?: string | null
          id?: string
          includes_official_fees?: boolean | null
          includes_vat?: boolean | null
          incompleteness_reason?: string | null
          is_current?: boolean | null
          is_promo_price?: boolean | null
          is_verified?: boolean | null
          is_volume_discount?: boolean | null
          mapped_service_key?: string | null
          notes?: string | null
          original_text_snippet?: string | null
          price?: number | null
          price_includes_official_fee?: boolean | null
          price_includes_search?: boolean | null
          price_includes_vat?: boolean | null
          price_max?: number | null
          price_min?: number | null
          price_original_text?: string | null
          price_type?: string | null
          raw_service_name?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scan_job_id?: string | null
          service_code?: string | null
          service_description?: string | null
          service_name?: string | null
          source_page_title?: string | null
          source_url?: string | null
          total_displayed?: number | null
          updated_at?: string | null
          user_corrected_at?: string | null
          user_correction_note?: string | null
          user_correction_price?: number | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_captured_prices_capture_id_fkey"
            columns: ["capture_id"]
            isOneToOne: false
            referencedRelation: "comp_captures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_captured_prices_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_captured_prices_scan_job_id_fkey"
            columns: ["scan_job_id"]
            isOneToOne: false
            referencedRelation: "comp_scan_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_captures: {
        Row: {
          capture_method: string | null
          captured_at: string | null
          changes_detected: Json | null
          competitor_id: string | null
          content_hash: string | null
          has_changed: boolean | null
          html_content: string | null
          http_status: number | null
          id: string
          language: string | null
          page_type: string | null
          previous_capture_id: string | null
          scan_job_id: string | null
          text_content: string | null
          url: string
        }
        Insert: {
          capture_method?: string | null
          captured_at?: string | null
          changes_detected?: Json | null
          competitor_id?: string | null
          content_hash?: string | null
          has_changed?: boolean | null
          html_content?: string | null
          http_status?: number | null
          id?: string
          language?: string | null
          page_type?: string | null
          previous_capture_id?: string | null
          scan_job_id?: string | null
          text_content?: string | null
          url: string
        }
        Update: {
          capture_method?: string | null
          captured_at?: string | null
          changes_detected?: Json | null
          competitor_id?: string | null
          content_hash?: string | null
          has_changed?: boolean | null
          html_content?: string | null
          http_status?: number | null
          id?: string
          language?: string | null
          page_type?: string | null
          previous_capture_id?: string | null
          scan_job_id?: string | null
          text_content?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "comp_captures_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_captures_previous_capture_id_fkey"
            columns: ["previous_capture_id"]
            isOneToOne: false
            referencedRelation: "comp_captures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_captures_scan_job_id_fkey"
            columns: ["scan_job_id"]
            isOneToOne: false
            referencedRelation: "comp_scan_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_change_alerts: {
        Row: {
          alert_type: string
          competitor_id: string
          created_at: string | null
          description: string
          id: string
          is_read: boolean | null
          jurisdiction_code: string | null
          new_value: string | null
          previous_value: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_key: string | null
          severity: string | null
        }
        Insert: {
          alert_type: string
          competitor_id: string
          created_at?: string | null
          description: string
          id?: string
          is_read?: boolean | null
          jurisdiction_code?: string | null
          new_value?: string | null
          previous_value?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_key?: string | null
          severity?: string | null
        }
        Update: {
          alert_type?: string
          competitor_id?: string
          created_at?: string | null
          description?: string
          id?: string
          is_read?: boolean | null
          jurisdiction_code?: string | null
          new_value?: string | null
          previous_value?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_key?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_change_alerts_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_competitor_dismissals: {
        Row: {
          additional_notes: string | null
          competitor_id: string
          competitor_name: string
          competitor_website: string | null
          created_at: string
          dismissed_by: string | null
          id: string
          reason_code: string
          reason_label: string
        }
        Insert: {
          additional_notes?: string | null
          competitor_id: string
          competitor_name: string
          competitor_website?: string | null
          created_at?: string
          dismissed_by?: string | null
          id?: string
          reason_code: string
          reason_label: string
        }
        Update: {
          additional_notes?: string | null
          competitor_id?: string
          competitor_name?: string
          competitor_website?: string | null
          created_at?: string
          dismissed_by?: string | null
          id?: string
          reason_code?: string
          reason_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "comp_competitor_dismissals_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_competitor_services: {
        Row: {
          competitor_id: string
          created_at: string | null
          currency: string | null
          current_price: number | null
          description: string | null
          id: string
          is_active: boolean | null
          jurisdiction: string | null
          last_checked_at: string | null
          original_name: string | null
          price_url: string | null
          service_category: string | null
          service_code: string | null
          service_key: string | null
          service_name: string
          updated_at: string | null
        }
        Insert: {
          competitor_id: string
          created_at?: string | null
          currency?: string | null
          current_price?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: string | null
          last_checked_at?: string | null
          original_name?: string | null
          price_url?: string | null
          service_category?: string | null
          service_code?: string | null
          service_key?: string | null
          service_name: string
          updated_at?: string | null
        }
        Update: {
          competitor_id?: string
          created_at?: string | null
          currency?: string | null
          current_price?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: string | null
          last_checked_at?: string | null
          original_name?: string | null
          price_url?: string | null
          service_category?: string | null
          service_code?: string | null
          service_key?: string | null
          service_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_competitor_services_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_competitors: {
        Row: {
          actor_type: string | null
          ai_enrichment_data: Json | null
          ai_scan_date: string | null
          ai_scan_status: string | null
          ai_summary: string | null
          analyst_notes: string | null
          auto_scan_enabled: boolean | null
          business_model: string | null
          catalogued_at: string | null
          classification: string | null
          classification_confidence: number | null
          company_size: string | null
          competitive_score: number | null
          competitor_type: string | null
          country: string | null
          country_code: string | null
          coverage_jurisdictions: Json | null
          coverage_languages: Json | null
          coverage_services: Json | null
          created_at: string | null
          created_by: string | null
          data_quality_score: number | null
          description: string | null
          description_es: string | null
          digital_presence_score: number | null
          discovered_via: string | null
          extracted_currency: string | null
          extracted_description: string | null
          extracted_price_max: number | null
          extracted_price_min: number | null
          favicon_url: string | null
          has_ai: boolean | null
          has_ai_features: boolean | null
          has_api: boolean | null
          has_client_portal: boolean | null
          has_monitoring: boolean | null
          has_online_filing: boolean | null
          has_public_prices: boolean | null
          has_search_tool: boolean | null
          has_self_service: boolean | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          jurisdictions_covered: string[] | null
          key_differentiators: Json | null
          languages: string[] | null
          last_analysis_at: string | null
          last_price_check_at: string | null
          last_scan_at: string | null
          last_scan_job_id: string | null
          last_scanned_at: string | null
          logo_url: string | null
          market_segment: string | null
          name: string
          next_scan_at: string | null
          notes: string | null
          pricing_model: string | null
          pricing_page_changed_at: string | null
          pricing_page_last_hash: string | null
          pricing_page_url: string | null
          pricing_strategy: string | null
          pricing_url: string | null
          pricing_url_last_scan: string | null
          pricing_url_scan_status: string | null
          qualification_score: number | null
          region: string | null
          relevance_score: number | null
          scan_count: number | null
          scan_frequency_days: number | null
          score_breakdown: Json | null
          segment: string | null
          services_detected: string[] | null
          services_offered: string[] | null
          slug: string | null
          specializations: string[] | null
          status: string
          status_updated_at: string | null
          strengths: string[] | null
          subcontracts: boolean | null
          swot_opportunities: Json | null
          swot_strengths: Json | null
          swot_threats: Json | null
          swot_weaknesses: Json | null
          target_market: string | null
          threat_level: string | null
          threat_level_manual: string | null
          threat_level_override: boolean | null
          threat_level_reason: string | null
          threat_level_updated_at: string | null
          updated_at: string | null
          watch_priority: number | null
          website: string | null
          works_marks: boolean | null
          works_patents: boolean | null
        }
        Insert: {
          actor_type?: string | null
          ai_enrichment_data?: Json | null
          ai_scan_date?: string | null
          ai_scan_status?: string | null
          ai_summary?: string | null
          analyst_notes?: string | null
          auto_scan_enabled?: boolean | null
          business_model?: string | null
          catalogued_at?: string | null
          classification?: string | null
          classification_confidence?: number | null
          company_size?: string | null
          competitive_score?: number | null
          competitor_type?: string | null
          country?: string | null
          country_code?: string | null
          coverage_jurisdictions?: Json | null
          coverage_languages?: Json | null
          coverage_services?: Json | null
          created_at?: string | null
          created_by?: string | null
          data_quality_score?: number | null
          description?: string | null
          description_es?: string | null
          digital_presence_score?: number | null
          discovered_via?: string | null
          extracted_currency?: string | null
          extracted_description?: string | null
          extracted_price_max?: number | null
          extracted_price_min?: number | null
          favicon_url?: string | null
          has_ai?: boolean | null
          has_ai_features?: boolean | null
          has_api?: boolean | null
          has_client_portal?: boolean | null
          has_monitoring?: boolean | null
          has_online_filing?: boolean | null
          has_public_prices?: boolean | null
          has_search_tool?: boolean | null
          has_self_service?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          jurisdictions_covered?: string[] | null
          key_differentiators?: Json | null
          languages?: string[] | null
          last_analysis_at?: string | null
          last_price_check_at?: string | null
          last_scan_at?: string | null
          last_scan_job_id?: string | null
          last_scanned_at?: string | null
          logo_url?: string | null
          market_segment?: string | null
          name: string
          next_scan_at?: string | null
          notes?: string | null
          pricing_model?: string | null
          pricing_page_changed_at?: string | null
          pricing_page_last_hash?: string | null
          pricing_page_url?: string | null
          pricing_strategy?: string | null
          pricing_url?: string | null
          pricing_url_last_scan?: string | null
          pricing_url_scan_status?: string | null
          qualification_score?: number | null
          region?: string | null
          relevance_score?: number | null
          scan_count?: number | null
          scan_frequency_days?: number | null
          score_breakdown?: Json | null
          segment?: string | null
          services_detected?: string[] | null
          services_offered?: string[] | null
          slug?: string | null
          specializations?: string[] | null
          status?: string
          status_updated_at?: string | null
          strengths?: string[] | null
          subcontracts?: boolean | null
          swot_opportunities?: Json | null
          swot_strengths?: Json | null
          swot_threats?: Json | null
          swot_weaknesses?: Json | null
          target_market?: string | null
          threat_level?: string | null
          threat_level_manual?: string | null
          threat_level_override?: boolean | null
          threat_level_reason?: string | null
          threat_level_updated_at?: string | null
          updated_at?: string | null
          watch_priority?: number | null
          website?: string | null
          works_marks?: boolean | null
          works_patents?: boolean | null
        }
        Update: {
          actor_type?: string | null
          ai_enrichment_data?: Json | null
          ai_scan_date?: string | null
          ai_scan_status?: string | null
          ai_summary?: string | null
          analyst_notes?: string | null
          auto_scan_enabled?: boolean | null
          business_model?: string | null
          catalogued_at?: string | null
          classification?: string | null
          classification_confidence?: number | null
          company_size?: string | null
          competitive_score?: number | null
          competitor_type?: string | null
          country?: string | null
          country_code?: string | null
          coverage_jurisdictions?: Json | null
          coverage_languages?: Json | null
          coverage_services?: Json | null
          created_at?: string | null
          created_by?: string | null
          data_quality_score?: number | null
          description?: string | null
          description_es?: string | null
          digital_presence_score?: number | null
          discovered_via?: string | null
          extracted_currency?: string | null
          extracted_description?: string | null
          extracted_price_max?: number | null
          extracted_price_min?: number | null
          favicon_url?: string | null
          has_ai?: boolean | null
          has_ai_features?: boolean | null
          has_api?: boolean | null
          has_client_portal?: boolean | null
          has_monitoring?: boolean | null
          has_online_filing?: boolean | null
          has_public_prices?: boolean | null
          has_search_tool?: boolean | null
          has_self_service?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          jurisdictions_covered?: string[] | null
          key_differentiators?: Json | null
          languages?: string[] | null
          last_analysis_at?: string | null
          last_price_check_at?: string | null
          last_scan_at?: string | null
          last_scan_job_id?: string | null
          last_scanned_at?: string | null
          logo_url?: string | null
          market_segment?: string | null
          name?: string
          next_scan_at?: string | null
          notes?: string | null
          pricing_model?: string | null
          pricing_page_changed_at?: string | null
          pricing_page_last_hash?: string | null
          pricing_page_url?: string | null
          pricing_strategy?: string | null
          pricing_url?: string | null
          pricing_url_last_scan?: string | null
          pricing_url_scan_status?: string | null
          qualification_score?: number | null
          region?: string | null
          relevance_score?: number | null
          scan_count?: number | null
          scan_frequency_days?: number | null
          score_breakdown?: Json | null
          segment?: string | null
          services_detected?: string[] | null
          services_offered?: string[] | null
          slug?: string | null
          specializations?: string[] | null
          status?: string
          status_updated_at?: string | null
          strengths?: string[] | null
          subcontracts?: boolean | null
          swot_opportunities?: Json | null
          swot_strengths?: Json | null
          swot_threats?: Json | null
          swot_weaknesses?: Json | null
          target_market?: string | null
          threat_level?: string | null
          threat_level_manual?: string | null
          threat_level_override?: boolean | null
          threat_level_reason?: string | null
          threat_level_updated_at?: string | null
          updated_at?: string | null
          watch_priority?: number | null
          website?: string | null
          works_marks?: boolean | null
          works_patents?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_competitors_last_scan_job_id_fkey"
            columns: ["last_scan_job_id"]
            isOneToOne: false
            referencedRelation: "comp_scan_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_discoveries: {
        Row: {
          ai_reasoning: string | null
          competitor_type: string | null
          country_code: string | null
          created_at: string | null
          created_competitor_id: string | null
          description: string | null
          has_online_filing: boolean | null
          id: string
          name: string | null
          pricing_url: string | null
          region: string | null
          relevance_score: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          search_criteria: Json | null
          source: string | null
          status: string | null
          website: string | null
        }
        Insert: {
          ai_reasoning?: string | null
          competitor_type?: string | null
          country_code?: string | null
          created_at?: string | null
          created_competitor_id?: string | null
          description?: string | null
          has_online_filing?: boolean | null
          id?: string
          name?: string | null
          pricing_url?: string | null
          region?: string | null
          relevance_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          search_criteria?: Json | null
          source?: string | null
          status?: string | null
          website?: string | null
        }
        Update: {
          ai_reasoning?: string | null
          competitor_type?: string | null
          country_code?: string | null
          created_at?: string | null
          created_competitor_id?: string | null
          description?: string | null
          has_online_filing?: boolean | null
          id?: string
          name?: string | null
          pricing_url?: string | null
          region?: string | null
          relevance_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          search_criteria?: Json | null
          source?: string | null
          status?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_discoveries_created_competitor_id_fkey"
            columns: ["created_competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_discovery_schedule: {
        Row: {
          created_at: string | null
          frequency_days: number | null
          id: string
          is_active: boolean | null
          jurisdiction_code: string
          language: string | null
          last_run: string | null
          new_competitors_found: number | null
          next_run: string | null
          results_last_run: number | null
          search_query: string
        }
        Insert: {
          created_at?: string | null
          frequency_days?: number | null
          id?: string
          is_active?: boolean | null
          jurisdiction_code: string
          language?: string | null
          last_run?: string | null
          new_competitors_found?: number | null
          next_run?: string | null
          results_last_run?: number | null
          search_query: string
        }
        Update: {
          created_at?: string | null
          frequency_days?: number | null
          id?: string
          is_active?: boolean | null
          jurisdiction_code?: string
          language?: string | null
          last_run?: string | null
          new_competitors_found?: number | null
          next_run?: string | null
          results_last_run?: number | null
          search_query?: string
        }
        Relationships: []
      }
      comp_knowledge_base_versions: {
        Row: {
          change_summary: string
          change_type: string
          changes_detail: Json | null
          created_at: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          triggered_by: string
          version_date: string | null
          version_number: number
        }
        Insert: {
          change_summary: string
          change_type: string
          changes_detail?: Json | null
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          triggered_by: string
          version_date?: string | null
          version_number: number
        }
        Update: {
          change_summary?: string
          change_type?: string
          changes_detail?: Json | null
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          triggered_by?: string
          version_date?: string | null
          version_number?: number
        }
        Relationships: []
      }
      comp_market_analysis: {
        Row: {
          ai_model: string | null
          ai_provider: string | null
          analysis_date: string | null
          analysis_type: string
          avg_price: number | null
          competitors_count: number | null
          created_at: string | null
          created_by: string | null
          id: string
          jurisdiction: string | null
          key_findings: Json | null
          market_position: string | null
          market_segment: string | null
          market_trends: Json | null
          max_price: number | null
          median_price: number | null
          min_price: number | null
          opportunities: Json | null
          our_price: number | null
          recommendation: string | null
          service_category: string | null
          service_key: string | null
          status: string | null
          summary: string | null
          threats: Json | null
          title: string | null
          total_competitors: number | null
          total_prices: number | null
          total_services: number | null
        }
        Insert: {
          ai_model?: string | null
          ai_provider?: string | null
          analysis_date?: string | null
          analysis_type: string
          avg_price?: number | null
          competitors_count?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          jurisdiction?: string | null
          key_findings?: Json | null
          market_position?: string | null
          market_segment?: string | null
          market_trends?: Json | null
          max_price?: number | null
          median_price?: number | null
          min_price?: number | null
          opportunities?: Json | null
          our_price?: number | null
          recommendation?: string | null
          service_category?: string | null
          service_key?: string | null
          status?: string | null
          summary?: string | null
          threats?: Json | null
          title?: string | null
          total_competitors?: number | null
          total_prices?: number | null
          total_services?: number | null
        }
        Update: {
          ai_model?: string | null
          ai_provider?: string | null
          analysis_date?: string | null
          analysis_type?: string
          avg_price?: number | null
          competitors_count?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          jurisdiction?: string | null
          key_findings?: Json | null
          market_position?: string | null
          market_segment?: string | null
          market_trends?: Json | null
          max_price?: number | null
          median_price?: number | null
          min_price?: number | null
          opportunities?: Json | null
          our_price?: number | null
          recommendation?: string | null
          service_category?: string | null
          service_key?: string | null
          status?: string | null
          summary?: string | null
          threats?: Json | null
          title?: string | null
          total_competitors?: number | null
          total_prices?: number | null
          total_services?: number | null
        }
        Relationships: []
      }
      comp_normalized_prices: {
        Row: {
          capture_id: string | null
          captured_price_id: string | null
          competitor_id: string
          confidence_breakdown: Json | null
          confidence_composite: number | null
          confidence_score: number | null
          created_at: string | null
          currency: string | null
          data_completeness: string | null
          id: string
          is_comparable_to_our_service: boolean | null
          normalization_method: string | null
          normalized_price: number
          official_fees_amount: number | null
          original_currency: string | null
          original_price: number | null
          price_type: string | null
          reasoning: string | null
          scan_job_id: string | null
          scenario: string | null
          service_code: string | null
          service_fee: number | null
          service_key: string | null
          total_price: number | null
        }
        Insert: {
          capture_id?: string | null
          captured_price_id?: string | null
          competitor_id: string
          confidence_breakdown?: Json | null
          confidence_composite?: number | null
          confidence_score?: number | null
          created_at?: string | null
          currency?: string | null
          data_completeness?: string | null
          id?: string
          is_comparable_to_our_service?: boolean | null
          normalization_method?: string | null
          normalized_price: number
          official_fees_amount?: number | null
          original_currency?: string | null
          original_price?: number | null
          price_type?: string | null
          reasoning?: string | null
          scan_job_id?: string | null
          scenario?: string | null
          service_code?: string | null
          service_fee?: number | null
          service_key?: string | null
          total_price?: number | null
        }
        Update: {
          capture_id?: string | null
          captured_price_id?: string | null
          competitor_id?: string
          confidence_breakdown?: Json | null
          confidence_composite?: number | null
          confidence_score?: number | null
          created_at?: string | null
          currency?: string | null
          data_completeness?: string | null
          id?: string
          is_comparable_to_our_service?: boolean | null
          normalization_method?: string | null
          normalized_price?: number
          official_fees_amount?: number | null
          original_currency?: string | null
          original_price?: number | null
          price_type?: string | null
          reasoning?: string | null
          scan_job_id?: string | null
          scenario?: string | null
          service_code?: string | null
          service_fee?: number | null
          service_key?: string | null
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_normalized_prices_capture_id_fkey"
            columns: ["capture_id"]
            isOneToOne: false
            referencedRelation: "comp_captures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_normalized_prices_captured_price_id_fkey"
            columns: ["captured_price_id"]
            isOneToOne: false
            referencedRelation: "comp_captured_prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_normalized_prices_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_normalized_prices_scan_job_id_fkey"
            columns: ["scan_job_id"]
            isOneToOne: false
            referencedRelation: "comp_scan_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_official_fees: {
        Row: {
          auto_alert_sent: boolean | null
          created_at: string | null
          fee_amount: number
          fee_currency: string
          fee_paper: number | null
          id: string
          jurisdiction_code: string
          next_review_date: string | null
          notes: string | null
          office_name: string
          service_type: string
          source_url: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          auto_alert_sent?: boolean | null
          created_at?: string | null
          fee_amount: number
          fee_currency?: string
          fee_paper?: number | null
          id?: string
          jurisdiction_code: string
          next_review_date?: string | null
          notes?: string | null
          office_name: string
          service_type: string
          source_url?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          auto_alert_sent?: boolean | null
          created_at?: string | null
          fee_amount?: number
          fee_currency?: string
          fee_paper?: number | null
          id?: string
          jurisdiction_code?: string
          next_review_date?: string | null
          notes?: string | null
          office_name?: string
          service_type?: string
          source_url?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      comp_pipeline_metrics: {
        Row: {
          avg_data_age_days: number | null
          competitors_with_prices: number | null
          competitors_with_verified_prices: number | null
          coverage_percentage: number | null
          created_at: string | null
          extraction_success_rate: number | null
          extractions_failed: number | null
          extractions_incomplete: number | null
          extractions_successful: number | null
          id: string
          metric_date: string | null
          new_services_detected: number | null
          oldest_data_days: number | null
          price_changes_detected: number | null
          prices_approved: number | null
          prices_incomplete: number | null
          prices_pending_review: number | null
          prices_rejected: number | null
          stale_competitors: number | null
          total_captured_prices: number | null
          total_competitors: number | null
          total_extractions_attempted: number | null
        }
        Insert: {
          avg_data_age_days?: number | null
          competitors_with_prices?: number | null
          competitors_with_verified_prices?: number | null
          coverage_percentage?: number | null
          created_at?: string | null
          extraction_success_rate?: number | null
          extractions_failed?: number | null
          extractions_incomplete?: number | null
          extractions_successful?: number | null
          id?: string
          metric_date?: string | null
          new_services_detected?: number | null
          oldest_data_days?: number | null
          price_changes_detected?: number | null
          prices_approved?: number | null
          prices_incomplete?: number | null
          prices_pending_review?: number | null
          prices_rejected?: number | null
          stale_competitors?: number | null
          total_captured_prices?: number | null
          total_competitors?: number | null
          total_extractions_attempted?: number | null
        }
        Update: {
          avg_data_age_days?: number | null
          competitors_with_prices?: number | null
          competitors_with_verified_prices?: number | null
          coverage_percentage?: number | null
          created_at?: string | null
          extraction_success_rate?: number | null
          extractions_failed?: number | null
          extractions_incomplete?: number | null
          extractions_successful?: number | null
          id?: string
          metric_date?: string | null
          new_services_detected?: number | null
          oldest_data_days?: number | null
          price_changes_detected?: number | null
          prices_approved?: number | null
          prices_incomplete?: number | null
          prices_pending_review?: number | null
          prices_rejected?: number | null
          stale_competitors?: number | null
          total_captured_prices?: number | null
          total_competitors?: number | null
          total_extractions_attempted?: number | null
        }
        Relationships: []
      }
      comp_price_breakdown: {
        Row: {
          captured_at: string | null
          captured_price_id: string
          competitor_id: string
          confidence: number | null
          currency: string | null
          derivation_method: string | null
          extras_clases: number | null
          fee_agente_local: number | null
          fee_profesional: number | null
          id: string
          jurisdiction_code: string | null
          notes: string | null
          price_type: string | null
          service_canonical_id: string | null
          source_url: string | null
          tasa_oficial: number | null
        }
        Insert: {
          captured_at?: string | null
          captured_price_id: string
          competitor_id: string
          confidence?: number | null
          currency?: string | null
          derivation_method?: string | null
          extras_clases?: number | null
          fee_agente_local?: number | null
          fee_profesional?: number | null
          id?: string
          jurisdiction_code?: string | null
          notes?: string | null
          price_type?: string | null
          service_canonical_id?: string | null
          source_url?: string | null
          tasa_oficial?: number | null
        }
        Update: {
          captured_at?: string | null
          captured_price_id?: string
          competitor_id?: string
          confidence?: number | null
          currency?: string | null
          derivation_method?: string | null
          extras_clases?: number | null
          fee_agente_local?: number | null
          fee_profesional?: number | null
          id?: string
          jurisdiction_code?: string | null
          notes?: string | null
          price_type?: string | null
          service_canonical_id?: string | null
          source_url?: string | null
          tasa_oficial?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_price_breakdown_captured_price_id_fkey"
            columns: ["captured_price_id"]
            isOneToOne: false
            referencedRelation: "comp_captured_prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_price_breakdown_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_price_history: {
        Row: {
          competitor_id: string
          currency: string | null
          id: string
          price: number
          price_type: string | null
          recorded_at: string | null
          service_code: string
        }
        Insert: {
          competitor_id: string
          currency?: string | null
          id?: string
          price: number
          price_type?: string | null
          recorded_at?: string | null
          service_code: string
        }
        Update: {
          competitor_id?: string
          currency?: string | null
          id?: string
          price?: number
          price_type?: string | null
          recorded_at?: string | null
          service_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "comp_price_history_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_price_recommendations: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          competitors_count: number | null
          confidence: string | null
          created_at: string | null
          current_currency: string | null
          current_price: number | null
          id: string
          market_avg: number | null
          market_max: number | null
          market_median: number | null
          market_min: number | null
          market_p25: number | null
          market_p75: number | null
          positioning: string | null
          reasoning: string | null
          recommended_currency: string | null
          recommended_price: number
          rejected_reason: string | null
          risk_level: string | null
          service_code: string
          service_key: string | null
          service_name: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          competitors_count?: number | null
          confidence?: string | null
          created_at?: string | null
          current_currency?: string | null
          current_price?: number | null
          id?: string
          market_avg?: number | null
          market_max?: number | null
          market_median?: number | null
          market_min?: number | null
          market_p25?: number | null
          market_p75?: number | null
          positioning?: string | null
          reasoning?: string | null
          recommended_currency?: string | null
          recommended_price: number
          rejected_reason?: string | null
          risk_level?: string | null
          service_code: string
          service_key?: string | null
          service_name?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          competitors_count?: number | null
          confidence?: string | null
          created_at?: string | null
          current_currency?: string | null
          current_price?: number | null
          id?: string
          market_avg?: number | null
          market_max?: number | null
          market_median?: number | null
          market_min?: number | null
          market_p25?: number | null
          market_p75?: number | null
          positioning?: string | null
          reasoning?: string | null
          recommended_currency?: string | null
          recommended_price?: number
          rejected_reason?: string | null
          risk_level?: string | null
          service_code?: string
          service_key?: string | null
          service_name?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comp_pricing_strategies: {
        Row: {
          applies_to_jurisdictions: string[] | null
          applies_to_services: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          margin_min: number | null
          margin_target: number | null
          name: string
          strategy_type: string | null
          target_percentile: number | null
          target_positioning: string | null
          updated_at: string | null
        }
        Insert: {
          applies_to_jurisdictions?: string[] | null
          applies_to_services?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          margin_min?: number | null
          margin_target?: number | null
          name: string
          strategy_type?: string | null
          target_percentile?: number | null
          target_positioning?: string | null
          updated_at?: string | null
        }
        Update: {
          applies_to_jurisdictions?: string[] | null
          applies_to_services?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          margin_min?: number | null
          margin_target?: number | null
          name?: string
          strategy_type?: string | null
          target_percentile?: number | null
          target_positioning?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comp_pricing_strategy_config: {
        Row: {
          created_at: string | null
          custom_offset_pct: number | null
          id: string
          is_active: boolean | null
          min_margin_pct: number
          rounding_rule: string
          strategy_name: string
          target_percentile: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          custom_offset_pct?: number | null
          id?: string
          is_active?: boolean | null
          min_margin_pct?: number
          rounding_rule?: string
          strategy_name?: string
          target_percentile?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          custom_offset_pct?: number | null
          id?: string
          is_active?: boolean | null
          min_margin_pct?: number
          rounding_rule?: string
          strategy_name?: string
          target_percentile?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      comp_realistic_price_ranges: {
        Row: {
          currency: string | null
          max_realistic_price: number
          min_realistic_price: number
          notes: string | null
          service_type: string
          typical_official_fee: number | null
        }
        Insert: {
          currency?: string | null
          max_realistic_price: number
          min_realistic_price: number
          notes?: string | null
          service_type: string
          typical_official_fee?: number | null
        }
        Update: {
          currency?: string | null
          max_realistic_price?: number
          min_realistic_price?: number
          notes?: string | null
          service_type?: string
          typical_official_fee?: number | null
        }
        Relationships: []
      }
      comp_scan_config: {
        Row: {
          auto_add_enabled: boolean
          auto_add_min_score: number
          auto_add_types: string[] | null
          auto_enrich_on_add: boolean
          created_at: string
          frequency: string
          id: string
          is_active: boolean
          languages: string[]
          last_run_added: number | null
          last_run_at: string | null
          last_run_found: number | null
          max_results: number
          next_run_at: string | null
          notify_email: string | null
          notify_on_new: boolean
          regions: string[]
          services: string[]
          updated_at: string
        }
        Insert: {
          auto_add_enabled?: boolean
          auto_add_min_score?: number
          auto_add_types?: string[] | null
          auto_enrich_on_add?: boolean
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          languages?: string[]
          last_run_added?: number | null
          last_run_at?: string | null
          last_run_found?: number | null
          max_results?: number
          next_run_at?: string | null
          notify_email?: string | null
          notify_on_new?: boolean
          regions?: string[]
          services?: string[]
          updated_at?: string
        }
        Update: {
          auto_add_enabled?: boolean
          auto_add_min_score?: number
          auto_add_types?: string[] | null
          auto_enrich_on_add?: boolean
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          languages?: string[]
          last_run_added?: number | null
          last_run_at?: string | null
          last_run_found?: number | null
          max_results?: number
          next_run_at?: string | null
          notify_email?: string | null
          notify_on_new?: boolean
          regions?: string[]
          services?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      comp_scan_jobs: {
        Row: {
          classification: string | null
          classification_confidence: number | null
          competitor_id: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          duration_seconds: number | null
          error_details: Json | null
          error_message: string | null
          id: string
          layer1_capture: Json | null
          layer2_extraction: Json | null
          layer3_engine: Json | null
          layer4_intelligence: Json | null
          prices_approved: number | null
          prices_extracted: number | null
          prices_incomplete: number | null
          prices_invalid: number | null
          prices_rejected: number | null
          prices_valid: number | null
          pricing_pages_found: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          classification?: string | null
          classification_confidence?: number | null
          competitor_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_seconds?: number | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          layer1_capture?: Json | null
          layer2_extraction?: Json | null
          layer3_engine?: Json | null
          layer4_intelligence?: Json | null
          prices_approved?: number | null
          prices_extracted?: number | null
          prices_incomplete?: number | null
          prices_invalid?: number | null
          prices_rejected?: number | null
          prices_valid?: number | null
          pricing_pages_found?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          classification?: string | null
          classification_confidence?: number | null
          competitor_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_seconds?: number | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          layer1_capture?: Json | null
          layer2_extraction?: Json | null
          layer3_engine?: Json | null
          layer4_intelligence?: Json | null
          prices_approved?: number | null
          prices_extracted?: number | null
          prices_incomplete?: number | null
          prices_invalid?: number | null
          prices_rejected?: number | null
          prices_valid?: number | null
          pricing_pages_found?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_scan_jobs_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_scan_runs: {
        Row: {
          auto_added: number | null
          auto_enriched: number | null
          completed_at: string | null
          error_message: string | null
          id: string
          new_discovered: number | null
          regions_scanned: string[] | null
          started_at: string
          status: string
          summary: Json | null
          total_found: number | null
          trigger: string
        }
        Insert: {
          auto_added?: number | null
          auto_enriched?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          new_discovered?: number | null
          regions_scanned?: string[] | null
          started_at?: string
          status?: string
          summary?: Json | null
          total_found?: number | null
          trigger?: string
        }
        Update: {
          auto_added?: number | null
          auto_enriched?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          new_discovered?: number | null
          regions_scanned?: string[] | null
          started_at?: string
          status?: string
          summary?: Json | null
          total_found?: number | null
          trigger?: string
        }
        Relationships: []
      }
      comp_scheduled_searches: {
        Row: {
          competitor_ids: string[] | null
          created_at: string | null
          created_by: string | null
          day_of_month: number | null
          day_of_week: number | null
          description: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          last_run_status: string | null
          name: string
          next_run_at: string | null
          query_template: string | null
          run_count: number | null
          search_type: string | null
          service_codes: string[] | null
          time_of_day: string | null
          updated_at: string | null
        }
        Insert: {
          competitor_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          last_run_status?: string | null
          name: string
          next_run_at?: string | null
          query_template?: string | null
          run_count?: number | null
          search_type?: string | null
          service_codes?: string[] | null
          time_of_day?: string | null
          updated_at?: string | null
        }
        Update: {
          competitor_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          last_run_status?: string | null
          name?: string
          next_run_at?: string | null
          query_template?: string | null
          run_count?: number | null
          search_type?: string | null
          service_codes?: string[] | null
          time_of_day?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comp_search_queries: {
        Row: {
          executed_at: string | null
          id: string
          is_active: boolean | null
          language: string | null
          priority: number | null
          provider: string | null
          query: string | null
          query_text: string
          region: string | null
          results_count: number | null
          results_data: Json | null
          search_id: string | null
          service_type: string | null
        }
        Insert: {
          executed_at?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          priority?: number | null
          provider?: string | null
          query?: string | null
          query_text: string
          region?: string | null
          results_count?: number | null
          results_data?: Json | null
          search_id?: string | null
          service_type?: string | null
        }
        Update: {
          executed_at?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          priority?: number | null
          provider?: string | null
          query?: string | null
          query_text?: string
          region?: string | null
          results_count?: number | null
          results_data?: Json | null
          search_id?: string | null
          service_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_search_queries_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "comp_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_search_urls: {
        Row: {
          competitor_id: string | null
          content_extracted: string | null
          created_at: string | null
          domain: string | null
          error_message: string | null
          fetch_error: string | null
          fetched_at: string | null
          id: string
          is_new_competitor: boolean | null
          matched_competitor_id: string | null
          page_title: string | null
          prices_found: Json | null
          scraped_at: string | null
          scraped_content: string | null
          search_id: string | null
          snippet: string | null
          status: string | null
          title: string | null
          url: string
          urls_processed: number | null
        }
        Insert: {
          competitor_id?: string | null
          content_extracted?: string | null
          created_at?: string | null
          domain?: string | null
          error_message?: string | null
          fetch_error?: string | null
          fetched_at?: string | null
          id?: string
          is_new_competitor?: boolean | null
          matched_competitor_id?: string | null
          page_title?: string | null
          prices_found?: Json | null
          scraped_at?: string | null
          scraped_content?: string | null
          search_id?: string | null
          snippet?: string | null
          status?: string | null
          title?: string | null
          url: string
          urls_processed?: number | null
        }
        Update: {
          competitor_id?: string | null
          content_extracted?: string | null
          created_at?: string | null
          domain?: string | null
          error_message?: string | null
          fetch_error?: string | null
          fetched_at?: string | null
          id?: string
          is_new_competitor?: boolean | null
          matched_competitor_id?: string | null
          page_title?: string | null
          prices_found?: Json | null
          scraped_at?: string | null
          scraped_content?: string | null
          search_id?: string | null
          snippet?: string | null
          status?: string | null
          title?: string | null
          url?: string
          urls_processed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_search_urls_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_search_urls_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "comp_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_searches: {
        Row: {
          ai_model: string | null
          ai_provider: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          competitors_data: Json | null
          competitors_found: string[] | null
          completed_at: string | null
          config: Json | null
          cost_estimate: number | null
          created_at: string | null
          created_by: string | null
          current_step: string | null
          description: string | null
          duration_ms: number | null
          duration_seconds: number | null
          error_details: Json | null
          error_message: string | null
          errors: Json | null
          executed_at: string | null
          executed_by: string | null
          execution_log: Json | null
          filters: Json | null
          finished_at: string | null
          id: string
          is_scheduled: boolean | null
          jurisdiction: string | null
          metadata: Json | null
          name: string | null
          parameters: Json | null
          parent_search_id: string | null
          prices_data: Json | null
          prices_found: Json | null
          priority: string | null
          progress: number | null
          query: string | null
          raw_response: Json | null
          region: string | null
          regions: string[] | null
          results: Json | null
          results_count: number | null
          results_data: Json | null
          results_summary: Json | null
          retry_count: number | null
          scheduled_search_id: string | null
          search_queries: Json | null
          search_type: string | null
          service_category: string | null
          service_type: string | null
          service_types: string[] | null
          source: string | null
          started_at: string | null
          started_by: string | null
          status: string | null
          steps_completed: Json | null
          summary: string | null
          tags: string[] | null
          tokens_used: number | null
          total_competitors_found: number | null
          total_prices_found: number | null
          total_urls_scanned: number | null
          trigger_type: string | null
          triggered_by: string | null
          updated_at: string | null
          urls_found: Json | null
          urls_scanned: string[] | null
          user_id: string | null
        }
        Insert: {
          ai_model?: string | null
          ai_provider?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          competitors_data?: Json | null
          competitors_found?: string[] | null
          completed_at?: string | null
          config?: Json | null
          cost_estimate?: number | null
          created_at?: string | null
          created_by?: string | null
          current_step?: string | null
          description?: string | null
          duration_ms?: number | null
          duration_seconds?: number | null
          error_details?: Json | null
          error_message?: string | null
          errors?: Json | null
          executed_at?: string | null
          executed_by?: string | null
          execution_log?: Json | null
          filters?: Json | null
          finished_at?: string | null
          id?: string
          is_scheduled?: boolean | null
          jurisdiction?: string | null
          metadata?: Json | null
          name?: string | null
          parameters?: Json | null
          parent_search_id?: string | null
          prices_data?: Json | null
          prices_found?: Json | null
          priority?: string | null
          progress?: number | null
          query?: string | null
          raw_response?: Json | null
          region?: string | null
          regions?: string[] | null
          results?: Json | null
          results_count?: number | null
          results_data?: Json | null
          results_summary?: Json | null
          retry_count?: number | null
          scheduled_search_id?: string | null
          search_queries?: Json | null
          search_type?: string | null
          service_category?: string | null
          service_type?: string | null
          service_types?: string[] | null
          source?: string | null
          started_at?: string | null
          started_by?: string | null
          status?: string | null
          steps_completed?: Json | null
          summary?: string | null
          tags?: string[] | null
          tokens_used?: number | null
          total_competitors_found?: number | null
          total_prices_found?: number | null
          total_urls_scanned?: number | null
          trigger_type?: string | null
          triggered_by?: string | null
          updated_at?: string | null
          urls_found?: Json | null
          urls_scanned?: string[] | null
          user_id?: string | null
        }
        Update: {
          ai_model?: string | null
          ai_provider?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          competitors_data?: Json | null
          competitors_found?: string[] | null
          completed_at?: string | null
          config?: Json | null
          cost_estimate?: number | null
          created_at?: string | null
          created_by?: string | null
          current_step?: string | null
          description?: string | null
          duration_ms?: number | null
          duration_seconds?: number | null
          error_details?: Json | null
          error_message?: string | null
          errors?: Json | null
          executed_at?: string | null
          executed_by?: string | null
          execution_log?: Json | null
          filters?: Json | null
          finished_at?: string | null
          id?: string
          is_scheduled?: boolean | null
          jurisdiction?: string | null
          metadata?: Json | null
          name?: string | null
          parameters?: Json | null
          parent_search_id?: string | null
          prices_data?: Json | null
          prices_found?: Json | null
          priority?: string | null
          progress?: number | null
          query?: string | null
          raw_response?: Json | null
          region?: string | null
          regions?: string[] | null
          results?: Json | null
          results_count?: number | null
          results_data?: Json | null
          results_summary?: Json | null
          retry_count?: number | null
          scheduled_search_id?: string | null
          search_queries?: Json | null
          search_type?: string | null
          service_category?: string | null
          service_type?: string | null
          service_types?: string[] | null
          source?: string | null
          started_at?: string | null
          started_by?: string | null
          status?: string | null
          steps_completed?: Json | null
          summary?: string | null
          tags?: string[] | null
          tokens_used?: number | null
          total_competitors_found?: number | null
          total_prices_found?: number | null
          total_urls_scanned?: number | null
          trigger_type?: string | null
          triggered_by?: string | null
          updated_at?: string | null
          urls_found?: Json | null
          urls_scanned?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      comp_service_catalog: {
        Row: {
          competitor_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          jurisdiction: string | null
          jurisdiction_name: string | null
          last_seen_at: string | null
          price: number | null
          price_currency: string | null
          price_includes_fees: boolean | null
          price_includes_vat: boolean | null
          price_text: string | null
          service_category: string | null
          service_code: string | null
          service_name: string
          turnaround_time: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          competitor_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: string | null
          jurisdiction_name?: string | null
          last_seen_at?: string | null
          price?: number | null
          price_currency?: string | null
          price_includes_fees?: boolean | null
          price_includes_vat?: boolean | null
          price_text?: string | null
          service_category?: string | null
          service_code?: string | null
          service_name: string
          turnaround_time?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          competitor_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: string | null
          jurisdiction_name?: string | null
          last_seen_at?: string | null
          price?: number | null
          price_currency?: string | null
          price_includes_fees?: boolean | null
          price_includes_vat?: boolean | null
          price_text?: string | null
          service_category?: string | null
          service_code?: string | null
          service_name?: string
          turnaround_time?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_service_catalog_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "comp_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_service_suggestions: {
        Row: {
          avg_market_price: number | null
          competitors_offering: number | null
          created_at: string | null
          demand_level: string | null
          description: string | null
          id: string
          implementation_difficulty: string | null
          max_market_price: number | null
          min_market_price: number | null
          notes: string | null
          priority_score: number | null
          revenue_potential: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_category: string | null
          service_code: string | null
          service_name: string
          status: string | null
          suggested_price: number | null
          updated_at: string | null
        }
        Insert: {
          avg_market_price?: number | null
          competitors_offering?: number | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          id?: string
          implementation_difficulty?: string | null
          max_market_price?: number | null
          min_market_price?: number | null
          notes?: string | null
          priority_score?: number | null
          revenue_potential?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_category?: string | null
          service_code?: string | null
          service_name: string
          status?: string | null
          suggested_price?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_market_price?: number | null
          competitors_offering?: number | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          id?: string
          implementation_difficulty?: string | null
          max_market_price?: number | null
          min_market_price?: number | null
          notes?: string | null
          priority_score?: number | null
          revenue_potential?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_category?: string | null
          service_code?: string | null
          service_name?: string
          status?: string | null
          suggested_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comp_service_synonyms: {
        Row: {
          canonical_service_id: string
          id: string
          language: string
          synonym: string
          weight: number | null
        }
        Insert: {
          canonical_service_id: string
          id?: string
          language?: string
          synonym: string
          weight?: number | null
        }
        Update: {
          canonical_service_id?: string
          id?: string
          language?: string
          synonym?: string
          weight?: number | null
        }
        Relationships: []
      }
      comp_service_taxonomy: {
        Row: {
          canonical_key: string
          created_at: string | null
          id: string
          jurisdiction_code: string | null
          service_category: string
          typically_includes_official_fee: boolean | null
          typically_includes_search: boolean | null
          typically_includes_vat: boolean | null
          variant_language: string | null
          variant_name: string
        }
        Insert: {
          canonical_key: string
          created_at?: string | null
          id?: string
          jurisdiction_code?: string | null
          service_category: string
          typically_includes_official_fee?: boolean | null
          typically_includes_search?: boolean | null
          typically_includes_vat?: boolean | null
          variant_language?: string | null
          variant_name: string
        }
        Update: {
          canonical_key?: string
          created_at?: string | null
          id?: string
          jurisdiction_code?: string | null
          service_category?: string
          typically_includes_official_fee?: boolean | null
          typically_includes_search?: boolean | null
          typically_includes_vat?: boolean | null
          variant_language?: string | null
          variant_name?: string
        }
        Relationships: []
      }
      comp_synonym_suggestions: {
        Row: {
          canonical_service_id: string
          confidence: number
          created_at: string | null
          id: string
          language: string | null
          reviewed_at: string | null
          source_competitor: string | null
          source_url: string | null
          status: string | null
          suggested_synonym: string
          times_seen: number | null
        }
        Insert: {
          canonical_service_id: string
          confidence: number
          created_at?: string | null
          id?: string
          language?: string | null
          reviewed_at?: string | null
          source_competitor?: string | null
          source_url?: string | null
          status?: string | null
          suggested_synonym: string
          times_seen?: number | null
        }
        Update: {
          canonical_service_id?: string
          confidence?: number
          created_at?: string | null
          id?: string
          language?: string | null
          reviewed_at?: string | null
          source_competitor?: string | null
          source_url?: string | null
          status?: string | null
          suggested_synonym?: string
          times_seen?: number | null
        }
        Relationships: []
      }
      competitor_price_changes: {
        Row: {
          competitor_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          jurisdiction_code: string | null
          new_price: number | null
          old_price: number | null
          price_change_pct: number | null
          service_type: string | null
          source_url: string | null
        }
        Insert: {
          competitor_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          jurisdiction_code?: string | null
          new_price?: number | null
          old_price?: number | null
          price_change_pct?: number | null
          service_type?: string | null
          source_url?: string | null
        }
        Update: {
          competitor_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          jurisdiction_code?: string | null
          new_price?: number | null
          old_price?: number | null
          price_change_pct?: number | null
          service_type?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      competitor_scan_config: {
        Row: {
          analysis_types: Json | null
          auto_scan_enabled: boolean | null
          auto_scan_frequency: string | null
          competitors: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          next_auto_scan_at: string | null
          organization_id: string | null
          scan_depth: string | null
          services: Json | null
          territories: Json | null
          updated_at: string | null
        }
        Insert: {
          analysis_types?: Json | null
          auto_scan_enabled?: boolean | null
          auto_scan_frequency?: string | null
          competitors?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          next_auto_scan_at?: string | null
          organization_id?: string | null
          scan_depth?: string | null
          services?: Json | null
          territories?: Json | null
          updated_at?: string | null
        }
        Update: {
          analysis_types?: Json | null
          auto_scan_enabled?: boolean | null
          auto_scan_frequency?: string | null
          competitors?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          next_auto_scan_at?: string | null
          organization_id?: string | null
          scan_depth?: string | null
          services?: Json | null
          territories?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_role_config: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_unique: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_unique?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_unique?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          annual_revenue: number | null
          assigned_to: string | null
          avatar_url: string | null
          city: string | null
          client_token: string | null
          client_token_generated_at: string | null
          client_type: string | null
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
          is_billing_contact: boolean | null
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
          parent_client_id: string | null
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
          client_token?: string | null
          client_token_generated_at?: string | null
          client_type?: string | null
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
          is_billing_contact?: boolean | null
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
          parent_client_id?: string | null
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
          client_token?: string | null
          client_token_generated_at?: string | null
          client_type?: string | null
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
          is_billing_contact?: boolean | null
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
          parent_client_id?: string | null
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
            foreignKeyName: "contacts_parent_client_id_fkey"
            columns: ["parent_client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
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
        Relationships: []
      }
      correction_reason_codes: {
        Row: {
          code: string
          name_es: string
        }
        Insert: {
          code: string
          name_es: string
        }
        Update: {
          code?: string
          name_es?: string
        }
        Relationships: []
      }
      data_audit_log: {
        Row: {
          change_reason: string | null
          change_source: string
          changed_at: string
          changed_by: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          change_reason?: string | null
          change_source?: string
          changed_at?: string
          changed_by?: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          change_reason?: string | null
          change_source?: string
          changed_at?: string
          changed_by?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
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
          message: string | null
          organization_id: string
          read_at: string | null
          recipient_email: string | null
          recipient_id: string | null
          recipient_role: string | null
          response_data: Json | null
          scheduled_for: string | null
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
          message?: string | null
          organization_id: string
          read_at?: string | null
          recipient_email?: string | null
          recipient_id?: string | null
          recipient_role?: string | null
          response_data?: Json | null
          scheduled_for?: string | null
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
          message?: string | null
          organization_id?: string
          read_at?: string | null
          recipient_email?: string | null
          recipient_id?: string | null
          recipient_role?: string | null
          response_data?: Json | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      deadline_notifications: {
        Row: {
          action_url: string | null
          channel: string
          created_at: string | null
          deadline_id: string | null
          dismissed_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          last_error: string | null
          message: string
          organization_id: string
          priority: string | null
          read_at: string | null
          retry_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          channel: string
          created_at?: string | null
          deadline_id?: string | null
          dismissed_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          last_error?: string | null
          message: string
          organization_id: string
          priority?: string | null
          read_at?: string | null
          retry_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          channel?: string
          created_at?: string | null
          deadline_id?: string | null
          dismissed_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          last_error?: string | null
          message?: string
          organization_id?: string
          priority?: string | null
          read_at?: string | null
          retry_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      deadline_reminders: {
        Row: {
          channel: string | null
          created_at: string | null
          days_before: number
          deadline_id: string
          error_message: string | null
          id: string
          reminder_date: string
          sent_at: string | null
          sent_to: string[] | null
          status: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          days_before: number
          deadline_id: string
          error_message?: string | null
          id?: string
          reminder_date: string
          sent_at?: string | null
          sent_to?: string[] | null
          status?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          days_before?: number
          deadline_id?: string
          error_message?: string | null
          id?: string
          reminder_date?: string
          sent_at?: string | null
          sent_to?: string[] | null
          status?: string | null
        }
        Relationships: []
      }
      deadline_rules: {
        Row: {
          adjust_to_business_day: boolean | null
          adjust_to_end_of_month: boolean | null
          alert_days: number[] | null
          applies_to_phase: string | null
          business_day_direction: string | null
          calendar_type: string | null
          can_be_revived: boolean | null
          category: string | null
          code: string
          consequence_if_missed: string | null
          created_at: string | null
          criticality: string
          description: string | null
          escalate_days_before: number | null
          escalate_to_role: string | null
          extension_requires_fee: boolean | null
          extension_time_unit: string | null
          extension_time_value: number | null
          id: string
          is_active: boolean | null
          is_extendable: boolean | null
          jurisdiction_id: string | null
          legal_basis: string | null
          legal_url: string | null
          max_extensions: number | null
          name_en: string
          name_es: string | null
          revival_period_days: number | null
          revival_requires_petition: boolean | null
          right_type: string | null
          time_unit: string
          time_value: number
          trigger_event: string
          trigger_field: string | null
          updated_at: string | null
        }
        Insert: {
          adjust_to_business_day?: boolean | null
          adjust_to_end_of_month?: boolean | null
          alert_days?: number[] | null
          applies_to_phase?: string | null
          business_day_direction?: string | null
          calendar_type?: string | null
          can_be_revived?: boolean | null
          category?: string | null
          code: string
          consequence_if_missed?: string | null
          created_at?: string | null
          criticality?: string
          description?: string | null
          escalate_days_before?: number | null
          escalate_to_role?: string | null
          extension_requires_fee?: boolean | null
          extension_time_unit?: string | null
          extension_time_value?: number | null
          id?: string
          is_active?: boolean | null
          is_extendable?: boolean | null
          jurisdiction_id?: string | null
          legal_basis?: string | null
          legal_url?: string | null
          max_extensions?: number | null
          name_en: string
          name_es?: string | null
          revival_period_days?: number | null
          revival_requires_petition?: boolean | null
          right_type?: string | null
          time_unit: string
          time_value: number
          trigger_event: string
          trigger_field?: string | null
          updated_at?: string | null
        }
        Update: {
          adjust_to_business_day?: boolean | null
          adjust_to_end_of_month?: boolean | null
          alert_days?: number[] | null
          applies_to_phase?: string | null
          business_day_direction?: string | null
          calendar_type?: string | null
          can_be_revived?: boolean | null
          category?: string | null
          code?: string
          consequence_if_missed?: string | null
          created_at?: string | null
          criticality?: string
          description?: string | null
          escalate_days_before?: number | null
          escalate_to_role?: string | null
          extension_requires_fee?: boolean | null
          extension_time_unit?: string | null
          extension_time_value?: number | null
          id?: string
          is_active?: boolean | null
          is_extendable?: boolean | null
          jurisdiction_id?: string | null
          legal_basis?: string | null
          legal_url?: string | null
          max_extensions?: number | null
          name_en?: string
          name_es?: string | null
          revival_period_days?: number | null
          revival_requires_petition?: boolean | null
          right_type?: string | null
          time_unit?: string
          time_value?: number
          trigger_event?: string
          trigger_field?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deadline_rules_jurisdiction_id_fkey"
            columns: ["jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "jurisdictions"
            referencedColumns: ["id"]
          },
        ]
      }
      deadline_types: {
        Row: {
          category: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          matter_types: string[]
          name_en: string | null
          name_es: string
          organization_id: string | null
          sort_order: number | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          matter_types?: string[]
          name_en?: string | null
          name_es: string
          organization_id?: string | null
          sort_order?: number | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          matter_types?: string[]
          name_en?: string | null
          name_es?: string
          organization_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      demand_signals: {
        Row: {
          created_at: string | null
          id: string
          jurisdiction_code: string | null
          metadata: Json | null
          period_end: string | null
          period_start: string | null
          query_text: string | null
          service_key: string | null
          signal_count: number | null
          signal_type: string
          source: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          jurisdiction_code?: string | null
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          query_text?: string | null
          service_key?: string | null
          signal_count?: number | null
          signal_type: string
          source: string
        }
        Update: {
          created_at?: string | null
          id?: string
          jurisdiction_code?: string | null
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          query_text?: string | null
          service_key?: string | null
          signal_count?: number | null
          signal_type?: string
          source?: string
        }
        Relationships: []
      }
      directory_change_log: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          entity_id: string
          entity_name: string | null
          entity_type: string
          id: string
          notes: string | null
          organization_id: string | null
          source: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          entity_id: string
          entity_name?: string | null
          entity_type: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          source?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          source?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      doc_templates: {
        Row: {
          available_jurisdictions: string[] | null
          category: string
          cover_preview_url: string | null
          created_at: string | null
          document_type: string
          estimated_value_max: number | null
          estimated_value_min: number | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          is_premium: boolean | null
          preview_image_url: string | null
          required_variables: Json | null
          sort_order: number | null
          style_code: string | null
          template_code: string
          template_description: string | null
          template_name: string
          template_structure: Json | null
          updated_at: string | null
          version: number | null
          visual_spec: Json | null
        }
        Insert: {
          available_jurisdictions?: string[] | null
          category?: string
          cover_preview_url?: string | null
          created_at?: string | null
          document_type: string
          estimated_value_max?: number | null
          estimated_value_min?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_premium?: boolean | null
          preview_image_url?: string | null
          required_variables?: Json | null
          sort_order?: number | null
          style_code?: string | null
          template_code: string
          template_description?: string | null
          template_name: string
          template_structure?: Json | null
          updated_at?: string | null
          version?: number | null
          visual_spec?: Json | null
        }
        Update: {
          available_jurisdictions?: string[] | null
          category?: string
          cover_preview_url?: string | null
          created_at?: string | null
          document_type?: string
          estimated_value_max?: number | null
          estimated_value_min?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_premium?: boolean | null
          preview_image_url?: string | null
          required_variables?: Json | null
          sort_order?: number | null
          style_code?: string | null
          template_code?: string
          template_description?: string | null
          template_name?: string
          template_structure?: Json | null
          updated_at?: string | null
          version?: number | null
          visual_spec?: Json | null
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
        Relationships: []
      }
      document_counters: {
        Row: {
          doc_type: string
          id: string
          last_number: number
          year: number
        }
        Insert: {
          doc_type: string
          id?: string
          last_number?: number
          year: number
        }
        Update: {
          doc_type?: string
          id?: string
          last_number?: number
          year?: number
        }
        Relationships: []
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
        Relationships: []
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
        ]
      }
      document_extractions: {
        Row: {
          ai_cost_usd: number | null
          ai_model_used: string | null
          ai_tokens_input: number | null
          ai_tokens_output: number | null
          client_data: Json | null
          client_id: string | null
          confidence_score: number | null
          created_at: string | null
          detected_jurisdiction: string | null
          detected_language: string | null
          document_id: string | null
          document_source: string | null
          document_type: string | null
          extracted_entities: Json | null
          file_name: string | null
          file_type: string | null
          id: string
          matter_id: string | null
          organization_id: string
          processing_time_ms: number | null
          raw_text: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          storage_path: string | null
          suggestions: Json | null
          suggestions_applied: number | null
          suggestions_rejected: number | null
        }
        Insert: {
          ai_cost_usd?: number | null
          ai_model_used?: string | null
          ai_tokens_input?: number | null
          ai_tokens_output?: number | null
          client_data?: Json | null
          client_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          detected_jurisdiction?: string | null
          detected_language?: string | null
          document_id?: string | null
          document_source?: string | null
          document_type?: string | null
          extracted_entities?: Json | null
          file_name?: string | null
          file_type?: string | null
          id?: string
          matter_id?: string | null
          organization_id: string
          processing_time_ms?: number | null
          raw_text?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          storage_path?: string | null
          suggestions?: Json | null
          suggestions_applied?: number | null
          suggestions_rejected?: number | null
        }
        Update: {
          ai_cost_usd?: number | null
          ai_model_used?: string | null
          ai_tokens_input?: number | null
          ai_tokens_output?: number | null
          client_data?: Json | null
          client_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          detected_jurisdiction?: string | null
          detected_language?: string | null
          document_id?: string | null
          document_source?: string | null
          document_type?: string | null
          extracted_entities?: Json | null
          file_name?: string | null
          file_type?: string | null
          id?: string
          matter_id?: string | null
          organization_id?: string
          processing_time_ms?: number | null
          raw_text?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          storage_path?: string | null
          suggestions?: Json | null
          suggestions_applied?: number | null
          suggestions_rejected?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_extractions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      document_sequences: {
        Row: {
          created_at: string | null
          document_type: string | null
          id: string
          last_number: number | null
          organization_id: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          document_type?: string | null
          id?: string
          last_number?: number | null
          organization_id?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          document_type?: string | null
          id?: string
          last_number?: number | null
          organization_id?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      document_styles: {
        Row: {
          author: string | null
          body_font: string | null
          code: string
          colors: Json | null
          created_at: string | null
          css_variables: Json | null
          description: string | null
          head_font: string | null
          header_layout: string | null
          id: string
          is_active: boolean | null
          is_dark: boolean | null
          name: string
          pack: string | null
          preview_image_url: string | null
          preview_thumbnail: string | null
          sort_order: number | null
          supports_languages: string[] | null
          template_html: string | null
          template_type: string | null
        }
        Insert: {
          author?: string | null
          body_font?: string | null
          code: string
          colors?: Json | null
          created_at?: string | null
          css_variables?: Json | null
          description?: string | null
          head_font?: string | null
          header_layout?: string | null
          id?: string
          is_active?: boolean | null
          is_dark?: boolean | null
          name: string
          pack?: string | null
          preview_image_url?: string | null
          preview_thumbnail?: string | null
          sort_order?: number | null
          supports_languages?: string[] | null
          template_html?: string | null
          template_type?: string | null
        }
        Update: {
          author?: string | null
          body_font?: string | null
          code?: string
          colors?: Json | null
          created_at?: string | null
          css_variables?: Json | null
          description?: string | null
          head_font?: string | null
          header_layout?: string | null
          id?: string
          is_active?: boolean | null
          is_dark?: boolean | null
          name?: string
          pack?: string | null
          preview_image_url?: string | null
          preview_thumbnail?: string | null
          sort_order?: number | null
          supports_languages?: string[] | null
          template_html?: string | null
          template_type?: string | null
        }
        Relationships: []
      }
      document_template_variables: {
        Row: {
          created_at: string | null
          description: string | null
          document_type: string
          example_value: string | null
          id: string
          is_required: boolean | null
          sort_order: number | null
          variable_code: string
          variable_group: string | null
          variable_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_type: string
          example_value?: string | null
          id?: string
          is_required?: boolean | null
          sort_order?: number | null
          variable_code: string
          variable_group?: string | null
          variable_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_type?: string
          example_value?: string | null
          id?: string
          is_required?: boolean | null
          sort_order?: number | null
          variable_code?: string
          variable_group?: string | null
          variable_name?: string
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          ai_max_tokens: number | null
          ai_model: string | null
          ai_system_prompt: string | null
          ai_temperature: number | null
          ai_user_prompt_template: string | null
          applicable_jurisdictions: string[] | null
          applicable_matter_types: string[] | null
          applicable_offices: string[] | null
          applicable_phases: string[] | null
          auto_generate_on_phase: string | null
          available_languages: string[] | null
          available_variables: Json | null
          average_rating: number | null
          based_on_template_id: string | null
          bilingual_content: Json | null
          body_sections: Json | null
          category: string
          category_code: string | null
          code: string | null
          content_html: string | null
          created_at: string | null
          created_by: string | null
          custom_colors: Json | null
          custom_texts: Json | null
          description: string | null
          display_order: number | null
          document_type: string | null
          footer_content: Json | null
          format: string | null
          header_content: Json | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          is_public: boolean | null
          is_required_for: string[] | null
          is_system_template: boolean | null
          jurisdiction_id: string | null
          jurisdiction_requirement_id: string | null
          last_modified_by: string | null
          layout: string | null
          margins: Json | null
          name: string
          numbering_digits: number | null
          numbering_prefix: string | null
          numbering_suffix: string | null
          office_code: string | null
          official_form_number: string | null
          organization_id: string | null
          orientation: string | null
          output_format: string | null
          paper_size: string | null
          preferred_style_code: string | null
          requires_signature: boolean | null
          right_type: string | null
          sections: Json | null
          show_footer: boolean | null
          show_header: boolean | null
          show_logo: boolean | null
          signature_positions: Json | null
          signature_type: string | null
          style: string | null
          tags: string[] | null
          template_content: string
          template_file_url: string | null
          template_type: string | null
          times_used: number | null
          type_config: Json | null
          typical_phase: string | null
          updated_at: string | null
          usage_count: number | null
          validation_rules: Json | null
          variable_codes: string[] | null
          variables: Json | null
          version: number | null
        }
        Insert: {
          ai_max_tokens?: number | null
          ai_model?: string | null
          ai_system_prompt?: string | null
          ai_temperature?: number | null
          ai_user_prompt_template?: string | null
          applicable_jurisdictions?: string[] | null
          applicable_matter_types?: string[] | null
          applicable_offices?: string[] | null
          applicable_phases?: string[] | null
          auto_generate_on_phase?: string | null
          available_languages?: string[] | null
          available_variables?: Json | null
          average_rating?: number | null
          based_on_template_id?: string | null
          bilingual_content?: Json | null
          body_sections?: Json | null
          category: string
          category_code?: string | null
          code?: string | null
          content_html?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_colors?: Json | null
          custom_texts?: Json | null
          description?: string | null
          display_order?: number | null
          document_type?: string | null
          footer_content?: Json | null
          format?: string | null
          header_content?: Json | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_public?: boolean | null
          is_required_for?: string[] | null
          is_system_template?: boolean | null
          jurisdiction_id?: string | null
          jurisdiction_requirement_id?: string | null
          last_modified_by?: string | null
          layout?: string | null
          margins?: Json | null
          name: string
          numbering_digits?: number | null
          numbering_prefix?: string | null
          numbering_suffix?: string | null
          office_code?: string | null
          official_form_number?: string | null
          organization_id?: string | null
          orientation?: string | null
          output_format?: string | null
          paper_size?: string | null
          preferred_style_code?: string | null
          requires_signature?: boolean | null
          right_type?: string | null
          sections?: Json | null
          show_footer?: boolean | null
          show_header?: boolean | null
          show_logo?: boolean | null
          signature_positions?: Json | null
          signature_type?: string | null
          style?: string | null
          tags?: string[] | null
          template_content: string
          template_file_url?: string | null
          template_type?: string | null
          times_used?: number | null
          type_config?: Json | null
          typical_phase?: string | null
          updated_at?: string | null
          usage_count?: number | null
          validation_rules?: Json | null
          variable_codes?: string[] | null
          variables?: Json | null
          version?: number | null
        }
        Update: {
          ai_max_tokens?: number | null
          ai_model?: string | null
          ai_system_prompt?: string | null
          ai_temperature?: number | null
          ai_user_prompt_template?: string | null
          applicable_jurisdictions?: string[] | null
          applicable_matter_types?: string[] | null
          applicable_offices?: string[] | null
          applicable_phases?: string[] | null
          auto_generate_on_phase?: string | null
          available_languages?: string[] | null
          available_variables?: Json | null
          average_rating?: number | null
          based_on_template_id?: string | null
          bilingual_content?: Json | null
          body_sections?: Json | null
          category?: string
          category_code?: string | null
          code?: string | null
          content_html?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_colors?: Json | null
          custom_texts?: Json | null
          description?: string | null
          display_order?: number | null
          document_type?: string | null
          footer_content?: Json | null
          format?: string | null
          header_content?: Json | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_public?: boolean | null
          is_required_for?: string[] | null
          is_system_template?: boolean | null
          jurisdiction_id?: string | null
          jurisdiction_requirement_id?: string | null
          last_modified_by?: string | null
          layout?: string | null
          margins?: Json | null
          name?: string
          numbering_digits?: number | null
          numbering_prefix?: string | null
          numbering_suffix?: string | null
          office_code?: string | null
          official_form_number?: string | null
          organization_id?: string | null
          orientation?: string | null
          output_format?: string | null
          paper_size?: string | null
          preferred_style_code?: string | null
          requires_signature?: boolean | null
          right_type?: string | null
          sections?: Json | null
          show_footer?: boolean | null
          show_header?: boolean | null
          show_logo?: boolean | null
          signature_positions?: Json | null
          signature_type?: string | null
          style?: string | null
          tags?: string[] | null
          template_content?: string
          template_file_url?: string | null
          template_type?: string | null
          times_used?: number | null
          type_config?: Json | null
          typical_phase?: string | null
          updated_at?: string | null
          usage_count?: number | null
          validation_rules?: Json | null
          variable_codes?: string[] | null
          variables?: Json | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_based_on_template_id_fkey"
            columns: ["based_on_template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_templates_jurisdiction_id_fkey"
            columns: ["jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "jurisdictions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_templates_jurisdiction_requirement_id_fkey"
            columns: ["jurisdiction_requirement_id"]
            isOneToOne: false
            referencedRelation: "jurisdiction_document_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          fields_schema: Json | null
          icon: string | null
          id: string
          name: string
          name_en: string | null
          sort_order: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          fields_schema?: Json | null
          icon?: string | null
          id: string
          name: string
          name_en?: string | null
          sort_order?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          fields_schema?: Json | null
          icon?: string | null
          id?: string
          name?: string
          name_en?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      document_validation_results: {
        Row: {
          created_at: string | null
          errors: Json | null
          generated_document_id: string | null
          id: string
          is_valid: boolean
          requirement_id: string | null
          validated_by: string | null
          validation_method: string | null
          validation_timestamp: string | null
          warnings: Json | null
        }
        Insert: {
          created_at?: string | null
          errors?: Json | null
          generated_document_id?: string | null
          id?: string
          is_valid: boolean
          requirement_id?: string | null
          validated_by?: string | null
          validation_method?: string | null
          validation_timestamp?: string | null
          warnings?: Json | null
        }
        Update: {
          created_at?: string | null
          errors?: Json | null
          generated_document_id?: string | null
          id?: string
          is_valid?: boolean
          requirement_id?: string | null
          validated_by?: string | null
          validation_method?: string | null
          validation_timestamp?: string | null
          warnings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_validation_results_generated_document_id_fkey"
            columns: ["generated_document_id"]
            isOneToOne: false
            referencedRelation: "generated_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_validation_results_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "jurisdiction_document_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      document_validation_rules: {
        Row: {
          created_at: string | null
          error_message_en: string
          error_message_es: string | null
          field_key: string | null
          id: string
          is_active: boolean | null
          is_blocking: boolean | null
          requirement_id: string
          rule_code: string
          rule_type: string
          severity: string | null
          validation_type: string
          validation_value: string | null
        }
        Insert: {
          created_at?: string | null
          error_message_en: string
          error_message_es?: string | null
          field_key?: string | null
          id?: string
          is_active?: boolean | null
          is_blocking?: boolean | null
          requirement_id: string
          rule_code: string
          rule_type: string
          severity?: string | null
          validation_type: string
          validation_value?: string | null
        }
        Update: {
          created_at?: string | null
          error_message_en?: string
          error_message_es?: string | null
          field_key?: string | null
          id?: string
          is_active?: boolean | null
          is_blocking?: boolean | null
          requirement_id?: string
          rule_code?: string
          rule_type?: string
          severity?: string | null
          validation_type?: string
          validation_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_validation_rules_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "jurisdiction_document_requirements"
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
        ]
      }
      document_versions: {
        Row: {
          change_summary: string | null
          created_at: string | null
          created_by: string | null
          document_id: string
          file_hash: string | null
          file_name: string
          file_size: number | null
          id: string
          storage_path: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id: string
          file_hash?: string | null
          file_name: string
          file_size?: number | null
          id?: string
          storage_path: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string
          file_hash?: string | null
          file_name?: string
          file_size?: number | null
          id?: string
          storage_path?: string
          version_number?: number
        }
        Relationships: []
      }
      documents: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          document_type:
            | Database["public"]["Enums"]["document_type_enum"]
            | null
          file_size: number | null
          id: string
          is_current_version: boolean | null
          matter_id: string | null
          mime_type: string | null
          organization_id: string
          original_filename: string
          previous_version_id: string | null
          storage_bucket: string
          storage_path: string
          title: string | null
          updated_at: string | null
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          document_type?:
            | Database["public"]["Enums"]["document_type_enum"]
            | null
          file_size?: number | null
          id?: string
          is_current_version?: boolean | null
          matter_id?: string | null
          mime_type?: string | null
          organization_id: string
          original_filename: string
          previous_version_id?: string | null
          storage_bucket: string
          storage_path: string
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          document_type?:
            | Database["public"]["Enums"]["document_type_enum"]
            | null
          file_size?: number | null
          id?: string
          is_current_version?: boolean | null
          matter_id?: string | null
          mime_type?: string | null
          organization_id?: string
          original_filename?: string
          previous_version_id?: string | null
          storage_bucket?: string
          storage_path?: string
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          base_currency: string
          change_pct: number | null
          currency_name: string | null
          expires_at: string | null
          fetched_at: string | null
          id: string
          manual_override: number | null
          previous_rate: number | null
          rate: number
          region: string | null
          source: string
          symbol: string | null
          target_currency: string
          updated_by: string | null
        }
        Insert: {
          base_currency?: string
          change_pct?: number | null
          currency_name?: string | null
          expires_at?: string | null
          fetched_at?: string | null
          id?: string
          manual_override?: number | null
          previous_rate?: number | null
          rate: number
          region?: string | null
          source?: string
          symbol?: string | null
          target_currency: string
          updated_by?: string | null
        }
        Update: {
          base_currency?: string
          change_pct?: number | null
          currency_name?: string | null
          expires_at?: string | null
          fetched_at?: string | null
          id?: string
          manual_override?: number | null
          previous_rate?: number | null
          rate?: number
          region?: string | null
          source?: string
          symbol?: string | null
          target_currency?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_category: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_category?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_category?: string | null
        }
        Relationships: []
      }
      extraction_suggestion_log: {
        Row: {
          action: string
          applied_at: string | null
          applied_by: string | null
          extraction_id: string
          field_name: string
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
          organization_id: string
          target_id: string | null
          target_table: string
        }
        Insert: {
          action: string
          applied_at?: string | null
          applied_by?: string | null
          extraction_id: string
          field_name: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          organization_id: string
          target_id?: string | null
          target_table: string
        }
        Update: {
          action?: string
          applied_at?: string | null
          applied_by?: string | null
          extraction_id?: string
          field_name?: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          organization_id?: string
          target_id?: string | null
          target_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "extraction_suggestion_log_extraction_id_fkey"
            columns: ["extraction_id"]
            isOneToOne: false
            referencedRelation: "document_extractions"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: Json | null
          audience: string | null
          category: string | null
          category_icon: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          question: Json | null
          updated_at: string | null
        }
        Insert: {
          answer?: Json | null
          audience?: string | null
          category?: string | null
          category_icon?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question?: Json | null
          updated_at?: string | null
        }
        Update: {
          answer?: Json | null
          audience?: string | null
          category?: string | null
          category_icon?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question?: Json | null
          updated_at?: string | null
        }
        Relationships: []
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
      fee_verification_log: {
        Row: {
          ai_model: string | null
          confidence_before: string | null
          country_code: string | null
          created_at: string
          currency_before: string | null
          currency_extracted: string | null
          discrepancy_pct: number | null
          dry_run: boolean
          error_message: string | null
          fee_before: number | null
          fee_extracted: number | null
          id: string
          ipo_office_id: string
          method: string | null
          office_acronym: string | null
          processing_ms: number | null
          raw_extract: string | null
          source_url: string | null
          status: string
          verification_date: string
        }
        Insert: {
          ai_model?: string | null
          confidence_before?: string | null
          country_code?: string | null
          created_at?: string
          currency_before?: string | null
          currency_extracted?: string | null
          discrepancy_pct?: number | null
          dry_run?: boolean
          error_message?: string | null
          fee_before?: number | null
          fee_extracted?: number | null
          id?: string
          ipo_office_id: string
          method?: string | null
          office_acronym?: string | null
          processing_ms?: number | null
          raw_extract?: string | null
          source_url?: string | null
          status: string
          verification_date?: string
        }
        Update: {
          ai_model?: string | null
          confidence_before?: string | null
          country_code?: string | null
          created_at?: string
          currency_before?: string | null
          currency_extracted?: string | null
          discrepancy_pct?: number | null
          dry_run?: boolean
          error_message?: string | null
          fee_before?: number | null
          fee_extracted?: number | null
          id?: string
          ipo_office_id?: string
          method?: string | null
          office_acronym?: string | null
          processing_ms?: number | null
          raw_extract?: string | null
          source_url?: string | null
          status?: string
          verification_date?: string
        }
        Relationships: []
      }
      finance_categories: {
        Row: {
          auto_track: boolean | null
          category_id: string | null
          channel: string | null
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          type: string
        }
        Insert: {
          auto_track?: boolean | null
          category_id?: string | null
          channel?: string | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          type: string
        }
        Update: {
          auto_track?: boolean | null
          category_id?: string | null
          channel?: string | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          type?: string
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          amount: number
          category: string
          category_id: string | null
          created_at: string | null
          currency: string
          description: string
          id: string
          metadata: Json | null
          notes: string | null
          reference_id: string | null
          reference_table: string | null
          status: string | null
          subcategory: string | null
          transaction_date: string
          type: string
          updated_at: string | null
          vendor: string | null
          vendor_id: string | null
        }
        Insert: {
          amount?: number
          category: string
          category_id?: string | null
          created_at?: string | null
          currency?: string
          description: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          reference_id?: string | null
          reference_table?: string | null
          status?: string | null
          subcategory?: string | null
          transaction_date?: string
          type: string
          updated_at?: string | null
          vendor?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          category_id?: string | null
          created_at?: string | null
          currency?: string
          description?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          reference_id?: string | null
          reference_table?: string | null
          status?: string | null
          subcategory?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string | null
          vendor?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "finance_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_vendors: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string | null
          website?: string | null
        }
        Relationships: []
      }
      frontend_error_log: {
        Row: {
          created_at: string | null
          error_code: string | null
          error_message: string | null
          id: string
          page_url: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          page_url?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          page_url?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
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
      generated_documents: {
        Row: {
          ai_model_used: string | null
          ai_prompt_used: string | null
          ai_tokens_used: number | null
          category: string | null
          client_id: string | null
          contact_id: string | null
          content: string
          content_html: string | null
          content_json: Json | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          discount_amount: number | null
          document_data: Json | null
          document_date: string | null
          document_number: string | null
          document_type_id: string | null
          due_date: string | null
          export_format: string | null
          exported_at: string | null
          exported_document_id: string | null
          generation_time_ms: number | null
          id: string
          invoice_id: string | null
          matter_id: string | null
          name: string
          organization_id: string
          paid_at: string | null
          parent_document_id: string | null
          parent_id: string | null
          pdf_url: string | null
          sent_at: string | null
          sent_to: string | null
          status: string | null
          style_code: string | null
          style_id: string | null
          subtotal: number | null
          tax_amount: number | null
          template_id: string | null
          title: string | null
          total_amount: number | null
          updated_at: string | null
          user_feedback: string | null
          user_rating: number | null
          variables_input: Json | null
          variables_resolved: Json | null
          version: number | null
          word_html: string | null
        }
        Insert: {
          ai_model_used?: string | null
          ai_prompt_used?: string | null
          ai_tokens_used?: number | null
          category?: string | null
          client_id?: string | null
          contact_id?: string | null
          content: string
          content_html?: string | null
          content_json?: Json | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          discount_amount?: number | null
          document_data?: Json | null
          document_date?: string | null
          document_number?: string | null
          document_type_id?: string | null
          due_date?: string | null
          export_format?: string | null
          exported_at?: string | null
          exported_document_id?: string | null
          generation_time_ms?: number | null
          id?: string
          invoice_id?: string | null
          matter_id?: string | null
          name: string
          organization_id: string
          paid_at?: string | null
          parent_document_id?: string | null
          parent_id?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          sent_to?: string | null
          status?: string | null
          style_code?: string | null
          style_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          template_id?: string | null
          title?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_feedback?: string | null
          user_rating?: number | null
          variables_input?: Json | null
          variables_resolved?: Json | null
          version?: number | null
          word_html?: string | null
        }
        Update: {
          ai_model_used?: string | null
          ai_prompt_used?: string | null
          ai_tokens_used?: number | null
          category?: string | null
          client_id?: string | null
          contact_id?: string | null
          content?: string
          content_html?: string | null
          content_json?: Json | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          discount_amount?: number | null
          document_data?: Json | null
          document_date?: string | null
          document_number?: string | null
          document_type_id?: string | null
          due_date?: string | null
          export_format?: string | null
          exported_at?: string | null
          exported_document_id?: string | null
          generation_time_ms?: number | null
          id?: string
          invoice_id?: string | null
          matter_id?: string | null
          name?: string
          organization_id?: string
          paid_at?: string | null
          parent_document_id?: string | null
          parent_id?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          sent_to?: string | null
          status?: string | null
          style_code?: string | null
          style_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          template_id?: string | null
          title?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_feedback?: string | null
          user_rating?: number | null
          variables_input?: Json | null
          variables_resolved?: Json | null
          version?: number | null
          word_html?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "generated_documents"
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
            foreignKeyName: "generated_documents_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "document_styles"
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_article_feedback_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "help_articles"
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
            foreignKeyName: "help_rule_execution_log_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "help_rules"
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
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_search_logs_clicked_article_id_fkey"
            columns: ["clicked_article_id"]
            isOneToOne: false
            referencedRelation: "help_articles"
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
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
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
      holders: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          code: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          fax: string | null
          first_name: string | null
          holder_type: string
          id: string
          incorporation_country: string | null
          incorporation_date: string | null
          incorporation_number: string | null
          industry: string | null
          industry_codes: string[] | null
          internal_notes: string | null
          is_active: boolean | null
          last_name: string | null
          legal_name: string
          notes: string | null
          notification_address: Json | null
          organization_id: string
          phone: string | null
          postal_code: string | null
          preferred_language: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          primary_contact_position: string | null
          state_province: string | null
          tax_country: string | null
          tax_id: string | null
          tax_id_type: string | null
          trade_name: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          code?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          fax?: string | null
          first_name?: string | null
          holder_type?: string
          id?: string
          incorporation_country?: string | null
          incorporation_date?: string | null
          incorporation_number?: string | null
          industry?: string | null
          industry_codes?: string[] | null
          internal_notes?: string | null
          is_active?: boolean | null
          last_name?: string | null
          legal_name: string
          notes?: string | null
          notification_address?: Json | null
          organization_id: string
          phone?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          primary_contact_position?: string | null
          state_province?: string | null
          tax_country?: string | null
          tax_id?: string | null
          tax_id_type?: string | null
          trade_name?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          code?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          fax?: string | null
          first_name?: string | null
          holder_type?: string
          id?: string
          incorporation_country?: string | null
          incorporation_date?: string | null
          incorporation_number?: string | null
          industry?: string | null
          industry_codes?: string[] | null
          internal_notes?: string | null
          is_active?: boolean | null
          last_name?: string | null
          legal_name?: string
          notes?: string | null
          notification_address?: Json | null
          organization_id?: string
          phone?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          primary_contact_position?: string | null
          state_province?: string | null
          tax_country?: string | null
          tax_id?: string | null
          tax_id_type?: string | null
          trade_name?: string | null
          updated_at?: string | null
          website?: string | null
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
        Relationships: []
      }
      import_review_queue: {
        Row: {
          conflicting_fields: Json | null
          created_at: string
          current_data: Json | null
          extracted_data: Json
          final_data: Json | null
          id: string
          import_id: string
          match_confidence: number | null
          match_type: string | null
          matched_fields: Json | null
          matter_id: string | null
          organization_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          conflicting_fields?: Json | null
          created_at?: string
          current_data?: Json | null
          extracted_data?: Json
          final_data?: Json | null
          id?: string
          import_id: string
          match_confidence?: number | null
          match_type?: string | null
          matched_fields?: Json | null
          matter_id?: string | null
          organization_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          conflicting_fields?: Json | null
          created_at?: string
          current_data?: Json | null
          extracted_data?: Json
          final_data?: Json | null
          id?: string
          import_id?: string
          match_confidence?: number | null
          match_type?: string | null
          matched_fields?: Json | null
          matter_id?: string | null
          organization_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      intelligence_config: {
        Row: {
          agent_costs_by_region: Json | null
          analysis_types: Json | null
          auto_analysis_enabled: boolean | null
          auto_scan_enabled: boolean | null
          auto_scan_frequency: string | null
          comparable_price_types: Json | null
          competitor_reaction_rule: string | null
          competitors: Json | null
          cost_overrides: Json | null
          cost_templates: Json | null
          created_at: string | null
          guardrail_ceiling_enabled: boolean | null
          guardrail_ceiling_multiplier: number | null
          guardrail_ceiling_per_jurisdiction: Json | null
          guardrail_ceiling_type: string | null
          guardrail_floor_margin: number | null
          guardrail_floor_pct: number | null
          guardrail_floor_type: string | null
          id: string
          include_methodology: boolean | null
          jurisdiction_exceptions: Json | null
          market_priority_by: string | null
          max_data_age_days: number | null
          max_market_penetration: number | null
          min_data_confidence: number | null
          min_margin_by_service_type: Json | null
          min_margin_global: number | null
          min_market_growth: number | null
          min_market_margin: number | null
          min_wipo_filings: number | null
          next_auto_scan_at: string | null
          organization_id: string | null
          outlier_threshold_pct: number | null
          output_detail_level: string | null
          output_language: string | null
          overhead_percentage: number | null
          pricing_strategy: string | null
          pricing_strategy_offset: number | null
          reaction_threshold_pct: number | null
          updated_at: string | null
        }
        Insert: {
          agent_costs_by_region?: Json | null
          analysis_types?: Json | null
          auto_analysis_enabled?: boolean | null
          auto_scan_enabled?: boolean | null
          auto_scan_frequency?: string | null
          comparable_price_types?: Json | null
          competitor_reaction_rule?: string | null
          competitors?: Json | null
          cost_overrides?: Json | null
          cost_templates?: Json | null
          created_at?: string | null
          guardrail_ceiling_enabled?: boolean | null
          guardrail_ceiling_multiplier?: number | null
          guardrail_ceiling_per_jurisdiction?: Json | null
          guardrail_ceiling_type?: string | null
          guardrail_floor_margin?: number | null
          guardrail_floor_pct?: number | null
          guardrail_floor_type?: string | null
          id?: string
          include_methodology?: boolean | null
          jurisdiction_exceptions?: Json | null
          market_priority_by?: string | null
          max_data_age_days?: number | null
          max_market_penetration?: number | null
          min_data_confidence?: number | null
          min_margin_by_service_type?: Json | null
          min_margin_global?: number | null
          min_market_growth?: number | null
          min_market_margin?: number | null
          min_wipo_filings?: number | null
          next_auto_scan_at?: string | null
          organization_id?: string | null
          outlier_threshold_pct?: number | null
          output_detail_level?: string | null
          output_language?: string | null
          overhead_percentage?: number | null
          pricing_strategy?: string | null
          pricing_strategy_offset?: number | null
          reaction_threshold_pct?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_costs_by_region?: Json | null
          analysis_types?: Json | null
          auto_analysis_enabled?: boolean | null
          auto_scan_enabled?: boolean | null
          auto_scan_frequency?: string | null
          comparable_price_types?: Json | null
          competitor_reaction_rule?: string | null
          competitors?: Json | null
          cost_overrides?: Json | null
          cost_templates?: Json | null
          created_at?: string | null
          guardrail_ceiling_enabled?: boolean | null
          guardrail_ceiling_multiplier?: number | null
          guardrail_ceiling_per_jurisdiction?: Json | null
          guardrail_ceiling_type?: string | null
          guardrail_floor_margin?: number | null
          guardrail_floor_pct?: number | null
          guardrail_floor_type?: string | null
          id?: string
          include_methodology?: boolean | null
          jurisdiction_exceptions?: Json | null
          market_priority_by?: string | null
          max_data_age_days?: number | null
          max_market_penetration?: number | null
          min_data_confidence?: number | null
          min_margin_by_service_type?: Json | null
          min_margin_global?: number | null
          min_market_growth?: number | null
          min_market_margin?: number | null
          min_wipo_filings?: number | null
          next_auto_scan_at?: string | null
          organization_id?: string | null
          outlier_threshold_pct?: number | null
          output_detail_level?: string | null
          output_language?: string | null
          overhead_percentage?: number | null
          pricing_strategy?: string | null
          pricing_strategy_offset?: number | null
          reaction_threshold_pct?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      internal_notifications: {
        Row: {
          action_url: string | null
          category: string | null
          created_at: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string | null
          metadata: Json | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      internal_reference_config: {
        Row: {
          created_at: string | null
          id: string
          include_client_code: boolean | null
          is_active: boolean | null
          organization_id: string
          preview_example: string | null
          separator: string | null
          seq_padding: number | null
          seq_scope: string | null
          seq_start: number | null
          template: string
          updated_at: string | null
          uppercase: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          include_client_code?: boolean | null
          is_active?: boolean | null
          organization_id: string
          preview_example?: string | null
          separator?: string | null
          seq_padding?: number | null
          seq_scope?: string | null
          seq_start?: number | null
          template?: string
          updated_at?: string | null
          uppercase?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          include_client_code?: boolean | null
          is_active?: boolean | null
          organization_id?: string
          preview_example?: string | null
          separator?: string | null
          seq_padding?: number | null
          seq_scope?: string | null
          seq_start?: number | null
          template?: string
          updated_at?: string | null
          uppercase?: boolean | null
        }
        Relationships: []
      }
      internal_reference_sequences: {
        Row: {
          id: string
          last_value: number | null
          organization_id: string
          sequence_key: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          last_value?: number | null
          organization_id: string
          sequence_key: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          last_value?: number | null
          organization_id?: string
          sequence_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ip_office_fees: {
        Row: {
          active: boolean | null
          amount: number | null
          created_at: string | null
          currency: string | null
          id: string
          ip_type: string | null
          office_id: string | null
          service_category: string | null
          service_name: string | null
        }
        Insert: {
          active?: boolean | null
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          ip_type?: string | null
          office_id?: string | null
          service_category?: string | null
          service_name?: string | null
        }
        Update: {
          active?: boolean | null
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          ip_type?: string | null
          office_id?: string | null
          service_category?: string | null
          service_name?: string | null
        }
        Relationships: []
      }
      ip_office_research_queue: {
        Row: {
          auto_confidence_score: number | null
          created_at: string | null
          id: string
          office_id: string | null
          research_completed_at: string | null
          status: string | null
        }
        Insert: {
          auto_confidence_score?: number | null
          created_at?: string | null
          id?: string
          office_id?: string | null
          research_completed_at?: string | null
          status?: string | null
        }
        Update: {
          auto_confidence_score?: number | null
          created_at?: string | null
          id?: string
          office_id?: string | null
          research_completed_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      ipc_classes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          section_id: string
          title_en: string | null
          title_es: string
          version: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          section_id: string
          title_en?: string | null
          title_es: string
          version?: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          section_id?: string
          title_en?: string | null
          title_es?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "ipc_classes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "ipc_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      ipc_groups: {
        Row: {
          code: string
          created_at: string | null
          hierarchy_level: number | null
          id: string
          is_active: boolean | null
          is_main_group: boolean | null
          parent_group_id: string | null
          subclass_id: string
          title_en: string | null
          title_es: string
          version: string
        }
        Insert: {
          code: string
          created_at?: string | null
          hierarchy_level?: number | null
          id?: string
          is_active?: boolean | null
          is_main_group?: boolean | null
          parent_group_id?: string | null
          subclass_id: string
          title_en?: string | null
          title_es: string
          version?: string
        }
        Update: {
          code?: string
          created_at?: string | null
          hierarchy_level?: number | null
          id?: string
          is_active?: boolean | null
          is_main_group?: boolean | null
          parent_group_id?: string | null
          subclass_id?: string
          title_en?: string | null
          title_es?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "ipc_groups_parent_group_id_fkey"
            columns: ["parent_group_id"]
            isOneToOne: false
            referencedRelation: "ipc_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipc_groups_subclass_id_fkey"
            columns: ["subclass_id"]
            isOneToOne: false
            referencedRelation: "ipc_subclasses"
            referencedColumns: ["id"]
          },
        ]
      }
      ipc_sections: {
        Row: {
          code: string
          created_at: string | null
          description_es: string | null
          id: string
          is_active: boolean | null
          title_en: string | null
          title_es: string
          version: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description_es?: string | null
          id?: string
          is_active?: boolean | null
          title_en?: string | null
          title_es: string
          version?: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description_es?: string | null
          id?: string
          is_active?: boolean | null
          title_en?: string | null
          title_es?: string
          version?: string
        }
        Relationships: []
      }
      ipc_subclasses: {
        Row: {
          class_id: string
          code: string
          created_at: string | null
          definition_es: string | null
          id: string
          is_active: boolean | null
          title_en: string | null
          title_es: string
          version: string
        }
        Insert: {
          class_id: string
          code: string
          created_at?: string | null
          definition_es?: string | null
          id?: string
          is_active?: boolean | null
          title_en?: string | null
          title_es: string
          version?: string
        }
        Update: {
          class_id?: string
          code?: string
          created_at?: string | null
          definition_es?: string | null
          id?: string
          is_active?: boolean | null
          title_en?: string | null
          title_es?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "ipc_subclasses_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "ipc_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_enrich_runs: {
        Row: {
          dry_run: boolean
          duration_seconds: number | null
          errors_count: number | null
          id: string
          mode: string
          offices_errors: Json | null
          offices_updated: Json | null
          params: Json | null
          ran_at: string
          ran_by: string | null
          ran_by_email: string | null
          raw_log: string[] | null
          raw_response: Json | null
          tier0_count: number | null
          tier1_count: number | null
          tier2_count: number | null
          tier3_count: number | null
          total_updated: number | null
        }
        Insert: {
          dry_run?: boolean
          duration_seconds?: number | null
          errors_count?: number | null
          id?: string
          mode: string
          offices_errors?: Json | null
          offices_updated?: Json | null
          params?: Json | null
          ran_at?: string
          ran_by?: string | null
          ran_by_email?: string | null
          raw_log?: string[] | null
          raw_response?: Json | null
          tier0_count?: number | null
          tier1_count?: number | null
          tier2_count?: number | null
          tier3_count?: number | null
          total_updated?: number | null
        }
        Update: {
          dry_run?: boolean
          duration_seconds?: number | null
          errors_count?: number | null
          id?: string
          mode?: string
          offices_errors?: Json | null
          offices_updated?: Json | null
          params?: Json | null
          ran_at?: string
          ran_by?: string | null
          ran_by_email?: string | null
          raw_log?: string[] | null
          raw_response?: Json | null
          tier0_count?: number | null
          tier1_count?: number | null
          tier2_count?: number | null
          tier3_count?: number | null
          total_updated?: number | null
        }
        Relationships: []
      }
      ipo_fee_history: {
        Row: {
          change_notes: string | null
          change_pct: number | null
          created_at: string | null
          currency: string | null
          effective_date: string
          id: string
          ipo_office_id: string
          office_code: string
          source_url: string | null
          tm_appeal_fee: number | null
          tm_class_extra_fee: number | null
          tm_filing_fee: number | null
          tm_opposition_fee: number | null
          tm_renewal_fee: number | null
          verified_by: string | null
        }
        Insert: {
          change_notes?: string | null
          change_pct?: number | null
          created_at?: string | null
          currency?: string | null
          effective_date: string
          id?: string
          ipo_office_id: string
          office_code: string
          source_url?: string | null
          tm_appeal_fee?: number | null
          tm_class_extra_fee?: number | null
          tm_filing_fee?: number | null
          tm_opposition_fee?: number | null
          tm_renewal_fee?: number | null
          verified_by?: string | null
        }
        Update: {
          change_notes?: string | null
          change_pct?: number | null
          created_at?: string | null
          currency?: string | null
          effective_date?: string
          id?: string
          ipo_office_id?: string
          office_code?: string
          source_url?: string | null
          tm_appeal_fee?: number | null
          tm_class_extra_fee?: number | null
          tm_filing_fee?: number | null
          tm_opposition_fee?: number | null
          tm_renewal_fee?: number | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_fee_history_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_fee_history_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_fee_history_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_fee_history_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "ipo_fee_history_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
        ]
      }
      ipo_market_intel: {
        Row: {
          approval_rate: number | null
          created_at: string | null
          data_year: number
          domestic_pct: number | null
          foreign_pct: number | null
          id: string
          ipo_office_id: string
          office_code: string
          opposition_rate: number | null
          rejection_rate: number | null
          source_name: string | null
          source_url: string | null
          top_nice_classes: Json | null
          top_origin_countries: Json | null
          top_sectors: Json | null
          total_oppositions: number | null
          total_tm_applications: number | null
          total_tm_registrations: number | null
          total_tm_renewals: number | null
          trend_notes: string | null
          ub_opportunity_score: number | null
          ub_target_segments: Json | null
          updated_at: string | null
          yoy_growth_pct: number | null
        }
        Insert: {
          approval_rate?: number | null
          created_at?: string | null
          data_year: number
          domestic_pct?: number | null
          foreign_pct?: number | null
          id?: string
          ipo_office_id: string
          office_code: string
          opposition_rate?: number | null
          rejection_rate?: number | null
          source_name?: string | null
          source_url?: string | null
          top_nice_classes?: Json | null
          top_origin_countries?: Json | null
          top_sectors?: Json | null
          total_oppositions?: number | null
          total_tm_applications?: number | null
          total_tm_registrations?: number | null
          total_tm_renewals?: number | null
          trend_notes?: string | null
          ub_opportunity_score?: number | null
          ub_target_segments?: Json | null
          updated_at?: string | null
          yoy_growth_pct?: number | null
        }
        Update: {
          approval_rate?: number | null
          created_at?: string | null
          data_year?: number
          domestic_pct?: number | null
          foreign_pct?: number | null
          id?: string
          ipo_office_id?: string
          office_code?: string
          opposition_rate?: number | null
          rejection_rate?: number | null
          source_name?: string | null
          source_url?: string | null
          top_nice_classes?: Json | null
          top_origin_countries?: Json | null
          top_sectors?: Json | null
          total_oppositions?: number | null
          total_tm_applications?: number | null
          total_tm_registrations?: number | null
          total_tm_renewals?: number | null
          trend_notes?: string | null
          ub_opportunity_score?: number | null
          ub_target_segments?: Json | null
          updated_at?: string | null
          yoy_growth_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_market_intel_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_market_intel_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_market_intel_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_market_intel_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "ipo_market_intel_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
        ]
      }
      ipo_offices: {
        Row: {
          accepted_languages: Json | null
          accepted_mark_types: Json | null
          address: string | null
          agent_required: boolean | null
          agent_required_for_foreign: boolean | null
          annual_filing_volume: number | null
          api_authentication_type: string | null
          api_base_url: string | null
          api_credentials: Json | null
          api_documentation_url: string | null
          api_sandbox_available: boolean | null
          api_type: string | null
          api_url: string | null
          api_version: string | null
          appeal_procedure: Json | null
          approval_rate_pct: number | null
          auth_type: string | null
          automation_level: string | null
          automation_percentage: number | null
          avg_days_opposition_period: number | null
          avg_days_to_decision: number | null
          avg_days_to_first_action: number | null
          avg_days_to_publication: number | null
          avg_response_time_ms: number | null
          best_practices: Json | null
          bulk_data_available: boolean | null
          cancellation_procedure: Json | null
          capabilities: Json | null
          code: string
          code_alt: string | null
          common_mistakes: Json | null
          common_rejection_reasons: Json | null
          connection_config: Json | null
          connection_status: string | null
          contact_appeals_dept: string | null
          contact_trademarks_dept: string | null
          contact_urgent: string | null
          country_code: string | null
          country_flag: string | null
          country_name: string | null
          created_at: string | null
          currency: string | null
          data_confidence: string | null
          data_last_verified_at: string | null
          data_last_verified_by: string | null
          data_quality_flag: string | null
          data_quality_notes: string | null
          data_source_config: Json | null
          data_source_notes: string | null
          data_source_type: string | null
          default_partner_id: string | null
          digital_score: number | null
          director_name: string | null
          director_title: string | null
          display_order: number | null
          documents_required: Json | null
          e_filing_available: boolean | null
          e_filing_url: string | null
          electronic_signature: boolean | null
          email_general: string | null
          examiner_patterns: Json | null
          fax: string | null
          fee_last_verified_at: string | null
          fees_source_notes: string | null
          fees_url: string | null
          filing_volume_growth_pct: number | null
          filing_volume_year: number | null
          flag: string | null
          flag_emoji: string | null
          grace_period_days: number | null
          has_api: boolean | null
          id: string
          insights_updated_at: string | null
          internal_notes: string | null
          ip_types: string[] | null
          is_active: boolean | null
          is_connected: boolean | null
          languages: string[] | null
          last_health_check: string | null
          last_interaction_at: string | null
          last_sync_at: string | null
          last_sync_status: string | null
          last_sync_type: string | null
          latam_relevance_score: number | null
          linkedin_page: string | null
          main_rejection_reasons: Json | null
          member_madrid_protocol: boolean | null
          name: string | null
          name_en: string | null
          name_es: string | null
          name_official: string
          name_short: string | null
          next_review_date: string | null
          nice_version: string | null
          notes: string | null
          office_acronym: string | null
          office_hours: string | null
          office_type: string
          online_payment: boolean | null
          open_data_available: boolean | null
          operational_status: string | null
          opposition_procedure: Json | null
          opposition_success_rate: number | null
          paris_convention_member: boolean | null
          payment_methods: Json | null
          phone_general: string | null
          preparation_tips: string | null
          priority_claim_months: number | null
          priority_score: number | null
          product_id: string | null
          rate_limit_per_day: number | null
          rate_limit_per_minute: number | null
          region: string | null
          rejection_rate: number | null
          rejection_rate_pct: number | null
          renewal_procedure: Json | null
          search_url: string | null
          spanish_companies_active: boolean | null
          special_requirements: Json | null
          stats_patent_applications: number | null
          stats_patent_grants: number | null
          stats_source_url: string | null
          stats_tm_applications: number | null
          stats_tm_registrations: number | null
          stats_year: number | null
          status: string | null
          success_rate_approvals: number | null
          success_rate_sample_size: number | null
          success_rate_updated_at: string | null
          support_email: string | null
          support_phone: string | null
          supported_mark_types: Json | null
          supports_documents: boolean | null
          supports_events: boolean | null
          supports_fees: boolean | null
          supports_search: boolean | null
          supports_status: boolean | null
          sync_frequency: string | null
          tier: number | null
          timezone: string
          tm_appeal_fee: number | null
          tm_class_extra_fee: number | null
          tm_estimated_registration_months: number | null
          tm_expedited_fee: number | null
          tm_fee_change_pct_last: number | null
          tm_fee_currency: string | null
          tm_fee_last_change_date: string | null
          tm_fee_next_review_date: string | null
          tm_filing_fee: number | null
          tm_multi_class: boolean | null
          tm_online_filing_url: string | null
          tm_opposition_fee: number | null
          tm_opposition_period_days: number | null
          tm_recordal_fee: number | null
          tm_registration_duration_years: number | null
          tm_renewal_fee: number | null
          tm_search_url: string | null
          tm_use_requirement: boolean | null
          tmview_available: boolean | null
          top_filing_countries: Json | null
          top_filing_sectors: Json | null
          total_filings_tracked: number | null
          translation_languages: Json | null
          translation_required: boolean | null
          ub_integration_notes: string | null
          ub_integration_status: string | null
          updated_at: string | null
          url_status: string | null
          use_requirement_details: string | null
          use_requirement_years: number | null
          uses_nice_classification: boolean | null
          website_official: string | null
          website_search: string | null
          wipo_madrid_code: string | null
          working_hours: Json | null
        }
        Insert: {
          accepted_languages?: Json | null
          accepted_mark_types?: Json | null
          address?: string | null
          agent_required?: boolean | null
          agent_required_for_foreign?: boolean | null
          annual_filing_volume?: number | null
          api_authentication_type?: string | null
          api_base_url?: string | null
          api_credentials?: Json | null
          api_documentation_url?: string | null
          api_sandbox_available?: boolean | null
          api_type?: string | null
          api_url?: string | null
          api_version?: string | null
          appeal_procedure?: Json | null
          approval_rate_pct?: number | null
          auth_type?: string | null
          automation_level?: string | null
          automation_percentage?: number | null
          avg_days_opposition_period?: number | null
          avg_days_to_decision?: number | null
          avg_days_to_first_action?: number | null
          avg_days_to_publication?: number | null
          avg_response_time_ms?: number | null
          best_practices?: Json | null
          bulk_data_available?: boolean | null
          cancellation_procedure?: Json | null
          capabilities?: Json | null
          code: string
          code_alt?: string | null
          common_mistakes?: Json | null
          common_rejection_reasons?: Json | null
          connection_config?: Json | null
          connection_status?: string | null
          contact_appeals_dept?: string | null
          contact_trademarks_dept?: string | null
          contact_urgent?: string | null
          country_code?: string | null
          country_flag?: string | null
          country_name?: string | null
          created_at?: string | null
          currency?: string | null
          data_confidence?: string | null
          data_last_verified_at?: string | null
          data_last_verified_by?: string | null
          data_quality_flag?: string | null
          data_quality_notes?: string | null
          data_source_config?: Json | null
          data_source_notes?: string | null
          data_source_type?: string | null
          default_partner_id?: string | null
          digital_score?: number | null
          director_name?: string | null
          director_title?: string | null
          display_order?: number | null
          documents_required?: Json | null
          e_filing_available?: boolean | null
          e_filing_url?: string | null
          electronic_signature?: boolean | null
          email_general?: string | null
          examiner_patterns?: Json | null
          fax?: string | null
          fee_last_verified_at?: string | null
          fees_source_notes?: string | null
          fees_url?: string | null
          filing_volume_growth_pct?: number | null
          filing_volume_year?: number | null
          flag?: string | null
          flag_emoji?: string | null
          grace_period_days?: number | null
          has_api?: boolean | null
          id?: string
          insights_updated_at?: string | null
          internal_notes?: string | null
          ip_types?: string[] | null
          is_active?: boolean | null
          is_connected?: boolean | null
          languages?: string[] | null
          last_health_check?: string | null
          last_interaction_at?: string | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          last_sync_type?: string | null
          latam_relevance_score?: number | null
          linkedin_page?: string | null
          main_rejection_reasons?: Json | null
          member_madrid_protocol?: boolean | null
          name?: string | null
          name_en?: string | null
          name_es?: string | null
          name_official: string
          name_short?: string | null
          next_review_date?: string | null
          nice_version?: string | null
          notes?: string | null
          office_acronym?: string | null
          office_hours?: string | null
          office_type: string
          online_payment?: boolean | null
          open_data_available?: boolean | null
          operational_status?: string | null
          opposition_procedure?: Json | null
          opposition_success_rate?: number | null
          paris_convention_member?: boolean | null
          payment_methods?: Json | null
          phone_general?: string | null
          preparation_tips?: string | null
          priority_claim_months?: number | null
          priority_score?: number | null
          product_id?: string | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          region?: string | null
          rejection_rate?: number | null
          rejection_rate_pct?: number | null
          renewal_procedure?: Json | null
          search_url?: string | null
          spanish_companies_active?: boolean | null
          special_requirements?: Json | null
          stats_patent_applications?: number | null
          stats_patent_grants?: number | null
          stats_source_url?: string | null
          stats_tm_applications?: number | null
          stats_tm_registrations?: number | null
          stats_year?: number | null
          status?: string | null
          success_rate_approvals?: number | null
          success_rate_sample_size?: number | null
          success_rate_updated_at?: string | null
          support_email?: string | null
          support_phone?: string | null
          supported_mark_types?: Json | null
          supports_documents?: boolean | null
          supports_events?: boolean | null
          supports_fees?: boolean | null
          supports_search?: boolean | null
          supports_status?: boolean | null
          sync_frequency?: string | null
          tier?: number | null
          timezone: string
          tm_appeal_fee?: number | null
          tm_class_extra_fee?: number | null
          tm_estimated_registration_months?: number | null
          tm_expedited_fee?: number | null
          tm_fee_change_pct_last?: number | null
          tm_fee_currency?: string | null
          tm_fee_last_change_date?: string | null
          tm_fee_next_review_date?: string | null
          tm_filing_fee?: number | null
          tm_multi_class?: boolean | null
          tm_online_filing_url?: string | null
          tm_opposition_fee?: number | null
          tm_opposition_period_days?: number | null
          tm_recordal_fee?: number | null
          tm_registration_duration_years?: number | null
          tm_renewal_fee?: number | null
          tm_search_url?: string | null
          tm_use_requirement?: boolean | null
          tmview_available?: boolean | null
          top_filing_countries?: Json | null
          top_filing_sectors?: Json | null
          total_filings_tracked?: number | null
          translation_languages?: Json | null
          translation_required?: boolean | null
          ub_integration_notes?: string | null
          ub_integration_status?: string | null
          updated_at?: string | null
          url_status?: string | null
          use_requirement_details?: string | null
          use_requirement_years?: number | null
          uses_nice_classification?: boolean | null
          website_official?: string | null
          website_search?: string | null
          wipo_madrid_code?: string | null
          working_hours?: Json | null
        }
        Update: {
          accepted_languages?: Json | null
          accepted_mark_types?: Json | null
          address?: string | null
          agent_required?: boolean | null
          agent_required_for_foreign?: boolean | null
          annual_filing_volume?: number | null
          api_authentication_type?: string | null
          api_base_url?: string | null
          api_credentials?: Json | null
          api_documentation_url?: string | null
          api_sandbox_available?: boolean | null
          api_type?: string | null
          api_url?: string | null
          api_version?: string | null
          appeal_procedure?: Json | null
          approval_rate_pct?: number | null
          auth_type?: string | null
          automation_level?: string | null
          automation_percentage?: number | null
          avg_days_opposition_period?: number | null
          avg_days_to_decision?: number | null
          avg_days_to_first_action?: number | null
          avg_days_to_publication?: number | null
          avg_response_time_ms?: number | null
          best_practices?: Json | null
          bulk_data_available?: boolean | null
          cancellation_procedure?: Json | null
          capabilities?: Json | null
          code?: string
          code_alt?: string | null
          common_mistakes?: Json | null
          common_rejection_reasons?: Json | null
          connection_config?: Json | null
          connection_status?: string | null
          contact_appeals_dept?: string | null
          contact_trademarks_dept?: string | null
          contact_urgent?: string | null
          country_code?: string | null
          country_flag?: string | null
          country_name?: string | null
          created_at?: string | null
          currency?: string | null
          data_confidence?: string | null
          data_last_verified_at?: string | null
          data_last_verified_by?: string | null
          data_quality_flag?: string | null
          data_quality_notes?: string | null
          data_source_config?: Json | null
          data_source_notes?: string | null
          data_source_type?: string | null
          default_partner_id?: string | null
          digital_score?: number | null
          director_name?: string | null
          director_title?: string | null
          display_order?: number | null
          documents_required?: Json | null
          e_filing_available?: boolean | null
          e_filing_url?: string | null
          electronic_signature?: boolean | null
          email_general?: string | null
          examiner_patterns?: Json | null
          fax?: string | null
          fee_last_verified_at?: string | null
          fees_source_notes?: string | null
          fees_url?: string | null
          filing_volume_growth_pct?: number | null
          filing_volume_year?: number | null
          flag?: string | null
          flag_emoji?: string | null
          grace_period_days?: number | null
          has_api?: boolean | null
          id?: string
          insights_updated_at?: string | null
          internal_notes?: string | null
          ip_types?: string[] | null
          is_active?: boolean | null
          is_connected?: boolean | null
          languages?: string[] | null
          last_health_check?: string | null
          last_interaction_at?: string | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          last_sync_type?: string | null
          latam_relevance_score?: number | null
          linkedin_page?: string | null
          main_rejection_reasons?: Json | null
          member_madrid_protocol?: boolean | null
          name?: string | null
          name_en?: string | null
          name_es?: string | null
          name_official?: string
          name_short?: string | null
          next_review_date?: string | null
          nice_version?: string | null
          notes?: string | null
          office_acronym?: string | null
          office_hours?: string | null
          office_type?: string
          online_payment?: boolean | null
          open_data_available?: boolean | null
          operational_status?: string | null
          opposition_procedure?: Json | null
          opposition_success_rate?: number | null
          paris_convention_member?: boolean | null
          payment_methods?: Json | null
          phone_general?: string | null
          preparation_tips?: string | null
          priority_claim_months?: number | null
          priority_score?: number | null
          product_id?: string | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          region?: string | null
          rejection_rate?: number | null
          rejection_rate_pct?: number | null
          renewal_procedure?: Json | null
          search_url?: string | null
          spanish_companies_active?: boolean | null
          special_requirements?: Json | null
          stats_patent_applications?: number | null
          stats_patent_grants?: number | null
          stats_source_url?: string | null
          stats_tm_applications?: number | null
          stats_tm_registrations?: number | null
          stats_year?: number | null
          status?: string | null
          success_rate_approvals?: number | null
          success_rate_sample_size?: number | null
          success_rate_updated_at?: string | null
          support_email?: string | null
          support_phone?: string | null
          supported_mark_types?: Json | null
          supports_documents?: boolean | null
          supports_events?: boolean | null
          supports_fees?: boolean | null
          supports_search?: boolean | null
          supports_status?: boolean | null
          sync_frequency?: string | null
          tier?: number | null
          timezone?: string
          tm_appeal_fee?: number | null
          tm_class_extra_fee?: number | null
          tm_estimated_registration_months?: number | null
          tm_expedited_fee?: number | null
          tm_fee_change_pct_last?: number | null
          tm_fee_currency?: string | null
          tm_fee_last_change_date?: string | null
          tm_fee_next_review_date?: string | null
          tm_filing_fee?: number | null
          tm_multi_class?: boolean | null
          tm_online_filing_url?: string | null
          tm_opposition_fee?: number | null
          tm_opposition_period_days?: number | null
          tm_recordal_fee?: number | null
          tm_registration_duration_years?: number | null
          tm_renewal_fee?: number | null
          tm_search_url?: string | null
          tm_use_requirement?: boolean | null
          tmview_available?: boolean | null
          top_filing_countries?: Json | null
          top_filing_sectors?: Json | null
          total_filings_tracked?: number | null
          translation_languages?: Json | null
          translation_required?: boolean | null
          ub_integration_notes?: string | null
          ub_integration_status?: string | null
          updated_at?: string | null
          url_status?: string | null
          use_requirement_details?: string | null
          use_requirement_years?: number | null
          uses_nice_classification?: boolean | null
          website_official?: string | null
          website_search?: string | null
          wipo_madrid_code?: string | null
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_offices_default_partner_id_fkey"
            columns: ["default_partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_procedures: {
        Row: {
          automation_pct: number | null
          created_at: string | null
          description: string | null
          id: string
          ipo_office_id: string
          last_updated: string | null
          office_code: string
          procedure_type: string
          requirements: Json | null
          source_url: string | null
          steps: Json | null
          success_rate: number | null
          tips: Json | null
          title: string
          title_es: string | null
          total_cost_official: number | null
          total_cost_ub: number | null
          total_duration_days: number | null
          ub_can_automate: boolean | null
        }
        Insert: {
          automation_pct?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          ipo_office_id: string
          last_updated?: string | null
          office_code: string
          procedure_type: string
          requirements?: Json | null
          source_url?: string | null
          steps?: Json | null
          success_rate?: number | null
          tips?: Json | null
          title: string
          title_es?: string | null
          total_cost_official?: number | null
          total_cost_ub?: number | null
          total_duration_days?: number | null
          ub_can_automate?: boolean | null
        }
        Update: {
          automation_pct?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          ipo_office_id?: string
          last_updated?: string | null
          office_code?: string
          procedure_type?: string
          requirements?: Json | null
          source_url?: string | null
          steps?: Json | null
          success_rate?: number | null
          tips?: Json | null
          title?: string
          title_es?: string | null
          total_cost_official?: number | null
          total_cost_ub?: number | null
          total_duration_days?: number | null
          ub_can_automate?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_procedures_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_procedures_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_procedures_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_procedures_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "ipo_procedures_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
        ]
      }
      ipo_rejection_analysis: {
        Row: {
          appeal_success_rate: number | null
          created_at: string | null
          examples: Json | null
          frequency_pct: number | null
          how_to_appeal: string | null
          how_to_avoid: string | null
          id: string
          ipo_office_id: string
          nice_classes_most_affected: Json | null
          office_code: string
          rejection_category: string
          rejection_label: string
          rejection_label_es: string | null
          source: string | null
          ub_automated_check: boolean | null
          ub_check_notes: string | null
          updated_at: string | null
        }
        Insert: {
          appeal_success_rate?: number | null
          created_at?: string | null
          examples?: Json | null
          frequency_pct?: number | null
          how_to_appeal?: string | null
          how_to_avoid?: string | null
          id?: string
          ipo_office_id: string
          nice_classes_most_affected?: Json | null
          office_code: string
          rejection_category: string
          rejection_label: string
          rejection_label_es?: string | null
          source?: string | null
          ub_automated_check?: boolean | null
          ub_check_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          appeal_success_rate?: number | null
          created_at?: string | null
          examples?: Json | null
          frequency_pct?: number | null
          how_to_appeal?: string | null
          how_to_avoid?: string | null
          id?: string
          ipo_office_id?: string
          nice_classes_most_affected?: Json | null
          office_code?: string
          rejection_category?: string
          rejection_label?: string
          rejection_label_es?: string | null
          source?: string | null
          ub_automated_check?: boolean | null
          ub_check_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_rejection_analysis_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_rejection_analysis_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_rejection_analysis_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_rejection_analysis_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "ipo_rejection_analysis_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
        ]
      }
      jurisdiction_aliases: {
        Row: {
          alias: string
          alias_type: string | null
          country_code: string
          created_at: string | null
          id: string
          language: string | null
        }
        Insert: {
          alias: string
          alias_type?: string | null
          country_code: string
          created_at?: string | null
          id?: string
          language?: string | null
        }
        Update: {
          alias?: string
          alias_type?: string | null
          country_code?: string
          created_at?: string | null
          id?: string
          language?: string | null
        }
        Relationships: []
      }
      jurisdiction_change_patterns: {
        Row: {
          advance_notice_days: number | null
          announcement_url: string | null
          avg_change_interval_days: number | null
          change_type: string
          confidence_in_pattern: number | null
          created_at: string | null
          gives_advance_notice: boolean | null
          id: string
          interval_variance_days: number | null
          ipo_office_id: string
          known_change_dates: string[] | null
          last_pattern_review: string | null
          legal_framework: string | null
          notes: string | null
          requires_legislative_change: boolean | null
          research_sources: Json | null
          researched_at: string | null
          signal_search_terms: string[] | null
          source: string | null
          typical_change_magnitude_pct: number | null
          typical_change_months: number[] | null
          updated_at: string | null
        }
        Insert: {
          advance_notice_days?: number | null
          announcement_url?: string | null
          avg_change_interval_days?: number | null
          change_type: string
          confidence_in_pattern?: number | null
          created_at?: string | null
          gives_advance_notice?: boolean | null
          id?: string
          interval_variance_days?: number | null
          ipo_office_id: string
          known_change_dates?: string[] | null
          last_pattern_review?: string | null
          legal_framework?: string | null
          notes?: string | null
          requires_legislative_change?: boolean | null
          research_sources?: Json | null
          researched_at?: string | null
          signal_search_terms?: string[] | null
          source?: string | null
          typical_change_magnitude_pct?: number | null
          typical_change_months?: number[] | null
          updated_at?: string | null
        }
        Update: {
          advance_notice_days?: number | null
          announcement_url?: string | null
          avg_change_interval_days?: number | null
          change_type?: string
          confidence_in_pattern?: number | null
          created_at?: string | null
          gives_advance_notice?: boolean | null
          id?: string
          interval_variance_days?: number | null
          ipo_office_id?: string
          known_change_dates?: string[] | null
          last_pattern_review?: string | null
          legal_framework?: string | null
          notes?: string | null
          requires_legislative_change?: boolean | null
          research_sources?: Json | null
          researched_at?: string | null
          signal_search_terms?: string[] | null
          source?: string | null
          typical_change_magnitude_pct?: number | null
          typical_change_months?: number[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jurisdiction_change_patterns_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_change_patterns_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_change_patterns_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_change_patterns_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "jurisdiction_change_patterns_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
        ]
      }
      jurisdiction_change_signals: {
        Row: {
          change_type: string
          confirmed_change: boolean | null
          created_at: string | null
          detected_by: string
          expires_at: string | null
          id: string
          ipo_office_id: string
          is_active: boolean | null
          signal_date: string
          signal_description: string | null
          signal_title: string
          signal_type: string
          signal_url: string | null
          triggered_check_frequency_hours: number
          updated_at: string | null
          urgency_level: string
        }
        Insert: {
          change_type: string
          confirmed_change?: boolean | null
          created_at?: string | null
          detected_by?: string
          expires_at?: string | null
          id?: string
          ipo_office_id: string
          is_active?: boolean | null
          signal_date: string
          signal_description?: string | null
          signal_title: string
          signal_type: string
          signal_url?: string | null
          triggered_check_frequency_hours: number
          updated_at?: string | null
          urgency_level?: string
        }
        Update: {
          change_type?: string
          confirmed_change?: boolean | null
          created_at?: string | null
          detected_by?: string
          expires_at?: string | null
          id?: string
          ipo_office_id?: string
          is_active?: boolean | null
          signal_date?: string
          signal_description?: string | null
          signal_title?: string
          signal_type?: string
          signal_url?: string | null
          triggered_check_frequency_hours?: number
          updated_at?: string | null
          urgency_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "jurisdiction_change_signals_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_change_signals_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_change_signals_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_change_signals_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "jurisdiction_change_signals_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
        ]
      }
      jurisdiction_document_requirements: {
        Row: {
          accepted_file_formats: string[] | null
          accepted_languages: string[] | null
          apostille_accepted: boolean | null
          created_at: string | null
          document_type: string
          electronic_signature_accepted: boolean | null
          form_download_url: string | null
          has_official_form: boolean | null
          id: string
          image_max_dimensions: string | null
          image_max_size_mb: number | null
          image_min_dpi: number | null
          is_active: boolean | null
          jurisdiction_code: string
          last_verified_at: string | null
          legalization_required: boolean | null
          notarization_required: boolean | null
          notarization_required_condition: string | null
          notes_en: string | null
          notes_es: string | null
          office_code: string
          official_form_number: string | null
          official_form_url: string | null
          official_guidelines_url: string | null
          official_language: string
          paper_size: string | null
          poa_form_code: string | null
          poa_general_allowed: boolean | null
          poa_required: boolean | null
          poa_required_condition: string | null
          poa_specific_required: boolean | null
          required_fields: Json | null
          seal_accepted: boolean | null
          seal_preferred: boolean | null
          signature_notes: string | null
          signature_type: string
          submission_deadline_days: number | null
          tips: string[] | null
          updated_at: string | null
          validation_rules: Json | null
          validity_months: number | null
          verified_by: string | null
          warnings: string[] | null
        }
        Insert: {
          accepted_file_formats?: string[] | null
          accepted_languages?: string[] | null
          apostille_accepted?: boolean | null
          created_at?: string | null
          document_type: string
          electronic_signature_accepted?: boolean | null
          form_download_url?: string | null
          has_official_form?: boolean | null
          id?: string
          image_max_dimensions?: string | null
          image_max_size_mb?: number | null
          image_min_dpi?: number | null
          is_active?: boolean | null
          jurisdiction_code: string
          last_verified_at?: string | null
          legalization_required?: boolean | null
          notarization_required?: boolean | null
          notarization_required_condition?: string | null
          notes_en?: string | null
          notes_es?: string | null
          office_code: string
          official_form_number?: string | null
          official_form_url?: string | null
          official_guidelines_url?: string | null
          official_language: string
          paper_size?: string | null
          poa_form_code?: string | null
          poa_general_allowed?: boolean | null
          poa_required?: boolean | null
          poa_required_condition?: string | null
          poa_specific_required?: boolean | null
          required_fields?: Json | null
          seal_accepted?: boolean | null
          seal_preferred?: boolean | null
          signature_notes?: string | null
          signature_type?: string
          submission_deadline_days?: number | null
          tips?: string[] | null
          updated_at?: string | null
          validation_rules?: Json | null
          validity_months?: number | null
          verified_by?: string | null
          warnings?: string[] | null
        }
        Update: {
          accepted_file_formats?: string[] | null
          accepted_languages?: string[] | null
          apostille_accepted?: boolean | null
          created_at?: string | null
          document_type?: string
          electronic_signature_accepted?: boolean | null
          form_download_url?: string | null
          has_official_form?: boolean | null
          id?: string
          image_max_dimensions?: string | null
          image_max_size_mb?: number | null
          image_min_dpi?: number | null
          is_active?: boolean | null
          jurisdiction_code?: string
          last_verified_at?: string | null
          legalization_required?: boolean | null
          notarization_required?: boolean | null
          notarization_required_condition?: string | null
          notes_en?: string | null
          notes_es?: string | null
          office_code?: string
          official_form_number?: string | null
          official_form_url?: string | null
          official_guidelines_url?: string | null
          official_language?: string
          paper_size?: string | null
          poa_form_code?: string | null
          poa_general_allowed?: boolean | null
          poa_required?: boolean | null
          poa_required_condition?: string | null
          poa_specific_required?: boolean | null
          required_fields?: Json | null
          seal_accepted?: boolean | null
          seal_preferred?: boolean | null
          signature_notes?: string | null
          signature_type?: string
          submission_deadline_days?: number | null
          tips?: string[] | null
          updated_at?: string | null
          validation_rules?: Json | null
          validity_months?: number | null
          verified_by?: string | null
          warnings?: string[] | null
        }
        Relationships: []
      }
      jurisdiction_extraction_config: {
        Row: {
          api_auth_header: string | null
          api_endpoint: string | null
          api_requires_auth: boolean | null
          check_frequency_hours: number
          consecutive_failures: number | null
          created_at: string | null
          extraction_method: string
          extraction_prompt_hint: string
          history_research_confidence: number | null
          history_researched: boolean | null
          history_researched_at: string | null
          id: string
          ipo_office_id: string
          is_active: boolean | null
          last_checked_at: string | null
          last_error: string | null
          last_success_at: string | null
          next_check_at: string | null
          office_code: string
          office_name: string
          primary_url: string
          updated_at: string | null
          verification_url: string | null
        }
        Insert: {
          api_auth_header?: string | null
          api_endpoint?: string | null
          api_requires_auth?: boolean | null
          check_frequency_hours?: number
          consecutive_failures?: number | null
          created_at?: string | null
          extraction_method: string
          extraction_prompt_hint: string
          history_research_confidence?: number | null
          history_researched?: boolean | null
          history_researched_at?: string | null
          id?: string
          ipo_office_id: string
          is_active?: boolean | null
          last_checked_at?: string | null
          last_error?: string | null
          last_success_at?: string | null
          next_check_at?: string | null
          office_code: string
          office_name: string
          primary_url: string
          updated_at?: string | null
          verification_url?: string | null
        }
        Update: {
          api_auth_header?: string | null
          api_endpoint?: string | null
          api_requires_auth?: boolean | null
          check_frequency_hours?: number
          consecutive_failures?: number | null
          created_at?: string | null
          extraction_method?: string
          extraction_prompt_hint?: string
          history_research_confidence?: number | null
          history_researched?: boolean | null
          history_researched_at?: string | null
          id?: string
          ipo_office_id?: string
          is_active?: boolean | null
          last_checked_at?: string | null
          last_error?: string | null
          last_success_at?: string | null
          next_check_at?: string | null
          office_code?: string
          office_name?: string
          primary_url?: string
          updated_at?: string | null
          verification_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jurisdiction_extraction_config_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_extraction_config_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_extraction_config_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_extraction_config_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "jurisdiction_extraction_config_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
        ]
      }
      jurisdiction_fees: {
        Row: {
          base_fee: number | null
          canonical_key: string | null
          class_additional_fee: number | null
          classes_1_fee: number | null
          confidence: number
          created_at: string | null
          currency: string
          extraction_method: string | null
          fee_type: string
          id: string
          ipo_office_id: string
          is_active: boolean | null
          last_verified_at: string | null
          notes: string | null
          service_type: string
          source_name: string | null
          source_url: string | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
          verified_by: string | null
        }
        Insert: {
          base_fee?: number | null
          canonical_key?: string | null
          class_additional_fee?: number | null
          classes_1_fee?: number | null
          confidence?: number
          created_at?: string | null
          currency?: string
          extraction_method?: string | null
          fee_type?: string
          id?: string
          ipo_office_id: string
          is_active?: boolean | null
          last_verified_at?: string | null
          notes?: string | null
          service_type: string
          source_name?: string | null
          source_url?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          verified_by?: string | null
        }
        Update: {
          base_fee?: number | null
          canonical_key?: string | null
          class_additional_fee?: number | null
          classes_1_fee?: number | null
          confidence?: number
          created_at?: string | null
          currency?: string
          extraction_method?: string | null
          fee_type?: string
          id?: string
          ipo_office_id?: string
          is_active?: boolean | null
          last_verified_at?: string | null
          notes?: string | null
          service_type?: string
          source_name?: string | null
          source_url?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jurisdiction_fees_canonical_key_fkey"
            columns: ["canonical_key"]
            isOneToOne: false
            referencedRelation: "jurisdiction_service_map"
            referencedColumns: ["canonical_key"]
          },
          {
            foreignKeyName: "jurisdiction_fees_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_fees_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_fees_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_fees_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "jurisdiction_fees_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
        ]
      }
      jurisdiction_field_configs: {
        Row: {
          created_at: string | null
          display_order: number | null
          field_description: string | null
          field_group: string | null
          field_key: string
          field_label_en: string
          field_label_es: string | null
          field_options: Json | null
          field_placeholder: string | null
          field_type: string
          grid_column: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          is_required_condition: string | null
          jurisdiction_id: string
          max_length: number | null
          min_length: number | null
          right_type: string
          updated_at: string | null
          validation_regex: string | null
          visible_condition: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          field_description?: string | null
          field_group?: string | null
          field_key: string
          field_label_en: string
          field_label_es?: string | null
          field_options?: Json | null
          field_placeholder?: string | null
          field_type: string
          grid_column?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          is_required_condition?: string | null
          jurisdiction_id: string
          max_length?: number | null
          min_length?: number | null
          right_type: string
          updated_at?: string | null
          validation_regex?: string | null
          visible_condition?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          field_description?: string | null
          field_group?: string | null
          field_key?: string
          field_label_en?: string
          field_label_es?: string | null
          field_options?: Json | null
          field_placeholder?: string | null
          field_type?: string
          grid_column?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          is_required_condition?: string | null
          jurisdiction_id?: string
          max_length?: number | null
          min_length?: number | null
          right_type?: string
          updated_at?: string | null
          validation_regex?: string | null
          visible_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jurisdiction_field_configs_jurisdiction_id_fkey"
            columns: ["jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "jurisdictions"
            referencedColumns: ["id"]
          },
        ]
      }
      jurisdiction_filing_requirements: {
        Row: {
          allows_multiclass: boolean | null
          attachment_format: string | null
          attachment_max_size_mb: number | null
          attachment_notes: string | null
          auth_method: string | null
          auth_notes: string | null
          community_rules: string | null
          created_at: string | null
          data_confidence: string | null
          data_last_verified_at: string | null
          data_last_verified_by: string | null
          data_source: string | null
          discount_efiling_pct: number | null
          discount_other: string | null
          discount_sme_notes: string | null
          discount_sme_pct: number | null
          fee_additional_class: number | null
          fee_additional_class_currency: string | null
          fee_additional_class_notes: string | null
          fee_first_class: number | null
          fee_first_class_currency: string | null
          fee_includes_classes: number | null
          fee_notes: string | null
          filing_language: string
          filing_language_name: string | null
          foreign_representative_required: boolean | null
          foreign_representative_type: string | null
          form_code: string | null
          id: string
          ipo_office_id: string
          logo_formats: string[] | null
          logo_max_dimensions: string | null
          logo_max_size_mb: number | null
          logo_min_dpi: number | null
          logo_notes: string | null
          multiclass_notes: string | null
          needs_review: boolean | null
          opposition_period_days: number | null
          opposition_period_extendable: boolean | null
          opposition_period_notes: string | null
          opposition_period_type: string | null
          platform_name: string | null
          platform_url: string | null
          poa_apostille_required: boolean | null
          poa_foreign_required: boolean | null
          poa_notes: string | null
          power_of_attorney_required: boolean | null
          reform_notes: string | null
          renewal_from: string | null
          renewal_grace_months: number | null
          renewal_surcharge_notes: string | null
          renewal_years: number | null
          review_notes: string | null
          second_language_options: string[] | null
          second_language_required: boolean | null
          special_notes: string | null
          translation_requirement: string | null
          updated_at: string | null
          use_declaration_at_renewal: boolean | null
          use_declaration_consequence: string | null
          use_declaration_deadline: string | null
          use_declaration_periodic: boolean | null
          use_declaration_required: boolean | null
        }
        Insert: {
          allows_multiclass?: boolean | null
          attachment_format?: string | null
          attachment_max_size_mb?: number | null
          attachment_notes?: string | null
          auth_method?: string | null
          auth_notes?: string | null
          community_rules?: string | null
          created_at?: string | null
          data_confidence?: string | null
          data_last_verified_at?: string | null
          data_last_verified_by?: string | null
          data_source?: string | null
          discount_efiling_pct?: number | null
          discount_other?: string | null
          discount_sme_notes?: string | null
          discount_sme_pct?: number | null
          fee_additional_class?: number | null
          fee_additional_class_currency?: string | null
          fee_additional_class_notes?: string | null
          fee_first_class?: number | null
          fee_first_class_currency?: string | null
          fee_includes_classes?: number | null
          fee_notes?: string | null
          filing_language: string
          filing_language_name?: string | null
          foreign_representative_required?: boolean | null
          foreign_representative_type?: string | null
          form_code?: string | null
          id?: string
          ipo_office_id: string
          logo_formats?: string[] | null
          logo_max_dimensions?: string | null
          logo_max_size_mb?: number | null
          logo_min_dpi?: number | null
          logo_notes?: string | null
          multiclass_notes?: string | null
          needs_review?: boolean | null
          opposition_period_days?: number | null
          opposition_period_extendable?: boolean | null
          opposition_period_notes?: string | null
          opposition_period_type?: string | null
          platform_name?: string | null
          platform_url?: string | null
          poa_apostille_required?: boolean | null
          poa_foreign_required?: boolean | null
          poa_notes?: string | null
          power_of_attorney_required?: boolean | null
          reform_notes?: string | null
          renewal_from?: string | null
          renewal_grace_months?: number | null
          renewal_surcharge_notes?: string | null
          renewal_years?: number | null
          review_notes?: string | null
          second_language_options?: string[] | null
          second_language_required?: boolean | null
          special_notes?: string | null
          translation_requirement?: string | null
          updated_at?: string | null
          use_declaration_at_renewal?: boolean | null
          use_declaration_consequence?: string | null
          use_declaration_deadline?: string | null
          use_declaration_periodic?: boolean | null
          use_declaration_required?: boolean | null
        }
        Update: {
          allows_multiclass?: boolean | null
          attachment_format?: string | null
          attachment_max_size_mb?: number | null
          attachment_notes?: string | null
          auth_method?: string | null
          auth_notes?: string | null
          community_rules?: string | null
          created_at?: string | null
          data_confidence?: string | null
          data_last_verified_at?: string | null
          data_last_verified_by?: string | null
          data_source?: string | null
          discount_efiling_pct?: number | null
          discount_other?: string | null
          discount_sme_notes?: string | null
          discount_sme_pct?: number | null
          fee_additional_class?: number | null
          fee_additional_class_currency?: string | null
          fee_additional_class_notes?: string | null
          fee_first_class?: number | null
          fee_first_class_currency?: string | null
          fee_includes_classes?: number | null
          fee_notes?: string | null
          filing_language?: string
          filing_language_name?: string | null
          foreign_representative_required?: boolean | null
          foreign_representative_type?: string | null
          form_code?: string | null
          id?: string
          ipo_office_id?: string
          logo_formats?: string[] | null
          logo_max_dimensions?: string | null
          logo_max_size_mb?: number | null
          logo_min_dpi?: number | null
          logo_notes?: string | null
          multiclass_notes?: string | null
          needs_review?: boolean | null
          opposition_period_days?: number | null
          opposition_period_extendable?: boolean | null
          opposition_period_notes?: string | null
          opposition_period_type?: string | null
          platform_name?: string | null
          platform_url?: string | null
          poa_apostille_required?: boolean | null
          poa_foreign_required?: boolean | null
          poa_notes?: string | null
          power_of_attorney_required?: boolean | null
          reform_notes?: string | null
          renewal_from?: string | null
          renewal_grace_months?: number | null
          renewal_surcharge_notes?: string | null
          renewal_years?: number | null
          review_notes?: string | null
          second_language_options?: string[] | null
          second_language_required?: boolean | null
          special_notes?: string | null
          translation_requirement?: string | null
          updated_at?: string | null
          use_declaration_at_renewal?: boolean | null
          use_declaration_consequence?: string | null
          use_declaration_deadline?: string | null
          use_declaration_periodic?: boolean | null
          use_declaration_required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "jurisdiction_filing_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_filing_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_filing_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_filing_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "jurisdiction_filing_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
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
      jurisdiction_requirements: {
        Row: {
          additional_days_max: number | null
          additional_days_min: number | null
          applies_when: string | null
          applies_when_detail: string | null
          cost_currency: string | null
          cost_estimate_max: number | null
          cost_estimate_min: number | null
          cost_notes: string | null
          created_at: string | null
          description: string
          description_en: string | null
          handling_notes: string | null
          id: string
          ipo_office_id: string | null
          is_active: boolean | null
          is_confirmed: boolean | null
          is_mandatory: boolean | null
          next_review_date: string | null
          official_requirement_text: string | null
          requirement_name: string
          requirement_type: string
          source_url: string | null
          timing_notes: string | null
          typically_handled_by: string | null
          updated_at: string | null
          verified_by: string | null
          verified_date: string | null
        }
        Insert: {
          additional_days_max?: number | null
          additional_days_min?: number | null
          applies_when?: string | null
          applies_when_detail?: string | null
          cost_currency?: string | null
          cost_estimate_max?: number | null
          cost_estimate_min?: number | null
          cost_notes?: string | null
          created_at?: string | null
          description: string
          description_en?: string | null
          handling_notes?: string | null
          id?: string
          ipo_office_id?: string | null
          is_active?: boolean | null
          is_confirmed?: boolean | null
          is_mandatory?: boolean | null
          next_review_date?: string | null
          official_requirement_text?: string | null
          requirement_name: string
          requirement_type: string
          source_url?: string | null
          timing_notes?: string | null
          typically_handled_by?: string | null
          updated_at?: string | null
          verified_by?: string | null
          verified_date?: string | null
        }
        Update: {
          additional_days_max?: number | null
          additional_days_min?: number | null
          applies_when?: string | null
          applies_when_detail?: string | null
          cost_currency?: string | null
          cost_estimate_max?: number | null
          cost_estimate_min?: number | null
          cost_notes?: string | null
          created_at?: string | null
          description?: string
          description_en?: string | null
          handling_notes?: string | null
          id?: string
          ipo_office_id?: string | null
          is_active?: boolean | null
          is_confirmed?: boolean | null
          is_mandatory?: boolean | null
          next_review_date?: string | null
          official_requirement_text?: string | null
          requirement_name?: string
          requirement_type?: string
          source_url?: string | null
          timing_notes?: string | null
          typically_handled_by?: string | null
          updated_at?: string | null
          verified_by?: string | null
          verified_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jurisdiction_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "jurisdiction_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
        ]
      }
      jurisdiction_risk_windows: {
        Row: {
          calculated_at: string | null
          calculation_basis: string | null
          change_date: string | null
          change_occurred: boolean | null
          change_probability: number | null
          change_type: string
          check_frequency_in_window_hours: number
          check_frequency_stable_hours: number
          created_at: string | null
          id: string
          ipo_office_id: string
          is_currently_in_window: boolean | null
          pattern_id: string
          updated_at: string | null
          window_end: string
          window_start: string
        }
        Insert: {
          calculated_at?: string | null
          calculation_basis?: string | null
          change_date?: string | null
          change_occurred?: boolean | null
          change_probability?: number | null
          change_type: string
          check_frequency_in_window_hours: number
          check_frequency_stable_hours: number
          created_at?: string | null
          id?: string
          ipo_office_id: string
          is_currently_in_window?: boolean | null
          pattern_id: string
          updated_at?: string | null
          window_end: string
          window_start: string
        }
        Update: {
          calculated_at?: string | null
          calculation_basis?: string | null
          change_date?: string | null
          change_occurred?: boolean | null
          change_probability?: number | null
          change_type?: string
          check_frequency_in_window_hours?: number
          check_frequency_stable_hours?: number
          created_at?: string | null
          id?: string
          ipo_office_id?: string
          is_currently_in_window?: boolean | null
          pattern_id?: string
          updated_at?: string | null
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "jurisdiction_risk_windows_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_risk_windows_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_risk_windows_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_risk_windows_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "jurisdiction_risk_windows_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "jurisdiction_risk_windows_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "jurisdiction_change_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      jurisdiction_service_map: {
        Row: {
          canonical_key: string
          created_at: string | null
          display_name_en: string
          display_name_es: string
          id: string
          service_type: string
        }
        Insert: {
          canonical_key: string
          created_at?: string | null
          display_name_en: string
          display_name_es: string
          id?: string
          service_type: string
        }
        Update: {
          canonical_key?: string
          created_at?: string | null
          display_name_en?: string
          display_name_es?: string
          id?: string
          service_type?: string
        }
        Relationships: []
      }
      jurisdiction_update_queue: {
        Row: {
          admin_notified: boolean | null
          attempt_count: number | null
          auto_approved_count: number | null
          changes_detected: Json | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          extracted_data: Json | null
          extraction_config_id: string
          id: string
          ipo_office_id: string
          max_attempts: number | null
          needs_review_count: number | null
          rejected_count: number | null
          scheduled_for: string
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_notified?: boolean | null
          attempt_count?: number | null
          auto_approved_count?: number | null
          changes_detected?: Json | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          extracted_data?: Json | null
          extraction_config_id: string
          id?: string
          ipo_office_id: string
          max_attempts?: number | null
          needs_review_count?: number | null
          rejected_count?: number | null
          scheduled_for?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_notified?: boolean | null
          attempt_count?: number | null
          auto_approved_count?: number | null
          changes_detected?: Json | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          extracted_data?: Json | null
          extraction_config_id?: string
          id?: string
          ipo_office_id?: string
          max_attempts?: number | null
          needs_review_count?: number | null
          rejected_count?: number | null
          scheduled_for?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jurisdiction_update_queue_extraction_config_id_fkey"
            columns: ["extraction_config_id"]
            isOneToOne: false
            referencedRelation: "jurisdiction_extraction_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_update_queue_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_update_queue_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_update_queue_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_update_queue_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "jurisdiction_update_queue_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
        ]
      }
      jurisdiction_updates_log: {
        Row: {
          applied_at: string | null
          approved_at: string | null
          approved_by: string | null
          auto_approval_reason: string | null
          auto_approved: boolean | null
          changes_detected: Json | null
          check_type: string | null
          checked_at: string | null
          created_at: string | null
          error_message: string | null
          had_changes: boolean | null
          id: string
          ipo_office_id: string | null
          jurisdiction_fee_id: string | null
          notes: string | null
          processing_ms: number | null
          raw_extraction: Json | null
          requires_human_review: boolean | null
          review_reason: string | null
        }
        Insert: {
          applied_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auto_approval_reason?: string | null
          auto_approved?: boolean | null
          changes_detected?: Json | null
          check_type?: string | null
          checked_at?: string | null
          created_at?: string | null
          error_message?: string | null
          had_changes?: boolean | null
          id?: string
          ipo_office_id?: string | null
          jurisdiction_fee_id?: string | null
          notes?: string | null
          processing_ms?: number | null
          raw_extraction?: Json | null
          requires_human_review?: boolean | null
          review_reason?: string | null
        }
        Update: {
          applied_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auto_approval_reason?: string | null
          auto_approved?: boolean | null
          changes_detected?: Json | null
          check_type?: string | null
          checked_at?: string | null
          created_at?: string | null
          error_message?: string | null
          had_changes?: boolean | null
          id?: string
          ipo_office_id?: string | null
          jurisdiction_fee_id?: string | null
          notes?: string | null
          processing_ms?: number | null
          raw_extraction?: Json | null
          requires_human_review?: boolean | null
          review_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jurisdiction_updates_log_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_updates_log_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_updates_log_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_updates_log_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "jurisdiction_updates_log_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "jurisdiction_updates_log_jurisdiction_fee_id_fkey"
            columns: ["jurisdiction_fee_id"]
            isOneToOne: false
            referencedRelation: "jurisdiction_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      jurisdictions: {
        Row: {
          code: string
          created_at: string | null
          currency_code: string | null
          filing_languages: string[] | null
          flag_code: string | null
          flag_emoji: string | null
          has_api_integration: boolean | null
          has_deadline_rules: boolean | null
          has_knowledge_base: boolean | null
          has_official_forms: boolean | null
          has_spider_monitoring: boolean | null
          has_subclasses: boolean | null
          icon: string | null
          id: string
          ipo_api_url: string | null
          ipo_name: string | null
          ipo_url: string | null
          is_active: boolean | null
          is_hague_member: boolean | null
          is_madrid_member: boolean | null
          is_paris_member: boolean | null
          is_pct_member: boolean | null
          jurisdiction_type: string | null
          kb_last_updated: string | null
          name: string
          name_en: string | null
          name_es: string | null
          name_local: string | null
          notes: string | null
          office_acronym: string | null
          office_website: string | null
          official_languages: string[] | null
          opposition_period_days: number | null
          paris_priority_months_ds: number | null
          paris_priority_months_pt: number | null
          paris_priority_months_tm: number | null
          patent_duration_years: number | null
          phone_code: string | null
          price_monthly: number
          price_yearly: number | null
          region: string
          requires_local_agent: boolean | null
          requires_translation: boolean | null
          sort_order: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          supports_designs: boolean | null
          supports_patents: boolean | null
          supports_trademarks: boolean | null
          supports_utility_models: boolean | null
          tier: number | null
          timezone: string | null
          trademark_duration_years: number | null
          updated_at: string | null
          use_declaration_required: boolean | null
          use_requirement: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          currency_code?: string | null
          filing_languages?: string[] | null
          flag_code?: string | null
          flag_emoji?: string | null
          has_api_integration?: boolean | null
          has_deadline_rules?: boolean | null
          has_knowledge_base?: boolean | null
          has_official_forms?: boolean | null
          has_spider_monitoring?: boolean | null
          has_subclasses?: boolean | null
          icon?: string | null
          id?: string
          ipo_api_url?: string | null
          ipo_name?: string | null
          ipo_url?: string | null
          is_active?: boolean | null
          is_hague_member?: boolean | null
          is_madrid_member?: boolean | null
          is_paris_member?: boolean | null
          is_pct_member?: boolean | null
          jurisdiction_type?: string | null
          kb_last_updated?: string | null
          name: string
          name_en?: string | null
          name_es?: string | null
          name_local?: string | null
          notes?: string | null
          office_acronym?: string | null
          office_website?: string | null
          official_languages?: string[] | null
          opposition_period_days?: number | null
          paris_priority_months_ds?: number | null
          paris_priority_months_pt?: number | null
          paris_priority_months_tm?: number | null
          patent_duration_years?: number | null
          phone_code?: string | null
          price_monthly: number
          price_yearly?: number | null
          region: string
          requires_local_agent?: boolean | null
          requires_translation?: boolean | null
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          supports_designs?: boolean | null
          supports_patents?: boolean | null
          supports_trademarks?: boolean | null
          supports_utility_models?: boolean | null
          tier?: number | null
          timezone?: string | null
          trademark_duration_years?: number | null
          updated_at?: string | null
          use_declaration_required?: boolean | null
          use_requirement?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          currency_code?: string | null
          filing_languages?: string[] | null
          flag_code?: string | null
          flag_emoji?: string | null
          has_api_integration?: boolean | null
          has_deadline_rules?: boolean | null
          has_knowledge_base?: boolean | null
          has_official_forms?: boolean | null
          has_spider_monitoring?: boolean | null
          has_subclasses?: boolean | null
          icon?: string | null
          id?: string
          ipo_api_url?: string | null
          ipo_name?: string | null
          ipo_url?: string | null
          is_active?: boolean | null
          is_hague_member?: boolean | null
          is_madrid_member?: boolean | null
          is_paris_member?: boolean | null
          is_pct_member?: boolean | null
          jurisdiction_type?: string | null
          kb_last_updated?: string | null
          name?: string
          name_en?: string | null
          name_es?: string | null
          name_local?: string | null
          notes?: string | null
          office_acronym?: string | null
          office_website?: string | null
          official_languages?: string[] | null
          opposition_period_days?: number | null
          paris_priority_months_ds?: number | null
          paris_priority_months_pt?: number | null
          paris_priority_months_tm?: number | null
          patent_duration_years?: number | null
          phone_code?: string | null
          price_monthly?: number
          price_yearly?: number | null
          region?: string
          requires_local_agent?: boolean | null
          requires_translation?: boolean | null
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          supports_designs?: boolean | null
          supports_patents?: boolean | null
          supports_trademarks?: boolean | null
          supports_utility_models?: boolean | null
          tier?: number | null
          timezone?: string | null
          trademark_duration_years?: number | null
          updated_at?: string | null
          use_declaration_required?: boolean | null
          use_requirement?: boolean | null
        }
        Relationships: []
      }
      kb_source_checks: {
        Row: {
          action_details: string | null
          action_taken: string | null
          change_severity: string | null
          change_summary: string | null
          change_type: string | null
          checked_at: string | null
          chunks_affected: number | null
          chunks_created: number | null
          chunks_deprecated: number | null
          content_hash: string | null
          diff_details: Json | null
          error_message: string | null
          id: string
          previous_hash: string | null
          raw_content_sample: string | null
          requires_review: boolean | null
          response_code: number | null
          response_time_ms: number | null
          review_notes: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_id: string
          status: string
        }
        Insert: {
          action_details?: string | null
          action_taken?: string | null
          change_severity?: string | null
          change_summary?: string | null
          change_type?: string | null
          checked_at?: string | null
          chunks_affected?: number | null
          chunks_created?: number | null
          chunks_deprecated?: number | null
          content_hash?: string | null
          diff_details?: Json | null
          error_message?: string | null
          id?: string
          previous_hash?: string | null
          raw_content_sample?: string | null
          requires_review?: boolean | null
          response_code?: number | null
          response_time_ms?: number | null
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id: string
          status: string
        }
        Update: {
          action_details?: string | null
          action_taken?: string | null
          change_severity?: string | null
          change_summary?: string | null
          change_type?: string | null
          checked_at?: string | null
          chunks_affected?: number | null
          chunks_created?: number | null
          chunks_deprecated?: number | null
          content_hash?: string | null
          diff_details?: Json | null
          error_message?: string | null
          id?: string
          previous_hash?: string | null
          raw_content_sample?: string | null
          requires_review?: boolean | null
          response_code?: number | null
          response_time_ms?: number | null
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_source_checks_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "kb_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_sources: {
        Row: {
          api_auth_type: string | null
          api_credentials_ref: string | null
          api_endpoint: string | null
          auto_reingest: boolean | null
          check_frequency: string | null
          consecutive_failures: number | null
          content_scope: string | null
          content_type: string
          created_at: string | null
          id: string
          ipo_office_id: string | null
          is_active: boolean | null
          jurisdiction_code: string | null
          language: string | null
          last_change_detected_at: string | null
          last_checked_at: string | null
          last_content_hash: string | null
          linked_chunk_types: string[] | null
          max_failures: number | null
          name: string
          next_check_at: string | null
          notes: string | null
          priority: string | null
          requires_human_review: boolean | null
          rss_feed_url: string | null
          source_type: string
          tags: string[] | null
          updated_at: string | null
          url: string
        }
        Insert: {
          api_auth_type?: string | null
          api_credentials_ref?: string | null
          api_endpoint?: string | null
          auto_reingest?: boolean | null
          check_frequency?: string | null
          consecutive_failures?: number | null
          content_scope?: string | null
          content_type: string
          created_at?: string | null
          id?: string
          ipo_office_id?: string | null
          is_active?: boolean | null
          jurisdiction_code?: string | null
          language?: string | null
          last_change_detected_at?: string | null
          last_checked_at?: string | null
          last_content_hash?: string | null
          linked_chunk_types?: string[] | null
          max_failures?: number | null
          name: string
          next_check_at?: string | null
          notes?: string | null
          priority?: string | null
          requires_human_review?: boolean | null
          rss_feed_url?: string | null
          source_type: string
          tags?: string[] | null
          updated_at?: string | null
          url: string
        }
        Update: {
          api_auth_type?: string | null
          api_credentials_ref?: string | null
          api_endpoint?: string | null
          auto_reingest?: boolean | null
          check_frequency?: string | null
          consecutive_failures?: number | null
          content_scope?: string | null
          content_type?: string
          created_at?: string | null
          id?: string
          ipo_office_id?: string | null
          is_active?: boolean | null
          jurisdiction_code?: string | null
          language?: string | null
          last_change_detected_at?: string | null
          last_checked_at?: string | null
          last_content_hash?: string | null
          linked_chunk_types?: string[] | null
          max_failures?: number | null
          name?: string
          next_check_at?: string | null
          notes?: string | null
          priority?: string | null
          requires_human_review?: boolean | null
          rss_feed_url?: string | null
          source_type?: string
          tags?: string[] | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_sources_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_sources_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_sources_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_sources_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "kb_sources_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
        ]
      }
      kb_update_queue: {
        Row: {
          action_type: string
          attempts: number | null
          check_id: string | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_attempts: number | null
          payload: Json | null
          priority: number | null
          source_id: string
          status: string | null
        }
        Insert: {
          action_type: string
          attempts?: number | null
          check_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          payload?: Json | null
          priority?: number | null
          source_id: string
          status?: string | null
        }
        Update: {
          action_type?: string
          attempts?: number | null
          check_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          payload?: Json | null
          priority?: number | null
          source_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_update_queue_check_id_fkey"
            columns: ["check_id"]
            isOneToOne: false
            referencedRelation: "kb_source_checks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_update_queue_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "kb_sources"
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
        Relationships: []
      }
      landing_pages: {
        Row: {
          accent_color: string | null
          created_at: string | null
          faqs: Json | null
          features: Json | null
          final_cta_config: Json | null
          final_cta_subtitle: string | null
          final_cta_title: string | null
          final_cta_type: string | null
          hero_cta_text: string | null
          hero_cta_url: string | null
          hero_image_url: string | null
          hero_secondary_cta_text: string | null
          hero_secondary_cta_url: string | null
          hero_subtitle: string | null
          hero_title: string
          hero_video_url: string | null
          id: string
          integrations: Json | null
          is_published: boolean | null
          meta_description: string | null
          module_code: string
          name: string | null
          og_image_url: string | null
          pricing_plans: Json | null
          published_at: string | null
          slug: string
          status: string | null
          testimonials: Json | null
          title: string
          total_leads: number | null
          total_visits: number | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          created_at?: string | null
          faqs?: Json | null
          features?: Json | null
          final_cta_config?: Json | null
          final_cta_subtitle?: string | null
          final_cta_title?: string | null
          final_cta_type?: string | null
          hero_cta_text?: string | null
          hero_cta_url?: string | null
          hero_image_url?: string | null
          hero_secondary_cta_text?: string | null
          hero_secondary_cta_url?: string | null
          hero_subtitle?: string | null
          hero_title: string
          hero_video_url?: string | null
          id?: string
          integrations?: Json | null
          is_published?: boolean | null
          meta_description?: string | null
          module_code: string
          name?: string | null
          og_image_url?: string | null
          pricing_plans?: Json | null
          published_at?: string | null
          slug: string
          status?: string | null
          testimonials?: Json | null
          title: string
          total_leads?: number | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          created_at?: string | null
          faqs?: Json | null
          features?: Json | null
          final_cta_config?: Json | null
          final_cta_subtitle?: string | null
          final_cta_title?: string | null
          final_cta_type?: string | null
          hero_cta_text?: string | null
          hero_cta_url?: string | null
          hero_image_url?: string | null
          hero_secondary_cta_text?: string | null
          hero_secondary_cta_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string
          hero_video_url?: string | null
          id?: string
          integrations?: Json | null
          is_published?: boolean | null
          meta_description?: string | null
          module_code?: string
          name?: string | null
          og_image_url?: string | null
          pricing_plans?: Json | null
          published_at?: string | null
          slug?: string
          status?: string | null
          testimonials?: Json | null
          title?: string
          total_leads?: number | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      landing_visits: {
        Row: {
          browser: string | null
          chatbot_messages: number | null
          city: string | null
          conversion_type: string | null
          converted: boolean | null
          country: string | null
          created_at: string | null
          device_type: string | null
          id: string
          landing_id: string | null
          opened_chatbot: boolean | null
          os: string | null
          page_views: number | null
          referrer: string | null
          referrer_domain: string | null
          scroll_depth: number | null
          session_id: string | null
          time_on_page: number | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_id: string | null
        }
        Insert: {
          browser?: string | null
          chatbot_messages?: number | null
          city?: string | null
          conversion_type?: string | null
          converted?: boolean | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          landing_id?: string | null
          opened_chatbot?: boolean | null
          os?: string | null
          page_views?: number | null
          referrer?: string | null
          referrer_domain?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_on_page?: number | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
        }
        Update: {
          browser?: string | null
          chatbot_messages?: number | null
          city?: string | null
          conversion_type?: string | null
          converted?: boolean | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          landing_id?: string | null
          opened_chatbot?: boolean | null
          os?: string | null
          page_views?: number | null
          referrer?: string | null
          referrer_domain?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_on_page?: number | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_visits_landing_id_fkey"
            columns: ["landing_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          appointment_id: string | null
          assigned_to: string | null
          brand_name: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string
          form_type: string | null
          full_name: string | null
          id: string
          is_read: boolean
          jurisdictions: Json | null
          message: string | null
          metadata: Json | null
          notes: string | null
          patent_title: string | null
          phone: string | null
          priority: string
          read_at: string | null
          service_interest: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          assigned_to?: string | null
          brand_name?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email: string
          form_type?: string | null
          full_name?: string | null
          id?: string
          is_read?: boolean
          jurisdictions?: Json | null
          message?: string | null
          metadata?: Json | null
          notes?: string | null
          patent_title?: string | null
          phone?: string | null
          priority?: string
          read_at?: string | null
          service_interest?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          assigned_to?: string | null
          brand_name?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string
          form_type?: string | null
          full_name?: string | null
          id?: string
          is_read?: boolean
          jurisdictions?: Json | null
          message?: string | null
          metadata?: Json | null
          notes?: string | null
          patent_title?: string | null
          phone?: string | null
          priority?: string
          read_at?: string | null
          service_interest?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_acceptances: {
        Row: {
          acceptance_method: string
          accepted_at: string
          content_hash: string
          created_at: string
          document_id: string
          id: string
          ip_address: unknown
          organization_id: string | null
          signature_data: Json | null
          updated_at: string
          user_agent: string | null
          user_id: string
          version_accepted: string
        }
        Insert: {
          acceptance_method: string
          accepted_at?: string
          content_hash: string
          created_at?: string
          document_id: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          signature_data?: Json | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
          version_accepted: string
        }
        Update: {
          acceptance_method?: string
          accepted_at?: string
          content_hash?: string
          created_at?: string
          document_id?: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          signature_data?: Json | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
          version_accepted?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_acceptances_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_deadlines_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          field_changed: string
          id: string
          legal_deadline_id: string | null
          new_value: string | null
          old_value: string | null
          reason: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          field_changed: string
          id?: string
          legal_deadline_id?: string | null
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          field_changed?: string
          id?: string
          legal_deadline_id?: string | null
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      legal_document_contents: {
        Row: {
          checkbox_text: string
          code: string
          created_at: string | null
          full_content: string
          id: string
          is_active: boolean | null
          link_text: string | null
          short_summary: string
          title: string
          updated_at: string | null
          updated_by: string | null
          version: string
        }
        Insert: {
          checkbox_text: string
          code: string
          created_at?: string | null
          full_content: string
          id?: string
          is_active?: boolean | null
          link_text?: string | null
          short_summary: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
          version?: string
        }
        Update: {
          checkbox_text?: string
          code?: string
          created_at?: string | null
          full_content?: string
          id?: string
          is_active?: boolean | null
          link_text?: string | null
          short_summary?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: string
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          changelog: string | null
          code: string | null
          content: string
          content_hash: string
          created_at: string | null
          created_by: string | null
          doc_type: Database["public"]["Enums"]["legal_doc_type"]
          effective_date: string | null
          effective_from: string
          effective_until: string | null
          id: string
          is_active: boolean
          is_current: boolean | null
          language: string | null
          organization_id: string | null
          requires_re_consent: boolean | null
          requires_signature: boolean
          show_on_ai_first_use: boolean
          signature_type: string | null
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          changelog?: string | null
          code?: string | null
          content: string
          content_hash: string
          created_at?: string | null
          created_by?: string | null
          doc_type: Database["public"]["Enums"]["legal_doc_type"]
          effective_date?: string | null
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_active?: boolean
          is_current?: boolean | null
          language?: string | null
          organization_id?: string | null
          requires_re_consent?: boolean | null
          requires_signature?: boolean
          show_on_ai_first_use?: boolean
          signature_type?: string | null
          title: string
          updated_at?: string
          version: string
        }
        Update: {
          changelog?: string | null
          code?: string | null
          content?: string
          content_hash?: string
          created_at?: string | null
          created_by?: string | null
          doc_type?: Database["public"]["Enums"]["legal_doc_type"]
          effective_date?: string | null
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_active?: boolean
          is_current?: boolean | null
          language?: string | null
          organization_id?: string | null
          requires_re_consent?: boolean | null
          requires_signature?: boolean
          show_on_ai_first_use?: boolean
          signature_type?: string | null
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      legal_pages: {
        Row: {
          content: string
          id: string
          is_active: boolean | null
          last_updated: string | null
          slug: string
          title: string
        }
        Insert: {
          content: string
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          slug: string
          title: string
        }
        Update: {
          content?: string
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          slug?: string
          title?: string
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
        ]
      }
      locarno_classes: {
        Row: {
          class_number: number
          created_at: string | null
          id: string
          is_active: boolean | null
          note_es: string | null
          title_en: string | null
          title_es: string
          version: string
        }
        Insert: {
          class_number: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          note_es?: string | null
          title_en?: string | null
          title_es: string
          version?: string
        }
        Update: {
          class_number?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          note_es?: string | null
          title_en?: string | null
          title_es?: string
          version?: string
        }
        Relationships: []
      }
      locarno_items: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          item_number: string
          subclass_id: string
          term_en: string | null
          term_es: string
          version: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          item_number: string
          subclass_id: string
          term_en?: string | null
          term_es: string
          version?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          item_number?: string
          subclass_id?: string
          term_en?: string | null
          term_es?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "locarno_items_subclass_id_fkey"
            columns: ["subclass_id"]
            isOneToOne: false
            referencedRelation: "locarno_subclasses"
            referencedColumns: ["id"]
          },
        ]
      }
      locarno_subclasses: {
        Row: {
          class_id: string
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          title_en: string | null
          title_es: string
          version: string
        }
        Insert: {
          class_id: string
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title_en?: string | null
          title_es: string
          version?: string
        }
        Update: {
          class_id?: string
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title_en?: string | null
          title_es?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "locarno_subclasses_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "locarno_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      market_opportunities: {
        Row: {
          country_iso2: string | null
          created_at: string | null
          description: string | null
          growth_rate: number | null
          id: string
          market_size: number | null
          opportunity_score: number | null
        }
        Insert: {
          country_iso2?: string | null
          created_at?: string | null
          description?: string | null
          growth_rate?: number | null
          id?: string
          market_size?: number | null
          opportunity_score?: number | null
        }
        Update: {
          country_iso2?: string | null
          created_at?: string | null
          description?: string | null
          growth_rate?: number | null
          id?: string
          market_size?: number | null
          opportunity_score?: number | null
        }
        Relationships: []
      }
      model_change_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          function_name: string
          id: string
          new_model_id: string | null
          old_model_id: string | null
          suggestion_id: string | null
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          function_name: string
          id?: string
          new_model_id?: string | null
          old_model_id?: string | null
          suggestion_id?: string | null
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          function_name?: string
          id?: string
          new_model_id?: string | null
          old_model_id?: string | null
          suggestion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_change_history_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "ai_optimization_suggestions"
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
        Relationships: []
      }
      nice_class_items: {
        Row: {
          alternate_names: string[] | null
          class_id: string | null
          class_number: number
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_generic_term: boolean | null
          is_popular: boolean | null
          item_code: string
          item_name_en: string
          item_name_es: string | null
          updated_at: string | null
          version_id: string | null
        }
        Insert: {
          alternate_names?: string[] | null
          class_id?: string | null
          class_number: number
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_generic_term?: boolean | null
          is_popular?: boolean | null
          item_code: string
          item_name_en: string
          item_name_es?: string | null
          updated_at?: string | null
          version_id?: string | null
        }
        Update: {
          alternate_names?: string[] | null
          class_id?: string | null
          class_number?: number
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_generic_term?: boolean | null
          is_popular?: boolean | null
          item_code?: string
          item_name_en?: string
          item_name_es?: string | null
          updated_at?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nice_class_items_class_number_fkey"
            columns: ["class_number"]
            isOneToOne: false
            referencedRelation: "ip_nice_classification"
            referencedColumns: ["class_number"]
          },
          {
            foreignKeyName: "nice_class_items_class_number_fkey"
            columns: ["class_number"]
            isOneToOne: false
            referencedRelation: "nice_classes"
            referencedColumns: ["class_number"]
          },
          {
            foreignKeyName: "nice_class_items_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "nice_classification_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      nice_classes: {
        Row: {
          category: string | null
          class_number: number
          class_type: string
          color: string | null
          created_at: string | null
          excludes_en: string[] | null
          excludes_es: string[] | null
          explanatory_note_en: string | null
          explanatory_note_es: string | null
          icon: string | null
          id: string
          includes_en: string[] | null
          includes_es: string[] | null
          is_active: boolean | null
          is_popular: boolean | null
          last_reviewed_at: string | null
          notes: string | null
          reviewed_by: string | null
          title_en: string
          title_es: string | null
          updated_at: string | null
          version_id: string | null
        }
        Insert: {
          category?: string | null
          class_number: number
          class_type: string
          color?: string | null
          created_at?: string | null
          excludes_en?: string[] | null
          excludes_es?: string[] | null
          explanatory_note_en?: string | null
          explanatory_note_es?: string | null
          icon?: string | null
          id?: string
          includes_en?: string[] | null
          includes_es?: string[] | null
          is_active?: boolean | null
          is_popular?: boolean | null
          last_reviewed_at?: string | null
          notes?: string | null
          reviewed_by?: string | null
          title_en: string
          title_es?: string | null
          updated_at?: string | null
          version_id?: string | null
        }
        Update: {
          category?: string | null
          class_number?: number
          class_type?: string
          color?: string | null
          created_at?: string | null
          excludes_en?: string[] | null
          excludes_es?: string[] | null
          explanatory_note_en?: string | null
          explanatory_note_es?: string | null
          icon?: string | null
          id?: string
          includes_en?: string[] | null
          includes_es?: string[] | null
          is_active?: boolean | null
          is_popular?: boolean | null
          last_reviewed_at?: string | null
          notes?: string | null
          reviewed_by?: string | null
          title_en?: string
          title_es?: string | null
          updated_at?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nice_classes_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "nice_classification_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      nice_classification_versions: {
        Row: {
          edition: string
          effective_date: string | null
          id: string
          imported_at: string | null
          imported_by: string | null
          is_active: boolean | null
          notes: string | null
          total_classes: number | null
          total_items: number | null
          version_number: string
        }
        Insert: {
          edition: string
          effective_date?: string | null
          id?: string
          imported_at?: string | null
          imported_by?: string | null
          is_active?: boolean | null
          notes?: string | null
          total_classes?: number | null
          total_items?: number | null
          version_number: string
        }
        Update: {
          edition?: string
          effective_date?: string | null
          id?: string
          imported_at?: string | null
          imported_by?: string | null
          is_active?: boolean | null
          notes?: string | null
          total_classes?: number | null
          total_items?: number | null
          version_number?: string
        }
        Relationships: []
      }
      nice_import_log: {
        Row: {
          class_number: number | null
          created_at: string | null
          error_message: string | null
          id: string
          imported_by: string | null
          items_imported: number | null
          raw_text: string | null
          status: string | null
        }
        Insert: {
          class_number?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          imported_by?: string | null
          items_imported?: number | null
          raw_text?: string | null
          status?: string | null
        }
        Update: {
          class_number?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          imported_by?: string | null
          items_imported?: number | null
          raw_text?: string | null
          status?: string | null
        }
        Relationships: []
      }
      nice_products: {
        Row: {
          added_at: string | null
          added_by: string | null
          class_number: number
          created_at: string | null
          id: string
          is_active: boolean | null
          is_common: boolean | null
          name_en: string | null
          name_es: string
          search_keywords: string[] | null
          wipo_code: string | null
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          class_number: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_common?: boolean | null
          name_en?: string | null
          name_es: string
          search_keywords?: string[] | null
          wipo_code?: string | null
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          class_number?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_common?: boolean | null
          name_en?: string | null
          name_es?: string
          search_keywords?: string[] | null
          wipo_code?: string | null
        }
        Relationships: []
      }
      nice_revision_log: {
        Row: {
          action: string | null
          class_number: number | null
          details: Json | null
          id: string
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          action?: string | null
          class_number?: number | null
          details?: Json | null
          id?: string
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string | null
          class_number?: number | null
          details?: Json | null
          id?: string
          performed_at?: string | null
          performed_by?: string | null
        }
        Relationships: []
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
        Relationships: []
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
          country_code: string | null
          created_at: string | null
          data: Json | null
          expires_at: string | null
          group_key: string | null
          icon: string | null
          id: string
          image_url: string | null
          ipo_office_id: string | null
          is_archived: boolean | null
          is_read: boolean | null
          metadata: Json | null
          organization_id: string | null
          priority: string | null
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          sent_via: Json | null
          severity: string | null
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
          country_code?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          group_key?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          ipo_office_id?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          sent_via?: Json | null
          severity?: string | null
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
          country_code?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          group_key?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          ipo_office_id?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          sent_via?: Json | null
          severity?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "notifications_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
        ]
      }
      office_actions: {
        Row: {
          action_type: string
          created_at: string | null
          created_by: string | null
          deadline_date: string | null
          description: string | null
          id: string
          jurisdiction_code: string | null
          notes: string | null
          office_reference: string | null
          priority: string | null
          response_date: string | null
          status: string | null
          title: string | null
          trademark_id: string | null
          updated_at: string | null
        }
        Insert: {
          action_type?: string
          created_at?: string | null
          created_by?: string | null
          deadline_date?: string | null
          description?: string | null
          id?: string
          jurisdiction_code?: string | null
          notes?: string | null
          office_reference?: string | null
          priority?: string | null
          response_date?: string | null
          status?: string | null
          title?: string | null
          trademark_id?: string | null
          updated_at?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          created_by?: string | null
          deadline_date?: string | null
          description?: string | null
          id?: string
          jurisdiction_code?: string | null
          notes?: string | null
          office_reference?: string | null
          priority?: string | null
          response_date?: string | null
          status?: string | null
          title?: string | null
          trademark_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      office_document_requirements: {
        Row: {
          created_at: string | null
          default_template_id: string | null
          document_type: string
          id: string
          last_verified_date: string | null
          office_code: string
          official_form_number: string | null
          official_form_url: string | null
          organization_id: string | null
          requirements: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_template_id?: string | null
          document_type: string
          id?: string
          last_verified_date?: string | null
          office_code: string
          official_form_number?: string | null
          official_form_url?: string | null
          organization_id?: string | null
          requirements?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_template_id?: string | null
          document_type?: string
          id?: string
          last_verified_date?: string | null
          office_code?: string
          official_form_number?: string | null
          official_form_url?: string | null
          organization_id?: string | null
          requirements?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "office_document_requirements_default_template_id_fkey"
            columns: ["default_template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      office_documents: {
        Row: {
          created_at: string | null
          description: string | null
          download_status: string | null
          downloaded_at: string | null
          error_message: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          matter_id: string
          mime_type: string | null
          office_code: string
          office_doc_date: string | null
          office_doc_id: string | null
          office_doc_type: string | null
          office_metadata: Json | null
          tenant_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          download_status?: string | null
          downloaded_at?: string | null
          error_message?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          matter_id: string
          mime_type?: string | null
          office_code: string
          office_doc_date?: string | null
          office_doc_id?: string | null
          office_doc_type?: string | null
          office_metadata?: Json | null
          tenant_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          download_status?: string | null
          downloaded_at?: string | null
          error_message?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          matter_id?: string
          mime_type?: string | null
          office_code?: string
          office_doc_date?: string | null
          office_doc_id?: string | null
          office_doc_type?: string | null
          office_metadata?: Json | null
          tenant_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      office_file_imports: {
        Row: {
          created_at: string | null
          errors: Json | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          import_status: string | null
          office_code: string
          processed_at: string | null
          processing_method: string | null
          records_failed: number | null
          records_found: number | null
          records_imported: number | null
          records_updated: number | null
          requires_review: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          tenant_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          errors?: Json | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          import_status?: string | null
          office_code: string
          processed_at?: string | null
          processing_method?: string | null
          records_failed?: number | null
          records_found?: number | null
          records_imported?: number | null
          records_updated?: number | null
          requires_review?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          tenant_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          errors?: Json | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          import_status?: string | null
          office_code?: string
          processed_at?: string | null
          processing_method?: string | null
          records_failed?: number | null
          records_found?: number | null
          records_imported?: number | null
          records_updated?: number | null
          requires_review?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          tenant_id?: string
          uploaded_by?: string | null
        }
        Relationships: []
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
      office_import_review_queue: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          current_data: Json | null
          extracted_data: Json | null
          fields_to_review: string[] | null
          final_data: Json | null
          id: string
          import_id: string
          matter_id: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          current_data?: Json | null
          extracted_data?: Json | null
          fields_to_review?: string[] | null
          final_data?: Json | null
          id?: string
          import_id: string
          matter_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          current_data?: Json | null
          extracted_data?: Json | null
          fields_to_review?: string[] | null
          final_data?: Json | null
          id?: string
          import_id?: string
          matter_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "office_import_review_queue_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "office_file_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      office_import_templates: {
        Row: {
          column_mappings: Json | null
          created_at: string | null
          description: string | null
          file_type: string | null
          id: string
          instructions: string | null
          is_active: boolean | null
          office_code: string
          template_file_url: string | null
          template_name: string | null
          updated_at: string | null
          validations: Json | null
        }
        Insert: {
          column_mappings?: Json | null
          created_at?: string | null
          description?: string | null
          file_type?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          office_code: string
          template_file_url?: string | null
          template_name?: string | null
          updated_at?: string | null
          validations?: Json | null
        }
        Update: {
          column_mappings?: Json | null
          created_at?: string | null
          description?: string | null
          file_type?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          office_code?: string
          template_file_url?: string | null
          template_name?: string | null
          updated_at?: string | null
          validations?: Json | null
        }
        Relationships: []
      }
      office_query_cache: {
        Row: {
          cached_at: string | null
          expires_at: string | null
          id: string
          office_code: string
          query_key: string
          query_params: Json | null
          query_type: string | null
          response_data: Json | null
        }
        Insert: {
          cached_at?: string | null
          expires_at?: string | null
          id?: string
          office_code: string
          query_key: string
          query_params?: Json | null
          query_type?: string | null
          response_data?: Json | null
        }
        Update: {
          cached_at?: string | null
          expires_at?: string | null
          id?: string
          office_code?: string
          query_key?: string
          query_params?: Json | null
          query_type?: string | null
          response_data?: Json | null
        }
        Relationships: []
      }
      office_request_logs: {
        Row: {
          billable: boolean | null
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          endpoint: string | null
          error_message: string | null
          id: string
          matter_id: string | null
          method: string | null
          office_code: string
          request_params: Json | null
          response_size_bytes: number | null
          response_summary: Json | null
          started_at: string | null
          status_code: number | null
          tenant_id: string | null
        }
        Insert: {
          billable?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          endpoint?: string | null
          error_message?: string | null
          id?: string
          matter_id?: string | null
          method?: string | null
          office_code: string
          request_params?: Json | null
          response_size_bytes?: number | null
          response_summary?: Json | null
          started_at?: string | null
          status_code?: number | null
          tenant_id?: string | null
        }
        Update: {
          billable?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          endpoint?: string | null
          error_message?: string | null
          id?: string
          matter_id?: string | null
          method?: string | null
          office_code?: string
          request_params?: Json | null
          response_size_bytes?: number | null
          response_summary?: Json | null
          started_at?: string | null
          status_code?: number | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      office_status_mappings: {
        Row: {
          created_at: string | null
          creates_deadline: boolean | null
          deadline_type_code: string | null
          description_en: string | null
          description_es: string | null
          id: string
          normalized_status: string
          office_code: string
          office_status: string
          status_category: string | null
        }
        Insert: {
          created_at?: string | null
          creates_deadline?: boolean | null
          deadline_type_code?: string | null
          description_en?: string | null
          description_es?: string | null
          id?: string
          normalized_status: string
          office_code: string
          office_status: string
          status_category?: string | null
        }
        Update: {
          created_at?: string | null
          creates_deadline?: boolean | null
          deadline_type_code?: string | null
          description_en?: string | null
          description_es?: string | null
          id?: string
          normalized_status?: string
          office_code?: string
          office_status?: string
          status_category?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          amount_with_vat: number | null
          client_email: string
          client_id: string | null
          client_name: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          id: string
          jurisdiction: string | null
          metadata: Json | null
          nice_classes: Json | null
          notes: string | null
          official_fee: number | null
          order_number: string
          paid_at: string | null
          payment_method: string | null
          service_fee: number | null
          service_name: string
          service_type: string
          source: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          trademark_name: string | null
          updated_at: string | null
          vat_amount: number | null
          vat_rate: number | null
        }
        Insert: {
          amount: number
          amount_with_vat?: number | null
          client_email: string
          client_id?: string | null
          client_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          jurisdiction?: string | null
          metadata?: Json | null
          nice_classes?: Json | null
          notes?: string | null
          official_fee?: number | null
          order_number: string
          paid_at?: string | null
          payment_method?: string | null
          service_fee?: number | null
          service_name: string
          service_type: string
          source?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          trademark_name?: string | null
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Update: {
          amount?: number
          amount_with_vat?: number | null
          client_email?: string
          client_id?: string | null
          client_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          jurisdiction?: string | null
          metadata?: Json | null
          nice_classes?: Json | null
          notes?: string | null
          official_fee?: number | null
          order_number?: string
          paid_at?: string | null
          payment_method?: string | null
          service_fee?: number | null
          service_name?: string
          service_type?: string
          source?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          trademark_name?: string | null
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          plan: string | null
          settings: Json | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          plan?: string | null
          settings?: Json | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          plan?: string | null
          settings?: Json | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          accepts_litigation: boolean | null
          accepts_opposition_cases: boolean | null
          active_cases: number | null
          address_line1: string | null
          address_line2: string | null
          bank_account: string | null
          bank_name: string | null
          bar_association: string | null
          city: string | null
          commission_rate: number | null
          company_name: string
          contact_email: string
          contact_mobile: string | null
          contact_name: string
          contact_phone: string | null
          contact_title: string | null
          contract_date: string | null
          contract_expiry: string | null
          contract_signed: boolean | null
          country_code: string | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          efiling_offices: Json | null
          handles_apostille: boolean | null
          handles_legalization: boolean | null
          handles_pow: boolean | null
          handles_sworn_translations: boolean | null
          handles_urgent_filing: boolean | null
          has_efiling_access: boolean | null
          has_local_correspondents: boolean | null
          has_rate_agreement: boolean | null
          id: string
          is_pi_agent: boolean | null
          jurisdictions: string[] | null
          languages: string[] | null
          last_case_date: string | null
          license_number: string | null
          linkedin: string | null
          nda_signed: boolean | null
          notes: string | null
          partner_type: string | null
          payment_terms: string | null
          pi_avg_response_hours: number | null
          pi_contract_url: string | null
          pi_has_professional_insurance: boolean | null
          pi_incidents_notes: string | null
          pi_invoice_name: string | null
          pi_is_verified: boolean | null
          pi_memberships: Json | null
          pi_minimum_order: number | null
          pi_payment_methods: Json | null
          pi_quality_notes: string | null
          pi_relationship_since: string | null
          pi_relationship_type: string | null
          pi_service_types: Json | null
          pi_success_rate_pct: number | null
          pi_types: Json | null
          pi_verified_by: string | null
          pi_verified_date: string | null
          pi_volume_discount: boolean | null
          pi_volume_discount_notes: string | null
          postal_code: string | null
          preferred_currency: string | null
          rating: number | null
          secondary_contact_email: string | null
          secondary_contact_name: string | null
          secondary_contact_phone: string | null
          specializations: string[] | null
          state_province: string | null
          status: string | null
          swift_bic: string | null
          tax_id: string | null
          total_cases: number | null
          total_revenue: number | null
          trade_name: string | null
          updated_at: string | null
          website: string | null
          years_experience: number | null
        }
        Insert: {
          accepts_litigation?: boolean | null
          accepts_opposition_cases?: boolean | null
          active_cases?: number | null
          address_line1?: string | null
          address_line2?: string | null
          bank_account?: string | null
          bank_name?: string | null
          bar_association?: string | null
          city?: string | null
          commission_rate?: number | null
          company_name: string
          contact_email: string
          contact_mobile?: string | null
          contact_name: string
          contact_phone?: string | null
          contact_title?: string | null
          contract_date?: string | null
          contract_expiry?: string | null
          contract_signed?: boolean | null
          country_code?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          efiling_offices?: Json | null
          handles_apostille?: boolean | null
          handles_legalization?: boolean | null
          handles_pow?: boolean | null
          handles_sworn_translations?: boolean | null
          handles_urgent_filing?: boolean | null
          has_efiling_access?: boolean | null
          has_local_correspondents?: boolean | null
          has_rate_agreement?: boolean | null
          id?: string
          is_pi_agent?: boolean | null
          jurisdictions?: string[] | null
          languages?: string[] | null
          last_case_date?: string | null
          license_number?: string | null
          linkedin?: string | null
          nda_signed?: boolean | null
          notes?: string | null
          partner_type?: string | null
          payment_terms?: string | null
          pi_avg_response_hours?: number | null
          pi_contract_url?: string | null
          pi_has_professional_insurance?: boolean | null
          pi_incidents_notes?: string | null
          pi_invoice_name?: string | null
          pi_is_verified?: boolean | null
          pi_memberships?: Json | null
          pi_minimum_order?: number | null
          pi_payment_methods?: Json | null
          pi_quality_notes?: string | null
          pi_relationship_since?: string | null
          pi_relationship_type?: string | null
          pi_service_types?: Json | null
          pi_success_rate_pct?: number | null
          pi_types?: Json | null
          pi_verified_by?: string | null
          pi_verified_date?: string | null
          pi_volume_discount?: boolean | null
          pi_volume_discount_notes?: string | null
          postal_code?: string | null
          preferred_currency?: string | null
          rating?: number | null
          secondary_contact_email?: string | null
          secondary_contact_name?: string | null
          secondary_contact_phone?: string | null
          specializations?: string[] | null
          state_province?: string | null
          status?: string | null
          swift_bic?: string | null
          tax_id?: string | null
          total_cases?: number | null
          total_revenue?: number | null
          trade_name?: string | null
          updated_at?: string | null
          website?: string | null
          years_experience?: number | null
        }
        Update: {
          accepts_litigation?: boolean | null
          accepts_opposition_cases?: boolean | null
          active_cases?: number | null
          address_line1?: string | null
          address_line2?: string | null
          bank_account?: string | null
          bank_name?: string | null
          bar_association?: string | null
          city?: string | null
          commission_rate?: number | null
          company_name?: string
          contact_email?: string
          contact_mobile?: string | null
          contact_name?: string
          contact_phone?: string | null
          contact_title?: string | null
          contract_date?: string | null
          contract_expiry?: string | null
          contract_signed?: boolean | null
          country_code?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          efiling_offices?: Json | null
          handles_apostille?: boolean | null
          handles_legalization?: boolean | null
          handles_pow?: boolean | null
          handles_sworn_translations?: boolean | null
          handles_urgent_filing?: boolean | null
          has_efiling_access?: boolean | null
          has_local_correspondents?: boolean | null
          has_rate_agreement?: boolean | null
          id?: string
          is_pi_agent?: boolean | null
          jurisdictions?: string[] | null
          languages?: string[] | null
          last_case_date?: string | null
          license_number?: string | null
          linkedin?: string | null
          nda_signed?: boolean | null
          notes?: string | null
          partner_type?: string | null
          payment_terms?: string | null
          pi_avg_response_hours?: number | null
          pi_contract_url?: string | null
          pi_has_professional_insurance?: boolean | null
          pi_incidents_notes?: string | null
          pi_invoice_name?: string | null
          pi_is_verified?: boolean | null
          pi_memberships?: Json | null
          pi_minimum_order?: number | null
          pi_payment_methods?: Json | null
          pi_quality_notes?: string | null
          pi_relationship_since?: string | null
          pi_relationship_type?: string | null
          pi_service_types?: Json | null
          pi_success_rate_pct?: number | null
          pi_types?: Json | null
          pi_verified_by?: string | null
          pi_verified_date?: string | null
          pi_volume_discount?: boolean | null
          pi_volume_discount_notes?: string | null
          postal_code?: string | null
          preferred_currency?: string | null
          rating?: number | null
          secondary_contact_email?: string | null
          secondary_contact_name?: string | null
          secondary_contact_phone?: string | null
          specializations?: string[] | null
          state_province?: string | null
          status?: string | null
          swift_bic?: string | null
          tax_id?: string | null
          total_cases?: number | null
          total_revenue?: number | null
          trade_name?: string | null
          updated_at?: string | null
          website?: string | null
          years_experience?: number | null
        }
        Relationships: []
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
            foreignKeyName: "predictive_alerts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_services: {
        Row: {
          additional_class_price: number | null
          agent_cost: number | null
          agent_cost_included: boolean | null
          agent_name: string | null
          agent_notes: string | null
          agent_partner_id: string | null
          allows_additional_classes: boolean | null
          auto_calculated: boolean | null
          base_classes: number | null
          base_price: number
          base_price_eur: number | null
          base_price_usd: number | null
          beneficio_neto: number | null
          beneficio_pct: number | null
          benefits: Json | null
          client_price: number | null
          code: string
          competitor_avg_price: number | null
          competitor_last_research: string | null
          competitor_max_price: number | null
          competitor_min_price: number | null
          cost_agent: number | null
          cost_official_fee: number | null
          created_at: string | null
          cta_pricing_text: string | null
          cta_pricing_url: string | null
          cta_services_text: string | null
          cta_services_url: string | null
          cta_text: string | null
          cta_url: string | null
          currency: string | null
          description: string | null
          description_en: string | null
          detail_page_url: string | null
          display_order: number | null
          estimated_time: string | null
          exchange_rate_eur: number | null
          exchange_rate_usd: number | null
          faqs: Json | null
          features: Json | null
          fee_source_url: string | null
          fee_verified_date: string | null
          has_detail_page: boolean | null
          has_local_agent: boolean | null
          honorarios: number | null
          honorarios_eur: number | null
          honorarios_usd: number | null
          id: string
          internal_cost: number | null
          internal_cost_per_class: number | null
          ipo_office_id: string | null
          is_active: boolean | null
          is_featured: boolean | null
          jurisdiction_id: string | null
          long_description: string | null
          name: string
          name_en: string | null
          notes: string | null
          office_id: string | null
          official_fee: number | null
          official_fee_change_expected: string | null
          official_fee_change_notes: string | null
          official_fee_currency: string | null
          official_fee_eur: number | null
          official_fee_included: boolean | null
          official_fee_last_checked: string | null
          official_fee_per_class: Json | null
          official_fee_usd: number | null
          price_confidence: string | null
          price_last_verified_at: string | null
          price_last_verified_by: string | null
          price_next_review_date: string | null
          price_source_notes: string | null
          pricing_type: string | null
          process_steps: Json | null
          rates_fetched_at: string | null
          requirements: Json | null
          service_catalog_id: string | null
          service_channel: string | null
          service_id: string | null
          service_subtype: string | null
          service_type: string
          show_on_pricing_page: boolean | null
          show_on_services_page: boolean | null
          show_on_wizard: boolean | null
          target_audience: string | null
          third_party_cost_included: boolean | null
          third_party_cost_max: number | null
          third_party_cost_min: number | null
          third_party_description: string | null
          updated_at: string | null
          visible_on_web: boolean | null
        }
        Insert: {
          additional_class_price?: number | null
          agent_cost?: number | null
          agent_cost_included?: boolean | null
          agent_name?: string | null
          agent_notes?: string | null
          agent_partner_id?: string | null
          allows_additional_classes?: boolean | null
          auto_calculated?: boolean | null
          base_classes?: number | null
          base_price?: number
          base_price_eur?: number | null
          base_price_usd?: number | null
          beneficio_neto?: number | null
          beneficio_pct?: number | null
          benefits?: Json | null
          client_price?: number | null
          code: string
          competitor_avg_price?: number | null
          competitor_last_research?: string | null
          competitor_max_price?: number | null
          competitor_min_price?: number | null
          cost_agent?: number | null
          cost_official_fee?: number | null
          created_at?: string | null
          cta_pricing_text?: string | null
          cta_pricing_url?: string | null
          cta_services_text?: string | null
          cta_services_url?: string | null
          cta_text?: string | null
          cta_url?: string | null
          currency?: string | null
          description?: string | null
          description_en?: string | null
          detail_page_url?: string | null
          display_order?: number | null
          estimated_time?: string | null
          exchange_rate_eur?: number | null
          exchange_rate_usd?: number | null
          faqs?: Json | null
          features?: Json | null
          fee_source_url?: string | null
          fee_verified_date?: string | null
          has_detail_page?: boolean | null
          has_local_agent?: boolean | null
          honorarios?: number | null
          honorarios_eur?: number | null
          honorarios_usd?: number | null
          id?: string
          internal_cost?: number | null
          internal_cost_per_class?: number | null
          ipo_office_id?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          jurisdiction_id?: string | null
          long_description?: string | null
          name: string
          name_en?: string | null
          notes?: string | null
          office_id?: string | null
          official_fee?: number | null
          official_fee_change_expected?: string | null
          official_fee_change_notes?: string | null
          official_fee_currency?: string | null
          official_fee_eur?: number | null
          official_fee_included?: boolean | null
          official_fee_last_checked?: string | null
          official_fee_per_class?: Json | null
          official_fee_usd?: number | null
          price_confidence?: string | null
          price_last_verified_at?: string | null
          price_last_verified_by?: string | null
          price_next_review_date?: string | null
          price_source_notes?: string | null
          pricing_type?: string | null
          process_steps?: Json | null
          rates_fetched_at?: string | null
          requirements?: Json | null
          service_catalog_id?: string | null
          service_channel?: string | null
          service_id?: string | null
          service_subtype?: string | null
          service_type: string
          show_on_pricing_page?: boolean | null
          show_on_services_page?: boolean | null
          show_on_wizard?: boolean | null
          target_audience?: string | null
          third_party_cost_included?: boolean | null
          third_party_cost_max?: number | null
          third_party_cost_min?: number | null
          third_party_description?: string | null
          updated_at?: string | null
          visible_on_web?: boolean | null
        }
        Update: {
          additional_class_price?: number | null
          agent_cost?: number | null
          agent_cost_included?: boolean | null
          agent_name?: string | null
          agent_notes?: string | null
          agent_partner_id?: string | null
          allows_additional_classes?: boolean | null
          auto_calculated?: boolean | null
          base_classes?: number | null
          base_price?: number
          base_price_eur?: number | null
          base_price_usd?: number | null
          beneficio_neto?: number | null
          beneficio_pct?: number | null
          benefits?: Json | null
          client_price?: number | null
          code?: string
          competitor_avg_price?: number | null
          competitor_last_research?: string | null
          competitor_max_price?: number | null
          competitor_min_price?: number | null
          cost_agent?: number | null
          cost_official_fee?: number | null
          created_at?: string | null
          cta_pricing_text?: string | null
          cta_pricing_url?: string | null
          cta_services_text?: string | null
          cta_services_url?: string | null
          cta_text?: string | null
          cta_url?: string | null
          currency?: string | null
          description?: string | null
          description_en?: string | null
          detail_page_url?: string | null
          display_order?: number | null
          estimated_time?: string | null
          exchange_rate_eur?: number | null
          exchange_rate_usd?: number | null
          faqs?: Json | null
          features?: Json | null
          fee_source_url?: string | null
          fee_verified_date?: string | null
          has_detail_page?: boolean | null
          has_local_agent?: boolean | null
          honorarios?: number | null
          honorarios_eur?: number | null
          honorarios_usd?: number | null
          id?: string
          internal_cost?: number | null
          internal_cost_per_class?: number | null
          ipo_office_id?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          jurisdiction_id?: string | null
          long_description?: string | null
          name?: string
          name_en?: string | null
          notes?: string | null
          office_id?: string | null
          official_fee?: number | null
          official_fee_change_expected?: string | null
          official_fee_change_notes?: string | null
          official_fee_currency?: string | null
          official_fee_eur?: number | null
          official_fee_included?: boolean | null
          official_fee_last_checked?: string | null
          official_fee_per_class?: Json | null
          official_fee_usd?: number | null
          price_confidence?: string | null
          price_last_verified_at?: string | null
          price_last_verified_by?: string | null
          price_next_review_date?: string | null
          price_source_notes?: string | null
          pricing_type?: string | null
          process_steps?: Json | null
          rates_fetched_at?: string | null
          requirements?: Json | null
          service_catalog_id?: string | null
          service_channel?: string | null
          service_id?: string | null
          service_subtype?: string | null
          service_type?: string
          show_on_pricing_page?: boolean | null
          show_on_services_page?: boolean | null
          show_on_wizard?: boolean | null
          target_audience?: string | null
          third_party_cost_included?: boolean | null
          third_party_cost_max?: number | null
          third_party_cost_min?: number | null
          third_party_description?: string | null
          updated_at?: string | null
          visible_on_web?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_services_agent_partner_id_fkey"
            columns: ["agent_partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_services_jurisdiction_id_fkey"
            columns: ["jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_services_jurisdiction_id_fkey"
            columns: ["jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_services_jurisdiction_id_fkey"
            columns: ["jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_services_jurisdiction_id_fkey"
            columns: ["jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "pricing_services_jurisdiction_id_fkey"
            columns: ["jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "pricing_services_service_catalog_id_fkey"
            columns: ["service_catalog_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          organization_id: string | null
          preferences: Json | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          organization_id?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          document_id: string
          document_type: string | null
          embedding: Json | null
          end_char: number | null
          id: string
          is_current: boolean | null
          jurisdiction: string | null
          knowledge_base_id: string
          language: string | null
          start_char: number | null
          token_count: number | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          document_id: string
          document_type?: string | null
          embedding?: Json | null
          end_char?: number | null
          id?: string
          is_current?: boolean | null
          jurisdiction?: string | null
          knowledge_base_id: string
          language?: string | null
          start_char?: number | null
          token_count?: number | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          document_id?: string
          document_type?: string | null
          embedding?: Json | null
          end_char?: number | null
          id?: string
          is_current?: boolean | null
          jurisdiction?: string | null
          knowledge_base_id?: string
          language?: string | null
          start_char?: number | null
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "rag_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rag_chunks_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            isOneToOne: false
            referencedRelation: "rag_knowledge_bases"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_documents: {
        Row: {
          chunk_count: number | null
          content_hash: string | null
          created_at: string | null
          created_by: string | null
          document_type: string | null
          effective_from: string | null
          effective_to: string | null
          error_message: string | null
          id: string
          is_current: boolean | null
          jurisdiction: string | null
          knowledge_base_id: string
          language: string | null
          metadata: Json | null
          processed_at: string | null
          raw_content: string | null
          source_type: string | null
          source_url: string | null
          status: string | null
          supersedes_id: string | null
          tags: string[] | null
          title: string
          token_count: number | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          chunk_count?: number | null
          content_hash?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type?: string | null
          effective_from?: string | null
          effective_to?: string | null
          error_message?: string | null
          id?: string
          is_current?: boolean | null
          jurisdiction?: string | null
          knowledge_base_id: string
          language?: string | null
          metadata?: Json | null
          processed_at?: string | null
          raw_content?: string | null
          source_type?: string | null
          source_url?: string | null
          status?: string | null
          supersedes_id?: string | null
          tags?: string[] | null
          title: string
          token_count?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          chunk_count?: number | null
          content_hash?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type?: string | null
          effective_from?: string | null
          effective_to?: string | null
          error_message?: string | null
          id?: string
          is_current?: boolean | null
          jurisdiction?: string | null
          knowledge_base_id?: string
          language?: string | null
          metadata?: Json | null
          processed_at?: string | null
          raw_content?: string | null
          source_type?: string | null
          source_url?: string | null
          status?: string | null
          supersedes_id?: string | null
          tags?: string[] | null
          title?: string
          token_count?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_documents_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            isOneToOne: false
            referencedRelation: "rag_knowledge_bases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rag_documents_supersedes_id_fkey"
            columns: ["supersedes_id"]
            isOneToOne: false
            referencedRelation: "rag_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_knowledge_bases: {
        Row: {
          allowed_roles: string[] | null
          associated_tasks: string[] | null
          chunk_count: number | null
          chunk_overlap: number | null
          chunk_size: number | null
          code: string
          created_at: string | null
          created_by: string | null
          default_top_k: number | null
          description: string | null
          document_count: number | null
          embedding_dimensions: number | null
          embedding_model: string | null
          embedding_provider: string | null
          id: string
          is_active: boolean | null
          jurisdictions: string[] | null
          languages: string[] | null
          last_updated_at: string | null
          name: string
          similarity_threshold: number | null
          tenant_id: string | null
          total_tokens: number | null
          type: string | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          allowed_roles?: string[] | null
          associated_tasks?: string[] | null
          chunk_count?: number | null
          chunk_overlap?: number | null
          chunk_size?: number | null
          code: string
          created_at?: string | null
          created_by?: string | null
          default_top_k?: number | null
          description?: string | null
          document_count?: number | null
          embedding_dimensions?: number | null
          embedding_model?: string | null
          embedding_provider?: string | null
          id?: string
          is_active?: boolean | null
          jurisdictions?: string[] | null
          languages?: string[] | null
          last_updated_at?: string | null
          name: string
          similarity_threshold?: number | null
          tenant_id?: string | null
          total_tokens?: number | null
          type?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          allowed_roles?: string[] | null
          associated_tasks?: string[] | null
          chunk_count?: number | null
          chunk_overlap?: number | null
          chunk_size?: number | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          default_top_k?: number | null
          description?: string | null
          document_count?: number | null
          embedding_dimensions?: number | null
          embedding_model?: string | null
          embedding_provider?: string | null
          id?: string
          is_active?: boolean | null
          jurisdictions?: string[] | null
          languages?: string[] | null
          last_updated_at?: string | null
          name?: string
          similarity_threshold?: number | null
          tenant_id?: string | null
          total_tokens?: number | null
          type?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      rag_queries: {
        Row: {
          chunks_retrieved: number | null
          chunks_used: number | null
          created_at: string | null
          execution_id: string | null
          filters_applied: Json | null
          id: string
          knowledge_base_id: string
          latency_ms: number | null
          query_embedding: Json | null
          query_text: string
          sources: Json | null
          task_code: string | null
          tenant_id: string | null
          top_k_requested: number | null
          user_id: string | null
        }
        Insert: {
          chunks_retrieved?: number | null
          chunks_used?: number | null
          created_at?: string | null
          execution_id?: string | null
          filters_applied?: Json | null
          id?: string
          knowledge_base_id: string
          latency_ms?: number | null
          query_embedding?: Json | null
          query_text: string
          sources?: Json | null
          task_code?: string | null
          tenant_id?: string | null
          top_k_requested?: number | null
          user_id?: string | null
        }
        Update: {
          chunks_retrieved?: number | null
          chunks_used?: number | null
          created_at?: string | null
          execution_id?: string | null
          filters_applied?: Json | null
          id?: string
          knowledge_base_id?: string
          latency_ms?: number | null
          query_embedding?: Json | null
          query_text?: string
          sources?: Json | null
          task_code?: string | null
          tenant_id?: string | null
          top_k_requested?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_queries_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            isOneToOne: false
            referencedRelation: "rag_knowledge_bases"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_search_logs: {
        Row: {
          chunks_returned: number | null
          created_at: string | null
          id: string
          jurisdiction: string | null
          query: string
          query_type: string | null
          response_time_ms: number | null
          session_id: string | null
          user_feedback: string | null
          was_reranked: boolean | null
          weights_used: Json | null
        }
        Insert: {
          chunks_returned?: number | null
          created_at?: string | null
          id?: string
          jurisdiction?: string | null
          query: string
          query_type?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          user_feedback?: string | null
          was_reranked?: boolean | null
          weights_used?: Json | null
        }
        Update: {
          chunks_returned?: number | null
          created_at?: string | null
          id?: string
          jurisdiction?: string | null
          query?: string
          query_type?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          user_feedback?: string | null
          was_reranked?: boolean | null
          weights_used?: Json | null
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          enabled: boolean
          id: string
          permission_key: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean
          id?: string
          permission_key: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean
          id?: string
          permission_key?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      search_service_config: {
        Row: {
          config_key: string
          config_type: string | null
          config_value: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_type?: string | null
          config_value?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_type?: string | null
          config_value?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      service_catalog: {
        Row: {
          additional_class_fee_eur: number | null
          applicable_offices: string[] | null
          available_globally: boolean | null
          base_price: number
          category: string | null
          category_id: string | null
          competitor_service_codes: string[] | null
          complexity: string | null
          created_at: string
          currency: string
          default_jurisdiction: string | null
          default_matter_subtype: string | null
          default_matter_type: string | null
          description: string | null
          description_en: string | null
          description_pt: string | null
          discovery_tags: string[] | null
          display_order: number | null
          estimated_days: number | null
          estimated_days_max: number | null
          estimated_days_min: number | null
          estimated_duration: string | null
          estimated_hours: number | null
          extra_class_fee: number | null
          fee_type_link: string | null
          generates_matter: boolean | null
          has_official_fee: boolean | null
          id: string
          includes_official_fees: boolean | null
          is_active: boolean
          is_automatable: boolean | null
          is_flagship: boolean | null
          is_preconfigured: boolean | null
          is_public: boolean | null
          is_recurring: boolean | null
          jurisdiction: string | null
          long_description: string | null
          long_description_en: string | null
          long_description_pt: string | null
          name: string
          name_de: string | null
          name_en: string | null
          name_fr: string | null
          name_pt: string | null
          nice_class_dependent: boolean | null
          nice_classes_included: number | null
          official_fee: number | null
          official_fees_note: string | null
          organization_id: string | null
          preconfigured_code: string | null
          price_from_eur: number | null
          price_to_eur: number | null
          pricing_model: string | null
          professional_fee: number | null
          recurrence_period: string | null
          reference_code: string | null
          requires_jurisdiction: boolean | null
          requires_local_agent: boolean | null
          service_type: string | null
          show_in_landing: boolean | null
          show_in_portal: boolean | null
          stripe_price_id: string | null
          subcategory: string | null
          tax_rate: number | null
          updated_at: string
        }
        Insert: {
          additional_class_fee_eur?: number | null
          applicable_offices?: string[] | null
          available_globally?: boolean | null
          base_price?: number
          category?: string | null
          category_id?: string | null
          competitor_service_codes?: string[] | null
          complexity?: string | null
          created_at?: string
          currency?: string
          default_jurisdiction?: string | null
          default_matter_subtype?: string | null
          default_matter_type?: string | null
          description?: string | null
          description_en?: string | null
          description_pt?: string | null
          discovery_tags?: string[] | null
          display_order?: number | null
          estimated_days?: number | null
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          estimated_duration?: string | null
          estimated_hours?: number | null
          extra_class_fee?: number | null
          fee_type_link?: string | null
          generates_matter?: boolean | null
          has_official_fee?: boolean | null
          id?: string
          includes_official_fees?: boolean | null
          is_active?: boolean
          is_automatable?: boolean | null
          is_flagship?: boolean | null
          is_preconfigured?: boolean | null
          is_public?: boolean | null
          is_recurring?: boolean | null
          jurisdiction?: string | null
          long_description?: string | null
          long_description_en?: string | null
          long_description_pt?: string | null
          name: string
          name_de?: string | null
          name_en?: string | null
          name_fr?: string | null
          name_pt?: string | null
          nice_class_dependent?: boolean | null
          nice_classes_included?: number | null
          official_fee?: number | null
          official_fees_note?: string | null
          organization_id?: string | null
          preconfigured_code?: string | null
          price_from_eur?: number | null
          price_to_eur?: number | null
          pricing_model?: string | null
          professional_fee?: number | null
          recurrence_period?: string | null
          reference_code?: string | null
          requires_jurisdiction?: boolean | null
          requires_local_agent?: boolean | null
          service_type?: string | null
          show_in_landing?: boolean | null
          show_in_portal?: boolean | null
          stripe_price_id?: string | null
          subcategory?: string | null
          tax_rate?: number | null
          updated_at?: string
        }
        Update: {
          additional_class_fee_eur?: number | null
          applicable_offices?: string[] | null
          available_globally?: boolean | null
          base_price?: number
          category?: string | null
          category_id?: string | null
          competitor_service_codes?: string[] | null
          complexity?: string | null
          created_at?: string
          currency?: string
          default_jurisdiction?: string | null
          default_matter_subtype?: string | null
          default_matter_type?: string | null
          description?: string | null
          description_en?: string | null
          description_pt?: string | null
          discovery_tags?: string[] | null
          display_order?: number | null
          estimated_days?: number | null
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          estimated_duration?: string | null
          estimated_hours?: number | null
          extra_class_fee?: number | null
          fee_type_link?: string | null
          generates_matter?: boolean | null
          has_official_fee?: boolean | null
          id?: string
          includes_official_fees?: boolean | null
          is_active?: boolean
          is_automatable?: boolean | null
          is_flagship?: boolean | null
          is_preconfigured?: boolean | null
          is_public?: boolean | null
          is_recurring?: boolean | null
          jurisdiction?: string | null
          long_description?: string | null
          long_description_en?: string | null
          long_description_pt?: string | null
          name?: string
          name_de?: string | null
          name_en?: string | null
          name_fr?: string | null
          name_pt?: string | null
          nice_class_dependent?: boolean | null
          nice_classes_included?: number | null
          official_fee?: number | null
          official_fees_note?: string | null
          organization_id?: string | null
          preconfigured_code?: string | null
          price_from_eur?: number | null
          price_to_eur?: number | null
          pricing_model?: string | null
          professional_fee?: number | null
          recurrence_period?: string | null
          reference_code?: string | null
          requires_jurisdiction?: boolean | null
          requires_local_agent?: boolean | null
          service_type?: string | null
          show_in_landing?: boolean | null
          show_in_portal?: boolean | null
          stripe_price_id?: string | null
          subcategory?: string | null
          tax_rate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_catalog_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description_en: string | null
          description_es: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_en: string
          name_es: string
          parent_id: string | null
          position: number | null
          right_type: string | null
          right_types: string[] | null
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description_en?: string | null
          description_es?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_en: string
          name_es: string
          parent_id?: string | null
          position?: number | null
          right_type?: string | null
          right_types?: string[] | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description_en?: string | null
          description_es?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_en?: string
          name_es?: string
          parent_id?: string | null
          position?: number | null
          right_type?: string | null
          right_types?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      service_pricing_rules: {
        Row: {
          additional_class_eur: number | null
          created_at: string | null
          honorarios_display_eur: number | null
          honorarios_eur: number
          id: string
          ipo_office_id: string | null
          is_active: boolean | null
          min_margin_pct: number | null
          notes: string | null
          service_id: string
          updated_at: string | null
        }
        Insert: {
          additional_class_eur?: number | null
          created_at?: string | null
          honorarios_display_eur?: number | null
          honorarios_eur: number
          id?: string
          ipo_office_id?: string | null
          is_active?: boolean | null
          min_margin_pct?: number | null
          notes?: string | null
          service_id: string
          updated_at?: string | null
        }
        Update: {
          additional_class_eur?: number | null
          created_at?: string | null
          honorarios_display_eur?: number | null
          honorarios_eur?: number
          id?: string
          ipo_office_id?: string | null
          is_active?: boolean | null
          min_margin_pct?: number | null
          notes?: string | null
          service_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_pricing_rules_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_pricing_rules_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_pricing_rules_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_pricing_rules_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "service_pricing_rules_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "service_pricing_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          service_name: string | null
          service_type: string | null
          status: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          service_name?: string | null
          service_type?: string | null
          status?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          service_name?: string | null
          service_type?: string | null
          status?: string | null
        }
        Relationships: []
      }
      service_templates: {
        Row: {
          applicable_phases: string[] | null
          auto_deadlines: string[] | null
          base_official_fee: number | null
          base_professional_fee: number | null
          category_id: string | null
          code: string
          created_at: string | null
          currency: string | null
          description_en: string | null
          description_es: string | null
          display_order: number | null
          fee_notes: string | null
          id: string
          initial_phase: string
          internal_notes: string | null
          international_system: string | null
          is_active: boolean | null
          jurisdiction_id: string | null
          name_en: string
          name_es: string
          optional_fields: string[] | null
          phase_durations: Json | null
          related_services: string[] | null
          required_documents: string[] | null
          required_fields: string[] | null
          right_type: string
          skippable_phases: string[] | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          applicable_phases?: string[] | null
          auto_deadlines?: string[] | null
          base_official_fee?: number | null
          base_professional_fee?: number | null
          category_id?: string | null
          code: string
          created_at?: string | null
          currency?: string | null
          description_en?: string | null
          description_es?: string | null
          display_order?: number | null
          fee_notes?: string | null
          id?: string
          initial_phase?: string
          internal_notes?: string | null
          international_system?: string | null
          is_active?: boolean | null
          jurisdiction_id?: string | null
          name_en: string
          name_es: string
          optional_fields?: string[] | null
          phase_durations?: Json | null
          related_services?: string[] | null
          required_documents?: string[] | null
          required_fields?: string[] | null
          right_type: string
          skippable_phases?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          applicable_phases?: string[] | null
          auto_deadlines?: string[] | null
          base_official_fee?: number | null
          base_professional_fee?: number | null
          category_id?: string | null
          code?: string
          created_at?: string | null
          currency?: string | null
          description_en?: string | null
          description_es?: string | null
          display_order?: number | null
          fee_notes?: string | null
          id?: string
          initial_phase?: string
          internal_notes?: string | null
          international_system?: string | null
          is_active?: boolean | null
          jurisdiction_id?: string | null
          name_en?: string
          name_es?: string
          optional_fields?: string[] | null
          phase_durations?: Json | null
          related_services?: string[] | null
          required_documents?: string[] | null
          required_fields?: string[] | null
          right_type?: string
          skippable_phases?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_templates_jurisdiction_id_fkey"
            columns: ["jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "jurisdictions"
            referencedColumns: ["id"]
          },
        ]
      }
      services_catalog: {
        Row: {
          additional_class_fee_eur: number | null
          automation_level: number | null
          badge: string | null
          base_price: number | null
          category: string
          competitor_reference: string | null
          complexity: string | null
          created_at: string | null
          description_en: string | null
          discount_pct: number | null
          display_order: number | null
          display_price: number | null
          estimated_days_max: number | null
          estimated_time: string | null
          features: Json | null
          fee_type_link: string | null
          has_official_fee: boolean | null
          icon: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_recurring: boolean | null
          is_subscription: boolean | null
          is_visible_b2c: boolean | null
          is_visible_portal: boolean | null
          launch_status: string | null
          long_description: string | null
          min_days: number | null
          name: string
          name_en: string | null
          nice_class_dependent: boolean | null
          price_currency: string | null
          price_from: number | null
          price_includes_official_fee: boolean | null
          price_suffix: string | null
          pricing_model: string | null
          recurrence_period: string | null
          requires_jurisdiction: boolean | null
          requires_trademark: boolean | null
          service_type: string | null
          short_description: string | null
          slug: string
          subcategory: string | null
          target_audience: string | null
          territories: string[] | null
          updated_at: string | null
        }
        Insert: {
          additional_class_fee_eur?: number | null
          automation_level?: number | null
          badge?: string | null
          base_price?: number | null
          category: string
          competitor_reference?: string | null
          complexity?: string | null
          created_at?: string | null
          description_en?: string | null
          discount_pct?: number | null
          display_order?: number | null
          display_price?: number | null
          estimated_days_max?: number | null
          estimated_time?: string | null
          features?: Json | null
          fee_type_link?: string | null
          has_official_fee?: boolean | null
          icon?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_recurring?: boolean | null
          is_subscription?: boolean | null
          is_visible_b2c?: boolean | null
          is_visible_portal?: boolean | null
          launch_status?: string | null
          long_description?: string | null
          min_days?: number | null
          name: string
          name_en?: string | null
          nice_class_dependent?: boolean | null
          price_currency?: string | null
          price_from?: number | null
          price_includes_official_fee?: boolean | null
          price_suffix?: string | null
          pricing_model?: string | null
          recurrence_period?: string | null
          requires_jurisdiction?: boolean | null
          requires_trademark?: boolean | null
          service_type?: string | null
          short_description?: string | null
          slug: string
          subcategory?: string | null
          target_audience?: string | null
          territories?: string[] | null
          updated_at?: string | null
        }
        Update: {
          additional_class_fee_eur?: number | null
          automation_level?: number | null
          badge?: string | null
          base_price?: number | null
          category?: string
          competitor_reference?: string | null
          complexity?: string | null
          created_at?: string | null
          description_en?: string | null
          discount_pct?: number | null
          display_order?: number | null
          display_price?: number | null
          estimated_days_max?: number | null
          estimated_time?: string | null
          features?: Json | null
          fee_type_link?: string | null
          has_official_fee?: boolean | null
          icon?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_recurring?: boolean | null
          is_subscription?: boolean | null
          is_visible_b2c?: boolean | null
          is_visible_portal?: boolean | null
          launch_status?: string | null
          long_description?: string | null
          min_days?: number | null
          name?: string
          name_en?: string | null
          nice_class_dependent?: boolean | null
          price_currency?: string | null
          price_from?: number | null
          price_includes_official_fee?: boolean | null
          price_suffix?: string | null
          pricing_model?: string | null
          recurrence_period?: string | null
          requires_jurisdiction?: boolean | null
          requires_trademark?: boolean | null
          service_type?: string | null
          short_description?: string | null
          slug?: string
          subcategory?: string | null
          target_audience?: string | null
          territories?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      site_config: {
        Row: {
          config_key: string
          config_value: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value?: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
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
          selected_modules: string[] | null
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
          selected_modules?: string[] | null
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
          selected_modules?: string[] | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      surveillance_alerts: {
        Row: {
          alert_type: string | null
          created_at: string | null
          description: string | null
          id: string
          is_read: boolean | null
          severity: string | null
          subscription_id: string | null
          title: string | null
        }
        Insert: {
          alert_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          severity?: string | null
          subscription_id?: string | null
          title?: string | null
        }
        Update: {
          alert_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          severity?: string | null
          subscription_id?: string | null
          title?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      template_categories: {
        Row: {
          code: string
          created_at: string | null
          description_es: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_en: string | null
          name_es: string
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description_es?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_en?: string | null
          name_es: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description_es?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_en?: string | null
          name_es?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      template_field_validations: {
        Row: {
          auto_fill_from: string | null
          created_at: string | null
          display_order: number | null
          error_message_en: string | null
          error_message_es: string | null
          field_group: string | null
          field_label_en: string | null
          field_label_es: string
          field_name: string
          field_type: string
          id: string
          is_required: boolean | null
          max_length: number | null
          min_length: number | null
          options: Json | null
          template_id: string | null
          validation_regex: string | null
        }
        Insert: {
          auto_fill_from?: string | null
          created_at?: string | null
          display_order?: number | null
          error_message_en?: string | null
          error_message_es?: string | null
          field_group?: string | null
          field_label_en?: string | null
          field_label_es: string
          field_name: string
          field_type?: string
          id?: string
          is_required?: boolean | null
          max_length?: number | null
          min_length?: number | null
          options?: Json | null
          template_id?: string | null
          validation_regex?: string | null
        }
        Update: {
          auto_fill_from?: string | null
          created_at?: string | null
          display_order?: number | null
          error_message_en?: string | null
          error_message_es?: string | null
          field_group?: string | null
          field_label_en?: string | null
          field_label_es?: string
          field_name?: string
          field_type?: string
          id?: string
          is_required?: boolean | null
          max_length?: number | null
          min_length?: number | null
          options?: Json | null
          template_id?: string | null
          validation_regex?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_field_validations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      trademark_searches: {
        Row: {
          approval_probability: number | null
          claimed_at: string | null
          claimed_by_user_id: string | null
          conflicts_count: number | null
          created_at: string | null
          email: string | null
          exact_matches: number | null
          id: string
          is_paid: boolean | null
          jurisdiction: string | null
          paid_at: string | null
          payment_amount: number | null
          query: string | null
          recommendation: string | null
          report_html_url: string | null
          report_number: string | null
          report_pdf_url: string | null
          risk_level: string | null
          risk_score: number | null
          search_results: Json | null
          search_type: string | null
          similar_matches: number | null
          stripe_session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approval_probability?: number | null
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          conflicts_count?: number | null
          created_at?: string | null
          email?: string | null
          exact_matches?: number | null
          id?: string
          is_paid?: boolean | null
          jurisdiction?: string | null
          paid_at?: string | null
          payment_amount?: number | null
          query?: string | null
          recommendation?: string | null
          report_html_url?: string | null
          report_number?: string | null
          report_pdf_url?: string | null
          risk_level?: string | null
          risk_score?: number | null
          search_results?: Json | null
          search_type?: string | null
          similar_matches?: number | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approval_probability?: number | null
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          conflicts_count?: number | null
          created_at?: string | null
          email?: string | null
          exact_matches?: number | null
          id?: string
          is_paid?: boolean | null
          jurisdiction?: string | null
          paid_at?: string | null
          payment_amount?: number | null
          query?: string | null
          recommendation?: string | null
          report_html_url?: string | null
          report_number?: string | null
          report_pdf_url?: string | null
          risk_level?: string | null
          risk_score?: number | null
          search_results?: Json | null
          search_type?: string | null
          similar_matches?: number | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      user_jurisdiction_preferences: {
        Row: {
          created_at: string | null
          id: string
          office_id: string
          sort_order: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          office_id: string
          sort_order?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          office_id?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_template_preferences: {
        Row: {
          auto_disclaimer: boolean | null
          created_at: string | null
          default_template_id: string | null
          id: string
          preferred_jurisdiction: string | null
          preferred_language: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_disclaimer?: boolean | null
          created_at?: string | null
          default_template_id?: string | null
          id?: string
          preferred_jurisdiction?: string | null
          preferred_language?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_disclaimer?: boolean | null
          created_at?: string | null
          default_template_id?: string | null
          id?: string
          preferred_jurisdiction?: string | null
          preferred_language?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vienna_categories: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          title_en: string | null
          title_es: string
          version: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title_en?: string | null
          title_es: string
          version?: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title_en?: string | null
          title_es?: string
          version?: string
        }
        Relationships: []
      }
      vienna_divisions: {
        Row: {
          category_id: string
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          title_en: string | null
          title_es: string
          version: string
        }
        Insert: {
          category_id: string
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title_en?: string | null
          title_es: string
          version?: string
        }
        Update: {
          category_id?: string
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title_en?: string | null
          title_es?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "vienna_divisions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vienna_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      vienna_sections: {
        Row: {
          auxiliary_code: string | null
          code: string
          created_at: string | null
          division_id: string
          id: string
          is_active: boolean | null
          title_en: string | null
          title_es: string
          version: string
        }
        Insert: {
          auxiliary_code?: string | null
          code: string
          created_at?: string | null
          division_id: string
          id?: string
          is_active?: boolean | null
          title_en?: string | null
          title_es: string
          version?: string
        }
        Update: {
          auxiliary_code?: string | null
          code?: string
          created_at?: string | null
          division_id?: string
          id?: string
          is_active?: boolean | null
          title_en?: string | null
          title_es?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "vienna_sections_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vienna_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ai_provider_health: {
        Row: {
          check_type: string | null
          checked_at: string | null
          created_at: string | null
          error_code: string | null
          error_message: string | null
          execution_id: string | null
          id: string | null
          is_healthy: boolean | null
          latency_ms: number | null
          provider_id: string | null
        }
        Insert: {
          check_type?: string | null
          checked_at?: string | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          execution_id?: string | null
          id?: string | null
          is_healthy?: boolean | null
          latency_ms?: number | null
          provider_id?: string | null
        }
        Update: {
          check_type?: string | null
          checked_at?: string | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          execution_id?: string | null
          id?: string | null
          is_healthy?: boolean | null
          latency_ms?: number | null
          provider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_provider_health_log_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          chat_message_id: string | null
          chat_session_id: string | null
          cost_total_cents: number | null
          created_at: string | null
          id: string | null
          latency_ms: number | null
          model_id: string | null
          provider_code: string | null
          status: string | null
          task_category: string | null
          tokens_input: number | null
          tokens_output: number | null
          user_id: string | null
        }
        Insert: {
          chat_message_id?: string | null
          chat_session_id?: string | null
          cost_total_cents?: number | null
          created_at?: string | null
          id?: string | null
          latency_ms?: number | null
          model_id?: string | null
          provider_code?: string | null
          status?: string | null
          task_category?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Update: {
          chat_message_id?: string | null
          chat_session_id?: string | null
          cost_total_cents?: number | null
          created_at?: string | null
          id?: string | null
          latency_ms?: number | null
          model_id?: string | null
          provider_code?: string | null
          status?: string | null
          task_category?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
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
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string | null
          category_id: string | null
          content: string | null
          content_es: string | null
          cover_image: string | null
          created_at: string | null
          excerpt: string | null
          excerpt_es: string | null
          id: string | null
          is_featured: boolean | null
          is_published: boolean | null
          language: string | null
          published_at: string | null
          read_time_minutes: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          status: string | null
          summary: string | null
          tags: string[] | null
          title: string | null
          title_es: string | null
          translations: Json | null
          updated_at: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "help_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_nice_classification: {
        Row: {
          class_number: number | null
          class_type: string | null
          icon: string | null
          title_en: string | null
          title_es: string | null
        }
        Insert: {
          class_number?: number | null
          class_type?: string | null
          icon?: string | null
          title_en?: string | null
          title_es?: string | null
        }
        Update: {
          class_number?: number | null
          class_type?: string | null
          icon?: string | null
          title_en?: string | null
          title_es?: string | null
        }
        Relationships: []
      }
      ip_offices: {
        Row: {
          address: string | null
          api_authentication_type: string | null
          api_base_url: string | null
          api_credentials: Json | null
          api_documentation_url: string | null
          api_sandbox_available: boolean | null
          api_type: string | null
          api_url: string | null
          api_version: string | null
          auth_type: string | null
          automation_level: string | null
          automation_percentage: number | null
          avg_days_to_decision: number | null
          avg_response_time_ms: number | null
          capabilities: Json | null
          code: string | null
          code_alt: string | null
          common_rejection_reasons: Json | null
          connection_config: Json | null
          connection_status: string | null
          country_code: string | null
          country_flag: string | null
          country_name: string | null
          created_at: string | null
          currency: string | null
          data_confidence: string | null
          data_last_verified_at: string | null
          data_last_verified_by: string | null
          data_source_config: Json | null
          data_source_notes: string | null
          data_source_type: string | null
          display_order: number | null
          e_filing_available: boolean | null
          e_filing_url: string | null
          email_general: string | null
          examiner_patterns: Json | null
          fees_url: string | null
          flag: string | null
          flag_emoji: string | null
          has_api: boolean | null
          id: string | null
          insights_updated_at: string | null
          internal_notes: string | null
          ip_types: string[] | null
          is_active: boolean | null
          is_connected: boolean | null
          languages: string[] | null
          last_health_check: string | null
          last_interaction_at: string | null
          last_sync_at: string | null
          last_sync_status: string | null
          last_sync_type: string | null
          member_madrid_protocol: boolean | null
          name: string | null
          name_en: string | null
          name_es: string | null
          name_official: string | null
          name_short: string | null
          next_review_date: string | null
          nice_version: string | null
          notes: string | null
          office_acronym: string | null
          office_type: string | null
          online_payment: boolean | null
          operational_status: string | null
          paris_convention_member: boolean | null
          payment_methods: Json | null
          phone_general: string | null
          priority_score: number | null
          product_id: string | null
          rate_limit_per_day: number | null
          rate_limit_per_minute: number | null
          region: string | null
          search_url: string | null
          status: string | null
          success_rate_approvals: number | null
          support_email: string | null
          support_phone: string | null
          supported_mark_types: Json | null
          supports_documents: boolean | null
          supports_events: boolean | null
          supports_fees: boolean | null
          supports_search: boolean | null
          supports_status: boolean | null
          sync_frequency: string | null
          tier: number | null
          timezone: string | null
          tm_estimated_registration_months: number | null
          tm_multi_class: boolean | null
          tm_online_filing_url: string | null
          tm_opposition_period_days: number | null
          tm_registration_duration_years: number | null
          tm_search_url: string | null
          tm_use_requirement: boolean | null
          total_filings_tracked: number | null
          updated_at: string | null
          uses_nice_classification: boolean | null
          website_official: string | null
          website_search: string | null
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          api_authentication_type?: string | null
          api_base_url?: string | null
          api_credentials?: Json | null
          api_documentation_url?: string | null
          api_sandbox_available?: boolean | null
          api_type?: string | null
          api_url?: string | null
          api_version?: string | null
          auth_type?: string | null
          automation_level?: string | null
          automation_percentage?: number | null
          avg_days_to_decision?: number | null
          avg_response_time_ms?: number | null
          capabilities?: Json | null
          code?: string | null
          code_alt?: string | null
          common_rejection_reasons?: Json | null
          connection_config?: Json | null
          connection_status?: string | null
          country_code?: string | null
          country_flag?: string | null
          country_name?: string | null
          created_at?: string | null
          currency?: string | null
          data_confidence?: string | null
          data_last_verified_at?: string | null
          data_last_verified_by?: string | null
          data_source_config?: Json | null
          data_source_notes?: string | null
          data_source_type?: string | null
          display_order?: number | null
          e_filing_available?: boolean | null
          e_filing_url?: string | null
          email_general?: string | null
          examiner_patterns?: Json | null
          fees_url?: string | null
          flag?: string | null
          flag_emoji?: string | null
          has_api?: boolean | null
          id?: string | null
          insights_updated_at?: string | null
          internal_notes?: string | null
          ip_types?: string[] | null
          is_active?: boolean | null
          is_connected?: boolean | null
          languages?: string[] | null
          last_health_check?: string | null
          last_interaction_at?: string | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          last_sync_type?: string | null
          member_madrid_protocol?: boolean | null
          name?: string | null
          name_en?: string | null
          name_es?: string | null
          name_official?: string | null
          name_short?: string | null
          next_review_date?: string | null
          nice_version?: string | null
          notes?: string | null
          office_acronym?: string | null
          office_type?: string | null
          online_payment?: boolean | null
          operational_status?: string | null
          paris_convention_member?: boolean | null
          payment_methods?: Json | null
          phone_general?: string | null
          priority_score?: number | null
          product_id?: string | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          region?: string | null
          search_url?: string | null
          status?: string | null
          success_rate_approvals?: number | null
          support_email?: string | null
          support_phone?: string | null
          supported_mark_types?: Json | null
          supports_documents?: boolean | null
          supports_events?: boolean | null
          supports_fees?: boolean | null
          supports_search?: boolean | null
          supports_status?: boolean | null
          sync_frequency?: string | null
          tier?: number | null
          timezone?: string | null
          tm_estimated_registration_months?: number | null
          tm_multi_class?: boolean | null
          tm_online_filing_url?: string | null
          tm_opposition_period_days?: number | null
          tm_registration_duration_years?: number | null
          tm_search_url?: string | null
          tm_use_requirement?: boolean | null
          total_filings_tracked?: number | null
          updated_at?: string | null
          uses_nice_classification?: boolean | null
          website_official?: string | null
          website_search?: string | null
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          api_authentication_type?: string | null
          api_base_url?: string | null
          api_credentials?: Json | null
          api_documentation_url?: string | null
          api_sandbox_available?: boolean | null
          api_type?: string | null
          api_url?: string | null
          api_version?: string | null
          auth_type?: string | null
          automation_level?: string | null
          automation_percentage?: number | null
          avg_days_to_decision?: number | null
          avg_response_time_ms?: number | null
          capabilities?: Json | null
          code?: string | null
          code_alt?: string | null
          common_rejection_reasons?: Json | null
          connection_config?: Json | null
          connection_status?: string | null
          country_code?: string | null
          country_flag?: string | null
          country_name?: string | null
          created_at?: string | null
          currency?: string | null
          data_confidence?: string | null
          data_last_verified_at?: string | null
          data_last_verified_by?: string | null
          data_source_config?: Json | null
          data_source_notes?: string | null
          data_source_type?: string | null
          display_order?: number | null
          e_filing_available?: boolean | null
          e_filing_url?: string | null
          email_general?: string | null
          examiner_patterns?: Json | null
          fees_url?: string | null
          flag?: string | null
          flag_emoji?: string | null
          has_api?: boolean | null
          id?: string | null
          insights_updated_at?: string | null
          internal_notes?: string | null
          ip_types?: string[] | null
          is_active?: boolean | null
          is_connected?: boolean | null
          languages?: string[] | null
          last_health_check?: string | null
          last_interaction_at?: string | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          last_sync_type?: string | null
          member_madrid_protocol?: boolean | null
          name?: string | null
          name_en?: string | null
          name_es?: string | null
          name_official?: string | null
          name_short?: string | null
          next_review_date?: string | null
          nice_version?: string | null
          notes?: string | null
          office_acronym?: string | null
          office_type?: string | null
          online_payment?: boolean | null
          operational_status?: string | null
          paris_convention_member?: boolean | null
          payment_methods?: Json | null
          phone_general?: string | null
          priority_score?: number | null
          product_id?: string | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          region?: string | null
          search_url?: string | null
          status?: string | null
          success_rate_approvals?: number | null
          support_email?: string | null
          support_phone?: string | null
          supported_mark_types?: Json | null
          supports_documents?: boolean | null
          supports_events?: boolean | null
          supports_fees?: boolean | null
          supports_search?: boolean | null
          supports_status?: boolean | null
          sync_frequency?: string | null
          tier?: number | null
          timezone?: string | null
          tm_estimated_registration_months?: number | null
          tm_multi_class?: boolean | null
          tm_online_filing_url?: string | null
          tm_opposition_period_days?: number | null
          tm_registration_duration_years?: number | null
          tm_search_url?: string | null
          tm_use_requirement?: boolean | null
          total_filings_tracked?: number | null
          updated_at?: string | null
          uses_nice_classification?: boolean | null
          website_official?: string | null
          website_search?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      v_crm_clients: {
        Row: {
          country: string | null
          created_at: string | null
          email: string | null
          id: string | null
          last_order_at: string | null
          last_service: string | null
          name: string | null
          order_count: number | null
          phone: string | null
          segment: string | null
          source: string | null
          status: string | null
          total_spent: number | null
          trademarks_registered: number | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          last_order_at?: string | null
          last_service?: never
          name?: string | null
          order_count?: number | null
          phone?: string | null
          segment?: string | null
          source?: string | null
          status?: string | null
          total_spent?: number | null
          trademarks_registered?: never
        }
        Update: {
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          last_order_at?: string | null
          last_service?: never
          name?: string | null
          order_count?: number | null
          phone?: string | null
          segment?: string | null
          source?: string | null
          status?: string | null
          total_spent?: number | null
          trademarks_registered?: never
        }
        Relationships: []
      }
      v_data_freshness_alerts: {
        Row: {
          country_name: string | null
          days_since_verification: number | null
          flag_emoji: string | null
          freshness_status: string | null
          office_code: string | null
          office_data_confidence: string | null
          office_name: string | null
          price_confidence: string | null
          ub_price: number | null
        }
        Relationships: []
      }
      v_demand_signals_summary: {
        Row: {
          jurisdiction_code: string | null
          last_signal_at: string | null
          service_key: string | null
          signal_types: string[] | null
          source_count: number | null
          total_signals: number | null
        }
        Relationships: []
      }
      v_filing_requirements: {
        Row: {
          allows_multiclass: boolean | null
          attachment_format: string | null
          attachment_max_size_mb: number | null
          attachment_notes: string | null
          auth_method: string | null
          auth_notes: string | null
          community_rules: string | null
          country_code: string | null
          country_name: string | null
          created_at: string | null
          data_confidence: string | null
          data_last_verified_at: string | null
          data_last_verified_by: string | null
          data_source: string | null
          discount_efiling_pct: number | null
          discount_other: string | null
          discount_sme_notes: string | null
          discount_sme_pct: number | null
          fee_additional_class: number | null
          fee_additional_class_currency: string | null
          fee_additional_class_notes: string | null
          fee_first_class: number | null
          fee_first_class_currency: string | null
          fee_includes_classes: number | null
          fee_notes: string | null
          filing_language: string | null
          filing_language_name: string | null
          foreign_representative_required: boolean | null
          foreign_representative_type: string | null
          form_code: string | null
          id: string | null
          ipo_office_id: string | null
          logo_formats: string[] | null
          logo_max_dimensions: string | null
          logo_max_size_mb: number | null
          logo_min_dpi: number | null
          logo_notes: string | null
          multiclass_notes: string | null
          needs_review: boolean | null
          office_acronym: string | null
          office_type: string | null
          opposition_period_days: number | null
          opposition_period_extendable: boolean | null
          opposition_period_notes: string | null
          opposition_period_type: string | null
          platform_name: string | null
          platform_url: string | null
          poa_apostille_required: boolean | null
          poa_foreign_required: boolean | null
          poa_notes: string | null
          power_of_attorney_required: boolean | null
          reform_notes: string | null
          renewal_from: string | null
          renewal_grace_months: number | null
          renewal_surcharge_notes: string | null
          renewal_years: number | null
          review_notes: string | null
          second_language_options: string[] | null
          second_language_required: boolean | null
          special_notes: string | null
          translation_requirement: string | null
          updated_at: string | null
          use_declaration_at_renewal: boolean | null
          use_declaration_consequence: string | null
          use_declaration_deadline: string | null
          use_declaration_periodic: boolean | null
          use_declaration_required: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "jurisdiction_filing_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ip_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_filing_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "ipo_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_filing_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_ipo_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jurisdiction_filing_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_office_directory"
            referencedColumns: ["office_id"]
          },
          {
            foreignKeyName: "jurisdiction_filing_requirements_ipo_office_id_fkey"
            columns: ["ipo_office_id"]
            isOneToOne: false
            referencedRelation: "v_pricing_by_office"
            referencedColumns: ["office_id"]
          },
        ]
      }
      v_ipo_completeness: {
        Row: {
          automation_level: string | null
          avg_days_to_decision: number | null
          code: string | null
          completeness_score: number | null
          country_name: string | null
          currency: string | null
          data_confidence: string | null
          data_last_verified_at: string | null
          e_filing_available: boolean | null
          fee_history_count: number | null
          flag_emoji: string | null
          id: string | null
          market_intel_count: number | null
          member_madrid_protocol: boolean | null
          office_acronym: string | null
          procedures_count: number | null
          region: string | null
          rejection_patterns_count: number | null
          success_rate_approvals: number | null
          tm_class_extra_fee: number | null
          tm_estimated_registration_months: number | null
          tm_filing_fee: number | null
          tm_opposition_fee: number | null
          tm_opposition_period_days: number | null
          tm_renewal_fee: number | null
        }
        Insert: {
          automation_level?: string | null
          avg_days_to_decision?: number | null
          code?: string | null
          completeness_score?: never
          country_name?: string | null
          currency?: string | null
          data_confidence?: string | null
          data_last_verified_at?: string | null
          e_filing_available?: boolean | null
          fee_history_count?: never
          flag_emoji?: string | null
          id?: string | null
          market_intel_count?: never
          member_madrid_protocol?: boolean | null
          office_acronym?: string | null
          procedures_count?: never
          region?: string | null
          rejection_patterns_count?: never
          success_rate_approvals?: number | null
          tm_class_extra_fee?: number | null
          tm_estimated_registration_months?: number | null
          tm_filing_fee?: number | null
          tm_opposition_fee?: number | null
          tm_opposition_period_days?: number | null
          tm_renewal_fee?: number | null
        }
        Update: {
          automation_level?: string | null
          avg_days_to_decision?: number | null
          code?: string | null
          completeness_score?: never
          country_name?: string | null
          currency?: string | null
          data_confidence?: string | null
          data_last_verified_at?: string | null
          e_filing_available?: boolean | null
          fee_history_count?: never
          flag_emoji?: string | null
          id?: string | null
          market_intel_count?: never
          member_madrid_protocol?: boolean | null
          office_acronym?: string | null
          procedures_count?: never
          region?: string | null
          rejection_patterns_count?: never
          success_rate_approvals?: number | null
          tm_class_extra_fee?: number | null
          tm_estimated_registration_months?: number | null
          tm_filing_fee?: number | null
          tm_opposition_fee?: number | null
          tm_opposition_period_days?: number | null
          tm_renewal_fee?: number | null
        }
        Relationships: []
      }
      v_office_directory: {
        Row: {
          additional_class_price: number | null
          automation_level: string | null
          automation_percentage: number | null
          avg_days_to_decision: number | null
          connection_status: string | null
          country_code: string | null
          country_name: string | null
          data_completeness: string | null
          days_since_verification: number | null
          e_filing_available: boolean | null
          email_general: string | null
          estimated_time: string | null
          fee_source_url: string | null
          flag_emoji: string | null
          freshness_status: string | null
          has_api: boolean | null
          is_active: boolean | null
          is_connected: boolean | null
          last_interaction_at: string | null
          member_madrid_protocol: boolean | null
          name_short: string | null
          office_acronym: string | null
          office_code: string | null
          office_data_confidence: string | null
          office_id: string | null
          office_name: string | null
          office_next_review: string | null
          office_status: string | null
          office_type: string | null
          office_updated_at: string | null
          office_verified_at: string | null
          office_verified_by: string | null
          official_fee: number | null
          official_fee_currency: string | null
          online_payment: boolean | null
          paris_convention_member: boolean | null
          phone_general: string | null
          price_confidence: string | null
          price_verified_at: string | null
          pricing_id: string | null
          pricing_updated_at: string | null
          priority_score: number | null
          region: string | null
          service_name: string | null
          success_rate_approvals: number | null
          support_email: string | null
          tier: number | null
          tm_estimated_registration_months: number | null
          tm_multi_class: boolean | null
          tm_opposition_period_days: number | null
          tm_registration_duration_years: number | null
          tm_use_requirement: boolean | null
          total_filings_tracked: number | null
          ub_currency: string | null
          ub_price: number | null
          website_official: string | null
        }
        Relationships: []
      }
      v_pricing_by_office: {
        Row: {
          additional_class_price: number | null
          automation_level: string | null
          base_price: number | null
          country_code: string | null
          currency: string | null
          estimated_time: string | null
          fee_source_url: string | null
          flag_emoji: string | null
          office_code: string | null
          office_id: string | null
          office_name: string | null
          official_fee: number | null
          official_fee_currency: string | null
          price_confidence: string | null
          price_last_verified_at: string | null
          pricing_active: boolean | null
          pricing_id: string | null
          region: string | null
          service_name: string | null
          service_type: string | null
          tm_estimated_registration_months: number | null
          tm_opposition_period_days: number | null
        }
        Relationships: []
      }
      v_pricing_config: {
        Row: {
          additional_class_price: number | null
          agent_cost: number | null
          agent_notes: string | null
          agent_partner_id: string | null
          base_price_eur: number | null
          base_price_usd: number | null
          beneficio_neto: number | null
          beneficio_pct: number | null
          client_price: number | null
          currency: string | null
          default_partner_id: string | null
          default_partner_name: string | null
          description: string | null
          description_en: string | null
          description_pt: string | null
          flag: string | null
          has_local_agent: boolean | null
          honorarios: number | null
          honorarios_eur: number | null
          honorarios_usd: number | null
          id: string | null
          ipo_office_id: string | null
          is_active: boolean | null
          jurisdiction_code: string | null
          jurisdiction_default_partner_id: string | null
          jurisdiction_name: string | null
          official_fee: number | null
          official_fee_eur: number | null
          official_fee_usd: number | null
          partner_source: string | null
          price_confidence: string | null
          price_currency: string | null
          price_last_verified_at: string | null
          reference_code: string | null
          resolved_partner_id: string | null
          resolved_partner_name: string | null
          service_catalog_id: string | null
          service_category: string | null
          service_name: string | null
          service_partner_name: string | null
          service_type: string | null
          show_on_pricing_page: boolean | null
          show_on_services_page: boolean | null
          show_on_wizard: boolean | null
          visible_on_web: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_offices_default_partner_id_fkey"
            columns: ["default_partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipo_offices_default_partner_id_fkey"
            columns: ["jurisdiction_default_partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_services_agent_partner_id_fkey"
            columns: ["agent_partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_services_service_catalog_id_fkey"
            columns: ["service_catalog_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      v_recent_changes: {
        Row: {
          change_reason: string | null
          change_source: string | null
          changed_at: string | null
          changed_by: string | null
          field_name: string | null
          new_value: string | null
          office_code: string | null
          old_value: string | null
          record_name: string | null
          table_name: string | null
        }
        Relationships: []
      }
      v_system_health: {
        Row: {
          check_type: string | null
          detail: string | null
          item_name: string | null
          severity: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _crm_seed_default_email_templates: {
        Args: { p_organization_id: string }
        Returns: number
      }
      _crm_seed_default_whatsapp_templates: {
        Args: { p_organization_id: string }
        Returns: number
      }
      add_telephony_minutes: {
        Args: { p_minutes: number; p_sms?: number; p_tenant_id: string }
        Returns: boolean
      }
      admin_change_organization_plan: {
        Args: {
          p_billing_cycle?: string
          p_organization_id: string
          p_pack_code: string
        }
        Returns: Json
      }
      advance_matter_phase: {
        Args: {
          p_matter_id: string
          p_new_phase: string
          p_notes?: string
          p_user_id?: string
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
      ai_get_global_metrics: { Args: never; Returns: Json }
      ai_get_models: { Args: { p_include_inactive?: boolean }; Returns: Json }
      ai_get_organization_context: { Args: { p_org_id: string }; Returns: Json }
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
      ai_search_knowledge: {
        Args: { p_category?: string; p_limit?: number; p_query: string }
        Returns: {
          category: string
          content: string
          id: string
          relevance: number
          title: string
        }[]
      }
      apply_docket_rules: { Args: { matter_uuid: string }; Returns: number }
      approve_lead: {
        Args: {
          p_deal_title?: string
          p_deal_value?: number
          p_lead_id: string
        }
        Returns: Json
      }
      approve_workflow: {
        Args: { p_queue_id: string; p_user_id: string }
        Returns: boolean
      }
      assign_automatic_badges: { Args: never; Returns: undefined }
      audit_get_table_stats: {
        Args: never
        Returns: {
          column_count: number
          rls_enabled: boolean
          row_count: number
          table_name: string
          table_size: string
        }[]
      }
      auto_fix_production: {
        Args: never
        Returns: {
          action_taken: string
          detail: string
          item_name: string
        }[]
      }
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
      calculate_ai_cost: {
        Args: {
          p_input_tokens: number
          p_model_id: string
          p_output_tokens: number
        }
        Returns: number
      }
      calculate_ai_cost_cents: {
        Args: {
          p_input_tokens: number
          p_model_id: string
          p_output_tokens: number
        }
        Returns: number
      }
      calculate_check_digit: { Args: { p_input: string }; Returns: string }
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
      calculate_invoice_vat_breakdown: {
        Args: { p_invoice_id: string }
        Returns: Json
      }
      calculate_kyc_level: { Args: { p_user_id: string }; Returns: number }
      calculate_risk_window: { Args: { p_pattern_id: string }; Returns: string }
      calculate_trademark_similarity: {
        Args: { term_a: string; term_b: string }
        Returns: Record<string, unknown>
      }
      calculate_validity_status: {
        Args: { valid_until: string }
        Returns: Database["public"]["Enums"]["doc_validity_status"]
      }
      can_task_publish: {
        Args: { p_task_id: string }
        Returns: {
          can_publish: boolean
          failed_suites: string[]
          passed_suites: number
          reason: string
          required_suites: number
        }[]
      }
      change_matter_phase: {
        Args: {
          p_matter_id: string
          p_new_phase: string
          p_notes?: string
          p_reason?: string
          p_user_id?: string
        }
        Returns: Json
      }
      change_prompt_status: {
        Args: {
          p_new_status: string
          p_notes?: string
          p_prompt_id: string
          p_user_id?: string
        }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      check_budget_before_execution: {
        Args: {
          p_estimated_cost: number
          p_task_code: string
          p_tenant_id: string
        }
        Returns: {
          action: string
          can_execute: boolean
          daily_remaining: number
          monthly_remaining: number
          reason: string
          suggested_model: string
        }[]
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
      check_nice_classes_review: {
        Args: never
        Returns: {
          class_number: number
          last_reviewed_at: string
          title_es: string
        }[]
      }
      check_production_health: {
        Args: never
        Returns: {
          check_type: string
          detail: string
          item_name: string
          severity: string
        }[]
      }
      check_user_permission: {
        Args: {
          _organization_id: string
          _permission_code: string
          _user_id: string
        }
        Returns: boolean
      }
      clean_all_demo_tenants: { Args: never; Returns: Json }
      clean_demo_tenant_data: { Args: { p_tenant_id?: string }; Returns: Json }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      comp_check_fee_expiry: {
        Args: never
        Returns: {
          days_remaining: number
          fee_valid_until: string
          jurisdiction: string
          office: string
        }[]
      }
      comp_update_price_ranges_from_market: { Args: never; Returns: undefined }
      compare_prompt_versions: {
        Args: { p_version_a_id: string; p_version_b_id: string }
        Returns: {
          field_name: string
          is_different: boolean
          version_a_value: string
          version_b_value: string
        }[]
      }
      complete_test_run: { Args: { p_run_id: string }; Returns: boolean }
      create_alert: {
        Args: {
          p_alert_data?: Json
          p_alert_type: string
          p_event_id?: string
          p_message?: string
          p_organization_id?: string
          p_title: string
        }
        Returns: string
      }
      create_lead_from_form: {
        Args: {
          p_appointment_id?: string
          p_brand_name?: string
          p_company?: string
          p_country?: string
          p_email: string
          p_full_name: string
          p_jurisdictions?: Json
          p_message?: string
          p_metadata?: Json
          p_patent_title?: string
          p_phone?: string
          p_service_interest?: string
          p_source: string
        }
        Returns: {
          appointment_id: string | null
          assigned_to: string | null
          brand_name: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string
          form_type: string | null
          full_name: string | null
          id: string
          is_read: boolean
          jurisdictions: Json | null
          message: string | null
          metadata: Json | null
          notes: string | null
          patent_title: string | null
          phone: string | null
          priority: string
          read_at: string | null
          service_interest: string | null
          source: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "leads"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_prompt_version: {
        Args: { p_created_by?: string; p_prompt_id: string }
        Returns: string
      }
      create_voip_call: {
        Args: {
          p_call_sid: string
          p_direction: string
          p_from_number: string
          p_organization_id: string
          p_to_number: string
          p_user_id?: string
        }
        Returns: string
      }
      crm_activate_automation_template: {
        Args: { p_organization_id: string; p_template_code: string }
        Returns: string
      }
      crm_assert_org_member: {
        Args: { p_organization_id: string }
        Returns: undefined
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
      crm_initialize_communication_templates: {
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
      crm_seed_default_email_templates: {
        Args: { p_organization_id: string }
        Returns: number
      }
      crm_seed_default_pipeline: { Args: { p_org_id: string }; Returns: string }
      crm_seed_default_whatsapp_templates: {
        Args: { p_organization_id: string }
        Returns: number
      }
      daitch_mokotoff: { Args: { "": string }; Returns: string[] }
      days_until_expiry: { Args: { expiry_date: string }; Returns: number }
      deduct_telephony_minutes: {
        Args: { p_minutes: number; p_tenant_id: string; p_usage_type?: string }
        Returns: boolean
      }
      delete_lead: {
        Args: { p_lead_id: string; p_reason?: string; p_user_id?: string }
        Returns: Json
      }
      dmetaphone: { Args: { "": string }; Returns: string }
      dmetaphone_alt: { Args: { "": string }; Returns: string }
      estimate_execution_cost: {
        Args: {
          p_estimated_input_tokens: number
          p_estimated_output_tokens?: number
          p_model_code: string
        }
        Returns: number
      }
      evaluate_signature_policy: {
        Args: {
          p_document_type: string
          p_jurisdiction?: string
          p_office_code?: string
        }
        Returns: Json
      }
      expire_trials: { Args: never; Returns: number }
      generate_client_number: {
        Args: { p_organization_id: string }
        Returns: string
      }
      generate_client_token:
        | { Args: { p_organization_id: string }; Returns: string }
        | {
            Args: { p_client_name: string; p_organization_id: string }
            Returns: string
          }
      generate_deal_number: {
        Args: { p_organization_id: string }
        Returns: string
      }
      generate_document_number: {
        Args: { p_organization_id: string }
        Returns: string
      }
      generate_holder_code: {
        Args: { p_organization_id: string }
        Returns: string
      }
      generate_internal_reference: {
        Args: {
          p_client_code?: string
          p_jurisdiction_code?: string
          p_organization_id: string
          p_type_code: string
        }
        Returns: string
      }
      generate_matter_number:
        | {
            Args: {
              p_client_id?: string
              p_jurisdiction_code: string
              p_matter_type: string
              p_organization_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_client_id?: string
              p_jurisdiction_code: string
              p_organization_id: string
              p_type_code: string
            }
            Returns: string
          }
      generate_office_chunk_text: {
        Args: { office_id_param: string }
        Returns: string
      }
      generate_optimization_suggestions: { Args: never; Returns: number }
      generate_order_number: { Args: never; Returns: string }
      generate_signature_request_number: {
        Args: { p_organization_id: string }
        Returns: string
      }
      generate_voip_invoices_superadmin: {
        Args: { p_period_start: string; p_tax_rate?: number }
        Returns: {
          invoice_id: string
        }[]
      }
      get_active_prompt: {
        Args: { p_model_code?: string; p_task_code: string }
        Returns: {
          output_format: string
          output_schema: Json
          prompt_id: string
          system_prompt: string
          tools_schema: Json
          user_prompt_template: string
          variables: Json
          version: number
        }[]
      }
      get_ai_cost_analytics: {
        Args: { p_days?: number; p_tenant_id?: string }
        Returns: {
          cost_by_model: Json
          cost_by_provider: Json
          cost_by_task: Json
          date: string
          total_cost: number
          total_executions: number
          total_tokens: number
        }[]
      }
      get_analytics_stats: {
        Args: { p_days?: number; p_organization_id: string }
        Returns: Json
      }
      get_api_key: { Args: { key_name: string }; Returns: string }
      get_api_key_hint: { Args: { p_provider_id: string }; Returns: string }
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
      get_automation_param_value: {
        Args: { p_param_key: string; p_tenant_automation_id: string }
        Returns: Json
      }
      get_crm_dashboard_stats: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      get_effective_subscription: { Args: never; Returns: string }
      get_effective_tenant_id: { Args: never; Returns: string }
      get_filing_requirements: {
        Args: { p_country_code: string }
        Returns: {
          allows_multiclass: boolean | null
          attachment_format: string | null
          attachment_max_size_mb: number | null
          attachment_notes: string | null
          auth_method: string | null
          auth_notes: string | null
          community_rules: string | null
          country_code: string | null
          country_name: string | null
          created_at: string | null
          data_confidence: string | null
          data_last_verified_at: string | null
          data_last_verified_by: string | null
          data_source: string | null
          discount_efiling_pct: number | null
          discount_other: string | null
          discount_sme_notes: string | null
          discount_sme_pct: number | null
          fee_additional_class: number | null
          fee_additional_class_currency: string | null
          fee_additional_class_notes: string | null
          fee_first_class: number | null
          fee_first_class_currency: string | null
          fee_includes_classes: number | null
          fee_notes: string | null
          filing_language: string | null
          filing_language_name: string | null
          foreign_representative_required: boolean | null
          foreign_representative_type: string | null
          form_code: string | null
          id: string | null
          ipo_office_id: string | null
          logo_formats: string[] | null
          logo_max_dimensions: string | null
          logo_max_size_mb: number | null
          logo_min_dpi: number | null
          logo_notes: string | null
          multiclass_notes: string | null
          needs_review: boolean | null
          office_acronym: string | null
          office_type: string | null
          opposition_period_days: number | null
          opposition_period_extendable: boolean | null
          opposition_period_notes: string | null
          opposition_period_type: string | null
          platform_name: string | null
          platform_url: string | null
          poa_apostille_required: boolean | null
          poa_foreign_required: boolean | null
          poa_notes: string | null
          power_of_attorney_required: boolean | null
          reform_notes: string | null
          renewal_from: string | null
          renewal_grace_months: number | null
          renewal_surcharge_notes: string | null
          renewal_years: number | null
          review_notes: string | null
          second_language_options: string[] | null
          second_language_required: boolean | null
          special_notes: string | null
          translation_requirement: string | null
          updated_at: string | null
          use_declaration_at_renewal: boolean | null
          use_declaration_consequence: string | null
          use_declaration_deadline: string | null
          use_declaration_periodic: boolean | null
          use_declaration_required: boolean | null
        }[]
        SetofOptions: {
          from: "*"
          to: "v_filing_requirements"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_inverse_relationship_type: {
        Args: { rel_type: string }
        Returns: string
      }
      get_kb_source_stats: {
        Args: never
        Returns: {
          active_sources: number
          avg_response_ms: number
          jurisdiction_code: string
          last_check: string
          pending_reviews: number
          sources_with_changes: number
          total_sources: number
        }[]
      }
      get_matter_current_holders: {
        Args: { p_matter_id: string }
        Returns: {
          holder_id: string
          holder_name: string
          is_primary: boolean
          party_role: string
          share_percentage: number
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
      get_next_document_number: {
        Args: {
          p_document_type?: string
          p_format?: string
          p_organization_id: string
        }
        Returns: string
      }
      get_next_invoice_number:
        | { Args: { p_org_id: string; p_prefix?: string }; Returns: string }
        | {
            Args: { p_org_id: string; p_series_code?: string }
            Returns: string
          }
      get_nice_class_item_count: {
        Args: { p_class_number: number }
        Returns: number
      }
      get_nice_statistics: {
        Args: never
        Returns: {
          current_version: string
          generic_terms: number
          product_classes: number
          service_classes: number
          total_classes: number
          total_items: number
        }[]
      }
      get_offices_with_plan_access: {
        Args: { p_plan: string }
        Returns: {
          automation_level: string
          automation_percentage: number
          capabilities: Json
          code: string
          country_code: string
          country_name: string
          flag_emoji: string
          has_access: boolean
          id: string
          last_sync_at: string
          name: string
          name_short: string
          operational_status: string
          region: string
        }[]
      }
      get_optimal_check_frequency: {
        Args: { p_office_id: string }
        Returns: number
      }
      get_organization_jurisdictions: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      get_portal_user_matters: {
        Args: { p_portal_user_id: string }
        Returns: {
          created_at: string
          deadline_count: number
          id: string
          ip_type: string
          jurisdiction: string
          reference: string
          status: string
          title: string
        }[]
      }
      get_portal_user_messages: {
        Args: { p_portal_user_id: string }
        Returns: {
          body: string
          created_at: string
          direction: string
          id: string
          matter_id: string
          matter_reference: string
          read_at: string
          sender_name: string
          status: string
          subject: string
          thread_id: string
        }[]
      }
      get_service_price: {
        Args: { p_office_code: string; p_service_slug: string }
        Returns: {
          class_extra_eur: number
          honorarios_eur: number
          margin_pct: number
          official_currency: string
          official_fee: number
          official_fee_eur: number
          service_name: string
          total_eur: number
        }[]
      }
      get_super_admin_mode: { Args: never; Returns: Json }
      get_super_admin_permissions: { Args: never; Returns: Json }
      get_task_routing: {
        Args: { p_task_code: string; p_tenant_id?: string }
        Returns: {
          backup_1_healthy: boolean
          backup_1_model_code: string
          backup_1_provider_code: string
          backup_2_healthy: boolean
          backup_2_model_code: string
          backup_2_provider_code: string
          max_tokens: number
          primary_healthy: boolean
          primary_model_code: string
          primary_provider_code: string
          task_code: string
          task_id: string
          temperature: number
          timeout_ms: number
        }[]
      }
      get_tenant_modules_summary: {
        Args: { p_tenant_id: string }
        Returns: Json
      }
      get_tenant_sidebar_menu: {
        Args: { p_organization_id: string }
        Returns: {
          is_licensed: boolean
          is_trial: boolean
          module_category: string
          module_code: string
          module_color: string
          module_coming_soon: boolean
          module_expanded: boolean
          module_icon: string
          module_icon_lucide: string
          module_menu_items: Json
          module_name: string
          module_order: number
          module_popular: boolean
          module_requires: string[]
          module_short_name: string
          section_always_visible: boolean
          section_code: string
          section_icon: string
          section_label: string
          section_name: string
          section_order: number
          trial_ends_at: string
        }[]
      }
      get_test_suite_stats: {
        Args: { p_suite_id: string }
        Returns: {
          avg_pass_rate: number
          golden_cases: number
          latest_pass_rate: number
          latest_run_id: string
          latest_run_passed: boolean
          latest_run_status: string
          total_cases: number
          total_runs: number
        }[]
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
      has_accepted_document: {
        Args: { p_doc_code: string; p_user_id: string }
        Returns: boolean
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hybrid_search_legal_chunks: {
        Args: {
          filter_chunk_types?: string[]
          filter_current_only?: boolean
          filter_jurisdiction?: string
          match_count?: number
          query_embedding: string
          query_text: string
          weight_fulltext?: number
          weight_fuzzy?: number
          weight_vector?: number
        }
        Returns: {
          chunk_type: string
          combined_score: number
          content: string
          fulltext_score: number
          fuzzy_score: number
          id: string
          match_method: string
          metadata: Json
          office_code: string
          vector_score: number
        }[]
      }
      increment_article_feedback: {
        Args: { p_article_id: string; p_is_helpful: boolean }
        Returns: undefined
      }
      increment_extraction_failures: {
        Args: { p_office_id: string }
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
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_staff: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_backoffice_admin: { Args: never; Returns: boolean }
      is_backoffice_staff: { Args: never; Returns: boolean }
      is_holiday: {
        Args: { check_date: string; country: string; region?: string }
        Returns: boolean
      }
      is_member_of_org: { Args: { org_id: string }; Returns: boolean }
      is_org_admin: { Args: { org_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
      kb_search_public: {
        Args: { p_category?: string; p_limit?: number; p_query: string }
        Returns: {
          category: string
          content: string
          id: string
          relevance: number
          title: string
        }[]
      }
      log_event: {
        Args: {
          p_description?: string
          p_event_data?: Json
          p_event_type: string
          p_ip_address?: unknown
          p_organization_id?: string
          p_related_entity_id?: string
          p_related_entity_type?: string
          p_request_id?: string
          p_source?: string
          p_tags?: string[]
          p_title: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      log_matter_event:
        | {
            Args: {
              p_changed_fields?: string[]
              p_description?: string
              p_event_type: string
              p_filing_id?: string
              p_matter_id: string
              p_metadata?: Json
              p_new_value?: Json
              p_old_value?: Json
              p_title: string
            }
            Returns: string
          }
        | {
            Args: {
              p_description?: string
              p_event_type: string
              p_filing_id: string
              p_is_internal?: boolean
              p_matter_id: string
              p_new_value?: Json
              p_old_value?: Json
              p_organization_id: string
              p_reference_id?: string
              p_reference_type?: string
              p_title: string
            }
            Returns: string
          }
      log_rag_query: {
        Args: {
          p_chunks_retrieved: number
          p_chunks_used: number
          p_execution_id: string
          p_filters: Json
          p_knowledge_base_id: string
          p_latency_ms: number
          p_query_text: string
          p_sources: Json
          p_task_code: string
          p_tenant_id: string
          p_top_k: number
        }
        Returns: string
      }
      lose_deal: {
        Args: {
          p_deal_id: string
          p_reason?: string
          p_reason_detail?: string
          p_user_id?: string
        }
        Returns: Json
      }
      mark_whatsapp_conversation_read: {
        Args: { p_conversation_id: string }
        Returns: undefined
      }
      match_knowledge: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          content: string
          id: string
          similarity: number
          title: string
        }[]
      }
      match_legal_chunks: {
        Args: {
          filter_office_code?: string
          match_count?: number
          query_embedding: string
        }
        Returns: {
          chunk_text: string
          chunk_type: string
          id: string
          metadata: Json
          office_code: string
          similarity: number
        }[]
      }
      next_document_ref: { Args: { p_type: string }; Returns: string }
      org_has_addon: {
        Args: { p_addon_code: string; p_org_id: string }
        Returns: boolean
      }
      org_has_module: {
        Args: { p_module_code: string; p_org_id: string }
        Returns: boolean
      }
      portal_user_can_access_matter: {
        Args: { p_matter_id: string; p_portal_user_id: string }
        Returns: boolean
      }
      preview_matter_number:
        | {
            Args: {
              p_client_id?: string
              p_jurisdiction_code: string
              p_matter_type: string
              p_organization_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_client_id?: string
              p_jurisdiction_code: string
              p_organization_id: string
              p_type_code: string
            }
            Returns: string
          }
      propagate_master_template_update: {
        Args: { p_template_id: string }
        Returns: number
      }
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
      provision_tenant_automations: {
        Args: { p_org_id: string }
        Returns: number
      }
      record_confirmed_change: {
        Args: {
          p_change_date: string
          p_change_type: string
          p_office_id: string
        }
        Returns: undefined
      }
      record_test_result: {
        Args: {
          p_actual_output: string
          p_cost?: number
          p_error_message?: string
          p_input_tokens?: number
          p_latency_ms?: number
          p_output_tokens?: number
          p_run_id: string
          p_status: string
          p_test_case_id: string
          p_validations: Json
        }
        Returns: string
      }
      refresh_all_check_frequencies: { Args: never; Returns: undefined }
      register_voip_usage: { Args: { p_call_id: string }; Returns: undefined }
      reject_workflow: {
        Args: { p_queue_id: string; p_reason?: string; p_user_id: string }
        Returns: boolean
      }
      request_workflow_approval: {
        Args: {
          p_contact_id?: string
          p_matter_id?: string
          p_organization_id: string
          p_requested_by?: string
          p_trigger_data?: Json
          p_trigger_type: string
          p_workflow_id: string
        }
        Returns: string
      }
      reset_daily_budgets: { Args: never; Returns: number }
      reset_monthly_budgets: { Args: never; Returns: number }
      reset_provider_health: {
        Args: { p_provider_id: string }
        Returns: undefined
      }
      reset_provider_hourly_counters: { Args: never; Returns: undefined }
      resolve_event: {
        Args: { p_event_id: string; p_resolution_notes?: string }
        Returns: boolean
      }
      save_api_key:
        | { Args: { key_name: string; key_value: string }; Returns: undefined }
        | {
            Args: {
              p_api_key: string
              p_provider_id: string
              p_user_id?: string
            }
            Returns: undefined
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
      search_bella_knowledge: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          keywords: string[]
          section: string
          similarity: number
          title: string
          url: string
        }[]
      }
      search_bella_knowledge_keywords: {
        Args: { match_count?: number; search_query: string }
        Returns: {
          content: string
          section: string
          title: string
          url: string
        }[]
      }
      search_call_transcriptions: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_organization_id: string
          p_search_query: string
        }
        Returns: {
          call_id: string
          contact_name: string
          duration_seconds: number
          initiated_at: string
          relevance: number
          transcription_snippet: string
        }[]
      }
      search_facets: {
        Args: { p_organization_id: string; p_query: string }
        Returns: {
          count: number
          entity_type: string
        }[]
      }
      search_ipc_groups: {
        Args: { p_limit?: number; p_query: string; p_section?: string }
        Returns: {
          class_code: string
          full_code: string
          id: string
          relevance: number
          section_code: string
          subclass_code: string
          title: string
        }[]
      }
      search_locarno_items: {
        Args: { p_class_number?: number; p_limit?: number; p_query: string }
        Returns: {
          class_number: number
          class_title: string
          id: string
          item_number: string
          relevance: number
          subclass_code: string
          term: string
        }[]
      }
      search_nice_items: {
        Args: {
          p_class_number?: number
          p_class_type?: string
          p_limit?: number
          p_search_term: string
        }
        Returns: {
          class_number: number
          class_title: string
          class_type: string
          is_generic_term: boolean
          item_code: string
          item_id: string
          item_name_en: string
          similarity: number
        }[]
      }
      search_vienna_sections: {
        Args: { p_category_code?: string; p_limit?: number; p_query: string }
        Returns: {
          category_code: string
          category_title: string
          division_code: string
          id: string
          relevance: number
          section_code: string
          title: string
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
      seed_competitor_price: {
        Args: {
          p_competitor_name: string
          p_confidence?: number
          p_currency: string
          p_includes_official_fee: boolean
          p_jurisdiction?: string
          p_price: number
          p_price_type: string
          p_service_key: string
          p_source_url: string
        }
        Returns: string
      }
      seed_crm_demo_data: { Args: { p_organization_id: string }; Returns: Json }
      seed_market_demo_data: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      seed_voip_pricing_plans_if_empty: { Args: never; Returns: undefined }
      seed_voip_pricing_plans_if_empty_superadmin: {
        Args: never
        Returns: undefined
      }
      select_model_for_task: {
        Args: {
          p_requires_tools?: boolean
          p_requires_vision?: boolean
          p_task_code: string
          p_tenant_id?: string
        }
        Returns: {
          fallback_reason: string
          is_fallback: boolean
          max_tokens: number
          selected_model_code: string
          selected_model_id: string
          selected_provider_code: string
          temperature: number
          timeout_ms: number
        }[]
      }
      set_super_admin_mode: {
        Args: { p_mode: string; p_subscription?: string; p_tenant_id?: string }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      soundex: { Args: { "": string }; Returns: string }
      start_module_trial: {
        Args: { p_pack_code: string; p_trial_days?: number }
        Returns: undefined
      }
      start_test_run: {
        Args: {
          p_model_code?: string
          p_suite_id: string
          p_triggered_by?: string
          p_user_id?: string
        }
        Returns: string
      }
      suggest_nice_classes: {
        Args: { p_description: string; p_max_results?: number }
        Returns: {
          class_number: number
          class_title: string
          class_type: string
          match_count: number
          sample_items: string[]
        }[]
      }
      sync_market_user_from_nexus: {
        Args: { p_auth_user_id: string; p_organization_id: string }
        Returns: string
      }
      tenant_has_addon: {
        Args: { p_addon_code: string; p_tenant_id: string }
        Returns: boolean
      }
      tenant_has_module: {
        Args: { p_module_code: string; p_tenant_id: string }
        Returns: boolean
      }
      text_soundex: { Args: { "": string }; Returns: string }
      toggle_circuit_breaker: {
        Args: { p_open: boolean; p_provider_id: string }
        Returns: undefined
      }
      transfer_matter_ownership: {
        Args: {
          p_from_holder_id: string
          p_matter_id: string
          p_notes?: string
          p_registration_reference?: string
          p_supporting_document_id?: string
          p_to_holder_id: string
          p_transfer_date: string
        }
        Returns: undefined
      }
      trigger_workflow_manually: {
        Args: { p_trigger_data?: Json; p_workflow_id: string }
        Returns: string
      }
      update_budget_after_execution: {
        Args: {
          p_actual_cost: number
          p_model_code?: string
          p_provider_code?: string
          p_task_code: string
          p_tenant_id: string
          p_tokens?: number
        }
        Returns: undefined
      }
      update_deadline_statuses: { Args: never; Returns: number }
      update_deal_stage: {
        Args: {
          p_deal_id: string
          p_new_stage: string
          p_notes?: string
          p_user_id?: string
        }
        Returns: Json
      }
      update_lead_status: {
        Args: {
          p_lead_id: string
          p_new_status: string
          p_standby_reason?: string
          p_standby_until?: string
          p_user_id?: string
        }
        Returns: Json
      }
      update_provider_health_after_execution: {
        Args: {
          p_error_code?: string
          p_error_message?: string
          p_execution_id?: string
          p_latency_ms?: number
          p_provider_code: string
          p_success: boolean
        }
        Returns: undefined
      }
      update_rag_kb_stats: { Args: { p_kb_id: string }; Returns: undefined }
      upsert_client_from_order: {
        Args: {
          p_amount: number
          p_auth_user_id: string
          p_email: string
          p_name: string
          p_source?: string
          p_stripe_customer: string
        }
        Returns: string
      }
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
      user_has_org_access_from_path: {
        Args: { bucket_path: string }
        Returns: boolean
      }
      validate_matter_number: {
        Args: { p_matter_number: string }
        Returns: boolean
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
      win_deal: {
        Args: { p_deal_id: string; p_notes?: string; p_won_value?: number }
        Returns: Json
      }
    }
    Enums: {
      ai_confidence_level: "high" | "medium" | "low" | "manual"
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "super_admin"
        | "staff"
        | "agent"
        | "manager"
        | "operator"
      classification_system: "nice" | "ipc" | "locarno" | "vienna"
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
      crm_deal_source_enum:
        | "referral"
        | "website"
        | "cold_call"
        | "event"
        | "other"
      doc_validity_status:
        | "valid"
        | "expiring_soon"
        | "expired"
        | "pending_verification"
        | "revoked"
      document_type_enum:
        | "application"
        | "certificate"
        | "logo"
        | "correspondence"
        | "invoice"
        | "contract"
        | "power_of_attorney"
        | "search_report"
        | "office_action"
        | "response"
        | "other"
      epo_procedure_language_enum: "en" | "de" | "fr"
      es_modalidad_enum: "normal" | "urgente"
      euipo_second_language_enum: "en" | "de" | "fr" | "es" | "it"
      ip_type_enum:
        | "trademark"
        | "patent"
        | "design"
        | "domain"
        | "copyright"
        | "trade_name"
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
      matter_status_enum:
        | "draft"
        | "filed"
        | "examination"
        | "published"
        | "opposition"
        | "registered"
        | "granted"
        | "renewed"
        | "rejected"
        | "withdrawn"
        | "expired"
        | "abandoned"
      matter_type_code:
        | "TM"
        | "PT"
        | "UM"
        | "DS"
        | "CP"
        | "DN"
        | "TS"
        | "OP"
        | "LT"
        | "LC"
        | "OT"
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
      patent_licensing_status_enum:
        | "none"
        | "exclusive"
        | "non_exclusive"
        | "compulsory"
      patent_type_enum:
        | "invention"
        | "utility_model"
        | "pct"
        | "divisional"
        | "continuation"
        | "cip"
      payment_link_status: "active" | "completed" | "expired" | "cancelled"
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
      trademark_mark_type_enum:
        | "word"
        | "figurative"
        | "combined"
        | "3d"
        | "sound"
        | "motion"
        | "hologram"
        | "color"
        | "position"
        | "pattern"
        | "other"
      trademark_opposition_status_enum: "none" | "pending" | "filed" | "decided"
      us_application_type_enum: "1a" | "1b" | "44d" | "44e" | "66a"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "super_admin",
        "staff",
        "agent",
        "manager",
        "operator",
      ],
      classification_system: ["nice", "ipc", "locarno", "vienna"],
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
      crm_deal_source_enum: [
        "referral",
        "website",
        "cold_call",
        "event",
        "other",
      ],
      doc_validity_status: [
        "valid",
        "expiring_soon",
        "expired",
        "pending_verification",
        "revoked",
      ],
      document_type_enum: [
        "application",
        "certificate",
        "logo",
        "correspondence",
        "invoice",
        "contract",
        "power_of_attorney",
        "search_report",
        "office_action",
        "response",
        "other",
      ],
      epo_procedure_language_enum: ["en", "de", "fr"],
      es_modalidad_enum: ["normal", "urgente"],
      euipo_second_language_enum: ["en", "de", "fr", "es", "it"],
      ip_type_enum: [
        "trademark",
        "patent",
        "design",
        "domain",
        "copyright",
        "trade_name",
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
      matter_status_enum: [
        "draft",
        "filed",
        "examination",
        "published",
        "opposition",
        "registered",
        "granted",
        "renewed",
        "rejected",
        "withdrawn",
        "expired",
        "abandoned",
      ],
      matter_type_code: [
        "TM",
        "PT",
        "UM",
        "DS",
        "CP",
        "DN",
        "TS",
        "OP",
        "LT",
        "LC",
        "OT",
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
      patent_licensing_status_enum: [
        "none",
        "exclusive",
        "non_exclusive",
        "compulsory",
      ],
      patent_type_enum: [
        "invention",
        "utility_model",
        "pct",
        "divisional",
        "continuation",
        "cip",
      ],
      payment_link_status: ["active", "completed", "expired", "cancelled"],
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
      trademark_mark_type_enum: [
        "word",
        "figurative",
        "combined",
        "3d",
        "sound",
        "motion",
        "hologram",
        "color",
        "position",
        "pattern",
        "other",
      ],
      trademark_opposition_status_enum: ["none", "pending", "filed", "decided"],
      us_application_type_enum: ["1a", "1b", "44d", "44e", "66a"],
      whatsapp_tier: ["tier1_api", "tier2_sync", "tier3_basic"],
    },
  },
} as const
