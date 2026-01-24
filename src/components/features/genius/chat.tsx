import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown,
  Copy,
  RotateCcw,
  Loader2,
  Bot,
  User,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { useChat, useConversationMessages, useMessageFeedback } from '@/hooks/use-genius';
import { AGENTS, QUICK_PROMPTS } from '@/lib/constants/genius';
import type { AgentType, AIMessage } from '@/types/genius';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLegalCheck } from '@/hooks/legal/useLegalCheck';

interface Props {
  agentType: AgentType;
  matterId?: string;
  initialConversationId?: string;
  onConversationChange?: (id: string) => void;
}

export function GeniusChat({ 
  agentType, 
  matterId,
  initialConversationId,
  onConversationChange 
}: Props) {
  const agent = AGENTS[agentType];
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { needsAcceptance, modal, isChecking } = useLegalCheck('ai_disclaimer');
  
  const [input, setInput] = useState('');
  
  const {
    conversationId,
    isLoading,
    isStreaming,
    streamingContent,
    messages: chatMessages,
    sendMessage,
    startNewConversation,
    loadConversation,
  } = useChat(agentType);
  
  const { data: dbMessages = [] } = useConversationMessages(conversationId || '');
  const feedbackMutation = useMessageFeedback();
  
  // Combine DB messages (for history) with current chat messages
  const displayMessages = conversationId && dbMessages.length > 0 ? dbMessages : [];
  
  // Load initial conversation
  useEffect(() => {
    if (initialConversationId) {
      loadConversation(initialConversationId);
    }
  }, [initialConversationId, loadConversation]);
  
  // Notify conversation change
  useEffect(() => {
    if (conversationId && onConversationChange) {
      onConversationChange(conversationId);
    }
  }, [conversationId, onConversationChange]);
  
  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, streamingContent]);
  
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    
    try {
      await sendMessage(message, matterId);
    } catch (error) {
      toast({ 
        variant: 'destructive',
        title: 'Error al enviar mensaje',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };
  
  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };
  
  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    await feedbackMutation.mutateAsync({ messageId, feedback });
    toast({ title: 'Gracias por tu feedback' });
  };
  
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copiado al portapapeles' });
  };
  
  if (isChecking) {
    return null;
  }

  return (
    <>
      {modal}
      {needsAcceptance ? null : (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div 
            className="px-4 py-3 border-b flex items-center gap-3"
            style={{ borderColor: `${agent.color}30` }}
          >
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${agent.color}20` }}
        >
          <Sparkles className="w-5 h-5" style={{ color: agent.color }} />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{agent.name}</h2>
          <p className="text-xs text-muted-foreground">{agent.description}</p>
        </div>
        {conversationId && (
          <button
            onClick={startNewConversation}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            Nueva conversación
          </button>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.length === 0 && !isLoading && !streamingContent && (
          <EmptyState 
            agent={agent} 
            quickPrompts={QUICK_PROMPTS[agentType]}
            onSelectPrompt={handleQuickPrompt}
          />
        )}
        
        {displayMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            agentColor={agent.color}
            onFeedback={handleFeedback}
            onCopy={handleCopy}
          />
        ))}
        
        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <div className="flex gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${agent.color}20` }}
            >
              <Bot className="w-4 h-4" style={{ color: agent.color }} />
            </div>
            <div className="flex-1 bg-card rounded-xl p-4 border shadow-sm">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{streamingContent}</ReactMarkdown>
              </div>
              <span className="inline-block w-2 h-4 bg-muted-foreground animate-pulse ml-1" />
            </div>
          </div>
        )}
        
        {/* Loading */}
        {isLoading && !isStreaming && !streamingContent && (
          <div className="flex gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${agent.color}20` }}
            >
              <Bot className="w-4 h-4" style={{ color: agent.color }} />
            </div>
            <div className="bg-card rounded-xl p-4 border shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={`Pregunta a ${agent.name}...`}
            rows={1}
            className="flex-1 resize-none rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Las respuestas de IA son orientativas y no sustituyen asesoramiento profesional
        </p>
          </form>
        </div>
      )}
    </>
  );
}

// ===== EMPTY STATE =====
function EmptyState({ 
  agent, 
  quickPrompts,
  onSelectPrompt 
}: { 
  agent: typeof AGENTS[AgentType];
  quickPrompts: string[];
  onSelectPrompt: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div 
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${agent.color}20` }}
      >
        <Sparkles className="w-8 h-8" style={{ color: agent.color }} />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {agent.name}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {agent.description}. Puedo ayudarte con:
      </p>
      <ul className="text-sm text-muted-foreground mb-6 space-y-1">
        {agent.capabilities.map((cap, i) => (
          <li key={i}>✓ {cap}</li>
        ))}
      </ul>
      
      <div className="w-full max-w-md">
        <p className="text-sm text-muted-foreground mb-3">Prueba con:</p>
        <div className="grid grid-cols-1 gap-2">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSelectPrompt(prompt)}
              className="text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-sm"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== MESSAGE BUBBLE =====
function MessageBubble({ 
  message,
  agentColor,
  onFeedback,
  onCopy
}: { 
  message: AIMessage;
  agentColor: string;
  onFeedback: (id: string, feedback: 'positive' | 'negative') => void;
  onCopy: (content: string) => void;
}) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div 
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          isUser ? "bg-muted" : ""
        )}
        style={!isUser ? { backgroundColor: `${agentColor}20` } : undefined}
      >
        {isUser ? (
          <User className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Bot className="w-4 h-4" style={{ color: agentColor }} />
        )}
      </div>
      
      {/* Content */}
      <div className={cn(
        "flex-1 max-w-[80%]",
        isUser && "flex flex-col items-end"
      )}>
        <div className={cn(
          "rounded-xl p-4",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-card border shadow-sm"
        )}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.sources.map((source, i) => (
              <span 
                key={i}
                className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
              >
                📄 {source.title}
              </span>
            ))}
          </div>
        )}
        
        {/* Actions for assistant messages */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onCopy(message.content)}
              className="p-1 text-muted-foreground hover:text-foreground"
              title="Copiar"
            >
              <Copy className="w-4 h-4" />
            </button>
            {!message.feedback && (
              <>
                <button
                  onClick={() => onFeedback(message.id, 'positive')}
                  className="p-1 text-muted-foreground hover:text-green-600"
                  title="Útil"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onFeedback(message.id, 'negative')}
                  className="p-1 text-muted-foreground hover:text-red-600"
                  title="No útil"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </>
            )}
            {message.feedback === 'positive' && (
              <ThumbsUp className="w-4 h-4 text-green-500" />
            )}
            {message.feedback === 'negative' && (
              <ThumbsDown className="w-4 h-4 text-red-500" />
            )}
          </div>
        )}
        
        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(message.created_at), { 
            addSuffix: true, 
            locale: es 
          })}
        </p>
      </div>
    </div>
  );
}
