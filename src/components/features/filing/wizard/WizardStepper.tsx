// ============================================================
// IP-NEXUS - WIZARD STEPPER PREMIUM
// Visual-only component for step progress indication
// ============================================================

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function WizardStepper({ steps, currentStep, onStepClick }: WizardStepperProps) {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="relative py-4">
      {/* Progress Line Container */}
      <div className="absolute top-[calc(50%-0.5rem)] left-0 right-0 h-1 mx-8">
        {/* Background line */}
        <div className="absolute inset-0 bg-muted rounded-full" />
        
        {/* Animated progress line */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex items-center justify-between">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isClickable = onStepClick && step.id < currentStep;

          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center gap-2 relative z-10",
                isClickable && "cursor-pointer"
              )}
              onClick={() => isClickable && onStepClick?.(step.id)}
            >
              {/* Step Circle */}
              <motion.div
                className={cn(
                  "relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isActive && "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-4 ring-primary/20",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  !isActive && !isCompleted && "border-muted-foreground/30 bg-background text-muted-foreground"
                )}
                initial={{ scale: 0.9 }}
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    <Check className="h-6 w-6" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </motion.div>

              {/* Step Label */}
              <div className="text-center">
                <span
                  className={cn(
                    "text-xs font-semibold hidden md:block transition-colors duration-300",
                    isActive && "text-primary",
                    isCompleted && "text-primary",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
                
                {/* Step number badge - visible on mobile */}
                <span
                  className={cn(
                    "text-[10px] font-medium md:hidden",
                    isActive && "text-primary",
                    isCompleted && "text-primary",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.id}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
