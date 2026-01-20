// ============================================
// Client Onboarding Wizard Component
// 5-step mandatory flow for client registration
// ============================================

import { useClientOnboarding } from '@/hooks/legal-ops/useClientOnboarding';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Step1Registration,
  Step2AIDisclosure,
  Step3Consents,
  Step4Signature,
  Step5Setup
} from './onboarding';
import { CheckCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Registro', description: 'Datos del cliente' },
  { id: 2, title: 'IA Disclosure', description: 'Información sobre IA' },
  { id: 3, title: 'Consentimientos', description: 'ToS, DPA y opciones' },
  { id: 4, title: 'Firma', description: 'Firma electrónica' },
  { id: 5, title: 'Configuración', description: 'Preferencias' }
];

interface ClientOnboardingWizardProps {
  existingClientId?: string;
  onComplete?: (clientId: string) => void;
}

export function ClientOnboardingWizard({ 
  existingClientId,
  onComplete 
}: ClientOnboardingWizardProps) {
  const navigate = useNavigate();
  
  const {
    currentStep,
    formData,
    clientId,
    updateFormData,
    nextStep,
    prevStep,
    isStepValid,
    saveClientData,
    saveAIDisclosure,
    saveConsents,
    saveSignature,
    completeOnboarding
  } = useClientOnboarding(existingClientId);

  const progress = (currentStep / STEPS.length) * 100;
  const isLoading = saveClientData.isPending || 
                    saveAIDisclosure.isPending || 
                    saveConsents.isPending || 
                    saveSignature.isPending ||
                    completeOnboarding.isPending;

  const handleNext = async () => {
    try {
      switch (currentStep) {
        case 1:
          await saveClientData.mutateAsync();
          break;
        case 2:
          await saveAIDisclosure.mutateAsync();
          break;
        case 3:
          await saveConsents.mutateAsync();
          break;
        case 4:
          if (formData.signature_data) {
            await saveSignature.mutateAsync(formData.signature_data);
          }
          break;
        case 5:
          await completeOnboarding.mutateAsync();
          toast.success('Cliente registrado correctamente');
          if (onComplete && clientId) {
            onComplete(clientId);
          } else {
            navigate('/app/legal-ops/clients');
          }
          return;
      }
      nextStep();
    } catch (error) {
      toast.error('Error al guardar. Por favor, inténtelo de nuevo.');
      console.error('Onboarding error:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Registration formData={formData} onChange={updateFormData} />;
      case 2:
        return <Step2AIDisclosure formData={formData} onChange={updateFormData} />;
      case 3:
        return <Step3Consents formData={formData} onChange={updateFormData} />;
      case 4:
        return <Step4Signature formData={formData} onChange={updateFormData} />;
      case 5:
        return <Step5Setup formData={formData} onChange={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[600px] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        {/* Header with progress */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Alta de cliente</h1>
            <span className="text-sm text-muted-foreground">
              Paso {currentStep} de {STEPS.length}
            </span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {STEPS.map((step) => (
              <div 
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${step.id < currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : step.id === currentStep
                      ? 'border-2 border-primary'
                      : 'border-2 border-muted'
                  }
                `}>
                  {step.id < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span className="text-xs mt-1 hidden sm:block text-center">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>

        {/* Footer with navigation */}
        <div className="p-6 border-t flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isStepValid || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {currentStep === STEPS.length ? 'Finalizar' : 'Siguiente'}
            {currentStep < STEPS.length && !isLoading && (
              <ArrowRight className="w-4 h-4 ml-2" />
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
