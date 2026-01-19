import { useFilingOffices } from '@/hooks/filing/useFiling';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import type { WizardFormData } from '../FilingWizard';

interface Step1Props {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  errors: Record<string, string[]>;
}

export function Step1OfficeSelection({ formData, updateFormData, errors }: Step1Props) {
  const { data: offices = [], isLoading } = useFilingOffices();

  // Filter only offices that support e-filing
  const filingOffices = offices.filter(office => office.supports_efiling);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold">¿Dónde quieres presentar la solicitud?</h3>
        <p className="text-muted-foreground">
          Selecciona la oficina de propiedad industrial de destino
        </p>
      </div>

      {errors.office_id && (
        <div className="flex items-center gap-2 text-destructive text-sm mb-4">
          <AlertCircle className="h-4 w-4" />
          {errors.office_id[0]}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filingOffices.map(office => {
          const isSelected = formData.office_id === office.id;
          
          return (
            <Card
              key={office.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary border-primary"
              )}
              onClick={() => updateFormData({ 
                office_id: office.id, 
                office_code: office.code 
              })}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSelected ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Building2 className={cn(
                        "h-6 w-6",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{office.short_name}</h4>
                      <p className="text-xs text-muted-foreground">{office.name}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>{office.country}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {office.accepted_ip_types?.map((type: string) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type === 'trademark' && 'Marcas'}
                        {type === 'patent' && 'Patentes'}
                        {type === 'design' && 'Diseños'}
                        {type === 'utility_model' && 'Modelos'}
                      </Badge>
                    ))}
                  </div>
                </div>

                {office.efiling_url && (
                  <div className="mt-3 pt-3 border-t">
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      e-Filing disponible
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filingOffices.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay oficinas configuradas para presentación electrónica.</p>
          <p className="text-sm">Contacta al administrador para añadir oficinas.</p>
        </div>
      )}
    </div>
  );
}
