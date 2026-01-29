/**
 * EmailComposeModal - Modal mejorado para componer email desde expediente o cliente
 * Con selector de plantillas, CC/BCC, formato, firma y selector de expediente
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Mail, Send, AlertCircle, ChevronDown, ChevronUp,
  Bold, Italic, Link, List, ListOrdered, Paperclip
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { MatterSelector } from '@/components/features/crm/shared/MatterSelector';
import { MatterOption } from '@/hooks/use-matter-selector';
import { addReferenceToSubject } from '@/lib/matter-reference';
import { useCreateCommunication } from '@/hooks/legal-ops/useCommunications';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/organization-context';
import { cn } from '@/lib/utils';

const schema = z.object({
  to: z.string().email('Email inválido'),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, 'Asunto requerido').max(200, 'Asunto demasiado largo'),
  body: z.string().min(1, 'Mensaje requerido').max(50000, 'Mensaje demasiado largo'),
  isImportant: z.boolean().default(false),
  templateId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface EmailComposeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Contexto de expediente (cuando viene de MatterDetailPage)
  matterId?: string;
  matterTitle?: string;
  matterReference?: string;
  // Contexto de cliente (cuando viene de Client360Page)
  accountId?: string;
  // Otros
  recipientEmail?: string;
  recipientName?: string;
  entityType?: 'matter' | 'client' | 'deal';
  entityName?: string;
  // Control del selector
  showMatterSelector?: boolean;
}

// Mock templates - in production, fetch from API
const EMAIL_TEMPLATES = [
  { id: 'welcome', name: 'Bienvenida Cliente', category: 'Onboarding' },
  { id: 'reminder', name: 'Recordatorio Vencimiento', category: 'Renovaciones' },
  { id: 'notification', name: 'Notificación Estado', category: 'Servicio' },
  { id: 'proposal', name: 'Propuesta Comercial', category: 'Ventas' },
];

export function EmailComposeModal({
  open,
  onOpenChange,
  matterId: initialMatterId,
  matterTitle,
  matterReference: initialMatterReference,
  accountId,
  recipientEmail,
  recipientName,
  entityType = 'matter',
  entityName,
  showMatterSelector = true,
}: EmailComposeModalProps) {
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const createComm = useCreateCommunication();
  
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  // State for matter selection (when coming from client context)
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(initialMatterId || null);
  const [selectedMatterReference, setSelectedMatterReference] = useState<string | null>(initialMatterReference || null);

  // Handle matter selection change
  const handleMatterChange = (matterId: string | null, matter: MatterOption | null) => {
    setSelectedMatterId(matterId);
    setSelectedMatterReference(matter?.reference || null);
    
    // Update subject with new reference if needed
    const currentSubject = form.getValues('subject');
    if (matter?.reference && currentSubject) {
      form.setValue('subject', addReferenceToSubject(currentSubject, matter.reference));
    }
  };
  
  // Use either fixed matterId or selected one
  const effectiveMatterId = initialMatterId || selectedMatterId;
  const effectiveMatterReference = initialMatterReference || selectedMatterReference;
  
  // Build default subject with reference
  const referenceStamp = effectiveMatterReference ? `[${effectiveMatterReference}]` : '';
  const defaultSubject = matterTitle 
    ? `${referenceStamp} RE: ${matterTitle}`.trim() 
    : referenceStamp;

  // Organization signature
  const signature = currentOrganization?.name 
    ? `\n\n--\n${currentOrganization.name}`
    : '';

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      to: recipientEmail || '',
      cc: '',
      bcc: '',
      subject: defaultSubject,
      body: '',
      isImportant: false,
      templateId: '',
    },
  });

  // Update defaults when props change
  useEffect(() => {
    if (open) {
      form.reset({
        to: recipientEmail || '',
        cc: '',
        bcc: '',
        subject: defaultSubject,
        body: '',
        isImportant: false,
        templateId: '',
      });
      setSelectedTemplate('');
      setShowCcBcc(false);
      // Reset matter selection if not fixed
      if (!initialMatterId) {
        setSelectedMatterId(null);
        setSelectedMatterReference(null);
      }
    }
  }, [open, recipientEmail, defaultSubject, initialMatterId]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    form.setValue('templateId', templateId);
    
    // In production, load template content from API
    if (templateId === 'welcome') {
      form.setValue('subject', `${referenceStamp} Bienvenido a ${currentOrganization?.name || 'IP-NEXUS'}`);
      form.setValue('body', `Estimado/a ${recipientName || 'Cliente'},\n\nEs un placer darle la bienvenida...\n\nQuedamos a su disposición.${signature}`);
    } else if (templateId === 'reminder') {
      form.setValue('subject', `${referenceStamp} Recordatorio de vencimiento`);
      form.setValue('body', `Estimado/a ${recipientName || 'Cliente'},\n\nLe recordamos que próximamente vence...${signature}`);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Build subject with important marker if needed
      const finalSubject = data.isImportant 
        ? `[IMPORTANTE] ${data.subject}` 
        : data.subject;
      
      // Append signature to body
      const bodyWithSignature = signature 
        ? `${data.body}${signature}` 
        : data.body;
      
      await createComm.mutateAsync({
        channel: 'email',
        direction: 'outbound',
        matter_id: effectiveMatterId || undefined,
        email_to: [data.to],
        subject: finalSubject,
        body: bodyWithSignature,
      });
      toast({ 
        title: 'Email guardado', 
        description: 'Comunicación registrada en el expediente' 
      });
      form.reset();
      onOpenChange(false);
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              Nuevo Email
            </DialogTitle>
            
            {/* Template selector */}
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Usar plantilla..." />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TEMPLATES.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] px-1">
                        {t.category}
                      </Badge>
                      {t.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* Matter Selector - Solo si viene de contexto de cliente */}
            {showMatterSelector && accountId && !initialMatterId && (
              <MatterSelector
                accountId={accountId}
                value={selectedMatterId}
                onChange={handleMatterChange}
                showMatterSelector={true}
              />
            )}
            
            {/* Badge fijo si viene de expediente */}
            {!showMatterSelector && initialMatterId && initialMatterReference && (
              <MatterSelector
                accountId={null}
                value={initialMatterId}
                onChange={() => {}}
                showMatterSelector={false}
                fixedMatterId={initialMatterId}
                fixedMatterReference={initialMatterReference}
              />
            )}
            
            {/* To field */}
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="w-12 text-right text-muted-foreground text-sm">Para</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="email@ejemplo.com" 
                        className="flex-1"
                        {...field} 
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCcBcc(!showCcBcc)}
                      className="text-muted-foreground text-xs"
                    >
                      CC/BCC {showCcBcc ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                    </Button>
                  </div>
                  <FormMessage className="ml-14" />
                </FormItem>
              )}
            />

            {/* CC/BCC fields - collapsible */}
            {showCcBcc && (
              <>
                <FormField
                  control={form.control}
                  name="cc"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel className="w-12 text-right text-muted-foreground text-sm">CC</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Separar con comas" 
                            className="flex-1"
                            {...field} 
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bcc"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel className="w-12 text-right text-muted-foreground text-sm">BCC</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Separar con comas" 
                            className="flex-1"
                            {...field} 
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Subject field */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="w-12 text-right text-muted-foreground text-sm">Asunto</FormLabel>
                    <FormControl>
                      <Input placeholder="Asunto del email" className="flex-1" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage className="ml-14" />
                </FormItem>
              )}
            />

            {/* Important checkbox */}
            <FormField
              control={form.control}
              name="isImportant"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 ml-14 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal flex items-center gap-1 cursor-pointer">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    Marcar como importante
                  </FormLabel>
                </FormItem>
              )}
            />

            <Separator />

            {/* Body with format bar */}
            <div className="space-y-2">
              {/* Format toolbar */}
              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                  <Bold className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                  <Italic className="h-3.5 w-3.5" />
                </Button>
                <Separator orientation="vertical" className="h-4 mx-1" />
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                  <ListOrdered className="h-3.5 w-3.5" />
                </Button>
                <Separator orientation="vertical" className="h-4 mx-1" />
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                  <Link className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Escribe tu mensaje..."
                        rows={10}
                        className="resize-none font-[inherit]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer with entity badge and actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4 mr-1" />
                  Adjuntar
                </Button>
                
                {/* Entity badge */}
                {(entityName || effectiveMatterReference) && (
                  <Badge variant="outline" className="text-xs">
                    📁 {entityType === 'matter' ? 'Expediente' : entityType === 'client' ? 'Cliente' : 'Deal'}: {entityName || effectiveMatterReference}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createComm.isPending}>
                  <Send className="h-4 w-4 mr-1" />
                  Enviar
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
