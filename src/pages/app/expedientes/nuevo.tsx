// ============================================================
// IP-NEXUS - New Matter Wizard Page (EFECTO WOW + IMPACTO BRUTAL)
// L133: 3-step wizard with premium glassmorphism, glow effects,
//       dark mode support, and celebration animations
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, Loader2, Tag, FileText, Eye, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { 
  useCreateMatterV2, 
  useGenerateMatterNumber,
  usePreviewMatterNumber,
  useMatterTypes 
} from '@/hooks/use-matters-v2';
import { useGenerateInternalReference } from '@/hooks/use-internal-reference-config';
import { Button } from '@/components/ui/button';
import { GradientBackground, GlassCard } from '@/components/ui/GradientBackground';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { usePageTitle } from '@/contexts/page-context';
import {
  WizardSteps,
  TypeJurisdictionStep,
  DetailsForm,
  ReviewStep,
  type WizardStep,
  type MatterDetailsData,
} from '@/components/matters/wizard';
import { toast } from 'sonner';

// Steps configuration - Now 3 steps instead of 4
const WIZARD_STEPS: WizardStep[] = [
  { number: 1, label: 'Tipo y Jurisdicción', icon: Tag },
  { number: 2, label: 'Detalles', icon: FileText },
  { number: 3, label: 'Revisar', icon: Eye },
];

