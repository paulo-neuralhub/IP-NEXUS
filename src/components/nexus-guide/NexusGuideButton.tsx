// ============================================================
// IP-NEXUS - NEXUS GUIDE FLOATING BUTTON
// Prompt: Help System - Chatbot flotante de ayuda
// ============================================================

import { useState } from 'react';
import { MessageCircleQuestion, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { NexusGuideChat } from './NexusGuideChat';

interface NexusGuideButtonProps {
  className?: string;
}

export function NexusGuideButton({ className }: NexusGuideButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          'fixed bottom-24 right-6 z-50',
          className
        )}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className={cn(
            'h-14 w-14 rounded-full shadow-lg transition-all',
            'bg-gradient-to-br from-primary to-primary/80',
            'hover:shadow-xl hover:scale-105',
            isOpen && 'bg-muted hover:bg-muted'
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <MessageCircleQuestion className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        
        {/* Pulse animation when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping pointer-events-none" />
        )}
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <NexusGuideChat onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

export default NexusGuideButton;
