// ============================================
// src/components/matters/AddFilingModal.tsx
// Modal to add a filing/presentation to a matter
// ============================================

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useCreateFiling } from '@/hooks/use-matters-v2';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  jurisdiction_code: z.string().min(1, 'Selecciona una jurisdicción'),
  application_number: z.string().optional(),
  registration_number: z.string().optional(),
  filing_date: z.string().optional(),
  registration_date: z.string().optional(),
  expiry_date: z.string().optional(),
  status: z.string().default('pending'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddFilingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
}

const JURISDICTIONS = [
  { code: 'ES', name: 'España (OEPM)' },
  { code: 'EU', name: 'Unión Europea (EUIPO)' },
  { code: 'WO', name: 'Internacional (WIPO)' },
  { code: 'US', name: 'Estados Unidos (USPTO)' },
  { code: 'GB', name: 'Reino Unido (UKIPO)' },
  { code: 'DE', name: 'Alemania (DPMA)' },
  { code: 'FR', name: 'Francia (INPI)' },
  { code: 'IT', name: 'Italia (UIBM)' },
  { code: 'PT', name: 'Portugal (INPI)' },
  { code: 'CN', name: 'China (CNIPA)' },
  { code: 'JP', name: 'Japón (JPO)' },
  { code: 'KR', name: 'Corea del Sur (KIPO)' },
  { code: 'MX', name: 'México (IMPI)' },
  { code: 'BR', name: 'Brasil (INPI)' },
  { code: 'AR', name: 'Argentina (INPI)' },
  { code: 'CL', name: 'Chile (INAPI)' },
  { code: 'CO', name: 'Colombia (SIC)' },
];

const STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'filed', label: 'Presentado' },
  { value: 'published', label: 'Publicado' },
  { value: 'granted', label: 'Concedido' },
  { value: 'active', label: 'Activo' },
  { value: 'opposed', label: 'En oposición' },
  { value: 'expired', label: 'Expirado' },
  { value: 'abandoned', label: 'Abandonado' },
];

export function AddFilingModal({ 
  open, 
  onOpenChange, 
  matterId,
}: AddFilingModalProps) {
  const { toast } = useToast();
  const createFiling = useCreateFiling();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jurisdiction_code: '',
      status: 'pending',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createFiling.mutateAsync({
        matter_id: matterId,
        jurisdiction_code: values.jurisdiction_code,
        application_number: values.application_number || null,
        registration_number: values.registration_number || null,
        filing_date: values.filing_date || null,
        registration_date: values.registration_date || null,
        expiry_date: values.expiry_date || null,
        status: values.status,
      });

      toast({ title: 'Presentación añadida correctamente' });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating filing:', error);
      toast({ title: 'Error al añadir presentación', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Añadir Presentación</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Jurisdiction */}
            <FormField
              control={form.control}
              name="jurisdiction_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jurisdicción *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar jurisdicción..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {JURISDICTIONS.map(j => (
                        <SelectItem key={j.code} value={j.code}>
                          {j.code} - {j.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Application Number */}
            <FormField
              control={form.control}
              name="application_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nº Solicitud</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: 018123456" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Registration Number */}
            <FormField
              control={form.control}
              name="registration_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nº Registro</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: 018123456" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="filing_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha presentación</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registration_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha registro</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expiry_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha vencimiento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createFiling.isPending}>
                {createFiling.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Añadir presentación
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
