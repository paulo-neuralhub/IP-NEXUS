import { Badge } from '@/components/ui/badge';
import { AlertCircle, Stamp, Lightbulb, PenTool, Info } from 'lucide-react';
import { SelectionCard } from '../SelectionCard';
import type { WizardFormData } from '../FilingWizard';

interface Step3Props {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  errors: Record<string, string[]>;
}

const IP_TYPE_DETAILS = [
  {
    value: 'trademark',
    label: 'Marca',
    icon: Stamp,
    color: 'hsl(217 91% 60%)',
    lightColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Protege signos distintivos que identifican productos o servicios',
    examples: ['Nombres comerciales', 'Logotipos', 'Eslóganes', 'Sonidos'],
    duration: '10 años (renovable indefinidamente)',
  },
  {
    value: 'patent',
    label: 'Patente',
    icon: Lightbulb,
    color: 'hsl(258 90% 66%)',
    lightColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Protege invenciones técnicas nuevas, con actividad inventiva y aplicación industrial',
    examples: ['Máquinas', 'Procesos', 'Composiciones químicas', 'Dispositivos'],
    duration: '20 años (no renovable)',
  },
  {
    value: 'design',
    label: 'Diseño Industrial',
    icon: PenTool,
    color: 'hsl(160 84% 39%)',
    lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Protege la apariencia externa de productos',
    examples: ['Forma de envases', 'Diseño de muebles', 'Patrones textiles', 'Iconos'],
    duration: '25 años (períodos de 5 años)',
  },
];

export function Step3IPDetails({ formData, updateFormData, errors }: Step3Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <Stamp className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">¿Qué tipo de derecho quieres registrar?</h3>
        <p className="text-muted-foreground mt-1">
          Selecciona el tipo de propiedad industrial que deseas proteger
        </p>
      </div>

      {/* Error message */}
      {errors.ip_type && (
        <div className="flex items-center gap-2 text-destructive text-sm p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          {errors.ip_type[0]}
        </div>
      )}

      {/* IP Type Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {IP_TYPE_DETAILS.map(type => {
          const isSelected = formData.ip_type === type.value;
          const Icon = type.icon;
          
          return (
            <SelectionCard
              key={type.value}
              isSelected={isSelected}
              onClick={() => updateFormData({ 
                ip_type: type.value as 'trademark' | 'patent' | 'design',
                filing_type: 'new_application'
              })}
              colorAccent={type.color}
              icon={<Icon className="h-6 w-6" />}
              title={type.label}
              description={type.description}
              badges={
                <div className="flex flex-wrap gap-1.5">
                  {type.examples.map(example => (
                    <Badge 
                      key={example} 
                      variant="outline" 
                      className={isSelected ? type.lightColor : 'text-xs'}
                    >
                      {example}
                    </Badge>
                  ))}
                </div>
              }
              footer={
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Duración:</span> {type.duration}
                </p>
              }
            />
          );
        })}
      </div>

      {/* Info box based on selection */}
      {formData.ip_type && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-medium mb-1">
              Has seleccionado: {IP_TYPE_DETAILS.find(t => t.value === formData.ip_type)?.label}
            </p>
            <p className="text-muted-foreground">
              En los siguientes pasos te pediremos la información específica para este tipo de registro.
              {formData.ip_type === 'trademark' && ' Incluye el nombre/logotipo y las clases de productos o servicios.'}
              {formData.ip_type === 'patent' && ' Incluye el título, reivindicaciones y descripción técnica.'}
              {formData.ip_type === 'design' && ' Incluye las representaciones gráficas del diseño.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}