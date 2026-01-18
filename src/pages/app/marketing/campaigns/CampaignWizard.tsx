import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  useCampaign, useCreateCampaign, useUpdateCampaign, 
  useContactLists, useTemplates 
} from '@/hooks/use-marketing';
import { useOrganization } from '@/contexts/organization-context';
import { useToast } from '@/hooks/use-toast';
import { EmailEditor } from '@/components/features/marketing/email-editor';
import { cn } from '@/lib/utils';
import { DEFAULT_EMAIL_SETTINGS } from '@/lib/constants/marketing';
import { 
  ArrowLeft, ArrowRight, Save, Send, Mail, Zap, FlaskConical, 
  Check, AlertTriangle, CalendarIcon, Clock, Loader2, Users 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { EmailEditorContent } from '@/types/marketing';

type Step = 1 | 2 | 3 | 4;
type CampaignType = 'regular' | 'automated' | 'ab_test' | 'rss' | 'transactional';
type ContentSource = 'template' | 'scratch' | 'html';
type SendOption = 'now' | 'scheduled';

const STEPS = [
  { number: 1, label: 'Configuración' },
  { number: 2, label: 'Destinatarios' },
  { number: 3, label: 'Contenido' },
  { number: 4, label: 'Revisar' },
];

export default function CampaignWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const isNew = !id || id === 'new';

  const { data: existingCampaign, isLoading: loadingCampaign } = useCampaign(isNew ? undefined : id);
  const { data: lists } = useContactLists();
  const { data: templates } = useTemplates();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1: Configuration
  const [campaignType, setCampaignType] = useState<CampaignType>('regular');
  const [name, setName] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyTo, setReplyTo] = useState('');

  // Step 2: Recipients
  const [sendToAll, setSendToAll] = useState(false);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [excludedLists, setExcludedLists] = useState<string[]>([]);

  // Step 3: Content
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [contentSource, setContentSource] = useState<ContentSource>('scratch');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [emailContent, setEmailContent] = useState<EmailEditorContent>({
    blocks: [],
    settings: DEFAULT_EMAIL_SETTINGS
  });
  const [showEditor, setShowEditor] = useState(false);

  // Step 4: Send
  const [sendOption, setSendOption] = useState<SendOption>('now');
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState('09:00');

  // Load existing campaign
  useEffect(() => {
    if (existingCampaign && !isNew) {
      setName(existingCampaign.name);
      setFromName(existingCampaign.from_name);
      setFromEmail(existingCampaign.from_email);
      setReplyTo(existingCampaign.reply_to || '');
      setSubject(existingCampaign.subject);
      setPreviewText(existingCampaign.preview_text || '');
      setCampaignType(existingCampaign.campaign_type || 'regular');
      if (existingCampaign.list_ids) setSelectedLists(existingCampaign.list_ids);
      if (existingCampaign.exclude_list_ids) setExcludedLists(existingCampaign.exclude_list_ids);
      if (existingCampaign.json_content) {
        setEmailContent(existingCampaign.json_content);
        setContentSource('scratch');
      }
      if (existingCampaign.scheduled_at) {
        setSendOption('scheduled');
        const scheduledAt = new Date(existingCampaign.scheduled_at);
        setScheduledDate(scheduledAt);
        setScheduledTime(format(scheduledAt, 'HH:mm'));
      }
    }
  }, [existingCampaign, isNew]);

  // Calculate estimated recipients
  const estimatedRecipients = sendToAll
    ? lists?.reduce((sum, l) => sum + (l.contact_count || 0), 0) || 0
    : lists?.filter(l => selectedLists.includes(l.id))
        .reduce((sum, l) => sum + (l.contact_count || 0), 0) || 0;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((s) => (s + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as Step);
    }
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        return !!name && !!fromName && !!fromEmail;
      case 2:
        return sendToAll || selectedLists.length > 0;
      case 3:
        return !!subject && emailContent.blocks.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSave = async (sendNow: boolean = false) => {
    if (!currentOrganization) return;

    const campaignData = {
      name,
      from_name: fromName,
      from_email: fromEmail,
      reply_to: replyTo || undefined,
      subject,
      preview_text: previewText || undefined,
      campaign_type: campaignType,
      list_ids: sendToAll ? [] : selectedLists,
      exclude_list_ids: excludedLists,
      json_content: emailContent,
      html_content: '', // Generated on send
      status: sendNow ? 'scheduled' : 'draft' as const,
      scheduled_at: sendOption === 'scheduled' && scheduledDate
        ? new Date(`${format(scheduledDate, 'yyyy-MM-dd')}T${scheduledTime}:00`).toISOString()
        : sendNow ? new Date().toISOString() : undefined,
      total_recipients: estimatedRecipients,
      organization_id: currentOrganization.id,
      owner_type: 'tenant' as const,
    };

    try {
      if (isNew) {
        await createCampaign.mutateAsync(campaignData as any);
        toast({ title: sendNow ? 'Campaña programada' : 'Campaña guardada como borrador' });
      } else if (id) {
        await updateCampaign.mutateAsync({ id, data: campaignData as any });
        toast({ title: sendNow ? 'Campaña programada' : 'Campaña actualizada' });
      }
      navigate('/app/marketing/campaigns');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la campaña',
        variant: 'destructive'
      });
    }
  };

  const isSaving = createCampaign.isPending || updateCampaign.isPending;

  if (!isNew && loadingCampaign) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/marketing/campaigns')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? 'Nueva Campaña' : 'Editar Campaña'}
            </h1>
          </div>
        </div>
        <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />
          Guardar borrador
        </Button>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <button
              onClick={() => setCurrentStep(step.number as Step)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                currentStep === step.number
                  ? 'bg-primary text-primary-foreground'
                  : currentStep > step.number
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm">
                {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {index < STEPS.length - 1 && (
              <div className={cn(
                'w-8 h-0.5 mx-2',
                currentStep > step.number ? 'bg-primary' : 'bg-muted'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {/* Step 1: Configuration */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Tipo de Campaña</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'regular', icon: Mail, label: 'Regular', desc: 'Envío único' },
                    { value: 'automated', icon: Zap, label: 'Automatizada', desc: 'Por trigger' },
                    { value: 'ab_test', icon: FlaskConical, label: 'Test A/B', desc: 'Comparar' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setCampaignType(type.value as CampaignType)}
                      className={cn(
                        'p-6 rounded-lg border-2 text-center transition-colors',
                        campaignType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      )}
                    >
                      <type.icon className={cn(
                        'w-8 h-8 mx-auto mb-2',
                        campaignType === type.value ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-muted-foreground">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Nombre de campaña *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Newsletter Febrero 2026"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">De (nombre) *</Label>
                  <Input
                    id="fromName"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Ej: IP-NEXUS"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">De (email) *</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="Ej: noreply@ip-nexus.com"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="replyTo">Responder a</Label>
                  <Input
                    id="replyTo"
                    type="email"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    placeholder="Ej: soporte@ip-nexus.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Recipients */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Seleccionar Destinatarios</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                    <Checkbox
                      checked={sendToAll}
                      onCheckedChange={(checked) => {
                        setSendToAll(!!checked);
                        if (checked) setSelectedLists([]);
                      }}
                    />
                    <div>
                      <p className="font-medium">Enviar a todos los contactos</p>
                      <p className="text-sm text-muted-foreground">
                        ({lists?.reduce((sum, l) => sum + (l.contact_count || 0), 0) || 0} contactos)
                      </p>
                    </div>
                  </label>

                  {!sendToAll && (
                    <div className="space-y-2">
                      <Label>Enviar a listas específicas:</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {lists?.map((list) => (
                          <label
                            key={list.id}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                              selectedLists.includes(list.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                            )}
                          >
                            <Checkbox
                              checked={selectedLists.includes(list.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedLists([...selectedLists, list.id]);
                                } else {
                                  setSelectedLists(selectedLists.filter(id => id !== list.id));
                                }
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{list.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {list.contact_count || 0} contactos
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Destinatarios estimados: {estimatedRecipients.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        (Se excluirán contactos dados de baja)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Content */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="subject">Asunto del email *</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ej: 🎉 Novedades de febrero - No te lo pierdas"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="previewText">Texto de previsualización</Label>
                  <Input
                    id="previewText"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="Texto que aparece después del asunto en la bandeja..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Contenido</Label>
                <RadioGroup value={contentSource} onValueChange={(v) => setContentSource(v as ContentSource)}>
                  <div className="grid grid-cols-3 gap-4">
                    <label className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border cursor-pointer',
                      contentSource === 'template' ? 'border-primary bg-primary/5' : ''
                    )}>
                      <RadioGroupItem value="template" />
                      <div>
                        <p className="font-medium">Usar plantilla</p>
                        <p className="text-sm text-muted-foreground">Plantilla existente</p>
                      </div>
                    </label>
                    <label className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border cursor-pointer',
                      contentSource === 'scratch' ? 'border-primary bg-primary/5' : ''
                    )}>
                      <RadioGroupItem value="scratch" />
                      <div>
                        <p className="font-medium">Crear desde cero</p>
                        <p className="text-sm text-muted-foreground">Editor visual</p>
                      </div>
                    </label>
                    <label className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border cursor-pointer',
                      contentSource === 'html' ? 'border-primary bg-primary/5' : ''
                    )}>
                      <RadioGroupItem value="html" />
                      <div>
                        <p className="font-medium">HTML</p>
                        <p className="text-sm text-muted-foreground">Código personalizado</p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>

                {contentSource === 'template' && (
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plantilla..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {(contentSource === 'scratch' || contentSource === 'template') && (
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowEditor(!showEditor)}
                      className="w-full"
                    >
                      {showEditor ? 'Ocultar editor' : 'Abrir editor'}
                    </Button>
                    
                    {showEditor && (
                      <div className="border rounded-lg">
                        <EmailEditor
                          initialContent={emailContent}
                          onChange={setEmailContent}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Resumen de Campaña</h2>
                <Card className="bg-muted/50">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Campaña:</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Asunto:</span>
                      <span className="font-medium">{subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">De:</span>
                      <span className="font-medium">{fromName} &lt;{fromEmail}&gt;</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Destinatarios:</span>
                      <span className="font-medium">{estimatedRecipients.toLocaleString()} contactos</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <h3 className="font-medium">Checklist</h3>
                <div className="space-y-1">
                  {[
                    { ok: !!subject, label: 'Asunto definido' },
                    { ok: emailContent.blocks.length > 0, label: 'Contenido creado' },
                    { ok: estimatedRecipients > 0, label: 'Destinatarios seleccionados' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {item.ok ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className={item.ok ? '' : 'text-yellow-600'}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Send options */}
              <div className="space-y-4">
                <h3 className="font-medium">¿Cuándo enviar?</h3>
                <RadioGroup value={sendOption} onValueChange={(v) => setSendOption(v as SendOption)}>
                  <label className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border cursor-pointer',
                    sendOption === 'now' ? 'border-primary bg-primary/5' : ''
                  )}>
                    <RadioGroupItem value="now" />
                    <p className="font-medium">Enviar ahora</p>
                  </label>
                  <label className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border cursor-pointer',
                    sendOption === 'scheduled' ? 'border-primary bg-primary/5' : ''
                  )}>
                    <RadioGroupItem value="scheduled" />
                    <p className="font-medium">Programar para:</p>
                  </label>
                </RadioGroup>

                {sendOption === 'scheduled' && (
                  <div className="flex gap-4 pl-8">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-48">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {scheduledDate ? format(scheduledDate, 'dd/MM/yyyy') : 'Fecha'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={scheduledDate}
                          onSelect={setScheduledDate}
                          disabled={(date) => date < new Date()}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Summary box */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <p className="text-blue-700">
                      Este email se enviará a <strong>{estimatedRecipients.toLocaleString()} contactos</strong>
                      {sendOption === 'scheduled' && scheduledDate && (
                        <> el {format(scheduledDate, 'dd MMMM yyyy', { locale: es })} a las {scheduledTime}</>
                      )}
                      {sendOption === 'now' && <> inmediatamente</>}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            <div className="flex gap-2">
              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                  <Button 
                    onClick={() => handleSave(true)} 
                    disabled={isSaving || !validateStep(3)}
                  >
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Send className="w-4 h-4 mr-2" />
                    {sendOption === 'now' ? 'Enviar ahora' : 'Programar envío'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
