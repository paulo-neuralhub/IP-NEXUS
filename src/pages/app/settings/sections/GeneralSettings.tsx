// src/pages/app/settings/sections/GeneralSettings.tsx
import { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/organization-context';
import { useOrganizationSettings, useUpdateOrganizationSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Save } from 'lucide-react';

const ORG_TYPES = [
  { value: 'law_firm', label: 'Despacho de PI' },
  { value: 'corporation', label: 'Empresa' },
  { value: 'agency', label: 'Agencia' },
  { value: 'individual', label: 'Individual' },
];

const INDUSTRIES = [
  { value: 'legal', label: 'Legal' },
  { value: 'tech', label: 'Tecnología' },
  { value: 'pharma', label: 'Farmacéutica' },
  { value: 'manufacturing', label: 'Manufactura' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Otra' },
];

export default function GeneralSettings() {
  const { currentOrganization } = useOrganization();
  const { data: settings, isLoading } = useOrganizationSettings();
  const updateMutation = useUpdateOrganizationSettings();

  const [formData, setFormData] = useState({
    type: 'law_firm',
    industry: 'legal',
    description: '',
    website: '',
    support_email: '',
    phone: '',
  });

  useEffect(() => {
    if (settings?.general) {
      setFormData({
        type: settings.general.type || 'law_firm',
        industry: settings.general.industry || 'legal',
        description: settings.general.description || '',
        website: settings.general.website || '',
        support_email: settings.general.support_email || '',
        phone: settings.general.phone || '',
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate({
      category: 'general',
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
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información General</CardTitle>
        <CardDescription>
          Datos básicos de tu organización
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nombre (read-only from organization) */}
        <div className="space-y-2">
          <Label>Nombre de la Organización</Label>
          <Input
            value={currentOrganization?.name || ''}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Contacta con soporte para cambiar el nombre
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de Organización</Label>
            <Select
              value={formData.type}
              onValueChange={(v) => setFormData({ ...formData, type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORG_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Industria</Label>
            <Select
              value={formData.industry}
              onValueChange={(v) => setFormData({ ...formData, industry: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind.value} value={ind.value}>
                    {ind.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe brevemente tu organización..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website">Sitio Web</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://ejemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+34 91 123 4567"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="support_email">Email de Soporte</Label>
          <Input
            id="support_email"
            type="email"
            value={formData.support_email}
            onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
            placeholder="soporte@ejemplo.com"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
