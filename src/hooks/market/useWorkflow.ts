// src/hooks/market/useWorkflow.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TransactionStatus } from '@/types/market.types';

// === WORK MESSAGES ===
export interface WorkMessage {
  id: string;
  transaction_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'system';
  attachments: { name: string; url: string; type: string }[] | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export function useWorkMessages(transactionId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['work-messages', transactionId],
    queryFn: async () => {
      if (!transactionId) return [];

      const { data, error } = await (supabase
        .from('market_messages' as any)
        .select(`
          id,
          transaction_id,
          sender_id,
          message,
          attachments,
          read_at,
          created_at,
          sender:market_user_profiles!sender_id(id, display_name, avatar_url)
        `)
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true }) as any);

      if (error) throw error;

      return (data || []).map((m: any) => ({
        ...m,
        content: m.message,
        message_type: m.attachments?.length > 0 ? 'file' : 'text',
        is_read: !!m.read_at,
      })) as WorkMessage[];
    },
    enabled: !!transactionId,
    refetchInterval: 10000, // Poll every 10s for new messages
  });

  return query;
}

export function useSendWorkMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      recipientId,
      content,
      attachments,
      isSystem = false,
    }: {
      transactionId: string;
      recipientId: string;
      content: string;
      attachments?: { name: string; url: string; type: string }[];
      isSystem?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate thread_id based on transaction
      const threadId = `transaction_${transactionId}`;

      const { data, error } = await (supabase
        .from('market_messages' as any)
        .insert({
          thread_id: threadId,
          transaction_id: transactionId,
          sender_id: user.id,
          recipient_id: recipientId,
          message: content,
          attachments: attachments || null,
        })
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-messages', variables.transactionId] });
    },
    onError: () => {
      toast.error('Error al enviar mensaje');
    },
  });
}

// === WORK FILES ===
export interface WorkFile {
  id: string;
  transaction_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  uploader?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export function useWorkFiles(transactionId: string | undefined) {
  return useQuery({
    queryKey: ['work-files', transactionId],
    queryFn: async () => {
      if (!transactionId) return [];

      // For now, extract files from messages with attachments
      const { data, error } = await (supabase
        .from('market_messages' as any)
        .select(`
          id,
          transaction_id,
          sender_id,
          attachments,
          created_at,
          sender:market_user_profiles!sender_id(id, display_name, avatar_url)
        `)
        .eq('transaction_id', transactionId)
        .not('attachments', 'is', null)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;

      // Flatten attachments from messages
      const files: WorkFile[] = [];
      (data || []).forEach((msg: any) => {
        const attachments = msg.attachments as { name: string; url: string; type: string }[] | null;
        if (attachments && Array.isArray(attachments)) {
          attachments.forEach((att, idx) => {
            files.push({
              id: `${msg.id}-${idx}`,
              transaction_id: msg.transaction_id,
              uploaded_by: msg.sender_id,
              file_name: att.name,
              file_path: att.url,
              file_size: 0, // Not stored in attachments
              file_type: att.type,
              created_at: msg.created_at,
              uploader: msg.sender,
            });
          });
        }
      });

      return files;
    },
    enabled: !!transactionId,
  });
}

// === WORKFLOW STATUS UPDATES ===
export function useMarkWorkComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      summary,
      deliverables,
    }: {
      transactionId: string;
      summary: string;
      deliverables: string[];
    }) => {
      const { error } = await (supabase
        .from('market_transactions' as any)
        .update({
          status: 'pending_transfer' as TransactionStatus,
          notes: summary,
          metadata: { deliverables, marked_complete_at: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId) as any);

      if (error) throw error;

      // Add system message
      const { data: transaction } = await (supabase
        .from('market_transactions' as any)
        .select('buyer_id, seller_id')
        .eq('id', transactionId)
        .single() as any);

      if (transaction) {
        const { data: { user } } = await supabase.auth.getUser();
        const recipientId = user?.id === transaction.seller_id ? transaction.buyer_id : transaction.seller_id;

        await (supabase.from('market_messages' as any).insert({
          thread_id: `transaction_${transactionId}`,
          transaction_id: transactionId,
          sender_id: user?.id,
          recipient_id: recipientId,
          message: `✅ El trabajo ha sido marcado como completado. Resumen: ${summary}`,
          attachments: null,
        }) as any);
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ['work-messages', variables.transactionId] });
      toast.success('Trabajo marcado como completado');
    },
    onError: () => {
      toast.error('Error al marcar trabajo como completado');
    },
  });
}

