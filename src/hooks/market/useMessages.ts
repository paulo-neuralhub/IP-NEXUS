// src/hooks/market/useMessages.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MarketMessage } from '@/types/market.types';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface Conversation {
  threadId: string;
  listingId?: string;
  transactionId?: string;
  listing?: any;
  lastMessage: string;
  lastMessageAt: string;
  otherParty: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  unreadCount?: number;
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await (supabase
        .from('market_messages' as any)
        .select(`
          thread_id,
          listing_id,
          transaction_id,
          created_at,
          content,
          is_read,
          listing:market_listings(id, title, asset:market_assets(images)),
          sender:market_user_profiles!sender_id(id, display_name, avatar_url),
          recipient:market_user_profiles!recipient_id(id, display_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;

      // Group by thread
      const threadsMap = new Map<string, Conversation>();
      (data || []).forEach((msg: any) => {
        if (!threadsMap.has(msg.thread_id)) {
          threadsMap.set(msg.thread_id, {
            threadId: msg.thread_id,
            listingId: msg.listing_id,
            transactionId: msg.transaction_id,
            listing: msg.listing,
            lastMessage: msg.content,
            lastMessageAt: msg.created_at,
            otherParty: msg.sender?.id === user.id ? msg.recipient : msg.sender,
            unreadCount: 0,
          });
        }
      });

      return Array.from(threadsMap.values());
    },
  });
}

export function useThreadMessages(threadId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ['thread-messages', threadId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!threadId) return { messages: [], hasMore: false, page: 0 };

      const limit = 50;
      const { data, error } = await (supabase
        .from('market_messages' as any)
        .select(`
          *,
          sender:market_user_profiles!sender_id(id, display_name, avatar_url)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: false })
        .range(pageParam * limit, (pageParam + 1) * limit - 1) as any);

      if (error) throw error;

      return {
        messages: (data || []) as MarketMessage[],
        hasMore: data?.length === limit,
        page: pageParam,
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
    enabled: !!threadId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!threadId) return;

    const channel = supabase
      .channel(`messages:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'market_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['thread-messages', threadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, queryClient]);

  const messages = query.data?.pages.flatMap(p => p.messages).reverse() || [];

  return { ...query, messages };
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      threadId,
      recipientId,
      listingId,
      transactionId,
      content,
      attachments,
    }: {
      threadId?: string;
      recipientId: string;
      listingId?: string;
      transactionId?: string;
      content: string;
      attachments?: { name: string; url: string; type: string }[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate thread_id if not provided
      const finalThreadId = threadId || `${listingId || transactionId}_${[user.id, recipientId].sort().join('_')}`;

      const { data, error } = await (supabase
        .from('market_messages' as any)
        .insert({
          thread_id: finalThreadId,
          listing_id: listingId,
          transaction_id: transactionId,
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          attachments,
        })
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['thread-messages', data.thread_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast.error('Error al enviar mensaje');
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await (supabase
        .from('market_messages' as any)
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('recipient_id', user.id)
        .eq('is_read', false) as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
