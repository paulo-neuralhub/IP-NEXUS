// ============================================================
// IP-NEXUS - PHASE PANEL CONTAINER (SILK Redesign)
// Premium modal for phase management with SILK design system
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, Check, X, 
  FolderOpen, Search, Calculator, FileSignature, Send, 
  Eye, Globe, Scale, Award, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePhaseData, PHASE_CHECKLISTS } from '@/hooks/use-phase-data';

// Phase panels
import { PhaseF1Panel } from './PhaseF1Panel';
import { PhaseF2Panel } from './PhaseF2Panel';
import { PhaseF3Panel } from './PhaseF3Panel';
import { PhaseF4Panel } from './PhaseF4Panel';
import { PhaseF5Panel } from './PhaseF5Panel';
import { PhaseF6Panel } from './PhaseF6Panel';
import { PhaseF7Panel } from './PhaseF7Panel';
import { PhaseF8Panel } from './PhaseF8Panel';
import { PhaseF9Panel } from './PhaseF9Panel';

// SILK Phase configuration with icons and colors
export const PHASE_CONFIG: Record<string, {
  code: string;
  name: string;
  icon: typeof FolderOpen;
  colorClass: string;
  gradientFrom: string;
  gradientTo: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  description: string;
}> = {
  F0: { 
    code: 'F0', name: 'Apertura', icon: FolderOpen, 
    colorClass: 'teal', gradientFrom: '#14b8a6', gradientTo: '#0d9488',
    bgLight: 'rgba(20, 184, 166, 0.08)', borderColor: '#14b8a6', textColor: '#0d9488',
    description: 'Crear expediente con datos básicos' 
  },
  F1: { 
    code: 'F1', name: 'Análisis', icon: Search, 
    colorClass: 'blue', gradientFrom: '#3b82f6', gradientTo: '#2563eb',
    bgLight: 'rgba(59, 130, 246, 0.08)', borderColor: '#3b82f6', textColor: '#2563eb',
    description: 'Analizar viabilidad y necesidades' 
  },
  F2: { 
    code: 'F2', name: 'Presupuesto', icon: Calculator, 
    colorClass: 'indigo', gradientFrom: '#6366f1', gradientTo: '#4f46e5',
    bgLight: 'rgba(99, 102, 241, 0.08)', borderColor: '#6366f1', textColor: '#4f46e5',
    description: 'Generar y enviar presupuesto' 
  },
  F3: { 
    code: 'F3', name: 'Contratación', icon: FileSignature, 
    colorClass: 'purple', gradientFrom: '#a855f7', gradientTo: '#9333ea',
    bgLight: 'rgba(168, 85, 247, 0.08)', borderColor: '#a855f7', textColor: '#9333ea',
    description: 'Formalizar aceptación del cliente' 
  },
  F4: { 
    code: 'F4', name: 'Preparación', icon: Send, 
    colorClass: 'violet', gradientFrom: '#8b5cf6', gradientTo: '#7c3aed',
    bgLight: 'rgba(139, 92, 246, 0.08)', borderColor: '#8b5cf6', textColor: '#7c3aed',
    description: 'Preparar documentación' 
  },
  F5: { 
    code: 'F5', name: 'Presentación', icon: Eye, 
    colorClass: 'fuchsia', gradientFrom: '#d946ef', gradientTo: '#c026d3',
    bgLight: 'rgba(217, 70, 239, 0.08)', borderColor: '#d946ef', textColor: '#c026d3',
    description: 'Presentar solicitud' 
  },
  F6: { 
    code: 'F6', name: 'Examen', icon: Globe, 
    colorClass: 'rose', gradientFrom: '#f43f5e', gradientTo: '#e11d48',
    bgLight: 'rgba(244, 63, 94, 0.08)', borderColor: '#f43f5e', textColor: '#e11d48',
    description: 'Seguimiento del examen' 
  },
  F7: { 
    code: 'F7', name: 'Resolución', icon: Scale, 
    colorClass: 'amber', gradientFrom: '#f59e0b', gradientTo: '#d97706',
    bgLight: 'rgba(245, 158, 11, 0.08)', borderColor: '#f59e0b', textColor: '#d97706',
    description: 'Gestionar publicación' 
  },
  F8: { 
    code: 'F8', name: 'Concesión', icon: Award, 
    colorClass: 'emerald', gradientFrom: '#10b981', gradientTo: '#059669',
    bgLight: 'rgba(16, 185, 129, 0.08)', borderColor: '#10b981', textColor: '#059669',
    description: 'Gestionar concesión' 
  },
  F9: { 
    code: 'F9', name: 'Mantenimiento', icon: Settings, 
    colorClass: 'teal', gradientFrom: '#14b8a6', gradientTo: '#0d9488',
    bgLight: 'rgba(20, 184, 166, 0.08)', borderColor: '#14b8a6', textColor: '#0d9488',
    description: 'Gestión continua' 
  },
};

interface PhasePanelContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  matterReference: string;
  matterTitle: string;
  currentPhase: string;
  clientId?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  onAdvancePhase?: () => void;
  onGoBack?: () => void;
}

