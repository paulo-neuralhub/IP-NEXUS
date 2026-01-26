/**
 * Hook para mensajes del Portal Cliente
 * CRUD de mensajes entre cliente y despacho
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePortalAuth } from './usePortalAuth';
import { toast } from 'sonner';

// =============================================
// TYPES
// =============================================

export interface PortalMessage {
  id: string;
  portal_id: string;
  portal_user_id: string | null;
  contact_id: string | null;
  matter_id: string | null;
  thread_id: string | null;
  parent_id: string | null;
  direction: 'inbound' | 'outbound';
  subject: string | null;
  body: string;
  attachments: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'replied';
  read_at: string | null;
  replied_at: string | null;
  replied_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortalThread {
  thread_id: string;
  subject: string;
  last_message: string;
  last_message_date: string;
  unread_count: number;
  message_count: number;
  participants: string[];
  matter_id: string | null;
  matter_reference: string | null;
}

interface SendMessageParams {
  subject?: string;
  body: string;
  matter_id?: string;
  thread_id?: string;
  attachments?: Array<{ name: string; url: string }>;
}

// =============================================
// HOOKS
// =============================================

/**
 * Hook para obtener las conversaciones (threads) del usuario
 */
export function usePortalThreads() {
  const { user } = usePortalAuth();

  return useQuery({
    queryKey: ['portal-threads', user?.id],
    queryFn: async (): Promise<PortalThread[]> => {
      if (!user?.portal?.id) return [];

      // Obtener mensajes agrupados por thread
      const { data: messages, error } = await supabase
        .from('portal_messages')
        .select(`
          id,
          thread_id,
          subject,
          body,
          direction,
          status,
          created_at,
          read_at,
          matter_id,
          matters(reference)
        `)
        .eq('portal_id', user.portal.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching portal messages:', error);
        throw error;
      }

      // Agrupar por thread
      const threadsMap = new Map<string, PortalThread>();

      for (const msg of messages || []) {
        const threadId = msg.thread_id || msg.id;
        
        if (!threadsMap.has(threadId)) {
          threadsMap.set(threadId, {
            thread_id: threadId,
            subject: msg.subject || 'Sin asunto',
            last_message: msg.body.substring(0, 100),
            last_message_date: msg.created_at,
            unread_count: 0,
            message_count: 0,
            participants: [],
            matter_id: msg.matter_id,
            matter_reference: (msg.matters as any)?.reference || null,
          });
        }

        const thread = threadsMap.get(threadId)!;
        thread.message_count++;
        
        if (!msg.read_at && msg.direction === 'outbound') {
          thread.unread_count++;
        }
      }

      return Array.from(threadsMap.values());
    },
    enabled: !!user?.portal?.id,
    staleTime: 30000, // 30 segundos
  });
}

/**
 * Hook para obtener mensajes de un thread específico
 */
export function usePortalThreadMessages(threadId: string | null) {
  const { user } = usePortalAuth();

  return useQuery({
    queryKey: ['portal-thread-messages', threadId],
    queryFn: async (): Promise<PortalMessage[]> => {
      if (!user?.portal?.id || !threadId) return [];

      const { data, error } = await supabase
        .from('portal_messages')
        .select('*')
        .eq('portal_id', user.portal.id)
        .or(`thread_id.eq.${threadId},id.eq.${threadId}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching thread messages:', error);
        throw error;
      }

      return (data as PortalMessage[]) || [];
    },
    enabled: !!user?.portal?.id && !!threadId,
    staleTime: 10000, // 10 segundos
  });
}

/**
 * Hook para enviar un mensaje
 */
export function useSendPortalMessage() {
  const queryClient = useQueryClient();
  const { user } = usePortalAuth();

  return useMutation({
    mutationFn: async (params: SendMessageParams) => {
      if (!user?.portal?.id) {
        throw new Error('Usuario no autenticado');
      }

      const threadId = params.thread_id || crypto.randomUUID();

      const { data, error } = await supabase
        .from('portal_messages')
        .insert({
          portal_id: user.portal.id,
          portal_user_id: user.id,
          thread_id: threadId,
          direction: 'inbound',
          subject: params.subject || null,
          body: params.body,
          matter_id: params.matter_id || null,
          attachments: params.attachments || [],
          status: 'sent',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Mensaje enviado');
      queryClient.invalidateQueries({ queryKey: ['portal-threads'] });
      queryClient.invalidateQueries({ queryKey: ['portal-thread-messages'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
    },
  });
}

/**
 * Hook para marcar mensajes como leídos
 */
export function useMarkMessagesRead() {
  const queryClient = useQueryClient();
  const { user } = usePortalAuth();

  return useMutation({
    mutationFn: async (threadId: string) => {
      if (!user?.portal?.id) return;

      const { error } = await supabase
        .from('portal_messages')
        .update({ 
          read_at: new Date().toISOString(),
          status: 'read' 
        })
        .eq('portal_id', user.portal.id)
        .or(`thread_id.eq.${threadId},id.eq.${threadId}`)
        .eq('direction', 'outbound')
        .is('read_at', null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-threads'] });
      queryClient.invalidateQueries({ queryKey: ['portal-thread-messages'] });
    },
  });
}
