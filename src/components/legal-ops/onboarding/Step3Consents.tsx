// ============================================
// Step 3: Consents (ToS, DPA, AI options)
// ============================================

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Lock, Zap, Settings } from 'lucide-react';
import type { OnboardingFormData } from '@/hooks/legal-ops/useClientOnboarding';

interface Step3Props {
  formData: OnboardingFormData;
  onChange: (data: Partial<OnboardingFormData>) => void;
}

export function Step3Consents({ formData, onChange }: Step3Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold">Consentimientos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Acepte los términos obligatorios y configure las opciones de IA
        </p>
      </div>

      {/* Section: Mandatory */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          OBLIGATORIOS
        </h3>
        
        <div className="space-y-3">
          <ConsentItem
            id="tos"
            checked={formData.tos_accepted}
            onChange={(checked) => onChange({ tos_accepted: checked })}
            label="Términos de Servicio"
            description="Condiciones de uso de la plataforma"
            required
            documentUrl="/legal/tos"
          />
          
          <ConsentItem
            id="dpa"
            checked={formData.dpa_accepted}
            onChange={(checked) => onChange({ dpa_accepted: checked })}
            label="Acuerdo de Procesamiento de Datos (DPA)"
            description="Contrato de encargado del tratamiento según GDPR"
            required
            documentUrl="/legal/dpa"
          />
        </div>
      </div>

      <Separator />

      {/* Section: AI Features (optional but pre-selected) */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          FUNCIONALIDADES DE IA
          <Badge variant="secondary" className="text-[10px]">Opcionales</Badge>
        </h3>
        
        <p className="text-xs text-muted-foreground mb-4">
          Puede activar o desactivar estas funcionalidades. El sistema funcionará 
          correctamente sin ellas.
        </p>
        
        <div className="space-y-3">
          <ConsentItem
            id="ai_classification"
            checked={formData.ai_classification_enabled}
            onChange={(checked) => onChange({ ai_classification_enabled: checked })}
            label="Clasificación automática de comunicaciones"
            description="Emails y mensajes clasificados por categoría automáticamente"
            defaultChecked
          />
          
          <ConsentItem
            id="ai_extraction"
            checked={formData.ai_extraction_enabled}
            onChange={(checked) => onChange({ ai_extraction_enabled: checked })}
            label="Extracción de entidades de documentos"
            description="Fechas, nombres y referencias extraídos automáticamente"
            defaultChecked
          />
          
          <ConsentItem
            id="ai_assistant"
            checked={formData.ai_assistant_enabled}
            onChange={(checked) => onChange({ ai_assistant_enabled: checked })}
            label="Asistente interno con IA"
            description="Búsqueda inteligente y respuestas sobre expedientes"
            defaultChecked
          />
          
          <ConsentItem
            id="audio_transcription"
            checked={formData.audio_transcription_enabled}
            onChange={(checked) => onChange({ audio_transcription_enabled: checked })}
            label="Transcripción de audio"
            description="Convertir grabaciones de voz a texto"
          />
        </div>
      </div>

      <Separator />

      {/* Section: Advanced (requires addendum) */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          CONFIGURACIÓN AVANZADA
        </h3>
        
        <div className="space-y-3">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Sincronización WhatsApp</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Requiere configuración adicional
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Configurar más tarde →
              </Button>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Identificación biométrica de voz</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Requiere consentimiento Art. 9 GDPR
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Configurar más tarde →
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Section: Marketing */}
      <div>
        <ConsentItem
          id="marketing"
          checked={formData.marketing_emails_accepted}
          onChange={(checked) => onChange({ marketing_emails_accepted: checked })}
          label="Comunicaciones comerciales"
          description="Recibir información sobre nuevas funcionalidades y ofertas"
        />
      </div>
    </div>
  );
}

// Consent item component
interface ConsentItemProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  required?: boolean;
  defaultChecked?: boolean;
  documentUrl?: string;
}

function ConsentItem({
  id,
  checked,
  onChange,
  label,
  description,
  required,
  defaultChecked,
  documentUrl
}: ConsentItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(c) => onChange(c === true)}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
            {label}
          </Label>
          {required && (
            <Badge variant="destructive" className="text-[10px]">Obligatorio</Badge>
          )}
          {defaultChecked && !required && (
            <Badge variant="secondary" className="text-[10px]">Recomendado</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        {documentUrl && (
          <a 
            href={documentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
          >
            Ver documento completo <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
