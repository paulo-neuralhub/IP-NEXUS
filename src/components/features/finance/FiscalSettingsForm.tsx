// src/components/features/finance/FiscalSettingsForm.tsx
// Form for managing fiscal settings and regulatory compliance

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Building2, FileText, Shield, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useFiscalSettings, useUpsertFiscalSettings } from '@/hooks/finance';
import { toast } from 'sonner';
import type { FiscalSettings, VatRegime, TaxIdType, TbaiTerritory } from '@/types/finance';

const fiscalSettingsSchema = z.object({
  // Datos fiscales
  tax_id: z.string().min(1, 'El NIF/CIF es obligatorio'),
  tax_id_type: z.enum(['NIF', 'CIF', 'NIE', 'VAT', 'OTHER']),
  legal_name: z.string().min(1, 'La razón social es obligatoria'),
  trade_name: z.string().optional(),
  
  // Dirección fiscal
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country_code: z.string().default('ES'),
  
  // Configuración IVA
  vat_regime: z.enum(['general', 'simplified', 'surcharge', 'exempt', 'oss']),
  default_vat_rate: z.number().min(0).max(100),
  applies_surcharge: z.boolean(),
  default_withholding: z.number().min(0).max(100),
  
  // Formatos
  invoice_number_format: z.string().optional(),
  quote_number_format: z.string().optional(),
  
  // SII
  sii_enabled: z.boolean(),
  sii_test_mode: z.boolean(),
  sii_certificate_id: z.string().optional(),
  
  // TicketBAI
  tbai_enabled: z.boolean(),
  tbai_territory: z.enum(['BI', 'SS', 'VI']).nullable().optional(),
  tbai_license_key: z.string().optional(),
  
  // VERI*FACTU
  verifactu_enabled: z.boolean(),
  verifactu_certificate_id: z.string().optional(),
  
  // Certificado
  certificate_expires_at: z.string().optional(),
  certificate_subject: z.string().optional(),
  
  // Cuenta bancaria
  default_bank_account: z.string().optional(),
  default_bank_name: z.string().optional(),
  default_bank_bic: z.string().optional(),
  
  // Textos legales
  invoice_footer: z.string().optional(),
  invoice_notes: z.string().optional(),
  dpd_clause: z.string().optional(),
});

type FiscalSettingsFormData = z.infer<typeof fiscalSettingsSchema>;

const VAT_REGIMES: { value: VatRegime; label: string }[] = [
  { value: 'general', label: 'Régimen general' },
  { value: 'simplified', label: 'Régimen simplificado' },
  { value: 'surcharge', label: 'Recargo de equivalencia' },
  { value: 'exempt', label: 'Exento de IVA' },
  { value: 'oss', label: 'OSS (One-Stop-Shop UE)' },
];

const TAX_ID_TYPES: { value: TaxIdType; label: string }[] = [
  { value: 'NIF', label: 'NIF' },
  { value: 'CIF', label: 'CIF' },
  { value: 'NIE', label: 'NIE' },
  { value: 'VAT', label: 'VAT (EU)' },
  { value: 'OTHER', label: 'Otro' },
];

const TBAI_TERRITORIES: { value: TbaiTerritory; label: string }[] = [
  { value: 'BI', label: 'Bizkaia' },
  { value: 'SS', label: 'Gipuzkoa' },
  { value: 'VI', label: 'Álava' },
];

