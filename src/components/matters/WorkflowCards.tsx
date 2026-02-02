// ============================================================
// IP-NEXUS - Workflow Cards (L122 + PROMPT 17)
// Card-based workflow phases with advance functionality
// ============================================================

import { useState, useRef } from 'react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Check,
  Circle,
  ChevronRight,
  ChevronLeft,
  Clock,
  AlertCircle,
  Zap,
  History,
  ListTodo,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AdvancePhaseModal } from './AdvancePhaseModal';

// Configuración de fases
const PHASES_CONFIG = [
  { key: 'F0', label: 'Apertura', description: 'Recepción y registro del expediente' },
  { key: 'F1', label: 'Análisis', description: 'Estudio de viabilidad y búsqueda de anterioridades' },
  { key: 'F2', label: 'Presupuesto', description: 'Elaboración y envío de presupuesto al cliente' },
  { key: 'F3', label: 'Contratación', description: 'Aceptación y formalización del encargo' },
  { key: 'F4', label: 'Preparación', description: 'Preparación de documentación para presentación' },
  { key: 'F5', label: 'Presentación', description: 'Presentación ante la oficina correspondiente' },
  { key: 'F6', label: 'Examen', description: 'Examen de forma y fondo por la oficina' },
  { key: 'F7', label: 'Publicación', description: 'Publicación en boletín oficial' },
  { key: 'F8', label: 'Resolución', description: 'Resolución final de concesión o denegación' },
  { key: 'F9', label: 'Seguimiento', description: 'Mantenimiento y renovaciones' },
];

interface PhaseHistoryEntry {
  phase: string;
  enteredAt: string;
  completedAt?: string;
}

interface WorkflowCardsProps {
  currentPhase: string;
  phaseHistory?: PhaseHistoryEntry[];
  expedienteId: string;
  matterReference?: string;
  tasksPerPhase?: Record<string, number>;
  phaseEnteredAt?: string;
  typeColor?: string;
  onAdvancePhase?: () => void;
  onPhaseClick?: (phase: string) => void;
}

