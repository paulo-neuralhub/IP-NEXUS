// src/components/market/messages/MessageThread.tsx
import { useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Image as ImageIcon, FileText } from 'lucide-react';
import type { MarketMessage } from '@/types/market.types';

interface MessageThreadProps {
  messages: MarketMessage[];
  currentUserId: string;
  isLoading?: boolean;
}

export function MessageThread({ messages, currentUserId, isLoading }: MessageThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando mensajes...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No hay mensajes aún. ¡Inicia la conversación!</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isOwn = message.sender_id === currentUserId;
        const sender = message.sender as any;
        const showAvatar = index === 0 || 
          messages[index - 1].sender_id !== message.sender_id;

        return (
          <div
            key={message.id}
            className={cn(
              'flex gap-2',
              isOwn ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {!isOwn && showAvatar && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={sender?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {sender?.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
            {!isOwn && !showAvatar && <div className="w-8" />}

            <div className={cn(
              'max-w-[70%] space-y-1',
              isOwn ? 'items-end' : 'items-start'
            )}>
              <div className={cn(
                'rounded-2xl px-4 py-2',
                isOwn 
                  ? 'bg-primary text-primary-foreground rounded-br-md' 
                  : 'bg-muted rounded-bl-md'
              )}>
                {message.message_type === 'image' && message.attachments?.[0] && (
                  <div className="mb-2">
                    <img 
                      src={message.attachments[0]} 
                      alt="Imagen adjunta"
                      className="rounded-lg max-w-full"
                    />
                  </div>
                )}
                
                {message.message_type === 'file' && message.attachments?.[0] && (
                  <a 
                    href={message.attachments[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm underline mb-2"
                  >
                    <FileText className="h-4 w-4" />
                    Archivo adjunto
                  </a>
                )}

                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              
              <div className={cn(
                'flex items-center gap-1 text-xs text-muted-foreground',
                isOwn ? 'justify-end' : 'justify-start'
              )}>
                <span>
                  {format(new Date(message.created_at), 'HH:mm', { locale: es })}
                </span>
                {isOwn && (
                  message.read_at ? (
                    <CheckCheck className="h-3 w-3 text-primary" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
