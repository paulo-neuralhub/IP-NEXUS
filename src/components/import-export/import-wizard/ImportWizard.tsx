import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileUploadStep } from './steps/FileUploadStep';
import { FieldMappingStep } from './steps/FieldMappingStep';
import { ValidationStep } from './steps/ValidationStep';
import { ImportStep } from './steps/ImportStep';
import { ResultsStep } from './steps/ResultsStep';
import type { FieldMapping } from '@/types/import-export';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  templateId?: string;
}

type WizardStep = 'upload' | 'mapping' | 'validation' | 'import' | 'results';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'upload', label: 'Subir archivo' },
  { id: 'mapping', label: 'Mapeo de campos' },
  { id: 'validation', label: 'Validación' },
  { id: 'import', label: 'Importar' },
  { id: 'results', label: 'Resultados' }
];

export function ImportWizard({ open, onOpenChange, entityType, templateId }: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<{
    headers: string[];
    rows: Record<string, unknown>[];
    totalRows: number;
  } | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: Array<{ row: number; field: string; message: string }>;
    warnings: Array<{ row: number; field: string; message: string }>;
  } | null>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    totalProcessed: number;
    totalSuccess: number;
    totalFailed: number;
    jobId: string;
  } | null>(null);

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const handleClose = () => {
    // Reset state
    setCurrentStep('upload');
    setFile(null);
    setParsedData(null);
    setMappings([]);
    setValidationResult(null);
    setImportResult(null);
    onOpenChange(false);
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 'upload':
        return file !== null && parsedData !== null;
      case 'mapping':
        return mappings.some(m => m.targetField);
      case 'validation':
        return validationResult?.isValid ?? false;
      case 'import':
        return importResult !== null;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Importar {entityType}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-4">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                    index === currentStepIndex 
                      ? 'bg-primary text-primary-foreground' 
                      : index < currentStepIndex 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 bg-muted" />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <Progress value={progress} className="mt-2" />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {currentStep === 'upload' && (
            <FileUploadStep
              entityType={entityType}
              file={file}
              onFileSelect={setFile}
              parsedData={parsedData}
              onDataParsed={setParsedData}
            />
          )}
          
          {currentStep === 'mapping' && parsedData && (
            <FieldMappingStep
              entityType={entityType}
              sourceHeaders={parsedData.headers}
              mappings={mappings}
              onMappingsChange={setMappings}
              templateId={templateId}
            />
          )}
          
          {currentStep === 'validation' && parsedData && (
            <ValidationStep
              data={parsedData.rows}
              mappings={mappings}
              entityType={entityType}
              validationResult={validationResult}
              onValidationComplete={setValidationResult}
            />
          )}
          
          {currentStep === 'import' && parsedData && (
            <ImportStep
              file={file!}
              data={parsedData.rows}
              mappings={mappings}
              entityType={entityType}
              onImportComplete={setImportResult}
            />
          )}
          
          {currentStep === 'results' && importResult && (
            <ResultsStep
              result={importResult}
              entityType={entityType}
              onClose={handleClose}
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          
          {currentStep !== 'results' ? (
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
            >
              {currentStep === 'import' ? 'Ver resultados' : 'Siguiente'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleClose}>
              Finalizar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
