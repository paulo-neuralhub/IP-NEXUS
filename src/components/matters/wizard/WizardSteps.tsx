// ============================================================
// IP-NEXUS - WIZARD STEPS COMPONENT
// L127: Visual progress indicator for multi-step wizard
// ============================================================

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface WizardStep {
  number: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface WizardStepsProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function WizardSteps({ steps, currentStep, onStepClick }: WizardStepsProps) {
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="relative px-4 py-6">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-border" />
        
        {/* Progress line */}
        <motion.div
          className="absolute top-6 left-0 h-0.5 bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = onStepClick && step.number < currentStep;

          return (
            <div
              key={step.number}
              className={cn(
                "flex flex-col items-center relative z-10",
                isClickable && "cursor-pointer"
              )}
              onClick={() => isClickable && onStepClick?.(step.number)}
            >
              <motion.div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </motion.div>
              <span
                className={cn(
                  "mt-2 text-sm font-medium transition-colors",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
