// ============================================================
// IP-NEXUS - DEMO TOUR NAVIGATOR (Draggable & Resizable)
// Navegador visual para el tour de demo comercial
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Draggable from 'react-draggable';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MessageCircle, 
  Target, 
  HelpCircle,
  Check,
  Minimize2,
  Maximize2,
  X,
  Lightbulb,
  Zap,
  Play,
  Pause,
  GripVertical,
  Expand,
  Shrink,
  Pen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TOUR_STEPS, 
  CLOSING_STEP, 
  TOUR_PHASES,
  getAllSteps,
  getStepById,
  getPhaseForStep,
  type TourStep,
  type ClosingStep,
} from './tourSteps';
import { cn } from '@/lib/utils';

type ViewMode = 'minimized' | 'compact' | 'expanded' | 'docked';

interface DemoTourNavigatorProps {
  isVisible?: boolean;
  onClose?: () => void;
  onToggleAnnotation?: () => void;
  isAnnotationActive?: boolean;
}

export function DemoTourNavigator({ 
  isVisible = true, 
  onClose,
  onToggleAnnotation,
  isAnnotationActive = false
}: DemoTourNavigatorProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const nodeRef = useRef<HTMLDivElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [completedActions, setCompletedActions] = useState<Record<number, Record<number, boolean>>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const allSteps = getAllSteps();
  const step = getStepById(currentStep);
  const currentPhase = getPhaseForStep(currentStep);
  
  // Timer for elapsed time
  useEffect(() => {
    if (!isPaused && isVisible && viewMode !== 'minimized') {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused, isVisible, viewMode]);

  // Auto-detect step based on current route
  useEffect(() => {
    const matchingStep = allSteps.find(s => 
      location.pathname.startsWith(s.route) || 
      s.route.startsWith(location.pathname)
    );
    if (matchingStep && matchingStep.id !== currentStep) {
      // Optional: auto-sync step with route
      // setCurrentStep(matchingStep.id);
    }
  }, [location.pathname]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToStep = (stepId: number) => {
    const targetStep = getStepById(stepId);
    if (targetStep) {
      setCurrentStep(stepId);
      navigate(targetStep.route);
    }
  };

  const toggleAction = (actionIndex: number) => {
    setCompletedActions(prev => ({
      ...prev,
      [currentStep]: {
        ...prev[currentStep],
        [actionIndex]: !prev[currentStep]?.[actionIndex],
      },
    }));
  };

  const getCompletedActionsCount = (stepId: number) => {
    const actions = completedActions[stepId] || {};
    return Object.values(actions).filter(Boolean).length;
  };

  const getTotalActionsForStep = (stepId: number) => {
    const s = getStepById(stepId);
    if (!s) return 0;
    return 'keyActions' in s ? s.keyActions?.length || 0 : 0;
  };

  const cycleViewMode = () => {
    const modes: ViewMode[] = ['minimized', 'compact', 'expanded', 'docked'];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setViewMode(modes[nextIndex]);
    // Reset position when docking
    if (modes[nextIndex] === 'docked') {
      setPosition({ x: 0, y: 0 });
    }
  };

  if (!isVisible) return null;

  const isClosingStep = step?.id === 13;

  // Minimized floating button
  if (viewMode === 'minimized') {
    return (
      <Draggable nodeRef={nodeRef} bounds="parent" handle=".drag-handle">
        <div 
          ref={nodeRef}
          className="fixed bottom-4 right-4 z-[200]"
        >
          <Button 
            onClick={() => setViewMode('compact')} 
            className="gap-2 bg-primary shadow-lg hover:bg-primary/90"
            size="lg"
          >
            <Play className="h-4 w-4" />
            Tour Demo ({currentStep}/13)
            <Badge variant="secondary" className="ml-1">
              {formatTime(elapsedTime)}
            </Badge>
          </Button>
        </div>
      </Draggable>
    );
  }

  // Docked at bottom (full width, fixed)
  if (viewMode === 'docked') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[200] border-t-2 border-primary/30 bg-background shadow-2xl">
        <TourHeader
          currentStep={currentStep}
          currentPhase={currentPhase}
          elapsedTime={elapsedTime}
          isPaused={isPaused}
          viewMode={viewMode}
          onTogglePause={() => setIsPaused(!isPaused)}
          onCycleView={cycleViewMode}
          onClose={onClose}
          goToStep={goToStep}
        />
        
        {step && (
          <div className="p-4">
            <TourContent
              step={step}
              currentStep={currentStep}
              currentPhase={currentPhase}
              isClosingStep={isClosingStep}
              completedActions={completedActions}
              toggleAction={toggleAction}
              getCompletedActionsCount={getCompletedActionsCount}
              getTotalActionsForStep={getTotalActionsForStep}
              goToStep={goToStep}
              allSteps={allSteps}
              expanded={true}
            />
          </div>
        )}
      </div>
    );
  }

  // Floating draggable panel (compact or expanded)
  return (
    <Draggable 
      nodeRef={nodeRef} 
      bounds="parent" 
      handle=".drag-handle"
      position={position}
      onStop={(_, data) => setPosition({ x: data.x, y: data.y })}
    >
      <div 
        ref={nodeRef}
        className={cn(
          "fixed z-[200] rounded-xl border-2 border-primary/30 bg-background shadow-2xl",
          viewMode === 'compact' 
            ? "bottom-4 right-4 w-[400px]" 
            : "bottom-4 right-4 w-[700px]"
        )}
        style={{ maxHeight: viewMode === 'expanded' ? '80vh' : '50vh' }}
      >
        {/* Drag handle header */}
        <div className="drag-handle flex cursor-move items-center justify-between rounded-t-xl border-b bg-muted/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">DEMO TOUR</span>
            <Badge 
              variant="outline" 
              className={cn("text-[10px]", currentPhase?.textColor)}
            >
              {currentPhase?.name}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Clock className="h-3 w-3" />
              {formatTime(elapsedTime)}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {currentStep}/13
            </Badge>
          </div>
        </div>

        {/* Control bar */}
        <div className="flex items-center justify-between border-b bg-muted/30 px-2 py-1">
          {/* Phase dots */}
          <div className="flex items-center gap-2">
            {TOUR_PHASES.map((phase) => (
              <div key={phase.id} className="flex items-center gap-0.5">
                {phase.steps.map((stepId) => (
                  <button
                    key={stepId}
                    onClick={() => goToStep(stepId)}
                    className={cn(
                      'h-2 w-2 rounded-full transition-all hover:scale-125',
                      stepId === currentStep ? `${phase.color} ring-2 ring-offset-1 ring-offset-background` :
                      stepId < currentStep ? phase.color :
                      'bg-muted-foreground/30'
                    )}
                    title={`Paso ${stepId}: ${getStepById(stepId)?.title}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* View controls */}
          <div className="flex items-center gap-1">
            {/* Annotation button */}
            {onToggleAnnotation && (
              <Button
                variant={isAnnotationActive ? 'default' : 'ghost'}
                size="icon"
                className="h-6 w-6"
                onClick={onToggleAnnotation}
                title={isAnnotationActive ? 'Cerrar anotación' : 'Dibujar en pantalla'}
              >
                <Pen className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'Reanudar' : 'Pausar'}
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setViewMode(viewMode === 'compact' ? 'expanded' : 'compact')}
              title={viewMode === 'compact' ? 'Expandir' : 'Compactar'}
            >
              {viewMode === 'compact' ? <Expand className="h-3 w-3" /> : <Shrink className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setViewMode('docked')}
              title="Anclar abajo"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setViewMode('minimized')}
              title="Minimizar"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {step && (
          <ScrollArea className={viewMode === 'expanded' ? 'h-[60vh]' : 'h-[300px]'}>
            <div className="p-3">
              <TourContent
                step={step}
                currentStep={currentStep}
                currentPhase={currentPhase}
                isClosingStep={isClosingStep}
                completedActions={completedActions}
                toggleAction={toggleAction}
                getCompletedActionsCount={getCompletedActionsCount}
                getTotalActionsForStep={getTotalActionsForStep}
                goToStep={goToStep}
                allSteps={allSteps}
                expanded={viewMode === 'expanded'}
              />
            </div>
          </ScrollArea>
        )}
      </div>
    </Draggable>
  );
}

// ============================================================
// Header Component (for docked mode)
// ============================================================
interface TourHeaderProps {
  currentStep: number;
  currentPhase: typeof TOUR_PHASES[0] | undefined;
  elapsedTime: number;
  isPaused: boolean;
  viewMode: ViewMode;
  onTogglePause: () => void;
  onCycleView: () => void;
  onClose?: () => void;
  goToStep: (id: number) => void;
}

function TourHeader({ 
  currentStep, 
  currentPhase, 
  elapsedTime, 
  isPaused, 
  onTogglePause, 
  onCycleView, 
  onClose,
  goToStep 
}: TourHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">DEMO TOUR</span>
        </div>
        
        <Badge 
          variant="outline" 
          className={cn("gap-1", currentPhase?.textColor)}
        >
          {currentPhase?.name}
        </Badge>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {formatTime(elapsedTime)}
        </div>
      </div>
      
      {/* Progress por fases */}
      <div className="hidden items-center gap-4 md:flex">
        {TOUR_PHASES.map((phase) => (
          <div key={phase.id} className="flex flex-col items-center gap-1">
            <span className={cn(
              "text-[10px] font-medium uppercase tracking-wide",
              phase.id === currentPhase?.id ? phase.textColor : "text-muted-foreground"
            )}>
              {phase.name}
            </span>
            <div className="flex items-center gap-1">
              {phase.steps.map((stepId) => (
                <button
                  key={stepId}
                  onClick={() => goToStep(stepId)}
                  className={cn(
                    'h-2.5 w-2.5 rounded-full transition-all hover:scale-125',
                    stepId === currentStep ? `${phase.color} ring-2 ring-offset-1 ring-offset-background` :
                    stepId < currentStep ? phase.color :
                    'bg-muted-foreground/30'
                  )}
                  title={`Paso ${stepId}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onTogglePause}
          className="gap-1"
        >
          {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          {isPaused ? 'Reanudar' : 'Pausar'}
        </Button>
        <Button variant="ghost" size="icon" onClick={onCycleView} title="Modo compacto">
          <Shrink className="h-4 w-4" />
        </Button>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Content Component
// ============================================================
interface TourContentProps {
  step: TourStep | ClosingStep;
  currentStep: number;
  currentPhase: typeof TOUR_PHASES[0] | undefined;
  isClosingStep: boolean;
  completedActions: Record<number, Record<number, boolean>>;
  toggleAction: (idx: number) => void;
  getCompletedActionsCount: (id: number) => number;
  getTotalActionsForStep: (id: number) => number;
  goToStep: (id: number) => void;
  allSteps: (TourStep | ClosingStep)[];
  expanded: boolean;
}

function TourContent({
  step,
  currentStep,
  currentPhase,
  isClosingStep,
  completedActions,
  toggleAction,
  getCompletedActionsCount,
  getTotalActionsForStep,
  goToStep,
  allSteps,
  expanded
}: TourContentProps) {
  return (
    <div className="space-y-3">
      {/* Título y navegación */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold",
            currentPhase?.color
          )}>
            {currentStep}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">{step.title}</h3>
            <p className="truncate text-xs text-muted-foreground">{step.subtitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => goToStep(currentStep + 1)}
            disabled={currentStep === 13}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1 text-[10px]">
          <Clock className="h-3 w-3" />
          {step.duration} min
        </Badge>
        {!isClosingStep && (
          <Badge variant="secondary" className="text-[10px]">
            {getCompletedActionsCount(currentStep)}/{getTotalActionsForStep(currentStep)} acciones
          </Badge>
        )}
      </div>

      {isClosingStep ? (
        <ClosingStepContent step={step as ClosingStep} compact={!expanded} />
      ) : (
        <div className={cn("grid gap-3", expanded ? "md:grid-cols-3" : "grid-cols-1")}>
          {/* Hook de apertura */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2">
            <div className="flex items-start gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-primary">
                  Frase de apertura
                </p>
                <p className="mt-0.5 text-xs italic text-foreground">
                  "{(step as TourStep).openingHook}"
                </p>
              </div>
            </div>
          </div>

          {expanded && (
            <>
              {/* Acciones */}
              <div className="rounded-lg border p-2">
                <p className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Check className="h-3 w-3" />
                  Acciones
                </p>
                <div className="space-y-1">
                  {(step as TourStep).keyActions?.slice(0, 4).map((action, idx) => (
                    <label
                      key={idx}
                      className="flex cursor-pointer items-start gap-1.5 text-xs"
                    >
                      <Checkbox
                        checked={completedActions[currentStep]?.[idx] || false}
                        onCheckedChange={() => toggleAction(idx)}
                        className="mt-0.5 h-3.5 w-3.5"
                      />
                      <span className={cn(
                        "line-clamp-1",
                        completedActions[currentStep]?.[idx] && "text-muted-foreground line-through"
                      )}>
                        {action}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ventaja */}
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2">
                <div className="flex items-start gap-2">
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-600">
                      Ventaja
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-foreground line-clamp-2">
                      {(step as TourStep).competitiveEdge}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Pregunta cierre (siempre visible) */}
          <div className={cn("rounded-lg border border-amber-500/20 bg-amber-500/5 p-2", expanded && "md:col-span-3")}>
            <div className="flex items-start gap-2">
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-amber-600">
                  Pregunta de cierre
                </p>
                <p className="mt-0.5 text-xs italic text-foreground">
                  "{step.closingQuestion}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jump to step */}
      {expanded && (
        <div className="flex items-center gap-2 border-t pt-2">
          <span className="text-xs text-muted-foreground">Ir a:</span>
          <Select
            value={String(currentStep)}
            onValueChange={(v) => goToStep(Number(v))}
          >
            <SelectTrigger className="h-7 w-[180px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allSteps.map((s) => (
                <SelectItem key={s.id} value={String(s.id)} className="text-xs">
                  {s.id}. {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Closing Step Content
// ============================================================
function ClosingStepContent({ step, compact }: { step: ClosingStep; compact: boolean }) {
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {step.keyPoints.slice(0, 2).map((point, idx) => (
            <div key={idx} className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-2 text-center">
              <div className="text-lg font-bold text-primary">{point.metric}</div>
              <div className="text-[10px] text-muted-foreground">{point.description}</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            💬 "{step.closingQuestion}"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {step.keyPoints.map((point, idx) => (
        <div key={idx} className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-3 text-center">
          <div className="text-xl font-bold text-primary">{point.metric}</div>
          <div className="mt-1 text-xs text-muted-foreground">{point.description}</div>
          {point.yearly && (
            <Badge variant="secondary" className="mt-1 text-[10px]">{point.yearly}</Badge>
          )}
        </div>
      ))}

      <div className="col-span-2 rounded-lg border p-3">
        <h4 className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
          <Zap className="h-4 w-4 text-emerald-500" />
          Ventajas únicas
        </h4>
        <ul className="space-y-1">
          {step.uniqueAdvantages.map((adv, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs">
              <Check className="h-3 w-3 text-emerald-500" />
              {adv}
            </li>
          ))}
        </ul>
      </div>

      <div className="col-span-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <h4 className="mb-1.5 text-sm font-medium text-foreground">Próximos pasos</h4>
        <ol className="space-y-1">
          {step.nextSteps.map((ns, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {idx + 1}
              </span>
              {ns}
            </li>
          ))}
        </ol>
        
        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            💬 "{step.closingQuestion}"
          </p>
        </div>
      </div>
    </div>
  );
}
