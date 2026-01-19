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
      const ticketInsert: Record<string, unknown> = {
        organization_id: currentOrganization.id,
        user_id: user.id,
        subject: data.subject,
        description: data.description,
        category: data.category,
        priority: data.priority,
        affected_module: data.affected_module,
        page_url: window.location.href,
      };

      if (attachments.length > 0) {
        ticketInsert.attachments = JSON.parse(JSON.stringify(attachments));
      }
      ticketInsert.browser_info = JSON.parse(JSON.stringify({
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenSize: `${window.screen.width}x${window.screen.height}`,
      }));

      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert(ticketInsert as never)
        .select()
        .single();

      if (error) throw error;

      // Create initial message
      const messageInsert = {
        ticket_id: ticket.id,
        author_type: 'customer' as const,
        author_id: user.id,
        message: data.description,
        attachments: attachments.length > 0 ? JSON.parse(JSON.stringify(attachments)) : undefined,
      };

      await supabase.from('ticket_messages').insert(messageInsert);

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

      const messageInsert = {
        ticket_id: ticketId,
        author_type: 'customer' as const,
        author_id: user.id,
        message,
        attachments: attachments.length > 0 ? JSON.parse(JSON.stringify(attachments)) : undefined,
      };

      const { error } = await supabase.from('ticket_messages').insert(messageInsert);

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
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.assigned_to !== undefined) updateData.assigned_to = updates.assigned_to;
      if (updates.subject !== undefined) updateData.subject = updates.subject;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.resolution_notes !== undefined) updateData.resolution_notes = updates.resolution_notes;
      if (updates.attachments !== undefined) updateData.attachments = JSON.parse(JSON.stringify(updates.attachments));

      const { data, error } = await supabase
        .from('support_tickets')
        .update(updateData)
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
