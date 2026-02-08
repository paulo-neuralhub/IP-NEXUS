/**
 * ChatFileUpload — File upload button for production chat
 * Uploads to Supabase Storage 'market-chat-files' bucket
 */
import * as React from 'react';
import { useState, useRef } from 'react';
import { Paperclip, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatFileUploadProps {
  transactionId: string;
  onFileUploaded: (fileName: string, fileUrl: string) => void;
  disabled?: boolean;
}

export function ChatFileUpload({ transactionId, onFileUploaded, disabled }: ChatFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Archivo demasiado grande (máx. 10MB)');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const ext = file.name.split('.').pop();
      const path = `${user.id}/${transactionId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('market-chat-files')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('market-chat-files')
        .getPublicUrl(path);

      onFileUploaded(file.name, urlData.publicUrl);
    } catch (err) {
      toast.error('Error al subir archivo');
      console.error(err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 shrink-0"
        style={{ color: '#94a3b8' }}
        title="Adjuntar archivo"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
      </button>
    </>
  );
}