export default function NewMatterPage() {
  usePageTitle('Nuevo Expediente');
  
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { data: matterTypes = [], isLoading: loadingTypes } = useMatterTypes();
  const createMatter = useCreateMatterV2();
  const generateNumber = useGenerateMatterNumber();
  const previewNumberMutation = usePreviewMatterNumber();
  const generateInternalRef = useGenerateInternalReference();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([]);
  const [detailsData, setDetailsData] = useState<MatterDetailsData>({
    title: '',
    client_id: '',
    reference: '',
    client_reference: '',
    mark_name: '',
    invention_title: '',
    internal_notes: '',
    is_urgent: false,
    is_confidential: false,
    nice_classes: [],
    jurisdiction_fields: {},
  });
  
  // Preview number state
  const [previewNumber, setPreviewNumber] = useState<string | null>(null);
  const [generatingNumber, setGeneratingNumber] = useState(false);
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdMatter, setCreatedMatter] = useState<{ id: string; reference: string } | null>(null);

  // Get selected client name for review
  const { data: selectedClient } = useQuery({
    queryKey: ['matter-selected-client', currentOrganization?.id, detailsData.client_id],
    queryFn: async () => {
      if (!currentOrganization?.id || !detailsData.client_id) return null;
      const client: any = supabase;
      const { data, error } = await client
        .from('contacts')
        .select('id, name, client_token')
        .eq('organization_id', currentOrganization.id)
        .eq('id', detailsData.client_id)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; name: string | null; client_token: string | null } | null;
    },
    enabled: !!currentOrganization?.id && !!detailsData.client_id,
  });

  // Generate preview number when type/jurisdiction/client changes
  useEffect(() => {
    if (selectedType && selectedJurisdictions.length > 0) {
      setGeneratingNumber(true);
      previewNumberMutation.mutateAsync({
        matterType: selectedType,
        jurisdictionCode: selectedJurisdictions[0],
        clientId: detailsData.client_id || undefined,
      }).then(number => {
        setPreviewNumber(number);
      }).catch(() => {
        setPreviewNumber(null);
      }).finally(() => {
        setGeneratingNumber(false);
      });
    } else {
      setPreviewNumber(null);
    }
  }, [selectedType, selectedJurisdictions, detailsData.client_id]);

  // Get type info
  const selectedTypeInfo = useMemo(
    () => matterTypes.find(t => t.code === selectedType),
    [matterTypes, selectedType]
  );

  // Step validation - Now 3 steps
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!selectedType && selectedJurisdictions.length > 0;
      case 2:
        return detailsData.title.length >= 3;
      case 3:
        return true;
      default:
        return false;
    }
  };

  // Navigation
  const nextStep = () => {
    if (isStepValid(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle details change
  const handleDetailsChange = (updates: Partial<MatterDetailsData>) => {
    setDetailsData(prev => ({ ...prev, ...updates }));
  };

  // Submit with celebration
  const handleSubmit = async () => {
    try {
      // Generate final number
      const matterNumber = await generateNumber.mutateAsync({
        matterType: selectedType,
        jurisdictionCode: selectedJurisdictions[0],
        clientId: detailsData.client_id || undefined,
      });

      // Generate internal reference if not provided
      let internalReference = detailsData.reference || null;
      if (!internalReference) {
        try {
          const clientToken = selectedClient?.client_token || undefined;
          internalReference = await generateInternalRef.mutateAsync({
            typeCode: selectedType,
            jurisdictionCode: selectedJurisdictions[0],
            clientCode: clientToken,
          });
        } catch (err) {
          console.warn('Could not auto-generate internal reference:', err);
        }
      }

      // Create matter
      const matter = await createMatter.mutateAsync({
        matter_number: matterNumber,
        title: detailsData.title,
        matter_type: selectedType,
        jurisdiction_primary: selectedJurisdictions[0],
        client_id: detailsData.client_id || null,
        reference: internalReference,
        mark_name: detailsData.mark_name || null,
        invention_title: detailsData.invention_title || null,
        internal_notes: detailsData.internal_notes || null,
        is_urgent: detailsData.is_urgent,
        is_confidential: detailsData.is_confidential,
        // Include jurisdiction-specific dynamic fields
        custom_fields: {
          jurisdiction_fields: detailsData.jurisdiction_fields || {},
        },
      });

      // Show success modal with confetti
      setCreatedMatter({ id: matter.id, reference: matterNumber });
      setShowSuccessModal(true);
      
    } catch (error) {
      toast.error('Error al crear expediente', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  return (
    <GradientBackground variant="default">
      <div className="max-w-4xl mx-auto p-6 pb-24">
        {/* HERO Header with gradient text */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/expedientes')}
            className="bg-white/50 dark:bg-white/10 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            {/* HERO Typography */}
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-primary to-purple-600 dark:from-white dark:via-primary dark:to-purple-400 bg-clip-text text-transparent">
              Nuevo Expediente
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Crea un nuevo expediente de propiedad intelectual
            </p>
          </div>
        </motion.div>

        {/* Progress Steps - Premium */}
        <WizardSteps
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onStepClick={(step) => step < currentStep && setCurrentStep(step)}
        />

        {/* Content Area - Glass Card with step transitions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="mt-8 p-6 md:p-8" glowColor="primary">
            <AnimatePresence mode="wait">
              {/* Step 1: Type + Jurisdiction Combined */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TypeJurisdictionStep
                    types={matterTypes}
                    selectedType={selectedType}
                    onSelectType={setSelectedType}
                    selectedJurisdictions={selectedJurisdictions}
                    onSelectJurisdictions={setSelectedJurisdictions}
                    isLoading={loadingTypes}
                    singleJurisdiction={true}
                  />
                </motion.div>
              )}

              {/* Step 2: Details Form */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <DetailsForm
                    data={detailsData}
                    onChange={handleDetailsChange}
                    matterType={selectedType}
                    jurisdiction={selectedJurisdictions[0]}
                    previewNumber={previewNumber || undefined}
                    isGeneratingNumber={generatingNumber}
                  />
                </motion.div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ReviewStep
                    formData={{
                      ...detailsData,
                      client_name: selectedClient?.name || undefined,
                    }}
                    matterType={selectedType}
                    matterTypeInfo={selectedTypeInfo}
                    jurisdictions={selectedJurisdictions}
                    previewNumber={previewNumber || undefined}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        {/* Navigation Buttons - Premium with micro-animations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mt-8"
        >
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-white/20 border-white/60 dark:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 hover:scale-105 active:scale-95"
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createMatter.isPending}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 hover:scale-105 active:scale-95"
            >
              {createMatter.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Crear Expediente
                </>
              )}
            </Button>
          )}
        </motion.div>
      </div>

      {/* Success Modal with Confetti */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="¡Expediente Creado!"
        reference={createdMatter?.reference}
        description="Tu expediente está listo para gestionar"
        primaryAction={{
          label: 'Abrir expediente',
          onClick: () => {
            setShowSuccessModal(false);
            navigate(`/app/expedientes/${createdMatter?.id}`);
          },
        }}
        secondaryAction={{
          label: 'Ver todos',
          onClick: () => {
            setShowSuccessModal(false);
            navigate('/app/expedientes');
          },
        }}
      />
    </GradientBackground>
  );
}
