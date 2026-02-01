// ============================================================
// IP-NEXUS - WIZARD STEPS COMPONENT (IMPACTO BRUTAL)
// L133: Premium stepper with glow pulse, shimmer progress line,
//       floating particles, and dark mode support
// ============================================================

import { Check, Sparkles } from 'lucide-react';
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
    <div className="relative px-4 py-10">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-8 left-12 right-12 h-1.5 bg-slate-200/60 dark:bg-slate-700/60 rounded-full backdrop-blur-sm" />
        
        {/* Animated progress line with shimmer */}
        <motion.div
          className="absolute top-8 left-12 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-primary rounded-full overflow-hidden shadow-sm shadow-primary/30"
          style={{ maxWidth: 'calc(100% - 6rem)' }}
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </motion.div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = onStepClick && step.number < currentStep;

          return (
            <div
              key={step.number}
              className={cn(
                "flex flex-col items-center relative z-10",
                isClickable && "cursor-pointer group"
              )}
              onClick={() => isClickable && onStepClick?.(step.number)}
            >
              {/* Floating particles for current step */}
              {isCurrent && (
                <>
                  <motion.div
                    className="absolute -top-2 -left-2 w-2 h-2 rounded-full bg-primary/60"
                    animate={{ 
                      y: [-5, 5, -5],
                      x: [-3, 3, -3],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute -top-1 -right-3 w-1.5 h-1.5 rounded-full bg-purple-400/60"
                    animate={{ 
                      y: [3, -5, 3],
                      x: [2, -2, 2],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  />
                  <motion.div
                    className="absolute top-12 right-0 w-1 h-1 rounded-full bg-emerald-400/60"
                    animate={{ 
                      y: [-3, 5, -3],
                      opacity: [0.5, 0.9, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  />
                </>
              )}

              {/* Step Circle - NIVEL DIOS */}
              <motion.div
                className={cn(
                  "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted
                    ? "bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/40"
                    : isCurrent
                    ? "bg-gradient-to-br from-primary to-blue-600 text-white ring-4 ring-primary/30 dark:ring-primary/50 shadow-xl shadow-primary/50"
                    : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-muted-foreground border-2 border-slate-200/60 dark:border-slate-600/60",
                  isClickable && "group-hover:ring-2 group-hover:ring-primary/40 group-hover:shadow-lg group-hover:scale-105"
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: isCurrent ? 1.1 : 1,
                  opacity: 1
                }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                whileHover={isClickable ? { scale: 1.08 } : undefined}
                whileTap={isClickable ? { scale: 0.95 } : undefined}
              >
                {/* Inner highlight for 3D effect */}
                {(isCompleted || isCurrent) && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                )}
                
                {/* Glow pulse for current step */}
                {isCurrent && (
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-primary/20"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.2, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, type: 'spring' }}
                  >
                    <Check className="h-7 w-7 relative z-10" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <Icon className={cn(
                    "h-6 w-6 relative z-10 transition-transform duration-300",
                    isCurrent && "animate-pulse-subtle"
                  )} />
                )}
              </motion.div>
              
              {/* Step Label */}
              <motion.span
                className={cn(
                  "mt-3 text-sm font-semibold transition-all text-center max-w-[90px]",
                  isCurrent 
                    ? "text-primary dark:text-primary" 
                    : isCompleted 
                    ? "text-foreground" 
                    : "text-muted-foreground"
                )}
                initial={{ opacity: 0.5, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {step.label}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