export function PhasePanelContainer({
  open,
  onOpenChange,
  matterId,
  matterReference,
  matterTitle,
  currentPhase,
  clientId,
  clientName,
  clientEmail,
  clientPhone,
  onAdvancePhase,
  onGoBack,
}: PhasePanelContainerProps) {
  const [localData, setLocalData] = useState<Record<string, unknown>>({});
  const [localChecklist, setLocalChecklist] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);

  const { data: phaseData, isLoading } = usePhaseData(matterId, currentPhase);
  const config = PHASE_CONFIG[currentPhase] || PHASE_CONFIG.F0;
  const checklistItems = PHASE_CHECKLISTS[currentPhase] || {};
  const IconComponent = config.icon;

  // Initialize local state from server data
  useEffect(() => {
    if (phaseData) {
      setLocalData(phaseData.data || {});
      setLocalChecklist(phaseData.checklist as Record<string, boolean> || {});
    }
  }, [phaseData]);

  // Calculate checklist progress
  const checklistKeys = Object.keys(checklistItems);
  const completedChecks = checklistKeys.filter(k => localChecklist[k]).length;
  const checklistProgress = checklistKeys.length > 0 
    ? Math.round((completedChecks / checklistKeys.length) * 100)
    : 0;

  const handleDataChange = (key: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleChecklistChange = (key: string, checked: boolean) => {
    setLocalChecklist(prev => ({ ...prev, [key]: checked }));
    setIsDirty(true);
  };

  // Get phase index for navigation
  const phases = Object.keys(PHASE_CONFIG);
  const currentIndex = phases.indexOf(currentPhase);
  const canGoBack = currentIndex > 0;
  const canAdvance = currentIndex < phases.length - 1;

  // Render the appropriate phase panel
  const renderPhasePanel = () => {
    const commonProps = {
      matterId,
      matterReference,
      matterTitle,
      phaseData: localData,
      checklist: localChecklist,
      onDataChange: handleDataChange,
      onChecklistChange: handleChecklistChange,
    };

    const clientProps = {
      clientId: clientId || undefined,
      clientName: clientName || undefined,
      clientEmail: clientEmail || undefined,
      clientPhone: clientPhone || undefined,
    };

    switch (currentPhase) {
      case 'F1':
        return <PhaseF1Panel {...commonProps} matterReference={matterReference} matterTitle={matterTitle} />;
      case 'F2':
        return <PhaseF2Panel {...commonProps} {...clientProps} />;
      case 'F3':
        return <PhaseF3Panel {...commonProps} {...clientProps} />;
      case 'F4':
        return <PhaseF4Panel {...commonProps} />;
      case 'F5':
        return <PhaseF5Panel {...commonProps} />;
      case 'F6':
        return <PhaseF6Panel {...commonProps} />;
      case 'F7':
        return <PhaseF7Panel {...commonProps} />;
      case 'F8':
        return <PhaseF8Panel {...commonProps} />;
      case 'F9':
        return <PhaseF9Panel {...commonProps} />;
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <p>Panel de fase F0 (Apertura) no requiere configuración adicional.</p>
            <p className="text-sm mt-2">Los datos básicos se configuran en el formulario de creación.</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden p-0 rounded-2xl border-0 [&>button]:hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* SILK Header with gradient */}
        <div 
          className="p-6 border-b"
          style={{
            background: `linear-gradient(135deg, ${config.bgLight} 0%, white 100%)`,
            borderColor: 'rgba(0, 0, 0, 0.06)',
          }}
        >
          <DialogHeader className="space-y-0">
            <div className="flex items-start gap-4">
              {/* Phase icon in colored square */}
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ 
                  background: config.bgLight,
                  border: `1px solid ${config.borderColor}20`,
                }}
              >
                <IconComponent 
                  className="w-6 h-6" 
                  style={{ color: config.textColor }} 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <DialogTitle 
                  className="flex items-center gap-3 text-xl font-bold"
                  style={{ color: '#0a2540' }}
                >
                  FASE {config.code}: {config.name}
                  {phaseData?.is_complete && (
                    <span 
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        color: '#059669',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      <Check className="w-3 h-3" />
                      Completada
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="font-mono text-sm mt-1" style={{ color: '#64748b' }}>
                  {matterReference} - {matterTitle}
                </DialogDescription>
              </div>

              {/* Progress NeoBadge */}
              {checklistKeys.length > 0 && (
                <div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg shrink-0"
                  style={{
                    background: '#f1f4f9',
                    boxShadow: 'inset 1px 1px 3px #cdd1dc, inset -1px -1px 3px #ffffff',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: config.textColor }}>
                    {completedChecks}/{checklistKeys.length}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>tareas</span>
                </div>
              )}

              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100"
                style={{ color: '#94a3b8' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          {/* Progress bar under header */}
          {checklistKeys.length > 0 && (
            <div 
              className="mt-4 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(0, 0, 0, 0.06)' }}
            >
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${checklistProgress}%`,
                  background: `linear-gradient(90deg, ${config.gradientFrom}, ${config.gradientTo})`,
                }}
              />
            </div>
          )}
        </div>

        {/* Phase Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div 
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{ 
                  borderColor: config.bgLight,
                  borderTopColor: config.gradientFrom,
                }}
              />
            </div>
          ) : (
            renderPhasePanel()
          )}
        </div>

        {/* Footer Actions - SILK Style */}
        <div 
          className="flex items-center justify-between p-6 border-t"
          style={{ 
            borderColor: 'rgba(0, 0, 0, 0.06)',
            background: '#fafbfc',
          }}
        >
          <div className="flex items-center gap-2">
            {canGoBack && onGoBack && (
              <Button 
                variant="outline" 
                onClick={onGoBack}
                className="rounded-xl border-slate-200 text-slate-600"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Volver a {PHASE_CONFIG[phases[currentIndex - 1]]?.name}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-slate-200 text-slate-600 px-6"
            >
              Cerrar
            </Button>

            {isDirty && (
              <Button 
                variant="outline"
                className="rounded-xl border-slate-200"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            )}

            {canAdvance && onAdvancePhase && (
              <Button 
                onClick={onAdvancePhase}
                className="rounded-xl px-6 shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})`,
                  color: 'white',
                }}
              >
                Avanzar a {PHASE_CONFIG[phases[currentIndex + 1]]?.name}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
