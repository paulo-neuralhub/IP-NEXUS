// ============================================================
// IP-NEXUS - New Matter Wizard Page
// L127: Multi-step wizard for creating new matters
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, Loader2, Tag, Globe, FileText, Eye } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
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
import { Card, CardContent } from '@/components/ui/card';
import { usePageTitle } from '@/contexts/page-context';
import {
  WizardSteps,
  TypeSelector,
  JurisdictionSelector,
  DetailsForm,
  ReviewStep,
  type WizardStep,
  type MatterDetailsData,
} from '@/components/matters/wizard';
import { toast } from 'sonner';

// Steps configuration
const WIZARD_STEPS: WizardStep[] = [
  { number: 1, label: 'Tipo', icon: Tag },
  { number: 2, label: 'Jurisdicción', icon: Globe },
  { number: 3, label: 'Detalles', icon: FileText },
  { number: 4, label: 'Revisar', icon: Eye },
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
  });
  
  // Preview number state
  const [previewNumber, setPreviewNumber] = useState<string | null>(null);
  const [generatingNumber, setGeneratingNumber] = useState(false);

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

  // Step validation
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!selectedType;
      case 2:
        return selectedJurisdictions.length > 0;
      case 3:
        return detailsData.title.length >= 3;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Navigation
  const nextStep = () => {
    if (isStepValid(currentStep) && currentStep < 4) {
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

  // Submit
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
      });

      toast.success('Expediente creado correctamente', {
        description: `Número: ${matterNumber}`,
      });
      navigate(`/app/expedientes/${matter.id}`);
    } catch (error) {
      toast.error('Error al crear expediente', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/expedientes')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nuevo Expediente</h1>
            <p className="text-muted-foreground">
              Crea un nuevo expediente de propiedad intelectual
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <WizardSteps
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onStepClick={(step) => step < currentStep && setCurrentStep(step)}
        />

        {/* Content Area */}
        <Card className="mt-6">
          <CardContent className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Type Selection */}
              {currentStep === 1 && (
                <TypeSelector
                  key="step-1"
                  types={matterTypes}
                  selectedType={selectedType}
                  onSelect={setSelectedType}
                  isLoading={loadingTypes}
                />
              )}

              {/* Step 2: Jurisdiction Selection */}
              {currentStep === 2 && (
                <JurisdictionSelector
                  key="step-2"
                  selectedJurisdictions={selectedJurisdictions}
                  onSelect={setSelectedJurisdictions}
                  typeLabel={selectedTypeInfo?.name_es?.toLowerCase() || 'expediente'}
                  singleSelect={true}
                />
              )}

              {/* Step 3: Details Form */}
              {currentStep === 3 && (
                <DetailsForm
                  key="step-3"
                  data={detailsData}
                  onChange={handleDetailsChange}
                  matterType={selectedType}
                  previewNumber={previewNumber || undefined}
                  isGeneratingNumber={generatingNumber}
                />
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <ReviewStep
                  key="step-4"
                  formData={{
                    ...detailsData,
                    client_name: selectedClient?.name || undefined,
                  }}
                  matterType={selectedType}
                  matterTypeInfo={selectedTypeInfo}
                  jurisdictions={selectedJurisdictions}
                  previewNumber={previewNumber || undefined}
                />
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createMatter.isPending}
              variant="default"
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
        </div>
      </div>
    </div>
  );
}
