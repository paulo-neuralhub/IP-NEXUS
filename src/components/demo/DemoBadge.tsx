// ============================================================
// IP-NEXUS - DEMO BADGE
// Badge visual fijo que indica modo demo activo
// ============================================================

import { Target, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DemoBadgeProps {
  prospectCompany?: string | null;
  onClose?: () => void;
  className?: string;
}

export function DemoBadge({ prospectCompany, onClose, className }: DemoBadgeProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className={cn(
          "fixed top-4 right-4 z-[100]",
          "flex items-center justify-center",
          "h-10 w-10 rounded-full",
          "bg-amber-500 text-white shadow-lg",
          "hover:bg-amber-600 transition-colors",
          "animate-pulse",
          className
        )}
        title="Expandir indicador DEMO"
      >
        <Target className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-[100]",
        "flex items-center gap-2",
        "px-4 py-2 rounded-lg",
        "bg-gradient-to-r from-amber-500 to-orange-500",
        "text-white font-medium text-sm",
        "shadow-lg shadow-amber-500/20",
        "border border-amber-400/30",
        className
      )}
    >
      <Target className="h-4 w-4 animate-pulse" />
      <span>DEMO</span>
      {prospectCompany && (
        <>
          <span className="text-amber-200">—</span>
          <span className="text-amber-100 font-normal max-w-[150px] truncate">
            {prospectCompany}
          </span>
        </>
      )}
      <span className="text-amber-200/80 text-xs ml-1">Datos de ejemplo</span>
      
      <div className="flex items-center gap-1 ml-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMinimized(true)}
          className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
          title="Minimizar"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// Badge más compacto para usar en el header
export function DemoBadgeCompact({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        "px-2.5 py-1 rounded-md",
        "bg-amber-500/10 border border-amber-500/20",
        "text-amber-600 dark:text-amber-400",
        "text-xs font-medium",
        className
      )}
    >
      <Target className="h-3 w-3" />
      <span>DEMO</span>
    </div>
  );
}
