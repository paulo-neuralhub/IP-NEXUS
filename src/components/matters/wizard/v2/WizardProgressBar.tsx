// ============================================================
// IP-NEXUS - WIZARD PROGRESS BAR V2
// L132: 6-step progress indicator with responsive labels
// ============================================================

import { Check, Tag, Users, FileText, Calendar, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WIZARD_STEPS_CONFIG, type WizardStepConfig } from './types';

interface WizardProgressBarProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Tag,
  Users,
  FileText,
  Calendar,
  Coins,
  Check,
};

export function WizardProgressBar({
  currentStep,
  onStepClick,
  completedSteps = [],
}: WizardProgressBarProps) {
  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-between">
        {WIZARD_STEPS_CONFIG.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = completedSteps.includes(step.number) || currentStep > step.number;
          const isClickable = onStepClick && (isCompleted || step.number < currentStep);
          const Icon = ICONS[step.icon] || Tag;
          
          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step circle + label */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all",
                  isClickable && "cursor-pointer hover:opacity-80",
                  !isClickable && "cursor-default"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all border-2",
                    isActive && "bg-primary text-primary-foreground border-primary shadow-lg scale-110",
                    isCompleted && !isActive && "bg-primary/20 text-primary border-primary",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground border-muted-foreground/30"
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium text-center max-w-[80px]",
                    isActive && "text-primary",
                    isCompleted && !isActive && "text-muted-foreground",
                    !isActive && !isCompleted && "text-muted-foreground/70"
                  )}
                >
                  {step.label}
                </span>
              </button>
              
              {/* Connector line */}
              {index < WIZARD_STEPS_CONFIG.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={cn(
                      "h-0.5 transition-all",
                      currentStep > step.number ? "bg-primary" : "bg-muted"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Mobile view - simplified */}
      <div className="flex md:hidden items-center justify-between px-2">
        {WIZARD_STEPS_CONFIG.map((step) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <div key={step.number} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-primary/20 text-primary",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.shortLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
