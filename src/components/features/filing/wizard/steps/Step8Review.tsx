import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Building2, User, FileText, Image, List, Upload, DollarSign,
  CheckCircle, AlertCircle, ClipboardCheck, Globe, Mail, Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { 
  SummaryDetailCard, 
  InfoRow, 
  ValidationBanner, 
  InfoBanner 
} from '../SummaryDetailCard';
import type { WizardFormData } from '../FilingWizard';
import { IP_TYPES, MARK_TYPES } from '@/types/filing.types';

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

  const ipTypeLabel = IP_TYPES.find(t => t.value === formData.ip_type)?.label || formData.ip_type;
  const markTypeLabel = MARK_TYPES.find(t => t.value === formData.mark_type)?.label || formData.mark_type;

  const isValid = Boolean(formData.nice_classes.length > 0 && formData.applicant_name && formData.office_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <ClipboardCheck className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Revisión Final</h3>
        <p className="text-muted-foreground mt-1">
          Verifica todos los datos antes de presentar la solicitud
        </p>
      </div>

      {/* Summary Cards - Premium Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Office */}
        <SummaryDetailCard 
          title="Oficina de Destino" 
          icon={<Building2 className="h-4 w-4" />} 
          step={1}
          accentColor="blue"
        >
          <InfoRow 
            icon={<Globe className="h-3 w-3" />}
            label="Oficina" 
            value={
              <Badge variant="secondary" className="font-mono">
                {formData.office_code?.toUpperCase()}
              </Badge>
            } 
          />
        </SummaryDetailCard>

        {/* Applicant */}
        <SummaryDetailCard 
          title="Solicitante" 
          icon={<User className="h-4 w-4" />} 
          step={2}
          accentColor="purple"
        >
          <InfoRow label="Nombre" value={formData.applicant_name} />
          <InfoRow 
            label="Tipo" 
            value={formData.applicant_type === 'legal_entity' ? 'Persona Jurídica' : 'Persona Física'} 
          />
          <InfoRow icon={<Globe className="h-3 w-3" />} label="País" value={formData.applicant_country} />
          <InfoRow icon={<Mail className="h-3 w-3" />} label="Email" value={formData.applicant_email} />
          {formData.representative_name && (
            <InfoRow label="Representante" value={formData.representative_name} />
          )}
        </SummaryDetailCard>

        {/* IP Type */}
        <SummaryDetailCard 
          title="Tipo de PI" 
          icon={<FileText className="h-4 w-4" />} 
          step={3}
          accentColor="green"
        >
          <InfoRow 
            label="Tipo" 
            value={
              <Badge variant="outline" className="bg-primary/5">
                {ipTypeLabel}
              </Badge>
            } 
          />
        </SummaryDetailCard>

        {/* Mark Details (if trademark) */}
        {formData.ip_type === 'trademark' && (
          <SummaryDetailCard 
            title="Detalles de la Marca" 
            icon={<Image className="h-4 w-4" />} 
            step={4}
            accentColor="amber"
          >
            <InfoRow label="Nombre" value={
              <span className="font-semibold text-primary">{formData.mark_name}</span>
            } />
            <InfoRow 
              label="Tipo de marca" 
              value={markTypeLabel} 
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
          </SummaryDetailCard>
        )}

        {/* Classification */}
        {formData.ip_type === 'trademark' && (
          <SummaryDetailCard 
            title="Clasificación" 
            icon={<List className="h-4 w-4" />} 
            step={5}
            accentColor="rose"
          >
            <div className="space-y-3">
              <InfoRow 
                label="Clases Nice" 
                value={
                  <Badge variant="secondary">
                    {formData.nice_classes.length} clase(s)
                  </Badge>
                } 
              />
              <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                {formData.nice_classes.map(cls => (
                  <Badge key={cls} variant="outline" className="text-xs font-mono">
                    {cls}
                  </Badge>
                ))}
              </div>
            </div>
          </SummaryDetailCard>
        )}

        {/* Documents */}
        <SummaryDetailCard 
          title="Documentación" 
          icon={<Upload className="h-4 w-4" />} 
          step={6}
          accentColor="blue"
        >
          <InfoRow 
            label="Documentos adjuntos" 
            value={
              <Badge variant={formData.documents.length > 0 ? 'secondary' : 'outline'}>
                {formData.documents.length} archivo(s)
              </Badge>
            } 
          />
          {formData.documents.length > 0 && (
            <div className="mt-3 pt-3 border-t space-y-1.5">
              {formData.documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  {doc.name}
                </div>
              ))}
            </div>
          )}
        </SummaryDetailCard>

        {/* Fees */}
        <SummaryDetailCard 
          title="Tasas y Pago" 
          icon={<DollarSign className="h-4 w-4" />} 
          step={7}
          accentColor="green"
        >
          {formData.calculated_fees ? (
            <>
              <InfoRow 
                label="Total tasas" 
                value={
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(formData.calculated_fees.total, formData.calculated_fees.currency)}
                  </span>
                } 
              />
              <InfoRow 
                label="Método de pago" 
                value={
                  formData.payment_method === 'bank_transfer' ? 'Transferencia' :
                  formData.payment_method === 'credit_card' ? 'Tarjeta' : '—'
                } 
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-2">Tasas no calculadas</p>
          )}
        </SummaryDetailCard>
      </div>

      <Separator />

      {/* Validation Status - Premium Banner */}
      <ValidationBanner isValid={isValid} />

      {/* Confirmations - Premium Card */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
            Confirmaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <Checkbox 
              id="confirm_accuracy" 
              checked={confirmAccuracy}
              onCheckedChange={(checked) => setConfirmAccuracy(checked as boolean)}
              className="mt-0.5"
            />
            <div className="grid gap-1 leading-none">
              <Label htmlFor="confirm_accuracy" className="cursor-pointer font-medium">
                Confirmo que los datos proporcionados son correctos
              </Label>
              <p className="text-xs text-muted-foreground">
                Declaro que la información proporcionada es veraz y completa a mi leal saber y entender.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <Checkbox 
              id="confirm_terms" 
              checked={confirmTerms}
              onCheckedChange={(checked) => setConfirmTerms(checked as boolean)}
              className="mt-0.5"
            />
            <div className="grid gap-1 leading-none">
              <Label htmlFor="confirm_terms" className="cursor-pointer font-medium">
                Acepto los términos y condiciones de la oficina
              </Label>
              <p className="text-xs text-muted-foreground">
                He leído y acepto las condiciones de presentación electrónica y el tratamiento de mis datos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning - Premium Info Banner */}
      <InfoBanner title="Importante" variant="info">
        <ul className="space-y-1.5 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Una vez presentada, la solicitud no se puede modificar
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            El pago de tasas debe realizarse en el plazo indicado
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Recibirás un acuse de recibo por email tras la presentación
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            El expediente quedará vinculado a tu cuenta de IP-NEXUS
          </li>
        </ul>
      </InfoBanner>

      {/* Disabled state for submit button indicator */}
      {(!confirmAccuracy || !confirmTerms) && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Debes aceptar las confirmaciones anteriores para poder presentar la solicitud
          </p>
        </div>
      )}
    </div>
  );
}