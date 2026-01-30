// ============================================================
// L111: Página de Configuración de Documentos (Tenant)
// ============================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, Eye, Palette, Building, CreditCard, FileText, Loader2, Hash } from 'lucide-react';
import { StyleSelector } from '@/components/documents/StyleSelector';
import { A4Preview } from '@/components/documents/A4Preview';
import { getCustomizedStyle } from '@/config/documentStyles';
import { DOCUMENT_NUMBER_FORMATS, generateDocumentNumberPreview } from '@/config/documentNumberFormats';
import { DocumentStyleCode, TenantDocumentSettings, StyleColors } from '@/types/documents';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type PartialTenantSettings = Partial<Omit<TenantDocumentSettings, 'id' | 'organizationId'>>;

export default function DocumentSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  const [showPreview, setShowPreview] = useState(false);

  // Estado del formulario
  const [settings, setSettings] = useState<PartialTenantSettings>({
    defaultStyleCode: 'corporativo',
    logoPosition: 'left',
    logoMaxHeight: 50,
    companyInfo: {
      name: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'España',
      phone: '',
      email: '',
      website: '',
      cif: '',
    },
    customTexts: {
      footerText: '',
      confidentialityNotice: 'Este documento es confidencial.',
    },
    invoiceSettings: {
      taxRate: 21,
      paymentTerms: '30 días',
      prefix: 'FAC',
      nextNumber: 1,
    },
  });

  // Document numbering settings
  const [numberingSettings, setNumberingSettings] = useState({
    format: 'PREFIX-YYYY-SEQ',
    prefix: 'DOC',
    sequenceByType: false,
  });

  // Colores personalizados
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [customColors, setCustomColors] = useState({
    primary: '#1E3A5F',
    secondary: '#2563EB',
    accent: '#0D9488',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (membership?.organization_id) {
        const { data } = await supabase
          .from('tenant_document_settings')
          .select('*')
          .eq('organization_id', membership.organization_id)
          .single();

        if (data) {
          setSettings({
            defaultStyleCode: (data.default_style_code as DocumentStyleCode) || 'corporativo',
            logoUrl: data.logo_url || undefined,
            logoPosition: (data.logo_position as 'left' | 'center' | 'right') || 'left',
            logoMaxHeight: data.logo_max_height || 50,
            companyInfo: {
              name: data.company_name || '',
              address: data.company_address || '',
              city: data.company_city || '',
              postalCode: data.company_postal_code || '',
              country: data.company_country || 'España',
              phone: data.company_phone || '',
              email: data.company_email || '',
              website: data.company_website || '',
              cif: data.company_cif || '',
            },
            customTexts: {
              footerText: data.custom_footer_text || '',
              confidentialityNotice: data.confidentiality_notice || '',
            },
            invoiceSettings: {
              taxRate: data.default_tax_rate || 21,
              paymentTerms: data.default_payment_terms || '30 días',
              prefix: data.invoice_prefix || 'FAC',
              nextNumber: data.invoice_next_number || 1,
            },
          });

          // Load document numbering settings
          setNumberingSettings({
            format: data.document_number_format || 'PREFIX-YYYY-SEQ',
            prefix: data.document_number_prefix || 'DOC',
            sequenceByType: data.document_sequence_by_type || false,
          });

          if (data.custom_primary_color) {
            setUseCustomColors(true);
            setCustomColors({
              primary: data.custom_primary_color,
              secondary: data.custom_secondary_color || '#2563EB',
              accent: data.custom_accent_color || '#0D9488',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!membership?.organization_id) {
        throw new Error('No organization found');
      }

      const updateData = {
        organization_id: membership.organization_id,
        default_style_code: settings.defaultStyleCode,
        logo_url: settings.logoUrl,
        logo_position: settings.logoPosition,
        logo_max_height: settings.logoMaxHeight,
        company_name: settings.companyInfo?.name,
        company_address: settings.companyInfo?.address,
        company_city: settings.companyInfo?.city,
        company_postal_code: settings.companyInfo?.postalCode,
        company_country: settings.companyInfo?.country,
        company_phone: settings.companyInfo?.phone,
        company_email: settings.companyInfo?.email,
        company_website: settings.companyInfo?.website,
        company_cif: settings.companyInfo?.cif,
        custom_footer_text: settings.customTexts?.footerText,
        confidentiality_notice: settings.customTexts?.confidentialityNotice,
        default_tax_rate: settings.invoiceSettings?.taxRate,
        default_payment_terms: settings.invoiceSettings?.paymentTerms,
        invoice_prefix: settings.invoiceSettings?.prefix,
        document_number_format: numberingSettings.format,
        document_number_prefix: numberingSettings.prefix,
        document_sequence_by_type: numberingSettings.sequenceByType,
        custom_primary_color: useCustomColors ? customColors.primary : null,
        custom_secondary_color: useCustomColors ? customColors.secondary : null,
        custom_accent_color: useCustomColors ? customColors.accent : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('tenant_document_settings')
        .upsert(updateData, { onConflict: 'organization_id' });

      if (error) throw error;

      toast({
        title: 'Configuración guardada',
        description: 'Los cambios se han guardado correctamente',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      const fileExt = file.name.split('.').pop();
      const fileName = `${membership?.organization_id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('document-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('document-assets')
        .getPublicUrl(fileName);

      setSettings(prev => ({ ...prev, logoUrl: publicUrl }));

      toast({
        title: 'Logo subido',
        description: 'El logo se ha subido correctamente',
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo subir el logo',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const previewStyle = getCustomizedStyle(
    (settings.defaultStyleCode as DocumentStyleCode) || 'corporativo',
    useCustomColors ? { customColors: customColors as Partial<StyleColors> } as TenantDocumentSettings : undefined
  );

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuración de Documentos</h1>
          <p className="text-muted-foreground">Personaliza el aspecto de tus documentos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Ocultar' : 'Vista previa'}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar cambios
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={showPreview ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="branding" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Marca
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Empresa
              </TabsTrigger>
              <TabsTrigger value="numbering" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Numeración
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Facturación
              </TabsTrigger>
              <TabsTrigger value="texts" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Textos
              </TabsTrigger>
            </TabsList>

            {/* TAB: MARCA */}
            <TabsContent value="branding" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Logo</CardTitle>
                  <CardDescription>Sube el logo de tu empresa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-6">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="h-16 object-contain border rounded p-2" />
                    ) : (
                      <div className="h-16 w-32 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground">
                        Sin logo
                      </div>
                    )}
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Label htmlFor="logo-upload" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Subir logo
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Posición del logo</Label>
                      <Select
                        value={settings.logoPosition}
                        onValueChange={(v) => setSettings(prev => ({ ...prev, logoPosition: v as 'left' | 'center' | 'right' }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Izquierda</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="right">Derecha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Altura máxima (px)</Label>
                      <Input
                        type="number"
                        value={settings.logoMaxHeight}
                        onChange={(e) => setSettings(prev => ({ ...prev, logoMaxHeight: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estilo por defecto</CardTitle>
                  <CardDescription>Elige el estilo visual para tus documentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <StyleSelector
                    selectedStyle={(settings.defaultStyleCode as DocumentStyleCode) || 'corporativo'}
                    onSelectStyle={(style) => setSettings(prev => ({ ...prev, defaultStyleCode: style }))}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Colores personalizados</CardTitle>
                      <CardDescription>Sobrescribe los colores del estilo</CardDescription>
                    </div>
                    <Switch checked={useCustomColors} onCheckedChange={setUseCustomColors} />
                  </div>
                </CardHeader>
                {useCustomColors && (
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Color primario</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={customColors.primary}
                            onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={customColors.primary}
                            onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Color secundario</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={customColors.secondary}
                            onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={customColors.secondary}
                            onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Color acento</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={customColors.accent}
                            onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={customColors.accent}
                            onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </TabsContent>

            {/* TAB: EMPRESA */}
            <TabsContent value="company" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Datos de la empresa</CardTitle>
                  <CardDescription>Información que aparecerá en los documentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre de la empresa *</Label>
                      <Input
                        value={settings.companyInfo?.name}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          companyInfo: { ...prev.companyInfo!, name: e.target.value }
                        }))}
                        placeholder="Mi Despacho IP, S.L."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Dirección</Label>
                      <Input
                        value={settings.companyInfo?.address}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          companyInfo: { ...prev.companyInfo!, address: e.target.value }
                        }))}
                        placeholder="Calle Principal 123"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ciudad</Label>
                      <Input
                        value={settings.companyInfo?.city}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          companyInfo: { ...prev.companyInfo!, city: e.target.value }
                        }))}
                        placeholder="Madrid"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Código postal</Label>
                      <Input
                        value={settings.companyInfo?.postalCode}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          companyInfo: { ...prev.companyInfo!, postalCode: e.target.value }
                        }))}
                        placeholder="28001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input
                        value={settings.companyInfo?.phone}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          companyInfo: { ...prev.companyInfo!, phone: e.target.value }
                        }))}
                        placeholder="+34 912 345 678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={settings.companyInfo?.email}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          companyInfo: { ...prev.companyInfo!, email: e.target.value }
                        }))}
                        placeholder="info@midespacho.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sitio web</Label>
                      <Input
                        value={settings.companyInfo?.website}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          companyInfo: { ...prev.companyInfo!, website: e.target.value }
                        }))}
                        placeholder="www.midespacho.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CIF/NIF</Label>
                      <Input
                        value={settings.companyInfo?.cif}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          companyInfo: { ...prev.companyInfo!, cif: e.target.value }
                        }))}
                        placeholder="B12345678"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: NUMERACIÓN */}
            <TabsContent value="numbering" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Numeración de documentos</CardTitle>
                  <CardDescription>
                    Configura el formato de numeración automática para tus documentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Formato de numeración</Label>
                    <Select
                      value={numberingSettings.format}
                      onValueChange={(v) => setNumberingSettings(prev => ({
                        ...prev,
                        format: v
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_NUMBER_FORMATS.map((format) => (
                          <SelectItem key={format.code} value={format.code}>
                            <div className="flex flex-col py-1">
                              <span className="font-medium">{format.name}</span>
                              <span className="text-xs text-muted-foreground">
                                Ejemplo: {format.example}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {DOCUMENT_NUMBER_FORMATS.find(f => f.code === numberingSettings.format)?.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Prefijo personalizado</Label>
                    <Input
                      value={numberingSettings.prefix}
                      onChange={(e) => setNumberingSettings(prev => ({
                        ...prev,
                        prefix: e.target.value.toUpperCase()
                      }))}
                      placeholder="DOC"
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      Se usará como prefijo en los formatos que lo incluyan
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Label>Secuencia por tipo de documento</Label>
                      <p className="text-xs text-muted-foreground">
                        Reinicia la numeración para cada tipo (contrato, carta, informe, etc.)
                      </p>
                    </div>
                    <Switch
                      checked={numberingSettings.sequenceByType}
                      onCheckedChange={(checked) => setNumberingSettings(prev => ({
                        ...prev,
                        sequenceByType: checked
                      }))}
                    />
                  </div>

                  {/* Preview */}
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                    <Label className="text-sm text-muted-foreground">Vista previa del próximo número:</Label>
                    <div className="mt-2 font-mono text-lg font-semibold">
                      {generateDocumentNumberPreview(
                        numberingSettings.format,
                        {
                          prefix: numberingSettings.prefix,
                          type: numberingSettings.sequenceByType ? 'contrato' : undefined,
                        }
                      )}
                    </div>
                    {numberingSettings.sequenceByType && (
                      <p className="text-xs text-muted-foreground mt-2">
                        * Cada tipo de documento tendrá su propia secuencia independiente
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: FACTURACIÓN */}
            <TabsContent value="billing" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de facturación</CardTitle>
                  <CardDescription>Valores por defecto para facturas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>IVA por defecto (%)</Label>
                      <Input
                        type="number"
                        value={settings.invoiceSettings?.taxRate}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          invoiceSettings: { ...prev.invoiceSettings!, taxRate: parseFloat(e.target.value) }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Condiciones de pago</Label>
                      <Input
                        value={settings.invoiceSettings?.paymentTerms}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          invoiceSettings: { ...prev.invoiceSettings!, paymentTerms: e.target.value }
                        }))}
                        placeholder="30 días"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prefijo de factura</Label>
                      <Input
                        value={settings.invoiceSettings?.prefix}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          invoiceSettings: { ...prev.invoiceSettings!, prefix: e.target.value }
                        }))}
                        placeholder="FAC"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Próximo número</Label>
                      <Input
                        type="number"
                        value={settings.invoiceSettings?.nextNumber}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          invoiceSettings: { ...prev.invoiceSettings!, nextNumber: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Datos bancarios</CardTitle>
                  <CardDescription>Aparecerán en las facturas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Banco</Label>
                      <Input
                        value={settings.bankInfo?.name || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          bankInfo: { ...prev.bankInfo, name: e.target.value, iban: prev.bankInfo?.iban || '', accountHolder: prev.bankInfo?.accountHolder || '' }
                        }))}
                        placeholder="Banco Santander"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Titular de la cuenta</Label>
                      <Input
                        value={settings.bankInfo?.accountHolder || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          bankInfo: { ...prev.bankInfo, accountHolder: e.target.value, name: prev.bankInfo?.name || '', iban: prev.bankInfo?.iban || '' }
                        }))}
                        placeholder="Mi Despacho IP, S.L."
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>IBAN</Label>
                      <Input
                        value={settings.bankInfo?.iban || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          bankInfo: { ...prev.bankInfo, iban: e.target.value, name: prev.bankInfo?.name || '', accountHolder: prev.bankInfo?.accountHolder || '' }
                        }))}
                        placeholder="ES12 1234 5678 9012 3456 7890"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: TEXTOS */}
            <TabsContent value="texts" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Textos personalizados</CardTitle>
                  <CardDescription>Textos que aparecerán en los documentos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pie de página personalizado</Label>
                    <Textarea
                      value={settings.customTexts?.footerText}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        customTexts: { ...prev.customTexts!, footerText: e.target.value }
                      }))}
                      placeholder="Texto adicional para el pie de página..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Aviso de confidencialidad</Label>
                    <Textarea
                      value={settings.customTexts?.confidentialityNotice}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        customTexts: { ...prev.customTexts!, confidentialityNotice: e.target.value }
                      }))}
                      placeholder="Este documento es confidencial..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Vista previa */}
        {showPreview && (
          <div className="sticky top-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Vista previa</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="transform scale-[0.35] origin-top-left" style={{ width: '285%', height: '400px' }}>
                  <A4Preview
                    content="<h2>Ejemplo de documento</h2><p>Este es un ejemplo de cómo se verán tus documentos con la configuración actual.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>"
                    style={previewStyle}
                    tenantSettings={settings as TenantDocumentSettings}
                    title="Documento de Ejemplo"
                    documentNumber="DOC-2501-001"
                    documentDate="30/01/2026"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
