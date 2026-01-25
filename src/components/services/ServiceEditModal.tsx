/**
 * Service Edit Modal
 * Modal for editing an activated service
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

import {
  useUpdateOrganizationService,
  useDeactivateService,
  useDeleteOrganizationService,
  type ActiveService,
} from '@/hooks/useServiceCatalogManagement';

// =============================================
// SCHEMA
// =============================================

const editServiceSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  professional_fee: z.number().min(0, 'El precio debe ser positivo'),
  includes_official_fees: z.boolean(),
  official_fees_note: z.string().optional(),
  tax_rate: z.number().min(0).max(100),
  estimated_duration: z.string().optional(),
  generates_matter: z.boolean(),
  default_matter_type: z.string().optional(),
  default_matter_subtype: z.string().optional(),
  is_active: z.boolean(),
  applicable_offices: z.array(z.string()).optional(),
});

type EditServiceFormValues = z.infer<typeof editServiceSchema>;

// =============================================
// CONSTANTS
// =============================================

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
  { value: 4, label: '4%' },
  { value: 10, label: '10%' },
  { value: 21, label: '21%' },
];

const OFFICES = [
  { value: 'OEPM', label: 'OEPM (España)' },
  { value: 'EUIPO', label: 'EUIPO (UE)' },
  { value: 'WIPO', label: 'OMPI (Internacional)' },
  { value: 'USPTO', label: 'USPTO (EE.UU.)' },
  { value: 'EPO', label: 'EPO (Patentes UE)' },
];

// =============================================
// COMPONENT
// =============================================

interface ServiceEditModalProps {
  service: ActiveService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceEditModal({
  service,
  open,
  onOpenChange,
}: ServiceEditModalProps) {
  const updateService = useUpdateOrganizationService();
  const deactivateService = useDeactivateService();
  const deleteService = useDeleteOrganizationService();
  
  const form = useForm<EditServiceFormValues>({
    resolver: zodResolver(editServiceSchema),
    defaultValues: {
      name: '',
      description: '',
      professional_fee: 0,
      includes_official_fees: false,
      official_fees_note: '',
      tax_rate: 21,
      estimated_duration: '',
      generates_matter: false,
      default_matter_type: '',
      default_matter_subtype: '',
      is_active: true,
      applicable_offices: [],
    },
  });
  
  // Reset form when service changes
  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description || '',
        professional_fee: service.professional_fee || service.base_price,
        includes_official_fees: service.includes_official_fees,
        official_fees_note: service.official_fees_note || '',
        tax_rate: service.tax_rate || 21,
        estimated_duration: service.estimated_duration || '',
        generates_matter: service.generates_matter,
        default_matter_type: service.default_matter_type || '',
        default_matter_subtype: service.default_matter_subtype || '',
        is_active: service.is_active,
        applicable_offices: service.applicable_offices || [],
      });
    }
  }, [service, form]);
  
  const watchMatterType = form.watch('default_matter_type');
  const watchGeneratesMatter = form.watch('generates_matter');
  const watchIncludesFees = form.watch('includes_official_fees');
  
  const handleSubmit = async (values: EditServiceFormValues) => {
    if (!service) return;
    
    try {
      await updateService.mutateAsync({
        id: service.id,
        data: {
          name: values.name,
          description: values.description,
          professional_fee: values.professional_fee,
          base_price: values.professional_fee,
          includes_official_fees: values.includes_official_fees,
          official_fees_note: values.official_fees_note,
          tax_rate: values.tax_rate,
          estimated_duration: values.estimated_duration,
          generates_matter: values.generates_matter,
          default_matter_type: values.default_matter_type,
          default_matter_subtype: values.default_matter_subtype,
          is_active: values.is_active,
          applicable_offices: values.applicable_offices,
        },
      });
      
      toast.success('Servicio actualizado');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Error al actualizar el servicio');
    }
  };
  
  const handleDeactivate = async () => {
    if (!service) return;
    
    try {
      await deactivateService.mutateAsync(service.id);
      toast.success('Servicio desactivado');
      onOpenChange(false);
    } catch (error) {
      toast.error('Error al desactivar el servicio');
    }
  };
  
  const handleDelete = async () => {
    if (!service) return;
    
    try {
      await deleteService.mutateAsync(service.id);
      toast.success('Servicio eliminado');
      onOpenChange(false);
    } catch (error) {
      toast.error('Error al eliminar el servicio');
    }
  };
  
  if (!service) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Servicio</DialogTitle>
          <DialogDescription>
            {service.preconfigured_code && (
              <Badge variant="outline" className="mt-1">
                {service.preconfigured_code}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="font-medium">Información básica</h4>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            {/* Pricing */}
            <div className="space-y-4">
              <h4 className="font-medium">Precios</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="professional_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio base *</FormLabel>
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <Separator />
            
            {/* Configuration */}
            <div className="space-y-4">
              <h4 className="font-medium">Configuración</h4>
              
              <FormField
                control={form.control}
                name="estimated_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración estimada</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 4-6 meses" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="applicable_offices"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oficinas aplicables</FormLabel>
                    <div className="flex flex-wrap gap-4 pt-2">
                      {OFFICES.map((office) => (
                        <label key={office.value} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={field.value?.includes(office.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, office.value]);
                              } else {
                                field.onChange(current.filter(v => v !== office.value));
                              }
                            }}
                          />
                          <span className="text-sm">{office.label}</span>
                        </label>
                      ))}
                    </div>
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
                      <FormLabel>Genera expediente automáticamente</FormLabel>
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
                        <FormLabel>Tipo expediente</FormLabel>
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
            
            <Separator />
            
            {/* Status */}
            <div className="space-y-4">
              <h4 className="font-medium">Estado</h4>
              
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>
                        {field.value ? '● Activo' : '○ Inactivo'}
                      </FormLabel>
                      <FormDescription>
                        Los servicios inactivos no aparecen en presupuestos
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
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline" className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar servicio
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      ¿Eliminar servicio?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. El servicio será eliminado permanentemente
                      de tu catálogo. Podrás volver a activarlo desde el catálogo de disponibles.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateService.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateService.isPending}>
                {updateService.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
