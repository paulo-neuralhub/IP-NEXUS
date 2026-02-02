// =====================================================
// IP-NEXUS - ADD CLIENT-HOLDER RELATIONSHIP DIALOG
// =====================================================

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Link } from 'lucide-react';
import { HolderSelector } from './HolderSelector';
import { useCreateClientHolder } from '@/hooks/useHolders';
import { RELATIONSHIP_TYPE_LABELS } from '@/types/holders';

const schema = z.object({
  holder_id: z.string().min(1, 'Seleccione un titular'),
  relationship_type: z.enum(['representation', 'subsidiary', 'affiliate', 'licensor', 'licensee']),
  representation_scope: z.enum(['all', 'trademarks', 'patents', 'designs', 'specific']).optional(),
  jurisdictions: z.string().optional(), // comma separated
  client_reference: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  accountName: string;
}

export function AddClientHolderDialog({ open, onOpenChange, accountId, accountName }: Props) {
  const createClientHolder = useCreateClientHolder();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      holder_id: '',
      relationship_type: 'representation',
      representation_scope: 'all',
      jurisdictions: '',
      client_reference: '',
      notes: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        holder_id: '',
        relationship_type: 'representation',
        representation_scope: 'all',
        jurisdictions: '',
        client_reference: '',
        notes: '',
      });
    }
  }, [open, form]);

  const onSubmit = async (data: FormData) => {
    const jurisdictions = data.jurisdictions
      ? data.jurisdictions.split(',').map(j => j.trim().toUpperCase()).filter(Boolean)
      : undefined;

    await createClientHolder.mutateAsync({
      account_id: accountId,
      holder_id: data.holder_id,
      relationship_type: data.relationship_type,
      representation_scope: data.representation_scope,
      jurisdictions,
      client_reference: data.client_reference || undefined,
      notes: data.notes || undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            Asociar Titular a {accountName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="holder_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titular *</FormLabel>
                  <FormControl>
                    <HolderSelector
                      value={field.value}
                      onValueChange={(id) => field.onChange(id || '')}
                      placeholder="Seleccionar o crear titular..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="relationship_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de relación *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(RELATIONSHIP_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
                name="representation_scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alcance</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Todos los derechos</SelectItem>
                        <SelectItem value="trademarks">Solo marcas</SelectItem>
                        <SelectItem value="patents">Solo patentes</SelectItem>
                        <SelectItem value="designs">Solo diseños</SelectItem>
                        <SelectItem value="specific">Específico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jurisdictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jurisdicciones</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ES, EU, US, WIPO..." />
                  </FormControl>
                  <FormDescription>
                    Códigos de país separados por coma. Dejar vacío para todas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia interna</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Referencia del cliente para este titular" />
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
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Información adicional..." rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createClientHolder.isPending}>
                {createClientHolder.isPending ? 'Guardando...' : 'Asociar titular'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
