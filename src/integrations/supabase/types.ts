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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_ids: { Args: never; Returns: string[] }
      get_user_role_in_org: { Args: { org_id: string }; Returns: string }
      is_member_of_org: { Args: { org_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
