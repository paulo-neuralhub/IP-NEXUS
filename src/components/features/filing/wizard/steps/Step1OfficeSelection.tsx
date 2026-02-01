import { useFilingOffices } from '@/hooks/filing/useFiling';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { SelectionCard } from '../SelectionCard';
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
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <MapPin className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">¿Dónde quieres presentar la solicitud?</h3>
        <p className="text-muted-foreground mt-1">
          Selecciona la oficina de propiedad industrial de destino
        </p>
      </div>

      {/* Error message */}
      {errors.office_id && (
        <div className="flex items-center gap-2 text-destructive text-sm p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          {errors.office_id[0]}
        </div>
      )}

      {/* Office Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filingOffices.map(office => {
          const isSelected = formData.office_id === office.id;
          
          return (
            <SelectionCard
              key={office.id}
              isSelected={isSelected}
              onClick={() => updateFormData({ 
                office_id: office.id, 
                office_code: office.code 
              })}
              icon={<Building2 className="h-6 w-6" />}
              title={office.short_name}
              subtitle={office.name}
              badges={
                <>
                  {office.accepted_ip_types?.map((type: string) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type === 'trademark' && 'Marcas'}
                      {type === 'patent' && 'Patentes'}
                      {type === 'design' && 'Diseños'}
                      {type === 'utility_model' && 'Modelos'}
                    </Badge>
                  ))}
                </>
              }
              footer={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>{office.country}</span>
                  </div>
                  {office.efiling_url && (
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      e-Filing
                    </Badge>
                  )}
                </div>
              }
            />
          );
        })}
      </div>

      {/* Empty state */}
      {filingOffices.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No hay oficinas configuradas para presentación electrónica.</p>
          <p className="text-sm text-muted-foreground mt-1">Contacta al administrador para añadir oficinas.</p>
        </div>
      )}
    </div>
  );
}
