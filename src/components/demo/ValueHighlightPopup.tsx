// ============================================================
// IP-NEXUS - VALUE HIGHLIGHT POPUP
// Popup de ventaja competitiva durante demos
// ============================================================

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Shield, 
  Award, 
  X,
  Check,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ValueHighlight } from "./valueHighlights";

interface ValueHighlightPopupProps {
  highlight: ValueHighlight;
  onDismiss: () => void;
  position?: { x: number; y: number };
}

export function ValueHighlightPopup({ 
  highlight, 
  onDismiss,
  position 
}: ValueHighlightPopupProps) {
  const iconMap = {
    saving: DollarSign,
    efficiency: Clock,
    unique: Award,
    security: Shield,
  };
  const Icon = iconMap[highlight.type];
  
  const colorMap = {
    saving: {
      bg: "bg-success/10",
      border: "border-success/30",
      text: "text-success",
      header: "from-success to-success/80",
    },
    efficiency: {
      bg: "bg-primary/10",
      border: "border-primary/30",
      text: "text-primary",
      header: "from-primary to-primary/80",
    },
    unique: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/30",
      text: "text-violet-500",
      header: "from-violet-600 to-violet-500",
    },
    security: {
      bg: "bg-warning/10",
      border: "border-warning/30",
      text: "text-warning",
      header: "from-warning to-warning/80",
    },
  };

  const colors = colorMap[highlight.type];

  // Posición por defecto: centro-derecha de la pantalla
  const defaultPosition = {
    x: typeof window !== 'undefined' ? window.innerWidth - 380 : 800,
    y: 150,
  };

  const pos = position || defaultPosition;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed z-[9998] w-[320px]"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className={cn(
        "rounded-xl shadow-2xl overflow-hidden",
        "border-2",
        colors.border,
        "bg-card"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-4 py-2.5",
          "bg-gradient-to-r text-white",
          colors.header
        )}>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Ventaja Competitiva
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-4">
          {/* Métrica principal */}
          <div className="text-center py-2">
            <div className={cn(
              "text-4xl font-bold",
              colors.text
            )}>
              {highlight.metric}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {highlight.metricLabel}
            </div>
          </div>

          {/* Título */}
          <h3 className="text-base font-semibold text-foreground text-center">
            {highlight.title}
          </h3>

          {/* Comparativa */}
          <div className="space-y-2">
            {/* IP-NEXUS */}
            <div className={cn(
              "flex items-start gap-2 p-2.5 rounded-lg",
              "bg-success/10 border border-success/20"
            )}>
              <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-medium text-success">IP-NEXUS</div>
                <div className="text-sm text-foreground/80">
                  {highlight.comparison.ipnexus}
                </div>
              </div>
            </div>

            {/* Tradicional */}
            <div className={cn(
              "flex items-start gap-2 p-2.5 rounded-lg",
              "bg-destructive/10 border border-destructive/20"
            )}>
              <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-medium text-destructive">Método tradicional</div>
                <div className="text-sm text-foreground/80">
                  {highlight.comparison.traditional}
                </div>
              </div>
            </div>
          </div>

          {/* Ahorro */}
          {highlight.savings && (
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg",
              "bg-success/10 border border-success/20"
            )}>
              <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-xs font-medium text-success uppercase">
                  Ahorro estimado
                </div>
                <div className="text-lg font-bold text-success">
                  {highlight.savings}
                </div>
              </div>
            </div>
          )}

          {/* Fuente */}
          {highlight.source && (
            <div className="text-center">
              <span className="text-xs text-muted-foreground italic">
                Fuente: {highlight.source}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Flecha decorativa */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
        <div className={cn(
          "w-4 h-4 rotate-45",
          "bg-card border-r-2 border-b-2",
          colors.border
        )} />
      </div>
    </motion.div>
  );
}
