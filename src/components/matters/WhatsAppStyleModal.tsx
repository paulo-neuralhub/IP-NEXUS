/**
 * WhatsAppStyleModal - Modal de WhatsApp con diseño realista tipo app
 * Incluye referencia bloqueada, plantillas y historial de chat
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Phone,
  Video,
  MoreVertical,
  Search,
  Loader2,
  Smile,
  FileText,
  X,
  ArrowLeft
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useOrganization } from '@/contexts/organization-context';

interface WhatsAppStyleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  matterReference: string;
  matterTitle?: string;
  matterType?: string;
  jurisdiction?: string;
  clientId?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
}

interface WhatsAppMessage {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  sender_name?: string;
}

// WhatsApp templates
const WHATSAPP_TEMPLATES = [
  { id: 'status_update', name: 'Actualización de estado', text: 'Hola {nombre}! Le informamos que su expediente {referencia} ha sido actualizado. ¿Tiene alguna pregunta?' },
  { id: 'deadline_reminder', name: 'Recordatorio de plazo', text: 'Hola {nombre}! Le recordamos que tiene un plazo próximo para su expediente {referencia}. Por favor, contacte con nosotros si necesita más información.' },
  { id: 'doc_send', name: 'Envío de documentos', text: 'Hola {nombre}! Le adjuntamos documentos importantes relacionados con su expediente {referencia}. Por favor, revíselos cuando le sea posible.' },
  { id: 'info_request', name: 'Solicitud de información', text: 'Hola {nombre}! Necesitamos información adicional para continuar con su expediente {referencia}. ¿Podría facilitárnosla?' },
  { id: 'confirmation', name: 'Confirmación de recepción', text: 'Hola {nombre}! Confirmamos la recepción de su documentación para el expediente {referencia}. Procederemos con los siguientes pasos.' },
  { id: 'quote', name: 'Presupuesto', text: 'Hola {nombre}! Le enviamos el presupuesto solicitado para {referencia}. Quedo a su disposición para cualquier aclaración.' },
];

export function WhatsAppStyleModal({
  open,
  onOpenChange,
  matterId,
  matterReference,
  matterTitle,
  matterType,
  jurisdiction,
  clientId,
  clientName,
  clientPhone: initialClientPhone,
}: WhatsAppStyleModalProps) {
  const { currentOrganization } = useOrganization();
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState(initialClientPhone || '');
  const [showTemplates, setShowTemplates] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setPhone(initialClientPhone || '');
  }, [initialClientPhone, open]);

  // Fetch WhatsApp messages for this matter
  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['whatsapp-chat-modal', matterId],
    queryFn: async () => {
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
        status: 'sent' as const,
        created_at: comm.received_at || comm.created_at,
        sender_name: comm.direction === 'inbound' ? comm.whatsapp_from : undefined
      }));
    },
    enabled: !!matterId && open,
    refetchInterval: 10000,
  });

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current && open) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, [messages, open]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!currentOrganization?.id || !phone) {
        throw new Error('Faltan datos para enviar');
      }

      // Prefix with matter reference
      const fullMessage = `[REF: ${matterReference}]\n${content}`;

      const { error } = await supabase
        .from('communications')
        .insert({
          organization_id: currentOrganization.id,
          channel: 'whatsapp',
          matter_id: matterId,
          direction: 'outbound',
          subject: `WhatsApp - ${matterReference}`,
          body: fullMessage,
          body_preview: fullMessage.substring(0, 200),
          whatsapp_to: phone,
          received_at: new Date().toISOString(),
        });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-chat-modal', matterId] });
      toast.success('Mensaje enviado');
    },
    onError: (err: Error) => {
      toast.error(`Error: ${err.message}`);
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    if (!phone) {
      toast.error('Introduce el número de teléfono');
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

  const handleTemplateSelect = (template: typeof WHATSAPP_TEMPLATES[0]) => {
    const text = template.text
      .replace(/{nombre}/g, clientName?.split(' ')[0] || 'Cliente')
      .replace(/{referencia}/g, matterReference);
    setMessage(text);
    setShowTemplates(false);
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
        return <CheckCheck className="h-3.5 w-3.5 text-blue-400" />;
      case 'delivered':
        return <CheckCheck className="h-3.5 w-3.5 text-slate-400" />;
      case 'sent':
        return <Check className="h-3.5 w-3.5 text-slate-400" />;
      case 'pending':
        return <Clock className="h-3.5 w-3.5 text-slate-400" />;
      case 'failed':
        return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
      default:
        return <Check className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[85vh] [&>button]:hidden">
        {/* WhatsApp Header - Dark Green */}
        <div className="flex items-center gap-3 px-3 py-2" style={{ background: '#075e54' }}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 border border-white/20">
            <AvatarFallback className="bg-white/20 text-white text-sm">
              {clientName?.substring(0, 2).toUpperCase() || 'CL'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate text-sm">{clientName || 'Cliente'}</p>
            <p className="text-xs text-white/70">en línea</p>
          </div>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Phone input if not set */}
        {!initialClientPhone && (
          <div className="px-3 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <Input 
              type="tel" 
              placeholder="+34 612 345 678" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              className="h-8 text-sm flex-1"
            />
          </div>
        )}

        {/* Chat area with WhatsApp pattern */}
        <ScrollArea 
          ref={scrollRef} 
          className="flex-1" 
          style={{ height: '400px', background: '#e5ddd5' }}
        >
          <div 
            className="min-h-full px-3 py-3 space-y-2"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2325D366' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            {/* Fixed Matter Reference Bubble */}
            <div className="flex justify-center mb-3">
              <div 
                className="px-4 py-3 rounded-xl text-xs max-w-[90%]"
                style={{ 
                  background: 'linear-gradient(135deg, #ecfeff 0%, #dbeafe 100%)',
                  border: '1px solid #a5d8ff'
                }}
              >
                <div className="flex items-center gap-2 text-cyan-800 font-semibold">
                  <span>📋</span>
                  <span>Expediente: {matterReference}</span>
                </div>
                <p className="text-cyan-700 mt-1">
                  {matterTitle || matterType || 'Expediente'}{jurisdiction ? ` • ${jurisdiction}` : ''}
                </p>
                <p className="text-[10px] text-cyan-600/70 mt-1">
                  Esta referencia se incluirá en todos los mensajes
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-3">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#25D366]" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <p className="text-slate-600 font-medium text-sm">Sin mensajes</p>
                <p className="text-xs text-slate-500 mt-1">Inicia la conversación</p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
                <div key={dateKey} className="space-y-1.5">
                  {/* Date separator */}
                  <div className="flex justify-center py-1">
                    <Badge className="bg-white/90 text-slate-600 shadow-sm text-[10px] font-normal px-2 py-0.5">
                      {formatMessageDate(dateKey)}
                    </Badge>
                  </div>

                  {/* Messages for this day */}
                  {dayMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn("flex", msg.direction === 'outbound' ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-2.5 py-1.5 shadow-sm relative",
                          msg.direction === 'outbound'
                            ? "bg-[#d9fdd3] rounded-tr-none"
                            : "bg-white rounded-tl-none"
                        )}
                      >
                        {msg.direction === 'inbound' && msg.sender_name && (
                          <p className="text-[11px] font-medium text-[#128C7E] mb-0.5">
                            {msg.sender_name}
                          </p>
                        )}
                        <p className="text-[13px] text-slate-800 whitespace-pre-wrap break-words leading-snug">
                          {msg.content}
                        </p>
                        <div className={cn(
                          "flex items-center gap-0.5 mt-0.5",
                          msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                        )}>
                          <span className="text-[10px] text-slate-500">
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

        {/* Input area - WhatsApp style */}
        <div className="px-2 py-2" style={{ background: '#f0f2f5' }}>
          <div className="flex items-center gap-1">
            {/* Emoji button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0 h-9 w-9 text-[#54656f] hover:text-[#3b4a54] hover:bg-transparent rounded-full"
            >
              <Smile className="h-6 w-6" />
            </Button>

            {/* Template button */}
            <Popover open={showTemplates} onOpenChange={setShowTemplates}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0 h-9 w-9 text-[#54656f] hover:text-[#3b4a54] hover:bg-transparent rounded-full"
                >
                  <FileText className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" side="top" align="start">
                <p className="text-xs font-semibold text-slate-500 mb-2 px-1">Plantillas</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {WHATSAPP_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-100 text-sm text-slate-700 transition-colors"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Attach button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0 h-9 w-9 text-[#54656f] hover:text-[#3b4a54] hover:bg-transparent rounded-full"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            {/* Message input - WhatsApp style rounded field */}
            <div className="flex-1">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe un mensaje"
                className="w-full h-[42px] rounded-[21px] px-4 bg-white border-0 text-[15px] text-[#3b4a54] placeholder:text-[#8696a0] focus:outline-none"
                style={{
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                }}
              />
            </div>

            {/* Send button - WhatsApp green circle */}
            <Button
              size="icon"
              className={cn(
                "shrink-0 rounded-full h-[42px] w-[42px] transition-colors ml-1",
                message.trim()
                  ? "bg-[#00a884] hover:bg-[#008f72] shadow-sm"
                  : "bg-[#00a884] opacity-50"
              )}
              onClick={handleSend}
              disabled={!message.trim() || sendMessage.isPending || !phone}
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Send className="h-5 w-5 text-white" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
