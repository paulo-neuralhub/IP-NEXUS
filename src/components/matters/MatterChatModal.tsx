/**
 * MatterChatModal - Modal compacto estilo WhatsApp/Email para expediente
 * Diseño tipo chat con tabs, historial de mensajes y sello automático
 */

import { useEffect, useRef, useState } from 'react';
import { 
  MessageCircle, Mail, Send, Loader2, Paperclip, X,
  Check, CheckCheck, Phone, ArrowDownLeft, ArrowUpRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@/contexts/organization-context';
import { useCommunications, useCreateCommunication } from '@/hooks/legal-ops/useCommunications';
import { useSendWhatsApp } from '@/hooks/use-whatsapp';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Communication } from '@/types/legal-ops';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface MatterChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  matterReference?: string;
  matterTitle?: string;
  clientName?: string | null;
  clientPhone?: string | null;
  clientEmail?: string | null;
  clientId?: string | null;
  defaultTab?: 'whatsapp' | 'email';
}

export function MatterChatModal({
  open,
  onOpenChange,
  matterId,
  matterReference,
  matterTitle,
  clientName,
  clientPhone,
  clientEmail,
  clientId,
  defaultTab = 'whatsapp',
}: MatterChatModalProps) {
  const { currentOrganization } = useOrganization();
  const sendWhatsApp = useSendWhatsApp();
  const createComm = useCreateCommunication();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email'>(defaultTab);
  const [message, setMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Fetch communications for this matter
  const { data: commsResult } = useCommunications({
    matter_id: matterId,
    channel: activeTab === 'whatsapp' ? 'whatsapp' : 'email',
  });

  const communications = commsResult?.data || [];

  // Auto-scroll to bottom when new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [communications, open]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setMessage('');
      setEmailSubject('');
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  // Reference stamp
  const referenceStamp = matterReference ? `[REF: ${matterReference}]` : '';

  // Group messages by date
  const groupedMessages = communications.reduce((groups, comm) => {
    const date = new Date(comm.received_at || comm.created_at);
    const dateKey = format(date, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(comm);
    return groups;
  }, {} as Record<string, Communication[]>);

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoy';
    if (isYesterday(date)) return 'Ayer';
    return format(date, "d 'de' MMMM", { locale: es });
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    if (!currentOrganization?.id) return;

    setIsSending(true);

    try {
      if (activeTab === 'whatsapp') {
        // Build message with reference
        const fullMessage = referenceStamp 
          ? `${referenceStamp}\n\n${message}`
          : message;

        // Create communication record
        await createComm.mutateAsync({
          channel: 'whatsapp',
          direction: 'outbound',
          matter_id: matterId,
          contact_id: clientId || undefined,
          subject: `WhatsApp: ${matterReference || matterTitle}`,
          body: fullMessage,
          whatsapp_to: clientPhone || undefined,
        });

        // Send via WhatsApp API
        if (clientPhone) {
          sendWhatsApp.mutate({
            toPhone: clientPhone,
            messageType: 'text',
            textContent: fullMessage,
            contactId: clientId || undefined,
            matterId, // Link to matter for traceability
          });
        }
      } else {
        // Email
        const subject = emailSubject || `${referenceStamp} ${matterTitle || 'Expediente'}`;
        
        await createComm.mutateAsync({
          channel: 'email',
          direction: 'outbound',
          matter_id: matterId,
          contact_id: clientId || undefined,
          email_to: clientEmail ? [clientEmail] : undefined,
          subject: subject,
          body: message,
        });
      }

      setMessage('');
      setEmailSubject('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && activeTab === 'whatsapp') {
      e.preventDefault();
      handleSend();
    }
  };

  const headerColor = activeTab === 'whatsapp' ? '#075E54' : 'hsl(var(--primary))';
  const contactInfo = activeTab === 'whatsapp' 
    ? clientPhone || 'Sin teléfono'
    : clientEmail || 'Sin email';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="p-0 gap-0 overflow-hidden"
        style={{ maxWidth: '450px', maxHeight: '600px', height: '600px' }}
      >
        <VisuallyHidden>
          <DialogTitle>Chat con {clientName || 'Cliente'}</DialogTitle>
        </VisuallyHidden>
        
        {/* Header - WhatsApp style */}
        <div 
          className="px-4 py-3 text-white flex items-center justify-between"
          style={{ backgroundColor: headerColor }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              {activeTab === 'whatsapp' ? (
                <MessageCircle className="w-5 h-5" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{clientName || 'Cliente'}</p>
              <p className="text-xs text-white/80 truncate">{contactInfo}</p>
              {matterReference && (
                <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                  <span>📁</span>
                  <span className="truncate">{referenceStamp}</span>
                </p>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20 shrink-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as 'whatsapp' | 'email')}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="w-full rounded-none border-b bg-background h-10 p-0">
            <TabsTrigger 
              value="whatsapp" 
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#25D366] data-[state=active]:text-[#25D366] gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger 
              value="email"
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary gap-2"
            >
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* Chat Area */}
          <TabsContent value="whatsapp" className="flex-1 flex flex-col m-0 min-h-0">
            <ChatMessages 
              groupedMessages={groupedMessages}
              formatDateHeader={formatDateHeader}
              scrollRef={scrollRef}
              channel="whatsapp"
            />
            
            {/* Input Area - WhatsApp */}
            <div className="p-3 border-t bg-[#F0F2F5] dark:bg-muted">
              {referenceStamp && (
                <div className="mb-2 px-2 py-1 bg-[#25D366]/10 rounded text-xs text-[#25D366] flex items-center gap-1">
                  <span>🏷️</span>
                  <span>{referenceStamp}</span>
                  <span className="text-muted-foreground ml-1">← Auto</span>
                </div>
              )}
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10">
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                </Button>
                <div className="flex-1">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe mensaje..."
                    className="rounded-full bg-white dark:bg-background"
                  />
                </div>
                <Button 
                  onClick={handleSend}
                  disabled={!message.trim() || isSending || !clientPhone}
                  size="icon"
                  className="shrink-0 h-10 w-10 rounded-full bg-[#25D366] hover:bg-[#128C7E]"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              {!clientPhone && (
                <p className="text-xs text-destructive mt-2">
                  No hay teléfono registrado para el cliente
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="email" className="flex-1 flex flex-col m-0 min-h-0">
            <ChatMessages 
              groupedMessages={groupedMessages}
              formatDateHeader={formatDateHeader}
              scrollRef={scrollRef}
              channel="email"
            />
            
            {/* Input Area - Email */}
            <div className="p-3 border-t bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0">Asunto:</span>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder={`${referenceStamp} ${matterTitle || ''}`}
                  className="h-8 text-sm"
                />
              </div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu email..."
                rows={3}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4 mr-1" />
                  Adjuntar
                </Button>
                <Button 
                  onClick={handleSend}
                  disabled={!message.trim() || isSending || !clientEmail}
                  size="sm"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-1" />
                  )}
                  Enviar
                </Button>
              </div>
              {!clientEmail && (
                <p className="text-xs text-destructive">
                  No hay email registrado para el cliente
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Chat messages component
interface ChatMessagesProps {
  groupedMessages: Record<string, Communication[]>;
  formatDateHeader: (dateStr: string) => string;
  scrollRef: React.RefObject<HTMLDivElement>;
  channel: 'whatsapp' | 'email';
}

function ChatMessages({ groupedMessages, formatDateHeader, scrollRef, channel }: ChatMessagesProps) {
  const sortedDates = Object.keys(groupedMessages).sort();

  if (sortedDates.length === 0) {
    return (
      <div 
        className={cn(
          "flex-1 flex items-center justify-center",
          channel === 'whatsapp' ? "bg-[#ECE5DD] dark:bg-muted/20" : "bg-muted/10"
        )}
        style={{ 
          backgroundImage: channel === 'whatsapp' 
            ? "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
            : "none"
        }}
      >
        <div className="text-center text-muted-foreground">
          <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay mensajes en este expediente</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea 
      className={cn(
        "flex-1",
        channel === 'whatsapp' ? "bg-[#ECE5DD] dark:bg-muted/20" : "bg-muted/10"
      )}
      style={{ 
        backgroundImage: channel === 'whatsapp' 
          ? "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          : "none"
      }}
    >
      <div className="p-3 space-y-3" ref={scrollRef}>
        {sortedDates.map((dateKey) => (
          <div key={dateKey}>
            {/* Date Header */}
            <div className="flex justify-center mb-3">
              <span className="px-3 py-1 bg-white/80 dark:bg-card rounded-full text-xs text-muted-foreground shadow-sm">
                {formatDateHeader(dateKey)}
              </span>
            </div>
            
            {/* Messages */}
            {groupedMessages[dateKey].map((comm) => (
              <MessageBubble 
                key={comm.id} 
                communication={comm} 
                channel={channel}
              />
            ))}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// Message bubble component
interface MessageBubbleProps {
  communication: Communication;
  channel: 'whatsapp' | 'email';
}

function MessageBubble({ communication, channel }: MessageBubbleProps) {
  const isOutbound = communication.direction === 'outbound';
  const time = format(new Date(communication.received_at || communication.created_at), 'HH:mm');
  
  // WhatsApp colors
  const bubbleClass = isOutbound
    ? channel === 'whatsapp' 
      ? 'bg-[#DCF8C6] dark:bg-[#056162] ml-auto' 
      : 'bg-primary/10 ml-auto'
    : 'bg-white dark:bg-card';

  return (
    <div className={cn("flex mb-2", isOutbound ? "justify-end" : "justify-start")}>
      <div 
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-2 shadow-sm relative",
          bubbleClass
        )}
      >
        {/* Subject for email */}
        {channel === 'email' && communication.subject && (
          <p className="text-xs font-medium mb-1 text-muted-foreground">
            {communication.subject}
          </p>
        )}
        
        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {communication.body_preview || communication.body || '[Sin contenido]'}
        </p>
        
        {/* Time and status */}
        <div className={cn(
          "flex items-center gap-1 mt-1",
          isOutbound ? "justify-end" : "justify-start"
        )}>
          <span className="text-[10px] text-muted-foreground">{time}</span>
          {isOutbound && channel === 'whatsapp' && (
            <CheckCheck className="w-3 h-3 text-blue-500" />
          )}
        </div>
      </div>
    </div>
  );
}

export default MatterChatModal;
