import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Save, Send, Check, 
  AlertCircle, Building2, User, FileText, Image,
  List, DollarSign, FileCheck, Upload
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Wizard Steps
import { Step1OfficeSelection } from './steps/Step1OfficeSelection';
import { Step2ApplicantData } from './steps/Step2ApplicantData';
import { Step3IPDetails } from './steps/Step3IPDetails';
import { Step4MarkDetails } from './steps/Step4MarkDetails';
import { Step5Classification } from './steps/Step5Classification';
import { Step6Documents } from './steps/Step6Documents';
import { Step7Fees } from './steps/Step7Fees';
import { Step8Review } from './steps/Step8Review';

import { 
  useFilingApplication, 
  useCreateFiling, 
  useUpdateFiling,
  useValidateFiling,
  useSubmitFiling 
} from '@/hooks/filing/useFiling';
import type { FilingType } from '@/types/filing.types';

const STEPS = [
  { id: 1, title: 'Oficina', icon: Building2, description: 'Selecciona la oficina de destino' },
  { id: 2, title: 'Solicitante', icon: User, description: 'Datos del solicitante' },
  { id: 3, title: 'Tipo de PI', icon: FileText, description: 'Tipo de derecho a solicitar' },
  { id: 4, title: 'Detalles', icon: Image, description: 'Información específica' },
  { id: 5, title: 'Clasificación', icon: List, description: 'Clases y productos/servicios' },
  { id: 6, title: 'Documentos', icon: Upload, description: 'Adjuntar documentación' },
  { id: 7, title: 'Tasas', icon: DollarSign, description: 'Cálculo de tasas oficiales' },
  { id: 8, title: 'Revisión', icon: FileCheck, description: 'Validar y presentar' },
];

export interface WizardFormData {
  // Step 1 - Office
  office_id: string;
  office_code: string;
  
  // Step 2 - Applicant
  applicant_name: string;
  applicant_address: string;
  applicant_country: string;
  applicant_email: string;
  applicant_phone: string;
  applicant_type: 'natural_person' | 'legal_entity';
  applicant_tax_id: string;
  representative_name?: string;
  representative_address?: string;
  representative_id?: string;
  
  // Step 3 - IP Type
  ip_type: 'trademark' | 'patent' | 'design';
  filing_type: FilingType;
  
  // Step 4 - Mark/IP Details
  mark_name?: string;
  mark_type?: 'word' | 'figurative' | 'combined' | 'sound' | 'shape_3d' | 'position' | 'pattern' | 'color' | 'motion' | 'hologram' | 'multimedia' | 'other';
  mark_description?: string;
  mark_image_url?: string;
  mark_colors?: string[];
  mark_disclaimer?: string;
  priority_claimed: boolean;
  priority_country?: string;
  priority_date?: string;
  priority_number?: string;
  
  // Step 5 - Classification
  nice_classes: number[];
  goods_services: Record<number, string>;
  vienna_codes?: string[];
  
  // Step 6 - Documents
  documents: Array<{
    type: string;
    name: string;
    url: string;
    size: number;
  }>;
  
  // Step 7 - Fees
  calculated_fees?: {
    fees: Array<{ concept: string; amount: number; currency: string }>;
    total: number;
    currency: string;
  };
  payment_method?: string;
  
  // Internal
  matter_id?: string;
}

const initialFormData: WizardFormData = {
  office_id: '',
  office_code: '',
  applicant_name: '',
  applicant_address: '',
  applicant_country: '',
  applicant_email: '',
  applicant_phone: '',
  applicant_type: 'legal_entity',
  applicant_tax_id: '',
  ip_type: 'trademark',
  filing_type: 'new_application',
  mark_name: '',
  mark_type: 'word',
  mark_description: '',
  priority_claimed: false,
  nice_classes: [],
  goods_services: {},
  documents: [],
};

