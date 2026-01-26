// ============================================================
// IP-NEXUS - DEMO GUIDE BOX
// Caja flotante de guía explicativa para demostraciones
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import { 
  Lightbulb, 
  Minus, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight,
  GripVertical,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getGuideContent, GUIDE_SECTIONS, type GuideSection } from "./guideContent";
import { useIsDemoMode } from "@/hooks/backoffice/useDemoMode";
import { useOrganization } from "@/contexts/organization-context";

interface DemoGuideBoxProps {
  className?: string;
}

// Posición por defecto
const DEFAULT_POSITION = { x: 20, y: 120 };

export function DemoGuideBox({ className }: DemoGuideBoxProps) {
  const { currentOrganization } = useOrganization();
  const { isDemoMode, showGuide } = useIsDemoMode(currentOrganization?.id);
  const location = useLocation();
  const navigate = useNavigate();
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Estado
  const [minimized, setMinimized] = useState(() => {
    const saved = localStorage.getItem("demo-guide-minimized");
    return saved ? JSON.parse(saved) : false;
  });
  
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("demo-guide-position");
    return saved ? JSON.parse(saved) : DEFAULT_POSITION;
  });

  // Obtener contenido según ruta actual
  const content = getGuideContent(location.pathname);
  
  // Encontrar índice actual en la lista de secciones
  const currentIndex = GUIDE_SECTIONS.findIndex(section => 
    location.pathname.startsWith(section) || section === location.pathname
  );

  // Persistir estado
  useEffect(() => {
    localStorage.setItem("demo-guide-minimized", JSON.stringify(minimized));
  }, [minimized]);

  useEffect(() => {
    localStorage.setItem("demo-guide-position", JSON.stringify(position));
  }, [position]);

  // Navegación entre secciones
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      navigate(GUIDE_SECTIONS[currentIndex - 1]);
    }
  }, [currentIndex, navigate]);

  const goToNext = useCallback(() => {
    if (currentIndex < GUIDE_SECTIONS.length - 1) {
      navigate(GUIDE_SECTIONS[currentIndex + 1]);
    }
  }, [currentIndex, navigate]);

  // No mostrar si no es modo demo o guía desactivada
  if (!isDemoMode || !showGuide) return null;

  // Estado minimizado
  if (minimized) {
    return (
      <Draggable
        nodeRef={nodeRef}
        position={position}
        onStop={(_, d) => setPosition({ x: d.x, y: d.y })}
        bounds="parent"
        handle=".drag-handle"
      >
        <div
          ref={nodeRef}
          className={cn(
            "fixed z-[9999] cursor-move",
            className
          )}
        >
          <button
            type="button"
            onClick={() => setMinimized(false)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5",
              "bg-gradient-to-r from-primary to-primary/80",
              "text-primary-foreground rounded-full shadow-lg",
              "hover:shadow-xl transition-all duration-200",
              "border border-primary/20",
              "drag-handle"
            )}
          >
            <Lightbulb className="h-4 w-4" />
            <span className="font-medium text-sm">Guía</span>
            <Maximize2 className="h-3.5 w-3.5 ml-1 opacity-70" />
          </button>
        </div>
      </Draggable>
    );
  }

  // Estado expandido
  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStop={(_, d) => setPosition({ x: d.x, y: d.y })}
      bounds="parent"
      handle=".drag-handle"
    >
      <div
        ref={nodeRef}
        className={cn(
          "fixed z-[9999] w-[340px] max-h-[calc(100vh-160px)]",
          "bg-card border border-border rounded-xl shadow-2xl",
          "flex flex-col overflow-hidden",
          className
        )}
      >
        {/* Header - Draggable */}
        <div className="drag-handle flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground cursor-move">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 opacity-50" />
            <Lightbulb className="h-5 w-5" />
            <span className="font-semibold">Guía IP-NEXUS</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMinimized(true)}
            className="h-7 w-7 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenido - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Título de sección */}
          <div className="flex items-start gap-3">
            <div className="text-3xl">{content.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground leading-tight">
                {content.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {content.subtitle}
              </p>
            </div>
          </div>

          {/* Descripción */}
          <p className="text-sm text-foreground/80 leading-relaxed">
            {content.description}
          </p>

          {/* Características */}
          <div className="bg-success/10 border border-success/20 rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-semibold text-success uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Qué puedes hacer aquí
            </h4>
            <ul className="space-y-1.5">
              {content.features.map((feature, index) => (
                <li 
                  key={index}
                  className="text-sm text-foreground/80 flex items-start gap-2"
                >
                  <span className="text-success mt-0.5">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips para la demo */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-semibold text-warning uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Tips para la demo
            </h4>
            <ul className="space-y-1.5">
              {content.demoTips.map((tip, index) => (
                <li 
                  key={index}
                  className="text-sm text-foreground/80 flex items-start gap-2"
                >
                  <span className="text-warning mt-0.5">💡</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer - Navegación */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            disabled={currentIndex <= 0}
            className="text-xs"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          
          <span className="text-xs text-muted-foreground">
            {currentIndex >= 0 ? currentIndex + 1 : '—'} / {GUIDE_SECTIONS.length}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            disabled={currentIndex >= GUIDE_SECTIONS.length - 1}
            className="text-xs"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Draggable>
  );
}
