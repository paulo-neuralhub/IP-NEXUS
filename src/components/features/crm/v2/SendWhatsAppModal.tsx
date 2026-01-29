import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, MessageCircle, Send, Loader2 } from 'lucide-react';

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

interface SendWhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: {
    id: string;
    phone?: string | null;
    whatsapp_phone?: string | null;
    full_name: string;
  };
  // Optional: Link to matter for traceability
  matterId?: string;
  matterReference?: string;
}

export function SendWhatsAppModal({ open, onOpenChange, contact, matterId, matterReference }: SendWhatsAppModalProps) {
  const { currentOrganization } = useOrganization();
  const { data: templates = [] } = useWhatsAppTemplates();
  const sendWhatsApp = useSendWhatsApp();

  const [mode, setMode] = useState<'template' | 'text'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [toPhone, setToPhone] = useState(contact?.whatsapp_phone || contact?.phone || '');
  const [textContent, setTextContent] = useState('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    setToPhone(contact?.whatsapp_phone || contact?.phone || '');
  }, [contact?.id, open]);

  const approvedTemplates = useMemo(() => templates.filter((t) => t.status === 'approved'), [templates]);
  const pendingTemplates = useMemo(() => templates.filter((t) => t.status === 'pending'), [templates]);
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

    const firstName = contact?.full_name?.split(' ')?.[0] || '';
    if (firstName) {
      for (const key of Object.keys(vars)) {
        if (key === '1') vars[key] = firstName;
      }
    }

    if (currentOrganization?.name) {
      for (const key of Object.keys(vars)) {
        if (key === '2') vars[key] = currentOrganization.name;
      }
    }

    setTemplateVariables(vars);
  };

  const resetForm = () => {
    setMode('template');
    setSelectedTemplate('');
    setTextContent('');
    setTemplateVariables({});
    setToPhone(contact?.whatsapp_phone || contact?.phone || '');
  };

  const handleSend = () => {
    if (!currentOrganization?.id) return;

    if (mode === 'template') {
      sendWhatsApp.mutate(
        {
          toPhone,
          messageType: 'template',
          templateCode: selectedTemplate,
          templateVariables,
          contactId: contact?.id,
          matterId, // Link to matter for traceability
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            resetForm();
          },
        }
      );
      return;
    }

    sendWhatsApp.mutate(
      {
        toPhone,
        messageType: 'text',
        textContent: matterReference 
          ? `[${matterReference}] ${textContent}` // Prefix with matter reference
          : textContent,
        contactId: contact?.id,
        matterId, // Link to matter for traceability
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      }
    );
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
            Enviar WhatsApp
            {matterReference && (
              <Badge variant="outline" className="font-mono text-xs">
                {matterReference}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'template' | 'text')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">Plantilla HSM</TabsTrigger>
            <TabsTrigger value="text">Mensaje libre</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4 mt-4">
            {approvedTemplates.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sin plantillas aprobadas</AlertTitle>
                <AlertDescription>
                  Las plantillas HSM deben ser aprobadas por Meta antes de poder usarse.
                  {pendingTemplates.length > 0 ? ` Tienes ${pendingTemplates.length} pendientes.` : ''}
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
                        {t.category ? <Badge variant="secondary">{t.category}</Badge> : null}
                      </span>
                    </SelectItem>
                  ))}

                  {pendingTemplates.length > 0 ? (
                    <div className="px-2 py-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1">
                        Pendientes
                      </p>
                      {pendingTemplates.map((t) => (
                        <SelectItem key={t.id} value={t.code}>
                          <span className="flex items-center gap-2">
                            <span className="truncate">{t.name}</span>
                            <Badge variant="outline">Pendiente</Badge>
                          </span>
                        </SelectItem>
                      ))}
                    </div>
                  ) : null}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplateData ? (
              <div className="rounded-lg border bg-card p-3 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Vista previa</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedTemplateData.body_text}</p>
                </div>

                {selectedTemplateData.variables?.length ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Variables</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTemplateData.variables.map((v) => (
                        <div key={v.key} className="space-y-1">
                          <Label className="text-xs">
                            {'{{'}{v.key}{'}}'} {v.label ? `- ${v.label}` : ''}
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
            ) : null}
          </TabsContent>

          <TabsContent value="text" className="space-y-3 mt-4">
            <div className="space-y-2">
              <Label>Mensaje</Label>
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Escribe tu mensaje…"
                rows={4}
                maxLength={4096}
              />
              <p className="text-xs text-muted-foreground text-right">{textContent.length}/4096</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2 mt-4">
          <Label>Número de teléfono</Label>
          <Input type="tel" value={toPhone} onChange={(e) => setToPhone(e.target.value)} placeholder="+34 612 345 678" />
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
          <Button onClick={handleSend} disabled={!canSend || sendWhatsApp.isPending}>
            {sendWhatsApp.isPending ? (
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
