// ============================================================
// IP-NEXUS HELP - FEATURE GUIDE
// Prompt P78: Contextual Help System
// ============================================================

import { useMemo, useState } from "react";
import { CheckCircle, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface FeatureGuideStep {
  title: string;
  description: string;
  image?: string;
}

interface FeatureGuideProps {
  featureKey: string;
  title: string;
  steps: FeatureGuideStep[];
  onComplete?: () => void;
  className?: string;
}

export function FeatureGuide({
  featureKey,
  title,
  steps,
  onComplete,
  className,
}: FeatureGuideProps) {
  const completedKey = `guide_completed_${featureKey}`;
  const skippedKey = `guide_skipped_${featureKey}`;

  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(() => localStorage.getItem(completedKey) === "true");
  const [isVisible, setIsVisible] = useState(() => localStorage.getItem(skippedKey) !== "true");

  const step = useMemo(() => steps[currentStep], [steps, currentStep]);
  const isLastStep = currentStep === Math.max(0, steps.length - 1);

  if (!isVisible || isCompleted || steps.length === 0) return null;

  const handleComplete = () => {
    setIsCompleted(true);
    localStorage.setItem(completedKey, "true");
    onComplete?.();
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem(skippedKey, "true");
  };

  return (
    <Card className={cn("border bg-card shadow-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Paso {currentStep + 1} de {steps.length}
            </p>
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSkip}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {step?.image ? (
          <img
            src={step.image}
            alt={step.title}
            loading="lazy"
            className="h-40 w-full rounded-lg border object-cover"
          />
        ) : null}

        <div className="space-y-1">
          <h3 className="font-medium leading-tight">{step?.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{step?.description}</p>
        </div>

        <div className="flex items-center gap-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i <= currentStep ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((c) => Math.max(0, c - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

          {isLastStep ? (
            <Button onClick={handleComplete}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Completar
            </Button>
          ) : (
            <Button onClick={() => setCurrentStep((c) => Math.min(steps.length - 1, c + 1))}>
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
