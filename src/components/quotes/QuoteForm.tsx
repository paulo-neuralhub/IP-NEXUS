/**
 * Quote Form Component
 * Modal for creating new quotes with line items
 */

import { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Plus, Trash2, Loader2, Save, Send, BookOpen } from 'lucide-react';

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
import { Calendar } from '@/components/ui/calendar';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useContacts } from '@/hooks/use-crm';
import { useCreateQuote } from '@/hooks/use-finance';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServiceSelector } from '@/components/service-catalog';
import type { ServiceCatalogItem } from '@/types/service-catalog';

// =============================================
// SCHEMA
// =============================================

const lineItemSchema = z.object({
  description: z.string().min(1, 'Descripción requerida'),
  quantity: z.number().min(0.01, 'Cantidad mínima 0.01'),
  unit_price: z.number().min(0, 'Precio no puede ser negativo'),
});

const quoteFormSchema = z.object({
  contact_id: z.string().min(1, 'Selecciona un cliente'),
  valid_until: z.date(),
  notes: z.string().optional(),
  introduction: z.string().optional(),
  terms: z.string().optional(),
  tax_rate: z.number().min(0).max(100),
  items: z.array(lineItemSchema).min(1, 'Añade al menos una línea'),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

// =============================================
// COMPONENT
// =============================================

interface QuoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function QuoteForm({ open, onOpenChange, onSuccess }: QuoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<'draft' | 'sent'>('draft');
  const [catalogOpen, setCatalogOpen] = useState(false);

  // Queries
  const { data: contacts = [], isLoading: loadingContacts } = useContacts({ type: 'company' });
  const createQuote = useCreateQuote();

  // Form
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      contact_id: '',
      valid_until: addDays(new Date(), 30),
      notes: '',
      introduction: '',
      terms: 'Pago a 30 días desde la fecha de factura.',
      tax_rate: 21,
      items: [{ description: '', quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Calculations
  const watchedItems = form.watch('items');
  const watchedTaxRate = form.watch('tax_rate');

  const totals = useMemo(() => {
    const subtotal = watchedItems.reduce((sum, item) => {
      return sum + (item.quantity || 0) * (item.unit_price || 0);
    }, 0);
    const taxAmount = subtotal * (watchedTaxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }, [watchedItems, watchedTaxRate]);

  // Handlers
  const handleSubmit = async (values: QuoteFormValues, status: 'draft' | 'sent') => {
    setIsSubmitting(true);
    setSubmitAction(status);

    try {
      // Get client info
      const selectedContact = contacts.find(c => c.id === values.contact_id);
      if (!selectedContact) throw new Error('Cliente no encontrado');

      // Create quote
      const quote = await createQuote.mutateAsync({
        contact_id: values.contact_id,
        client_name: selectedContact.name || selectedContact.company_name || '',
        client_email: selectedContact.email || undefined,
        quote_date: new Date().toISOString().split('T')[0],
        valid_until: format(values.valid_until, 'yyyy-MM-dd'),
        subtotal: totals.subtotal,
        tax_rate: values.tax_rate,
        tax_amount: totals.taxAmount,
        total: totals.total,
        status,
        introduction: values.introduction || undefined,
        terms: values.terms || undefined,
        notes: values.notes || undefined,
        sent_at: status === 'sent' ? new Date().toISOString() : undefined,
      });

      // Create quote items
      const itemsToInsert = values.items.map((item, index) => ({
        quote_id: quote.id,
        line_number: index + 1,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success(
        status === 'draft' 
          ? 'Presupuesto guardado como borrador' 
          : 'Presupuesto creado y enviado'
      );

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Error al crear el presupuesto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLine = () => {
    append({ description: '', quantity: 1, unit_price: 0 });
  };

  const handleAddFromCatalog = (service: ServiceCatalogItem) => {
    append({
      description: service.name + (service.description ? ` - ${service.description}` : ''),
      quantity: 1,
      unit_price: service.base_price,
    });
    toast.success(`"${service.name}" añadido`);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Presupuesto</DialogTitle>
          <DialogDescription>
            Crea un presupuesto para enviar a tu cliente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6">
            {/* Header Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Client Select */}
              <FormField
                control={form.control}
                name="contact_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingContacts}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.company_name || contact.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valid Until */}
              <FormField
                control={form.control}
                name="valid_until"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Válido hasta</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: es })
                            ) : (
                              <span>Selecciona fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Introduction */}
            <FormField
              control={form.control}
              name="introduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Introducción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Texto introductorio del presupuesto..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base">Líneas del presupuesto</FormLabel>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setCatalogOpen(true)}>
                    <BookOpen className="w-4 h-4 mr-1" />
                    Desde catálogo
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={addLine}>
                    <Plus className="w-4 h-4 mr-1" />
                    Línea manual
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[40%]">Descripción</TableHead>
                      <TableHead className="w-[15%] text-right">Cantidad</TableHead>
                      <TableHead className="w-[20%] text-right">Precio unit.</TableHead>
                      <TableHead className="w-[20%] text-right">Subtotal</TableHead>
                      <TableHead className="w-[5%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const quantity = form.watch(`items.${index}.quantity`) || 0;
                      const unitPrice = form.watch(`items.${index}.unit_price`) || 0;
                      const lineSubtotal = quantity * unitPrice;

                      return (
                        <TableRow key={field.id}>
                          <TableCell className="p-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.description`}
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      placeholder="Descripción del servicio..."
                                      className="border-0 bg-transparent focus-visible:ring-1"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0.01}
                                      step={0.01}
                                      className="text-right border-0 bg-transparent focus-visible:ring-1"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.unit_price`}
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      step={0.01}
                                      className="text-right border-0 bg-transparent focus-visible:ring-1"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2 text-right font-medium">
                            {lineSubtotal.toLocaleString('es-ES', { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2 
                            })} €
                          </TableCell>
                          <TableCell className="p-2">
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {form.formState.errors.items?.root && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.items.root.message}
                </p>
              )}
            </div>

            <Separator />

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {totals.subtotal.toLocaleString('es-ES', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                    })} €
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">IVA</span>
                    <FormField
                      control={form.control}
                      name="tax_rate"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              className="w-16 h-7 text-right text-xs"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <span className="font-medium">
                    {totals.taxAmount.toLocaleString('es-ES', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                    })} €
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">
                    {totals.total.toLocaleString('es-ES', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                    })} €
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notes & Terms */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condiciones</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Condiciones de pago..."
                        className="resize-none"
                        rows={3}
                        {...field}
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
                    <FormLabel>Notas internas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notas internas (no visibles para el cliente)..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="secondary"
            onClick={form.handleSubmit((values) => handleSubmit(values, 'draft'))}
            disabled={isSubmitting}
          >
            {isSubmitting && submitAction === 'draft' && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            <Save className="w-4 h-4 mr-2" />
            Guardar borrador
          </Button>
          <Button
            onClick={form.handleSubmit((values) => handleSubmit(values, 'sent'))}
            disabled={isSubmitting}
          >
            {isSubmitting && submitAction === 'sent' && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            <Send className="w-4 h-4 mr-2" />
            Crear y enviar
          </Button>
        </DialogFooter>

        {/* Service Catalog Selector */}
        <ServiceSelector
          open={catalogOpen}
          onOpenChange={setCatalogOpen}
          onSelect={handleAddFromCatalog}
          multiSelect
        />
      </DialogContent>
    </Dialog>
  );
}
