import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Stamp, Lightbulb, PenTool, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WizardFormData } from '../FilingWizard';
import { FILING_TYPES } from '@/types/filing.types';

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
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Protege signos distintivos que identifican productos o servicios',
    examples: ['Nombres comerciales', 'Logotipos', 'Eslóganes', 'Sonidos'],
    duration: '10 años (renovable indefinidamente)',
  },
  {
    value: 'patent',
    label: 'Patente',
    icon: Lightbulb,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Protege invenciones técnicas nuevas, con actividad inventiva y aplicación industrial',
    examples: ['Máquinas', 'Procesos', 'Composiciones químicas', 'Dispositivos'],
    duration: '20 años (no renovable)',
  },
  {
    value: 'design',
    label: 'Diseño Industrial',
    icon: PenTool,
    color: 'bg-green-500',
    lightColor: 'bg-green-50 text-green-700 border-green-200',
    description: 'Protege la apariencia externa de productos',
    examples: ['Forma de envases', 'Diseño de muebles', 'Patrones textiles', 'Iconos'],
    duration: '25 años (períodos de 5 años)',
  },
  {
    value: 'utility_model',
    label: 'Modelo de Utilidad',
    icon: Wrench,
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Protege invenciones con menor grado de actividad inventiva que las patentes',
    examples: ['Herramientas', 'Utensilios', 'Dispositivos mecánicos', 'Objetos de uso'],
    duration: '10 años (no renovable)',
  },
];

export function Step3IPDetails({ formData, updateFormData, errors }: Step3Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold">¿Qué tipo de derecho quieres registrar?</h3>
        <p className="text-muted-foreground">
          Selecciona el tipo de propiedad industrial que deseas proteger
        </p>
      </div>

      {errors.filing_type && (
        <div className="flex items-center gap-2 text-destructive text-sm mb-4">
          <AlertCircle className="h-4 w-4" />
          {errors.filing_type[0]}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {IP_TYPE_DETAILS.map(type => {
          const isSelected = formData.filing_type === type.value;
          const Icon = type.icon;
          
          return (
            <Card
              key={type.value}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary border-primary"
              )}
              onClick={() => updateFormData({ filing_type: type.value as any })}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-3 rounded-lg", type.color)}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{type.label}</h4>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-6 w-6 text-primary" />
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {type.description}
                </p>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">EJEMPLOS:</p>
                    <div className="flex flex-wrap gap-1">
                      {type.examples.map(example => (
                        <Badge 
                          key={example} 
                          variant="outline" 
                          className={cn("text-xs", isSelected && type.lightColor)}
                        >
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Duración:</span> {type.duration}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info box based on selection */}
      {formData.filing_type && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">
                  Has seleccionado: {IP_TYPE_DETAILS.find(t => t.value === formData.filing_type)?.label}
                </p>
                <p className="text-muted-foreground">
                  En los siguientes pasos te pediremos la información específica para este tipo de registro.
                  {formData.filing_type === 'trademark' && ' Incluye el nombre/logotipo y las clases de productos o servicios.'}
                  {formData.filing_type === 'patent' && ' Incluye el título, reivindicaciones y descripción técnica.'}
                  {formData.filing_type === 'design' && ' Incluye las representaciones gráficas del diseño.'}
                  {formData.filing_type === 'utility_model' && ' Incluye la descripción técnica y reivindicaciones.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
