/**
 * WhatsAppChatPanel - Chat-like interface for WhatsApp messages within a matter
 * Real chat UI with bubbles, status indicators, and auto-prefixing matter reference
 */

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Send,
  Paperclip,
  Image,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Phone,
  MoreVertical,
  Search,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useOrganization } from '@/contexts/organization-context';

interface WhatsAppChatPanelProps {
  matterId: string;
  matterReference: string;
  clientId?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
  onNewMessage?: () => void;
}

interface WhatsAppMessage {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  sender_name?: string;
}

export function WhatsAppChatPanel({
  matterId,
  matterReference,
  clientId,
  clientName,
  clientPhone,
  onNewMessage
}: WhatsAppChatPanelProps) {
  const { currentOrganization } = useOrganization();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch WhatsApp messages for this matter
  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['whatsapp-chat', matterId],
    queryFn: async () => {
      // Try from communications table first
      const { data: comms, error } = await supabase
        .from('communications')
        .select('id, subject, body_preview, body, direction, received_at, created_at, whatsapp_from, whatsapp_to')
        .eq('matter_id', matterId)
        .eq('channel', 'whatsapp')
        .order('received_at', { ascending: true });

      if (error) throw error;

      return (comms || []).map(comm => ({
        id: comm.id,
        content: comm.body_preview || comm.body || comm.subject || '',
        direction: comm.direction as 'inbound' | 'outbound',
        status: 'sent' as const, // Default status since column doesn't exist
        created_at: comm.received_at || comm.created_at,
        sender_name: comm.direction === 'inbound' ? comm.whatsapp_from : undefined
      }));
    },
    enabled: !!matterId,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!currentOrganization?.id || !clientPhone) {
        throw new Error('Faltan datos para enviar');
      }

      // Prefix with matter reference
      const fullMessage = `[${matterReference}] ${content}`;

      // Call actual WhatsApp API via edge function
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          organization_id: currentOrganization.id,
          to_phone: clientPhone,
          message_type: 'text',
          text_content: fullMessage,
          contact_id: clientId,
          matter_id: matterId,
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any)?.message || 'Error sending message');

      // Also record in communications table for timeline
      await supabase
        .from('communications')
        .insert({
          organization_id: currentOrganization.id,
          channel: 'whatsapp',
          matter_id: matterId,
          direction: 'outbound',
          subject: `WhatsApp - ${matterReference}`,
          body: fullMessage,
          body_preview: fullMessage.substring(0, 200),
          whatsapp_to: clientPhone,
          received_at: new Date().toISOString(),
        });

      return { success: true };
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-chat', matterId] });
      onNewMessage?.();
      toast.success('Mensaje enviado');
    },
    onError: (err: Error) => {
      toast.error(`Error: ${err.message}`);
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    if (!clientPhone) {
      toast.error('El cliente no tiene teléfono configurado');
      return;
    }
    sendMessage.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoy';
    if (isYesterday(date)) return 'Ayer';
    return format(date, "d 'de' MMMM", { locale: es });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = format(new Date(msg.created_at), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {} as Record<string, WhatsAppMessage[]>);

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="h-3.5 w-3.5" />;
      case 'sent':
        return <Check className="h-3.5 w-3.5" />;
      case 'pending':
        return <Clock className="h-3.5 w-3.5" />;
      case 'failed':
        return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
      default:
        return <Check className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#efeae2] dark:bg-slate-900 rounded-lg overflow-hidden border">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#075e54] dark:bg-slate-800 text-white">
        <Avatar className="h-10 w-10 border-2 border-white/20">
          <AvatarFallback className="bg-white/20 text-white">
            {clientName?.substring(0, 2).toUpperCase() || 'CL'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{clientName || 'Cliente'}</p>
          <p className="text-xs text-white/70 truncate">{clientPhone || 'Sin teléfono'}</p>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10">
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Llamar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10">
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Buscar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Más opciones</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Matter reference info */}
      <div className="px-3 py-2 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-900">
        <p className="text-xs text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
          <span className="font-medium">📁 {matterReference}</span>
          <span className="text-amber-600 dark:text-amber-400">- Los mensajes incluirán esta referencia</span>
        </p>
      </div>

      {/* Messages area */}
      <ScrollArea ref={scrollRef} className="flex-1">
        {/* WhatsApp pattern background */}
        <div 
          className="min-h-full px-3 py-4 space-y-3"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2325D366' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#25D366]" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <p className="text-muted-foreground font-medium">Sin mensajes</p>
              <p className="text-sm text-muted-foreground mt-1">
                Los mensajes de WhatsApp aparecerán aquí
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
              <div key={dateKey} className="space-y-2">
                {/* Date separator */}
                <div className="flex justify-center">
                  <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800 shadow-sm text-xs font-normal">
                    {formatMessageDate(dateKey)}
                  </Badge>
                </div>

                {/* Messages for this day */}
                {dayMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-lg px-3 py-2 shadow-sm relative",
                        msg.direction === 'outbound'
                          ? "bg-[#d9fdd3] dark:bg-emerald-900/60 text-foreground"
                          : "bg-white dark:bg-slate-800 text-foreground",
                        // Chat bubble tail
                        msg.direction === 'outbound'
                          ? "rounded-tr-none"
                          : "rounded-tl-none"
                      )}
                    >
                      {/* Sender name for inbound */}
                      {msg.direction === 'inbound' && msg.sender_name && (
                        <p className="text-xs font-medium text-[#128C7E] dark:text-emerald-400 mb-1">
                          {msg.sender_name}
                        </p>
                      )}

                      {/* Message content */}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>

                      {/* Time and status */}
                      <div className={cn(
                        "flex items-center gap-1 mt-1",
                        msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                      )}>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                        {msg.direction === 'outbound' && (
                          <StatusIcon status={msg.status} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="p-3 bg-[#f0f2f5] dark:bg-slate-800 border-t">
        <div className="flex items-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground">
                <Paperclip className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Adjuntar archivo</TooltipContent>
          </Tooltip>

          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="min-h-[40px] max-h-32 resize-none rounded-2xl pr-10 py-2.5 bg-white dark:bg-slate-900 border-0 shadow-sm"
              rows={1}
            />
          </div>

          <Button
            size="icon"
            className={cn(
              "shrink-0 rounded-full h-10 w-10 transition-colors",
              message.trim()
                ? "bg-[#00a884] hover:bg-[#008f72]"
                : "bg-muted text-muted-foreground"
            )}
            onClick={handleSend}
            disabled={!message.trim() || sendMessage.isPending || !clientPhone}
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        {!clientPhone && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            El cliente no tiene teléfono configurado
          </p>
        )}
      </div>
    </div>
  );
}

export default WhatsAppChatPanel;
