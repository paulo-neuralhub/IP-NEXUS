// ============================================================
// IP-NEXUS - Advance Phase Modal (SILK Redesign)
// Premium modal for phase transitions - NO confetti
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Check, Clock, ListChecks } from 'lucide-react';
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

// SILK colors per phase
const PHASE_COLORS: Record<string, { 
  bgLight: string; 
  border: string; 
  text: string;
  gradient: string;
}> = {
  F0: { bgLight: 'rgba(20, 184, 166, 0.08)', border: '#14b8a6', text: '#0d9488', gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
  F1: { bgLight: 'rgba(59, 130, 246, 0.08)', border: '#3b82f6', text: '#2563eb', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  F2: { bgLight: 'rgba(99, 102, 241, 0.08)', border: '#6366f1', text: '#4f46e5', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
  F3: { bgLight: 'rgba(168, 85, 247, 0.08)', border: '#a855f7', text: '#9333ea', gradient: 'linear-gradient(135deg, #a855f7, #9333ea)' },
  F4: { bgLight: 'rgba(139, 92, 246, 0.08)', border: '#8b5cf6', text: '#7c3aed', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  F5: { bgLight: 'rgba(217, 70, 239, 0.08)', border: '#d946ef', text: '#c026d3', gradient: 'linear-gradient(135deg, #d946ef, #c026d3)' },
  F6: { bgLight: 'rgba(244, 63, 94, 0.08)', border: '#f43f5e', text: '#e11d48', gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)' },
  F7: { bgLight: 'rgba(245, 158, 11, 0.08)', border: '#f59e0b', text: '#d97706', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  F8: { bgLight: 'rgba(16, 185, 129, 0.08)', border: '#10b981', text: '#059669', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  F9: { bgLight: 'rgba(20, 184, 166, 0.08)', border: '#14b8a6', text: '#0d9488', gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
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
          // Elegant toast notification instead of confetti
          toast.success(
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(16, 185, 129, 0.1)' }}
              >
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">Fase actualizada</p>
                <p className="text-sm text-slate-500">{currentPhase} → {nextPhase}</p>
              </div>
            </div>,
            {
              duration: 3000,
              style: {
                background: 'white',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
              },
            }
          );
          
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
      <DialogContent 
        className="sm:max-w-md p-0 rounded-2xl border-0 overflow-hidden"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        {/* SILK Header */}
        <div 
          className="p-6 border-b"
          style={{
            background: `linear-gradient(135deg, ${nextColors.bgLight} 0%, white 100%)`,
            borderColor: 'rgba(0, 0, 0, 0.06)',
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'rgba(0, 180, 216, 0.1)',
                  border: '1px solid rgba(0, 180, 216, 0.2)',
                }}
              >
                <ArrowRight className="h-5 w-5" style={{ color: '#00b4d8' }} />
              </div>
              <div>
                <DialogTitle style={{ color: '#0a2540', fontSize: '18px', fontWeight: 700 }}>
                  Confirmar Avance de Fase
                </DialogTitle>
                <DialogDescription className="font-mono" style={{ fontSize: '12px' }}>
                  {matterReference}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5 bg-white">
          {/* Phase transition visualization */}
          <div className="flex items-center justify-center gap-4">
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="px-5 py-3 rounded-xl text-center min-w-[110px]"
              style={{
                background: currentColors.bgLight,
                border: `2px solid ${currentColors.border}30`,
              }}
            >
              <span 
                className="font-mono text-lg font-bold block"
                style={{ color: currentColors.text }}
              >
                {currentPhase}
              </span>
              <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                {currentPhaseName}
              </p>
            </motion.div>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #00b4d8, #00d4aa)',
                boxShadow: '0 4px 12px rgba(0, 180, 216, 0.3)',
              }}
            >
              <ArrowRight className="h-5 w-5 text-white" />
            </motion.div>

            <motion.div
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="px-5 py-3 rounded-xl text-center min-w-[110px] relative overflow-hidden"
              style={{
                background: nextColors.bgLight,
                border: `2px solid ${nextColors.border}`,
                boxShadow: `0 4px 16px ${nextColors.border}30`,
              }}
            >
              <span 
                className="font-mono text-lg font-bold block relative z-10"
                style={{ color: nextColors.text }}
              >
                {nextPhase}
              </span>
              <p className="text-xs mt-0.5 relative z-10" style={{ color: '#64748b' }}>
                {nextPhaseName}
              </p>
            </motion.div>
          </div>

          {/* Note field */}
          <div className="space-y-2">
            <Label 
              htmlFor="advance-note" 
              className="text-sm font-medium"
              style={{ color: '#64748b' }}
            >
              Nota sobre el avance (opcional)
            </Label>
            <Textarea
              id="advance-note"
              placeholder="Añade una nota que quedará registrada en el historial..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="resize-none rounded-lg border-slate-200 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
            />
          </div>

          {/* Info box */}
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl space-y-2"
            style={{
              background: 'rgba(59, 130, 246, 0.04)',
              border: '1px solid rgba(59, 130, 246, 0.12)',
            }}
          >
            <p className="text-xs font-semibold" style={{ color: '#3b82f6' }}>
              Esta acción:
            </p>
            <ul className="text-xs space-y-1.5" style={{ color: '#2563eb' }}>
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

        {/* Footer */}
        <div 
          className="p-6 border-t flex justify-end gap-3"
          style={{ 
            borderColor: 'rgba(0, 0, 0, 0.06)',
            background: '#fafbfc',
          }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={advancePhase.isPending}
            className="rounded-xl border-slate-200 text-slate-600 px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={advancePhase.isPending}
            className="rounded-xl px-6 gap-2 text-white shadow-md"
            style={{
              background: 'linear-gradient(135deg, #00b4d8, #00d4aa)',
            }}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
