/**
 * Service Form Component
 * Modal for creating/editing service catalog items
 */

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Wand2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import { useCreateService, useUpdateService, useGenerateReferenceCode } from '@/hooks/use-service-catalog';
import { SERVICE_TYPES, JURISDICTIONS, type ServiceCatalogItem, type ServiceType, type Jurisdiction } from '@/types/service-catalog';

// =============================================
// SCHEMA
// =============================================

const serviceFormSchema = z.object({
  reference_code: z.string().optional(),
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  service_type: z.enum(['marca', 'patente', 'diseño', 'vigilancia', 'renovacion', 'oposicion', 'informe', 'general']),
  jurisdiction: z.string().nullable().optional(),
  official_fee: z.number().min(0),
  professional_fee: z.number().min(0),
  estimated_days: z.number().min(0).optional().nullable(),
  nice_classes_included: z.number().min(0),
  extra_class_fee: z.number().min(0),
  is_active: z.boolean(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

// =============================================
// COMPONENT
// =============================================

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ServiceCatalogItem | null;
  onSuccess?: () => void;
}

export function ServiceForm({ open, onOpenChange, service, onSuccess }: ServiceFormProps) {
  const isEditing = !!service;
  
  const createService = useCreateService();
  const updateService = useUpdateService();
  const generateCode = useGenerateReferenceCode();
  
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      reference_code: '',
      name: '',
      description: '',
      service_type: 'general',
      jurisdiction: null,
      official_fee: 0,
      professional_fee: 0,
      estimated_days: null,
      nice_classes_included: 1,
      extra_class_fee: 0,
      is_active: true,
    },
  });

  // Reset form when service changes
  useEffect(() => {
    if (service) {
      form.reset({
        reference_code: service.reference_code || '',
        name: service.name,
        description: service.description || '',
        service_type: service.service_type as ServiceType,
        jurisdiction: service.jurisdiction,
        official_fee: service.official_fee || 0,
        professional_fee: service.professional_fee || 0,
        estimated_days: service.estimated_days,
        nice_classes_included: service.nice_classes_included || 1,
        extra_class_fee: service.extra_class_fee || 0,
        is_active: service.is_active,
      });
    } else {
      form.reset({
        reference_code: '',
        name: '',
        description: '',
        service_type: 'general',
        jurisdiction: null,
        official_fee: 0,
        professional_fee: 0,
        estimated_days: null,
        nice_classes_included: 1,
        extra_class_fee: 0,
        is_active: true,
      });
    }
  }, [service, form]);

  // Calculate base price
  const watchedOfficialFee = form.watch('official_fee');
  const watchedProfessionalFee = form.watch('professional_fee');
  const basePrice = useMemo(() => 
    (watchedOfficialFee || 0) + (watchedProfessionalFee || 0),
    [watchedOfficialFee, watchedProfessionalFee]
  );

  // Generate reference code
  const handleGenerateCode = async () => {
    const serviceType = form.getValues('service_type');
    const jurisdiction = form.getValues('jurisdiction');
    
    try {
      const code = await generateCode.mutateAsync({ 
        serviceType: serviceType as ServiceType, 
        jurisdiction 
      });
      form.setValue('reference_code', code);
    } catch (error) {
      toast.error('Error al generar código');
    }
  };

  // Submit handler
  const onSubmit = async (values: ServiceFormValues) => {
    try {
      const data = {
        ...values,
        jurisdiction: values.jurisdiction as Jurisdiction,
      };
      
      if (isEditing) {
        await updateService.mutateAsync({ id: service.id, data });
        toast.success('Servicio actualizado');
      } else {
        await createService.mutateAsync(data);
        toast.success('Servicio creado');
      }
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(isEditing ? 'Error al actualizar' : 'Error al crear servicio');
    }
  };

  const isLoading = createService.isPending || updateService.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="service_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Servicio *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SERVICE_TYPES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
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
                name="jurisdiction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurisdicción</FormLabel>
                    <Select 
                      onValueChange={(v) => field.onChange(v === 'null' ? null : v)} 
                      value={field.value || 'null'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">🌐 Todas</SelectItem>
                        {Object.entries(JURISDICTIONS).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.flag} {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="reference_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Referencia</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="MAR-ES-001" {...field} />
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={handleGenerateCode}
                          disabled={generateCode.isPending}
                        >
                          {generateCode.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Wand2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormDescription>
                        Auto-genera o escribe manualmente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <FormLabel>Activo</FormLabel>
                    <div className="flex items-center h-10">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Servicio *</FormLabel>
                  <FormControl>
                    <Input placeholder="Registro de marca en España" {...field} />
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
                      placeholder="Descripción detallada del servicio..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Pricing */}
            <div className="space-y-4">
              <h4 className="font-medium">Precios</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="official_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasa Oficial (€)</FormLabel>
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
                      <FormLabel>Honorarios (€)</FormLabel>
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

                <FormItem>
                  <FormLabel>Precio Base (€)</FormLabel>
                  <Input
                    value={basePrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    disabled
                    className="bg-muted"
                  />
                  <FormDescription>Calculado</FormDescription>
                </FormItem>
              </div>
            </div>

            <Separator />

            {/* Extra options */}
            <div className="space-y-4">
              <h4 className="font-medium">Opciones adicionales</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="nice_classes_included"
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
                      <FormDescription>Clases Niza</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="extra_class_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clase adicional (€)</FormLabel>
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
                  name="estimated_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plazo estimado</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="días"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormDescription>En días</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear servicio'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
