// src/pages/app/settings/sections/DisplaySettings.tsx
import { useState, useEffect } from 'react';
import { useUserSettings, useUpdateUserSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Save } from 'lucide-react';

export default function DisplaySettings() {
  const { data: settings, isLoading } = useUserSettings();
  const updateMutation = useUpdateUserSettings();

  const [formData, setFormData] = useState({
    theme: 'system',
    language: 'es',
    density: 'normal',
    animations_enabled: true,
    keyboard_shortcuts_enabled: true,
  });

  useEffect(() => {
    if (settings?.display) {
      setFormData({
        theme: settings.display.theme || 'system',
        language: settings.display.language || 'es',
        density: settings.display.density || 'normal',
        animations_enabled: settings.display.animations_enabled ?? true,
        keyboard_shortcuts_enabled: settings.display.keyboard_shortcuts_enabled ?? true,
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate({ category: 'display', updates: formData });
  };

  if (isLoading) return <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pantalla y Accesibilidad</CardTitle>
        <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <Select value={formData.theme} onValueChange={(v) => setFormData({ ...formData, theme: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Oscuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Densidad</Label>
            <Select value={formData.density} onValueChange={(v) => setFormData({ ...formData, density: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compacta</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="comfortable">Amplia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div><Label>Animaciones</Label><p className="text-sm text-muted-foreground">Activar animaciones de interfaz</p></div>
          <Switch checked={formData.animations_enabled} onCheckedChange={(c) => setFormData({ ...formData, animations_enabled: c })} />
        </div>
        <div className="flex items-center justify-between">
          <div><Label>Atajos de teclado</Label><p className="text-sm text-muted-foreground">Habilitar atajos de teclado</p></div>
          <Switch checked={formData.keyboard_shortcuts_enabled} onCheckedChange={(c) => setFormData({ ...formData, keyboard_shortcuts_enabled: c })} />
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />{updateMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
