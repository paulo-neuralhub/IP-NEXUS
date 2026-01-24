// ============================================
// src/hooks/backoffice/useChatbotLeads.ts
// Hooks for managing chatbot leads in backoffice
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChatbotLead {
  id: string;
  conversation_id: string | null;
  email: string | null;
  name: string | null;
  company: string | null;
  phone: string | null;
  interested_modules: string[] | null;
  lead_score: number | null;
  notes: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'demo' | 'converted' | 'lost';
  assigned_to: string | null;
  demo_scheduled_at: string | null;
  demo_completed: boolean;
  created_at: string;
  updated_at: string | null;
  // Joined fields
  conversation?: {
    landing_slug: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    started_at: string | null;
  };
  assigned_user?: {
    full_name: string | null;
    email: string | null;
  };
}

export interface LeadFilters {
  status?: string;
  landing?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Fetch all leads with filters
export function useChatbotLeads(filters: LeadFilters = {}) {
  return useQuery({
    queryKey: ['backoffice-chatbot-leads', filters],
    queryFn: async (): Promise<ChatbotLead[]> => {
      let query = supabase
        .from('chatbot_leads')
        .select(`
          *,
          conversation:chatbot_conversations(
            landing_slug,
            utm_source,
            utm_medium,
            utm_campaign,
            started_at
          ),
          assigned_user:users!chatbot_leads_assigned_to_fkey(
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`email.ilike.%${filters.search}%,name.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by landing in memory (joined table)
      let leads = (data || []) as ChatbotLead[];
      
      if (filters.landing && filters.landing !== 'all') {
        leads = leads.filter(l => l.conversation?.landing_slug === filters.landing);
      }

      return leads;
    },
  });
}

// Fetch single lead with full conversation
export function useChatbotLead(id: string | undefined) {
  return useQuery({
    queryKey: ['backoffice-chatbot-lead', id],
    queryFn: async () => {
      if (!id) return null;

      // Fetch lead
      const { data: lead, error: leadError } = await supabase
        .from('chatbot_leads')
        .select(`
          *,
          conversation:chatbot_conversations(
            id,
            landing_slug,
            utm_source,
            utm_medium,
            utm_campaign,
            referrer,
            started_at,
            last_message_at
          ),
          assigned_user:users!chatbot_leads_assigned_to_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (leadError) throw leadError;
      if (!lead) return null;

      // Fetch conversation messages if we have a conversation
      let messages: Array<{ id: string; role: string; content: string; created_at: string }> = [];
      if (lead.conversation?.id) {
        const { data: msgData } = await supabase
          .from('chatbot_messages')
          .select('id, role, content, created_at')
          .eq('conversation_id', lead.conversation.id)
          .order('created_at', { ascending: true });
        
        messages = msgData || [];
      }

      return {
        ...lead,
        messages,
      };
    },
    enabled: !!id,
  });
}

// Update lead status
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('chatbot_leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['backoffice-chatbot-leads'] });
      queryClient.invalidateQueries({ queryKey: ['backoffice-chatbot-lead', variables.id] });
      toast.success('Estado actualizado');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Assign lead to user
export function useAssignLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string | null }) => {
      const { error } = await supabase
        .from('chatbot_leads')
        .update({ assigned_to: userId, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['backoffice-chatbot-leads'] });
      queryClient.invalidateQueries({ queryKey: ['backoffice-chatbot-lead', variables.id] });
      toast.success('Lead asignado');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Update lead notes
export function useUpdateLeadNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('chatbot_leads')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['backoffice-chatbot-lead', variables.id] });
      toast.success('Notas guardadas');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Schedule demo
export function useScheduleDemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, scheduledAt }: { id: string; scheduledAt: string }) => {
      const { error } = await supabase
        .from('chatbot_leads')
        .update({ 
          demo_scheduled_at: scheduledAt, 
          status: 'demo',
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['backoffice-chatbot-leads'] });
      queryClient.invalidateQueries({ queryKey: ['backoffice-chatbot-lead', variables.id] });
      toast.success('Demo agendada');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Mark demo completed
export function useCompleteDemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('chatbot_leads')
        .update({ 
          demo_completed: true,
          status: 'qualified',
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['backoffice-chatbot-leads'] });
      queryClient.invalidateQueries({ queryKey: ['backoffice-chatbot-lead', id] });
      toast.success('Demo completada');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Bulk update leads
export function useBulkUpdateLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Record<string, unknown> }) => {
      const { error } = await supabase
        .from('chatbot_leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backoffice-chatbot-leads'] });
      toast.success('Leads actualizados');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}
