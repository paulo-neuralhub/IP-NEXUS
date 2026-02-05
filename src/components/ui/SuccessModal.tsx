// ============================================================
// IP-NEXUS - SUCCESS MODAL COMPONENT
// Professional celebration modal with handshake badge (SILK Design)
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
            <div 
              className="relative overflow-hidden"
              style={{
                background: '#f1f4f9',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
              }}
            >
              {/* Content */}
              <div className="p-8 text-center">
                {/* Handshake Badge - NeoBadge style */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: 'spring', 
                    delay: 0.1, 
                    duration: 0.6,
                    bounce: 0.4 
                  }}
                  className="flex justify-center mb-6"
                >
                  <div
                    className="relative inline-flex items-center justify-center overflow-hidden"
                    style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '20px',
                      background: '#f1f4f9',
                      boxShadow: '6px 6px 14px #cdd1dc, -6px -6px 14px #ffffff',
                    }}
                  >
                    {/* Bottom gradient */}
                    <div
                      className="absolute bottom-0 left-0 right-0 pointer-events-none"
                      style={{
                        height: '45%',
                        background: 'linear-gradient(to top, rgba(16, 185, 129, 0.08), transparent)',
                      }}
                    />
                    
                    {/* Bottom accent line */}
                    <div
                      className="absolute rounded-full"
                      style={{
                        bottom: '6px',
                        left: '18%',
                        right: '18%',
                        height: '3px',
                        background: '#10b981',
                        opacity: 0.35,
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
                      }}
                    />
                    
                    {/* Handshake emoji */}
                    <span style={{ fontSize: '42px', position: 'relative', zIndex: 10 }}>
                      🤝
                    </span>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#0a2540',
                    marginBottom: '8px',
                  }}
                >
                  {title}
                </motion.h2>

                {/* Reference Badge */}
                {reference && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: 'rgba(0, 180, 216, 0.08)',
                      border: '1px solid rgba(0, 180, 216, 0.15)',
                      marginBottom: '12px',
                    }}
                  >
                    <span 
                      style={{ 
                        fontSize: '13px', 
                        fontFamily: 'monospace', 
                        fontWeight: 600, 
                        color: '#00b4d8',
                      }}
                    >
                      {reference}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      está listo para gestionar
                    </span>
                  </motion.div>
                )}

                {/* Description */}
                {description && !reference && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{
                      fontSize: '13px',
                      color: '#64748b',
                      marginBottom: '20px',
                    }}
                  >
                    {description}
                  </motion.p>
                )}

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center mt-6"
                >
                  {secondaryAction && (
                    <Button
                      variant="outline"
                      onClick={secondaryAction.onClick}
                      className="order-2 sm:order-1"
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '10px',
                        color: '#64748b',
                      }}
                    >
                      <List className="h-4 w-4 mr-2" />
                      {secondaryAction.label}
                    </Button>
                  )}
                  {primaryAction && (
                    <Button
                      onClick={primaryAction.onClick}
                      className="order-1 sm:order-2 relative overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, #00b4d8, #00d4aa)',
                        border: 'none',
                        borderRadius: '10px',
                        boxShadow: '0 4px 14px rgba(0, 180, 216, 0.35)',
                        color: '#ffffff',
                        fontWeight: 600,
                      }}
                    >
                      {/* Bottom white line */}
                      <span
                        className="absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full opacity-40"
                        style={{ background: '#ffffff' }}
                      />
                      {primaryAction.label}
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
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
