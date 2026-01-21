import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import type { AIConversation, AIMessage, AgentType, ConversationContextType } from '@/types/genius';

// ===== TYPES =====
interface SendMessageParams {
  message: string;
  matterId?: string;
  helpContext?: {
    currentPage: string;
    userLevel?: 'beginner' | 'intermediate' | 'advanced';
    recentActions?: string[];
  };
}

interface ChatState {
  conversationId: string | null;
  messages: AIMessage[];
  isLoading: boolean;
  error: Error | null;
}

// ===== HOOK: Enhanced Chat with Context =====
export function useGeniusChat(agentType: AgentType) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  
  const [state, setState] = useState<ChatState>({
    conversationId: null,
    messages: [],
    isLoading: false,
    error: null,
  });
  
  const contextMatterRef = useRef<string | undefined>(undefined);

  // Create new conversation
  const createConversation = useCallback(async (
    contextType: ConversationContextType = 'general',
    contextId?: string
  ): Promise<string> => {
    if (!user?.id || !currentOrganization?.id) {
      throw new Error('User or organization not found');
    }

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        organization_id: currentOrganization.id,
        user_id: user.id,
        agent_type: agentType,
        context_type: contextType,
        context_id: contextId,
        matter_id: contextType === 'matter' ? contextId : null,
        status: 'active',
        is_starred: false,
        message_count: 0,
        token_count: 0,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }, [user?.id, currentOrganization?.id, agentType]);

  // Send message
  const sendMessage = useCallback(async ({ message, matterId, helpContext }: SendMessageParams) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let conversationId = state.conversationId;

      // Create conversation if needed
      if (!conversationId) {
        const contextType: ConversationContextType = matterId ? 'matter' : 'general';
        conversationId = await createConversation(contextType, matterId);
        setState(prev => ({ ...prev, conversationId }));
        contextMatterRef.current = matterId;
      }

      // Add user message to UI immediately
      const userMessage: AIMessage = {
        id: `temp-user-${Date.now()}`,
        conversation_id: conversationId,
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));

      // Build history for API
      const history = state.messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const functionName = agentType === 'guide' && helpContext ? 'genius-help' : 'genius-chat-v2';

      // Call Edge Function
      const { data, error } = await supabase.functions.invoke(functionName, {
        body:
          functionName === 'genius-help'
            ? {
                conversationId,
                message,
                history,
                context: {
                  currentPage: helpContext.currentPage,
                  userLevel: helpContext.userLevel || 'beginner',
                  recentActions: helpContext.recentActions || [],
                },
              }
            : {
                conversationId,
                message,
                contextMatterId: matterId || contextMatterRef.current,
                history,
              },
      });

      if (error) throw error;

      // Add assistant message
      const assistantMessage: AIMessage = {
        id: `temp-assistant-${Date.now()}`,
        conversation_id: conversationId,
        role: 'assistant',
        content: data.content,
        actions_taken: data.actions,
        sources: data.sources,
        response_time_ms: data.responseTimeMs,
        created_at: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setState(prev => ({ ...prev, isLoading: false, error }));
      throw error;
    }
  }, [state.conversationId, state.messages, createConversation, queryClient]);

  // Load existing conversation
  const loadConversation = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, conversationId: id }));

    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const { data: conv } = await supabase
        .from('ai_conversations')
        .select('context_type, context_id, matter_id')
        .eq('id', id)
        .single();

      if (conv?.matter_id) {
        contextMatterRef.current = conv.matter_id;
      }

      // Cast the data properly
      const messages = (data || []).map((m: any) => ({
        ...m,
        sources: m.sources as AIMessage['sources'],
        actions_taken: m.actions_taken as AIMessage['actions_taken'],
        feedback: m.feedback as AIMessage['feedback'],
      })) as AIMessage[];

      setState(prev => ({
        ...prev,
        messages,
        isLoading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Unknown error'),
      }));
    }
  }, []);

  // Start new conversation
  const startNewConversation = useCallback(() => {
    setState({
      conversationId: null,
      messages: [],
      isLoading: false,
      error: null,
    });
    contextMatterRef.current = undefined;
  }, []);

  // Set context matter
  const setContextMatter = useCallback((matterId: string | undefined) => {
    contextMatterRef.current = matterId;
  }, []);

  return {
    ...state,
    sendMessage,
    loadConversation,
    startNewConversation,
    setContextMatter,
    contextMatterId: contextMatterRef.current,
  };
}

// ===== HOOK: Conversations List =====
export function useGeniusConversations(agentType?: AgentType) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['genius-conversations', user?.id, agentType],
    queryFn: async () => {
      let query = supabase
        .from('ai_conversations')
        .select(`
          *,
          matter:matters(id, reference, title)
        `)
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .order('is_pinned', { ascending: false })
        .order('last_message_at', { ascending: false });

      if (agentType) {
        query = query.eq('agent_type', agentType);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as unknown as AIConversation[];
    },
    enabled: !!user?.id,
  });
}

// ===== HOOK: Pin Conversation =====
export function usePinConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ is_pinned: pinned })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genius-conversations'] });
    },
  });
}

// ===== HOOK: Message Feedback =====
export function useGeniusFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      feedback,
      comment,
    }: {
      messageId: string;
      feedback: 'positive' | 'negative';
      comment?: string;
    }) => {
      const { error } = await supabase
        .from('ai_messages')
        .update({
          feedback,
          feedback_comment: comment || null,
        })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-messages'] });
    },
  });
}
