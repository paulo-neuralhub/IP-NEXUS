// src/pages/app/settings/sections/RegionalSettings.tsx
import { useState, useEffect } from 'react';
import { useOrganizationSettings, useUpdateOrganizationSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Save } from 'lucide-react';

const TIMEZONES = [
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
  { value: 'Europe/London', label: 'Londres (GMT)' },
  { value: 'Europe/Paris', label: 'París (GMT+1)' },
  { value: 'Europe/Berlin', label: 'Berlín (GMT+1)' },
  { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
  { value: 'America/Mexico_City', label: 'México (GMT-6)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
  { value: 'Asia/Tokyo', label: 'Tokio (GMT+9)' },
];

const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

const CURRENCIES = [
  { value: 'EUR', label: 'EUR - Euro (€)', symbol: '€' },
  { value: 'USD', label: 'USD - Dólar ($)', symbol: '$' },
  { value: 'GBP', label: 'GBP - Libra (£)', symbol: '£' },
  { value: 'MXN', label: 'MXN - Peso (MX$)', symbol: 'MX$' },
  { value: 'BRL', label: 'BRL - Real (R$)', symbol: 'R$' },
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2026)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-12-31)' },
];

const TIME_FORMATS = [
  { value: '24h', label: '24 horas (14:30)' },
  { value: '12h', label: '12 horas (2:30 PM)' },
];

const WEEK_STARTS = [
  { value: 'monday', label: 'Lunes' },
  { value: 'sunday', label: 'Domingo' },
];

export default function RegionalSettings() {
  const { data: settings, isLoading } = useOrganizationSettings();
  const updateMutation = useUpdateOrganizationSettings();

  const [formData, setFormData] = useState({
    timezone: 'Europe/Madrid',
    language: 'es',
    currency: 'EUR',
    currency_symbol: '€',
    currency_position: 'after' as 'before' | 'after',
    date_format: 'DD/MM/YYYY',
    time_format: '24h',
    week_start: 'monday',
  });

  useEffect(() => {
    if (settings?.regional) {
      setFormData({
        timezone: settings.regional.timezone || 'Europe/Madrid',
        language: settings.regional.language || 'es',
        currency: settings.regional.currency || 'EUR',
        currency_symbol: settings.regional.currency_symbol || '€',
        currency_position: settings.regional.currency_position || 'after',
        date_format: settings.regional.date_format || 'DD/MM/YYYY',
        time_format: settings.regional.time_format || '24h',
        week_start: settings.regional.week_start || 'monday',
      });
    }
  }, [settings]);

  const handleCurrencyChange = (value: string) => {
    const currency = CURRENCIES.find(c => c.value === value);
    setFormData({
      ...formData,
      currency: value,
      currency_symbol: currency?.symbol || '€',
    });
  };

  const handleSave = () => {
    updateMutation.mutate({
      category: 'regional',
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
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración Regional</CardTitle>
        <CardDescription>
          Zona horaria, moneda y formatos de fecha
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Zona Horaria</Label>
            <Select
              value={formData.timezone}
              onValueChange={(v) => setFormData({ ...formData, timezone: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Idioma</Label>
            <Select
              value={formData.language}
              onValueChange={(v) => setFormData({ ...formData, language: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Moneda</Label>
            <Select
              value={formData.currency}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Posición del símbolo</Label>
            <Select
              value={formData.currency_position}
              onValueChange={(v) => setFormData({ ...formData, currency_position: v as 'before' | 'after' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Antes ({formData.currency_symbol}100)</SelectItem>
                <SelectItem value="after">Después (100{formData.currency_symbol})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Formato de Fecha</Label>
            <Select
              value={formData.date_format}
              onValueChange={(v) => setFormData({ ...formData, date_format: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map((fmt) => (
                  <SelectItem key={fmt.value} value={fmt.value}>
                    {fmt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Formato de Hora</Label>
            <Select
              value={formData.time_format}
              onValueChange={(v) => setFormData({ ...formData, time_format: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_FORMATS.map((fmt) => (
                  <SelectItem key={fmt.value} value={fmt.value}>
                    {fmt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>La semana comienza en</Label>
          <Select
            value={formData.week_start}
            onValueChange={(v) => setFormData({ ...formData, week_start: v })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WEEK_STARTS.map((ws) => (
                <SelectItem key={ws.value} value={ws.value}>
                  {ws.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
