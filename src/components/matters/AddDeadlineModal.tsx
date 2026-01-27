/**
 * AddDeadlineModal - Modal para añadir plazo al expediente
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar } from 'lucide-react';
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
import { useCreateMatterDeadline } from '@/hooks/use-matter-deadlines';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  title: z.string().min(1, 'Título requerido'),
  description: z.string().optional(),
  deadline_type: z.string().min(1, 'Tipo requerido'),
  due_date: z.string().min(1, 'Fecha requerida'),
});

type FormData = z.infer<typeof schema>;

interface AddDeadlineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
}

const DEADLINE_TYPES = [
  { value: 'official', label: 'Plazo Oficial' },
  { value: 'internal', label: 'Plazo Interno' },
  { value: 'renewal', label: 'Renovación' },
  { value: 'response', label: 'Plazo de Respuesta' },
  { value: 'other', label: 'Otro' },
];

export function AddDeadlineModal({ open, onOpenChange, matterId }: AddDeadlineModalProps) {
  const { toast } = useToast();
  const createDeadline = useCreateMatterDeadline();
  
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      deadline_type: 'internal',
      due_date: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createDeadline.mutateAsync({
        matter_id: matterId,
        title: data.title,
        description: data.description || null,
        deadline_type: data.deadline_type,
        due_date: data.due_date,
      });
      toast({ title: 'Plazo añadido' });
      form.reset();
      onOpenChange(false);
    } catch {
      toast({ title: 'Error al crear plazo', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Nuevo Plazo
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Respuesta a requerimiento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEADLINE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de vencimiento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionales..."
                      rows={3}
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
              <Button type="submit" disabled={createDeadline.isPending}>
                Añadir plazo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
