// src/components/market/messages/MessageInput.tsx
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

export function MessageInput({ 
  onSend, 
  placeholder = 'Escribe un mensaje...',
  disabled = false 
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!content.trim() && attachments.length === 0) return;
    
    setIsSending(true);
    try {
      await onSend(content.trim(), attachments.length > 0 ? attachments : undefined);
      setContent('');
      setAttachments([]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t p-4 space-y-2">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm"
            >
              {file.type.startsWith('image/') ? (
                <ImageIcon className="h-4 w-4" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button 
                onClick={() => removeAttachment(index)}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          multiple
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          multiple
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSending}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled || isSending}
        >
          <ImageIcon className="h-5 w-5" />
        </Button>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
        />

        <Button
          onClick={handleSend}
          disabled={disabled || isSending || (!content.trim() && attachments.length === 0)}
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
