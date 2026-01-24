/**
 * Service Prices Manager Component
 * Manages jurisdiction-specific pricing for a service
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Edit, Loader2, Globe, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import {
  useServicePrices,
  useCreateServicePrice,
  useUpdateServicePrice,
  useDeleteServicePrice,
} from '@/hooks/use-service-catalog';
import { JURISDICTIONS, CURRENCIES, type ServicePrice } from '@/types/service-catalog';

// =============================================
// Schema
// =============================================

const priceFormSchema = z.object({
  jurisdiction: z.string().min(1, 'Selecciona una jurisdicción'),
  official_fee: z.number().min(0),
  professional_fee: z.number().min(0),
  currency: z.string().default('EUR'),
  classes_included: z.number().min(0).default(1),
  extra_class_fee: z.number().min(0).default(0),
  notes: z.string().optional(),
});

type PriceFormValues = z.infer<typeof priceFormSchema>;

// =============================================
// Component
// =============================================

interface ServicePricesManagerProps {
  serviceId: string;
  serviceName: string;
  defaultPrice: number;
  onClose?: () => void;
}

export function ServicePricesManager({
  serviceId,
  serviceName,
  defaultPrice,
  onClose,
}: ServicePricesManagerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ServicePrice | null>(null);

  const { data: prices, isLoading } = useServicePrices(serviceId);
  const createPrice = useCreateServicePrice();
  const updatePrice = useUpdateServicePrice();
  const deletePrice = useDeleteServicePrice();

  const form = useForm<PriceFormValues>({
    resolver: zodResolver(priceFormSchema),
    defaultValues: {
      jurisdiction: '',
      official_fee: 0,
      professional_fee: 0,
      currency: 'EUR',
      classes_included: 1,
      extra_class_fee: 0,
      notes: '',
    },
  });

  // Get jurisdictions not yet added
  const usedJurisdictions = prices?.map(p => p.jurisdiction) || [];
  const availableJurisdictions = Object.entries(JURISDICTIONS).filter(
    ([code]) => !usedJurisdictions.includes(code) || editingPrice?.jurisdiction === code
  );

  const handleOpenForm = (price?: ServicePrice) => {
    if (price) {
      setEditingPrice(price);
      form.reset({
        jurisdiction: price.jurisdiction,
        official_fee: price.official_fee,
        professional_fee: price.professional_fee,
        currency: price.currency,
        classes_included: price.classes_included,
        extra_class_fee: price.extra_class_fee,
        notes: price.notes || '',
      });
    } else {
      setEditingPrice(null);
      form.reset({
        jurisdiction: '',
        official_fee: 0,
        professional_fee: 0,
        currency: 'EUR',
        classes_included: 1,
        extra_class_fee: 0,
        notes: '',
      });
    }
    setFormOpen(true);
  };

  const handleSubmit = async (values: PriceFormValues) => {
    try {
      if (editingPrice) {
        await updatePrice.mutateAsync({
          id: editingPrice.id,
          serviceId,
          data: values,
        });
        toast.success('Precio actualizado');
      } else {
        await createPrice.mutateAsync({
          service_id: serviceId,
          jurisdiction: values.jurisdiction,
          official_fee: values.official_fee,
          professional_fee: values.professional_fee,
          currency: values.currency,
          classes_included: values.classes_included,
          extra_class_fee: values.extra_class_fee,
          notes: values.notes || null,
          is_active: true,
        });
        toast.success('Precio añadido');
      }
      setFormOpen(false);
      form.reset();
    } catch (error) {
      toast.error('Error al guardar precio');
    }
  };

  const handleDelete = async (price: ServicePrice) => {
    if (!confirm(`¿Eliminar precio para ${JURISDICTIONS[price.jurisdiction]?.label || price.jurisdiction}?`)) {
      return;
    }
    try {
      await deletePrice.mutateAsync({ id: price.id, serviceId });
      toast.success('Precio eliminado');
    } catch (error) {
      toast.error('Error al eliminar precio');
    }
  };

  const watchedOfficialFee = form.watch('official_fee') || 0;
  const watchedProfessionalFee = form.watch('professional_fee') || 0;
  const calculatedTotal = watchedOfficialFee + watchedProfessionalFee;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Precios por Jurisdicción
          </h3>
          <p className="text-sm text-muted-foreground">
            Precio base: <span className="font-medium">{defaultPrice.toLocaleString()}€</span>
          </p>
        </div>
        <Button size="sm" onClick={() => handleOpenForm()} disabled={availableJurisdictions.length === 0}>
          <Plus className="w-4 h-4 mr-1" />
          Añadir jurisdicción
        </Button>
      </div>

      {/* Prices Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : prices && prices.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-32">Jurisdicción</TableHead>
                <TableHead className="text-right">Tasa oficial</TableHead>
                <TableHead className="text-right">Honorarios</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center w-20">Clases</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.map((price) => {
                const jurisdictionInfo = JURISDICTIONS[price.jurisdiction];
                return (
                  <TableRow key={price.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{jurisdictionInfo?.flag || '🌍'}</span>
                        <div>
                          <span className="font-medium">{price.jurisdiction}</span>
                          {jurisdictionInfo?.office && (
                            <p className="text-xs text-muted-foreground">{jurisdictionInfo.office}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {price.official_fee.toLocaleString()} {price.currency}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {price.professional_fee.toLocaleString()} {price.currency}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {price.total_price.toLocaleString()} {price.currency}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{price.classes_included}</Badge>
                      {price.extra_class_fee > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          +{price.extra_class_fee}€
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenForm(price)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(price)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-muted/30">
          <Globe className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No hay precios específicos por jurisdicción.
            <br />
            Se usará el precio base del servicio.
          </p>
        </div>
      )}

      {/* Price Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPrice ? 'Editar precio' : 'Añadir precio por jurisdicción'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Jurisdiction */}
              <FormField
                control={form.control}
                name="jurisdiction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurisdicción *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!editingPrice}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona jurisdicción" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableJurisdictions.map(([code, info]) => (
                          <SelectItem key={code} value={code}>
                            <span className="flex items-center gap-2">
                              <span>{info.flag}</span>
                              <span>{info.label}</span>
                              {info.office && (
                                <span className="text-muted-foreground">({info.office})</span>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fees */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="official_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasa oficial</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="professional_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Honorarios</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Total display */}
              <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total calculado</span>
                <span className="text-lg font-bold">{calculatedTotal.toLocaleString()}€</span>
              </div>

              {/* Currency & Classes */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
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
                  name="classes_included"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clases incluidas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="extra_class_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clase adicional</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Incluye búsqueda previa, Precio promocional..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createPrice.isPending || updatePrice.isPending}>
                  {(createPrice.isPending || updatePrice.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingPrice ? 'Actualizar' : 'Añadir'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
