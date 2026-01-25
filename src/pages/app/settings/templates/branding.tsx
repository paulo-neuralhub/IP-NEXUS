// src/pages/app/settings/templates/branding.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { SectionHeader } from '@/components/help/SectionHeader';
import { useTenantBranding } from '@/hooks/useTenantBranding';
import { 
  ArrowLeft, Palette, Image, Building2, CreditCard, Scale, 
  Upload, Loader2, Save, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Playfair Display',
  'Merriweather',
  'Source Sans Pro',
  'PT Serif',
  'Nunito',
];

export default function TemplateBrandingPage() {
  const { toast } = useToast();
  const { branding, isLoading, updateBranding, uploadLogo, isUpdating, isUploadingLogo } = useTenantBranding();
  
  const [formData, setFormData] = useState({
    // Logo
    logo_url: '',
    logo_width: 180,
    logo_position: 'left' as 'left' | 'center' | 'right',
    
    // Colors
    primary_color: '#2563eb',
    secondary_color: '#1e40af',
    accent_color: '#f59e0b',
    
    // Typography
    font_family: 'Inter',
    heading_font_family: 'Inter',
    
    // Company
    company_legal_name: '',
    company_tax_id: '',
    company_address: '',
    company_city: '',
    company_postal_code: '',
    company_country: 'España',
    company_phone: '',
    company_email: '',
    company_website: '',
    
    // Bank
    bank_name: '',
    bank_iban: '',
    bank_swift: '',
    
    // Legal
    registry_info: '',
    footer_text: '',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (branding) {
      setFormData({
        logo_url: branding.logo_url || '',
        logo_width: branding.logo_width || 180,
        logo_position: (branding.logo_position as 'left' | 'center' | 'right') || 'left',
        primary_color: branding.primary_color || '#2563eb',
        secondary_color: branding.secondary_color || '#1e40af',
        accent_color: branding.accent_color || '#f59e0b',
        font_family: branding.font_family || 'Inter',
        heading_font_family: branding.heading_font_family || 'Inter',
        company_legal_name: branding.company_legal_name || '',
        company_tax_id: branding.company_tax_id || '',
        company_address: branding.company_address || '',
        company_city: branding.company_city || '',
        company_postal_code: branding.company_postal_code || '',
        company_country: branding.company_country || 'España',
        company_phone: branding.company_phone || '',
        company_email: branding.company_email || '',
        company_website: branding.company_website || '',
        bank_name: branding.bank_name || '',
        bank_iban: branding.bank_iban || '',
        bank_swift: branding.bank_swift || '',
        registry_info: branding.registry_info || '',
        footer_text: branding.footer_text || '',
      });
      setLogoPreview(branding.logo_url || null);
    }
  }, [branding]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Archivo muy grande', description: 'Máximo 2MB', variant: 'destructive' });
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    try {
      const url = await uploadLogo(file);
      setFormData(f => ({ ...f, logo_url: url }));
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleSave = async () => {
    try {
      await updateBranding(formData);
    } catch (error) {
      // Error handled by hook
    }
  };

  const updateField = (field: string, value: string | number) => {
    setFormData(f => ({ ...f, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/app/settings/templates">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Identidad de Marca</h1>
              <p className="text-sm text-muted-foreground">Configura la imagen de tu empresa para todos los documentos</p>
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar
        </Button>
      </div>

      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Logo
          </CardTitle>
          <CardDescription>
            El logo aparecerá en todos los documentos generados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="w-48 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30 relative overflow-hidden">
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => {
                      setLogoPreview(null);
                      setFormData(f => ({ ...f, logo_url: '' }));
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Image className="w-8 h-8 mx-auto mb-1" />
                  <span className="text-xs">Sin logo</span>
                </div>
              )}
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                    {isUploadingLogo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Subir logo
                  </div>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                  disabled={isUploadingLogo}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, SVG o WebP. Máximo 2MB. Recomendado: 400x150px
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ancho (px)</Label>
                  <Input
                    type="number"
                    value={formData.logo_width}
                    onChange={(e) => updateField('logo_width', parseInt(e.target.value) || 180)}
                    min={50}
                    max={400}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Posición</Label>
                  <RadioGroup
                    value={formData.logo_position}
                    onValueChange={(v) => updateField('logo_position', v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="left" id="pos-left" />
                      <Label htmlFor="pos-left" className="font-normal">Izq</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="center" id="pos-center" />
                      <Label htmlFor="pos-center" className="font-normal">Centro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="right" id="pos-right" />
                      <Label htmlFor="pos-right" className="font-normal">Der</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colors Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Colores
          </CardTitle>
          <CardDescription>
            Colores corporativos para encabezados, acentos y textos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'primary_color', label: 'Principal', desc: 'Encabezados, botones' },
              { key: 'secondary_color', label: 'Secundario', desc: 'Fondos, bordes' },
              { key: 'accent_color', label: 'Acento', desc: 'Destacados' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData[key as keyof typeof formData] as string}
                    onChange={(e) => updateField(key, e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData[key as keyof typeof formData] as string}
                    onChange={(e) => updateField(key, e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tipografía</CardTitle>
          <CardDescription>
            Fuentes para documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fuente principal</Label>
              <Select value={formData.font_family} onValueChange={(v) => updateField('font_family', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map(font => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fuente títulos</Label>
              <Select value={formData.heading_font_family} onValueChange={(v) => updateField('heading_font_family', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map(font => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Datos de Empresa
          </CardTitle>
          <CardDescription>
            Información que aparecerá en facturas y documentos oficiales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Razón social *</Label>
              <Input
                value={formData.company_legal_name}
                onChange={(e) => updateField('company_legal_name', e.target.value)}
                placeholder="Mi Despacho S.L."
              />
            </div>
            <div className="space-y-2">
              <Label>NIF/CIF *</Label>
              <Input
                value={formData.company_tax_id}
                onChange={(e) => updateField('company_tax_id', e.target.value)}
                placeholder="B12345678"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dirección *</Label>
            <Input
              value={formData.company_address}
              onChange={(e) => updateField('company_address', e.target.value)}
              placeholder="Calle Principal 123, 4º"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Ciudad *</Label>
              <Input
                value={formData.company_city}
                onChange={(e) => updateField('company_city', e.target.value)}
                placeholder="Madrid"
              />
            </div>
            <div className="space-y-2">
              <Label>CP *</Label>
              <Input
                value={formData.company_postal_code}
                onChange={(e) => updateField('company_postal_code', e.target.value)}
                placeholder="28001"
              />
            </div>
            <div className="space-y-2">
              <Label>País</Label>
              <Input
                value={formData.company_country}
                onChange={(e) => updateField('company_country', e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={formData.company_phone}
                onChange={(e) => updateField('company_phone', e.target.value)}
                placeholder="+34 912 345 678"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={formData.company_email}
                onChange={(e) => updateField('company_email', e.target.value)}
                placeholder="info@midespacho.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Web</Label>
              <Input
                value={formData.company_website}
                onChange={(e) => updateField('company_website', e.target.value)}
                placeholder="www.midespacho.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Datos Bancarios
          </CardTitle>
          <CardDescription>
            Para mostrar en facturas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Banco</Label>
              <Input
                value={formData.bank_name}
                onChange={(e) => updateField('bank_name', e.target.value)}
                placeholder="Banco Santander"
              />
            </div>
            <div className="space-y-2">
              <Label>IBAN</Label>
              <Input
                value={formData.bank_iban}
                onChange={(e) => updateField('bank_iban', e.target.value)}
                placeholder="ES12 3456 7890 1234 5678 9012"
              />
            </div>
            <div className="space-y-2">
              <Label>SWIFT/BIC</Label>
              <Input
                value={formData.bank_swift}
                onChange={(e) => updateField('bank_swift', e.target.value)}
                placeholder="BSCHESMMXXX"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Datos Legales
          </CardTitle>
          <CardDescription>
            Información mercantil y pie de página
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Registro mercantil</Label>
            <Textarea
              value={formData.registry_info}
              onChange={(e) => updateField('registry_info', e.target.value)}
              placeholder="Inscrita en el Registro Mercantil de Madrid, Tomo 12345, Folio 67, Hoja M-123456"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Texto pie de página</Label>
            <Textarea
              value={formData.footer_text}
              onChange={(e) => updateField('footer_text', e.target.value)}
              placeholder="Texto adicional para el pie de página de documentos"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
