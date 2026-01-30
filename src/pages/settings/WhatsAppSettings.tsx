/**
 * WhatsApp Settings Page
 * Configuration for Meta API or QR Web integration
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  MessageCircle, 
  Settings, 
  Zap, 
  QrCode, 
  Building2, 
  Clock,
  Bell,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Send
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { useWhatsAppConfig } from '@/hooks/whatsapp';
import { useOrganization } from '@/contexts/organization-context';

const settingsSchema = z.object({
  auto_reply_enabled: z.boolean(),
  auto_reply_message: z.string().max(500),
  business_hours_only: z.boolean(),
  business_hours_start: z.string(),
  business_hours_end: z.string(),
  notify_new_messages: z.boolean(),
  notify_email: z.string().email().optional().or(z.literal('')),
});

const requestSchema = z.object({
  company_name: z.string().min(1, 'Requerido'),
  contact_name: z.string().min(1, 'Requerido'),
  contact_email: z.string().email('Email inválido'),
  contact_phone: z.string().optional(),
  plan_type: z.enum(['standard', 'premium', 'enterprise']),
  estimated_monthly_messages: z.number().optional().nullable(),
  current_whatsapp_number: z.string().optional(),
  additional_notes: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;
type RequestFormData = z.infer<typeof requestSchema>;

export default function WhatsAppSettingsPage() {
  const { currentOrganization } = useOrganization();
  const { 
    config, 
    isLoading, 
    isConfigured,
    integrationType,
    metaStatus,
    implementationStatus,
    updateSettings,
    requestImplementation,
    ensureConfig,
  } = useWhatsAppConfig();

  const [showRequestDialog, setShowRequestDialog] = useState(false);

  // Settings form
  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      auto_reply_enabled: config?.auto_reply_enabled ?? false,
      auto_reply_message: config?.auto_reply_message ?? '',
      business_hours_only: config?.business_hours_only ?? false,
      business_hours_start: config?.business_hours_start ?? '09:00',
      business_hours_end: config?.business_hours_end ?? '18:00',
      notify_new_messages: config?.notify_new_messages ?? true,
      notify_email: config?.notify_email ?? '',
    },
  });

  // Request form
  const requestForm = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      company_name: currentOrganization?.name ?? '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      plan_type: 'standard',
      estimated_monthly_messages: null,
      current_whatsapp_number: '',
      additional_notes: '',
    },
  });

  const onSaveSettings = (data: SettingsFormData) => {
    updateSettings.mutate(data);
  };

  const onRequestImplementation = (data: RequestFormData) => {
    const payload = {
      company_name: data.company_name,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone || '',
      plan_type: data.plan_type,
      estimated_monthly_messages: data.estimated_monthly_messages,
      current_whatsapp_number: data.current_whatsapp_number || '',
      additional_notes: data.additional_notes || '',
    };
    requestImplementation.mutate(payload as any, {
      onSuccess: () => setShowRequestDialog(false),
    });
  };

  // Ensure config exists on first load
  if (!isLoading && !config) {
    ensureConfig.mutate();
  }

  const getStatusBadge = () => {
    if (!isConfigured) {
      return <Badge variant="secondary">No configurado</Badge>;
    }
    if (integrationType === 'meta_api') {
      switch (metaStatus) {
        case 'active':
          return <Badge className="bg-green-500">Meta API Activo</Badge>;
        case 'pending':
          return <Badge variant="secondary">Pendiente</Badge>;
        case 'error':
          return <Badge variant="destructive">Error</Badge>;
        default:
          return <Badge variant="secondary">Configurando</Badge>;
      }
    }
    return <Badge variant="secondary">{integrationType}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Configuración de WhatsApp</h1>
            <p className="text-muted-foreground">
              Gestiona tu integración de WhatsApp Business
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Implementation Status Alert */}
      {implementationStatus === 'pending' && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">
            Solicitud en proceso
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Tu solicitud de implementación de WhatsApp Business está siendo procesada. 
            Nos pondremos en contacto contigo pronto.
          </AlertDescription>
        </Alert>
      )}

      {implementationStatus === 'completed' && metaStatus === 'active' && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">
            WhatsApp Business Activo
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Tu integración está activa y funcionando correctamente.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="integration" className="space-y-6">
        <TabsList>
          <TabsTrigger value="integration">
            <Zap className="h-4 w-4 mr-2" />
            Integración
          </TabsTrigger>
          <TabsTrigger value="settings" disabled={!isConfigured}>
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="notifications" disabled={!isConfigured}>
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Option 1: Meta API */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                Recomendado
              </div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">WhatsApp Business API</CardTitle>
                    <CardDescription>Integración profesional con Meta</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Mensajes ilimitados
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Plantillas de mensajes aprobadas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Automatizaciones y bots
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Verificación de número oficial
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Soporte técnico incluido
                  </li>
                </ul>

                <div className="pt-2">
                  {implementationStatus === 'none' ? (
                    <Button 
                      className="w-full" 
                      onClick={() => setShowRequestDialog(true)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Solicitar implementación
                    </Button>
                  ) : implementationStatus === 'pending' ? (
                    <Button className="w-full" disabled>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Solicitud en proceso
                    </Button>
                  ) : metaStatus === 'active' ? (
                    <Button className="w-full" variant="outline" disabled>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Configurado
                    </Button>
                  ) : (
                    <Button className="w-full" variant="secondary">
                      Ver estado
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Option 2: QR Web */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <QrCode className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">WhatsApp Web (QR)</CardTitle>
                    <CardDescription>Conexión personal vía código QR</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Configuración instantánea
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Sin costes adicionales
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Requiere mantener sesión activa
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Limitaciones de WhatsApp personal
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    No apto para uso intensivo
                  </li>
                </ul>

                <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-950/20">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                    Esta opción está en desarrollo. Recomendamos la API de Meta para uso profesional.
                  </AlertDescription>
                </Alert>

                <Button className="w-full" variant="outline" disabled>
                  <QrCode className="h-4 w-4 mr-2" />
                  Próximamente
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Respuestas automáticas</CardTitle>
              <CardDescription>
                Configura respuestas automáticas para cuando no estés disponible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSaveSettings)} className="space-y-6">
                  <FormField
                    control={settingsForm.control}
                    name="auto_reply_enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Respuesta automática</FormLabel>
                          <FormDescription>
                            Envía un mensaje automático cuando recibas un mensaje nuevo
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {settingsForm.watch('auto_reply_enabled') && (
                    <FormField
                      control={settingsForm.control}
                      name="auto_reply_message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensaje de respuesta automática</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Gracias por contactarnos..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={settingsForm.control}
                    name="business_hours_only"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Solo en horario laboral</FormLabel>
                          <FormDescription>
                            La respuesta automática solo se envía fuera del horario configurado
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {settingsForm.watch('business_hours_only') && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={settingsForm.control}
                        name="business_hours_start"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora de inicio</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="business_hours_end"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora de fin</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <Button type="submit" disabled={updateSettings.isPending}>
                    {updateSettings.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Guardar configuración
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura cómo quieres recibir notificaciones de nuevos mensajes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSaveSettings)} className="space-y-6">
                  <FormField
                    control={settingsForm.control}
                    name="notify_new_messages"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Notificaciones de mensajes</FormLabel>
                          <FormDescription>
                            Recibe notificaciones cuando lleguen nuevos mensajes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="notify_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de notificaciones</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="notificaciones@tuempresa.com"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Opcional: recibe un email cuando llegue un mensaje fuera de horario
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={updateSettings.isPending}>
                    {updateSettings.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Guardar
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Implementation Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Solicitar WhatsApp Business API</DialogTitle>
            <DialogDescription>
              Completa el formulario y nos pondremos en contacto contigo para configurar 
              tu integración de WhatsApp Business.
            </DialogDescription>
          </DialogHeader>

          <Form {...requestForm}>
            <form onSubmit={requestForm.handleSubmit(onRequestImplementation)} className="space-y-4">
              <FormField
                control={requestForm.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la empresa</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={requestForm.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de contacto</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={requestForm.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={requestForm.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={requestForm.control}
                  name="plan_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan deseado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Estándar</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={requestForm.control}
                name="current_whatsapp_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de WhatsApp actual (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+34 XXX XXX XXX" {...field} />
                    </FormControl>
                    <FormDescription>
                      Si ya tienes un número de WhatsApp Business que quieres migrar
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={requestForm.control}
                name="additional_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas adicionales (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Cuéntanos más sobre tus necesidades..."
                        rows={3}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowRequestDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={requestImplementation.isPending}>
                  {requestImplementation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Enviar solicitud
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
