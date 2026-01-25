// ============================================================
// IP-NEXUS - DEADLINE RULE MODAL
// Modal for creating/editing deadline rules
// ============================================================

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  type DeadlineRuleConfig,
  useCreateDeadlineRuleConfig,
  useUpdateDeadlineRuleConfig,
  useCalculateDeadlinePreview,
} from '@/hooks/useDeadlineConfig';

const formSchema = z.object({
  jurisdiction: z.string().min(1, 'Requerido'),
  matter_type: z.string().min(1, 'Requerido'),
  event_type: z.string().min(1, 'Requerido'),
  code: z.string().min(1, 'Requerido'),
  name: z.string().min(1, 'Requerido'),
  description: z.string().optional(),
  days_from_event: z.number(),
  calendar_type: z.string(),
  priority: z.string(),
  alert_days: z.array(z.number()),
  auto_create_task: z.boolean(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const MATTER_TYPES = [
  { value: 'trademark', label: 'Marcas' },
  { value: 'patent', label: 'Patentes' },
  { value: 'design', label: 'Diseños' },
  { value: 'utility_model', label: 'Modelos Utilidad' },
];

const JURISDICTIONS = [
  { value: 'ES', label: '🇪🇸 España' },
  { value: 'EU', label: '🇪🇺 EUIPO' },
  { value: 'US', label: '🇺🇸 USPTO' },
  { value: 'WIPO', label: '🌐 WIPO' },
  { value: 'GB', label: '🇬🇧 Reino Unido' },
];

const EVENT_TYPES = [
  { value: 'filing_date', label: 'Fecha de presentación' },
  { value: 'publication_date', label: 'Fecha de publicación' },
  { value: 'registration_date', label: 'Fecha de registro' },
  { value: 'expiry_date', label: 'Fecha de expiración' },
  { value: 'grant_date', label: 'Fecha de concesión' },
  { value: 'notification_date', label: 'Fecha de notificación' },
  { value: 'priority_date', label: 'Fecha de prioridad' },
];

const PRIORITIES = [
  { value: 'low', label: 'Baja', color: 'bg-gray-500' },
  { value: 'medium', label: 'Media', color: 'bg-yellow-500' },
  { value: 'high', label: 'Alta', color: 'bg-orange-500' },
  { value: 'critical', label: 'Crítica', color: 'bg-red-500' },
];

const DEFAULT_ALERT_DAYS = [180, 90, 30, 15, 7, 1];

interface DeadlineRuleModalProps {
  open: boolean;
  onClose: () => void;
  rule: DeadlineRuleConfig | null;
}

export function DeadlineRuleModal({ open, onClose, rule }: DeadlineRuleModalProps) {
  const createRule = useCreateDeadlineRuleConfig();
  const updateRule = useUpdateDeadlineRuleConfig();
  const calculatePreview = useCalculateDeadlinePreview();
  
  const [previewDate, setPreviewDate] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const isReadOnly = rule?.is_system ?? false;
  const isEditing = !!rule && !rule.is_system;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jurisdiction: '',
      matter_type: 'trademark',
      event_type: 'expiry_date',
      code: '',
      name: '',
      description: '',
      days_from_event: -180,
      calendar_type: 'calendar',
      priority: 'medium',
      alert_days: [30, 15, 7, 1],
      auto_create_task: false,
      notes: '',
    },
  });

  useEffect(() => {
    if (rule) {
      form.reset({
        jurisdiction: rule.jurisdiction,
        matter_type: rule.matter_type,
        event_type: rule.event_type,
        code: rule.code,
        name: rule.name,
        description: rule.description || '',
        days_from_event: rule.days_from_event,
        calendar_type: rule.calendar_type || 'calendar',
        priority: rule.priority || 'medium',
        alert_days: rule.alert_days || [30, 15, 7, 1],
        auto_create_task: rule.auto_create_task || false,
        notes: rule.notes || '',
      });
    } else {
      form.reset({
        jurisdiction: '',
        matter_type: 'trademark',
        event_type: 'expiry_date',
        code: '',
        name: '',
        description: '',
        days_from_event: -180,
        calendar_type: 'calendar',
        priority: 'medium',
        alert_days: [30, 15, 7, 1],
        auto_create_task: false,
        notes: '',
      });
    }
  }, [rule, form]);

  const onSubmit = (data: FormData) => {
    if (isReadOnly) return;

    if (isEditing && rule) {
      updateRule.mutate(
        { id: rule.id, ...data },
        { onSuccess: onClose }
      );
    } else {
      // Ensure all required fields are present
      createRule.mutate({
        jurisdiction: data.jurisdiction,
        matter_type: data.matter_type,
        event_type: data.event_type,
        code: data.code,
        name: data.name,
        description: data.description,
        days_from_event: data.days_from_event,
        calendar_type: data.calendar_type,
        priority: data.priority,
        alert_days: data.alert_days,
        auto_create_task: data.auto_create_task,
        notes: data.notes,
      }, { onSuccess: onClose });
    }
  };

  const handlePreview = () => {
    if (!previewDate) return;
    
    const values = form.getValues();
    calculatePreview.mutate({
      eventDate: previewDate,
      daysOffset: values.days_from_event,
      calendarType: values.calendar_type as 'calendar' | 'business',
      alertDays: values.alert_days,
    });
    setShowPreview(true);
  };

  const toggleAlertDay = (day: number) => {
    const current = form.getValues('alert_days');
    if (current.includes(day)) {
      form.setValue('alert_days', current.filter(d => d !== day));
    } else {
      form.setValue('alert_days', [...current, day].sort((a, b) => b - a));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isReadOnly ? 'Ver Regla de Sistema' : isEditing ? 'Editar Regla' : 'Nueva Regla de Plazo'}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly
              ? 'Las reglas de sistema no se pueden modificar. Puedes crear un override personalizado.'
              : 'Define cómo se calcula este tipo de plazo automáticamente.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="font-medium">Configuración Básica</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="matter_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Expediente</FormLabel>
                      <Select
                        disabled={isReadOnly}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MATTER_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jurisdiction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jurisdicción</FormLabel>
                      <Select
                        disabled={isReadOnly}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {JURISDICTIONS.map(j => (
                            <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isReadOnly} placeholder="TM_RENEWAL_ES" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isReadOnly} placeholder="Renovación marca España" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={isReadOnly} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Calculation */}
            <div className="space-y-4">
              <h4 className="font-medium">Cálculo del Plazo</h4>

              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evento Desencadenante</FormLabel>
                    <Select
                      disabled={isReadOnly}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EVENT_TYPES.map(e => (
                          <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="days_from_event"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Días desde evento</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormDescription>
                        Negativo = antes del evento, Positivo = después
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="calendar_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Calendario</FormLabel>
                      <Select
                        disabled={isReadOnly}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="calendar">Días naturales</SelectItem>
                          <SelectItem value="business">Días hábiles</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Reminders */}
            <div className="space-y-4">
              <h4 className="font-medium">Recordatorios</h4>
              <FormDescription>
                Días antes del vencimiento para enviar recordatorios
              </FormDescription>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_ALERT_DAYS.map(day => {
                  const isSelected = form.watch('alert_days').includes(day);
                  return (
                    <Badge
                      key={day}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer ${isReadOnly ? 'pointer-events-none' : ''}`}
                      onClick={() => !isReadOnly && toggleAlertDay(day)}
                    >
                      {day} días
                    </Badge>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Priority */}
            <div className="space-y-4">
              <h4 className="font-medium">Prioridad y Criticidad</h4>
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <div className="flex gap-2">
                      {PRIORITIES.map(p => (
                        <Button
                          key={p.value}
                          type="button"
                          variant={field.value === p.value ? 'default' : 'outline'}
                          size="sm"
                          disabled={isReadOnly}
                          onClick={() => field.onChange(p.value)}
                        >
                          {p.label}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('priority') === 'critical' && (
                <Card className="border-destructive bg-destructive/5">
                  <CardContent className="py-3 flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span>Plazo fatal: pérdida de derechos si se incumple</span>
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator />

            {/* Preview */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Probar Cálculo
              </h4>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={previewDate}
                  onChange={e => setPreviewDate(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={handlePreview}>
                  Calcular
                </Button>
              </div>

              {showPreview && calculatePreview.data && (
                <Card>
                  <CardContent className="py-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Evento:</span>
                      <span>{calculatePreview.data.eventDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Offset:</span>
                      <span>{form.watch('days_from_event')} días</span>
                    </div>
                    {calculatePreview.data.adjustments.length > 0 && (
                      <div className="text-muted-foreground text-xs">
                        {calculatePreview.data.adjustments.map((a, i) => (
                          <div key={i}>• {a}</div>
                        ))}
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Fecha del plazo:</span>
                      <span className="text-primary">{calculatePreview.data.finalDate}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-muted-foreground text-xs">Recordatorios:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {calculatePreview.data.reminders.map(r => (
                          <Badge key={r.days} variant="secondary" className="text-xs">
                            {r.formatted} ({r.days}d)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {isReadOnly ? 'Cerrar' : 'Cancelar'}
              </Button>
              {!isReadOnly && (
                <Button
                  type="submit"
                  disabled={createRule.isPending || updateRule.isPending}
                >
                  {isEditing ? 'Guardar Cambios' : 'Crear Regla'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
