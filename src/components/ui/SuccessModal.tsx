// ============================================================
// IP-NEXUS - SUCCESS MODAL COMPONENT
// Celebration modal with animated check and confetti
// ============================================================

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  reference?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function SuccessModal({
  isOpen,
  onClose,
  title = '¡Creado exitosamente!',
  description,
  reference,
  primaryAction,
  secondaryAction,
}: SuccessModalProps) {
  // Fire confetti when modal opens
  const fireConfetti = useCallback(() => {
    // Center burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'],
      disableForReducedMotion: true,
    });

    // Side bursts
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981'],
      });
    }, 150);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ['#f59e0b', '#ec4899', '#8b5cf6'],
      });
    }, 300);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fireConfetti();
    }
  }, [isOpen, fireConfetti]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
          >
            <div className="relative bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/50">
              {/* Top gradient decoration */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-emerald-500" />
              
              {/* Content */}
              <div className="p-8 text-center">
                {/* Animated Check Circle */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: 'spring', 
                    delay: 0.1, 
                    duration: 0.6,
                    bounce: 0.4 
                  }}
                  className="relative mx-auto mb-6"
                >
                  {/* Outer glow rings */}
                  <div className="absolute inset-0 w-24 h-24 mx-auto">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
                      className="absolute inset-0 rounded-full bg-emerald-500/30"
                    />
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.3, opacity: 0 }}
                      transition={{ duration: 1, delay: 0.2, repeat: Infinity, repeatDelay: 0.5 }}
                      className="absolute inset-0 rounded-full bg-emerald-500/20"
                    />
                  </div>
                  
                  {/* Check circle */}
                  <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                    {/* Inner highlight */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent" />
                    
                    {/* Check mark with draw animation */}
                    <motion.div
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <Check className="h-12 w-12 text-white" strokeWidth={3} />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-foreground mb-2"
                >
                  {title}
                </motion.h2>

                {/* Reference Badge */}
                {reference && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
                  >
                    <span className="text-sm font-mono font-medium text-primary">
                      {reference}
                    </span>
                  </motion.div>
                )}

                {/* Description */}
                {description && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-muted-foreground mb-6"
                  >
                    {description}
                  </motion.p>
                )}

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                  {secondaryAction && (
                    <Button
                      variant="outline"
                      onClick={secondaryAction.onClick}
                      className="order-2 sm:order-1"
                    >
                      <List className="h-4 w-4 mr-2" />
                      {secondaryAction.label}
                    </Button>
                  )}
                  {primaryAction && (
                    <Button
                      onClick={primaryAction.onClick}
                      className="order-1 sm:order-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-lg shadow-primary/30"
                    >
                      {primaryAction.label}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
