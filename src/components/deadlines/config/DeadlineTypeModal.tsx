// ============================================================
// IP-NEXUS - DEADLINE TYPE MODAL
// Modal for creating/editing deadline types
// ============================================================

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  type DeadlineTypeConfig,
  useCreateDeadlineType,
  useUpdateDeadlineType,
  DEADLINE_CATEGORIES,
} from '@/hooks/useDeadlineTypesConfig';

const formSchema = z.object({
  code: z.string().min(1, 'Requerido'),
  name_es: z.string().min(1, 'Requerido'),
  name_en: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1, 'Requerido'),
  matter_types: z.array(z.string()).min(1, 'Selecciona al menos uno'),
});

type FormData = z.infer<typeof formSchema>;

const MATTER_TYPE_OPTIONS = [
  { value: 'trademark', label: 'Marcas' },
  { value: 'patent', label: 'Patentes' },
  { value: 'design', label: 'Diseños' },
  { value: 'utility_model', label: 'Modelos de Utilidad' },
];

interface DeadlineTypeModalProps {
  open: boolean;
  onClose: () => void;
  type: DeadlineTypeConfig | null;
}

export function DeadlineTypeModal({ open, onClose, type }: DeadlineTypeModalProps) {
  const createType = useCreateDeadlineType();
  const updateType = useUpdateDeadlineType();

  const isEditing = !!type;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name_es: '',
      name_en: '',
      description: '',
      category: 'other',
      matter_types: ['trademark', 'patent', 'design', 'utility_model'],
    },
  });

  useEffect(() => {
    if (type) {
      form.reset({
        code: type.code,
        name_es: type.name_es,
        name_en: type.name_en || '',
        description: type.description || '',
        category: type.category,
        matter_types: type.matter_types,
      });
    } else {
      form.reset({
        code: '',
        name_es: '',
        name_en: '',
        description: '',
        category: 'other',
        matter_types: ['trademark', 'patent', 'design', 'utility_model'],
      });
    }
  }, [type, form]);

  const onSubmit = (data: FormData) => {
    if (isEditing && type) {
      updateType.mutate(
        { id: type.id, ...data },
        { onSuccess: onClose }
      );
    } else {
      // Ensure all required fields are present
      createType.mutate({
        code: data.code,
        name_es: data.name_es,
        name_en: data.name_en,
        description: data.description,
        category: data.category,
        matter_types: data.matter_types,
      }, { onSuccess: onClose });
    }
  };

  const toggleMatterType = (value: string) => {
    const current = form.getValues('matter_types');
    if (current.includes(value)) {
      form.setValue('matter_types', current.filter(v => v !== value));
    } else {
      form.setValue('matter_types', [...current, value]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Tipo de Plazo' : 'Nuevo Tipo de Plazo'}
          </DialogTitle>
          <DialogDescription>
            Los tipos de plazo definen las categorías de vencimientos en el sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código único *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="CUSTOM_REVISION_INTERNA"
                      onChange={e => field.onChange(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name_es"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre (español) *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Revisión interna trimestral" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre (inglés)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Quarterly internal review" />
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Plazo interno para revisión de estado de expedientes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-3 gap-2"
                    >
                      {DEADLINE_CATEGORIES.map(cat => (
                        <Label
                          key={cat.value}
                          htmlFor={cat.value}
                          className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                            field.value === cat.value
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <RadioGroupItem value={cat.value} id={cat.value} />
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-sm">{cat.label}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="matter_types"
              render={() => (
                <FormItem>
                  <FormLabel>Aplica a tipos de expediente *</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {MATTER_TYPE_OPTIONS.map(mt => {
                      const isChecked = form.watch('matter_types').includes(mt.value);
                      return (
                        <label
                          key={mt.value}
                          className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-muted"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleMatterType(mt.value)}
                          />
                          <span className="text-sm">{mt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createType.isPending || updateType.isPending}
              >
                {isEditing ? 'Guardar Cambios' : 'Crear Tipo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
