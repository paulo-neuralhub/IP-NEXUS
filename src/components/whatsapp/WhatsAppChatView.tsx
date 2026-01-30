/**
 * WhatsApp Chat View Component
 */

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  User, 
  Phone, 
  CheckCheck, 
  Check,
  Image as ImageIcon,
  FileText,
  Mic,
  Video,
  MapPin,
  X,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { WhatsAppConversation, WhatsAppMessage } from '@/types/whatsapp';

interface WhatsAppChatViewProps {
  conversation: WhatsAppConversation;
  messages: WhatsAppMessage[];
  isLoading?: boolean;
  onSendMessage: (content: string) => void;
  isSending?: boolean;
}

export function WhatsAppChatView({
  conversation,
  messages,
  isLoading,
  onSendMessage,
  isSending,
}: WhatsAppChatViewProps) {
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = conversation.client?.full_name || 
    conversation.contact_name || 
    conversation.contact_phone;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation.id]);

  const handleSend = () => {
    if (!messageText.trim() || isSending) return;
    onSendMessage(messageText.trim());
    setMessageText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.client?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{displayName}</span>
              {conversation.client_id && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  <User className="h-3 w-3 mr-1" />
                  Cliente vinculado
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {conversation.contact_phone}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {conversation.client_id && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/app/legal-ops/clients/${conversation.client_id}`}>
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Ver cliente
              </Link>
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Cerrar conversación</DropdownMenuItem>
              <DropdownMenuItem>Archivar</DropdownMenuItem>
              <DropdownMenuItem>Vincular a cliente</DropdownMenuItem>
              <DropdownMenuItem>Añadir etiqueta</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4 bg-[#e5ddd5] dark:bg-muted/30">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-end' : 'justify-start')}>
                <Skeleton className={cn('h-16 rounded-lg', i % 2 === 0 ? 'w-48' : 'w-64')} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              No hay mensajes en esta conversación
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex justify-center mb-4">
                  <Badge variant="secondary" className="bg-white/80 dark:bg-muted">
                    {group.label}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {group.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            placeholder="Escribe un mensaje..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!messageText.trim() || isSending}
            className="shrink-0 bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: WhatsAppMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isOutgoing = message.direction === 'outgoing';
  const time = format(new Date(message.timestamp), 'HH:mm');

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <X className="h-3 w-3 text-destructive" />;
      default:
        return null;
    }
  };

  const getMediaIcon = () => {
    switch (message.message_type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'audio':
        return <Mic className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'location':
        return <MapPin className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex', isOutgoing ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-3 py-2 shadow-sm',
          isOutgoing
            ? 'bg-green-100 dark:bg-green-900/30 rounded-br-none'
            : 'bg-white dark:bg-card rounded-bl-none'
        )}
      >
        {/* Media preview */}
        {message.message_type !== 'text' && (
          <div className="mb-2">
            {message.media_url ? (
              message.message_type === 'image' ? (
                <img 
                  src={message.media_url} 
                  alt="Media" 
                  className="max-w-full rounded-md max-h-48 object-cover"
                />
              ) : (
                <a 
                  href={message.media_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-md hover:bg-muted"
                >
                  {getMediaIcon()}
                  <span className="text-sm truncate">
                    {message.media_filename || 'Archivo adjunto'}
                  </span>
                </a>
              )
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                {getMediaIcon()}
                <span className="text-sm capitalize">{message.message_type}</span>
              </div>
            )}
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {/* Caption for media */}
        {message.media_caption && (
          <p className="text-sm text-muted-foreground mt-1">
            {message.media_caption}
          </p>
        )}

        {/* Time and status */}
        <div className={cn(
          'flex items-center gap-1 mt-1',
          isOutgoing ? 'justify-end' : 'justify-start'
        )}>
          <span className="text-[10px] text-muted-foreground">{time}</span>
          {isOutgoing && getStatusIcon()}
        </div>

        {/* Error message */}
        {message.status === 'failed' && message.error_message && (
          <p className="text-xs text-destructive mt-1">
            {message.error_message}
          </p>
        )}
      </div>
    </div>
  );
}

// Helper to group messages by date
function groupMessagesByDate(messages: WhatsAppMessage[]) {
  const groups: { date: string; label: string; messages: WhatsAppMessage[] }[] = [];
  let currentDate = '';

  messages.forEach((message) => {
    const messageDate = format(new Date(message.timestamp), 'yyyy-MM-dd');
    
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      const date = new Date(message.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let label: string;
      if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        label = 'Hoy';
      } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
        label = 'Ayer';
      } else {
        label = format(date, "d 'de' MMMM, yyyy", { locale: es });
      }

      groups.push({ date: messageDate, label, messages: [] });
    }

    groups[groups.length - 1].messages.push(message);
  });

  return groups;
}
