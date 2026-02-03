// ============================================================
// IP-NEXUS - PHASE PANEL CONTAINER
// PROMPT 21: Contenedor principal para paneles de fase
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Save, Check, X } from 'lucide-react';
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

// Phase configuration
export const PHASE_CONFIG: Record<string, {
  code: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}> = {
  F0: { code: 'F0', name: 'Apertura', icon: '📝', color: 'bg-slate-500', description: 'Crear expediente con datos básicos' },
  F1: { code: 'F1', name: 'Análisis', icon: '📊', color: 'bg-blue-500', description: 'Analizar viabilidad y necesidades' },
  F2: { code: 'F2', name: 'Presupuesto', icon: '💰', color: 'bg-indigo-500', description: 'Generar y enviar presupuesto' },
  F3: { code: 'F3', name: 'Contratación', icon: '📝', color: 'bg-violet-500', description: 'Formalizar aceptación del cliente' },
  F4: { code: 'F4', name: 'Preparación', icon: '📁', color: 'bg-purple-500', description: 'Preparar documentación' },
  F5: { code: 'F5', name: 'Presentación', icon: '📤', color: 'bg-orange-500', description: 'Presentar solicitud' },
  F6: { code: 'F6', name: 'Examen', icon: '🔍', color: 'bg-amber-500', description: 'Seguimiento del examen' },
  F7: { code: 'F7', name: 'Publicación', icon: '📰', color: 'bg-emerald-500', description: 'Gestionar publicación' },
  F8: { code: 'F8', name: 'Concesión', icon: '🏆', color: 'bg-green-500', description: 'Gestionar concesión' },
  F9: { code: 'F9', name: 'Mantenimiento', icon: '🔧', color: 'bg-teal-500', description: 'Gestión continua' },
};

interface PhasePanelContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  matterReference: string;
  matterTitle: string;
  currentPhase: string;
  // Client data for communication features
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

    // Extended props for panels that need client info (F2, F3)
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
              config.color, 'text-white'
            )}>
              {config.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                FASE {config.code}: {config.name}
                {phaseData?.is_complete && (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="w-3 h-3 mr-1" />
                    Completada
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {matterReference} - {matterTitle}
              </DialogDescription>
            </div>
          </div>

          {/* Checklist Progress */}
          {checklistKeys.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso de fase</span>
                <span className="font-medium">{completedChecks}/{checklistKeys.length} tareas</span>
              </div>
              <Progress value={checklistProgress} className="h-2" />
            </div>
          )}
        </DialogHeader>

        {/* Phase Content */}
        <div className="mt-4 min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            renderPhasePanel()
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {canGoBack && onGoBack && (
              <Button variant="outline" onClick={onGoBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Volver a {PHASE_CONFIG[phases[currentIndex - 1]]?.name}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-1" />
              Cerrar
            </Button>

            {isDirty && (
              <Button variant="secondary">
                <Save className="w-4 h-4 mr-1" />
                Guardar
              </Button>
            )}

            {canAdvance && onAdvancePhase && (
              <Button onClick={onAdvancePhase}>
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
