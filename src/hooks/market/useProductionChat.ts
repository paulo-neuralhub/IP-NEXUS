/**
 * useProductionChat — Hook for production chat (post-acceptance)
 * Uses market_service_messages table with realtime subscription
 * Supports system messages (sender_user_id = null) and user messages
 */
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { toast } from 'sonner';

export interface ProductionMessage {
  id: string;
  transaction_id: string;
  sender_user_id: string | null;
  sender_display_name: string | null;
  content: string;
  message_type: string; // 'text' | 'file' | 'system'
  file_name: string | null;
  file_url: string | null;
  metadata: Record<string, any> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// System message templates
const SYSTEM_MESSAGES: Record<string, {
  icon: string;
  title: string;
  body: string;
  color: string;
}> = {
  proposal_accepted: {
    icon: '🤝',
    title: 'Propuesta aceptada',
    body: 'La propuesta ha sido aceptada. El siguiente paso es depositar los fondos en escrow.',
    color: '#00b4d8',
  },
  escrow_deposited: {
    icon: '💰',
    title: 'Fondos depositados en escrow',
    body: '{currency} {amount} depositados de forma segura. El agente puede comenzar a trabajar.',
    color: '#10b981',
  },
  official_fees_advanced: {
    icon: '🏛️',
    title: 'Tasas oficiales adelantadas',
    body: '{currency} {amount} en tasas oficiales transferidos al agente para el pago ante la oficina.',
    color: '#8b5cf6',
  },
  phase_delivered: {
    icon: '📋',
    title: 'Fase {phase_number} entregada: {phase_name}',
    body: 'El agente ha marcado esta fase como entregada. Por favor revisa y confirma.',
    color: '#00b4d8',
  },
  phase_confirmed: {
    icon: '✅',
    title: 'Fase {phase_number} confirmada — Pago liberado',
    body: '{currency} {amount} liberados al agente.',
    color: '#10b981',
  },
  work_completed: {
    icon: '🎉',
    title: '¡Trabajo completado!',
    body: 'Todas las fases han sido completadas y confirmadas. Todos los fondos han sido liberados. ¡Gracias por usar IP-Market!',
    color: '#10b981',
  },
  dispute_opened: {
    icon: '⚠️',
    title: 'Disputa abierta',
    body: 'Se ha reportado un problema. Los fondos quedan retenidos hasta la resolución.',
    color: '#ef4444',
  },
};

// Fetch messages for a transaction
export function useProductionMessages(transactionId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['production-messages', transactionId],
    queryFn: async () => {
      if (!transactionId) return [];

      const { data, error } = await supabase
        .from('market_service_messages')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as ProductionMessage[];
    },
    enabled: !!transactionId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!transactionId) return;

    const channel = supabase
      .channel(`prod-chat-${transactionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'market_service_messages',
          filter: `transaction_id=eq.${transactionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['production-messages', transactionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId, queryClient]);

  return query;
}

// Send a user message
export function useSendProductionMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      content,
      fileName,
      fileUrl,
    }: {
      transactionId: string;
      content: string;
      fileName?: string;
      fileUrl?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const messageType = fileUrl ? 'file' : 'text';

      const { data, error } = await supabase
        .from('market_service_messages')
        .insert({
          transaction_id: transactionId,
          sender_user_id: user.id,
          content,
          message_type: messageType,
          file_name: fileName || null,
          file_url: fileUrl || null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['production-messages', variables.transactionId] });
    },
    onError: () => {
      toast.error('Error al enviar mensaje');
    },
  });
}

// Insert a system message (called from workflow hooks)
export async function insertSystemMessage(
  transactionId: string,
  type: string,
  variables: Record<string, string> = {}
) {
  const template = SYSTEM_MESSAGES[type];
  if (!template) return;

  let body = template.body;
  let title = template.title;
  Object.entries(variables).forEach(([key, value]) => {
    body = body.replace(`{${key}}`, value);
    title = title.replace(`{${key}}`, value);
  });

  await supabase
    .from('market_service_messages')
    .insert({
      transaction_id: transactionId,
      sender_user_id: null,
      content: body,
      message_type: 'system',
      metadata: {
        icon: template.icon,
        title,
        color: template.color,
        event_type: type,
      },
    } as any);
}

// Fetch payment events
export function usePaymentEvents(transactionId: string | undefined) {
  return useQuery({
    queryKey: ['payment-events', transactionId],
    queryFn: async () => {
      if (!transactionId) return [];

      const { data, error } = await supabase
        .from('market_payment_events')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!transactionId,
  });
}

// Insert payment event
export async function insertPaymentEvent(event: {
  transaction_id: string;
  type: string;
  amount: number;
  currency: string;
  direction: string;
  description?: string;
  recipient?: string;
  milestone_id?: string;
}) {
  await supabase
    .from('market_payment_events')
    .insert(event as any);
}
