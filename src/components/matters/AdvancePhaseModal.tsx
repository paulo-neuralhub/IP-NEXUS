// ============================================================
// IP-NEXUS - Advance Phase Modal (L122 + PROMPT 17)
// Premium modal for phase transitions with confirmation
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Check, Clock, ListChecks, Bell, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useMatterPhase } from '@/hooks/use-workflow-phases';
import { toast } from 'sonner';

// Fases del sistema
const PHASE_NAMES: Record<string, string> = {
  F0: 'Apertura',
  F1: 'Análisis',
  F2: 'Presupuesto',
  F3: 'Contratación',
  F4: 'Preparación',
  F5: 'Presentación',
  F6: 'Examen',
  F7: 'Publicación',
  F8: 'Resolución',
  F9: 'Seguimiento',
};

// Colores por fase
const PHASE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  F0: { bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-300', text: 'text-slate-700' },
  F1: { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300', text: 'text-blue-700' },
  F2: { bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-300', text: 'text-amber-700' },
  F3: { bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300', text: 'text-green-700' },
  F4: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', border: 'border-cyan-300', text: 'text-cyan-700' },
  F5: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', border: 'border-indigo-300', text: 'text-indigo-700' },
  F6: { bg: 'bg-violet-100 dark:bg-violet-900/30', border: 'border-violet-300', text: 'text-violet-700' },
  F7: { bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-300', text: 'text-purple-700' },
  F8: { bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-300', text: 'text-pink-700' },
  F9: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-300', text: 'text-emerald-700' },
};

function getNextPhase(currentPhase: string): string | null {
  const phaseNumber = parseInt(currentPhase.replace('F', ''));
  if (isNaN(phaseNumber) || phaseNumber >= 9) return null;
  return `F${phaseNumber + 1}`;
}

interface AdvancePhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  matterId: string;
  matterReference: string;
  currentPhase: string;
  onSuccess?: (newPhase: string) => void;
}

export function AdvancePhaseModal({
  isOpen,
  onClose,
  matterId,
  matterReference,
  currentPhase,
  onSuccess,
}: AdvancePhaseModalProps) {
  const [note, setNote] = useState('');
  const { advancePhase } = useMatterPhase(matterId);

  const nextPhase = getNextPhase(currentPhase);
  const currentPhaseName = PHASE_NAMES[currentPhase] || currentPhase;
  const nextPhaseName = nextPhase ? PHASE_NAMES[nextPhase] : null;
  const currentColors = PHASE_COLORS[currentPhase] || PHASE_COLORS.F0;
  const nextColors = nextPhase ? (PHASE_COLORS[nextPhase] || PHASE_COLORS.F0) : null;

  const handleConfirm = () => {
    if (!nextPhase) return;
    
    advancePhase.mutate(
      { 
        newPhase: nextPhase, 
        reason: 'user_advance',
        notes: note || undefined 
      },
      {
        onSuccess: () => {
          // Celebration confetti
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']
          });
          
          // Second burst
          setTimeout(() => {
            confetti({
              particleCount: 40,
              spread: 80,
              origin: { y: 0.7 },
              colors: ['#3b82f6', '#10b981']
            });
          }, 150);
          
          setNote('');
          onClose();
          
          // Open the new phase panel after a short delay
          if (onSuccess && nextPhase) {
            setTimeout(() => {
              onSuccess(nextPhase);
            }, 500);
          }
        },
        onError: (error) => {
          toast.error('Error al avanzar fase', {
            description: error.message
          });
        }
      }
    );
  };

  if (!nextPhase || !nextColors) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
            Confirmar Avance de Fase
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de avanzar el expediente <span className="font-mono font-medium text-foreground">{matterReference}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Visualización del cambio de fase */}
          <div className="flex items-center justify-center gap-4">
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "px-4 py-3 rounded-xl border-2 text-center min-w-[100px]",
                currentColors.bg,
                currentColors.border
              )}
            >
              <span className={cn("font-mono text-lg font-bold", currentColors.text)}>
                {currentPhase}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentPhaseName}
              </p>
            </motion.div>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex items-center justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={cn(
                "px-4 py-3 rounded-xl border-2 text-center min-w-[100px] relative overflow-hidden",
                nextColors.bg,
                nextColors.border,
                "ring-2 ring-primary/20"
              )}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              <span className={cn("font-mono text-lg font-bold relative z-10", nextColors.text)}>
                {nextPhase}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5 relative z-10">
                {nextPhaseName}
              </p>
            </motion.div>
          </div>

          {/* Nota opcional */}
          <div className="space-y-2">
            <Label htmlFor="advance-note" className="text-sm text-muted-foreground">
              Nota sobre el avance (opcional)
            </Label>
            <Textarea
              id="advance-note"
              placeholder="Añade una nota que quedará registrada en el historial..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Información */}
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2"
          >
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Esta acción:
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 shrink-0" />
                Actualizará el estado del expediente
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3 w-3 shrink-0" />
                Registrará la fecha de cambio de fase
              </li>
              <li className="flex items-center gap-2">
                <ListChecks className="h-3 w-3 shrink-0" />
                Quedará registrada en el historial
              </li>
            </ul>
          </motion.div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={advancePhase.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={advancePhase.isPending}
            className={cn(
              "gap-2",
              "bg-gradient-to-r from-primary to-blue-600",
              "hover:from-primary/90 hover:to-blue-600/90",
              "shadow-lg shadow-primary/20"
            )}
          >
            {advancePhase.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Avanzando...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                Confirmar Avance
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
