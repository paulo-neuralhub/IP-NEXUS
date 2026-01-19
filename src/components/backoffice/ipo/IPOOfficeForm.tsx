// src/components/backoffice/ipo/IPOOfficeForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useIPOOffice, useCreateOffice, useUpdateOffice } from '@/hooks/backoffice/useIPORegistry';
import { REGIONS, TIMEZONES, CURRENCIES, IP_TYPES_CONFIG } from '@/lib/constants/ipo-registry';
import { IPType } from '@/types/ipo-registry.types';
import { useEffect } from 'react';

const officeSchema = z.object({
  code: z.string().min(2).max(10),
  code_alt: z.string().optional(),
  name_official: z.string().min(3),
  name_short: z.string().optional(),
  country_code: z.string().optional(),
  region: z.string().optional(),
  office_type: z.enum(['national', 'regional', 'international']),
  ip_types: z.array(z.string()).min(1, 'Selecciona al menos un tipo'),
  timezone: z.string(),
  languages: z.array(z.string()),
  currency: z.string(),
  address: z.string().optional(),
  website_official: z.string().url().optional().or(z.literal('')),
  website_search: z.string().url().optional().or(z.literal('')),
  email_general: z.string().email().optional().or(z.literal('')),
  phone_general: z.string().optional(),
  tier: z.number().min(1).max(3),
  priority_score: z.number().min(0).max(100),
  status: z.enum(['active', 'inactive', 'maintenance', 'deprecated']),
  notes: z.string().optional(),
});

type OfficeFormData = z.infer<typeof officeSchema>;

export function IPOOfficeForm() {
  const { officeId } = useParams<{ officeId: string }>();
  const navigate = useNavigate();
  const isEdit = !!officeId;
  
  const { data: office, isLoading: loadingOffice } = useIPOOffice(officeId);
  const createOffice = useCreateOffice();
  const updateOffice = useUpdateOffice();

  const form = useForm<OfficeFormData>({
    resolver: zodResolver(officeSchema),
    defaultValues: {
      code: '',
      name_official: '',
      office_type: 'national',
      ip_types: ['trademark'],
      timezone: 'Europe/Madrid',
      languages: ['en'],
      currency: 'EUR',
      tier: 3,
      priority_score: 50,
      status: 'active',
    },
  });

  useEffect(() => {
    if (office) {
      form.reset({
        code: office.code,
        code_alt: office.code_alt || '',
        name_official: office.name_official,
        name_short: office.name_short || '',
        country_code: office.country_code || '',
        region: office.region || '',
        office_type: office.office_type,
        ip_types: office.ip_types || [],
        timezone: office.timezone,
        languages: office.languages || [],
        currency: office.currency,
        address: office.address || '',
        website_official: office.website_official || '',
        website_search: office.website_search || '',
        email_general: office.email_general || '',
        phone_general: office.phone_general || '',
        tier: office.tier,
        priority_score: office.priority_score,
        status: office.status,
        notes: office.notes || '',
      });
    }
  }, [office, form]);

  const onSubmit = async (data: OfficeFormData) => {
    try {
      const submitData = {
        ...data,
        ip_types: data.ip_types as IPType[],
      };
      if (isEdit && officeId) {
        await updateOffice.mutateAsync({ id: officeId, data: submitData });
      } else {
        await createOffice.mutateAsync(submitData);
      }
      navigate('/backoffice/ipo');
    } catch (error) {
      // Error handled in hooks
    }
  };

  const ipTypes = Object.entries(IP_TYPES_CONFIG) as [IPType, { label: string; color: string }][];

  if (loadingOffice && isEdit) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/backoffice/ipo">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Editar Oficina' : 'Nueva Oficina'}
        </h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Identificación */}
          <Card>
            <CardHeader>
              <CardTitle>Identificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Código ST.3 *</Label>
                  <Input id="code" {...form.register('code')} placeholder="ES, US, EM..." />
                  {form.formState.errors.code && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.code.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="code_alt">Código alternativo</Label>
                  <Input id="code_alt" {...form.register('code_alt')} placeholder="OEPM, USPTO..." />
                </div>
              </div>

              <div>
                <Label htmlFor="name_official">Nombre oficial *</Label>
                <Input id="name_official" {...form.register('name_official')} />
                {form.formState.errors.name_official && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.name_official.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="name_short">Nombre corto</Label>
                <Input id="name_short" {...form.register('name_short')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="office_type">Tipo de oficina *</Label>
                  <Select 
                    value={form.watch('office_type')} 
                    onValueChange={(v) => form.setValue('office_type', v as 'national' | 'regional' | 'international')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">Nacional</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                      <SelectItem value="international">Internacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="country_code">País (ISO)</Label>
                  <Input id="country_code" {...form.register('country_code')} placeholder="ES, US, GB..." maxLength={2} />
                </div>
              </div>

              <div>
                <Label>Tipos de PI *</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {ipTypes.map(([value, config]) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ip-${value}`}
                        checked={form.watch('ip_types')?.includes(value)}
                        onCheckedChange={(checked) => {
                          const current = form.getValues('ip_types') || [];
                          if (checked) {
                            form.setValue('ip_types', [...current, value]);
                          } else {
                            form.setValue('ip_types', current.filter(t => t !== value));
                          }
                        }}
                      />
                      <label htmlFor={`ip-${value}`} className="text-sm cursor-pointer">
                        {config.label}
                      </label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.ip_types && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.ip_types.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configuración Regional */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración Regional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Región</Label>
                <Select 
                  value={form.watch('region') || ''} 
                  onValueChange={(v) => form.setValue('region', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar región" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Zona horaria *</Label>
                <Select 
                  value={form.watch('timezone')} 
                  onValueChange={(v) => form.setValue('timezone', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(tz => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Moneda *</Label>
                <Select 
                  value={form.watch('currency')} 
                  onValueChange={(v) => form.setValue('currency', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tier *</Label>
                  <Select 
                    value={form.watch('tier')?.toString()} 
                    onValueChange={(v) => form.setValue('tier', parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Tier 1 (Crítica)</SelectItem>
                      <SelectItem value="2">Tier 2 (Importante)</SelectItem>
                      <SelectItem value="3">Tier 3 (Secundaria)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridad (0-100)</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    max={100} 
                    {...form.register('priority_score', { valueAsNumber: true })} 
                  />
                </div>
              </div>

              <div>
                <Label>Estado *</Label>
                <Select 
                  value={form.watch('status')} 
                  onValueChange={(v) => form.setValue('status', v as 'active' | 'inactive' | 'maintenance' | 'deprecated')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="inactive">Inactiva</SelectItem>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    <SelectItem value="deprecated">Obsoleta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website_official">Website oficial</Label>
                  <Input id="website_official" {...form.register('website_official')} placeholder="https://" />
                </div>
                <div>
                  <Label htmlFor="website_search">Portal de búsqueda</Label>
                  <Input id="website_search" {...form.register('website_search')} placeholder="https://" />
                </div>
                <div>
                  <Label htmlFor="email_general">Email general</Label>
                  <Input id="email_general" {...form.register('email_general')} type="email" />
                </div>
                <div>
                  <Label htmlFor="phone_general">Teléfono</Label>
                  <Input id="phone_general" {...form.register('phone_general')} />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Textarea id="address" {...form.register('address')} />
              </div>
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" {...form.register('notes')} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link to="/backoffice/ipo">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={createOffice.isPending || updateOffice.isPending}>
            {(createOffice.isPending || updateOffice.isPending) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {isEdit ? 'Guardar cambios' : 'Crear oficina'}
          </Button>
        </div>
      </form>
    </div>
  );
}
