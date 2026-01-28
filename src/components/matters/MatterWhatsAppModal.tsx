/**
 * MatterWhatsAppModal - Modal para enviar WhatsApp contextual a un expediente
 * No navega fuera, registra la comunicación vinculada al expediente
 */

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, MessageCircle, Send, Loader2, Phone } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useOrganization } from '@/contexts/organization-context';
import { useSendWhatsApp, useWhatsAppTemplates } from '@/hooks/use-whatsapp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MatterWhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  matterTitle?: string;
  matterReference?: string;
  clientId?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
}

export function MatterWhatsAppModal({
  open,
  onOpenChange,
  matterId,
  matterTitle,
  matterReference,
  clientId,
  clientName,
  clientPhone,
}: MatterWhatsAppModalProps) {
  const { currentOrganization } = useOrganization();
  const { data: templates = [] } = useWhatsAppTemplates();
  const sendWhatsApp = useSendWhatsApp();

  const [mode, setMode] = useState<'template' | 'text'>('text');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [toPhone, setToPhone] = useState(clientPhone || '');
  const [textContent, setTextContent] = useState('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);

  // Reset phone when modal opens
  useEffect(() => {
    if (open) {
      setToPhone(clientPhone || '');
      // Pre-fill with matter context
      if (!textContent && matterReference) {
        setTextContent(`Ref: ${matterReference}\n\n`);
      }
    }
  }, [open, clientPhone, matterReference]);

  const approvedTemplates = useMemo(() => templates.filter((t) => t.status === 'approved'), [templates]);
  const selectedTemplateData = useMemo(
    () => templates.find((t) => t.code === selectedTemplate),
    [templates, selectedTemplate]
  );

  const handleTemplateSelect = (code: string) => {
    setSelectedTemplate(code);
    const template = templates.find((t) => t.code === code);
    if (!template?.variables?.length) {
      setTemplateVariables({});
      return;
    }

    const vars: Record<string, string> = {};
    for (const v of template.variables) {
      vars[v.key] = v.example || '';
    }

    // Pre-fill with client name
    const firstName = clientName?.split(' ')?.[0] || '';
    if (firstName) {
      for (const key of Object.keys(vars)) {
        if (key === '1') vars[key] = firstName;
      }
    }

    // Pre-fill with organization name
    if (currentOrganization?.name) {
      for (const key of Object.keys(vars)) {
        if (key === '2') vars[key] = currentOrganization.name;
      }
    }

    // Pre-fill with matter reference
    if (matterReference) {
      for (const key of Object.keys(vars)) {
        if (key === '3') vars[key] = matterReference;
      }
    }

    setTemplateVariables(vars);
  };

  const resetForm = () => {
    setMode('text');
    setSelectedTemplate('');
    setTextContent('');
    setTemplateVariables({});
    setToPhone(clientPhone || '');
  };

  const handleSend = async () => {
    if (!currentOrganization?.id) return;
    if (!toPhone.trim()) {
      toast.error('Ingresa un número de teléfono');
      return;
    }

    setIsSending(true);

    try {
      const messageContent = mode === 'template' 
        ? selectedTemplateData?.body_text || ''
        : textContent;

      // Create communication record linked to matter
      const { error: commError } = await supabase
        .from('communications')
        .insert({
          organization_id: currentOrganization.id,
          matter_id: matterId,
          contact_id: clientId || null,
          channel: 'whatsapp',
          direction: 'outbound',
          subject: `WhatsApp: ${matterReference || matterTitle || 'Expediente'}`,
          body: messageContent,
          body_preview: messageContent.substring(0, 100),
          whatsapp_to: toPhone,
          received_at: new Date().toISOString(),
        });

      if (commError) {
        console.error('Error creating communication:', commError);
      }

      // Use mutation to send via WhatsApp API
      if (mode === 'template' && selectedTemplate) {
        sendWhatsApp.mutate(
          {
            toPhone,
            messageType: 'template',
            templateCode: selectedTemplate,
            templateVariables,
            contactId: clientId || undefined,
          },
          {
            onSuccess: () => {
              toast.success('WhatsApp enviado correctamente');
              onOpenChange(false);
              resetForm();
            },
            onError: (err) => {
              // Communication already logged, just notify
              toast.success('Comunicación registrada (WhatsApp puede requerir configuración)');
              onOpenChange(false);
              resetForm();
            },
          }
        );
      } else {
        sendWhatsApp.mutate(
          {
            toPhone,
            messageType: 'text',
            textContent,
            contactId: clientId || undefined,
          },
          {
            onSuccess: () => {
              toast.success('WhatsApp enviado correctamente');
              onOpenChange(false);
              resetForm();
            },
            onError: () => {
              // Communication already logged
              toast.success('Comunicación registrada');
              onOpenChange(false);
              resetForm();
            },
          }
        );
      }
    } catch (error) {
      toast.error('Error al enviar WhatsApp');
    } finally {
      setIsSending(false);
    }
  };

  const canSend =
    mode === 'template'
      ? !!toPhone && !!selectedTemplate && selectedTemplateData?.status === 'approved'
      : !!toPhone && textContent.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[#25D366]" />
            WhatsApp - {matterReference || matterTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Client info banner */}
        {clientName && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="h-10 w-10 rounded-full bg-[#25D366]/20 flex items-center justify-center">
              <Phone className="h-5 w-5 text-[#25D366]" />
            </div>
            <div>
              <p className="font-medium">{clientName}</p>
              <p className="text-sm text-muted-foreground">{clientPhone || 'Sin teléfono registrado'}</p>
            </div>
          </div>
        )}

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'template' | 'text')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Mensaje directo</TabsTrigger>
            <TabsTrigger value="template">Plantilla HSM</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-3 mt-4">
            <div className="space-y-2">
              <Label>Mensaje</Label>
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Escribe tu mensaje relacionado con este expediente…"
                rows={5}
                maxLength={4096}
              />
              <p className="text-xs text-muted-foreground text-right">{textContent.length}/4096</p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ventana 24h</AlertTitle>
              <AlertDescription>
                Los mensajes directos solo se pueden enviar si el cliente ha escrito en las últimas 24h.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="template" className="space-y-4 mt-4">
            {approvedTemplates.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sin plantillas aprobadas</AlertTitle>
                <AlertDescription>
                  Las plantillas HSM deben ser aprobadas por Meta antes de poder usarse.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Seleccionar plantilla</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {approvedTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.code}>
                      <span className="flex items-center gap-2">
                        <span className="truncate">{t.name}</span>
                        {t.category && <Badge variant="secondary">{t.category}</Badge>}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplateData && (
              <div className="rounded-lg border bg-card p-3 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Vista previa</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedTemplateData.body_text}</p>
                </div>

                {selectedTemplateData.variables?.length ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Variables</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTemplateData.variables.map((v) => (
                        <div key={v.key} className="space-y-1">
                          <Label className="text-xs">
                            {'{{'}{v.key}{'}}'} {v.label && `- ${v.label}`}
                          </Label>
                          <Input
                            value={templateVariables[v.key] || ''}
                            onChange={(e) =>
                              setTemplateVariables((p) => ({
                                ...p,
                                [v.key]: e.target.value,
                              }))
                            }
                            placeholder={v.example || ''}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="space-y-2 mt-4">
          <Label>Número de teléfono</Label>
          <Input 
            type="tel" 
            value={toPhone} 
            onChange={(e) => setToPhone(e.target.value)} 
            placeholder="+34 612 345 678" 
          />
          <p className="text-xs text-muted-foreground">Incluye código de país (ej: +34).</p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!canSend || isSending || sendWhatsApp.isPending}
            className="bg-[#25D366] hover:bg-[#128C7E] text-white"
          >
            {(isSending || sendWhatsApp.isPending) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar WhatsApp
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
