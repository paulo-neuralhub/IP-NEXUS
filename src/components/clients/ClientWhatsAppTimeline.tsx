/**
 * ClientWhatsAppTimeline - Timeline de mensajes WhatsApp para un cliente
 * Muestra historial de conversación y permite enviar mensajes
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Image as ImageIcon, 
  FileText, 
  Mic,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Loader2,
  Phone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WhatsAppMessage {
  id: string;
  organization_id: string;
  client_id?: string;
  contact_phone: string;
  contact_name?: string;
  direction: 'inbound' | 'outbound';
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location';
  content?: string;
  media_url?: string;
  media_filename?: string;
  media_caption?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  created_at: string;
}

interface ClientWhatsAppTimelineProps {
  clientId: string;
  clientPhone?: string;
  clientName?: string;
}

export function ClientWhatsAppTimeline({ 
  clientId, 
  clientPhone,
  clientName 
}: ClientWhatsAppTimelineProps) {
  const { currentOrganization } = useOrganization();
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentOrganization?.id && clientId) {
      loadMessages();
      const unsubscribe = subscribeToMessages();
      return () => { unsubscribe(); };
    }
  }, [clientId, currentOrganization?.id]);

  useEffect(() => {
    // Scroll al final cuando hay nuevos mensajes
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('client_id', clientId)
        .order('timestamp', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages((data || []) as WhatsAppMessage[]);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`whatsapp-client-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as WhatsAppMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          setMessages(prev => 
            prev.map(msg => msg.id === payload.new.id ? payload.new as WhatsAppMessage : msg)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !clientPhone || !currentOrganization?.id) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          organization_id: currentOrganization.id,
          to_phone: clientPhone,
          message_type: 'text',
          text_content: newMessage,
          contact_id: clientId,
        },
      });

      if (error) throw error;
      if ((data as Record<string, unknown>)?.error) {
        throw new Error((data as Record<string, unknown>)?.message as string || 'Error enviando mensaje');
      }

      setNewMessage('');
      toast.success('Mensaje enviado');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setIsSending(false);
    }
  };

  const renderMessageStatus = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      case 'failed':
        return <span className="text-xs text-destructive">Error</span>;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const renderMessageContent = (msg: WhatsAppMessage) => {
    switch (msg.message_type) {
      case 'image':
        return (
          <div className="space-y-2">
            <img 
              src={msg.media_url} 
              alt="Imagen" 
              className="max-w-[200px] rounded-lg"
            />
            {msg.media_caption && (
              <p className="text-sm">{msg.media_caption}</p>
            )}
          </div>
        );
      case 'document':
        return (
          <a 
            href={msg.media_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <FileText className="h-4 w-4" />
            <span className="text-sm">{msg.media_filename || 'Documento'}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      case 'audio':
        return (
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-muted-foreground" />
            <audio controls src={msg.media_url} className="h-8" />
          </div>
        );
      case 'video':
        return (
          <video 
            src={msg.media_url} 
            controls 
            className="max-w-[200px] rounded-lg"
          />
        );
      case 'location':
        return (
          <div className="text-sm text-muted-foreground">
            📍 Ubicación compartida
          </div>
        );
      default:
        return <p className="text-sm whitespace-pre-wrap">{msg.content}</p>;
    }
  };

  if (!clientPhone) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Phone className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">
            Este cliente no tiene número de teléfono registrado.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Añade un número para ver el historial de WhatsApp.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-[#25D366]" />
            Conversación WhatsApp
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {clientPhone}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Área de mensajes */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                No hay mensajes con este cliente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.direction === 'outbound' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm",
                      msg.direction === 'outbound'
                        ? "bg-[#DCF8C6] text-foreground rounded-br-sm"
                        : "bg-card border rounded-bl-sm"
                    )}
                  >
                    {renderMessageContent(msg)}
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(msg.timestamp), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                      {msg.direction === 'outbound' && renderMessageStatus(msg.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input para enviar mensaje */}
        <div className="p-3 border-t bg-muted/30">
          <div className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={isSending}
              className="flex-1"
            />
            <Button 
              size="icon" 
              onClick={sendMessage}
              disabled={isSending || !newMessage.trim()}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
