// src/pages/app/settings/branding.tsx
import { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useBranding, type OrganizationBranding } from '@/hooks/use-branding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Palette, Image, Globe, Mail, Eye, Upload, Check, 
  AlertCircle, Loader2, Lock, X, CheckCircle2
} from 'lucide-react';

const DEFAULT_COLORS = {
  primary: '#6366f1',
  secondary: '#f1f5f9',
  accent: '#8b5cf6',
};

export default function BrandingSettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const { branding, isLoading } = useBranding();
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewFavicon, setPreviewFavicon] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    primary_color: DEFAULT_COLORS.primary,
    secondary_color: DEFAULT_COLORS.secondary,
    accent_color: DEFAULT_COLORS.accent,
    app_name: '',
    font_family: 'Inter',
    show_powered_by: true,
    custom_domain: '',
    portal_welcome_message: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    custom_email_from_name: '',
  });

  // Cargar datos existentes
  useEffect(() => {
    if (branding) {
      setFormData({
        primary_color: branding.primary_color || DEFAULT_COLORS.primary,
        secondary_color: branding.secondary_color || DEFAULT_COLORS.secondary,
        accent_color: branding.accent_color || DEFAULT_COLORS.accent,
        app_name: branding.app_name || '',
        font_family: branding.font_family || 'Inter',
        show_powered_by: branding.show_powered_by ?? true,
        custom_domain: branding.custom_domain || '',
        portal_welcome_message: branding.portal_welcome_message || '',
        smtp_host: branding.smtp_host || '',
        smtp_port: branding.smtp_port || 587,
        smtp_user: branding.smtp_user || '',
        smtp_password: '',
        custom_email_from_name: branding.custom_email_from_name || '',
      });
    }
  }, [branding]);

  // Mutation para guardar
  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<OrganizationBranding>) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      let logoUrl = branding?.logo_url;
      let faviconUrl = branding?.favicon_url;

      // Subir logo si hay nuevo
      if (logoFile) {
        const fileName = `${currentOrganization.id}/logo-${Date.now()}.${logoFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('branding')
          .upload(fileName, logoFile, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('branding')
          .getPublicUrl(fileName);
        
        logoUrl = publicUrl;
      }

      // Subir favicon si hay nuevo
      if (faviconFile) {
        const fileName = `${currentOrganization.id}/favicon-${Date.now()}.${faviconFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('branding')
          .upload(fileName, faviconFile, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('branding')
          .getPublicUrl(fileName);
        
        faviconUrl = publicUrl;
      }

      const { error } = await supabase
        .from('organization_branding')
        .upsert({
          organization_id: currentOrganization.id,
          ...updates,
          logo_url: logoUrl,
          favicon_url: faviconUrl,
        }, { onConflict: 'organization_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-branding'] });
      setLogoFile(null);
      setFaviconFile(null);
      toast({ title: 'Configuración guardada' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error al guardar', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'El archivo es muy grande', description: 'Máximo 2MB', variant: 'destructive' });
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewLogo(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 512 * 1024) {
        toast({ title: 'El archivo es muy grande', description: 'Máximo 512KB', variant: 'destructive' });
        return;
      }
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewFavicon(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    saveMutation.mutate({
      primary_color: formData.primary_color,
      secondary_color: formData.secondary_color,
      accent_color: formData.accent_color,
      app_name: formData.app_name || null,
      font_family: formData.font_family,
      show_powered_by: formData.show_powered_by,
      custom_domain: formData.custom_domain || null,
      portal_welcome_message: formData.portal_welcome_message || null,
      smtp_host: formData.smtp_host || null,
      smtp_port: formData.smtp_port,
      smtp_user: formData.smtp_user || null,
      custom_email_from_name: formData.custom_email_from_name || null,
    } as Partial<OrganizationBranding>);
  };

  const isEnterprise = branding?.plan_allows_white_label || false;

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
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="w-6 h-6 text-primary" />
          Personalización de Marca
        </h1>
        <p className="text-muted-foreground">
          Personaliza la apariencia de IP-NEXUS con tu marca
        </p>
      </div>

      {!isEnterprise && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Algunas funciones de white-labeling requieren el plan Enterprise.</span>
            <Button variant="link" size="sm" className="px-1">
              Actualizar plan
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="appearance">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Colores
          </TabsTrigger>
          <TabsTrigger value="logo">
            <Image className="w-4 h-4 mr-2" />
            Logo
          </TabsTrigger>
          <TabsTrigger value="domain" disabled={!isEnterprise}>
            <Globe className="w-4 h-4 mr-2" />
            Dominio
          </TabsTrigger>
          <TabsTrigger value="email" disabled={!isEnterprise}>
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* APARIENCIA */}
        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Colores de marca</CardTitle>
              <CardDescription>
                Define los colores principales de tu marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Color primario</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData(f => ({ ...f, primary_color: e.target.value }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => setFormData(f => ({ ...f, primary_color: e.target.value }))}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Botones, enlaces, acentos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Color secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData(f => ({ ...f, secondary_color: e.target.value }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => setFormData(f => ({ ...f, secondary_color: e.target.value }))}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fondos, bordes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Color de acento</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => setFormData(f => ({ ...f, accent_color: e.target.value }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.accent_color}
                      onChange={(e) => setFormData(f => ({ ...f, accent_color: e.target.value }))}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Destacados, notificaciones
                  </p>
                </div>
              </div>

              {/* Preview de colores */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-3">Vista previa:</p>
                <div className="flex gap-4 items-center flex-wrap">
                  <Button style={{ backgroundColor: formData.primary_color, color: '#fff' }}>
                    Botón primario
                  </Button>
                  <Button 
                    variant="outline" 
                    style={{ borderColor: formData.primary_color, color: formData.primary_color }}
                  >
                    Botón outline
                  </Button>
                  <Badge style={{ backgroundColor: formData.accent_color, color: '#fff' }}>
                    Badge
                  </Badge>
                  <div 
                    className="px-3 py-1 rounded text-sm"
                    style={{ backgroundColor: formData.secondary_color }}
                  >
                    Fondo secundario
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nombre de la aplicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre personalizado</Label>
                <Input
                  value={formData.app_name}
                  onChange={(e) => setFormData(f => ({ ...f, app_name: e.target.value }))}
                  placeholder="IP-NEXUS"
                />
                <p className="text-xs text-muted-foreground">
                  Aparecerá en el título de la página y emails
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label>Mostrar "Powered by IP-NEXUS"</Label>
                  <p className="text-xs text-muted-foreground">
                    Muestra el crédito en el footer
                  </p>
                </div>
                <Switch
                  checked={formData.show_powered_by}
                  onCheckedChange={(checked) => setFormData(f => ({ ...f, show_powered_by: checked }))}
                  disabled={!isEnterprise}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOGO */}
        <TabsContent value="logo" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo principal</CardTitle>
              <CardDescription>
                Sube tu logo para reemplazar el de IP-NEXUS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-6">
                <div className="w-48 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 relative overflow-hidden">
                  {previewLogo || branding?.logo_url ? (
                    <>
                      <img 
                        src={previewLogo || branding?.logo_url || ''} 
                        alt="Logo" 
                        className="max-w-full max-h-full object-contain"
                      />
                      {(previewLogo || branding?.logo_url) && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => {
                            setPreviewLogo(null);
                            setLogoFile(null);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <Image className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                      <Upload className="w-4 h-4" />
                      Subir logo
                    </div>
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    PNG, SVG o WebP. Máximo 2MB. Recomendado: 200x50px
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Favicon</CardTitle>
              <CardDescription>
                Icono que aparece en la pestaña del navegador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 relative overflow-hidden">
                  {previewFavicon || branding?.favicon_url ? (
                    <img 
                      src={previewFavicon || branding?.favicon_url || ''} 
                      alt="Favicon" 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <Image className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="favicon-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                      <Upload className="w-4 h-4" />
                      Subir favicon
                    </div>
                  </Label>
                  <Input
                    id="favicon-upload"
                    type="file"
                    accept="image/png,image/x-icon,image/svg+xml"
                    onChange={handleFaviconChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    PNG o ICO. Máximo 512KB. Recomendado: 32x32px
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOMINIO */}
        <TabsContent value="domain" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dominio personalizado</CardTitle>
              <CardDescription>
                Usa tu propio dominio para acceder a IP-NEXUS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Dominio</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.custom_domain}
                    onChange={(e) => setFormData(f => ({ ...f, custom_domain: e.target.value }))}
                    placeholder="app.tuempresa.com"
                  />
                  <Button variant="outline">
                    Verificar
                  </Button>
                </div>
              </div>

              {formData.custom_domain && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-2">Configuración DNS requerida:</p>
                    <code className="block p-2 bg-muted rounded text-sm font-mono">
                      CNAME {formData.custom_domain} → app.ip-nexus.com
                    </code>
                  </AlertDescription>
                </Alert>
              )}

              {branding?.custom_domain_verified && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Dominio verificado y SSL activo
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EMAIL */}
        <TabsContent value="email" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email personalizado (SMTP)</CardTitle>
              <CardDescription>
                Envía emails desde tu propio dominio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Servidor SMTP</Label>
                  <Input 
                    value={formData.smtp_host}
                    onChange={(e) => setFormData(f => ({ ...f, smtp_host: e.target.value }))}
                    placeholder="smtp.tuempresa.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Puerto</Label>
                  <Input 
                    type="number" 
                    value={formData.smtp_port}
                    onChange={(e) => setFormData(f => ({ ...f, smtp_port: parseInt(e.target.value) || 587 }))}
                    placeholder="587" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Usuario</Label>
                  <Input 
                    value={formData.smtp_user}
                    onChange={(e) => setFormData(f => ({ ...f, smtp_user: e.target.value }))}
                    placeholder="notificaciones@tuempresa.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contraseña</Label>
                  <Input 
                    type="password"
                    value={formData.smtp_password}
                    onChange={(e) => setFormData(f => ({ ...f, smtp_password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nombre del remitente</Label>
                <Input 
                  value={formData.custom_email_from_name}
                  onChange={(e) => setFormData(f => ({ ...f, custom_email_from_name: e.target.value }))}
                  placeholder="Tu Empresa" 
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar email de prueba
                </Button>
                {branding?.smtp_verified && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Check className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PREVIEW */}
        <TabsContent value="preview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vista previa del portal de cliente</CardTitle>
              <CardDescription>
                Así verán tus clientes el portal de acceso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-muted/30">
                <div className="p-8">
                  <div className="max-w-md mx-auto bg-background rounded-lg shadow-lg p-8 border">
                    <div className="text-center mb-6">
                      {previewLogo || branding?.logo_url ? (
                        <img 
                          src={previewLogo || branding?.logo_url || ''} 
                          alt="Logo" 
                          className="h-12 mx-auto mb-4 object-contain"
                        />
                      ) : (
                        <div className="h-12 w-32 bg-muted mx-auto mb-4 rounded flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">Logo</span>
                        </div>
                      )}
                      <h2 className="text-xl font-bold">
                        {formData.app_name || 'IP-NEXUS'} Portal
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Accede a tus expedientes
                      </p>
                    </div>
                    <div className="space-y-4">
                      <Input placeholder="tu@email.com" disabled className="bg-muted/50" />
                      <Button 
                        className="w-full text-white" 
                        style={{ backgroundColor: formData.primary_color }}
                        disabled
                      >
                        Enviar enlace de acceso
                      </Button>
                    </div>
                    {formData.show_powered_by && (
                      <p className="text-center text-xs text-muted-foreground mt-6">
                        Powered by {formData.app_name || 'IP-NEXUS'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mensaje de bienvenida del portal</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.portal_welcome_message}
                onChange={(e) => setFormData(f => ({ ...f, portal_welcome_message: e.target.value }))}
                placeholder="Bienvenido al portal de clientes. Aquí podrás consultar el estado de tus expedientes..."
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Guardar */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button 
          variant="outline"
          onClick={() => {
            if (branding) {
              setFormData({
                primary_color: branding.primary_color || DEFAULT_COLORS.primary,
                secondary_color: branding.secondary_color || DEFAULT_COLORS.secondary,
                accent_color: branding.accent_color || DEFAULT_COLORS.accent,
                app_name: branding.app_name || '',
                font_family: branding.font_family || 'Inter',
                show_powered_by: branding.show_powered_by ?? true,
                custom_domain: branding.custom_domain || '',
                portal_welcome_message: branding.portal_welcome_message || '',
                smtp_host: branding.smtp_host || '',
                smtp_port: branding.smtp_port || 587,
                smtp_user: branding.smtp_user || '',
                smtp_password: '',
                custom_email_from_name: branding.custom_email_from_name || '',
              });
            }
          }}
        >
          Descartar cambios
        </Button>
        <Button 
          onClick={handleSave}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </Button>
      </div>
    </div>
  );
}
