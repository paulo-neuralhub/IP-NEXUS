import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Upload,
  Globe,
  Users,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { useUpdateOnboardingProgress, useCompleteOnboarding, type OnboardingProgress } from '@/hooks/useOnboarding';
import { StepCompanySetup } from './steps/StepCompanySetup';
import { StepImportData } from './steps/StepImportData';
import { StepOfficesSetup } from './steps/StepOfficesSetup';
import { StepTeamInvite } from './steps/StepTeamInvite';
import { StepTourIntro } from './steps/StepTourIntro';

interface OnboardingWizardProps {
  organizationId: string;
  progress: OnboardingProgress | null;
  onComplete: () => void;
}

const STEPS = [
  { id: 1, title: 'Tu Empresa', icon: Building2, description: 'Configura los datos básicos' },
  { id: 2, title: 'Importar Datos', icon: Upload, description: 'Importa tu portfolio existente' },
  { id: 3, title: 'Oficinas de PI', icon: Globe, description: 'Selecciona oficinas frecuentes' },
  { id: 4, title: 'Tu Equipo', icon: Users, description: 'Invita a tu equipo' },
  { id: 5, title: 'Comenzar', icon: Sparkles, description: 'Tour guiado' },
];

export function OnboardingWizard({ organizationId, progress, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(progress?.current_step || 1);
  const [formData, setFormData] = useState<Record<string, any>>(progress?.collected_data || {});
  
  const updateProgress = useUpdateOnboardingProgress();
  const completeOnboarding = useCompleteOnboarding();

  const progressPercent = (currentStep / STEPS.length) * 100;

  const handleNext = async () => {
    // Save step as completed
    const newStepsCompleted = {
      ...progress?.steps_completed,
      [currentStep]: {
        completed: true,
        completed_at: new Date().toISOString()
      }
    };
    
    if (currentStep < STEPS.length) {
      await updateProgress.mutateAsync({
        current_step: currentStep + 1,
        steps_completed: newStepsCompleted,
        collected_data: formData
      });
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding.mutateAsync();
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    const newStepsCompleted = {
      ...progress?.steps_completed,
      [currentStep]: {
        completed: false,
        skipped: true,
        skipped_at: new Date().toISOString()
      }
    };
    
    await updateProgress.mutateAsync({
      current_step: currentStep + 1,
      steps_completed: newStepsCompleted
    });
    setCurrentStep(currentStep + 1);
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepCompanySetup data={formData} updateData={updateFormData} organizationId={organizationId} />;
      case 2:
        return <StepImportData organizationId={organizationId} onSkip={handleSkip} />;
      case 3:
        return <StepOfficesSetup data={formData} updateData={updateFormData} />;
      case 4:
        return <StepTeamInvite organizationId={organizationId} />;
      case 5:
        return <StepTourIntro onComplete={onComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Configura tu espacio de trabajo</h1>
          <p className="text-muted-foreground mt-2">Vamos paso a paso para personalizar IP-NEXUS</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    step.id < currentStep
                      ? 'bg-green-500 text-white'
                      : step.id === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-12 md:w-16 h-1 mx-1 md:mx-2 transition-colors ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Paso {currentStep} de {STEPS.length}: <span className="font-medium text-foreground">{STEPS[currentStep - 1].title}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{STEPS[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Content Card */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur">
          <CardContent className="pt-6 min-h-[400px]">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || updateProgress.isPending}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {currentStep !== 5 && currentStep !== 1 && (
              <Button 
                variant="ghost" 
                onClick={handleSkip}
                disabled={updateProgress.isPending}
              >
                Saltar
              </Button>
            )}
            <Button 
              onClick={handleNext}
              disabled={updateProgress.isPending || completeOnboarding.isPending}
            >
              {currentStep === STEPS.length ? 'Finalizar' : 'Siguiente'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