export function FiscalSettingsForm() {
  const { data: settings, isLoading } = useFiscalSettings();
  const upsertSettings = useUpsertFiscalSettings();
  
  const form = useForm<FiscalSettingsFormData>({
    resolver: zodResolver(fiscalSettingsSchema),
    defaultValues: {
      tax_id: '',
      tax_id_type: 'CIF',
      legal_name: '',
      trade_name: '',
      address_line1: '',
      address_line2: '',
      postal_code: '',
      city: '',
      province: '',
      country_code: 'ES',
      vat_regime: 'general',
      default_vat_rate: 21,
      applies_surcharge: false,
      default_withholding: 0,
      invoice_number_format: '{series}{year}-{number:05d}',
      quote_number_format: 'P{year}-{number:04d}',
      sii_enabled: false,
      sii_test_mode: true,
      tbai_enabled: false,
      tbai_territory: null,
      verifactu_enabled: false,
      default_bank_account: '',
      default_bank_name: '',
      default_bank_bic: '',
      invoice_footer: '',
      invoice_notes: '',
      dpd_clause: '',
    },
  });
  
  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        tax_id: settings.tax_id || '',
        tax_id_type: settings.tax_id_type || 'CIF',
        legal_name: settings.legal_name || '',
        trade_name: settings.trade_name || '',
        address_line1: settings.address_line1 || '',
        address_line2: settings.address_line2 || '',
        postal_code: settings.postal_code || '',
        city: settings.city || '',
        province: settings.province || '',
        country_code: settings.country_code || 'ES',
        vat_regime: settings.vat_regime || 'general',
        default_vat_rate: settings.default_vat_rate ?? 21,
        applies_surcharge: settings.applies_surcharge ?? false,
        default_withholding: settings.default_withholding ?? 0,
        invoice_number_format: settings.invoice_number_format || '{series}{year}-{number:05d}',
        quote_number_format: settings.quote_number_format || 'P{year}-{number:04d}',
        sii_enabled: settings.sii_enabled ?? false,
        sii_test_mode: settings.sii_test_mode ?? true,
        sii_certificate_id: settings.sii_certificate_id || '',
        tbai_enabled: settings.tbai_enabled ?? false,
        tbai_territory: settings.tbai_territory || null,
        tbai_license_key: settings.tbai_license_key || '',
        verifactu_enabled: settings.verifactu_enabled ?? false,
        verifactu_certificate_id: settings.verifactu_certificate_id || '',
        certificate_expires_at: settings.certificate_expires_at || '',
        certificate_subject: settings.certificate_subject || '',
        default_bank_account: settings.default_bank_account || '',
        default_bank_name: settings.default_bank_name || '',
        default_bank_bic: settings.default_bank_bic || '',
        invoice_footer: settings.invoice_footer || '',
        invoice_notes: settings.invoice_notes || '',
        dpd_clause: settings.dpd_clause || '',
      });
    }
  }, [settings, form]);
  
  const onSubmit = async (data: FiscalSettingsFormData) => {
    try {
      await upsertSettings.mutateAsync(data as Partial<FiscalSettings>);
      toast.success('Configuración fiscal guardada');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  const siiEnabled = form.watch('sii_enabled');
  const tbaiEnabled = form.watch('tbai_enabled');
  const verifactuEnabled = form.watch('verifactu_enabled');
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos Fiscales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Datos Fiscales
            </CardTitle>
            <CardDescription>
              Información fiscal para facturas y declaraciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="tax_id_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de identificación</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TAX_ID_TYPES.map((type) => (
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
                name="tax_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIF/CIF</FormLabel>
                    <FormControl>
                      <Input placeholder="B12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="legal_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón social</FormLabel>
                  <FormControl>
                    <Input placeholder="Empresa S.L." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="trade_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre comercial (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre comercial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="address_line1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle, número..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código postal</FormLabel>
                    <FormControl>
                      <Input placeholder="28001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input placeholder="Madrid" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provincia</FormLabel>
                    <FormControl>
                      <Input placeholder="Madrid" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Configuración IVA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Configuración de IVA
            </CardTitle>
            <CardDescription>
              Régimen fiscal y tipos impositivos por defecto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="vat_regime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Régimen de IVA</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VAT_REGIMES.map((regime) => (
                          <SelectItem key={regime.value} value={regime.value}>
                            {regime.label}
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
                name="default_vat_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de IVA por defecto (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
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
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="applies_surcharge"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Recargo de equivalencia</FormLabel>
                      <FormDescription>
                        Aplicar recargo de equivalencia en facturas
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="default_withholding"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retención IRPF por defecto (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Para profesionales: 15% o 7% en nuevos autónomos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Normativa Española */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Cumplimiento Normativo
            </CardTitle>
            <CardDescription>
              Configuración para SII, TicketBAI y VERI*FACTU
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {/* SII */}
              <AccordionItem value="sii">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <span>SII (Suministro Inmediato de Información)</span>
                    {siiEnabled ? (
                      <Badge className="bg-success text-success-foreground">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Desactivado</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="rounded-lg bg-muted/50 p-4 text-sm">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500" />
                      <div>
                        <p className="font-medium">¿Qué es el SII?</p>
                        <p className="text-muted-foreground">
                          Sistema de la AEAT para comunicar facturas en tiempo real. Obligatorio para empresas con facturación &gt; 6M€ o en regímenes especiales.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="sii_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Activar SII</FormLabel>
                          <FormDescription>
                            Envío automático de facturas a la AEAT
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {siiEnabled && (
                    <FormField
                      control={form.control}
                      name="sii_test_mode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Modo pruebas</FormLabel>
                            <FormDescription>
                              Enviar a entorno de pruebas (recomendado inicialmente)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </AccordionContent>
              </AccordionItem>
              
              {/* TicketBAI */}
              <AccordionItem value="tbai">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <span>TicketBAI (País Vasco)</span>
                    {tbaiEnabled ? (
                      <Badge className="bg-success text-success-foreground">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Desactivado</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="rounded-lg bg-muted/50 p-4 text-sm">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500" />
                      <div>
                        <p className="font-medium">¿Qué es TicketBAI?</p>
                        <p className="text-muted-foreground">
                          Sistema obligatorio en el País Vasco para garantizar la integridad de facturas. Cada factura incluye un código QR y firma digital.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="tbai_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Activar TicketBAI</FormLabel>
                          <FormDescription>
                            Generar facturas con formato TicketBAI
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {tbaiEnabled && (
                    <FormField
                      control={form.control}
                      name="tbai_territory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Territorio foral</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar territorio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TBAI_TERRITORIES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </AccordionContent>
              </AccordionItem>
              
              {/* VERI*FACTU */}
              <AccordionItem value="verifactu">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <span>VERI*FACTU (2025)</span>
                    {verifactuEnabled ? (
                      <Badge className="bg-success text-success-foreground">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Próximamente</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="rounded-lg bg-muted/50 p-4 text-sm">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500" />
                      <div>
                        <p className="font-medium">¿Qué es VERI*FACTU?</p>
                        <p className="text-muted-foreground">
                          Nuevo sistema obligatorio desde 2025 para verificar la autenticidad de facturas. Incluye código QR y huella digital encadenada.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="verifactu_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Activar VERI*FACTU</FormLabel>
                          <FormDescription>
                            Generar facturas con formato VERI*FACTU
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        {/* Cuenta bancaria */}
        <Card>
          <CardHeader>
            <CardTitle>Cuenta bancaria por defecto</CardTitle>
            <CardDescription>
              Datos bancarios que aparecerán en las facturas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="default_bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco</FormLabel>
                    <FormControl>
                      <Input placeholder="Banco Ejemplo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="default_bank_bic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BIC/SWIFT</FormLabel>
                    <FormControl>
                      <Input placeholder="ABCDESMM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="default_bank_account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IBAN</FormLabel>
                  <FormControl>
                    <Input placeholder="ES12 1234 5678 9012 3456 7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Textos legales */}
        <Card>
          <CardHeader>
            <CardTitle>Textos legales</CardTitle>
            <CardDescription>
              Textos que aparecerán automáticamente en las facturas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="invoice_footer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pie de factura</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Texto al pie de las facturas..."
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
              name="dpd_clause"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cláusula protección de datos</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cláusula RGPD/LOPDGDD..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Guardar */}
        <div className="flex justify-end">
          <Button type="submit" disabled={upsertSettings.isPending}>
            {upsertSettings.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Guardar configuración fiscal
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
