import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGeniusProChat, useAIUsage } from '@/hooks/use-genius-pro';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface GeniusChatProps {
  matterId?: string;
  agentType?: string;
  className?: string;
}

export function GeniusChat({ matterId, agentType = 'nexus_ops', className }: GeniusChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { streamChat, isStreaming, streamedContent } = useGeniusProChat();
  const { data: usage } = useAIUsage();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamedContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isStreaming) return;
    
    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      const fullContent = await streamChat({
        messages: [...messages, userMessage],
        agentType,
        matterId,
        onDone: () => {
          // Content is already accumulated via streamedContent
        }
      });
      
      if (fullContent) {
        setMessages(prev => [...prev, { role: 'assistant', content: fullContent }]);
      }
    } catch {
      // Error handled in hook
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <Card className={`flex flex-col h-[600px] max-h-[80vh] ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-100">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold">Genius AI</h3>
            <p className="text-xs text-muted-foreground">
              Asistente inteligente
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {usage && (
            <Badge variant="outline" className="text-xs">
              {usage.messages_count || 0} mensajes este mes
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearConversation}>
            Nueva conversación
          </Button>
        </div>
      </div>
      
      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && !streamedContent && (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 mx-auto text-purple-300 mb-4" />
              <h4 className="font-semibold text-lg mb-2">
                ¡Hola! Soy Genius
              </h4>
              <p className="text-muted-foreground max-w-md mx-auto">
                Puedo ayudarte con consultas sobre propiedad intelectual, 
                analizar documentos, y responder preguntas sobre tus expedientes.
              </p>
              
              {/* Quick prompts */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {[
                  '¿Qué es una oposición de marca?',
                  'Plazos de renovación en la UE',
                  'Diferencia entre marca y patente'
                ].map(prompt => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(prompt)}
                    className="text-xs"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((message, idx) => (
            <MessageBubble key={idx} message={message} />
          ))}
          
          {/* Streaming content */}
          {isStreaming && streamedContent && (
            <MessageBubble
              message={{
                role: 'assistant',
                content: streamedContent
              }}
              isStreaming
            />
          )}
          
          {/* Loading indicator */}
          {isStreaming && !streamedContent && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Pensando...</span>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="resize-none pr-10"
              rows={1}
              disabled={isStreaming}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          <Button type="submit" disabled={!input.trim() || isStreaming}>
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Genius puede cometer errores. Verifica la información importante.
        </p>
      </form>
    </Card>
  );
}

function MessageBubble({ 
  message, 
  isStreaming = false 
}: { 
  message: Message; 
  isStreaming?: boolean 
}) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`shrink-0 p-2 rounded-full h-8 w-8 flex items-center justify-center ${
        isUser ? 'bg-blue-100' : 'bg-purple-100'
      }`}>
        {isUser ? (
          <User className="h-4 w-4 text-blue-600" />
        ) : (
          <Bot className="h-4 w-4 text-purple-600" />
        )}
      </div>
      
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block p-3 rounded-lg ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-slate-100 text-slate-900'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1" />
          )}
        </div>
      </div>
    </div>
  );
}
