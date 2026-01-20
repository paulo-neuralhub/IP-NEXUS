// ============================================
// src/components/legal-ops/AssistantChat.tsx
// Internal AI Assistant Chat Component
// ============================================

import { useState, useRef, useEffect } from 'react';
import { useAssistantChat, type AssistantMessage, type AssistantSource } from '@/hooks/legal-ops/useAssistantChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Bot, User, Send, Trash2, ThumbsUp, ThumbsDown, 
  AlertTriangle, FileText, Loader2, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssistantChatProps {
  context?: {
    client_id?: string;
    matter_id?: string;
  };
  title?: string;
  className?: string;
}

export function AssistantChat({ 
  context, 
  title = 'Asistente Legal IA',
  className 
}: AssistantChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearConversation,
    provideFeedback 
  } = useAssistantChat({ 
    context, 
    assistantType: 'internal' 
  });

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    sendMessage.mutate(input);
    setInput('');
  };

  const handleFeedback = (messageId: string, type: 'positive' | 'negative' | 'hallucination') => {
    provideFeedback.mutate({ messageId, feedback: type });
  };

  return (
    <Card className={cn("flex flex-col h-[600px]", className)}>
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            {title}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearConversation}
            disabled={messages.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Permanent Disclaimer */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Importante:</strong> Las respuestas son generadas por IA y pueden contener errores. 
              Verifique siempre la información antes de actuar. Este asistente NO sustituye 
              el criterio profesional.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">¿En qué puedo ayudarte?</p>
                <p className="text-xs mt-2 max-w-[250px] mx-auto">
                  Puedo buscar en documentos, resumir comunicaciones y ayudarte con el expediente.
                </p>
                
                {/* Quick prompts */}
                <div className="mt-4 space-y-2">
                  {[
                    'Resúmeme las últimas comunicaciones',
                    '¿Cuáles son los próximos vencimientos?',
                    'Busca información sobre renovaciones'
                  ].map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        setInput(prompt);
                        sendMessage.mutate(prompt);
                        setInput('');
                      }}
                    >
                      <MessageSquare className="w-3 h-3 mr-2" />
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg}
                  onFeedback={(type) => handleFeedback(msg.id, type)}
                />
              ))
            )}
            
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Pensando...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Message Bubble Component
interface MessageBubbleProps {
  message: AssistantMessage;
  onFeedback: (type: 'positive' | 'negative' | 'hallucination') => void;
}

function MessageBubble({ message, onFeedback }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[85%] rounded-lg p-3",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted"
      )}>
        <div className="flex items-start gap-2">
          {!isUser && <Bot className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />}
          {isUser && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          
          <div className="flex-1 min-w-0">
            {/* Message content */}
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.isStreaming && !message.content ? (
                <span className="italic opacity-70">Generando respuesta...</span>
              ) : (
                message.content
              )}
            </div>

            {/* Sources (assistant only) */}
            {!isUser && message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Fuentes consultadas:
                </p>
                <div className="space-y-1">
                  {message.sources.map((source, idx) => (
                    <SourceItem key={idx} source={source} />
                  ))}
                </div>
              </div>
            )}

            {/* Confidence and feedback (assistant only) */}
            {!isUser && !message.isStreaming && (
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  {message.confidence !== undefined && (
                    <Badge 
                      variant={message.confidence >= 0.7 ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      Confianza: {Math.round(message.confidence * 100)}%
                    </Badge>
                  )}
                </div>
                
                <TooltipProvider>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => onFeedback('positive')}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Útil</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => onFeedback('negative')}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>No útil</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-[10px] text-destructive"
                          onClick={() => onFeedback('hallucination')}
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Error
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reportar información incorrecta</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Source Item Component
function SourceItem({ source }: { source: AssistantSource }) {
  return (
    <div className="flex items-center gap-2 text-xs p-1.5 bg-background/50 rounded">
      <FileText className="w-3 h-3 flex-shrink-0" />
      <span className="flex-1 truncate">{source.title}</span>
      <Badge variant="outline" className="text-[10px]">
        {Math.round(source.relevance * 100)}%
      </Badge>
    </div>
  );
}
