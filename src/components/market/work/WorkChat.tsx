// src/components/market/work/WorkChat.tsx
import { useRef, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useWorkMessages, useSendWorkMessage, type WorkMessage } from '@/hooks/market/useWorkflow';

interface WorkChatProps {
  transactionId: string;
  currentUserId: string;
  recipientId: string;
  isReadOnly?: boolean;
}

export function WorkChat({ transactionId, currentUserId, recipientId, isReadOnly = false }: WorkChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; url: string; type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: messages = [], isLoading, refetch } = useWorkMessages(transactionId);
  const sendMessage = useSendWorkMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    await sendMessage.mutateAsync({
      transactionId,
      recipientId,
      content: message,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    setMessage('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // For demo, create mock URLs - in real app, upload to storage
    Array.from(files).forEach(file => {
      setAttachments(prev => [...prev, {
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      }]);
    });
  };

  const renderMessage = (msg: WorkMessage, index: number) => {
    const isOwn = msg.sender_id === currentUserId;
    const isSystem = msg.content?.startsWith('✅') || msg.content?.startsWith('🔄') || msg.content?.startsWith('❌');
    const sender = msg.sender;
    const showAvatar = index === 0 || messages[index - 1]?.sender_id !== msg.sender_id;

    if (isSystem) {
      return (
        <div key={msg.id} className="flex justify-center my-4">
          <div className="bg-muted px-4 py-2 rounded-full text-sm text-muted-foreground">
            {msg.content}
          </div>
        </div>
      );
    }

    return (
      <div
        key={msg.id}
        className={cn(
          'flex gap-2 mb-2',
          isOwn ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {!isOwn && showAvatar && (
          <Avatar className="h-8 w-8 mt-1 shrink-0">
            <AvatarImage src={sender?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {sender?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
        {!isOwn && !showAvatar && <div className="w-8 shrink-0" />}

        <div className={cn(
          'max-w-[70%] space-y-1',
          isOwn ? 'items-end' : 'items-start'
        )}>
          {showAvatar && !isOwn && (
            <span className="text-xs text-muted-foreground ml-1">
              {sender?.display_name || 'Usuario'}
            </span>
          )}
          
          <div className={cn(
            'rounded-2xl px-4 py-2',
            isOwn 
              ? 'bg-primary text-primary-foreground rounded-br-md' 
              : 'bg-muted rounded-bl-md'
          )}>
            {/* Attachments */}
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="space-y-1 mb-2">
                {msg.attachments.map((att, idx) => (
                  <a 
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    {att.type?.startsWith('image/') ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    {att.name}
                  </a>
                ))}
              </div>
            )}
            
            {msg.content && (
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            )}
          </div>
          
          <div className={cn(
            'flex items-center gap-1 text-xs text-muted-foreground',
            isOwn ? 'justify-end' : 'justify-start'
          )}>
            <span>
              {format(new Date(msg.created_at), 'HH:mm', { locale: es })}
            </span>
            {isOwn && msg.is_read && (
              <CheckCircle className="h-3 w-3 text-primary" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Mensajes del Trabajo</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-muted-foreground">Cargando mensajes...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>No hay mensajes aún</p>
              <p className="text-sm">Inicia la conversación con el otro participante</p>
            </div>
          ) : (
            messages.map((msg, idx) => renderMessage(msg, idx))
          )}
        </div>

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 border-t bg-muted/50">
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-background rounded-md px-2 py-1 text-sm">
                  <FileText className="h-4 w-4" />
                  <span className="max-w-[150px] truncate">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        {!isReadOnly && (
          <div className="p-4 border-t">
            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
              
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                className="min-h-[44px] max-h-[120px] resize-none"
                rows={1}
              />
              
              <Button
                type="button"
                onClick={handleSend}
                disabled={(!message.trim() && attachments.length === 0) || sendMessage.isPending}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
