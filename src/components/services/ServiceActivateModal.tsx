/**
 * Service Activate Modal
 * Modal for activating a preconfigured service with customization
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Info } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import {
  useActivateService,
  type PreconfiguredService,
} from '@/hooks/useServiceCatalogManagement';

// =============================================
// SCHEMA
// =============================================

const activateServiceSchema = z.object({
  reference_code: z.string().optional(),
  professional_fee: z.number().min(0, 'El precio debe ser positivo'),
  includes_official_fees: z.boolean(),
  official_fees_note: z.string().optional(),
  tax_rate: z.number().min(0).max(100),
  description: z.string().optional(),
  estimated_duration: z.string().optional(),
  generates_matter: z.boolean(),
  default_matter_type: z.string().optional(),
  default_matter_subtype: z.string().optional(),
});

type ActivateServiceFormValues = z.infer<typeof activateServiceSchema>;

// =============================================
// COMPONENT
// =============================================

interface ServiceActivateModalProps {
  service: PreconfiguredService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MATTER_TYPES = [
  { value: 'trademark', label: 'Marca' },
  { value: 'patent', label: 'Patente' },
  { value: 'design', label: 'Diseño' },
  { value: 'domain_dispute', label: 'Disputa de dominio' },
  { value: 'opposition', label: 'Oposición' },
  { value: 'cancellation', label: 'Nulidad/Caducidad' },
  { value: 'other', label: 'Otro' },
];

const MATTER_SUBTYPES: Record<string, { value: string; label: string }[]> = {
  trademark: [
    { value: 'word', label: 'Denominativa' },
    { value: 'figurative', label: 'Figurativa' },
    { value: 'mixed', label: 'Mixta' },
    { value: 'sound', label: 'Sonora' },
    { value: '3d', label: 'Tridimensional' },
  ],
  patent: [
    { value: 'invention', label: 'Invención' },
    { value: 'utility_model', label: 'Modelo de utilidad' },
  ],
  design: [
    { value: 'industrial', label: 'Industrial' },
    { value: 'community', label: 'Comunitario' },
  ],
};

const TAX_RATES = [
  { value: 0, label: '0% (Exento)' },
  { value: 4, label: '4% (Superreducido)' },
  { value: 10, label: '10% (Reducido)' },
  { value: 21, label: '21% (General)' },
];

export function ServiceActivateModal({
  service,
  open,
  onOpenChange,
}: ServiceActivateModalProps) {
  const activateService = useActivateService();
  
  const form = useForm<ActivateServiceFormValues>({
    resolver: zodResolver(activateServiceSchema),
    defaultValues: {
      reference_code: '',
      professional_fee: 0,
      includes_official_fees: false,
      official_fees_note: '',
      tax_rate: 21,
      description: '',
      estimated_duration: '',
      generates_matter: false,
      default_matter_type: '',
      default_matter_subtype: '',
    },
  });
  
  // Reset form when service changes
  useEffect(() => {
    if (service) {
      form.reset({
        professional_fee: service.base_price,
        includes_official_fees: service.includes_official_fees,
        official_fees_note: service.official_fees_note || '',
        tax_rate: service.tax_rate || 21,
        description: service.description || '',
        estimated_duration: service.estimated_duration || '',
        generates_matter: service.generates_matter,
        default_matter_type: service.default_matter_type || '',
        default_matter_subtype: service.default_matter_subtype || '',
      });
    }
  }, [service, form]);
  
  const watchMatterType = form.watch('default_matter_type');
  const watchGeneratesMatter = form.watch('generates_matter');
  const watchIncludesFees = form.watch('includes_official_fees');
  
  const handleSubmit = async (values: ActivateServiceFormValues) => {
    if (!service) return;
    
    try {
      await activateService.mutateAsync({
        preconfigured_code: service.preconfigured_code,
        reference_code: values.reference_code || undefined,
        professional_fee: values.professional_fee,
        includes_official_fees: values.includes_official_fees,
        official_fees_note: values.official_fees_note,
        tax_rate: values.tax_rate,
        description: values.description,
        estimated_duration: values.estimated_duration,
        generates_matter: values.generates_matter,
        default_matter_type: values.default_matter_type,
        default_matter_subtype: values.default_matter_subtype,
      });
      
      toast.success('Servicio activado correctamente');
      onOpenChange(false);
    } catch (error) {
      console.error('Error activating service:', error);
      toast.error('Error al activar el servicio');
    }
  };
  
  if (!service) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Activar Servicio</DialogTitle>
          <DialogDescription>
            {service.name}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Price Section */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                Precio
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="professional_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio base (honorarios) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            €
                          </span>
                        </div>
                      </FormControl>
                      {service.base_price > 0 && (
                        <FormDescription>
                          Sugerido: {service.base_price}€
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tax_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo IVA</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(parseFloat(v))}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TAX_RATES.map((rate) => (
                            <SelectItem key={rate.value} value={rate.value.toString()}>
                              {rate.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="includes_official_fees"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Incluye tasas oficiales</FormLabel>
                      <FormDescription>
                        Indicar si las tasas se cobran aparte
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {watchIncludesFees && (
                <FormField
                  control={form.control}
                  name="official_fees_note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nota sobre tasas</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Tasas OEPM: 125,15€ (1 clase)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <Separator />
            
            {/* Description Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Descripción</h4>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción del servicio..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            {/* Options Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Opciones</h4>
              
              <FormField
                control={form.control}
                name="estimated_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración estimada</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 4-6 meses"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="generates_matter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Genera expediente al crear presupuesto</FormLabel>
                      <FormDescription>
                        Crear expediente automáticamente al aceptar
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {watchGeneratesMatter && (
                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                  <FormField
                    control={form.control}
                    name="default_matter_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MATTER_TYPES.map((type) => (
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
                    name="default_matter_subtype"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtipo</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!watchMatterType || !MATTER_SUBTYPES[watchMatterType]}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(MATTER_SUBTYPES[watchMatterType] || []).map((type) => (
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
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={activateService.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={activateService.isPending}>
                {activateService.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Activar servicio
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
