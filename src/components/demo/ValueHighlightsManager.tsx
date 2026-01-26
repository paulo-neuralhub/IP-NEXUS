// ============================================================
// IP-NEXUS - VALUE HIGHLIGHTS MANAGER
// Gestiona la visualización de highlights durante demos
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ValueHighlightPopup } from "./ValueHighlightPopup";
import { getHighlightsForSection, type ValueHighlight } from "./valueHighlights";
import { useIsDemoMode } from "@/hooks/backoffice/useDemoMode";
import { useOrganization } from "@/contexts/organization-context";

export function ValueHighlightsManager() {
  const { currentOrganization } = useOrganization();
  const { isDemoMode, showHighlights } = useIsDemoMode(currentOrganization?.id);
  const location = useLocation();
  
  const [activeHighlight, setActiveHighlight] = useState<ValueHighlight | null>(null);
  const [dismissedHighlights, setDismissedHighlights] = useState<Set<string>>(() => {
    // Recuperar highlights descartados de sessionStorage
    const saved = sessionStorage.getItem("demo-dismissed-highlights");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [highlightQueue, setHighlightQueue] = useState<ValueHighlight[]>([]);

  // Guardar highlights descartados
  useEffect(() => {
    sessionStorage.setItem(
      "demo-dismissed-highlights",
      JSON.stringify([...dismissedHighlights])
    );
  }, [dismissedHighlights]);

  // Actualizar cola de highlights cuando cambia la ruta
  useEffect(() => {
    if (!isDemoMode || !showHighlights) return;

    const sectionHighlights = getHighlightsForSection(location.pathname)
      .filter(h => !dismissedHighlights.has(h.id));

    setHighlightQueue(sectionHighlights);
    setActiveHighlight(null);

    // Mostrar primer highlight después de un delay
    if (sectionHighlights.length > 0) {
      const timer = setTimeout(() => {
        setActiveHighlight(sectionHighlights[0]);
      }, 2000); // Delay para que cargue la página

      return () => clearTimeout(timer);
    }
  }, [location.pathname, isDemoMode, showHighlights, dismissedHighlights]);

  // Manejar descarte de highlight
  const handleDismiss = useCallback(() => {
    if (activeHighlight) {
      setDismissedHighlights(prev => new Set([...prev, activeHighlight.id]));
      
      // Mostrar siguiente highlight en la cola
      const currentIndex = highlightQueue.findIndex(h => h.id === activeHighlight.id);
      const nextHighlight = highlightQueue[currentIndex + 1];
      
      if (nextHighlight) {
        // Delay antes de mostrar el siguiente
        setTimeout(() => {
          setActiveHighlight(nextHighlight);
        }, 500);
      } else {
        setActiveHighlight(null);
      }
    }
  }, [activeHighlight, highlightQueue]);

  // No renderizar si no está activo
  if (!isDemoMode || !showHighlights) return null;

  return (
    <AnimatePresence mode="wait">
      {activeHighlight && (
        <ValueHighlightPopup
          key={activeHighlight.id}
          highlight={activeHighlight}
          onDismiss={handleDismiss}
        />
      )}
    </AnimatePresence>
  );
}
