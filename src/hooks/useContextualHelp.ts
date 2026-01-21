// ============================================================
// IP-NEXUS HELP - CONTEXTUAL HELP HOOK (GUIDES + FIELD TOOLTIPS)
// Prompt P78: Contextual Help System
// ============================================================

import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { CONTEXTUAL_HELP, FIELD_TOOLTIPS, type ContextualGuide } from "@/lib/contextualHelp";

const ROUTE_ALIASES: Record<string, string> = {
  docket: "matters",
  matters: "matters",
  market: "market",
  genius: "ai-genius",
  "ai-genius": "ai-genius",
  dashboard: "dashboard",
};

function inferFeatureKey(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "dashboard";

  // Soporta /app/* y rutas públicas
  const candidate = parts[0] === "app" ? parts[1] ?? "dashboard" : parts[0];
  return ROUTE_ALIASES[candidate] ?? candidate;
}

export function useContextualHelp() {
  const location = useLocation();

  const featureKey = useMemo(() => inferFeatureKey(location.pathname), [location.pathname]);

  const currentGuide: ContextualGuide | undefined = useMemo(() => {
    return CONTEXTUAL_HELP[featureKey];
  }, [featureKey]);

  const getFieldTooltip = (fieldKey: string): string | undefined => FIELD_TOOLTIPS[fieldKey];

  const shouldShowGuide = (key: string): boolean => {
    return (
      localStorage.getItem(`guide_completed_${key}`) !== "true" &&
      localStorage.getItem(`guide_skipped_${key}`) !== "true"
    );
  };

  return {
    featureKey,
    currentGuide,
    getFieldTooltip,
    shouldShowGuide,
  };
}
