// =============================================
// COMPONENTE: EmailComposer
// Compositor de email profesional con WYSIWYG
// =============================================

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  Paperclip,
  Send,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useEmailSignatures } from '@/hooks/communications/useEmailSignatures';
import { TipTapEditor } from './TipTapEditor';
import { ContactSearch } from './ContactSearch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SelectedContact {
  id?: string;
  email: string;
  name?: string;
  type?: string;
}

interface Attachment {
  name: string;
  size: number;
  url: string;
  path: string;
}

interface EmailComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTo?: SelectedContact[];
  defaultSubject?: string;
  defaultBody?: string;
  matterId?: string;
  contactId?: string;
  clientId?: string;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function EmailComposer({
  open,
  onOpenChange,
  defaultTo = [],
  defaultSubject = '',
  defaultBody = '',
  matterId,
  contactId,
  clientId,
  onSuccess,
}: EmailComposerProps) {
  const { currentOrganization } = useOrganization();
  const { signatures, defaultSignature, isLoading: signaturesLoading } = useEmailSignatures();
  const queryClient = useQueryClient();

  // Form state
  const [to, setTo] = useState<SelectedContact[]>(defaultTo);
  const [cc, setCc] = useState<SelectedContact[]>([]);
  const [bcc, setBcc] = useState<SelectedContact[]>([]);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTo(defaultTo);
      setCc([]);
      setBcc([]);
      setSubject(defaultSubject);
      setBody(defaultBody);
      setAttachments([]);
      setShowCcBcc(false);
      
      // Pre-select default signature
      if (defaultSignature) {
        setSelectedSignatureId(defaultSignature.id);
      }
    }
  }, [open, defaultTo, defaultSubject, defaultBody, defaultSignature]);

  const selectedSignature = signatures?.find(s => s.id === selectedSignatureId);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !currentOrganization?.id) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} es demasiado grande (máx. 10MB)`);
          continue;
        }

        const filePath = `${currentOrganization.id}/emails/${Date.now()}_${file.name}`;
        
        const { data, error } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (error) {
          toast.error(`Error al subir ${file.name}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);

        setAttachments(prev => [...prev, {
          name: file.name,
          size: file.size,
          url: urlData.publicUrl,
          path: filePath,
        }]);
      }
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Remove attachment
  const removeAttachment = async (index: number) => {
    const attachment = attachments[index];
    
    // Delete from storage
    await supabase.storage
      .from('attachments')
      .remove([attachment.path]);

    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Send email mutation
  const sendEmail = useMutation({
    mutationFn: async () => {
      if (!currentOrganization?.id) throw new Error('No organization');
      if (to.length === 0) throw new Error('Añade al menos un destinatario');
      if (!subject.trim()) throw new Error('Añade un asunto');

      // Compose final body with signature
      let finalBody = body;
      if (selectedSignature) {
        finalBody = `${body}<br/><br/>${selectedSignature.content_html}`;
      }

      const { data, error } = await supabase.functions.invoke('send-communication-email', {
        body: {
          organization_id: currentOrganization.id,
          to: to.map(t => t.email),
          to_contacts: to.filter(t => t.id).map(t => ({ id: t.id, email: t.email })),
          cc: cc.map(c => c.email),
          bcc: bcc.map(b => b.email),
          subject,
          body_html: finalBody,
          attachments: attachments.map(a => ({ name: a.name, url: a.url })),
          matter_id: matterId,
          contact_id: contactId || to.find(t => t.id)?.id,
          client_id: clientId,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Error al enviar email');

      return data;
    },
    onSuccess: () => {
      toast.success('Email enviado correctamente');
      queryClient.invalidateQueries({ queryKey: ['communication-messages'] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            Nuevo Email
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Para */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>Para</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCcBcc(!showCcBcc)}
                className="text-xs h-6"
              >
                {showCcBcc ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                CC/CCO
              </Button>
            </div>
            <ContactSearch
              value={to}
              onChange={setTo}
              placeholder="Buscar contacto o escribir email..."
            />
          </div>

          {/* CC/BCC */}
          {showCcBcc && (
            <>
              <div className="space-y-1">
                <Label>CC</Label>
                <ContactSearch
                  value={cc}
                  onChange={setCc}
                  placeholder="Añadir destinatarios en copia..."
                />
              </div>
              <div className="space-y-1">
                <Label>CCO</Label>
                <ContactSearch
                  value={bcc}
                  onChange={setBcc}
                  placeholder="Añadir destinatarios en copia oculta..."
                />
              </div>
            </>
          )}

          {/* Asunto */}
          <div className="space-y-1">
            <Label>Asunto</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto del email"
            />
          </div>

          {/* Editor */}
          <div className="space-y-1">
            <Label>Mensaje</Label>
            <TipTapEditor
              content={body}
              onChange={setBody}
              placeholder="Escribe tu mensaje..."
              minHeight="200px"
            />
          </div>

          {/* Firma */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Firma</Label>
              <Select
                value={selectedSignatureId || 'none'}
                onValueChange={(v) => setSelectedSignatureId(v === 'none' ? null : v)}
              >
                <SelectTrigger className="w-[200px] h-8">
                  <SelectValue placeholder="Seleccionar firma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin firma</SelectItem>
                  {signatures?.map(sig => (
                    <SelectItem key={sig.id} value={sig.id}>
                      {sig.name}
                      {sig.is_default && ' ⭐'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSignature && (
              <div className="p-3 border rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">Vista previa de firma:</p>
                <div
                  className="text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedSignature.content_html }}
                />
              </div>
            )}
          </div>

          {/* Adjuntos */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Adjuntos</Label>
              <label className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7"
                  disabled={isUploading}
                  asChild
                >
                  <span>
                    {isUploading ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Paperclip className="w-3 h-3 mr-1" />
                    )}
                    Adjuntar
                  </span>
                </Button>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2 h-7"
                  >
                    <FileText className="w-3 h-3" />
                    <span className="max-w-[120px] truncate">{att.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(att.size)})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => sendEmail.mutate()}
            disabled={sendEmail.isPending || to.length === 0 || !subject.trim()}
          >
            {sendEmail.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}