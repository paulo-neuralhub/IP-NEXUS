import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useMatter, useCreateMatter, useUpdateMatter, useMatters } from '@/hooks/use-matters';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { 
  MatterTypeSelector, 
  NiceClassSelector, 
  TagInput 
} from '@/components/features/docket';
import { MATTER_STATUSES, MARK_TYPES, JURISDICTIONS } from '@/lib/constants/matters';
import type { MatterType, MatterStatus, MarkType } from '@/types/matters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const TYPE_CODES: Record<MatterType, string> = {
  trademark: 'TM',
  patent: 'PT',
  design: 'DS',
  domain: 'DM',
  copyright: 'CR',
  other: 'OT',
};

const formSchema = z.object({
  type: z.enum(['trademark', 'patent', 'design', 'domain', 'copyright', 'other']),
  reference: z.string().min(1, 'Referencia requerida'),
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  status: z.string().default('draft'),
  jurisdiction_code: z.string().optional(),
  jurisdiction: z.string().optional(),
  mark_name: z.string().optional(),
  mark_type: z.string().optional(),
  nice_classes: z.array(z.number()).optional(),
  application_number: z.string().optional(),
  registration_number: z.string().optional(),
  goods_services: z.string().optional(),
  filing_date: z.string().optional(),
  registration_date: z.string().optional(),
  expiry_date: z.string().optional(),
  next_renewal_date: z.string().optional(),
  owner_name: z.string().optional(),
  official_fees: z.number().optional(),
  professional_fees: z.number().optional(),
  currency: z.string().default('EUR'),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function MatterForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  const isEdit = !!id;
  const { data: existingMatter, isLoading: loadingMatter } = useMatter(id || '');
  const { data: allMatters } = useMatters();
  const createMatter = useCreateMatter();
  const updateMatter = useUpdateMatter();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'trademark',
      reference: '',
      title: '',
      status: 'draft',
      jurisdiction_code: '',
      nice_classes: [],
      tags: [],
      currency: 'EUR',
      official_fees: 0,
      professional_fees: 0,
    },
  });
  
  const watchedType = form.watch('type');
  
  // Generate auto reference
  const generateReference = (type: MatterType): string => {
    const year = new Date().getFullYear();
    const code = TYPE_CODES[type];
    const existingOfType = allMatters?.filter(m => 
      m.type === type && m.reference.startsWith(`${code}-${year}`)
    ) || [];
    const nextNum = existingOfType.length + 1;
    return `${code}-${year}-${String(nextNum).padStart(3, '0')}`;
  };
  
  // Update reference when type changes (only for new)
  useEffect(() => {
    if (!isEdit && watchedType) {
      const newRef = generateReference(watchedType);
      form.setValue('reference', newRef);
    }
  }, [watchedType, isEdit, allMatters]);
  
  // Load existing data for edit
  useEffect(() => {
    if (isEdit && existingMatter) {
      form.reset({
        type: existingMatter.type as MatterType,
        reference: existingMatter.reference,
        title: existingMatter.title,
        status: existingMatter.status,
        jurisdiction_code: existingMatter.jurisdiction_code || '',
        jurisdiction: existingMatter.jurisdiction || '',
        mark_name: existingMatter.mark_name || '',
        mark_type: existingMatter.mark_type || '',
        nice_classes: existingMatter.nice_classes || [],
        application_number: existingMatter.application_number || '',
        registration_number: existingMatter.registration_number || '',
        goods_services: existingMatter.goods_services || '',
        filing_date: existingMatter.filing_date || '',
        registration_date: existingMatter.registration_date || '',
        expiry_date: existingMatter.expiry_date || '',
        next_renewal_date: existingMatter.next_renewal_date || '',
        owner_name: existingMatter.owner_name || '',
        official_fees: existingMatter.official_fees || 0,
        professional_fees: existingMatter.professional_fees || 0,
        currency: existingMatter.currency || 'EUR',
        tags: existingMatter.tags || [],
        notes: existingMatter.notes || '',
      });
    }
  }, [isEdit, existingMatter]);
  
  const onSubmit = async (data: FormData) => {
    try {
      const jurisdiction = JURISDICTIONS.find(j => j.code === data.jurisdiction_code);
      
      const payload = {
        type: data.type,
        reference: data.reference,
        title: data.title,
        status: data.status as MatterStatus,
        jurisdiction_code: data.jurisdiction_code || null,
        jurisdiction: jurisdiction?.name || null,
        mark_name: data.mark_name || null,
        mark_type: data.mark_type as MarkType || null,
        nice_classes: data.nice_classes?.length ? data.nice_classes : null,
        application_number: data.application_number || null,
        registration_number: data.registration_number || null,
        goods_services: data.goods_services || null,
        filing_date: data.filing_date || null,
        registration_date: data.registration_date || null,
        expiry_date: data.expiry_date || null,
        next_renewal_date: data.next_renewal_date || null,
        owner_name: data.owner_name || null,
        official_fees: data.official_fees || 0,
        professional_fees: data.professional_fees || 0,
        currency: data.currency,
        tags: data.tags?.length ? data.tags : [],
        notes: data.notes || null,
        created_by: isEdit ? undefined : user?.id,
      };
      
      if (isEdit) {
        await updateMatter.mutateAsync({ id, data: payload as any });
        toast({ title: 'Expediente actualizado' });
      } else {
        const result = await createMatter.mutateAsync(payload as any);
        toast({ title: 'Expediente creado' });
        navigate(`/app/docket/${result.id}`);
        return;
      }
      
      navigate(`/app/docket/${id}`);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'No se pudo guardar',
        variant: 'destructive' 
      });
    }
  };
  
  const isSubmitting = createMatter.isPending || updateMatter.isPending;
  
  if (isEdit && loadingMatter) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  const totalCost = (form.watch('official_fees') || 0) + (form.watch('professional_fees') || 0);
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/docket')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEdit ? `Editar: ${existingMatter?.reference}` : 'Nuevo Expediente'}
          </h1>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de expediente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tipo de Expediente</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MatterTypeSelector 
                        value={field.value} 
                        onChange={field.onChange}
                        disabled={isEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Datos básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos Básicos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referencia *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="TM-2026-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre descriptivo del expediente" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(MATTER_STATUSES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="jurisdiction_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurisdicción</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar jurisdicción" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JURISDICTIONS.map((j) => (
                          <SelectItem key={j.code} value={j.code}>{j.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Datos de Marca */}
          {watchedType === 'trademark' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos de Marca</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mark_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de marca</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ACME" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mark_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de marca</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(MARK_TYPES).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="application_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº Solicitud</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="4123456" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="registration_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº Registro</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="M4123456" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="nice_classes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clases Niza</FormLabel>
                      <FormControl>
                        <NiceClassSelector 
                          value={field.value || []} 
                          onChange={field.onChange} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="goods_services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Productos/Servicios</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descripción de los productos y servicios cubiertos..."
                          rows={3}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fechas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="filing_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presentación</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="registration_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registro</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="next_renewal_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Próx. renovación</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Titular */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Titular</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="owner_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del titular</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ACME Corporation S.L." />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Costes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Costes</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="official_fees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tasas oficiales (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="professional_fees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Honorarios (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div>
                <Label className="text-sm font-medium">Total</Label>
                <div className="mt-2 text-2xl font-bold text-primary">
                  €{totalCost.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagInput 
                        value={field.value || []} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
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
                      <Textarea 
                        {...field} 
                        placeholder="Notas adicionales sobre el expediente..."
                        rows={4}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/app/docket')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEdit ? 'Guardar cambios' : 'Crear expediente'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
