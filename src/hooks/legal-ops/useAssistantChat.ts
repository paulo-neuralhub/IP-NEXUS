// ============================================
// src/hooks/legal-ops/useAssistantChat.ts
// AI Assistants Chat Hook
// ============================================

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: AssistantSource[];
  confidence?: number;
  isStreaming?: boolean;
  blocked?: boolean;
}

export interface AssistantSource {
  type: 'document' | 'communication' | 'matter' | 'transcription';
  id: string;
  title: string;
  excerpt: string;
  relevance: number;
  url?: string;
}

export interface AssistantContext {
  client_id?: string;
  matter_id?: string;
  document_ids?: string[];
}

interface UseAssistantChatOptions {
  context?: AssistantContext;
  assistantType: 'internal' | 'portal';
}

export function useAssistantChat({ context, assistantType }: UseAssistantChatOptions) {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (userMessage: string) => {
      if (!currentOrganization?.id) {
        throw new Error('Organization not found');
      }

      setIsLoading(true);
      
      // Add user message
      const userMsg: AssistantMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);

      // Add assistant placeholder
      const assistantMsgId = `assistant-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true
      }]);

      try {
        // Call Edge Function
        const functionName = assistantType === 'internal' 
          ? 'assistant-internal' 
          : 'assistant-portal';
          
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: {
            message: userMessage,
            conversation_history: messages.slice(-10), // Last 10 messages
            context,
            organization_id: currentOrganization.id,
            user_id: user?.id
          }
        });

        if (error) throw error;

        // Update message with response
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: data.response,
                sources: data.sources,
                confidence: data.confidence,
                isStreaming: false,
                blocked: data.blocked
              }
            : msg
        ));

        return data;
      } catch (err) {
        // Remove error message placeholder
        setMessages(prev => prev.filter(msg => msg.id !== assistantMsgId));
        throw err;
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  // Provide feedback
  const provideFeedback = useMutation({
    mutationFn: async ({ 
      messageId, 
      feedback, 
      correction 
    }: { 
      messageId: string; 
      feedback: 'positive' | 'negative' | 'hallucination';
      correction?: string;
    }) => {
      if (!currentOrganization?.id) return;

      // Insert feedback using legalops_ai_interactions table
      const { error } = await supabase.from('legalops_ai_interactions').insert([{
        organization_id: currentOrganization.id,
        user_id: user?.id || null,
        interaction_type: 'feedback',
        input_text: `Feedback for message ${messageId}`,
        output_text: correction || feedback,
        output_metadata: {
          message_id: messageId,
          feedback_type: feedback,
          correction
        }
      }]);

      if (error) throw error;
    }
  });

  return {
    messages,
    isLoading,
    sendMessage,
    clearConversation,
    provideFeedback
  };
}
