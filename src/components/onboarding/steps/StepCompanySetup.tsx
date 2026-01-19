import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface StepCompanySetupProps {
  data: Record<string, any>;
  updateData: (key: string, value: any) => void;
  organizationId: string;
}

const COMPANY_TYPES = [
  { value: 'law_firm', label: 'Despacho de PI' },
  { value: 'corporation', label: 'Empresa / Corporación' },
  { value: 'agency', label: 'Agencia de marcas' },
  { value: 'individual', label: 'Profesional independiente' },
];

const COUNTRIES = [
  { value: 'ES', label: 'España' },
  { value: 'MX', label: 'México' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CO', label: 'Colombia' },
  { value: 'CL', label: 'Chile' },
  { value: 'PE', label: 'Perú' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'GB', label: 'Reino Unido' },
  { value: 'DE', label: 'Alemania' },
  { value: 'FR', label: 'Francia' },
  { value: 'PT', label: 'Portugal' },
  { value: 'IT', label: 'Italia' },
];

const CURRENCIES = [
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'USD', label: 'USD - Dólar estadounidense' },
  { value: 'GBP', label: 'GBP - Libra esterlina' },
  { value: 'MXN', label: 'MXN - Peso mexicano' },
  { value: 'ARS', label: 'ARS - Peso argentino' },
  { value: 'COP', label: 'COP - Peso colombiano' },
];

const TIMEZONES = [
  { value: 'Europe/Madrid', label: 'Madrid (CET)' },
  { value: 'Europe/London', label: 'Londres (GMT)' },
  { value: 'America/New_York', label: 'Nueva York (EST)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (PST)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (CST)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/Bogota', label: 'Bogotá (COT)' },
  { value: 'America/Lima', label: 'Lima (PET)' },
];

export function StepCompanySetup({ data, updateData, organizationId }: StepCompanySetupProps) {
  // Load organization name if exists
  useEffect(() => {
    const loadOrgData = async () => {
      const { data: org } = await supabase
        .from('organizations')
        .select('name, settings')
        .eq('id', organizationId)
        .single();
      
      if (org && !data.companyName) {
        updateData('companyName', org.name);
        if (org.settings) {
          const settings = org.settings as Record<string, any>;
          if (settings.type) updateData('companyType', settings.type);
          if (settings.primary_country) updateData('primaryCountry', settings.primary_country);
          if (settings.currency) updateData('currency', settings.currency);
          if (settings.timezone) updateData('timezone', settings.timezone);
        }
      }
    };
    loadOrgData();
  }, [organizationId]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Cuéntanos sobre tu empresa</h2>
        <p className="text-muted-foreground text-sm">Esta información nos ayudará a personalizar tu experiencia</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="companyName">Nombre de la empresa *</Label>
          <Input
            id="companyName"
            value={data.companyName || ''}
            onChange={(e) => updateData('companyName', e.target.value)}
            placeholder="ACME Legal S.L."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyType">Tipo de organización</Label>
          <Select
            value={data.companyType || ''}
            onValueChange={(v) => updateData('companyType', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">País principal</Label>
          <Select
            value={data.primaryCountry || ''}
            onValueChange={(v) => updateData('primaryCountry', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(country => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <Select
            value={data.currency || ''}
            onValueChange={(v) => updateData('currency', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(currency => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Zona horaria</Label>
          <Select
            value={data.timezone || ''}
            onValueChange={(v) => updateData('timezone', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map(tz => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Sector/Industria (opcional)</Label>
          <Input
            id="industry"
            value={data.industry || ''}
            onChange={(e) => updateData('industry', e.target.value)}
            placeholder="Ej: Tecnología, Farmacéutica..."
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        * Campos requeridos. Podrás cambiar esta información en Configuración.
      </p>
    </div>
  );
}
