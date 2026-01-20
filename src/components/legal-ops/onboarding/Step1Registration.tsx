// ============================================
// Step 1: Client Registration
// ============================================

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Building } from 'lucide-react';
import type { OnboardingFormData } from '@/hooks/legal-ops/useClientOnboarding';

interface Step1Props {
  formData: OnboardingFormData;
  onChange: (data: Partial<OnboardingFormData>) => void;
}

export function Step1Registration({ formData, onChange }: Step1Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Datos del cliente</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Información básica del cliente para crear su expediente
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="client_name" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Nombre completo *
          </Label>
          <Input
            id="client_name"
            value={formData.client_name}
            onChange={(e) => onChange({ client_name: e.target.value })}
            placeholder="Nombre y apellidos del cliente"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email *
          </Label>
          <Input
            id="client_email"
            type="email"
            value={formData.client_email}
            onChange={(e) => onChange({ client_email: e.target.value })}
            placeholder="cliente@ejemplo.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Teléfono
          </Label>
          <Input
            id="client_phone"
            type="tel"
            value={formData.client_phone || ''}
            onChange={(e) => onChange({ client_phone: e.target.value })}
            placeholder="+34 600 000 000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_company" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Empresa
          </Label>
          <Input
            id="client_company"
            value={formData.client_company || ''}
            onChange={(e) => onChange({ client_company: e.target.value })}
            placeholder="Nombre de la empresa (opcional)"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        * Campos obligatorios
      </p>
    </div>
  );
}
