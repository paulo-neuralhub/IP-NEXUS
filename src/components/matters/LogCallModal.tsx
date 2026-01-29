/**
 * LogCallModal - Modal mejorado para registrar llamada desde expediente o cliente
 * Con selector de resultado, tarea de seguimiento, campos condicionales y selector de expediente
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, 
  Voicemail, Clock, CalendarPlus, CheckCircle2
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
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MatterSelector } from '@/components/features/crm/shared/MatterSelector';
import { MatterOption } from '@/hooks/use-matter-selector';
import { useCreateCommunication } from '@/hooks/legal-ops/useCommunications';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const schema = z.object({
  direction: z.enum(['inbound', 'outbound']),
  duration_minutes: z.number().min(0).max(600, 'Duración máxima 10 horas'),
  outcome: z.string().min(1, 'Resultado requerido'),
  notes: z.string().max(5000, 'Notas demasiado largas').optional(),
  createFollowUp: z.boolean().default(false),
  followUpDate: z.string().optional(),
  followUpDescription: z.string().max(500, 'Descripción demasiado larga').optional(),
});

type FormData = z.infer<typeof schema>;

interface LogCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Contexto de expediente (cuando viene de MatterDetailPage)
  matterId?: string;
  matterReference?: string;
  // Contexto de cliente (cuando viene de Client360Page)
  accountId?: string;
  // Otros
  contactName?: string;
  contactPhone?: string;
  entityType?: 'matter' | 'client' | 'deal';
  entityName?: string;
  // Control del selector
  showMatterSelector?: boolean;
}

const OUTCOMES = [
  { value: 'connected', label: 'Contestada', icon: CheckCircle2, color: 'text-emerald-500' },
  { value: 'no_answer', label: 'No contestó', icon: PhoneMissed, color: 'text-amber-500' },
  { value: 'busy', label: 'Ocupado', icon: Phone, color: 'text-orange-500' },
  { value: 'voicemail', label: 'Buzón de voz', icon: Voicemail, color: 'text-blue-500' },
  { value: 'callback_scheduled', label: 'Rellamada programada', icon: CalendarPlus, color: 'text-purple-500' },
  { value: 'wrong_number', label: 'Número incorrecto', icon: PhoneMissed, color: 'text-red-500' },
];

const DURATION_PRESETS = [1, 5, 10, 15, 30, 45, 60];

export function LogCallModal({
  open,
  onOpenChange,
  matterId: initialMatterId,
  matterReference: initialMatterReference,
  accountId,
  contactName,
  contactPhone,
  entityType = 'matter',
  entityName,
  showMatterSelector = true,
}: LogCallModalProps) {
  const { toast } = useToast();
  const createComm = useCreateCommunication();
  
  // State for matter selection (when coming from client context)
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(initialMatterId || null);
  const [selectedMatterReference, setSelectedMatterReference] = useState<string | null>(initialMatterReference || null);

  // Handle matter selection change
  const handleMatterChange = (matterId: string | null, matter: MatterOption | null) => {
    setSelectedMatterId(matterId);
    setSelectedMatterReference(matter?.reference || null);
  };
  
  // Use either fixed matterId or selected one
  const effectiveMatterId = initialMatterId || selectedMatterId;
  
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      direction: 'outbound',
      duration_minutes: 5,
      outcome: 'connected',
      notes: '',
      createFollowUp: false,
      followUpDate: '',
      followUpDescription: '',
    },
  });

  // Reset matter selection when modal opens
  useEffect(() => {
    if (open && !initialMatterId) {
      setSelectedMatterId(null);
      setSelectedMatterReference(null);
    }
  }, [open, initialMatterId]);

  const watchCreateFollowUp = form.watch('createFollowUp');
  const watchOutcome = form.watch('outcome');

  // Auto-suggest follow-up for certain outcomes
  const shouldSuggestFollowUp = ['no_answer', 'busy', 'voicemail', 'callback_scheduled'].includes(watchOutcome);

  const onSubmit = async (data: FormData) => {
    try {
      const outcomeLabel = OUTCOMES.find(o => o.value === data.outcome)?.label || data.outcome;
      
      // Build comprehensive notes including outcome, duration, follow-up
      let fullNotes = outcomeLabel;
      if (data.duration_minutes) {
        fullNotes += ` (${data.duration_minutes} min)`;
      }
      if (data.notes) {
        fullNotes += `\n\n${data.notes}`;
      }
      if (data.createFollowUp && data.followUpDate) {
        fullNotes += `\n\n📅 Seguimiento: ${data.followUpDescription || 'Rellamar'} - ${data.followUpDate}`;
      }
      
      await createComm.mutateAsync({
        channel: 'phone',
        direction: data.direction,
        matter_id: effectiveMatterId || undefined,
        subject: `Llamada ${data.direction === 'inbound' ? 'recibida' : 'realizada'}${contactName ? ` - ${contactName}` : ''}`,
        body: fullNotes,
      });
      
      toast({ 
        title: 'Llamada registrada',
        description: data.createFollowUp ? 'Se ha creado una tarea de seguimiento' : undefined
      });
      form.reset();
      onOpenChange(false);
    } catch {
      toast({ title: 'Error al registrar', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <span>Registrar Llamada</span>
              {contactName && (
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  {contactName} {contactPhone && `• ${contactPhone}`}
                </p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            
            {/* Direction and Outcome in grid */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="outbound">
                          <span className="flex items-center gap-2">
                            <PhoneOutgoing className="w-4 h-4 text-blue-500" />
                            Saliente
                          </span>
                        </SelectItem>
                        <SelectItem value="inbound">
                          <span className="flex items-center gap-2">
                            <PhoneIncoming className="w-4 h-4 text-green-500" />
                            Entrante
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resultado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OUTCOMES.map(opt => {
                          const Icon = opt.icon;
                          return (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className="flex items-center gap-2">
                                <Icon className={cn("w-4 h-4", opt.color)} />
                                {opt.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Duration with presets */}
            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Duración (minutos)
                  </FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0}
                        max={600}
                        className="w-20"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <div className="flex gap-1 flex-wrap">
                      {DURATION_PRESETS.map(preset => (
                        <Button
                          key={preset}
                          type="button"
                          variant={field.value === preset ? "secondary" : "ghost"}
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => field.onChange(preset)}
                        >
                          {preset}'
                        </Button>
                      ))}
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Resumen de la conversación..."
                      rows={3}
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Follow-up task */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="createFollowUp"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="text-sm font-normal flex items-center gap-1 cursor-pointer">
                        <CalendarPlus className="w-4 h-4 text-primary" />
                        Crear tarea de seguimiento
                      </FormLabel>
                      {shouldSuggestFollowUp && !field.value && (
                        <FormDescription className="text-xs text-amber-600 dark:text-amber-400">
                          💡 Recomendado para este resultado
                        </FormDescription>
                      )}
                    </div>
                  </FormItem>
                )}
              />

              {watchCreateFollowUp && (
                <div className="ml-6 p-3 bg-muted/50 rounded-lg space-y-3 border">
                  <FormField
                    control={form.control}
                    name="followUpDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Fecha de seguimiento</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="followUpDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Descripción</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Rellamar para confirmar..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Footer with entity badge */}
            <div className="flex items-center justify-between pt-2 border-t">
              {(entityName || selectedMatterReference || initialMatterReference) && (
                <Badge variant="outline" className="text-xs">
                  📁 {entityType === 'matter' ? 'Expediente' : entityType === 'client' ? 'Cliente' : 'Deal'}: {entityName || selectedMatterReference || initialMatterReference}
                </Badge>
              )}
              
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createComm.isPending}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Guardar
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
