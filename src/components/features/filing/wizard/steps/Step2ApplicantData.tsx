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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building2, MapPin, Mail, Phone, FileText, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { WizardFormData } from '../FilingWizard';

interface Step2Props {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  errors: Record<string, string[]>;
}

const COUNTRIES = [
  { code: 'ES', name: 'España' },
  { code: 'PT', name: 'Portugal' },
  { code: 'FR', name: 'Francia' },
  { code: 'DE', name: 'Alemania' },
  { code: 'IT', name: 'Italia' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'MX', name: 'México' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'BR', name: 'Brasil' },
];

export function Step2ApplicantData({ formData, updateFormData, errors }: Step2Props) {
  const [hasRepresentative, setHasRepresentative] = useState(!!formData.representative_name);

  const renderError = (field: string) => {
    if (errors[field]) {
      return (
        <div className="flex items-center gap-1 text-destructive text-sm mt-1">
          <AlertCircle className="h-3 w-3" />
          {errors[field][0]}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Applicant Type */}
      <div className="flex gap-4">
        <Card 
          className={`flex-1 cursor-pointer transition-all ${
            formData.applicant_type === 'legal_entity' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => updateFormData({ applicant_type: 'legal_entity' })}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">Persona Jurídica</p>
              <p className="text-sm text-muted-foreground">Empresa u organización</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`flex-1 cursor-pointer transition-all ${
            formData.applicant_type === 'natural_person' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => updateFormData({ applicant_type: 'natural_person' })}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">Persona Física</p>
              <p className="text-sm text-muted-foreground">Individuo o autónomo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applicant Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Datos del Solicitante
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="applicant_name">
                {formData.applicant_type === 'legal_entity' ? 'Razón Social' : 'Nombre Completo'} *
              </Label>
              <Input
                id="applicant_name"
                value={formData.applicant_name}
                onChange={(e) => updateFormData({ applicant_name: e.target.value })}
                placeholder={formData.applicant_type === 'legal_entity' ? 'Mi Empresa S.L.' : 'Juan García López'}
                className={errors.applicant_name ? 'border-destructive' : ''}
              />
              {renderError('applicant_name')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicant_tax_id">
                {formData.applicant_type === 'legal_entity' ? 'CIF/NIF' : 'NIF/NIE'} *
              </Label>
              <Input
                id="applicant_tax_id"
                value={formData.applicant_tax_id}
                onChange={(e) => updateFormData({ applicant_tax_id: e.target.value })}
                placeholder="B12345678"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicant_address">
              <MapPin className="inline h-4 w-4 mr-1" />
              Dirección *
            </Label>
            <Textarea
              id="applicant_address"
              value={formData.applicant_address}
              onChange={(e) => updateFormData({ applicant_address: e.target.value })}
              placeholder="Calle, número, piso, código postal, ciudad"
              rows={2}
              className={errors.applicant_address ? 'border-destructive' : ''}
            />
            {renderError('applicant_address')}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="applicant_country">País *</Label>
              <Select
                value={formData.applicant_country}
                onValueChange={(value) => updateFormData({ applicant_country: value })}
              >
                <SelectTrigger className={errors.applicant_country ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Seleccionar país" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {renderError('applicant_country')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicant_email">
                <Mail className="inline h-4 w-4 mr-1" />
                Email *
              </Label>
              <Input
                id="applicant_email"
                type="email"
                value={formData.applicant_email}
                onChange={(e) => updateFormData({ applicant_email: e.target.value })}
                placeholder="email@empresa.com"
                className={errors.applicant_email ? 'border-destructive' : ''}
              />
              {renderError('applicant_email')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicant_phone">
                <Phone className="inline h-4 w-4 mr-1" />
                Teléfono
              </Label>
              <Input
                id="applicant_phone"
                type="tel"
                value={formData.applicant_phone}
                onChange={(e) => updateFormData({ applicant_phone: e.target.value })}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Representative (optional) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Checkbox
              id="has_representative"
              checked={hasRepresentative}
              onCheckedChange={(checked) => {
                setHasRepresentative(checked as boolean);
                if (!checked) {
                  updateFormData({
                    representative_name: undefined,
                    representative_address: undefined,
                    representative_id: undefined,
                  });
                }
              }}
            />
            <Label htmlFor="has_representative" className="text-lg font-semibold cursor-pointer">
              <FileText className="inline h-5 w-5 mr-2" />
              Actúa mediante Representante
            </Label>
          </div>
        </CardHeader>
        
        {hasRepresentative && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="representative_name">Nombre del Representante</Label>
                <Input
                  id="representative_name"
                  value={formData.representative_name || ''}
                  onChange={(e) => updateFormData({ representative_name: e.target.value })}
                  placeholder="Agente de PI autorizado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="representative_id">Nº de Agente / Colegiado</Label>
                <Input
                  id="representative_id"
                  value={formData.representative_id || ''}
                  onChange={(e) => updateFormData({ representative_id: e.target.value })}
                  placeholder="12345"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="representative_address">Dirección del Representante</Label>
              <Textarea
                id="representative_address"
                value={formData.representative_address || ''}
                onChange={(e) => updateFormData({ representative_address: e.target.value })}
                placeholder="Dirección del despacho o agente"
                rows={2}
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