export function FilingWizard() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: existingApplication } = useFilingApplication(id);
  const createFiling = useCreateFiling();
  const updateFiling = useUpdateFiling();
  const validateFiling = useValidateFiling();
  const submitFiling = useSubmitFiling();

  // Load existing data if editing
  useEffect(() => {
    if (existingApplication) {
      const trademarkData = existingApplication.trademark_data?.[0];
      setFormData({
        office_id: existingApplication.office_id,
        office_code: existingApplication.office?.code || existingApplication.office_code,
        applicant_name: existingApplication.applicant_data?.name || '',
        applicant_address: existingApplication.applicant_data?.address?.street || '',
        applicant_country: existingApplication.applicant_data?.country || '',
        applicant_email: existingApplication.applicant_data?.email || '',
        applicant_phone: existingApplication.applicant_data?.phone || '',
        applicant_type: existingApplication.applicant_data?.type || 'legal_entity',
        applicant_tax_id: existingApplication.applicant_data?.tax_id || '',
        representative_name: existingApplication.representative_data?.name || undefined,
        representative_address: existingApplication.representative_data?.address?.street || undefined,
        representative_id: existingApplication.representative_id || undefined,
        ip_type: existingApplication.ip_type,
        filing_type: existingApplication.filing_type,
        mark_name: trademarkData?.mark_text || '',
        mark_type: trademarkData?.mark_type || 'word',
        mark_description: trademarkData?.mark_description || '',
        mark_image_url: undefined,
        mark_colors: trademarkData?.colors_claimed || undefined,
        mark_disclaimer: trademarkData?.disclaimer || undefined,
        priority_claimed: (existingApplication.priority_claims?.length || 0) > 0,
        priority_country: existingApplication.priority_claims?.[0]?.country || undefined,
        priority_date: existingApplication.priority_claims?.[0]?.date || undefined,
        priority_number: existingApplication.priority_claims?.[0]?.number || undefined,
        nice_classes: trademarkData?.nice_classes || [],
        goods_services: trademarkData?.goods_services || {},
        vienna_codes: trademarkData?.vienna_codes || undefined,
        documents: [],
        matter_id: existingApplication.matter_id || undefined,
      });
    }
  }, [existingApplication]);

  const updateFormData = (updates: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear validation errors for updated fields
    const clearedErrors = { ...validationErrors };
    Object.keys(updates).forEach(key => {
      delete clearedErrors[key];
    });
    setValidationErrors(clearedErrors);
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string[]> = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.office_id) {
          errors.office_id = ['Debes seleccionar una oficina'];
        }
        break;
      case 2:
        if (!formData.applicant_name) {
          errors.applicant_name = ['El nombre del solicitante es obligatorio'];
        }
        if (!formData.applicant_address) {
          errors.applicant_address = ['La dirección es obligatoria'];
        }
        if (!formData.applicant_country) {
          errors.applicant_country = ['El país es obligatorio'];
        }
        if (!formData.applicant_email) {
          errors.applicant_email = ['El email es obligatorio'];
        }
        break;
      case 3:
        if (!formData.ip_type) {
          errors.ip_type = ['Debes seleccionar un tipo de PI'];
        }
        break;
      case 4:
        if (formData.ip_type === 'trademark' && !formData.mark_name) {
          errors.mark_name = ['El nombre de la marca es obligatorio'];
        }
        break;
      case 5:
        if (formData.ip_type === 'trademark' && formData.nice_classes.length === 0) {
          errors.nice_classes = ['Debes seleccionar al menos una clase'];
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = async () => {
    try {
      if (isEditing && id) {
        await updateFiling.mutateAsync({ 
          id,
          applicant_data: {
            name: formData.applicant_name,
            type: formData.applicant_type,
            country: formData.applicant_country,
            address: { street: formData.applicant_address },
            email: formData.applicant_email,
            phone: formData.applicant_phone,
            tax_id: formData.applicant_tax_id,
          },
          representative_data: formData.representative_name ? {
            name: formData.representative_name,
            address: { street: formData.representative_address },
          } : undefined,
          priority_claims: formData.priority_claimed && formData.priority_country ? [{
            country: formData.priority_country,
            date: formData.priority_date || '',
            number: formData.priority_number || '',
          }] : [],
        });
      } else {
        await createFiling.mutateAsync({
          filing_type: formData.filing_type,
          ip_type: formData.ip_type,
          office_code: formData.office_code,
          office_id: formData.office_id,
        });
      }
      
      toast.success('Borrador guardado correctamente');
      navigate('/app/filing');
    } catch (error) {
      toast.error('Error al guardar el borrador');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // First save/update
      let applicationId = id;
      
      if (!applicationId) {
        const created = await createFiling.mutateAsync({
          filing_type: formData.filing_type,
          ip_type: formData.ip_type,
          office_code: formData.office_code,
          office_id: formData.office_id,
        });
        applicationId = created.id;
      } else {
        await updateFiling.mutateAsync({ 
          id: applicationId,
          applicant_data: {
            name: formData.applicant_name,
            type: formData.applicant_type,
            country: formData.applicant_country,
            address: { street: formData.applicant_address },
            email: formData.applicant_email,
            phone: formData.applicant_phone,
            tax_id: formData.applicant_tax_id,
          },
        });
      }

      // Validate
      const validationResult = await validateFiling.mutateAsync(applicationId);
      
      if (!validationResult.valid) {
        toast.error('La solicitud tiene errores de validación');
        setIsSubmitting(false);
        return;
      }

      // Submit
      await submitFiling.mutateAsync(applicationId);
      toast.success('Solicitud presentada correctamente');
      navigate('/app/filing');
    } catch (error) {
      toast.error('Error al presentar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1OfficeSelection formData={formData} updateFormData={updateFormData} errors={validationErrors} />;
      case 2:
        return <Step2ApplicantData formData={formData} updateFormData={updateFormData} errors={validationErrors} />;
      case 3:
        return <Step3IPDetails formData={formData} updateFormData={updateFormData} errors={validationErrors} />;
      case 4:
        return <Step4MarkDetails formData={formData} updateFormData={updateFormData} errors={validationErrors} />;
      case 5:
        return <Step5Classification formData={formData} updateFormData={updateFormData} errors={validationErrors} />;
      case 6:
        return <Step6Documents formData={formData} updateFormData={updateFormData} errors={validationErrors} />;
      case 7:
        return <Step7Fees formData={formData} updateFormData={updateFormData} errors={validationErrors} />;
      case 8:
        return <Step8Review formData={formData} updateFormData={updateFormData} errors={validationErrors} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Solicitud' : 'Nueva Solicitud de Registro'}
          </h1>
          <p className="text-muted-foreground">
            Completa los pasos para crear tu solicitud electrónica
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/app/filing')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Paso {currentStep} de {STEPS.length}</span>
              <span className="text-muted-foreground">{Math.round(progress)}% completado</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {/* Step indicators */}
            <div className="flex justify-between mt-6">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "flex flex-col items-center gap-2 cursor-pointer transition-colors",
                      isActive && "text-primary",
                      isCompleted && "text-emerald-600",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                    onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                      isActive && "border-primary bg-primary/10",
                      isCompleted && "border-emerald-600 bg-emerald-50",
                      !isActive && !isCompleted && "border-muted-foreground/30"
                    )}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-xs font-medium hidden md:block">
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const Icon = STEPS[currentStep - 1].icon;
              return <Icon className="h-5 w-5" />;
            })()}
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            {STEPS[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Borrador
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button onClick={handleNext}>
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>Presentando...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Presentar Solicitud
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilingWizard;