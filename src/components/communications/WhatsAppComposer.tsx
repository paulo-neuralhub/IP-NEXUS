/**
 * WhatsAppComposer - Compositor profesional de WhatsApp
 * Con soporte para plantillas y adjuntos
 */

import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Paperclip,
  Send,
  X,
  Loader2,
  Image as ImageIcon,
  File,
  FileVideo,
  Mic,
  Search,
  BookTemplate,
  ChevronDown,
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useCommunicationTemplates, CommunicationTemplate, TEMPLATE_CATEGORIES, renderTemplate } from '@/hooks/communications/useCommunicationTemplates';
import { MatterSelector } from '@/components/matters/MatterSelector';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Attachment {
  name: string;
  size: number;
  url: string;
  path: string;
  type: 'image' | 'document' | 'audio' | 'video';
}

interface WhatsAppComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTo?: string;
  defaultContactId?: string;
  defaultClientId?: string;
  defaultMatterId?: string;
  defaultMatterName?: string;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB for WhatsApp

interface PhoneContact {
  id?: string;
  name?: string;
  phone?: string;
}

export function WhatsAppComposer({
  open,
  onOpenChange,
  defaultTo = '',
  defaultContactId,
  defaultClientId,
  defaultMatterId,
  defaultMatterName,
  onSuccess,
}: WhatsAppComposerProps) {
  const { currentOrganization } = useOrganization();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Form state
  const [phone, setPhone] = useState(defaultTo);
  const [selectedContact, setSelectedContact] = useState<PhoneContact | null>(null);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(defaultMatterId || null);
  const [linkToMatter, setLinkToMatter] = useState(!!defaultMatterId);

  // Template state
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  // Fetch WhatsApp templates
  const { data: templates, isLoading: templatesLoading } = useCommunicationTemplates({
    channel: 'whatsapp',
    category: selectedCategory || undefined,
    search: templateSearch || undefined,
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setPhone(defaultTo);
      setSelectedContact(null);
      setMessage('');
      setAttachments([]);
      setShowTemplates(false);
      setSelectedTemplate(null);
      setTemplateVariables({});
      setSelectedCategory('');
      setTemplateSearch('');
      setSelectedMatterId(defaultMatterId || null);
      setLinkToMatter(!!defaultMatterId);
    }
  }, [open, defaultTo, defaultMatterId]);

  // Focus textarea on mount
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  // Get file type for WhatsApp
  const getWhatsAppMediaType = (mimeType: string): 'image' | 'document' | 'audio' | 'video' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !currentOrganization?.id) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} es demasiado grande (máx. 16MB)`);
          continue;
        }

        const filePath = `${currentOrganization.id}/whatsapp/${Date.now()}_${file.name}`;
        
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
          type: getWhatsAppMediaType(file.type),
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
    
    await supabase.storage
      .from('attachments')
      .remove([attachment.path]);

    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Apply template
  const applyTemplate = (template: CommunicationTemplate) => {
    setSelectedTemplate(template);
    
    // Initialize variables with defaults
    const vars: Record<string, string> = {};
    template.variables?.forEach(v => {
      vars[v.name] = v.default || '';
    });
    setTemplateVariables(vars);
    
    // Set message content (will be updated when variables change)
    setMessage(template.content_text);
    setShowTemplates(false);
  };

  // Handle variable change
  const handleVariableChange = (name: string, value: string) => {
    const newVars = { ...templateVariables, [name]: value };
    setTemplateVariables(newVars);
    
    if (selectedTemplate) {
      const { content } = renderTemplate(selectedTemplate, newVars);
      setMessage(content);
    }
  };

  // Clear template
  const clearTemplate = () => {
    setSelectedTemplate(null);
    setTemplateVariables({});
    setMessage('');
  };

  // Send WhatsApp
  const handleSend = async () => {
    const toPhone = selectedContact?.phone || phone;
    
    if (!toPhone) {
      toast.error('Introduce un número de teléfono');
      return;
    }
    if (!message.trim() && attachments.length === 0) {
      toast.error('Escribe un mensaje o adjunta un archivo');
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          organization_id: currentOrganization?.id,
          to_phone: toPhone.replace(/\s/g, ''),
          message_type: attachments.length > 0 ? 'media' : 'text',
          text_content: message || undefined,
          media_url: attachments[0]?.url,
          media_type: attachments[0]?.type,
          contact_id: selectedContact?.id || defaultContactId,
          client_id: defaultClientId,
          matter_id: linkToMatter ? selectedMatterId : null,
          template_id: selectedTemplate?.id,
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any)?.message || 'Error al enviar');

      toast.success('WhatsApp enviado correctamente');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSending(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <FileVideo className="w-4 h-4" />;
      case 'audio': return <Mic className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)' }}
            >
              <MessageSquare className="w-4 h-4" style={{ color: '#25D366' }} />
            </div>
            Nuevo WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Destinatario */}
          <div className="space-y-1">
            <Label>Para</Label>
            <Input
              value={selectedContact?.phone || phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setSelectedContact(null);
              }}
              placeholder="+34 612 345 678"
            />
            {selectedContact && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {selectedContact.name}
                </Badge>
                <button 
                  onClick={() => setSelectedContact(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Asociar a Expediente */}
          <div className="space-y-2">
            <Label className="text-sm">Asociar a expediente</Label>
            {defaultMatterId ? (
              <div className="flex items-center gap-3">
                <Checkbox
                  id="link-matter-wa"
                  checked={linkToMatter}
                  onCheckedChange={(checked) => setLinkToMatter(!!checked)}
                />
                <label htmlFor="link-matter-wa" className="text-sm flex-1 cursor-pointer">
                  Asociar a: <span className="font-medium">{defaultMatterName || 'Expediente seleccionado'}</span>
                </label>
              </div>
            ) : (
              <MatterSelector
                value={selectedMatterId}
                onChange={(id) => {
                  setSelectedMatterId(id);
                  setLinkToMatter(!!id);
                }}
                placeholder="Seleccionar expediente (opcional)"
                showClearOption
              />
            )}
          </div>

          {/* Selector de Plantillas */}
          <Collapsible open={showTemplates} onOpenChange={setShowTemplates}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <BookTemplate className="w-4 h-4" />
                  {selectedTemplate ? selectedTemplate.name : 'Usar plantilla'}
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  showTemplates && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                {/* Filtros */}
                <div className="flex gap-2">
                  <Select value={selectedCategory || 'all'} onValueChange={(v) => setSelectedCategory(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {TEMPLATE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      placeholder="Buscar plantilla..."
                      className="pl-9 h-9"
                    />
                  </div>
                </div>

                {/* Lista de plantillas */}
                <ScrollArea className="h-[200px]">
                  {templatesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : templates?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookTemplate className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay plantillas disponibles</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {templates?.map(template => {
                        const category = TEMPLATE_CATEGORIES.find(c => c.value === template.category);
                        return (
                          <button
                            key={template.id}
                            onClick={() => applyTemplate(template)}
                            className={cn(
                              "w-full text-left p-3 rounded-lg border transition-colors",
                              selectedTemplate?.id === template.id
                                ? "border-primary bg-primary/5"
                                : "border-transparent hover:bg-muted"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm truncate">
                                    {template.name}
                                  </span>
                                  {template.is_system && (
                                    <Badge variant="outline" className="text-[10px] h-4">
                                      Sistema
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {template.content_text}
                                </p>
                              </div>
                              {category && (
                                <Badge
                                  variant="secondary"
                                  className="shrink-0 text-[10px]"
                                  style={{ 
                                    backgroundColor: `${category.color}20`,
                                    color: category.color,
                                  }}
                                >
                                  {category.icon}
                                </Badge>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Variables de plantilla */}
          {selectedTemplate && selectedTemplate.variables?.length > 0 && (
            <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Variables de plantilla</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearTemplate}
                  className="h-6 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Limpiar
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedTemplate.variables.map(variable => (
                  <div key={variable.name} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      {variable.label || variable.name}
                      {variable.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      value={templateVariables[variable.name] || ''}
                      onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                      placeholder={variable.default || `Introduce ${variable.label || variable.name}`}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editor de mensaje */}
          <div className="space-y-1">
            <Label>Mensaje</Label>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length} caracteres
            </p>
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
                  disabled={isUploading || attachments.length >= 1}
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
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  disabled={isUploading || attachments.length >= 1}
                />
              </label>
              <span className="text-xs text-muted-foreground">
                (máx. 1 archivo por mensaje)
              </span>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2 h-8 px-3"
                  >
                    {getFileIcon(att.type)}
                    <span className="max-w-[150px] truncate">{att.name}</span>
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
            onClick={handleSend}
            disabled={isSending || (!phone && !selectedContact?.phone)}
            style={{ backgroundColor: '#25D366' }}
            className="text-white hover:opacity-90"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar WhatsApp
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
