// src/pages/app/settings/sections/BrandingSettings.tsx
import { useState, useEffect } from 'react';
import { useOrganizationSettings, useUpdateOrganizationSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Upload, Image } from 'lucide-react';

export default function BrandingSettings() {
  const { data: settings, isLoading } = useOrganizationSettings();
  const updateMutation = useUpdateOrganizationSettings();

  const [formData, setFormData] = useState({
    logo_url: '',
    logo_dark_url: '',
    favicon_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#8B5CF6',
    powered_by_hidden: false,
  });

  useEffect(() => {
    if (settings?.branding) {
      setFormData({
        logo_url: settings.branding.logo_url || '',
        logo_dark_url: settings.branding.logo_dark_url || '',
        favicon_url: settings.branding.favicon_url || '',
        primary_color: settings.branding.primary_color || '#3B82F6',
        secondary_color: settings.branding.secondary_color || '#8B5CF6',
        powered_by_hidden: settings.branding.powered_by_hidden || false,
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate({
      category: 'branding',
      updates: formData,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>
            Personaliza el logo de tu organización
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Logo claro */}
            <div className="space-y-2">
              <Label>Logo (tema claro)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {formData.logo_url ? (
                  <img 
                    src={formData.logo_url} 
                    alt="Logo" 
                    className="h-16 mx-auto object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Image className="h-10 w-10 mb-2" />
                    <span className="text-sm">Sin logo</span>
                  </div>
                )}
              </div>
              <Input
                placeholder="URL del logo"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              />
            </div>

            {/* Logo oscuro */}
            <div className="space-y-2">
              <Label>Logo (tema oscuro)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center bg-slate-900">
                {formData.logo_dark_url ? (
                  <img 
                    src={formData.logo_dark_url} 
                    alt="Logo oscuro" 
                    className="h-16 mx-auto object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <Image className="h-10 w-10 mb-2" />
                    <span className="text-sm">Sin logo</span>
                  </div>
                )}
              </div>
              <Input
                placeholder="URL del logo oscuro"
                value={formData.logo_dark_url}
                onChange={(e) => setFormData({ ...formData, logo_dark_url: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Favicon</Label>
            <Input
              placeholder="URL del favicon"
              value={formData.favicon_url}
              onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Icono que aparece en la pestaña del navegador (32x32 px recomendado)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colores</CardTitle>
          <CardDescription>
            Define los colores de tu marca
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color Primario</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="h-10 w-14 rounded border cursor-pointer"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color Secundario</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="h-10 w-14 rounded border cursor-pointer"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground mb-2">Vista previa</p>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded text-white text-sm font-medium"
                style={{ backgroundColor: formData.primary_color }}
              >
                Botón Primario
              </button>
              <button
                className="px-4 py-2 rounded text-white text-sm font-medium"
                style={{ backgroundColor: formData.secondary_color }}
              >
                Botón Secundario
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Opciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Ocultar "Powered by IP-NEXUS"</Label>
              <p className="text-sm text-muted-foreground">
                Elimina la marca IP-NEXUS de los emails y portal de clientes
              </p>
            </div>
            <Switch
              checked={formData.powered_by_hidden}
              onCheckedChange={(checked) => setFormData({ ...formData, powered_by_hidden: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
