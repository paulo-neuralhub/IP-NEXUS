// ============================================================
// IP-NEXUS HELP - SUPPORT TICKETS HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SupportTicket, TicketMessage, CreateTicketForm, TicketAttachment } from '@/types/help';
import { toast } from 'sonner';
import { useOrganization } from '@/contexts/organization-context';

// ==========================================
// USER TICKETS
// ==========================================

export function useSupportTickets(options?: { status?: string; limit?: number }) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['support-tickets', currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('support_tickets')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as SupportTicket[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useSupportTicket(ticketId: string) {
  return useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: async () => {
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:users!support_tickets_user_id_fkey(full_name, email, avatar_url),
          assigned_user:users!support_tickets_assigned_to_fkey(full_name, email)
        `)
        .eq('id', ticketId)
        .single();

      if (error) throw error;

      if (error) throw error;

      // Get messages
      const { data: messages } = await supabase
        .from('ticket_messages')
        .select(`
          *,
          author:users!ticket_messages_author_id_fkey(full_name, avatar_url)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      return { ...ticket, messages: messages || [] } as unknown as SupportTicket;
    },
    enabled: !!ticketId,
  });
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: CreateTicketForm) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !currentOrganization?.id) throw new Error('Not authenticated');

      // Handle file uploads if any
      let attachments: TicketAttachment[] = [];
      if (data.attachments && data.attachments.length > 0) {
        for (const file of data.attachments) {
          const fileName = `${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('support-attachments')
            .upload(`${currentOrganization.id}/${fileName}`, file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from('support-attachments')
            .getPublicUrl(uploadData.path);

          attachments.push({
            name: file.name,
            url: urlData.publicUrl,
            size: file.size,
            type: file.type,
          });
        }
      }

      // Create ticket
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert({
          organization_id: currentOrganization.id,
          user_id: user.id,
          subject: data.subject,
          description: data.description,
          category: data.category,
          priority: data.priority,
          affected_module: data.affected_module,
          attachments,
          browser_info: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenSize: `${window.screen.width}x${window.screen.height}`,
          },
          page_url: window.location.href,
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial message
      await supabase.from('ticket_messages').insert({
        ticket_id: ticket.id,
        author_type: 'customer',
        author_id: user.id,
        message: data.description,
        attachments,
      });

      return ticket;
    },
    onSuccess: () => {
      toast.success('Ticket creado correctamente');
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (error) => {
      toast.error('Error al crear ticket');
      console.error(error);
    },
  });
}

export function useAddTicketMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      message,
      attachments = [],
    }: {
      ticketId: string;
      message: string;
      attachments?: TicketAttachment[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('ticket_messages').insert({
        ticket_id: ticketId,
        author_type: 'customer',
        author_id: user.id,
        message,
        attachments,
      });

      if (error) throw error;

      // Update ticket status if waiting for customer
      await supabase
        .from('support_tickets')
        .update({
          status: 'open',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .eq('status', 'waiting_customer');
    },
    onSuccess: (_, { ticketId }) => {
      toast.success('Mensaje enviado');
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
    },
    onError: () => {
      toast.error('Error al enviar mensaje');
    },
  });
}

export function useSubmitTicketSatisfaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      rating,
      feedback,
    }: {
      ticketId: string;
      rating: number;
      feedback?: string;
    }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          satisfaction_rating: rating,
          satisfaction_feedback: feedback,
        })
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: (_, { ticketId }) => {
      toast.success('¡Gracias por tu valoración!');
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
    },
    onError: () => {
      toast.error('Error al enviar valoración');
    },
  });
}

// ==========================================
// ADMIN: ALL TICKETS
// ==========================================

export function useAllSupportTickets(options?: {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
}) {
  return useQuery({
    queryKey: ['support-tickets-all', options],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          user:users!support_tickets_user_id_fkey(full_name, email, avatar_url),
          assigned_user:users!support_tickets_assigned_to_fkey(full_name, email),
          organization:organizations(name)
        `)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.priority) {
        query = query.eq('priority', options.priority);
      }
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      if (options?.assignedTo) {
        query = query.eq('assigned_to', options.assignedTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as (SupportTicket & { organization: { name: string } })[];
    },
  });
}

export function useUpdateSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<SupportTicket> & { id: string }) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Ticket actualizado');
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-ticket', data.id] });
    },
    onError: () => {
      toast.error('Error al actualizar ticket');
    },
  });
}

export function useAddAgentMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      message,
      isInternal = false,
      authorName,
    }: {
      ticketId: string;
      message: string;
      isInternal?: boolean;
      authorName?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('ticket_messages').insert({
        ticket_id: ticketId,
        author_type: 'agent',
        author_id: user.id,
        author_name: authorName,
        message,
        is_internal: isInternal,
      });

      if (error) throw error;

      // Update first response time if not set
      await supabase
        .from('support_tickets')
        .update({
          first_response_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .is('first_response_at', null);
    },
    onSuccess: (_, { ticketId }) => {
      toast.success('Respuesta enviada');
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
    },
    onError: () => {
      toast.error('Error al enviar respuesta');
    },
  });
}

export function useResolveTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      resolutionNotes,
    }: {
      ticketId: string;
      resolutionNotes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: 'resolved',
          resolution_notes: resolutionNotes,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

      if (error) throw error;

      // Add system message
      await supabase.from('ticket_messages').insert({
        ticket_id: ticketId,
        author_type: 'system',
        message: 'El ticket ha sido marcado como resuelto.',
      });
    },
    onSuccess: (_, { ticketId }) => {
      toast.success('Ticket resuelto');
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
    },
    onError: () => {
      toast.error('Error al resolver ticket');
    },
  });
}
