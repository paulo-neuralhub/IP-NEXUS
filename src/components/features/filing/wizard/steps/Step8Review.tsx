import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Building2, User, FileText, Image, List, Upload, DollarSign,
  CheckCircle, AlertCircle, Edit, MapPin, Mail, Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { WizardFormData } from '../FilingWizard';
import { FILING_TYPES, MARK_TYPES } from '@/types/filing.types';

interface Step8Props {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  errors: Record<string, string[]>;
}

export function Step8Review({ formData, updateFormData, errors }: Step8Props) {
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const [confirmTerms, setConfirmTerms] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const SectionCard = ({ 
    title, 
    icon: Icon, 
    children,
    step
  }: { 
    title: string; 
    icon: React.ElementType; 
    children: React.ReactNode;
    step: number;
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Paso {step}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  const InfoRow = ({ label, value }: { label: string; value?: string | React.ReactNode }) => (
    <div className="flex justify-between py-1.5">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-medium text-sm text-right">{value || '-'}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold">Revisión Final</h3>
        <p className="text-muted-foreground">
          Verifica todos los datos antes de presentar la solicitud
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Office */}
        <SectionCard title="Oficina de Destino" icon={Building2} step={1}>
          <InfoRow 
            label="Oficina" 
            value={formData.office_code?.toUpperCase()} 
          />
        </SectionCard>

        {/* Applicant */}
        <SectionCard title="Solicitante" icon={User} step={2}>
          <InfoRow label="Nombre" value={formData.applicant_name} />
          <InfoRow 
            label="Tipo" 
            value={formData.applicant_type === 'company' ? 'Persona Jurídica' : 'Persona Física'} 
          />
          <InfoRow label="País" value={formData.applicant_country} />
          <InfoRow label="Email" value={formData.applicant_email} />
          {formData.representative_name && (
            <InfoRow label="Representante" value={formData.representative_name} />
          )}
        </SectionCard>

        {/* IP Type */}
        <SectionCard title="Tipo de PI" icon={FileText} step={3}>
          <InfoRow 
            label="Tipo" 
            value={
              <Badge variant="outline">
                {FILING_TYPES.find(t => t.value === formData.filing_type)?.label}
              </Badge>
            } 
          />
        </SectionCard>

        {/* Mark Details (if trademark) */}
        {formData.filing_type === 'trademark' && (
          <SectionCard title="Detalles de la Marca" icon={Image} step={4}>
            <InfoRow label="Nombre" value={formData.mark_name} />
            <InfoRow 
              label="Tipo de marca" 
              value={MARK_TYPES.find(t => t.value === formData.mark_type)?.label} 
            />
            {formData.mark_description && (
              <InfoRow label="Descripción" value="Sí" />
            )}
            {formData.priority_claimed && (
              <InfoRow 
                label="Prioridad" 
                value={`${formData.priority_country} - ${formData.priority_number}`} 
              />
            )}
          </SectionCard>
        )}

        {/* Classification */}
        {formData.filing_type === 'trademark' && (
          <SectionCard title="Clasificación" icon={List} step={5}>
            <div className="space-y-2">
              <InfoRow 
                label="Clases Nice" 
                value={`${formData.nice_classes.length} clase(s)`} 
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.nice_classes.map(cls => (
                  <Badge key={cls} variant="secondary" className="text-xs">
                    Clase {cls}
                  </Badge>
                ))}
              </div>
            </div>
          </SectionCard>
        )}

        {/* Documents */}
        <SectionCard title="Documentación" icon={Upload} step={6}>
          <InfoRow 
            label="Documentos adjuntos" 
            value={`${formData.documents.length} archivo(s)`} 
          />
          {formData.documents.length > 0 && (
            <div className="mt-2 space-y-1">
              {formData.documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  {doc.name}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Fees */}
        <SectionCard title="Tasas y Pago" icon={DollarSign} step={7}>
          {formData.calculated_fees ? (
            <>
              <InfoRow 
                label="Total tasas" 
                value={
                  <span className="text-primary font-bold">
                    {formatCurrency(formData.calculated_fees.total, formData.calculated_fees.currency)}
                  </span>
                } 
              />
              <InfoRow 
                label="Método de pago" 
                value={
                  formData.payment_method === 'bank_transfer' ? 'Transferencia' :
                  formData.payment_method === 'credit_card' ? 'Tarjeta' : '-'
                } 
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Tasas no calculadas</p>
          )}
        </SectionCard>
      </div>

      <Separator />

      {/* Validation Status */}
      <Card className={cn(
        "border-2",
        formData.nice_classes.length > 0 && formData.applicant_name && formData.office_id
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {formData.nice_classes.length > 0 && formData.applicant_name && formData.office_id ? (
              <>
                <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-800">
                    Solicitud lista para presentar
                  </p>
                  <p className="text-sm text-emerald-700">
                    Todos los campos obligatorios están completos.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">
                    Faltan datos obligatorios
                  </p>
                  <p className="text-sm text-amber-700">
                    Revisa los pasos anteriores para completar la información necesaria.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Confirmaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="confirm_accuracy" 
              checked={confirmAccuracy}
              onCheckedChange={(checked) => setConfirmAccuracy(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="confirm_accuracy" className="cursor-pointer">
                Confirmo que los datos proporcionados son correctos
              </Label>
              <p className="text-xs text-muted-foreground">
                Declaro que la información proporcionada es veraz y completa a mi leal saber y entender.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="confirm_terms" 
              checked={confirmTerms}
              onCheckedChange={(checked) => setConfirmTerms(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="confirm_terms" className="cursor-pointer">
                Acepto los términos y condiciones de la oficina
              </Label>
              <p className="text-xs text-muted-foreground">
                He leído y acepto las condiciones de presentación electrónica y el tratamiento de mis datos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">Importante</p>
              <ul className="text-blue-700 space-y-1">
                <li>• Una vez presentada, la solicitud no se puede modificar</li>
                <li>• El pago de tasas debe realizarse en el plazo indicado</li>
                <li>• Recibirás un acuse de recibo por email tras la presentación</li>
                <li>• El expediente quedará vinculado a tu cuenta de IP-NEXUS</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disabled state for submit button indicator */}
      {(!confirmAccuracy || !confirmTerms) && (
        <p className="text-center text-sm text-muted-foreground">
          Debes aceptar las confirmaciones anteriores para poder presentar la solicitud
        </p>
      )}
    </div>
  );
}
