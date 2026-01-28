/**
 * MatterWhatsAppModal - Modal para enviar WhatsApp contextual a un expediente
 * Permite enviar: mensajes directos, plantillas HSM, estado del expediente, documentos
 */

import { useEffect, useMemo, useState } from 'react';
import { 
  MessageCircle, Send, Loader2, Phone, FileText, 
  TrendingUp, CheckCircle2, Clock, AlertTriangle,
  ArrowRight, Paperclip
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useOrganization } from '@/contexts/organization-context';
import { useSendWhatsApp, useWhatsAppTemplates } from '@/hooks/use-whatsapp';
import { useMatterDocuments } from '@/hooks/use-matter-documents';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MatterWhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  matterTitle?: string;
  matterReference?: string;
  matterStatus?: string;
  matterType?: string;
  clientId?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
}

// Matter status steps for visual progress
const TRADEMARK_STEPS = [
  { key: 'draft', label: 'Borrador', icon: FileText },
  { key: 'filed', label: 'Presentado', icon: Send },
  { key: 'examination', label: 'Examen', icon: Clock },
  { key: 'publication', label: 'Publicación', icon: TrendingUp },
  { key: 'opposition', label: 'Oposición', icon: AlertTriangle },
  { key: 'registered', label: 'Registrado', icon: CheckCircle2 },
];

const PATENT_STEPS = [
  { key: 'draft', label: 'Borrador', icon: FileText },
  { key: 'filed', label: 'Presentado', icon: Send },
  { key: 'search', label: 'Búsqueda', icon: Clock },
  { key: 'examination', label: 'Examen', icon: TrendingUp },
  { key: 'granted', label: 'Concedido', icon: CheckCircle2 },
];

function getStepsForType(type?: string) {
  if (type?.includes('patent')) return PATENT_STEPS;
  return TRADEMARK_STEPS;
}

function getStatusIndex(status?: string, steps: typeof TRADEMARK_STEPS = TRADEMARK_STEPS) {
  if (!status) return 0;
  const idx = steps.findIndex(s => status.toLowerCase().includes(s.key));
  return idx >= 0 ? idx : 0;
}

