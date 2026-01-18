import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateContact, useUpdateContact } from '@/hooks/use-crm';
import { LIFECYCLE_STAGES, CONTACT_SOURCES, INDUSTRIES, CONTACT_TYPES } from '@/lib/constants/crm';
import { toast } from 'sonner';
import { Loader2, User, Building2 } from 'lucide-react';
import type { Contact, ContactType } from '@/types/crm';
import { ScrollArea } from '@/components/ui/scroll-area';

const contactSchema = z.object({
  type: z.enum(['person', 'company']),
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  // Person fields
  company_name: z.string().optional(),
  job_title: z.string().optional(),
  department: z.string().optional(),
  // Company fields
  tax_id: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  employee_count: z.string().optional(),
  annual_revenue: z.number().optional(),
  // Address
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  // CRM
  lifecycle_stage: z.string().default('lead'),
  source: z.string().optional(),
  // Notes
  notes: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  contact?: Contact | null;
}

export function ContactFormModal({ open, onClose, contact }: Props) {
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const isEditing = !!contact;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      type: 'person',
      name: '',
      email: '',
      phone: '',
      mobile: '',
      company_name: '',
      job_title: '',
      department: '',
      tax_id: '',
      website: '',
      industry: '',
      employee_count: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      lifecycle_stage: 'lead',
      source: '',
      notes: '',
    },
  });

  const contactType = form.watch('type');

  useEffect(() => {
    if (contact) {
      form.reset({
        type: contact.type as ContactType,
        name: contact.name,
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        company_name: contact.company_name || '',
        job_title: contact.job_title || '',
        department: contact.department || '',
        tax_id: contact.tax_id || '',
        website: contact.website || '',
        industry: contact.industry || '',
        employee_count: contact.employee_count || '',
        annual_revenue: contact.annual_revenue || undefined,
        address_line1: contact.address_line1 || '',
        address_line2: contact.address_line2 || '',
        city: contact.city || '',
        state: contact.state || '',
        postal_code: contact.postal_code || '',
        country: contact.country || '',
        lifecycle_stage: contact.lifecycle_stage,
        source: contact.source || '',
        notes: contact.notes || '',
      });
    } else {
      form.reset({
        type: 'person',
        name: '',
        email: '',
        lifecycle_stage: 'lead',
      });
    }
  }, [contact, form]);

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const data = {
        ...values,
        email: values.email || null,
        annual_revenue: values.annual_revenue || null,
      };

      if (isEditing && contact) {
        await updateContact.mutateAsync({ id: contact.id, data });
        toast.success('Contacto actualizado');
      } else {
        await createContact.mutateAsync(data as Parameters<typeof createContact.mutateAsync>[0]);
        toast.success('Contacto creado');
      }
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error(isEditing ? 'Error al actualizar el contacto' : 'Error al crear el contacto');
    }
  };

  const isPending = createContact.isPending || updateContact.isPending;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{isEditing ? 'Editar Contacto' : 'Nuevo Contacto'}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 pt-4">
              {/* Tipo de contacto */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de contacto</FormLabel>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={field.value === 'person' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => field.onChange('person')}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Persona
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === 'company' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => field.onChange('company')}
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        Empresa
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="details">
                    {contactType === 'person' ? 'Trabajo' : 'Empresa'}
                  </TabsTrigger>
                  <TabsTrigger value="address">Dirección</TabsTrigger>
                  <TabsTrigger value="crm">CRM</TabsTrigger>
                </TabsList>

                {/* Datos básicos */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={contactType === 'person' ? 'Nombre completo' : 'Nombre de la empresa'} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="email@ejemplo.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+34 91 234 5678" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {contactType === 'person' && (
                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Móvil</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+34 612 345 678" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </TabsContent>

                {/* Detalles de trabajo/empresa */}
                <TabsContent value="details" className="space-y-4 mt-4">
                  {contactType === 'person' ? (
                    <>
                      <FormField
                        control={form.control}
                        name="company_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Empresa</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nombre de la empresa" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="job_title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cargo</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ej: Director de Marketing" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Departamento</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ej: Marketing" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="tax_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>NIF/CIF</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="B12345678" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Web</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://ejemplo.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industria</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar industria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {INDUSTRIES.map((ind) => (
                                  <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="employee_count"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nº Empleados</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1-10">1-10</SelectItem>
                                  <SelectItem value="11-50">11-50</SelectItem>
                                  <SelectItem value="51-200">51-200</SelectItem>
                                  <SelectItem value="201-500">201-500</SelectItem>
                                  <SelectItem value="501-1000">501-1000</SelectItem>
                                  <SelectItem value="1001+">1001+</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="annual_revenue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Facturación anual (€)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                  placeholder="1000000" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* Dirección */}
                <TabsContent value="address" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="address_line1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Calle, número" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address_line2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección (línea 2)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Piso, puerta, etc." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Madrid" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provincia</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Madrid" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Postal</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="28001" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="España" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* CRM */}
                <TabsContent value="crm" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="lifecycle_stage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Etapa del ciclo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar etapa" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(LIFECYCLE_STAGES).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-2 h-2 rounded-full" 
                                      style={{ backgroundColor: config.color }} 
                                    />
                                    {config.label}
                                  </div>
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
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuente</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar fuente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONTACT_SOURCES.map((src) => (
                                <SelectItem key={src.value} value={src.value}>{src.label}</SelectItem>
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
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Notas sobre este contacto..." rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditing ? 'Guardar cambios' : 'Crear contacto'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
