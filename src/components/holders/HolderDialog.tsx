// =====================================================
// IP-NEXUS - HOLDER CREATE/EDIT DIALOG (PROMPT 26)
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, User, MapPin, Phone, FileText } from 'lucide-react';
import { useCreateHolder, useUpdateHolder } from '@/hooks/useHolders';
import type { Holder, HolderFormData, HolderType } from '@/types/holders';
import { HOLDER_TYPE_LABELS } from '@/types/holders';

const holderSchema = z.object({
  holder_type: z.enum(['individual', 'company', 'government', 'organization', 'trust']),
  legal_name: z.string().min(1, 'Nombre legal requerido'),
  trade_name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  tax_id: z.string().optional(),
  tax_id_type: z.string().optional(),
  tax_country: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  primary_contact_name: z.string().optional(),
  primary_contact_email: z.string().email().optional().or(z.literal('')),
  primary_contact_phone: z.string().optional(),
  primary_contact_position: z.string().optional(),
  incorporation_country: z.string().optional(),
  incorporation_date: z.string().optional(),
  incorporation_number: z.string().optional(),
  industry: z.string().optional(),
  preferred_language: z.string().optional(),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holder?: Holder | null;
  onSuccess?: (holder: Holder) => void;
}

export function HolderDialog({ open, onOpenChange, holder, onSuccess }: Props) {
  const createHolder = useCreateHolder();
  const updateHolder = useUpdateHolder();
  const isEditing = !!holder;

  const form = useForm<HolderFormData>({
    resolver: zodResolver(holderSchema),
    defaultValues: {
      holder_type: holder?.holder_type || 'company',
      legal_name: holder?.legal_name || '',
      trade_name: holder?.trade_name || '',
      first_name: holder?.first_name || '',
      last_name: holder?.last_name || '',
      tax_id: holder?.tax_id || '',
      tax_id_type: holder?.tax_id_type || '',
      tax_country: holder?.tax_country || '',
      address_line1: holder?.address_line1 || '',
      address_line2: holder?.address_line2 || '',
      city: holder?.city || '',
      state_province: holder?.state_province || '',
      postal_code: holder?.postal_code || '',
      country: holder?.country || '',
      email: holder?.email || '',
      phone: holder?.phone || '',
      website: holder?.website || '',
      primary_contact_name: holder?.primary_contact_name || '',
      primary_contact_email: holder?.primary_contact_email || '',
      primary_contact_phone: holder?.primary_contact_phone || '',
      primary_contact_position: holder?.primary_contact_position || '',
      incorporation_country: holder?.incorporation_country || '',
      incorporation_date: holder?.incorporation_date || '',
      incorporation_number: holder?.incorporation_number || '',
      industry: holder?.industry || '',
      preferred_language: holder?.preferred_language || 'es',
      notes: holder?.notes || '',
      internal_notes: holder?.internal_notes || '',
    },
  });

  React.useEffect(() => {
    if (open && holder) {
      form.reset({
        holder_type: holder.holder_type,
        legal_name: holder.legal_name,
        trade_name: holder.trade_name || '',
        first_name: holder.first_name || '',
        last_name: holder.last_name || '',
        tax_id: holder.tax_id || '',
        tax_id_type: holder.tax_id_type || '',
        tax_country: holder.tax_country || '',
        address_line1: holder.address_line1 || '',
        address_line2: holder.address_line2 || '',
        city: holder.city || '',
        state_province: holder.state_province || '',
        postal_code: holder.postal_code || '',
        country: holder.country || '',
        email: holder.email || '',
        phone: holder.phone || '',
        website: holder.website || '',
        primary_contact_name: holder.primary_contact_name || '',
        primary_contact_email: holder.primary_contact_email || '',
        primary_contact_phone: holder.primary_contact_phone || '',
        primary_contact_position: holder.primary_contact_position || '',
        incorporation_country: holder.incorporation_country || '',
        incorporation_date: holder.incorporation_date || '',
        incorporation_number: holder.incorporation_number || '',
        industry: holder.industry || '',
        preferred_language: holder.preferred_language || 'es',
        notes: holder.notes || '',
        internal_notes: holder.internal_notes || '',
      });
    } else if (open && !holder) {
      form.reset({
        holder_type: 'company',
        legal_name: '',
        preferred_language: 'es',
      });
    }
  }, [open, holder, form]);

  const onSubmit = async (data: HolderFormData) => {
    try {
      let result: Holder;
      if (isEditing && holder) {
        result = await updateHolder.mutateAsync({ id: holder.id, data });
      } else {
        result = await createHolder.mutateAsync(data);
      }
      onOpenChange(false);
      onSuccess?.(result);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const holderType = form.watch('holder_type');
  const isIndividual = holderType === 'individual';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {isEditing ? 'Editar Titular' : 'Nuevo Titular'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" className="text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  General
                </TabsTrigger>
                <TabsTrigger value="address" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  Dirección
                </TabsTrigger>
                <TabsTrigger value="contact" className="text-xs">
                  <Phone className="h-3 w-3 mr-1" />
                  Contacto
                </TabsTrigger>
                <TabsTrigger value="notes" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Notas
                </TabsTrigger>
              </TabsList>

              {/* TAB: General */}
              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="holder_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de titular *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(HOLDER_TYPE_LABELS).map(([value, label]) => (
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
                    name="preferred_language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idioma preferido</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Idioma" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="pt">Português</SelectItem>
                            <SelectItem value="zh">中文</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isIndividual ? (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nombre" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellidos</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Apellidos" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : null}

                <FormField
                  control={form.control}
                  name="legal_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {isIndividual ? 'Nombre completo legal *' : 'Razón social *'}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={isIndividual ? 'Nombre y apellidos' : 'Razón social completa'} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isIndividual && (
                  <FormField
                    control={form.control}
                    name="trade_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre comercial</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Si diferente de la razón social" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="tax_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIF/CIF/VAT</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="B12345678" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tax_id_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo ID</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NIF">NIF</SelectItem>
                            <SelectItem value="CIF">CIF</SelectItem>
                            <SelectItem value="VAT">VAT</SelectItem>
                            <SelectItem value="EIN">EIN (USA)</SelectItem>
                            <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tax_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País fiscal</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ES" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!isIndividual && (
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="incorporation_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nº Registro Mercantil</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Tomo, Folio, Hoja..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="incorporation_country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País constitución</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="España" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="incorporation_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha constitución</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sector/Industria</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Tecnología, Alimentación, etc." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* TAB: Address */}
              <TabsContent value="address" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="address_line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección (línea 1)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Calle, número, piso..." />
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
                        <Input {...field} placeholder="Edificio, oficina..." />
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
                          <Input {...field} placeholder="Ciudad" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state_province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia/Estado</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Provincia" />
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
                        <FormLabel>Código postal</FormLabel>
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

              {/* TAB: Contact */}
              <TabsContent value="contact" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="email@empresa.com" />
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
                          <Input {...field} placeholder="+34 91 123 4567" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitio web</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://www.empresa.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contacto principal
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primary_contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nombre y apellidos" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="primary_contact_position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Director Legal" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="primary_contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email contacto</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="contacto@empresa.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="primary_contact_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono contacto</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+34 600 123 456" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* TAB: Notes */}
              <TabsContent value="notes" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas generales</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Información adicional sobre el titular..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="internal_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas internas (solo visible internamente)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Notas confidenciales, historial interno..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createHolder.isPending || updateHolder.isPending}
              >
                {createHolder.isPending || updateHolder.isPending 
                  ? 'Guardando...' 
                  : isEditing ? 'Guardar cambios' : 'Crear titular'
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
