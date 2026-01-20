// ============================================
// Step 5: Final Setup & Preferences
// ============================================

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Mail, Phone, MessageSquare, Globe } from 'lucide-react';
import type { OnboardingFormData } from '@/hooks/legal-ops/useClientOnboarding';

interface Step5Props {
  formData: OnboardingFormData;
  onChange: (data: Partial<OnboardingFormData>) => void;
}

export function Step5Setup({ formData, onChange }: Step5Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-semibold">¡Casi listo!</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure sus preferencias finales
        </p>
      </div>

      {/* Communication preference */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          ¿Cómo prefiere que le contactemos?
        </Label>
        
        <RadioGroup
          value={formData.preferred_communication || 'email'}
          onValueChange={(value) => onChange({ 
            preferred_communication: value as 'email' | 'phone' | 'whatsapp' 
          })}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <Card className={`cursor-pointer transition-colors ${
            formData.preferred_communication === 'email' 
              ? 'border-primary bg-primary/5' 
              : 'hover:bg-muted/50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-colors ${
            formData.preferred_communication === 'phone' 
              ? 'border-primary bg-primary/5' 
              : 'hover:bg-muted/50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="phone" id="phone" />
                <Label htmlFor="phone" className="flex items-center gap-2 cursor-pointer">
                  <Phone className="w-4 h-4" />
                  Teléfono
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-colors ${
            formData.preferred_communication === 'whatsapp' 
              ? 'border-primary bg-primary/5' 
              : 'hover:bg-muted/50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="whatsapp" id="whatsapp" />
                <Label htmlFor="whatsapp" className="flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </Label>
              </div>
            </CardContent>
          </Card>
        </RadioGroup>
      </div>

      {/* Language preference */}
      <div className="space-y-3">
        <Label htmlFor="language" className="text-sm font-medium flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Idioma preferido
        </Label>
        
        <Select
          value={formData.language_preference || 'es'}
          onValueChange={(value) => onChange({ language_preference: value })}
        >
          <SelectTrigger id="language">
            <SelectValue placeholder="Seleccione idioma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="es">🇪🇸 Español</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
            <SelectItem value="ca">🏴 Català</SelectItem>
            <SelectItem value="eu">🏴 Euskara</SelectItem>
            <SelectItem value="gl">🏴 Galego</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
            Resumen de configuración
          </h3>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
            <li>✅ Términos de Servicio aceptados</li>
            <li>✅ Acuerdo de Procesamiento de Datos firmado</li>
            <li>✅ Información de IA revisada y comprendida</li>
            {formData.ai_assistant_enabled && (
              <li>✅ Asistente IA activado</li>
            )}
            {formData.ai_classification_enabled && (
              <li>✅ Clasificación automática activada</li>
            )}
            {formData.ai_extraction_enabled && (
              <li>✅ Extracción de entidades activada</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Pulse "Finalizar" para completar el proceso de alta.
        Puede modificar estas preferencias más tarde desde Configuración.
      </p>
    </div>
  );
}
