/**
 * LogCallModal - Modal para registrar llamada desde expediente
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useCreateCommunication } from '@/hooks/legal-ops/useCommunications';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  direction: z.enum(['inbound', 'outbound']),
  duration_minutes: z.number().min(0).optional(),
  outcome: z.string().min(1, 'Resultado requerido'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface LogCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  contactName?: string;
}

const OUTCOMES = [
  { value: 'connected', label: 'Contactado' },
  { value: 'no_answer', label: 'Sin respuesta' },
  { value: 'voicemail', label: 'Buzón de voz' },
  { value: 'busy', label: 'Ocupado' },
  { value: 'callback_scheduled', label: 'Rellamada programada' },
];

export function LogCallModal({
  open,
  onOpenChange,
  matterId,
  contactName,
}: LogCallModalProps) {
  const { toast } = useToast();
  const createComm = useCreateCommunication();
  
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      direction: 'outbound',
      duration_minutes: 5,
      outcome: 'connected',
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createComm.mutateAsync({
        channel: 'phone',
        direction: data.direction,
        matter_id: matterId,
        subject: `Llamada ${data.direction === 'inbound' ? 'recibida' : 'realizada'}${contactName ? ` - ${contactName}` : ''}`,
        body: `${OUTCOMES.find(o => o.value === data.outcome)?.label || data.outcome}. ${data.notes || ''}`,
      });
      toast({ title: 'Llamada registrada' });
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
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Registrar Llamada
            {contactName && <span className="text-muted-foreground">- {contactName}</span>}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="direction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="outbound">Llamada saliente</SelectItem>
                      <SelectItem value="inbound">Llamada entrante</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
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
                      {OUTCOMES.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración (minutos)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0}
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Resumen de la conversación..."
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createComm.isPending}>
                Guardar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
