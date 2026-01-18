import { supabase } from '@/integrations/supabase/client';
import type { 
  AIMessage, 
  AgentType,
  AIConversation 
} from '@/types/genius';

const SUPABASE_URL = "https://dcdbpmbzizzzzdfkvohl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZGJwbWJ6aXp6enpkZmt2b2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjgzNTcsImV4cCI6MjA4NDMwNDM1N30.m-eYHXgQAPEejDLHKgJQaBiwEB19HJT3zjQSsPqLf5g";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamChatOptions {
  messages: ChatMessage[];
  agentType: AgentType;
  context?: {
    portfolio_summary?: string;
    knowledge_context?: string;
  };
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
}

export class AIService {
  
  // Stream chat with AI
  static async streamChat({
    messages,
    agentType,
    context,
    onDelta,
    onDone,
    onError,
  }: StreamChatOptions): Promise<void> {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      throw new Error('No authenticated session');
    }

    const resp = await fetch(`${SUPABASE_URL}/functions/v1/genius-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ 
        messages, 
        agent_type: agentType,
        context,
        stream: true,
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ error: 'Unknown error' }));
      const error = new Error(errorData.error || `HTTP ${resp.status}`);
      if (onError) {
        onError(error);
      }
      throw error;
    }

    if (!resp.body) {
      throw new Error("Failed to start stream");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore partial leftovers */ }
      }
    }

    onDone();
  }
  
  // Create conversation
  static async createConversation(
    agentType: AgentType, 
    matterId?: string
  ): Promise<AIConversation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');
    
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();
    
    if (!membership) throw new Error('No organization membership');
    
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        organization_id: membership.organization_id,
        user_id: user.id,
        agent_type: agentType,
        matter_id: matterId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as AIConversation;
  }
  
  // Save message
  static async saveMessage(
    conversationId: string, 
    message: Partial<AIMessage>
  ): Promise<AIMessage> {
    const insertData = {
      conversation_id: conversationId,
      role: message.role || 'user',
      content: message.content || '',
      tokens_used: message.tokens_used,
      model_used: message.model_used,
      sources: message.sources,
    };
    
    const { data, error } = await supabase
      .from('ai_messages')
      .insert(insertData as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as AIMessage;
  }
  
  // Give feedback to a message
  static async giveFeedback(
    messageId: string, 
    feedback: 'positive' | 'negative',
    comment?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('ai_messages')
      .update({ feedback, feedback_comment: comment })
      .eq('id', messageId);
    
    if (error) throw error;
  }
  
  // Get portfolio context for OPS agent
  static async getPortfolioContext(organizationId: string): Promise<string> {
    const { data: matters } = await supabase
      .from('matters')
      .select('id, reference, title, type, status, expiry_date')
      .eq('organization_id', organizationId)
      .limit(50);
    
    if (!matters || matters.length === 0) {
      return "El usuario no tiene expedientes en su cartera.";
    }
    
    const summary = matters.map(m => 
      `- ${m.reference}: ${m.title} (${m.type}, ${m.status})${m.expiry_date ? ` - Vence: ${m.expiry_date}` : ''}`
    ).join('\n');
    
    return `El usuario tiene ${matters.length} expedientes:\n${summary}`;
  }
  
  // Search knowledge base
  static async searchKnowledge(query: string): Promise<string> {
    const { data: items } = await supabase
      .from('knowledge_base')
      .select('title, content, source, jurisdiction')
      .textSearch('content', query, { type: 'websearch' })
      .limit(5);
    
    if (!items || items.length === 0) {
      return "";
    }
    
    return items.map(item => 
      `[${item.source || 'Fuente desconocida'} - ${item.jurisdiction || 'General'}]\n${item.title}\n${item.content.slice(0, 500)}...`
    ).join('\n\n---\n\n');
  }
}