export function useApproveWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await (supabase
        .from('market_transactions' as any)
        .update({
          status: 'completed' as TransactionStatus,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId) as any);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, transactionId) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });
      toast.success('Trabajo aprobado correctamente');
    },
    onError: () => {
      toast.error('Error al aprobar trabajo');
    },
  });
}

export function useRequestChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      reason,
    }: {
      transactionId: string;
      reason: string;
    }) => {
      const { error } = await (supabase
        .from('market_transactions' as any)
        .update({
          status: 'payment_in_escrow' as TransactionStatus, // Back to in progress
          notes: `Cambios solicitados: ${reason}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId) as any);

      if (error) throw error;

      // Add system message
      const { data: transaction } = await (supabase
        .from('market_transactions' as any)
        .select('buyer_id, seller_id')
        .eq('id', transactionId)
        .single() as any);

      if (transaction) {
        const { data: { user } } = await supabase.auth.getUser();
        const recipientId = user?.id === transaction.buyer_id ? transaction.seller_id : transaction.buyer_id;

        await (supabase.from('market_messages' as any).insert({
          thread_id: `transaction_${transactionId}`,
          transaction_id: transactionId,
          sender_id: user?.id,
          recipient_id: recipientId,
          message: `🔄 Se han solicitado cambios: ${reason}`,
          attachments: null,
        }) as any);
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ['work-messages', variables.transactionId] });
      toast.success('Cambios solicitados');
    },
    onError: () => {
      toast.error('Error al solicitar cambios');
    },
  });
}

// === REVIEWS ===
export interface WorkReview {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewed_id: string;
  overall_rating: number;
  communication_rating: number;
  professionalism_rating: number;
  accuracy_rating: number;
  title: string | null;
  review: string;
  visible: boolean;
  created_at: string;
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      reviewedId,
      overallRating,
      communicationRating,
      professionalismRating,
      accuracyRating,
      title,
      review,
      isPublic,
    }: {
      transactionId: string;
      reviewedId: string;
      overallRating: number;
      communicationRating?: number;
      professionalismRating?: number;
      accuracyRating?: number;
      title?: string;
      review: string;
      isPublic: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('market_reviews' as any)
        .insert({
          transaction_id: transactionId,
          reviewer_id: user.id,
          reviewed_id: reviewedId,
          overall_rating: overallRating,
          communication_rating: communicationRating || overallRating,
          professionalism_rating: professionalismRating || overallRating,
          accuracy_rating: accuracyRating || overallRating,
          title: title || null,
          review,
          visible: isPublic,
        })
        .select()
        .single() as any);

      if (error) throw error;

      // Update user's average rating
      const { data: allReviews } = await (supabase
        .from('market_reviews' as any)
        .select('overall_rating')
        .eq('reviewed_id', reviewedId)
        .eq('visible', true) as any);

      if (allReviews && allReviews.length > 0) {
        const avgRating = allReviews.reduce((sum: number, r: any) => sum + r.overall_rating, 0) / allReviews.length;
        
        await (supabase
          .from('market_user_profiles' as any)
          .update({
            reputation_score: Math.round(avgRating * 20), // Scale to 0-100
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', reviewedId) as any);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ['market-user', variables.reviewedId] });
      toast.success('Review enviada correctamente');
    },
    onError: () => {
      toast.error('Error al enviar review');
    },
  });
}

export function useTransactionReviews(transactionId: string | undefined) {
  return useQuery({
    queryKey: ['transaction-reviews', transactionId],
    queryFn: async () => {
      if (!transactionId) return [];

      const { data, error } = await (supabase
        .from('market_reviews' as any)
        .select(`
          *,
          reviewer:market_user_profiles!reviewer_id(id, display_name, avatar_url),
          reviewed:market_user_profiles!reviewed_id(id, display_name, avatar_url)
        `)
        .eq('transaction_id', transactionId) as any);

      if (error) throw error;
      return data as (WorkReview & { reviewer: any; reviewed: any })[];
    },
    enabled: !!transactionId,
  });
}

// === TIMELINE ===
export interface TimelineEvent {
  id: string;
  type: 'status_change' | 'message' | 'file' | 'payment' | 'review';
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
  metadata?: Record<string, unknown>;
}

export function useWorkTimeline(transactionId: string | undefined) {
  return useQuery({
    queryKey: ['work-timeline', transactionId],
    queryFn: async () => {
      if (!transactionId) return [];

      const events: TimelineEvent[] = [];

      // Get transaction for status history (we'll derive from current data)
      const { data: transaction } = await (supabase
        .from('market_transactions' as any)
        .select(`
          *,
          buyer:market_user_profiles!buyer_id(id, display_name, avatar_url),
          seller:market_user_profiles!seller_id(id, display_name, avatar_url)
        `)
        .eq('id', transactionId)
        .single() as any);

      if (transaction) {
        // Created event
        events.push({
          id: `created-${transactionId}`,
          type: 'status_change',
          title: 'Transacción creada',
          timestamp: transaction.created_at,
        });

        // Payment event if paid
        if (transaction.paid_at) {
          events.push({
            id: `paid-${transactionId}`,
            type: 'payment',
            title: 'Pago completado',
            description: `${transaction.agreed_price} ${transaction.currency}`,
            timestamp: transaction.paid_at,
          });
        }

        // Completed event
        if (transaction.completed_at) {
          events.push({
            id: `completed-${transactionId}`,
            type: 'status_change',
            title: 'Trabajo completado',
            timestamp: transaction.completed_at,
          });
        }
      }

      // Get messages as events
      const { data: messages } = await (supabase
        .from('market_messages' as any)
        .select(`
          id,
          message,
          attachments,
          created_at,
          sender:market_user_profiles!sender_id(id, display_name, avatar_url)
        `)
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true }) as any);

      if (messages) {
        messages.forEach((msg: any) => {
          const hasAttachments = msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0;
          
          if (hasAttachments) {
            events.push({
              id: `file-${msg.id}`,
              type: 'file',
              title: 'Archivo compartido',
              description: msg.attachments[0]?.name || 'Archivo',
              timestamp: msg.created_at,
              user: msg.sender,
            });
          } else if (msg.message?.startsWith('✅') || msg.message?.startsWith('🔄')) {
            // System message
            events.push({
              id: `system-${msg.id}`,
              type: 'status_change',
              title: msg.message.substring(0, 50),
              timestamp: msg.created_at,
              user: msg.sender,
            });
          }
        });
      }

      // Get reviews
      const { data: reviews } = await (supabase
        .from('market_reviews' as any)
        .select(`
          id,
          overall_rating,
          review,
          created_at,
          reviewer:market_user_profiles!reviewer_id(id, display_name, avatar_url)
        `)
        .eq('transaction_id', transactionId) as any);

      if (reviews) {
        reviews.forEach((r: any) => {
          events.push({
            id: `review-${r.id}`,
            type: 'review',
            title: `Review: ${'⭐'.repeat(r.overall_rating)}`,
            description: r.review?.substring(0, 100),
            timestamp: r.created_at,
            user: r.reviewer,
          });
        });
      }

      // Sort by timestamp
      events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return events;
    },
    enabled: !!transactionId,
  });
}
