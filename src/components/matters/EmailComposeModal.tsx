/**
 * EmailComposeModal - Modal para componer email desde expediente
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Send } from 'lucide-react';
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
import { useCreateCommunication } from '@/hooks/legal-ops/useCommunications';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  to: z.string().email('Email inválido'),
  subject: z.string().min(1, 'Asunto requerido'),
  body: z.string().min(1, 'Mensaje requerido'),
});

type FormData = z.infer<typeof schema>;

interface EmailComposeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  matterTitle?: string;
  recipientEmail?: string;
  recipientName?: string;
}

export function EmailComposeModal({
  open,
  onOpenChange,
  matterId,
  matterTitle,
  recipientEmail,
  recipientName,
}: EmailComposeModalProps) {
  const { toast } = useToast();
  const createComm = useCreateCommunication();
  
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      to: recipientEmail || '',
      subject: matterTitle ? `RE: ${matterTitle}` : '',
      body: '',
    },
  });

  // Update defaults when props change
  if (recipientEmail && form.getValues('to') !== recipientEmail) {
    form.setValue('to', recipientEmail);
  }

  const onSubmit = async (data: FormData) => {
    try {
      await createComm.mutateAsync({
        channel: 'email',
        direction: 'outbound',
        matter_id: matterId,
        email_to: [data.to],
        subject: data.subject,
        body: data.body,
      });
      toast({ title: 'Email guardado', description: 'Comunicación registrada en el expediente' });
      form.reset();
      onOpenChange(false);
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Nuevo Email
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Para</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="email@ejemplo.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asunto</FormLabel>
                  <FormControl>
                    <Input placeholder="Asunto del email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensaje</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Escribe tu mensaje..."
                      rows={8}
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
                <Send className="h-4 w-4 mr-1" />
                Enviar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
