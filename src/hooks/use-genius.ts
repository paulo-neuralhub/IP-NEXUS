import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AIService, ChatMessage } from '@/lib/services/ai-service';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import type { 
  AIConversation, 
  AIMessage, 
  AgentType,
} from '@/types/genius';

// ===== CONVERSACIONES =====
export function useConversations(agentType?: AgentType) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['ai-conversations', user?.id, agentType],
    queryFn: async () => {
      let query = supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'active')
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

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['ai-conversation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select(`
          *,
          matter:matters(id, reference, title)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as AIConversation;
    },
    enabled: !!id,
  });
}

export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: ['ai-messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as unknown as AIMessage[];
    },
    enabled: !!conversationId,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ status: 'archived' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });
}

export function useStarConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, starred }: { id: string; starred: boolean }) => {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ is_starred: starred })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });
}

// ===== CHAT =====
export function useChat(agentType: AgentType) {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const sendMessage = useCallback(async (
    message: string,
    matterId?: string
  ) => {
    setIsStreaming(true);
    setStreamingContent('');
    setError(null);
    
    try {
      // Create conversation if needed
      let convId = conversationId;
      if (!convId) {
        const conv = await AIService.createConversation(agentType, matterId);
        convId = conv.id;
        setConversationId(convId);
      }
      
      // Save user message
      await AIService.saveMessage(convId, {
        role: 'user',
        content: message,
      });
      
      // Build message history for API
      const newMessages: ChatMessage[] = [
        ...messages,
        { role: 'user' as const, content: message },
      ];
      setMessages(newMessages);
      
      // Get context based on agent type
      let context: { portfolio_summary?: string; knowledge_context?: string } = {};
      
      if (agentType === 'ops' && currentOrganization?.id) {
        context.portfolio_summary = await AIService.getPortfolioContext(currentOrganization.id);
      }
      
      if (agentType === 'legal') {
        const knowledgeContext = await AIService.searchKnowledge(message);
        if (knowledgeContext) {
          context.knowledge_context = knowledgeContext;
        }
      }
      
      // Stream response
      let fullContent = '';
      await AIService.streamChat({
        messages: newMessages,
        agentType,
        context,
        onDelta: (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        },
        onDone: async () => {
          // Save assistant message
          await AIService.saveMessage(convId!, {
            role: 'assistant',
            content: fullContent,
            model_used: 'google/gemini-3-flash-preview',
          });
          
          setMessages(prev => [
            ...prev,
            { role: 'assistant' as const, content: fullContent },
          ]);
          
          setStreamingContent('');
          setIsStreaming(false);
          
          queryClient.invalidateQueries({ queryKey: ['ai-messages', convId] });
          queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
        },
        onError: (err) => {
          setError(err);
          setIsStreaming(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsStreaming(false);
    }
  }, [agentType, conversationId, messages, currentOrganization?.id, queryClient]);
  
  const startNewConversation = useCallback(() => {
    setConversationId(null);
    setStreamingContent('');
    setMessages([]);
    setError(null);
  }, []);
  
  const loadConversation = useCallback(async (id: string) => {
    setConversationId(id);
    setStreamingContent('');
    setError(null);
    
    // Load existing messages
    const { data } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })));
    }
  }, []);
  
  return {
    conversationId,
    isLoading: isStreaming,
    isStreaming,
    streamingContent,
    error,
    messages,
    sendMessage,
    startNewConversation,
    loadConversation,
  };
}

// ===== FEEDBACK =====
export function useMessageFeedback() {
  return useMutation({
    mutationFn: async ({ 
      messageId, 
      feedback, 
      comment 
    }: { 
      messageId: string; 
      feedback: 'positive' | 'negative';
      comment?: string;
    }) => {
      return AIService.giveFeedback(messageId, feedback, comment);
    },
  });
}

// ===== DOCUMENTOS GENERADOS =====
export function useGeneratedDocuments(matterId?: string) {
  return useQuery({
    queryKey: ['ai-generated-documents', matterId],
    queryFn: async () => {
      let query = supabase
        .from('ai_generated_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (matterId) {
        query = query.eq('matter_id', matterId);
      }
      
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });
}

// ===== USO =====
export function useAIUsage() {
  const { user } = useAuth();
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
  
  return useQuery({
    queryKey: ['ai-usage', user?.id, currentMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_usage')
        .select('*')
        .eq('user_id', user!.id)
        .eq('period_start', currentMonth)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

// ===== BASE DE CONOCIMIENTO =====
export function useKnowledgeSearch(query: string) {
  return useQuery({
    queryKey: ['knowledge-search', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .textSearch('content', query, { type: 'websearch' })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: query.length > 2,
  });
}

// ===== DOCUMENT ANALYSIS =====
export function useDocumentAnalysis() {
  return useMutation({
    mutationFn: async ({ 
      content, 
      type 
    }: { 
      content: string; 
      type: 'extract' | 'summarize' | 'compare';
    }) => {
      const prompts = {
        summarize: `Resume el siguiente documento de forma clara y concisa:\n\n${content}`,
        extract: `Extrae los datos clave del siguiente documento:\n\n${content}`,
        compare: `Analiza el siguiente documento identificando inconsistencias:\n\n${content}`,
      };
      
      const { data, error } = await supabase.functions.invoke('genius-chat', {
        body: {
          messages: [{ role: 'user', content: prompts[type] }],
          agentType: 'docs',
          context: {},
        },
      });
      
      if (error) throw error;
      
      return { 
        result: typeof data === 'string' ? data : data?.content || '' 
      };
    },
  });
}

// ===== DOCUMENT GENERATION =====
export function useDocumentGeneration() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async ({ 
      templateCode, 
      variables 
    }: { 
      templateCode: string; 
      variables: Record<string, string>;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');
      
      // Build prompt from variables
      const varsText = Object.entries(variables)
        .filter(([_, v]) => v)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n');
      
      const prompt = `Genera un documento profesional basado en:\n${varsText}`;
      
      const { data, error } = await supabase.functions.invoke('genius-chat', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          agentType: 'docs',
          context: {},
        },
      });
      
      if (error) throw error;
      
      const content = typeof data === 'string' ? data : data?.content || '';
      
      // Save to database
      const { data: savedDoc, error: saveError } = await supabase
        .from('ai_generated_documents')
        .insert({
          organization_id: currentOrganization.id,
          document_type: templateCode.replace('legal_', '') as any,
          title: `Documento generado - ${new Date().toLocaleDateString('es-ES')}`,
          content,
          content_format: 'markdown',
          matter_id: variables.matter_id || null,
          created_by: user?.id,
          status: 'draft',
          version: 1,
        })
        .select()
        .single();
      
      if (saveError) throw saveError;
      
      return { 
        content, 
        document_id: savedDoc.id 
      };
    },
  });
}
