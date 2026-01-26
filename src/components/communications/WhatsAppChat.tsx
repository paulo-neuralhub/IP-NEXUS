import { useState, useRef, useEffect, useCallback } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Image as ImageIcon,
  FileText,
  Video,
  X,
  Check,
  CheckCheck,
  Phone,
  MoreVertical,
  ArrowLeft,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useWhatsAppMessages, WhatsAppMessage } from '@/hooks/communications/useWhatsAppMessages';
import { ImageViewer } from './ImageViewer';
import { AudioPlayer } from './AudioPlayer';
import { VoiceRecorder } from './VoiceRecorder';
import { DateSeparator } from '@/components/ui/date-separator';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  email?: string;
}

interface WhatsAppChatProps {
  contact: Contact;
  onBack?: () => void;
  className?: string;
}

export function WhatsAppChat({ contact, onBack, className }: WhatsAppChatProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, uploadMedia } = useWhatsAppMessages(contact.id);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString('es-ES');
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {} as Record<string, WhatsAppMessage[]>);

  const handleSendMessage = async () => {
    if (!message.trim() || !contact.phone) return;

    try {
      await sendMessage.mutateAsync({
        contactId: contact.id,
        recipientPhone: contact.phone,
        content: message.trim(),
      });
      setMessage('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = async (acceptType: string) => {
    if (!fileInputRef.current) return;
    fileInputRef.current.accept = acceptType;
    fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contact.phone) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    setIsUploading(true);
    try {
      const { url, name, size } = await uploadMedia(file);
      
      let mediaType: 'image' | 'video' | 'audio' | 'document' = 'document';
      if (file.type.startsWith('image/')) mediaType = 'image';
      else if (file.type.startsWith('video/')) mediaType = 'video';
      else if (file.type.startsWith('audio/')) mediaType = 'audio';

      await sendMessage.mutateAsync({
        contactId: contact.id,
        recipientPhone: contact.phone,
        mediaType,
        mediaUrl: url,
        mediaName: name,
        mediaSize: size,
      });
    } catch (error) {
      toast.error('Error al subir el archivo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVoiceRecordingComplete = async (blob: Blob, duration: number) => {
    if (!contact.phone) return;

    setIsUploading(true);
    try {
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      const { url, name, size } = await uploadMedia(file);

      await sendMessage.mutateAsync({
        contactId: contact.id,
        recipientPhone: contact.phone,
        mediaType: 'audio',
        mediaUrl: url,
        mediaName: name,
        mediaSize: size,
      });
    } catch (error) {
      toast.error('Error al enviar nota de voz');
    } finally {
      setIsUploading(false);
      setIsRecording(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-[#53bdeb]" />;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header - WhatsApp style */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#075e54] text-white">
        {onBack && (
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={contact.avatar_url} />
          <AvatarFallback className="bg-[#00a884] text-white">
            {getInitials(contact.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{contact.name}</h3>
          <p className="text-xs text-white/70 truncate">{contact.phone}</p>
        </div>

        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Phone className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages area - WhatsApp style background */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ 
          backgroundColor: '#e5ddd5',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ccc7c1" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        <div className="max-w-3xl mx-auto space-y-2">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <DateSeparator date={formatDate(date)} />
              
              {msgs.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onImageClick={setViewingImage}
                  formatTime={formatTime}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </div>
          ))}

          {messages.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500 bg-white/80 inline-block px-4 py-2 rounded-lg">
                No hay mensajes. ¡Inicia la conversación!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Input area - WhatsApp style */}
      <div className="flex items-center gap-2 p-2 bg-[#f0f2f5]">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Emoji picker */}
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Smile className="w-6 h-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-0" align="start" side="top">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={Theme.LIGHT}
              width={350}
              height={400}
              searchPlaceholder="Buscar emoji..."
              previewConfig={{ showPreview: false }}
            />
          </PopoverContent>
        </Popover>

        {/* Attachment menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Paperclip className="w-6 h-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => handleFileSelect('image/*')}>
              <ImageIcon className="w-4 h-4 mr-2 text-blue-500" />
              Fotos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFileSelect('.pdf,.doc,.docx,.xls,.xlsx')}>
              <FileText className="w-4 h-4 mr-2 text-purple-500" />
              Documentos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFileSelect('video/*')}>
              <Video className="w-4 h-4 mr-2 text-red-500" />
              Videos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Message input or voice recorder */}
        {isRecording ? (
          <VoiceRecorder
            isRecording={isRecording}
            onStartRecording={() => setIsRecording(true)}
            onRecordingComplete={handleVoiceRecordingComplete}
            onCancel={() => setIsRecording(false)}
          />
        ) : (
          <>
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje"
              className="flex-1 bg-white border-0 rounded-full px-4"
              disabled={isUploading}
            />

            {message.trim() ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-[#00a884] hover:text-[#008f72]"
                onClick={handleSendMessage}
                disabled={sendMessage.isPending || isUploading}
              >
                <Send className="w-6 h-6" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-[#00a884]"
                onClick={() => setIsRecording(true)}
              >
                <Mic className="w-6 h-6" />
              </Button>
            )}
          </>
        )}
      </div>

      {/* Image viewer */}
      {viewingImage && (
        <ImageViewer
          src={viewingImage}
          onClose={() => setViewingImage(null)}
        />
      )}
    </div>
  );
}

// Message bubble component
interface MessageBubbleProps {
  message: WhatsAppMessage;
  onImageClick: (url: string) => void;
  formatTime: (date: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

function MessageBubble({ message, onImageClick, formatTime, getStatusIcon }: MessageBubbleProps) {
  const isOutbound = message.direction === 'outbound';

  return (
    <div className={cn('flex mb-1', isOutbound ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[65%] rounded-lg px-3 py-2 shadow-sm relative',
          isOutbound 
            ? 'bg-[#dcf8c6] rounded-tr-none' 
            : 'bg-white rounded-tl-none'
        )}
      >
        {/* Media content */}
        {message.media_type === 'image' && message.media_url && (
          <img
            src={message.media_url}
            alt="Image"
            className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity mb-1"
            onClick={() => onImageClick(message.media_url!)}
          />
        )}

        {message.media_type === 'video' && message.media_url && (
          <video
            src={message.media_url}
            controls
            className="rounded-lg max-w-full mb-1"
          />
        )}

        {message.media_type === 'audio' && message.media_url && (
          <AudioPlayer src={message.media_url} className="mb-1" />
        )}

        {message.media_type === 'document' && message.media_url && (
          <a
            href={message.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors mb-1"
          >
            <FileText className="w-8 h-8 text-red-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.media_name || 'Documento'}</p>
              {message.media_size && (
                <p className="text-xs text-gray-500">
                  {(message.media_size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
            <Download className="w-4 h-4 text-gray-400" />
          </a>
        )}

        {/* Text content */}
        {message.content && (
          <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {/* Time and status */}
        <div className={cn(
          'flex items-center gap-1 mt-1',
          isOutbound ? 'justify-end' : 'justify-start'
        )}>
          <span className="text-[11px] text-gray-500">
            {formatTime(message.created_at)}
          </span>
          {isOutbound && getStatusIcon(message.status)}
        </div>
      </div>
    </div>
  );
}