export function MatterWhatsAppModal({
  open,
  onOpenChange,
  matterId,
  matterTitle,
  matterReference,
  matterStatus,
  matterType,
  clientId,
  clientName,
  clientPhone,
}: MatterWhatsAppModalProps) {
  const { currentOrganization } = useOrganization();
  const { data: templates = [] } = useWhatsAppTemplates();
  const { data: documents = [] } = useMatterDocuments(matterId);
  const sendWhatsApp = useSendWhatsApp();

  const [mode, setMode] = useState<'text' | 'template' | 'status' | 'document'>('text');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [toPhone, setToPhone] = useState(clientPhone || '');
  const [textContent, setTextContent] = useState('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [includeStatusInMessage, setIncludeStatusInMessage] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const steps = getStepsForType(matterType);
  const currentStepIndex = getStatusIndex(matterStatus, steps);

  // Reset phone when modal opens
  useEffect(() => {
    if (open) {
      setToPhone(clientPhone || '');
      setTextContent('');
      setSelectedDocuments([]);
    }
  }, [open, clientPhone]);

  const approvedTemplates = useMemo(() => templates.filter((t) => t.status === 'approved'), [templates]);
  const selectedTemplateData = useMemo(
    () => templates.find((t) => t.code === selectedTemplate),
    [templates, selectedTemplate]
  );

  // Generate status message with visual representation
  const generateStatusMessage = () => {
    const currentStep = steps[currentStepIndex];
    const nextStep = steps[currentStepIndex + 1];
    
    let msg = `📋 *Estado de su expediente*\n`;
    msg += `━━━━━━━━━━━━━━━━━\n`;
    msg += `📝 Ref: ${matterReference || 'N/A'}\n`;
    msg += `📌 ${matterTitle || 'Expediente'}\n\n`;
    
    msg += `🔄 *Progreso actual:*\n`;
    steps.forEach((step, idx) => {
      if (idx < currentStepIndex) {
        msg += `✅ ${step.label}\n`;
      } else if (idx === currentStepIndex) {
        msg += `🔵 ${step.label} ← *Aquí estamos*\n`;
      } else {
        msg += `⬜ ${step.label}\n`;
      }
    });
    
    msg += `\n📊 Completado: ${Math.round((currentStepIndex / (steps.length - 1)) * 100)}%\n`;
    
    if (nextStep) {
      msg += `\n➡️ *Siguiente paso:* ${nextStep.label}\n`;
    } else {
      msg += `\n🎉 *¡Proceso completado!*\n`;
    }
    
    msg += `\n━━━━━━━━━━━━━━━━━\n`;
    msg += `${currentOrganization?.name || 'IP-NEXUS'}`;
    
    return msg;
  };

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

    const firstName = clientName?.split(' ')?.[0] || '';
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

    if (matterReference) {
      for (const key of Object.keys(vars)) {
        if (key === '3') vars[key] = matterReference;
      }
    }

    setTemplateVariables(vars);
  };

  const toggleDocument = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const resetForm = () => {
    setMode('text');
    setSelectedTemplate('');
    setTextContent('');
    setTemplateVariables({});
    setSelectedDocuments([]);
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
      let messageContent = '';
      
      if (mode === 'status') {
        messageContent = generateStatusMessage();
      } else if (mode === 'document') {
        messageContent = `📎 *Documentos de su expediente*\n\n`;
        messageContent += `📝 Ref: ${matterReference || 'N/A'}\n\n`;
        
        const selectedDocs = documents.filter(d => selectedDocuments.includes(d.id));
        selectedDocs.forEach((doc, idx) => {
          messageContent += `${idx + 1}. ${doc.name}\n`;
        });
        
        messageContent += `\n_Se adjuntan ${selectedDocs.length} documento(s)_\n`;
        messageContent += `\n${currentOrganization?.name || 'IP-NEXUS'}`;
      } else if (mode === 'template') {
        messageContent = selectedTemplateData?.body_text || '';
      } else {
        messageContent = textContent;
        if (includeStatusInMessage && matterReference) {
          messageContent = `📝 Ref: ${matterReference}\n\n${messageContent}`;
        }
      }

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
            onError: () => {
              toast.success('Comunicación registrada');
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
            textContent: messageContent,
            contactId: clientId || undefined,
          },
          {
            onSuccess: () => {
              toast.success('WhatsApp enviado correctamente');
              onOpenChange(false);
              resetForm();
            },
            onError: () => {
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

  const canSend = (() => {
    if (!toPhone) return false;
    if (mode === 'template') return !!selectedTemplate && selectedTemplateData?.status === 'approved';
    if (mode === 'document') return selectedDocuments.length > 0;
    if (mode === 'status') return true;
    return textContent.trim().length > 0;
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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

        <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="text">Mensaje</TabsTrigger>
            <TabsTrigger value="status">Estado</TabsTrigger>
            <TabsTrigger value="document">Docs</TabsTrigger>
            <TabsTrigger value="template">Plantilla</TabsTrigger>
          </TabsList>

          {/* Text Message Tab */}
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
              <div className="flex justify-between text-xs text-muted-foreground">
                <label className="flex items-center gap-2">
                  <Checkbox 
                    checked={includeStatusInMessage}
                    onCheckedChange={(checked) => setIncludeStatusInMessage(!!checked)}
                  />
                  Incluir referencia del expediente
                </label>
                <span>{textContent.length}/4096</span>
              </div>
            </div>
          </TabsContent>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base">Enviar estado del expediente</Label>
                <p className="text-sm text-muted-foreground">
                  Envía un resumen visual del progreso actual al cliente
                </p>
              </div>

              {/* Visual Progress */}
              <Card>
                <CardContent className="pt-6">
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-muted">
                      <div 
                        className="h-full bg-[#25D366] transition-all"
                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                      />
                    </div>
                    
                    {/* Steps */}
                    <div className="relative flex justify-between">
                      {steps.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isCompleted = idx < currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        
                        return (
                          <div 
                            key={step.key}
                            className="flex flex-col items-center"
                          >
                            <div 
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background z-10",
                                isCompleted && "bg-[#25D366] border-[#25D366] text-white",
                                isCurrent && "border-[#25D366] text-[#25D366]",
                                !isCompleted && !isCurrent && "border-muted text-muted-foreground"
                              )}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <StepIcon className="h-5 w-5" />
                              )}
                            </div>
                            <span className={cn(
                              "text-xs mt-2 text-center max-w-[60px]",
                              (isCompleted || isCurrent) ? "font-medium" : "text-muted-foreground"
                            )}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-6 p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm">
                      <span className="font-medium">Estado actual:</span>{' '}
                      {steps[currentStepIndex]?.label || 'Borrador'}
                    </p>
                    {steps[currentStepIndex + 1] && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                        <ArrowRight className="h-3 w-3" />
                        Siguiente: {steps[currentStepIndex + 1].label}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground mb-2">Vista previa del mensaje:</p>
                <pre className="text-xs whitespace-pre-wrap font-sans bg-muted/50 p-3 rounded">
                  {generateStatusMessage()}
                </pre>
              </div>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="document" className="space-y-4 mt-4">
            <div>
              <Label className="text-base">Compartir documentos</Label>
              <p className="text-sm text-muted-foreground">
                Selecciona los documentos que deseas compartir con el cliente
              </p>
            </div>

            {documents.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No hay documentos en este expediente</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {documents.map((doc) => (
                  <div 
                    key={doc.id}
                    onClick={() => toggleDocument(doc.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedDocuments.includes(doc.id) 
                        ? "border-[#25D366] bg-[#25D366]/5" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <Checkbox 
                      checked={selectedDocuments.includes(doc.id)}
                      onCheckedChange={() => toggleDocument(doc.id)}
                    />
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.category || 'Documento'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedDocuments.length > 0 && (
              <Badge variant="secondary">
                {selectedDocuments.length} documento(s) seleccionado(s)
              </Badge>
            )}
          </TabsContent>

          {/* Template Tab */}
          <TabsContent value="template" className="space-y-4 mt-4">
            {approvedTemplates.length === 0 && (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-muted-foreground">
                    No hay plantillas HSM aprobadas. Las plantillas deben ser aprobadas por Meta.
                  </p>
                </CardContent>
              </Card>
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