export function WorkflowCards({
  currentPhase,
  phaseHistory = [],
  expedienteId,
  matterReference = '',
  tasksPerPhase = {},
  phaseEnteredAt,
  typeColor = 'text-blue-600',
  onAdvancePhase,
  onPhaseClick
}: WorkflowCardsProps) {
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const currentIndex = PHASES_CONFIG.findIndex(f => f.key === currentPhase);
  const progressPercent = Math.round(((currentIndex + 1) / PHASES_CONFIG.length) * 100);
  
  // Calcular tiempo en fase actual
  const daysInCurrentPhase = phaseEnteredAt 
    ? differenceInDays(new Date(), new Date(phaseEnteredAt))
    : 0;

  // Obtener estado de cada fase
  const getPhaseStatus = (index: number): 'completed' | 'current' | 'pending' => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  // Obtener tiempo en una fase completada
  const getPhaseTime = (phaseKey: string): number | null => {
    const entry = phaseHistory.find(h => h.phase === phaseKey && h.completedAt);
    if (!entry) return null;
    return differenceInDays(new Date(entry.completedAt!), new Date(entry.enteredAt));
  };

  // Scroll horizontal
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Get background color class from text color
  const bgColorClass = typeColor.replace('text-', 'bg-');
  const bgLightClass = typeColor.replace('text-', 'bg-').replace('-600', '-100') + ' dark:' + typeColor.replace('text-', 'bg-').replace('-600', '-900/50');

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Progreso del Expediente</span>
          </div>
          <Badge variant="secondary" className="font-mono">
            {progressPercent}% completado
          </Badge>
        </div>

        {/* Cards de fases con scroll */}
        <div className="relative">
          {/* Botón scroll izquierda */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm border"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Área de scroll */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-10 py-2 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {PHASES_CONFIG.map((phase, index) => {
              const status = getPhaseStatus(index);
              const phaseTime = getPhaseTime(phase.key);
              const pendingTasks = tasksPerPhase[phase.key] || 0;
              const isLast = index === PHASES_CONFIG.length - 1;

              return (
                <div key={phase.key} className="flex items-center shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onPhaseClick?.(phase.key)}
                        className={cn(
                          "relative w-28 h-24 rounded-xl border-2 p-3 transition-all duration-200 flex flex-col",
                          "hover:shadow-md hover:scale-[1.02] cursor-pointer",
                          status === 'completed' && "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800",
                          status === 'current' && cn("border-2 shadow-lg", bgLightClass, typeColor.replace('text-', 'border-')),
                          status === 'pending' && "bg-muted/50 border-border hover:bg-muted"
                        )}
                      >
                        {/* Icono de estado */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "font-mono text-xs font-bold",
                            status === 'completed' && "text-green-700 dark:text-green-300",
                            status === 'current' && typeColor,
                            status === 'pending' && "text-muted-foreground"
                          )}>
                            {phase.key}
                          </span>
                          {status === 'completed' && (
                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          )}
                          {status === 'current' && (
                            <Circle className={cn("h-3 w-3 fill-current animate-pulse", typeColor)} />
                          )}
                        </div>

                        {/* Nombre de fase */}
                        <span className={cn(
                          "text-sm font-semibold truncate text-left",
                          status === 'completed' && "text-green-800 dark:text-green-200",
                          status === 'current' && "text-foreground",
                          status === 'pending' && "text-muted-foreground"
                        )}>
                          {phase.label}
                        </span>

                        {/* Info adicional */}
                        <div className="mt-auto">
                          {status === 'completed' && phaseTime !== null && (
                            <span className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {phaseTime} días
                            </span>
                          )}
                          {status === 'current' && (
                            <span className={cn("text-[10px] flex items-center gap-1 font-medium", typeColor)}>
                              <Clock className="h-2.5 w-2.5" />
                              {daysInCurrentPhase}d en curso
                            </span>
                          )}
                          {status === 'pending' && (
                            <span className="text-[10px] text-muted-foreground">Pendiente</span>
                          )}
                        </div>

                        {/* Badge de tareas pendientes */}
                        {pendingTasks > 0 && status === 'current' && (
                          <div className="absolute -top-2 -right-2">
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                              {pendingTasks}
                            </Badge>
                          </div>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="font-semibold">{phase.key}: {phase.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Conector entre fases */}
                  {!isLast && (
                    <div className="flex items-center px-1">
                      <ChevronRight className={cn(
                        "h-5 w-5",
                        status === 'completed' ? "text-green-500" : "text-muted-foreground/40"
                      )} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botón scroll derecha */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm border"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4 mb-4">
          <Progress 
            value={progressPercent} 
            className="h-2"
          />
        </div>

        {/* Card de fase actual con acciones */}
        <div className="bg-muted/50 rounded-lg p-4 border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0",
                bgLightClass,
                "border",
                typeColor.replace('text-', 'border-')
              )}>
                <Circle className={cn("h-4 w-4 fill-current", typeColor)} />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground">Fase actual:</span>
                  <span className="font-semibold">
                    {PHASES_CONFIG[currentIndex]?.label} ({currentPhase})
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Tiempo en fase: {daysInCurrentPhase} días
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Promedio despacho: 5 días
                  </span>
                  <span className="flex items-center gap-1">
                    <ListTodo className="h-3 w-3" />
                    Tareas pendientes: {tasksPerPhase[currentPhase] || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    Historial
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Historial de Fases</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {phaseHistory.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Sin historial de cambios de fase
                      </p>
                    ) : (
                      phaseHistory.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono">
                              {entry.phase}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium">
                                {PHASES_CONFIG.find(f => f.key === entry.phase)?.label}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(entry.enteredAt), "d MMM yyyy", { locale: es })}
                                {entry.completedAt && (
                                  <> → {format(new Date(entry.completedAt), "d MMM yyyy", { locale: es })}</>
                                )}
                              </p>
                            </div>
                          </div>
                          {entry.completedAt ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-blue-500 fill-blue-500 animate-pulse" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {currentIndex < PHASES_CONFIG.length - 1 && (
                <Button 
                  size="sm" 
                  onClick={() => setShowAdvanceModal(true)}
                  className={cn(
                    "gap-2",
                    "bg-gradient-to-r from-primary to-blue-600",
                    "hover:from-primary/90 hover:to-blue-600/90",
                    "shadow-md shadow-primary/20",
                    "transition-all duration-200",
                    "hover:shadow-lg hover:scale-[1.02]"
                  )}
                >
                  <ArrowRight className="h-4 w-4" />
                  Avanzar a {PHASES_CONFIG[currentIndex + 1]?.key}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Modal de avance de fase */}
      <AdvancePhaseModal
        isOpen={showAdvanceModal}
        onClose={() => setShowAdvanceModal(false)}
        matterId={expedienteId}
        matterReference={matterReference}
        currentPhase={currentPhase}
        onSuccess={(newPhase) => {
          // Trigger the phase panel for the new phase
          onPhaseClick?.(newPhase);
        }}
      />
    </Card>
  );
}
